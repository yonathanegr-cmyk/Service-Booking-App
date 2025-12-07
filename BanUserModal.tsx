import { useState } from 'react';
import { UserX, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { Label } from '../../ui/label';
import { BanDuration, BanUserPayload } from '../../../types/adminActions';

interface BanUserModalProps {
  userId: string;
  userName?: string;
  isLoading: boolean;
  onConfirm: (payload: BanUserPayload) => Promise<void>;
  onCancel: () => void;
}

export function BanUserModal({
  userId,
  userName,
  isLoading,
  onConfirm,
  onCancel
}: BanUserModalProps) {
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState<BanDuration>('7_days');

  const handleSubmit = () => {
    if (!reason.trim()) return;
    onConfirm({
      userId,
      reason: reason.trim(),
      duration
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-3 text-red-600">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
          <UserX className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold">השעיית משתמש</h3>
          {userName && <p className="text-sm text-gray-500">{userName}</p>}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          פעולה זו תמנע מהמשתמש להתחבר למערכת ולבצע הזמנות חדשות. ניתן לבטל את ההשעיה בכל עת.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            משך ההשעיה
          </Label>
          <RadioGroup
            value={duration}
            onValueChange={(value: string) => setDuration(value as BanDuration)}
            className="grid grid-cols-3 gap-3"
          >
            <div>
              <RadioGroupItem
                value="7_days"
                id="7_days"
                className="peer sr-only"
              />
              <Label
                htmlFor="7_days"
                className="flex flex-col items-center justify-center rounded-lg border-2 border-gray-200 bg-white p-3 hover:bg-gray-50 cursor-pointer peer-data-[state=checked]:border-red-500 peer-data-[state=checked]:bg-red-50"
              >
                <Clock className="w-5 h-5 mb-1 text-gray-600" />
                <span className="text-sm font-medium">7 ימים</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem
                value="30_days"
                id="30_days"
                className="peer sr-only"
              />
              <Label
                htmlFor="30_days"
                className="flex flex-col items-center justify-center rounded-lg border-2 border-gray-200 bg-white p-3 hover:bg-gray-50 cursor-pointer peer-data-[state=checked]:border-red-500 peer-data-[state=checked]:bg-red-50"
              >
                <Clock className="w-5 h-5 mb-1 text-gray-600" />
                <span className="text-sm font-medium">30 ימים</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem
                value="permanent"
                id="permanent"
                className="peer sr-only"
              />
              <Label
                htmlFor="permanent"
                className="flex flex-col items-center justify-center rounded-lg border-2 border-gray-200 bg-white p-3 hover:bg-gray-50 cursor-pointer peer-data-[state=checked]:border-red-500 peer-data-[state=checked]:bg-red-50"
              >
                <UserX className="w-5 h-5 mb-1 text-gray-600" />
                <span className="text-sm font-medium">לצמיתות</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
            סיבת ההשעיה <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="תאר את הסיבה להשעיית המשתמש..."
            className="min-h-[100px] resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          onClick={handleSubmit}
          disabled={!reason.trim() || isLoading}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
        >
          {isLoading ? 'מבצע...' : 'אשר השעיה'}
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
