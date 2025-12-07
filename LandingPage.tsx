import image_050ba55a3b8dce139e8bd8d72b8545fadd290542 from 'figma:asset/050ba55a3b8dce139e8bd8d72b8545fadd290542.png';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Video, DollarSign, Clock, Shield, Star, Users, Briefcase, CheckCircle, TrendingUp, Award, MapPin, Smartphone, Zap, Calendar, Bell, CreditCard, MessageSquare, BarChart3, FileText, Search, Settings, Lock, Headphones, Package, Truck, Wrench, Home, Sparkles, Eye, Users2, LineChart, SlidersHorizontal, User, Locate, LogOut, Globe, HelpCircle, Bookmark, Send, X, LogIn, LayoutDashboard } from './ui/icons';
import { BeadyLogo } from './ui/BeadyLogo';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { AddressAutocomplete } from './AddressAutocomplete';
import { InvestorSection } from './InvestorSection';
import { useAvailableSlots, getMinDate, formatScheduledDateTime } from '../hooks/useAvailableSlots';
import { CategorySelector } from './CategorySelector';
import { useCategories } from '../hooks/useCategories';
import { useUserLocation } from '../context/LocationProvider';
import { useBooking } from '../context/BookingContext';
import { JobDetailsCard } from './JobDetailsCard';

type LandingPageProps = {
  onGetStarted: (addressData?: { address: string; lat: number; lng: number }, selectedService?: string | null) => void;
  onCategorySelect: (categoryId: string) => void;
  onProAccess: () => void;
  onTermsClick?: () => void;
  onPrivacyClick?: () => void;
  onHelpClick?: () => void;
  onAboutClick?: () => void;
  onContactClick?: () => void;
  onAccessibilityClick?: () => void;
  onDashboardClick?: () => void;
  onUserLogin?: () => void;
  isUserLoggedIn?: boolean;
  onLogout?: () => void;
  userData?: {
    name: string;
    email: string;
    image: string;
  };
  onUserDashboardClick?: (tab?: string) => void;
  onProfileClick?: () => void;
};

export function LandingPage({ 
  onGetStarted, 
  onCategorySelect, 
  onProAccess, 
  onTermsClick, 
  onPrivacyClick, 
  onHelpClick, 
  onAboutClick, 
  onContactClick, 
  onAccessibilityClick, 
  onDashboardClick,
  onUserLogin,
  isUserLoggedIn,
  onLogout,
  userData,
  onUserDashboardClick,
  onProfileClick
}: LandingPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGuarantee, setSelectedGuarantee] = useState<14 | 30>(14);

  // Location context for sharing across components
  const { userLocation, setUserLocation, updateCurrentPosition, isLocating: contextIsLocating, locationType, locationError } = useUserLocation();
  
  // Booking context for persisting data across pages
  const { bookingData, setCategory, setAddress, setAdditionalDetails: setCtxAdditionalDetails, setBookingType: setBookingCtxType, setScheduledDateTime } = useBooking();

  // Booking widget state - initialized from BookingContext or LocationContext for persistence
  const [selectedService, setSelectedService] = useState<string | null>(bookingData.selectedCategory || null);
  const [bookingType, setBookingType] = useState<'now' | 'scheduled'>(bookingData.bookingType || 'now');
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [userAddress, setUserAddress] = useState(bookingData.address || userLocation?.address || '');
  const [isAddressValidated, setIsAddressValidated] = useState(
    !!(bookingData.address && bookingData.coordinates) || !!(userLocation?.coords)
  );
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(
    bookingData.coordinates || userLocation?.coords || null
  );
  const [additionalDetails, setAdditionalDetails] = useState(bookingData.additionalDetails || '');
  const [scheduledDate, setScheduledDate] = useState(bookingData.scheduledDate || '');
  const [scheduledTime, setScheduledTime] = useState(bookingData.scheduledTime || '');
  const [isLocating, setIsLocating] = useState(false);
  const isAutoDetected = bookingData.isAutoDetected || locationType === 'current';
  
  const isValidForSubmission = isAddressValidated || (isAutoDetected && !!selectedCoords);
  
  const { slots: timeSlots, isSlotValid, firstAvailable } = useAvailableSlots(scheduledDate);
  
  useEffect(() => {
    if (scheduledTime && !isSlotValid(scheduledTime)) {
      setScheduledTime(firstAvailable || '');
    }
  }, [scheduledDate, scheduledTime, isSlotValid, firstAvailable]);
  
  useEffect(() => {
    if (userLocation) {
      setUserAddress(userLocation.address);
      if (userLocation.coords) {
        setSelectedCoords(userLocation.coords);
        setIsAddressValidated(true);
        setAddress(userLocation.address, userLocation.coords, userLocation.type === 'current');
      }
    }
  }, [userLocation, setAddress]);

  useEffect(() => {
    if (!userLocation && !bookingData.address) {
      updateCurrentPosition();
    }
  }, []);
  
  const handleLocateMe = async () => {
    setIsLocating(true);
    await updateCurrentPosition();
    setIsLocating(false);
    
    if (userLocation?.coords) {
      onGetStarted({ 
        address: userLocation.address, 
        lat: userLocation.coords.lat, 
        lng: userLocation.coords.lng 
      }, selectedService);
    }
  };

  const handleQuickAddress = (place: string) => {
    const addresses: Record<string, { address: string; lat: number; lng: number }> = {
      'הבית': { address: 'דיזינגוף 100, תל אביב', lat: 32.0793, lng: 34.7743 },
      'עבודה': { address: 'מנחם בגין 120, תל אביב', lat: 32.0731, lng: 34.7925 },
      'הורים': { address: 'הרצל 50, רמת גן', lat: 32.0833, lng: 34.8167 }
    };
    if (addresses[place]) {
      setUserAddress(addresses[place].address);
      setSelectedCoords({ lat: addresses[place].lat, lng: addresses[place].lng });
      setIsAddressValidated(true);
      
      setUserLocation({
        address: addresses[place].address,
        coords: { lat: addresses[place].lat, lng: addresses[place].lng },
        details: additionalDetails,
        type: 'manual'
      });
      
      // Save to BookingContext
      setAddress(addresses[place].address, { lat: addresses[place].lat, lng: addresses[place].lng }, false);
      
      onGetStarted(addresses[place], selectedService);
    }
  };

  const handleAddressChange = (value: string) => {
    setUserAddress(value);
    setSelectedCoords(null);
    setIsAddressValidated(false);
  };

  const handleAddressSelect = (data: { address: string; lat: number; lng: number }) => {
    setUserAddress(data.address);
    setSelectedCoords({ lat: data.lat, lng: data.lng });
    setIsAddressValidated(true);
    setUserLocation({
      address: data.address,
      coords: { lat: data.lat, lng: data.lng },
      details: additionalDetails,
      type: 'manual'
    });
    
    // Save to BookingContext
    setAddress(data.address, { lat: data.lat, lng: data.lng }, false);
    
    if (data.lat && data.lng) {
      onGetStarted({ address: data.address, lat: data.lat, lng: data.lng }, selectedService);
    }
  };

  const handleContinueToMap = () => {
    if (!selectedService || !isValidForSubmission || !selectedCoords) {
      return;
    }
    
    setCtxAdditionalDetails(additionalDetails);
    setBookingCtxType(bookingType);
    if (bookingType === 'scheduled') {
      setScheduledDateTime(scheduledDate, scheduledTime);
    }
    
    setAddress(userAddress, selectedCoords, isAutoDetected);
    onGetStarted({ address: userAddress, lat: selectedCoords.lat, lng: selectedCoords.lng }, selectedService);
  };

  const { categories, isLoading: categoriesLoading } = useCategories();

  const handleCategorySelect = (id: string, name: string) => {
    setSelectedService(name);
    onCategorySelect(id);
    
    // Save to BookingContext for persistence
    const category = categories.find(cat => cat.id === id);
    setCategory(id, name, category?.icon);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 pt-24 md:pt-32" dir="rtl">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3">
          {/* Mobile: Two-row layout, Desktop: Single row */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <BeadyLogo size="md" />
            </div>

            {/* Service Search - Hidden on mobile, visible on tablet+ */}
            <div className="hidden md:flex flex-1 relative min-w-0">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="שירות..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-9 pl-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
              />
            </div>

            {/* Location Input - Hidden on mobile, visible on tablet+ */}
            <div className="hidden md:flex relative w-40 lg:w-52 flex-shrink-0">
              <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              {isAutoDetected && userAddress ? (
                <button
                  onClick={() => {
                    setUserLocation(null);
                    setUserAddress('');
                    setIsAddressValidated(false);
                  }}
                  className="w-full pr-9 pl-9 py-2 rounded-lg border border-blue-200 bg-blue-50 text-right text-sm text-blue-600 font-medium truncate"
                  title={userAddress}
                >
                  המיקום הנוכחי שלך
                </button>
              ) : (
                <input
                  type="text"
                  placeholder="כתובת"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pr-9 pl-9 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                />
              )}
              <button 
                onClick={handleLocateMe}
                disabled={isLocating}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                title="השתמש במיקום שלי"
              >
                <Locate className={`w-4 h-4 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Spacer for mobile */}
            <div className="flex-1 md:hidden" />

            {/* Filters Button */}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg border transition-all flex items-center justify-center flex-shrink-0 ${
                showFilters 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
              title="מסננים"
            >
              <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Espace Pro Button */}
            <button
              onClick={onProAccess}
              className="text-gray-700 hover:text-gray-900 transition-colors px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100 hidden lg:flex items-center gap-2 flex-shrink-0"
            >
              <Briefcase className="w-4 h-4" />
              <span className="text-sm">אזור מקצועי</span>
            </button>

            {/* User Button */}
            <div className="relative flex items-center">
              {isUserLoggedIn ? (
                <button
                  onClick={onProfileClick}
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full hover:ring-2 hover:ring-blue-300 transition-all flex-shrink-0 overflow-hidden"
                >
                  {userData?.image ? (
                    <img 
                      src={userData.image} 
                      alt={userData.name || 'User'} 
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                      {userData?.name ? userData.name.charAt(0).toUpperCase() : <User className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </div>
                  )}
                </button>
              ) : (
                <button
                  onClick={onUserLogin}
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0 text-gray-600 hover:text-gray-700 bg-gray-50 border border-gray-200"
                  title="פרופיל"
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>

            {/* CTA Button */}
            <button
              onClick={() => onGetStarted()}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all text-xs sm:text-sm flex-shrink-0"
            >
              התחל
            </button>
          </div>

          {/* Service Filter Chips */}
          {showFilters && (
            <div className="mt-2 sm:mt-3 flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
              <button
                onClick={() => setSelectedService(null)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 sm:gap-2 text-sm ${
                  !selectedService
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>כל השירותים</span>
              </button>
              {categories.map((cat) => {
                const displayName = cat.nameHe || cat.name;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedService(displayName)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 sm:gap-2 text-sm ${
                      selectedService === displayName
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
      </nav>

      {/* Hero Section with animated gradient */}
      <section className="pt-8 md:pt-8 pb-8 sm:pb-12 lg:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 animate-gradient-shift"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-100/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Hero Text - Hidden on mobile, shown on lg+ */}
            <motion.div 
              className="hidden lg:block text-right"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 px-4 py-2 rounded-full mb-6 border border-blue-200"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="text-sm">מופעל על ידי Beedy AI Bidding Engine</span>
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">AI</span>
              </motion.div>
              <motion.h1 
                className="text-5xl lg:text-7xl mb-6 text-gray-900 tracking-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent">
                  שירות מהיר עם אחריות מלאה
                </span>
              </motion.h1>
              <motion.p 
                className="text-xl lg:text-2xl text-gray-600 mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
              >
                צלמו את הבעיה שלכם, <span className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-2 py-1 rounded-lg">
                  <Sparkles className="w-4 h-4 animate-spin-slow" />
                  הבינה המלאכותית שלנו מנתחת אותה
                </span> ואתם מקבלים מיד הצעות מחיר קבועות ממקצוענים מוסמכים. פשוט, מהיר, שקוף.
              </motion.p>
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-start"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.7 }}
              >
                <button
                  onClick={() => onGetStarted()}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 inline-flex items-center justify-center gap-2 text-lg group"
                >
                  מצא מקצוען
                  <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform rotate-180" />
                </button>
                <button
                  onClick={onProAccess}
                  className="bg-white border-2 border-gray-200 text-gray-900 px-8 py-4 rounded-xl hover:border-gray-300 hover:shadow-lg hover:scale-105 transition-all duration-300 inline-flex items-center justify-center gap-2 text-lg"
                >
                  הפוך לשותף
                  <LogIn className="w-5 h-5" />
                </button>
              </motion.div>
              <motion.div 
                className="flex items-center gap-6 mt-8 text-sm text-gray-500 justify-start flex-wrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
              >
                <motion.div 
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>ללא התחייבות</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>מחיר קבוע מובטח</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <Shield className="w-5 h-5 text-green-600" />
                  <span>אחריות 14-30 יום</span>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Booking Card - Full width on mobile, fixed width on desktop */}
            <motion.div 
              className="relative flex justify-center lg:justify-end order-first lg:order-last mt-4 md:mt-0"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            >
              <motion.div 
                className="flex flex-col w-full max-w-sm sm:max-w-md lg:w-[360px]" 
                dir="rtl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div 
                  className="md:hidden w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-2 cursor-pointer hover:bg-gray-300 active:scale-125 transition-all"
                  onClick={() => setIsPanelExpanded(!isPanelExpanded)}
                ></div>

                <JobDetailsCard
                  isReadOnly={false}
                  categories={categories}
                  selectedCategory={selectedService}
                  onCategorySelect={handleCategorySelect}
                  categoriesLoading={categoriesLoading}
                  address={userAddress}
                  onAddressChange={handleAddressChange}
                  onAddressSelect={handleAddressSelect}
                  isAutoDetected={isAutoDetected}
                  isAddressValidated={isValidForSubmission}
                  locationError={locationError}
                  isLocating={isLocating || contextIsLocating}
                  onLocateMe={handleLocateMe}
                  onClearLocation={() => {
                    setUserLocation(null);
                    setUserAddress('');
                    setIsAddressValidated(false);
                  }}
                  additionalDetails={additionalDetails}
                  onAdditionalDetailsChange={(value) => setAdditionalDetails(value)}
                  onQuickAddress={handleQuickAddress}
                  bookingType={bookingType}
                  onBookingTypeChange={(type) => setBookingType(type)}
                  scheduledDate={scheduledDate}
                  scheduledTime={scheduledTime}
                  onScheduledDateChange={(date) => setScheduledDate(date)}
                  onScheduledTimeChange={(time) => setScheduledTime(time)}
                  timeSlots={timeSlots}
                  getMinDate={getMinDate}
                  formatScheduledDateTime={formatScheduledDateTime}
                >
                  <div className="mt-4 pt-4 border-t border-gray-100 bg-white rounded-b-2xl -mx-5 px-5 -mb-5 pb-5">
                    <button 
                      onClick={handleContinueToMap}
                      disabled={!selectedService || !isValidForSubmission}
                      className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2 ${
                        selectedService && isValidForSubmission
                          ? 'bg-blue-600 text-white shadow-gray-200 hover:bg-black hover:scale-[1.02] active:scale-[0.98] cursor-pointer' 
                          : 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed'
                      }`}
                    >
                      <span>{!isValidForSubmission ? 'נא להזין כתובת תקינה' : selectedService ? `מצא מקצוען ל${selectedService}` : 'בחר שירות להמשך'}</span>
                    </button>
                    {(!selectedService || !isValidForSubmission) && (
                      <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs text-amber-800 text-center font-bold flex items-center justify-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {!isValidForSubmission && !selectedService ? 'יש להזין כתובת ולבחור שירות' : !isValidForSubmission ? 'יש להזין כתובת מלאה מרשימת ההשלמה האוטומטית' : 'יש לבחור שירות כדי להמשיך'}
                        </p>
                      </div>
                    )}

                    <div className="mt-3 text-center relative group">
                      <button className="text-[10px] text-gray-400 group-hover:text-blue-600 flex items-center justify-center gap-1.5 mx-auto transition-colors">
                        <HelpCircle className="w-3 h-3 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">איך עובד המכרז?</span>
                      </button>

                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-[290px] bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform translate-y-2 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-xs font-black text-gray-900">תהליך המכרז החכם</h4>
                          <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">AI</span>
                        </div>
                        
                        <div className="relative flex justify-between items-start mb-3">
                          <div className="absolute top-3 left-2 right-2 h-0.5 bg-gray-100 -z-10"></div>
                          
                          <div className="flex flex-col items-center gap-1.5 bg-white px-1">
                            <div className="w-6 h-6 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 text-gray-600 shadow-sm">
                              <Smartphone className="w-3 h-3" />
                            </div>
                            <span className="text-[9px] font-bold text-gray-500">בקשה</span>
                          </div>

                          <div className="flex flex-col items-center gap-1.5 bg-white px-1">
                            <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100 text-blue-600 shadow-sm animate-pulse">
                              <Sparkles className="w-3 h-3" />
                            </div>
                            <span className="text-[9px] font-bold text-blue-600">ניתוח</span>
                          </div>

                          <div className="flex flex-col items-center gap-1.5 bg-white px-1">
                            <div className="w-6 h-6 bg-purple-50 rounded-full flex items-center justify-center border border-purple-100 text-purple-600 shadow-sm">
                              <DollarSign className="w-3 h-3" />
                            </div>
                            <span className="text-[9px] font-bold text-gray-500">הצעות</span>
                          </div>

                          <div className="flex flex-col items-center gap-1.5 bg-white px-1">
                            <div className="w-6 h-6 bg-green-50 rounded-full flex items-center justify-center border border-green-100 text-green-600 shadow-sm">
                              <CheckCircle className="w-3 h-3" />
                            </div>
                            <span className="text-[9px] font-bold text-gray-500">ביצוע</span>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-2.5 text-[9px] text-gray-500 leading-relaxed text-right">
                          <span className="font-bold text-gray-900">Beedy AI</span> סורק בזמן אמת מאות מקצוענים באזורך, ומנהל עבורך משא ומתן אוטומטי להשגת המחיר הטוב ביותר.
                        </div>

                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white transform rotate-45 border-r border-b border-gray-100"></div>
                      </div>
                    </div>

                    {/* Small guarantee badges */}
                    <div className="mt-3 flex items-center justify-center gap-3">
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                        <Shield className="w-3 h-3 text-green-500" />
                        <span>אחריות 14 יום</span>
                      </div>
                      <div className="w-px h-3 bg-gray-200"></div>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                        <Home className="w-3 h-3 text-blue-500" />
                        <span>שירות עד הבית</span>
                      </div>
                    </div>
                  </div>
                </JobDetailsCard>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {[
              { value: '+10K', label: 'שירותים בוצעו' },
              { value: '+2K', label: 'מקצוענים פעילים' },
              { value: '4.9', label: 'דירוג ממוצע' },
              { value: '98%', label: 'לקוחות מרוצים' }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <motion.div 
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2"
                  whileHover={{ scale: 1.1 }}
                >
                  {stat.value}
                </motion.div>
                <p className="text-gray-600 text-sm sm:text-base">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 sm:py-16 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-8 sm:mb-12 lg:mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-3 sm:mb-4 border border-blue-200"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 animate-spin-slow" />
              <span className="text-xs sm:text-sm">שירותים פופולריים</span>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl lg:text-6xl text-gray-900 mb-4 sm:mb-6">
              גלו את הקטגוריות שלנו
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              מקצוענים מוסמכים לכל הצרכים הביתיים שלכם
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {/* Cleaning */}
            <motion.button
              onClick={() => onCategorySelect('cleaning')}
              className="group relative h-48 sm:h-64 lg:h-80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <div className="absolute inset-0">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1649073000644-d839009ff2dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbmluZyUyMHNlcnZpY2UlMjBob21lfGVufDF8fHx8MTc2NDI3Mjc3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="ניקיון"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 transition-all duration-300"></div>
              </div>
              <div className="absolute bottom-0 right-0 left-0 p-3 sm:p-4 lg:p-6 text-right">
                <div className="hidden sm:inline-flex items-center gap-2 bg-blue-500/90 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs mb-2 sm:mb-3">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></span>
                  פופולרי
                </div>
                <h3 className="text-lg sm:text-2xl lg:text-3xl text-white mb-1 sm:mb-2 group-hover:translate-x-1 transition-transform">ניקיון</h3>
                <p className="text-white/90 text-[10px] sm:text-xs lg:text-sm mb-1 sm:mb-3 line-clamp-2">שירותי ניקיון מקצועיים לבית ולעסק</p>
                <div className="hidden sm:flex items-center gap-2 text-white/80 text-xs sm:text-sm">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>+230 מקצוענים</span>
                </div>
              </div>
            </motion.button>

            {/* Plumbing */}
            <motion.button
              onClick={() => onCategorySelect('plumbing')}
              className="group relative h-48 sm:h-64 lg:h-80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <div className="absolute inset-0">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1726931535180-d27a2ffd7474?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbHVtYmVyJTIwZml4aW5nJTIwcGlwZXxlbnwxfHx8fDE3NjQxOTQ1MzZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="אינסטלציה"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 transition-all duration-300"></div>
              </div>
              <div className="absolute bottom-0 right-0 left-0 p-3 sm:p-4 lg:p-6 text-right">
                <h3 className="text-lg sm:text-2xl lg:text-3xl text-white mb-1 sm:mb-2 group-hover:translate-x-1 transition-transform">אינסטלציה</h3>
                <p className="text-white/90 text-[10px] sm:text-xs lg:text-sm mb-1 sm:mb-3 line-clamp-2">תיקון נזילות, התקנות ושדרוגים</p>
                <div className="hidden sm:flex items-center gap-2 text-white/80 text-xs sm:text-sm">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>+180 מקצוענים</span>
                </div>
              </div>
            </motion.button>

            {/* Electrician */}
            <motion.button
              onClick={() => onCategorySelect('electrical')}
              className="group relative h-48 sm:h-64 lg:h-80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <div className="absolute inset-0">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1660330589693-99889d60181e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpY2lhbiUyMHdvcmtpbmd8ZW58MXx8fHwxNzY0MjMzNjk5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="חשמל"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 transition-all duration-300"></div>
              </div>
              <div className="absolute bottom-0 right-0 left-0 p-3 sm:p-4 lg:p-6 text-right">
                <h3 className="text-lg sm:text-2xl lg:text-3xl text-white mb-1 sm:mb-2 group-hover:translate-x-1 transition-transform">חשמל</h3>
                <p className="text-white/90 text-[10px] sm:text-xs lg:text-sm mb-1 sm:mb-3 line-clamp-2">חשמלאים מוסמכים לכל סוגי העבודות</p>
                <div className="hidden sm:flex items-center gap-2 text-white/80 text-xs sm:text-sm">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>+150 מקצוענים</span>
                </div>
              </div>
            </motion.button>

            {/* Beauty */}
            <motion.button
              onClick={() => onCategorySelect('beauty')}
              className="group relative h-48 sm:h-64 lg:h-80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <div className="absolute inset-0">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1711274094763-ff442e4719ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBzYWxvbiUyMG1hbmljdXJlfGVufDF8fHx8MTc2NDI3MDk2OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="יופי"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 transition-all duration-300"></div>
              </div>
              <div className="absolute bottom-0 right-0 left-0 p-3 sm:p-4 lg:p-6 text-right">
                <div className="hidden sm:inline-flex items-center gap-2 bg-pink-500/90 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs mb-2 sm:mb-3">
                  <Star className="w-2 h-2 sm:w-3 sm:h-3 fill-white" />
                  מבוקש
                </div>
                <h3 className="text-lg sm:text-2xl lg:text-3xl text-white mb-1 sm:mb-2 group-hover:translate-x-1 transition-transform">יופי</h3>
                <p className="text-white/90 text-[10px] sm:text-xs lg:text-sm mb-1 sm:mb-3 line-clamp-2">מניקור, פדיקור, איפור ועיצוב שיער</p>
                <div className="hidden sm:flex items-center gap-2 text-white/80 text-xs sm:text-sm">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>+320 מקצוענים</span>
                </div>
              </div>
            </motion.button>

            {/* Renovation */}
            <button
              onClick={() => onCategorySelect('renovation')}
              className="group relative h-48 sm:h-64 lg:h-80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="absolute inset-0">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1618832515490-e181c4794a45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwcmVub3ZhdGlvbiUyMGNvbnN0cnVjdGlvbnxlbnwxfHx8fDE3NjQyNTEwMjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="שיפוצים"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              </div>
              <div className="absolute bottom-0 right-0 left-0 p-3 sm:p-4 lg:p-6 text-right">
                <h3 className="text-lg sm:text-2xl lg:text-3xl text-white mb-1 sm:mb-2">שיפוצים</h3>
                <p className="text-white/90 text-[10px] sm:text-xs lg:text-sm mb-1 sm:mb-3 line-clamp-2">שיפוץ דירות, בתים ומשרדים</p>
                <div className="hidden sm:flex items-center gap-2 text-white/80 text-xs sm:text-sm">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>+200 מקצוענים</span>
                </div>
              </div>
            </button>

            {/* Gardening */}
            <button
              onClick={() => onCategorySelect('gardening')}
              className="group relative h-48 sm:h-64 lg:h-80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="absolute inset-0">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1560879142-d339f75e2cc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYXJkZW5pbmclMjBwbGFudHMlMjBvdXRkb29yfGVufDF8fHx8MTc2NDI3Mjc5MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="גינון"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              </div>
              <div className="absolute bottom-0 right-0 left-0 p-3 sm:p-4 lg:p-6 text-right">
                <h3 className="text-lg sm:text-2xl lg:text-3xl text-white mb-1 sm:mb-2">גינון</h3>
                <p className="text-white/90 text-[10px] sm:text-xs lg:text-sm mb-1 sm:mb-3 line-clamp-2">טיפול בגינה, גיזום ועיצוב נוף</p>
                <div className="hidden sm:flex items-center gap-2 text-white/80 text-xs sm:text-sm">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>+95 מקצוענים</span>
                </div>
              </div>
            </button>

            {/* Air Conditioning */}
            <button
              onClick={() => onCategorySelect('ac')}
              className="group relative h-48 sm:h-64 lg:h-80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="absolute inset-0">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1647022528152-52ed9338611d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaXIlMjBjb25kaXRpb25pbmclMjByZXBhaXJ8ZW58MXx8fHwxNzY0MjY2MTkzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="מיזוג אוויר"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              </div>
              <div className="absolute bottom-0 right-0 left-0 p-3 sm:p-4 lg:p-6 text-right">
                <h3 className="text-lg sm:text-2xl lg:text-3xl text-white mb-1 sm:mb-2">מיזוג אוויר</h3>
                <p className="text-white/90 text-[10px] sm:text-xs lg:text-sm mb-1 sm:mb-3 line-clamp-2">התקנה, תיקון ותחזוקה</p>
                <div className="hidden sm:flex items-center gap-2 text-white/80 text-xs sm:text-sm">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>+120 מקצוענים</span>
                </div>
              </div>
            </button>

            {/* Painting */}
            <button
              onClick={() => onCategorySelect('painting')}
              className="group relative h-48 sm:h-64 lg:h-80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="absolute inset-0">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1688372199140-cade7ae820fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWludGluZyUyMHdhbGwlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NjQyNzI3OTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="צביעה"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              </div>
              <div className="absolute bottom-0 right-0 left-0 p-3 sm:p-4 lg:p-6 text-right">
                <h3 className="text-lg sm:text-2xl lg:text-3xl text-white mb-1 sm:mb-2">צביעה</h3>
                <p className="text-white/90 text-[10px] sm:text-xs lg:text-sm mb-1 sm:mb-3 line-clamp-2">צבעים פנים וחוץ, איטום וגימור</p>
                <div className="hidden sm:flex items-center gap-2 text-white/80 text-xs sm:text-sm">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>+140 מקצוענים</span>
                </div>
              </div>
            </button>

            {/* Moving */}
            <button
              onClick={() => onCategorySelect('moving')}
              className="group relative h-48 sm:h-64 lg:h-80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="absolute inset-0">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1600725935160-f67ee4f6084a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpbmclMjBib3hlcyUyMGRlbGl2ZXJ5fGVufDF8fHx8MTc2NDI3Mjc5OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="הובלות"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              </div>
              <div className="absolute bottom-0 right-0 left-0 p-3 sm:p-4 lg:p-6 text-right">
                <h3 className="text-lg sm:text-2xl lg:text-3xl text-white mb-1 sm:mb-2">הובלות</h3>
                <p className="text-white/90 text-[10px] sm:text-xs lg:text-sm mb-1 sm:mb-3 line-clamp-2">הובלת דירות ומשרדים באמינות</p>
                <div className="hidden sm:flex items-center gap-2 text-white/80 text-xs sm:text-sm">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>+85 מקצוענים</span>
                </div>
              </div>
            </button>

            {/* Pet Grooming */}
            <button
              onClick={() => onGetStarted()}
              className="group relative h-48 sm:h-64 lg:h-80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="absolute inset-0">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1733210872526-863e2f16cf39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjBncm9vbWluZyUyMGRvZ3xlbnwxfHx8fDE3NjQyNzI4MDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="טיפוח חיות מחמד"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              </div>
              <div className="absolute bottom-0 right-0 left-0 p-3 sm:p-4 lg:p-6 text-right">
                <h3 className="text-lg sm:text-2xl lg:text-3xl text-white mb-1 sm:mb-2">טיפוח חיות</h3>
                <p className="text-white/90 text-[10px] sm:text-xs lg:text-sm mb-1 sm:mb-3 line-clamp-2">רחצה, תספורת וטיפוח מלא</p>
                <div className="hidden sm:flex items-center gap-2 text-white/80 text-xs sm:text-sm">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>+65 מקצוענים</span>
                </div>
              </div>
            </button>

            {/* Car Wash */}
            <button
              onClick={() => onGetStarted()}
              className="group relative h-48 sm:h-64 lg:h-80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="absolute inset-0">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1698307861902-1b8a64f9be19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjB3YXNoaW5nJTIwc2VydmljZXxlbnwxfHx8fDE3NjQyNzI4MDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="שטיפת רכבים"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              </div>
              <div className="absolute bottom-0 right-0 left-0 p-3 sm:p-4 lg:p-6 text-right">
                <h3 className="text-lg sm:text-2xl lg:text-3xl text-white mb-1 sm:mb-2">שטיפת רכב</h3>
                <p className="text-white/90 text-[10px] sm:text-xs lg:text-sm mb-1 sm:mb-3 line-clamp-2">שטיפה חיצונית, פנימית וליטוש</p>
                <div className="hidden sm:flex items-center gap-2 text-white/80 text-xs sm:text-sm">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>+75 מקצוענים</span>
                </div>
              </div>
            </button>

            {/* Locksmith */}
            <button
              onClick={() => onGetStarted()}
              className="group relative h-48 sm:h-64 lg:h-80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="absolute inset-0">
                <ImageWithFallback
                  src="https://images.unsplash.com/flagged/photo-1564767609213-c75ee685263a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb2Nrc21pdGglMjBrZXklMjBzZXJ2aWNlfGVufDF8fHx8MTc2NDI3MjgwNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="מנעולן"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              </div>
              <div className="absolute bottom-0 right-0 left-0 p-3 sm:p-4 lg:p-6 text-right">
                <div className="hidden sm:inline-flex items-center gap-2 bg-red-500/90 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs mb-2 sm:mb-3">
                  <Zap className="w-2 h-2 sm:w-3 sm:h-3" />
                  24/7
                </div>
                <h3 className="text-lg sm:text-2xl lg:text-3xl text-white mb-1 sm:mb-2">מנעולן</h3>
                <p className="text-white/90 text-[10px] sm:text-xs lg:text-sm mb-1 sm:mb-3 line-clamp-2">פריצת דלתות וחילוף מנעולים</p>
                <div className="hidden sm:flex items-center gap-2 text-white/80 text-xs sm:text-sm">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>+110 מקצוענים</span>
                </div>
              </div>
            </button>
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <button
              onClick={() => onGetStarted()}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:shadow-2xl hover:shadow-blue-500/50 transition-all group text-sm sm:text-base"
            >
              <span>צפו בכל הקטגוריות</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Bidding Process Section */}
      <section className="py-12 sm:py-16 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-3 sm:mb-4">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">תהליך פשוט ומהיר</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-6xl text-gray-900 mb-4 sm:mb-6">
              איך זה עובד?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              תהליך המכרז החכם של Beedy חוסך לכם זמן וכסף ב-4 צעדים פשוטים
            </p>
          </div>

          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-100 via-purple-100 to-green-100 -z-10 transform -translate-y-1/2"></div>

            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white rounded-full flex items-center justify-center mb-3 sm:mb-4 lg:mb-6 border-2 sm:border-4 border-blue-50 group-hover:border-blue-100 transition-all shadow-lg group-hover:scale-105 sm:group-hover:scale-110 duration-300 z-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                </div>
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-2 sm:border-4 border-white">1</div>
              </div>
              <h3 className="text-sm sm:text-base lg:text-xl font-bold text-gray-900 mb-1 sm:mb-2 lg:mb-3">פרסם משימה</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed px-1">
                תאר את הצורך שלך, צלם תמונה או וידאו
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white rounded-full flex items-center justify-center mb-3 sm:mb-4 lg:mb-6 border-2 sm:border-4 border-purple-50 group-hover:border-purple-100 transition-all shadow-lg group-hover:scale-105 sm:group-hover:scale-110 duration-300 z-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                </div>
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-2 sm:border-4 border-white">2</div>
              </div>
              <h3 className="text-sm sm:text-base lg:text-xl font-bold text-gray-900 mb-1 sm:mb-2 lg:mb-3">קבל הצעות</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed px-1">
                קבל 3-5 הצעות מחיר קבועות תוך דקות
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white rounded-full flex items-center justify-center mb-3 sm:mb-4 lg:mb-6 border-2 sm:border-4 border-yellow-50 group-hover:border-yellow-100 transition-all shadow-lg group-hover:scale-105 sm:group-hover:scale-110 duration-300 z-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                </div>
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-2 sm:border-4 border-white">3</div>
              </div>
              <h3 className="text-sm sm:text-base lg:text-xl font-bold text-gray-900 mb-1 sm:mb-2 lg:mb-3">בחר את הטוב</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed px-1">
                השווה מחירים, דירוגים וזמינות
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative flex flex-col items-center text-center group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white rounded-full flex items-center justify-center mb-3 sm:mb-4 lg:mb-6 border-2 sm:border-4 border-green-50 group-hover:border-green-100 transition-all shadow-lg group-hover:scale-105 sm:group-hover:scale-110 duration-300 z-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                </div>
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-2 sm:border-4 border-white">4</div>
              </div>
              <h3 className="text-sm sm:text-base lg:text-xl font-bold text-gray-900 mb-1 sm:mb-2 lg:mb-3">ביצוע ותשלום</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed px-1">
                המקצוען מגיע ותשלום לאחר סיום
              </p>
            </div>
          </div>

          <div className="text-center mt-8 sm:mt-12 lg:mt-16">
            <button
              onClick={() => onGetStarted()}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:shadow-xl hover:shadow-blue-500/30 transition-all text-sm sm:text-lg group"
            >
              התחל עכשיו - זה חינם
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform rotate-180" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-3 sm:mb-4">
              <Star className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">יתרונות</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-6xl text-gray-900 mb-4 sm:mb-6">
              למה לבחור ב-Beedy?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              הפלטפורמה הראשונה המשלבת <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-sm">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                בינה מלאכותית
              </span> ושירותים ביתיים לחוויה שקופה לחלוטין
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all group">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 lg:mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Video className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl mb-2 sm:mb-3 text-gray-900 flex items-center gap-2 flex-wrap">
                ניתוח וידאו AI
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  AI
                </span>
              </h3>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed">
                מנוע הבינה המלאכותית מנתח את הסרטונים שלכם בזמן אמת
              </p>
            </div>
            
            <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-xl transition-all group">
              <div className="bg-gradient-to-br from-green-500 to-green-600 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 lg:mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl mb-2 sm:mb-3 text-gray-900 flex items-center gap-2 flex-wrap">
                מחירים מובטחים
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs">
                  100%
                </span>
              </h3>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed">
                הצעות מחיר קבועות וסופיות. ללא הפתעות
              </p>
            </div>
            
            <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all group">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 lg:mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl mb-2 sm:mb-3 text-gray-900">מקצוענים מאומתים</h3>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed">
                כל המקצוענים שלנו מאומתים ומדורגים על ידי הקהילה
              </p>
            </div>
            
            <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-xl transition-all group">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 lg:mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl mb-2 sm:mb-3 text-gray-900">התערבות מהירה</h3>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed">
                מקצוענים זמינים בזמן אמת, התערבות באותו יום
              </p>
            </div>
            
            <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-gray-100 hover:border-pink-200 hover:shadow-xl transition-all group">
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 lg:mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl mb-2 sm:mb-3 text-gray-900">מיקום גיאוגרפי</h3>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed">
                מצאו באופן מיידי את המקצוענים הקרובים אליכם
              </p>
            </div>
            
            <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-gray-100 hover:border-cyan-200 hover:shadow-xl transition-all group">
              <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 lg:mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl mb-2 sm:mb-3 text-gray-900">100% מובייל</h3>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed">
                צלמו, השוו והזמינו ישירות מהסמארטפון שלכם
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="py-12 sm:py-16 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-3 sm:mb-4 border border-green-200">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">אחריות מלאה</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-6xl text-gray-900 mb-4 sm:mb-6">
              אחריות על כל שירות
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              כל שירות מגיע עם אחריות מלאה. אנחנו עומדים מאחורי העבודה של המקצוענים שלנו
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
            {/* Standard Guarantee - 14 Days */}
            <div 
              onClick={() => setSelectedGuarantee(14)}
              className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-10 border-2 transition-all cursor-pointer relative overflow-hidden ${
                selectedGuarantee === 14 
                  ? 'border-green-500 shadow-xl sm:shadow-2xl shadow-green-500/20 scale-[1.02] sm:scale-105' 
                  : 'border-gray-200 hover:border-green-300 hover:shadow-lg'
              }`}
            >
              {selectedGuarantee === 14 && (
                <div className="absolute top-3 left-3 sm:top-6 sm:left-6 bg-green-500 text-white px-2 sm:px-4 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  נבחר
                </div>
              )}
              
              <div className="text-center mb-4 sm:mb-6 lg:mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-xl sm:rounded-2xl mb-3 sm:mb-4">
                  <Shield className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-green-600" />
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl text-gray-900 mb-1 sm:mb-2">אחריות סטנדרטית</h3>
                <div className="flex items-center justify-center gap-1 sm:gap-2 mb-2 sm:mb-4">
                  <span className="text-3xl sm:text-4xl lg:text-5xl text-green-600">14</span>
                  <span className="text-lg sm:text-xl lg:text-2xl text-gray-600">ימים</span>
                </div>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600">כלולה בכל שירות</p>
              </div>

              <div className="space-y-2 sm:space-y-3 lg:space-y-4 mb-4 sm:mb-6 lg:mb-8">
                <div className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm lg:text-base text-gray-700">החזר מלא או תיקון חינם</p>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm lg:text-base text-gray-700">כיסוי לכל בעיה קשורה לשירות</p>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm lg:text-base text-gray-700">תמיכה זמינה 24/7</p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 text-center">
                <p className="text-xs sm:text-sm lg:text-base text-green-700">✓ כלול בכל הזמנה</p>
              </div>
            </div>

            {/* Extended Guarantee - 30 Days */}
            <div 
              onClick={() => setSelectedGuarantee(30)}
              className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-10 border-2 transition-all cursor-pointer relative overflow-hidden ${
                selectedGuarantee === 30 
                  ? 'border-blue-500 shadow-xl sm:shadow-2xl shadow-blue-500/20 scale-[1.02] sm:scale-105' 
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-lg'
              }`}
            >
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-1 sm:py-2 text-center text-xs sm:text-sm">
                אחריות מורחבת
              </div>
              
              {selectedGuarantee === 30 && (
                <div className="absolute top-10 sm:top-14 left-3 sm:left-6 bg-blue-500 text-white px-2 sm:px-4 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  נבחר
                </div>
              )}
              
              <div className="text-center mb-4 sm:mb-6 lg:mb-8 mt-6 sm:mt-8">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-100 to-purple-200 rounded-xl sm:rounded-2xl mb-3 sm:mb-4">
                  <Shield className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-blue-600" />
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl text-gray-900 mb-1 sm:mb-2">אחריות מורחבת</h3>
                <div className="flex items-center justify-center gap-1 sm:gap-2 mb-2 sm:mb-4">
                  <span className="text-3xl sm:text-4xl lg:text-5xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">30</span>
                  <span className="text-lg sm:text-xl lg:text-2xl text-gray-600">ימים</span>
                </div>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600">הגנה מקסימלית</p>
              </div>

              <div className="space-y-2 sm:space-y-3 lg:space-y-4 mb-4 sm:mb-6 lg:mb-8">
                <div className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm lg:text-base text-gray-700">כל יתרונות האחריות הסטנדרטית</p>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm lg:text-base text-gray-700">30 ימים כיסוי מורחב</p>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm lg:text-base text-gray-700">שירות VIP ועדיפות בתמיכה</p>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm lg:text-base text-gray-700">ביקור חוזר חינם</p>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm lg:text-base text-gray-700">כיסוי מורחב לנזקים עקיפים</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4">
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <span className="text-xs sm:text-sm lg:text-base text-gray-700">עלות נוספת:</span>
                  <span className="text-lg sm:text-xl lg:text-2xl text-blue-600">+₪29</span>
                </div>
                <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 text-center">הוספה חד-פעמית לכל שירות</p>
              </div>
            </div>
          </div>

          {/* Guarantee Benefits */}
          <div className="mt-8 sm:mt-12 lg:mt-16 bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-12 border border-gray-100">
            <h3 className="text-lg sm:text-xl lg:text-3xl text-gray-900 mb-4 sm:mb-6 lg:mb-8 text-center">
              מה כולל האחריות שלנו?
            </h3>
            <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-green-100 rounded-lg sm:rounded-xl lg:rounded-2xl mb-2 sm:mb-3 lg:mb-4">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-green-600" />
                </div>
                <h4 className="text-xs sm:text-sm lg:text-lg text-gray-900 mb-1 sm:mb-2">הגנה מלאה</h4>
                <p className="text-[10px] sm:text-xs lg:text-base text-gray-600 hidden sm:block">
                  כיסוי מלא לכל בעיה
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-blue-100 rounded-lg sm:rounded-xl lg:rounded-2xl mb-2 sm:mb-3 lg:mb-4">
                  <Headphones className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-600" />
                </div>
                <h4 className="text-xs sm:text-sm lg:text-lg text-gray-900 mb-1 sm:mb-2">תמיכה 24/7</h4>
                <p className="text-[10px] sm:text-xs lg:text-base text-gray-600 hidden sm:block">
                  צוות זמין בכל עת
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-purple-100 rounded-lg sm:rounded-xl lg:rounded-2xl mb-2 sm:mb-3 lg:mb-4">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-purple-600" />
                </div>
                <h4 className="text-xs sm:text-sm lg:text-lg text-gray-900 mb-1 sm:mb-2">החזר/תיקון</h4>
                <p className="text-[10px] sm:text-xs lg:text-base text-gray-600 hidden sm:block">
                  לבחירתכם
                </p>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-6 sm:mt-8 lg:mt-12 text-center">
            <div className="inline-flex items-center gap-3 sm:gap-6 lg:gap-8 text-xs sm:text-sm lg:text-base text-gray-600 flex-wrap justify-center">
              <div className="flex items-center gap-1 sm:gap-2">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-green-600" />
                <span>+10K שירותים</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-green-600" />
                <span>99.8% שביעות רצון</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-green-600" />
                <span>תגובה תוך 24 שעות</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-6xl text-gray-900 mb-4 sm:mb-6">
            מוכנים להתחיל?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 lg:mb-12 px-4">
            מצאו את המקצוען המושלם בכמה קליקים
          </p>
          <button
            onClick={() => onGetStarted()}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 sm:px-10 lg:px-12 py-3 sm:py-4 lg:py-5 rounded-xl hover:shadow-xl hover:shadow-blue-500/50 transition-all inline-flex items-center gap-2 sm:gap-3 text-base sm:text-lg lg:text-xl group"
          >
            התחל עכשיו
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-1 transition-transform rotate-180" />
          </button>
        </div>
      </section>

      {/* Investor Section */}
      <InvestorSection />

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Footer - Compact Layout */}
          <div className="lg:hidden">
            {/* Logo and Description */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-3">
                <BeadyLogo size="lg" />
              </div>
              <p className="text-gray-400 text-xs leading-relaxed mb-4 max-w-xs mx-auto">
                פלטפורמת השירותים הביתיים המופעלת בבינה מלאכותית
              </p>
              <div className="flex gap-3 justify-center">
                <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                  <span className="text-base">𝕏</span>
                </a>
                <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                  <span className="text-base">in</span>
                </a>
                <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                  <span className="text-base">f</span>
                </a>
              </div>
            </div>
            
            {/* Links in 2 columns */}
            <div className="grid grid-cols-2 gap-4 text-center mb-6">
              <div>
                <h4 className="text-white mb-2 text-sm font-medium">שירותים</h4>
                <ul className="space-y-1.5 text-xs">
                  <li><a href="#" className="hover:text-white transition-colors">אינסטלציה</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">חשמל</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">ניקיון</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">יופי</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white mb-2 text-sm font-medium">החברה</h4>
                <ul className="space-y-1.5 text-xs">
                  <li><button onClick={onAboutClick} className="hover:text-white transition-colors">אודות</button></li>
                  <li><button onClick={onProAccess} className="hover:text-white transition-colors">הפוך לשותף</button></li>
                  <li><button onClick={onHelpClick} className="hover:text-white transition-colors">עזרה</button></li>
                  <li><button onClick={onContactClick} className="hover:text-white transition-colors">צור קשר</button></li>
                </ul>
              </div>
            </div>
            
            {/* Bottom bar */}
            <div className="border-t border-gray-800 pt-4">
              <p className="text-gray-500 text-[10px] text-center mb-2">&copy; 2025 Beedy. כל הזכויות שמורות.</p>
              <div className="flex gap-4 text-[10px] justify-center flex-wrap">
                <button onClick={onTermsClick} className="hover:text-white transition-colors">תקנון</button>
                <button onClick={onPrivacyClick} className="hover:text-white transition-colors">פרטיות</button>
                <button onClick={onAccessibilityClick} className="hover:text-white transition-colors">נגישות</button>
                <button onClick={onDashboardClick} className="hover:text-white transition-colors opacity-50 hover:opacity-100">Admin</button>
              </div>
            </div>
          </div>

          {/* Desktop Footer */}
          <div className="hidden lg:block">
            <div className="grid sm:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12 mb-8 sm:mb-12">
              <div className="sm:col-span-2 lg:col-span-2">
                <div className="flex items-center mb-4">
                  <BeadyLogo size="xl" />
                </div>
                <p className="text-gray-400 mb-6 leading-relaxed text-sm lg:text-base">
                  פלטפורמת השירותים הביתיים המופעלת בבינה מלאכותית. מחירים מובטחים, מקצוענים מאומתים.
                </p>
                <div className="flex gap-4">
                  <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                    <span className="text-xl">𝕏</span>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                    <span className="text-xl">in</span>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
                    <span className="text-xl">f</span>
                  </a>
                </div>
              </div>
              <div>
                <h4 className="text-white mb-4 text-base">שירותים</h4>
                <ul className="space-y-3 text-sm lg:text-base">
                  <li><a href="#" className="hover:text-white transition-colors">אינסטלציה</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">חשמל</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">ניקיון</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">יופי</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white mb-4 text-base">החברה</h4>
                <ul className="space-y-3 text-sm lg:text-base">
                  <li><button onClick={onAboutClick} className="hover:text-white transition-colors text-right">אודות</button></li>
                  <li><button onClick={onProAccess} className="hover:text-white transition-colors text-right">הפוך לשותף</button></li>
                  <li><a href="#" className="hover:text-white transition-colors">קריירה</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">בלוג</a></li>
                </ul>
              </div>
              <div className="hidden lg:block">
                <h4 className="text-white mb-4 text-base">תמיכה</h4>
                <ul className="space-y-3 text-sm lg:text-base">
                  <li><button onClick={onHelpClick} className="hover:text-white transition-colors text-right">מרכז עזרה</button></li>
                  <li><button onClick={onTermsClick} className="hover:text-white transition-colors text-right">תנאי שימוש</button></li>
                  <li><button onClick={onPrivacyClick} className="hover:text-white transition-colors text-right">פרטיות</button></li>
                  <li><button onClick={onContactClick} className="hover:text-white transition-colors text-right">צור קשר</button></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-6 lg:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">&copy; 2025 Beedy. כל הזכויות שמורות.</p>
              <div className="flex gap-6 text-sm flex-wrap justify-center">
                <button onClick={onAccessibilityClick} className="hover:text-white transition-colors">הצהרת נגישות</button>
                <button onClick={onTermsClick} className="hover:text-white transition-colors">תקנון</button>
                <button onClick={onPrivacyClick} className="hover:text-white transition-colors">עוגיות</button>
                <button onClick={onDashboardClick} className="hover:text-white transition-colors opacity-50 hover:opacity-100">Admin</button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
