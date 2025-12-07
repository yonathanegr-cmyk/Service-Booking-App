import { useState } from 'react';
import { 
  History, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Star, 
  ChevronLeft,
  ChevronRight,
  Ban,
  RefreshCw,
  DollarSign,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Send,
  X,
  CalendarPlus,
  Calendar,
  Image,
  Upload
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';

type OrderStatus = 'completed' | 'disputed' | 'refunded' | 'resolved';

type HistoricalOrder = {
  id: string;
  clientName: string;
  clientImage: string;
  clientPhone: string;
  service: string;
  address: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: OrderStatus;
  rating?: number;
  review?: string;
  dispute?: {
    reason: string;
    clientMessage: string;
    createdAt: string;
    status: 'pending' | 'in_review' | 'resolved' | 'refunded';
    photos?: string[];
  };
};

const mockHistoricalOrders: HistoricalOrder[] = [
  {
    id: 'HIST_001',
    clientName: 'שרה לוי',
    clientImage: 'https://i.pravatar.cc/150?img=32',
    clientPhone: '050-1112233',
    service: 'אינסטלציה',
    address: 'רחוב דיזנגוף 50, תל אביב',
    date: '2025-11-28',
    time: '10:00',
    duration: 2,
    price: 380,
    status: 'completed',
    rating: 5,
    review: 'עבודה מקצועית ומהירה. מאוד מרוצה!',
  },
  {
    id: 'HIST_002',
    clientName: 'משה כהן',
    clientImage: 'https://i.pravatar.cc/150?img=33',
    clientPhone: '052-4445566',
    service: 'חשמל',
    address: 'רחוב הרצל 15, רמת גן',
    date: '2025-11-27',
    time: '14:00',
    duration: 1.5,
    price: 450,
    status: 'completed',
    rating: 4,
    review: 'טוב מאוד, קצת איחר אבל עבודה טובה',
  },
  {
    id: 'HIST_003',
    clientName: 'רחל אברהם',
    clientImage: 'https://i.pravatar.cc/150?img=44',
    clientPhone: '054-7778899',
    service: 'אינסטלציה',
    address: 'שדרות רוטשילד 20, תל אביב',
    date: '2025-11-25',
    time: '09:00',
    duration: 3,
    price: 650,
    status: 'disputed',
    dispute: {
      reason: 'עבודה לא הושלמה כראוי',
      clientMessage: 'הנזילה חזרה יומיים אחרי התיקון. אני דורש החזר כספי או תיקון חינם.',
      createdAt: '2025-11-27',
      status: 'pending',
      photos: [
        'https://images.unsplash.com/photo-1585704032915-c3400305e979?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop'
      ],
    },
  },
  {
    id: 'HIST_004',
    clientName: 'יעקב פרידמן',
    clientImage: 'https://i.pravatar.cc/150?img=51',
    clientPhone: '053-1234567',
    service: 'ניקיון',
    address: 'רחוב בן גוריון 8, הרצליה',
    date: '2025-11-24',
    time: '11:00',
    duration: 4,
    price: 400,
    status: 'refunded',
    dispute: {
      reason: 'אי שביעות רצון מהשירות',
      clientMessage: 'הניקיון לא היה מספיק יסודי. לא מרוצה מהתוצאה.',
      createdAt: '2025-11-24',
      status: 'refunded',
      photos: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=300&fit=crop'
      ],
    },
  },
  {
    id: 'HIST_005',
    clientName: 'דינה גולד',
    clientImage: 'https://i.pravatar.cc/150?img=45',
    clientPhone: '050-9998877',
    service: 'חשמל',
    address: 'רחוב ויצמן 30, כפר סבא',
    date: '2025-11-23',
    time: '16:00',
    duration: 2,
    price: 520,
    status: 'completed',
    rating: 5,
    review: 'מצוין! פתר את הבעיה במהירות ובמקצועיות',
  },
  {
    id: 'HIST_006',
    clientName: 'אבי שמעון',
    clientImage: 'https://i.pravatar.cc/150?img=52',
    clientPhone: '052-6665544',
    service: 'אינסטלציה',
    address: 'רחוב הנביאים 45, ירושלים',
    date: '2025-11-22',
    time: '13:00',
    duration: 2.5,
    price: 580,
    status: 'disputed',
    dispute: {
      reason: 'מחיר גבוה מהמוסכם',
      clientMessage: 'הוספת עבודות נוספות ללא אישור שלי וגבית יותר מהמחיר שסוכם.',
      createdAt: '2025-11-23',
      status: 'in_review',
      photos: [
        'https://images.unsplash.com/photo-1585704032915-c3400305e979?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop'
      ],
    },
  },
  {
    id: 'HIST_007',
    clientName: 'נועה ברק',
    clientImage: 'https://i.pravatar.cc/150?img=46',
    clientPhone: '054-3332211',
    service: 'יופי',
    address: 'רחוב אלנבי 100, תל אביב',
    date: '2025-11-20',
    time: '10:30',
    duration: 1,
    price: 280,
    status: 'completed',
    rating: 5,
    review: 'שירות מעולה, מקצועית ונעימה',
  },
  {
    id: 'HIST_008',
    clientName: 'עמית רז',
    clientImage: 'https://i.pravatar.cc/150?img=53',
    clientPhone: '050-1239876',
    service: 'ניקיון',
    address: 'שדרות הציונות 12, באר שבע',
    date: '2025-11-18',
    time: '08:00',
    duration: 5,
    price: 500,
    status: 'resolved',
    dispute: {
      reason: 'חלקים שבורים',
      clientMessage: 'במהלך הניקיון נשבר לי כוס. אני רוצה פיצוי.',
      createdAt: '2025-11-18',
      status: 'resolved',
      photos: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
      ],
    },
  },
];

type TabType = 'all' | 'disputes';

export function ProHistory() {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedOrder, setSelectedOrder] = useState<HistoricalOrder | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [rescheduleOrder, setRescheduleOrder] = useState<HistoricalOrder | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  
  const [photoGalleryOpen, setPhotoGalleryOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  
  const openPhotoGallery = (photos: string[], startIndex: number = 0) => {
    setGalleryPhotos(photos);
    setCurrentPhotoIndex(startIndex);
    setPhotoGalleryOpen(true);
  };

  const closePhotoGallery = () => {
    setPhotoGalleryOpen(false);
    setCurrentPhotoIndex(0);
    setGalleryPhotos([]);
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % galleryPhotos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + galleryPhotos.length) % galleryPhotos.length);
  };

  const allOrders = mockHistoricalOrders;
  const disputedOrders = mockHistoricalOrders.filter(
    order => order.status === 'disputed' || order.status === 'refunded' || order.status === 'resolved'
  );

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            הושלם
          </span>
        );
      case 'disputed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            בעיה
          </span>
        );
      case 'refunded':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" />
            הוחזר
          </span>
        );
      case 'resolved':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            נפתר
          </span>
        );
    }
  };

  const getDisputeStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">ממתין לטיפול</span>;
      case 'in_review':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">בבדיקה</span>;
      case 'resolved':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">נפתר</span>;
      case 'refunded':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">הוחזר כספית</span>;
      default:
        return null;
    }
  };

  const handleRefund = (order: HistoricalOrder) => {
    toast.success('בקשת החזר נשלחה', {
      description: `החזר של ₪${order.price} יועבר ללקוח תוך 3-5 ימי עסקים`,
    });
    setSelectedOrder(null);
  };

  const handleRespond = (order: HistoricalOrder) => {
    if (!responseMessage.trim()) {
      toast.error('נא להזין תגובה');
      return;
    }
    toast.success('התגובה נשלחה ללקוח', {
      description: 'הלקוח יקבל הודעה עם התגובה שלך',
    });
    setResponseMessage('');
    setSelectedOrder(null);
  };

  const handleEscalate = (order: HistoricalOrder) => {
    toast.info('הבעיה הועברה לצוות התמיכה', {
      description: 'נציג יצור קשר תוך 24 שעות',
    });
    setSelectedOrder(null);
  };

  const handleReschedule = (order: HistoricalOrder) => {
    if (!rescheduleDate || !rescheduleTime) {
      toast.error('נא לבחור תאריך ושעה');
      return;
    }
    toast.success('נקבע מועד חדש!', {
      description: `הלקוח יקבל הודעה על המועד החדש: ${rescheduleDate} בשעה ${rescheduleTime}`,
    });
    setRescheduleOrder(null);
    setRescheduleDate('');
    setRescheduleTime('');
  };

  const handleCall = (order: HistoricalOrder) => {
    toast.success('מתקשר ללקוח...', {
      description: order.clientPhone,
    });
  };

  const orders = activeTab === 'all' ? allOrders : disputedOrders;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
            <History className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">היסטוריית הזמנות</h3>
            <p className="text-sm text-gray-500">כל ההזמנות שהושלמו וטופלו</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-bold">
            {allOrders.length} הזמנות
          </span>
          {disputedOrders.length > 0 && (
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {disputedOrders.filter(o => o.dispute?.status === 'pending' || o.dispute?.status === 'in_review').length} בעיות פתוחות
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-4 px-6 font-bold text-center transition-all relative ${
              activeTab === 'all'
                ? 'text-purple-600 bg-purple-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <History className="w-5 h-5" />
              <span>כל ההזמנות</span>
              <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {allOrders.length}
              </span>
            </div>
            {activeTab === 'all' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('disputes')}
            className={`flex-1 py-4 px-6 font-bold text-center transition-all relative ${
              activeTab === 'disputes'
                ? 'text-red-600 bg-red-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>בעיות וזיכויים</span>
              {disputedOrders.filter(o => o.dispute?.status === 'pending').length > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {disputedOrders.filter(o => o.dispute?.status === 'pending').length}
                </span>
              )}
            </div>
            {activeTab === 'disputes' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></div>
            )}
          </button>
        </div>

        {/* Orders List */}
        <div className="p-6 space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <History className="w-10 h-10 text-gray-300" />
              </div>
              <h4 className="text-xl font-bold text-gray-900">אין הזמנות להצגה</h4>
              <p className="text-gray-500 mt-2">ההזמנות שלך יופיעו כאן</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className={`border rounded-2xl overflow-hidden transition-all hover:shadow-lg ${
                  order.status === 'disputed' ? 'border-red-200 bg-red-50/30' :
                  order.status === 'refunded' ? 'border-orange-200 bg-orange-50/30' :
                  order.status === 'resolved' ? 'border-blue-200 bg-blue-50/30' :
                  'border-gray-200 bg-white'
                }`}
              >
                <div className="p-5">
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <ImageWithFallback
                        src={order.clientImage}
                        alt={order.clientName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                      />
                      <div>
                        <h4 className="font-bold text-gray-900">{order.clientName}</h4>
                        <p className="text-sm text-blue-600">{order.service}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(order.status)}
                      <div className="text-left">
                        <div className="text-lg font-bold text-gray-900">₪{order.price}</div>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{order.date} • {order.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{order.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{order.clientPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{order.duration} שעות</span>
                    </div>
                  </div>

                  {/* Rating & Review for completed orders */}
                  {order.status === 'completed' && order.rating && (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${star <= order.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-green-700">{order.rating}/5</span>
                      </div>
                      {order.review && (
                        <p className="text-sm text-gray-700">"{order.review}"</p>
                      )}
                    </div>
                  )}

                  {/* Dispute Info */}
                  {order.dispute && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-red-700 font-medium">
                          <AlertTriangle className="w-4 h-4" />
                          <span>{order.dispute.reason}</span>
                        </div>
                        {getDisputeStatusBadge(order.dispute.status)}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        "{order.dispute.clientMessage}"
                      </p>
                      <div className="text-xs text-gray-500">
                        נפתח ב: {order.dispute.createdAt}
                      </div>
                      
                      {order.dispute.photos && order.dispute.photos.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-red-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Image className="w-4 h-4 text-teal-600" />
                              <span className="font-medium">ראיות מהלקוח</span>
                              <span className="bg-teal-100 text-teal-700 text-xs px-2 py-0.5 rounded-full font-bold">
                                {order.dispute.photos.length}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2" dir="rtl">
                            {order.dispute.photos.slice(0, 3).map((photo, idx) => (
                              <button
                                key={idx}
                                onClick={() => openPhotoGallery(order.dispute!.photos!, idx)}
                                className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-teal-200 hover:border-teal-400 transition-all hover:scale-105 cursor-pointer shadow-sm group"
                              >
                                <img 
                                  src={photo} 
                                  alt={`ראיה ${idx + 1}`} 
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                              </button>
                            ))}
                            {order.dispute.photos.length > 3 && (
                              <button
                                onClick={() => openPhotoGallery(order.dispute!.photos!, 3)}
                                className="w-16 h-16 rounded-lg bg-gray-100 border-2 border-gray-200 hover:border-teal-400 flex items-center justify-center text-gray-600 hover:text-teal-600 font-bold text-sm transition-all cursor-pointer"
                              >
                                +{order.dispute.photos.length - 3}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions for disputed orders */}
                  {order.dispute && (order.dispute.status === 'pending' || order.dispute.status === 'in_review') && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleCall(order)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-sm"
                      >
                        <Phone className="w-4 h-4" />
                        התקשר
                      </button>
                      <button
                        onClick={() => setRescheduleOrder(order)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl font-medium transition-colors border border-green-200"
                      >
                        <CalendarPlus className="w-4 h-4" />
                        קבע מועד חדש
                      </button>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-medium transition-colors border border-blue-200"
                      >
                        <MessageSquare className="w-4 h-4" />
                        הגב ללקוח
                      </button>
                      <button
                        onClick={() => handleRefund(order)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl font-medium transition-colors border border-orange-200"
                      >
                        <RefreshCw className="w-4 h-4" />
                        החזר כספי
                      </button>
                      <button
                        onClick={() => handleEscalate(order)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-medium transition-colors border border-gray-200"
                      >
                        <AlertCircle className="w-4 h-4" />
                        העבר לתמיכה
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Response Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrder(null)}>
          <div 
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" 
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">הגב ללקוח</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <ImageWithFallback
                    src={selectedOrder.clientImage}
                    alt={selectedOrder.clientName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-bold text-gray-900">{selectedOrder.clientName}</div>
                    <div className="text-sm text-gray-500">{selectedOrder.service} • ₪{selectedOrder.price}</div>
                  </div>
                </div>
                {selectedOrder.dispute && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-sm font-medium text-red-700 mb-1">{selectedOrder.dispute.reason}</div>
                    <p className="text-sm text-gray-600">"{selectedOrder.dispute.clientMessage}"</p>
                  </div>
                )}
              </div>

              {/* Response Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">התגובה שלך</label>
                <textarea
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder="כתוב תגובה ללקוח..."
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              {/* Quick Responses */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">תגובות מהירות</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'אני מצטער על אי הנוחות, אשמח לתקן את הבעיה ללא עלות נוספת',
                    'אני מציע לחזור לתקן את הבעיה בהקדם האפשרי',
                    'מאשר החזר כספי מלא'
                  ].map((text, index) => (
                    <button
                      key={index}
                      onClick={() => setResponseMessage(text)}
                      className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                    >
                      {text}
                    </button>
                  ))}
                </div>
              </div>

              {/* Attach Photos */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">צרף תמונות</label>
                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer transition-all">
                  <Upload className="w-5 h-5 text-teal-600" />
                  <span className="text-sm text-gray-600">לחץ להעלאת תמונות כראיה</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    className="hidden" 
                    onChange={() => toast.success('תמונות נוספו בהצלחה')} 
                  />
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
              >
                ביטול
              </button>
              <button
                onClick={() => handleRespond(selectedOrder)}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                שלח תגובה
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setRescheduleOrder(null)}>
          <div 
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl" 
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <CalendarPlus className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">קביעת מועד חדש</h3>
                </div>
                <button
                  onClick={() => setRescheduleOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <ImageWithFallback
                    src={rescheduleOrder.clientImage}
                    alt={rescheduleOrder.clientName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-bold text-gray-900">{rescheduleOrder.clientName}</div>
                    <div className="text-sm text-gray-500">{rescheduleOrder.service} • {rescheduleOrder.address}</div>
                  </div>
                </div>
                {rescheduleOrder.dispute && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-sm text-red-600 font-medium">בעיה: {rescheduleOrder.dispute.reason}</div>
                  </div>
                )}
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline ml-1" />
                  תאריך חדש
                </label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline ml-1" />
                  שעה
                </label>
                <select
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                >
                  <option value="">בחר שעה</option>
                  <option value="08:00">08:00</option>
                  <option value="09:00">09:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:00">11:00</option>
                  <option value="12:00">12:00</option>
                  <option value="13:00">13:00</option>
                  <option value="14:00">14:00</option>
                  <option value="15:00">15:00</option>
                  <option value="16:00">16:00</option>
                  <option value="17:00">17:00</option>
                  <option value="18:00">18:00</option>
                  <option value="19:00">19:00</option>
                </select>
              </div>

              {/* Info Note */}
              <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                <p className="text-sm text-green-700">
                  הלקוח יקבל הודעה עם המועד החדש וצריך לאשר אותו. במידה והלקוח יאשר, ההזמנה תתווסף ליומן שלך.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setRescheduleOrder(null);
                  setRescheduleDate('');
                  setRescheduleTime('');
                }}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
              >
                ביטול
              </button>
              <button
                onClick={() => handleReschedule(rescheduleOrder)}
                className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              >
                <CalendarPlus className="w-4 h-4" />
                שלח הצעה ללקוח
              </button>
            </div>
          </div>
        </div>
      )}

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
