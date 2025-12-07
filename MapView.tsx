import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { User, Search, SlidersHorizontal, Locate, Star, CheckCircle, Briefcase, MapPin, ArrowRight } from './ui/icons';
import { BeadyLogo } from './ui/BeadyLogo';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { AddressAutocomplete } from './AddressAutocomplete';
import { useAvailableSlots, getMinDate, formatScheduledDateTime } from '../hooks/useAvailableSlots';
import { useCategories } from '../hooks/useCategories';
import { CategorySelector } from './CategorySelector';
import { useUserLocation } from '../context/LocationProvider';
import { useBooking } from '../context/BookingContext';
import { JobDetailsCard } from './JobDetailsCard';

// --- CONFIGURATION ---
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';

const SEARCH_RADIUS_KM = 10; // Radius in km to search for providers

// Haversine distance calculation (returns distance in km)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Get providers near a location, sorted by distance
const getProvidersNear = (
  providers: typeof validatedProviders,
  lat: number, 
  lng: number, 
  radiusKm: number = SEARCH_RADIUS_KM,
  serviceFilter?: string | null
) => {
  return providers
    .map(provider => ({
      ...provider,
      distance: calculateDistance(lat, lng, provider.lat, provider.lng)
    }))
    .filter(provider => provider.distance <= radiusKm)
    .filter(provider => !serviceFilter || provider.service === serviceFilter)
    .sort((a, b) => a.distance - b.distance);
};


const validatedProviders = [
  // --- TEL AVIV ---
  {
    id: 'PRO_101',
    name: 'יוסי אברהם',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
    rating: 4.9,
    reviews: 234,
    service: 'אינסטלציה',
    hourlyRate: 380,
    verified: true,
    lat: 32.0853,
    lng: 34.7818,
    distance: 0,
  },
  {
    id: 'PRO_102',
    name: 'שרה כהן',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    rating: 4.9,
    reviews: 127,
    service: 'ניקיון',
    hourlyRate: 180,
    verified: true,
    lat: 32.0873,
    lng: 34.7838,
    distance: 0.8,
  },
  {
    id: 'PRO_103',
    name: 'מיכאל לוי',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    rating: 4.8,
    reviews: 93,
    service: 'אינסטלציה',
    hourlyRate: 350,
    verified: true,
    lat: 32.0833,
    lng: 34.7798,
    distance: 1.2,
  },
  {
    id: 'PRO_104',
    name: 'רונית שמש',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    rating: 5.0,
    reviews: 156,
    service: 'ניקיון',
    hourlyRate: 200,
    verified: true,
    lat: 32.0893,
    lng: 34.7858,
    distance: 2.1,
  },
  {
    id: 'PRO_105',
    name: 'אבי גולן',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    rating: 4.7,
    reviews: 89,
    service: 'חשמל',
    hourlyRate: 400,
    verified: true,
    lat: 32.0803,
    lng: 34.7758,
    distance: 1.5,
  },
  {
    id: 'PRO_106',
    name: 'מיכל ברק',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
    rating: 4.9,
    reviews: 203,
    service: 'יופי',
    hourlyRate: 250,
    verified: true,
    lat: 32.0843,
    lng: 34.7888,
    distance: 0.5,
  },
  {
    id: 'PRO_107',
    name: 'משה דביר',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    rating: 4.6,
    reviews: 78,
    service: 'שיפוצים',
    hourlyRate: 300,
    verified: true,
    lat: 32.0863,
    lng: 34.7768,
    distance: 1.8,
  },
  {
    id: 'PRO_108',
    name: 'דנה לביא',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
    rating: 5.0,
    reviews: 145,
    service: 'גינון',
    hourlyRate: 220,
    verified: true,
    lat: 32.0813,
    lng: 34.7828,
    distance: 2.3,
  },
  // --- HERZLIYA ---
  {
    id: 'PRO_109',
    name: 'עומר חזן',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
    rating: 4.8,
    reviews: 167,
    service: 'חשמל',
    hourlyRate: 420,
    verified: true,
    lat: 32.1656,
    lng: 34.8467,
    distance: 0,
  },
  {
    id: 'PRO_110',
    name: 'נועה פרידמן',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
    rating: 4.9,
    reviews: 198,
    service: 'יופי',
    hourlyRate: 280,
    verified: true,
    lat: 32.1620,
    lng: 34.8440,
    distance: 0,
  },
  {
    id: 'PRO_111',
    name: 'איתי רוזן',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
    rating: 4.7,
    reviews: 112,
    service: 'אינסטלציה',
    hourlyRate: 360,
    verified: true,
    lat: 32.1590,
    lng: 34.8510,
    distance: 0,
  },
  {
    id: 'PRO_112',
    name: 'ליאת כהן',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
    rating: 5.0,
    reviews: 234,
    service: 'ניקיון',
    hourlyRate: 190,
    verified: true,
    lat: 32.1680,
    lng: 34.8390,
    distance: 0,
  },
  // --- RAMAT GAN ---
  {
    id: 'PRO_113',
    name: 'יוני שטרן',
    image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop',
    rating: 4.6,
    reviews: 87,
    service: 'שיפוצים',
    hourlyRate: 320,
    verified: true,
    lat: 32.0680,
    lng: 34.8240,
    distance: 0,
  },
  {
    id: 'PRO_114',
    name: 'שירה בן דוד',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop',
    rating: 4.9,
    reviews: 156,
    service: 'גינון',
    hourlyRate: 240,
    verified: true,
    lat: 32.0720,
    lng: 34.8180,
    distance: 0,
  },
  {
    id: 'PRO_115',
    name: 'אורי מזרחי',
    image: 'https://images.unsplash.com/photo-1599566150163-29194dcabd3c?w=400&h=400&fit=crop',
    rating: 4.8,
    reviews: 143,
    service: 'חשמל',
    hourlyRate: 390,
    verified: true,
    lat: 32.0650,
    lng: 34.8300,
    distance: 0,
  },
  // --- RISHON LEZION ---
  {
    id: 'PRO_116',
    name: 'תמר גבאי',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop',
    rating: 4.7,
    reviews: 98,
    service: 'ניקיון',
    hourlyRate: 170,
    verified: true,
    lat: 31.9730,
    lng: 34.7925,
    distance: 0,
  },
  {
    id: 'PRO_117',
    name: 'גיא נחום',
    image: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=400&fit=crop',
    rating: 4.9,
    reviews: 211,
    service: 'אינסטלציה',
    hourlyRate: 340,
    verified: true,
    lat: 31.9680,
    lng: 34.8010,
    distance: 0,
  },
  // --- PETAH TIKVA ---
  {
    id: 'PRO_118',
    name: 'רותם אלוני',
    image: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=400&h=400&fit=crop',
    rating: 4.8,
    reviews: 134,
    service: 'יופי',
    hourlyRate: 260,
    verified: true,
    lat: 32.0868,
    lng: 34.8870,
    distance: 0,
  },
  {
    id: 'PRO_119',
    name: 'עידן סגל',
    image: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=400&h=400&fit=crop',
    rating: 4.5,
    reviews: 67,
    service: 'שיפוצים',
    hourlyRate: 290,
    verified: true,
    lat: 32.0920,
    lng: 34.8820,
    distance: 0,
  },
  // --- NETANYA ---
  {
    id: 'PRO_120',
    name: 'מאיה רביב',
    image: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&h=400&fit=crop',
    rating: 5.0,
    reviews: 189,
    service: 'ניקיון',
    hourlyRate: 175,
    verified: true,
    lat: 32.3215,
    lng: 34.8532,
    distance: 0,
  },
  {
    id: 'PRO_121',
    name: 'אלעד כץ',
    image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop',
    rating: 4.7,
    reviews: 102,
    service: 'גינון',
    hourlyRate: 230,
    verified: true,
    lat: 32.3280,
    lng: 34.8590,
    distance: 0,
  },
  // --- JERUSALEM ---
  {
    id: 'PRO_122',
    name: 'יהודית ברנס',
    image: 'https://images.unsplash.com/photo-1558898479-33c0057a5d12?w=400&h=400&fit=crop',
    rating: 4.9,
    reviews: 276,
    service: 'ניקיון',
    hourlyRate: 185,
    verified: true,
    lat: 31.7683,
    lng: 35.2137,
    distance: 0,
  },
  {
    id: 'PRO_123',
    name: 'שמעון חורי',
    image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&h=400&fit=crop',
    rating: 4.8,
    reviews: 198,
    service: 'חשמל',
    hourlyRate: 410,
    verified: true,
    lat: 31.7720,
    lng: 35.2050,
    distance: 0,
  },
  // --- HAIFA ---
  {
    id: 'PRO_124',
    name: 'ענבל שוהם',
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop',
    rating: 4.8,
    reviews: 156,
    service: 'יופי',
    hourlyRate: 240,
    verified: true,
    lat: 32.7940,
    lng: 34.9896,
    distance: 0,
  },
  {
    id: 'PRO_125',
    name: 'נתן בר',
    image: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=400&fit=crop',
    rating: 4.6,
    reviews: 89,
    service: 'אינסטלציה',
    hourlyRate: 330,
    verified: true,
    lat: 32.8000,
    lng: 34.9850,
    distance: 0,
  },
  // --- BEER SHEVA ---
  {
    id: 'PRO_126',
    name: 'הילה אוחיון',
    image: 'https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=400&h=400&fit=crop',
    rating: 4.9,
    reviews: 132,
    service: 'ניקיון',
    hourlyRate: 160,
    verified: true,
    lat: 31.2518,
    lng: 34.7913,
    distance: 0,
  },
  {
    id: 'PRO_127',
    name: 'רון דהן',
    image: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=400&fit=crop',
    rating: 4.7,
    reviews: 78,
    service: 'שיפוצים',
    hourlyRate: 270,
    verified: true,
    lat: 31.2580,
    lng: 34.7850,
    distance: 0,
  },
  // --- ASHDOD ---
  {
    id: 'PRO_128',
    name: 'לירון אזולאי',
    image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop',
    rating: 4.8,
    reviews: 145,
    service: 'גינון',
    hourlyRate: 210,
    verified: true,
    lat: 31.8040,
    lng: 34.6553,
    distance: 0,
  },
  {
    id: 'PRO_129',
    name: 'עמית פרץ',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    rating: 4.6,
    reviews: 93,
    service: 'חשמל',
    hourlyRate: 370,
    verified: true,
    lat: 31.8100,
    lng: 34.6500,
    distance: 0,
  },
  // --- KFAR SABA ---
  {
    id: 'PRO_130',
    name: 'עדי שלום',
    image: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&h=400&fit=crop',
    rating: 5.0,
    reviews: 167,
    service: 'יופי',
    hourlyRate: 270,
    verified: true,
    lat: 32.1780,
    lng: 34.9070,
    distance: 0,
  },
  {
    id: 'PRO_131',
    name: 'נדב גרינברג',
    image: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=400&h=400&fit=crop',
    rating: 4.7,
    reviews: 112,
    service: 'אינסטלציה',
    hourlyRate: 355,
    verified: true,
    lat: 32.1720,
    lng: 34.9120,
    distance: 0,
  },
];

const getServiceIcon = (service: string) => {
  const icons: { [key: string]: string } = {
    'ניקיון': '🧹',
    'אינסטלציה': '🔧',
    'חשמל': '💡',
    'יופי': '💅',
    'שיפוצים': '🔨',
    'גינון': '🌱',
  };
  return icons[service] || '🔧';
};

type MapViewProps = {
  onServiceSelect: (category: string) => void;
  onProfileClick: () => void;
  onProAccessClick: () => void;
  onBackToLanding: () => void;
  onBookingContinue: (details: { category: string; address: string; details: string; time: 'now' | 'scheduled'; scheduledDate?: string; scheduledTime?: string; lat?: number; lng?: number }) => void;
  initialAddress?: { address: string; lat: number; lng: number } | null;
  initialService?: string | null;
};

export function MapView({ onServiceSelect, onProfileClick, onProAccessClick, onBackToLanding, onBookingContinue, initialAddress, initialService }: MapViewProps) {
  // --- CONTEXT ---
  const { setUserLocation } = useUserLocation();
  const { bookingData, setCategory, setAddress: setCtxAddress, setAdditionalDetails: setCtxAdditionalDetails, setBookingType: setCtxBookingType, setScheduledDateTime } = useBooking();
  
  // --- STATE (initialized from BookingContext if available) ---
  const [userAddress, setUserAddress] = useState(
    bookingData.address || initialAddress?.address || ''
  );
  const [isAddressValidated, setIsAddressValidated] = useState(
    !!bookingData.address || !!initialAddress
  );
  const [isAutoDetected, setIsAutoDetected] = useState(bookingData.isAutoDetected || false);
  const [additionalDetails, setLocalAdditionalDetails] = useState(bookingData.additionalDetails || '');
  const [bookingType, setLocalBookingType] = useState<'now' | 'scheduled'>(bookingData.bookingType || 'now');
  const [scheduledDate, setLocalScheduledDate] = useState(bookingData.scheduledDate || '');
  const [scheduledTime, setLocalScheduledTime] = useState(bookingData.scheduledTime || '');
  const [isLocating, setIsLocating] = useState(false);
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  
  // Categories from centralized hook
  const { categories, isLoading: categoriesLoading } = useCategories();
  
  const { slots: timeSlots, isSlotValid, firstAvailable } = useAvailableSlots(scheduledDate);
  
  useEffect(() => {
    if (scheduledTime && !isSlotValid(scheduledTime)) {
      setLocalScheduledTime(firstAvailable || '');
    }
  }, [scheduledDate, scheduledTime, isSlotValid, firstAvailable]);
  
  // Use category from BookingContext if available, otherwise fall back to initialService
  const [selectedService, setSelectedService] = useState<string | null>(
    bookingData.selectedCategory || initialService || null
  );
  
  // Provider state with location-based filtering
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(
    bookingData.coordinates || (initialAddress ? { lat: initialAddress.lat, lng: initialAddress.lng } : null)
  );
  // Compute initial providers based on BookingContext data (location + category)
  const [nearbyProviders, setNearbyProviders] = useState<typeof validatedProviders>(() => {
    // Priority: 1. BookingContext coords + category, 2. initialAddress + initialService, 3. All providers
    const coords = bookingData.coordinates || (initialAddress ? { lat: initialAddress.lat, lng: initialAddress.lng } : null);
    const serviceFilter = bookingData.selectedCategory || initialService || null;
    
    if (coords) {
      return getProvidersNear(validatedProviders, coords.lat, coords.lng, SEARCH_RADIUS_KM, serviceFilter);
    }
    // If no location, filter by category only
    if (serviceFilter) {
      return validatedProviders.filter(p => p.service === serviceFilter);
    }
    return validatedProviders;
  });

  // Flag to check if location is validated
  // If user entered address on landing page (bookingData.address exists), don't show overlay
  // Also accept coordinates from context, local state, or initial props
  const hasValidLocation = !!(
    bookingData.coordinates || 
    bookingData.address || // User already entered address on landing page
    selectedCoords || 
    (initialAddress && initialAddress.lat && initialAddress.lng) ||
    isAddressValidated
  );

  const handleAddressChange = (value: string) => {
    setUserAddress(value);
    setIsAddressValidated(false);
  };

  const handleAddressSelect = (data: { address: string; lat: number; lng: number }) => {
    setUserAddress(data.address);
    setIsAddressValidated(true);
    setIsAutoDetected(false);
    setSelectedCoords({ lat: data.lat, lng: data.lng });
    
    setUserLocation({
      address: data.address,
      coords: { lat: data.lat, lng: data.lng },
      details: additionalDetails,
      type: 'manual'
    });
    
    setCtxAddress(data.address, { lat: data.lat, lng: data.lng }, false);
    
    // Update nearby providers based on new location
    const updatedProviders = getProvidersNear(validatedProviders, data.lat, data.lng, SEARCH_RADIUS_KM, selectedService);
    setNearbyProviders(updatedProviders);
    console.log(`[MapView] Updated providers for location: ${data.address}`, updatedProviders.length, 'providers found');
    
    // Center map on selected address (only if map is loaded)
    if (mapRef.current && isMapLoaded) {
      mapRef.current.flyTo({ 
        center: [data.lng, data.lat], 
        zoom: 15,
        duration: 1500
      });
      
      // Add/update marker for selected location
      if (selectedLocationMarkerRef.current) {
        selectedLocationMarkerRef.current.setLngLat([data.lng, data.lat]);
      } else {
        const el = document.createElement('div');
        el.className = 'selected-location-marker';
        el.innerHTML = `
          <div class="w-8 h-8 bg-blue-600 rounded-full border-3 border-white shadow-xl flex items-center justify-center animate-bounce">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
        `;
        
        selectedLocationMarkerRef.current = new mapboxgl.Marker({ element: el })
          .setLngLat([data.lng, data.lat])
          .addTo(mapRef.current);
      }
    }
  };
  
  // Map State
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const selectedLocationMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<typeof validatedProviders[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // --- INITIALIZE MAP ---
  useEffect(() => {
    // Set Token
    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Initialize Map
    if (mapContainerRef.current && !mapRef.current) {
        try {
            // Support RTL Text
            if (mapboxgl.getRTLTextPluginStatus() === 'unavailable') {
                mapboxgl.setRTLTextPlugin(
                    'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js',
                    (error) => { if (error) console.error(error); },
                    true // Lazy load
                );
            }

            // Priority: 1. BookingContext coordinates, 2. initialAddress prop, 3. Default Tel Aviv
            const initialCenter: [number, number] = bookingData.coordinates
                ? [bookingData.coordinates.lng, bookingData.coordinates.lat]
                : initialAddress 
                    ? [initialAddress.lng, initialAddress.lat] 
                    : [34.7818, 32.0853]; // Default: Tel Aviv
            
            mapRef.current = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: 'mapbox://styles/mapbox/streets-v12',
                center: initialCenter,
                zoom: 15,
                attributionControl: false
            });

            // Wait for map to be fully loaded before adding markers
            mapRef.current.on('load', () => {
                setIsMapLoaded(true);
                console.log('[MapView] Map fully loaded and ready');
                
                // Add marker for user's location AFTER map is loaded (from BookingContext or initialAddress)
                const markerCoords = bookingData.coordinates || (initialAddress ? { lat: initialAddress.lat, lng: initialAddress.lng } : null);
                if (markerCoords && mapRef.current) {
                    const el = document.createElement('div');
                    el.className = 'selected-location-marker';
                    el.innerHTML = `
                        <div class="w-8 h-8 bg-blue-600 rounded-full border-3 border-white shadow-xl flex items-center justify-center">
                            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                        </div>
                    `;
                    
                    selectedLocationMarkerRef.current = new mapboxgl.Marker({ element: el })
                        .setLngLat([markerCoords.lng, markerCoords.lat])
                        .addTo(mapRef.current);
                }
            });

            mapRef.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-left');

            // Clean up
            return () => {
                if (selectedLocationMarkerRef.current) {
                    selectedLocationMarkerRef.current.remove();
                    selectedLocationMarkerRef.current = null;
                }
                if (userMarkerRef.current) {
                    userMarkerRef.current.remove();
                    userMarkerRef.current = null;
                }
                mapRef.current?.remove();
                mapRef.current = null;
                setIsMapLoaded(false);
            };
        } catch (e) {
            console.error("Error initializing Mapbox:", e);
        }
    }
  }, []);

  // --- USER LOCATION TRACKING ---
  useEffect(() => {
    // Only start watching when map is fully loaded
    if (!mapRef.current || !isMapLoaded) return;

    // Don't auto-track if user already selected an address from LandingPage
    if (bookingData.address || bookingData.coordinates) {
      console.log('[MapView] Skipping auto GPS tracking - address already selected from LandingPage');
      return;
    }

    // Watch position
    let watchId: number;

    const updateLocation = (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;
        
        // Map is guaranteed to be loaded at this point
        if (mapRef.current) {
            // Create or Update User Marker
            if (!userMarkerRef.current) {
                const el = document.createElement('div');
                el.className = 'user-location-marker';
                el.innerHTML = `
                    <div class="w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-lg relative z-10"></div>
                    <div class="absolute top-0 left-0 w-6 h-6 bg-blue-500 rounded-full animate-ping opacity-75"></div>
                `;
                
                userMarkerRef.current = new mapboxgl.Marker({ element: el })
                    .setLngLat([longitude, latitude])
                    .addTo(mapRef.current);
                
                // Fly to location on first update
                mapRef.current.flyTo({ center: [longitude, latitude], zoom: 15 });
                
                // Update address text (Simulated for now as reverse geocoding requires API call)
                // In a real app, we would call Mapbox Geocoding API here
                setUserAddress('המיקום הנוכחי שלך');
            } else {
                userMarkerRef.current.setLngLat([longitude, latitude]);
            }
        }
    };

    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
            updateLocation,
            (error) => {
                console.log("Geolocation warning (non-critical):", error.message);
                // Fallback to Tel Aviv if geolocation fails
                if (mapRef.current && !userMarkerRef.current) {
                   const fallbackLat = 32.0853;
                   const fallbackLng = 34.7818;
                   
                   const el = document.createElement('div');
                   el.className = 'user-location-marker';
                   el.innerHTML = `
                       <div class="w-6 h-6 bg-gray-400 rounded-full border-2 border-white shadow-lg relative z-10"></div>
                   `;
                   
                   userMarkerRef.current = new mapboxgl.Marker({ element: el })
                       .setLngLat([fallbackLng, fallbackLat])
                       .addTo(mapRef.current);
                       
                   mapRef.current.flyTo({ center: [fallbackLng, fallbackLat], zoom: 14 });
                   setUserAddress('תל אביב (מיקום משוער)');
                }
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
        );
    }

    return () => {
        if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [mapRef.current, isMapLoaded]);

  // --- SYNC WITH BOOKING CONTEXT (for session restoration and navigation) ---
  useEffect(() => {
    // Always sync isAutoDetected independently of address changes
    setIsAutoDetected(bookingData.isAutoDetected || false);
    
    // Exit early if map not ready (will retry when isMapLoaded becomes true)
    if (!mapRef.current || !isMapLoaded) {
      return;
    }
    
    // Case 1: BookingContext has coordinates - sync map position and providers
    if (bookingData.coordinates) {
      const { lat, lng } = bookingData.coordinates;
      
      // Update local state
      setSelectedCoords({ lat, lng });
      
      // Fly to the saved location (only after map is fully loaded)
      mapRef.current.flyTo({ 
        center: [lng, lat], 
        zoom: 15,
        duration: 1500
      });
      
      // Add or update marker for selected location
      if (selectedLocationMarkerRef.current) {
        // Update existing marker position
        selectedLocationMarkerRef.current.setLngLat([lng, lat]);
      } else {
        // Create new marker (only if not already created in init)
        const el = document.createElement('div');
        el.className = 'selected-location-marker';
        el.innerHTML = `
          <div class="w-8 h-8 bg-blue-600 rounded-full border-3 border-white shadow-xl flex items-center justify-center animate-bounce">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
        `;
        
        selectedLocationMarkerRef.current = new mapboxgl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(mapRef.current);
      }
      
      // Update address if available
      if (bookingData.address && !userAddress) {
        setUserAddress(bookingData.address);
        setIsAddressValidated(true);
      }
      
      // Update providers based on saved location and category
      const serviceFilter = bookingData.selectedCategory || selectedService;
      const updatedProviders = getProvidersNear(validatedProviders, lat, lng, SEARCH_RADIUS_KM, serviceFilter);
      setNearbyProviders(updatedProviders);
      console.log('[MapView] Synced with BookingContext:', bookingData.address, updatedProviders.length, 'providers found');
    }
    // Case 2: BookingContext has address but no coordinates - sync address from landing page
    else if (bookingData.address && !bookingData.coordinates) {
      // Sync address from landing page to MapView input field
      if (bookingData.address !== userAddress) {
        setUserAddress(bookingData.address);
        setIsAddressValidated(true);
        console.log('[MapView] Synced address from landing page:', bookingData.address);
      }
      
      // Filter providers by category only (no location filter until coordinates are set)
      if (bookingData.selectedCategory) {
        const filtered = validatedProviders.filter(p => p.service === bookingData.selectedCategory);
        setNearbyProviders(filtered);
      } else {
        setNearbyProviders(validatedProviders);
      }
    }
    // Case 3: BookingContext cleared (coordinates became null) - reset local state
    else if (!bookingData.coordinates && !bookingData.address && selectedCoords) {
      setSelectedCoords(null);
      setUserAddress('');
      setIsAddressValidated(false);
      // Remove existing location marker
      if (selectedLocationMarkerRef.current) {
        selectedLocationMarkerRef.current.remove();
        selectedLocationMarkerRef.current = null;
      }
      // Reset to all providers
      setNearbyProviders(validatedProviders);
      console.log('[MapView] BookingContext cleared, resetting location');
    }
    
    // Sync selected service with BookingContext (even without coordinates for category-only filtering)
    if (bookingData.selectedCategory && bookingData.selectedCategory !== selectedService) {
      setSelectedService(bookingData.selectedCategory);
      // Update provider filtering by category even without location
      if (!selectedCoords && !bookingData.coordinates) {
        const filtered = validatedProviders.filter(p => p.service === bookingData.selectedCategory);
        setNearbyProviders(filtered);
        console.log('[MapView] Category-only filter:', bookingData.selectedCategory, filtered.length, 'providers');
      }
    }
  }, [bookingData.coordinates?.lat, bookingData.coordinates?.lng, bookingData.selectedCategory, bookingData.address, bookingData.isAutoDetected, isMapLoaded]);

  // --- UPDATE PROVIDERS WHEN SERVICE FILTER CHANGES ---
  useEffect(() => {
    if (selectedCoords) {
      const updatedProviders = getProvidersNear(validatedProviders, selectedCoords.lat, selectedCoords.lng, SEARCH_RADIUS_KM, selectedService);
      setNearbyProviders(updatedProviders);
      console.log(`[MapView] Service filter changed to: ${selectedService || 'all'}`, updatedProviders.length, 'providers found');
    } else {
      // No location selected, show all providers filtered by service
      const filtered = selectedService 
        ? validatedProviders.filter(p => p.service === selectedService)
        : validatedProviders;
      setNearbyProviders(filtered);
    }
  }, [selectedService, selectedCoords]);

  // --- PROVIDER MARKERS ---
  const filteredProviders = nearbyProviders;

  useEffect(() => {
      if (!mapRef.current || !isMapLoaded) return;

      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Add new markers
      filteredProviders.forEach(provider => {
          // Create Marker Element
          const el = document.createElement('div');
          el.className = 'provider-marker group';
          el.style.cursor = 'pointer';
          
          // We render the HTML string for the marker
          // Note: We can't put React components directly into innerHTML easily, 
          // so we construct the HTML string.
          const isSelected = selectedProvider?.id === provider.id;
          const borderColor = isSelected ? '#2563EB' : '#ffffff';
          const scale = isSelected ? 'scale(1.1)' : 'scale(1)';
          const zIndex = isSelected ? '50' : '10';

          el.innerHTML = `
            <div style="position: relative; transform: ${scale}; transition: transform 0.2s; z-index: ${zIndex};">
                <div style="width: 48px; height: 48px; border-radius: 50%; overflow: hidden; border: 3px solid ${borderColor}; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <img src="${provider.image}" style="width: 100%; height: 100%; object-fit: cover;" />
                </div>
                <div style="position: absolute; top: -5px; left: -5px; width: 24px; height: 24px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); font-size: 14px;">
                    ${getServiceIcon(provider.service)}
                </div>
                ${provider.verified ? `
                <div style="position: absolute; bottom: -2px; right: -2px; width: 18px; height: 18px; background: #22c55e; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                     <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                ` : ''}
            </div>
          `;

          const marker = new mapboxgl.Marker({ element: el })
              .setLngLat([provider.lng, provider.lat])
              .addTo(mapRef.current!);

          // Add click listener
          el.addEventListener('click', (e) => {
              e.stopPropagation();
              setSelectedProvider(provider);
              // Center map on provider?
              // mapRef.current?.flyTo({ center: [provider.lng, provider.lat], zoom: 15 });
          });

          markersRef.current.push(marker);
      });

      // --- REAL-TIME SIMULATION (Every 1 minute) ---
      const interval = setInterval(() => {
          markersRef.current.forEach((marker) => {
             const lngLat = marker.getLngLat();
             // Movement every minute
             // 0.001 is roughly 100 meters
             const deltaLat = (Math.random() - 0.5) * 0.001;
             const deltaLng = (Math.random() - 0.5) * 0.001;
             marker.setLngLat([lngLat.lng + deltaLng, lngLat.lat + deltaLat]);
          });
      }, 60000); // 60,000 ms = 1 minute

      return () => clearInterval(interval);
  }, [mapRef.current, isMapLoaded, filteredProviders, selectedProvider]);


  // --- COMMON HANDLERS ---

  const handleLocateMe = () => {
    // Only allow GPS location if map is fully loaded
    if (!mapRef.current || !isMapLoaded) {
      console.warn('[MapView] Cannot locate: map not ready');
      return;
    }
    
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Update coordinates and nearby providers
          setSelectedCoords({ lat: latitude, lng: longitude });
          const updatedProviders = getProvidersNear(validatedProviders, latitude, longitude, SEARCH_RADIUS_KM, selectedService);
          setNearbyProviders(updatedProviders);
          console.log(`[MapView] GPS location updated`, updatedProviders.length, 'providers found');
          
          // Reverse geocoding to get address from coordinates
          let detectedAddress = 'המיקום הנוכחי שלך';
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&language=he`
            );
            const data = await response.json();
            detectedAddress = data.features?.[0]?.place_name || 'המיקום הנוכחי שלך';
            setUserAddress(detectedAddress);
          } catch (error) {
            console.error('Reverse geocoding error:', error);
            setUserAddress(detectedAddress);
          }
          
          setIsAddressValidated(true);
          setIsAutoDetected(true);
          setIsLocating(false);
          
          setCtxAddress(detectedAddress, { lat: latitude, lng: longitude }, true);
          
          // Center map and add/update marker (map is guaranteed to be loaded at this point)
          if (mapRef.current) {
            mapRef.current.flyTo({ center: [longitude, latitude], zoom: 15, duration: 1500 });
            
            // Add/update marker for user location
            if (selectedLocationMarkerRef.current) {
              selectedLocationMarkerRef.current.setLngLat([longitude, latitude]);
            } else {
              const el = document.createElement('div');
              el.className = 'selected-location-marker';
              el.innerHTML = `
                <div class="w-8 h-8 bg-blue-600 rounded-full border-3 border-white shadow-xl flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
              `;
              
              selectedLocationMarkerRef.current = new mapboxgl.Marker({ element: el })
                .setLngLat([longitude, latitude])
                .addTo(mapRef.current);
            }
          }
        },
        (err) => {
            console.error(err);
            setIsLocating(false);
        }
      );
    } else {
        setIsLocating(false);
    }
  };

  const handleQuickAddress = (type: string) => {
    const addresses: Record<string, { address: string; lat: number; lng: number }> = {
      'הבית': { address: 'רוטשילד 45, תל אביב', lat: 32.0636, lng: 34.7705 },
      'עבודה': { address: 'יגאל אלון 98, תל אביב', lat: 32.0731, lng: 34.7925 },
      'הורים': { address: 'ויצמן 14, גבעתיים', lat: 32.0833, lng: 34.8167 }
    };
    if (addresses[type]) {
      const addr = addresses[type];
      setUserAddress(addr.address);
      setIsAddressValidated(true);
      setIsAutoDetected(false);
      setSelectedCoords({ lat: addr.lat, lng: addr.lng });
      
      setUserLocation({
        address: addr.address,
        coords: { lat: addr.lat, lng: addr.lng },
        details: additionalDetails,
        type: 'manual'
      });
      
      setCtxAddress(addr.address, { lat: addr.lat, lng: addr.lng }, false);
      
      // Update nearby providers based on quick address
      const updatedProviders = getProvidersNear(validatedProviders, addr.lat, addr.lng, SEARCH_RADIUS_KM, selectedService);
      setNearbyProviders(updatedProviders);
      console.log(`[MapView] Quick address selected: ${type}`, updatedProviders.length, 'providers found');
      
      // Center map on quick address (only if map is loaded)
      if (mapRef.current && isMapLoaded) {
        mapRef.current.flyTo({ 
          center: [addr.lng, addr.lat], 
          zoom: 15,
          duration: 1500
        });
        
        // Add/update marker
        if (selectedLocationMarkerRef.current) {
          selectedLocationMarkerRef.current.setLngLat([addr.lng, addr.lat]);
        } else {
          const el = document.createElement('div');
          el.className = 'selected-location-marker';
          el.innerHTML = `
            <div class="w-8 h-8 bg-blue-600 rounded-full border-3 border-white shadow-xl flex items-center justify-center animate-bounce">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
          `;
          
          selectedLocationMarkerRef.current = new mapboxgl.Marker({ element: el })
            .setLngLat([addr.lng, addr.lat])
            .addTo(mapRef.current);
        }
      }
    }
  };

  return (
    <div className="h-screen w-full relative overflow-hidden">
      {/* --- MAP RENDERER --- */}
      <div className="absolute inset-0 bg-gray-50">
        <div ref={mapContainerRef} className="w-full h-full text-[36px] text-right" />
        
        {/* --- SELECTED PROVIDER CARD --- */}
        {selectedProvider && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[130%] w-72 bg-white rounded-xl shadow-2xl p-4 z-30 text-right animate-in slide-in-from-bottom-4 fade-in" dir="rtl">
                <button onClick={() => setSelectedProvider(null)} className="absolute top-2 left-2 text-gray-400 hover:text-gray-600">✕</button>
                <div className="flex gap-3 mb-3">
                    <ImageWithFallback
                        src={selectedProvider.image}
                        alt={selectedProvider.name}
                        className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold m-0">{selectedProvider.name}</h4>
                            {selectedProvider.verified && <CheckCircle className="w-4 h-4 text-green-600" />}
                        </div>
                        <div className="text-gray-600 mb-1 text-sm">{selectedProvider.service}</div>
                        <div className="flex items-center gap-2 text-sm">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            <span>{selectedProvider.rating}</span>
                            <span className="text-gray-500">({selectedProvider.reviews})</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100 text-sm">
                    <div className="text-gray-600">תעריף</div>
                    <div className="text-blue-600 font-bold">₪{selectedProvider.hourlyRate}/שעה</div>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onServiceSelect(selectedProvider.service);
                    }}
                    className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                    בקש הצעת מחיר
                </button>
            </div>
        )}
      </div>

      {/* --- UI OVERLAYS --- */}

      {/* Responsive Address Panel */}
      <div className={`absolute z-40 left-0 right-0 bottom-0 md:top-28 md:left-6 md:right-auto md:bottom-auto p-4 md:p-0 pointer-events-none flex justify-center md:block transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isPanelExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-85px)] md:translate-y-0'}`}>
        <div 
          className="bg-white/95 backdrop-blur-xl w-full max-w-md md:w-[360px] p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 pointer-events-auto"
          dir="rtl"
        >
           <div 
             className="md:hidden w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 cursor-pointer hover:bg-gray-300 active:scale-125 transition-all"
             onClick={() => setIsPanelExpanded(!isPanelExpanded)}
           ></div>

           <div className="flex items-center justify-between mb-5">
             <div className="flex items-center gap-3">
               <button 
                 onClick={onBackToLanding}
                 className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all"
                 title="חזור לדף הבית"
               >
                 <ArrowRight className="w-4 h-4 text-gray-600" />
               </button>
               <div>
                 <h3 className="text-xl font-black text-gray-900">פרטי הזמנה</h3>
                 <p className="text-xs text-gray-500 font-medium mt-0.5">הגדר מיקום לאיסוף מהיר</p>
               </div>
             </div>
             <div className="flex p-1 bg-gray-100 rounded-xl">
                <button 
                  onClick={() => {
                    setLocalBookingType('now');
                    setCtxBookingType('now');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    bookingType === 'now' 
                      ? 'bg-white shadow-sm text-blue-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  עכשיו
                </button>
                <button 
                  onClick={() => {
                    setLocalBookingType('scheduled');
                    setCtxBookingType('scheduled');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    bookingType === 'scheduled' 
                      ? 'bg-white shadow-sm text-blue-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  מתוזמן
                </button>
             </div>
           </div>

           {/* Date/Time Picker for Scheduled Booking */}
           {bookingType === 'scheduled' && (
             <div className="mb-5 p-4 bg-purple-50 rounded-2xl border border-purple-100 animate-in slide-in-from-top-2 fade-in duration-300">
               <div className="flex items-center gap-2 mb-3">
                 <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                   <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                   </svg>
                 </div>
                 <p className="text-sm font-bold text-purple-800">בחר תאריך ושעה</p>
               </div>
               <div className="grid grid-cols-2 gap-3">
                 <div>
                   <label className="text-[10px] text-purple-600 font-bold block mb-1">תאריך</label>
                   <input
                     type="date"
                     value={scheduledDate}
                     onChange={(e) => {
                       setLocalScheduledDate(e.target.value);
                       setScheduledDateTime(e.target.value, scheduledTime);
                     }}
                     min={getMinDate()}
                     className="w-full px-3 py-2.5 bg-white border border-purple-200 rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-all"
                   />
                 </div>
                 <div>
                   <label className="text-[10px] text-purple-600 font-bold block mb-1">שעה</label>
                   <select
                     value={scheduledTime}
                     onChange={(e) => {
                       setLocalScheduledTime(e.target.value);
                       setScheduledDateTime(scheduledDate, e.target.value);
                     }}
                     className="w-full px-3 py-2.5 bg-white border border-purple-200 rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                     disabled={!scheduledDate}
                   >
                     <option value="">בחר שעה</option>
                     {timeSlots.map((slot) => (
                       <option 
                         key={slot.value} 
                         value={slot.value}
                         disabled={slot.disabled}
                       >
                         {slot.label}
                       </option>
                     ))}
                   </select>
                 </div>
               </div>
               {scheduledDate && scheduledTime && (
                 <div className="mt-3 p-2 bg-white rounded-lg border border-purple-200 flex items-center gap-2">
                   <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                   </svg>
                   <span className="text-xs font-medium text-gray-700">
                     נקבע ל: {formatScheduledDateTime(scheduledDate, scheduledTime)}
                   </span>
                 </div>
               )}
             </div>
           )}

           {/* Service Categories - Horizontal Scroll */}
           <div className="mb-5">
              <p className="text-[10px] text-gray-400 font-bold mb-2 tracking-wide">מה אנחנו מתקנים היום?</p>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
                {categories.map((category) => {
                  const displayName = category.nameHe || category.name;
                  const isSelected = selectedService === displayName;
                  return (
                    <button 
                      key={category.id}
                      onClick={() => {
                        const newValue = isSelected ? null : displayName;
                        setSelectedService(newValue);
                        if (newValue) {
                          setCategory(category.id, newValue, category.icon);
                        }
                      }}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all flex-shrink-0 min-w-[60px] ${
                        isSelected 
                          ? 'bg-blue-50 border-blue-200 shadow-sm scale-95' 
                          : 'bg-gray-50 border-transparent hover:bg-gray-100 hover:scale-105'
                      }`}
                    >
                      <span className="text-lg mb-0.5 filter drop-shadow-sm">{category.icon}</span>
                      <span className={`text-[10px] font-bold whitespace-nowrap ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                        {displayName}
                      </span>
                    </button>
                  );
                })}
              </div>
           </div>

           <div className="relative flex flex-col gap-3 mb-5">
              <div className="absolute right-[23px] top-[24px] bottom-[24px] w-0.5 bg-gradient-to-b from-blue-600/20 to-gray-200 z-0"></div>

              <div className={`relative z-10 transition-all duration-300 p-3.5 rounded-2xl border group flex items-center gap-4 ${
                isAutoDetected && userAddress 
                  ? 'bg-green-50 hover:bg-green-100 border-green-200 hover:border-green-300' 
                  : 'bg-white hover:bg-blue-50 border-blue-100 hover:border-blue-200'
              }`}>
                 <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-[0_0_0_4px_rgba(255,255,255,1)] transition-all ${
                   isAutoDetected && userAddress ? 'bg-green-500' : 'bg-blue-600'
                 }`}></div>
                 <div className="flex-1">
                    <p className={`text-xs font-extrabold mb-1 tracking-wide ${
                      isAutoDetected && userAddress ? 'text-green-700' : 'text-blue-700'
                    }`}>
                      {isAutoDetected && userAddress ? 'מיקום נוכחי' : 'הזן כתובת *'}
                    </p>
                    {isAutoDetected && userAddress ? (
                      <button
                        onClick={() => {
                          setUserAddress('');
                          setIsAutoDetected(false);
                          setIsAddressValidated(false);
                          setSelectedCoords(null);
                        }}
                        className="w-full text-right"
                      >
                        <p className="text-sm font-extrabold text-green-700 leading-relaxed truncate">המיקום הנוכחי שלך</p>
                      </button>
                    ) : (
                      <AddressAutocomplete 
                        value={userAddress}
                        onChange={handleAddressChange}
                        onSelect={handleAddressSelect}
                        language="he"
                        className="text-gray-900 placeholder-gray-600 font-semibold text-sm"
                      />
                    )}
                 </div>
                 <button 
                   onClick={handleLocateMe}
                   disabled={isLocating}
                   className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                     isLocating ? 'bg-blue-200 text-blue-800 animate-pulse' : 'bg-blue-100/50 hover:bg-blue-200/50 text-blue-600'
                   }`}
                   title="אתר אותי"
                 >
                    <Locate className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                 </button>
              </div>

              <div className="relative z-10 bg-gray-50 hover:bg-gray-100 transition-all duration-300 p-3.5 rounded-2xl border border-transparent hover:border-gray-200 group flex items-center gap-4">
                 <div className="w-2.5 h-2.5 bg-gray-300 rounded-[2px] flex-shrink-0 shadow-[0_0_0_4px_rgba(255,255,255,1)] group-hover:shadow-[0_0_0_4px_rgba(243,244,246,1)] transition-all"></div>
                 <div className="flex-1">
                    <p className="text-xs text-gray-600 font-extrabold mb-1 tracking-wide">פרטים נוספים</p>
                    <input 
                      type="text"
                      value={additionalDetails}
                      onChange={(e) => {
                        setLocalAdditionalDetails(e.target.value);
                        setCtxAdditionalDetails(e.target.value);
                      }}
                      className="w-full bg-transparent border-none p-0 text-sm font-bold text-gray-900 focus:ring-0 placeholder-gray-600 leading-relaxed"
                      placeholder="קומה, דירה, קוד כניסה..."
                    />
                 </div>
              </div>
           </div>

           <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none">
             {['הבית', 'עבודה', 'הורים'].map((place, i) => (
               <button 
                 key={place} 
                 onClick={() => handleQuickAddress(place)}
                 className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 rounded-xl transition-all whitespace-nowrap group active:scale-95"
               >
                 <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-green-500' : i === 1 ? 'bg-orange-500' : 'bg-purple-500'}`}></div>
                 <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900">{place}</span>
               </button>
             ))}
           </div>

           {/* Address validation warning */}
           {!isAddressValidated && (
             <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-3.5 mb-4 flex items-center gap-3">
               <div className="w-8 h-8 bg-amber-200 rounded-lg flex items-center justify-center flex-shrink-0">
                 <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                 </svg>
               </div>
               <p className="text-sm font-extrabold text-amber-900">נא להזין כתובת תקינה</p>
             </div>
           )}

           <button 
             onClick={() => onBookingContinue({
               category: selectedService || 'general',
               address: userAddress,
               details: additionalDetails,
               time: bookingType,
               scheduledDate: bookingType === 'scheduled' ? scheduledDate : undefined,
               scheduledTime: bookingType === 'scheduled' ? scheduledTime : undefined,
               lat: selectedCoords?.lat,
               lng: selectedCoords?.lng
             })}
             disabled={!selectedService || !isAddressValidated}
             className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2 ${
               selectedService && isAddressValidated
                 ? 'bg-blue-600 text-white shadow-gray-200 hover:bg-black hover:scale-[1.02] active:scale-[0.98] cursor-pointer' 
                 : 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed'
             }`}
           >
              <span>{selectedService ? `אשר הזמנת ${selectedService}` : 'בחר שירות להמשך'}</span>
           </button>
           {(!selectedService || !isAddressValidated) && (
             <p className="text-xs text-gray-700 text-center mt-3 font-bold">
               {!isAddressValidated ? '* יש להזין כתובת ולבחור שירות' : '* יש לבחור שירות כדי להמשיך'}
             </p>
           )}
        </div>
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-[1000] p-4 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" dir="rtl">
        <div className="pointer-events-auto">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={onBackToLanding}
              className="bg-white rounded-xl shadow-lg px-3 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <BeadyLogo size="md" />
            </button>
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="חפש שירות..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-12 pl-4 py-3 rounded-xl shadow-lg text-right"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
            <button 
              onClick={onProAccessClick}
              className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <Briefcase className="w-5 h-5" />
            </button>
            <button 
              onClick={onProfileClick}
              className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <User className="w-5 h-5" />
            </button>
          </div>

          {showFilters && (
            <div 
              className="bg-white rounded-xl shadow-lg p-3 flex gap-2 overflow-x-auto"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onWheel={(e) => {
                if (e.deltaY !== 0) {
                  e.preventDefault();
                  e.currentTarget.scrollLeft += e.deltaY;
                }
              }}
            >
              <button
                onClick={() => setSelectedService(null)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  !selectedService ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                הכל
              </button>
              {categories.map((cat) => {
                const displayName = cat.nameHe || cat.name;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedService(displayName)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
                      selectedService === displayName ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{displayName}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}