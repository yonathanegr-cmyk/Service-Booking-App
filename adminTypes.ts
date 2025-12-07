export interface UserProfileFull {
  user: {
    id: string;
    email: string;
    full_name: string;
    phone: string | null;
    avatar_url: string | null;
    role: 'admin' | 'client' | 'provider';
    created_at: string;
    updated_at: string;
    is_verified: boolean;
    last_login_at: string | null;
    login_count: number;
  };

  stats: {
    total_bookings: number;
    completed_bookings: number;
    cancelled_bookings: number;
    total_spent: number;
    average_rating_given: number;
    average_rating_received: number;
    disputes_opened: number;
    disputes_won: number;
  };

  bookings: BookingSummary[];

  pros_worked_with: ProSummary[];

  transactions: TransactionSummary[];

  messages: MessageRecord[];

  support_tickets: SupportTicket[];

  activity_log: ActivityLogEntry[];
}

export interface BookingSummary {
  id: string;
  title: string;
  category: string;
  status: string;
  scheduled_for: string;
  created_at: string;
  completed_at: string | null;
  final_price: number | null;
  pro_id: string | null;
  pro_name: string | null;
  pro_avatar: string | null;
  client_rating: number | null;
  pro_rating: number | null;
  has_dispute: boolean;
}

export interface ProSummary {
  id: string;
  name: string;
  avatar_url: string | null;
  rating: number;
  is_verified: boolean;
  bookings_together: number;
  total_spent_with: number;
  first_booking_date: string;
  last_booking_date: string;
}

export interface TransactionSummary {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  type: 'payment' | 'refund' | 'tip' | 'penalty';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string | null;
  stripe_id: string | null;
  created_at: string;
}

export interface MessageRecord {
  id: string;
  booking_id: string;
  content: string;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  recipient_id: string;
  recipient_name: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  created_at: string;
  updated_at: string;
  assigned_to: string | null;
  messages_count: number;
}

export interface ActivityLogEntry {
  id: string;
  action: string;
  target_type: string;
  target_id: string;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface DisputeDetail {
  id: string;
  booking_id: string;
  reason: string;
  status: string;
  description: string;
  evidence_urls: string[];
  refund_amount: number;
  compensation_amount: number;
  created_at: string;
  resolved_at: string | null;
  resolution_notes: string | null;
  assigned_admin_name: string | null;
  booking_title: string;
  booking_category: string;
  other_party_name: string;
  other_party_email: string;
  message_thread: DisputeMessage[];
}

export interface DisputeMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  is_internal: boolean;
  created_at: string;
}

export type UserRole = 'admin' | 'client' | 'provider';
export type BookingStatus = 'pending' | 'accepted' | 'en_route' | 'in_progress' | 'completed' | 'cancelled';
export type DisputeStatus = 'open' | 'investigating' | 'resolved_client' | 'resolved_pro' | 'escalated' | 'closed';
