import { XCircle, RefreshCw, MessageCircle, CreditCard } from 'lucide-react';

export function PaymentFailure() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center" dir="rtl">
      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-red-100 border border-red-50 max-w-md w-full">
        
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          התשלום נכשל
        </h1>
        
        <p className="text-gray-500 mb-8 leading-relaxed">
          לא הצלחנו לחייב את אמצעי התשלום שלך. ייתכן שהכרטיס פג תוקף או שאין מסגרת מספקת.
        </p>

        {/* Error Details */}
        <div className="bg-red-50 rounded-xl p-4 mb-8 text-right border border-red-100">
            <div className="flex items-start gap-3">
                <div className="bg-white p-1.5 rounded-full shadow-sm mt-0.5">
                    <CreditCard className="w-4 h-4 text-red-500" />
                </div>
                <div>
                    <h4 className="font-bold text-red-900 text-sm">שגיאת עיבוד (Code: 4002)</h4>
                    <p className="text-red-700 text-xs mt-1">הבנק דחה את העסקה.</p>
                </div>
            </div>
        </div>

        <div className="space-y-3">
          <button 
            className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          >
            <RefreshCw className="w-4 h-4" />
            נסה שוב
          </button>

          <button 
            className="w-full bg-white border border-gray-200 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            צור קשר עם התמיכה
          </button>
        </div>
      </div>
    </div>
  );
}