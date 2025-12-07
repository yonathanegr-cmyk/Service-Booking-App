import { ArrowLeft, Star, MapPin, Clock, CheckCircle, Calendar } from 'lucide-react';
import { Provider, Booking } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';

type ProviderDetailProps = {
  provider: Provider;
  onBack: () => void;
  onBookingComplete: (booking: Booking) => void;
};

const timeSlots = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
];

const reviews = [
  {
    id: '1',
    author: 'Jessica M.',
    rating: 5,
    date: '2 days ago',
    comment: 'Absolutely fantastic service! Very professional and thorough. Highly recommend!',
  },
  {
    id: '2',
    author: 'Robert K.',
    rating: 5,
    date: '1 week ago',
    comment: 'Great experience. Arrived on time and did an excellent job. Will book again!',
  },
  {
    id: '3',
    author: 'Amanda T.',
    rating: 4,
    date: '2 weeks ago',
    comment: 'Very good service. Minor communication issues but overall satisfied with the work.',
  },
];

export function ProviderDetail({ provider, onBack, onBookingComplete }: ProviderDetailProps) {
  const [selectedDate, setSelectedDate] = useState<string>('Today');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [hours, setHours] = useState<number>(2);

  const handleBookNow = () => {
    if (!selectedTime) {
      alert('Please select a time slot');
      return;
    }

    const booking: Booking = {
      id: Date.now().toString(),
      providerId: provider.id,
      providerName: provider.name,
      service: provider.service,
      date: selectedDate,
      time: selectedTime,
      status: 'upcoming',
      total: provider.hourlyRate * hours,
    };

    onBookingComplete(booking);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2>Provider Details</h2>
          </div>
        </div>
      </div>

      {/* Provider Info */}
      <div className="bg-white px-6 py-6 border-b border-gray-200">
        <div className="flex gap-4 mb-4">
          <ImageWithFallback
            src={provider.image}
            alt={provider.name}
            className="w-24 h-24 rounded-2xl object-cover"
          />
          <div className="flex-1">
            <h2 className="mb-2">{provider.name}</h2>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span>{provider.rating}</span>
              <span className="text-gray-500">({provider.reviews} reviews)</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{provider.distance} mi away</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-blue-600">${provider.hourlyRate}</div>
            <div className="text-gray-500">per hour</div>
          </div>
        </div>

        <p className="text-gray-600 mb-4">{provider.bio}</p>

        <div className="flex flex-wrap gap-2">
          {provider.specialties.map((specialty, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg flex items-center gap-1"
            >
              <CheckCircle className="w-4 h-4" />
              {specialty}
            </span>
          ))}
        </div>
      </div>

      {/* Booking Section */}
      <div className="bg-white mt-4 px-6 py-6">
        <h3 className="mb-4">Select Date & Time</h3>
        
        {/* Date Selection */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Choose a date</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {provider.availability.map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedDate === date
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {date}
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Choose a time</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  selectedTime === time
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Hours Selection */}
        <div className="mb-6">
          <label className="block mb-3 text-gray-600">Number of hours</label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setHours(Math.max(1, hours - 1))}
              className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              -
            </button>
            <span className="w-12 text-center">{hours} hr</span>
            <button
              onClick={() => setHours(hours + 1)}
              className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Price Summary */}
        <div className="bg-blue-50 rounded-xl p-4 mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Rate</span>
            <span>${provider.hourlyRate}/hr</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Duration</span>
            <span>{hours} hours</span>
          </div>
          <div className="border-t border-blue-200 my-2"></div>
          <div className="flex justify-between">
            <span>Total</span>
            <span>${provider.hourlyRate * hours}</span>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-white mt-4 px-6 py-6">
        <h3 className="mb-4">Reviews</h3>
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="pb-4 border-b border-gray-100 last:border-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div>{review.author}</div>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(review.rating)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <span className="text-gray-500">{review.date}</span>
              </div>
              <p className="text-gray-600">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        <button
          onClick={handleBookNow}
          className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-colors"
        >
          Book Now - ${provider.hourlyRate * hours}
        </button>
      </div>
    </div>
  );
}
