import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { Job, JobStatus, JobOffer, generateSecurityCode, ProviderInfo, ClientInfo } from '../types/job';
import { BookingData } from '../context/BookingContext';
import { 
  ProfessionalCapability, 
  ServiceRequirement, 
  MatchResult,
  extractRequirementsFromJob,
  calculateMatchScore,
  canHandleRequest,
  matchProfessionals,
  ServiceCategory
} from '../services/CapabilityMatchingService';

const STORAGE_KEY = 'beedy_order_store';
const OFFERS_STORAGE_KEY = 'beedy_order_offers';

// Matching result for a job
export interface JobMatchResult {
  job: Job;
  matchScore: number;
  matchedCapabilities: string[];
  matchReasons: string[];
}

interface OrderStoreValue {
  orders: Job[];
  providers: ExtendedProviderInfo[];
  
  getClientOrders: (clientId: string) => Job[];
  getProviderOrders: (providerId: string) => Job[];
  getAvailableRequests: (providerId: string, category?: string) => Job[];
  getMatchedRequests: (providerId: string) => JobMatchResult[]; // New: requests sorted by match score
  getAdminOrders: () => Job[];
  getProvider: (providerId: string) => ExtendedProviderInfo | undefined;
  
  createOrder: (booking: BookingData, clientId: string) => Promise<Job>;
  submitBid: (orderId: string, providerId: string, price: number, message?: string) => Promise<JobOffer>;
  acceptBid: (orderId: string, offerId: string) => Promise<boolean>;
  updateOrderStatus: (orderId: string, status: JobStatus, actor: string) => Promise<Job>;
  cancelOrder: (orderId: string, reason: string, actor: string) => Promise<boolean>;
  
  getOrderOffers: (orderId: string) => JobOffer[];
  
  subscribe: (callback: () => void) => () => void;
  
  isLoading: boolean;
}

const OrderContext = createContext<OrderStoreValue | undefined>(undefined);

const MOCK_CLIENTS: ClientInfo[] = [
  {
    id: 'client_1',
    name: 'שרה כהן',
    phone: '050-555-1234',
    email: 'sarah@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    rating: 4.8,
    totalBookings: 12
  },
  {
    id: 'client_2',
    name: 'דוד לוי',
    phone: '052-444-5678',
    email: 'david@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    rating: 4.5,
    totalBookings: 8
  },
  {
    id: 'client_3',
    name: 'רחל אברהם',
    phone: '054-333-9012',
    email: 'rachel@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel',
    rating: 4.9,
    totalBookings: 25
  },
  {
    id: 'client_4',
    name: 'יעקב גולדברג',
    phone: '053-222-3456',
    email: 'yaakov@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yaakov',
    rating: 4.7,
    totalBookings: 15
  }
];

// Extended provider info with capabilities
export interface ExtendedProviderInfo extends ProviderInfo {
  capabilities: ProfessionalCapability[];
}

const MOCK_PROVIDERS: ExtendedProviderInfo[] = [
  {
    id: 'pro_1',
    name: 'יוסי האינסטלטור',
    phone: '052-999-8888',
    email: 'yossi@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yossi',
    rating: 4.9,
    completedJobs: 156,
    category: 'plumbing',
    isVerified: true,
    vehicleInfo: {
      make: 'פורד',
      model: 'טרנזיט',
      color: 'לבן',
      licensePlate: '12-345-67'
    },
    capabilities: [
      { id: 'leak_repair', name: 'תיקון נזילות', category: 'plumbing', proficiency: 'expert', isFavorite: true },
      { id: 'drain_cleaning', name: 'פתיחת סתימות', category: 'plumbing', proficiency: 'expert', isFavorite: true },
      { id: 'toilet_install', name: 'התקנת אסלות', category: 'plumbing', proficiency: 'intermediate' },
      { id: 'faucet_repair', name: 'תיקון ברזים', category: 'plumbing', proficiency: 'expert' },
      { id: 'pipe_replacement', name: 'החלפת צנרת', category: 'plumbing', proficiency: 'intermediate' },
      { id: 'water_heater', name: 'דודי שמש וחימום', category: 'plumbing', proficiency: 'intermediate' },
      { id: 'shower_install', name: 'התקנת מקלחונים', category: 'plumbing', proficiency: 'basic' },
      { id: 'emergency', name: 'קריאות חירום', category: 'plumbing', proficiency: 'expert', isFavorite: true },
    ]
  },
  {
    id: 'pro_2',
    name: 'משה החשמלאי',
    phone: '050-777-6666',
    email: 'moshe@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Moshe',
    rating: 4.8,
    completedJobs: 203,
    category: 'electrical',
    isVerified: true,
    capabilities: [
      { id: 'outlet_install', name: 'התקנת שקעים', category: 'electrical', proficiency: 'expert', isFavorite: true },
      { id: 'light_fixtures', name: 'התקנת גופי תאורה', category: 'electrical', proficiency: 'expert' },
      { id: 'panel_repair', name: 'תיקון לוח חשמל', category: 'electrical', proficiency: 'expert', isFavorite: true },
      { id: 'circuit_breaker', name: 'החלפת נתיכים', category: 'electrical', proficiency: 'intermediate' },
      { id: 'wiring', name: 'חיווט חשמלי', category: 'electrical', proficiency: 'expert' },
      { id: 'ac_install', name: 'התקנת מזגנים', category: 'electrical', proficiency: 'intermediate' },
      { id: 'smart_home', name: 'בית חכם', category: 'electrical', proficiency: 'basic' },
      { id: 'emergency_electrical', name: 'קריאות חירום חשמל', category: 'electrical', proficiency: 'expert', isFavorite: true },
      { id: 'inspection', name: 'בדיקות חשמל', category: 'electrical', proficiency: 'intermediate' },
    ]
  },
  {
    id: 'pro_3',
    name: 'שירות ניקיון מקצועי',
    phone: '054-888-5555',
    email: 'cleaning@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cleaning',
    rating: 4.7,
    completedJobs: 89,
    category: 'cleaning',
    isVerified: true,
    capabilities: [
      { id: 'deep_clean', name: 'ניקיון יסודי', category: 'cleaning', proficiency: 'expert', isFavorite: true },
      { id: 'regular_clean', name: 'ניקיון שוטף', category: 'cleaning', proficiency: 'expert' },
      { id: 'post_construction', name: 'ניקיון לאחר שיפוץ', category: 'cleaning', proficiency: 'expert', isFavorite: true },
      { id: 'carpet_clean', name: 'ניקוי שטיחים', category: 'cleaning', proficiency: 'intermediate' },
      { id: 'window_clean', name: 'ניקוי חלונות', category: 'cleaning', proficiency: 'intermediate' },
      { id: 'kitchen_clean', name: 'ניקיון מטבחים', category: 'cleaning', proficiency: 'expert' },
      { id: 'office_clean', name: 'ניקיון משרדים', category: 'cleaning', proficiency: 'intermediate' },
      { id: 'move_out', name: 'ניקיון לפני/אחרי מעבר דירה', category: 'cleaning', proficiency: 'expert' },
    ]
  },
  {
    id: 'pro_4',
    name: 'אבי מיזוג אוויר',
    phone: '053-666-4444',
    email: 'avi@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Avi',
    rating: 4.6,
    completedJobs: 67,
    category: 'ac',
    isVerified: true,
    capabilities: [
      { id: 'ac_install', name: 'התקנת מזגנים', category: 'electrical', proficiency: 'expert', isFavorite: true },
      { id: 'ac_repair', name: 'תיקון מזגנים', category: 'appliances', proficiency: 'expert', isFavorite: true },
      { id: 'emergency_electrical', name: 'קריאות חירום חשמל', category: 'electrical', proficiency: 'intermediate' },
    ]
  },
  {
    id: 'pro_5',
    name: 'דנה - מומחית יופי',
    phone: '050-111-2222',
    email: 'dana@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dana',
    rating: 4.95,
    completedJobs: 234,
    category: 'beauty',
    isVerified: true,
    capabilities: [
      { id: 'haircut', name: 'תספורת', category: 'beauty', proficiency: 'expert', isFavorite: true },
      { id: 'coloring', name: 'צביעת שיער', category: 'beauty', proficiency: 'expert', isFavorite: true },
      { id: 'manicure', name: 'מניקור', category: 'beauty', proficiency: 'expert' },
      { id: 'pedicure', name: 'פדיקור', category: 'beauty', proficiency: 'intermediate' },
      { id: 'makeup', name: 'איפור', category: 'beauty', proficiency: 'expert' },
      { id: 'facial', name: 'טיפולי פנים', category: 'beauty', proficiency: 'intermediate' },
    ]
  },
  {
    id: 'pro_6',
    name: 'שלומי המסגר',
    phone: '052-333-4444',
    email: 'shlomi@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Shlomi',
    rating: 4.85,
    completedJobs: 178,
    category: 'locksmith',
    isVerified: true,
    capabilities: [
      { id: 'lock_open', name: 'פתיחת דלתות נעולות', category: 'locksmith', proficiency: 'expert', isFavorite: true },
      { id: 'lock_replace', name: 'החלפת מנעולים', category: 'locksmith', proficiency: 'expert' },
      { id: 'key_copy', name: 'שכפול מפתחות', category: 'locksmith', proficiency: 'expert' },
      { id: 'safe_open', name: 'פתיחת כספות', category: 'locksmith', proficiency: 'intermediate' },
      { id: 'car_lockout', name: 'פתיחת רכבים', category: 'locksmith', proficiency: 'expert', isFavorite: true },
      { id: 'emergency_lock', name: 'קריאות חירום', category: 'locksmith', proficiency: 'expert', isFavorite: true },
    ]
  }
];

const TEL_AVIV_ADDRESSES = [
  { address: 'רחוב דיזנגוף 100, תל אביב', lat: 32.0853, lng: 34.7818 },
  { address: 'שדרות רוטשילד 50, תל אביב', lat: 32.0636, lng: 34.7731 },
  { address: 'רחוב אלנבי 45, תל אביב', lat: 32.0671, lng: 34.7686 },
  { address: 'רחוב הירקון 200, תל אביב', lat: 32.0904, lng: 34.7711 },
  { address: 'רחוב בן יהודה 120, תל אביב', lat: 32.0811, lng: 34.7688 },
  { address: 'רחוב אבן גבירול 70, תל אביב', lat: 32.0846, lng: 34.7825 },
  { address: 'רחוב קינג ג\'ורג\' 30, תל אביב', lat: 32.0727, lng: 34.7769 },
  { address: 'שדרות נורדאו 15, תל אביב', lat: 32.0934, lng: 34.7773 }
];

const CATEGORY_DESCRIPTIONS: Record<string, string[]> = {
  plumbing: [
    'נזילה בכיור המטבח, דורש תיקון דחוף',
    'סתימה בשירותים, צריך פתיחה מקצועית',
    'החלפת ברז במקלחת'
  ],
  electrical: [
    'תקלה בלוח החשמל הראשי',
    'התקנת נקודות חשמל חדשות בסלון',
    'בעיה עם התאורה בחדר השינה'
  ],
  cleaning: [
    'ניקיון יסודי לאחר שיפוץ',
    'ניקיון שבועי לדירת 4 חדרים',
    'ניקיון חלונות לבניין משרדים'
  ],
  ac: [
    'תקלה במזגן - לא מקרר כראוי',
    'התקנת מזגן חדש בחדר השינה',
    'טיפול שנתי למזגנים'
  ],
  renovation: [
    'שיפוץ חדר אמבטיה קטן',
    'צביעת דירת 3 חדרים',
    'החלפת ריצוף במטבח'
  ],
  gardening: [
    'גיזום עצים בגינה',
    'התקנת מערכת השקיה',
    'תחזוקת גינה שבועית'
  ]
};

function generateMockOrders(): Job[] {
  const now = new Date();
  const orders: Job[] = [];

  orders.push({
    id: 'order_001',
    clientId: 'client_1',
    status: 'searching',
    userLocation: {
      lat: TEL_AVIV_ADDRESSES[0].lat,
      lng: TEL_AVIV_ADDRESSES[0].lng,
      address: TEL_AVIV_ADDRESSES[0].address,
      type: 'manual',
      floor: '3',
      apartment: '12'
    },
    serviceData: {
      category: 'plumbing',
      subcategory: 'leak',
      complexity: 'standard',
      aiDescription: CATEGORY_DESCRIPTIONS.plumbing[0],
      mediaUrls: [],
      urgencyLevel: 'urgent',
      estimatedDuration: 60
    },
    securityCode: generateSecurityCode(),
    currency: 'ILS',
    createdAt: new Date(now.getTime() - 15 * 60000).toISOString(),
    updatedAt: new Date(now.getTime() - 15 * 60000).toISOString(),
    providerBreadcrumbs: [],
    client: MOCK_CLIENTS[0]
  });

  orders.push({
    id: 'order_002',
    clientId: 'client_2',
    status: 'searching',
    userLocation: {
      lat: TEL_AVIV_ADDRESSES[1].lat,
      lng: TEL_AVIV_ADDRESSES[1].lng,
      address: TEL_AVIV_ADDRESSES[1].address,
      type: 'manual',
      floor: '5',
      apartment: '8'
    },
    serviceData: {
      category: 'electrical',
      subcategory: 'panel',
      complexity: 'complex',
      aiDescription: CATEGORY_DESCRIPTIONS.electrical[0],
      mediaUrls: [],
      urgencyLevel: 'emergency',
      estimatedDuration: 90
    },
    securityCode: generateSecurityCode(),
    currency: 'ILS',
    createdAt: new Date(now.getTime() - 10 * 60000).toISOString(),
    updatedAt: new Date(now.getTime() - 10 * 60000).toISOString(),
    providerBreadcrumbs: [],
    client: MOCK_CLIENTS[1]
  });

  orders.push({
    id: 'order_003',
    clientId: 'client_3',
    providerId: 'pro_3',
    status: 'pending_acceptance',
    userLocation: {
      lat: TEL_AVIV_ADDRESSES[2].lat,
      lng: TEL_AVIV_ADDRESSES[2].lng,
      address: TEL_AVIV_ADDRESSES[2].address,
      type: 'manual',
      floor: '2',
      apartment: '4'
    },
    serviceData: {
      category: 'cleaning',
      subcategory: 'deep_cleaning',
      complexity: 'standard',
      aiDescription: CATEGORY_DESCRIPTIONS.cleaning[0],
      mediaUrls: [],
      urgencyLevel: 'normal',
      estimatedDuration: 180
    },
    securityCode: generateSecurityCode(),
    priceEstimate: 350,
    currency: 'ILS',
    createdAt: new Date(now.getTime() - 45 * 60000).toISOString(),
    updatedAt: new Date(now.getTime() - 30 * 60000).toISOString(),
    providerBreadcrumbs: [],
    client: MOCK_CLIENTS[2],
    provider: MOCK_PROVIDERS[2]
  });

  orders.push({
    id: 'order_004',
    clientId: 'client_4',
    providerId: 'pro_4',
    status: 'pending_acceptance',
    userLocation: {
      lat: TEL_AVIV_ADDRESSES[3].lat,
      lng: TEL_AVIV_ADDRESSES[3].lng,
      address: TEL_AVIV_ADDRESSES[3].address,
      type: 'manual',
      floor: '8',
      apartment: '25'
    },
    serviceData: {
      category: 'ac',
      subcategory: 'repair',
      complexity: 'complex',
      aiDescription: CATEGORY_DESCRIPTIONS.ac[0],
      mediaUrls: [],
      urgencyLevel: 'urgent',
      estimatedDuration: 120
    },
    securityCode: generateSecurityCode(),
    priceEstimate: 450,
    currency: 'ILS',
    createdAt: new Date(now.getTime() - 60 * 60000).toISOString(),
    updatedAt: new Date(now.getTime() - 40 * 60000).toISOString(),
    providerBreadcrumbs: [],
    client: MOCK_CLIENTS[3],
    provider: MOCK_PROVIDERS[3]
  });

  orders.push({
    id: 'order_005',
    clientId: 'client_1',
    providerId: 'pro_1',
    status: 'accepted',
    userLocation: {
      lat: TEL_AVIV_ADDRESSES[4].lat,
      lng: TEL_AVIV_ADDRESSES[4].lng,
      address: TEL_AVIV_ADDRESSES[4].address,
      type: 'manual',
      floor: '1',
      apartment: '2'
    },
    serviceData: {
      category: 'plumbing',
      subcategory: 'clog',
      complexity: 'standard',
      aiDescription: CATEGORY_DESCRIPTIONS.plumbing[1],
      mediaUrls: [],
      urgencyLevel: 'normal',
      estimatedDuration: 45
    },
    securityCode: generateSecurityCode(),
    priceEstimate: 280,
    currency: 'ILS',
    createdAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
    updatedAt: new Date(now.getTime() - 90 * 60000).toISOString(),
    acceptedAt: new Date(now.getTime() - 90 * 60000).toISOString(),
    providerBreadcrumbs: [],
    client: MOCK_CLIENTS[0],
    provider: MOCK_PROVIDERS[0]
  });

  orders.push({
    id: 'order_006',
    clientId: 'client_2',
    providerId: 'pro_2',
    status: 'en_route',
    userLocation: {
      lat: TEL_AVIV_ADDRESSES[5].lat,
      lng: TEL_AVIV_ADDRESSES[5].lng,
      address: TEL_AVIV_ADDRESSES[5].address,
      type: 'manual',
      floor: '4',
      apartment: '16'
    },
    serviceData: {
      category: 'electrical',
      subcategory: 'lighting',
      complexity: 'standard',
      aiDescription: CATEGORY_DESCRIPTIONS.electrical[1],
      mediaUrls: [],
      urgencyLevel: 'normal',
      estimatedDuration: 120
    },
    securityCode: generateSecurityCode(),
    priceEstimate: 520,
    currency: 'ILS',
    createdAt: new Date(now.getTime() - 3 * 3600000).toISOString(),
    updatedAt: new Date(now.getTime() - 20 * 60000).toISOString(),
    acceptedAt: new Date(now.getTime() - 2.5 * 3600000).toISOString(),
    providerBreadcrumbs: [
      { lat: 32.0800, lng: 34.7800, timestamp: new Date(now.getTime() - 15 * 60000).toISOString() },
      { lat: 32.0820, lng: 34.7810, timestamp: new Date(now.getTime() - 10 * 60000).toISOString() },
      { lat: 32.0835, lng: 34.7818, timestamp: new Date(now.getTime() - 5 * 60000).toISOString() }
    ],
    estimatedArrival: new Date(now.getTime() + 10 * 60000).toISOString(),
    distanceToClient: 1.2,
    client: MOCK_CLIENTS[1],
    provider: {
      ...MOCK_PROVIDERS[1],
      currentLocation: {
        lat: 32.0835,
        lng: 34.7818,
        accuracy: 10,
        timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
        heading: 45,
        speed: 30
      }
    }
  });

  orders.push({
    id: 'order_007',
    clientId: 'client_3',
    providerId: 'pro_1',
    status: 'in_progress',
    userLocation: {
      lat: TEL_AVIV_ADDRESSES[6].lat,
      lng: TEL_AVIV_ADDRESSES[6].lng,
      address: TEL_AVIV_ADDRESSES[6].address,
      type: 'manual',
      floor: '6',
      apartment: '22'
    },
    serviceData: {
      category: 'plumbing',
      subcategory: 'installation',
      complexity: 'standard',
      aiDescription: CATEGORY_DESCRIPTIONS.plumbing[2],
      mediaUrls: [],
      urgencyLevel: 'normal',
      estimatedDuration: 60
    },
    securityCode: generateSecurityCode(),
    priceEstimate: 320,
    currency: 'ILS',
    createdAt: new Date(now.getTime() - 4 * 3600000).toISOString(),
    updatedAt: new Date(now.getTime() - 30 * 60000).toISOString(),
    acceptedAt: new Date(now.getTime() - 3.5 * 3600000).toISOString(),
    startedAt: new Date(now.getTime() - 45 * 60000).toISOString(),
    arrivedAt: new Date(now.getTime() - 50 * 60000).toISOString(),
    providerBreadcrumbs: [],
    client: MOCK_CLIENTS[2],
    provider: MOCK_PROVIDERS[0]
  });

  orders.push({
    id: 'order_008',
    clientId: 'client_4',
    providerId: 'pro_2',
    status: 'completed',
    userLocation: {
      lat: TEL_AVIV_ADDRESSES[7].lat,
      lng: TEL_AVIV_ADDRESSES[7].lng,
      address: TEL_AVIV_ADDRESSES[7].address,
      type: 'manual',
      floor: '2',
      apartment: '5'
    },
    serviceData: {
      category: 'electrical',
      subcategory: 'outlet',
      complexity: 'standard',
      aiDescription: CATEGORY_DESCRIPTIONS.electrical[2],
      mediaUrls: [],
      urgencyLevel: 'normal',
      estimatedDuration: 90
    },
    securityCode: generateSecurityCode(),
    priceEstimate: 400,
    finalPrice: 380,
    currency: 'ILS',
    createdAt: new Date(now.getTime() - 24 * 3600000).toISOString(),
    updatedAt: new Date(now.getTime() - 20 * 3600000).toISOString(),
    acceptedAt: new Date(now.getTime() - 23 * 3600000).toISOString(),
    startedAt: new Date(now.getTime() - 22 * 3600000).toISOString(),
    arrivedAt: new Date(now.getTime() - 22.5 * 3600000).toISOString(),
    completedAt: new Date(now.getTime() - 20 * 3600000).toISOString(),
    providerBreadcrumbs: [],
    client: MOCK_CLIENTS[3],
    provider: MOCK_PROVIDERS[1]
  });

  return orders;
}

function generateMockOffers(): JobOffer[] {
  const now = new Date();
  
  return [
    {
      id: 'offer_001',
      jobId: 'order_003',
      providerId: 'pro_3',
      price: 350,
      estimatedArrival: 30,
      message: 'יכול להגיע תוך חצי שעה עם כל הציוד הנדרש',
      status: 'pending',
      createdAt: new Date(now.getTime() - 35 * 60000).toISOString(),
      expiresAt: new Date(now.getTime() + 25 * 60000).toISOString(),
      provider: MOCK_PROVIDERS[2]
    },
    {
      id: 'offer_002',
      jobId: 'order_003',
      providerId: 'pro_1',
      price: 380,
      estimatedArrival: 45,
      message: 'ניסיון של 15 שנה בניקיון מקצועי',
      status: 'pending',
      createdAt: new Date(now.getTime() - 32 * 60000).toISOString(),
      expiresAt: new Date(now.getTime() + 28 * 60000).toISOString(),
      provider: MOCK_PROVIDERS[0]
    },
    {
      id: 'offer_003',
      jobId: 'order_004',
      providerId: 'pro_4',
      price: 450,
      estimatedArrival: 20,
      message: 'מומחה במזגנים של כל היצרנים',
      status: 'pending',
      createdAt: new Date(now.getTime() - 45 * 60000).toISOString(),
      expiresAt: new Date(now.getTime() + 15 * 60000).toISOString(),
      provider: MOCK_PROVIDERS[3]
    },
    {
      id: 'offer_004',
      jobId: 'order_004',
      providerId: 'pro_2',
      price: 480,
      estimatedArrival: 35,
      message: 'גם יכול לבדוק את המערכת החשמלית',
      status: 'pending',
      createdAt: new Date(now.getTime() - 42 * 60000).toISOString(),
      expiresAt: new Date(now.getTime() + 18 * 60000).toISOString(),
      provider: MOCK_PROVIDERS[1]
    }
  ];
}

function loadFromStorage(): { orders: Job[]; offers: JobOffer[] } {
  try {
    const ordersData = sessionStorage.getItem(STORAGE_KEY);
    const offersData = sessionStorage.getItem(OFFERS_STORAGE_KEY);
    
    if (ordersData && offersData) {
      return {
        orders: JSON.parse(ordersData),
        offers: JSON.parse(offersData)
      };
    }
  } catch (e) {
    console.warn('Failed to load order data from storage:', e);
  }
  
  const mockOrders = generateMockOrders();
  const mockOffers = generateMockOffers();
  
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(mockOrders));
    sessionStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(mockOffers));
  } catch (e) {
    console.warn('Failed to save initial mock data:', e);
  }
  
  return { orders: mockOrders, offers: mockOffers };
}

function saveToStorage(orders: Job[], offers: JobOffer[]): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    sessionStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(offers));
  } catch (e) {
    console.warn('Failed to save order data to storage:', e);
  }
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Job[]>([]);
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const subscribersRef = useRef<Set<() => void>>(new Set());

  useEffect(() => {
    const { orders: loadedOrders, offers: loadedOffers } = loadFromStorage();
    setOrders(loadedOrders);
    setOffers(loadedOffers);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveToStorage(orders, offers);
      subscribersRef.current.forEach(callback => callback());
    }
  }, [orders, offers, isLoading]);

  const notifySubscribers = useCallback(() => {
    subscribersRef.current.forEach(callback => callback());
  }, []);

  const getClientOrders = useCallback((clientId: string): Job[] => {
    return orders.filter(order => order.clientId === clientId);
  }, [orders]);

  const getProviderOrders = useCallback((providerId: string): Job[] => {
    return orders.filter(order => order.providerId === providerId);
  }, [orders]);

  const getAvailableRequests = useCallback((providerId: string, category?: string): Job[] => {
    return orders.filter(order => {
      const isSearching = order.status === 'searching';
      const notAssignedToMe = order.providerId !== providerId;
      const matchesCategory = !category || order.serviceData.category === category;
      return isSearching && notAssignedToMe && matchesCategory;
    });
  }, [orders]);

  const getMatchedRequests = useCallback((providerId: string): JobMatchResult[] => {
    const provider = MOCK_PROVIDERS.find(p => p.id === providerId);
    if (!provider) {
      return [];
    }

    const availableOrders = orders.filter(order => 
      order.status === 'searching' && order.providerId !== providerId
    );

    const results: JobMatchResult[] = [];

    for (const order of availableOrders) {
      const requirement = extractRequirementsFromJob(order);
      const { score, matchedCapabilities, reasons } = calculateMatchScore(
        requirement,
        provider.capabilities
      );

      if (score > 0 || canHandleRequest(requirement, provider.capabilities)) {
        results.push({
          job: order,
          matchScore: Math.max(score, 20), // Minimum score if category matches
          matchedCapabilities,
          matchReasons: reasons.length > 0 ? reasons : ['מתאים לקטגוריה']
        });
      }
    }

    return results.sort((a, b) => b.matchScore - a.matchScore);
  }, [orders]);

  const getProvider = useCallback((providerId: string): ExtendedProviderInfo | undefined => {
    return MOCK_PROVIDERS.find(p => p.id === providerId);
  }, []);

  const getAdminOrders = useCallback((): Job[] => {
    return [...orders].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [orders]);

  const createOrder = useCallback(async (booking: BookingData, clientId: string): Promise<Job> => {
    const now = new Date().toISOString();
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const mockClient = MOCK_CLIENTS.find(c => c.id === clientId) || {
      id: clientId,
      name: 'משתמש חדש',
      phone: '050-000-0000',
      rating: 5.0,
      totalBookings: 0
    };

    // Map urgency values to urgencyLevel
    const getUrgencyLevel = (urgency?: 'immediate' | 'planned'): 'normal' | 'urgent' | 'emergency' => {
      if (urgency === 'immediate') return 'urgent';
      return 'normal';
    };

    // Map complexity to estimated duration
    const getEstimatedDuration = (complexity?: 'standard' | 'complex' | 'critical'): number => {
      switch (complexity) {
        case 'critical': return 180;
        case 'complex': return 120;
        default: return 60;
      }
    };

    const newOrder: Job = {
      id: orderId,
      clientId,
      status: 'searching',
      userLocation: {
        lat: booking.coordinates?.lat || 32.0853,
        lng: booking.coordinates?.lng || 34.7818,
        address: booking.address,
        type: booking.isAutoDetected ? 'current' : 'manual'
      },
      serviceData: {
        category: booking.selectedCategory || 'general',
        subcategory: booking.subProblem,
        complexity: booking.complexity || 'standard',
        aiDescription: booking.additionalDetails || 'בקשת שירות חדשה',
        mediaUrls: booking.mediaUrls || [],
        urgencyLevel: getUrgencyLevel(booking.urgency),
        estimatedDuration: getEstimatedDuration(booking.complexity)
      },
      securityCode: generateSecurityCode(),
      currency: 'ILS',
      createdAt: now,
      updatedAt: now,
      scheduledFor: booking.bookingType === 'scheduled' 
        ? `${booking.scheduledDate}T${booking.scheduledTime}:00` 
        : undefined,
      providerBreadcrumbs: [],
      client: mockClient
    };

    setOrders(prev => [...prev, newOrder]);
    notifySubscribers();
    
    return newOrder;
  }, [notifySubscribers]);

  const submitBid = useCallback(async (
    orderId: string, 
    providerId: string, 
    price: number, 
    message?: string
  ): Promise<JobOffer> => {
    const now = new Date();
    const offerId = `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const provider = MOCK_PROVIDERS.find(p => p.id === providerId) || {
      id: providerId,
      name: 'בעל מקצוע',
      phone: '050-000-0000',
      rating: 4.5,
      completedJobs: 0,
      category: 'general',
      isVerified: false
    };

    const newOffer: JobOffer = {
      id: offerId,
      jobId: orderId,
      providerId,
      price,
      estimatedArrival: 30,
      message,
      status: 'pending',
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 60 * 60000).toISOString(),
      provider
    };

    setOffers(prev => [...prev, newOffer]);
    
    setOrders(prev => prev.map(order => {
      if (order.id === orderId && order.status === 'searching') {
        return {
          ...order,
          status: 'pending_acceptance' as JobStatus,
          updatedAt: now.toISOString()
        };
      }
      return order;
    }));

    notifySubscribers();
    return newOffer;
  }, [notifySubscribers]);

  const acceptBid = useCallback(async (orderId: string, offerId: string): Promise<boolean> => {
    const offer = offers.find(o => o.id === offerId && o.jobId === orderId);
    if (!offer) return false;

    const now = new Date().toISOString();

    setOffers(prev => prev.map(o => {
      if (o.id === offerId) {
        return { ...o, status: 'accepted' as const };
      }
      if (o.jobId === orderId && o.id !== offerId) {
        return { ...o, status: 'declined' as const };
      }
      return o;
    }));

    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status: 'accepted' as JobStatus,
          providerId: offer.providerId,
          priceEstimate: offer.price,
          acceptedAt: now,
          updatedAt: now,
          provider: offer.provider
        };
      }
      return order;
    }));

    notifySubscribers();
    return true;
  }, [offers, notifySubscribers]);

  const updateOrderStatus = useCallback(async (
    orderId: string, 
    status: JobStatus, 
    actor: string
  ): Promise<Job> => {
    const now = new Date().toISOString();
    let updatedOrder: Job | null = null;

    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updates: Partial<Job> = {
          status,
          updatedAt: now
        };

        switch (status) {
          case 'accepted':
            updates.acceptedAt = now;
            break;
          case 'arrived':
            updates.arrivedAt = now;
            break;
          case 'in_progress':
            updates.startedAt = now;
            break;
          case 'completed':
            updates.completedAt = now;
            break;
          case 'cancelled':
            updates.cancelledAt = now;
            updates.cancelledBy = actor as 'client' | 'provider' | 'admin' | 'system';
            break;
        }

        updatedOrder = { ...order, ...updates };
        return updatedOrder;
      }
      return order;
    }));

    notifySubscribers();
    
    if (!updatedOrder) {
      throw new Error(`Order ${orderId} not found`);
    }
    
    return updatedOrder;
  }, [notifySubscribers]);

  const cancelOrder = useCallback(async (
    orderId: string, 
    reason: string, 
    actor: string
  ): Promise<boolean> => {
    const now = new Date().toISOString();

    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status: 'cancelled' as JobStatus,
          cancelledAt: now,
          cancelledBy: actor as 'client' | 'provider' | 'admin' | 'system',
          cancellationReason: reason,
          updatedAt: now
        };
      }
      return order;
    }));

    setOffers(prev => prev.map(offer => {
      if (offer.jobId === orderId && offer.status === 'pending') {
        return { ...offer, status: 'expired' as const };
      }
      return offer;
    }));

    notifySubscribers();
    return true;
  }, [notifySubscribers]);

  const getOrderOffers = useCallback((orderId: string): JobOffer[] => {
    return offers.filter(offer => offer.jobId === orderId);
  }, [offers]);

  const subscribe = useCallback((callback: () => void): () => void => {
    subscribersRef.current.add(callback);
    return () => {
      subscribersRef.current.delete(callback);
    };
  }, []);

  const value: OrderStoreValue = {
    orders,
    providers: MOCK_PROVIDERS,
    getClientOrders,
    getProviderOrders,
    getAvailableRequests,
    getMatchedRequests,
    getAdminOrders,
    getProvider,
    createOrder,
    submitBid,
    acceptBid,
    updateOrderStatus,
    cancelOrder,
    getOrderOffers,
    subscribe,
    isLoading
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrderStore(): OrderStoreValue {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrderStore must be used within an OrderProvider');
  }
  return context;
}

export function useClientOrders(clientId: string): Job[] {
  const { getClientOrders } = useOrderStore();
  return getClientOrders(clientId);
}

export function useProviderOrders(providerId: string): Job[] {
  const { getProviderOrders } = useOrderStore();
  return getProviderOrders(providerId);
}

export function useAvailableRequests(providerId: string, category?: string): Job[] {
  const { getAvailableRequests } = useOrderStore();
  return getAvailableRequests(providerId, category);
}

export function useMatchedRequests(providerId: string): JobMatchResult[] {
  const { getMatchedRequests } = useOrderStore();
  return getMatchedRequests(providerId);
}

export function useProvider(providerId: string): ExtendedProviderInfo | undefined {
  const { getProvider } = useOrderStore();
  return getProvider(providerId);
}

export function resetOrderStore(): void {
  sessionStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(OFFERS_STORAGE_KEY);
}

// Re-export matching service for convenience
export { 
  extractRequirementsFromJob, 
  calculateMatchScore, 
  canHandleRequest,
  matchProfessionals,
  CATEGORY_LABELS,
  CAPABILITY_LABELS 
} from '../services/CapabilityMatchingService';
export type { ProfessionalCapability, ServiceRequirement, MatchResult } from '../services/CapabilityMatchingService';
