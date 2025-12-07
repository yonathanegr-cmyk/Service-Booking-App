import { Hammer, RefreshCw, Clock } from 'lucide-react';

export function Maintenance() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 text-center text-white" dir="rtl">
      <div className="max-w-md w-full relative">
        {/* Animated Construction Stripes */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl"></div>
        
        <div className="bg-gray-800/50 backdrop-blur-lg p-8 rounded-3xl border border-gray-700 shadow-2xl relative z-10">
            <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <Hammer className="w-10 h-10 text-yellow-400" />
            </div>
            
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent">
                אנחנו בשיפוצים
            </h1>
            
            <p className="text-gray-400 mb-8 leading-relaxed text-lg">
                הכוורת עוברת שדרוג לשיפור החוויה שלך.
                <br />
                נחזור לפעילות מלאה תוך מספר דקות.
            </p>

            <div className="bg-gray-900/50 rounded-xl p-4 mb-8 flex items-center justify-center gap-3 border border-gray-700">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="font-mono text-blue-200 dir-ltr">Estimated: 15:00</span>
            </div>

            <button 
                onClick={() => window.location.reload()}
                className="w-full bg-white text-gray-900 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
                <RefreshCw className="w-4 h-4" />
                רענן דף
            </button>
        </div>
      </div>
      
      <div className="mt-12 text-gray-600 text-sm font-medium">
        Beedy Systems • Maintenance Mode
      </div>
    </div>
  );
}