import { useState, useEffect, useRef, createContext, useContext, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  MessageSquare, 
  LifeBuoy, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  MoreVertical, 
  TrendingUp, 
  DollarSign, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus,
  Trash2,
  Filter,
  Lock,
  Send,
  Loader2,
  FileText,
  Shield,
  Ban,
  UserCog,
  Key,
  Clock,
  Navigation2,
  Activity,
  Image,
  ChevronLeft,
  ChevronRight,
  Upload,
  X
} from 'lucide-react';
import { ExcelImporter } from './ExcelImporter';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../lib/supabase';
import { Pro, Order, SupportTicket as DBSupportTicket, Profile } from '../../types/database';
import { 
  useAdminBookings, 
  AdminOrder, 
  AdminStats,
  AdminCategory,
  AdminMessage,
  AdminPro,
  mapJobToAdminOrder
} from '../../hooks/useAdminBookings';
import { useOrderStore } from '../../stores/OrderStore';
import { SupportTicket } from '../../types/adminTypes';
import { OrderDetailsTower } from './OrderDetailsTower';
import { useAdminActions } from '../../hooks/useAdminActions';
import { AdminActionModal } from './modals/AdminActionModal';
import { toast } from 'sonner';

interface StatusCounts {
  searching: number;
  pending_acceptance: number;
  accepted: number;
  en_route: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  total: number;
}

interface AdminDataContextType {
  orders: AdminOrder[];
  stats: AdminStats;
  supportTickets: (SupportTicket & { userName: string })[];
  categories: AdminCategory[];
  messages: AdminMessage[];
  pros: AdminPro[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  onOrderClick?: (orderId: string) => void;
  adminActions: ReturnType<typeof useAdminActions>;
  statusCounts: StatusCounts;
}

const AdminDataContext = createContext<AdminDataContextType | null>(null);

function useAdminData() {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within AdminDataContext.Provider');
  }
  return context;
}

// --- COMPONENTS ---

interface AdminDashboardProps {
  onBack?: () => void;
  onNavigate?: (view: string) => void;
}

export function AdminDashboard({ onBack, onNavigate }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  const adminData = useAdminBookings();
  const adminActions = useAdminActions();
  
  const { orders: storeOrders, getAdminOrders, cancelOrder, updateOrderStatus } = useOrderStore();
  
  const ordersFromStore = useMemo(() => {
    return getAdminOrders().map(mapJobToAdminOrder);
  }, [storeOrders]);
  
  const combinedOrders = useMemo(() => {
    const storeOrderIds = new Set(ordersFromStore.map(o => o.id));
    const uniqueAdminOrders = adminData.orders.filter(o => !storeOrderIds.has(o.id));
    return [...ordersFromStore, ...uniqueAdminOrders];
  }, [ordersFromStore, adminData.orders]);
  
  const statusCounts = useMemo(() => {
    const allJobs = getAdminOrders();
    const counts: StatusCounts = {
      searching: 0,
      pending_acceptance: 0,
      accepted: 0,
      en_route: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      total: allJobs.length
    };
    allJobs.forEach(job => {
      if (counts[job.status as keyof Omit<StatusCounts, 'total'>] !== undefined) {
        counts[job.status as keyof Omit<StatusCounts, 'total'>]++;
      }
    });
    return counts;
  }, [storeOrders]);
  
  const enhancedStats = useMemo(() => ({
    ...adminData.stats,
    totalOrders: statusCounts.total || adminData.stats.totalOrders,
    activeOrders: statusCounts.searching + statusCounts.pending_acceptance + statusCounts.accepted + statusCounts.en_route + statusCounts.in_progress || adminData.stats.activeOrders,
    completedOrders: statusCounts.completed || adminData.stats.completedOrders,
    cancelledOrders: statusCounts.cancelled || adminData.stats.cancelledOrders,
  }), [adminData.stats, statusCounts]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.toLowerCase() === 'yonathan.egr@gmail.com' && password === '123456789') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('שם משתמש או סיסמה שגויים');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab />;
      case 'orders': return <OrdersTab />;
      case 'categories': return <CategoriesTab />;
      case 'support': return <SupportTab />;
      case 'messages': return <MessagesTab />;
      case 'pros': return <ProsTab />;
      default: return <OverviewTab />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-600/20">
              <span className="text-3xl font-bold">B</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">כניסה למערכת ניהול</h2>
            <p className="text-gray-500 mt-2">אנא הזן את פרטי ההתחברות שלך</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">אימייל</label>
              <div className="relative">
                <Users className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="your@email.com"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">סיסמה</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="••••••••"
                  dir="ltr"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center font-medium">
                {error}
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              התחבר
            </button>

            <button 
              type="button"
              onClick={onBack ? onBack : () => window.location.href = '/'}
              className="w-full text-gray-500 py-2 text-sm hover:text-gray-700 transition-colors"
            >
              חזרה לאתר
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (selectedOrderId) {
    return (
      <OrderDetailsTower
        orderId={selectedOrderId}
        onBack={() => setSelectedOrderId(null)}
      />
    );
  }

  return (
    <AdminDataContext.Provider value={{
      ...adminData,
      orders: combinedOrders,
      stats: enhancedStats,
      onOrderClick: setSelectedOrderId,
      adminActions,
      statusCounts
    }}>
    <div className="min-h-screen bg-gray-50 flex flex-row-reverse" dir="rtl">
      <AdminActionModal
        isOpen={adminActions.isModalOpen}
        onClose={adminActions.closeModal}
        currentAction={adminActions.currentAction}
        adminActions={adminActions}
      />
      {/* Global Loading Indicator */}
      {adminData.loading && (
        <div className="fixed top-4 left-4 z-[100] bg-white px-4 py-2 rounded-xl shadow-lg border border-gray-200 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span className="text-sm text-gray-600">טוען נתונים...</span>
        </div>
      )}
      
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-l border-gray-200 flex flex-col transition-all duration-300 fixed right-0 top-0 bottom-0 z-50 shadow-sm`}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-100">
          <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">B</div>
            {isSidebarOpen && <span>Admin</span>}
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="לוח בקרה" 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')}
            expanded={isSidebarOpen}
          />
          <SidebarItem 
            icon={<ShoppingBag size={20} />} 
            label="הזמנות" 
            active={activeTab === 'orders'} 
            onClick={() => setActiveTab('orders')}
            expanded={isSidebarOpen}
          />
          <SidebarItem 
            icon={<Users size={20} />} 
            label="אנשי מקצוע" 
            active={activeTab === 'pros'} 
            onClick={() => setActiveTab('pros')}
            expanded={isSidebarOpen}
          />
          <SidebarItem 
            icon={<MoreVertical size={20} />} 
            label="קטגוריות" 
            active={activeTab === 'categories'} 
            onClick={() => setActiveTab('categories')}
            expanded={isSidebarOpen}
          />
          <SidebarItem 
            icon={<LifeBuoy size={20} />} 
            label="תמכה" 
            active={activeTab === 'support'} 
            onClick={() => setActiveTab('support')}
            expanded={isSidebarOpen}
            badge={2}
          />
          <SidebarItem 
            icon={<MessageSquare size={20} />} 
            label="הודעות" 
            active={activeTab === 'messages'} 
            onClick={() => setActiveTab('messages')}
            expanded={isSidebarOpen}
          />
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={onBack ? onBack : () => window.location.href = '/'}
            className={`flex items-center gap-3 text-gray-500 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50 w-full ${!isSidebarOpen && 'justify-center'}`}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium text-sm">חזרה לאתר</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'mr-64' : 'mr-20'}`}>
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-800">
              {activeTab === 'overview' && 'לוח בקרה ראשי'}
              {activeTab === 'orders' && 'ניהול הזמנות'}
              {activeTab === 'categories' && 'ניהול קטגוריות'}
              {activeTab === 'support' && 'מרכז תמיכה'}
              {activeTab === 'messages' && 'תיבת הודעות'}
              {activeTab === 'pros' && 'ניהול אנשי מקצוע'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="חיפוש מהיר..." 
                className="pr-9 pl-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none w-64"
              />
            </div>
            <button className="relative p-2 rounded-full hover:bg-gray-100 text-gray-500">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="flex items-center gap-3 border-r border-gray-200 pr-4 mr-2">
              <div className="text-left hidden sm:block">
                <div className="text-sm font-bold text-gray-900">Admin User</div>
                <div className="text-xs text-gray-500">מנהל מערכת</div>
              </div>
              <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">A</div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
    </AdminDataContext.Provider>
  );
}

// --- SUB-COMPONENTS ---

function SidebarItem({ icon, label, active, onClick, expanded, badge }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all mb-1 ${
        active 
          ? 'bg-blue-50 text-blue-700 font-bold shadow-sm' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      } ${!expanded && 'justify-center'}`}
    >
      <div className="relative">
        {icon}
        {badge && !expanded && (
          <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center border-2 border-white">
            {badge}
          </span>
        )}
      </div>
      {expanded && (
        <>
          <span className="text-sm">{label}</span>
          {badge && (
            <span className="mr-auto bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </>
      )}
    </button>
  );
}

function OverviewTab() {
  const { stats: adminStats, loading, statusCounts } = useAdminData();
  
  const stats = [
    { 
      label: 'הכנסות חודשיות', 
      value: `₪${adminStats.monthlyRevenue.toLocaleString()}`, 
      change: adminStats.revenueChange, 
      icon: <DollarSign className="w-5 h-5 text-green-600" />, 
      bg: 'bg-green-50' 
    },
    { 
      label: 'הזמנות פעילות', 
      value: adminStats.activeOrders.toString(), 
      change: adminStats.ordersChange, 
      icon: <ShoppingBag className="w-5 h-5 text-blue-600" />, 
      bg: 'bg-blue-50' 
    },
    { 
      label: 'משתמשים חדשים', 
      value: adminStats.newUsersThisMonth.toString(), 
      change: adminStats.usersChange, 
      icon: <Users className="w-5 h-5 text-purple-600" />, 
      bg: 'bg-purple-50' 
    },
    { 
      label: 'קריאות שירות', 
      value: adminStats.openSupportTickets.toString(), 
      change: adminStats.ticketsChange, 
      icon: <AlertCircle className="w-5 h-5 text-orange-600" />, 
      bg: 'bg-orange-50' 
    },
  ];

  const data = [
    { name: 'ינו', orders: 400 },
    { name: 'פבר', orders: 300 },
    { name: 'מרץ', orders: 550 },
    { name: 'אפר', orders: 450 },
    { name: 'מאי', orders: 600 },
    { name: 'יוני', orders: 750 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>{stat.icon}</div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${stat.change.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
      
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">סטטוס הזמנות בזמן אמת</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Search className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">מחפשים</span>
            </div>
            <span className="text-2xl font-black text-blue-800">{statusCounts.searching}</span>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 text-center border border-yellow-100">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="text-xs font-medium text-yellow-700">ממתינים</span>
            </div>
            <span className="text-2xl font-black text-yellow-800">{statusCounts.pending_acceptance}</span>
          </div>
          <div className="bg-indigo-50 rounded-xl p-4 text-center border border-indigo-100">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-medium text-indigo-700">אושרו</span>
            </div>
            <span className="text-2xl font-black text-indigo-800">{statusCounts.accepted}</span>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Navigation2 className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-purple-700">בדרך</span>
            </div>
            <span className="text-2xl font-black text-purple-800">{statusCounts.en_route}</span>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 text-center border border-orange-100">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Activity className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-medium text-orange-700">בביצוע</span>
            </div>
            <span className="text-2xl font-black text-orange-800">{statusCounts.in_progress}</span>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">הושלמו</span>
            </div>
            <span className="text-2xl font-black text-green-800">{statusCounts.completed}</span>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-xs font-medium text-red-700">בוטלו</span>
            </div>
            <span className="text-2xl font-black text-red-800">{statusCounts.cancelled}</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">סה״כ הזמנות:</span>
          <span className="text-lg font-bold text-gray-900">{statusCounts.total}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-w-0">
          <h3 className="text-lg font-bold text-gray-900 mb-6">מגמת הזמנות</h3>
          <div className="h-[300px] w-full min-w-0" style={{ direction: 'ltr' }}>
            <ResponsiveContainer width="100%" height="100%" debounce={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF'}} />
                <Tooltip 
                  cursor={{fill: '#F3F4F6'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="orders" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">פעילות אחרונה</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-500">
                  <Bell size={16} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-gray-800 truncate">הזמנה חדשה התקבלה</p>
                  <p className="text-xs text-gray-500">לפני 5 דקות</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrdersTab() {
  const { orders: contextOrders, loading: contextLoading, refetch, onOrderClick, adminActions } = useAdminData();
  const [localOrders, setLocalOrders] = useState<AdminOrder[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLocalOrders(contextOrders);
  }, [contextOrders]);

  const handleRefund = (order: AdminOrder) => {
    adminActions.handleAdminAction('FULL_REFUND', order.id, 'order', {
      totalPrice: order.price,
      commissionAmount: Math.round(order.price * 0.1),
      netToPro: Math.round(order.price * 0.9),
      currency: 'ILS'
    });
  };

  const handleViewInvoice = (orderId: string) => {
    adminActions.executeViewInvoice(orderId);
  };

  const filteredOrders = localOrders.filter(o => 
    String(o.customer).includes(search) || String(o.id).includes(search) || String(o.service).includes(search)
  );

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">הושלם</span>;
      case 'pending': return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold">ממתין</span>;
      case 'active': 
      case 'in_progress': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">פעיל</span>;
      case 'accepted': return <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold">אושר</span>;
      case 'en_route': return <span className="bg-cyan-100 text-cyan-700 px-2 py-1 rounded text-xs font-bold">בדרך</span>;
      case 'cancelled': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">בוטל</span>;
      case 'refunded': return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold">זוכה</span>;
      default: return <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-gray-900">כל ההזמנות</h3>
          {contextLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>טוען...</span>
            </div>
          )}
          <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
            {filteredOrders.length} הזמנות
          </span>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="חפש הזמנה..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-9 pl-4 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Filter size={18} className="text-gray-600" />
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 text-gray-500 font-medium">
            <tr>
              <th className="p-4">מזהה</th>
              <th className="p-4">לקוח</th>
              <th className="p-4">שירות</th>
              <th className="p-4">תאריך</th>
              <th className="p-4">מחיר</th>
              <th className="p-4">סטטוס</th>
              <th className="p-4">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-4 font-mono text-gray-500">{order.id.substring(0,8)}</td>
                <td className="p-4 font-bold text-gray-900">{order.customer}</td>
                <td className="p-4">{order.service}</td>
                <td className="p-4 text-gray-500">{order.date}</td>
                <td className="p-4 font-bold">₪{order.price}</td>
                <td className="p-4">{getStatusBadge(order.status)}</td>
                <td className="p-4 flex gap-2">
                  <button 
                    onClick={() => onOrderClick?.(order.id)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded text-xs font-bold transition-all"
                  >
                    צפה
                  </button>
                  <button 
                    onClick={() => handleViewInvoice(order.id)}
                    className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <FileText size={12} />
                    חשבונית
                  </button>
                  <button 
                    onClick={() => handleRefund(order)}
                    disabled={order.status === 'refunded' || order.status === 'cancelled'}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {order.status === 'refunded' ? 'זוכה' : 'החזר'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SupportTab() {
  const { supportTickets: contextTickets, loading: contextLoading, stats: adminStats, adminActions } = useAdminData();
  const [localTickets, setLocalTickets] = useState<(SupportTicket & { userName: string; photos?: string[] })[]>([]);
  
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

  useEffect(() => {
    const ticketsWithPhotos = contextTickets.map((ticket, idx) => ({
      ...ticket,
      photos: idx === 0 ? [
        'https://images.unsplash.com/photo-1585704032915-c3400305e979?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop'
      ] : idx === 1 ? [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=300&fit=crop'
      ] : undefined
    }));
    setLocalTickets(ticketsWithPhotos);
  }, [contextTickets]);

  const handleCloseTicket = async (ticket: SupportTicket & { userName: string }) => {
    await adminActions.handleAdminAction('CLOSE_TICKET', ticket.id, 'ticket', {
      resolution: 'נסגר על ידי מנהל',
      ticketSubject: ticket.subject
    });
    setLocalTickets(localTickets.map(t => 
      t.id === ticket.id 
        ? { ...t, status: 'closed' as const } 
        : t
    ));
  };

  const handleAssignTicket = async (ticket: SupportTicket & { userName: string }) => {
    await adminActions.handleAdminAction('ASSIGN_TICKET', ticket.id, 'ticket', {
      assigneeId: 'admin-1',
      assigneeName: 'Admin User',
      ticketSubject: ticket.subject
    });
    setLocalTickets(localTickets.map(t => 
      t.id === ticket.id 
        ? { ...t, status: 'in_progress' as const } 
        : t
    ));
  };

  const handleReopenTicket = (ticketId: string) => {
    setLocalTickets(localTickets.map(t => 
      t.id === ticketId 
        ? { ...t, status: 'open' as const } 
        : t
    ));
    toast.success('הפנייה נפתחה מחדש');
  };

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'urgent': return { class: 'bg-purple-100 text-purple-700', label: 'קריטי' };
      case 'high': return { class: 'bg-red-100 text-red-700', label: 'דחוף' };
      case 'medium': return { class: 'bg-yellow-100 text-yellow-700', label: 'בינוני' };
      case 'low': return { class: 'bg-green-100 text-green-700', label: 'נמוך' };
      default: return { class: 'bg-gray-100 text-gray-700', label: priority };
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'open': return { class: 'bg-blue-100 text-blue-700', label: 'פתוח' };
      case 'in_progress': return { class: 'bg-yellow-100 text-yellow-700', label: 'בטיפול' };
      case 'waiting_user': return { class: 'bg-orange-100 text-orange-700', label: 'ממתין למשתמש' };
      case 'resolved': return { class: 'bg-green-100 text-green-700', label: 'נפתר' };
      case 'closed': return { class: 'bg-gray-100 text-gray-700', label: 'סגור' };
      default: return { class: 'bg-gray-100 text-gray-700', label: status };
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'לפני פחות משעה';
    if (diffHours < 24) return `לפני ${diffHours} שעות`;
    if (diffHours < 48) return 'אתמול';
    return date.toLocaleDateString('he-IL');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {contextLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="mr-2 text-gray-600">טוען פניות תמיכה...</span>
          </div>
        )}
        {!contextLoading && localTickets.length === 0 && (
          <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-500">
            אין פניות תמיכה פתוחות
          </div>
        )}
        {localTickets.map((ticket) => {
          const priorityBadge = getPriorityBadge(ticket.priority);
          const statusBadge = getStatusBadge(ticket.status);
          
          return (
            <div key={ticket.id} className={`bg-white p-6 rounded-2xl border transition-all ${
              ticket.status === 'open' || ticket.status === 'in_progress' 
                ? 'border-blue-200 shadow-sm' 
                : 'border-gray-100 opacity-75'
            }`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${priorityBadge.class}`}>
                    {priorityBadge.label}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusBadge.class}`}>
                    {statusBadge.label}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">#{ticket.id}</span>
                </div>
                <span className="text-xs text-gray-500">{formatDate(ticket.created_at)}</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">{ticket.subject}</h4>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <span className="bg-gray-100 px-2 py-0.5 rounded">{ticket.category}</span>
                <span>•</span>
                <span>{ticket.messages_count} הודעות</span>
              </div>
              
              {ticket.photos && ticket.photos.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Image className="w-4 h-4 text-teal-600" />
                      <span className="font-medium">קבצים מצורפים</span>
                      <span className="bg-teal-100 text-teal-700 text-xs px-2 py-0.5 rounded-full font-bold">
                        {ticket.photos.length}
                      </span>
                    </div>
                    <label className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 cursor-pointer font-medium transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>הוסף תיעוד</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={() => toast.success('תמונה נוספה בהצלחה')} />
                    </label>
                  </div>
                  <div className="flex items-center gap-2" dir="rtl">
                    {ticket.photos.slice(0, 3).map((photo, idx) => (
                      <button
                        key={idx}
                        onClick={() => openPhotoGallery(ticket.photos!, idx)}
                        className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-teal-200 hover:border-teal-400 transition-all hover:scale-105 cursor-pointer shadow-sm group"
                      >
                        <img 
                          src={photo} 
                          alt={`קובץ ${idx + 1}`} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </button>
                    ))}
                    {ticket.photos.length > 3 && (
                      <button
                        onClick={() => openPhotoGallery(ticket.photos!, 3)}
                        className="w-16 h-16 rounded-lg bg-gray-100 border-2 border-gray-200 hover:border-teal-400 flex items-center justify-center text-gray-600 hover:text-teal-600 font-bold text-sm transition-all cursor-pointer"
                      >
                        +{ticket.photos.length - 3}
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users size={14} />
                  <span>{ticket.userName}</span>
                </div>
                <div className="flex gap-2">
                  <button className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">
                    השב
                  </button>
                  {(ticket.status === 'open') && (
                    <button 
                      onClick={() => handleAssignTicket(ticket)}
                      className="text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-100 transition-colors flex items-center gap-1"
                    >
                      <UserCog size={12} />
                      הקצה
                    </button>
                  )}
                  {(ticket.status === 'open' || ticket.status === 'in_progress') ? (
                    <button 
                      onClick={() => handleCloseTicket(ticket)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                      סגור פנייה
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleReopenTicket(ticket.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors bg-green-50 text-green-700 border border-green-100"
                    >
                      פתח מחדש
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="bg-white p-6 rounded-2xl border border-gray-200 h-fit">
        <h3 className="font-bold text-gray-900 mb-4">סטטיסטיקות תמיכה</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
            <span className="text-sm text-gray-600">פניות פתוחות</span>
            <span className="text-xl font-black text-red-600">
              {localTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
            <span className="text-sm text-gray-600">זמן תגובה ממוצע</span>
            <span className="text-xl font-black text-green-600">{adminStats.averageResponseTime}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
            <span className="text-sm text-gray-600">סה"כ פניות</span>
            <span className="text-xl font-black text-blue-600">{localTickets.length}</span>
          </div>
        </div>
      </div>
      
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

function CategoriesTab() {
  const { categories: contextCategories } = useAdminData();
  const [localCategories, setLocalCategories] = useState<AdminCategory[]>([]);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    setLocalCategories(contextCategories);
  }, [contextCategories]);

  const addCategory = async () => {
    if (!newCatName) return;
    const newCategory: AdminCategory = { 
      id: Date.now(), 
      name: newCatName, 
      count: 0, 
      status: 'active' 
    };
    setLocalCategories([...localCategories, newCategory]);
    setNewCatName('');
  };

  const removeCategory = (id: number) => {
    if (window.confirm('האם אתה בטוח?')) {
      setLocalCategories(localCategories.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-end gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">שם הקטגוריה החדשה</label>
          <input 
            type="text" 
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 outline-none"
            placeholder="לדוגמה: גינון..."
          />
        </div>
        <button 
          onClick={addCategory}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          הוסף
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {localCategories.map((cat) => (
          <div key={cat.id} className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-all group relative">
            <button 
              onClick={() => removeCategory(cat.id)}
              className="absolute top-2 left-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 size={16} />
            </button>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg text-gray-800">{cat.name}</h3>
              <span className={`w-2 h-2 rounded-full ${cat.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            </div>
            <p className="text-sm text-gray-500">{cat.count} בעלי מקצוע</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MessagesTab() {
  const { messages: contextMessages } = useAdminData();
  const [selectedId, setSelectedId] = useState<number | string | null>('live-chat');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const STORAGE_KEY = 'beed_support_chat_messages';

  useEffect(() => {
      const loadMessages = () => {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
              setChatMessages(JSON.parse(stored));
          }
      };
      loadMessages();
      const interval = setInterval(loadMessages, 2000);
      return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
      if (selectedId === 'live-chat') {
          chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
  }, [chatMessages, selectedId]);

  const handleSend = () => {
      if (!inputText.trim()) return;
      
      const newMsg = {
          id: Date.now().toString(),
          text: inputText,
          sender: 'support',
          timestamp: new Date().toISOString()
      };
      
      const updated = [...chatMessages, newMsg];
      setChatMessages(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setInputText('');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-[600px] flex overflow-hidden">
      <div className="w-1/3 border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <input type="text" placeholder="חפש בהודעות..." className="w-full bg-gray-50 p-2 rounded-lg text-sm" />
        </div>
        <div className="flex-1 overflow-y-auto">
            <div 
              onClick={() => setSelectedId('live-chat')}
              className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${selectedId === 'live-chat' ? 'bg-blue-50/50' : ''}`}
            >
              <div className="flex justify-between mb-1">
                <span className="font-bold text-sm text-black flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Pro User (Live)
                </span>
                <span className="text-[10px] text-gray-400">Now</span>
              </div>
              <p className="text-xs text-gray-500 truncate">
                  {chatMessages.length > 0 ? chatMessages[chatMessages.length - 1].text : 'אין הודעות'}
              </p>
            </div>

          {contextMessages.map((msg) => (
            <div 
              key={msg.id} 
              onClick={() => setSelectedId(msg.id)}
              className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${selectedId === msg.id ? 'bg-blue-50/50' : ''}`}
            >
              <div className="flex justify-between mb-1">
                <span className={`font-bold text-sm ${msg.unread ? 'text-black' : 'text-gray-600'}`}>{msg.sender}</span>
                <span className="text-[10px] text-gray-400">{msg.time}</span>
              </div>
              <p className="text-xs text-gray-500 truncate">{msg.preview}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-gray-50/30">
        {selectedId === 'live-chat' ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
              <span className="font-bold flex items-center gap-2">
                  Pro User
                  <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full">Active Mission</span>
              </span>
              <button className="text-gray-400 hover:text-gray-600"><MoreVertical size={18} /></button>
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'support' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                         msg.sender === 'support' 
                           ? 'bg-blue-600 text-white rounded-tr-none' 
                           : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                     }`}>
                         <p>{msg.text}</p>
                         <span className={`text-[10px] mt-1 block opacity-70 ${msg.sender === 'support' ? 'text-blue-100' : 'text-gray-400'}`}>
                             {new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                         </span>
                     </div>
                  </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="כתוב הודעה..." 
                    className="flex-1 bg-gray-50 p-3 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" 
                />
                <button onClick={handleSend} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            הצ'אט הזה אינו פעיל כרגע (דמו)
          </div>
        )}
      </div>
    </div>
  );
}

function ProsTab() {
  const { pros: contextPros, loading: contextLoading, adminActions } = useAdminData();
  const [localPros, setLocalPros] = useState<AdminPro[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLocalPros(contextPros);
  }, [contextPros]);

  const handleVerifyPro = (pro: AdminPro) => {
    adminActions.handleAdminAction('VERIFY_IDENTITY', String(pro.id), 'pro', {
      userName: pro.name,
      documents: [
        { type: 'id', url: 'https://images.unsplash.com/photo-1633265486064-086b219458ec?auto=format&fit=crop&q=80&w=400', uploadedAt: new Date().toISOString() },
        { type: 'license', url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=400', uploadedAt: new Date().toISOString() }
      ]
    });
  };

  const handleBanPro = (pro: AdminPro) => {
    adminActions.handleAdminAction('BAN_USER', String(pro.id), 'pro', {
      userName: pro.name
    });
  };

  const handleViewDocuments = (pro: AdminPro) => {
    adminActions.handleAdminAction('VERIFY_IDENTITY', String(pro.id), 'pro', {
      userName: pro.name,
      documents: [
        { type: 'id', url: 'https://images.unsplash.com/photo-1633265486064-086b219458ec?auto=format&fit=crop&q=80&w=400', uploadedAt: new Date().toISOString() },
        { type: 'license', url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=400', uploadedAt: new Date().toISOString() },
        { type: 'certificate', url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=400', uploadedAt: new Date().toISOString() }
      ]
    });
  };

  const handleResetPassword = (pro: AdminPro) => {
    adminActions.handleAdminAction('RESET_PASSWORD', String(pro.id), 'pro', {
      email: `pro${pro.id}@example.com`,
      userName: pro.name
    });
  };

  useEffect(() => {
    const fetchPros = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('pros')
          .select('*');
        
        if (!error && data && data.length > 0) {
          const mapped: AdminPro[] = data.map((p: { id: number; name: string; phone: string; rating: number; status: string }) => ({
             id: p.id,
             name: p.name,
             category: 'כללי',
             phone: p.phone,
             rating: p.rating,
             status: p.status as 'verified' | 'pending' | 'new'
          }));
          setLocalPros(mapped);
        }
      } catch (e) {
        // fallback - use context data
      } finally {
        setLoading(false);
      }
    };
    fetchPros();
  }, []);

  const handleImport = async (data: any[]) => {
    try {
      const prosToInsert = data.map(item => ({
        name: item.name,
        email: item.email,
        phone: item.phone,
        location: item.location,
        status: 'pending',
        rating: 0
      }));
      
      const { error } = await supabase.from('pros').insert(prosToInsert);
      
      if (error) throw error;

      alert(`נוספו ${data.length} אנשי מקצוע למסד הנתונים!`);
      
      const newPros: AdminPro[] = data.map((item, idx) => ({
        id: Date.now() + idx,
        name: item.name,
        category: item.category,
        phone: item.phone,
        rating: 0,
        status: 'pending' as const
      }));
      setLocalPros([...localPros, ...newPros]);

    } catch (e) {
      console.error("Import failed", e);
      const newPros: AdminPro[] = data.map((item, idx) => ({
        id: Date.now() + idx,
        name: item.name,
        category: item.category,
        phone: item.phone,
        rating: 0,
        status: 'pending' as const
      }));
      setLocalPros([...localPros, ...newPros]);
      alert(`מצב דמו: נוספו ${newPros.length} אנשי מקצוע לתצוגה בלבד.`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'verified':
        return <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">מאומת</span>;
      case 'pending':
        return <span className="text-yellow-600 text-xs font-bold bg-yellow-50 px-2 py-1 rounded-full">ממתין</span>;
      default:
        return <span className="text-blue-600 text-xs font-bold bg-blue-50 px-2 py-1 rounded-full">חדש</span>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">הוספת אנשי מקצוע</h3>
        <ExcelImporter onImport={handleImport} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center gap-3">
           <h3 className="text-lg font-bold text-gray-900">רשימת אנשי מקצוע ({localPros.length})</h3>
           {(loading || contextLoading) && (
             <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
           )}
        </div>
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-gray-500">שם</th>
              <th className="p-4 text-gray-500">קטגוריה</th>
              <th className="p-4 text-gray-500">טלפון</th>
              <th className="p-4 text-gray-500">דירוג</th>
              <th className="p-4 text-gray-500">סטטוס</th>
              <th className="p-4 text-gray-500">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {localPros.map((pro) => (
              <tr key={pro.id} className="hover:bg-gray-50">
                <td className="p-4 font-bold">{pro.name}</td>
                <td className="p-4">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">{pro.category}</span>
                </td>
                <td className="p-4 font-mono text-gray-600">{pro.phone}</td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <span className="font-bold">{pro.rating || '-'}</span>
                    <span className="text-yellow-400">★</span>
                  </div>
                </td>
                <td className="p-4">
                   {getStatusBadge(pro.status)}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    {pro.status !== 'verified' && (
                      <button 
                        onClick={() => handleVerifyPro(pro)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50 px-2 py-1 rounded text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <Shield size={12} />
                        אמת
                      </button>
                    )}
                    <button 
                      onClick={() => handleViewDocuments(pro)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <FileText size={12} />
                      מסמכים
                    </button>
                    <button 
                      onClick={() => handleResetPassword(pro)}
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-2 py-1 rounded text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <Key size={12} />
                      איפוס סיסמה
                    </button>
                    <button 
                      onClick={() => handleBanPro(pro)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <Ban size={12} />
                      השעה
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}