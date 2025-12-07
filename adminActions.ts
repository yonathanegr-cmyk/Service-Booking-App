export type AdminActionType = 
  | 'BAN_USER'
  | 'VERIFY_IDENTITY'
  | 'RESET_PASSWORD'
  | 'FULL_REFUND'
  | 'PARTIAL_REFUND'
  | 'VIEW_INVOICE'
  | 'CANCEL_MISSION'
  | 'REASSIGN_PRO'
  | 'CLOSE_TICKET'
  | 'ASSIGN_TICKET';

export type EntityType = 'user' | 'pro' | 'order' | 'booking' | 'ticket';

export interface AdminActionPayload {
  actionType: AdminActionType;
  entityId: string;
  entityType: EntityType;
  entityData?: Record<string, unknown>;
}

export type BanDuration = 'permanent' | '7_days' | '30_days';

export interface BanUserPayload {
  userId: string;
  reason: string;
  duration: BanDuration;
}

export interface RefundPayload {
  orderId: string;
  amount: number;
  isPartial: boolean;
  reason?: string;
}

export interface VerifyIdentityPayload {
  userId: string;
  approved: boolean;
  rejectionReason?: string;
}

export interface ReassignProPayload {
  orderId: string;
  newProId: string;
  reason?: string;
}

export interface CancelMissionPayload {
  orderId: string;
  applyFeesToPro: boolean;
  reason: string;
}

export interface AvailablePro {
  id: string;
  name: string;
  category: string;
  rating: number;
  distance: number;
  avatar?: string;
  completedJobs: number;
  isVerified: boolean;
}

export interface ResetPasswordPayload {
  userId: string;
  email: string;
}

export interface CloseTicketPayload {
  ticketId: string;
  resolution?: string;
}

export interface AssignTicketPayload {
  ticketId: string;
  assigneeId: string;
  assigneeName: string;
}
