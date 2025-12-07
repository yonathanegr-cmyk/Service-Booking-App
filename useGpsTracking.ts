import { useEffect, useRef, useCallback, useState } from 'react';
import { JobStatus } from '../types/job';

interface GpsPosition {
  lat: number;
  lng: number;
  accuracy: number;
  heading?: number;
  speed?: number;
  timestamp: string;
}

interface UseGpsTrackingOptions {
  jobStatus: JobStatus | null;
  onLocationUpdate: (lat: number, lng: number) => Promise<void>;
  updateInterval?: number;
  enableHighAccuracy?: boolean;
}

interface UseGpsTrackingReturn {
  currentPosition: GpsPosition | null;
  isTracking: boolean;
  error: string | null;
  startTracking: () => void;
  stopTracking: () => void;
}

export function useGpsTracking({
  jobStatus,
  onLocationUpdate,
  updateInterval = 10000,
  enableHighAccuracy = true
}: UseGpsTrackingOptions): UseGpsTrackingReturn {
  const [currentPosition, setCurrentPosition] = useState<GpsPosition | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const positionRef = useRef<GpsPosition | null>(null);

  const shouldTrack = jobStatus === 'en_route';

  const sendLocationUpdate = useCallback(async () => {
    if (positionRef.current) {
      try {
        await onLocationUpdate(positionRef.current.lat, positionRef.current.lng);
        lastUpdateRef.current = Date.now();
      } catch (err) {
        console.error('Failed to send location update:', err);
      }
    }
  }, [onLocationUpdate]);

  const handlePositionSuccess = useCallback((position: GeolocationPosition) => {
    const newPosition: GpsPosition = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      heading: position.coords.heading ?? undefined,
      speed: position.coords.speed ?? undefined,
      timestamp: new Date().toISOString()
    };

    setCurrentPosition(newPosition);
    positionRef.current = newPosition;
    setError(null);
  }, []);

  const handlePositionError = useCallback((positionError: GeolocationPositionError) => {
    let errorMessage: string;
    
    switch (positionError.code) {
      case positionError.PERMISSION_DENIED:
        errorMessage = 'נדרשת הרשאת מיקום כדי להמשיך';
        break;
      case positionError.POSITION_UNAVAILABLE:
        errorMessage = 'לא ניתן לקבל את המיקום הנוכחי';
        break;
      case positionError.TIMEOUT:
        errorMessage = 'תם הזמן לקבלת המיקום';
        break;
      default:
        errorMessage = 'שגיאה בקבלת המיקום';
    }
    
    setError(errorMessage);
    console.error('GPS Error:', errorMessage, positionError);
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('הדפדפן לא תומך במיקום GPS');
      return;
    }

    setIsTracking(true);
    setError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionSuccess,
      handlePositionError,
      {
        enableHighAccuracy,
        timeout: 15000,
        maximumAge: 0
      }
    );

    intervalRef.current = setInterval(() => {
      sendLocationUpdate();
    }, updateInterval);

    sendLocationUpdate();
  }, [handlePositionSuccess, handlePositionError, sendLocationUpdate, updateInterval, enableHighAccuracy]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsTracking(false);
  }, []);

  useEffect(() => {
    if (shouldTrack && !isTracking) {
      startTracking();
    } else if (!shouldTrack && isTracking) {
      stopTracking();
    }
  }, [shouldTrack, isTracking, startTracking, stopTracking]);

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    currentPosition,
    isTracking,
    error,
    startTracking,
    stopTracking
  };
}
