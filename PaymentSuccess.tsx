import { CheckCircle, Download, ArrowLeft, Calendar } from 'lucide-react';

export function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center" dir="rtl">
      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-green-100 border border-green-50 max-w-md w-full relative overflow-hidden">
        {/* Confetti Background Effect */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/confetti.png')] pointer-events-none"></div>
        
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2 relative z-10">
          התשלום התקבל בהצלחה!
        </h1>
        
        <p className="text-gray-500 mb-8 relative z-10">
          הכל מסודר! המנוי שלך פעיל כעת וחשבונית מס נשלחה למייל שלך.
        </p>

        {/* Receipt Card */}
        <div className="bg-gray-50 rounded-xl p-4 mb-8 text-right border border-gray-100 relative z-10">
            <div className="flex justify-between items-center mb-2">
                <span className="text-gray-500 text-sm">מספר הזמנה</span>
                <span className="font-mono font-bold text-gray-900">#TRX-8829</span>
            </div>
            <div className="flex justify-between items-center mb-2">
                <span className="text-gray-500 text-sm">תאריך</span>
                <span className="font-bold text-gray-900">30/11/2024</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                <span className="text-gray-900 font-bold">סה"כ שולם</span>
                <span className="font-bold text-xl text-green-600">₪199.00</span>
            </div>
        </div>

        <div className="space-y-3 relative z-10">
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <Calendar className="w-4 h-4" />
            התחל לעבוד
          </button>

          <button 
            className="w-full bg-white text-blue-600 font-medium py-2 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            הורד חשבונית
          </button>
        </div>
      </div>
    </div>
  );
}