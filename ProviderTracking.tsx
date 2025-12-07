import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Map, Overlay } from 'pigeon-maps';
import { Phone, MessageSquare, Shield, Star, Navigation2, AlertTriangle, X, Home } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Booking } from '../App';
import { ActiveJob } from './ActiveJob';
import { useUserLocation } from '../context/LocationProvider';
import { ChatScreen, Provider } from './ChatScreen';
import { CallConfirmModal } from './CallConfirmModal';

// --- Use VITE_MAPBOX_ACCESS_TOKEN env variable ---
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';

const mapboxProvider = (x: number, y: number, z: number, dpr?: number) => {
  const retina = dpr && dpr >= 2 ? '@2x' : '';
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/256/${z}/${x}/${y}${retina}?access_token=${MAPBOX_TOKEN}`;
};

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

type ProviderTrackingProps = {
  booking: Booking | null;
  onBack: () => void;
};

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
    <svg 
      className="absolute inset-0 w-full h-full pointer-events-none" 
      style={{ zIndex: 0 }}
      aria-hidden="true"
      role="presentation"
    >
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

export function ProviderTracking({ booking, onBack }: ProviderTrackingProps) {
  const [eta, setEta] = useState(5);
  const [isArrived, setIsArrived] = useState(false);
  const [jobMode, setJobMode] = useState<'tracking' | 'active_job'>('tracking');
  const [isExpanded, setIsExpanded] = useState(false);
  const [zoom, setZoom] = useState(16);
  
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [isRouteLoading, setIsRouteLoading] = useState(true);

  const [currentPos, setCurrentPos] = useState<[number, number]>([32.07650, 34.78128]);
  const [rotation, setRotation] = useState(180);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const cancelModalRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  const { userLocation, isLocationSet } = useUserLocation();
  
  const destLat = isLocationSet && userLocation?.coords 
    ? userLocation.coords.lat 
    : 32.07050;
  const destLng = isLocationSet && userLocation?.coords 
    ? userLocation.coords.lng 
    : 34.77808;

  const providerName = booking?.providerName || 'יוסי כהן';
  
  // Provider object for ChatScreen and CallConfirmModal
  // Uses booking data when available, with fallbacks for demo/testing
  const providerData: Provider = {
    id: booking?.providerId || 'pro-1',
    name: providerName,
    role: 'אינסטלטור מוסמך',
    phone: booking?.providerPhone || '+972-54-555-1234',
    image: booking?.providerImage 
      || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    rating: 4.9,
    carInfo: 'יונדאי איוניק 5',
    licensePlate: '64-322-12'
  };

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const proStart = { lat: 32.07650, lng: 34.78128 };
        
        const waypoints = [
            `${proStart.lng},${proStart.lat}`,
            `${destLng},${destLat}`
        ].join(';');

        const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson`);
        const data = await response.json();

        if (data.routes && data.routes[0]) {
          const coords = data.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);
          setRouteCoords(coords);
          if (coords.length > 0) setCurrentPos(coords[0]);
        }
      } catch (error) {
        setRouteCoords([[32.07650, 34.78128], [destLat, destLng]]);
      } finally {
        setIsRouteLoading(false);
      }
    };

    fetchRoute();
  }, [destLat, destLng]);

  useEffect(() => {
    console.log("Current Job Mode:", jobMode);
    if (routeCoords.length < 2) return;

    let startTime: number;
    const totalDuration = 45000;

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

        const remaining = Math.ceil(5 * (1 - progress));
        setEta(remaining);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsArrived(true);
          setEta(0);
        }
      }
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [routeCoords]);

  useEffect(() => {
    if (showCancelModal && cancelModalRef.current) {
      cancelModalRef.current.focus();
    }
  }, [showCancelModal]);

  useEffect(() => {
    if (!showCancelModal && cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }
  }, [showCancelModal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showCancelModal) {
        setShowCancelModal(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showCancelModal]);

  const activeRoute = routeCoords.length > 0 
    ? [currentPos, ...routeCoords.slice(currentIndex + 1)] 
    : [];

  if (jobMode === 'active_job') {
    return <ActiveJob booking={booking} onSupportClick={() => console.log("Support Clicked")} onComplete={onBack} />;
  }

  const statusText = isArrived ? 'המקצוען הגיע' : 'בדרך אליך';
  const etaText = isArrived ? 'הגיע' : `${eta} דקות`;
  const screenReaderAnnouncement = isArrived 
    ? `${providerName} הגיע ליעד שלך`
    : `${providerName} בדרך אליך, עוד ${eta} דקות`;

  return (
    <div 
      className="fixed inset-0 bg-gray-50 z-50 flex flex-col overflow-hidden font-sans"
      dir="rtl"
      lang="he"
    >
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 focus:z-[200] focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold"
      >
        דלג לתוכן הראשי
      </a>

      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {screenReaderAnnouncement}
      </span>

      <button 
        onClick={() => setJobMode('active_job')} 
        className="absolute top-20 left-4 z-[100] bg-red-500 text-white text-xs p-2 rounded shadow-xl min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
        aria-label="מעבר למצב עבודה פעילה (לבדיקה בלבד)"
      >
        FORCE ACTIVE JOB
      </button>

      <div 
        className="absolute inset-0 z-0"
        aria-hidden="true"
        role="presentation"
      >
        <Map 
          height={window.innerHeight} 
          defaultCenter={[32.07650, 34.78128]}
          center={currentPos} 
          zoom={zoom}
          provider={mapboxProvider}
          onBoundsChanged={({ zoom }) => setZoom(zoom)}
        >
            {!isRouteLoading && (
                <RouteLine 
                    coords={routeCoords} 
                    color="#94A3B8" 
                    strokeWidth="5" 
                    opacity="0.4" 
                />
            )}

            {!isRouteLoading && (
                <RouteLine 
                    coords={activeRoute} 
                    color="#2563EB" 
                    strokeWidth="5" 
                    opacity="1" 
                />
            )}

            {!isRouteLoading && routeCoords.length > 0 && (
                <Overlay anchor={routeCoords[routeCoords.length - 1]} offset={[20, 20]}>
                    <div className="relative">
                      <div className="w-10 h-10 bg-green-500/30 rounded-full animate-ping absolute inset-0" />
                      <div className="w-10 h-10 bg-white rounded-full shadow-lg border-[3px] border-green-600 flex items-center justify-center relative z-10">
                          <Home className="w-5 h-5 text-green-600" aria-hidden="true" />
                      </div>
                    </div>
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 flex flex-col items-center z-[100] pointer-events-none">
                      <div className="bg-green-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap">
                          {userLocation?.address ? 'הבית שלך' : 'יעד'}
                      </div>
                    </div>
                </Overlay>
            )}
            
            {!isRouteLoading && (
                <Overlay anchor={currentPos} offset={[0, 0]}>
                    <div 
                        className="relative z-[100] transition-transform duration-100 ease-linear will-change-transform"
                        style={{ transform: `translate(-50%, -50%) rotate(${rotation}deg)` }}
                    >
                      <div className="w-10 h-10 drop-shadow-xl">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-blue-600 stroke-white stroke-[2.5]" aria-hidden="true">
                              <path d="M12 2L2 22L12 18L22 22L12 2Z" strokeLinejoin="round" />
                          </svg>
                      </div>
                    </div>
                    
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-[100] pointer-events-none">
                      <div className="bg-white/95 backdrop-blur text-gray-800 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-md border border-gray-100 whitespace-nowrap">
                          יוסי מתקרב
                      </div>
                    </div>
                </Overlay>
            )}
        </Map>
        
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/80 to-transparent pointer-events-none" />
      </div>

      <header 
        className="absolute top-14 left-4 right-4 pointer-events-auto z-10"
        role="banner"
      >
          <div 
            className="bg-white/90 backdrop-blur-xl border border-white/40 text-gray-900 p-4 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex items-center justify-between"
            aria-live="polite"
            aria-atomic="true"
          >
             <div>
                <span className="text-xs uppercase tracking-wider text-gray-600 font-bold mb-1 block">זמן הגעה</span>
                <div className="text-3xl font-bold flex items-end gap-1.5 font-mono tracking-tight text-blue-600" aria-label={`זמן הגעה: ${etaText}`}>
                   {isArrived ? <span className="text-green-600">הגיע</span> : <>{eta}<span className="text-sm font-sans font-bold text-gray-600 mb-1.5">דקות</span></>}
                </div>
             </div>
             <div className="h-10 w-px bg-gray-200 mx-2" role="separator" aria-hidden="true"></div>
             <div className="flex-1 min-w-0">
                <span className="text-xs uppercase tracking-wider text-gray-600 font-bold mb-1 block">יעד</span>
                <div className="font-bold truncate text-sm text-gray-800">
                  {userLocation?.address || 'רחוב הירקון 12, תל אביב'}
                </div>
             </div>
             <div className="bg-blue-50 p-2.5 rounded-full ml-2" aria-hidden="true">
                <Navigation2 className="w-5 h-5 text-blue-600" />
             </div>
          </div>
      </header>

      <motion.section 
        id="main-content"
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2rem] shadow-[0_-10px_60px_-15px_rgba(0,0,0,0.1)] pointer-events-auto z-20"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        aria-label="פרטי המקצוען"
        role="region"
      >
        <button 
          className="w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-t-[2rem]"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-controls="provider-details"
          aria-label={isExpanded ? 'כווץ את פרטי המקצוען' : 'הרחב את פרטי המקצוען'}
        >
           <div className="w-10 h-1 bg-gray-300 rounded-full" aria-hidden="true" />
        </button>

        <div id="provider-details" className="px-6 pb-8 pt-2">
           <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2.5">
                 <div className="relative flex h-3 w-3" aria-hidden="true">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                 </div>
                 <h1 className="font-bold text-gray-900 text-lg tracking-tight">
                    {statusText}
                 </h1>
              </div>
              <div className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                 <Shield className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
                 <span className="text-xs font-bold text-blue-700">קוד אבטחה: 4821</span>
              </div>
           </div>

           <article className="flex items-center gap-5 mb-8" aria-label={`פרטי המקצוען ${providerName}`}>
              <div className="relative">
                 <ImageWithFallback 
                    src={booking?.providerId ? `https://images.unsplash.com/photo-1581578017093-cd30fba4e9d5?w=150&h=150&fit=crop` : "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop"}
                    className="w-16 h-16 rounded-full object-cover border-[3px] border-white relative shadow-lg"
                    alt={`תמונה של ${providerName}`}
                 />
                 <div className="absolute -bottom-1 -right-1 bg-white text-gray-900 text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-md border border-gray-100 flex items-center gap-0.5" aria-label="דירוג 4.9 מתוך 5 כוכבים">
                    <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                    <span>4.9</span>
                 </div>
              </div>
              
              <div className="flex-1">
                 <h2 className="font-bold text-xl text-gray-900 leading-tight">{providerName}</h2>
                 <p className="text-gray-600 text-sm mt-1 font-medium">אינסטלטור מוסמך</p>
                 
                 <div className="flex items-center gap-2 mt-2">
                    <span className="bg-gray-100 px-2 py-1 rounded-lg text-xs font-bold text-gray-700 border border-gray-200">
                        יונדאי איוניק 5
                    </span>
                    <span className="bg-gray-900 px-2 py-1 rounded-lg text-xs font-mono font-bold text-white tracking-wide" aria-label="מספר רכב 64-322-12">
                        64-322-12
                    </span>
                 </div>
              </div>
           </article>

           <div className="grid grid-cols-4 gap-3" role="group" aria-label="פעולות">
              {isArrived ? (
                 <button 
                    onClick={() => setJobMode('active_job')}
                    className="col-span-4 bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-green-200 animate-pulse min-h-[56px] focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2"
                    aria-label="המקצוען הגיע - לחץ למעבר למצב עבודה פעילה"
                 >
                    <span>מעבר למצב עבודה</span>
                    <Navigation2 className="w-5 h-5" aria-hidden="true" />
                 </button>
              ) : (
                  <>
                    <button 
                      onClick={() => setShowCallModal(true)}
                      className="col-span-3 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-blue-200 min-h-[56px] focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
                      aria-label={`התקשר ל${providerName}`}
                    >
                        <span className="bg-white/20 p-1.5 rounded-full" aria-hidden="true">
                            <Phone className="w-4 h-4" />
                        </span>
                        <span>התקשר ל{providerName}</span>
                    </button>
                    <button 
                      onClick={() => setShowChat(true)}
                      className="bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-2xl flex items-center justify-center transition-colors border border-gray-200 min-h-[56px] min-w-[56px] focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                      aria-label={`פתח צ'אט עם ${providerName}`}
                    >
                        <MessageSquare className="w-6 h-6" aria-hidden="true" />
                    </button>
                  </>
              )}
           </div>
           
           {!isArrived && (
               <div className="mt-6 flex justify-center">
                    <button 
                        ref={cancelButtonRef}
                        onClick={() => setShowCancelModal(true)} 
                        className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors py-3 px-6 min-h-[44px] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:ring-offset-2 hover:bg-red-50"
                        aria-haspopup="dialog"
                    >
                        ביטול נסיעה
                    </button>
               </div>
           )}
        </div>
      </motion.section>

      <AnimatePresence>
        {showCancelModal && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
                role="dialog"
                aria-modal="true"
                aria-labelledby="cancel-modal-title"
                aria-describedby="cancel-modal-description"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setShowCancelModal(false);
                }}
            >
                <motion.div 
                    ref={cancelModalRef}
                    tabIndex={-1}
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-6 text-center relative focus:outline-none"
                    dir="rtl"
                >
                     <button 
                        onClick={() => setShowCancelModal(false)}
                        className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300"
                        aria-label="סגור חלון"
                    >
                        <X className="w-5 h-5" aria-hidden="true" />
                    </button>

                    <div className="w-16 h-16 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-red-50/50" aria-hidden="true">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    
                    <h2 id="cancel-modal-title" className="text-xl font-bold text-gray-900 mb-2">ביטול נסיעה?</h2>
                    <p id="cancel-modal-description" className="text-gray-600 text-sm mb-6 leading-relaxed">
                        המקצוען כבר בדרך אליך. ביטול כעת יחייב אותך בדמי ביטול חלקיים.
                    </p>

                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6" aria-label="פירוט עלויות ביטול">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-gray-600 uppercase">דמי ביטול</span>
                            <span className="text-xs text-gray-600 line-through" aria-label="מחיר מקורי 150 שקלים">₪150</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-sm text-gray-700">סה"כ לתשלום</span>
                            <span className="text-2xl font-bold text-red-600" aria-label="50 שקלים">₪50</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button 
                            onClick={onBack}
                            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 min-h-[52px] focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
                        >
                            כן, בטל נסיעה וחייב אותי
                        </button>
                        <button 
                            onClick={() => setShowCancelModal(false)}
                            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors min-h-[52px] focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                        >
                            לא, השאר את ההזמנה
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* CHAT SCREEN (Provider) */}
      <AnimatePresence>
        {showChat && (
          <ChatScreen 
            provider={providerData} 
            onBack={() => setShowChat(false)}
            onCall={() => setShowCallModal(true)}
          />
        )}
      </AnimatePresence>

      {/* CALL CONFIRM MODAL */}
      <CallConfirmModal
        isOpen={showCallModal}
        onClose={() => setShowCallModal(false)}
        provider={providerData}
      />
    </div>
  );
}
