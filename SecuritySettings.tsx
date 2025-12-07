import { Lock, Shield, Smartphone, LogOut, KeyRound } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';

export function SecuritySettings() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8" dir="rtl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">אבטחה ופרטיות</h1>
        <p className="text-gray-500">
          שמור על החשבון שלך מאובטח ומוגן.
        </p>
      </div>

      {/* Password Change */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-50 p-2 rounded-lg">
                <KeyRound className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">שינוי סיסמה</h3>
        </div>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">סיסמה נוכחית</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">סיסמה חדשה</Label>
            <Input id="new-password" type="password" />
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              השתמש בלפחות 8 תווים וסמל אחד.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">אשר סיסמה חדשה</Label>
            <Input id="confirm-password" type="password" />
          </div>
        </div>

        <Button className="w-full sm:w-auto">
          עדכן סיסמה
        </Button>
      </div>

      {/* 2FA */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-green-50 p-2 rounded-lg">
                    <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">אימות דו-שלבי (2FA)</h3>
                    <p className="text-sm text-gray-500">הוסף שכבת הגנה נוספת לחשבון שלך</p>
                </div>
            </div>
            <Switch />
        </div>
      </div>

      {/* Connected Devices */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 px-1">מכשירים מחוברים</h3>
        <div className="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-200">
            
            {/* Current Device */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Smartphone className="w-8 h-8 text-gray-400" />
                    <div>
                        <p className="font-bold text-gray-900">iPhone 14 Pro</p>
                        <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            פעיל כעת • Tel Aviv
                        </p>
                    </div>
                </div>
            </div>

            {/* Other Device */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4 opacity-70">
                    <Smartphone className="w-8 h-8 text-gray-400" />
                    <div>
                        <p className="font-bold text-gray-900">Chrome on Windows</p>
                        <p className="text-xs text-gray-500">נראה לאחרונה: אתמול ב-14:30</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <LogOut className="w-4 h-4 ml-2" />
                    התנתק
                </Button>
            </div>

        </div>
      </div>
    </div>
  );
}