import { Mail, ArrowRight, KeyRound } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Link } from 'lucide-react'; 

export function ForgotPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">שחזור סיסמה</h1>
          <p className="text-gray-500">
            קורה לטובים ביותר. הכנס את המייל שלך ונשלח לך קישור לאיפוס הסיסמה.
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">כתובת אימייל</Label>
            <div className="relative">
              <Mail className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                id="email" 
                placeholder="name@example.com" 
                type="email" 
                className="pr-9 text-right" 
                dir="ltr"
              />
            </div>
          </div>

          <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg">
            שלח קישור לאיפוס
          </Button>

          <div className="text-center">
            <a href="/login" className="text-sm text-gray-500 hover:text-gray-900 flex items-center justify-center gap-2 font-medium">
              <ArrowRight className="w-4 h-4" />
              חזרה להתחברות
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}