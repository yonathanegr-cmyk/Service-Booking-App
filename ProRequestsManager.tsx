import { useState, useMemo } from 'react';
import { Clock, MapPin, CheckCircle, X, Brain, AlertTriangle, Package, Eye, Send, TrendingUp, Users, Info, Settings, Edit3, Car, MessageCircle, Star, Calendar, Image as ImageIcon, FileText, Briefcase, Sparkles, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { BidProposalModal } from './BidProposalModal';
import { useOrderStore, JobMatchResult, CAPABILITY_LABELS } from '../stores/OrderStore';
import { Job, JobStatus } from '../types/job';

export type CompetitorBid = {
  id: string;
  price: number;
  timeAgo: string;
  label: string;
};

export type Request = {
  id: string;
  clientName: string;
  clientImage: string;
  service: string;
  status: 'new' | 'pending' | 'accepted' | 'completed';
  urgency: 'immediate' | 'planned';
  address: string;
  distance: number;
  requestedDate: string;
  scheduledTime?: string;
  estimatedDuration: number;
  clientMessage?: string;
  aiAnalysis: {
    summary: string;
    detectedIssues: string[];
    estimatedMaterials: string[];
    recommendations: string[];
    confidenceScore: number;
  };
  hasVideo: boolean;
  videoUrl?: string;
  photos?: string[];
  suggestedPrice: number;
  createdAt: string;
  competitorStats: {
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
    totalBids: number;
  };
  competitorBids?: CompetitorBid[];
  finalPrice?: number;
  matchScore?: number;
  matchedCapabilities?: string[];
  matchReasons?: string[];
};

const CATEGORY_LABELS: Record<string, string> = {
  plumbing: 'אינסטלציה',
  electrical: 'חשמל',
  cleaning: 'ניקיון',
  ac: 'מיזוג אוויר',
  renovation: 'שיפוצים',
  gardening: 'גינון',
  general: 'כללי'
};

export function mapJobToRequest(job: Job, offersCount: number = 0): Request {
  const statusMap: Record<JobStatus, Request['status']> = {
    'searching': 'new',
    'pending_acceptance': 'pending',
    'accepted': 'accepted',
    'en_route': 'accepted',
    'arrived': 'accepted',
    'in_progress': 'accepted',
    'payment_pending': 'accepted',
    'completed': 'completed',
    'cancelled': 'completed'
  };

  const urgencyMap: Record<string, Request['urgency']> = {
    'normal': 'planned',
    'urgent': 'immediate',
    'emergency': 'immediate'
  };

  const basePrice = job.priceEstimate || 150;
  
  return {
    id: job.id,
    clientName: job.client?.name || 'לקוח',
    clientImage: job.client?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Client',
    service: CATEGORY_LABELS[job.serviceData.category] || job.serviceData.category,
    status: statusMap[job.status] || 'new',
    urgency: urgencyMap[job.serviceData.urgencyLevel] || 'planned',
    address: job.userLocation.address,
    distance: job.distanceToClient || Math.random() * 5 + 0.5,
    requestedDate: job.scheduledFor || job.createdAt,
    scheduledTime: job.scheduledFor ? new Date(job.scheduledFor).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) : undefined,
    estimatedDuration: (job.serviceData.estimatedDuration || 60) / 60,
    clientMessage: job.serviceData.aiDescription,
    aiAnalysis: {
      summary: job.serviceData.aiDescription,
      detectedIssues: ['בעיה שזוהתה'],
      estimatedMaterials: ['חומרים נדרשים'],
      recommendations: ['המלצה לטיפול'],
      confidenceScore: 0.85
    },
    hasVideo: job.serviceData.mediaUrls.length > 0,
    videoUrl: job.serviceData.mediaUrls.find(url => url.includes('video')),
    photos: job.serviceData.mediaUrls.filter(url => !url.includes('video')),
    suggestedPrice: basePrice,
    createdAt: job.createdAt,
    competitorStats: {
      minPrice: Math.round(basePrice * 0.8),
      maxPrice: Math.round(basePrice * 1.3),
      avgPrice: basePrice,
      totalBids: offersCount
    },
    finalPrice: job.finalPrice
  };
}

export const mockRequests: Request[] = [
  {
    id: 'REQ_001',
    clientName: '\u05DE\u05E8\u05D9 \u05D3\u05D5\u05D1\u05D5\u05D0\u05D4',
    clientImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    service: '\u05D0\u05D9\u05E0\u05E1\u05D8\u05DC\u05E6\u05D9\u05D4',
    status: 'new',
    urgency: 'immediate',
    address: '\u05E8\u05D7\u05D5\u05D1 \u05D4\u05E9\u05DC\u05D5\u05DD 12, \u05EA\u05DC \u05D0\u05D1\u05D9\u05D1',
    distance: 1.2,
    requestedDate: '2025-11-27 14:00',
    estimatedDuration: 2,
    clientMessage: '\u05D9\u05E9 \u05E0\u05D6\u05D9\u05DC\u05D4 \u05D7\u05D6\u05E7\u05D4 \u05DE\u05EA\u05D7\u05EA \u05DC\u05DB\u05D9\u05D5\u05E8 \u05D1\u05DE\u05D8\u05D1\u05D7 \u05DB\u05D1\u05E8 \u05D9\u05D5\u05DE\u05D9\u05D9\u05DD. \u05D4\u05DE\u05D9\u05DD \u05DE\u05EA\u05E4\u05D6\u05E8\u05D9\u05DD \u05E2\u05DC \u05D4\u05E8\u05E6\u05E4\u05D4 \u05D5\u05D0\u05E0\u05D9 \u05DE\u05D5\u05D3\u05D0\u05D2\u05EA \u05DE\u05E0\u05D6\u05E7 \u05DC\u05E2\u05E5. \u05E6\u05E8\u05D9\u05DA \u05EA\u05D9\u05E7\u05D5\u05DF \u05D3\u05D7\u05D5\u05E3 \u05D1\u05D1\u05E7\u05E9\u05D4!',
    hasVideo: true,
    videoUrl: '/mock-video.mp4',
    photos: [
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400',
      'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400',
    ],
    suggestedPrice: 150,
    createdAt: '2025-11-27 10:30',
    aiAnalysis: {
      summary: '\u05E0\u05D6\u05D9\u05DC\u05EA \u05DE\u05D9\u05DD \u05E4\u05E2\u05D9\u05DC\u05D4 \u05DE\u05EA\u05D7\u05EA \u05DC\u05DB\u05D9\u05D5\u05E8 \u05D4\u05DE\u05D8\u05D1\u05D7. \u05E6\u05E0\u05E8\u05EA PVC \u05D2\u05DC\u05D5\u05D9\u05D4. \u05E8\u05D8\u05D9\u05D1\u05D5\u05EA \u05E0\u05E8\u05D0\u05D9\u05EA \u05E2\u05DC \u05E8\u05E6\u05E4\u05EA \u05D4\u05E2\u05E5.',
      detectedIssues: [
        '\u05E0\u05D6\u05D9\u05DC\u05D4 \u05E4\u05E2\u05D9\u05DC\u05D4 \u05D1\u05E1\u05D9\u05E4\u05D5\u05DF',
        '\u05E7\u05D5\u05E8\u05D5\u05D6\u05D9\u05D4 \u05D1\u05D7\u05D9\u05D1\u05D5\u05E8\u05D9\u05DD',
        '\u05D4\u05E6\u05D8\u05D1\u05E8\u05D5\u05EA \u05DE\u05D9\u05DD (\u05DB-2 \u05DC\u05D9\u05D8\u05E8)',
        '\u05E0\u05D6\u05E7 \u05DC\u05E8\u05E6\u05E4\u05EA \u05D4\u05E2\u05E5',
      ],
      estimatedMaterials: [
        '\u05E1\u05D9\u05E4\u05D5\u05DF PVC \u05D7\u05D3\u05E9 (40 \u05DE"\u05DE)',
        '\u05D2\u05D5\u05DE\u05D9\u05D5\u05EA \u05D0\u05D9\u05D8\u05D5\u05DD',
        '\u05D8\u05E4\u05DC\u05D5\u05DF',
        '\u05E1\u05D9\u05DC\u05D9\u05E7\u05D5\u05DF \u05E1\u05E0\u05D9\u05D8\u05E8\u05D9',
      ],
      recommendations: [
        '\u05EA\u05D9\u05E7\u05D5\u05DF \u05D3\u05D7\u05D5\u05E3 \u05DE\u05D5\u05DE\u05DC\u05E5',
        '\u05D1\u05D3\u05D9\u05E7\u05EA \u05E6\u05E0\u05E8\u05EA \u05E1\u05DE\u05D5\u05DB\u05D4',
        '\u05DE\u05E9\u05DA \u05E2\u05D1\u05D5\u05D3\u05D4 \u05DE\u05E9\u05D5\u05E2\u05E8: 1-2 \u05E9\u05E2\u05D5\u05EA',
      ],
      confidenceScore: 0.92,
    },
    competitorStats: {
      minPrice: 130,
      maxPrice: 220,
      avgPrice: 175,
      totalBids: 3
    },
    competitorBids: [
      { id: 'bid-1', price: 130, timeAgo: '\u05DC\u05E4\u05E0\u05D9 5 \u05D3\u05E7\u05D5\u05EA', label: '\u05D4\u05E6\u05E2\u05D4 A' },
      { id: 'bid-2', price: 175, timeAgo: '\u05DC\u05E4\u05E0\u05D9 15 \u05D3\u05E7\u05D5\u05EA', label: '\u05D4\u05E6\u05E2\u05D4 B' },
      { id: 'bid-3', price: 220, timeAgo: '\u05DC\u05E4\u05E0\u05D9 \u05E9\u05E2\u05D4', label: '\u05D4\u05E6\u05E2\u05D4 C' },
    ]
  },
  {
    id: 'REQ_002',
    clientName: '\u05D9\u05D5\u05E1\u05D9 \u05DC\u05D5\u05D9',
    clientImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    service: '\u05D0\u05D9\u05E0\u05E1\u05D8\u05DC\u05E6\u05D9\u05D4',
    status: 'pending',
    urgency: 'planned',
    address: '\u05E9\u05D3\u05E8\u05D5\u05EA \u05E8\u05D5\u05D8\u05E9\u05D9\u05DC\u05D3 45, \u05EA\u05DC \u05D0\u05D1\u05D9\u05D1',
    distance: 2.8,
    requestedDate: '2025-11-28',
    scheduledTime: '09:00',
    estimatedDuration: 1,
    clientMessage: '\u05D4\u05D0\u05E1\u05DC\u05D4 \u05E1\u05EA\u05D5\u05DE\u05D4 \u05DB\u05D1\u05E8 \u05DE\u05D0\u05EA\u05DE\u05D5\u05DC, \u05D0\u05E4\u05E9\u05E8 \u05DC\u05EA\u05E7\u05DF \u05DE\u05D7\u05E8 \u05D1\u05D1\u05D5\u05E7\u05E8? \u05D0\u05E0\u05D9 \u05D2\u05DE\u05D9\u05E9 \u05E2\u05DD \u05D4\u05E9\u05E2\u05D4 \u05D0\u05DD \u05E6\u05E8\u05D9\u05DA.',
    hasVideo: false,
    photos: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400',
      'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400',
    ],
    suggestedPrice: 80,
    createdAt: '2025-11-26 15:20',
    aiAnalysis: {
      summary: '\u05D0\u05E1\u05DC\u05D4 \u05E1\u05EA\u05D5\u05DE\u05D4. \u05DE\u05E4\u05DC\u05E1 \u05DE\u05D9\u05DD \u05D2\u05D1\u05D5\u05D4. \u05DC\u05DC\u05D0 \u05D2\u05DC\u05D9\u05E9\u05D4 \u05E4\u05E2\u05D9\u05DC\u05D4.',
      detectedIssues: [
        '\u05E1\u05EA\u05D9\u05DE\u05D4 \u05D1\u05D0\u05E1\u05DC\u05D4',
        '\u05DE\u05E4\u05DC\u05E1 \u05DE\u05D9\u05DD \u05D2\u05D1\u05D5\u05D4',
      ],
      estimatedMaterials: [
        '\u05E4\u05EA\u05D9\u05D7\u05D4 \u05DE\u05DB\u05E0\u05D9\u05EA (\u05E1\u05E4\u05D9\u05E8\u05DC\u05D4)',
      ],
      recommendations: [
        '\u05E4\u05EA\u05D9\u05D7\u05EA \u05E1\u05EA\u05D9\u05DE\u05D4 \u05E8\u05D2\u05D9\u05DC\u05D4',
        '\u05DE\u05E9\u05DA \u05E2\u05D1\u05D5\u05D3\u05D4: 30-60 \u05D3\u05E7\u05D5\u05EA',
      ],
      confidenceScore: 0.65,
    },
    competitorStats: {
      minPrice: 70,
      maxPrice: 120,
      avgPrice: 95,
      totalBids: 2
    }
  },
  {
    id: 'REQ_003',
    clientName: '\u05E9\u05E8\u05D4 \u05DE\u05D6\u05E8\u05D7\u05D9',
    clientImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    service: '\u05D7\u05E9\u05DE\u05DC',
    status: 'accepted',
    urgency: 'planned',
    address: '\u05E8\u05D7\u05D5\u05D1 \u05D0\u05DC\u05E0\u05D1\u05D9 78, \u05EA\u05DC \u05D0\u05D1\u05D9\u05D1',
    distance: 1.5,
    requestedDate: '2025-12-02 10:00',
    estimatedDuration: 1.5,
    hasVideo: true,
    videoUrl: '/mock-video.mp4',
    photos: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=400',
    ],
    suggestedPrice: 280,
    createdAt: '2025-12-01 14:00',
    aiAnalysis: {
      summary: '\u05D4\u05EA\u05E7\u05E0\u05EA \u05E9\u05E7\u05E2\u05D9\u05DD \u05D7\u05D3\u05E9\u05D9\u05DD \u05D1\u05E1\u05DC\u05D5\u05DF. \u05D3\u05E8\u05D5\u05E9 \u05E7\u05D9\u05D3\u05D5\u05D7 \u05D5\u05D4\u05E2\u05D1\u05E8\u05EA \u05DB\u05D1\u05DC\u05D9\u05DD.',
      detectedIssues: [
        '\u05D7\u05D9\u05D5\u05D5\u05D8 \u05D9\u05E9\u05DF',
        '\u05E6\u05D5\u05E8\u05DA \u05D1\u05E9\u05E7\u05E2\u05D9\u05DD \u05E0\u05D5\u05E1\u05E4\u05D9\u05DD',
      ],
      estimatedMaterials: [
        '\u05E9\u05E7\u05E2\u05D9\u05DD \u05DB\u05E4\u05D5\u05DC\u05D9\u05DD (3)',
        '\u05DB\u05D1\u05DC \u05D7\u05E9\u05DE\u05DC',
        '\u05E7\u05D5\u05E4\u05E1\u05D0\u05D5\u05EA \u05D1\u05D9\u05D8\u05D5\u05DF',
      ],
      recommendations: [
        '\u05E2\u05D1\u05D5\u05D3\u05D4 \u05E1\u05D8\u05E0\u05D3\u05E8\u05D8\u05D9\u05EA',
        '\u05DE\u05E9\u05DA \u05E2\u05D1\u05D5\u05D3\u05D4: 1-2 \u05E9\u05E2\u05D5\u05EA',
      ],
      confidenceScore: 0.88,
    },
    competitorStats: {
      minPrice: 200,
      maxPrice: 350,
      avgPrice: 275,
      totalBids: 4
    }
  },
  {
    id: 'REQ_004',
    clientName: '\u05D3\u05D5\u05D3 \u05D0\u05D1\u05E8\u05D4\u05DE\u05D9',
    clientImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    service: '\u05D0\u05D9\u05E0\u05E1\u05D8\u05DC\u05E6\u05D9\u05D4',
    status: 'accepted',
    urgency: 'immediate',
    address: '\u05E8\u05D7\u05D5\u05D1 \u05D4\u05E8\u05E6\u05DC 32, \u05E8\u05DE\u05EA \u05D2\u05DF',
    distance: 3.2,
    requestedDate: '2025-12-02 15:00',
    estimatedDuration: 2,
    hasVideo: false,
    photos: [
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400',
      'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400',
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400',
      'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400',
    ],
    suggestedPrice: 420,
    createdAt: '2025-12-01 09:30',
    aiAnalysis: {
      summary: '\u05D4\u05D7\u05DC\u05E4\u05EA \u05D1\u05E8\u05D6 \u05DE\u05D8\u05D1\u05D7 \u05D5\u05EA\u05D9\u05E7\u05D5\u05DF \u05E6\u05E0\u05E8\u05EA.',
      detectedIssues: [
        '\u05D1\u05E8\u05D6 \u05E4\u05D2\u05D5\u05DD',
        '\u05E0\u05D6\u05D9\u05DC\u05D4 \u05E7\u05DC\u05D4',
      ],
      estimatedMaterials: [
        '\u05D1\u05E8\u05D6 \u05DE\u05D8\u05D1\u05D7 \u05D7\u05D3\u05E9',
        '\u05E6\u05D9\u05E0\u05D5\u05E8\u05D5\u05EA \u05D2\u05DE\u05D9\u05E9\u05D9\u05DD',
        '\u05D8\u05E4\u05DC\u05D5\u05DF',
      ],
      recommendations: [
        '\u05D4\u05D7\u05DC\u05E4\u05D4 \u05DE\u05DC\u05D0\u05D4 \u05E9\u05DC \u05D4\u05D1\u05E8\u05D6',
        '\u05DE\u05E9\u05DA \u05E2\u05D1\u05D5\u05D3\u05D4: 1-2 \u05E9\u05E2\u05D5\u05EA',
      ],
      confidenceScore: 0.75,
    },
    competitorStats: {
      minPrice: 350,
      maxPrice: 500,
      avgPrice: 420,
      totalBids: 2
    }
  },
];

type ProRequestsManagerProps = {
  requests?: Request[];
  onBidSubmit?: (requestId: string, price: number, message: string) => void;
  providerId?: string;
  useStore?: boolean;
};

type MyBid = {
  price: number;
  message?: string;
  isModified?: boolean;
};

const DEFAULT_PROVIDER_ID = 'pro_1';

export function ProRequestsManager({ 
  requests: propRequests, 
  onBidSubmit,
  providerId = DEFAULT_PROVIDER_ID,
  useStore = true
}: ProRequestsManagerProps) {
  const orderStore = useOrderStore();
  const { getAvailableRequests, getProviderOrders, submitBid: storeSubmitBid, getOrderOffers, getMatchedRequests, isLoading } = orderStore;
  
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [myBids, setMyBids] = useState<Map<string, MyBid>>(new Map());
  
  // Photo gallery state
  const [photoGalleryOpen, setPhotoGalleryOpen] = useState(false);
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Photo gallery functions
  const openPhotoGallery = (photos: string[], startIndex: number = 0) => {
    setGalleryPhotos(photos);
    setCurrentPhotoIndex(startIndex);
    setPhotoGalleryOpen(true);
  };

  const closePhotoGallery = () => {
    setPhotoGalleryOpen(false);
    setGalleryPhotos([]);
    setCurrentPhotoIndex(0);
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % galleryPhotos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + galleryPhotos.length) % galleryPhotos.length);
  };

  const requests = useMemo(() => {
    if (!useStore && propRequests) {
      return propRequests;
    }
    
    const matchedJobs = getMatchedRequests(providerId);
    const pendingJobs = getProviderOrders(providerId).filter(
      job => job.status === 'pending_acceptance'
    );
    
    const matchedJobIds = new Set(matchedJobs.map(m => m.job.id));
    const matchMap = new Map(matchedJobs.map(m => [m.job.id, m]));
    
    const pendingNotMatched = pendingJobs.filter(job => !matchedJobIds.has(job.id));
    
    const matchedRequests = matchedJobs.map(match => {
      const offers = getOrderOffers(match.job.id);
      const request = mapJobToRequest(match.job, offers.length);
      return {
        ...request,
        matchScore: match.matchScore,
        matchedCapabilities: match.matchedCapabilities,
        matchReasons: match.matchReasons
      };
    });
    
    const pendingRequests = pendingNotMatched.map(job => {
      const offers = getOrderOffers(job.id);
      return mapJobToRequest(job, offers.length);
    });
    
    return [...matchedRequests, ...pendingRequests];
  }, [useStore, propRequests, getMatchedRequests, getProviderOrders, getOrderOffers, providerId]);

  const handleBidSubmit = async (requestId: string, price: number, message: string) => {
    setMyBids(prev => {
      const updated = new Map(prev);
      const existingBid = prev.get(requestId);
      const isModified = existingBid ? true : false;
      updated.set(requestId, { price, message, isModified });
      return updated;
    });
    
    if (useStore) {
      try {
        await storeSubmitBid(requestId, providerId, price, message);
      } catch (error) {
        console.error('Failed to submit bid:', error);
      }
    }
    
    if (onBidSubmit) {
      onBidSubmit(requestId, price, message);
    }
    setSelectedRequest(null);
  };

  const newRequestsCount = requests.filter(r => r.status === 'new' || r.status === 'pending').length;
  const filteredRequests = requests.filter(r => r.status === 'new' || r.status === 'pending');

  const handleSendBid = () => {
    alert(`\u05D4\u05E6\u05E2\u05D4 \u05E0\u05E9\u05DC\u05D7\u05D4: \u20AA${bidAmount}\n\u05D4\u05D5\u05D3\u05E2\u05D4: ${bidMessage}`);
    setSelectedRequest(null);
    setBidAmount('');
    setBidMessage('');
  };

  const getStatusBadge = (status: Request['status']) => {
    const styles = {
      new: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      accepted: 'bg-blue-100 text-blue-700',
      completed: 'bg-gray-100 text-gray-700',
    };
    const labels = {
      new: '\u05D7\u05D3\u05E9',
      pending: '\u05DE\u05DE\u05EA\u05D9\u05DF',
      accepted: '\u05D4\u05EA\u05E7\u05D1\u05DC',
      completed: '\u05D4\u05D5\u05E9\u05DC\u05DD',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getUrgencyBadge = (urgency: Request['urgency']) => {
    return urgency === 'immediate' ? (
      <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-700 flex items-center gap-1 font-medium">
        <Clock className="w-4 h-4" />
        {"\u05D3\u05D7\u05D5\u05E3"}
      </span>
    ) : (
      <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 font-medium">
        {"\u05DE\u05EA\u05D5\u05DB\u05E0\u05DF"}
      </span>
    );
  };

  const getPricePosition = (price: number, min: number, max: number) => {
    const range = max - min;
    if (range === 0) return 50;
    const pos = ((price - min) / range) * 100;
    return Math.min(Math.max(pos, 0), 100);
  };

  return (
    <div dir="rtl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{"\u05D1\u05E7\u05E9\u05D5\u05EA \u05D7\u05D3\u05E9\u05D5\u05EA"}</h2>
        <p className="text-gray-600">
          {newRequestsCount} {"\u05D1\u05E7\u05E9\u05D5\u05EA \u05D6\u05DE\u05D9\u05E0\u05D5\u05EA"}
        </p>
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="text-gray-400 mb-3">
            <Clock className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-1">{"\u05D0\u05D9\u05DF \u05D1\u05E7\u05E9\u05D5\u05EA \u05D7\u05D3\u05E9\u05D5\u05EA"}</h3>
          <p className="text-gray-500 text-sm">{"\u05D1\u05E7\u05E9\u05D5\u05EA \u05D7\u05D3\u05E9\u05D5\u05EA \u05DE\u05DC\u05E7\u05D5\u05D7\u05D5\u05EA \u05D9\u05D5\u05E4\u05D9\u05E2\u05D5 \u05DB\u05D0\u05DF"}</p>
        </div>
      )}

      <div className="grid gap-6">
        {filteredRequests.map((request) => (
          <div key={request.id} className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all bg-white">
            <div className="p-5 pb-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-xl border border-blue-100">
                  <Settings className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="text-xl font-bold text-blue-700">{"\u20AA"}{request.suggestedPrice}</div>
                    <div className="text-[10px] text-blue-500">{"\u05DE\u05D7\u05D9\u05E8 \u05DE\u05D5\u05DE\u05DC\u05E5"}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-900 text-lg">{request.clientName}</h4>
                      {getStatusBadge(request.status)}
                      {getUrgencyBadge(request.urgency)}
                      {request.matchScore && request.matchScore >= 70 && (
                        <span className="px-3 py-1 rounded-full text-sm bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 flex items-center gap-1 font-medium border border-emerald-200">
                          <Target className="w-3.5 h-3.5" />
                          {request.matchScore}% התאמה
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{request.service}</p>
                  </div>
                  <div className="relative">
                    <ImageWithFallback
                      src={request.clientImage}
                      alt={request.clientName}
                      className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                    />
                    {request.matchScore && request.matchScore >= 80 && (
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {request.matchedCapabilities && request.matchedCapabilities.length > 0 && (
              <div className="px-5 pt-3">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">התאמה לכישורים שלך:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {request.matchedCapabilities.slice(0, 4).map((cap, idx) => (
                      <span key={idx} className="bg-white text-emerald-700 text-xs px-2 py-1 rounded-md border border-emerald-200 font-medium">
                        {CAPABILITY_LABELS[cap] || cap}
                      </span>
                    ))}
                    {request.matchedCapabilities.length > 4 && (
                      <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-md font-medium">
                        +{request.matchedCapabilities.length - 4} נוספים
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="px-5 pt-3">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                      <span>{"\u05D4\u05D1\u05E2\u05D9\u05D4 \u05E9\u05DC \u05D4\u05DC\u05E7\u05D5\u05D7"}</span>
                      {request.urgency === 'immediate' && (
                        <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                          {"\u05D3\u05D7\u05D5\u05E3"}
                        </span>
                      )}
                    </h5>
                    <p className="text-sm text-gray-700 leading-relaxed mb-2">
                      <strong>{request.service}</strong> • {request.clientMessage || '\u05D4\u05DC\u05E7\u05D5\u05D7 \u05DE\u05D1\u05E7\u05E9 \u05E9\u05D9\u05E8\u05D5\u05EA \u05DE\u05E7\u05E6\u05D5\u05E2\u05D9'}
                    </p>
                    {request.aiAnalysis && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="bg-white text-orange-700 text-xs px-2 py-1 rounded-md border border-orange-200 font-medium">
                          {request.aiAnalysis.detectedIssues?.length || 0} {"\u05D1\u05E2\u05D9\u05D5\u05EA \u05D6\u05D5\u05D4\u05D5"}
                        </span>
                        <span className="bg-white text-blue-700 text-xs px-2 py-1 rounded-md border border-blue-200 font-medium">
                          {request.aiAnalysis.estimatedMaterials?.length || 0} {"\u05D7\u05D5\u05DE\u05E8\u05D9\u05DD \u05E0\u05D3\u05E8\u05E9\u05D9\u05DD"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3">
              <div className="flex items-center justify-between gap-2 p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-500">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500">{"\u05DE\u05E8\u05D7\u05E7"}</div>
                    <div className="font-medium text-sm">{request.distance} {"\u05E7\"\u05DE"}</div>
                  </div>
                </div>
                <div className="h-8 w-px bg-gray-200"></div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-green-500">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500">{"\u05D6\u05DE\u05DF \u05D4\u05D2\u05E2\u05D4"}</div>
                    <div className="font-medium text-sm">{Math.round(request.distance * 3 + 5)} {"\u05D3\u05E7\u05F3"}</div>
                  </div>
                </div>
                <div className="h-8 w-px bg-gray-200"></div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-500">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500">{"\u05DE\u05E9\u05DA \u05E2\u05D1\u05D5\u05D3\u05D4"}</div>
                    <div className="font-medium text-sm">{request.estimatedDuration} {"\u05E9\u05E2\u05D5\u05EA"}</div>
                  </div>
                </div>
                <div className="h-8 w-px bg-gray-200"></div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-purple-500">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500">{"\u05D3\u05D9\u05D5\u05E7 AI"}</div>
                    <div className="font-medium text-sm">{Math.round(request.aiAnalysis.confidenceScore * 100)}%</div>
                  </div>
                </div>
              </div>
            </div>

            {request.urgency === 'planned' && request.scheduledTime && (
              <div className="px-5 pb-3">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs text-blue-600 font-medium">{"\u05DE\u05D5\u05E2\u05D3 \u05DE\u05D1\u05D5\u05E7\u05E9"}</div>
                      <div className="font-bold text-gray-900">
                        {request.requestedDate} {"\u05D1\u05E9\u05E2\u05D4"} {request.scheduledTime}
                      </div>
                    </div>
                  </div>
                  <button className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-white px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors">
                    <Edit3 className="w-4 h-4" />
                    {"\u05D1\u05E7\u05E9 \u05E9\u05D9\u05E0\u05D5\u05D9"}
                  </button>
                </div>
              </div>
            )}

            {request.clientMessage && (
              <div className="px-5 pb-3">
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-amber-700 mb-2 font-medium text-sm">
                    <MessageCircle className="w-4 h-4" />
                    <span>{"\u05D4\u05D5\u05D3\u05E2\u05D4 \u05DE\u05D4\u05DC\u05E7\u05D5\u05D7"}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    "{request.clientMessage}"
                  </p>
                </div>
              </div>
            )}

            <div className="px-5 pb-3">
              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 rounded-xl p-4">
                <div className="flex items-center gap-2 text-teal-700 mb-2 font-medium">
                  <Brain className="w-5 h-5" />
                  <span>{"\u05E0\u05D9\u05EA\u05D5\u05D7 AI \u05D6\u05DE\u05D9\u05DF"}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  {request.aiAnalysis?.summary || request.service}
                </p>
                <div className="flex flex-wrap gap-2">
                  {request.aiAnalysis?.detectedIssues && request.aiAnalysis.detectedIssues.length > 0 && (
                    <span className="bg-white px-3 py-1.5 rounded-lg text-sm font-medium text-orange-700 shadow-sm border border-orange-100 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      {request.aiAnalysis.detectedIssues.length} {"\u05D1\u05E2\u05D9\u05D5\u05EA \u05D6\u05D5\u05D4\u05D5"}
                    </span>
                  )}
                  {request.aiAnalysis?.estimatedMaterials && request.aiAnalysis.estimatedMaterials.length > 0 && (
                    <span className="bg-white px-3 py-1.5 rounded-lg text-sm font-medium text-blue-700 shadow-sm border border-blue-100 flex items-center gap-1.5">
                      <Package className="w-4 h-4" />
                      {request.aiAnalysis.estimatedMaterials.length} {"\u05D7\u05D5\u05DE\u05E8\u05D9\u05DD \u05E0\u05D3\u05E8\u05E9\u05D9\u05DD"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {request.photos && request.photos.length > 0 && (
              <div className="px-5 pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">{"\u05EA\u05DE\u05D5\u05E0\u05D5\u05EA \u05D4\u05D1\u05E2\u05D9\u05D4"}</span>
                </div>
                <div className="flex gap-2">
                  {request.photos.slice(0, 3).map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo}
                        alt={`\u05EA\u05DE\u05D5\u05E0\u05D4 ${index + 1}`}
                        className="w-20 h-20 rounded-lg object-cover border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => openPhotoGallery(request.photos!, index)}
                      />
                    </div>
                  ))}
                  {request.photos.length > 3 && (
                    <div 
                      className="w-20 h-20 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                      onClick={() => openPhotoGallery(request.photos!, 3)}
                    >
                      <div className="text-center">
                        <span className="text-lg font-bold text-gray-600">+{request.photos.length - 3}</span>
                        <div className="text-[10px] text-gray-500">{"\u05E2\u05D5\u05D3"}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {myBids.has(request.id) && (() => {
              const bid = myBids.get(request.id)!;
              const isModified = bid.isModified;
              return (
                <div className="px-5 pb-3">
                  <div className={`${isModified ? 'bg-orange-50 border-2 border-orange-300' : 'bg-green-50 border-2 border-green-300'} rounded-xl p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full ${isModified ? 'bg-orange-100' : 'bg-green-100'} flex items-center justify-center`}>
                          <CheckCircle className={`w-4 h-4 ${isModified ? 'text-orange-600' : 'text-green-600'}`} />
                        </div>
                        <h5 className={`font-bold ${isModified ? 'text-orange-800' : 'text-green-800'}`}>{"\u05D4\u05D4\u05E6\u05E2\u05D4 \u05E9\u05DC\u05DA"}</h5>
                        {isModified && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-700 font-medium">{"\u05E2\u05D5\u05D3\u05DB\u05DF"}</span>
                        )}
                      </div>
                      <div className={`text-2xl font-bold ${isModified ? 'text-orange-700' : 'text-green-700'}`}>
                        {"\u20AA"}{bid.price}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {"\u05D0\u05EA\u05D4 \u05D9\u05DB\u05D5\u05DC \u05DC\u05E2\u05E8\u05D5\u05DA \u05D0\u05EA \u05D4\u05D4\u05E6\u05E2\u05D4 \u05E9\u05DC\u05DA \u05D0\u05D5 \u05DC\u05E9\u05DC\u05D5\u05D7 \u05D4\u05D5\u05D3\u05E2\u05D4 \u05DC\u05DC\u05E7\u05D5\u05D7"}
                    </p>
                    {bid.message && (
                      <div className={`mt-2 p-2 bg-white rounded-lg border ${isModified ? 'border-orange-200' : 'border-green-200'}`}>
                        <p className="text-sm text-gray-700">{bid.message}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {request.competitorStats && request.competitorStats.totalBids > 0 && (
              <div className="px-5 pb-3">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Star className="w-5 h-5 text-green-600 fill-green-600" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-gray-900 mb-1">{"\u05D4\u05D4\u05E6\u05E2\u05D4 \u05D4\u05DE\u05D5\u05D1\u05D9\u05DC\u05D4"}</h5>
                        <div className="flex items-center gap-4 mb-2">
                          <div>
                            <div className="text-2xl font-bold text-green-700">
                              {"\u20AA"}{request.competitorStats.minPrice || request.suggestedPrice}
                            </div>
                            <div className="text-xs text-gray-500">{"\u05D4\u05DE\u05D7\u05D9\u05E8 \u05D4\u05E0\u05DE\u05D5\u05DA \u05D1\u05D9\u05D5\u05EA\u05E8"}</div>
                          </div>
                          <div className="h-8 w-px bg-green-200"></div>
                          <div>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              ))}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">{"\u05DE\u05E7\u05E6\u05D5\u05E2\u05DF \u05DE\u05D3\u05D5\u05E8\u05D2 5.0"}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Users className="w-3.5 h-3.5" />
                          <span>{request.competitorStats.totalBids} {"\u05DE\u05E7\u05E6\u05D5\u05E2\u05E0\u05D9\u05DD \u05DE\u05EA\u05D7\u05E8\u05D9\u05DD"}</span>
                          <span>•</span>
                          <span>
                            {"\u05DE\u05DE\u05D5\u05E6\u05E2"}: {"\u20AA"}{request.competitorStats.minPrice && request.competitorStats.maxPrice 
                              ? Math.round((request.competitorStats.minPrice + request.competitorStats.maxPrice) / 2)
                              : request.suggestedPrice}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="px-5 pb-4">
              <div className="flex items-center justify-between text-sm text-gray-500 py-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{request.competitorStats?.totalBids || 0} {"\u05D4\u05E6\u05E2\u05D5\u05EA \u05E0\u05D5\u05E1\u05E4\u05D5\u05EA \u05D4\u05D5\u05D2\u05E9\u05D5"}</span>
                </div>
                {request.competitorStats && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>{"\u05D8\u05D5\u05D5\u05D7 \u05DE\u05D7\u05D9\u05E8\u05D9\u05DD"}: {"\u20AA"}{request.competitorStats.minPrice} - {"\u20AA"}{request.competitorStats.maxPrice}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 pb-6 pt-2">
              {myBids.has(request.id) ? (() => {
                const bid = myBids.get(request.id)!;
                const isModified = bid.isModified;
                return (
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setBidAmount(bid.price.toString());
                    }}
                    className={`w-full ${isModified 
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-200' 
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-green-200'
                    } text-white py-3.5 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2`}
                  >
                    <Send className="w-5 h-5" />
                    {"\u05E9\u05E0\u05D4 \u05D4\u05E6\u05E2\u05D4"}
                  </button>
                );
              })() : (
                <button
                  onClick={() => {
                    setSelectedRequest(request);
                    setBidAmount(request.suggestedPrice.toString());
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  {"\u05D4\u05D2\u05E9 \u05D4\u05E6\u05E2\u05D4"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bid Proposal Modal */}
      <BidProposalModal
        request={selectedRequest}
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onSubmitBid={(price, message) => {
          if (selectedRequest) {
            handleBidSubmit(selectedRequest.id, price, message);
          }
        }}
        existingBid={selectedRequest ? myBids.get(selectedRequest.id) : undefined}
      />

      {/* Photo Gallery Modal */}
      {photoGalleryOpen && galleryPhotos.length > 0 && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
          {/* Close button */}
          <button 
            onClick={closePhotoGallery}
            className="absolute top-4 left-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>
          
          {/* Photo counter */}
          <div className="absolute top-4 right-4 bg-white/10 px-4 py-2 rounded-full text-white text-sm font-medium">
            {currentPhotoIndex + 1} / {galleryPhotos.length}
          </div>
          
          {/* Navigation arrows */}
          {galleryPhotos.length > 1 && (
            <>
              <button 
                onClick={prevPhoto}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <button 
                onClick={nextPhoto}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </>
          )}
          
          {/* Main image */}
          <div className="max-w-4xl max-h-[80vh] px-16">
            <img 
              src={galleryPhotos[currentPhotoIndex]} 
              alt={`תמונה ${currentPhotoIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
          
          {/* Thumbnail strip */}
          {galleryPhotos.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-xl">
              {galleryPhotos.map((photo, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentPhotoIndex(idx)}
                  className={`w-14 h-14 rounded-lg overflow-hidden transition-all ${
                    idx === currentPhotoIndex 
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-black/50' 
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
