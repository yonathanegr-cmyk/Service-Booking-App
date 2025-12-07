import { useState } from 'react';
import { TrendingUp, Calendar, Star, Users, Clock, ArrowRight, Wallet, CheckCircle, AlertCircle, Ban, X, MapPin, Phone, MessageSquare, Navigation, Send, Play, Eye, Car, Briefcase, DollarSign, Info, Settings, Brain, Package, AlertTriangle, Image as ImageIcon, Edit3, MessageCircle, Bell, FileText, ChevronRight } from 'lucide-react';
import { Appointment, JobStatus } from './ProCalendar';
import { Request } from './ProRequestsManager';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { BidProposalModal } from './BidProposalModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

type ProOverviewProps = {
  appointments?: Appointment[];
  requests?: Request[];
  onJobSelect?: (job: Appointment) => void;
  onCancelJob?: (job: Appointment) => void;
  onBidSubmit?: (requestId: string, bidPrice: number, message: string) => void;
  onJobStatusChange?: (jobId: string, status: JobStatus) => void;
  onOpenChat?: () => void;
  onViewAllNotifications?: () => void;
  onAddTask?: () => void;
};

type ActiveJob = Appointment & {
  jobStatus?: JobStatus;
  clientLat?: number;
  clientLng?: number;
  phone?: string;
  distance?: string;
  clientImage?: string;
};

type BidData = {
  requestId: string;
  originalPrice: number;
  bidPrice: number;
  message: string;
};

type ProTask = {
  id: string;
  content: string;
  completed: boolean;
  createdAt: Date;
};

export function ProOverview({ appointments = [], requests = [], onJobSelect, onCancelJob, onBidSubmit, onJobStatusChange, onOpenChat, onViewAllNotifications, onAddTask }: ProOverviewProps) {
  const [jobToCancel, setJobToCancel] = useState<Appointment | null>(null);
  const [activeTab, setActiveTab] = useState<'opportunities' | 'schedule'>('opportunities');
  
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [bidPrice, setBidPrice] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [myBids, setMyBids] = useState<Map<string, { price: number; message: string; isModified?: boolean }>>(new Map());

  const [tasks, setTasks] = useState<ProTask[]>([
    { id: '1', content: 'להזמין חומרים לפרויקט בתל אביב', completed: false, createdAt: new Date() },
    { id: '2', content: 'לחזור ללקוח לגבי מועד העבודה', completed: false, createdAt: new Date() },
    { id: '3', content: 'לעדכן מחירון שירותים', completed: true, createdAt: new Date() }
  ]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskContent, setNewTaskContent] = useState('');

  const completedJobs = appointments.filter(a => a.status === 'completed' || a.jobStatus === 'completed').length;
  const upcomingJobs = appointments.filter(a => 
    (a.status === 'confirmed' || a.status === 'upcoming') && 
    a.jobStatus !== 'completed'
  );
  
  // Separate requests into new and pending
  const newRequests = requests.filter(r => r.status === 'new');
  const pendingRequests = requests.filter(r => r.status === 'pending');
  
  const closedRequests = requests.filter(r => 
    (r.status === 'accepted' || r.status === 'completed') && myBids.has(r.id)
  );
  const monthlyRevenue = appointments
    .filter(a => a.status === 'completed' || a.status === 'confirmed')
    .reduce((sum, a) => sum + a.price, 0);

  const handleCancelConfirm = () => {
    if (jobToCancel && onCancelJob) {
      onCancelJob(jobToCancel);
    }
    setJobToCancel(null);
  };

  const handleOpenBidModal = (request: Request) => {
    setSelectedRequest(request);
    // Pre-fill with existing bid if already submitted, otherwise use suggested price
    const existingBid = myBids.get(request.id);
    setBidPrice(existingBid ? existingBid.price.toString() : request.suggestedPrice.toString());
    setBidMessage(existingBid ? existingBid.message : '');
    setShowBidModal(true);
  };

  const handleSubmitBid = () => {
    if (selectedRequest && bidPrice) {
      const bidData: BidData = {
        requestId: selectedRequest.id,
        originalPrice: selectedRequest.suggestedPrice,
        bidPrice: parseFloat(bidPrice),
        message: bidMessage
      };
      console.log('Bid submitted:', bidData);
      
      // Track my bid to show in the UI
      setMyBids(prev => {
        const newMap = new Map(prev);
        const existingBid = prev.get(selectedRequest.id);
        const isModified = existingBid ? true : false;
        newMap.set(selectedRequest.id, { price: parseFloat(bidPrice), message: bidMessage, isModified });
        return newMap;
      });
      
      if (onBidSubmit) {
        onBidSubmit(selectedRequest.id, parseFloat(bidPrice), bidMessage);
      }
      
      setShowBidModal(false);
      setSelectedRequest(null);
      setBidPrice('');
      setBidMessage('');
    }
  };

  const getJobStatus = (job: Appointment): JobStatus => {
    return job.jobStatus || 'accepted';
  };

  const updateJobStatus = (jobId: string, newStatus: JobStatus) => {
    if (onJobStatusChange) {
      onJobStatusChange(jobId, newStatus);
    }
  };

  const handleStartRide = (job: ActiveJob) => {
    updateJobStatus(job.id, 'en_route');
  };

  const handleNavigate = (job: ActiveJob) => {
    const address = encodeURIComponent(job.address);
    window.open(`https://waze.com/ul?q=${address}&navigate=yes`, '_blank');
  };

  const handleArrived = (job: ActiveJob) => {
    updateJobStatus(job.id, 'arrived');
  };

  const handleStartWork = (job: ActiveJob) => {
    updateJobStatus(job.id, 'in_progress');
  };

  const handleCompleteWork = (job: ActiveJob) => {
    updateJobStatus(job.id, 'completed');
  };

  const renderStatusButton = (job: ActiveJob) => {
    const status = getJobStatus(job);

    switch (status) {
      case 'accepted':
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStartRide(job);
            }}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-3"
          >
            <Car className="w-6 h-6" />
            התחל נסיעה
          </button>
        );

      case 'en_route':
        return (
          <div className="flex gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNavigate(job);
              }}
              className="flex-1 bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2"
            >
              <Navigation className="w-5 h-5" />
              נווט (Waze)
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleArrived(job);
              }}
              className="flex-1 bg-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
            >
              <MapPin className="w-5 h-5" />
              הגעתי
            </button>
          </div>
        );

      case 'arrived':
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStartWork(job);
            }}
            className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 flex items-center justify-center gap-3"
          >
            <Play className="w-6 h-6" />
            התחל עבודה
          </button>
        );

      case 'in_progress':
        return (
          <div className="space-y-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-2 text-yellow-700 font-bold text-sm">
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                עבודה בביצוע...
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCompleteWork(job);
              }}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              סיים עבודה
            </button>
          </div>
        );

      case 'completed':
        return (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-green-700 font-bold">
              <CheckCircle className="w-5 h-5" />
              עבודה הושלמה בהצלחה!
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStatusLabel = (status: JobStatus) => {
    const labels: Record<JobStatus, { text: string; color: string }> = {
      'accepted': { text: 'ממתין להתחלה', color: 'bg-blue-100 text-blue-700' },
      'en_route': { text: 'בדרך ללקוח', color: 'bg-green-100 text-green-700' },
      'arrived': { text: 'הגעתי למיקום', color: 'bg-orange-100 text-orange-700' },
      'in_progress': { text: 'בעבודה', color: 'bg-yellow-100 text-yellow-700' },
      'completed': { text: 'הושלם', color: 'bg-gray-100 text-gray-700' }
    };
    return labels[status] || labels['accepted'];
  };

  // Mock data for notifications and messages
  const recentNotifications = [
    { id: 1, text: 'לקוח חדש ביקש הצעת מחיר לתיקון שרברבות', time: 'לפני 5 דקות', unread: true },
    { id: 2, text: 'ההצעה שלך נתקבלה עבור תיקון חשמל', time: 'לפני 15 דקות', unread: true },
    { id: 3, text: 'לקוח דירג אותך 5 כוכבים', time: 'לפני שעה', unread: false }
  ];

  const recentMessages = [
    { id: 1, client: 'דוד כהן', message: 'תודה רבה על השירות המעולה!', time: 'לפני 10 דקות', unread: true, avatar: 'https://i.pravatar.cc/150?u=david' },
    { id: 2, client: 'שרה לוי', message: 'מתי אתה יכול להגיע?', time: 'לפני 30 דקות', unread: true, avatar: 'https://i.pravatar.cc/150?u=sarah' },
    { id: 3, client: 'יוסי מזרחי', message: 'קיבלתי את החשבונית, תודה', time: 'לפני שעתיים', unread: false, avatar: 'https://i.pravatar.cc/150?u=yossi' }
  ];

  const unreadNotifications = recentNotifications.filter(n => n.unread).length;
  const unreadMessages = recentMessages.filter(m => m.unread).length;
  const pendingTasksCount = tasks.filter(t => !t.completed).length;

  const handleAddNewTask = () => {
    if (newTaskContent.trim()) {
      const newTask: ProTask = {
        id: Date.now().toString(),
        content: newTaskContent.trim(),
        completed: false,
        createdAt: new Date()
      };
      setTasks(prev => [newTask, ...prev]);
      setNewTaskContent('');
      setIsAddingTask(false);
      if (onAddTask) {
        onAddTask();
      }
    }
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const handleTaskKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddNewTask();
    } else if (e.key === 'Escape') {
      setIsAddingTask(false);
      setNewTaskContent('');
    }
  };

  const handleStartAddingTask = () => {
    setIsAddingTask(true);
    setNewTaskContent('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10 px-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">בוקר טוב, ישראל</h2>
          <p className="text-gray-500">הנה מה שקורה בעסק שלך היום</p>
        </div>
      </div>

      {/* Quick Access Bar - Notifications, Messages, Notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">התראות</h3>
                  <p className="text-xs text-gray-500">עדכונים אחרונים</p>
                </div>
              </div>
              {unreadNotifications > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
                  {unreadNotifications}
                </span>
              )}
            </div>
          </div>
          <div className="p-3 max-h-60 overflow-y-auto">
            {recentNotifications.slice(0, 3).map((notif) => (
              <div
                key={notif.id}
                className={`p-3 rounded-lg mb-2 hover:bg-gray-50 cursor-pointer transition-colors ${
                  notif.unread ? 'bg-blue-50 border border-blue-100' : 'bg-white border border-gray-100'
                }`}
              >
                <div className="flex items-start gap-2">
                  {notif.unread && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 leading-relaxed">{notif.text}</p>
                    <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                  </div>
                </div>
              </div>
            ))}
            <button 
              onClick={onViewAllNotifications}
              className="w-full text-center text-sm text-blue-600 font-medium py-2 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <span>הצג הכל</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">הודעות</h3>
                  <p className="text-xs text-gray-500">צ'אט עם לקוחות</p>
                </div>
              </div>
              {unreadMessages > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
                  {unreadMessages}
                </span>
              )}
            </div>
          </div>
          <div className="p-3 max-h-60 overflow-y-auto">
            {recentMessages.slice(0, 3).map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-lg mb-2 hover:bg-gray-50 cursor-pointer transition-colors ${
                  msg.unread ? 'bg-green-50 border border-green-100' : 'bg-white border border-gray-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <ImageWithFallback
                    src={msg.avatar}
                    alt={msg.client}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-gray-900">{msg.client}</span>
                      <span className="text-xs text-gray-400">{msg.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{msg.message}</p>
                  </div>
                </div>
              </div>
            ))}
            <button 
              onClick={onOpenChat}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>פתח צ'אט בזמן אמת</span>
            </button>
          </div>
        </div>

        {/* Quick Notes */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">פתקים</h3>
                  <p className="text-xs text-gray-500">משימות ותזכורות</p>
                </div>
              </div>
              <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full">
                {pendingTasksCount}
              </span>
            </div>
          </div>
          <div className="p-3 max-h-60 overflow-y-auto">
            {isAddingTask && (
              <div className="p-3 rounded-lg mb-2 border border-purple-300 bg-purple-50">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTaskContent}
                    onChange={(e) => setNewTaskContent(e.target.value)}
                    onKeyDown={handleTaskKeyDown}
                    placeholder="הקלד משימה חדשה..."
                    autoFocus
                    className="flex-1 text-sm bg-white border border-purple-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAddNewTask}
                    className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingTask(false);
                      setNewTaskContent('');
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1 mr-1">Enter להוספה • Escape לביטול</p>
              </div>
            )}
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 rounded-lg mb-2 border transition-colors group ${
                  task.completed 
                    ? 'bg-gray-50 border-gray-200 opacity-60' 
                    : 'bg-purple-50 border-purple-100 hover:bg-purple-100'
                }`}
              >
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTask(task.id)}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <p className={`text-sm flex-1 ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {task.content}
                  </p>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {!isAddingTask && (
              <button 
                onClick={handleStartAddingTask}
                className="w-full text-center text-sm text-purple-600 font-medium py-2 hover:bg-purple-50 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <span>+ הוסף משימה</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">₪{monthlyRevenue.toLocaleString()}</div>
          <div className="text-xs text-gray-500">הכנסות החודש</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">85%</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{completedJobs}</div>
          <div className="text-xs text-gray-500">עבודות שהושלמו</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600">
              <Star className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full">48 ביקורות</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">4.9</div>
          <div className="text-xs text-gray-500">דירוג ממוצע</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">+5</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">143</div>
          <div className="text-xs text-gray-500">צפיות בפרופיל</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`flex-1 py-4 px-6 font-bold text-center transition-all relative ${
              activeTab === 'opportunities'
                ? 'text-blue-600 bg-blue-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>הזדמנויות חדשות</span>
              {(newRequests.length + pendingRequests.length) > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] animate-pulse">
                  {newRequests.length + pendingRequests.length}
                </span>
              )}
            </div>
            {activeTab === 'opportunities' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 py-4 px-6 font-bold text-center transition-all relative ${
              activeTab === 'schedule'
                ? 'text-green-600 bg-green-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>לוח הזמנים שלי</span>
              {upcomingJobs.length > 0 && (
                <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px]">
                  {upcomingJobs.length}
                </span>
              )}
            </div>
            {activeTab === 'schedule' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"></div>
            )}
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'opportunities' && (
            <div className="space-y-4">
              {/* Closed/Sold Requests Section */}
              {closedRequests.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-500 flex items-center gap-2">
                    <Ban className="w-4 h-4" />
                    מכירות שנסגרו
                  </h3>
                  {closedRequests.map((request) => (
                    <div
                      key={request.id}
                      className="border border-gray-200 rounded-2xl p-4 bg-gray-50 relative overflow-hidden"
                    >
                      <div className="absolute top-3 left-3">
                        <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <Ban className="w-3 h-3" />
                          נמכר
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4 opacity-60">
                        <ImageWithFallback
                          src={request.clientImage}
                          alt={request.clientName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-gray-900">{request.clientName}</h4>
                            <span className="text-xs text-gray-400">{request.distance} ק"מ</span>
                          </div>
                          <p className="text-sm text-gray-600">{request.service}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="text-sm">
                              <span className="text-gray-500">ההצעה שלך: </span>
                              <span className="font-bold text-gray-700">₪{myBids.get(request.id)?.price}</span>
                            </div>
                            {request.finalPrice && (
                              <div className="text-sm">
                                <span className="text-gray-500">נמכר ב: </span>
                                <span className="font-bold text-red-600">₪{request.finalPrice}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 my-4"></div>
                </div>
              )}

              {/* New Requests Section */}
              <div className="space-y-3 mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <span>קומנדות חדשות</span>
                  {newRequests.length > 0 && (
                    <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {newRequests.length}
                    </span>
                  )}
                </h3>
                
                {newRequests.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <Briefcase className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-500">אין קומנדות חדשות כרגע</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {newRequests.map((request) => (
                  <div
                    key={request.id}
                    className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all bg-white"
                  >
                    {/* Header Row: Price + Client Info + Badges */}
                    <div className="p-5 pb-0">
                      <div className="flex items-start justify-between">
                        {/* Price Section - Left (RTL: appears on right visually) */}
                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-xl border border-blue-100">
                          <Settings className="w-4 h-4 text-blue-600" />
                          <div>
                            <div className="text-xl font-bold text-blue-700">₪{request.suggestedPrice}</div>
                            <div className="text-[10px] text-blue-500">מחיר מומלץ</div>
                          </div>
                        </div>

                        {/* Client Info - Right (RTL: appears on left visually) */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-gray-900 text-lg">{request.clientName}</h4>
                              {/* Status Badges */}
                              {request.status === 'new' && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                  חדש
                                </span>
                              )}
                              {request.urgency === 'immediate' && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  דחוף
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
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Problem Summary - Client's Request */}
                    <div className="px-5 pt-3">
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                              <span>הבעיה של הלקוח</span>
                              {request.urgency === 'immediate' && (
                                <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                                  דחוף
                                </span>
                              )}
                            </h5>
                            <p className="text-sm text-gray-700 leading-relaxed mb-2">
                              <strong>{request.service}</strong> • {request.clientMessage || 'הלקוח מבקש שירות מקצועי'}
                            </p>
                            {request.aiAnalysis && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="bg-white text-orange-700 text-xs px-2 py-1 rounded-md border border-orange-200 font-medium">
                                  {request.aiAnalysis.detectedIssues?.length || 0} בעיות זוהו
                                </span>
                                <span className="bg-white text-blue-700 text-xs px-2 py-1 rounded-md border border-blue-200 font-medium">
                                  {request.aiAnalysis.estimatedMaterials?.length || 0} חומרים נדרשים
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
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
                            <div className="font-medium text-sm">{request.distance} ק"מ</div>
                          </div>
                        </div>
                        <div className="h-8 w-px bg-gray-200"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-green-500">
                            <Car className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[10px] text-gray-500">זמן הגעה</div>
                            <div className="font-medium text-sm">{Math.round(request.distance * 3 + 5)} דק׳</div>
                          </div>
                        </div>
                        <div className="h-8 w-px bg-gray-200"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-500">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[10px] text-gray-500">משך עבודה</div>
                            <div className="font-medium text-sm">{request.estimatedDuration} שעות</div>
                          </div>
                        </div>
                        <div className="h-8 w-px bg-gray-200"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-purple-500">
                            <Brain className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[10px] text-gray-500">דיוק AI</div>
                            <div className="font-medium text-sm">{Math.round((request.aiAnalysis?.confidenceScore || 0) * 100)}%</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Scheduled Time - for planned requests */}
                    {request.urgency === 'planned' && request.scheduledTime && (
                      <div className="px-5 pb-3">
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-xs text-blue-600 font-medium">מועד מבוקש</div>
                              <div className="font-bold text-gray-900">
                                {request.requestedDate} בשעה {request.scheduledTime}
                              </div>
                            </div>
                          </div>
                          <button className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-white px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors">
                            <Edit3 className="w-4 h-4" />
                            בקש שינוי
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Client Message */}
                    {request.clientMessage && (
                      <div className="px-5 pb-3">
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                          <div className="flex items-center gap-2 text-amber-700 mb-2 font-medium text-sm">
                            <MessageCircle className="w-4 h-4" />
                            <span>הודעה מהלקוח</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            "{request.clientMessage}"
                          </p>
                        </div>
                      </div>
                    )}

                    {/* AI Analysis Section */}
                    <div className="px-5 pb-3">
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-purple-700 mb-2 font-medium">
                          <Brain className="w-5 h-5" />
                          <span>ניתוח AI זמין</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed mb-3">
                          {request.aiAnalysis?.summary || request.service}
                        </p>
                        {/* Category Badges with Counters */}
                        <div className="flex flex-wrap gap-2">
                          {request.aiAnalysis?.detectedIssues && request.aiAnalysis.detectedIssues.length > 0 && (
                            <span className="bg-white px-3 py-1.5 rounded-lg text-sm font-medium text-orange-700 shadow-sm border border-orange-100 flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4" />
                              {request.aiAnalysis.detectedIssues.length} בעיות זוהו
                            </span>
                          )}
                          {request.aiAnalysis?.estimatedMaterials && request.aiAnalysis.estimatedMaterials.length > 0 && (
                            <span className="bg-white px-3 py-1.5 rounded-lg text-sm font-medium text-blue-700 shadow-sm border border-blue-100 flex items-center gap-1.5">
                              <Package className="w-4 h-4" />
                              {request.aiAnalysis.estimatedMaterials.length} חומרים נדרשים
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Photo Gallery */}
                    {request.photos && request.photos.length > 0 && (
                      <div className="px-5 pb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <ImageIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">תמונות הבעיה</span>
                        </div>
                        <div className="flex gap-2">
                          {request.photos.slice(0, 3).map((photo, index) => (
                            <div key={index} className="relative">
                              <img
                                src={photo}
                                alt={`תמונה ${index + 1}`}
                                className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                              />
                            </div>
                          ))}
                          {request.photos.length > 3 && (
                            <div className="w-20 h-20 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                              <div className="text-center">
                                <span className="text-lg font-bold text-gray-600">+{request.photos.length - 3}</span>
                                <div className="text-[10px] text-gray-500">עוד</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* My Bid Status - Modified for Orange State */}
                    {myBids.has(request.id) && (() => {
                      const bid = myBids.get(request.id)!;
                      const isModified = bid.isModified;
                      return (
                        <div className="px-5 pb-3">
                          <div className={`${isModified ? 'bg-orange-50 border-2 border-orange-300' : 'bg-green-50 border border-green-200'} rounded-lg p-2.5 flex items-center gap-2`}>
                            <CheckCircle className={`w-4 h-4 ${isModified ? 'text-orange-600' : 'text-green-600'} flex-shrink-0`} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold ${isModified ? 'text-orange-900' : 'text-green-900'}`}>
                                  ההצעה שלך: ₪{bid.price}
                                </span>
                                {isModified && (
                                  <span className="px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-700 font-medium">עודכן</span>
                                )}
                              </div>
                              <div className={`text-xs ${isModified ? 'text-orange-600' : 'text-green-600'} mt-0.5`}>
                                אתה יכול לשנות את ההצעה שלך עד שהלקוח יבחר
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Best Offer Section */}
                    {request.competitorStats && request.competitorStats.totalBids > 0 && (
                      <div className="px-5 pb-3">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <Star className="w-5 h-5 text-green-600 fill-green-600" />
                              </div>
                              <div className="flex-1">
                                <h5 className="font-bold text-gray-900 mb-1">ההצעה המובילה</h5>
                                <div className="flex items-center gap-4 mb-2">
                                  <div>
                                    <div className="text-2xl font-bold text-green-700">
                                      ₪{request.competitorStats.minPrice || request.suggestedPrice}
                                    </div>
                                    <div className="text-xs text-gray-500">המחיר הנמוך ביותר</div>
                                  </div>
                                  <div className="h-8 w-px bg-green-200"></div>
                                  <div>
                                    <div className="flex items-center gap-1">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                      ))}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">מקצוען מדורג 5.0</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <Users className="w-3.5 h-3.5" />
                                  <span>{request.competitorStats.totalBids} מקצוענים מתחרים</span>
                                  <span>•</span>
                                  <span>
                                    ממוצע: ₪{request.competitorStats.minPrice && request.competitorStats.maxPrice 
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

                    {/* Footer: Competitor Stats */}
                    <div className="px-5 pb-4">
                      <div className="flex items-center justify-between text-sm text-gray-500 py-2 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{request.competitorStats?.totalBids || 0} הצעות נוספות הוגשו</span>
                        </div>
                        {request.competitorStats && (
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            <span>טווח מחירים: ₪{request.competitorStats.minPrice} - ₪{request.competitorStats.maxPrice}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="px-5 pb-6 pt-2">
                      <button
                        onClick={() => handleOpenBidModal(request)}
                        className={`w-full ${
                          myBids.has(request.id) 
                            ? 'bg-green-600 hover:bg-green-700 shadow-green-200' 
                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                        } text-white py-3.5 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2`}
                      >
                        <Send className="w-5 h-5" />
                        {myBids.has(request.id) ? 'שנה הצעה' : 'הגש הצעה'}
                      </button>
                    </div>
                  </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Requests Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span>דמאנדות בתהליך</span>
                  {pendingRequests.length > 0 && (
                    <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {pendingRequests.length}
                    </span>
                  )}
                </h3>
                
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <Clock className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-500">אין דמאנדות בתהליך</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-orange-200 transition-all bg-white"
                  >
                    {/* Header Row: Price + Client Info + Badges */}
                    <div className="p-5 pb-0">
                      <div className="flex items-start justify-between">
                        {/* Price Section - Left (RTL: appears on right visually) */}
                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-xl border border-blue-100">
                          <Settings className="w-4 h-4 text-blue-600" />
                          <div>
                            <div className="text-xl font-bold text-blue-700">₪{request.suggestedPrice}</div>
                            <div className="text-[10px] text-blue-500">מחיר מומלץ</div>
                          </div>
                        </div>

                        {/* Client Info - Right (RTL: appears on left visually) */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-gray-900 text-lg">{request.clientName}</h4>
                              {/* Status Badges */}
                              {request.status === 'new' && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                  חדש
                                </span>
                              )}
                              {request.urgency === 'immediate' && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  דחוף
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
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Problem Summary - Client's Request */}
                    <div className="px-5 pt-3">
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                              <span>הבעיה של הלקוח</span>
                              {request.urgency === 'immediate' && (
                                <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                                  דחוף
                                </span>
                              )}
                            </h5>
                            <p className="text-sm text-gray-700 leading-relaxed mb-2">
                              <strong>{request.service}</strong> • {request.clientMessage || 'הלקוח מבקש שירות מקצועי'}
                            </p>
                            {request.aiAnalysis && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="bg-white text-orange-700 text-xs px-2 py-1 rounded-md border border-orange-200 font-medium">
                                  {request.aiAnalysis.detectedIssues?.length || 0} בעיות זוהו
                                </span>
                                <span className="bg-white text-blue-700 text-xs px-2 py-1 rounded-md border border-blue-200 font-medium">
                                  {request.aiAnalysis.estimatedMaterials?.length || 0} חומרים נדרשים
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
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
                            <div className="font-medium text-sm">{request.distance} ק"מ</div>
                          </div>
                        </div>
                        <div className="h-8 w-px bg-gray-200"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-green-500">
                            <Car className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[10px] text-gray-500">זמן הגעה</div>
                            <div className="font-medium text-sm">{Math.round(request.distance * 3 + 5)} דק׳</div>
                          </div>
                        </div>
                        <div className="h-8 w-px bg-gray-200"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-500">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[10px] text-gray-500">משך עבודה</div>
                            <div className="font-medium text-sm">{request.estimatedDuration} שעות</div>
                          </div>
                        </div>
                        <div className="h-8 w-px bg-gray-200"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-purple-500">
                            <Brain className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[10px] text-gray-500">דיוק AI</div>
                            <div className="font-medium text-sm">{Math.round((request.aiAnalysis?.confidenceScore || 0) * 100)}%</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Scheduled Time - for planned requests */}
                    {request.urgency === 'planned' && request.scheduledTime && (
                      <div className="px-5 pb-3">
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-xs text-blue-600 font-medium">מועד מבוקש</div>
                              <div className="font-bold text-gray-900">
                                {request.requestedDate} בשעה {request.scheduledTime}
                              </div>
                            </div>
                          </div>
                          <button className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-white px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors">
                            <Edit3 className="w-4 h-4" />
                            בקש שינוי
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Client Message */}
                    {request.clientMessage && (
                      <div className="px-5 pb-3">
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                          <div className="flex items-center gap-2 text-amber-700 mb-2 font-medium text-sm">
                            <MessageCircle className="w-4 h-4" />
                            <span>הודעה מהלקוח</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            "{request.clientMessage}"
                          </p>
                        </div>
                      </div>
                    )}

                    {/* AI Analysis Section */}
                    <div className="px-5 pb-3">
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-purple-700 mb-2 font-medium">
                          <Brain className="w-5 h-5" />
                          <span>ניתוח AI זמין</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed mb-3">
                          {request.aiAnalysis?.summary || request.service}
                        </p>
                        {/* Category Badges with Counters */}
                        <div className="flex flex-wrap gap-2">
                          {request.aiAnalysis?.detectedIssues && request.aiAnalysis.detectedIssues.length > 0 && (
                            <span className="bg-white px-3 py-1.5 rounded-lg text-sm font-medium text-orange-700 shadow-sm border border-orange-100 flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4" />
                              {request.aiAnalysis.detectedIssues.length} בעיות זוהו
                            </span>
                          )}
                          {request.aiAnalysis?.estimatedMaterials && request.aiAnalysis.estimatedMaterials.length > 0 && (
                            <span className="bg-white px-3 py-1.5 rounded-lg text-sm font-medium text-blue-700 shadow-sm border border-blue-100 flex items-center gap-1.5">
                              <Package className="w-4 h-4" />
                              {request.aiAnalysis.estimatedMaterials.length} חומרים נדרשים
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Photo Gallery */}
                    {request.photos && request.photos.length > 0 && (
                      <div className="px-5 pb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <ImageIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">תמונות הבעיה</span>
                        </div>
                        <div className="flex gap-2">
                          {request.photos.slice(0, 3).map((photo, index) => (
                            <div key={index} className="relative">
                              <img
                                src={photo}
                                alt={`תמונה ${index + 1}`}
                                className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                              />
                            </div>
                          ))}
                          {request.photos.length > 3 && (
                            <div className="w-20 h-20 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                              <div className="text-center">
                                <span className="text-lg font-bold text-gray-600">+{request.photos.length - 3}</span>
                                <div className="text-[10px] text-gray-500">עוד</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* My Bid Status - Modified for Orange State */}
                    {myBids.has(request.id) && (() => {
                      const bid = myBids.get(request.id)!;
                      const isModified = bid.isModified;
                      return (
                        <div className="px-5 pb-3">
                          <div className={`${isModified ? 'bg-orange-50 border-2 border-orange-300' : 'bg-green-50 border border-green-200'} rounded-lg p-2.5 flex items-center gap-2`}>
                            <CheckCircle className={`w-4 h-4 ${isModified ? 'text-orange-600' : 'text-green-600'} flex-shrink-0`} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold ${isModified ? 'text-orange-900' : 'text-green-900'}`}>
                                  ההצעה שלך: ₪{bid.price}
                                </span>
                                {isModified && (
                                  <span className="px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-700 font-medium">עודכן</span>
                                )}
                              </div>
                              <div className={`text-xs ${isModified ? 'text-orange-600' : 'text-green-600'} mt-0.5`}>
                                אתה יכול לשנות את ההצעה שלך עד שהלקוח יבחר
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Best Offer Section */}
                    {request.competitorStats && request.competitorStats.totalBids > 0 && (
                      <div className="px-5 pb-3">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <Star className="w-5 h-5 text-green-600 fill-green-600" />
                              </div>
                              <div className="flex-1">
                                <h5 className="font-bold text-gray-900 mb-1">ההצעה המובילה</h5>
                                <div className="flex items-center gap-4 mb-2">
                                  <div>
                                    <div className="text-2xl font-bold text-green-700">
                                      ₪{request.competitorStats.minPrice || request.suggestedPrice}
                                    </div>
                                    <div className="text-xs text-gray-500">המחיר הנמוך ביותר</div>
                                  </div>
                                  <div className="h-8 w-px bg-green-200"></div>
                                  <div>
                                    <div className="flex items-center gap-1">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                      ))}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">מקצוען מדורג 5.0</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <Users className="w-3.5 h-3.5" />
                                  <span>{request.competitorStats.totalBids} מקצוענים מתחרים</span>
                                  <span>•</span>
                                  <span>
                                    ממוצע: ₪{request.competitorStats.minPrice && request.competitorStats.maxPrice 
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

                    {/* Footer: Competitor Stats */}
                    <div className="px-5 pb-4">
                      <div className="flex items-center justify-between text-sm text-gray-500 py-2 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{request.competitorStats?.totalBids || 0} הצעות נוספות הוגשו</span>
                        </div>
                        {request.competitorStats && (
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            <span>טווח מחירים: ₪{request.competitorStats.minPrice} - ₪{request.competitorStats.maxPrice}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="px-5 pb-6 pt-2">
                      <button
                        onClick={() => handleOpenBidModal(request)}
                        className={`w-full ${
                          myBids.has(request.id) 
                            ? 'bg-green-600 hover:bg-green-700 shadow-green-200' 
                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                        } text-white py-3.5 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2`}
                      >
                        <Send className="w-5 h-5" />
                        {myBids.has(request.id) ? 'שנה הצעה' : 'הגש הצעה'}
                      </button>
                    </div>
                  </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-4">
              {upcomingJobs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-10 h-10 text-gray-300" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">אין משימות מתוכננות</h4>
                  <p className="text-gray-500 mt-2">כאשר תקבל עבודות חדשות, הן יופיעו כאן.</p>
                  <button 
                    onClick={() => setActiveTab('opportunities')}
                    className="mt-4 text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
                  >
                    עבור להזדמנויות חדשות
                  </button>
                </div>
              ) : (
                upcomingJobs.map((job) => {
                  const activeJob = job as ActiveJob;
                  const currentStatus = getJobStatus(job);
                  const statusInfo = getStatusLabel(currentStatus);

                  return (
                    <div
                      key={job.id}
                      className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all bg-white"
                    >
                      <div className="p-5">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="relative">
                            <ImageWithFallback
                              src={(activeJob as any).clientImage || `https://i.pravatar.cc/150?u=${job.id}`}
                              alt={job.clientName || job.client}
                              className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                            />
                            <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow-sm">
                              <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-bold text-gray-900 text-lg">{job.clientName || (job as any).client}</h4>
                              <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusInfo.color}`}>
                                {statusInfo.text}
                              </span>
                            </div>
                            
                            <p className="text-blue-600 font-medium mb-2">{job.service}</p>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span>{job.time} • {job.duration} שעות</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="truncate">{(activeJob as any).distance || '2.5 ק"מ'}</span>
                              </div>
                            </div>

                            <div className="mt-3 p-2 bg-gray-50 rounded-lg flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{job.address}</span>
                            </div>
                          </div>

                          <div className="text-left">
                            <div className="text-xl font-bold text-gray-900">₪{job.price}</div>
                            <div className="text-xs text-gray-400">מחיר עבודה</div>
                          </div>
                        </div>

                        {/* AI Analysis Section */}
                        {(activeJob as any).aiAnalysis && (
                          <div className="mb-4">
                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-4">
                              <div className="flex items-center gap-2 text-purple-700 mb-2 font-medium">
                                <Brain className="w-5 h-5" />
                                <span>ניתוח AI</span>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                                {(activeJob as any).aiAnalysis.summary}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {(activeJob as any).aiAnalysis.detectedIssues && (activeJob as any).aiAnalysis.detectedIssues.length > 0 && (
                                  <span className="bg-white px-3 py-1.5 rounded-lg text-sm font-medium text-orange-700 shadow-sm border border-orange-100 flex items-center gap-1.5">
                                    <AlertTriangle className="w-4 h-4" />
                                    {(activeJob as any).aiAnalysis.detectedIssues.length} בעיות זוהו
                                  </span>
                                )}
                                {(activeJob as any).aiAnalysis.estimatedMaterials && (activeJob as any).aiAnalysis.estimatedMaterials.length > 0 && (
                                  <span className="bg-white px-3 py-1.5 rounded-lg text-sm font-medium text-blue-700 shadow-sm border border-blue-100 flex items-center gap-1.5">
                                    <Package className="w-4 h-4" />
                                    {(activeJob as any).aiAnalysis.estimatedMaterials.length} חומרים נדרשים
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Photo Gallery */}
                        {(activeJob as any).photos && (activeJob as any).photos.length > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <ImageIcon className="w-4 h-4 text-gray-400" />
                              <span className="text-xs text-gray-500">תמונות מהלקוח</span>
                            </div>
                            <div className="flex gap-2">
                              {(activeJob as any).photos.slice(0, 4).map((photo: string, index: number) => (
                                <div key={index} className="relative">
                                  <img
                                    src={photo}
                                    alt={`תמונה ${index + 1}`}
                                    className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                                  />
                                </div>
                              ))}
                              {(activeJob as any).photos.length > 4 && (
                                <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                                  <div className="text-center">
                                    <span className="text-sm font-bold text-gray-600">+{(activeJob as any).photos.length - 4}</span>
                                    <div className="text-[8px] text-gray-500">עוד</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Client Message */}
                        {(activeJob as any).clientMessage && (
                          <div className="mb-4">
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                              <div className="flex items-center gap-2 text-amber-700 mb-1 font-medium text-sm">
                                <MessageCircle className="w-4 h-4" />
                                <span>הודעה מהלקוח</span>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                "{(activeJob as any).clientMessage}"
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 mb-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `tel:${(activeJob as any).phone || '0501234567'}`;
                            }}
                            className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 border border-gray-200"
                          >
                            <Phone className="w-4 h-4" />
                            התקשר
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 border border-gray-200"
                          >
                            <MessageSquare className="w-4 h-4" />
                            הודעה
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setJobToCancel(job);
                            }}
                            className="bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 py-2.5 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 border border-gray-200 hover:border-red-200"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        </div>

                        {renderStatusButton(activeJob)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bid Proposal Modal */}
      {selectedRequest && (
        <BidProposalModal
          request={selectedRequest}
          isOpen={showBidModal}
          onClose={() => {
            setShowBidModal(false);
            setSelectedRequest(null);
          }}
          onSubmitBid={(price, message) => {
            setMyBids(prev => {
              const newMap = new Map(prev);
              newMap.set(selectedRequest.id, { price, message });
              return newMap;
            });
            if (onBidSubmit) {
              onBidSubmit(selectedRequest.id, price, message);
            }
          }}
          existingBid={myBids.get(selectedRequest.id)}
        />
      )}

      <AlertDialog open={!!jobToCancel} onOpenChange={(open: boolean) => !open && setJobToCancel(null)}>
        <AlertDialogContent className="text-right" dir="rtl">
          <AlertDialogHeader className="text-right space-y-2">
            <AlertDialogTitle className="text-right text-xl font-bold text-gray-900">ביטול משימה</AlertDialogTitle>
            <AlertDialogDescription className="text-right text-gray-500">
              האם אתה בטוח שברצונך לבטל את המשימה של <span className="font-bold text-gray-900">{jobToCancel?.clientName}</span>?
              <br />
              פעולה זו לא ניתנת לביטול והיא עשויה להשפיע על הדירוג שלך.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 sm:justify-start">
            <AlertDialogCancel onClick={() => setJobToCancel(null)} className="mt-0">ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelConfirm} className="bg-red-600 hover:bg-red-700 text-white">
              אשר ביטול
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
