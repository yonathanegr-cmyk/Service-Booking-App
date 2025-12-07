// 1. ENUMS (Single Source of Truth for States)
export type OrderStatus = 
  | 'CREATED'       // Commande créée, en attente de match
  | 'MATCHED'       // Pro trouvé, en attente d'acceptation
  | 'ACCEPTED'      // Pro a accepté
  | 'ON_ROUTE'      // Pro en route (GPS tracking actif)
  | 'ON_SITE'       // Pro arrivé (Geofence validée)
  | 'IN_PROGRESS'   // Travail commencé (Photo 'Before' uploadée)
  | 'COMPLETED'     // Travail fini (Photo 'After' uploadée)
  | 'PAID'          // Paiement capturé via Stripe
  | 'CANCELLED'     // Annulé (par Client ou Admin)
  | 'DISPUTED';     // En litige

export type ServiceType = 'PLUMBING' | 'ELECTRICITY' | 'CLEANING' | 'LOCKSMITH';

// 2. SUB-ENTITIES (The "Satellites")

export interface GeoLocation {
  lat: number;
  lng: number;
  address: string;
  timestamp: string; // ISO string
}

export interface OrderParticipant {
  id: string;
  fullName: string;
  avatarUrl: string;
  phone: string;
  rating: number;
  role: 'CLIENT' | 'PRO' | 'ADMIN';
}

export interface OrderEvidence {
  id: string;
  url: string;
  type: 'IMAGE' | 'VIDEO';
  phase: 'BEFORE_WORK' | 'AFTER_WORK';
  uploadedAt: string;
  gpsStamp?: GeoLocation; // Preuve de lieu
}

export interface OrderMessage {
  id: string;
  senderId: string;
  content: string;
  sentAt: string;
  readAt?: string;
  attachments?: string[];
}

export interface OrderFinance {
  totalAmount: number; // En Agurot/Cents (Integer)
  platformFee: number;
  proPayout: number;
  currency: 'ILS';
  status: 'PENDING_AUTH' | 'CAPTURED' | 'REFUNDED';
  stripePaymentIntentId?: string;
  invoiceUrl?: string;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  triggeredBy: string; // User ID
  metadata?: Record<string, any>;
}

// 3. THE CORE AGGREGATE (The "Sun")
// C'est l'objet que l'API renvoie (Hydrated Object)
export interface OrderAggregate {
  id: string;
  shortId: string; // Ex: #BE-8821 (Pour le support)
  serviceType: ServiceType;
  description: string;
  
  // Parties
  client: OrderParticipant;
  pro?: OrderParticipant; // Peut être null au début
  
  // State
  currentStatus: OrderStatus;
  location: GeoLocation;
  scheduledFor: string; // ISO Date
  
  // Connected Data (Satellites)
  evidence: {
    before: OrderEvidence[];
    after: OrderEvidence[];
  };
  
  timeline: OrderTimelineEvent[];
  
  // Security / Meta
  createdAt: string;
  updatedAt: string;
  
  // Computed Fields (Backend Logic)
  canTransitionTo: OrderStatus[]; // Indique au frontend quels boutons afficher
}
