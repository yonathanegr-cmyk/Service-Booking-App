export type UserRole = 'user' | 'admin' | 'pro';
export type ProStatus = 'pending' | 'verified' | 'rejected';
export type OrderStatus = 'pending' | 'active' | 'completed' | 'cancelled' | 'refunded';
export type TicketStatus = 'open' | 'in_progress' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface Pro {
  id: number;
  user_id?: string; // Optional link to auth user
  name: string;
  email: string | null;
  phone: string | null;
  category_id?: number;
  rating: number;
  status: ProStatus;
  location: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  pro_id?: number;
  service_type: string;
  description: string | null;
  status: OrderStatus;
  price: number | null;
  scheduled_for: string | null;
  location_address: string | null;
  created_at: string;
  // Joins
  pro?: Pro;
  customer?: Profile;
}

export interface SupportTicket {
  id: number;
  user_id: string;
  subject: string;
  message: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  // Joins
  user?: Profile;
}
