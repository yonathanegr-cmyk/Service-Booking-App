import { useEffect, useState, useCallback } from 'react';
import { Button } from './ui/button';
import { toast } from 'sonner';

declare global {
  interface Window {
    paypal: any;
  }
}

type PayPalButtonElement = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement> & { id?: string; style?: React.CSSProperties },
  HTMLElement
>;

interface PayPalCheckoutProps {
  amount: number;
  currency?: string;
  bookingId: string;
  proPaypalEmail: string;
  platformFeePercent?: number;
  onSuccess?: (data: PayPalCaptureResult) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
}

interface PayPalCaptureResult {
  orderId: string;
  captureId: string;
  transactionId: string;
  status: 'HELD_IN_ESCROW';
  releaseDate: string;
}

const PAYPAL_SERVER_URL = '/api';

export default function PayPalCheckout({
  amount,
  currency = 'ILS',
  bookingId,
  proPaypalEmail,
  platformFeePercent = 15,
  onSuccess,
  onError,
  onCancel
}: PayPalCheckoutProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const proAmount = amount * (1 - platformFeePercent / 100);

  const createOrder = useCallback(async () => {
    const response = await fetch(`${PAYPAL_SERVER_URL}/paypal/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amount.toFixed(2),
        currency,
        intent: 'CAPTURE'
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create order');
    }
    
    const data = await response.json();
    return { orderId: data.id };
  }, [amount, currency]);

  const captureOrder = useCallback(async (orderId: string) => {
    setIsProcessing(true);
    
    const response = await fetch(`${PAYPAL_SERVER_URL}/paypal/order/${orderId}/capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId,
        proPaypalEmail,
        proAmount,
        amount
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to capture order');
    }
    
    return response.json();
  }, [bookingId, proPaypalEmail, proAmount, amount]);

  const handleApprove = useCallback(async (data: { orderId: string }) => {
    try {
      const result = await captureOrder(data.orderId);
      
      toast.success('התשלום בוצע בהצלחה!', {
        description: 'הכסף יישמר בנאמנות למשך 14 יום'
      });
      
      onSuccess?.(result);
    } catch (err) {
      console.error('Capture error:', err);
      toast.error('שגיאה בעיבוד התשלום', {
        description: 'אנא נסה שוב או פנה לתמיכה'
      });
      onError?.(err as Error);
    } finally {
      setIsProcessing(false);
    }
  }, [captureOrder, onSuccess, onError]);

  const handleCancel = useCallback(() => {
    toast.info('התשלום בוטל');
    onCancel?.();
  }, [onCancel]);

  const handleError = useCallback((err: any) => {
    console.error('PayPal error:', err);
    setError('שגיאה בטעינת PayPal');
    toast.error('שגיאה בתשלום PayPal');
    onError?.(new Error(String(err)));
  }, [onError]);

  useEffect(() => {
    const loadPayPalSDK = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!window.paypal) {
          const setupResponse = await fetch(`${PAYPAL_SERVER_URL}/paypal/setup`);
          if (!setupResponse.ok) {
            throw new Error('Failed to get PayPal configuration');
          }

          const script = document.createElement('script');
          script.src = process.env.NODE_ENV === 'production'
            ? 'https://www.paypal.com/web-sdk/v6/core'
            : 'https://www.sandbox.paypal.com/web-sdk/v6/core';
          script.async = true;
          
          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load PayPal SDK'));
            document.body.appendChild(script);
          });
        }

        const { clientToken } = await fetch(`${PAYPAL_SERVER_URL}/paypal/setup`)
          .then(res => res.json());

        const sdkInstance = await window.paypal.createInstance({
          clientToken,
          components: ['paypal-payments']
        });

        const paypalCheckout = sdkInstance.createPayPalOneTimePaymentSession({
          onApprove: handleApprove,
          onCancel: handleCancel,
          onError: handleError
        });

        const paypalButton = document.getElementById('paypal-checkout-button');
        if (paypalButton) {
          const handleClick = async () => {
            try {
              const orderPromise = createOrder();
              await paypalCheckout.start({ paymentFlow: 'auto' }, orderPromise);
            } catch (e) {
              console.error('PayPal checkout error:', e);
              handleError(e);
            }
          };
          
          paypalButton.addEventListener('click', handleClick);
          setSdkReady(true);

          return () => {
            paypalButton.removeEventListener('click', handleClick);
          };
        }
      } catch (err) {
        console.error('PayPal SDK load error:', err);
        setError('לא ניתן לטעון את PayPal כרגע');
      } finally {
        setIsLoading(false);
      }
    };

    loadPayPalSDK();
  }, [createOrder, handleApprove, handleCancel, handleError]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center" dir="rtl">
        <p className="text-red-600 mb-2">{error}</p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.location.reload()}
        >
          נסה שוב
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">סכום לתשלום:</span>
          <span className="text-xl font-bold text-blue-600">₪{amount.toFixed(2)}</span>
        </div>
        <p className="text-xs text-gray-500">
          הכסף יישמר בנאמנות למשך 14 יום לאחר השלמת השירות
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="mr-2 text-gray-600">טוען PayPal...</span>
        </div>
      ) : (
        <div className="relative">
          {isProcessing && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="mr-2 text-gray-600">מעבד תשלום...</span>
            </div>
          )}
          
          <div 
            id="paypal-checkout-button"
            style={{ 
              display: sdkReady ? 'block' : 'none',
              width: '100%',
              minHeight: '55px',
              cursor: 'pointer'
            }}
            role="button"
            tabIndex={0}
          />

          {!sdkReady && (
            <Button 
              className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white py-6"
              disabled
            >
              <svg className="w-6 h-6 ml-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z"/>
              </svg>
              PayPal
            </Button>
          )}
        </div>
      )}

      <div className="text-center">
        <p className="text-xs text-gray-400">
          תשלום מאובטח באמצעות PayPal
        </p>
        <div className="flex justify-center gap-2 mt-2">
          <span className="text-[10px] bg-gray-100 px-2 py-1 rounded">🔒 SSL</span>
          <span className="text-[10px] bg-gray-100 px-2 py-1 rounded">💳 מוגן</span>
          <span className="text-[10px] bg-gray-100 px-2 py-1 rounded">✓ 14 ימי אחריות</span>
        </div>
      </div>
    </div>
  );
}
