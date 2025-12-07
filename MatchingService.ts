import { supabase } from '../lib/supabase';
import { UserLocation, MatchedProvider, ProviderInfo, ServiceData } from '../types/job';

interface ProviderSearchCriteria {
  category: string;
  location: UserLocation;
  maxDistance: number;
  urgencyLevel?: 'normal' | 'urgent' | 'emergency';
}

interface ProviderRaw {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar_url: string;
  rating: number;
  completed_jobs: number;
  category: string;
  is_verified: boolean;
  current_location: { lat: number; lng: number } | null;
  service_radius: number;
  vehicle_info: {
    make: string;
    model: string;
    color: string;
    licensePlate: string;
  } | null;
  is_available: boolean;
}

class MatchingServiceClass {
  private readonly EARTH_RADIUS_KM = 6371;

  async findMatchingProviders(criteria: ProviderSearchCriteria): Promise<MatchedProvider[]> {
    const { category, location, maxDistance } = criteria;

    const { data: providers, error } = await supabase
      .from('providers')
      .select('*')
      .eq('category', category)
      .eq('is_verified', true)
      .eq('is_available', true);

    if (error || !providers) {
      console.error('Failed to fetch providers:', error);
      return [];
    }

    const matchedProviders: MatchedProvider[] = [];

    for (const provider of providers as ProviderRaw[]) {
      if (!provider.current_location) continue;

      const distance = this.calculateDistance(
        location.lat,
        location.lng,
        provider.current_location.lat,
        provider.current_location.lng
      );

      if (distance <= maxDistance && distance <= (provider.service_radius || 10)) {
        const estimatedArrival = this.estimateArrivalTime(distance, criteria.urgencyLevel);
        const matchScore = this.calculateMatchScore(provider, distance, criteria);

        matchedProviders.push({
          provider: this.mapToProviderInfo(provider),
          distance: Math.round(distance * 10) / 10,
          estimatedArrival,
          matchScore,
          isAvailable: provider.is_available
        });
      }
    }

    return matchedProviders.sort((a, b) => b.matchScore - a.matchScore);
  }

  async notifyMatchingProviders(
    jobId: string,
    serviceData: ServiceData,
    location: UserLocation,
    matchedProviders: MatchedProvider[]
  ): Promise<void> {
    for (const match of matchedProviders) {
      await supabase.from('job_notifications').insert({
        id: crypto.randomUUID(),
        job_id: jobId,
        provider_id: match.provider.id,
        status: 'pending',
        distance: match.distance,
        estimated_arrival: match.estimatedArrival,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      });
    }
  }

  async getProviderPendingNotifications(providerId: string): Promise<{
    jobId: string;
    serviceData: ServiceData;
    location: UserLocation;
    distance: number;
    estimatedArrival: number;
    createdAt: string;
  }[]> {
    const { data, error } = await supabase
      .from('job_notifications')
      .select(`
        *,
        job:jobs(*)
      `)
      .eq('provider_id', providerId)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((notification: Record<string, unknown>) => ({
      jobId: (notification.job as Record<string, unknown>)?.id as string,
      serviceData: (notification.job as Record<string, unknown>)?.service_data as ServiceData,
      location: (notification.job as Record<string, unknown>)?.user_location as UserLocation,
      distance: notification.distance as number,
      estimatedArrival: notification.estimated_arrival as number,
      createdAt: notification.created_at as string
    }));
  }

  async acceptJobNotification(providerId: string, jobId: string): Promise<boolean> {
    const { error: notificationError } = await supabase
      .from('job_notifications')
      .update({ status: 'accepted' })
      .eq('job_id', jobId)
      .eq('provider_id', providerId);

    if (notificationError) {
      console.error('Failed to update notification:', notificationError);
      return false;
    }

    await supabase
      .from('job_notifications')
      .update({ status: 'expired' })
      .eq('job_id', jobId)
      .neq('provider_id', providerId);

    return true;
  }

  async declineJobNotification(providerId: string, jobId: string): Promise<void> {
    await supabase
      .from('job_notifications')
      .update({ status: 'declined' })
      .eq('job_id', jobId)
      .eq('provider_id', providerId);
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return this.EARTH_RADIUS_KM * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private estimateArrivalTime(distanceKm: number, urgency?: string): number {
    const avgSpeedKmH = urgency === 'emergency' ? 50 : urgency === 'urgent' ? 40 : 30;
    const travelTimeMinutes = (distanceKm / avgSpeedKmH) * 60;
    const prepTimeMinutes = urgency === 'emergency' ? 2 : urgency === 'urgent' ? 5 : 10;
    
    return Math.ceil(travelTimeMinutes + prepTimeMinutes);
  }

  private calculateMatchScore(
    provider: ProviderRaw,
    distance: number,
    criteria: ProviderSearchCriteria
  ): number {
    const WEIGHT_PROXIMITY = 0.30;
    const WEIGHT_RATING = 0.25;
    const WEIGHT_EXPERIENCE = 0.20;
    const WEIGHT_VERIFICATION = 0.15;
    const WEIGHT_URGENCY = 0.10;

    const maxDistance = criteria.maxDistance || 10;
    const proximityScore = Math.max(0, 100 * (1 - distance / maxDistance));

    const ratingScore = (provider.rating / 5) * 100;

    const experienceScore = Math.min(100, (provider.completed_jobs / 50) * 100);

    const verificationScore = provider.is_verified ? 100 : 0;

    let urgencyBonus = 0;
    if (criteria.urgencyLevel === 'emergency') {
      urgencyBonus = distance < 2 ? 100 : distance < 5 ? 50 : 0;
    } else if (criteria.urgencyLevel === 'urgent') {
      urgencyBonus = distance < 3 ? 75 : distance < 7 ? 25 : 0;
    }

    return Math.round(
      proximityScore * WEIGHT_PROXIMITY +
      ratingScore * WEIGHT_RATING +
      experienceScore * WEIGHT_EXPERIENCE +
      verificationScore * WEIGHT_VERIFICATION +
      urgencyBonus * WEIGHT_URGENCY
    );
  }

  private mapToProviderInfo(provider: ProviderRaw): ProviderInfo {
    return {
      id: provider.id,
      name: provider.name,
      phone: provider.phone,
      email: provider.email,
      avatarUrl: provider.avatar_url,
      rating: provider.rating,
      completedJobs: provider.completed_jobs,
      category: provider.category,
      isVerified: provider.is_verified,
      vehicleInfo: provider.vehicle_info || undefined,
      currentLocation: provider.current_location ? {
        lat: provider.current_location.lat,
        lng: provider.current_location.lng,
        accuracy: 10,
        timestamp: new Date().toISOString()
      } : undefined
    };
  }
}

export const MatchingService = new MatchingServiceClass();
