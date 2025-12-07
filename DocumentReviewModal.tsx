import { useState } from 'react';
import { Shield, Check, X, ZoomIn, ZoomOut, FileText } from 'lucide-react';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { VerifyIdentityPayload } from '../../../types/adminActions';

interface DocumentData {
  type: 'id' | 'license' | 'certificate';
  url: string;
  uploadedAt: string;
}

interface DocumentReviewModalProps {
  userId: string;
  userName?: string;
  documents?: DocumentData[];
  isLoading: boolean;
  onConfirm: (payload: VerifyIdentityPayload) => Promise<void>;
  onCancel: () => void;
}

const DEFAULT_DOCUMENTS: DocumentData[] = [
  {
    type: 'id',
    url: 'https://images.unsplash.com/photo-1633265486064-086b219458ec?auto=format&fit=crop&q=80&w=400',
    uploadedAt: '2024-11-29T10:30:00Z'
  },
  {
    type: 'license',
    url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=400',
    uploadedAt: '2024-11-29T10:32:00Z'
  }
];

const documentLabels: Record<string, string> = {
  id: 'תעודת זהות',
  license: 'רישיון מקצועי',
  certificate: 'תעודה מקצועית'
};

export function DocumentReviewModal({
  userId,
  userName,
  documents = DEFAULT_DOCUMENTS,
  isLoading,
  onConfirm,
  onCancel
}: DocumentReviewModalProps) {
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleApprove = () => {
    onConfirm({
      userId,
      approved: true
    });
  };

  const handleReject = () => {
    if (!showRejectReason) {
      setShowRejectReason(true);
      return;
    }
    if (!rejectReason.trim()) return;
    onConfirm({
      userId,
      approved: false,
      rejectionReason: rejectReason.trim()
    });
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('he-IL', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.5, 1));

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-3 text-purple-600">
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold">אימות זהות</h3>
          {userName && <p className="text-sm text-gray-500">{userName}</p>}
        </div>
      </div>

      {zoomedImage ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setZoomedImage(null);
                setZoomLevel(1);
              }}
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              ← חזרה לכל המסמכים
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="overflow-auto max-h-[400px] rounded-lg border border-gray-200 bg-gray-100">
            <img
              src={zoomedImage}
              alt="מסמך מוגדל"
              className="transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top right' }}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <FileText className="w-4 h-4" />
            מסמכים שהועלו ({documents.length})
          </div>
          <div className="grid grid-cols-2 gap-3">
            {documents.map((doc, index) => (
              <div
                key={index}
                className="group relative rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-purple-300 transition-colors"
                onClick={() => setZoomedImage(doc.url)}
              >
                <img
                  src={doc.url}
                  alt={documentLabels[doc.type]}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-white text-xs font-medium">{documentLabels[doc.type]}</p>
                  <p className="text-white/70 text-[10px]">{formatDate(doc.uploadedAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showRejectReason && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Label htmlFor="reject_reason" className="text-sm font-medium text-gray-700">
            סיבת הדחייה <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="reject_reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="תאר מדוע המסמכים נדחו (למשל: תמונה לא ברורה, מסמך פג תוקף...)"
            className="min-h-[80px] resize-none"
          />
        </div>
      )}

      <div className="flex gap-3 pt-2">
        {!showRejectReason ? (
          <>
            <Button
              onClick={handleApprove}
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="w-4 h-4 ml-1" />
              {isLoading ? 'מבצע...' : 'אשר'}
            </Button>
            <Button
              onClick={handleReject}
              disabled={isLoading}
              variant="outline"
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
            >
              <X className="w-4 h-4 ml-1" />
              דחה
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={handleReject}
              disabled={!rejectReason.trim() || isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? 'מבצע...' : 'אשר דחייה'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectReason(false);
                setRejectReason('');
              }}
              disabled={isLoading}
              className="flex-1"
            >
              ביטול
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
