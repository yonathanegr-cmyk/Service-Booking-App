import { ServerCrash, RefreshCw, LifeBuoy } from 'lucide-react';

export function ServerError() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center" dir="rtl">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 max-w-md w-full">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <ServerCrash className="w-10 h-10 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          שגיאה בלתי צפויה
        </h1>
        
        <p className="text-gray-500 mb-8 leading-relaxed">
          נתקלנו בבעיה זמנית בשרתים שלנו. הצוות הטכני קיבל התראה וכבר עובד על פתרון הבעיה.
        </p>

        <div className="space-y-3">
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          >
            <RefreshCw className="w-4 h-4" />
            נסה שוב
          </button>

          <button 
            className="w-full bg-white border border-gray-200 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <LifeBuoy className="w-4 h-4" />
            דווח על תקלה
          </button>
        </div>
      </div>
      
      <div className="mt-8 text-gray-400 text-sm font-mono">
        Error 500 • Internal Server Error
      </div>
    </div>
  );
}