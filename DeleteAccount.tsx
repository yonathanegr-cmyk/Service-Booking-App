import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export function DeleteAccount() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8" dir="rtl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-red-600">אזור סכנה</h1>
        <p className="text-gray-500">
          פעולות אלו אינן הפיכות. אנא נהג בזהירות.
        </p>
      </div>

      <div className="bg-red-50 border border-red-100 rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex items-start gap-4">
            <div className="bg-red-100 p-3 rounded-full shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="space-y-1">
                <h3 className="text-xl font-bold text-red-900">מחיקת חשבון לצמיתות</h3>
                <p className="text-red-700 leading-relaxed">
                    פעולה זו תמחק את החשבון שלך ואת כל המידע הקשור אליו לצמיתות.
                    לא תוכל לשחזר את המידע לאחר ביצוע הפעולה.
                </p>
            </div>
        </div>

        <div className="bg-white/50 rounded-xl p-4 border border-red-100/50 space-y-3">
            <h4 className="font-bold text-red-800 text-sm">מה ימחק?</h4>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1 pr-2">
                <li>היסטוריית ההזמנות והחשבוניות שלך</li>
                <li>פרטי הלקוחות ששמרת</li>
                <li>הגדרות האפליקציה והעדפות אישיות</li>
                <li>הגישה לכל השירותים המחוברים</li>
            </ul>
        </div>

        <div className="space-y-4 pt-4 border-t border-red-200">
            <div className="space-y-2">
                <Label htmlFor="confirmation" className="text-red-900 font-bold">
                    כדי לאשר, הקלד "מחק" בתיבה למטה
                </Label>
                <Input 
                    id="confirmation" 
                    placeholder="מחק" 
                    className="border-red-300 focus:ring-red-500 bg-white"
                />
            </div>

            <Button variant="destructive" className="w-full bg-red-600 hover:bg-red-700 gap-2 py-6 text-lg">
                <Trash2 className="w-5 h-5" />
                מחק את החשבון שלי
            </Button>
        </div>
      </div>
    </div>
  );
}