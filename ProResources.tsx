import { useState } from 'react';
import { Users, ShoppingBag, Shield, Star, Award, Wrench, ExternalLink, ChevronLeft, Camera, MapPin, Clock, MessageSquare, Send, Plus, Search, X, CheckCircle, Phone, Navigation, ChevronDown, ChevronUp } from 'lucide-react';
import { Map, Marker } from 'pigeon-maps';

// Mock Data
const REVIEWS = [
  { id: 1, client: 'דני כהן', rating: 5, text: 'שירות מעולה! הגיע בזמן ותיקן את הבעיה במהירות.', date: '10/11/2024', service: 'אינסטלציה' },
  { id: 2, client: 'רונית שחר', rating: 5, text: 'מקצוען אמיתי, מומלץ בחום.', date: '08/11/2024', service: 'חשמל' },
  { id: 3, client: 'יוסי לוי', rating: 4, text: 'עבודה טובה, המחיר היה קצת גבוה.', date: '05/11/2024', service: 'אינסטלציה' },
];

const COMMUNITY_POSTS = [
  { id: 1, user: 'אבי האינסטלטור', avatar: 'https://i.pravatar.cc/150?img=12', text: 'מישהו יודע איפה אפשר להשיג חלקים לניאגרה סמויה של גרוהה באזור המרכז עכשיו?', likes: 5, comments: 12, time: 'לפני 20 דקות' },
  { id: 2, user: 'משה חשמל', avatar: 'https://i.pravatar.cc/150?img=33', text: 'מחפש עובד לעזרה בפרויקט גדול בשבוע הבא בתל אביב. תשלום הוגן!', likes: 8, comments: 4, time: 'לפני שעה' },
];

const MARKET_ITEMS = [
  { id: 1, title: 'מקדחה בוש מקצועית', price: 450, condition: 'כמו חדש', location: 'תל אביב', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=400&q=80' },
  { id: 2, title: 'סולם מתקפל 4 מטר', price: 200, condition: 'משומש', location: 'רמת גן', image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=400&q=80' },
];

type SupplierCategory = 'parts' | 'equipment' | 'tools' | 'electrical' | 'plumbing';

interface Supplier {
  id: number;
  name: string;
  category: SupplierCategory;
  address: string;
  phone: string;
  openHours: string;
  lat: number;
  lng: number;
  distance: number;
}

const SUPPLIERS: Supplier[] = [
  { 
    id: 1, 
    name: 'טמבור - חומרי בניין', 
    category: 'parts', 
    address: 'רחוב החשמונאים 94, תל אביב', 
    phone: '03-5551234', 
    openHours: '07:00-18:00', 
    lat: 32.0731, 
    lng: 34.7882, 
    distance: 1.2 
  },
  { 
    id: 2, 
    name: 'הום סנטר', 
    category: 'equipment', 
    address: 'דרך נמיר 127, תל אביב', 
    phone: '03-6441000', 
    openHours: '08:00-21:00', 
    lat: 32.0987, 
    lng: 34.7813, 
    distance: 2.5 
  },
  { 
    id: 3, 
    name: 'אייס', 
    category: 'tools', 
    address: 'אבן גבירול 71, תל אביב', 
    phone: '03-5279000', 
    openHours: '08:30-20:00', 
    lat: 32.0853, 
    lng: 34.7818, 
    distance: 0.8 
  },
  { 
    id: 4, 
    name: 'פלסאון', 
    category: 'plumbing', 
    address: 'רחוב יגאל אלון 114, תל אביב', 
    phone: '03-6883456', 
    openHours: '07:30-17:00', 
    lat: 32.0687, 
    lng: 34.7925, 
    distance: 1.8 
  },
  { 
    id: 5, 
    name: 'מגה שיווק חשמל', 
    category: 'electrical', 
    address: 'רחוב הרכבת 28, תל אביב', 
    phone: '03-5603210', 
    openHours: '08:00-17:30', 
    lat: 32.0563, 
    lng: 34.7653, 
    distance: 3.1 
  },
  { 
    id: 6, 
    name: 'כלי ברזל', 
    category: 'tools', 
    address: 'רחוב אלנבי 58, תל אביב', 
    phone: '03-5107890', 
    openHours: '09:00-19:00', 
    lat: 32.0678, 
    lng: 34.7698, 
    distance: 0.5 
  },
];

const CATEGORY_LABELS: Record<SupplierCategory, string> = {
  parts: 'חלקים',
  equipment: 'ציוד',
  tools: 'כלי עבודה',
  electrical: 'חשמל',
  plumbing: 'אינסטלציה',
};

const CATEGORY_COLORS: Record<SupplierCategory, { bg: string; text: string; border: string }> = {
  parts: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  equipment: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  tools: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  electrical: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  plumbing: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
};

type SubTab = 'overview' | 'community' | 'market' | 'reputation' | 'suppliers';

export function ProResources() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('overview');
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [insuranceActive, setInsuranceActive] = useState(false);
  
  const [supplierSearch, setSupplierSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SupplierCategory | null>(null);
  const [expandedSupplier, setExpandedSupplier] = useState<number | null>(null);

  const renderOverview = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
       {/* Safety Net (Insurance) - Highlighted */}
       <div className={`rounded-2xl p-6 text-white shadow-lg transition-all relative overflow-hidden ${insuranceActive ? 'bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-emerald-200' : 'bg-gradient-to-br from-gray-900 to-gray-800 shadow-gray-400'}`}>
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative z-10">
            <div className="flex items-start gap-4 mb-4">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                    {insuranceActive ? <CheckCircle className="w-6 h-6 text-white" /> : <Shield className="w-6 h-6 text-white" />}
                </div>
                <div>
                    <h4 className="font-bold text-lg">ביטוח צד ג' (Tzad Gimel)</h4>
                    <p className="text-white/80 text-sm mt-1">מופעל ע"י הפניקס • כיסוי עד ₪2,000,000</p>
                </div>
            </div>
            
            {insuranceActive ? (
                 <div className="bg-white/10 rounded-xl p-4 border border-white/10 mb-4">
                    <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-emerald-100">בתוקף עד:</span>
                        <span className="font-bold">מחר ב-08:00</span>
                    </div>
                    <div className="w-full bg-black/20 rounded-full h-2">
                        <div className="bg-emerald-400 h-2 rounded-full w-3/4"></div>
                    </div>
                 </div>
            ) : (
                <p className="text-sm opacity-90 leading-relaxed mb-6 text-gray-300">
                    הפעל ביטוח יומי למשימות מסוכנות ב-₪15 בלבד. הגן על עצמך ועל העסק שלך מתביעות נזיקין.
                </p>
            )}
            
            <button 
                onClick={() => !insuranceActive && setShowInsuranceModal(true)}
                disabled={insuranceActive}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
                    insuranceActive 
                    ? 'bg-white/20 text-white cursor-default' 
                    : 'bg-white text-gray-900 hover:bg-gray-100 hover:scale-[1.02]'
                }`}
            >
                {insuranceActive ? 'הביטוח פעיל' : 'הפעל ל-24 שעות (₪15)'}
            </button>
          </div>
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-2 gap-4">
          <div 
            onClick={() => setActiveSubTab('reputation')}
            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
              <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600 mb-4 group-hover:scale-110 transition-transform">
                  <Star className="w-6 h-6 fill-current" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">המוניטין שלי</h4>
              <p className="text-xs text-gray-500">דירוג 4.9 • 48 ביקורות</p>
          </div>

          <div 
            onClick={() => setActiveSubTab('community')}
            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">הקהילה</h4>
              <p className="text-xs text-gray-500">פורום מקצועי • התייעצויות</p>
          </div>

          <div 
            onClick={() => setActiveSubTab('market')}
            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">יד שנייה</h4>
              <p className="text-xs text-gray-500">לוח ציוד וכלי עבודה</p>
          </div>

          <div 
            onClick={() => setActiveSubTab('suppliers')}
            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                  <Wrench className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">ספקים</h4>
              <p className="text-xs text-gray-500">מפה • שעות פתיחה</p>
          </div>
      </div>

      {/* Recent Activity Teaser */}
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <h4 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-gray-500" />
              הישגים אחרונים
          </h4>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <div className="min-w-[120px] bg-white p-3 rounded-xl border border-gray-200 flex flex-col items-center text-center">
                  <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" className="w-8 h-8 mb-2 opacity-80" alt="Badge" />
                  <span className="text-xs font-bold">אלוף השירות</span>
                  <span className="text-[10px] text-gray-400">נובמבר 2024</span>
              </div>
              <div className="min-w-[120px] bg-white p-3 rounded-xl border border-gray-200 flex flex-col items-center text-center">
                  <img src="https://cdn-icons-png.flaticon.com/512/190/190420.png" className="w-8 h-8 mb-2 opacity-80" alt="Badge" />
                  <span className="text-xs font-bold">100 עבודות</span>
                  <span className="text-[10px] text-gray-400">הושג</span>
              </div>
              <div className="min-w-[120px] bg-white p-3 rounded-xl border border-gray-200 flex flex-col items-center text-center opacity-50 grayscale">
                  <div className="w-8 h-8 mb-2 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                      <Star className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold">דירוג מושלם</span>
                  <span className="text-[10px] text-gray-400">בתהליך...</span>
              </div>
          </div>
      </div>
    </div>
  );

  const renderCommunity = () => (
      <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <MessageSquare className="w-5 h-5" />
              </div>
              <div className="flex-1">
                  <h4 className="font-bold text-blue-900 text-sm">יש לך שאלה מקצועית?</h4>
                  <p className="text-xs text-blue-700">אלפי בעלי מקצוע כאן כדי לעזור</p>
              </div>
              <button className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="w-5 h-5" />
              </button>
          </div>

          <div className="space-y-4">
              {COMMUNITY_POSTS.map(post => (
                  <div key={post.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                          <img src={post.avatar} className="w-10 h-10 rounded-full object-cover" alt={post.user} />
                          <div>
                              <h5 className="font-bold text-gray-900 text-sm">{post.user}</h5>
                              <p className="text-xs text-gray-500">{post.time}</p>
                          </div>
                      </div>
                      <p className="text-gray-800 text-sm mb-4 leading-relaxed">
                          {post.text}
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                          <button className="flex items-center gap-1.5 text-gray-500 text-xs font-medium hover:text-blue-600 transition-colors">
                              <div className="p-1.5 rounded-full bg-gray-50 group-hover:bg-blue-50">👍</div>
                              {post.likes} לייקים
                          </button>
                          <button className="flex items-center gap-1.5 text-gray-500 text-xs font-medium hover:text-blue-600 transition-colors">
                              <div className="p-1.5 rounded-full bg-gray-50 group-hover:bg-blue-50">💬</div>
                              {post.comments} תגובות
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderMarket = () => (
      <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
          <div className="sticky top-0 z-10 bg-gray-50 pb-2">
            <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="חפש ציוד, כלי עבודה..." className="w-full bg-white border border-gray-200 rounded-xl py-3 pr-10 pl-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
              {MARKET_ITEMS.map(item => (
                  <div key={item.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer">
                      <div className="h-32 bg-gray-100 relative">
                          <img src={item.image} className="w-full h-full object-cover" alt={item.title} />
                          <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full">
                              {item.location}
                          </div>
                      </div>
                      <div className="p-3">
                          <h5 className="font-bold text-gray-900 text-sm mb-1 truncate">{item.title}</h5>
                          <div className="flex justify-between items-center">
                              <span className="text-blue-600 font-bold text-sm">₪{item.price}</span>
                              <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{item.condition}</span>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
          
          <button className="fixed bottom-24 left-6 w-14 h-14 bg-orange-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-orange-200 hover:bg-orange-700 transition-transform hover:scale-105 active:scale-95 z-20">
              <Plus className="w-6 h-6" />
          </button>
      </div>
  );

  const renderReputation = () => (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div className="bg-white rounded-2xl p-6 text-center border border-gray-200 shadow-sm">
              <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-500 mx-auto mb-4 text-3xl font-bold ring-4 ring-yellow-100">
                  4.9
              </div>
              <h3 className="font-bold text-gray-900 text-lg">ציון מצוין!</h3>
              <p className="text-sm text-gray-500 mb-4">מבוסס על 48 ביקורות מאומתות</p>
              <div className="flex justify-center gap-1 mb-2">
                  {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  ))}
              </div>
          </div>

          <div className="space-y-4">
              <h4 className="font-bold text-gray-900 text-sm pr-2">ביקורות אחרונות</h4>
              {REVIEWS.map(review => (
                  <div key={review.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                          <div>
                              <span className="font-bold text-gray-900 text-sm block">{review.client}</span>
                              <span className="text-xs text-gray-400">{review.service} • {review.date}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                              <span className="text-xs font-bold text-yellow-700">{review.rating}</span>
                          </div>
                      </div>
                      <p className="text-sm text-gray-600 italic">"{review.text}"</p>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderSuppliers = () => {
    const filteredSuppliers = SUPPLIERS.filter(supplier => {
      const matchesSearch = supplier.name.includes(supplierSearch) || 
                           supplier.address.includes(supplierSearch);
      const matchesCategory = selectedCategory === null || supplier.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    const mapCenter: [number, number] = [32.0753, 34.7818];

    return (
      <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="חפש ספק לפי שם או כתובת..." 
            value={supplierSearch}
            onChange={(e) => setSupplierSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl py-3 pr-10 pl-4 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm" 
          />
          {supplierSearch && (
            <button 
              onClick={() => setSupplierSearch('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === null 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            הכל
          </button>
          {(Object.keys(CATEGORY_LABELS) as SupplierCategory[]).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat 
                  ? 'bg-purple-600 text-white' 
                  : `${CATEGORY_COLORS[cat].bg} ${CATEGORY_COLORS[cat].text} hover:opacity-80`
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Map Section */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="h-48 relative">
            <Map 
              defaultCenter={mapCenter} 
              defaultZoom={13}
              attribution={false}
            >
              {filteredSuppliers.map(supplier => (
                <Marker 
                  key={supplier.id} 
                  anchor={[supplier.lat, supplier.lng]}
                  onClick={() => setExpandedSupplier(supplier.id)}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white cursor-pointer transition-transform hover:scale-110 ${
                    expandedSupplier === supplier.id ? 'bg-purple-600 scale-110' : 'bg-purple-500'
                  }`}>
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                </Marker>
              ))}
            </Map>
          </div>
          <div className="p-3 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              {filteredSuppliers.length} ספקים נמצאו באזורך
            </p>
          </div>
        </div>

        {/* Suppliers List */}
        <div className="space-y-3">
          <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <Wrench className="w-4 h-4 text-purple-500" />
            רשימת ספקים
          </h4>
          
          {filteredSuppliers.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">לא נמצאו ספקים התואמים לחיפוש</p>
            </div>
          ) : (
            filteredSuppliers.map(supplier => {
              const isExpanded = expandedSupplier === supplier.id;
              const categoryStyle = CATEGORY_COLORS[supplier.category];
              
              return (
                <div 
                  key={supplier.id} 
                  className={`bg-white rounded-2xl border shadow-sm transition-all overflow-hidden ${
                    isExpanded ? 'border-purple-300 shadow-md' : 'border-gray-200'
                  }`}
                >
                  {/* Card Header - Always Visible */}
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedSupplier(isExpanded ? null : supplier.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-bold text-gray-900 text-sm">{supplier.name}</h5>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${categoryStyle.bg} ${categoryStyle.text}`}>
                            {CATEGORY_LABELS[supplier.category]}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {supplier.distance} ק"מ
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {supplier.openHours}
                          </span>
                        </div>
                      </div>
                      <button className="p-1 text-gray-400">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                      <div className="pt-4 space-y-3">
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span>{supplier.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span dir="ltr">{supplier.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span>שעות פתיחה: {supplier.openHours}</span>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <a 
                            href={`tel:${supplier.phone.replace(/-/g, '')}`}
                            className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                            התקשר
                          </a>
                          <a 
                            href={`https://www.google.com/maps/dir/?api=1&destination=${supplier.lat},${supplier.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            <Navigation className="w-4 h-4" />
                            נווט
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20" dir="rtl">
      <div className="flex items-center justify-between sticky top-0 bg-gray-50 z-10 pb-2">
        {activeSubTab === 'overview' ? (
            <h2 className="text-2xl font-bold text-gray-900">ניהול העסק</h2>
        ) : (
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setActiveSubTab('overview')}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 text-gray-600" />
                </button>
                <h2 className="text-2xl font-bold text-gray-900">
                    {activeSubTab === 'community' ? 'הקהילה' : 
                     activeSubTab === 'market' ? 'יד שנייה' : 
                     activeSubTab === 'suppliers' ? 'ספקים' : 'המוניטין שלי'}
                </h2>
            </div>
        )}
      </div>

      {activeSubTab === 'overview' && renderOverview()}
      {activeSubTab === 'community' && renderCommunity()}
      {activeSubTab === 'market' && renderMarket()}
      {activeSubTab === 'reputation' && renderReputation()}
      {activeSubTab === 'suppliers' && renderSuppliers()}

      {/* Insurance Modal */}
      {showInsuranceModal && (
          <div className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowInsuranceModal(false)}>
              <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full duration-300" onClick={e => e.stopPropagation()}>
                  <div className="bg-emerald-600 p-6 text-white text-center relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                      <Shield className="w-16 h-16 mx-auto mb-4 opacity-90" />
                      <h3 className="font-bold text-2xl mb-1 relative z-10">ביטוח יומי אקספרס</h3>
                      <p className="text-emerald-100 text-sm relative z-10">כיסוי מקיף ל-24 שעות הקרובות</p>
                  </div>
                  <div className="p-6 space-y-4">
                      <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                          <div className="flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-emerald-600" />
                              <span className="text-sm text-gray-700">כיסוי צד ג' עד ₪2,000,000</span>
                          </div>
                          <div className="flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-emerald-600" />
                              <span className="text-sm text-gray-700">ביטול השתתפות עצמית</span>
                          </div>
                          <div className="flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-emerald-600" />
                              <span className="text-sm text-gray-700">תקף לכל סוגי העבודות</span>
                          </div>
                      </div>

                      <div className="flex items-center justify-between px-2 py-2">
                          <span className="font-bold text-gray-900">עלות ליום:</span>
                          <span className="font-bold text-xl text-emerald-600">₪15.00</span>
                      </div>

                      <button 
                        onClick={() => {
                            setInsuranceActive(true);
                            setShowInsuranceModal(false);
                        }}
                        className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95"
                      >
                          הפעל ביטוח ומחייב
                      </button>
                      <p className="text-center text-[10px] text-gray-400">
                          בלחיצה אני מאשר את תנאי הפוליסה של הפניקס חברה לביטוח בע"מ
                      </p>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
