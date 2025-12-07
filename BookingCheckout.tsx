import { useState } from 'react';
import { ArrowLeft, Shield, Lock, CreditCard, CheckCircle, AlertTriangle, MapPin, Calendar, Clock, Pencil, ChevronDown, ChevronUp, Building2 } from 'lucide-react';
import { ServiceRequest, Bid, Booking } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';

type BookingCheckoutProps = {
  bid: Bid;
  serviceRequest: ServiceRequest;
  onCheckoutComplete: (booking: Booking) => void;
  onBack: () => void;
  onUpdateLocationDetails?: (details: string) => void;
};

const TRANSACTION_FEE_PERCENT = 7; // 7%
const INSURANCE_PLUS_COST = 15; // $15

export function BookingCheckout({ bid, serviceRequest, onCheckoutComplete, onBack, onUpdateLocationDetails }: BookingCheckoutProps) {
  const [includeInsurance, setIncludeInsurance] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [isAddressDetailsOpen, setIsAddressDetailsOpen] = useState(false);
  const [addressDetails, setAddressDetails] = useState(serviceRequest.location?.details || '');
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  const subtotal = bid.totalPriceGuaranteed;
  const transactionFee = Math.round(subtotal * (TRANSACTION_FEE_PERCENT / 100));
  const insuranceFee = includeInsurance ? INSURANCE_PLUS_COST : 0;
  const total = subtotal + transactionFee + insuranceFee;

  const handleConfirmBooking = async () => {
    if (!paymentMethod) {
      alert('נא לבחור אמצעי תשלום');
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const booking: Booking = {
      id: `BOOK_${Date.now()}`,
      providerId: bid.providerId,
      providerName: bid.providerName,
      providerImage: bid.providerImage,
      service: serviceRequest.category,
      date: serviceRequest.urgency === 'immediate' ? 'היום' : 'לתכנון',
      time: bid.estimatedArrival || 'לאישור',
      status: 'upcoming',
      total,
      address: serviceRequest.location?.address,
      addressDetails: addressDetails || serviceRequest.location?.details,
      serviceData: {
        aiDescription: serviceRequest.aiAnalysis?.summary || serviceRequest.description || 'בקשת שירות',
        mediaUrls: serviceRequest.photos || [],
        category: serviceRequest.category,
        subcategory: serviceRequest.subProblem,
        complexity: serviceRequest.complexity,
        urgencyLevel: serviceRequest.urgency === 'immediate' ? 'urgent' : 'normal',
      },
    };

    setIsProcessing(false);
    onCheckoutComplete(booking);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onBack();
              }}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              title="חזרה להצעות המחיר"
              aria-label="חזרה להצעות המחיר"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2>סיום הזמנה</h2>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Provider Info */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex gap-4">
            <ImageWithFallback
              src={bid.providerImage}
              alt={bid.providerName}
              className="w-16 h-16 rounded-xl object-cover"
            />
            <div className="flex-1">
              <h3 className="mb-1">{bid.providerName}</h3>
              <div className="text-gray-600 mb-2">{serviceRequest.category}</div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 hover:bg-gray-50 rounded-lg px-2 py-1 -mr-2 transition-colors group" onClick={() => alert('כאן תפתח חלונית הביקורות')}>
                  <span className="text-yellow-500 font-bold group-hover:scale-110 transition-transform">★ {bid.rating}</span>
                  <span className="text-gray-500 underline decoration-dotted text-sm group-hover:text-blue-600">({bid.reviews} חוות דעת - לחץ לצפייה)</span>
                </button>
              </div>
            </div>
            <div className="text-left">
              <div className="text-2xl text-blue-600">₪{bid.totalPriceGuaranteed}</div>
              <div className="text-gray-500">מחיר מובטח</div>
            </div>
          </div>
        </div>

        {/* Order Details Summary */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          <h3 className="font-semibold text-gray-900 text-lg">פרטי הזמנה</h3>
          
          <div className="pb-3 border-b border-gray-50 last:border-0 last:pb-0">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">כתובת השירות</div>
                <div className="text-gray-600 text-sm mt-0.5">
                  {serviceRequest.location?.address || 'כתובת הנוכחית'}
                </div>
                {addressDetails && !isEditingDetails && (
                  <div className="flex items-center gap-2 mt-1">
                    <Building2 className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-500 text-xs">{addressDetails}</span>
                    <button 
                      onClick={() => setIsEditingDetails(true)}
                      className="text-blue-500 hover:text-blue-600 p-0.5"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {!addressDetails && !isAddressDetailsOpen && (
              <button
                onClick={() => setIsAddressDetailsOpen(true)}
                className="mt-3 mr-[52px] flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
                <span>הוסף פרטים נוספים (קומה, דירה, קוד כניסה)</span>
              </button>
            )}
            
            {(isAddressDetailsOpen || isEditingDetails) && (
              <div className="mt-3 mr-[52px] bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">פרטים נוספים</span>
                </div>
                <input
                  type="text"
                  value={addressDetails}
                  onChange={(e) => setAddressDetails(e.target.value)}
                  placeholder="קומה, דירה, קוד כניסה..."
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 bg-white placeholder:text-gray-400"
                  autoFocus
                />
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => {
                      if (onUpdateLocationDetails) {
                        onUpdateLocationDetails(addressDetails);
                      }
                      setIsAddressDetailsOpen(false);
                      setIsEditingDetails(false);
                    }}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    שמור
                  </button>
                  <button
                    onClick={() => {
                      setAddressDetails(serviceRequest.location?.details || '');
                      setIsAddressDetailsOpen(false);
                      setIsEditingDetails(false);
                    }}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                  >
                    ביטול
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">זמן הגעה משוער</div>
              <div className="text-gray-600 text-sm mt-0.5">
                {serviceRequest.urgency === 'immediate' ? 'היום, בהקדם האפשרי' : 'בתאריך שנבחר'}
              </div>
              <div className="text-emerald-600 text-xs font-medium mt-1 bg-emerald-50 inline-block px-2 py-0.5 rounded-full">
                {bid.estimatedArrival ? `צפי הגעה: ${bid.estimatedArrival}` : 'זמן הגעה יתואם טלפונית'}
              </div>
            </div>
          </div>
        </div>

        {/* Escrow Protection */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-green-900 mb-1">הגנת נאמנות פעילה</div>
              <div className="text-green-700">
                הכסף שלך שמור ומאובטח. התשלום יועבר למקצוען רק לאחר אישור השירות.
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-4 h-4" />
              <span>תשלום מאובטח דרך Stripe</span>
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-4 h-4" />
              <span>שחרור הכספים לאחר אישור</span>
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-4 h-4" />
              <span>החזר כספי מובטח במקרה של בעיה</span>
            </div>
          </div>
        </div>

        {/* Insurance Plus Option */}
        <div className={`relative rounded-xl p-4 transition-all duration-300 ${
          includeInsurance 
            ? 'bg-blue-50 border-2 border-blue-500 shadow-md' 
            : 'bg-white border border-gray-200 shadow-sm hover:border-blue-300'
        }`}>
          {/* Badge Recommandé */}
          <div className="absolute -top-3 right-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            מומלץ ביותר
          </div>

          <button
            onClick={() => setIncludeInsurance(!includeInsurance)}
            className="w-full flex items-start gap-4 text-right pt-2"
          >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              includeInsurance ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
            }`}>
              {includeInsurance && <CheckCircle className="w-4 h-4 text-white" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${includeInsurance ? 'bg-blue-200' : 'bg-gray-100'}`}>
                  <Shield className={`w-5 h-5 ${includeInsurance ? 'text-blue-700' : 'text-gray-500'}`} />
                </div>
                <span className={`font-bold text-lg ${includeInsurance ? 'text-blue-900' : 'text-gray-900'}`}>
                  ביטוח פלוס - ₪{INSURANCE_PLUS_COST}
                </span>
              </div>
              <div className="text-gray-600 text-sm leading-relaxed pr-1">
                <span className="font-bold text-blue-700 block mb-1">הרחבת אחריות מ-14 ל-30 יום</span>
                הכיסוי כולל ביקור חוזר של המקצוען לבדיקה מקיפה נוספת של הבעיה, ללא עלות נוספת. שקט נפשי מובטח.
              </div>
            </div>
          </button>
        </div>

        {/* Price Breakdown */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="mb-4">פירוט תשלום</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>מחיר השירות</span>
              <span>₪{subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <div className="flex items-center gap-2">
                <span>עמלת שירות ({TRANSACTION_FEE_PERCENT}%)</span>
                <AlertTriangle className="w-4 h-4 text-gray-400" />
              </div>
              <span>₪{transactionFee}</span>
            </div>
            {includeInsurance && (
              <div className="flex justify-between text-blue-600">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>ביטוח פלוס</span>
                </div>
                <span>₪{insuranceFee}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-3 flex justify-between">
              <span>סה"כ לתשלום</span>
              <span className="text-2xl text-blue-600">₪{total}</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="mb-4">אמצעי תשלום</h3>
          <div className="space-y-3">
            <button
              onClick={() => setPaymentMethod('card')}
              className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                paymentMethod === 'card'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CreditCard className="w-6 h-6 text-blue-600" />
              <div className="flex-1 text-right">
                <div className="mb-1">כרטיס אשראי</div>
                <div className="text-gray-500">Visa, Mastercard, Amex</div>
              </div>
              {paymentMethod === 'card' && (
                <CheckCircle className="w-6 h-6 text-blue-600" />
              )}
            </button>
            <button
              onClick={() => setPaymentMethod('paypal')}
              className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                paymentMethod === 'paypal'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="w-6 h-6 text-2xl">💳</div>
              <div className="flex-1 text-right">
                <div className="mb-1">PayPal</div>
                <div className="text-gray-500">תשלום מאובטח</div>
              </div>
              {paymentMethod === 'paypal' && (
                <CheckCircle className="w-6 h-6 text-blue-600" />
              )}
            </button>
          </div>
        </div>

        {/* Terms */}
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="text-blue-900">
            באישור ההזמנה, אני מסכים/ה ל{' '}
            <button className="underline">תנאי השימוש</button> ולי{' '}
            <button className="underline">מדיניות ההחזרים</button> שלנו.
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 z-10">
        <button
          onClick={handleConfirmBooking}
          disabled={!paymentMethod || isProcessing}
          className={`w-full py-4 rounded-xl transition-colors ${
            paymentMethod && !isProcessing
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              מעבד תשלום...
            </span>
          ) : (
            `שלם ₪${total} והזמן`
          )}
        </button>
      </div>
    </div>
  );
}
