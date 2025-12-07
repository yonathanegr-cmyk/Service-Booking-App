import { KeyRound, Mail } from 'lucide-react';
import { Button } from '../../ui/button';
import { ResetPasswordPayload } from '../../../types/adminActions';

interface ResetPasswordModalProps {
  userId: string;
  email?: string;
  userName?: string;
  isLoading: boolean;
  onConfirm: (payload: ResetPasswordPayload) => Promise<void>;
  onCancel: () => void;
}

export function ResetPasswordModal({
  userId,
  email,
  userName,
  isLoading,
  onConfirm,
  onCancel
}: ResetPasswordModalProps) {
  const handleSubmit = () => {
    onConfirm({
      userId,
      email: email || ''
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-3 text-blue-600">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <KeyRound className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold">איפוס סיסמה</h3>
          {userName && <p className="text-sm text-gray-500">{userName}</p>}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-800 font-medium">
            שליחת איפוס סיסמה ל{email || 'המשתמש'}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            המשתמש יקבל אימייל עם קישור לאיפוס הסיסמה
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? 'שולח...' : 'שלח'}
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          ביטול
        </Button>
      </div>
    </div>
  );
}
