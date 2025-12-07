import { useState } from 'react';
import { XCircle, AlertTriangle, DollarSign } from 'lucide-react';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Checkbox } from '../../ui/checkbox';
import { CancelMissionPayload } from '../../../types/adminActions';

interface CancelMissionModalProps {
  orderId: string;
  proName?: string;
  orderAmount?: number;
  isLoading: boolean;
  onConfirm: (payload: CancelMissionPayload) => Promise<void>;
  onCancel: () => void;
}

const CANCEL_REASONS = [
  { id: 'client_request', label: 'בקשת לקוח' },
  { id: 'pro_unavailable', label: 'בעל מקצוע לא זמין' },
  { id: 'pro_no_show', label: 'בעל מקצוע לא הגיע' },
  { id: 'emergency', label: 'מקרה חירום' },
  { id: 'duplicate_order', label: 'הזמנה כפולה' },
  { id: 'fraud_suspected', label: 'חשד להונאה' },
  { id: 'other', label: 'סיבה אחרת' }
];

export function CancelMissionModal({
  orderId,
  proName,
  orderAmount,
  isLoading,
  onConfirm,
  onCancel
}: CancelMissionModalProps) {
  const [applyFeesToPro, setApplyFeesToPro] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>('');

  const handleSubmit = () => {
    if (!selectedReason) return;
    const reason = CANCEL_REASONS.find(r => r.id === selectedReason)?.label || selectedReason;
    onConfirm({
      orderId,
      applyFeesToPro,
      reason
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-3 text-red-600">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
          <XCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold">ביטול הזמנה</h3>
          <p className="text-sm text-gray-500">הזמנה #{orderId}</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-medium">שימו לב!</p>
          <p>ביטול ההזמנה יעדכן את הלקוח ואת בעל המקצוע. פעולה זו אינה ניתנת לביטול.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            סיבת הביטול <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {CANCEL_REASONS.map((reason) => (
              <button
                key={reason.id}
                onClick={() => setSelectedReason(reason.id)}
                className={`p-3 rounded-lg border-2 text-sm font-medium text-right transition-all ${
                  selectedReason === reason.id
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {reason.label}
              </button>
            ))}
          </div>
        </div>

        {proName && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <DollarSign className="w-4 h-4" />
              אפשרויות חיוב
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="apply_fees"
                checked={applyFeesToPro}
                onCheckedChange={(checked: boolean | 'indeterminate') => setApplyFeesToPro(checked === true)}
                className="mt-0.5"
              />
              <Label htmlFor="apply_fees" className="text-sm text-gray-700 cursor-pointer">
                <span className="font-medium">החל עמלות על בעל המקצוע</span>
                <span className="block text-gray-500 text-xs mt-0.5">
                  במקרה של אי הגעה או ביטול מצד {proName}
                </span>
              </Label>
            </div>
            {applyFeesToPro && orderAmount && (
              <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">עמלת ביטול (15%):</span>
                  <span className="font-bold text-red-600">
                    ₪{(orderAmount * 0.15).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          onClick={handleSubmit}
          disabled={!selectedReason || isLoading}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
        >
          {isLoading ? 'מבצע...' : 'בטל הזמנה'}
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          חזרה
        </Button>
      </div>
    </div>
  );
}
