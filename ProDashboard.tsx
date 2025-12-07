import { useState, useRef, useEffect, useMemo } from 'react';
import { LogOut, LayoutDashboard, Calendar, TrendingUp, User, Settings, Bell, ChevronLeft, CheckCircle, Menu, X, MessageSquare, Briefcase, Clock, MapPin, Phone, Navigation, Send, Ban, AlertCircle, Wallet, Grid, ClipboardList, Target, Car, Brain, AlertTriangle, Package, Image as ImageIcon, Edit3, Play, ChevronDown, ChevronUp, MessageCircle, History } from 'lucide-react';
import { toast } from 'sonner';
import { BeadyLogo } from './ui/BeadyLogo';
import { ProRequestsManager, mockRequests, Request, mapJobToRequest } from './ProRequestsManager';
import { ProCalendar, mockAppointments, Appointment } from './ProCalendar';
import { ProFinance } from './ProFinance';
import { ProResources } from './ProResources';
import { ProStats } from './ProStats';
import { ProProfile } from './ProProfile';
import { ProMessages } from './ProMessages';
import { ProSettings } from './ProSettings';
import { ProOverview } from './ProOverview';
import { ProActiveJob } from './ProActiveJob';
import { ProNotifications } from './ProNotifications';
import { ProHistory } from './ProHistory';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useOrderStore } from '../stores/OrderStore';
import { Job, JobStatus } from '../types/job';

const DEFAULT_PROVIDER_ID = 'pro_1';

const CATEGORY_LABELS: Record<string, string> = {
  plumbing: 'אינסטלציה',
  electrical: 'חשמל',
  cleaning: 'ניקיון',
  ac: 'מיזוג אוויר',
  renovation: 'שיפוצים',
  gardening: 'גינון',
  general: 'כללי'
};

function mapJobToAppointment(job: Job): Appointment {
  return {
    id: job.id,
    title: job.serviceData.aiDescription?.substring(0, 30) || CATEGORY_LABELS[job.serviceData.category] || job.serviceData.category,
    client: job.client?.name || 'לקוח',
    clientName: job.client?.name || 'לקוח',
    address: job.userLocation.address,
    service: CATEGORY_LABELS[job.serviceData.category] || job.serviceData.category,
    time: job.scheduledFor ? new Date(job.scheduledFor).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) : new Date(job.createdAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
    date: job.scheduledFor ? new Date(job.scheduledFor).toISOString().split('T')[0] : new Date(job.createdAt).toISOString().split('T')[0],
    duration: (job.serviceData.estimatedDuration || 60) / 60,
    status: job.status === 'completed' ? 'completed' : 
            job.status === 'cancelled' ? 'cancelled' : 
            ['accepted', 'en_route', 'arrived', 'in_progress', 'payment_pending'].includes(job.status) ? 'confirmed' : 'upcoming',
    price: job.priceEstimate || job.finalPrice || 0,
    clientImage: job.client?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Client',
    clientLat: job.userLocation.lat,
    clientLng: job.userLocation.lng,
    distance: job.distanceToClient ? `${job.distanceToClient.toFixed(1)} ק"מ` : '0 ק"מ',
    phone: job.client?.phone || '',
    clientMessage: job.serviceData.aiDescription,
    photos: job.serviceData.mediaUrls,
    aiAnalysis: {
      summary: job.serviceData.aiDescription,
      detectedIssues: [],
      estimatedMaterials: [],
      confidenceScore: 0.85
    },
    jobStatus: job.status as any
  };
}

type ProDashboardProps = {
  onLogout: () => void;
  onBackToLanding: () => void;
};

type TabType = 'overview' | 'new_requests' | 'my_missions' | 'calendar' | 'finance' | 'business' | 'active-jobs' | 'messages' | 'stats' | 'profile' | 'settings' | 'notifications' | 'history';

type Message = {
  id: string;
  text: string;
  sender: 'me' | 'client';
  timestamp: string; 
};

// --- ENRICHED MOCK DATA FOR ACTIVE JOBS ---
const DEMO_ACTIVE_JOBS: any[] = [
  {
    id: 'job-101',
    title: 'תיקון נזילה במטבח',
    client: 'דני כהן',
    clientName: 'דני כהן',
    address: 'רחוב הירקון 12, תל אביב',
    service: 'אינסטלציה',
    time: '14:00',
    date: new Date().toISOString().split('T')[0],
    duration: 2,
    status: 'upcoming',
    price: 450,
    clientImage: 'https://i.pravatar.cc/150?img=11',
    clientLat: 32.0853,
    clientLng: 34.7818,
    distance: '2.4 ק"מ',
    phone: '050-1234567',
    clientMessage: 'יש לי נזילה מתחת לכיור במטבח, מים על הרצפה. צריך לתקן בדחיפות',
    photos: [
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400',
    ],
    aiAnalysis: {
      summary: 'נזילה מצינור הניקוז מתחת לכיור, כנראה בגלל אטם שחוק. יש צורך בהחלפת אטם ובדיקת הצינור',
      detectedIssues: ['נזילה בצינור', 'אטם שחוק'],
      estimatedMaterials: ['אטם חדש', 'סרט טפלון', 'מפתח צינורות'],
      confidenceScore: 0.92,
    },
  },
  {
    id: 'job-102',
    title: 'התקנת גוף תאורה',
    client: 'רונית שחר',
    clientName: 'רונית שחר',
    address: 'שדרות רוטשילד 45, תל אביב',
    service: 'חשמל',
    time: '16:30',
    date: new Date().toISOString().split('T')[0],
    duration: 1,
    status: 'upcoming',
    price: 350,
    clientImage: 'https://i.pravatar.cc/150?img=5',
    clientLat: 32.0644,
    clientLng: 34.7724,
    distance: '1.1 ק"מ',
    phone: '052-7654321',
    clientMessage: 'הנתיכים קופצים כל פעם שמפעילים את המזגן. צריך בדיקה של לוח החשמל',
    photos: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    ],
    aiAnalysis: {
      summary: 'בעיה בלוח החשמל או עומס יתר במעגל המזגן. ייתכן שצריך להחליף נתיכים או להוסיף מעגל נפרד',
      detectedIssues: ['עומס יתר', 'נתיך פגום אפשרי'],
      estimatedMaterials: ['נתיכים', 'כבלים'],
      confidenceScore: 0.85,
    },
  },
  {
    id: 'job-103',
    title: 'פתיחת סתימה באמבטיה',
    client: 'יוסי בניון',
    clientName: 'יוסי בניון',
    address: 'דיזנגוף 100, תל אביב',
    service: 'אינסטלציה',
    time: '18:00',
    date: new Date().toISOString().split('T')[0],
    duration: 1.5,
    status: 'upcoming',
    price: 550,
    clientImage: 'https://i.pravatar.cc/150?img=60',
    clientLat: 32.0778,
    clientLng: 34.7740,
    distance: '3.5 ק"מ',
    phone: '054-9876543',
    clientMessage: 'צריך להחליף את האסלה בשירותים, האסלה הישנה סדוקה ומדליפה מים',
    photos: [
      'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400',
      'https://images.unsplash.com/photo-1564540586988-aa4e53c3d799?w=400',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    ],
    aiAnalysis: {
      summary: 'החלפת אסלה מלאה כולל התקנה חדשה. יש לבדוק את הצנרת וההתקנה הקיימת',
      detectedIssues: ['אסלה סדוקה', 'דליפת מים'],
      estimatedMaterials: ['אסלה חדשה', 'אטמים', 'ברגים', 'סיליקון'],
      confidenceScore: 0.95,
    },
  }
];

export function ProDashboard({ onLogout, onBackToLanding }: ProDashboardProps) {
  const orderStore = useOrderStore();
  const { 
    getAvailableRequests, 
    getProviderOrders, 
    getOrderOffers, 
    submitBid: storeSubmitBid, 
    updateOrderStatus: storeUpdateOrderStatus,
    cancelOrder: storeCancelOrder,
    isLoading 
  } = orderStore;

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isOnline, setIsOnline] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const providerOrders = useMemo(() => getProviderOrders(DEFAULT_PROVIDER_ID), [getProviderOrders]);
  const availableRequests = useMemo(() => getAvailableRequests(DEFAULT_PROVIDER_ID), [getAvailableRequests]);
  
  const appointments = useMemo(() => {
    const activeJobs = providerOrders.filter(job => 
      ['accepted', 'en_route', 'arrived', 'in_progress', 'payment_pending', 'pending_acceptance'].includes(job.status)
    );
    const completedJobs = providerOrders.filter(job => job.status === 'completed');
    
    return [...activeJobs, ...completedJobs].map(mapJobToAppointment);
  }, [providerOrders]);
  
  const requests = useMemo(() => {
    const allJobs = [...availableRequests, ...providerOrders.filter(j => j.status === 'pending_acceptance')];
    return allJobs.map(job => {
      const offers = getOrderOffers(job.id);
      return mapJobToRequest(job, offers.length);
    });
  }, [availableRequests, providerOrders, getOrderOffers]);
  
  const [activeJob, setActiveJob] = useState<Appointment | null>(null);

  // --- QUICK CHAT STATE ---
  const [quickChatJob, setQuickChatJob] = useState<any | null>(null);
  const [clientMessages, setClientMessages] = useState<Message[]>([
    { id: '1', text: 'היי, אני בבית ומחכה לך', sender: 'client', timestamp: new Date().toISOString() }
  ]);
  const [newClientMessage, setNewClientMessage] = useState('');
  const clientChatEndRef = useRef<HTMLDivElement>(null);

  // --- CANCEL JOB STATE ---
  const [jobToCancel, setJobToCancel] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  
  // --- MISSION CARDS EXPANDED STATE ---
  const [expandedMissions, setExpandedMissions] = useState<Set<string>>(new Set());

  // Auto scroll chat
  useEffect(() => {
    if (quickChatJob) clientChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [clientMessages, quickChatJob]);

  const handleJobSelect = (job: any) => {
    setActiveJob(job);
  };

  const handlePhoneClick = (e: React.MouseEvent, phone: string) => {
    e.stopPropagation();
    window.location.href = `tel:${phone}`;
  };

  const handleMessageClick = (e: React.MouseEvent, job: any) => {
    e.stopPropagation();
    setQuickChatJob(job);
  };

  const handleCancelClick = (e: React.MouseEvent, job: any) => {
    e.stopPropagation();
    setJobToCancel(job);
  };

  const handleDirectCancel = async (job: any) => {
    try {
      await storeCancelOrder(job.id, 'בוטל על ידי בעל מקצוע', 'provider');
      toast.success('העבודה בוטלה');
      
      if (activeJob && activeJob.id === job.id) {
        setActiveJob(null);
      }
    } catch (error) {
      console.error('Failed to cancel job:', error);
      toast.error('שגיאה בביטול העבודה');
    }
  };

  const confirmCancelJob = () => {
    if (jobToCancel) {
      handleDirectCancel(jobToCancel);
      setJobToCancel(null);
      setCancelReason('');
    }
  };

  const handleBidSubmit = async (requestId: string, bidPrice: number, message: string) => {
    try {
      await storeSubmitBid(requestId, DEFAULT_PROVIDER_ID, bidPrice, message);
      toast.success('ההצעה נשלחה בהצלחה');
    } catch (error) {
      console.error('Failed to submit bid:', error);
      toast.error('שגיאה בשליחת ההצעה');
    }
  };

  const handleJobStatusChange = async (jobId: string, newStatus: string) => {
    try {
      await storeUpdateOrderStatus(jobId, newStatus as JobStatus, 'provider');
      toast.success('הסטטוס עודכן בהצלחה');
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('שגיאה בעדכון הסטטוס');
    }
  };

  const handleOpenChat = () => {
    setActiveTab('messages');
  };

  const handleViewAllNotifications = () => {
    setActiveTab('notifications');
  };

  const handleAddTask = () => {
    console.log('Add task clicked - to be implemented');
  };

  const handleSendClientMessage = () => {
    if (!newClientMessage.trim()) return;
    
    const userMsg: Message = {
      id: Date.now().toString(),
      text: newClientMessage,
      sender: 'me',
      timestamp: new Date().toISOString()
    };
    
    setClientMessages(prev => [...prev, userMsg]);
    setNewClientMessage('');
    
    setTimeout(() => {
        setClientMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            text: 'מעולה, תודה!',
            sender: 'client',
            timestamp: new Date().toISOString()
        }]);
    }, 2000);
  };

  if (activeJob) {
    return (
        <ProActiveJob 
            job={activeJob} 
            onBack={() => setActiveJob(null)}
            onComplete={() => {
                const updatedAppointments = appointments.map(a => 
                    a.id === activeJob.id ? { ...a, status: 'completed', jobStatus: 'completed' as const } : a
                );
                setAppointments(updatedAppointments as any);
                setActiveJob(null);
            }}
            onCancel={() => {
                setJobToCancel(activeJob);
            }}
        />
    );
  }

  const menuItems = [
    { id: 'overview', label: 'מבט כללי', icon: LayoutDashboard },
    { id: 'history', label: 'היסטוריה', icon: History },
    { id: 'calendar', label: 'יומן', icon: Calendar },
    { id: 'finance', label: 'פיננסים', icon: Wallet },
  ];

  // Desktop sidebar items
  const sidebarItems = [
    { id: 'overview', label: 'מבט כללי', icon: LayoutDashboard },
    { id: 'history', label: 'היסטוריית הזמנות', icon: History },
    { id: 'calendar', label: 'יומן עבודה', icon: Calendar },
    { id: 'finance', label: 'ניהול פיננסי', icon: Wallet },
    { id: 'business', label: 'ניהול העסק', icon: Grid },
    { id: 'notifications', label: 'התראות', icon: Bell },
    { id: 'messages', label: 'הודעות', icon: MessageSquare },
    { id: 'stats', label: 'ביצועים', icon: TrendingUp },
    { id: 'settings', label: 'הגדרות', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ProOverview appointments={appointments} requests={requests} onJobSelect={handleJobSelect} onCancelJob={handleDirectCancel} onBidSubmit={handleBidSubmit} onJobStatusChange={handleJobStatusChange} onOpenChat={handleOpenChat} onViewAllNotifications={handleViewAllNotifications} onAddTask={handleAddTask} />;
      case 'history':
        return <ProHistory />;
      case 'new_requests':
        return <ProRequestsManager requests={requests} />;
      case 'my_missions':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800">המשימות שלי</h3>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                {appointments.filter(a => ['upcoming', 'confirmed'].includes(a.status)).length} משימות
              </span>
            </div>
            
            <div className="grid gap-4">
              {appointments.filter(a => ['upcoming', 'confirmed'].includes(a.status)).length === 0 ? (
                <div className="bg-white p-12 rounded-2xl text-center border border-gray-200 shadow-sm">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-10 h-10 text-gray-300" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">אין משימות פעילות כרגע</h4>
                  <p className="text-gray-500 mt-2">כאשר תקבל עבודה חדשה, היא תופיע כאן.</p>
                  <button 
                    onClick={() => setActiveTab('new_requests')}
                    className="mt-6 text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
                  >
                    עבור לבקשות חדשות
                  </button>
                </div>
              ) : (
                appointments.filter(a => ['upcoming', 'confirmed'].includes(a.status)).map(job => {
                  const isExpanded = expandedMissions.has(job.id);
                  const toggleExpanded = () => {
                    setExpandedMissions(prev => {
                      const newSet = new Set(prev);
                      if (newSet.has(job.id)) {
                        newSet.delete(job.id);
                      } else {
                        newSet.add(job.id);
                      }
                      return newSet;
                    });
                  };
                  return (
                  <div key={job.id} className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-green-200 transition-all bg-white">
                    {/* Header Row: Price + Client Info + Status */}
                    <div className="p-5 pb-0">
                      <div className="flex items-start justify-between">
                        {/* Price Section */}
                        <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-xl border border-green-100">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <div>
                            <div className="text-xl font-bold text-green-700">₪{job.price}</div>
                            <div className="text-[10px] text-green-500">מחיר סגור</div>
                          </div>
                        </div>

                        {/* Client Info */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-gray-900 text-lg">{job.clientName}</h4>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                job.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                              }`}>
                                {job.status === 'confirmed' ? 'מאושר' : 'ממתין להתחלה'}
                              </span>
                              {job.urgency === 'immediate' && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  דחוף
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{job.service}</p>
                          </div>
                          <div className="relative">
                            <ImageWithFallback
                              src={job.clientImage}
                              alt={job.clientName}
                              className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Schedule Info */}
                    <div className="px-5 pt-3">
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-xs text-blue-600 font-medium">מועד המשימה</div>
                            <div className="font-bold text-gray-900">
                              {job.date} בשעה {job.time} • {job.duration} שעות
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            toast.info('בקשה לשינוי מועד נשלחה ללקוח', {
                              description: 'תקבל הודעה כשהלקוח יאשר את המועד החדש',
                            });
                          }}
                          className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-white px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          שנה מועד
                        </button>
                      </div>
                    </div>

                    {/* Metrics Row */}
                    <div className="px-5 py-3">
                      <div className="flex items-center justify-between gap-2 p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-500">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[10px] text-gray-500">מרחק</div>
                            <div className="font-medium text-sm">{job.distance || '3.2'} ק"מ</div>
                          </div>
                        </div>
                        <div className="h-8 w-px bg-gray-200"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-green-500">
                            <Car className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[10px] text-gray-500">זמן הגעה</div>
                            <div className="font-medium text-sm">{Math.round(parseFloat(job.distance || '3.2') * 3 + 5)} דק׳</div>
                          </div>
                        </div>
                        <div className="h-8 w-px bg-gray-200"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-500">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[10px] text-gray-500">משך עבודה</div>
                            <div className="font-medium text-sm">{job.duration} שעות</div>
                          </div>
                        </div>
                        {job.aiAnalysis && (
                          <>
                            <div className="h-8 w-px bg-gray-200"></div>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-purple-500">
                                <Brain className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-[10px] text-gray-500">דיוק AI</div>
                                <div className="font-medium text-sm">{Math.round((job.aiAnalysis?.confidenceScore || 0) * 100)}%</div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Address */}
                    <div className="px-5 pb-3">
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                          <MapPin className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500">כתובת</div>
                          <div className="font-medium text-gray-900">{job.address}</div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`https://waze.com/ul?ll=${job.clientLat},${job.clientLng}&navigate=yes`, '_blank');
                          }}
                          className="flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 bg-white px-3 py-1.5 rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors"
                        >
                          <Navigation className="w-4 h-4" />
                          נווט (Waze)
                        </button>
                      </div>
                    </div>

                    {/* Client Message */}
                    {job.clientMessage && (
                      <div className="px-5 pb-3">
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                          <div className="flex items-center gap-2 text-amber-700 mb-2 font-medium text-sm">
                            <MessageCircle className="w-4 h-4" />
                            <span>הודעה מהלקוח</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            "{job.clientMessage}"
                          </p>
                        </div>
                      </div>
                    )}

                    {/* AI Analysis Section - Always Visible */}
                    {job.aiAnalysis && (
                      <div className="px-5 pb-3">
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-purple-700 mb-2 font-medium">
                            <Brain className="w-5 h-5" />
                            <span>ניתוח AI</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed mb-3">
                            {job.aiAnalysis.summary}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {job.aiAnalysis.detectedIssues && job.aiAnalysis.detectedIssues.length > 0 && (
                              <span className="bg-white px-3 py-1.5 rounded-lg text-sm font-medium text-orange-700 shadow-sm border border-orange-100 flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4" />
                                {job.aiAnalysis.detectedIssues.length} בעיות זוהו
                              </span>
                            )}
                            {job.aiAnalysis.estimatedMaterials && job.aiAnalysis.estimatedMaterials.length > 0 && (
                              <span className="bg-white px-3 py-1.5 rounded-lg text-sm font-medium text-blue-700 shadow-sm border border-blue-100 flex items-center gap-1.5">
                                <Package className="w-4 h-4" />
                                {job.aiAnalysis.estimatedMaterials.length} חומרים נדרשים
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Photo Gallery - Always Visible */}
                    {job.photos && job.photos.length > 0 && (
                      <div className="px-5 pb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <ImageIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">תמונות מהלקוח</span>
                        </div>
                        <div className="flex gap-2">
                          {job.photos.slice(0, 4).map((photo: string, index: number) => (
                            <div key={index} className="relative">
                              <img
                                src={photo}
                                alt={`תמונה ${index + 1}`}
                                className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                              />
                            </div>
                          ))}
                          {job.photos.length > 4 && (
                            <div className="w-20 h-20 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                              <div className="text-center">
                                <span className="text-lg font-bold text-gray-600">+{job.photos.length - 4}</span>
                                <div className="text-[10px] text-gray-500">עוד</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Expandable Details Section */}
                    <div className="px-5 pb-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleExpanded(); }}
                        className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            הסתר פרטים נוספים
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            הצג פרטים נוספים
                          </>
                        )}
                      </button>
                    </div>

                    {/* Expanded Content - Materials List Only */}
                    {isExpanded && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* Materials List */}
                        {job.aiAnalysis?.estimatedMaterials && job.aiAnalysis.estimatedMaterials.length > 0 && (
                          <div className="px-5 pb-3">
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                              <div className="flex items-center gap-2 text-blue-700 mb-2 font-medium text-sm">
                                <Package className="w-4 h-4" />
                                <span>חומרים נדרשים (הערכה)</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {job.aiAnalysis.estimatedMaterials.map((material: string, index: number) => (
                                  <span key={index} className="bg-white text-blue-700 text-xs px-2 py-1 rounded-md border border-blue-200">
                                    {material}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Detected Issues Details */}
                        {job.aiAnalysis?.detectedIssues && job.aiAnalysis.detectedIssues.length > 0 && (
                          <div className="px-5 pb-3">
                            <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
                              <div className="flex items-center gap-2 text-orange-700 mb-2 font-medium text-sm">
                                <AlertTriangle className="w-4 h-4" />
                                <span>בעיות שזוהו</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {job.aiAnalysis.detectedIssues.map((issue: string, index: number) => (
                                  <span key={index} className="bg-white text-orange-700 text-xs px-2 py-1 rounded-md border border-orange-200">
                                    {issue}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="p-5 pt-0 border-t border-gray-100 mt-2">
                      <div className="flex items-center gap-3 pt-4">
                        {/* Quick Contact Buttons */}
                        <button 
                          onClick={(e) => { e.stopPropagation(); handlePhoneClick(e, job.phone || '050-1234567'); }}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl font-medium transition-colors border border-green-200"
                        >
                          <Phone className="w-4 h-4" />
                          התקשר
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleMessageClick(e, job); }}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-medium transition-colors border border-blue-200"
                        >
                          <MessageSquare className="w-4 h-4" />
                          הודעה
                        </button>
                        
                        {/* Primary Action Button */}
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleJobSelect(job); }}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-200 active:scale-95"
                        >
                          <Car className="w-5 h-5" />
                          התחל משימה
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )})
              )}
            </div>
          </div>
        );
      case 'active-jobs':
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-800">משימות בביצוע</h3>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                        {appointments.filter(a => a.status === 'upcoming').length} משימות
                    </span>
                </div>
                
                <div className="grid gap-4">
                    {appointments.filter(a => a.status === 'upcoming').length === 0 ? (
                         <div className="bg-white p-12 rounded-2xl text-center border border-gray-200 shadow-sm">
                             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                 <Briefcase className="w-10 h-10 text-gray-300" />
                             </div>
                             <h4 className="text-xl font-bold text-gray-900">אין משימות פעילות כרגע</h4>
                             <p className="text-gray-500 mt-2">כאשר תקבל עבודה חדשה, היא תופיע כאן.</p>
                             <button 
                                onClick={() => setActiveTab('new_requests')}
                                className="mt-6 text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
                             >
                                 עבור לבקשות חדשות
                             </button>
                         </div>
                    ) : (
                        appointments.filter(a => a.status === 'upcoming').map(job => (
                            <div key={job.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all flex flex-col md:flex-row justify-between items-center gap-6 group cursor-pointer" onClick={() => handleJobSelect(job)}>
                                <div className="flex items-center gap-5 w-full md:w-auto">
                                    <div className="relative">
                                        <div className="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden shadow-inner">
                                            <img src={(job as any).clientImage || `https://i.pravatar.cc/150?u=${job.id}`} alt={job.client} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-sm">
                                            <div className="bg-green-500 w-3 h-3 rounded-full animate-pulse"></div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{job.client}</h4>
                                        <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                                            <MapPin className="w-4 h-4" />
                                            {job.address}
                                        </div>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-md font-bold border border-blue-100">
                                                {job.service}
                                            </span>
                                            
                                            {/* Quick Actions Row */}
                                            <div className="flex gap-2 mr-2">
                                                <button 
                                                    onClick={(e) => handlePhoneClick(e, (job as any).phone || '0501234567')}
                                                    className="bg-green-50 hover:bg-green-100 text-green-600 p-1.5 rounded-md transition-colors"
                                                    title="התקשר ללקוח"
                                                >
                                                    <Phone className="w-3.5 h-3.5" />
                                                </button>
                                                <button 
                                                    onClick={(e) => handleMessageClick(e, job)}
                                                    className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-1.5 rounded-md transition-colors"
                                                    title="שלח הודעה"
                                                >
                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                </button>
                                                <button 
                                                    onClick={(e) => handleCancelClick(e, job)}
                                                    className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-md transition-colors"
                                                    title="בטל משימה"
                                                >
                                                    <Ban className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 w-full md:w-auto pl-2 border-t md:border-t-0 md:border-r border-gray-100 pt-4 md:pt-0 pr-0 md:pr-6 mt-2 md:mt-0">
                                    <div className="flex flex-col items-end gap-1 ml-auto md:ml-0">
                                         <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">מחיר משוער</span>
                                         <span className="text-xl font-black text-gray-900">₪{(job as any).price}</span>
                                    </div>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleJobSelect(job);
                                        }}
                                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-200 active:scale-95 flex items-center gap-2 whitespace-nowrap"
                                    >
                                        <Car className="w-5 h-5" />
                                        התחל משימה
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
      case 'messages':
        return <ProMessages />;
      case 'calendar':
        return <ProCalendar appointments={appointments} />;
      case 'stats':
        return <ProStats />;
      case 'finance':
        return <ProFinance />;
      case 'business':
        return <ProResources />;
      case 'profile':
        return <ProProfile />;
      case 'settings':
        return <ProSettings />;
      case 'notifications':
        return <ProNotifications onBack={() => setActiveTab('overview')} />;
      default:
        return <ProOverview appointments={appointments} requests={requests} onJobSelect={handleJobSelect} onCancelJob={handleDirectCancel} onBidSubmit={handleBidSubmit} onJobStatusChange={handleJobStatusChange} onOpenChat={handleOpenChat} onViewAllNotifications={handleViewAllNotifications} onAddTask={handleAddTask} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-sans" dir="rtl">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <BeadyLogo size="md" />
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Pro</span>
        </div>
        
        {/* Mobile User Profile & Status */}
        <div className="flex items-center gap-3">
            <button className="bg-gray-100 p-2 rounded-full text-gray-600">
                <Bell className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden border border-gray-100">
                 <img src="https://i.pravatar.cc/150?img=11" alt="Pro" className="w-full h-full object-cover" />
            </div>
        </div>
      </div>

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - Desktop Only */}
        <aside 
          className="hidden lg:flex flex-col w-64 bg-white border-l border-gray-200 z-30"
        >
          {/* Logo Area */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BeadyLogo size="lg" />
              <div className="flex flex-col">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium w-fit">Pro</span>
                <div className="text-xs text-gray-500 font-medium mt-1">ניהול עסק חכם</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
            <button
              onClick={onBackToLanding}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group mb-2"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
              <span className="flex-1 text-right font-medium">חזרה לאתר הראשי</span>
            </button>
            
            <div className="h-px bg-gray-100 mx-3 mb-2"></div>

            {sidebarItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabType)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 font-medium shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  <span className="flex-1 text-right">{item.label}</span>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                </button>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-100 space-y-2">
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>התנתק</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative pb-20 lg:pb-0">
          {/* Top Header - Desktop Only */}
          <header className="hidden lg:flex bg-white border-b border-gray-200 sticky top-0 z-10 px-8 py-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {sidebarItems.find(i => i.id === activeTab)?.label || menuItems.find(i => i.id === activeTab)?.label}
              </h2>
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                גרסת בטא
              </span>
            </div>

            <div className="flex items-center gap-6">
              {/* Availability Toggle */}
              <div className="flex items-center gap-4">
                {/* Location Indicator */}
                {isOnline && (
                  <div className="hidden md:flex items-center gap-2 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full animate-pulse">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>תל אביב - יפו (GPS פעיל)</span>
                  </div>
                )}

                {/* Status Toggle */}
                <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                  <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                    {isOnline ? 'זמין לקבלת עבודות' : 'לא זמין כרגע'}
                  </span>
                  <button
                    onClick={() => setIsOnline(!isOnline)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      isOnline ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${
                      isOnline ? 'left-1' : 'left-7'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              {/* User Profile Snippet */}
              <div className="flex items-center gap-3 border-r border-gray-200 pr-6 mr-2">
                <div className="text-left hidden md:block">
                  <div className="text-sm font-bold text-gray-900">ישראל ישראלי</div>
                  <div className="text-xs text-gray-500">אינסטלטור מוסמך</div>
                </div>
                <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
                  <img src="https://i.pravatar.cc/150?img=11" alt="Pro" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </header>

          {/* Content Container */}
          <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe">
        <div className="flex justify-around items-center p-2">
            {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                    <button 
                        key={item.id}
                        onClick={() => setActiveTab(item.id as TabType)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 w-16 ${
                            isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        <div className={`p-1 rounded-full ${isActive ? 'bg-blue-50' : ''}`}>
                            <item.icon className={`w-6 h-6 ${isActive ? 'fill-blue-600/20' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </button>
                );
            })}
        </div>
      </div>

      {/* QUICK CHAT OVERLAY */}
      {quickChatJob && (
          <div className="fixed inset-0 z-[100] bg-black/50 flex justify-end animate-in fade-in duration-200" onClick={() => setQuickChatJob(null)}>
              <div 
                className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                  {/* Header */}
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white shadow-sm z-10">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                               <ImageWithFallback src={quickChatJob?.clientImage || "https://i.pravatar.cc/150?img=68"} className="w-full h-full object-cover" alt="Client" />
                          </div>
                          <div>
                              <h3 className="font-bold text-gray-900">{quickChatJob?.clientName || quickChatJob?.client || 'לקוח'}</h3>
                              <p className="text-xs text-gray-500">
                                 {quickChatJob?.address}
                              </p>
                          </div>
                      </div>
                      <button onClick={() => setQuickChatJob(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                          <X className="w-6 h-6 text-gray-500" />
                      </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                      {clientMessages.map((msg) => (
                          <div 
                              key={msg.id} 
                              className={`flex ${msg.sender === 'me' ? 'justify-start' : 'justify-end'}`}
                          >
                              <div 
                                  className={`max-w-[80%] p-3.5 rounded-2xl text-sm shadow-sm ${
                                      msg.sender === 'me' 
                                          ? 'bg-blue-600 text-white rounded-br-none' 
                                          : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                  }`}
                              >
                                  <p>{msg.text}</p>
                                  <span className={`text-[10px] mt-1 block opacity-70 ${msg.sender === 'me' ? 'text-blue-100' : 'text-gray-400'}`}>
                                      {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </span>
                              </div>
                          </div>
                      ))}
                      <div ref={clientChatEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="p-4 bg-white border-t border-gray-100">
                      <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-full border border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                          <input 
                              type="text" 
                              value={newClientMessage}
                              onChange={(e) => setNewClientMessage(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleSendClientMessage()}
                              placeholder="כתוב הודעה ללקוח..."
                              className="flex-1 bg-transparent border-none focus:ring-0 px-3 text-right text-sm"
                          />
                          <button 
                              onClick={handleSendClientMessage}
                              disabled={!newClientMessage.trim()}
                              className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md disabled:opacity-50 disabled:shadow-none transition-all transform active:scale-95 hover:bg-blue-700"
                          >
                              <Send className="w-4 h-4 ml-0.5" />
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* CANCEL JOB MODAL */}
      {jobToCancel && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in slide-in-from-bottom-10 zoom-in-95 duration-300">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-center text-gray-900 mb-2">ביטול משימה</h3>
                <p className="text-center text-gray-500 mb-6">
                    האם אתה בטוח שברצונך לבטל את המשימה עבור <span className="font-bold text-gray-800">{jobToCancel.client}</span>?
                    פעולה זו אינה הפיכה.
                </p>
                
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-right">סיבת ביטול (אופציונלי)</label>
                    <textarea 
                        className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all text-right"
                        rows={3}
                        placeholder="פרט את סיבת הביטול..."
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                    ></textarea>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={() => setJobToCancel(null)}
                        className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                    >
                        חזור
                    </button>
                    <button 
                        onClick={confirmCancelJob}
                        className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-all active:scale-95"
                    >
                        כן, בטל משימה
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}