import { useState, useEffect, useRef } from 'react';
import { Map, Marker, Overlay } from 'pigeon-maps';
import { Navigation, Phone, MessageSquare, Shield, AlertTriangle, CheckCircle, Clock, MapPin, Plus, Trash2, X, Camera, Video, Navigation2, Send, Headphones, User, MoreVertical, Ban, AlertCircle, Upload, FileText, Sparkles } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

// --- CONFIGURATION MAPBOX ---
const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
const MAPBOX_STYLE_ID = 'streets-v12'; 
const MAPBOX_USERNAME = 'mapbox';

const mapProvider = (x: number, y: number, z: number, dpr?: number) => {
  const retina = dpr && dpr >= 2 ? '@2x' : '';
  return `https://api.mapbox.com/styles/v1/${MAPBOX_USERNAME}/${MAPBOX_STYLE_ID}/tiles/256/${z}/${x}/${y}${retina}?access_token=${MAPBOX_ACCESS_TOKEN}`;
};

// Calcul de l'angle de direction (bearing)
function getBearing(startLat: number, startLng: number, destLat: number, destLng: number) {
  const startLatRad = (startLat * Math.PI) / 180;
  const destLatRad = (destLat * Math.PI) / 180;
  const deltaLng = ((destLng - startLng) * Math.PI) / 180;

  const y = Math.sin(deltaLng) * Math.cos(destLatRad);
  const x =
    Math.cos(startLatRad) * Math.sin(destLatRad) -
    Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(deltaLng);

  const brng = Math.atan2(y, x);
  return ((brng * 180) / Math.PI + 360) % 360;
}

// Composant RouteLine
const RouteLine = ({ 
  latLngToPixel, 
  coords, 
  color = "#2563EB", 
  strokeWidth = "5", 
  opacity = "1" 
}: any) => {
  if (typeof latLngToPixel !== 'function') return null;
  if (!Array.isArray(coords) || coords.length < 2) return null;

  const points = coords.map((coord: [number, number]) => {
    try {
      const pixel = latLngToPixel(coord);
      if (!Array.isArray(pixel) || pixel.length < 2) return '';
      const [x, y] = pixel;
      if (!Number.isFinite(x) || !Number.isFinite(y)) return '';
      return `${x},${y}`;
    } catch (e) {
      return '';
    }
  }).filter((p: string) => p !== '').join(' ');

  if (!points) return null;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={opacity}
      />
    </svg>
  );
};

type ProActiveJobProps = {
  job: any; 
  onBack: () => void;
  onComplete: () => void;
  onCancel?: () => void; // New prop for cancellation
};

type ExtraItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
};

type Message = {
  id: string;
  text: string;
  sender: 'me' | 'support' | 'client';
  timestamp: string; 
};

// Shared Storage Key
const STORAGE_KEY = 'beed_support_chat_messages';

export function ProActiveJob({ job, onBack, onComplete, onCancel }: ProActiveJobProps) {
  const [status, setStatus] = useState<'traveling' | 'arrived' | 'working' | 'summary' | 'completed'>('traveling');
  const [elapsedTime, setElapsedTime] = useState(0); // Minutes
  const [mapHeight, setMapHeight] = useState(600); // Default value
  
  // Extras Management
  const [extras, setExtras] = useState<ExtraItem[]>([]);
  const [showAddExtra, setShowAddExtra] = useState(false);
  const [newExtraName, setNewExtraName] = useState('');
  const [newExtraPrice, setNewExtraPrice] = useState('');
  const [newExtraImage, setNewExtraImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- LIVE TRACKING STATE ---
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [currentPos, setCurrentPos] = useState<[number, number]>([32.07450, 34.77700]); // Start slightly away
  const [rotation, setRotation] = useState(0);
  const [isRouteLoading, setIsRouteLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(15);
  const [liveEta, setLiveEta] = useState(12); 

  // --- CHATS STATE ---
  const [showSupportChat, setShowSupportChat] = useState(false);
  const [showClientChat, setShowClientChat] = useState(false);
  
  // --- MENU STATE ---
  const [showMenu, setShowMenu] = useState(false);
  
  // --- COMPLETION MODAL STATE ---
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionNote, setCompletionNote] = useState('');
  const [completionPhotos, setCompletionPhotos] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isCompletingJob, setIsCompletingJob] = useState(false);
  const completionPhotoInputRef = useRef<HTMLInputElement>(null);
  
  // Support Messages
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Client Messages
  const [clientMessages, setClientMessages] = useState<Message[]>([
    { id: '1', text: 'היי, אני בבית ומחכה לך', sender: 'client', timestamp: new Date().toISOString() }
  ]);
  const [newClientMessage, setNewClientMessage] = useState('');
  const clientChatEndRef = useRef<HTMLDivElement>(null);

  // Resize handler for map
  useEffect(() => {
    setMapHeight(window.innerHeight);
    const handleResize = () => setMapHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load support chat messages from localStorage
  useEffect(() => {
    const loadMessages = () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            setChatMessages(JSON.parse(stored));
        } else {
            const initialMsg: Message = { 
                id: '1', 
                text: 'שלום, כאן המוקד הטכני. איך אפשר לעזור?', 
                sender: 'support', 
                timestamp: new Date().toISOString() 
            };
            setChatMessages([initialMsg]);
            localStorage.setItem(STORAGE_KEY, JSON.stringify([initialMsg]));
        }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
  }, []);

  // Auto scroll chats
  useEffect(() => {
    if (showSupportChat) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (showClientChat) clientChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, clientMessages, showSupportChat, showClientChat]);

  // Timer for working state
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'working') {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 60000); // Update every minute
    }
    return () => clearInterval(interval);
  }, [status]);

  // --- FETCH ROUTE (OSRM) ---
  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const startLng = 34.7700;
        const startLat = 32.0700;
        const endLng = 34.7818;
        const endLat = 32.0853;

        const waypoints = `${startLng},${startLat};${endLng},${endLat}`;

        const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson`);
        const data = await response.json();

        if (data.routes && data.routes[0]) {
          const coords = data.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);
          setRouteCoords(coords);
          if (coords.length > 0) setCurrentPos(coords[0]);
        }
      } catch (error) {
        console.error("Error fetching route:", error);
        setRouteCoords([[32.0700, 34.7700], [32.0853, 34.7818]]);
      } finally {
        setIsRouteLoading(false);
      }
    };

    if (status === 'traveling') {
      fetchRoute();
    }
  }, [status]);

  // --- ANIMATION LOOP ---
  useEffect(() => {
    if (status !== 'traveling' || routeCoords.length < 2) return;

    let startTime: number;
    const totalDuration = 30000; 

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);

      const totalSegments = routeCoords.length - 1;
      const segmentProgress = progress * totalSegments;
      const currentSegmentIndex = Math.floor(segmentProgress);
      const segmentPercent = segmentProgress - currentSegmentIndex;

      if (currentSegmentIndex < totalSegments) {
        const start = routeCoords[currentSegmentIndex];
        const end = routeCoords[currentSegmentIndex + 1];

        const newLat = start[0] + (end[0] - start[0]) * segmentPercent;
        const newLng = start[1] + (end[1] - start[1]) * segmentPercent;

        setCurrentPos([newLat, newLng]);
        setCurrentIndex(currentSegmentIndex);

        if (Math.abs(start[0] - end[0]) > 0.00001 || Math.abs(start[1] - end[1]) > 0.00001) {
             const bearing = getBearing(start[0], start[1], end[0], end[1]);
             setRotation(bearing);
        }

        const remaining = Math.ceil(12 * (1 - progress));
        setLiveEta(remaining);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCurrentPos(routeCoords[routeCoords.length - 1]);
        }
      }
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [routeCoords, status]);


  const handleStatusChange = (newStatus: typeof status) => {
    setStatus(newStatus);
    if (newStatus === 'completed') {
      onComplete();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewExtraImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddExtra = () => {
    if (newExtraName && newExtraPrice && newExtraImage) {
      setExtras([...extras, {
        id: Math.random().toString(36).substr(2, 9),
        name: newExtraName,
        price: parseFloat(newExtraPrice),
        image: newExtraImage
      }]);
      setNewExtraName('');
      setNewExtraPrice('');
      setNewExtraImage(null);
      setShowAddExtra(false);
    } else if (!newExtraImage) {
      alert('נא להוסיף תמונה (חובה)');
    }
  };

  const handleRemoveExtra = (id: string) => {
    setExtras(extras.filter(e => e.id !== id));
  };

  const handleSendSupportMessage = () => {
    if (!newMessage.trim()) return;
    
    const userMsg: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'me',
      timestamp: new Date().toISOString()
    };
    
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setNewMessage('');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMessages));
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
    
    // Mock Client Reply
    setTimeout(() => {
        setClientMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            text: 'מעולה, תודה!',
            sender: 'client',
            timestamp: new Date().toISOString()
        }]);
    }, 2000);
  };

  const handleOpenCompletionModal = () => {
    setShowCompletionModal(true);
  };

  const handleCompletionPhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setCompletionPhotos(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveCompletionPhoto = (index: number) => {
    setCompletionPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirmCompletion = () => {
    setIsCompletingJob(true);
    setShowConfetti(true);
    
    setTimeout(() => {
      setStatus('completed');
      setTimeout(() => {
        setShowCompletionModal(false);
        setShowConfetti(false);
        setIsCompletingJob(false);
        onComplete();
      }, 2000);
    }, 500);
  };

  const handleCloseCompletionModal = () => {
    if (!isCompletingJob) {
      setShowCompletionModal(false);
      setCompletionNote('');
      setCompletionPhotos([]);
    }
  };

  const basePrice = job?.price || 350;
  const extrasTotal = extras.reduce((sum, item) => sum + item.price, 0);
  const totalPrice = basePrice + extrasTotal;

  const activeRoute = routeCoords.length > 0 
    ? [currentPos, ...routeCoords.slice(currentIndex + 1)] 
    : [];

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col font-sans overflow-hidden" dir="rtl">
      {/* Full Screen Map Background */}
      <div className="absolute inset-0 z-0">
        {status !== 'completed' && status !== 'summary' && (
             <Map 
                height={mapHeight}
                defaultCenter={[32.0853, 34.7818]} 
                center={status === 'traveling' ? currentPos : [32.0853, 34.7818]}
                zoom={zoom}
                onBoundsChanged={({ zoom }) => setZoom(zoom)}
                provider={mapProvider}
             >
                {status === 'traveling' && !isRouteLoading && (
                    <RouteLine 
                        coords={activeRoute} 
                        color="#2563EB" 
                        strokeWidth="6" 
                        opacity="0.8" 
                    />
                )}
                <Marker width={50} anchor={[32.0853, 34.7818]} color="#EF4444" />
                {status === 'traveling' && !isRouteLoading && (
                    <Overlay anchor={currentPos} offset={[0, 0]}>
                        <div 
                            className="relative z-[100] transition-transform duration-100 ease-linear will-change-transform"
                            style={{ transform: `translate(-50%, -50%) rotate(${rotation}deg)` }}
                        >
                          <div className="w-12 h-12 drop-shadow-2xl filter">
                              <Navigation2 className="w-full h-full text-blue-600 fill-blue-600 stroke-white stroke-2" />
                          </div>
                        </div>
                    </Overlay>
                )}
             </Map>
         )}
         {status === 'summary' && (
             <div className="absolute inset-0 bg-gray-900 z-0" />
         )}
      </div>

      {/* Top Bar Overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-md p-4 shadow-sm flex items-center justify-between border-b border-white/50">
         <div className="flex items-center gap-3">
             <div className="relative">
                 <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-gray-100 rounded-full transition-colors bg-white shadow-sm relative">
                     <MoreVertical className="w-5 h-5 text-gray-600" />
                 </button>
                 
                 {/* Quick Menu */}
                 {showMenu && (
                     <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 origin-top-right">
                         <button 
                            onClick={() => {
                                setShowMenu(false);
                                onBack(); // Just minimize/close view
                            }}
                            className="w-full text-right px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 font-medium flex items-center gap-3 transition-colors"
                         >
                             <AlertTriangle className="w-4 h-4" />
                             מזער מסך
                         </button>
                         <button 
                            onClick={() => {
                                setShowMenu(false);
                                setShowSupportChat(true);
                            }}
                            className="w-full text-right px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 font-medium flex items-center gap-3 transition-colors"
                         >
                             <Headphones className="w-4 h-4" />
                             צור קשר עם תמיכה
                         </button>
                         <div className="h-px bg-gray-100 my-1"></div>
                         <button 
                            onClick={() => {
                                setShowMenu(false);
                                if (onCancel) onCancel();
                            }}
                            className="w-full text-right px-4 py-3 hover:bg-red-50 text-sm text-red-600 font-bold flex items-center gap-3 transition-colors"
                         >
                             <Ban className="w-4 h-4" />
                             בטל משימה
                         </button>
                     </div>
                 )}
             </div>
             <div>
                 <h2 className="font-bold text-gray-900 leading-tight">משימה פעילה</h2>
                 <p className="text-xs text-gray-500">מספר הזמנה #48291</p>
             </div>
         </div>
         <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
             {status === 'traveling' && 'בדרך ליעד'}
             {status === 'arrived' && 'הגעתי ליעד'}
             {status === 'working' && 'בעבודה'}
             {status === 'summary' && 'סיכום וגבייה'}
         </div>
      </div>

      {/* Menu Backdrop */}
      {showMenu && (
          <div className="fixed inset-0 z-10 bg-transparent" onClick={() => setShowMenu(false)} />
      )}

      {/* Client Info Overlay - Hidden in Summary */}
      {status !== 'summary' && (
        <div className="absolute top-20 left-4 right-4 z-10">
           <div className="bg-white/95 backdrop-blur p-4 rounded-2xl shadow-lg border border-white/50 animate-in slide-in-from-top-4 fade-in duration-500">
               <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow">
                       <ImageWithFallback src={job?.clientImage || "https://i.pravatar.cc/150?img=68"} className="w-full h-full object-cover" alt="Client" />
                   </div>
                   <div className="flex-1">
                       <h3 className="font-bold text-gray-900">{job?.clientName || job?.client || 'דני כהן'}</h3>
                       <p className="text-sm text-gray-500 flex items-center gap-1">
                           <MapPin className="w-3 h-3" />
                           {job?.address || 'רחוב הירקון 12, תל אביב'}
                       </p>
                   </div>
                   <div className="flex gap-2">
                       <button 
                           onClick={() => window.location.href = 'tel:0501234567'}
                           className="p-2.5 bg-green-500 text-white rounded-full shadow-lg shadow-green-200 hover:bg-green-600 transition-colors"
                       >
                           <Phone className="w-4 h-4" />
                       </button>
                       <button 
                           onClick={() => setShowClientChat(true)}
                           className="p-2.5 bg-blue-500 text-white rounded-full shadow-lg shadow-blue-200 hover:bg-blue-600 transition-colors"
                       >
                           <MessageSquare className="w-4 h-4" />
                       </button>
                   </div>
               </div>
           </div>
        </div>
      )}

      {/* Bottom Action Panel Overlay */}
      <div className={`absolute bottom-0 left-0 right-0 z-20 bg-white rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-all duration-500 ${status === 'summary' ? 'top-24 h-auto rounded-t-[2rem]' : 'p-6'}`}>
          
          {status === 'traveling' && (
              <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2 px-2">
                      <div>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">זמן משוער</p>
                          <p className="text-2xl font-bold text-gray-900">{liveEta} דק'</p>
                      </div>
                      <div className="text-left">
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">מרחק</p>
                          <p className="text-2xl font-bold text-gray-900">4.2 ק"מ</p>
                      </div>
                  </div>
                  
                  <button 
                      onClick={() => window.open(`https://waze.com/ul?ll=${job?.clientLat || 32.0853},${job?.clientLng || 34.7818}&navigate=yes`, '_blank')}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                      <Navigation className="w-5 h-5" />
                      נווט עם Waze
                  </button>
                  <button 
                    onClick={() => handleStatusChange('arrived')}
                    className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-lg shadow-lg transition-all active:scale-[0.98]"
                  >
                      הגעתי ליעד
                  </button>

                  <button 
                    onClick={() => setShowSupportChat(true)}
                    className="w-full py-2 text-gray-400 font-medium text-sm flex items-center justify-center gap-1.5 hover:text-red-500 transition-colors mt-2"
                  >
                      <Headphones className="w-4 h-4" />
                      נתקלת בבעיה? צור קשר עם התמיכה
                  </button>
              </div>
          )}

          {status === 'arrived' && (
              <div className="space-y-4 animate-in slide-in-from-bottom-10 fade-in">
                  <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <div>
                          <h4 className="font-bold text-green-800">הגעת ליעד!</h4>
                          <p className="text-sm text-green-600">הלקוח קיבל עדכון שאתה כאן. נא לאמת את פרטי העבודה מול הלקוח לפני התחלה.</p>
                      </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center border-t border-b border-gray-100 py-4 my-4">
                      <div>
                          <p className="text-xs text-gray-400">שירות</p>
                          <p className="font-bold">{job?.service || 'תיקון נזילה'}</p>
                      </div>
                      <div>
                          <p className="text-xs text-gray-400">מחיר משוער</p>
                          <p className="font-bold">₪{job?.price || 350}</p>
                      </div>
                  </div>

                  <button 
                    onClick={() => handleStatusChange('working')}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
                  >
                      התחל עבודה (Start Timer)
                  </button>

                  <button 
                    onClick={() => setShowSupportChat(true)}
                    className="w-full py-2 text-gray-400 font-medium text-sm flex items-center justify-center gap-1.5 hover:text-blue-600 transition-colors"
                  >
                      <MessageSquare className="w-4 h-4" />
                      צ'אט עם נציג תמיכה
                  </button>
              </div>
          )}

          {status === 'working' && (
              <div className="space-y-6 animate-in slide-in-from-bottom-10 fade-in relative">
                  {showAddExtra && (
                      <div className="absolute bottom-0 left-0 right-0 bg-white p-6 rounded-t-[2rem] shadow-[0_-20px_60px_rgba(0,0,0,0.2)] z-30 animate-in slide-in-from-bottom-full">
                          <div className="flex justify-between items-center mb-4">
                              <h3 className="font-bold text-gray-900">הוסף פריט/חלק</h3>
                              <button onClick={() => setShowAddExtra(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                  <X className="w-5 h-5" />
                              </button>
                          </div>
                          
                          <div className="space-y-4 mb-6">
                              <div>
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">שם הפריט</label>
                                  <input 
                                    type="text" 
                                    value={newExtraName}
                                    onChange={(e) => setNewExtraName(e.target.value)}
                                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-right"
                                    placeholder="לדוגמה: צינור גומי"
                                  />
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">מחיר (₪)</label>
                                  <input 
                                    type="number" 
                                    value={newExtraPrice}
                                    onChange={(e) => setNewExtraPrice(e.target.value)}
                                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-right"
                                    placeholder="0.00"
                                  />
                              </div>
                              
                              {/* Image Upload */}
                              <div>
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">תיעוד (חובה)</label>
                                  <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    accept="image/*,video/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                  />
                                  
                                  {newExtraImage ? (
                                      <div className="relative h-32 rounded-xl overflow-hidden border border-gray-200">
                                          <img src={newExtraImage} alt={newExtraImage} className="w-full h-full object-cover" />
                                          <button 
                                            onClick={() => setNewExtraImage(null)}
                                            className="absolute top-2 left-2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors"
                                          >
                                              <X className="w-4 h-4" />
                                          </button>
                                      </div>
                                  ) : (
                                      <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full h-20 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-1 text-gray-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
                                      >
                                          <div className="relative">
                                            <Camera className="w-5 h-5" />
                                            <span className="absolute -top-1 -right-2 text-red-500 font-bold text-xs">*</span>
                                          </div>
                                          <span className="text-xs font-medium">צלם או העלה תמונה/וידאו (חובה)</span>
                                      </button>
                                  )}
                              </div>
                          </div>
                          
                          <button 
                            onClick={handleAddExtra}
                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200"
                          >
                              הוסף לחשבון
                          </button>
                      </div>
                  )}

                  <div className="text-center">
                      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                          <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-pulse"></div>
                          <Clock className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-3xl font-mono font-bold text-gray-900">
                          {Math.floor(elapsedTime / 60).toString().padStart(2, '0')}:{elapsedTime % 60 < 10 ? '0' : ''}{elapsedTime % 60}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">זמן עבודה</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 min-h-[120px]">
                       <div className="flex justify-between items-center mb-3">
                           <span className="text-sm font-bold text-gray-600">תוספות (חלקים/חומרים)</span>
                           <button 
                                onClick={() => setShowAddExtra(true)}
                                className="text-xs text-blue-600 font-bold bg-blue-100 px-2 py-1 rounded-md hover:bg-blue-200 transition-colors"
                           >
                               + הוסף
                           </button>
                       </div>
                       
                       {extras.length === 0 ? (
                           <p className="text-xs text-gray-400 italic text-center py-2">לא נוספו פריטים</p>
                       ) : (
                           <div className="space-y-2 max-h-32 overflow-y-auto">
                               {extras.map(item => (
                                   <div key={item.id} className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                                       <div className="flex items-center gap-3">
                                           {item.image && (
                                               <div className="w-8 h-8 bg-gray-100 rounded-md overflow-hidden">
                                                   <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                               </div>
                                           )}
                                           <span className="text-xs font-medium">{item.name}</span>
                                       </div>
                                       <div className="flex items-center gap-3">
                                           <span className="text-xs font-bold">₪{item.price}</span>
                                           <button onClick={() => handleRemoveExtra(item.id)} className="text-red-400 hover:text-red-600">
                                               <Trash2 className="w-3 h-3" />
                                           </button>
                                       </div>
                                   </div>
                               ))}
                           </div>
                       )}
                  </div>

                  <button 
                    onClick={() => handleStatusChange('summary')}
                    className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-lg shadow-lg transition-all active:scale-[0.98]"
                  >
                      סיום עבודה וגבייה
                  </button>
              </div>
          )}

          {status === 'summary' && (
              <div className="p-6 animate-in slide-in-from-bottom-10 fade-in h-full flex flex-col">
                  <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">סיכום הזמנה</h2>
                      <p className="text-gray-500 text-sm">נא אמת את הפרטים מול הלקוח</p>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 space-y-3 mb-6 flex-1">
                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <span className="text-gray-600">עבודה ({elapsedTime} דק')</span>
                          <span className="font-bold">₪{basePrice}</span>
                      </div>
                      {extras.map(item => (
                          <div key={item.id} className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                  {item.image && <Camera className="w-3 h-3 text-gray-400" />}
                                  <span className="text-gray-500">{item.name}</span>
                              </div>
                              <span className="font-medium">₪{item.price}</span>
                          </div>
                      ))}
                      <div className="flex justify-between items-center pt-3 border-t-2 border-gray-200 text-lg">
                          <span className="font-bold text-gray-900">סה"כ לתשלום</span>
                          <span className="font-black text-blue-600 text-xl">₪{totalPrice}</span>
                      </div>
                  </div>

                  <button 
                    onClick={handleOpenCompletionModal}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
                  >
                      שלח דרישת תשלום
                  </button>
              </div>
          )}
      </div>

      {/* MISSION COMPLETION MODAL */}
      <Dialog open={showCompletionModal} onOpenChange={handleCloseCompletionModal}>
        <DialogContent className="max-w-md mx-auto bg-white rounded-3xl p-0 overflow-hidden max-h-[90vh] border-none shadow-2xl" dir="rtl">
          {/* Confetti Animation Overlay */}
          {showConfetti && (
            <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-10%`,
                    animationDelay: `${Math.random() * 0.5}s`,
                    animationDuration: `${1 + Math.random() * 2}s`,
                  }}
                >
                  <Sparkles
                    className="w-4 h-4"
                    style={{
                      color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DFE6E9'][Math.floor(Math.random() * 7)],
                      transform: `rotate(${Math.random() * 360}deg) scale(${0.5 + Math.random()})`,
                    }}
                  />
                </div>
              ))}
              <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/20 via-transparent to-transparent animate-pulse" />
            </div>
          )}

          {/* Success Animation for Completion */}
          {isCompletingJob && (
            <div className="absolute inset-0 z-40 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-500">
              <div className="relative">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping opacity-75" />
              </div>
              <h3 className="text-2xl font-bold text-green-700 mt-6 animate-in slide-in-from-bottom-4 duration-700">עבודה הושלמה בהצלחה!</h3>
              <p className="text-gray-500 mt-2 animate-in slide-in-from-bottom-4 duration-700 delay-200">מעביר לסיכום...</p>
            </div>
          )}

          <div className="overflow-y-auto max-h-[85vh]">
            {/* Header */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-full opacity-20">
                <div className="absolute -top-4 -left-4 w-20 h-20 bg-white rounded-full" />
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white rounded-full" />
                <div className="absolute top-1/2 right-1/4 w-8 h-8 bg-white rounded-full" />
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">עבודה הושלמה!</h2>
                <p className="text-green-100 text-sm mt-1">אנא אשר את פרטי הסיכום</p>
              </div>
            </div>

            {/* Job Summary Card */}
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <h3 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  פרטי העבודה
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">סוג שירות</span>
                    <span className="font-bold text-gray-900">{job?.service || 'תיקון נזילה'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">שם לקוח</span>
                    <span className="font-bold text-gray-900">{job?.clientName || job?.client || 'דני כהן'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">זמן עבודה</span>
                    <span className="font-bold text-gray-900">{elapsedTime} דקות</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">מחיר בסיסי</span>
                    <span className="font-bold text-gray-900">₪{basePrice}</span>
                  </div>
                  
                  {extras.length > 0 && (
                    <div className="py-2 border-b border-gray-100">
                      <span className="text-gray-600 text-sm">תוספות:</span>
                      <div className="mt-2 space-y-1">
                        {extras.map(item => (
                          <div key={item.id} className="flex justify-between items-center text-sm bg-white rounded-lg p-2 border border-gray-50">
                            <div className="flex items-center gap-2">
                              {item.image && (
                                <div className="w-6 h-6 rounded overflow-hidden">
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <span className="text-gray-700">{item.name}</span>
                            </div>
                            <span className="font-medium text-gray-900">₪{item.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-3 border-t-2 border-green-200">
                    <span className="font-bold text-lg text-gray-900">סה"כ לתשלום</span>
                    <span className="font-black text-2xl text-green-600">₪{totalPrice}</span>
                  </div>
                </div>
              </div>

              {/* Add Note */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <label className="text-sm font-bold text-gray-500 mb-2 block flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  הוסף הערה (אופציונלי)
                </label>
                <textarea
                  value={completionNote}
                  onChange={(e) => setCompletionNote(e.target.value)}
                  placeholder="הוסף הערות על העבודה, המלצות ללקוח, וכו'..."
                  className="w-full p-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent text-right text-sm resize-none"
                  rows={3}
                />
              </div>

              {/* Photo Upload */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <label className="text-sm font-bold text-gray-500 mb-2 block flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  תיעוד לפני/אחרי (אופציונלי)
                </label>
                
                <input
                  type="file"
                  ref={completionPhotoInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleCompletionPhotoChange}
                  className="hidden"
                />
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {completionPhotos.map((photo, index) => (
                    <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-white shadow-md">
                      <img src={photo} alt={`תיעוד ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleRemoveCompletionPhoto(index)}
                        className="absolute top-1 left-1 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={() => completionPhotoInputRef.current?.click()}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-500 hover:border-green-400 hover:text-green-600 hover:bg-green-50 transition-all"
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-sm font-medium">העלה תמונות</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 pt-0 space-y-3">
              <button
                onClick={handleConfirmCompletion}
                disabled={isCompletingJob}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCompletingJob ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    מסיים...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    אשר וסיים
                  </>
                )}
              </button>
              
              <button
                onClick={handleCloseCompletionModal}
                disabled={isCompletingJob}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                סגור
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* SUPPORT CHAT OVERLAY */}
      {showSupportChat && (
          <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in slide-in-from-bottom-full duration-300">
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white shadow-sm z-10">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Headphones className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                          <h3 className="font-bold text-gray-900">תמיכה טכנית</h3>
                          <p className="text-xs text-green-600 flex items-center gap-1">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              זמין כעת
                          </p>
                      </div>
                  </div>
                  <button onClick={() => setShowSupportChat(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <X className="w-6 h-6 text-gray-500" />
                  </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                  {chatMessages.map((msg) => (
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
                  <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-gray-100">
                  <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-full border border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                      <input 
                          type="text" 
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendSupportMessage()}
                          placeholder="כתוב הודעה לנציג..."
                          className="flex-1 bg-transparent border-none focus:ring-0 px-3 text-right text-sm"
                      />
                      <button 
                          onClick={handleSendSupportMessage}
                          disabled={!newMessage.trim()}
                          className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md disabled:opacity-50 disabled:shadow-none transition-all transform active:scale-95 hover:bg-blue-700"
                      >
                          <Send className="w-4 h-4 ml-0.5" />
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* CLIENT CHAT OVERLAY */}
      {showClientChat && (
          <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in slide-in-from-bottom-full duration-300">
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white shadow-sm z-10">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                           <ImageWithFallback src={job?.clientImage || "https://i.pravatar.cc/150?img=68"} className="w-full h-full object-cover" alt="Client" />
                      </div>
                      <div>
                          <h3 className="font-bold text-gray-900">{job?.clientName || job?.client || 'לקוח'}</h3>
                          <p className="text-xs text-gray-500">
                             {job?.address}
                          </p>
                      </div>
                  </div>
                  <button onClick={() => setShowClientChat(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
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
      )}
    </div>
  );
}