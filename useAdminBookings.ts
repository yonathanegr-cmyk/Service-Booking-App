import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Job } from '../types/job';
import {
  UserProfileFull,
  BookingSummary,
  SupportTicket,
  ProSummary,
  TransactionSummary,
  MessageRecord,
  ActivityLogEntry,
  BookingStatus,
} from '../types/adminTypes';
import {
  OrderFullObject,
  TimelineEvent,
  OrderStatus,
  ClientInfo,
  ProInfo,
  FinanceBreakdown,
  EvidenceItem,
  ChatMessage,
  LocationData,
  OrderMetadata,
} from '../types/orderDetails';

interface DbBooking {
  id: string;
  status: string;
  final_price: number | null;
  created_at: string;
  [key: string]: unknown;
}

interface DbProfile {
  id: string;
  created_at: string;
  [key: string]: unknown;
}

interface DbTicket {
  id: string;
  status: string;
  [key: string]: unknown;
}

interface DbTransaction {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  payment_method: string | null;
  stripe_id: string | null;
  created_at: string;
  [key: string]: unknown;
}

export interface AdminStats {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  monthlyRevenue: number;
  totalRevenue: number;
  newUsersThisMonth: number;
  openSupportTickets: number;
  averageResponseTime: string;
  revenueChange: string;
  ordersChange: string;
  usersChange: string;
  ticketsChange: string;
}

export interface AdminCategory {
  id: number;
  name: string;
  count: number;
  status: 'active' | 'inactive';
}

export interface AdminMessage {
  id: number;
  sender: string;
  preview: string;
  time: string;
  unread: boolean;
}

export interface AdminPro {
  id: number | string;
  name: string;
  category: string;
  phone: string;
  rating: number;
  status: 'verified' | 'pending' | 'new';
}

export interface AdminOrder {
  id: string;
  customer: string;
  customerId: string;
  service: string;
  category: string;
  status: BookingStatus | 'refunded';
  price: number;
  date: string;
  scheduledFor: string;
  pro: string;
  proId: string | null;
  proAvatar: string | null;
  hasDispute: boolean;
  clientRating: number | null;
  proRating: number | null;
}

const MOCK_BOOKINGS: BookingSummary[] = [
  {
    id: 'ORD-001',
    title: 'ניקיון דירה 4 חדרים',
    category: 'ניקיון',
    status: 'completed',
    scheduled_for: '2024-11-28T10:00:00Z',
    created_at: '2024-11-25T08:30:00Z',
    completed_at: '2024-11-28T14:00:00Z',
    final_price: 350,
    pro_id: 'pro-001',
    pro_name: 'יוסי הנקי',
    pro_avatar: null,
    client_rating: 5,
    pro_rating: 5,
    has_dispute: false,
  },
  {
    id: 'ORD-002',
    title: 'תיקון צנרת בחדר רחצה',
    category: 'אינסטלציה',
    status: 'pending',
    scheduled_for: '2024-11-29T14:00:00Z',
    created_at: '2024-11-27T11:00:00Z',
    completed_at: null,
    final_price: 450,
    pro_id: null,
    pro_name: null,
    pro_avatar: null,
    client_rating: null,
    pro_rating: null,
    has_dispute: false,
  },
  {
    id: 'ORD-003',
    title: 'התקנת מזגן חדש',
    category: 'חשמל',
    status: 'in_progress',
    scheduled_for: '2024-11-29T09:00:00Z',
    created_at: '2024-11-26T15:20:00Z',
    completed_at: null,
    final_price: 280,
    pro_id: 'pro-002',
    pro_name: 'חשמל ישיר',
    pro_avatar: null,
    client_rating: null,
    pro_rating: null,
    has_dispute: false,
  },
  {
    id: 'ORD-004',
    title: 'שיפוץ מטבח קטן',
    category: 'שיפוצים',
    status: 'cancelled',
    scheduled_for: '2024-11-27T08:00:00Z',
    created_at: '2024-11-20T09:45:00Z',
    completed_at: null,
    final_price: 1200,
    pro_id: 'pro-003',
    pro_name: 'שיפוצי הגליל',
    pro_avatar: null,
    client_rating: null,
    pro_rating: null,
    has_dispute: true,
  },
  {
    id: 'ORD-005',
    title: 'הובלת דירה 3 חדרים',
    category: 'הובלות',
    status: 'completed',
    scheduled_for: '2024-11-26T07:00:00Z',
    created_at: '2024-11-22T16:30:00Z',
    completed_at: '2024-11-26T15:00:00Z',
    final_price: 600,
    pro_id: 'pro-004',
    pro_name: 'מובילי העיר',
    pro_avatar: null,
    client_rating: 4,
    pro_rating: 5,
    has_dispute: false,
  },
  {
    id: 'ORD-006',
    title: 'תיקון דליפה דחוף',
    category: 'אינסטלציה',
    status: 'completed',
    scheduled_for: '2024-11-25T11:00:00Z',
    created_at: '2024-11-25T08:00:00Z',
    completed_at: '2024-11-25T13:30:00Z',
    final_price: 380,
    pro_id: 'pro-005',
    pro_name: 'צנרת מהירה',
    pro_avatar: null,
    client_rating: 5,
    pro_rating: 4,
    has_dispute: false,
  },
  {
    id: 'ORD-007',
    title: 'ניקיון משרדים',
    category: 'ניקיון',
    status: 'accepted',
    scheduled_for: '2024-11-30T06:00:00Z',
    created_at: '2024-11-28T10:15:00Z',
    completed_at: null,
    final_price: 520,
    pro_id: 'pro-001',
    pro_name: 'יוסי הנקי',
    pro_avatar: null,
    client_rating: null,
    pro_rating: null,
    has_dispute: false,
  },
  {
    id: 'ORD-008',
    title: 'תיקון חשמל בלוח',
    category: 'חשמל',
    status: 'pending',
    scheduled_for: '2024-12-01T10:00:00Z',
    created_at: '2024-11-29T14:00:00Z',
    completed_at: null,
    final_price: 320,
    pro_id: null,
    pro_name: null,
    pro_avatar: null,
    client_rating: null,
    pro_rating: null,
    has_dispute: false,
  },
  {
    id: 'ORD-009',
    title: 'צביעת סלון',
    category: 'שיפוצים',
    status: 'en_route',
    scheduled_for: '2024-11-29T08:00:00Z',
    created_at: '2024-11-27T09:30:00Z',
    completed_at: null,
    final_price: 850,
    pro_id: 'pro-006',
    pro_name: 'צבעי האומן',
    pro_avatar: null,
    client_rating: null,
    pro_rating: null,
    has_dispute: false,
  },
  {
    id: 'ORD-010',
    title: 'התקנת מנעול חכם',
    category: 'מנעולן',
    status: 'completed',
    scheduled_for: '2024-11-24T15:00:00Z',
    created_at: '2024-11-23T11:00:00Z',
    completed_at: '2024-11-24T16:30:00Z',
    final_price: 290,
    pro_id: 'pro-007',
    pro_name: 'מפתחות זהב',
    pro_avatar: null,
    client_rating: 5,
    pro_rating: 5,
    has_dispute: false,
  },
];

const MOCK_CUSTOMERS: Record<string, string> = {
  'ORD-001': 'דני כהן',
  'ORD-002': 'מיכל לוי',
  'ORD-003': 'אבי גבאי',
  'ORD-004': 'שרה אהרוני',
  'ORD-005': 'יוני ביטון',
  'ORD-006': 'רונית שפירא',
  'ORD-007': 'אלון דוד',
  'ORD-008': 'נועה ברק',
  'ORD-009': 'עמית רוזן',
  'ORD-010': 'תמר אברהם',
};

const MOCK_CUSTOMER_IDS: Record<string, string> = {
  'ORD-001': 'user-001',
  'ORD-002': 'user-002',
  'ORD-003': 'user-003',
  'ORD-004': 'user-004',
  'ORD-005': 'user-005',
  'ORD-006': 'user-006',
  'ORD-007': 'user-007',
  'ORD-008': 'user-008',
  'ORD-009': 'user-009',
  'ORD-010': 'user-010',
};

const MOCK_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'T-101',
    subject: 'בקשת החזר כספי על שירות לא מספק',
    status: 'open',
    priority: 'high',
    category: 'תשלומים',
    created_at: '2024-11-29T09:00:00Z',
    updated_at: '2024-11-29T09:00:00Z',
    assigned_to: null,
    messages_count: 3,
  },
  {
    id: 'T-102',
    subject: 'איש המקצוע לא הגיע למועד',
    status: 'in_progress',
    priority: 'high',
    category: 'שירות',
    created_at: '2024-11-28T14:30:00Z',
    updated_at: '2024-11-29T08:00:00Z',
    assigned_to: 'admin-001',
    messages_count: 5,
  },
  {
    id: 'T-103',
    subject: 'שאלה לגבי חיוב כפול',
    status: 'open',
    priority: 'medium',
    category: 'תשלומים',
    created_at: '2024-11-29T07:15:00Z',
    updated_at: '2024-11-29T07:15:00Z',
    assigned_to: null,
    messages_count: 1,
  },
  {
    id: 'T-104',
    subject: 'בעיה בהתחברות לאפליקציה',
    status: 'resolved',
    priority: 'low',
    category: 'טכני',
    created_at: '2024-11-27T16:45:00Z',
    updated_at: '2024-11-28T10:00:00Z',
    assigned_to: 'admin-002',
    messages_count: 4,
  },
  {
    id: 'T-105',
    subject: 'תלונה על התנהגות איש מקצוע',
    status: 'waiting_user',
    priority: 'urgent',
    category: 'שירות',
    created_at: '2024-11-29T06:00:00Z',
    updated_at: '2024-11-29T10:30:00Z',
    assigned_to: 'admin-001',
    messages_count: 7,
  },
];

const MOCK_TICKET_USERS: Record<string, string> = {
  'T-101': 'דני כהן',
  'T-102': 'מיכל לוי',
  'T-103': 'רוני ספקטור',
  'T-104': 'יעל גולדברג',
  'T-105': 'אורי מזרחי',
};

const MOCK_STATS: AdminStats = {
  totalOrders: 1247,
  activeOrders: 124,
  completedOrders: 1089,
  cancelledOrders: 34,
  pendingOrders: 58,
  monthlyRevenue: 45231,
  totalRevenue: 523450,
  newUsersThisMonth: 342,
  openSupportTickets: 12,
  averageResponseTime: '1.5 שעות',
  revenueChange: '+12%',
  ordersChange: '+5%',
  usersChange: '+18%',
  ticketsChange: '-2%',
};

const MOCK_CATEGORIES: AdminCategory[] = [
  { id: 1, name: 'ניקיון', count: 145, status: 'active' },
  { id: 2, name: 'אינסטלציה', count: 89, status: 'active' },
  { id: 3, name: 'חשמל', count: 64, status: 'active' },
  { id: 4, name: 'שיפוצים', count: 32, status: 'active' },
  { id: 5, name: 'הובלות', count: 47, status: 'active' },
  { id: 6, name: 'מנעולן', count: 28, status: 'active' },
  { id: 7, name: 'גינון', count: 35, status: 'active' },
  { id: 8, name: 'מיזוג אוויר', count: 52, status: 'active' },
];

const MOCK_MESSAGES: AdminMessage[] = [
  { id: 1, sender: 'משה אינסטלטור', preview: 'היי, מתי אפשר להגיע ללקוח?', time: '10:30', unread: true },
  { id: 2, sender: 'שרה לקוחה', preview: 'תודה רבה על השירות המהיר!', time: '09:15', unread: false },
  { id: 3, sender: 'מערכת', preview: 'עדכון גרסה: תכונות חדשות נוספו', time: 'אתמול', unread: false },
  { id: 4, sender: 'דני חשמלאי', preview: 'סיימתי את העבודה, הלקוח מרוצה', time: 'אתמול', unread: false },
  { id: 5, sender: 'יוסי הנקי', preview: 'אני זמין לעבודות נוספות השבוע', time: 'לפני יומיים', unread: false },
];

const MOCK_PROS: AdminPro[] = [
  { id: 1, name: 'יוסי הנקי', category: 'ניקיון', phone: '050-1234567', rating: 4.8, status: 'verified' },
  { id: 2, name: 'חשמל ישיר', category: 'חשמל', phone: '052-7654321', rating: 4.9, status: 'verified' },
  { id: 3, name: 'שיפוצי הגליל', category: 'שיפוצים', phone: '054-9876543', rating: 4.6, status: 'verified' },
  { id: 4, name: 'מובילי העיר', category: 'הובלות', phone: '053-1122334', rating: 4.7, status: 'verified' },
  { id: 5, name: 'צנרת מהירה', category: 'אינסטלציה', phone: '050-5566778', rating: 4.9, status: 'verified' },
  { id: 6, name: 'צבעי האומן', category: 'שיפוצים', phone: '052-9988776', rating: 4.5, status: 'verified' },
  { id: 7, name: 'מפתחות זהב', category: 'מנעולן', phone: '054-3344556', rating: 4.8, status: 'verified' },
  { id: 8, name: 'גינון ונוף', category: 'גינון', phone: '053-6677889', rating: 4.4, status: 'pending' },
  { id: 9, name: 'מזגנים פלוס', category: 'מיזוג אוויר', phone: '050-1122334', rating: 4.7, status: 'verified' },
  { id: 10, name: 'עמיר שיפוצים', category: 'שיפוצים', phone: '052-4455667', rating: 0, status: 'new' },
];

const MOCK_USER_PROFILES: Record<string, UserProfileFull> = {
  'user-001': {
    user: {
      id: 'user-001',
      email: 'dani.cohen@email.com',
      full_name: 'דני כהן',
      phone: '050-1234567',
      avatar_url: null,
      role: 'client',
      created_at: '2023-06-15T10:00:00Z',
      updated_at: '2024-11-29T08:00:00Z',
      is_verified: true,
      last_login_at: '2024-11-29T08:00:00Z',
      login_count: 45,
    },
    stats: {
      total_bookings: 12,
      completed_bookings: 10,
      cancelled_bookings: 2,
      total_spent: 4250,
      average_rating_given: 4.7,
      average_rating_received: 4.9,
      disputes_opened: 1,
      disputes_won: 0,
    },
    bookings: MOCK_BOOKINGS.filter(b => b.id === 'ORD-001'),
    pros_worked_with: [
      {
        id: 'pro-001',
        name: 'יוסי הנקי',
        avatar_url: null,
        rating: 4.9,
        is_verified: true,
        bookings_together: 5,
        total_spent_with: 1750,
        first_booking_date: '2023-08-10T10:00:00Z',
        last_booking_date: '2024-11-28T10:00:00Z',
      },
    ],
    transactions: [
      {
        id: 'txn-001',
        booking_id: 'ORD-001',
        amount: 350,
        currency: 'ILS',
        type: 'payment',
        status: 'completed',
        payment_method: 'credit_card',
        stripe_id: 'pi_xxx123',
        created_at: '2024-11-28T14:00:00Z',
      },
    ],
    messages: [],
    support_tickets: [],
    activity_log: [
      {
        id: 'log-001',
        action: 'booking_created',
        target_type: 'booking',
        target_id: 'ORD-001',
        metadata: {},
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0',
        created_at: '2024-11-25T08:30:00Z',
      },
    ],
  },
};

function mapBookingToOrder(booking: BookingSummary): AdminOrder {
  return {
    id: booking.id,
    customer: MOCK_CUSTOMERS[booking.id] || 'לקוח לא ידוע',
    customerId: MOCK_CUSTOMER_IDS[booking.id] || '',
    service: booking.title,
    category: booking.category,
    status: booking.status as BookingStatus,
    price: booking.final_price || 0,
    date: new Date(booking.created_at).toLocaleDateString('he-IL'),
    scheduledFor: booking.scheduled_for,
    pro: booking.pro_name || 'ממתין לשיבוץ',
    proId: booking.pro_id,
    proAvatar: booking.pro_avatar,
    hasDispute: booking.has_dispute,
    clientRating: booking.client_rating,
    proRating: booking.pro_rating,
  };
}

export function mapJobToAdminOrder(job: Job): AdminOrder {
  const statusMap: Record<string, BookingStatus> = {
    searching: 'pending',
    pending_acceptance: 'pending',
    accepted: 'accepted',
    en_route: 'en_route',
    arrived: 'in_progress',
    in_progress: 'in_progress',
    payment_pending: 'in_progress',
    completed: 'completed',
    cancelled: 'cancelled',
  };
  
  return {
    id: job.id,
    customer: job.client?.name || 'לקוח',
    customerId: job.clientId,
    service: job.serviceData.aiDescription || job.serviceData.category,
    category: job.serviceData.category,
    status: statusMap[job.status] || 'pending',
    price: job.finalPrice || job.priceEstimate || 0,
    date: new Date(job.createdAt).toLocaleDateString('he-IL'),
    scheduledFor: job.scheduledFor || job.createdAt,
    pro: job.provider?.name || 'ממתין לשיבוץ',
    proId: job.providerId || null,
    proAvatar: job.provider?.avatarUrl || null,
    hasDispute: false,
    clientRating: null,
    proRating: null,
  };
}

export async function getAdminBookings(): Promise<{
  data: AdminOrder[];
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        client:profiles!bookings_client_id_fkey(id, full_name, email, phone),
        provider:profiles!bookings_provider_id_fkey(id, full_name, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return {
        data: MOCK_BOOKINGS.map(mapBookingToOrder),
        error: null,
      };
    }

    const mappedOrders: AdminOrder[] = data.map((booking: any) => ({
      id: booking.id,
      customer: booking.client?.full_name || 'לקוח לא ידוע',
      customerId: booking.client_id,
      service: booking.title || booking.description || '',
      category: booking.category || 'כללי',
      status: booking.status,
      price: booking.final_price || booking.estimated_price || 0,
      date: new Date(booking.created_at).toLocaleDateString('he-IL'),
      scheduledFor: booking.scheduled_for,
      pro: booking.provider?.full_name || 'ממתין לשיבוץ',
      proId: booking.provider_id,
      proAvatar: booking.provider?.avatar_url,
      hasDispute: booking.is_flagged || false,
      clientRating: booking.client_rating,
      proRating: booking.pro_rating,
    }));

    return { data: mappedOrders, error: null };
  } catch (e) {
    console.log('Using mock data for admin bookings');
    return {
      data: MOCK_BOOKINGS.map(mapBookingToOrder),
      error: null,
    };
  }
}

export async function getAdminStats(): Promise<{
  data: AdminStats;
  error: string | null;
}> {
  try {
    const [bookingsResult, profilesResult, ticketsResult] = await Promise.all([
      supabase.from('bookings').select('id, status, final_price, created_at'),
      supabase.from('profiles').select('id, created_at').eq('role', 'client'),
      supabase.from('support_tickets').select('id, status'),
    ]);

    if (bookingsResult.error || !bookingsResult.data) {
      return { data: MOCK_STATS, error: null };
    }

    const bookings = bookingsResult.data as DbBooking[];
    const profiles = (profilesResult.data || []) as DbProfile[];
    const tickets = (ticketsResult.data || []) as DbTicket[];
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyBookings = bookings.filter(
      (b: DbBooking) => new Date(b.created_at) >= startOfMonth
    );

    const stats: AdminStats = {
      totalOrders: bookings.length,
      activeOrders: bookings.filter((b: DbBooking) =>
        ['accepted', 'en_route', 'in_progress'].includes(b.status)
      ).length,
      completedOrders: bookings.filter((b: DbBooking) => b.status === 'completed').length,
      cancelledOrders: bookings.filter((b: DbBooking) => b.status === 'cancelled').length,
      pendingOrders: bookings.filter((b: DbBooking) => b.status === 'pending').length,
      monthlyRevenue: monthlyBookings
        .filter((b: DbBooking) => b.status === 'completed')
        .reduce((sum: number, b: DbBooking) => sum + (b.final_price || 0), 0),
      totalRevenue: bookings
        .filter((b: DbBooking) => b.status === 'completed')
        .reduce((sum: number, b: DbBooking) => sum + (b.final_price || 0), 0),
      newUsersThisMonth: profiles.filter(
        (p: DbProfile) => new Date(p.created_at) >= startOfMonth
      ).length,
      openSupportTickets: tickets.filter(
        (t: DbTicket) => t.status === 'open'
      ).length,
      averageResponseTime: '1.5 שעות',
      revenueChange: '+12%',
      ordersChange: '+5%',
      usersChange: '+18%',
      ticketsChange: '-2%',
    };

    return { data: stats, error: null };
  } catch (e) {
    console.log('Using mock data for admin stats');
    return { data: MOCK_STATS, error: null };
  }
}

export async function getBookingById(id: string): Promise<{
  data: BookingSummary | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        client:profiles!bookings_client_id_fkey(id, full_name, email, phone),
        provider:profiles!bookings_provider_id_fkey(id, full_name, avatar_url)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      const mockBooking = MOCK_BOOKINGS.find(b => b.id === id);
      return {
        data: mockBooking || null,
        error: mockBooking ? null : 'Booking not found',
      };
    }

    const booking: BookingSummary = {
      id: data.id,
      title: data.title || data.description || '',
      category: data.category || 'כללי',
      status: data.status,
      scheduled_for: data.scheduled_for,
      created_at: data.created_at,
      completed_at: data.completed_at,
      final_price: data.final_price,
      pro_id: data.provider_id,
      pro_name: data.provider?.full_name || null,
      pro_avatar: data.provider?.avatar_url || null,
      client_rating: data.client_rating,
      pro_rating: data.pro_rating,
      has_dispute: data.is_flagged || false,
    };

    return { data: booking, error: null };
  } catch (e) {
    const mockBooking = MOCK_BOOKINGS.find(b => b.id === id);
    return {
      data: mockBooking || null,
      error: mockBooking ? null : 'Booking not found',
    };
  }
}

export async function getUserProfile360(userId: string): Promise<{
  data: UserProfileFull | null;
  error: string | null;
}> {
  try {
    const [profileResult, bookingsResult, transactionsResult, ticketsResult] =
      await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase
          .from('bookings')
          .select(
            `*, provider:profiles!bookings_provider_id_fkey(id, full_name, avatar_url)`
          )
          .eq('client_id', userId),
        supabase.from('transactions').select('*').eq('user_id', userId),
        supabase.from('support_tickets').select('*').eq('user_id', userId),
      ]);

    if (profileResult.error || !profileResult.data) {
      const mockProfile = MOCK_USER_PROFILES[userId];
      return {
        data: mockProfile || null,
        error: mockProfile ? null : 'User not found',
      };
    }

    const profile = profileResult.data as Record<string, unknown>;
    const bookings = (bookingsResult.data || []) as Array<Record<string, unknown>>;
    const transactions = (transactionsResult.data || []) as DbTransaction[];
    const tickets = (ticketsResult.data || []) as Array<Record<string, unknown>>;

    const completedBookings = bookings.filter((b) => b.status === 'completed');
    const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

    const userProfile: UserProfileFull = {
      user: {
        id: profile.id as string,
        email: profile.email as string,
        full_name: profile.full_name as string,
        phone: profile.phone as string | null,
        avatar_url: profile.avatar_url as string | null,
        role: profile.role as 'admin' | 'client' | 'provider',
        created_at: profile.created_at as string,
        updated_at: profile.updated_at as string,
        is_verified: (profile.is_verified as boolean) || false,
        last_login_at: profile.last_login_at as string | null,
        login_count: (profile.login_count as number) || 0,
      },
      stats: {
        total_bookings: bookings.length,
        completed_bookings: completedBookings.length,
        cancelled_bookings: cancelledBookings.length,
        total_spent: transactions
          .filter((t: DbTransaction) => t.type === 'payment' && t.status === 'completed')
          .reduce((sum: number, t: DbTransaction) => sum + t.amount, 0),
        average_rating_given:
          completedBookings.reduce(
            (sum: number, b) => sum + ((b.client_rating as number) || 0),
            0
          ) / (completedBookings.length || 1),
        average_rating_received:
          completedBookings.reduce((sum: number, b) => sum + ((b.pro_rating as number) || 0), 0) /
          (completedBookings.length || 1),
        disputes_opened: bookings.filter((b) => b.is_flagged).length,
        disputes_won: 0,
      },
      bookings: bookings.map((b) => ({
        id: b.id as string,
        title: (b.title as string) || (b.description as string) || '',
        category: (b.category as string) || 'כללי',
        status: b.status as string,
        scheduled_for: b.scheduled_for as string,
        created_at: b.created_at as string,
        completed_at: b.completed_at as string | null,
        final_price: b.final_price as number | null,
        pro_id: b.provider_id as string | null,
        pro_name: ((b.provider as Record<string, unknown>)?.full_name as string) || null,
        pro_avatar: ((b.provider as Record<string, unknown>)?.avatar_url as string) || null,
        client_rating: b.client_rating as number | null,
        pro_rating: b.pro_rating as number | null,
        has_dispute: (b.is_flagged as boolean) || false,
      })),
      pros_worked_with: [],
      transactions: transactions.map((t: DbTransaction) => ({
        id: t.id,
        booking_id: t.booking_id,
        amount: t.amount,
        currency: t.currency || 'ILS',
        type: t.type as 'payment' | 'refund' | 'tip' | 'penalty',
        status: t.status as 'pending' | 'completed' | 'failed' | 'refunded',
        payment_method: t.payment_method,
        stripe_id: t.stripe_id,
        created_at: t.created_at,
      })),
      messages: [],
      support_tickets: tickets.map((t) => ({
        id: t.id as string,
        subject: t.subject as string,
        status: t.status as 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed',
        priority: t.priority as 'low' | 'medium' | 'high' | 'urgent',
        category: (t.category as string) || 'כללי',
        created_at: t.created_at as string,
        updated_at: t.updated_at as string,
        assigned_to: t.assigned_to as string | null,
        messages_count: (t.messages_count as number) || 0,
      })),
      activity_log: [],
    };

    return { data: userProfile, error: null };
  } catch (e) {
    const mockProfile = MOCK_USER_PROFILES[userId];
    return {
      data: mockProfile || null,
      error: mockProfile ? null : 'User not found',
    };
  }
}

export async function getAdminSupportTickets(): Promise<{
  data: (SupportTicket & { userName: string })[];
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .select(`*, user:profiles(full_name)`)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return {
        data: MOCK_SUPPORT_TICKETS.map(t => ({
          ...t,
          userName: MOCK_TICKET_USERS[t.id] || 'משתמש',
        })),
        error: null,
      };
    }

    return {
      data: data.map((t: any) => ({
        id: t.id,
        subject: t.subject,
        status: t.status,
        priority: t.priority,
        category: t.category || 'כללי',
        created_at: t.created_at,
        updated_at: t.updated_at,
        assigned_to: t.assigned_to,
        messages_count: t.messages_count || 0,
        userName: t.user?.full_name || 'משתמש',
      })),
      error: null,
    };
  } catch (e) {
    console.log('Using mock data for support tickets');
    return {
      data: MOCK_SUPPORT_TICKETS.map(t => ({
        ...t,
        userName: MOCK_TICKET_USERS[t.id] || 'משתמש',
      })),
      error: null,
    };
  }
}

export interface UseAdminBookingsResult {
  orders: AdminOrder[];
  stats: AdminStats;
  supportTickets: (SupportTicket & { userName: string })[];
  categories: AdminCategory[];
  messages: AdminMessage[];
  pros: AdminPro[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getBookingById: (id: string) => Promise<BookingSummary | null>;
  getUserProfile: (userId: string) => Promise<UserProfileFull | null>;
}

export function useAdminBookings(): UseAdminBookingsResult {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [stats, setStats] = useState<AdminStats>(MOCK_STATS);
  const [supportTickets, setSupportTickets] = useState<
    (SupportTicket & { userName: string })[]
  >([]);
  const [categories, setCategories] = useState<AdminCategory[]>(MOCK_CATEGORIES);
  const [messages, setMessages] = useState<AdminMessage[]>(MOCK_MESSAGES);
  const [pros, setPros] = useState<AdminPro[]>(MOCK_PROS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [ordersResult, statsResult, ticketsResult] = await Promise.all([
        getAdminBookings(),
        getAdminStats(),
        getAdminSupportTickets(),
      ]);

      setOrders(ordersResult.data);
      setStats(statsResult.data);
      setSupportTickets(ticketsResult.data);
      setCategories(MOCK_CATEGORIES);
      setMessages(MOCK_MESSAGES);
      setPros(MOCK_PROS);

      if (ordersResult.error) {
        setError(ordersResult.error);
      }
    } catch (e) {
      setError('Failed to fetch admin data');
      setOrders(MOCK_BOOKINGS.map(mapBookingToOrder));
      setStats(MOCK_STATS);
      setSupportTickets(
        MOCK_SUPPORT_TICKETS.map(t => ({
          ...t,
          userName: MOCK_TICKET_USERS[t.id] || 'משתמש',
        }))
      );
      setCategories(MOCK_CATEGORIES);
      setMessages(MOCK_MESSAGES);
      setPros(MOCK_PROS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGetBookingById = useCallback(
    async (id: string): Promise<BookingSummary | null> => {
      const result = await getBookingById(id);
      return result.data;
    },
    []
  );

  const handleGetUserProfile = useCallback(
    async (userId: string): Promise<UserProfileFull | null> => {
      const result = await getUserProfile360(userId);
      return result.data;
    },
    []
  );

  return {
    orders,
    stats,
    supportTickets,
    categories,
    messages,
    pros,
    loading,
    error,
    refetch: fetchData,
    getBookingById: handleGetBookingById,
    getUserProfile: handleGetUserProfile,
  };
}

const MOCK_PRO_DETAILS: Record<string, ProInfo> = {
  'pro-001': {
    id: 'pro-001',
    name: 'יוסי הנקי',
    phone: '050-1234567',
    email: 'yossi.clean@email.com',
    rating: 4.8,
    completedJobs: 187,
    memberSince: '2022-03-15',
    category: 'ניקיון',
    isVerified: true,
    deviceInfo: {
      model: 'Samsung Galaxy S22',
      os: 'Android 13',
      appVersion: '2.4.0',
      batteryLevel: 68,
      lastActive: new Date().toISOString()
    },
    breadcrumbs: []
  },
  'pro-002': {
    id: 'pro-002',
    name: 'חשמל ישיר',
    phone: '052-7654321',
    email: 'electric.direct@email.com',
    rating: 4.9,
    completedJobs: 312,
    memberSince: '2021-08-20',
    category: 'חשמל',
    isVerified: true,
    deviceInfo: {
      model: 'iPhone 14',
      os: 'iOS 17.1',
      appVersion: '2.4.1',
      batteryLevel: 82,
      lastActive: new Date().toISOString()
    },
    breadcrumbs: []
  },
  'pro-003': {
    id: 'pro-003',
    name: 'שיפוצי הגליל',
    phone: '054-9876543',
    email: 'galil.renovations@email.com',
    rating: 4.6,
    completedJobs: 145,
    memberSince: '2022-01-10',
    category: 'שיפוצים',
    isVerified: true,
    deviceInfo: {
      model: 'Xiaomi 13',
      os: 'Android 14',
      appVersion: '2.4.0',
      batteryLevel: 55,
      lastActive: new Date().toISOString()
    },
    breadcrumbs: []
  },
  'pro-004': {
    id: 'pro-004',
    name: 'מובילי העיר',
    phone: '053-1122334',
    email: 'city.movers@email.com',
    rating: 4.7,
    completedJobs: 278,
    memberSince: '2021-11-05',
    category: 'הובלות',
    isVerified: true,
    deviceInfo: {
      model: 'Samsung Galaxy A54',
      os: 'Android 13',
      appVersion: '2.3.9',
      batteryLevel: 91,
      lastActive: new Date().toISOString()
    },
    breadcrumbs: []
  },
  'pro-005': {
    id: 'pro-005',
    name: 'צנרת מהירה',
    phone: '050-5566778',
    email: 'fast.plumbing@email.com',
    rating: 4.9,
    completedJobs: 423,
    memberSince: '2020-06-12',
    category: 'אינסטלציה',
    isVerified: true,
    deviceInfo: {
      model: 'iPhone 13 Pro',
      os: 'iOS 17.0',
      appVersion: '2.4.1',
      batteryLevel: 45,
      lastActive: new Date().toISOString()
    },
    breadcrumbs: []
  },
  'pro-006': {
    id: 'pro-006',
    name: 'צבעי האומן',
    phone: '052-9988776',
    email: 'artist.painter@email.com',
    rating: 4.5,
    completedJobs: 98,
    memberSince: '2023-02-28',
    category: 'שיפוצים',
    isVerified: true,
    deviceInfo: {
      model: 'Google Pixel 7',
      os: 'Android 14',
      appVersion: '2.4.0',
      batteryLevel: 72,
      lastActive: new Date().toISOString()
    },
    breadcrumbs: []
  },
  'pro-007': {
    id: 'pro-007',
    name: 'מפתחות זהב',
    phone: '054-3344556',
    email: 'golden.keys@email.com',
    rating: 4.8,
    completedJobs: 256,
    memberSince: '2021-04-18',
    category: 'מנעולן',
    isVerified: true,
    deviceInfo: {
      model: 'iPhone 15',
      os: 'iOS 17.2',
      appVersion: '2.4.1',
      batteryLevel: 38,
      lastActive: new Date().toISOString()
    },
    breadcrumbs: []
  }
};

const MOCK_CLIENT_ADDRESSES: Record<string, { full: string; lat: number; lng: number }> = {
  'ORD-001': { full: 'רחוב הרצל 15, תל אביב', lat: 32.0731, lng: 34.7799 },
  'ORD-002': { full: 'שדרות רוטשילד 45, תל אביב', lat: 32.0636, lng: 34.7707 },
  'ORD-003': { full: 'רחוב אלנבי 80, תל אביב', lat: 32.0674, lng: 34.7697 },
  'ORD-004': { full: 'רחוב דיזנגוף 150, תל אביב', lat: 32.0853, lng: 34.7736 },
  'ORD-005': { full: 'רחוב בן יהודה 30, תל אביב', lat: 32.0858, lng: 34.7706 },
  'ORD-006': { full: 'רחוב פלורנטין 22, תל אביב', lat: 32.0572, lng: 34.7656 },
  'ORD-007': { full: 'רחוב שינקין 10, תל אביב', lat: 32.0700, lng: 34.7752 },
  'ORD-008': { full: 'רחוב יהודה הלוי 60, תל אביב', lat: 32.0659, lng: 34.7768 },
  'ORD-009': { full: 'רחוב גורדון 25, תל אביב', lat: 32.0835, lng: 34.7701 },
  'ORD-010': { full: 'רחוב נחלת בנימין 35, תל אביב', lat: 32.0650, lng: 34.7720 },
};

function generateTimelineForOrder(booking: BookingSummary): TimelineEvent[] {
  const timeline: TimelineEvent[] = [];
  const createdDate = new Date(booking.created_at);
  
  timeline.push({
    id: `t-${booking.id}-1`,
    timestamp: booking.created_at,
    type: 'order_created',
    title: 'הזמנה נוצרה',
    actor: 'client'
  });

  const offerSentTime = new Date(createdDate.getTime() + 60000);
  timeline.push({
    id: `t-${booking.id}-2`,
    timestamp: offerSentTime.toISOString(),
    type: 'offer_sent',
    title: 'הצעה נשלחה ל-3 בעלי מקצוע',
    actor: 'system'
  });

  if (booking.status !== 'pending') {
    const acceptedTime = new Date(createdDate.getTime() + 180000);
    timeline.push({
      id: `t-${booking.id}-3`,
      timestamp: acceptedTime.toISOString(),
      type: 'pro_accepted',
      title: `${booking.pro_name || 'בעל מקצוע'} קיבל את העבודה`,
      actor: 'pro'
    });
  }

  if (['en_route', 'in_progress', 'completed'].includes(booking.status)) {
    const scheduledDate = new Date(booking.scheduled_for);
    timeline.push({
      id: `t-${booking.id}-4`,
      timestamp: scheduledDate.toISOString(),
      type: 'system_event',
      title: 'בעל המקצוע יצא לדרך',
      actor: 'pro',
      description: 'מרחק משוער: 4.5 ק"מ'
    });
  }

  if (['in_progress', 'completed'].includes(booking.status)) {
    const scheduledDate = new Date(booking.scheduled_for);
    const arrivedTime = new Date(scheduledDate.getTime() + 1200000);
    timeline.push({
      id: `t-${booking.id}-5`,
      timestamp: arrivedTime.toISOString(),
      type: 'gps_arrival',
      title: 'נכנס לאזור הג\'יאופנס',
      actor: 'system',
      description: 'רדיוס 50 מטר מהכתובת'
    });

    timeline.push({
      id: `t-${booking.id}-6`,
      timestamp: new Date(arrivedTime.getTime() + 120000).toISOString(),
      type: 'system_event',
      title: 'בעל המקצוע הגיע',
      actor: 'pro'
    });

    timeline.push({
      id: `t-${booking.id}-7`,
      timestamp: new Date(arrivedTime.getTime() + 300000).toISOString(),
      type: 'photo_uploaded',
      title: 'תמונת "לפני" הועלתה',
      actor: 'pro'
    });

    timeline.push({
      id: `t-${booking.id}-8`,
      timestamp: new Date(arrivedTime.getTime() + 360000).toISOString(),
      type: 'job_started',
      title: 'העבודה החלה',
      actor: 'pro'
    });
  }

  if (booking.status === 'completed' && booking.completed_at) {
    timeline.push({
      id: `t-${booking.id}-9`,
      timestamp: booking.completed_at,
      type: 'photo_uploaded',
      title: 'תמונת "אחרי" הועלתה',
      actor: 'pro'
    });

    timeline.push({
      id: `t-${booking.id}-10`,
      timestamp: booking.completed_at,
      type: 'job_completed',
      title: 'העבודה הושלמה',
      actor: 'pro'
    });

    const paymentTime = new Date(new Date(booking.completed_at).getTime() + 60000);
    timeline.push({
      id: `t-${booking.id}-11`,
      timestamp: paymentTime.toISOString(),
      type: 'payment_processed',
      title: 'תשלום בוצע בהצלחה',
      actor: 'system'
    });
  }

  if (booking.status === 'cancelled') {
    timeline.push({
      id: `t-${booking.id}-cancel`,
      timestamp: new Date(createdDate.getTime() + 3600000).toISOString(),
      type: 'system_event',
      title: 'ההזמנה בוטלה',
      actor: 'admin',
      description: 'בוטל על ידי המערכת'
    });
  }

  if (booking.has_dispute) {
    timeline.push({
      id: `t-${booking.id}-dispute`,
      timestamp: new Date(createdDate.getTime() + 7200000).toISOString(),
      type: 'dispute_opened',
      title: 'נפתחה מחלוקת',
      actor: 'client',
      description: 'הלקוח הגיש תלונה'
    });
  }

  return timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

function generateChatHistory(booking: BookingSummary, customerName: string): ChatMessage[] {
  if (booking.status === 'pending' || !booking.pro_name) {
    return [];
  }

  const scheduledDate = new Date(booking.scheduled_for);
  const customerId = MOCK_CUSTOMER_IDS[booking.id] || 'user-unknown';
  const proId = booking.pro_id || 'pro-unknown';

  const messages: ChatMessage[] = [
    {
      id: `c-${booking.id}-1`,
      senderId: customerId,
      senderRole: 'client',
      senderName: customerName,
      content: 'שלום, מתי תוכל להגיע?',
      timestamp: new Date(scheduledDate.getTime() - 3600000).toISOString(),
      isRead: true,
      isDeleted: false
    },
    {
      id: `c-${booking.id}-2`,
      senderId: proId,
      senderRole: 'pro',
      senderName: booking.pro_name,
      content: 'שלום! אגיע בזמן המתוכנן, סביב השעה ' + scheduledDate.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date(scheduledDate.getTime() - 3500000).toISOString(),
      isRead: true,
      isDeleted: false
    },
    {
      id: `c-${booking.id}-3`,
      senderId: customerId,
      senderRole: 'client',
      senderName: customerName,
      content: 'מעולה, תודה!',
      timestamp: new Date(scheduledDate.getTime() - 3400000).toISOString(),
      isRead: true,
      isDeleted: false
    }
  ];

  if (booking.status === 'completed') {
    messages.push({
      id: `c-${booking.id}-4`,
      senderId: customerId,
      senderRole: 'client',
      senderName: customerName,
      content: 'תודה רבה על העבודה המצוינת!',
      timestamp: booking.completed_at || scheduledDate.toISOString(),
      isRead: true,
      isDeleted: false
    });
  }

  return messages;
}

function generateEvidence(booking: BookingSummary): EvidenceItem[] {
  if (!['in_progress', 'completed'].includes(booking.status)) {
    return [];
  }

  const scheduledDate = new Date(booking.scheduled_for);
  const address = MOCK_CLIENT_ADDRESSES[booking.id];

  const evidence: EvidenceItem[] = [
    {
      id: `ev-${booking.id}-1`,
      type: 'photo',
      stage: 'before',
      url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400',
      thumbnailUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=150',
      uploadedAt: new Date(scheduledDate.getTime() + 600000).toISOString(),
      uploadedBy: 'pro',
      exifData: {
        capturedAt: new Date(scheduledDate.getTime() + 595000).toISOString(),
        deviceModel: 'Samsung Galaxy S23',
        gpsLat: address?.lat || 32.0853,
        gpsLng: address?.lng || 34.7818
      }
    }
  ];

  if (booking.status === 'completed') {
    evidence.push({
      id: `ev-${booking.id}-2`,
      type: 'photo',
      stage: 'after',
      url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=400',
      thumbnailUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=150',
      uploadedAt: booking.completed_at || scheduledDate.toISOString(),
      uploadedBy: 'pro',
      exifData: {
        capturedAt: new Date(new Date(booking.completed_at || scheduledDate).getTime() - 5000).toISOString(),
        deviceModel: 'Samsung Galaxy S23',
        gpsLat: address?.lat || 32.0853,
        gpsLng: address?.lng || 34.7818
      }
    });
  }

  return evidence;
}

export function getOrderFullDetails(orderId: string): OrderFullObject | null {
  const booking = MOCK_BOOKINGS.find(b => b.id === orderId);
  
  if (!booking) {
    return null;
  }

  const customerName = MOCK_CUSTOMERS[booking.id] || 'לקוח לא ידוע';
  const customerId = MOCK_CUSTOMER_IDS[booking.id] || 'user-unknown';
  const address = MOCK_CLIENT_ADDRESSES[booking.id] || { 
    full: 'כתובת לא ידועה, תל אביב', 
    lat: 32.0853, 
    lng: 34.7818 
  };

  const bookingStatusToOrderStatus: Record<string, OrderStatus> = {
    'pending': 'pending',
    'accepted': 'accepted',
    'en_route': 'en_route',
    'in_progress': 'in_progress',
    'completed': 'completed',
    'cancelled': 'cancelled'
  };

  const orderStatus: OrderStatus = booking.has_dispute 
    ? 'dispute' 
    : (bookingStatusToOrderStatus[booking.status] || 'pending');

  const client: ClientInfo = {
    id: customerId,
    name: customerName,
    phone: '050-' + Math.floor(1000000 + Math.random() * 9000000).toString(),
    email: customerName.replace(/\s+/g, '.').toLowerCase() + '@email.com',
    rating: 4.5 + Math.random() * 0.5,
    totalBookings: Math.floor(5 + Math.random() * 20),
    memberSince: '2023-' + String(Math.floor(1 + Math.random() * 12)).padStart(2, '0') + '-15',
    deviceInfo: {
      model: 'iPhone 14 Pro',
      os: 'iOS 17.2',
      appVersion: '2.4.1',
      batteryLevel: Math.floor(30 + Math.random() * 60),
      lastActive: new Date().toISOString()
    },
    address: {
      full: address.full,
      lat: address.lat,
      lng: address.lng,
      floor: String(Math.floor(1 + Math.random() * 10)),
      apartment: String(Math.floor(1 + Math.random() * 20)),
      buildingCode: String(Math.floor(1000 + Math.random() * 9000)),
      notes: 'דלת בצבע חום'
    }
  };

  let pro: ProInfo | null = null;
  if (booking.pro_id && MOCK_PRO_DETAILS[booking.pro_id]) {
    const proDetails = MOCK_PRO_DETAILS[booking.pro_id];
    const isActiveOrder = ['en_route', 'in_progress', 'accepted'].includes(booking.status);
    
    pro = {
      ...proDetails,
      currentLocation: isActiveOrder ? {
        lat: address.lat + (Math.random() - 0.5) * 0.005,
        lng: address.lng + (Math.random() - 0.5) * 0.005,
        accuracy: 10,
        timestamp: new Date().toISOString()
      } : undefined,
      breadcrumbs: isActiveOrder ? [
        { lat: address.lat - 0.01, lng: address.lng - 0.01, timestamp: new Date(Date.now() - 900000).toISOString() },
        { lat: address.lat - 0.008, lng: address.lng - 0.008, timestamp: new Date(Date.now() - 720000).toISOString() },
        { lat: address.lat - 0.005, lng: address.lng - 0.005, timestamp: new Date(Date.now() - 540000).toISOString() },
        { lat: address.lat - 0.002, lng: address.lng - 0.002, timestamp: new Date(Date.now() - 360000).toISOString() },
        { lat: address.lat, lng: address.lng, timestamp: new Date(Date.now() - 180000).toISOString() },
      ] : []
    };
  } else if (booking.pro_name) {
    pro = {
      id: booking.pro_id || 'pro-generic',
      name: booking.pro_name,
      phone: '052-' + Math.floor(1000000 + Math.random() * 9000000).toString(),
      email: booking.pro_name.replace(/\s+/g, '.').toLowerCase() + '@email.com',
      rating: 4.5 + Math.random() * 0.5,
      completedJobs: Math.floor(50 + Math.random() * 200),
      memberSince: '2022-' + String(Math.floor(1 + Math.random() * 12)).padStart(2, '0') + '-10',
      category: booking.category,
      isVerified: true,
      deviceInfo: {
        model: 'Samsung Galaxy S23',
        os: 'Android 14',
        appVersion: '2.4.0',
        batteryLevel: Math.floor(30 + Math.random() * 60),
        lastActive: new Date().toISOString()
      },
      breadcrumbs: []
    };
  }

  const commissionRate = 15;
  const totalPrice = booking.final_price || 0;
  const commissionAmount = totalPrice * (commissionRate / 100);

  const paymentStatusMap: Record<string, FinanceBreakdown['paymentStatus']> = {
    'pending': 'pending',
    'accepted': 'authorized',
    'en_route': 'authorized',
    'in_progress': 'authorized',
    'completed': 'captured',
    'cancelled': 'refunded'
  };

  const finance: FinanceBreakdown = {
    totalPrice,
    currency: 'ILS',
    commissionRate,
    commissionAmount,
    netToPro: totalPrice - commissionAmount,
    tip: booking.status === 'completed' ? Math.floor(Math.random() * 30) : undefined,
    paymentStatus: paymentStatusMap[booking.status] || 'pending',
    stripePaymentId: booking.status !== 'pending' ? 'pi_' + Math.random().toString(36).substring(2, 15) : undefined,
    paidAt: booking.status === 'completed' ? booking.completed_at || undefined : undefined
  };

  const scheduledDate = new Date(booking.scheduled_for);
  const createdDate = new Date(booking.created_at);

  const metadata: OrderMetadata = {
    category: booking.category,
    subcategory: booking.title.split(' ').slice(0, 2).join(' '),
    description: booking.title,
    urgencyLevel: booking.category === 'אינסטלציה' ? 'urgent' : 'normal',
    estimatedDuration: 60,
    dispatchRadius: 10,
    offersCount: 3,
    acceptedAt: booking.status !== 'pending' ? new Date(createdDate.getTime() + 180000).toISOString() : undefined,
    startedAt: ['in_progress', 'completed'].includes(booking.status) ? new Date(scheduledDate.getTime() + 600000).toISOString() : undefined,
    completedAt: booking.completed_at || undefined,
    scheduledFor: booking.scheduled_for
  };

  if (booking.status === 'cancelled') {
    metadata.cancelledAt = new Date(createdDate.getTime() + 3600000).toISOString();
    metadata.cancelledBy = 'client';
    metadata.cancellationReason = 'ביטול על ידי הלקוח';
  }

  const location: LocationData = {
    clientAddress: { lat: address.lat, lng: address.lng },
    proCurrentLocation: pro?.currentLocation ? { lat: pro.currentLocation.lat, lng: pro.currentLocation.lng } : undefined,
    geofenceRadius: 50,
    proBreadcrumbs: pro?.breadcrumbs || [],
    distanceTraveled: ['en_route', 'in_progress', 'completed'].includes(booking.status) ? 3.5 + Math.random() * 5 : undefined
  };

  const orderFull: OrderFullObject = {
    id: booking.id,
    status: orderStatus,
    createdAt: booking.created_at,
    timeline: generateTimelineForOrder(booking),
    client,
    pro,
    finance,
    evidence: generateEvidence(booking),
    chatHistory: generateChatHistory(booking, customerName),
    location,
    metadata
  };

  return orderFull;
}

export { MOCK_BOOKINGS, MOCK_SUPPORT_TICKETS, MOCK_STATS, MOCK_CUSTOMERS, MOCK_TICKET_USERS, MOCK_CATEGORIES, MOCK_MESSAGES, MOCK_PROS };
