import { useState } from 'react';
import { Bell, CheckCircle, Star, CreditCard, Clock, Users, AlertCircle, Package, Calendar, ArrowRight, CheckCheck, Filter } from 'lucide-react';

type NotificationType = 'system' | 'acceptance' | 'rating' | 'payment' | 'reminder' | 'customer' | 'order';

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  relativeTime: string;
  isRead: boolean;
};

type FilterTab = 'all' | 'unread' | 'system' | 'orders';

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'acceptance',
    title: 'הצעתך התקבלה!',
    description: 'הלקוח דני כהן אישר את הצעת המחיר שלך לתיקון נזילה במטבח. העבודה מתוכננת למחר בשעה 10:00.',
    time: '2024-12-03T09:55:00',
    relativeTime: 'לפני 5 דקות',
    isRead: false
  },
  {
    id: '2',
    type: 'customer',
    title: 'לקוח חדש ממתין',
    description: 'שרה לוי מחפשת שרברב זמין לתיקון דחוף. המרחק ממך: 2.3 ק"מ.',
    time: '2024-12-03T09:45:00',
    relativeTime: 'לפני 15 דקות',
    isRead: false
  },
  {
    id: '3',
    type: 'rating',
    title: 'קיבלת דירוג 5 כוכבים! ⭐',
    description: 'יוסי מזרחי דירג אותך 5 כוכבים עבור העבודה "התקנת גוף תאורה". כל הכבוד!',
    time: '2024-12-03T09:30:00',
    relativeTime: 'לפני 30 דקות',
    isRead: false
  },
  {
    id: '4',
    type: 'payment',
    title: 'תשלום התקבל',
    description: 'התקבל תשלום בסך ₪450 עבור העבודה אצל רונית שחר. הכסף יועבר לחשבונך תוך 2-3 ימי עסקים.',
    time: '2024-12-03T08:00:00',
    relativeTime: 'לפני שעה',
    isRead: true
  },
  {
    id: '5',
    type: 'reminder',
    title: 'תזכורת: עבודה מחר',
    description: 'יש לך עבודה מתוכננת מחר בשעה 09:00 אצל אבי לוי ברחוב הרצל 45, תל אביב.',
    time: '2024-12-03T07:00:00',
    relativeTime: 'לפני שעתיים',
    isRead: true
  },
  {
    id: '6',
    type: 'system',
    title: 'עדכון מערכת חדש',
    description: 'עדכנו את האפליקציה עם פיצ\'רים חדשים! כעת תוכל לראות סטטיסטיקות מפורטות יותר.',
    time: '2024-12-03T06:00:00',
    relativeTime: 'לפני 4 שעות',
    isRead: true
  },
  {
    id: '7',
    type: 'order',
    title: 'בקשת עבודה חדשה',
    description: 'התקבלה בקשה חדשה לתיקון מזגן באזור רמת גן. מחיר מוצע: ₪350.',
    time: '2024-12-02T18:00:00',
    relativeTime: 'אתמול ב-18:00',
    isRead: true
  },
  {
    id: '8',
    type: 'acceptance',
    title: 'הצעתך התקבלה!',
    description: 'הלקוח מיכל דוד אישרה את הצעת המחיר שלך לפתיחת סתימה. העבודה בוצעה בהצלחה.',
    time: '2024-12-02T14:00:00',
    relativeTime: 'אתמול ב-14:00',
    isRead: true
  },
  {
    id: '9',
    type: 'rating',
    title: 'קיבלת דירוג 4 כוכבים',
    description: 'משה כהן דירג אותך 4 כוכבים עבור העבודה "תיקון ברז". הלקוח השאיר הערה: "עבודה טובה".',
    time: '2024-12-01T10:00:00',
    relativeTime: 'לפני יומיים',
    isRead: true
  },
  {
    id: '10',
    type: 'system',
    title: 'הפרופיל שלך נצפה 50 פעמים השבוע',
    description: 'הפרופיל שלך צובר תאוצה! 50 לקוחות פוטנציאליים צפו בפרופיל שלך השבוע.',
    time: '2024-12-01T08:00:00',
    relativeTime: 'לפני יומיים',
    isRead: true
  },
  {
    id: '11',
    type: 'payment',
    title: 'תשלום התקבל',
    description: 'התקבל תשלום בסך ₪680 עבור העבודה אצל דוד ישראלי.',
    time: '2024-11-30T16:00:00',
    relativeTime: 'לפני 3 ימים',
    isRead: true
  },
  {
    id: '12',
    type: 'customer',
    title: 'לקוח חדש ממתין',
    description: 'רחל גולן מחפשת חשמלאי לבדיקת תקלה בלוח חשמל.',
    time: '2024-11-30T12:00:00',
    relativeTime: 'לפני 3 ימים',
    isRead: true
  }
];

const getNotificationIcon = (type: NotificationType) => {
  const iconClass = "w-5 h-5";
  switch (type) {
    case 'system':
      return <Bell className={`${iconClass} text-blue-600`} />;
    case 'acceptance':
      return <CheckCircle className={`${iconClass} text-green-600`} />;
    case 'rating':
      return <Star className={`${iconClass} text-yellow-500`} />;
    case 'payment':
      return <CreditCard className={`${iconClass} text-purple-600`} />;
    case 'reminder':
      return <Clock className={`${iconClass} text-orange-500`} />;
    case 'customer':
      return <Users className={`${iconClass} text-indigo-600`} />;
    case 'order':
      return <Package className={`${iconClass} text-teal-600`} />;
    default:
      return <Bell className={`${iconClass} text-gray-600`} />;
  }
};

const getNotificationIconBg = (type: NotificationType) => {
  switch (type) {
    case 'system':
      return 'bg-blue-50';
    case 'acceptance':
      return 'bg-green-50';
    case 'rating':
      return 'bg-yellow-50';
    case 'payment':
      return 'bg-purple-50';
    case 'reminder':
      return 'bg-orange-50';
    case 'customer':
      return 'bg-indigo-50';
    case 'order':
      return 'bg-teal-50';
    default:
      return 'bg-gray-50';
  }
};

type ProNotificationsProps = {
  onBack?: () => void;
};

export function ProNotifications({ onBack }: ProNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const filterTabs: { id: FilterTab; label: string; count?: number }[] = [
    { id: 'all', label: 'הכל' },
    { id: 'unread', label: 'לא נקראו', count: notifications.filter(n => !n.isRead).length },
    { id: 'system', label: 'מערכת' },
    { id: 'orders', label: 'הזמנות' }
  ];

  const getFilteredNotifications = () => {
    switch (activeFilter) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'system':
        return notifications.filter(n => n.type === 'system');
      case 'orders':
        return notifications.filter(n => n.type === 'order' || n.type === 'acceptance' || n.type === 'customer');
      default:
        return notifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div className="max-w-4xl mx-auto pb-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowRight className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-6 h-6 text-blue-600" />
              התראות
            </h2>
            <p className="text-gray-500 text-sm">
              {unreadCount > 0 ? `${unreadCount} התראות שלא נקראו` : 'אין התראות חדשות'}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            סמן הכל כנקרא
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="border-b border-gray-200 bg-gray-50/50 p-1.5 flex gap-1">
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                activeFilter === tab.id
                  ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeFilter === tab.id 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="divide-y divide-gray-100">
          {filteredNotifications.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">אין התראות</h3>
              <p className="text-gray-500 text-sm">
                {activeFilter === 'unread'
                  ? 'אין לך התראות שלא נקראו'
                  : activeFilter === 'system'
                  ? 'אין התראות מערכת'
                  : activeFilter === 'orders'
                  ? 'אין התראות על הזמנות'
                  : 'אין התראות להצגה'}
              </p>
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.isRead ? 'bg-blue-50/30' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationIconBg(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                        )}
                        <h4 className={`font-bold text-gray-900 ${!notification.isRead ? 'text-blue-900' : ''}`}>
                          {notification.title}
                        </h4>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                        {notification.relativeTime}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {notification.description}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredNotifications.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50/50 p-4 text-center">
            <p className="text-sm text-gray-500">
              מציג {filteredNotifications.length} מתוך {notifications.length} התראות
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProNotifications;
