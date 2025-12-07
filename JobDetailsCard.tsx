import { ReactNode } from 'react';
import { Locate } from './ui/icons';
import { AddressAutocomplete } from './AddressAutocomplete';
import { CategorySelector } from './CategorySelector';
import { Category } from '../hooks/useCategories';

interface JobDetailsCardProps {
  isReadOnly: boolean;
  
  categories: Category[];
  selectedCategory: string | null;
  onCategorySelect?: (id: string, name: string) => void;
  categoriesLoading?: boolean;
  
  address: string;
  onAddressChange?: (value: string) => void;
  onAddressSelect?: (data: { address: string; lat: number; lng: number }) => void;
  isAutoDetected?: boolean;
  isAddressValidated: boolean;
  locationError?: string | null;
  isLocating?: boolean;
  onLocateMe?: () => void;
  onClearLocation?: () => void;
  
  additionalDetails: string;
  onAdditionalDetailsChange?: (value: string) => void;
  
  onQuickAddress?: (place: string) => void;
  
  bookingType?: 'now' | 'scheduled';
  onBookingTypeChange?: (type: 'now' | 'scheduled') => void;
  scheduledDate?: string;
  scheduledTime?: string;
  onScheduledDateChange?: (date: string) => void;
  onScheduledTimeChange?: (time: string) => void;
  timeSlots?: Array<{ value: string; label: string; disabled?: boolean }>;
  getMinDate?: () => string;
  formatScheduledDateTime?: (date: string, time: string) => string;
  
  children?: ReactNode;
}

export function JobDetailsCard({
  isReadOnly,
  categories,
  selectedCategory,
  onCategorySelect,
  categoriesLoading = false,
  address,
  onAddressChange,
  onAddressSelect,
  isAutoDetected = false,
  isAddressValidated,
  locationError,
  isLocating = false,
  onLocateMe,
  onClearLocation,
  additionalDetails,
  onAdditionalDetailsChange,
  onQuickAddress,
  bookingType = 'now',
  onBookingTypeChange,
  scheduledDate = '',
  scheduledTime = '',
  onScheduledDateChange,
  onScheduledTimeChange,
  timeSlots = [],
  getMinDate,
  formatScheduledDateTime,
  children
}: JobDetailsCardProps) {

  const selectedCategoryData = categories.find(cat => (cat.nameHe || cat.name) === selectedCategory);

  return (
    <div 
      className="bg-white/95 backdrop-blur-xl w-full max-w-md md:w-[360px] p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 pointer-events-auto relative"
      dir="rtl"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-xl font-black text-gray-900">פרטי הזמנה</h3>
          <p className="text-xs text-gray-500 font-medium mt-0.5">הגדר מיקום לאיסוף מהיר</p>
        </div>
        {!isReadOnly && (
          <div className="flex p-1 bg-gray-100 rounded-xl">
            <button 
              onClick={() => onBookingTypeChange?.('now')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                bookingType === 'now' 
                  ? 'bg-white shadow-sm text-blue-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              עכשיו
            </button>
            <button 
              onClick={() => onBookingTypeChange?.('scheduled')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                bookingType === 'scheduled' 
                  ? 'bg-white shadow-sm text-blue-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              מתוזמן
            </button>
          </div>
        )}
      </div>

      {!isReadOnly && bookingType === 'scheduled' && (
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
                onChange={(e) => onScheduledDateChange?.(e.target.value)}
                min={getMinDate?.()}
                className="w-full px-3 py-2.5 bg-white border border-purple-200 rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] text-purple-600 font-bold block mb-1">שעה</label>
              <select
                value={scheduledTime}
                onChange={(e) => onScheduledTimeChange?.(e.target.value)}
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
          {scheduledDate && scheduledTime && formatScheduledDateTime && (
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

      {isReadOnly ? (
        <div className="mb-5">
          {selectedCategoryData ? (
            <div className="mb-5 relative">
              <p className="text-[10px] text-gray-400 font-bold mb-2 tracking-wide">
                שירות נבחר
              </p>
              <div className="flex gap-3">
                <div
                  className="flex flex-col items-center justify-center p-2 rounded-xl border bg-blue-50 border-blue-200 shadow-sm flex-shrink-0 min-w-[60px]"
                >
                  <span className="text-xl mb-1 filter drop-shadow-sm">
                    {selectedCategoryData.icon}
                  </span>
                  <span className="text-[10px] font-bold whitespace-nowrap text-blue-700">
                    {selectedCategoryData.nameHe || selectedCategoryData.name}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-5 relative">
              <p className="text-[10px] text-gray-400 font-bold mb-2 tracking-wide">
                לא נבחר שירות
              </p>
            </div>
          )}
        </div>
      ) : (
        <CategorySelector
          categories={categories}
          selectedId={selectedCategory}
          onSelect={(id, name) => onCategorySelect?.(id, name)}
          title="מה אנחנו מתקנים היום?"
          isLoading={categoriesLoading}
        />
      )}

      <div className="relative flex flex-col gap-3 mb-5">
        <div className="absolute right-[23px] top-[24px] bottom-[24px] w-0.5 bg-gradient-to-b from-blue-600/20 to-gray-200 z-0"></div>

        {!isReadOnly && locationError && !isAddressValidated && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
            <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-xs text-amber-700 font-medium">{locationError}</p>
          </div>
        )}

        <div className={`relative z-10 transition-all duration-300 p-3.5 rounded-2xl border group flex items-center gap-4 ${
          isAutoDetected && address 
            ? 'bg-green-50 hover:bg-green-100 border-green-200 hover:border-green-300' 
            : !isAddressValidated && locationError
              ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 hover:border-amber-300'
              : 'bg-white hover:bg-blue-50 border-blue-100 hover:border-blue-200'
        }`}>
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-[0_0_0_4px_rgba(255,255,255,1)] transition-all ${
            isAutoDetected && address 
              ? 'bg-green-500' 
              : !isAddressValidated && locationError 
                ? 'bg-amber-500 animate-pulse' 
                : 'bg-blue-600'
          }`}></div>
          <div className="flex-1">
            <p className={`text-[10px] font-bold mb-0.5 tracking-wide ${
              isAutoDetected && address 
                ? 'text-green-600/80' 
                : !isAddressValidated && locationError
                  ? 'text-amber-600/80'
                  : 'text-blue-600/80'
            }`}>
              {isAutoDetected && address ? 'מיקום נוכחי' : !isAddressValidated ? 'הזן כתובת *' : 'כתובת'}
            </p>
            {isReadOnly ? (
              <p className="text-sm font-bold text-gray-900 leading-relaxed truncate">
                {address || 'לא הוזנה כתובת'}
              </p>
            ) : isAutoDetected && address ? (
              <button
                onClick={onClearLocation}
                className="w-full text-right"
              >
                <p className="text-sm font-bold text-green-600 leading-relaxed truncate">המיקום הנוכחי שלך</p>
              </button>
            ) : (
              <AddressAutocomplete 
                value={address}
                onChange={(value) => onAddressChange?.(value)}
                onSelect={(data) => onAddressSelect?.(data)}
                language="he"
                className="text-gray-900 placeholder-gray-400"
                placeholder={locationError ? "הקלד כתובת כאן..." : "הזן כתובת..."}
              />
            )}
          </div>
          {!isReadOnly && (
            <button 
              onClick={onLocateMe}
              disabled={isLocating}
              className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                isLocating ? 'bg-blue-200 text-blue-800 animate-pulse' : 'bg-blue-100/50 hover:bg-blue-200/50 text-blue-600'
              }`}
              title="אתר אותי"
            >
              <Locate className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>

        <div className="relative z-10 bg-gray-50 hover:bg-gray-100 transition-all duration-300 p-3.5 rounded-2xl border border-transparent hover:border-gray-200 group flex items-center gap-4">
          <div className="w-2.5 h-2.5 bg-gray-300 rounded-[2px] flex-shrink-0 shadow-[0_0_0_4px_rgba(255,255,255,1)] group-hover:shadow-[0_0_0_4px_rgba(243,244,246,1)] transition-all"></div>
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 font-bold mb-0.5 tracking-wide">פרטים נוספים</p>
            {isReadOnly ? (
              <p className="text-sm font-bold text-gray-900 leading-relaxed">
                {additionalDetails || 'אין פרטים נוספים'}
              </p>
            ) : (
              <input 
                type="text"
                value={additionalDetails}
                onChange={(e) => onAdditionalDetailsChange?.(e.target.value)}
                className="w-full bg-transparent border-none p-0 text-sm font-bold text-gray-900 focus:ring-0 placeholder-gray-400 leading-relaxed"
                placeholder="קומה, דירה, קוד כניסה..."
              />
            )}
          </div>
        </div>
      </div>

      {!isReadOnly && (
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none">
          {['הבית', 'עבודה', 'הורים'].map((place, i) => (
            <button 
              key={place} 
              onClick={() => onQuickAddress?.(place)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 rounded-xl transition-all whitespace-nowrap group active:scale-95"
            >
              <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-green-500' : i === 1 ? 'bg-orange-500' : 'bg-purple-500'}`}></div>
              <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900">{place}</span>
            </button>
          ))}
        </div>
      )}

      {children}
    </div>
  );
}
