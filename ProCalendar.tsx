import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin, Phone, X, Brain, Image as ImageIcon, MessageCircle, DollarSign, Calendar, Navigation, User } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';

export type JobStatus = 'accepted' | 'en_route' | 'arrived' | 'in_progress' | 'completed';

export type Appointment = {
  id: string;
  clientName: string;
  clientImage: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  address: string;
  price: number;
  status: 'confirmed' | 'completed' | 'cancelled' | 'upcoming';
  jobStatus?: JobStatus;
  client?: string;
  phone?: string;
  distance?: string;
  clientLat?: number;
  clientLng?: number;
  clientMessage?: string;
  photos?: string[];
  aiAnalysis?: {
    summary: string;
    detectedIssues: string[];
    estimatedMaterials: string[];
    confidenceScore: number;
  };
  urgency?: 'immediate' | 'planned';
};

export const mockAppointments: Appointment[] = [
  {
    id: 'APP_001',
    clientName: 'דני כהן',
    clientImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    service: 'אינסטלציה',
    date: '2025-12-04',
    time: '14:00',
    duration: 2,
    address: 'רחוב הירקון 12, תל אביב',
    price: 450,
    status: 'upcoming',
    phone: '050-1234567',
    distance: '3.2',
    clientLat: 32.0853,
    clientLng: 34.7818,
    clientMessage: 'יש לי נזילה מתחת לכיור במטבח, מים על הרצפה',
    photos: [
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400',
    ],
    aiAnalysis: {
      summary: 'נזילה מצינור הניקוז מתחת לכיור, כנראה בגלל אטם שחוק',
      detectedIssues: ['נזילה בצינור', 'אטם שחוק'],
      estimatedMaterials: ['אטם חדש', 'סרט טפלון', 'מפתח צינורות'],
      confidenceScore: 0.92,
    },
    urgency: 'immediate',
  },
  {
    id: 'APP_002',
    clientName: 'רונית שחר',
    clientImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    service: 'חשמל',
    date: '2025-12-04',
    time: '16:30',
    duration: 1.5,
    address: 'שדרות רוטשילד 45, תל אביב',
    price: 350,
    status: 'upcoming',
    phone: '052-9876543',
    distance: '5.1',
    clientLat: 32.0636,
    clientLng: 34.7741,
    clientMessage: 'הנתיכים קופצים כל פעם שמפעילים את המזגן',
    photos: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    ],
    aiAnalysis: {
      summary: 'בעיה בלוח החשמל או עומס יתר במעגל המזגן',
      detectedIssues: ['עומס יתר', 'נתיך פגום אפשרי'],
      estimatedMaterials: ['נתיכים', 'כבלים'],
      confidenceScore: 0.85,
    },
    urgency: 'planned',
  },
  {
    id: 'APP_003',
    clientName: 'יוסי בניון',
    clientImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    service: 'אינסטלציה',
    date: '2025-12-04',
    time: '18:00',
    duration: 2.5,
    address: 'דיזנגוף 100, תל אביב',
    price: 550,
    status: 'upcoming',
    phone: '054-5551234',
    distance: '4.3',
    clientLat: 32.0789,
    clientLng: 34.7738,
    clientMessage: 'צריך להחליף את האסלה בשירותים, האסלה הישנה סדוקה',
    photos: [
      'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400',
      'https://images.unsplash.com/photo-1564540586988-aa4e53c3d799?w=400',
    ],
    aiAnalysis: {
      summary: 'החלפת אסלה מלאה כולל התקנה חדשה',
      detectedIssues: ['אסלה סדוקה', 'דליפת מים'],
      estimatedMaterials: ['אסלה חדשה', 'אטמים', 'ברגים', 'סיליקון'],
      confidenceScore: 0.95,
    },
    urgency: 'planned',
  },
  {
    id: 'APP_004',
    clientName: 'מיכל אברהם',
    clientImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    service: 'ניקיון',
    date: '2025-12-05',
    time: '09:00',
    duration: 4,
    address: 'רחוב הרצל 20, רמת גן',
    price: 400,
    status: 'upcoming',
    phone: '053-1112233',
    distance: '6.2',
    clientMessage: 'ניקיון יסודי של דירה 4 חדרים לפני אירוע',
    urgency: 'planned',
  },
];

type ViewMode = 'day' | 'week' | 'month';

type ProCalendarProps = {
  appointments?: Appointment[];
};

export function ProCalendar({ appointments = mockAppointments }: ProCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 4));
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const getAppointmentsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(app => app.date === dateStr);
  };

  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleCall = (phone: string) => {
    toast.success('מתקשר...', { description: phone });
  };

  const handleNavigate = (address: string) => {
    toast.success('פותח ניווט...', { description: address });
  };

  const renderMonthView = () => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: startOffset });

    return (
      <>
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map((day) => (
            <div key={day} className="text-center text-gray-500 text-sm font-medium py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {emptyDays.map((_, idx) => (
            <div key={`empty-${idx}`} className="aspect-square" />
          ))}
          {days.map((day) => {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dayApps = getAppointmentsForDay(date);
            const isToday = date.toDateString() === new Date(2025, 11, 4).toDateString();

            return (
              <div
                key={day}
                onClick={() => {
                  setCurrentDate(date);
                  setViewMode('day');
                }}
                className={`aspect-square border rounded-xl p-2 cursor-pointer transition-all flex flex-col justify-between group ${
                  isToday
                    ? 'border-blue-600 bg-blue-50/50'
                    : dayApps.length > 0
                    ? 'border-green-200 bg-green-50/30 hover:border-green-400'
                    : 'border-gray-100 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                  {day}
                </div>
                {dayApps.length > 0 && (
                  <div className="flex flex-col gap-1">
                    {dayApps.slice(0, 2).map((app, i) => (
                      <div key={i} className="h-1.5 w-full bg-green-500 rounded-full"></div>
                    ))}
                    {dayApps.length > 2 && <div className="text-[10px] text-gray-400 leading-none text-right">+{dayApps.length - 2}</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const renderWeekView = () => {
    const dayOfWeek = currentDate.getDay();
    const diff = currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(diff);

    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });

    const hours = Array.from({ length: 13 }, (_, i) => i + 8);

    return (
      <div className="flex flex-col h-[500px] overflow-y-auto">
        <div className="grid grid-cols-8 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="p-4 border-r border-gray-100"></div>
          {weekDays.map((date, i) => {
            const isToday = date.toDateString() === new Date(2025, 11, 4).toDateString();
            return (
              <div key={i} className={`p-2 text-center border-r border-gray-100 ${isToday ? 'bg-blue-50' : ''}`}>
                <div className="text-xs text-gray-500">{['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'][date.getDay()]}</div>
                <div className={`text-sm font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>{date.getDate()}</div>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-8 flex-1">
          <div className="border-r border-gray-200 bg-gray-50">
            {hours.map((hour) => (
              <div key={hour} className="h-16 text-xs text-gray-400 text-right pr-2 pt-2 border-b border-gray-100">
                {hour}:00
              </div>
            ))}
          </div>
          {weekDays.map((date, i) => {
            const dayApps = getAppointmentsForDay(date);
            return (
              <div key={i} className="relative border-r border-gray-100">
                {hours.map((hour) => (
                  <div key={hour} className="h-16 border-b border-gray-50"></div>
                ))}
                {dayApps.map((app) => {
                  const appHour = parseInt(app.time.split(':')[0]);
                  const topOffset = (appHour - 8) * 64;
                  const height = app.duration * 64;
                  return (
                    <div
                      key={app.id}
                      onClick={() => handleAppointmentClick(app)}
                      className="absolute left-1 right-1 rounded-lg bg-blue-100 border border-blue-200 p-1.5 text-xs overflow-hidden hover:z-20 hover:shadow-lg cursor-pointer transition-all"
                      style={{ top: `${topOffset}px`, height: `${Math.max(height, 32)}px` }}
                    >
                      <div className="font-bold text-blue-800 truncate text-[10px]">{app.clientName}</div>
                      <div className="text-blue-600 truncate text-[10px]">{app.time}</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 13 }, (_, i) => i + 8);
    const dayApps = getAppointmentsForDay(currentDate);
    const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const hebrewMonths = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

    return (
      <div className="flex flex-col h-[500px] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200 p-4 text-center font-bold text-lg">
          יום {hebrewDays[currentDate.getDay()]}, {currentDate.getDate()} ב{hebrewMonths[currentDate.getMonth()]}
        </div>
        <div className="flex relative">
          <div className="w-16 flex-shrink-0 bg-gray-50 border-r border-gray-200">
            {hours.map((hour) => (
              <div key={hour} className="h-20 text-xs text-gray-500 text-right pr-2 pt-2 border-b border-gray-100">
                {hour}:00
              </div>
            ))}
          </div>
          <div className="flex-1 relative bg-white">
            {hours.map((hour) => (
              <div key={hour} className="h-20 border-b border-gray-50 w-full"></div>
            ))}
            {dayApps.map((app) => {
              const appHour = parseInt(app.time.split(':')[0]);
              const appMin = parseInt(app.time.split(':')[1]);
              const topOffset = (appHour - 8) * 80 + (appMin / 60) * 80;
              const height = app.duration * 80;

              return (
                <div
                  key={app.id}
                  onClick={() => handleAppointmentClick(app)}
                  className="absolute left-4 right-4 rounded-xl bg-blue-50 border-l-4 border-blue-600 p-3 hover:shadow-lg transition-all cursor-pointer"
                  style={{ top: `${topOffset}px`, height: `${Math.max(height, 60)}px` }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-gray-900">{app.service} - {app.clientName}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3" /> {app.time} ({app.duration} שעות)
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <MapPin className="w-3 h-3" /> {app.address}
                      </div>
                    </div>
                    <ImageWithFallback
                      src={app.clientImage}
                      alt={app.clientName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const getHebrewMonth = () => {
    const hebrewMonths = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
    return `${hebrewMonths[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  const upcomingAppointments = appointments
    .filter(a => a.status === 'upcoming' || a.status === 'confirmed')
    .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime())
    .slice(0, 4);

  const totalHours = upcomingAppointments.reduce((sum, a) => sum + a.duration, 0);
  const totalRevenue = upcomingAppointments.reduce((sum, a) => sum + a.price, 0);

  return (
    <div dir="rtl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-gray-900">יומן עבודה</h2>
        <p className="text-gray-600">נהל את הפגישות והזמינות שלך</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Calendar Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-bold w-40">
                  {viewMode === 'month' ? getHebrewMonth() : viewMode === 'day' ? 'תצוגת יום' : 'תצוגת שבוע'}
                </h3>
                <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode('day')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${viewMode === 'day' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    יום
                  </button>
                  <button
                    onClick={() => setViewMode('week')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${viewMode === 'week' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    שבוע
                  </button>
                  <button
                    onClick={() => setViewMode('month')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${viewMode === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    חודש
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigate('next')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => {
                    setCurrentDate(new Date(2025, 11, 4));
                    setViewMode('month');
                  }}
                  className="px-3 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                >
                  היום
                </button>
                <button onClick={() => navigate('prev')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="animate-in fade-in duration-300">
              {viewMode === 'month' && renderMonthView()}
              {viewMode === 'week' && renderWeekView()}
              {viewMode === 'day' && renderDayView()}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">פגישות קרובות</h3>

            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  onClick={() => handleAppointmentClick(appointment)}
                  className="border border-gray-100 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all bg-gray-50/50 cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <ImageWithFallback
                      src={appointment.clientImage}
                      alt={appointment.clientName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{appointment.clientName}</div>
                      <div className="text-blue-600 text-sm font-medium">{appointment.service}</div>
                    </div>
                    <div className="text-lg font-bold text-green-600">₪{appointment.price}</div>
                  </div>

                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{appointment.date} • {appointment.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{appointment.address}</span>
                    </div>
                  </div>
                </div>
              ))}

              {upcomingAppointments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>אין פגישות קרובות</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-lg p-6">
            <h4 className="font-medium text-slate-300 mb-4">סיכום שבועי</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span className="text-sm text-slate-300">פגישות</span>
                <span className="text-xl font-bold">{upcomingAppointments.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span className="text-sm text-slate-300">שעות מתוכננות</span>
                <span className="text-xl font-bold">{totalHours} שעות</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl border border-white/10">
                <span className="text-sm text-slate-200">הכנסות צפויות</span>
                <span className="text-2xl font-bold text-green-400">₪{totalRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedAppointment(null)}>
          <div
            className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-l from-blue-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <ImageWithFallback
                    src={selectedAppointment.clientImage}
                    alt={selectedAppointment.clientName}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-lg"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedAppointment.clientName}</h3>
                    <div className="text-blue-600 font-medium">{selectedAppointment.service}</div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <Calendar className="w-4 h-4" />
                    תאריך ושעה
                  </div>
                  <div className="font-bold text-gray-900">{selectedAppointment.date}</div>
                  <div className="text-gray-700">{selectedAppointment.time} • {selectedAppointment.duration} שעות</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <DollarSign className="w-4 h-4" />
                    מחיר
                  </div>
                  <div className="text-2xl font-bold text-green-600">₪{selectedAppointment.price}</div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                  <MapPin className="w-4 h-4" />
                  כתובת
                </div>
                <div className="font-medium text-gray-900">{selectedAppointment.address}</div>
                {selectedAppointment.distance && (
                  <div className="text-sm text-gray-500 mt-1">מרחק: {selectedAppointment.distance} ק"מ</div>
                )}
              </div>

              {/* Client Message */}
              {selectedAppointment.clientMessage && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-amber-700 text-sm mb-2">
                    <MessageCircle className="w-4 h-4" />
                    הודעה מהלקוח
                  </div>
                  <p className="text-gray-800">{selectedAppointment.clientMessage}</p>
                </div>
              )}

              {/* AI Analysis */}
              {selectedAppointment.aiAnalysis && (
                <div className="bg-gradient-to-l from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-purple-700 text-sm mb-3">
                    <Brain className="w-4 h-4" />
                    ניתוח AI
                    <span className="mr-auto bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs">
                      {Math.round(selectedAppointment.aiAnalysis.confidenceScore * 100)}% ביטחון
                    </span>
                  </div>
                  <p className="text-gray-800 mb-3">{selectedAppointment.aiAnalysis.summary}</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs font-medium text-purple-600 mb-1">בעיות שזוהו:</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedAppointment.aiAnalysis.detectedIssues.map((issue, i) => (
                          <span key={i} className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">
                            {issue}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-purple-600 mb-1">חומרים נדרשים:</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedAppointment.aiAnalysis.estimatedMaterials.map((material, i) => (
                          <span key={i} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
                            {material}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Photos */}
              {selectedAppointment.photos && selectedAppointment.photos.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                    <ImageIcon className="w-4 h-4" />
                    תמונות מהלקוח ({selectedAppointment.photos.length})
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedAppointment.photos.map((photo, i) => (
                      <ImageWithFallback
                        key={i}
                        src={photo}
                        alt={`תמונה ${i + 1}`}
                        className="w-full h-24 object-cover rounded-xl"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => selectedAppointment.phone && handleCall(selectedAppointment.phone)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors"
              >
                <Phone className="w-5 h-5" />
                התקשר ללקוח
              </button>
              <button
                onClick={() => handleNavigate(selectedAppointment.address)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors"
              >
                <Navigation className="w-5 h-5" />
                נווט לכתובת
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
