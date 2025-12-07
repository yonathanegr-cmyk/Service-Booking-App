import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Loader2 } from './ui/icons';
import { cn } from './ui/utils';

// Declare Google Maps types
declare global {
  interface Window {
    google: any;
  }
}

const getEnvVar = (key: string): string => {
  try {
    // @ts-ignore - Vite
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
    // @ts-ignore - Next.js / Create React App / Node
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
       // @ts-ignore
      return process.env[key];
    }
  } catch (e) {
    // Ignore errors
  }
  return '';
};

const GOOGLE_MAPS_API_KEY = getEnvVar('VITE_GOOGLE_MAPS_API_KEY');
const SCRIPTS_ID = 'google-maps-script';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (data: { address: string; lat: number; lng: number }) => void;
  language?: string;
  className?: string;
  placeholder?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  language = 'he',
  className,
  placeholder
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [isSelecting, setIsSelecting] = useState(false);
  
  const autocompleteService = useRef<any>(null);
  const placesService = useRef<any>(null);
  const sessionToken = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const userLocation = useRef<{ lat: number; lng: number } | null>(null);

  // Update dropdown position when showing suggestions
  useEffect(() => {
    if (showSuggestions && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [showSuggestions, suggestions]);

  // Load Google Maps Script
  useEffect(() => {
    const loadScript = () => {
      if (window.google?.maps?.places) {
        setScriptLoaded(true);
        return;
      }

      const existingScript = document.getElementById(SCRIPTS_ID);
      if (existingScript) {
        existingScript.addEventListener('load', () => setScriptLoaded(true));
        return;
      }

      const script = document.createElement('script');
      script.id = SCRIPTS_ID;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&language=${language}`;
      script.async = true;
      script.defer = true;
      script.onload = () => setScriptLoaded(true);
      document.head.appendChild(script);
    };

    if (GOOGLE_MAPS_API_KEY) {
      loadScript();
    } else {
      console.warn("Google Maps API Key is missing. The address input will function as a standard text field. Please set VITE_GOOGLE_MAPS_API_KEY in your environment to enable autocomplete.");
    }
  }, [language]);

  // Initialize Services
  useEffect(() => {
    if (!scriptLoaded || !window.google) return;

    try {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      placesService.current = new window.google.maps.places.PlacesService(document.createElement('div'));
      sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();

      // Get User Location for Biasing
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            userLocation.current = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
          },
          (error) => {
            console.warn("Geolocation access denied or failed:", error);
          }
        );
      }
    } catch (error) {
      console.error("Error initializing Google Maps services:", error);
    }
  }, [scriptLoaded]);

  // Fetch Predictions (Debounced)
  useEffect(() => {
    // Skip fetching if we just selected an address
    if (isSelecting) {
      return;
    }
    
    const timer = setTimeout(() => {
      if (!value || value.length < 2 || !autocompleteService.current) {
        setSuggestions([]);
        return;
      }

      // Avoid fetching if value is empty or very short
      
      const request: any = {
        input: value,
        sessionToken: sessionToken.current,
        language: language,
        types: ['geocode'], // Global address search
      };

      // Apply Biasing
      if (userLocation.current && window.google) {
        const center = new window.google.maps.LatLng(userLocation.current.lat, userLocation.current.lng);
        // Circular bias with ~5km radius
        const circle = new window.google.maps.Circle({ center: center, radius: 5000 });
        request.locationBias = circle.getBounds();
      }

      setLoading(true);
      autocompleteService.current.getPlacePredictions(request, (predictions: any[], status: any) => {
        setLoading(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
        }
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [value, language, isSelecting]);

  const handleSelect = (placeId: string, description: string) => {
    // Set selecting flag to prevent search from re-triggering
    setIsSelecting(true);
    
    // Hide suggestions immediately and clear them
    setShowSuggestions(false);
    setSuggestions([]);

    if (!placesService.current) {
      // Fallback if places service not available - notify parent directly
      onSelect({
        address: description,
        lat: 0,
        lng: 0
      });
      // Reset selecting flag after a delay
      setTimeout(() => setIsSelecting(false), 500);
      return;
    }

    const request = {
      placeId: placeId,
      fields: ['geometry', 'formatted_address']
    };

    placesService.current.getDetails(request, (place: any, status: any) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place.geometry) {
        const formattedAddress = place.formatted_address || description;
        
        // Notify parent with formatted address and coordinates
        // Parent's onSelect handler will update the value
        onSelect({
          address: formattedAddress,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        });
        
        // Renew session token
        sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
      } else {
        // Fallback to description if details fetch fails
        onSelect({
          address: description,
          lat: 0,
          lng: 0
        });
      }
      
      // Reset selecting flag after processing is complete
      setTimeout(() => setIsSelecting(false), 500);
    });
  };

  // Close on click outside - but NOT on suggestion clicks
  const suggestionsRef = useRef<HTMLUListElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Don't close if clicking inside the input container
      if (containerRef.current && containerRef.current.contains(target)) {
        return;
      }
      
      // Don't close if clicking inside the suggestions dropdown
      // Check if the click target is inside any element with the suggestions class
      const suggestionsDropdown = document.querySelector('.address-suggestions-dropdown');
      if (suggestionsDropdown && suggestionsDropdown.contains(target)) {
        return;
      }
      
      setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (e.target.value.length >= 2) setShowSuggestions(true);
          }}
          className={cn(
            "w-full bg-transparent border-none p-0 text-sm font-bold text-gray-900 focus:ring-0 placeholder-gray-400 leading-relaxed outline-none",
            className
          )}
          placeholder={placeholder || "הזן כתובת..."}
          dir={language === 'he' ? 'rtl' : 'ltr'}
        />
        {loading && (
          <div className={cn("absolute top-1/2 -translate-y-1/2", language === 'he' ? 'left-0' : 'right-0')}>
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && createPortal(
        <ul 
          className="address-suggestions-dropdown fixed max-h-72 overflow-auto rounded-2xl bg-white py-2 shadow-2xl border border-gray-100 focus:outline-none"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            zIndex: 99999
          }}
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.place_id}
              className={cn(
                "relative cursor-pointer select-none py-3 px-4 hover:bg-gray-50 transition-colors duration-150 flex items-start gap-3",
                language === 'he' ? "text-right flex-row-reverse" : "text-left",
                index !== suggestions.length - 1 && "border-b border-gray-50"
              )}
              onClick={() => handleSelect(suggestion.place_id, suggestion.description)}
            >
              <div className="flex-shrink-0 mt-0.5">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="block truncate text-base font-semibold text-gray-900">
                  {suggestion.structured_formatting.main_text}
                </span>
                <span className="block truncate text-sm text-gray-500 mt-0.5">
                  {suggestion.structured_formatting.secondary_text}
                </span>
              </div>
            </li>
          ))}
        </ul>,
        document.body
      )}
    </div>
  );
}
