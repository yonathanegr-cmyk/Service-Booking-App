import { useState, useMemo } from 'react';
import { DollarSign, CreditCard, Calculator } from 'lucide-react';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { RefundPayload } from '../../../types/adminActions';

interface RefundModalProps {
  orderId: string;
  originalAmount: number;
  commissionAmount: number;
  netToPro: number;
  currency?: string;
  isLoading: boolean;
  onConfirm: (payload: RefundPayload) => Promise<void>;
  onCancel: () => void;
}

export function RefundModal({
  orderId,
  originalAmount,
  commissionAmount,
  netToPro,
  currency = 'ILS',
  isLoading,
  onConfirm,
  onCancel
}: RefundModalProps) {
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [partialAmount, setPartialAmount] = useState<string>('');
  const [reason, setReason] = useState('');

  const refundAmount = useMemo(() => {
    if (refundType === 'full') return originalAmount;
    const parsed = parseFloat(partialAmount);
    return isNaN(parsed) ? 0 : Math.min(parsed, originalAmount);
  }, [refundType, partialAmount, originalAmount]);

  const isValid = useMemo(() => {
    if (refundType === 'full') return true;
    const parsed = parseFloat(partialAmount);
    return !isNaN(parsed) && parsed > 0 && parsed <= originalAmount;
  }, [refundType, partialAmount, originalAmount]);

  const handleSubmit = () => {
    if (!isValid) return;
    onConfirm({
      orderId,
      amount: refundAmount,
      isPartial: refundType === 'partial',
      reason: reason.trim() || undefined
    });
  };

  const formatCurrency = (amount: number) => {
    return `₪${amount.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-3 text-blue-600">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <DollarSign className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold">החזר כספי</h3>
          <p className="text-sm text-gray-500">הזמנה #{orderId}</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 text-gray-700 font-medium mb-3">
          <Calculator className="w-4 h-4" />
          פירוט התשלום
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">סכום מקורי:</span>
            <span className="font-bold text-gray-900">{formatCurrency(originalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">עמלת Beedy:</span>
            <span className="text-gray-700">{formatCurrency(commissionAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">סכום לבעל מקצוע:</span>
            <span className="text-gray-700">{formatCurrency(netToPro)}</span>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between">
              <span className="text-gray-700 font-medium">סכום להחזר:</span>
              <span className="font-bold text-blue-600 text-lg">{formatCurrency(refundAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">סוג החזר</Label>
          <RadioGroup
            value={refundType}
            onValueChange={(value: string) => setRefundType(value as 'full' | 'partial')}
            className="grid grid-cols-2 gap-3"
          >
            <div>
              <RadioGroupItem
                value="full"
                id="full_refund"
                className="peer sr-only"
              />
              <Label
                htmlFor="full_refund"
                className="flex flex-col items-center justify-center rounded-lg border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 cursor-pointer peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50"
              >
                <CreditCard className="w-6 h-6 mb-2 text-gray-600" />
                <span className="text-sm font-medium">החזר מלא</span>
                <span className="text-xs text-gray-500 mt-1">{formatCurrency(originalAmount)}</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem
                value="partial"
                id="partial_refund"
                className="peer sr-only"
              />
              <Label
                htmlFor="partial_refund"
                className="flex flex-col items-center justify-center rounded-lg border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 cursor-pointer peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50"
              >
                <DollarSign className="w-6 h-6 mb-2 text-gray-600" />
                <span className="text-sm font-medium">החזר חלקי</span>
                <span className="text-xs text-gray-500 mt-1">הזן סכום</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {refundType === 'partial' && (
          <div className="space-y-2">
            <Label htmlFor="partial_amount" className="text-sm font-medium text-gray-700">
              סכום להחזר (מקסימום {formatCurrency(originalAmount)})
            </Label>
            <div className="relative">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">₪</span>
              <Input
                id="partial_amount"
                type="number"
                value={partialAmount}
                onChange={(e) => setPartialAmount(e.target.value)}
                placeholder="0.00"
                className="pr-8"
                max={originalAmount}
                min={0}
                step={0.01}
              />
            </div>
            {parseFloat(partialAmount) > originalAmount && (
              <p className="text-xs text-red-500">הסכום חורג מהמקסימום המותר</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
            סיבת ההחזר (אופציונלי)
          </Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="תאר את הסיבה להחזר הכספי..."
            className="min-h-[80px] resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          onClick={handleSubmit}
          disabled={!isValid || isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? 'מבצע...' : `בצע החזר ${formatCurrency(refundAmount)}`}
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
