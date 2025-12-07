import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Category } from '../hooks/useCategories';

export interface BookingData {
  selectedCategory: string | null;
  selectedCategoryId: string | null;
  categoryIcon: string | null;
  address: string;
  coordinates: { lat: number; lng: number } | null;
  isAutoDetected: boolean;
  additionalDetails: string;
  bookingType: 'now' | 'scheduled';
  scheduledDate: string;
  scheduledTime: string;
  // Structured data for capability matching
  subProblem?: string;          // e.g., 'leak', 'clog', 'outlet'
  complexity?: 'standard' | 'complex' | 'critical';
  urgency?: 'immediate' | 'planned';
  accessibility?: 'standard' | 'difficult';
  mediaUrls?: string[];         // Uploaded photos/videos
}

interface BookingContextValue {
  bookingData: BookingData;
  setCategory: (categoryId: string, categoryName: string, icon?: string) => void;
  setAddress: (address: string, coordinates?: { lat: number; lng: number }, isAutoDetected?: boolean) => void;
  setAdditionalDetails: (details: string) => void;
  setBookingType: (type: 'now' | 'scheduled') => void;
  setScheduledDateTime: (date: string, time: string) => void;
  clearBooking: () => void;
  isBookingValid: boolean;
}

const STORAGE_KEY = 'beedy_booking_data';

const defaultBookingData: BookingData = {
  selectedCategory: null,
  selectedCategoryId: null,
  categoryIcon: null,
  address: '',
  coordinates: null,
  isAutoDetected: false,
  additionalDetails: '',
  bookingType: 'now',
  scheduledDate: '',
  scheduledTime: '',
  subProblem: undefined,
  complexity: undefined,
  urgency: undefined,
  accessibility: undefined,
  mediaUrls: undefined
};

function loadFromStorage(): BookingData {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultBookingData, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn('Failed to load booking data from storage:', e);
  }
  return defaultBookingData;
}

function saveToStorage(data: BookingData): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save booking data to storage:', e);
  }
}

const BookingContext = createContext<BookingContextValue | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookingData, setBookingData] = useState<BookingData>(loadFromStorage);

  useEffect(() => {
    saveToStorage(bookingData);
  }, [bookingData]);

  const setCategory = useCallback((categoryId: string, categoryName: string, icon?: string) => {
    setBookingData(prev => ({
      ...prev,
      selectedCategoryId: categoryId,
      selectedCategory: categoryName,
      categoryIcon: icon || null
    }));
  }, []);

  const setAddress = useCallback((address: string, coordinates?: { lat: number; lng: number }, isAutoDetected?: boolean) => {
    setBookingData(prev => ({
      ...prev,
      address,
      coordinates: coordinates || prev.coordinates,
      isAutoDetected: isAutoDetected ?? prev.isAutoDetected
    }));
  }, []);

  const setAdditionalDetails = useCallback((details: string) => {
    setBookingData(prev => ({
      ...prev,
      additionalDetails: details
    }));
  }, []);

  const setBookingType = useCallback((type: 'now' | 'scheduled') => {
    setBookingData(prev => ({
      ...prev,
      bookingType: type
    }));
  }, []);

  const setScheduledDateTime = useCallback((date: string, time: string) => {
    setBookingData(prev => ({
      ...prev,
      scheduledDate: date,
      scheduledTime: time
    }));
  }, []);

  const clearBooking = useCallback(() => {
    setBookingData(defaultBookingData);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const isBookingValid = Boolean(
    bookingData.selectedCategory && 
    bookingData.address && 
    bookingData.coordinates
  );

  const value: BookingContextValue = {
    bookingData,
    setCategory,
    setAddress,
    setAdditionalDetails,
    setBookingType,
    setScheduledDateTime,
    clearBooking,
    isBookingValid
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking(): BookingContextValue {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}

export function useBookingData(): BookingData {
  const { bookingData } = useBooking();
  return bookingData;
}
