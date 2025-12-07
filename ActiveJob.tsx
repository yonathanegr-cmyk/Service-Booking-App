import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  Shield, 
  Phone, 
  MessageSquare, 
  AlertTriangle, 
  Check, 
  X, 
  CreditCard, 
  ChevronUp,
  PlusCircle,
  FileText,
  Camera,
  Video,
  Play,
  Maximize2,
  MapPin,
  Hash,
  Ban
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Booking } from '../App';
import { supabase } from '../utils/supabaseClient';
import { ChatScreen, Provider } from './ChatScreen';
import { CallConfirmModal } from './CallConfirmModal';

type ActiveJobProps = {
  booking: Booking | null;
  onSupportClick: () => void;
  onComplete?: () => void;
};

type CostItem = {
  id: string;
  label: string;
  amount: number;
  type: 'base' | 'time' | 'extra' | 'penalty';
  status: 'approved' | 'pending' | 'rejected';
};

type MediaItem = {
    id: string;
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
    label: string; // 'Avant' | 'Après'
    timestamp: string;
};

type ChatMessage = {
    id: string;
    text: string;
    sender: 'user' | 'support' | 'system';
    timestamp: string;
    read?: boolean;
};

export function ActiveJob({ booking, onSupportClick, onComplete }: ActiveJobProps) {
  // Ajout du statut 'cancelled'
  const [status, setStatus] = useState<'waiting_start' | 'in_progress' | 'completed' | 'cancelled'>('waiting_start');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showSupportChat, setShowSupportChat] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [cancellationFee, setCancellationFee] = useState(0);
  
  // Provider object for ChatScreen and CallConfirmModal
  // Uses booking data when available, with fallbacks for demo/testing
  const providerData: Provider = {
    id: booking?.providerId || 'pro-1',
    name: booking?.providerName || 'יוסי כהן',
    role: 'אינסטלטור מוסמך',
    phone: booking?.providerPhone || '+972-54-555-1234',
    image: booking?.providerImage 
      || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    rating: 4.9,
    carInfo: 'יונדאי איוניק 5',
    licensePlate: '64-322-12'
  };
  
  const initialRequestDescription = booking?.serviceData?.aiDescription || "תיאור הבעיה לא זמין";
  
  const getInitialMediaItems = (): MediaItem[] => {
    const mediaUrls = booking?.serviceData?.mediaUrls;
    if (!mediaUrls || mediaUrls.length === 0) {
      return [];
    }
    return mediaUrls.map((url, index) => ({
      id: `media-${index}`,
      type: url.includes('.mp4') || url.includes('.mov') || url.includes('.webm') ? 'video' as const : 'image' as const,
      url: url,
      thumbnail: url.includes('.mp4') || url.includes('.mov') || url.includes('.webm') ? url : undefined,
      label: 'Avant',
      timestamp: booking?.date ? `${booking.date} ${booking.time || ''}`.trim() : 'לא זמין'
    }));
  };
  
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(getInitialMediaItems());

  useEffect(() => {
    setMediaItems(getInitialMediaItems());
  }, [booking?.id, booking?.serviceData?.mediaUrls]);

  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [tipAmount, setTipAmount] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false); // Nouvel état pour le reçu // Ajout state pour le pourboire

  // --- SUPPORT CHAT LOGIC ---
  const [supportMessages, setSupportMessages] = useState<ChatMessage[]>([
      {
          id: 'welcome',
          text: "Bonjour ! Je suis l'assistant support Beedy AI. Comment puis-je vous aider concernant votre intervention en cours ?",
          sender: 'support',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
  ]);
  const [newMessageText, setNewMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
      if (showSupportChat) {
          scrollToBottom();
      }
  }, [supportMessages, showSupportChat]);

  // SUPABASE REALTIME SUBSCRIPTION
  useEffect(() => {
    const fetchMessages = async () => {
        const { data, error } = await supabase
            .from('support_messages')
            .select('*')
            .eq('booking_id', booking?.id || '8821')
            .order('created_at', { ascending: true });
        
        if (data && !error && data.length > 0) {
            const formattedMessages: ChatMessage[] = data.map((msg: any) => ({
                id: msg.id,
                text: msg.content,
                sender: (msg.sender_type === 'admin' ? 'support' : 'user') as 'user' | 'support' | 'system',
                timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
            setSupportMessages(prev => {
                 return formattedMessages.length > 0 ? formattedMessages : prev;
            });
        }
    };

    fetchMessages();

    const channel = supabase
      .channel('support_chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `booking_id=eq.${booking?.id || '8821'}`
        },
        (payload) => {
          const newMessage = payload.new;
          if (newMessage.sender_type === 'admin') {
              const msg: ChatMessage = {
                  id: newMessage.id,
                  text: newMessage.content,
                  sender: 'support',
                  timestamp: new Date(newMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };
              setSupportMessages(prev => [...prev, msg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [booking?.id]);

  const handleSendMessage = async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!newMessageText.trim()) return;

      const tempId = Date.now().toString();
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const optimisticMessage: ChatMessage = {
          id: tempId,
          text: newMessageText,
          sender: 'user',
          timestamp: timestamp
      };
      setSupportMessages(prev => [...prev, optimisticMessage]);
      const textToSend = newMessageText;
      setNewMessageText('');

      const { error } = await supabase
        .from('support_messages')
        .insert({
            content: textToSend,
            sender_type: 'user',
            booking_id: booking?.id || '8821',
            created_at: new Date().toISOString()
        });

      if (error) {
          // Fallback simulation
          setTimeout(() => {
              setSupportMessages(prev => [...prev, {
                  id: (Date.now() + 1).toString(),
                  text: "Note : Le mode temps réel nécessite une connexion Supabase active.",
                  sender: 'system',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }]);
          }, 1000);
      }
  };

  // État du panier / facture
  const [items, setItems] = useState<CostItem[]>([
    { id: '1', label: 'Frais de déplacement', amount: 150, type: 'base', status: 'approved' },
    { id: '2', label: 'Main d\'œuvre (1h min)', amount: 200, type: 'time', status: 'approved' }
  ]);

  const [pendingUpsell, setPendingUpsell] = useState<CostItem | null>(null);

  // Chronomètre
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'in_progress') {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const totalCost = items
    .filter(i => i.status === 'approved')
    .reduce((acc, item) => acc + item.amount, 0);

  // --- CANCELLATION LOGIC ---
  const handleCancelRequest = () => {
      // Calcul des frais selon le statut
      let fee = 50; // Frais de base (déplacement/annulation tardive)
      if (status === 'in_progress') {
          fee = 120; // Frais majorés si le travail a commencé
      }
      setCancellationFee(fee);
      setShowCancelModal(true);
  };

  const confirmCancellation = () => {
      setStatus('cancelled');
      // Remplacer les items par les frais d'annulation
      setItems([
          { 
              id: 'cancellation-fee', 
              label: 'Frais d\'annulation', 
              amount: cancellationFee, 
              type: 'penalty', 
              status: 'approved' 
          }
      ]);
      setShowCancelModal(false);
      setShowInvoice(true); // Montrer la facture immédiatement
  };

  // --- ACTIONS SIMULÉES DU PRO ---
  const simulateProStart = () => setStatus('in_progress');
  
  const simulateProUpsell = () => {
    const newItem: CostItem = {
      id: Math.random().toString(),
      label: 'Remplacement joint étanche',
      amount: 80,
      type: 'extra',
      status: 'pending'
    };
    setPendingUpsell(newItem);
  };

  const simulateProUploadAfterPhotos = () => {
      const now = new Date();
      const timeString = `Auj. ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const newMedia: MediaItem[] = [
          {
              id: Math.random().toString(),
              type: 'image',
              url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80',
              label: 'Après',
              timestamp: timeString
          },
           {
              id: Math.random().toString(),
              type: 'image',
              url: 'https://images.unsplash.com/photo-1584622750111-993a426fbf0a?w=800&q=80',
              label: 'Après',
              timestamp: timeString
          }
      ];
      setMediaItems(prev => [...prev, ...newMedia]);
  };

  const simulateProFinish = () => {
      simulateProUploadAfterPhotos(); 
      setStatus('completed');
      setTimeout(() => setShowInvoice(true), 1000);
  };

  const handleAcceptUpsell = () => {
    if (pendingUpsell) {
      setItems([...items, { ...pendingUpsell, status: 'approved' }]);
      setPendingUpsell(null);
    }
  };

  const handleRejectUpsell = () => {
    if (pendingUpsell) setPendingUpsell(null);
  };

  return (
    <div className="relative h-full flex flex-col bg-gray-50 overflow-hidden font-sans" dir="rtl">
      
      {/* HEADER - STATUS & TIMER */}
      <div className="bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] z-20 relative rounded-b-[2.5rem] pb-8 mb-2">
        
        {/* TOP BAR: Status & Order ID */}
        <div className="flex justify-between items-center px-6 pt-6 mb-8">
             <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full border transition-colors ${
                 status === 'in_progress' ? 'bg-green-50 border-green-100 text-green-700' : 
                 status === 'completed' ? 'bg-blue-50 border-blue-100 text-blue-700' : 
                 status === 'cancelled' ? 'bg-red-50 border-red-100 text-red-700' :
                 'bg-orange-50 border-orange-100 text-orange-700'
             }`}>
                <div className={`w-2 h-2 rounded-full shadow-sm ${
                    status === 'in_progress' ? 'bg-green-500 animate-pulse' : 
                    status === 'completed' ? 'bg-blue-600' : 
                    status === 'cancelled' ? 'bg-red-500' :
                    'bg-orange-500'
                }`} />
                <span className="text-xs font-bold tracking-wide">
                    {status === 'waiting_start' && 'En attente'}
                    {status === 'in_progress' && 'Intervention en cours'}
                    {status === 'completed' && 'Terminé'}
                    {status === 'cancelled' && 'Annulé'}
                </span>
            </div>
            <div className="flex flex-col items-end">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-1">Commande</span>
                <span className="text-sm font-mono font-bold text-gray-900 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">#{booking?.id || '8821'}</span>
            </div>
        </div>

        {/* LOCATION HERO */}
        <div className="px-6 mb-8 text-center relative">
            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br mb-4 shadow-lg ring-4 ring-white ${status === 'cancelled' ? 'from-red-50 to-red-100 text-red-600 shadow-red-100' : 'from-blue-50 to-blue-100 text-blue-600 shadow-blue-100'}`}>
                {status === 'cancelled' ? <Ban className="w-7 h-7"/> : <MapPin className="w-7 h-7" />}
            </div>
            <h2 className="font-bold text-gray-900 text-2xl leading-tight mb-1 tracking-tight">{booking?.address || 'רחוב הירקון 12'}</h2>
            <p className="text-base text-gray-500 font-medium">{booking?.addressDetails || 'תל אביב-יפו, דירה 4'}</p>
        </div>

        {/* METRICS GRID */}
        <div className="px-6">
            <div className="grid grid-cols-2 gap-4">
                {/* Timer Box */}
                <div className={`group rounded-2xl p-5 text-white relative overflow-hidden shadow-xl transition-all ${status === 'cancelled' ? 'bg-gray-800 shadow-gray-200' : 'bg-gray-900 shadow-gray-200'}`}>
                     <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none ${status === 'cancelled' ? 'bg-red-500/10' : 'bg-green-500/10'}`} />
                     
                     <div className="flex justify-between items-start mb-3 relative z-10">
                        <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md">
                             <Clock className={`w-4 h-4 ${status === 'cancelled' ? 'text-gray-400' : 'text-green-400'}`} />
                        </div>
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider py-1.5">Durée</span>
                     </div>
                     
                     <div className="font-mono text-3xl font-bold tracking-wider text-center text-white relative z-10 drop-shadow-md">
                        {formatTime(elapsedSeconds)}
                     </div>
                     {status !== 'cancelled' && (
                        <div className="text-[10px] text-center text-green-400/80 font-medium mt-2 flex items-center justify-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse"/> Temps réel
                        </div>
                     )}
                </div>

                {/* Cost Box */}
                <div className="group bg-white border border-gray-100 rounded-2xl p-5 flex flex-col relative shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] hover:border-blue-100 transition-all">
                    <div className="flex justify-between items-start mb-2">
                         <button onClick={() => setShowSupportChat(true)} className="text-gray-300 hover:text-blue-600 transition-colors p-1 -ml-1">
                            <AlertTriangle className="w-4 h-4" />
                        </button>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-blue-600 uppercase font-bold tracking-wider bg-blue-50 px-2.5 py-1 rounded-full">Total</span>
                        </div>
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center my-1">
                        <div className={`text-3xl font-bold tracking-tight flex items-baseline ${status === 'cancelled' ? 'text-red-600' : 'text-gray-900'}`}>
                            <span className="text-lg text-gray-400 font-medium mr-1">₪</span>
                            {totalCost}
                        </div>
                    </div>
                    <div className="text-[10px] text-center text-gray-400 font-medium border-t border-gray-50 pt-2 mt-1">
                        {status === 'cancelled' ? 'Montant final' : 'Estimation actuelle'}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* PROVIDER CARD */}
        <div className="bg-white p-5 rounded-3xl shadow-[0_2px_12px_-2px_rgba(0,0,0,0.05)] border border-gray-100 flex items-center gap-4 relative overflow-hidden">
             <div className={`absolute top-0 left-0 w-1 h-full ${status === 'cancelled' ? 'bg-red-500' : 'bg-blue-600'}`} />
             <div className="relative">
                <ImageWithFallback 
                    src={booking?.providerId ? `https://images.unsplash.com/photo-1581578017093-cd30fba4e9d5?w=150&h=150&fit=crop` : "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop"}
                    className={`w-16 h-16 rounded-2xl object-cover shadow-md border-2 border-white ${status === 'cancelled' ? 'grayscale' : ''}`}
                    alt="Provider"
                />
                {status !== 'cancelled' && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-[10px] p-1 rounded-full border-2 border-white shadow-sm">
                        <Check className="w-2.5 h-2.5 stroke-[4]" />
                    </div>
                )}
             </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-lg truncate">{booking?.providerName || 'יוסי כהן'}</h3>
                <div className="flex items-center gap-2 mt-1">
                    <div className="flex text-yellow-400 text-xs gap-0.5">
                        {[1,2,3,4,5].map(i => <span key={i}>★</span>)}
                    </div>
                    <span className="text-gray-300 text-xs">|</span>
                    <span className="text-gray-500 text-xs font-medium">Pro Vérifié</span>
                </div>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={() => setShowChat(true)}
                    disabled={status === 'cancelled'}
                    className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={`פתח צ'אט עם ${providerData.name}`}
                >
                    <MessageSquare className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => status !== 'cancelled' && setShowCallModal(true)}
                    disabled={status === 'cancelled'}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-white transition-colors shadow-lg ${status === 'cancelled' ? 'bg-gray-300 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
                    aria-label={`התקשר ל${providerData.name}`}
                >
                    <Phone className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* JOB DETAILS & MEDIA (AVANT / APRÈS) */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_2px_12px_-2px_rgba(0,0,0,0.05)] border border-gray-100">
             {/* ... (Existing content remains mostly the same, just wrapping interaction with status check if needed) ... */}
             <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-gray-50 rounded-xl text-gray-900">
                    <Camera className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">Suivi Visuel</h3>
                    <p className="text-xs text-gray-500">Documentez l'intervention</p>
                </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-white border border-amber-100 rounded-2xl p-4 mb-6 flex gap-3 shadow-sm">
                <div className="bg-amber-100 p-2 rounded-lg h-fit shrink-0">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                    <span className="font-bold block mb-1 text-amber-700">Conseil de sécurité</span>
                    Prenez des photos de tout pour assurer une transparence totale.
                </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-2xl mb-6 border border-gray-100 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 rounded-t-2xl opacity-20" />
                <p className="text-sm text-gray-600 italic leading-relaxed">"{initialRequestDescription}"</p>
            </div>

            <div className="space-y-8">
                {/* SECTION: AVANT */}
                <div>
                    <div className="flex items-center justify-between mb-3 px-1">
                         <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            Avant l'intervention
                         </h4>
                         <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg border border-gray-200">État initial</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {mediaItems.filter(m => m.label === 'Avant').length === 0 ? (
                            <div className="col-span-2 bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col items-center justify-center text-center min-h-[120px]">
                                <Camera className="w-8 h-8 text-gray-300 mb-2" />
                                <span className="text-sm text-gray-400 font-medium">אין תמונות</span>
                                <span className="text-xs text-gray-300 mt-1">לא הועלו תמונות לפני ההתערבות</span>
                            </div>
                        ) : (
                            mediaItems.filter(m => m.label === 'Avant').map(item => (
                                <motion.div 
                                    layoutId={item.id}
                                    key={item.id}
                                    onClick={() => setSelectedMedia(item)}
                                    className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group shadow-sm"
                                >
                                    <ImageWithFallback 
                                        src={item.type === 'video' ? (item.thumbnail || '') : item.url} 
                                        alt="Avant" 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    {item.type === 'video' && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg">
                                                <Play className="w-3 h-3 text-gray-900 fill-gray-900 ml-0.5" />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        )}
                         <button className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-all bg-gray-50 hover:bg-gray-100">
                            <PlusCircle className="w-6 h-6 opacity-50" />
                            <span className="text-[10px] font-bold">Ajouter</span>
                        </button>
                    </div>
                </div>

                {/* SECTION: APRÈS */}
                {status !== 'cancelled' && (
                    <div>
                        <div className="flex items-center justify-between mb-3 px-1">
                            <h4 className="text-xs font-bold text-green-600 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                Résultat Final
                            </h4>
                            <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-100 px-2 py-1 rounded-lg">Preuve de fin</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3">
                            <input 
                                type="file" 
                                id="photo-upload" 
                                className="hidden" 
                                accept="image/*" 
                                capture="environment"
                                multiple
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        simulateProUploadAfterPhotos();
                                    }
                                }} 
                            />

                            <AnimatePresence>
                                {mediaItems.filter(m => m.label === 'Après').map(item => (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        layoutId={item.id}
                                        key={item.id}
                                        onClick={() => setSelectedMedia(item)}
                                        className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group shadow-lg shadow-green-100 ring-2 ring-green-500 ring-offset-2"
                                    >
                                        <ImageWithFallback 
                                            src={item.url} 
                                            alt="Après" 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            
                            {mediaItems.filter(m => m.label === 'Après').length === 0 ? (
                                <label 
                                    htmlFor="photo-upload"
                                    className="col-span-3 border-2 border-dashed border-green-300 bg-gradient-to-br from-green-50 to-white rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[120px] hover:from-green-100 hover:to-green-50 hover:border-green-400 transition-all group relative overflow-hidden cursor-pointer"
                                >
                                    <div className="bg-white p-3 rounded-full shadow-md mb-3 group-hover:scale-110 transition-transform ring-4 ring-green-50 relative z-10">
                                        <Camera className="w-6 h-6 text-green-600" />
                                    </div>
                                    <p className="text-sm text-green-900 font-bold relative z-10">Ajouter les photos finales</p>
                                </label>
                            ) : (
                                <label htmlFor="photo-upload" className="aspect-square rounded-2xl border-2 border-dashed border-green-300 flex flex-col items-center justify-center gap-1 text-green-600 hover:border-green-500 hover:text-green-700 transition-all bg-green-50 hover:bg-green-100 shadow-inner cursor-pointer">
                                    <PlusCircle className="w-6 h-6" />
                                    <span className="text-[10px] font-bold">Ajouter</span>
                                </label>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* SUPPORT CARD */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-0.5 rounded-3xl shadow-lg shadow-blue-200 overflow-hidden">
            <div className="bg-white rounded-[1.4rem] p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center shadow-sm">
                            <Shield className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 text-sm">Besoin d'aide ?</div>
                            <div className="text-xs text-gray-500 font-medium">Support 24/7</div>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowSupportChat(true)}
                        className="bg-gray-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors"
                    >
                        Contacter
                    </button>
                </div>
                
                {/* Cancel Button */}
                {status !== 'completed' && status !== 'cancelled' && (
                    <div className="border-t border-gray-100 pt-3 mt-1 text-center">
                        <button 
                            onClick={handleCancelRequest}
                            className="text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
                        >
                            Annuler l'intervention
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* BILLING DETAILS */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_2px_12px_-2px_rgba(0,0,0,0.05)] border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gray-50 rounded-xl">
                    <CreditCard className="w-5 h-5 text-gray-900" />
                </div>
                <h3 className="font-bold text-gray-900">Détails de la facture</h3>
            </div>
            
            <div className="space-y-4">
                {items.map((item) => (
                    <motion.div 
                        layout
                        key={item.id} 
                        className={`flex justify-between items-center text-sm p-3 rounded-xl ${
                            item.type === 'penalty' ? 'bg-red-50 border border-red-100' :
                            item.type === 'extra' ? 'bg-blue-50/50 border border-blue-100' : 
                            'bg-gray-50/50 border border-gray-100'
                        } ${item.status === 'pending' ? 'opacity-50' : ''}`}
                    >
                        <div className="flex items-center gap-3">
                            {item.type === 'extra' ? (
                                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                                    <PlusCircle className="w-3 h-3 text-blue-600" />
                                </div>
                            ) : item.type === 'penalty' ? (
                                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                                    <Ban className="w-3 h-3 text-red-600" />
                                </div>
                            ) : (
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                            )}
                            <span className={`${item.type === 'penalty' ? 'text-red-700 font-bold' : 'text-gray-700 font-medium'}`}>{item.label}</span>
                        </div>
                        <span className={`font-bold ${item.type === 'penalty' ? 'text-red-700' : 'text-gray-900'}`}>₪{item.amount}</span>
                    </motion.div>
                ))}
                
                <div className="h-px bg-dashed bg-gray-200 my-2" />
                
                <div className="flex justify-between items-end pt-2">
                    <span className="text-gray-500 font-medium text-sm">{status === 'cancelled' ? 'Total facturé' : 'Total Estimé'}</span>
                    <span className={`text-2xl font-bold leading-none ${status === 'cancelled' ? 'text-red-600' : 'text-blue-600'}`}>₪{totalCost}</span>
                </div>
            </div>
        </div>

        {/* JOURNAL */}
        <div className="px-4 pb-20">
            {/* ... Existing Journal ... */}
            <div className="flex items-center gap-2 mb-4">
                 <div className="h-px flex-1 bg-gray-200" />
                 <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Journal d'activité</span>
                 <div className="h-px flex-1 bg-gray-200" />
            </div>
            
            <div className="space-y-0 pl-4 border-r-2 border-dashed border-gray-200 mr-2 relative">
                {status === 'cancelled' && (
                    <div className="relative pb-8 last:pb-0">
                        <div className="absolute -right-[23px] top-0 w-4 h-4 bg-red-500 rounded-full border-4 border-gray-50 shadow-sm z-10" />
                        <p className="text-[10px] font-bold text-red-600 mb-0.5 bg-red-50 inline-block px-2 py-0.5 rounded-full">Maintenant</p>
                        <div className="bg-white p-3 rounded-xl shadow-sm border border-red-100 mt-1">
                            <p className="text-sm font-bold text-gray-800">Intervention annulée par l'utilisateur</p>
                        </div>
                    </div>
                )}
                {status === 'completed' && (
                    <div className="relative pb-8 last:pb-0">
                        <div className="absolute -right-[23px] top-0 w-4 h-4 bg-blue-600 rounded-full border-4 border-gray-50 shadow-sm z-10" />
                        <p className="text-[10px] font-bold text-blue-600 mb-0.5 bg-blue-50 inline-block px-2 py-0.5 rounded-full">Maintenant</p>
                        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 mt-1">
                            <p className="text-sm font-bold text-gray-800">Intervention terminée</p>
                        </div>
                    </div>
                )}
                 <div className="relative pb-8 last:pb-0">
                    <div className="absolute -right-[23px] top-0 w-4 h-4 bg-gray-300 rounded-full border-4 border-gray-50 shadow-sm z-10" />
                    <p className="text-[10px] text-gray-400 font-mono mb-0.5">14:00</p>
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 mt-1">
                        <p className="text-sm font-medium text-gray-700">Arrivée du professionnel</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

       {/* MEDIA VIEWER MODAL */}
       {/* ... (Existing code) ... */}

       {/* UPSELL MODAL */}
       {/* ... (Existing code) ... */}

       {/* CANCELLATION MODAL (New) */}
       <AnimatePresence>
        {showCancelModal && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative p-6 text-center"
                >
                    <div className="w-20 h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-red-50/50">
                        <AlertTriangle className="w-10 h-10 text-red-500" />
                    </div>
                    
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Annuler l'intervention ?</h2>
                    <p className="text-gray-500 text-sm mb-6">
                        L'annulation maintenant entraînera des frais de dédommagement pour le professionnel.
                    </p>

                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
                        <p className="text-xs text-red-600 font-bold uppercase tracking-wider mb-1">Frais d'annulation</p>
                        <p className="text-3xl font-bold text-red-700">₪{cancellationFee}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => setShowCancelModal(false)}
                            className="py-3.5 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            Retour
                        </button>
                        <button 
                            onClick={confirmCancellation}
                            className="py-3.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                        >
                            Confirmer
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

       {/* SUPPORT CHAT MODAL */}
       <AnimatePresence>
        {showSupportChat && (
            <motion.div 
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-0 z-[100] bg-gray-50 flex flex-col"
            >
                <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setShowSupportChat(false)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full">
                            <ChevronUp className="w-6 h-6 rotate-180" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm">Support Beedy AI</h3>
                                <p className="text-xs text-green-600 font-medium flex items-center gap-1">En ligne 24/7</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {supportMessages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`px-4 py-3 rounded-2xl max-w-[85%] shadow-sm border ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-sm border-blue-600' : 'bg-white text-gray-800 rounded-tl-sm border-gray-100'} ${msg.sender === 'system' ? 'bg-gray-100 border-gray-200 text-gray-600 text-xs italic' : ''}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                <p className={`text-[10px] text-right mt-1 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>{msg.timestamp}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-white border-t border-gray-100 pb-8">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-gray-100 p-2 rounded-full border border-gray-200 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <input type="text" value={newMessageText} onChange={(e) => setNewMessageText(e.target.value)} placeholder="Décrivez votre problème..." className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-900 placeholder-gray-500 ml-3" autoFocus />
                        <button type="submit" disabled={!newMessageText.trim()} className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                             <div className="rotate-90"><ChevronUp className="w-5 h-5" /></div>
                        </button>
                    </form>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* INVOICE MODAL */}
      <AnimatePresence>
        {showInvoice && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative"
                >
                    <div className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-b ${status === 'cancelled' ? 'from-red-50' : 'from-blue-50'} to-white z-0`} />
                    
                    <div className="relative z-10 p-6 flex flex-col items-center text-center">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ring-8 shadow-sm ${status === 'cancelled' ? 'bg-red-100 ring-red-50 text-red-600' : 'bg-green-100 ring-green-50 text-green-600'}`}>
                            {status === 'cancelled' ? <X className="w-10 h-10" strokeWidth={3} /> : <Check className="w-10 h-10" strokeWidth={3} />}
                        </div>
                        
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">{status === 'cancelled' ? 'Intervention Annulée' : 'Intervention Terminée !'}</h2>
                        <p className="text-gray-500 text-sm mb-4">{status === 'cancelled' ? 'La course a été annulée.' : 'Merci de noter le professionnel et choisir un pourboire.'}</p>

                        {/* RATING SELECTOR */}
                        {status !== 'cancelled' && (
                            <div className="flex justify-center gap-2 mb-6">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={`w-10 h-10 rounded-full transition-all ${rating >= star ? 'text-yellow-400 scale-110' : 'text-gray-200 hover:text-yellow-200'}`}
                                    >
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                                            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="w-full bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-6 text-left">
                             <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 border-dashed">
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Total à régler</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className={`text-3xl font-black tracking-tight ${status === 'cancelled' ? 'text-red-600' : 'text-blue-600'}`}>
                                            ₪{totalCost + tipAmount}
                                        </p>
                                        {tipAmount > 0 && (
                                            <span className="text-sm text-green-600 font-bold animate-in fade-in slide-in-from-bottom-1">
                                                (+₪{tipAmount} pourboire)
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                     <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Facture</p>
                                     <p className="text-sm font-mono font-medium text-gray-700">#INV-8821</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {items.map(item => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span className={`${item.type === 'penalty' ? 'text-red-600 font-bold' : 'text-gray-600'}`}>{item.label}</span>
                                        <span className={`font-medium ${item.type === 'penalty' ? 'text-red-600' : 'text-gray-900'}`}>₪{item.amount}</span>
                                    </div>
                                ))}
                            </div>

                            {/* TIP SELECTOR */}
                            {status !== 'cancelled' && (
                                <div className="mt-4 pt-4 border-t border-gray-200 border-dashed">
                                    <p className="text-xs font-bold text-gray-500 mb-2">Ajouter un pourboire pour {booking?.providerName || 'le pro'} ?</p>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[0, 10, 20, 50].map((amount) => (
                                            <button
                                                key={amount}
                                                onClick={() => setTipAmount(amount)}
                                                className={`py-2 rounded-lg text-sm font-bold transition-all border ${
                                                    tipAmount === amount
                                                        ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                                                        : 'bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:bg-green-50'
                                                }`}
                                            >
                                                {amount === 0 ? 'Non' : `₪${amount}`}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                             <div className="mt-4 pt-3 border-t border-gray-200 border-dashed flex justify-between items-center">
                                <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    Paiement sécurisé
                                </span>
                                <div className="flex gap-1">
                                    <div className="w-6 h-4 bg-gray-200 rounded sm:w-8 sm:h-5"></div>
                                    <div className="w-6 h-4 bg-gray-200 rounded sm:w-8 sm:h-5"></div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full space-y-3">
                            <button 
                                onClick={() => {
                                    setShowInvoice(false);
                                    setShowReceipt(true); // Oouvre le reçu au lieu de quitter
                                }}
                                className={`w-full py-4 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${status === 'cancelled' ? 'bg-red-600 hover:bg-red-700' : 'bg-black hover:bg-gray-800'}`}
                            >
                                <CreditCard className="w-4 h-4" />
                                {status === 'cancelled' ? `Payer ₪${totalCost}` : `Payer ₪${totalCost + tipAmount}`}
                            </button>
                            <button 
                                onClick={() => {
                                    setShowInvoice(false);
                                    setShowSupportChat(true);
                                }}
                                className="w-full py-3 text-gray-500 font-medium text-sm hover:text-gray-800 transition-colors"
                            >
                                Signaler un problème
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* RECEIPT / SUCCESS MODAL */}
      <AnimatePresence>
        {showReceipt && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            >
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white w-full max-w-sm rounded-3xl p-8 text-center relative overflow-hidden"
                >
                    {/* Confetti effect background (CSS only simulation) */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                        <div className="absolute top-[-10%] left-[20%] w-2 h-2 bg-red-500 rounded-full animate-ping" style={{animationDuration: '1s'}}></div>
                        <div className="absolute top-[10%] right-[20%] w-3 h-3 bg-blue-500 rounded-full animate-ping" style={{animationDuration: '1.5s'}}></div>
                        <div className="absolute bottom-[20%] left-[10%] w-2 h-2 bg-yellow-500 rounded-full animate-ping" style={{animationDuration: '1.2s'}}></div>
                    </div>

                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-50">
                        <Check className="w-12 h-12 text-green-600 stroke-[3]" />
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 mb-2">Paiement Réussi !</h2>
                    <p className="text-gray-500 mb-8">Votre commande est officiellement clôturée.</p>

                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-8 text-sm">
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-500">Montant payé</span>
                            <span className="font-bold text-gray-900">₪{totalCost + tipAmount}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-500">Date</span>
                            <span className="font-bold text-gray-900">{new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Moyen</span>
                            <span className="font-bold text-gray-900 flex items-center gap-1">
                                •••• 4242 <CreditCard className="w-3 h-3" />
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button 
                            onClick={() => {
                                // Simulation téléchargement
                                const link = document.createElement('a');
                                link.href = '#';
                                link.download = 'recu_beed_ai.pdf';
                                // En vrai on appellerait une API ici
                                alert("Téléchargement du reçu lancé...");
                            }}
                            className="w-full py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-300 transition-all"
                        >
                            <FileText className="w-5 h-5" />
                            Télécharger le reçu
                        </button>

                        <button 
                            onClick={() => {
                                setShowReceipt(false);
                                if (onComplete) onComplete();
                            }}
                            className="w-full py-3.5 bg-black text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 transition-all"
                        >
                            Retour à l'accueil
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* RATING MODAL (Keep as is) */}
      {/* ... */}

      {/* SIMULATOR TOOLBAR */}
      <div className="bg-gray-900 p-3 flex gap-3 justify-center overflow-x-auto z-40 pb-8">
        <span className="text-[10px] text-gray-500 font-mono self-center uppercase tracking-wider">Simulateur</span>
        {status === 'waiting_start' && (
            <>
                <button onClick={simulateProStart} className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-500">
                    ▶ Start Job
                </button>
            </>
        )}
        {status === 'in_progress' && (
            <>
                <button onClick={simulateProUpsell} className="px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-500">
                    + Upsell
                </button>
                 <button onClick={simulateProUploadAfterPhotos} className="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-500">
                    + Photos Fin
                </button>
                <button onClick={simulateProFinish} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500">
                    ✓ Terminer
                </button>
            </>
        )}
         {status === 'completed' && (
            <span className="text-xs text-green-400 font-bold self-center px-3 border border-green-900 rounded bg-green-900/20">Mission Terminée</span>
         )}
         {status === 'cancelled' && (
            <span className="text-xs text-red-400 font-bold self-center px-3 border border-red-900 rounded bg-red-900/20">Annulé</span>
         )}
      </div>

    </div>
  );
}