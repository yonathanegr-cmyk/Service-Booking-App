import { Map, Home, ArrowRight } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center" dir="rtl">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 max-w-md w-full">
        <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Map className="w-10 h-10 text-yellow-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          אופס, הלכנו לאיבוד בכוורת
        </h1>
        
        <p className="text-gray-500 mb-8 leading-relaxed">
          הדף שחיפשת אולי הוסר, שינה את שמו או שאינו זמין באופן זמני.
          אל דאגה, הדרך חזרה קצרה.
        </p>

        <button 
          onClick={() => window.history.back()}
          className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl mb-3 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          חזור אחורה
        </button>

        <button 
          onClick={() => window.location.href = '/'}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          חזרה ללוח הבקרה
        </button>
      </div>
      
      <div className="mt-8 text-gray-400 text-sm">
        Error 404 • Page Not Found
      </div>
    </div>
  );
}