import { OrderAggregate } from "../types/order";

export const MOCK_FULL_ORDER: OrderAggregate = {
  id: "ord_88723-uuid-v4",
  shortId: "#BE-8823",
  serviceType: "PLUMBING",
  description: "תיקון נזילה בכיור המטבח והחלפת סיפון",
  
  client: {
    id: "user_client_1",
    fullName: "שרה כהן",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    phone: "050-555-1234",
    rating: 4.8,
    role: "CLIENT"
  },
  
  pro: {
    id: "user_pro_99",
    fullName: "יוסי האינסטלטור",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yossi",
    phone: "052-999-8888",
    rating: 4.9,
    role: "PRO"
  },
  
  currentStatus: "IN_PROGRESS", // Simulation: Le pro est en train de travailler
  
  location: {
    lat: 32.0853,
    lng: 34.7818,
    address: "רחוב דיזנגוף 100, תל אביב",
    timestamp: "2024-11-30T10:30:00Z"
  },
  
  scheduledFor: "2024-11-30T10:00:00Z",
  
  evidence: {
    before: [
      {
        id: "ev_1",
        url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400",
        type: "IMAGE",
        phase: "BEFORE_WORK",
        uploadedAt: "2024-11-30T10:35:00Z",
        gpsStamp: {
            lat: 32.0853,
            lng: 34.7818,
            address: "Dizengoff St 100",
            timestamp: "2024-11-30T10:35:00Z"
        }
      }
    ],
    after: [] // Vide car IN_PROGRESS
  },
  
  timeline: [
    {
      status: "CREATED",
      timestamp: "2024-11-30T09:45:00Z",
      triggeredBy: "user_client_1"
    },
    {
      status: "MATCHED",
      timestamp: "2024-11-30T09:46:00Z",
      triggeredBy: "system"
    },
    {
      status: "ACCEPTED",
      timestamp: "2024-11-30T09:48:00Z",
      triggeredBy: "user_pro_99"
    },
    {
      status: "ON_ROUTE",
      timestamp: "2024-11-30T10:00:00Z",
      triggeredBy: "user_pro_99",
      metadata: { estimatedArrival: "15 min" }
    },
    {
      status: "ON_SITE",
      timestamp: "2024-11-30T10:20:00Z",
      triggeredBy: "user_pro_99",
      metadata: { gpsAccuracy: "10m" }
    },
    {
      status: "IN_PROGRESS",
      timestamp: "2024-11-30T10:35:00Z",
      triggeredBy: "user_pro_99"
    }
  ],
  
  createdAt: "2024-11-30T09:45:00Z",
  updatedAt: "2024-11-30T10:35:00Z",
  
  canTransitionTo: ["COMPLETED", "DISPUTED"] // Calculé par le backend
};