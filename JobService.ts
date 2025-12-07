import { supabase } from '../lib/supabase';
import { 
  Job, 
  JobStatus, 
  JobLog, 
  JobLogAction, 
  UserLocation, 
  ServiceData,
  ProviderLocation,
  canTransitionTo,
  generateSecurityCode
} from '../types/job';

class JobServiceClass {
  private subscribers: Map<string, Set<(job: Job) => void>> = new Map();
  private jobCache: Map<string, Job> = new Map();

  async createJob(
    clientId: string,
    location: UserLocation,
    serviceData: ServiceData,
    scheduledFor?: string
  ): Promise<Job> {
    const securityCode = generateSecurityCode();
    const now = new Date().toISOString();
    
    const jobData = {
      id: crypto.randomUUID(),
      client_id: clientId,
      status: 'searching' as JobStatus,
      user_location: location,
      service_data: serviceData,
      security_code: securityCode,
      currency: 'ILS',
      created_at: now,
      updated_at: now,
      scheduled_for: scheduledFor || null,
      provider_breadcrumbs: []
    };

    const { data, error } = await supabase
      .from('jobs')
      .insert(jobData)
      .select()
      .single();

    if (error) {
      console.error('Error creating job:', error);
      throw new Error(`Failed to create job: ${error.message}`);
    }

    const job = this.mapDatabaseToJob(data);
    
    await this.logAction(job.id, 'job_created', 'client', clientId, undefined, undefined, {
      category: serviceData.category,
      location: location.address
    });

    this.jobCache.set(job.id, job);
    return job;
  }

  async getJob(jobId: string, bypassCache = false): Promise<Job | null> {
    if (!bypassCache && this.jobCache.has(jobId)) {
      return this.jobCache.get(jobId)!;
    }

    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        client:profiles!jobs_client_id_fkey(*),
        provider:providers!jobs_provider_id_fkey(*)
      `)
      .eq('id', jobId)
      .single();

    if (error || !data) {
      return null;
    }

    const job = this.mapDatabaseToJob(data);
    this.jobCache.set(jobId, job);
    return job;
  }

  invalidateCache(jobId: string): void {
    this.jobCache.delete(jobId);
  }

  invalidateAllCache(): void {
    this.jobCache.clear();
  }

  async getClientActiveJob(clientId: string): Promise<Job | null> {
    const activeStatuses: JobStatus[] = [
      'searching', 'pending_acceptance', 'accepted', 
      'en_route', 'arrived', 'in_progress', 'payment_pending'
    ];

    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        client:profiles!jobs_client_id_fkey(*),
        provider:providers!jobs_provider_id_fkey(*)
      `)
      .eq('client_id', clientId)
      .in('status', activeStatuses)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapDatabaseToJob(data);
  }

  async getProviderActiveJob(providerId: string): Promise<Job | null> {
    const activeStatuses: JobStatus[] = [
      'accepted', 'en_route', 'arrived', 'in_progress', 'payment_pending'
    ];

    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        client:profiles!jobs_client_id_fkey(*),
        provider:providers!jobs_provider_id_fkey(*)
      `)
      .eq('provider_id', providerId)
      .in('status', activeStatuses)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapDatabaseToJob(data);
  }

  async updateStatus(
    jobId: string,
    newStatus: JobStatus,
    actor: 'client' | 'provider' | 'admin' | 'system',
    actorId: string,
    metadata?: Record<string, unknown>
  ): Promise<Job> {
    const currentJob = await this.getJob(jobId);
    if (!currentJob) {
      throw new Error('Job not found');
    }

    if (!canTransitionTo(currentJob.status, newStatus)) {
      throw new Error(`Invalid status transition from ${currentJob.status} to ${newStatus}`);
    }

    const now = new Date().toISOString();
    const updates: Record<string, unknown> = {
      status: newStatus,
      updated_at: now
    };

    switch (newStatus) {
      case 'accepted':
        updates.accepted_at = now;
        break;
      case 'en_route':
        break;
      case 'arrived':
        updates.arrived_at = now;
        break;
      case 'in_progress':
        updates.started_at = now;
        break;
      case 'completed':
        updates.completed_at = now;
        break;
      case 'cancelled':
        updates.cancelled_at = now;
        updates.cancelled_by = actor;
        if (metadata?.reason) {
          updates.cancellation_reason = metadata.reason;
        }
        break;
    }

    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', jobId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update job status: ${error.message}`);
    }

    await this.logAction(
      jobId,
      'status_changed',
      actor,
      actorId,
      currentJob.status,
      newStatus,
      metadata
    );

    const updatedJob = this.mapDatabaseToJob(data);
    this.jobCache.set(jobId, updatedJob);
    this.notifySubscribers(jobId, updatedJob);

    return updatedJob;
  }

  async assignProvider(
    jobId: string,
    providerId: string,
    priceEstimate: number
  ): Promise<Job> {
    const { data, error } = await supabase
      .from('jobs')
      .update({
        provider_id: providerId,
        price_estimate: priceEstimate,
        status: 'pending_acceptance',
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to assign provider: ${error.message}`);
    }

    await this.logAction(jobId, 'provider_assigned', 'system', 'system', undefined, undefined, {
      providerId,
      priceEstimate
    });

    const job = this.mapDatabaseToJob(data);
    this.jobCache.set(jobId, job);
    this.notifySubscribers(jobId, job);
    return job;
  }

  async updateProviderLocation(
    jobId: string,
    location: ProviderLocation
  ): Promise<void> {
    const currentJob = await this.getJob(jobId, true);
    if (!currentJob) return;

    const breadcrumbs = [
      ...currentJob.providerBreadcrumbs,
      { lat: location.lat, lng: location.lng, timestamp: location.timestamp }
    ].slice(-100);

    const now = new Date().toISOString();

    const { error: jobError } = await supabase
      .from('jobs')
      .update({
        provider_breadcrumbs: breadcrumbs,
        updated_at: now
      })
      .eq('id', jobId);

    if (jobError) {
      console.error('Failed to update provider location in jobs:', jobError);
      return;
    }

    if (currentJob.providerId) {
      const { error: providerError } = await supabase
        .from('providers')
        .update({
          current_location: {
            lat: location.lat,
            lng: location.lng,
            accuracy: location.accuracy,
            timestamp: location.timestamp,
            heading: location.heading,
            speed: location.speed
          }
        })
        .eq('id', currentJob.providerId);

      if (providerError) {
        console.error('Failed to update provider current_location:', providerError);
      }
    }

    if (currentJob.provider) {
      currentJob.provider.currentLocation = location;
    }
    currentJob.providerBreadcrumbs = breadcrumbs;
    this.jobCache.set(jobId, currentJob);
    this.notifySubscribers(jobId, currentJob);
  }

  async updateFinalPrice(jobId: string, finalPrice: number): Promise<Job> {
    const { data, error } = await supabase
      .from('jobs')
      .update({
        final_price: finalPrice,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update price: ${error.message}`);
    }

    await this.logAction(jobId, 'price_updated', 'provider', '', undefined, undefined, {
      finalPrice
    });

    const job = this.mapDatabaseToJob(data);
    this.jobCache.set(jobId, job);
    this.notifySubscribers(jobId, job);
    return job;
  }

  async verifySecurityCode(jobId: string, code: string): Promise<boolean> {
    const job = await this.getJob(jobId);
    if (!job) return false;
    
    const isValid = job.securityCode === code;
    
    await this.logAction(jobId, 'security_code_verified', 'provider', '', undefined, undefined, {
      success: isValid
    });

    return isValid;
  }

  async getJobLogs(jobId: string): Promise<JobLog[]> {
    const { data, error } = await supabase
      .from('job_logs')
      .select('*')
      .eq('job_id', jobId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Failed to fetch job logs:', error);
      return [];
    }

    return data.map((log: Record<string, unknown>) => ({
      id: log.id as string,
      jobId: log.job_id as string,
      action: log.action as JobLogAction,
      actor: log.actor as 'client' | 'provider' | 'admin' | 'system',
      actorId: log.actor_id as string | undefined,
      actorName: log.actor_name as string | undefined,
      previousStatus: log.previous_status as JobStatus | undefined,
      newStatus: log.new_status as JobStatus | undefined,
      metadata: log.metadata as Record<string, unknown> | undefined,
      timestamp: log.timestamp as string,
      ipAddress: log.ip_address as string | undefined,
      userAgent: log.user_agent as string | undefined
    }));
  }

  async getAllActiveJobs(): Promise<Job[]> {
    const activeStatuses: JobStatus[] = [
      'searching', 'pending_acceptance', 'accepted',
      'en_route', 'arrived', 'in_progress', 'payment_pending'
    ];

    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        client:profiles!jobs_client_id_fkey(*),
        provider:providers!jobs_provider_id_fkey(*)
      `)
      .in('status', activeStatuses)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch active jobs:', error);
      return [];
    }

    return data.map((job: Record<string, unknown>) => this.mapDatabaseToJob(job));
  }

  subscribe(jobId: string, callback: (job: Job) => void): () => void {
    if (!this.subscribers.has(jobId)) {
      this.subscribers.set(jobId, new Set());
    }
    this.subscribers.get(jobId)!.add(callback);

    return () => {
      this.subscribers.get(jobId)?.delete(callback);
    };
  }

  private notifySubscribers(jobId: string, job: Job): void {
    this.subscribers.get(jobId)?.forEach(callback => callback(job));
  }

  private async logAction(
    jobId: string,
    action: JobLogAction,
    actor: 'client' | 'provider' | 'admin' | 'system',
    actorId?: string,
    previousStatus?: JobStatus,
    newStatus?: JobStatus,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const logEntry = {
      id: crypto.randomUUID(),
      job_id: jobId,
      action,
      actor,
      actor_id: actorId || null,
      previous_status: previousStatus || null,
      new_status: newStatus || null,
      metadata: metadata || null,
      timestamp: new Date().toISOString()
    };

    const { error } = await supabase
      .from('job_logs')
      .insert(logEntry);

    if (error) {
      console.error('Failed to log action:', error);
    }
  }

  private mapDatabaseToJob(data: any): Job {
    return {
      id: data.id,
      clientId: data.client_id,
      providerId: data.provider_id,
      status: data.status,
      userLocation: data.user_location,
      serviceData: data.service_data,
      securityCode: data.security_code,
      priceEstimate: data.price_estimate,
      finalPrice: data.final_price,
      currency: data.currency || 'ILS',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      scheduledFor: data.scheduled_for,
      acceptedAt: data.accepted_at,
      startedAt: data.started_at,
      arrivedAt: data.arrived_at,
      completedAt: data.completed_at,
      cancelledAt: data.cancelled_at,
      cancelledBy: data.cancelled_by,
      cancellationReason: data.cancellation_reason,
      providerBreadcrumbs: data.provider_breadcrumbs || [],
      estimatedArrival: data.estimated_arrival,
      distanceToClient: data.distance_to_client,
      client: data.client ? {
        id: data.client.id,
        name: data.client.full_name || 'לקוח',
        phone: data.client.phone || '',
        email: data.client.email,
        avatarUrl: data.client.avatar_url,
        rating: 4.5,
        totalBookings: 0
      } : undefined,
      provider: data.provider ? {
        id: data.provider.id,
        name: data.provider.name || 'בעל מקצוע',
        phone: data.provider.phone || '',
        email: data.provider.email,
        avatarUrl: data.provider.avatar_url,
        rating: data.provider.rating || 4.5,
        completedJobs: data.provider.completed_jobs || 0,
        category: data.provider.category || '',
        isVerified: data.provider.is_verified || false,
        vehicleInfo: data.provider.vehicle_info,
        currentLocation: data.provider.current_location ? {
          lat: data.provider.current_location.lat,
          lng: data.provider.current_location.lng,
          accuracy: data.provider.current_location.accuracy || 10,
          timestamp: data.provider.current_location.timestamp || new Date().toISOString(),
          heading: data.provider.current_location.heading,
          speed: data.provider.current_location.speed
        } : undefined
      } : undefined
    };
  }
}

export const JobService = new JobServiceClass();
