import { MapPin, User, Search } from 'lucide-react';
import { Service } from '../App';

const services: Service[] = [
  { id: '1', name: 'Cleaning', icon: '🧹', description: 'Home & office cleaning' },
  { id: '2', name: 'Plumbing', icon: '🔧', description: 'Repairs & installations' },
  { id: '3', name: 'Electrical', icon: '💡', description: 'Wiring & fixtures' },
  { id: '4', name: 'Beauty', icon: '💅', description: 'Hair, nails & makeup' },
  { id: '5', name: 'Handyman', icon: '🔨', description: 'General repairs' },
  { id: '6', name: 'Gardening', icon: '🌱', description: 'Lawn & garden care' },
  { id: '7', name: 'Painting', icon: '🎨', description: 'Interior & exterior' },
  { id: '8', name: 'Moving', icon: '📦', description: 'Packing & moving' },
];

type HomeProps = {
  onServiceSelect: (service: Service) => void;
  onProfileClick: () => void;
};

export function Home({ onServiceSelect, onProfileClick }: HomeProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 pt-8 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            <div>
              <div className="opacity-90">Current location</div>
              <div>San Francisco, CA</div>
            </div>
          </div>
          <button 
            onClick={onProfileClick}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <User className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for services..."
            className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Services Grid */}
      <div className="px-6 -mt-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="mb-6">Browse Services</h2>
          <div className="grid grid-cols-2 gap-4">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => onServiceSelect(service)}
                className="flex flex-col items-center p-6 bg-gray-50 rounded-xl hover:bg-blue-50 hover:shadow-md transition-all group"
              >
                <div className="text-4xl mb-3">{service.icon}</div>
                <div className="text-center">
                  <div className="group-hover:text-blue-600 transition-colors">{service.name}</div>
                  <div className="text-gray-500 mt-1">{service.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Services */}
      <div className="px-6 mt-8 pb-8">
        <h3 className="mb-4">Popular This Week</h3>
        <div className="space-y-3">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="text-2xl">🧹</div>
            <div className="flex-1">
              <div>Deep Home Cleaning</div>
              <div className="text-gray-500">Starting at $50/hr</div>
            </div>
            <div className="text-yellow-500">★ 4.9</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="text-2xl">🔧</div>
            <div className="flex-1">
              <div>Emergency Plumbing</div>
              <div className="text-gray-500">Starting at $75/hr</div>
            </div>
            <div className="text-yellow-500">★ 4.8</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="text-2xl">💅</div>
            <div className="flex-1">
              <div>Mobile Manicure</div>
              <div className="text-gray-500">Starting at $40/hr</div>
            </div>
            <div className="text-yellow-500">★ 5.0</div>
          </div>
        </div>
      </div>
    </div>
  );
}
