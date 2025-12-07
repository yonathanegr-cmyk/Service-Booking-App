import { useState, useMemo, useCallback } from 'react';
import { Map, Marker, Overlay } from 'pigeon-maps';
import {
  ArrowLeft,
  Clock,
  Phone,
  Mail,
  MapPin,
  Star,
  Battery,
  Smartphone,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Camera,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  RefreshCw,
  UserX,
  DollarSign,
  Shield,
  Navigation,
  FileText,
  User,
  Briefcase,
  Image as ImageIcon,
  Terminal,
  Undo2,
  Info,
  SearchX
} from 'lucide-react';
import {
  OrderFullObject,
  TimelineEvent,
  OrderStatus,
  EvidenceItem
} from '../../types/orderDetails';
import { getOrderFullDetails } from '../../hooks/useAdminBookings';
import { useOrderStore } from '../../stores/OrderStore';
import { Job } from '../../types/job';
import { useAdminActions } from '../../hooks/useAdminActions';
import { AdminActionModal } from './modals/AdminActionModal';

function mapJobToOrderFullObject(job: Job): OrderFullObject {
  const statusMap: Record<string, OrderStatus> = {
    searching: 'pending',
    pending_acceptance: 'pending',
    accepted: 'accepted',
    en_route: 'en_route',
    arrived: 'in_progress',
    in_progress: 'in_progress',
    payment_pending: 'payment_pending',
    completed: 'completed',
    cancelled: 'cancelled',
  };
  
  return {
    id: job.id,
    status: statusMap[job.status] || 'pending',
    createdAt: job.createdAt,
    timeline: [
      { id: 't1', timestamp: job.createdAt, type: 'order_created', title: 'הזמנה נוצרה', actor: 'client' },
      ...(job.acceptedAt ? [{ id: 't2', timestamp: job.acceptedAt, type: 'pro_accepted', title: 'בעל מקצוע קיבל את העבודה', actor: 'pro' as const }] : []),
      ...(job.arrivedAt ? [{ id: 't3', timestamp: job.arrivedAt, type: 'gps_arrival', title: 'בעל המקצוע הגיע', actor: 'system' as const }] : []),
      ...(job.startedAt ? [{ id: 't4', timestamp: job.startedAt, type: 'job_started', title: 'העבודה החלה', actor: 'pro' as const }] : []),
      ...(job.completedAt ? [{ id: 't5', timestamp: job.completedAt, type: 'job_completed', title: 'העבודה הושלמה', actor: 'pro' as const }] : []),
    ] as TimelineEvent[],
    client: {
      id: job.clientId,
      name: job.client?.name || 'לקוח',
      phone: job.client?.phone || '',
      email: job.client?.email || '',
      rating: job.client?.rating || 4.5,
      totalBookings: job.client?.totalBookings || 0,
      memberSince: job.createdAt.substring(0, 10),
      address: {
        full: job.userLocation.address,
        lat: job.userLocation.lat,
        lng: job.userLocation.lng,
        floor: job.userLocation.floor,
        apartment: job.userLocation.apartment,
        buildingCode: job.userLocation.buildingCode,
        notes: job.userLocation.notes
      }
    },
    pro: job.provider ? {
      id: job.providerId || '',
      name: job.provider.name,
      phone: job.provider.phone,
      email: job.provider.email || '',
      rating: job.provider.rating,
      completedJobs: job.provider.completedJobs,
      memberSince: '2023-01-01',
      category: job.provider.category,
      isVerified: job.provider.isVerified,
      currentLocation: job.provider.currentLocation ? {
        lat: job.provider.currentLocation.lat,
        lng: job.provider.currentLocation.lng,
        accuracy: job.provider.currentLocation.accuracy,
        timestamp: job.provider.currentLocation.timestamp
      } : undefined,
      breadcrumbs: job.providerBreadcrumbs
    } : undefined,
    finance: {
      totalPrice: job.finalPrice || job.priceEstimate || 0,
      currency: job.currency,
      commissionRate: 15,
      commissionAmount: (job.finalPrice || job.priceEstimate || 0) * 0.15,
      netToPro: (job.finalPrice || job.priceEstimate || 0) * 0.85,
      paymentStatus: job.status === 'completed' ? 'completed' : 'authorized',
    },
    evidence: (job.serviceData.mediaUrls || []).map((url, idx) => ({
      id: `evidence_${idx}`,
      type: 'photo' as const,
      stage: 'before' as const,
      url,
      thumbnailUrl: url,
      uploadedAt: job.createdAt,
      uploadedBy: 'client' as const
    })),
    chatHistory: [],
    location: {
      clientAddress: { lat: job.userLocation.lat, lng: job.userLocation.lng },
      proCurrentLocation: job.provider?.currentLocation ? 
        { lat: job.provider.currentLocation.lat, lng: job.provider.currentLocation.lng } : 
        undefined,
      geofenceRadius: 50,
      proBreadcrumbs: job.providerBreadcrumbs,
      distanceTraveled: job.distanceToClient
    },
    metadata: {
      category: job.serviceData.category,
      subcategory: job.serviceData.subcategory,
      description: job.serviceData.aiDescription,
      urgencyLevel: job.serviceData.urgencyLevel,
      estimatedDuration: job.serviceData.estimatedDuration || 60,
      acceptedAt: job.acceptedAt,
      startedAt: job.startedAt
    }
  };
}

const MOCK_ORDER: OrderFullObject = {
  id: 'ORD-88723-XC90',
  status: 'in_progress',
  createdAt: '2024-11-30T09:45:00Z',
  timeline: [
    { id: 't1', timestamp: '2024-11-30T09:45:00Z', type: 'order_created', title: 'הזמנה נוצרה', actor: 'client' },
    { id: 't2', timestamp: '2024-11-30T09:46:30Z', type: 'offer_sent', title: 'הצעה נשלחה ל-3 בעלי מקצוע', actor: 'system' },
    { id: 't3', timestamp: '2024-11-30T09:48:15Z', type: 'pro_accepted', title: 'יוסי האינסטלטור קיבל את העבודה', actor: 'pro' },
    { id: 't4', timestamp: '2024-11-30T10:00:00Z', type: 'system_event', title: 'בעל המקצוע יצא לדרך', actor: 'pro', description: 'מרחק משוער: 5.2 ק"מ' },
    { id: 't5', timestamp: '2024-11-30T10:18:42Z', type: 'gps_arrival', title: 'נכנס לאזור הג\'יאופנס', actor: 'system', description: 'רדיוס 50 מטר מהכתובת' },
    { id: 't6', timestamp: '2024-11-30T10:20:00Z', type: 'system_event', title: 'בעל המקצוע הגיע', actor: 'pro' },
    { id: 't7', timestamp: '2024-11-30T10:35:00Z', type: 'photo_uploaded', title: 'תמונת "לפני" הועלתה', actor: 'pro' },
    { id: 't8', timestamp: '2024-11-30T10:36:00Z', type: 'job_started', title: 'העבודה החלה', actor: 'pro' },
    { id: 't9', timestamp: '2024-11-30T10:45:00Z', type: 'chat_message', title: 'הודעת צ\'אט מהלקוח', actor: 'client', description: 'קוד הכניסה לבניין: 1234' },
  ],
  client: {
    id: 'user_client_1',
    name: 'שרה כהן',
    phone: '050-555-1234',
    email: 'sarah.cohen@email.com',
    rating: 4.8,
    totalBookings: 12,
    memberSince: '2023-06-15',
    deviceInfo: {
      model: 'iPhone 14 Pro',
      os: 'iOS 17.2',
      appVersion: '2.4.1',
      batteryLevel: 72,
      lastActive: '2024-11-30T10:50:00Z'
    },
    address: {
      full: 'רחוב דיזנגוף 100, תל אביב',
      lat: 32.0853,
      lng: 34.7818,
      floor: '3',
      apartment: '12',
      buildingCode: '1234',
      notes: 'דלת חומה בסוף המסדרון'
    }
  },
  pro: {
    id: 'user_pro_99',
    name: 'יוסי האינסטלטור',
    phone: '052-999-8888',
    email: 'yossi.plumber@email.com',
    rating: 4.9,
    completedJobs: 234,
    memberSince: '2022-01-10',
    category: 'אינסטלציה',
    isVerified: true,
    deviceInfo: {
      model: 'Samsung Galaxy S23',
      os: 'Android 14',
      appVersion: '2.4.0',
      batteryLevel: 45,
      lastActive: '2024-11-30T10:55:00Z'
    },
    currentLocation: {
      lat: 32.0855,
      lng: 34.7820,
      accuracy: 10,
      timestamp: '2024-11-30T10:55:00Z'
    },
    breadcrumbs: [
      { lat: 32.0800, lng: 34.7750, timestamp: '2024-11-30T10:00:00Z' },
      { lat: 32.0815, lng: 34.7770, timestamp: '2024-11-30T10:05:00Z' },
      { lat: 32.0830, lng: 34.7790, timestamp: '2024-11-30T10:10:00Z' },
      { lat: 32.0845, lng: 34.7805, timestamp: '2024-11-30T10:15:00Z' },
      { lat: 32.0853, lng: 34.7818, timestamp: '2024-11-30T10:18:00Z' },
    ]
  },
  finance: {
    totalPrice: 350,
    currency: 'ILS',
    commissionRate: 15,
    commissionAmount: 52.5,
    netToPro: 297.5,
    tip: 20,
    paymentStatus: 'authorized',
    stripePaymentId: 'pi_3OxYz123abc456def',
  },
  evidence: [
    {
      id: 'ev1',
      type: 'photo',
      stage: 'before',
      url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400',
      thumbnailUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=150',
      uploadedAt: '2024-11-30T10:35:00Z',
      uploadedBy: 'pro',
      exifData: {
        capturedAt: '2024-11-30T10:34:55Z',
        deviceModel: 'Samsung Galaxy S23',
        gpsLat: 32.0853,
        gpsLng: 34.7818
      }
    },
    {
      id: 'ev2',
      type: 'photo',
      stage: 'before',
      url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=400',
      thumbnailUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=150',
      uploadedAt: '2024-11-30T10:35:30Z',
      uploadedBy: 'pro',
      exifData: {
        capturedAt: '2024-11-30T10:35:25Z',
        deviceModel: 'Samsung Galaxy S23',
        gpsLat: 32.0853,
        gpsLng: 34.7818
      }
    }
  ],
  chatHistory: [
    { id: 'c1', senderId: 'user_client_1', senderRole: 'client', senderName: 'שרה כהן', content: 'שלום, מתי תוכל להגיע?', timestamp: '2024-11-30T09:50:00Z', isRead: true, isDeleted: false },
    { id: 'c2', senderId: 'user_pro_99', senderRole: 'pro', senderName: 'יוסי האינסטלטור', content: 'אהיה אצלך בעוד כ-20 דקות', timestamp: '2024-11-30T09:52:00Z', isRead: true, isDeleted: false },
    { id: 'c3', senderId: 'user_client_1', senderRole: 'client', senderName: 'שרה כהן', content: 'מעולה, קוד הכניסה לבניין: 1234', timestamp: '2024-11-30T10:45:00Z', isRead: true, isDeleted: false },
    { id: 'c4', senderId: 'user_pro_99', senderRole: 'pro', senderName: 'יוסי האינסטלטור', content: 'תודה, אני כבר בדרך למעלה', timestamp: '2024-11-30T10:46:00Z', isRead: true, isDeleted: false },
  ],
  location: {
    clientAddress: { lat: 32.0853, lng: 34.7818 },
    proCurrentLocation: { lat: 32.0855, lng: 34.7820 },
    geofenceRadius: 50,
    proBreadcrumbs: [
      { lat: 32.0800, lng: 34.7750, timestamp: '2024-11-30T10:00:00Z' },
      { lat: 32.0815, lng: 34.7770, timestamp: '2024-11-30T10:05:00Z' },
      { lat: 32.0830, lng: 34.7790, timestamp: '2024-11-30T10:10:00Z' },
      { lat: 32.0845, lng: 34.7805, timestamp: '2024-11-30T10:15:00Z' },
      { lat: 32.0853, lng: 34.7818, timestamp: '2024-11-30T10:18:00Z' },
    ],
    distanceTraveled: 5.2
  },
  metadata: {
    category: 'אינסטלציה',
    subcategory: 'תיקון נזילות',
    description: 'תיקון נזילה בכיור המטבח והחלפת סיפון',
    urgencyLevel: 'urgent',
    estimatedDuration: 60,
    dispatchRadius: 10,
    offersCount: 3,
    acceptedAt: '2024-11-30T09:48:15Z',
    startedAt: '2024-11-30T10:36:00Z'
  }
};

interface OrderDetailsTowerProps {
  orderId?: string;
  onBack?: () => void;
}

function metersToPixels(meters: number, lat: number, zoom: number): number {
  const earthCircumference = 40075016.686;
  const metersPerPixel = (earthCircumference * Math.cos(lat * Math.PI / 180)) / Math.pow(2, zoom + 8);
  return meters / metersPerPixel;
}

function latLngToPixelOffset(
  lat: number, 
  lng: number, 
  centerLat: number, 
  centerLng: number, 
  zoom: number
): { x: number; y: number } {
  const scale = Math.pow(2, zoom);
  const worldCoordX = (lng + 180) / 360 * 256 * scale;
  const worldCoordY = (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * 256 * scale;
  
  const centerWorldX = (centerLng + 180) / 360 * 256 * scale;
  const centerWorldY = (1 - Math.log(Math.tan(centerLat * Math.PI / 180) + 1 / Math.cos(centerLat * Math.PI / 180)) / Math.PI) / 2 * 256 * scale;
  
  return {
    x: worldCoordX - centerWorldX,
    y: worldCoordY - centerWorldY
  };
}

export function OrderDetailsTower({ orderId, onBack }: OrderDetailsTowerProps) {
  const adminActions = useAdminActions();
  const { currentAction, isModalOpen, handleAdminAction, closeModal } = adminActions;
  const { orders, getAdminOrders, cancelOrder, updateOrderStatus } = useOrderStore();

  const order = useMemo<OrderFullObject | null>(() => {
    if (!orderId) {
      return MOCK_ORDER;
    }
    
    const allOrders = getAdminOrders();
    const storeOrder = allOrders.find(o => o.id === orderId);
    
    if (storeOrder) {
      return mapJobToOrderFullObject(storeOrder);
    }
    
    const legacyOrder = getOrderFullDetails(orderId);
    if (legacyOrder) {
      return legacyOrder;
    }
    
    return null;
  }, [orderId, orders]);

  if (!order) {
    return (
      <div className="h-screen w-full bg-gray-50 flex flex-col items-center justify-center" dir="rtl">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <SearchX className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">הזמנה לא נמצאה</h2>
          <p className="text-gray-500 mb-6">
            ההזמנה עם מספר <span className="font-mono font-bold text-gray-700">{orderId}</span> לא קיימת במערכת.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            חזרה לרשימת ההזמנות
          </button>
        </div>
      </div>
    );
  }

  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
    service: true,
    client: true,
    pro: true,
    finance: false,
    evidence: true
  });
  const [activeBottomTab, setActiveBottomTab] = useState<'chat' | 'logs'>('chat');
  const [expandedTimeline, setExpandedTimeline] = useState<Record<string, boolean>>({});
  const [mapZoom, setMapZoom] = useState(16);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);

  const toggleCard = (cardId: string) => {
    setExpandedCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const toggleTimelineItem = (itemId: string) => {
    setExpandedTimeline(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleMapBoundsChange = useCallback(({ zoom }: { center: [number, number]; zoom: number }) => {
    setMapZoom(zoom);
  }, []);

  const geofenceRadiusPixels = useMemo(() => {
    return metersToPixels(
      order.location.geofenceRadius,
      order.location.clientAddress.lat,
      mapZoom
    );
  }, [order.location.geofenceRadius, order.location.clientAddress.lat, mapZoom]);

  const breadcrumbPath = useMemo(() => {
    const breadcrumbs = order.location.proBreadcrumbs;
    if (breadcrumbs.length < 2) return '';
    
    const points = breadcrumbs.map(point => {
      const offset = latLngToPixelOffset(
        point.lat,
        point.lng,
        order.location.clientAddress.lat,
        order.location.clientAddress.lng,
        mapZoom
      );
      return `${offset.x},${offset.y}`;
    });
    
    return `M ${points.join(' L ')}`;
  }, [order.location.proBreadcrumbs, order.location.clientAddress, mapZoom]);

  const elapsedMinutes = useMemo(() => {
    if (!order.metadata.startedAt) return 0;
    const start = new Date(order.metadata.startedAt).getTime();
    const now = Date.now();
    return Math.floor((now - start) / 60000);
  }, [order.metadata.startedAt]);

  const getStatusBadge = (status: OrderStatus) => {
    const config: Record<OrderStatus, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'ממתין' },
      accepted: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'אושר' },
      en_route: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'בדרך' },
      arrived: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'הגיע' },
      in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'בתהליך' },
      completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'הושלם' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'בוטל' },
      dispute: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'מחלוקת' }
    };
    const { bg, text, label } = config[status];
    return <span className={`${bg} ${text} px-3 py-1 rounded-full text-sm font-bold`}>{label}</span>;
  };

  const getTimelineIcon = (type: TimelineEvent['type']) => {
    const iconConfig: Record<TimelineEvent['type'], { icon: React.ReactNode; bg: string }> = {
      order_created: { icon: <FileText className="w-3.5 h-3.5" />, bg: 'bg-blue-500' },
      offer_sent: { icon: <RefreshCw className="w-3.5 h-3.5" />, bg: 'bg-purple-500' },
      pro_accepted: { icon: <CheckCircle className="w-3.5 h-3.5" />, bg: 'bg-green-500' },
      pro_declined: { icon: <XCircle className="w-3.5 h-3.5" />, bg: 'bg-red-500' },
      gps_arrival: { icon: <Navigation className="w-3.5 h-3.5" />, bg: 'bg-cyan-500' },
      job_started: { icon: <Play className="w-3.5 h-3.5" />, bg: 'bg-indigo-500' },
      photo_uploaded: { icon: <Camera className="w-3.5 h-3.5" />, bg: 'bg-pink-500' },
      job_completed: { icon: <CheckCircle className="w-3.5 h-3.5" />, bg: 'bg-green-600' },
      payment_processed: { icon: <CreditCard className="w-3.5 h-3.5" />, bg: 'bg-emerald-500' },
      payment_refunded: { icon: <DollarSign className="w-3.5 h-3.5" />, bg: 'bg-orange-500' },
      dispute_opened: { icon: <AlertTriangle className="w-3.5 h-3.5" />, bg: 'bg-red-600' },
      admin_action: { icon: <Shield className="w-3.5 h-3.5" />, bg: 'bg-gray-600' },
      chat_message: { icon: <MessageSquare className="w-3.5 h-3.5" />, bg: 'bg-blue-400' },
      system_event: { icon: <Terminal className="w-3.5 h-3.5" />, bg: 'bg-gray-500' }
    };
    return iconConfig[type];
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('he-IL', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getPaymentStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'ממתין',
      authorized: 'מאושר',
      captured: 'נגבה',
      refunded: 'הוחזר במלואו',
      partial_refund: 'הוחזר חלקית',
      failed: 'נכשל'
    };
    return labels[status] || status;
  };

  const getPaymentStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      authorized: 'bg-blue-100 text-blue-700',
      captured: 'bg-green-100 text-green-700',
      refunded: 'bg-red-100 text-red-700',
      partial_refund: 'bg-orange-100 text-orange-700',
      failed: 'bg-red-100 text-red-700'
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="h-screen w-full bg-gray-50 flex flex-col overflow-hidden" dir="rtl">
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-gray-500">#{order.id}</span>
            {getStatusBadge(order.status)}
            <span className="text-sm text-gray-500">
              <Clock className="w-4 h-4 inline ml-1" />
              {formatDate(order.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleAdminAction('FULL_REFUND', order.id, 'order', {
              totalPrice: order.finance.totalPrice,
              commissionAmount: order.finance.commissionAmount,
              netToPro: order.finance.netToPro,
              currency: order.finance.currency
            })}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors flex items-center gap-2"
          >
            <DollarSign className="w-4 h-4" />
            החזר מלא
          </button>
          <button 
            onClick={() => handleAdminAction('PARTIAL_REFUND', order.id, 'order', {
              totalPrice: order.finance.totalPrice,
              commissionAmount: order.finance.commissionAmount,
              netToPro: order.finance.netToPro,
              currency: order.finance.currency
            })}
            className="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg text-sm font-bold hover:bg-orange-100 transition-colors flex items-center gap-2"
          >
            <DollarSign className="w-4 h-4" />
            החזר חלקי
          </button>
          <button 
            onClick={() => handleAdminAction('REASSIGN_PRO', order.id, 'order', {
              currentProName: order.pro?.name
            })}
            className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-bold hover:bg-purple-100 transition-colors flex items-center gap-2"
          >
            <UserX className="w-4 h-4" />
            החלף בעל מקצוע
          </button>
          <button 
            onClick={() => handleAdminAction('CANCEL_MISSION', order.id, 'order', {
              proName: order.pro?.name,
              totalPrice: order.finance.totalPrice
            })}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            בטל ללא חיוב
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-[25%_50%_25%] overflow-hidden">
        <div className="bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              ציר זמן
            </h2>
          </div>
          <div className="p-4">
            {order.timeline.map((event, index) => {
              const { icon, bg } = getTimelineIcon(event.type);
              const isExpanded = expandedTimeline[event.id];
              const isLast = index === order.timeline.length - 1;

              return (
                <div key={event.id} className="flex gap-3 relative">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full ${bg} text-white flex items-center justify-center z-10 flex-shrink-0`}>
                      {icon}
                    </div>
                    {!isLast && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
                  </div>
                  <div className={`flex-1 pb-4 ${!isLast ? '' : ''}`}>
                    <button
                      onClick={() => event.description && toggleTimelineItem(event.id)}
                      className="w-full text-right"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{event.title}</p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">{formatTime(event.timestamp)}</p>
                        </div>
                        {event.description && (
                          <span className="text-gray-400">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </span>
                        )}
                      </div>
                    </button>
                    {isExpanded && event.description && (
                      <div className="mt-2 p-2 bg-gray-50 rounded-lg text-xs text-gray-600">
                        {event.description}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative overflow-hidden">
          <Map
            defaultCenter={[order.location.clientAddress.lat, order.location.clientAddress.lng]}
            defaultZoom={16}
            width={window.innerWidth * 0.5}
            height={window.innerHeight - 62 - 192}
            onBoundsChanged={handleMapBoundsChange}
          >
            <Overlay
              anchor={[order.location.clientAddress.lat, order.location.clientAddress.lng]}
              offset={[0, 0]}
            >
              <svg
                width={geofenceRadiusPixels * 2 + 4}
                height={geofenceRadiusPixels * 2 + 4}
                style={{
                  transform: `translate(-${geofenceRadiusPixels + 2}px, -${geofenceRadiusPixels + 2}px)`,
                  pointerEvents: 'none'
                }}
              >
                <circle
                  cx={geofenceRadiusPixels + 2}
                  cy={geofenceRadiusPixels + 2}
                  r={geofenceRadiusPixels}
                  fill="rgba(59, 130, 246, 0.15)"
                  stroke="rgba(59, 130, 246, 0.6)"
                  strokeWidth="2"
                  strokeDasharray="8,4"
                />
              </svg>
            </Overlay>

            {order.location.proBreadcrumbs.length >= 2 && (
              <Overlay
                anchor={[order.location.clientAddress.lat, order.location.clientAddress.lng]}
                offset={[0, 0]}
              >
                <svg
                  style={{
                    position: 'absolute',
                    top: '-500px',
                    left: '-500px',
                    width: '1000px',
                    height: '1000px',
                    pointerEvents: 'none',
                    overflow: 'visible'
                  }}
                >
                  <defs>
                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="1" />
                    </linearGradient>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill="#10B981"
                      />
                    </marker>
                  </defs>
                  <g transform="translate(500, 500)">
                    <path
                      d={breadcrumbPath}
                      fill="none"
                      stroke="url(#routeGradient)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      markerEnd="url(#arrowhead)"
                    />
                  </g>
                </svg>
              </Overlay>
            )}

            {order.location.proBreadcrumbs.map((point, i) => (
              <Overlay key={i} anchor={[point.lat, point.lng]} offset={[0, 0]}>
                <div 
                  className="rounded-full bg-green-500 border-2 border-white shadow-md"
                  style={{
                    width: i === order.location.proBreadcrumbs.length - 1 ? '12px' : '8px',
                    height: i === order.location.proBreadcrumbs.length - 1 ? '12px' : '8px',
                    opacity: 0.4 + (i / order.location.proBreadcrumbs.length) * 0.6,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              </Overlay>
            ))}

            <Marker
              anchor={[order.location.clientAddress.lat, order.location.clientAddress.lng]}
              color="#3B82F6"
            />

            {order.location.proCurrentLocation && (
              <Marker
                anchor={[order.location.proCurrentLocation.lat, order.location.proCurrentLocation.lng]}
                color="#10B981"
              />
            )}
          </Map>

          <div className="absolute top-4 right-4 bg-white rounded-xl shadow-lg border border-gray-200 p-3 z-10">
            <div className="flex items-center gap-3">
              {getStatusBadge(order.status)}
              {order.metadata.startedAt && (
                <span className="text-sm text-gray-600">
                  <Clock className="w-4 h-4 inline ml-1" />
                  {elapsedMinutes} דק' חלפו
                </span>
              )}
            </div>
          </div>

          <div className="absolute top-4 left-4 bg-white rounded-xl shadow-lg border border-gray-200 p-2 z-10">
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-dashed bg-blue-500/20" />
                <span className="text-gray-600">ג'יאופנס ({order.location.geofenceRadius}m)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-gradient-to-r from-green-300 to-green-500 rounded" />
                <span className="text-gray-600">מסלול הגעה</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 right-4 left-4 flex justify-between z-10">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm font-medium">נקודה A - לקוח</span>
            </div>
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm font-medium">נקודה B - בעל מקצוע</span>
            </div>
          </div>
        </div>

        <div className="bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-3 space-y-3">
            {/* Service Details Section */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleCard('service')}
                className="w-full p-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span className="font-bold text-sm text-gray-900">פרטי שירות</span>
                </div>
                {expandedCards.service ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedCards.service && (
                <div className="p-3 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded-lg text-xs font-medium">
                      {order.metadata.category}
                    </span>
                    {order.metadata.subcategory && (
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs font-medium">
                        {order.metadata.subcategory === 'leak' ? 'נזילה' : 
                         order.metadata.subcategory === 'clog' ? 'סתימה' : 
                         order.metadata.subcategory === 'outlet' ? 'שקע חשמלי' :
                         order.metadata.subcategory === 'switch' ? 'מפסק' :
                         order.metadata.subcategory === 'faucet' ? 'ברז' :
                         order.metadata.subcategory === 'toilet' ? 'אסלה' :
                         order.metadata.subcategory === 'ac' ? 'מזגן' :
                         order.metadata.subcategory === 'deep' ? 'ניקיון יסודי' :
                         order.metadata.subcategory === 'regular' ? 'ניקיון רגיל' :
                         order.metadata.subcategory}
                      </span>
                    )}
                    {order.metadata.urgencyLevel === 'urgent' && (
                      <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-lg text-xs font-medium">
                        דחוף
                      </span>
                    )}
                    {order.metadata.urgencyLevel === 'emergency' && (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded-lg text-xs font-medium">
                        חירום
                      </span>
                    )}
                  </div>
                  {order.metadata.description && (
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs font-medium text-gray-700 mb-1">תיאור</p>
                      <p className="text-sm text-gray-600">{order.metadata.description}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      משך משוער: {order.metadata.estimatedDuration} דק'
                    </span>
                  </div>
                  {/* Photos preview */}
                  {order.evidence.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-700 flex items-center gap-1">
                        <Camera className="w-3 h-3" /> תמונות מהלקוח
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {order.evidence.filter(e => e.uploadedBy === 'client').slice(0, 4).map((item) => (
                          <div key={item.id} className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                            <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {order.evidence.filter(e => e.uploadedBy === 'client').length > 4 && (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                            +{order.evidence.filter(e => e.uploadedBy === 'client').length - 4}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleCard('client')}
                className="w-full p-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-sm text-gray-900">לקוח</span>
                </div>
                {expandedCards.client ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedCards.client && (
                <div className="p-3 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                      {order.client.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{order.client.name}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        {order.client.rating} • {order.client.totalBookings} הזמנות
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span dir="ltr">{order.client.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span dir="ltr" className="text-xs">{order.client.email}</span>
                    </div>
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <p>{order.client.address.full}</p>
                        {order.client.address.floor && (
                          <p className="text-xs text-gray-500">קומה {order.client.address.floor}, דירה {order.client.address.apartment}</p>
                        )}
                        {order.client.address.buildingCode && (
                          <p className="text-xs text-gray-500">קוד כניסה: {order.client.address.buildingCode}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 space-y-1">
                    <p className="text-xs font-medium text-gray-700 flex items-center gap-1">
                      <Smartphone className="w-3 h-3" /> מכשיר
                    </p>
                    <p className="text-xs text-gray-600">{order.client.deviceInfo.model} • {order.client.deviceInfo.os}</p>
                    <p className="text-xs text-gray-600">גרסת אפליקציה: {order.client.deviceInfo.appVersion}</p>
                    <div className="flex items-center gap-1 text-xs">
                      <Battery className={`w-3 h-3 ${order.client.deviceInfo.batteryLevel && order.client.deviceInfo.batteryLevel < 20 ? 'text-red-500' : 'text-green-500'}`} />
                      <span>{order.client.deviceInfo.batteryLevel}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {order.pro && (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleCard('pro')}
                  className="w-full p-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-green-600" />
                    <span className="font-bold text-sm text-gray-900">בעל מקצוע</span>
                    {order.pro.isVerified && <Shield className="w-3 h-3 text-blue-500" />}
                  </div>
                  {expandedCards.pro ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedCards.pro && (
                  <div className="p-3 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                        {order.pro.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{order.pro.name}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          {order.pro.rating} • {order.pro.completedJobs} עבודות
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span dir="ltr">{order.pro.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span dir="ltr" className="text-xs">{order.pro.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                          {order.pro.category}
                        </span>
                      </div>
                    </div>
                    {order.pro.currentLocation && (
                      <div className="bg-gray-50 rounded-lg p-2 space-y-1">
                        <p className="text-xs font-medium text-gray-700 flex items-center gap-1">
                          <Navigation className="w-3 h-3" /> מיקום נוכחי
                        </p>
                        <p className="text-xs text-gray-600">
                          דיוק: {order.pro.currentLocation.accuracy}m
                        </p>
                        <p className="text-xs text-gray-500">
                          עדכון אחרון: {formatTime(order.pro.currentLocation.timestamp)}
                        </p>
                      </div>
                    )}
                    <div className="bg-gray-50 rounded-lg p-2 space-y-1">
                      <p className="text-xs font-medium text-gray-700 flex items-center gap-1">
                        <Smartphone className="w-3 h-3" /> מכשיר
                      </p>
                      <p className="text-xs text-gray-600">{order.pro.deviceInfo.model} • {order.pro.deviceInfo.os}</p>
                      <p className="text-xs text-gray-600">גרסת אפליקציה: {order.pro.deviceInfo.appVersion}</p>
                      <div className="flex items-center gap-1 text-xs">
                        <Battery className={`w-3 h-3 ${order.pro.deviceInfo.batteryLevel && order.pro.deviceInfo.batteryLevel < 20 ? 'text-red-500' : 'text-green-500'}`} />
                        <span>{order.pro.deviceInfo.batteryLevel}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleCard('finance')}
                className="w-full p-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-sm text-gray-900">פיננסי</span>
                  {(order.finance.refundAmount || order.finance.paymentStatus === 'refunded' || order.finance.paymentStatus === 'partial_refund') && (
                    <span className="bg-orange-100 text-orange-600 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Undo2 className="w-3 h-3" />
                      החזר
                    </span>
                  )}
                </div>
                {expandedCards.finance ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedCards.finance && (
                <div className="p-3 space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">סה"כ</span>
                      <span className="font-bold">₪{order.finance.totalPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">עמלה ({order.finance.commissionRate}%)</span>
                      <span className="text-red-600">-₪{order.finance.commissionAmount}</span>
                    </div>
                    {order.finance.tip && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">טיפ</span>
                        <span className="text-green-600">+₪{order.finance.tip}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-2 flex justify-between text-sm">
                      <span className="font-bold text-gray-900">נטו לבעל מקצוע</span>
                      <span className="font-bold text-green-600">₪{order.finance.netToPro + (order.finance.tip || 0)}</span>
                    </div>
                  </div>

                  {(order.finance.refundAmount || order.finance.paymentStatus === 'refunded' || order.finance.paymentStatus === 'partial_refund') && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2 text-orange-700 font-medium text-sm">
                        <Undo2 className="w-4 h-4" />
                        פרטי החזר
                      </div>
                      {order.finance.refundAmount && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">סכום החזר</span>
                          <span className="font-bold text-orange-600">₪{order.finance.refundAmount}</span>
                        </div>
                      )}
                      {order.finance.refundReason && (
                        <div className="text-sm">
                          <span className="text-gray-600">סיבת החזר: </span>
                          <span className="text-gray-800">{order.finance.refundReason}</span>
                        </div>
                      )}
                      {order.finance.refundedAt && (
                        <div className="text-xs text-gray-500">
                          תאריך החזר: {formatDateTime(order.finance.refundedAt)}
                        </div>
                      )}
                      {order.finance.stripeRefundId && (
                        <div className="text-xs text-gray-500 font-mono break-all">
                          Refund ID: {order.finance.stripeRefundId}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs font-medium text-gray-700 mb-1">סטטוס תשלום</p>
                    <span className={`text-xs px-2 py-0.5 rounded ${getPaymentStatusStyle(order.finance.paymentStatus)}`}>
                      {getPaymentStatusLabel(order.finance.paymentStatus)}
                    </span>
                    {order.finance.paidAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        שולם ב: {formatDateTime(order.finance.paidAt)}
                      </p>
                    )}
                    {order.finance.stripePaymentId && (
                      <p className="text-xs text-gray-500 mt-2 font-mono break-all">
                        Stripe: {order.finance.stripePaymentId}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleCard('evidence')}
                className="w-full p-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-pink-600" />
                  <span className="font-bold text-sm text-gray-900">ראיות</span>
                  <span className="bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded">{order.evidence.length}</span>
                </div>
                {expandedCards.evidence ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedCards.evidence && (
                <div className="p-3 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {order.evidence.map((item) => (
                      <div 
                        key={item.id} 
                        className="relative group cursor-pointer"
                        onClick={() => setSelectedEvidence(selectedEvidence?.id === item.id ? null : item)}
                      >
                        <img
                          src={item.thumbnailUrl}
                          alt={`Evidence ${item.stage}`}
                          className={`w-full h-20 object-cover rounded-lg transition-all ${
                            selectedEvidence?.id === item.id ? 'ring-2 ring-pink-500' : ''
                          }`}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
                        <span className={`absolute top-1 right-1 text-[10px] px-1.5 py-0.5 rounded ${
                          item.stage === 'before' ? 'bg-blue-500 text-white' :
                          item.stage === 'after' ? 'bg-green-500 text-white' :
                          'bg-purple-500 text-white'
                        }`}>
                          {item.stage === 'before' ? 'לפני' : item.stage === 'after' ? 'אחרי' : 'במהלך'}
                        </span>
                        {item.exifData && (
                          <div className="absolute bottom-1 left-1">
                            <Info className="w-3.5 h-3.5 text-white drop-shadow-md" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {selectedEvidence && selectedEvidence.exifData && (
                    <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2 text-pink-700 font-medium text-sm">
                        <Camera className="w-4 h-4" />
                        נתוני EXIF
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">זמן צילום:</span>
                          <span className="text-gray-800 font-mono">
                            {formatDateTime(selectedEvidence.exifData.capturedAt)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">מכשיר:</span>
                          <span className="text-gray-800">{selectedEvidence.exifData.deviceModel}</span>
                        </div>
                        {selectedEvidence.exifData.gpsLat && selectedEvidence.exifData.gpsLng && (
                          <div className="flex justify-between items-start">
                            <span className="text-gray-600">GPS:</span>
                            <span className="text-gray-800 font-mono text-[10px] text-left">
                              {selectedEvidence.exifData.gpsLat.toFixed(6)},<br />
                              {selectedEvidence.exifData.gpsLng.toFixed(6)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">הועלה:</span>
                          <span className="text-gray-800">
                            {formatDateTime(selectedEvidence.uploadedAt)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">ע"י:</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                            selectedEvidence.uploadedBy === 'pro' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {selectedEvidence.uploadedBy === 'pro' ? 'בעל מקצוע' : 'לקוח'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="h-48 bg-white border-t border-gray-200 flex flex-col flex-shrink-0">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveBottomTab('chat')}
            className={`flex-1 py-2 px-4 text-sm font-medium flex items-center justify-center gap-2 ${
              activeBottomTab === 'chat' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            הקופסה השחורה - צ'אט
          </button>
          <button
            onClick={() => setActiveBottomTab('logs')}
            className={`flex-1 py-2 px-4 text-sm font-medium flex items-center justify-center gap-2 ${
              activeBottomTab === 'logs' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Terminal className="w-4 h-4" />
            לוגים מערכת
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {activeBottomTab === 'chat' ? (
            <div className="space-y-3">
              {order.chatHistory.map((msg) => (
                <div key={msg.id} className={`flex gap-2 ${msg.senderRole === 'pro' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                    msg.senderRole === 'client' ? 'bg-blue-500' :
                    msg.senderRole === 'pro' ? 'bg-green-500' : 'bg-gray-500'
                  }`}>
                    {msg.senderName.charAt(0)}
                  </div>
                  <div className={`max-w-[70%] ${msg.senderRole === 'pro' ? 'text-left' : 'text-right'}`}>
                    <div className={`px-3 py-2 rounded-xl text-sm ${
                      msg.senderRole === 'client' ? 'bg-gray-100 text-gray-800' :
                      msg.senderRole === 'pro' ? 'bg-green-50 text-gray-800' : 'bg-blue-50 text-gray-800'
                    }`}>
                      {msg.content}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5 px-1">
                      {msg.senderName} • {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 font-mono text-xs">
              {order.timeline.map((event) => (
                <div key={event.id} className="flex gap-2 text-gray-600">
                  <span className="text-gray-400">[{formatTime(event.timestamp)}]</span>
                  <span className={`${
                    event.type.includes('error') ? 'text-red-600' :
                    event.type.includes('completed') || event.type.includes('accepted') ? 'text-green-600' :
                    'text-gray-700'
                  }`}>
                    {event.type.toUpperCase().replace(/_/g, ' ')}
                  </span>
                  <span className="text-gray-500">- {event.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AdminActionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        currentAction={currentAction}
        adminActions={adminActions}
      />
    </div>
  );
}
