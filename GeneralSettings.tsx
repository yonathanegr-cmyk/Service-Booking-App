import { Globe, Coins, Moon, Sun } from 'lucide-react';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';

export function GeneralSettings() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8" dir="rtl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">הגדרות כלליות</h1>
        <p className="text-gray-500">
          התאם את חווית השימוש שלך ב-Beedy.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        
        {/* Language & Region */}
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                    <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">שפה ואזור</h3>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label>שפת ממשק</Label>
                    <Select defaultValue="he">
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="בחר שפה" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="he">עברית (Hebrew)</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="fr">Français</SelectItem>
                            <SelectItem value="ru">Русский</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>מטבע ראשי</Label>
                    <Select defaultValue="ils">
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="בחר מטבע" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ils">₪ Shekel (ILS)</SelectItem>
                            <SelectItem value="usd">$ Dollar (USD)</SelectItem>
                            <SelectItem value="eur">€ Euro (EUR)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>

        <Separator />

        {/* Appearance */}
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-indigo-100 p-2 rounded-lg">
                    <Moon className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">מראה ותצוגה</h3>
            </div>

            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <Label className="text-base">מצב כהה (Dark Mode)</Label>
                    <p className="text-sm text-gray-500">הפוך את הממשק לכהה לשמירה על העיניים בלילה</p>
                </div>
                <Switch />
            </div>
        </div>

      </div>
    </div>
  );
}