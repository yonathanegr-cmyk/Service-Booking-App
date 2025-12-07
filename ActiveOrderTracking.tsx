import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, MapPin, Calendar, Clock, User, Shield, Phone, MessageSquare, CheckCircle, Package, Star, Navigation2, AlertCircle, CreditCard, Loader2 } from 'lucide-react';
import { UserLiveTracking, LiveOrder, OrderStatus } from './UserLiveTracking';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ChatScreen, Provider } from './ChatScreen';
import { CallConfirmModal } from './CallConfirmModal';
import { Job, JobStatus, isLiveTrackingStatus } from '../types/job';

let useJobHook: (() => { currentJob: Job | null; isLoading: boolean; error: string | null; updateJobStatus: (status: JobStatus) => Promise<boolean>; isLiveTracking: boolean }) | null = null;

try {
  const jobContext = require('../context/JobContext');
  useJobHook = jobContext.useJob;
} catch (e) {
}

function useJobSafe() {
  try {
    if (useJobHook) {
      return useJobHook();
    }
  } catch (e) {
  }
  return null;
}

interface TrackingOrderData {
  id: string;
  providerName: string;
  providerImage: string;
  providerPhone: string;
  service: string;
  address: string;
  securityCode?: string;
  eta?: string;
  status: string;
}

type ActiveOrderTrackingProps = {
  onBack: () => void;
  orderData?: TrackingOrderData | null;
};

const DEMO_LIVE_ORDER: LiveOrder = {
  id: 'ORD-2024-001',
  status: 'en_route',
  service: 'תיקון נזילה במטבח',
  scheduledDate: '2024-11-30',
  scheduledTime: '14:00',
  address: 'רחוב דיזנגוף 100, תל אביב',
  securityCode: '4821',
  provider: {
    id: 'pro-101',
    name: 'יוסי כהן',
    role: 'אינסטלטור מוסמך',
    phone: '+972-54-555-1234',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    rating: 4.9,
    carInfo: 'יונדאי איוניק 5',
    licensePlate: '64-322-12',
    currentLocation: {
      lat: 32.07650,
      lng: 34.78128
    }
  },
  clientLocation: {
    lat: 32.07050,
    lng: 34.77808
  },
  eta: 5
};

function mapJobStatusToOrderStatus(jobStatus: JobStatus): OrderStatus {
  const statusMap: Record<JobStatus, OrderStatus> = {
    'searching': 'pending',
    'pending_acceptance': 'pending',
    'accepted': 'accepted',
    'en_route': 'en_route',
    'arrived': 'on_site',
    'in_progress': 'in_progress',
    'payment_pending': 'payment_pending',
    'completed': 'completed',
    'cancelled': 'cancelled'
  };
  return statusMap[jobStatus] || 'pending';
}

function mapOrderStatusToJobStatus(orderStatus: OrderStatus): JobStatus {
  const statusMap: Record<OrderStatus, JobStatus> = {
    'pending': 'pending_acceptance',
    'accepted': 'accepted',
    'en_route': 'en_route',
    'on_site': 'arrived',
    'in_progress': 'in_progress',
    'payment_pending': 'payment_pending',
    'completed': 'completed',
    'cancelled': 'cancelled'
  };
  return statusMap[orderStatus] || 'pending_acceptance';
}

function convertJobToLiveOrder(job: Job): LiveOrder {
  const provider = job.provider;
  const vehicleInfo = provider?.vehicleInfo;
  
  return {
    id: job.id,
    status: mapJobStatusToOrderStatus(job.status),
    service: job.serviceData?.aiDescription || job.serviceData?.category || 'שירות',
    scheduledDate: job.scheduledFor 
      ? new Date(job.scheduledFor).toLocaleDateString('he-IL') 
      : new Date(job.createdAt).toLocaleDateString('he-IL'),
    scheduledTime: job.scheduledFor 
      ? new Date(job.scheduledFor).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
      : new Date(job.createdAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
    address: job.userLocation?.address || '',
    securityCode: job.securityCode || '0000',
    provider: {
      id: provider?.id || '',
      name: provider?.name || 'בעל מקצוע',
      role: provider?.category || 'מומחה',
      phone: provider?.phone || '',
      image: provider?.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
      rating: provider?.rating || 5.0,
      carInfo: vehicleInfo ? `${vehicleInfo.make} ${vehicleInfo.model} ${vehicleInfo.color}` : '',
      licensePlate: vehicleInfo?.licensePlate || '',
      currentLocation: provider?.currentLocation ? {
        lat: provider.currentLocation.lat,
        lng: provider.currentLocation.lng
      } : undefined
    },
    clientLocation: {
      lat: job.userLocation?.lat || 32.07050,
      lng: job.userLocation?.lng || 34.77808
    },
    eta: job.estimatedArrival 
      ? Math.max(1, Math.ceil((new Date(job.estimatedArrival).getTime() - Date.now()) / 60000))
      : 5,
    providerBreadcrumbs: job.providerBreadcrumbs || []
  };
}

function StaticOrderView({ 
  order, 
  onBack,
  onStatusChange,
  isDemo
}: { 
  order: LiveOrder; 
  onBack: () => void;
  onStatusChange: (status: OrderStatus) => void;
  isDemo: boolean;
}) {
  const [showChat, setShowChat] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);

  const providerData: Provider = {
    id: order.provider.id,
    name: order.provider.name,
    role: order.provider.role,
    phone: order.provider.phone,
    image: order.provider.image,
    rating: order.provider.rating,
    carInfo: order.provider.carInfo,
    licensePlate: order.provider.licensePlate
  };

  const statusConfig = useMemo(() => {
    switch (order.status) {
      case 'pending':
        return { label: 'ממתין לאישור', color: 'bg-yellow-100 text-yellow-700', icon: Clock };
      case 'accepted':
        return { label: 'הזמנה אושרה', color: 'bg-blue-100 text-blue-700', icon: CheckCircle };
      case 'payment_pending':
        return { label: 'ממתין לתשלום', color: 'bg-amber-100 text-amber-700', icon: CreditCard };
      case 'completed':
        return { label: 'הושלם', color: 'bg-green-100 text-green-700', icon: CheckCircle };
      case 'cancelled':
        return { label: 'בוטל', color: 'bg-red-100 text-red-700', icon: Package };
      default:
        return { label: 'ממתין', color: 'bg-gray-100 text-gray-700', icon: Clock };
    }
  }, [order.status]);

  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl" lang="he">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="חזור אחורה"
          >
            <ArrowRight className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">פרטי הזמנה</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 p-4 space-y-4">
        {isDemo && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="text-sm text-amber-800">מצב הדגמה - נתונים לדוגמה</span>
          </div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-gray-500">#{order.id}</span>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${statusConfig.color}`}>
              <StatusIcon className="w-4 h-4" />
              <span className="text-xs font-bold">{statusConfig.label}</span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">{order.service}</h2>
          
          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-3 text-gray-600">
              <div className="bg-gray-100 p-2 rounded-lg">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-sm">{order.address}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <div className="bg-gray-100 p-2 rounded-lg">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-sm">{order.scheduledDate}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <div className="bg-gray-100 p-2 rounded-lg">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-sm">{order.scheduledTime}</span>
            </div>
          </div>
        </motion.div>

        {order.provider.id && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">בעל המקצוע</h3>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <ImageWithFallback 
                  src={order.provider.image}
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-lg"
                  alt={`תמונה של ${order.provider.name}`}
                />
                <div className="absolute -bottom-1 -right-1 bg-white text-gray-900 text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-md border border-gray-100 flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                  <span>{order.provider.rating}</span>
                </div>
              </div>
              
              <div className="flex-1">
                <h4 className="font-bold text-gray-900">{order.provider.name}</h4>
                <p className="text-sm text-gray-600">{order.provider.role}</p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setShowChat(true)}
                  className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-300"
                  aria-label={`פתח צ'אט עם ${order.provider.name}`}
                >
                  <MessageSquare className="w-5 h-5 text-gray-600" />
                </button>
                <button 
                  onClick={() => setShowCallModal(true)}
                  className="p-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-300"
                  aria-label={`התקשר ל${order.provider.name}`}
                >
                  <Phone className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {order.securityCode && (
              <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">קוד אבטחה</span>
                </div>
                <span className="font-mono font-bold text-blue-700 text-lg">{order.securityCode}</span>
              </div>
            )}
          </motion.div>
        )}

        {(order.status === 'pending' || order.status === 'accepted') && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 border border-blue-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-600 p-2 rounded-xl">
                <Navigation2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">מעקב בזמן אמת</h3>
                <p className="text-sm text-gray-600">כשהמקצוען יצא לדרך, תוכל לעקוב אחריו במפה</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-500 mt-2 bg-white/60 rounded-lg p-3">
              שירות המעקב יופעל אוטומטית כשבעל המקצוע יתחיל לנסוע אליך.
            </p>
          </motion.div>
        )}

        {order.status === 'payment_pending' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl p-5 border border-amber-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-500 p-2.5 rounded-xl">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">העבודה הושלמה!</h3>
                <p className="text-sm text-gray-600">בעל המקצוע סיים את העבודה. נא לאשר ולשלם.</p>
              </div>
            </div>
            
            <div className="bg-white/70 rounded-xl p-4 mb-4 border border-amber-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">סכום לתשלום</span>
                <span className="text-2xl font-bold text-gray-900">₪250.00</span>
              </div>
              <p className="text-xs text-gray-500">התשלום מאובטח באמצעות PayPal</p>
            </div>

            <button 
              onClick={() => onStatusChange('completed')}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-amber-200 min-h-[56px] focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2"
            >
              <CreditCard className="w-5 h-5" />
              <span>אשר ושלם עכשיו</span>
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              לביטחונך, כל התשלומים מתבצעים דרך האפליקציה בלבד
            </p>
          </motion.div>
        )}

        {isDemo && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-sm text-yellow-800 font-medium mb-3">הדגמה - לחץ לשנות סטטוס:</p>
            <div className="flex flex-wrap gap-2">
              {(['pending', 'accepted', 'en_route', 'on_site', 'in_progress', 'payment_pending', 'completed'] as OrderStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => onStatusChange(status)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    order.status === status 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {showChat && (
          <ChatScreen 
            provider={providerData} 
            onBack={() => setShowChat(false)}
            onCall={() => setShowCallModal(true)}
          />
        )}
      </AnimatePresence>

      <CallConfirmModal
        isOpen={showCallModal}
        onClose={() => setShowCallModal(false)}
        provider={providerData}
      />
    </div>
  );
}

function mapStatusToOrderStatus(status: string): OrderStatus {
  const statusMap: Record<string, OrderStatus> = {
    'searching': 'pending',
    'pending_acceptance': 'pending',
    'accepted': 'accepted',
    'en_route': 'en_route',
    'arrived': 'on_site',
    'in_progress': 'in_progress',
    'payment_pending': 'payment_pending',
    'completed': 'completed',
    'cancelled': 'cancelled'
  };
  return statusMap[status] || 'en_route';
}

export function ActiveOrderTracking({ onBack, orderData }: ActiveOrderTrackingProps) {
  const jobContext = useJobSafe();
  const [demoOrder, setDemoOrder] = useState<LiveOrder>(() => {
    if (orderData) {
      return {
        ...DEMO_LIVE_ORDER,
        id: orderData.id,
        service: orderData.service,
        address: orderData.address,
        securityCode: orderData.securityCode || '0000',
        status: mapStatusToOrderStatus(orderData.status),
        eta: orderData.eta ? parseInt(orderData.eta) || 5 : 5,
        provider: {
          ...DEMO_LIVE_ORDER.provider,
          name: orderData.providerName,
          image: orderData.providerImage,
          phone: orderData.providerPhone
        }
      };
    }
    return DEMO_LIVE_ORDER;
  });
  
  const isDemo = !jobContext?.currentJob && !orderData;
  
  const order: LiveOrder = useMemo(() => {
    if (jobContext?.currentJob) {
      return convertJobToLiveOrder(jobContext.currentJob);
    }
    return demoOrder;
  }, [jobContext?.currentJob, demoOrder]);

  const handleStatusChange = useCallback(async (newStatus: OrderStatus) => {
    if (isDemo) {
      setDemoOrder(prev => ({ ...prev, status: newStatus }));
    } else if (jobContext?.updateJobStatus) {
      const jobStatus = mapOrderStatusToJobStatus(newStatus);
      await jobContext.updateJobStatus(jobStatus);
    }
  }, [isDemo, jobContext]);

  const showLiveTracking = order.status === 'en_route' || order.status === 'on_site' || order.status === 'in_progress';

  if (showLiveTracking) {
    return (
      <UserLiveTracking 
        order={order}
        onBack={onBack}
        isDemo={isDemo}
      />
    );
  }

  return (
    <StaticOrderView 
      order={order}
      onBack={onBack}
      onStatusChange={handleStatusChange}
      isDemo={isDemo}
    />
  );
}
