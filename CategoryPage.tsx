import { ArrowRight, Star, Shield, CheckCircle, Clock, MapPin, ChevronLeft, Zap, MessageSquare } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export type CategoryData = {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  image: string;
  icon: React.ReactNode;
  stats: {
    pros: number;
    projects: number;
    rating: number;
  };
  popularServices: {
    name: string;
    price: string;
    description: string;
  }[];
  features: string[];
};

type CategoryPageProps = {
  category: CategoryData;
  onBack: () => void;
  onRequest: () => void;
};

export function CategoryPage({ category, onBack, onRequest }: CategoryPageProps) {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowRight className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">{category.name}</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative h-[60vh] lg:h-[70vh] w-full">
        <ImageWithFallback
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-12">
          <div className="max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Shield className="w-4 h-4" />
              <span>אחריות ושירות מובטחים</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-4">{category.name}</h1>
            <p className="text-xl lg:text-2xl text-white/90 max-w-2xl mb-8 font-light leading-relaxed">
              {category.longDescription}
            </p>
            
            <div className="flex flex-wrap gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                </div>
                <div>
                  <p className="font-bold text-white text-lg">{category.stats.rating}</p>
                  <p className="text-xs">דירוג ממוצע</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="font-bold text-white text-lg">{category.stats.pros}+</p>
                  <p className="text-xs">מקצוענים זמינים</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <Clock className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <p className="font-bold text-white text-lg">דקות</p>
                  <p className="text-xs">זמן תגובה ממוצע</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* Left Column - Services & Info */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Popular Services */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">שירותים פופולריים ב{category.name}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {category.popularServices.map((service, index) => (
                  <div 
                    key={index}
                    className="border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-blue-100 transition-all cursor-pointer bg-white group"
                    onClick={onRequest}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                        {service.name}
                      </h3>
                      <div className="bg-gray-50 px-3 py-1 rounded-full text-sm font-medium text-gray-600">
                        {service.price}
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">
                      {service.description}
                    </p>
                    <div className="flex items-center text-blue-600 text-sm font-medium group-hover:gap-2 transition-all">
                      הזמן שירות
                      <ChevronLeft className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* How it Works */}
            <section className="bg-gray-50 rounded-3xl p-8 lg:p-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">איך זה עובד?</h2>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0 text-blue-600 font-bold text-xl">1</div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">תיאור הצורך</h3>
                    <p className="text-gray-600 leading-relaxed">
                      בוחרים את השירות המבוקש, עונים על מספר שאלות קצרות או מעלים סרטון של הבעיה.
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0 text-purple-600 font-bold text-xl">2</div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">קבלת הצעות מחיר</h3>
                    <p className="text-gray-600 leading-relaxed">
                      ה-AI שלנו מנתח את הבקשה ושולח לכם הצעות מחיר קבועות ומובטחות ממקצוענים מובילים.
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0 text-green-600 font-bold text-xl">3</div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">ביצוע ותשלום</h3>
                    <p className="text-gray-600 leading-relaxed">
                      המקצוען מגיע ומבצע את העבודה. התשלום מועבר רק לאחר שאתם מאשרים שהכל בוצע לשביעות רצונכם.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - CTA Card (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-3xl shadow-xl p-6 lg:p-8 border border-gray-100">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                    {category.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">צריכים {category.name}?</h2>
                  <p className="text-gray-600">
                    קבלו הצעת מחיר מיידית ומובטחת ללא התחייבות
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  {category.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={onRequest}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2 group"
                >
                  הזמן שירות עכשיו
                  <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform rotate-180" />
                </button>

                <p className="text-center text-xs text-gray-400 mt-4">
                  ללא דמי מנוי • תשלום מאובטח • אחריות מלאה
                </p>
              </div>

              {/* Trust Badges */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-2xl p-4 text-center">
                  <Shield className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <span className="text-xs font-medium text-blue-800">ביטוח מלא</span>
                </div>
                <div className="bg-purple-50 rounded-2xl p-4 text-center">
                  <Zap className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <span className="text-xs font-medium text-purple-800">זמינות מיידית</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
