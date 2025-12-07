import { ArrowLeft, Star, MapPin, SlidersHorizontal, Calendar, Clock } from 'lucide-react';
import { Service, Provider } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useBooking } from '../context/BookingContext';
import { useMemo } from 'react';

const mockProviders: Provider[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    service: 'Cleaning',
    rating: 4.9,
    reviews: 127,
    hourlyRate: 45,
    distance: 0.8,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    bio: 'Professional cleaning service with 8 years of experience. Specialized in deep cleaning and eco-friendly products.',
    specialties: ['Deep Cleaning', 'Eco-Friendly', 'Same Day'],
    availability: ['Today', 'Tomorrow', 'This Week'],
    lat: 32.0853,
    lng: 34.7818,
    status: 'available',
  },
  {
    id: '2',
    name: 'Michael Chen',
    service: 'Cleaning',
    rating: 4.8,
    reviews: 93,
    hourlyRate: 40,
    distance: 1.2,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    bio: 'Reliable and thorough cleaning service. I take pride in making your space spotless.',
    specialties: ['Office Cleaning', 'Move-in/out', 'Weekly Service'],
    availability: ['Tomorrow', 'This Week'],
    lat: 32.0900,
    lng: 34.7850,
    status: 'available',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    service: 'Cleaning',
    rating: 5.0,
    reviews: 156,
    hourlyRate: 50,
    distance: 2.1,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    bio: 'Top-rated cleaning professional. Attention to detail and customer satisfaction guaranteed.',
    specialties: ['Premium Service', 'Deep Cleaning', 'Pet-Friendly'],
    availability: ['This Week', 'Next Week'],
    lat: 32.0750,
    lng: 34.7700,
    status: 'available',
  },
  {
    id: '4',
    name: 'David Park',
    service: 'Plumbing',
    rating: 4.7,
    reviews: 89,
    hourlyRate: 75,
    distance: 1.5,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    bio: 'Licensed plumber with 12 years of experience. Emergency services available.',
    specialties: ['Emergency 24/7', 'Leak Repair', 'Installation'],
    availability: ['Today', 'Tomorrow', 'This Week'],
    lat: 32.0800,
    lng: 34.7900,
    status: 'available',
  },
];

function getAvailabilityLabel(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const twoWeeks = new Date(today);
  twoWeeks.setDate(twoWeeks.getDate() + 14);
  
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  
  if (checkDate.getTime() === today.getTime()) return 'Today';
  if (checkDate.getTime() === tomorrow.getTime()) return 'Tomorrow';
  if (checkDate < nextWeek) return 'This Week';
  if (checkDate < twoWeeks) return 'Next Week';
  return 'Later';
}

function isProviderAvailableForDate(provider: Provider, scheduledDate: string): boolean {
  if (!scheduledDate) return true;
  
  const date = new Date(scheduledDate);
  const requiredAvailability = getAvailabilityLabel(date);
  
  const availabilityOrder = ['Today', 'Tomorrow', 'This Week', 'Next Week', 'Later'];
  const providerMaxIndex = Math.max(
    ...provider.availability.map(a => availabilityOrder.indexOf(a))
  );
  const requiredIndex = availabilityOrder.indexOf(requiredAvailability);
  
  return providerMaxIndex >= requiredIndex;
}

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });
}

type ServiceProvidersProps = {
  service: Service;
  onProviderSelect: (provider: Provider) => void;
  onBack: () => void;
};

export function ServiceProviders({ service, onProviderSelect, onBack }: ServiceProvidersProps) {
  const { bookingData } = useBooking();
  const { scheduledDate, scheduledTime, bookingType } = bookingData;
  
  const hasScheduledDateTime = bookingType === 'scheduled' && scheduledDate && scheduledTime;
  
  const providers = useMemo(() => {
    const serviceProviders = mockProviders.filter(p => p.service === service.name);
    
    if (!hasScheduledDateTime) {
      return serviceProviders;
    }
    
    return serviceProviders.filter(provider => 
      isProviderAvailableForDate(provider, scheduledDate)
    );
  }, [service.name, scheduledDate, hasScheduledDateTime]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1>{service.name} Services</h1>
              <div className="text-gray-500">{providers.length} providers available</div>
            </div>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
          
          {hasScheduledDateTime && (
            <div className="flex items-center gap-3 bg-emerald-50 rounded-xl p-3 border border-emerald-200">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-emerald-700 font-medium">Scheduled Appointment</div>
                <div className="flex items-center gap-2 text-emerald-600">
                  <span className="capitalize">{formatDateDisplay(scheduledDate)}</span>
                  <span className="text-emerald-400">|</span>
                  <Clock className="w-4 h-4" />
                  <span>{scheduledTime}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Providers List */}
      <div className="px-6 py-6 space-y-4">
        {providers.map((provider) => (
          <button
            key={provider.id}
            onClick={() => onProviderSelect(provider)}
            className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-100 text-left"
          >
            <div className="flex gap-4">
              <ImageWithFallback
                src={provider.image}
                alt={provider.name}
                className="w-20 h-20 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3>{provider.name}</h3>
                    <div className="flex items-center gap-2 text-gray-600 mt-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{provider.rating}</span>
                      <span>({provider.reviews} reviews)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-blue-600">${provider.hourlyRate}/hr</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{provider.distance} mi away</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {provider.specialties.slice(0, 3).map((specialty, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {providers.length === 0 && (
        <div className="text-center py-12 px-6">
          <div className="text-6xl mb-4">{service.icon}</div>
          <h3 className="mb-2">No providers available</h3>
          <p className="text-gray-500">
            We're working on adding more {service.name.toLowerCase()} professionals in your area.
          </p>
        </div>
      )}
    </div>
  );
}
