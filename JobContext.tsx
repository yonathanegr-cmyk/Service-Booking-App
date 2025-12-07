import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Job, JobStatus, isActiveJob, isLiveTrackingStatus, ServiceData, UserLocation } from '../types/job';
import { JobService } from '../services/JobService';
import { MatchingService } from '../services/MatchingService';
import { supabase } from '../lib/supabase';

interface JobContextValue {
  currentJob: Job | null;
  isLoading: boolean;
  error: string | null;
  
  startJobSearch: (
    location: UserLocation,
    serviceData: ServiceData,
    scheduledFor?: string
  ) => Promise<Job | null>;
  
  acceptJob: (jobId: string, providerId: string, priceEstimate: number) => Promise<boolean>;
  
  updateJobStatus: (status: JobStatus, metadata?: Record<string, unknown>) => Promise<boolean>;
  
  cancelJob: (reason?: string) => Promise<boolean>;
  
  updateProviderLocation: (lat: number, lng: number) => Promise<void>;
  
  refreshCurrentJob: () => Promise<void>;
  
  clearCurrentJob: () => void;
  
  isLiveTracking: boolean;
  
  hasActiveJob: boolean;
}

const JobContext = createContext<JobContextValue | undefined>(undefined);

const STORAGE_KEY = 'beedy_active_job_id';
const USER_TYPE_KEY = 'beedy_user_type';

interface JobProviderProps {
  children: ReactNode;
  userId?: string;
  userType?: 'client' | 'provider' | 'admin';
}

export function JobProvider({ children, userId, userType = 'client' }: JobProviderProps) {
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadActiveJob = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const storedJobId = sessionStorage.getItem(STORAGE_KEY);
      
      if (storedJobId) {
        const job = await JobService.getJob(storedJobId);
        if (job && isActiveJob(job.status)) {
          setCurrentJob(job);
          setIsLoading(false);
          return;
        }
        sessionStorage.removeItem(STORAGE_KEY);
      }

      const job = userType === 'provider'
        ? await JobService.getProviderActiveJob(userId)
        : await JobService.getClientActiveJob(userId);

      if (job) {
        setCurrentJob(job);
        sessionStorage.setItem(STORAGE_KEY, job.id);
      }
    } catch (err) {
      console.error('Failed to load active job:', err);
      setError('Failed to load job status');
    } finally {
      setIsLoading(false);
    }
  }, [userId, userType]);

  useEffect(() => {
    loadActiveJob();
  }, [loadActiveJob]);

  useEffect(() => {
    if (!currentJob) return;

    const unsubscribe = JobService.subscribe(currentJob.id, (updatedJob) => {
      setCurrentJob(updatedJob);
      
      if (!isActiveJob(updatedJob.status)) {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    });

    return unsubscribe;
  }, [currentJob?.id]);

  useEffect(() => {
    if (!currentJob) return;

    const channel = supabase
      .channel(`job-${currentJob.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'jobs',
          filter: `id=eq.${currentJob.id}`
        },
        async () => {
          const updated = await JobService.getJob(currentJob.id);
          if (updated) {
            setCurrentJob(updated);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentJob?.id]);

  const startJobSearch = useCallback(async (
    location: UserLocation,
    serviceData: ServiceData,
    scheduledFor?: string
  ): Promise<Job | null> => {
    if (!userId) return null;

    try {
      setIsLoading(true);
      setError(null);

      const job = await JobService.createJob(userId, location, serviceData, scheduledFor);

      const matchedProviders = await MatchingService.findMatchingProviders({
        category: serviceData.category,
        location,
        maxDistance: 15,
        urgencyLevel: serviceData.urgencyLevel
      });

      if (matchedProviders.length > 0) {
        await MatchingService.notifyMatchingProviders(
          job.id,
          serviceData,
          location,
          matchedProviders.slice(0, 10)
        );
      }

      setCurrentJob(job);
      sessionStorage.setItem(STORAGE_KEY, job.id);
      
      return job;
    } catch (err) {
      console.error('Failed to start job search:', err);
      setError('Failed to create job request');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const acceptJob = useCallback(async (
    jobId: string,
    providerId: string,
    priceEstimate: number
  ): Promise<boolean> => {
    try {
      setError(null);

      const accepted = await MatchingService.acceptJobNotification(providerId, jobId);
      if (!accepted) {
        setError('Job may have been accepted by another provider');
        return false;
      }

      await JobService.assignProvider(jobId, providerId, priceEstimate);
      const job = await JobService.updateStatus(jobId, 'accepted', 'provider', providerId);
      
      setCurrentJob(job);
      sessionStorage.setItem(STORAGE_KEY, job.id);
      
      return true;
    } catch (err) {
      console.error('Failed to accept job:', err);
      setError('Failed to accept job');
      return false;
    }
  }, []);

  const updateJobStatus = useCallback(async (
    status: JobStatus,
    metadata?: Record<string, unknown>
  ): Promise<boolean> => {
    if (!currentJob || !userId) return false;

    try {
      setError(null);
      
      const actor = userType === 'provider' ? 'provider' : 'client';
      const updated = await JobService.updateStatus(currentJob.id, status, actor, userId, metadata);
      
      setCurrentJob(updated);
      
      if (!isActiveJob(status)) {
        sessionStorage.removeItem(STORAGE_KEY);
      }
      
      return true;
    } catch (err) {
      console.error('Failed to update job status:', err);
      setError('Failed to update job status');
      return false;
    }
  }, [currentJob, userId, userType]);

  const cancelJob = useCallback(async (reason?: string): Promise<boolean> => {
    if (!currentJob || !userId) return false;

    try {
      setError(null);
      
      const actor = userType === 'provider' ? 'provider' : 'client';
      await JobService.updateStatus(currentJob.id, 'cancelled', actor, userId, { reason });
      
      setCurrentJob(null);
      sessionStorage.removeItem(STORAGE_KEY);
      
      return true;
    } catch (err) {
      console.error('Failed to cancel job:', err);
      setError('Failed to cancel job');
      return false;
    }
  }, [currentJob, userId, userType]);

  const updateProviderLocation = useCallback(async (lat: number, lng: number): Promise<void> => {
    if (!currentJob) return;

    await JobService.updateProviderLocation(currentJob.id, {
      lat,
      lng,
      accuracy: 10,
      timestamp: new Date().toISOString()
    });
  }, [currentJob]);

  const refreshCurrentJob = useCallback(async (): Promise<void> => {
    await loadActiveJob();
  }, [loadActiveJob]);

  const clearCurrentJob = useCallback(() => {
    setCurrentJob(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const value: JobContextValue = {
    currentJob,
    isLoading,
    error,
    startJobSearch,
    acceptJob,
    updateJobStatus,
    cancelJob,
    updateProviderLocation,
    refreshCurrentJob,
    clearCurrentJob,
    isLiveTracking: currentJob ? isLiveTrackingStatus(currentJob.status) : false,
    hasActiveJob: currentJob ? isActiveJob(currentJob.status) : false
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
}

export function useJob(): JobContextValue {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJob must be used within a JobProvider');
  }
  return context;
}

export function useJobStatus(): {
  status: JobStatus | null;
  isSearching: boolean;
  isPendingAcceptance: boolean;
  isAccepted: boolean;
  isEnRoute: boolean;
  isArrived: boolean;
  isInProgress: boolean;
  isPaymentPending: boolean;
  isCompleted: boolean;
  isCancelled: boolean;
  isLiveTracking: boolean;
} {
  const { currentJob } = useJob();
  const status = currentJob?.status ?? null;

  return {
    status,
    isSearching: status === 'searching',
    isPendingAcceptance: status === 'pending_acceptance',
    isAccepted: status === 'accepted',
    isEnRoute: status === 'en_route',
    isArrived: status === 'arrived',
    isInProgress: status === 'in_progress',
    isPaymentPending: status === 'payment_pending',
    isCompleted: status === 'completed',
    isCancelled: status === 'cancelled',
    isLiveTracking: status ? isLiveTrackingStatus(status) : false
  };
}
