import { useState, useEffect } from 'react';
import { Sparkles, Wrench, Zap, Scissors, Hammer, Flower2, Wind, Paintbrush, Truck } from './components/ui/icons';
import { LocationProvider } from './context/LocationProvider';
import { BookingProvider } from './context/BookingContext';
import { JobProvider } from './context/JobContext';
import { OrderProvider } from './stores/OrderStore';
import { LandingPage } from './components/LandingPage';
import { MapView } from './components/MapView';
import { CategoryPage, CategoryData } from './components/CategoryPage';
import { SmartDataCollection } from './components/SmartDataCollection';
import { BidsList } from './components/BidsList';
import { ProviderDetail } from './components/ProviderDetail';
import { UserProfile } from './components/UserProfile';
import { BookingCheckout } from './components/BookingCheckout';
import { BookingConfirmation } from './components/BookingConfirmation';
import { UserLogin } from './components/UserLogin';
import { ProAuth } from './components/ProAuth';
import { ProDashboard } from './components/ProDashboard';
import { TermsOfService } from './components/TermsOfService';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { HelpCenter } from './components/HelpCenter';
import { AboutUs } from './components/AboutUs';
import { ContactUs } from './components/ContactUs';
import { Accessibility } from './components/Accessibility';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ProviderTracking } from './components/ProviderTracking';
import { Sidebar } from './components/Sidebar';
import { History } from './components/History';
import { Wallet } from './components/Wallet';

// --- ADMIN & REAL-TIME COMPONENTS ---
import { OrderControlTower } from './components/admin/OrderControlTower';
import { MissionControl } from './components/admin/MissionControl';
import { MissionController } from './components/pro/MissionController';
import { ActiveOrderTracking } from './components/ActiveOrderTracking';
import { DevTools } from './components/DevTools';

export type Service = {
  id: string;
  name: string;
  icon: string;
  description: string;
};

export type Provider = {
  id: string;
  name: string;
  service: string;
  rating: number;
  reviews: number;
  hourlyRate: number;
  distance: number;
  image: string;
  bio: string;
  specialties: string[];
  availability: string[];
  lat: number;
  lng: number;
  status: 'available' | 'busy' | 'offline';
};

export type AIAnalysis = {
  summary: string;
  detectedIssues: string[];
  estimatedMaterials: string[];
  safetyNotes?: string[];
  recommendations: string[];
  confidenceScore: number;
};

export type ServiceRequest = {
  id: string;
  category: string;
  subProblem: string;
  complexity: 'standard' | 'complex' | 'critical';
  accessibility: string;
  urgency: 'immediate' | 'planned';
  photos?: string[];
  serviceSKU: string;
  aiAnalysis?: AIAnalysis;
  hasVideo: boolean;
  location?: {
    address: string;
    details: string;
    lat?: number;
    lng?: number;
  };
  scheduledTime?: 'now' | 'scheduled';
  scheduledDate?: string;
  scheduledHour?: string;
  description?: string;
};

export type Bid = {
  id: string;
  providerId: string;
  providerName: string;
  providerImage?: string;
  rating: number;
  reviews: number;
  distanceTime: string;
  distance: number;
  totalPriceGuaranteed: number;
  priceBreakdown: {
    baseRate: number;
    estimatedDuration: number;
    travelFee: number;
    urgencyMultiplier: number;
  };
  currency: string;
  status: 'available_now' | 'available_later';
  estimatedArrival?: string;
  lat: number;
  lng: number;
  score?: number;
  matchReasons?: string[];
  badges?: string[];
  description?: string;
};

export type Booking = {
  id: string;
  providerId: string;
  providerName: string;
  providerPhone?: string;
  providerImage?: string;
  service: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  total: number;
  address?: string;
  addressDetails?: string;
  serviceData?: {
    aiDescription?: string;
    mediaUrls?: string[];
    category?: string;
    subcategory?: string;
    complexity?: 'standard' | 'complex' | 'critical';
    urgencyLevel?: 'normal' | 'urgent' | 'emergency';
  };
};

const CATEGORIES_DATA: Record<string, CategoryData> = {
  'cleaning': {
    id: 'cleaning',
    name: 'ניקיון',
    description: 'שירותי ניקיון מקצועיים לבית ולעסק',
    longDescription: 'בין אם מדובר בניקיון יסודי חד פעמי, תחזוקה שוטפת או ניקיון לאחר שיפוץ, המקצוענים שלנו מצוידים בכלים ובחומרים הטובים ביותר כדי להבריק את הבית שלכם. אנו מציעים שירותי ניקיון מותאמים אישית לכל צורך.',
    image: 'https://images.unsplash.com/photo-1649073000644-d839009ff2dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbmluZyUyMHNlcnZpY2UlMjBob21lfGVufDF8fHx8MTc2NDI3Mjc3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    icon: <Sparkles className="w-8 h-8" />,
    stats: { pros: 230, projects: 1500, rating: 4.9 },
    popularServices: [
      { name: 'ניקיון סטנדרטי', price: '₪50/שעה', description: 'ניקיון שוטף הכולל אבק, שטיפה ושואב' },
      { name: 'ניקיון יסודי', price: '₪70/שעה', description: 'ניקיון עמוק כולל חלונות, תנורים וארונות' },
      { name: 'ניקיון לאחר שיפוץ', price: 'החל מ-₪800', description: 'הסרת שאריות צבע, אבק בנייה וניקיון כללי' },
      { name: 'ניקוי ספות', price: '₪250/מושב', description: 'ניקוי עמוק להסרת כתמים וריחות' }
    ],
    features: ['חומרי ניקוי אקולוגיים', 'צוותים מנוסים', 'ביטוח מלא על תכולה', 'זמינות מיידית']
  },
  'plumbing': {
    id: 'plumbing',
    name: 'אינסטלציה',
    description: 'תיקון נזילות, התקנות ושדרוגים',
    longDescription: 'אינסטלטורים מוסמכים ומנוסים לכל סוגי בעיות הצנרת. מתיקון נזילות פשוטות ועד החלפת קווים ראשיים. שירות מהיר ואמין 24/7 למקרי חירום.',
    image: 'https://images.unsplash.com/photo-1726931535180-d27a2ffd7474?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbHVtYmVyJTIwZml4aW5nJTIwcGlwZXxlbnwxfHx8fDE3NjQxOTQ1MzZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    icon: <Wrench className="w-8 h-8" />,
    stats: { pros: 180, projects: 950, rating: 4.8 },
    popularServices: [
      { name: 'פתיחת סתימה', price: '₪350-500', description: 'שחרור סתימות בכיור, אמבטיה או אסלה' },
      { name: 'תיקון נזילה', price: '₪400-800', description: 'איתור ותיקון נזילות גלויות וסמויות' },
      { name: 'התקנת ברז', price: '₪250-400', description: 'התקנת ברזים חדשים במטבח או באמבטיה' },
      { name: 'החלפת דוד', price: '₪2500-3500', description: 'החלפת דוד שמש או חשמל כולל התקנה' }
    ],
    features: ['אחריות על העבודה', 'ציוד מתקדם לאיתור נזילות', 'זמינות 24/7', 'מחירים שקופים']
  },
  'electrical': {
    id: 'electrical',
    name: 'חשמל',
    description: 'חשמלאים מוסמכים לכל סוגי העבודות',
    longDescription: 'חשמלאים מורשים לביצוע כל עבודות החשמל בבית ובמשרד. התקנת גופי תאורה, שקעים, לוחות חשמל ופתרון תקלות קצר. בטיחות מעל הכל.',
    image: 'https://images.unsplash.com/photo-1660330589693-99889d60181e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpY2lhbiUyMHdvcmtpbmd8ZW58MXx8fHwxNzY0MjMzNjk5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    icon: <Zap className="w-8 h-8" />,
    stats: { pros: 150, projects: 800, rating: 4.9 },
    popularServices: [
      { name: 'התקנת גוף תאורה', price: '₪150-250', description: 'התקנת מנורות תקרה, קיר וספוטים' },
      { name: 'תיקון קצר', price: '₪300-500', description: 'איתור ותיקון תקלות במערכת החשמל' },
      { name: 'הוספת שקע', price: '₪250-400', description: 'הוספת נקודת חשמל חדשה כולל חיווט' },
      { name: 'הגדלת חיבור', price: '₪2500+', description: 'שדרוג לוח החשמל לתלת פאזי' }
    ],
    features: ['חשמלאים מורשים בלבד', 'עמידה בתקני בטיחות', 'אחריות מלאה', 'ציוד מקצועי']
  },
  'beauty': {
    id: 'beauty',
    name: 'יופי',
    description: 'מניקור, פדיקור, איפור ��עיצוב שיער',
    longDescription: 'שירותי יופי וטיפוח שמגיעים עד אליך. מניקור ג\'ל, פדיקור רפואי, איפור לאירועים ותסרוקות. התפנקי בנוחות של הבית שלך עם המקצועניות הטובות ביותר.',
    image: 'https://images.unsplash.com/photo-1711274094763-ff442e4719ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBzYWxvbiUyMG1hbmljdXJlfGVufDF8fHx8MTc2NDI3MDk2OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    icon: <Scissors className="w-8 h-8" />,
    stats: { pros: 320, projects: 2100, rating: 4.95 },
    popularServices: [
      { name: 'מניקור ג\'ל', price: '₪120-180', description: 'מניקור יסודי ומריחת לק ג\'ל עמיד' },
      { name: 'פדיקור', price: '₪150-250', description: 'פדיקור קוסמטי או רפואי מלא' },
      { name: 'איפור ערב', price: '₪350-600', description: 'איפור מקצועי לאירועים מיוחדים' },
      { name: 'עיצוב שיער', price: '₪200-500', description: 'פן, בייביליס ותסרוקות ערב' }
    ],
    features: ['היגיינה וסטריליות', 'מותגים מובילים', 'שירות עד הבית', 'זמינות בערבים']
  },
  'renovation': {
    id: 'renovation',
    name: 'שיפוצים',
    description: 'שיפוץ דירות, בתים ומשרדים',
    longDescription: 'קבלני שיפוצים מומלצים לכל פרויקט. משיפוץ חדר אמבטיה ועד שיפוץ דירה קומפלט. עבודות גבס, ריצוף, אינסטלציה וחשמל תחת קורת גג אחת.',
    image: 'https://images.unsplash.com/photo-1618832515490-e181c4794a45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwcmVub3ZhdGlvbiUyMGNvbnN0cnVjdGlvbnxlbnwxfHx8fDE3NjQyNTEwMjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    icon: <Hammer className="w-8 h-8" />,
    stats: { pros: 200, projects: 450, rating: 4.7 },
    popularServices: [
      { name: 'שיפוץ מקלחת', price: '₪15k-30k', description: 'הריסה, אינסטלציה, ריצוף וכלים סניטריים' },
      { name: 'עבודות גבס', price: '₪250/מ"ר', description: 'קירות, תקרות מונמכות ומזנונים' },
      { name: 'ריצוף', price: '₪150/מ"ר', description: 'הדבקת ריצוף או פירוק והרכבה מחדש' },
      { name: 'שיפוץ כללי', price: 'לפי מ"ר', description: 'שיפוץ דירה קומפלט כולל הכל' }
    ],
    features: ['ליווי אדריכלי', 'עמידה בלוחות זמנים', 'גימור ברמה גבוהה', 'אחריות מורחבת']
  },
  'gardening': {
    id: 'gardening',
    name: 'גינון',
    description: 'טיפול בגינה, גיזום ועיצוב נוף',
    longDescription: 'גננים מקצועיים להקמה ותחזוקת גינות. התקנת מערכות השקיה, שתילה, גיזום עצים וכיסוח דשא. הופכים את הגינה שלכם לפינת חמד ירוקה.',
    image: 'https://images.unsplash.com/photo-1560879142-d339f75e2cc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYXJkZW5pbmclMjBwbGFudHMlMjBvdXRkb29yfGVufDF8fHx8MTc2NDI3Mjc5MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    icon: <Flower2 className="w-8 h-8" />,
    stats: { pros: 95, projects: 600, rating: 4.85 },
    popularServices: [
      { name: 'תחזוקה שוטפת', price: '₪300-600', description: 'כיסוח, גיזום, ניכוש עשבים ודישון' },
      { name: 'מערכת השקיה', price: '₪1500+', description: 'תכנון והתקנת מערכת השקיה ממוחשבת' },
      { name: 'גיזום עצים', price: '₪400-1200', description: 'גיזום עצים בוגרים ועיצוב שיחים' },
      { name: 'הקמת גינה', price: 'לפי מ"ר', description: 'תכנון וביצוע גינה חדשה מאפס' }
    ],
    features: ['ידע אגרונומי', 'ציוד מתקדם', 'פתרונות חסכוניים במים', 'עיצוב נוף']
  },
  'ac': {
    id: 'ac',
    name: 'מיזוג אוויר',
    description: 'התקנה, תיקון ותחזוקה',
    longDescription: 'טכנאי מיזוג אוויר מומחים לכל המותגים. התקנת מזגנים חדשים, מילוי גז, ניקוי פילטרים ותיקון תקלות. מבטיחים לכם קיץ קריר וחורף חמים.',
    image: 'https://images.unsplash.com/photo-1647022528152-52ed9338611d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaXIlMjBjb25kaXRpb25pbmclMjByZXBhaXJ8ZW58MXx8fHwxNzY0MjY2MTkzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    icon: <Wind className="w-8 h-8" />,
    stats: { pros: 120, projects: 750, rating: 4.8 },
    popularServices: [
      { name: 'התקנת מזגן', price: '₪600-1000', description: 'התקנת מזגן עילי (לא כולל המכשיר)' },
      { name: 'מילוי גז', price: '₪350-550', description: 'בדיקת דליפות ומילוי גז למזגן' },
      { name: 'ניקוי עמוק', price: '₪300-500', description: 'ניקוי עובש, פטריות ופילטרים' },
      { name: 'תיקון תקלה', price: '₪250+', description: 'ביקור טכנאי ואבחון תקלה במזגן' }
    ],
    features: ['חלפים מקוריים', 'אחריות על התיקון', 'זמינות בשיא הקיץ', 'ייעוץ מקצועי']
  },
  'painting': {
    id: 'painting',
    name: 'צביעה',
    description: 'צבעים פנים וחוץ, איטום וגימור',
    longDescription: 'צבעים מקצועיים לעבודות צבע איכותיות ונקיות. צביעת דירות, חדרי מדרגות, משרדים וחידוש קירות. שימוש בצבעים איכותיים ועמידים לאורך זמן.',
    image: 'https://images.unsplash.com/photo-1688372199140-cade7ae820fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWludGluZyUyMHdhbGwlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NjQyNzI3OTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    icon: <Paintbrush className="w-8 h-8" />,
    stats: { pros: 140, projects: 850, rating: 4.85 },
    popularServices: [
      { name: 'צביעת דירה', price: '₪2500+', description: 'צביעת דירת 3-4 חדרים (קירות בלבד)' },
      { name: 'צביעת חדר', price: '₪600-1000', description: 'צביעת חדר יחיד כולל תיקוני שפכטל' },
      { name: 'צביעת תקרה', price: '₪300-600', description: 'צביעת תקרות באמבטיה או בחדרים' },
      { name: 'שליכט צבעוני', price: '₪80/מ"ר', description: 'יישום שליכט דקורטיבי לקירות חוץ/פנים' }
    ],
    features: ['צבעים רחיצים', 'כיסוי מלא וניקיון', 'תיקוני טיח כלולים', 'עבודה מהירה']
  },
  'moving': {
    id: 'moving',
    name: 'הובלות',
    description: 'הובלת דירות, משרדים ופריטים בודדים',
    longDescription: 'מובילים מנוסים ואמינים להובלה בטוחה ושקטה. שירותי אריזה, פירוק והרכבת רהיטים, הובלות מנוף והובלות קטנות. הביטוח כלול במחיר.',
    image: 'https://images.unsplash.com/photo-1600725935160-f67ee4f6084a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpbmclMjBib3hlcyUyMGRlbGl2ZXJ5fGVufDF8fHx8MTc2NDI3Mjc5OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    icon: <Truck className="w-8 h-8" />,
    stats: { pros: 160, projects: 1200, rating: 4.75 },
    popularServices: [
      { name: 'הובלת דירה', price: '₪2000+', description: 'הובלת תכולת דירה מלאה' },
      { name: 'הובלה קטנה', price: '₪300-600', description: 'הובלת פריטים בודדים (מקרר, ספה)' },
      { name: 'שירותי אריזה', price: '₪30/קרטון', description: 'אריזה מקצועית של תכולת הבית' },
      { name: 'מנוף הרמה', price: '₪400/שעה', description: 'שימוש במנוף לקומות גבוהות' }
    ],
    features: ['ביטוח סחורה בהעברה', 'צוותים קבועים', 'עטיפה ומיגון ריהוט', 'עמידה בלוחות זמנים']
  }
};

export default function App() {
  // Helper to load saved state safely
  const loadSavedState = (key: string, fallback: any) => {
    try {
      const saved = sessionStorage.getItem('beed_app_state');
      if (!saved) return fallback;
      const parsed = JSON.parse(saved);
      return parsed[key] !== undefined ? parsed[key] : fallback;
    } catch {
      return fallback;
    }
  };

  const [currentView, setCurrentView] = useState<'landing' | 'category-page' | 'map' | 'data-collection' | 'bids' | 'detail' | 'checkout' | 'profile' | 'confirmation' | 'provider-tracking' | 'pro-login' | 'pro-dashboard' | 'terms' | 'privacy' | 'help' | 'about' | 'contact' | 'accessibility' | 'admin-dashboard' | 'user-login' | 'history' | 'wallet' | 'order-control-tower' | 'mission-control' | 'mission-controller' | 'active-order-tracking'>(() => loadSavedState('currentView', 'landing'));
  const [viewHistory, setViewHistory] = useState<string[]>(() => loadSavedState('viewHistory', []));
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(() => loadSavedState('selectedProvider', null));
  const [trackingOrderData, setTrackingOrderData] = useState<{
    id: string;
    providerName: string;
    providerImage: string;
    providerPhone: string;
    service: string;
    address: string;
    securityCode?: string;
    eta?: string;
    status: string;
  } | null>(null);
  
  // Special handling for category to restore icon component from static data
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(() => {
    const saved = loadSavedState('selectedCategory', null);
    if (saved && saved.id && CATEGORIES_DATA[saved.id]) return CATEGORIES_DATA[saved.id];
    return null;
  });

  const [serviceRequest, setServiceRequest] = useState<ServiceRequest | null>(() => loadSavedState('serviceRequest', null));
  const [bids, setBids] = useState<Bid[]>(() => loadSavedState('bids', []));
  const [selectedBid, setSelectedBid] = useState<Bid | null>(() => loadSavedState('selectedBid', null));
  const [newBooking, setNewBooking] = useState<Booking | null>(() => loadSavedState('newBooking', null));
  const [isProLoggedIn, setIsProLoggedIn] = useState(() => loadSavedState('isProLoggedIn', false));
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(() => loadSavedState('isUserLoggedIn', false));
  const [dashboardTab, setDashboardTab] = useState('activity');
  
  const [bidsAnimationShown, setBidsAnimationShown] = useState(false);

  // Selected address from landing page
  const [selectedAddress, setSelectedAddress] = useState<{ address: string; lat: number; lng: number } | null>(null);
  
  // Selected service from landing page
  const [selectedServiceFromLanding, setSelectedServiceFromLanding] = useState<string | null>(null);

  // Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Mock user data (would come from auth provider in real app)
  const mockUser = {
    name: "ישראל ישראלי",
    email: "israel@gmail.com",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"
  };

  // Persist state on changes
  useEffect(() => {
    const stateToSave = {
      currentView,
      viewHistory,
      selectedProvider,
      selectedCategory, // Note: React components like icons won't survive JSON.stringify, handled on load
      serviceRequest,
      bids,
      selectedBid,
      newBooking,
      isProLoggedIn,
      isUserLoggedIn
    };
    sessionStorage.setItem('beed_app_state', JSON.stringify(stateToSave));
  }, [currentView, viewHistory, selectedProvider, selectedCategory, serviceRequest, bids, selectedBid, newBooking, isProLoggedIn, isUserLoggedIn]);

  const navigateTo = (view: typeof currentView) => {
    setViewHistory(prev => [...prev, currentView]);
    setCurrentView(view);
  };

  const goBack = () => {
    if (viewHistory.length === 0) {
      setCurrentView('landing');
      return;
    }
    const newHistory = [...viewHistory];
    const prevView = newHistory.pop() as typeof currentView;
    setViewHistory(newHistory);
    setCurrentView(prevView);
  };

  const handleCategorySelect = (categoryId: string) => {
    const category = CATEGORIES_DATA[categoryId];
    if (category) {
      setSelectedCategory(category);
      navigateTo('category-page');
    } else {
      console.error(`Category ${categoryId} not found`);
      navigateTo('map');
    }
  };

  const handleServiceSelect = (category: string) => {
    navigateTo('data-collection');
    setServiceRequest({ 
      id: '', 
      category, 
      subProblem: '', 
      complexity: 'standard', 
      accessibility: '', 
      urgency: 'planned',
      serviceSKU: '',
      hasVideo: false
    });
  };

  const handleBookingContinue = (details: { category: string; address: string; details: string; time: 'now' | 'scheduled'; scheduledDate?: string; scheduledTime?: string; lat?: number; lng?: number }) => {
    navigateTo('data-collection');
    setServiceRequest({ 
      id: '', 
      category: details.category, 
      subProblem: '', 
      complexity: 'standard', 
      accessibility: '', 
      urgency: details.time === 'now' ? 'immediate' : 'planned',
      serviceSKU: '',
      hasVideo: false,
      location: {
        address: details.address,
        details: details.details,
        lat: details.lat,
        lng: details.lng
      },
      scheduledTime: details.time,
      scheduledDate: details.scheduledDate,
      scheduledHour: details.scheduledTime
    });
  };

  const handleRequestComplete = (request: ServiceRequest, generatedBids: Bid[]) => {
    setServiceRequest(request);
    setBids(generatedBids);
    setBidsAnimationShown(false); // Reset animation for new request
    navigateTo('bids');
  };

  const handleBidSelect = (bid: Bid) => {
    setSelectedBid(bid);
    navigateTo('checkout');
  };

  const handleCheckoutComplete = (booking: Booking) => {
    setNewBooking(booking);
    navigateTo('confirmation');
  };

  const handleBackToMap = () => {
    setCurrentView('map');
    setViewHistory([]);
    setSelectedProvider(null);
    setServiceRequest(null);
    setBids([]);
    setSelectedBid(null);
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    setViewHistory([]);
    setSelectedProvider(null);
    setServiceRequest(null);
    setBids([]);
    setSelectedBid(null);
    setNewBooking(null);
  };

  return (
    <LocationProvider>
    <BookingProvider>
    <JobProvider>
    <OrderProvider>
    <div className="min-h-screen bg-gray-50 font-sans relative">
      
      {/* Global Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onNavigate={(view) => {
            // Handle special navigation cases from Sidebar
            if (view === 'dashboard') {
                setDashboardTab('activity');
                navigateTo('profile');
            } else if (view === 'new-tender') {
                navigateTo('map');
            } else if (view === 'pro-access') {
                navigateTo('pro-login');
            } else if (view === 'logout') {
                setIsUserLoggedIn(false);
                navigateTo('landing');
            } else if (view === 'settings' || view === 'profile') {
                setDashboardTab('profile');
                navigateTo('profile');
            } else if (view === 'help') {
                navigateTo('help');
            } else if (['orders', 'messages', 'activity', 'schedule', 'refunds', 'loyalty', 'store'].includes(view)) {
                // Map sidebar actions to profile tabs
                const tabMap: Record<string, string> = {
                    'orders': 'order',
                    'messages': 'message',
                    'activity': 'activity',
                    'schedule': 'schedule',
                    'refunds': 'refunds',
                    'loyalty': 'loyalty',
                    'store': 'store'
                };
                setDashboardTab(tabMap[view] || 'activity');
                navigateTo('profile');
            } else {
                navigateTo(view as any);
            }
        }}
        user={isUserLoggedIn ? mockUser : undefined}
      />

      {currentView === 'landing' && (
        <>
            <LandingPage
            onGetStarted={(addressData, selectedService) => {
              if (addressData) {
                setSelectedAddress(addressData);
              }
              if (selectedService) {
                setSelectedServiceFromLanding(selectedService);
              }
              navigateTo('map');
            }}
            onCategorySelect={handleCategorySelect}
            onProAccess={() => navigateTo('pro-login')}
            onTermsClick={() => navigateTo('terms')}
            onPrivacyClick={() => navigateTo('privacy')}
            onHelpClick={() => navigateTo('help')}
            onAboutClick={() => navigateTo('about')}
            onContactClick={() => navigateTo('contact')}
            onAccessibilityClick={() => navigateTo('accessibility')}
            onDashboardClick={() => navigateTo('admin-dashboard')}
            onUserLogin={() => navigateTo('user-login')}
            isUserLoggedIn={isUserLoggedIn}
            onLogout={() => setIsUserLoggedIn(false)}
            userData={isUserLoggedIn ? mockUser : undefined}
            onUserDashboardClick={(tab) => {
                setDashboardTab(tab || 'activity');
                navigateTo('profile');
            }}
            onProfileClick={() => setIsSidebarOpen(true)}
            />
        </>
      )}
      {currentView === 'user-login' && (
        <UserLogin
          onBack={goBack}
          onBackToLanding={handleBackToLanding}
          onLoginSuccess={() => {
            setIsUserLoggedIn(true);
            handleBackToLanding();
          }}
        />
      )}
      {currentView === 'category-page' && selectedCategory && (
        <CategoryPage
          category={selectedCategory}
          onBack={goBack}
          onRequest={() => handleServiceSelect(selectedCategory.name)}
        />
      )}
      {currentView === 'map' && (
        <MapView 
          onServiceSelect={handleServiceSelect}
          onProfileClick={() => setIsSidebarOpen(true)} // Open Sidebar instead of direct profile
          onProAccessClick={() => navigateTo('pro-login')}
          onBackToLanding={handleBackToLanding}
          onBookingContinue={handleBookingContinue}
          initialAddress={selectedAddress}
          initialService={selectedServiceFromLanding}
        />
      )}
      {currentView === 'pro-login' && (
        <ProAuth
          onBack={goBack}
          onBackToLanding={handleBackToLanding}
          onLoginSuccess={() => {
            setIsProLoggedIn(true);
            navigateTo('pro-dashboard');
          }}
        />
      )}
      {currentView === 'pro-dashboard' && (
        <ProDashboard
          onLogout={() => {
            setIsProLoggedIn(false);
            handleBackToMap();
          }}
          onBackToLanding={handleBackToLanding}
        />
      )}
      {currentView === 'data-collection' && serviceRequest && (
        <SmartDataCollection
          initialCategory={serviceRequest.category}
          initialScheduledDate={serviceRequest.scheduledDate}
          initialScheduledHour={serviceRequest.scheduledHour}
          initialUrgency={serviceRequest.urgency}
          initialLocation={serviceRequest.location}
          onRequestComplete={handleRequestComplete}
          onBack={goBack}
        />
      )}
      {currentView === 'bids' && serviceRequest && (
        <BidsList
          serviceRequest={serviceRequest}
          bids={bids}
          onBidSelect={handleBidSelect}
          onBack={goBack}
          initialAnimationComplete={bidsAnimationShown}
          onAnimationComplete={() => setBidsAnimationShown(true)}
        />
      )}
      {currentView === 'checkout' && selectedBid && serviceRequest && (
        <BookingCheckout
          bid={selectedBid}
          serviceRequest={serviceRequest}
          onCheckoutComplete={handleCheckoutComplete}
          onBack={goBack}
          onUpdateLocationDetails={(details) => {
            setServiceRequest(prev => prev ? {
              ...prev,
              location: {
                ...prev.location,
                address: prev.location?.address || '',
                details: details
              }
            } : null);
          }}
        />
      )}
      {currentView === 'profile' && (
        <UserProfile 
          onBack={goBack} 
          onBackToLanding={handleBackToLanding} 
          initialTab={dashboardTab}
          onTrackOrder={(orderData) => {
            console.log('[App] Navigating to active-order-tracking for order:', orderData.id);
            setTrackingOrderData(orderData);
            navigateTo('active-order-tracking');
          }}
        />
      )}
      {currentView === 'history' && (
        <History onBack={goBack} />
      )}
      {currentView === 'wallet' && (
        <Wallet onBack={goBack} />
      )}
      {currentView === 'confirmation' && newBooking && (
        <BookingConfirmation
          booking={newBooking}
          onBackToHome={handleBackToMap}
          onTrackProvider={() => navigateTo('provider-tracking')}
          serviceRequest={serviceRequest}
        />
      )}
      {currentView === 'provider-tracking' && (
        <ProviderTracking
          booking={newBooking}
          onBack={handleBackToMap}
        />
      )}
      {currentView === 'terms' && (
        <TermsOfService onBack={goBack} />
      )}
      {currentView === 'privacy' && (
        <PrivacyPolicy onBack={goBack} />
      )}
      {currentView === 'help' && (
        <HelpCenter onBack={goBack} />
      )}
      {currentView === 'about' && (
        <AboutUs onBack={goBack} />
      )}
      {currentView === 'contact' && (
        <ContactUs onBack={goBack} />
      )}
      {currentView === 'accessibility' && (
        <Accessibility onBack={goBack} />
      )}
      {currentView === 'admin-dashboard' && (
        <AdminDashboard onBack={() => navigateTo('landing')} onNavigate={(view) => navigateTo(view as any)} />
      )}

      {/* --- NEW VIEWS RENDER --- */}
      {currentView === 'order-control-tower' && (
          <OrderControlTower onBack={handleBackToLanding} />
      )}
      {currentView === 'mission-control' && (
          <MissionControl onBack={handleBackToLanding} onNavigate={(view) => navigateTo(view as any)} />
      )}
      {currentView === 'mission-controller' && (
          <MissionController onBack={handleBackToLanding} />
      )}
      {currentView === 'active-order-tracking' && (
          <ActiveOrderTracking 
            onBack={() => {
              setTrackingOrderData(null);
              handleBackToLanding();
            }} 
            orderData={trackingOrderData} 
          />
      )}

      {/* Dev Tools - Visible only in development or with ?debug=true */}
      <DevTools />

      {/* EMERGENCY RESET BUTTON - ALWAYS VISIBLE ON ALL PAGES */}
      <button
        onClick={() => {
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = '/';
        }}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 99999,
          backgroundColor: '#ef4444',
          color: 'white',
          padding: '12px',
          borderRadius: '50%',
          boxShadow: '0 4px 20px rgba(239, 68, 68, 0.5)',
          border: '3px solid white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="איפוס מלא - חזרה לדף הבית"
        aria-label="Emergency Reset"
      >
        <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </button>

    </div>
    </OrderProvider>
    </JobProvider>
    </BookingProvider>
    </LocationProvider>
  );
}