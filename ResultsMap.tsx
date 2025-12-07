import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Loader2, AlertTriangle } from 'lucide-react';
import { createPriceMarkerHTML } from './PriceMarker';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string;

interface Professional {
  id: string;
  lat: number;
  lng: number;
  price: number;
  name: string;
  image?: string;
}

interface ResultsMapProps {
  userLocation: { lat: number; lng: number };
  professionals: Professional[];
  onProfessionalHover?: (id: string | null) => void;
  onProfessionalClick?: (id: string) => void;
  highlightedProfessionalId?: string | null;
}

interface MarkerData {
  marker: mapboxgl.Marker;
  element: HTMLDivElement;
  proId: string;
}

export function ResultsMap({ 
  userLocation, 
  professionals, 
  onProfessionalHover,
  onProfessionalClick,
  highlightedProfessionalId 
}: ResultsMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const markersDataRef = useRef<MarkerData[]>([]);
  const isInitializedRef = useRef(false);
  const lastProsSignatureRef = useRef<string>('');
  
  const [mapStatus, setMapStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const callbacksRef = useRef({ onHover: onProfessionalHover, onClick: onProfessionalClick });
  useEffect(() => {
    callbacksRef.current = { onHover: onProfessionalHover, onClick: onProfessionalClick };
  }, [onProfessionalHover, onProfessionalClick]);

  const validLocation = useMemo(() => {
    const lat = typeof userLocation.lat === 'string' ? parseFloat(userLocation.lat) : userLocation.lat;
    const lng = typeof userLocation.lng === 'string' ? parseFloat(userLocation.lng) : userLocation.lng;
    return {
      lat: !isNaN(lat) && lat >= -90 && lat <= 90 ? lat : 32.0853,
      lng: !isNaN(lng) && lng >= -180 && lng <= 180 ? lng : 34.7818
    };
  }, [userLocation.lat, userLocation.lng]);

  const uniqueProfessionals = useMemo(() => {
    const seen = new Set<string>();
    return professionals.filter(pro => {
      if (seen.has(pro.id)) return false;
      seen.add(pro.id);
      return true;
    });
  }, [professionals]);

  const lowestPrice = useMemo(() => {
    if (uniqueProfessionals.length === 0) return 0;
    return Math.min(...uniqueProfessionals.map(p => p.price));
  }, [uniqueProfessionals]);

  const prosSignature = useMemo(() => {
    return uniqueProfessionals
      .map(p => `${p.id}:${p.lat}:${p.lng}:${p.price}`)
      .sort()
      .join('|');
  }, [uniqueProfessionals]);

  const createUserMarker = useCallback(() => {
    const el = document.createElement('div');
    el.innerHTML = `
      <div style="position: relative; width: 32px; height: 32px;">
        <div style="
          position: absolute;
          inset: 0;
          background: #3b82f6;
          border-radius: 50%;
          animation: userPulse 2s infinite;
          opacity: 0.4;
        "></div>
        <div style="
          position: absolute;
          inset: 5px;
          background: #2563eb;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        "></div>
      </div>
      <style>
        @keyframes userPulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.8); opacity: 0; }
        }
      </style>
    `;
    return el;
  }, []);

  const clearAllMarkers = useCallback(() => {
    markersDataRef.current.forEach(({ marker }) => {
      try { marker.remove(); } catch (e) { /* already removed */ }
    });
    markersDataRef.current = [];
  }, []);

  const createProfessionalMarkers = useCallback((map: mapboxgl.Map) => {
    clearAllMarkers();

    uniqueProfessionals.forEach((pro) => {
      const isLowest = pro.price === lowestPrice;
      
      const el = document.createElement('div');
      el.className = 'pro-marker';
      el.setAttribute('data-pro-id', pro.id);
      el.innerHTML = createPriceMarkerHTML(pro.name, pro.price, pro.image, isLowest);
      
      el.addEventListener('mouseenter', () => {
        setMarkerActive(pro.id, true);
        callbacksRef.current.onHover?.(pro.id);
      });
      
      el.addEventListener('mouseleave', () => {
        setMarkerActive(pro.id, false);
        callbacksRef.current.onHover?.(null);
      });
      
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        callbacksRef.current.onClick?.(pro.id);
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([pro.lng, pro.lat])
        .addTo(map);

      markersDataRef.current.push({ marker, element: el, proId: pro.id });
    });
  }, [uniqueProfessionals, lowestPrice, clearAllMarkers]);

  const setMarkerActive = useCallback((proId: string, active: boolean) => {
    const markerData = markersDataRef.current.find(m => m.proId === proId);
    if (!markerData) return;
    
    const container = markerData.element.querySelector('.price-marker-container') as HTMLElement;
    const bubble = markerData.element.querySelector('.price-marker-bubble') as HTMLElement;
    
    if (container) {
      container.style.transform = active ? 'scale(1.15)' : 'scale(1)';
      container.style.zIndex = active ? '100' : '10';
    }
    if (bubble) {
      bubble.style.boxShadow = active 
        ? '0 8px 25px rgba(0,0,0,0.25)' 
        : '0 2px 8px rgba(0,0,0,0.15)';
      bubble.style.borderColor = active ? '#3b82f6' : '';
    }
  }, []);

  const fitBoundsToAll = useCallback((map: mapboxgl.Map) => {
    if (uniqueProfessionals.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([validLocation.lng, validLocation.lat]);
    uniqueProfessionals.forEach(pro => bounds.extend([pro.lng, pro.lat]));

    map.fitBounds(bounds, {
      padding: { top: 60, bottom: 60, left: 60, right: 60 },
      maxZoom: 15,
      duration: 800
    });
  }, [uniqueProfessionals, validLocation]);

  useEffect(() => {
    if (!mapContainerRef.current || isInitializedRef.current) return;
    
    if (!MAPBOX_TOKEN) {
      setMapStatus('error');
      setErrorMessage('מפתח Mapbox חסר');
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    try {
      if (mapboxgl.getRTLTextPluginStatus() === 'unavailable') {
        mapboxgl.setRTLTextPlugin(
          'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js',
          () => {},
          true
        );
      }

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [validLocation.lng, validLocation.lat],
        zoom: 13,
        attributionControl: false
      });

      mapRef.current = map;
      isInitializedRef.current = true;

      map.on('load', () => {
        setMapStatus('ready');
        map.resize();
        
        const userMarker = new mapboxgl.Marker({ 
          element: createUserMarker(),
          anchor: 'center'
        })
          .setLngLat([validLocation.lng, validLocation.lat])
          .addTo(map);
        userMarkerRef.current = userMarker;
        
        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-left');
      });
      
      map.on('styledata', () => map.resize());
      map.on('error', () => {
        setMapStatus('error');
        setErrorMessage('שגיאה בטעינת המפה');
      });

    } catch (error) {
      setMapStatus('error');
      setErrorMessage('שגיאה באתחול המפה');
    }

    return () => {
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      clearAllMarkers();
      mapRef.current?.remove();
      mapRef.current = null;
      isInitializedRef.current = false;
      lastProsSignatureRef.current = '';
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || mapStatus !== 'ready') return;

    userMarkerRef.current?.setLngLat([validLocation.lng, validLocation.lat]);
    
    map.flyTo({
      center: [validLocation.lng, validLocation.lat],
      essential: true,
      duration: 1000
    });
  }, [validLocation.lat, validLocation.lng, mapStatus]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || mapStatus !== 'ready') return;
    
    if (prosSignature === lastProsSignatureRef.current) {
      return;
    }
    lastProsSignatureRef.current = prosSignature;

    createProfessionalMarkers(map);
    
    setTimeout(() => fitBoundsToAll(map), 100);
  }, [prosSignature, mapStatus, createProfessionalMarkers, fitBoundsToAll]);

  useEffect(() => {
    markersDataRef.current.forEach(({ proId }) => {
      const isActive = proId === highlightedProfessionalId;
      setMarkerActive(proId, isActive);
    });
  }, [highlightedProfessionalId, setMarkerActive]);

  if (mapStatus === 'error') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-gray-700 font-medium text-lg">{errorMessage}</p>
          <p className="text-gray-500 text-sm mt-2">נסה לרענן את הדף</p>
        </div>
      </div>
    );
  }

  if (professionals.length === 0 && mapStatus === 'ready') {
    return (
      <div className="w-full h-full relative">
        <div ref={mapContainerRef} className="absolute inset-0" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 shadow-xl text-center max-w-xs mx-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-gray-700 font-medium">אין מקצוענים זמינים כרגע</p>
            <p className="text-gray-500 text-sm mt-2">נסה להרחיב את אזור החיפוש</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-gray-100" style={{ minHeight: '300px' }}>
      <div 
        ref={mapContainerRef} 
        className="absolute inset-0"
        style={{ width: '100%', height: '100%' }}
      />
      
      {mapStatus === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/90 backdrop-blur-sm z-10">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-gray-600 font-medium">טוען מפה...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultsMap;
