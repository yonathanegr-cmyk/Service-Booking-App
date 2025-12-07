import React, { useState, useEffect, useCallback } from 'react';
import { 
  Navigation, 
  Camera, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  AlertCircle,
  ChevronLeft,
  X,
  Loader2,
  User,
  Wrench,
  Clock,
  Shield,
  CreditCard
} from 'lucide-react';
import { useJob } from '../../context/JobContext';
import { useGpsTracking } from '../../hooks/useGpsTracking';
import { JobStatus, JOB_STATUS_LABELS, canTransitionTo } from '../../types/job';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { toast } from 'sonner';

interface MissionControllerProps {
  onBack?: () => void;
}

const STATUS_FLOW: JobStatus[] = ['accepted', 'en_route', 'arrived', 'in_progress', 'payment_pending', 'completed'];

export function MissionController({ onBack }: MissionControllerProps) {
  const {
    currentJob,
    isLoading: isJobLoading,
    error: jobError,
    updateJobStatus,
    updateProviderLocation,
    cancelJob
  } = useJob();

  const [isUpdating, setIsUpdating] = useState(false);
  const [hasEvidence, setHasEvidence] = useState({ before: false, after: false });
  const [securityCodeInput, setSecurityCodeInput] = useState('');
  const [securityCodeVerified, setSecurityCodeVerified] = useState(false);
  const [securityCodeError, setSecurityCodeError] = useState(false);
  const [workTimer, setWorkTimer] = useState(0);

  const handleLocationUpdate = useCallback(async (lat: number, lng: number) => {
    await updateProviderLocation(lat, lng);
  }, [updateProviderLocation]);

  const { currentPosition, isTracking, error: gpsError } = useGpsTracking({
    jobStatus: currentJob?.status ?? null,
    onLocationUpdate: handleLocationUpdate,
    updateInterval: 10000
  });

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (currentJob?.status === 'in_progress' && currentJob?.startedAt) {
      interval = setInterval(() => {
        const startTime = new Date(currentJob.startedAt!).getTime();
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setWorkTimer(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentJob?.status, currentJob?.startedAt]);

  const formatTimer = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getNextStatus = (): JobStatus | null => {
    if (!currentJob) return null;
    const currentIndex = STATUS_FLOW.indexOf(currentJob.status);
    if (currentIndex === -1 || currentIndex >= STATUS_FLOW.length - 1) return null;
    return STATUS_FLOW[currentIndex + 1];
  };

  const handleAction = async () => {
    const nextStatus = getNextStatus();
    if (!nextStatus || !currentJob) return;

    if (!canTransitionTo(currentJob.status, nextStatus)) {
      toast.error("פעולה נחסמה", { description: "לא ניתן לעבור לשלב הזה" });
      return;
    }

    if (currentJob.status === 'arrived' && !securityCodeVerified) {
      toast.error("נדרש אימות קוד", { description: "יש לאמת את קוד האבטחה לפני תחילת העבודה" });
      return;
    }

    if (currentJob.status === 'arrived' && !hasEvidence.before) {
      toast.error("נדרשת תמונה", { description: "יש לצלם את אזור העבודה לפני ההתחלה" });
      return;
    }

    if (currentJob.status === 'in_progress' && !hasEvidence.after) {
      toast.error("נדרשת תמונה", { description: "יש לצלם את העבודה המושלמת" });
      return;
    }

    setIsUpdating(true);
    
    try {
      const success = await updateJobStatus(nextStatus);
      
      if (success) {
        toast.success(`סטטוס עודכן: ${JOB_STATUS_LABELS[nextStatus]}`);
      } else {
        toast.error("שגיאה בעדכון", { description: "לא ניתן לעדכן את הסטטוס" });
      }
    } catch (err) {
      toast.error("שגיאה בעדכון", { description: "אירעה שגיאה בעדכון הסטטוס" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVerifySecurityCode = () => {
    if (!currentJob) return;
    
    if (securityCodeInput === currentJob.securityCode) {
      setSecurityCodeVerified(true);
      setSecurityCodeError(false);
      toast.success("קוד אבטחה אומת בהצלחה!");
    } else {
      setSecurityCodeError(true);
      toast.error("קוד שגוי", { description: "הקוד שהוזן לא תואם" });
    }
  };

  const handleCancelJob = async () => {
    const confirmed = window.confirm("האם אתה בטוח שברצונך לבטל את המשימה?");
    if (!confirmed) return;

    setIsUpdating(true);
    try {
      const success = await cancelJob("ביטול על ידי בעל המקצוע");
      if (success) {
        toast.success("המשימה בוטלה");
        onBack?.();
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const openWaze = () => {
    if (!currentJob?.userLocation) return;
    const { lat, lng } = currentJob.userLocation;
    window.open(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`, '_blank');
  };

  const callClient = () => {
    if (!currentJob?.client?.phone) return;
    window.location.href = `tel:${currentJob.client.phone}`;
  };

  const renderClientInfo = () => {
    if (!currentJob?.client) return null;

    return (
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            {currentJob.client.avatarUrl ? (
              <img src={currentJob.client.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-blue-600" />
            )}
          </div>
          <div>
            <div className="font-bold text-gray-900">{currentJob.client.name}</div>
            <div className="text-sm text-gray-500">{currentJob.client.phone}</div>
          </div>
        </div>
        
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{currentJob.userLocation.address}</span>
        </div>
        
        {currentJob.userLocation.floor && (
          <div className="text-sm text-gray-500 mt-1 mr-6">
            קומה {currentJob.userLocation.floor}
            {currentJob.userLocation.apartment && `, דירה ${currentJob.userLocation.apartment}`}
          </div>
        )}
        
        {currentJob.userLocation.notes && (
          <div className="text-sm text-gray-500 mt-1 mr-6 italic">
            "{currentJob.userLocation.notes}"
          </div>
        )}
      </div>
    );
  };

  const renderServiceInfo = () => {
    if (!currentJob?.serviceData) return null;

    return (
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <Wrench className="w-5 h-5 text-gray-600" />
          <span className="font-semibold text-gray-900">{currentJob.serviceData.category}</span>
          {currentJob.serviceData.subcategory && (
            <Badge variant="outline" className="text-xs">
              {currentJob.serviceData.subcategory}
            </Badge>
          )}
        </div>
        
        <p className="text-gray-700 text-sm leading-relaxed">
          {currentJob.serviceData.aiDescription}
        </p>
        
        {currentJob.priceEstimate && (
          <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
            <span className="text-gray-600">מחיר משוער:</span>
            <span className="font-bold text-lg text-gray-900">
              ₪{currentJob.priceEstimate.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderContextArea = () => {
    if (!currentJob) return null;

    switch (currentJob.status) {
      case 'accepted':
        return (
          <div className="space-y-4">
            {renderClientInfo()}
            {renderServiceInfo()}
            
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-900">
              <div className="flex items-start gap-3">
                <MapPin className="shrink-0 w-6 h-6 mt-1" aria-hidden="true" />
                <div>
                  <div className="font-bold text-lg">נוסעים ל: {currentJob.userLocation.address}</div>
                  {currentJob.distanceToClient && (
                    <div className="opacity-80">מרחק: {currentJob.distanceToClient.toFixed(1)} ק״מ</div>
                  )}
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2"
                  onClick={openWaze}
                  aria-label="פתח ניווט בWaze"
                >
                  <Navigation className="w-4 h-4" aria-hidden="true" />
                  Waze
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 bg-white border-blue-200 text-blue-700 gap-2"
                  onClick={callClient}
                  aria-label={`חייג ללקוח ${currentJob.client?.name || ''}`}
                >
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  חייג ללקוח
                </Button>
              </div>
            </div>
          </div>
        );

      case 'en_route':
        return (
          <div className="space-y-4">
            {renderClientInfo()}
            
            <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100 text-center space-y-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Navigation className="w-8 h-8 text-yellow-700" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-yellow-900">בדרך ליעד...</h3>
                <p className="text-yellow-700">הלקוח קיבל עדכון שאתה בדרך.</p>
              </div>
              
              {isTracking && (
                <div className="flex items-center justify-center gap-2 text-sm text-yellow-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>GPS פעיל - שולח עדכוני מיקום</span>
                </div>
              )}
              
              {gpsError && (
                <Alert className="bg-red-50 border-red-200 text-right">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">{gpsError}</AlertDescription>
                </Alert>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 gap-2"
                onClick={openWaze}
              >
                <Navigation className="w-4 h-4" />
                פתח ניווט
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 gap-2"
                onClick={callClient}
              >
                <Phone className="w-4 h-4" />
                חייג ללקוח
              </Button>
            </div>
          </div>
        );

      case 'arrived':
        return (
          <div className="space-y-4">
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-indigo-600" />
                <span className="font-bold text-indigo-900">אימות קוד אבטחה</span>
              </div>
              
              {!securityCodeVerified ? (
                <div className="space-y-3">
                  <p className="text-indigo-700 text-sm">
                    בקש מהלקוח את קוד האבטחה בן 4 ספרות
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      placeholder="הזן קוד"
                      value={securityCodeInput}
                      onChange={(e) => {
                        setSecurityCodeInput(e.target.value);
                        setSecurityCodeError(false);
                      }}
                      className={`text-center text-2xl font-mono tracking-widest ${
                        securityCodeError ? 'border-red-500' : ''
                      }`}
                      aria-label="קוד אבטחה"
                      aria-invalid={securityCodeError}
                    />
                    <Button onClick={handleVerifySecurityCode} className="px-6">
                      אמת
                    </Button>
                  </div>
                  {securityCodeError && (
                    <p className="text-red-600 text-sm" role="alert">קוד שגוי, נסה שוב</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">הקוד אומת בהצלחה</span>
                </div>
              )}
            </div>

            <Alert className="bg-purple-50 border-purple-200">
              <AlertCircle className="h-4 w-4 text-purple-600" aria-hidden="true" />
              <AlertTitle className="text-purple-900 font-bold">חובה לפני תחילת עבודה</AlertTitle>
              <AlertDescription className="text-purple-700">
                יש לצלם את אזור העבודה כדי למנוע מחלוקות עתידיות.
              </AlertDescription>
            </Alert>
            
            <button
              onClick={() => setHasEvidence(prev => ({ ...prev, before: true }))}
              className={`w-full cursor-pointer border-2 border-dashed rounded-xl p-8 text-center transition-all
                ${hasEvidence.before ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-purple-400 bg-gray-50'}`}
              aria-label={hasEvidence.before ? 'תמונה לפני הועלתה' : 'לחץ לצילום תמונה לפני העבודה'}
            >
              {hasEvidence.before ? (
                <div className="text-green-700 flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-10 h-10" aria-hidden="true" />
                  <span className="font-bold">התמונה התקבלה בהצלחה</span>
                </div>
              ) : (
                <div className="text-gray-500 flex flex-col items-center gap-2">
                  <Camera className="w-10 h-10" aria-hidden="true" />
                  <span className="font-medium">לחץ כאן לצילום תמונה</span>
                </div>
              )}
            </button>

            {renderServiceInfo()}
          </div>
        );

      case 'in_progress':
        return (
          <div className="space-y-4">
            <div className="text-center py-6">
              <div className="inline-block px-4 py-2 bg-gray-100 rounded-full font-mono text-xl font-bold text-gray-700 mb-2" aria-live="polite">
                {formatTimer(workTimer)}
              </div>
              <p className="text-gray-500">זמן עבודה</p>
            </div>

            {renderServiceInfo()}

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-3">צ'ק ליסט לסיום:</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-blue-600" />
                  <span className="text-gray-700">ניקוי אזור העבודה</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-blue-600" />
                  <span className="text-gray-700">בדיקת תקינות עם הלקוח</span>
                </label>
              </div>
            </div>

            <button
              onClick={() => setHasEvidence(prev => ({ ...prev, after: true }))}
              className={`w-full cursor-pointer border-2 border-dashed rounded-xl p-4 text-center transition-all
                ${hasEvidence.after ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'}`}
              aria-label={hasEvidence.after ? 'תמונה אחרי הועלתה' : 'לחץ לצילום תמונה אחרי העבודה'}
            >
              <div className="flex items-center justify-center gap-2 text-sm font-medium">
                <Camera className="w-4 h-4" aria-hidden="true" />
                {hasEvidence.after ? 'תמונה צורפה' : 'צרף תמונה לסיום'}
              </div>
            </button>
          </div>
        );

      case 'payment_pending':
        return (
          <div className="space-y-4">
            <div className="text-center py-8 space-y-4">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                <CreditCard className="w-10 h-10 text-amber-600" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">ממתין לתשלום</h2>
              <p className="text-gray-500 max-w-xs mx-auto">
                הלקוח קיבל הודעה לאישור ותשלום.
              </p>
              
              {currentJob.finalPrice && (
                <div className="bg-gray-50 rounded-xl p-4 mt-4">
                  <div className="text-gray-600">סכום לתשלום:</div>
                  <div className="text-3xl font-bold text-gray-900">
                    ₪{currentJob.finalPrice.toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            <Alert>
              <Clock className="h-4 w-4" aria-hidden="true" />
              <AlertDescription>
                הכסף יעבור לחשבונך תוך 24 שעות לאחר אישור הלקוח.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 'completed':
        return (
          <div className="text-center py-12 space-y-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-600" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">העבודה הושלמה!</h2>
            <p className="text-gray-500 max-w-xs mx-auto">
              התשלום התקבל. הכסף יעבור לחשבונך תוך 24 שעות.
            </p>
            
            {currentJob.finalPrice && (
              <div className="text-2xl font-bold text-green-600">
                ₪{currentJob.finalPrice.toLocaleString()}
              </div>
            )}
            
            <Button variant="outline" className="mt-4" onClick={onBack}>
              חזרה למסך הראשי
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const getActionButtonText = () => {
    if (!currentJob) return '';
    
    switch (currentJob.status) {
      case 'accepted': return 'יצאתי לדרך 🚗';
      case 'en_route': return 'הגעתי ליעד 📍';
      case 'arrived': return 'התחל עבודה 🛠️';
      case 'in_progress': return 'סיום עבודה ✅';
      case 'payment_pending': return 'ממתין לתשלום...';
      default: return '';
    }
  };

  const isActionDisabled = () => {
    if (!currentJob) return true;
    if (isUpdating || isJobLoading) return true;
    if (currentJob.status === 'payment_pending') return true;
    if (currentJob.status === 'completed') return true;
    if (currentJob.status === 'arrived' && (!securityCodeVerified || !hasEvidence.before)) return true;
    if (currentJob.status === 'in_progress' && !hasEvidence.after) return true;
    return false;
  };

  if (isJobLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center" dir="rtl">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" aria-hidden="true" />
          <p className="text-gray-600">טוען משימה...</p>
        </div>
      </div>
    );
  }

  if (jobError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4" dir="rtl">
        <Alert className="max-w-md bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-900">שגיאה</AlertTitle>
          <AlertDescription className="text-red-700">{jobError}</AlertDescription>
          <Button variant="outline" className="mt-4" onClick={onBack}>
            חזרה
          </Button>
        </Alert>
      </div>
    );
  }

  if (!currentJob) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4" dir="rtl">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto" aria-hidden="true" />
          <h2 className="text-xl font-bold text-gray-700">אין משימה פעילה</h2>
          <p className="text-gray-500">לא נמצאה משימה פעילה כרגע</p>
          <Button variant="outline" onClick={onBack}>
            חזרה למסך הראשי
          </Button>
        </div>
      </div>
    );
  }

  const currentStatusIndex = STATUS_FLOW.indexOf(currentJob.status);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col" dir="rtl">
      
      <header className="bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-10">
        {onBack ? (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            aria-label="סגור"
          >
            <X className="w-6 h-6 text-gray-500" aria-hidden="true" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" aria-label="חזור">
            <ChevronLeft className="w-6 h-6 text-gray-500" aria-hidden="true" />
          </Button>
        )}
        <div className="text-center">
          <div className="text-xs text-gray-500 uppercase tracking-wider">משימה פעילה</div>
          <div className="font-bold text-gray-900 text-lg">#{currentJob.id.slice(-5)}</div>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          PRO
        </Badge>
      </header>

      <main className="flex-1 p-4 max-w-md mx-auto w-full flex flex-col gap-6">
        
        <nav aria-label="התקדמות משימה">
          <div className="flex justify-between items-center px-4 py-2">
            {STATUS_FLOW.map((step, idx) => {
              const isActive = idx === currentStatusIndex;
              const isPast = idx < currentStatusIndex;
              
              return (
                <div key={step} className="flex flex-col items-center gap-1">
                  <div 
                    className={`w-3 h-3 rounded-full transition-all duration-300 
                      ${isActive ? 'bg-blue-600 scale-125 ring-4 ring-blue-100' : 
                        isPast ? 'bg-blue-400' : 'bg-gray-200'}`}
                    aria-current={isActive ? 'step' : undefined}
                  />
                </div>
              );
            })}
          </div>
          <div className="text-center text-sm text-gray-600 mt-1">
            {JOB_STATUS_LABELS[currentJob.status]}
          </div>
        </nav>

        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="p-6">
              {renderContextArea()}
            </div>
          </CardContent>
        </Card>

        {currentJob.status !== 'completed' && currentJob.status !== 'payment_pending' && (
          <div className="mt-auto pt-4 pb-8 sticky bottom-0 space-y-3">
            <Button 
              size="lg" 
              className={`w-full h-16 text-xl font-bold shadow-xl transition-all transform active:scale-95
                ${currentJob.status === 'in_progress' 
                  ? 'bg-green-600 hover:bg-green-700 shadow-green-200' 
                  : 'bg-gray-900 hover:bg-black shadow-gray-300'}`}
              onClick={handleAction}
              disabled={isActionDisabled()}
              aria-busy={isUpdating}
            >
              {isUpdating ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                  מעדכן...
                </span>
              ) : (
                getActionButtonText()
              )}
            </Button>

            {currentJob.status !== 'in_progress' && (
              <Button 
                variant="ghost" 
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleCancelJob}
                disabled={isUpdating}
              >
                ביטול משימה
              </Button>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
