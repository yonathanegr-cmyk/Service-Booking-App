export type JobStatus = 
  | 'searching'
  | 'pending_acceptance'
  | 'accepted'
  | 'en_route'
  | 'arrived'
  | 'in_progress'
  | 'payment_pending'
  | 'completed'
  | 'cancelled';

export type LocationType = 'current' | 'manual';

export interface UserLocation {
  lat: number;
  lng: number;
  address: string;
  type: LocationType;
  buildingCode?: string;
  floor?: string;
  apartment?: string;
  notes?: string;
}

export interface ServiceData {
  category: string;
  subcategory?: string;
  complexity?: 'standard' | 'complex' | 'critical';
  aiDescription: string;
  mediaUrls: string[];
  urgencyLevel: 'normal' | 'urgent' | 'emergency';
  estimatedDuration?: number;
}

export interface ProviderLocation {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: string;
  heading?: number;
  speed?: number;
}

export interface ProviderInfo {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  rating: number;
  completedJobs: number;
  category: string;
  isVerified: boolean;
  vehicleInfo?: {
    make: string;
    model: string;
    color: string;
    licensePlate: string;
  };
  currentLocation?: ProviderLocation;
}

export interface ClientInfo {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  rating: number;
  totalBookings: number;
}

export interface Job {
  id: string;
  clientId: string;
  providerId?: string;
  status: JobStatus;
  userLocation: UserLocation;
  serviceData: ServiceData;
  securityCode: string;
  priceEstimate?: number;
  finalPrice?: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  scheduledFor?: string;
  acceptedAt?: string;
  startedAt?: string;
  arrivedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelledBy?: 'client' | 'provider' | 'admin' | 'system';
  cancellationReason?: string;
  
  providerBreadcrumbs: { lat: number; lng: number; timestamp: string }[];
  estimatedArrival?: string;
  distanceToClient?: number;
  
  client?: ClientInfo;
  provider?: ProviderInfo;
}

export type JobLogAction = 
  | 'job_created'
  | 'status_changed'
  | 'provider_assigned'
  | 'provider_location_updated'
  | 'price_updated'
  | 'security_code_verified'
  | 'payment_initiated'
  | 'payment_completed'
  | 'payment_failed'
  | 'job_cancelled'
  | 'admin_action'
  | 'system_event';

export interface JobLog {
  id: string;
  jobId: string;
  action: JobLogAction;
  actor: 'client' | 'provider' | 'admin' | 'system';
  actorId?: string;
  actorName?: string;
  previousStatus?: JobStatus;
  newStatus?: JobStatus;
  metadata?: Record<string, unknown>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface JobOffer {
  id: string;
  jobId: string;
  providerId: string;
  price: number;
  estimatedArrival: number;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
  expiresAt: string;
  provider?: ProviderInfo;
}

export interface JobSearchParams {
  category: string;
  location: UserLocation;
  urgency?: 'normal' | 'urgent' | 'emergency';
  maxDistance?: number;
  scheduledFor?: string;
}

export interface MatchedProvider {
  provider: ProviderInfo;
  distance: number;
  estimatedArrival: number;
  matchScore: number;
  isAvailable: boolean;
}

export const JOB_STATUS_ORDER: JobStatus[] = [
  'searching',
  'pending_acceptance',
  'accepted',
  'en_route',
  'arrived',
  'in_progress',
  'payment_pending',
  'completed'
];

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  searching: 'מחפש בעל מקצוע',
  pending_acceptance: 'ממתין לאישור',
  accepted: 'אושר',
  en_route: 'בדרך אליך',
  arrived: 'הגיע',
  in_progress: 'עבודה בביצוע',
  payment_pending: 'ממתין לתשלום',
  completed: 'הושלם',
  cancelled: 'בוטל'
};

export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  searching: 'bg-blue-500',
  pending_acceptance: 'bg-yellow-500',
  accepted: 'bg-green-500',
  en_route: 'bg-purple-500',
  arrived: 'bg-indigo-500',
  in_progress: 'bg-orange-500',
  payment_pending: 'bg-amber-500',
  completed: 'bg-emerald-500',
  cancelled: 'bg-red-500'
};

export function isActiveJob(status: JobStatus): boolean {
  return ['searching', 'pending_acceptance', 'accepted', 'en_route', 'arrived', 'in_progress', 'payment_pending'].includes(status);
}

export function isLiveTrackingStatus(status: JobStatus): boolean {
  return ['en_route', 'arrived', 'in_progress'].includes(status);
}

export function canTransitionTo(from: JobStatus, to: JobStatus): boolean {
  const validTransitions: Record<JobStatus, JobStatus[]> = {
    searching: ['pending_acceptance', 'cancelled'],
    pending_acceptance: ['accepted', 'searching', 'cancelled'],
    accepted: ['en_route', 'cancelled'],
    en_route: ['arrived', 'cancelled'],
    arrived: ['in_progress', 'cancelled'],
    in_progress: ['payment_pending', 'cancelled'],
    payment_pending: ['completed', 'cancelled'],
    completed: [],
    cancelled: []
  };
  
  return validTransitions[from]?.includes(to) ?? false;
}

export function generateSecurityCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}
