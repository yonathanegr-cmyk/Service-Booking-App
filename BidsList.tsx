import { 
  ArrowLeft, Star, MapPin, Clock, Zap, TrendingDown, Shield, Brain, 
  CheckCircle, AlertTriangle, Package, Lightbulb, ChevronDown, ChevronUp, 
  Table, LayoutList, Loader2, Radio, Handshake, Gavel, Search, CheckCheck,
  Bike, Car, Truck, BadgeCheck, Info
} from 'lucide-react';
import { ServiceRequest, Bid } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ResultsMap } from './ResultsMap';

type BidsListProps = {
  serviceRequest: ServiceRequest;
  bids: Bid[];
  onBidSelect: (bid: Bid) => void;
  onBack: () => void;
  initialAnimationComplete?: boolean;
  onAnimationComplete?: () => void;
};

const BIDDING_STEPS = [
  {
    id: 'analyzing',
    title: 'מנתח את הבקשה...',
    subtitle: 'ה-AI מעבד את הפרטים שלך',
    icon: Brain,
    color: 'text-purple-600',
    bg: 'bg-purple-100'
  },
  {
    id: 'scanning',
    title: 'סורק אזור שירות...',
    subtitle: 'מאתר מקצוענים זמינים בקרבת מקום',
    icon: Search,
    color: 'text-blue-600',
    bg: 'bg-blue-100'
  },
  {
    id: 'negotiating',
    title: 'מנהל מו"מ בזמן אמת...',
    subtitle: 'מתמקח בשמך לקבלת המחיר הטוב ביותר',
    icon: Handshake,
    color: 'text-green-600',
    bg: 'bg-green-100'
  },
  {
    id: 'finalizing',
    title: 'ההצעות מוכנות!',
    subtitle: 'נמצאו התאמות מושלמות עבורך',
    icon: CheckCheck,
    color: 'text-teal-600',
    bg: 'bg-teal-100'
  }
];

export function BidsList({ serviceRequest, bids, onBidSelect, onBack, initialAnimationComplete, onAnimationComplete }: BidsListProps) {
  // Bidding Process State
  const [processStep, setProcessStep] = useState(0);
  const [isProcessComplete, setIsProcessComplete] = useState(initialAnimationComplete || false);

  // Existing State
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [activeBidId, setActiveBidId] = useState<string | null>(null);
  const [simulatedBidUpdates, setSimulatedBidUpdates] = useState<{ [key: string]: string }>({});
  const [hoveredProfessionalId, setHoveredProfessionalId] = useState<string | null>(null);

  // Find best price for calculations
  const bestPrice = bids.length > 0 ? Math.min(...bids.map(b => b.totalPriceGuaranteed)) : 0;
  const avgPrice = bids.length > 0 ? bids.reduce((acc, b) => acc + b.totalPriceGuaranteed, 0) / bids.length : 0;

  // Handle Bidding Animation Sequence
  useEffect(() => {
    if (isProcessComplete) return;

    const stepDuration = 1800; // ms per step
    const totalSteps = BIDDING_STEPS.length;

    const timer = setInterval(() => {
      setProcessStep(prev => {
        if (prev >= totalSteps - 1) {
          clearInterval(timer);
          setTimeout(() => {
            setIsProcessComplete(true);
            onAnimationComplete?.();
          }, 800); // Small delay before showing results
          return prev;
        }
        return prev + 1;
      });
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isProcessComplete]);

  // Simulate real-time bidding updates (only active after process is complete)
  useEffect(() => {
    if (!isProcessComplete) return;

    const interval = setInterval(() => {
      const randomBid = bids[Math.floor(Math.random() * bids.length)];
      if (randomBid) {
        setActiveBidId(randomBid.id);
        const actions = ['מעדכן מחיר...', 'בודק זמינות...', 'מחשב מסלול...'];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        
        setSimulatedBidUpdates(prev => ({
          ...prev,
          [randomBid.id]: randomAction
        }));

        setTimeout(() => {
          setActiveBidId(null);
          setSimulatedBidUpdates(prev => {
            const newUpdates = { ...prev };
            delete newUpdates[randomBid.id];
            return newUpdates;
          });
        }, 2000);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [bids, isProcessComplete]);

  // --- Helpers for Wolt-like UI ---
  const getVehicleInfo = (index: number) => {
    const vehicles = [
      { icon: Bike, label: 'קטנוע', type: 'scooter' },
      { icon: Car, label: 'רכב פרטי', type: 'car' },
      { icon: Truck, label: 'מסחרית', type: 'van' }
    ];
    return vehicles[index % vehicles.length];
  };

  const getPriceLevel = (price: number) => {
    if (price <= 100) return '₪';
    if (price <= 200) return '₪₪';
    return '₪₪₪';
  };

  // --- RENDER LOADING / BIDDING PROCESS ---
  if (!isProcessComplete) {
    const currentStepData = BIDDING_STEPS[processStep];
    
    return (
      <div className="flex flex-col h-screen bg-white items-center justify-center p-6 relative overflow-hidden" dir="rtl">
        {/* Background animated rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
           <div className="absolute w-[400px] h-[400px] border border-blue-100 rounded-full animate-ping [animation-duration:3s]"></div>
           <div className="absolute w-[300px] h-[300px] border border-blue-200 rounded-full animate-pulse"></div>
           <div className="absolute w-[600px] h-[600px] border border-gray-50 rounded-full"></div>
        </div>

        <div className="z-10 w-full max-w-md space-y-8 text-center">
          
          {/* Animated Icon Container */}
          <div className="relative h-32 w-32 mx-auto flex items-center justify-center">
             <AnimatePresence mode="wait">
                <motion.div
                  key={processStep}
                  initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.8, opacity: 0, rotate: 20 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className={`w-24 h-24 rounded-3xl ${currentStepData.bg} flex items-center justify-center shadow-xl shadow-gray-100`}
                >
                  <currentStepData.icon className={`w-12 h-12 ${currentStepData.color}`} />
                </motion.div>
             </AnimatePresence>
             
             {/* Pulsing indicators around */}
             <div className="absolute inset-0 animate-spin [animation-duration:4s]">
                <div className="absolute top-0 left-1/2 w-2 h-2 bg-blue-500 rounded-full -translate-x-1/2"></div>
                <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-purple-500 rounded-full -translate-x-1/2"></div>
             </div>
          </div>

          {/* Text Content */}
          <div className="space-y-2 h-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={processStep}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-gray-900">{currentStepData.title}</h2>
                <p className="text-gray-500 mt-2 text-lg">{currentStepData.subtitle}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center justify-center gap-2 pt-8">
            {BIDDING_STEPS.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  idx <= processStep ? 'w-8 bg-blue-600' : 'w-2 bg-gray-200'
                }`}
              />
            ))}
          </div>

        </div>
      </div>
    );
  }

  // --- RENDER RESULTS (Wolt-Like UI) ---
  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 z-20 shadow-sm">
        <div className="px-6 py-3">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 text-right" dir="rtl">
              <h2 className="text-lg font-bold">הצעות בקרבת מקום</h2>
              <div className="text-sm text-gray-500 flex items-center gap-1 justify-end">
                 <span>{bids.length} אנשי מקצוע זמינים כעת</span>
                 <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Split View Container */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Map Section (Top/Left) - Real Mapbox Map */}
        <div className="h-[35vh] md:h-full md:w-1/2 relative overflow-hidden border-b md:border-b-0 md:border-r border-gray-200">
          <ResultsMap
            userLocation={{
              lat: serviceRequest.location?.lat || 32.0853,
              lng: serviceRequest.location?.lng || 34.7818
            }}
            professionals={(() => {
              const userLat = serviceRequest.location?.lat || 32.0853;
              const userLng = serviceRequest.location?.lng || 34.7818;
              
              if (bids.length > 0) {
                return bids.map(bid => ({
                  id: bid.id,
                  lat: bid.lat,
                  lng: bid.lng,
                  price: bid.totalPriceGuaranteed,
                  name: bid.providerName,
                  image: bid.providerImage
                }));
              }
              
              return [
                { id: 'mock1', name: 'יוסי כהן', image: 'https://images.unsplash.com/photo-1581578017093-cd30fba4e9d5?w=100', price: 350, lat: userLat + 0.01, lng: userLng + 0.008 },
                { id: 'mock2', name: 'דניאל לוי', image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100', price: 280, lat: userLat - 0.008, lng: userLng + 0.012 },
                { id: 'mock3', name: 'שרה מזרחי', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100', price: 420, lat: userLat + 0.005, lng: userLng - 0.015 },
              ];
            })()}
            onProfessionalHover={setHoveredProfessionalId}
            onProfessionalClick={(id) => {
              const bid = bids.find(b => b.id === id);
              if (bid) onBidSelect(bid);
            }}
            highlightedProfessionalId={hoveredProfessionalId}
          />
        </div>

        {/* Cards List Section (Bottom/Right) */}
        <div className="h-[65vh] md:h-full md:w-1/2 bg-gray-50 flex flex-col">
          
          {/* Stats Header (Wolt Style) */}
          <div className="p-4 bg-white shadow-sm z-10" dir="rtl">
             <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex-shrink-0 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium border border-blue-100 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    הכי מהיר: 12 דק׳
                </div>
                <div className="flex-shrink-0 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium border border-green-100 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    הכי זול: {bestPrice}₪
                </div>
             </div>
          </div>

          {/* Cards Grid */}
          <div className="flex-1 overflow-y-auto p-4" dir="rtl">
            {(() => {
              const mockBids: any[] = [
                {
                  id: 'bid_1',
                  providerId: 'p1',
                  providerName: 'יוסי כהן',
                  providerImage: 'https://images.unsplash.com/photo-1581578017093-cd30fba4e9d5?w=400&h=400&fit=crop',
                  rating: 4.9,
                  reviews: 124,
                  totalPriceGuaranteed: 350,
                  distance: 1.2,
                  distanceTime: '15 דק׳',
                  vehicleType: 'scooter',
                  availability: 'now',
                  description: 'מומחה לתיקוני אינסטלציה מהירים',
                  badges: ['verified', 'fast_response']
                },
                {
                  id: 'bid_2',
                  providerId: 'p2',
                  providerName: 'דניאל לוי',
                  providerImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop',
                  rating: 4.7,
                  reviews: 85,
                  totalPriceGuaranteed: 280,
                  distance: 3.5,
                  distanceTime: '35 דק׳',
                  vehicleType: 'van',
                  availability: 'today',
                  description: 'שרברב מוסמך עם ציוד מתקדם',
                  badges: ['price_match']
                },
                {
                  id: 'bid_3',
                  providerId: 'p3',
                  providerName: 'רונית אלמוג',
                  providerImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
                  rating: 5.0,
                  reviews: 210,
                  totalPriceGuaranteed: 420,
                  distance: 0.8,
                  distanceTime: '10 דק׳',
                  vehicleType: 'car',
                  availability: 'now',
                  description: 'שירות VIP ואחריות מלאה',
                  badges: ['top_rated', 'warranty']
                },
                {
                  id: 'bid_4',
                  providerId: 'p4',
                  providerName: 'אבי יצחק',
                  providerImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
                  rating: 4.6,
                  reviews: 56,
                  totalPriceGuaranteed: 300,
                  distance: 5.1,
                  distanceTime: '45 דק׳',
                  vehicleType: 'truck',
                  availability: 'tomorrow',
                  description: 'עבודות תשתית וביוב',
                  badges: []
                }
              ];

              const displayBids = bids.length > 0 ? bids : mockBids;
              const bestRating = Math.max(...displayBids.map(b => b.rating));
              const bestPrice = Math.min(...displayBids.map(b => b.totalPriceGuaranteed));
              const bestRatingBid = displayBids.find(b => b.rating === bestRating);
              const bestPriceBid = displayBids.find(b => b.totalPriceGuaranteed === bestPrice);

              return (
                <div className="space-y-4 pb-20">
                  {/* Quick Comparison Header */}
                  <div className="grid grid-cols-2 gap-3 mb-2">
                     {/* Best Rating */}
                     <div className="bg-gradient-to-br from-purple-50 to-white p-3 rounded-xl border border-purple-100 shadow-sm relative overflow-hidden group cursor-pointer hover:border-purple-300 transition-all">
                        <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">
                          הדירוג הגבוה
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="font-bold text-2xl text-gray-900">{bestRating}</div>
                          <div className="flex text-yellow-400">
                             {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
                          </div>
                        </div>
                        <div className="text-xs text-purple-700 mt-1 font-medium">
                          {bestRatingBid?.providerName}
                        </div>
                     </div>

                     {/* Best Price */}
                     <div className="bg-gradient-to-br from-green-50 to-white p-3 rounded-xl border border-green-100 shadow-sm relative overflow-hidden group cursor-pointer hover:border-green-300 transition-all">
                        <div className="absolute top-0 right-0 bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">
                          הכי משתלם
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="font-bold text-2xl text-gray-900">{bestPrice}₪</div>
                          <div className="text-xs text-gray-500 line-through">
                            {Math.round(bestPrice * 1.2)}₪
                          </div>
                        </div>
                        <div className="text-xs text-green-700 mt-1 font-medium">
                          {bestPriceBid?.providerName}
                        </div>
                     </div>
                  </div>

                  {displayBids.map((bid, idx) => {
                    const isBestPrice = bid.totalPriceGuaranteed === bestPrice;
                    const vehicle = getVehicleInfo(idx);
                    const priceLevel = getPriceLevel(bid.totalPriceGuaranteed);
                    const isHovered = hoveredProfessionalId === bid.id;
                    
                    return (
                      <div 
                        key={bid.id}
                        onClick={() => onBidSelect(bid)}
                        onMouseEnter={() => setHoveredProfessionalId(bid.id)}
                        onMouseLeave={() => setHoveredProfessionalId(null)}
                        className={`bg-white rounded-xl shadow-sm border transition-all cursor-pointer group hover:shadow-md ${
                          isHovered ? 'border-blue-500 ring-2 ring-blue-500 shadow-lg' : 
                          activeBidId === bid.id ? 'border-blue-500 ring-1 ring-blue-500' : 
                          'border-gray-100 hover:border-blue-200'
                        }`}
                      >
                        {/* Card Content */}
                        <div className="flex p-4 gap-4">
                            {/* Avatar Image */}
                            <div className="relative flex-shrink-0">
                                <ImageWithFallback
                                    src={bid.providerImage}
                                    alt={bid.providerName}
                                    className="w-20 h-20 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform"
                                />
                                {isBestPrice && (
                                    <div className="absolute -bottom-2 -right-2 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                        הכי משתלם
                                    </div>
                                )}
                                {bid.rating >= 4.9 && !isBestPrice && (
                                    <div className="absolute -bottom-2 -right-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                        טופ
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-1 mb-0.5">
                                            <h3 className="font-bold text-gray-900 text-lg leading-tight truncate">{bid.providerName}</h3>
                                            <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-50" />
                                        </div>
                                        <p className="text-sm text-gray-500 truncate mb-2">
                                            {bid.description || 'מומחה שירות • זמין מיידית'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-bold text-lg text-gray-900">{bid.totalPriceGuaranteed}₪</span>
                                        {bid.badges?.includes('active_bidding') || Math.random() > 0.5 ? (
                                           <span className="flex items-center justify-end gap-1 text-[10px] font-bold text-orange-500 animate-pulse">
                                              <Gavel className="w-3 h-3" />
                                              מכרז פעיל
                                           </span>
                                        ) : (
                                           <span className="text-xs text-gray-400">הצעה סופית</span>
                                        )}
                                    </div>
                                </div>

                                <div className="h-px bg-gray-50 my-2"></div>

                                {/* Metrics Row */}
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                            <span className="font-bold text-gray-900">{bid.rating}</span>
                                            <span className="text-gray-400 text-xs">({bid.reviews})</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                                            <span>{priceLevel}</span>
                                            <span>•</span>
                                            <span>{bid.distance} ק״מ</span>
                                        </div>
                                    </div>

                                    {/* Portfolio Quick Access */}
                                    <div onClick={(e) => e.stopPropagation()}>
                                      <details className="group/portfolio">
                                          <summary className="list-none flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-purple-600 hover:bg-purple-50 px-2 py-1 rounded-lg transition-all cursor-pointer marker:content-none select-none">
                                              <LayoutList className="w-3.5 h-3.5" />
                                              תיק עבודות
                                              <ChevronDown className="w-3 h-3 opacity-0 group-open/portfolio:opacity-100 transition-opacity" />
                                          </summary>
                                          
                                          <div className="mt-3 pt-3 border-t border-gray-50 animate-in slide-in-from-top-2 duration-200 cursor-default">
                                              <div className="flex items-center justify-between mb-2">
                                                  <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">עבודות אחרונות ולקוחות</span>
                                              </div>
                                              <div className="grid grid-cols-4 gap-2">
                                                  {[1, 2, 3, 4].map((item) => (
                                                      <div key={item} className="relative aspect-square rounded-lg overflow-hidden group/img cursor-zoom-in">
                                                          <ImageWithFallback
                                                              src={`https://images.unsplash.com/photo-${
                                                                  item === 1 ? '1581578017093-cd30fba4e9d5' : 
                                                                  item === 2 ? '1621905251189-08b45d6a269e' : 
                                                                  item === 3 ? '1504328345606-18aff0849309' : 
                                                                  '1556910103-1c02745a30bf'
                                                              }?w=150&h=150&fit=crop&q=80`}
                                                              alt="Portfolio"
                                                              className="w-full h-full object-cover transition-transform group-hover/img:scale-110"
                                                          />
                                                          {item === 4 && (
                                                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold backdrop-blur-[1px]">
                                                                  +12
                                                              </div>
                                                          )}
                                                          {item === 1 && (
                                                              <div className="absolute bottom-0 right-0 bg-green-500/90 text-white text-[8px] px-1 py-0.5 rounded-tl-md">
                                                                  מאומת
                                                              </div>
                                                          )}
                                                          {item === 2 && (
                                                              <div className="absolute bottom-0 right-0 bg-blue-500/90 text-white text-[8px] px-1 py-0.5 rounded-tl-md">
                                                                  לקוח
                                                              </div>
                                                          )}
                                                      </div>
                                                  ))}
                                              </div>
                                          </div>
                                      </details>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Logistics Footer (Wolt Style) */}
                        <div className="bg-gray-50 px-4 py-3 rounded-b-xl border-t border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                 <div className={`px-2 py-0.5 rounded-md text-xs font-bold flex items-center gap-1.5 ${bid.distanceTime.includes('10') || bid.distanceTime.includes('15') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                    <Clock className="w-3.5 h-3.5" />
                                    {bid.distanceTime}
                                 </div>
                                 <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <vehicle.icon className="w-3.5 h-3.5" />
                                    <span>מגיע עם {vehicle.label}</span>
                                 </div>
                            </div>
                            <div className="text-xs font-medium text-blue-600 group-hover:translate-x-[-4px] transition-transform flex items-center gap-1 cursor-pointer">
                                הזמן עכשיו <ArrowLeft className="w-3 h-3" />
                            </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* AI Analysis Toggle (Compact) */}
                  {serviceRequest.aiAnalysis && (
                    <div className="mt-4">
                      <button
                        onClick={() => setShowAnalysis(!showAnalysis)}
                        className="w-full flex items-center justify-between bg-white border border-gray-200 p-3 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-purple-600" />
                          <span>ניתוח AI ופרטים נוספים</span>
                        </div>
                        {showAnalysis ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      
                      {showAnalysis && (
                        <div className="mt-2 bg-white rounded-xl p-4 border border-gray-200 text-sm space-y-3" dir="rtl">
                           <div>
                            <div className="font-medium text-purple-600 mb-1">סיכום</div>
                            <p className="text-gray-600">{serviceRequest.aiAnalysis.summary}</p>
                          </div>
                          {serviceRequest.aiAnalysis.recommendations.length > 0 && (
                            <div>
                              <div className="font-medium text-green-600 mb-1">המלצות</div>
                              <ul className="list-disc list-inside text-gray-600">
                                {serviceRequest.aiAnalysis.recommendations.map((rec, i) => (
                                  <li key={i}>{rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}