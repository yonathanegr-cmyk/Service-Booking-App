import { CheckCircle, Calendar, Clock, DollarSign, MapPin, Building2, Home } from 'lucide-react';
import { Booking, ServiceRequest } from '../App';
import { JobDetailsCard } from './JobDetailsCard';
import { useCategories, getCategoryByName } from '../hooks/useCategories';

type BookingConfirmationProps = {
  booking: Booking;
  onBackToHome: () => void;
  onTrackProvider?: () => void;
  currentJob?: any;
  serviceRequest?: ServiceRequest | null;
};

export function BookingConfirmation({ booking, onBackToHome, onTrackProvider, currentJob, serviceRequest }: BookingConfirmationProps) {
  const { categories } = useCategories();

  const selectedCategoryName = currentJob?.serviceData?.category || booking.service;
  const selectedCategory = getCategoryByName(selectedCategoryName);
  
  const filteredCategories = selectedCategory 
    ? [selectedCategory] 
    : categories.filter(cat => cat.nameHe === selectedCategoryName || cat.name === selectedCategoryName);

  const address = booking.address 
    || currentJob?.userLocation?.address 
    || serviceRequest?.location?.address 
    || '';
  
  const additionalDetails = booking.addressDetails 
    || (currentJob?.userLocation && [
      currentJob.userLocation.floor && `קומה ${currentJob.userLocation.floor}`,
      currentJob.userLocation.apartment && `דירה ${currentJob.userLocation.apartment}`,
      currentJob.userLocation.buildingCode && `קוד כניסה: ${currentJob.userLocation.buildingCode}`,
      currentJob.userLocation.notes
    ].filter(Boolean).join(', ')) 
    || serviceRequest?.location?.details 
    || '';
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-8" dir="rtl">
      <div className="max-w-md w-full">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">הזמנה אושרה!</h1>
          <p className="text-gray-600">
            השירות הוזמן בהצלחה. המקצוען ייצור איתך קשר בקרוב.
          </p>
        </div>

        {/* Job Details Card - Read Only */}
        {currentJob && (
          <div className="mb-6 flex justify-center">
            <JobDetailsCard
              isReadOnly={true}
              categories={filteredCategories}
              selectedCategory={selectedCategoryName}
              categoriesLoading={false}
              address={address}
              isAddressValidated={true}
              isAutoDetected={currentJob.userLocation?.type === 'current'}
              additionalDetails={additionalDetails}
            />
          </div>
        )}

        {/* Provider & Booking Details */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h3 className="font-bold text-lg mb-4">פרטי ההזמנה</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-gray-600 text-sm mb-1">ספק שירות</div>
                <div className="font-bold">{booking.providerName}</div>
                <div className="text-gray-500 text-sm">{booking.service}</div>
              </div>
            </div>

            {(booking.address || address) && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Home className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-gray-600 text-sm mb-1">כתובת השירות</div>
                  <div className="font-bold">{booking.address || address}</div>
                  {(booking.addressDetails || additionalDetails) && (
                    <div className="text-gray-500 text-sm flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3" />
                      {booking.addressDetails || additionalDetails}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-gray-600 text-sm mb-1">תאריך</div>
                <div className="font-bold">{booking.date}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-gray-600 text-sm mb-1">שעה</div>
                <div className="font-bold">{booking.time}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-gray-600 text-sm mb-1">מחיר</div>
                <div className="font-bold">₪{booking.total}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {onTrackProvider && (
            <button
              onClick={onTrackProvider}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <MapPin className="w-5 h-5" />
              עקוב אחר המקצוען
            </button>
          )}
          <button
            onClick={onBackToHome}
            className={`${onTrackProvider ? '' : 'flex-1'} bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-bold hover:bg-gray-200 transition-colors`}
          >
            חזור לדף הבית
          </button>
        </div>
      </div>
    </div>
  );
}
