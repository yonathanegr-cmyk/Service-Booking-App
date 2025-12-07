import { Gift, Copy, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export function InviteUser() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Gift className="w-10 h-10 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">הזמן חבר, קבל הטבה</h1>
          <p className="text-gray-500">
            שתף את הקישור הייחודי שלך. על כל חבר שנרשם, שניכם מקבלים חודש חינם בתוכנית Pro!
          </p>
        </div>

        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 space-y-4">
            <div className="space-y-2">
                <Label className="text-yellow-900 font-bold">הקישור שלך</Label>
                <div className="flex gap-2" dir="ltr">
                    <Input readOnly value="beed.ai/invite/u/david88" className="bg-white border-yellow-200 text-gray-600" />
                    <Button variant="outline" className="shrink-0 border-yellow-200 hover:bg-yellow-100 text-yellow-700">
                        <Copy className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>

        <div className="space-y-4">
            <Button className="w-full bg-gray-900 text-white hover:bg-black h-12 gap-2">
                <Share2 className="w-4 h-4" />
                שתף בוואטסאפ
            </Button>
            
            <div className="grid grid-cols-3 gap-3">
                <Button variant="outline" className="w-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">
                    <Facebook className="w-5 h-5" />
                </Button>
                <Button variant="outline" className="w-full hover:bg-sky-50 hover:text-sky-500 hover:border-sky-200">
                    <Twitter className="w-5 h-5" />
                </Button>
                <Button variant="outline" className="w-full hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200">
                    <Linkedin className="w-5 h-5" />
                </Button>
            </div>
        </div>

        <div className="text-center pt-4">
            <button className="text-sm text-gray-400 hover:text-gray-600 font-medium">
                דלג לשלב הבא
            </button>
        </div>

      </div>
    </div>
  );
}