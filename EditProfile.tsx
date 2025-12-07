import { Camera, Save, User, Mail, Phone, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export function EditProfile() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8" dir="rtl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">פרטים אישיים</h1>
        <p className="text-gray-500">
          פרטים אלו יופיעו בהצעות המחיר ובחשבוניות שלך.
        </p>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative group cursor-pointer">
          <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-8 h-8 text-white" />
          </div>
        </div>
        <Button variant="outline" className="text-sm">
          שנה תמונה
        </Button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName">שם פרטי</Label>
            <div className="relative">
              <User className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input id="firstName" defaultValue="ישראל" className="pr-9" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">שם משפחה</Label>
            <div className="relative">
              <User className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input id="lastName" defaultValue="ישראלי" className="pr-9" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">כתובת אימייל</Label>
          <div className="relative">
            <Mail className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            <Input 
              id="email" 
              defaultValue="israel@beed.ai" 
              className="pr-9 bg-gray-50 text-gray-500" 
              disabled 
            />
          </div>
          <p className="text-xs text-gray-500 mr-1">לא ניתן לשנות כתובת אימייל באופן עצמאי.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">טלפון נייד</Label>
          <div className="relative">
            <Phone className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            <Input id="phone" defaultValue="050-123-4567" className="pr-9" dir="ltr" style={{ textAlign: 'right' }} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">אודות העסק (Bio)</Label>
          <div className="relative">
            <FileText className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            <Textarea 
              id="bio" 
              placeholder="ספר בקצרה על השירותים שלך..." 
              className="min-h-[100px] pr-9"
            />
          </div>
          <p className="text-xs text-gray-500 mr-1">יופיע בפרופיל הציבורי שלך ב-Marketplace.</p>
        </div>

        {/* Profile Strength */}
        <div className="bg-blue-50 p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-sm font-bold text-blue-900">חוזק פרופיל</span>
            <div className="w-32 h-2 bg-blue-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 w-[80%]"></div>
            </div>
          </div>
          <span className="text-blue-700 font-bold text-xl">80%</span>
        </div>

        <div className="pt-4">
          <Button className="w-full md:w-auto md:px-8 bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Save className="w-4 h-4" />
            שמור שינויים
          </Button>
        </div>
      </div>
    </div>
  );
}