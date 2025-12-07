import { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Clock, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle, 
  Camera, 
  FileText, 
  MoreHorizontal, 
  Phone, 
  User, 
  Navigation,
  Shield,
  CreditCard,
  ChevronRight,
  Filter,
  Search,
  ArrowUpRight,
  ArrowLeft
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { BeadyLogo } from '../ui/BeadyLogo';

// --- TYPES SIMULANT LE SCHÉMA DE DONNÉES "ORDER-CENTRIC" ---

type Actor = {
  id: string;
  name: string;
  role: 'client' | 'provider' | 'admin';
  avatar?: string;
  phone?: string;
  rating?: number;
};

type TimelineItem = {
  id: string;
  type: 'message' | 'event' | 'media';
  timestamp: Date;
  // Pour les messages
  sender?: Actor;
  content?: string;
  // Pour les events
  event_code?: 'status_change' | 'gps_alert' | 'system_log';
  description?: string;
  metadata?: any;
  // Pour les media
  media_url?: string;
  media_stage?: 'before' | 'after';
};

type Mission = {
  id: string;
  status: 'pending' | 'en_route' | 'in_progress' | 'completed' | 'cancelled' | 'dispute';
  client: Actor;
  provider?: Actor;
  address: string;
  created_at: Date;
  total_amount: number;
  timeline: TimelineItem[];
};

// --- DONNÉES MOCKÉES ---
const MOCK_CLIENT: Actor = { id: 'c1', name: 'David Ben', role: 'client', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', phone: '054-555-1234' };
const MOCK_PROVIDER: Actor = { id: 'p1', name: 'Yossi Cohen', role: 'provider', avatar: 'https://images.unsplash.com/photo-1581578017093-cd30fba4e9d5?w=100', rating: 4.9, phone: '052-999-8888' };
const MOCK_ADMIN: Actor = { id: 'a1', name: 'Support Beedy', role: 'admin' };

const MOCK_MISSION: Mission = {
  id: '8821-XC90',
  status: 'in_progress',
  client: MOCK_CLIENT,
  provider: MOCK_PROVIDER,
  address: 'Rehov HaYarkon 12, Tel Aviv',
  created_at: new Date(Date.now() - 1000 * 60 * 60), // Il y a 1h
  total_amount: 350,
  timeline: [
    { id: 'e1', type: 'event', event_code: 'status_change', description: 'Commande créée', timestamp: new Date(Date.now() - 3600000) },
    { id: 'm1', type: 'message', sender: MOCK_CLIENT, content: 'Bonjour, c\'est urgent, fuite d\'eau !', timestamp: new Date(Date.now() - 3500000) },
    { id: 'e2', type: 'event', event_code: 'status_change', description: 'Yossi Cohen a accepté la mission', timestamp: new Date(Date.now() - 3400000) },
    { id: 'm2', type: 'message', sender: MOCK_PROVIDER, content: 'J\'arrive dans 20 minutes.', timestamp: new Date(Date.now() - 3300000) },
    { id: 'e3', type: 'event', event_code: 'gps_alert', description: 'Prestataire en route (5km)', timestamp: new Date(Date.now() - 3300000) },
    { id: 'img1', type: 'media', media_stage: 'before', media_url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400', timestamp: new Date(Date.now() - 1800000) },
    { id: 'e4', type: 'event', event_code: 'status_change', description: 'Intervention commencée', timestamp: new Date(Date.now() - 1800000) },
    { id: 'm3', type: 'message', sender: MOCK_CLIENT, content: 'Le code d\'entrée est 1234', timestamp: new Date(Date.now() - 1700000) },
  ]
};

interface MissionControlProps {
  onBack?: () => void;
  onNavigate?: (view: string) => void;
}

export function MissionControl({ onBack, onNavigate }: MissionControlProps) {
  const [activeMission, setActiveMission] = useState<Mission>(MOCK_MISSION);
  const [newMessage, setNewMessage] = useState('');
  
  // Pour l'auto-scroll de la timeline
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.scrollTop = timelineRef.current.scrollHeight;
    }
  }, [activeMission.timeline]);

  // Fonction pour simuler l'envoi d'un message Admin ("Ghost Mode")
  const handleSendAdminMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg: TimelineItem = {
      id: Date.now().toString(),
      type: 'message',
      sender: MOCK_ADMIN,
      content: newMessage,
      timestamp: new Date()
    };

    setActiveMission(prev => ({
      ...prev,
      timeline: [...prev.timeline, msg]
    }));
    setNewMessage('');
  };

  // Rendu d'un item de timeline selon son type (Polymorphisme visuel)
  const renderTimelineItem = (item: TimelineItem) => {
    if (item.type === 'event') {
      return (
        <div key={item.id} className="flex gap-3 py-2 opacity-75 hover:opacity-100 transition-opacity">
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full bg-gray-300 mt-2" />
            <div className="w-0.5 flex-1 bg-gray-100 my-1" />
          </div>
          <div className="pb-4">
            <p className="text-xs text-gray-500 font-mono">{item.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            <p className="text-sm text-gray-600 font-medium flex items-center gap-1">
               {item.event_code === 'gps_alert' && <Navigation className="w-3 h-3 text-blue-500" />}
               {item.event_code === 'status_change' && <Clock className="w-3 h-3 text-amber-500" />}
               {item.description}
            </p>
          </div>
        </div>
      );
    }

    if (item.type === 'media') {
       return (
        <div key={item.id} className="flex gap-3 py-2">
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center border-2 border-white shadow-sm z-10">
                <Camera className="w-3 h-3" />
            </div>
            <div className="w-0.5 flex-1 bg-gray-100 -mt-1" />
          </div>
          <div className="pb-4 w-full">
            <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Preuve {item.media_stage === 'before' ? 'Avant' : 'Après'}</span>
                <span className="text-xs text-gray-400">{item.timestamp.toLocaleTimeString()}</span>
            </div>
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm max-w-[200px] group cursor-pointer relative">
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                <ImageWithFallback src={item.media_url || ''} className="w-full h-32 object-cover" />
            </div>
          </div>
        </div>
       );
    }

    // Message Chat
    const isMe = item.sender?.role === 'admin';
    const isSystem = false; 

    return (
      <div key={item.id} className={`flex gap-3 py-2 ${isMe ? 'flex-row-reverse' : ''}`}>
         <ImageWithFallback 
            src={item.sender?.avatar || 'https://ui-avatars.com/api/?name=Admin'} 
            className={`w-8 h-8 rounded-full object-cover border border-gray-100 shadow-sm ${isMe ? 'ring-2 ring-blue-100' : ''}`} 
         />
         <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
            <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                isMe 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : item.sender?.role === 'provider' 
                    ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-none' 
                    : 'bg-gray-100 text-gray-800 rounded-tl-none'
            }`}>
                {item.content}
            </div>
            <span className="text-[10px] text-gray-400 mt-1 px-1">
                {item.sender?.name} • {item.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
         </div>
      </div>
    );
  };

  return (
    <div className="h-screen w-full bg-gray-50 flex overflow-hidden font-sans text-left" dir="ltr">
      
      {/* 1. LEFT SIDEBAR: MISSION LIST (Simplifié) */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col z-20">
        <div className="p-5 border-b border-gray-100">
            <button 
              onClick={onBack}
              className="mb-4 flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
            <div className="flex items-center gap-3 mb-4">
                <BeadyLogo size="md" />
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">Control</span>
            </div>
            <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Rechercher mission #ID..." 
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                />
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">En cours (3)</div>
            {/* Carte Mission Active */}
            <div className="mx-3 p-3 bg-blue-50 border border-blue-100 rounded-xl cursor-pointer relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                <div className="flex justify-between items-start mb-2">
                    <span className="font-mono font-bold text-blue-900">#8821</span>
                    <span className="bg-white/50 px-1.5 py-0.5 rounded text-[10px] font-bold text-blue-700 border border-blue-100">En cours</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Plomberie - Fuite</h3>
                <p className="text-xs text-gray-500 truncate">Rehov HaYarkon 12, Tel Aviv</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    <div className="flex -space-x-2">
                        <img src={MOCK_CLIENT.avatar} className="w-5 h-5 rounded-full border border-white" />
                        <img src={MOCK_PROVIDER.avatar} className="w-5 h-5 rounded-full border border-white" />
                    </div>
                    <span>David & Yossi</span>
                </div>
            </div>

            {/* Autres missions (mock) */}
            <div className="mx-3 mt-2 p-3 hover:bg-gray-50 border border-transparent hover:border-gray-100 rounded-xl cursor-pointer transition-all opacity-60 hover:opacity-100">
                <div className="flex justify-between items-start mb-2">
                    <span className="font-mono font-bold text-gray-500">#8820</span>
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-500">Terminé</span>
                </div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Ménage - 3h</h3>
                <p className="text-xs text-gray-400 truncate">Rothschild 45, Tel Aviv</p>
            </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT: MAP & KPI */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50">
        {/* Header KPI */}
        <div className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
            <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    Mission #8821
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </h2>
                <div className="h-6 w-px bg-gray-200" />
                <div className="flex gap-4 text-sm">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 uppercase font-bold">Montant</span>
                        <span className="font-mono font-bold text-gray-900">₪{activeMission.total_amount}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 uppercase font-bold">Durée</span>
                        <span className="font-mono font-medium text-gray-700">01:12:45</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                    Détails Financiers
                </button>
                <button className="px-3 py-1.5 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors">
                    Annuler Mission
                </button>
            </div>
        </div>

        {/* Map Area (Placeholder styled) */}
        <div className="flex-1 relative bg-slate-100 overflow-hidden">
            {/* Map Background Simulation */}
            <div className="absolute inset-0 opacity-30" 
                style={{
                    backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
                    backgroundSize: '20px 20px'
                }} 
            />
            
            {/* Pins on Map */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                    <div className="absolute -inset-8 bg-blue-500/10 rounded-full animate-ping" />
                    <div className="w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-white relative z-10">
                        <img src={MOCK_PROVIDER.avatar} className="w-full h-full rounded-full object-cover" />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white border-2 border-white">
                            <Navigation className="w-2.5 h-2.5" />
                        </div>
                    </div>
                    <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">
                        Yossi (Pro)
                    </div>
                </div>
            </div>

            <div className="absolute top-1/3 left-1/3">
                <div className="w-8 h-8 bg-red-50 text-red-500 rounded-full shadow-lg flex items-center justify-center border-2 border-white">
                    <MapPin className="w-4 h-4 fill-current" />
                </div>
            </div>

            {/* Floating Status Card */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 max-w-xs">
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Statut Temps Réel</h4>
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-50 rounded-lg text-green-600">
                        <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900">Intervention en cours</p>
                        <p className="text-xs text-gray-500 leading-snug mt-0.5">Le prestataire est sur place depuis 45 minutes.</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Bottom Media Strip */}
        <div className="h-48 bg-white border-t border-gray-200 p-4 overflow-x-auto flex gap-4">
            <div className="w-64 shrink-0 flex flex-col justify-center items-center border-2 border-dashed border-gray-200 rounded-xl text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                <Camera className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-xs font-bold">Demander photo</span>
            </div>
            {MOCK_MISSION.timeline.filter(t => t.type === 'media').map(media => (
                <div key={media.id} className="w-48 shrink-0 relative group rounded-xl overflow-hidden shadow-sm border border-gray-100">
                     <ImageWithFallback src={media.media_url || ''} className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                        <span className="text-white text-xs font-bold">{media.media_stage === 'before' ? 'AVANT' : 'APRÈS'}</span>
                        <span className="text-white/80 text-[10px]">{media.timestamp.toLocaleTimeString()}</span>
                     </div>
                </div>
            ))}
        </div>
      </div>

      {/* 3. RIGHT SIDEBAR: UNIFIED TIMELINE */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col z-20 shadow-xl">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Timeline Unifiée
            </h3>
            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Live</span>
        </div>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50" ref={timelineRef}>
            {activeMission.timeline.map(renderTimelineItem)}
        </div>

        {/* Admin Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-2 mb-3 flex gap-2 items-start">
                <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-800 leading-tight">
                    <span className="font-bold">Mode Admin (Ghost) :</span> Vos messages seront visibles par les deux parties comme "Support".
                </p>
            </div>
            <form onSubmit={handleSendAdminMessage} className="flex gap-2">
                <input 
                    type="text" 
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Écrire au client & prestataire..."
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
                />
                <button 
                    type="submit" 
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                >
                    <ArrowUpRight className="w-5 h-5" />
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}