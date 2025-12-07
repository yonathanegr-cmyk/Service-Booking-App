import { Smartphone, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../ui/input-otp"

export function VerifyOTP() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
        
        <div className="space-y-2">
          <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">אימות חשבון</h1>
          <p className="text-gray-500">
            שלחנו קוד אימות בן 6 ספרות למספר
            <br />
            <span className="font-bold text-gray-900" dir="ltr">050-XXX-XX89</span>
          </p>
        </div>

        <div className="flex justify-center py-4" dir="ltr">
            <InputOTP maxLength={6}>
                <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                </InputOTPGroup>
            </InputOTP>
        </div>

        <div className="space-y-4">
          <Button className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-lg">
            אמת והמשך
          </Button>

          <div className="text-sm text-gray-500">
            לא קיבלת את הקוד?{' '}
            <button className="text-purple-600 font-bold hover:underline inline-flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              שלח שוב בעוד 00:45
            </button>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <a href="/login" className="text-sm text-gray-500 hover:text-gray-900 inline-flex items-center gap-2 font-medium">
              <ArrowRight className="w-4 h-4" />
              חזרה להתחברות
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}