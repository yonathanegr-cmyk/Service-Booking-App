import { Bell, Mail, MessageSquare, ShieldAlert, Smartphone } from 'lucide-react';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';

export function NotificationSettings() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8" dir="rtl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">הגדרות התראות</h1>
        <p className="text-gray-500">
          בחר אילו עדכונים תרצה לקבל וכיצד.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        
        {/* Missions Section */}
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">משימות והזמנות</h3>
          </div>
          
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">תזכורת לפני משימה</Label>
                <p className="text-sm text-gray-500">שלח תזכורת SMS חצי שעה לפני משימה</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">עדכון סטטוס הזמנה</Label>
                <p className="text-sm text-gray-500">קבל עדכון כשלרוח מאשר הצעת מחיר</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        <Separator />

        {/* Marketing Section */}
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Mail className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">שיווק וחדשות</h3>
          </div>
          
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">ניוזלטר שבועי</Label>
                <p className="text-sm text-gray-500">סיכום שבועי של ביצועי העסק וטיפים</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">מבצעים והטבות</Label>
                <p className="text-sm text-gray-500">עדכונים על שותפויות חדשות והנחות</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        <Separator />

        {/* System Section */}
        <div className="p-6 space-y-6 bg-gray-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gray-200 p-2 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-gray-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">מערכת ואבטחה</h3>
          </div>
          
          <div className="space-y-5">
            <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
              <div className="space-y-0.5">
                <Label className="text-base">התראות אבטחה</Label>
                <p className="text-sm text-gray-500">התחברויות חשודות ושינויי סיסמה</p>
              </div>
              <Switch checked disabled />
            </div>
            <p className="text-xs text-red-500 font-medium">התראות אבטחה אינן ניתנות לביטול.</p>
          </div>
        </div>

      </div>
    </div>
  );
}