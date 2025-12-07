import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';

export type LocationType = 'current' | 'manual';

interface UserLocation {
  address: string;
  coords: { lat: number; lng: number } | null;
  details: string;
  type: LocationType;
  lastUpdated?: string;
}

type LocationContextType = {
  userLocation: UserLocation | null; 
  setUserLocation: (location: UserLocation | null) => void;
  isLocationSet: boolean;
  locationType: LocationType | null;
  isWatchingLocation: boolean;
  startWatchingLocation: () => void;
  stopWatchingLocation: () => void;
  updateCurrentPosition: () => Promise<boolean>;
  isLocating: boolean;
  locationError: string | null;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const STORAGE_KEY = 'beedy_user_location';
const MAPBOX_TOKEN = typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_MAPBOX_ACCESS_TOKEN || '' : '';

const DEFAULT_LOCATION: UserLocation = {
  address: 'תל אביב-יפו, ישראל',
  coords: { lat: 32.0853, lng: 34.7818 },
  details: '',
  type: 'manual',
  lastUpdated: new Date().toISOString()
};

export const useUserLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useUserLocation must be used inside LocationProvider');
  }
  return context;
};

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  if (!MAPBOX_TOKEN) {
    return 'המיקום הנוכחי שלך';
  }
  
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=he`
    );
    const data = await response.json();
    return data.features?.[0]?.place_name || 'המיקום הנוכחי שלך';
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return 'המיקום הנוכחי שלך';
  }
}

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userLocation, setStateLocation] = useState<UserLocation | null>(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.coords) {
          return parsed;
        }
      }
    } catch (e) {
      // Silent fail
    }
    return null;
  });

  const [isWatchingLocation, setIsWatchingLocation] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (userLocation) {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(userLocation));
      } catch (e) {
        // Silent fail
      }
    }
  }, [userLocation]);

  const setUserLocation = useCallback((location: UserLocation | null) => {
    setStateLocation(location);
    setLocationError(null);
    if (location === null) {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        // Silent fail
      }
    }
  }, []);

  const updateCurrentPosition = useCallback(async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      setLocationError('הדפדפן אינו תומך בשירותי מיקום. אנא הזן כתובת ידנית.');
      return false;
    }

    setIsLocating(true);
    setLocationError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const address = await reverseGeocode(latitude, longitude);
          
          setStateLocation(prev => ({
            address,
            coords: { lat: latitude, lng: longitude },
            details: prev?.details || '',
            type: 'current',
            lastUpdated: new Date().toISOString()
          }));
          
          setIsLocating(false);
          setLocationError(null);
          resolve(true);
        },
        (error) => {
          console.warn('Geolocation access denied or failed:', error);
          let errorMessage = 'לא ניתן לאתר את המיקום שלך. אנא הזן כתובת ידנית.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'הגישה למיקום נדחתה. אנא הזן כתובת ידנית.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'מידע המיקום אינו זמין. אנא הזן כתובת ידנית.';
              break;
            case error.TIMEOUT:
              errorMessage = 'הזמן לאיתור המיקום פג. אנא הזן כתובת ידנית.';
              break;
          }
          
          setLocationError(errorMessage);
          setIsLocating(false);
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }, []);

  const startWatchingLocation = useCallback(() => {
    if (!navigator.geolocation) {
      return;
    }

    if (watchIdRef.current !== null) {
      return;
    }

    setIsWatchingLocation(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const address = await reverseGeocode(latitude, longitude);
        
        setStateLocation(prev => ({
          address,
          coords: { lat: latitude, lng: longitude },
          details: prev?.details || '',
          type: 'current',
          lastUpdated: new Date().toISOString()
        }));
      },
      () => {
        // Silent fail - GPS updates not critical once we have a location
      },
      { enableHighAccuracy: false, timeout: 60000, maximumAge: 30000 }
    );
  }, []);

  const stopWatchingLocation = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsWatchingLocation(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (userLocation?.type === 'manual' && isWatchingLocation) {
      stopWatchingLocation();
    }
  }, [userLocation?.type, isWatchingLocation, stopWatchingLocation]);

  const isLocationSet = userLocation !== null && userLocation.coords !== null;
  const locationType = userLocation?.type ?? null;

  return (
    <LocationContext.Provider value={{ 
      userLocation, 
      setUserLocation, 
      isLocationSet,
      locationType,
      isWatchingLocation,
      startWatchingLocation,
      stopWatchingLocation,
      updateCurrentPosition,
      isLocating,
      locationError
    }}>
      {children}
    </LocationContext.Provider>
  );
};
