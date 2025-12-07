export interface OrderFullObject {
  id: string;
  status: OrderStatus;
  createdAt: string;
  timeline: TimelineEvent[];
  client: ClientInfo;
  pro: ProInfo | null;
  finance: FinanceBreakdown;
  evidence: EvidenceItem[];
  chatHistory: ChatMessage[];
  location: LocationData;
  metadata: OrderMetadata;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: 'order_created' | 'offer_sent' | 'pro_accepted' | 'pro_declined' | 'gps_arrival' | 'job_started' | 'photo_uploaded' | 'job_completed' | 'payment_processed' | 'payment_refunded' | 'dispute_opened' | 'admin_action' | 'chat_message' | 'system_event';
  title: string;
  description?: string;
  actor?: 'client' | 'pro' | 'system' | 'admin';
  metadata?: Record<string, unknown>;
}

export interface ClientInfo {
  id: string;
  name: string;
  phone: string;
  email: string;
  rating: number;
  totalBookings: number;
  memberSince: string;
  deviceInfo: {
    model: string;
    os: string;
    appVersion: string;
    batteryLevel?: number;
    lastActive: string;
  };
  address: {
    full: string;
    lat: number;
    lng: number;
    buildingCode?: string;
    floor?: string;
    apartment?: string;
    notes?: string;
  };
}

export interface ProInfo {
  id: string;
  name: string;
  phone: string;
  email: string;
  rating: number;
  completedJobs: number;
  memberSince: string;
  category: string;
  isVerified: boolean;
  deviceInfo: {
    model: string;
    os: string;
    appVersion: string;
    batteryLevel?: number;
    lastActive: string;
  };
  currentLocation?: {
    lat: number;
    lng: number;
    accuracy: number;
    timestamp: string;
  };
  breadcrumbs: { lat: number; lng: number; timestamp: string }[];
}

export interface FinanceBreakdown {
  totalPrice: number;
  currency: string;
  commissionRate: number;
  commissionAmount: number;
  netToPro: number;
  tip?: number;
  paymentStatus: 'pending' | 'authorized' | 'captured' | 'refunded' | 'partial_refund' | 'failed';
  stripePaymentId?: string;
  stripeRefundId?: string;
  refundAmount?: number;
  refundReason?: string;
  paidAt?: string;
  refundedAt?: string;
}

export interface EvidenceItem {
  id: string;
  type: 'photo' | 'video';
  stage: 'before' | 'during' | 'after';
  url: string;
  thumbnailUrl: string;
  uploadedAt: string;
  uploadedBy: 'client' | 'pro';
  exifData?: {
    capturedAt: string;
    deviceModel: string;
    gpsLat?: number;
    gpsLng?: number;
  };
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderRole: 'client' | 'pro' | 'admin';
  senderName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isDeleted: boolean;
  deletedAt?: string;
}

export interface LocationData {
  clientAddress: { lat: number; lng: number };
  proCurrentLocation?: { lat: number; lng: number };
  geofenceRadius: number;
  proBreadcrumbs: { lat: number; lng: number; timestamp: string }[];
  estimatedArrival?: string;
  distanceTraveled?: number;
}

export interface OrderMetadata {
  category: string;
  subcategory?: string;
  description: string;
  urgencyLevel: 'normal' | 'urgent' | 'emergency';
  estimatedDuration: number;
  actualDuration?: number;
  scheduledFor?: string;
  dispatchRadius: number;
  offersCount: number;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelledBy?: 'client' | 'pro' | 'admin';
  cancellationReason?: string;
}

export type OrderStatus = 'pending' | 'accepted' | 'en_route' | 'arrived' | 'in_progress' | 'completed' | 'cancelled' | 'dispute';
