import { useState, useEffect } from 'react';
import { X, MapPin, Clock, Brain, AlertTriangle, Package, CheckCircle, MessageCircle, TrendingUp, Send, Info, Image as ImageIcon, Calendar, Briefcase } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';

export type Request = {
  id: string;
  clientName: string;
  clientImage: string;
  service: string;
  status: 'new' | 'pending' | 'accepted' | 'completed';
  urgency: 'immediate' | 'planned';
  address: string;
  distance: number;
  requestedDate: string;
  scheduledTime?: string;
  estimatedDuration: number;
  clientMessage?: string;
  aiAnalysis: {
    summary: string;
    detectedIssues: string[];
    estimatedMaterials: string[];
    recommendations: string[];
    confidenceScore: number;
  };
  hasVideo: boolean;
  videoUrl?: string;
  photos?: string[];
  suggestedPrice: number;
  createdAt: string;
  competitorStats: {
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
    totalBids: number;
  };
  competitorBids?: Array<{
    id: string;
    price: number;
    timeAgo: string;
    label: string;
  }>;
  finalPrice?: number;
};

type BidProposalModalProps = {
  request: Request | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitBid: (price: number, message: string) => void;
  existingBid?: { price: number; message?: string };
};

export function BidProposalModal({ 
  request, 
  isOpen, 
  onClose, 
  onSubmitBid,
  existingBid 
}: BidProposalModalProps) {
  const [bidPrice, setBidPrice] = useState('');
  const [bidMessage, setBidMessage] = useState('');

  useEffect(() => {
    if (isOpen && request) {
      setBidPrice(existingBid?.price?.toString() || request.suggestedPrice.toString());
      setBidMessage(existingBid?.message || '');
    }
  }, [isOpen, request, existingBid]);

  if (!isOpen || !request) return null;

  const handleSubmit = () => {
    if (!bidPrice) return;
    onSubmitBid(parseFloat(bidPrice), bidMessage);
    toast.success(existingBid ? '\u05D4\u05D4\u05E6\u05E2\u05D4 \u05E2\u05D5\u05D3\u05DB\u05E0\u05D4 \u05D1\u05D4\u05E6\u05DC\u05D7\u05D4!' : '\u05D4\u05D4\u05E6\u05E2\u05D4 \u05E0\u05E9\u05DC\u05D7\u05D4 \u05D1\u05D4\u05E6\u05DC\u05D7\u05D4!');
    onClose();
  };

  const getPricePosition = (price: number, min: number, max: number) => {
    if (max === min) return 50;
    return Math.max(0, Math.min(100, ((price - min) / (max - min)) * 100));
  };

  const isEditing = !!existingBid;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r p-5 text-white ${
          isEditing ? 'from-green-600 to-green-700' : 'from-blue-600 to-blue-700'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold">
              {isEditing ? '\u05E9\u05D9\u05E0\u05D5\u05D9 \u05D4\u05E6\u05E2\u05EA \u05DE\u05D7\u05D9\u05E8' : '\u05D4\u05D2\u05E9\u05EA \u05D4\u05E6\u05E2\u05EA \u05DE\u05D7\u05D9\u05E8'}
            </h3>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <ImageWithFallback
              src={request.clientImage}
              alt={request.clientName}
              className="w-11 h-11 rounded-full object-cover border-2 border-white/30"
            />
            <div>
              <div className="font-bold">{request.clientName}</div>
              <div className="text-white/80 text-sm flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                {request.service}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {/* Order Info Tags */}
          <div className="flex flex-wrap gap-1.5">
            <span className="bg-gray-100 px-2 py-1 rounded-full text-xs flex items-center gap-1">
              <MapPin className="w-3 h-3 text-gray-500" />
              {request.address}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
              request.urgency === 'immediate' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              <Clock className="w-3 h-3" />
              {request.urgency === 'immediate' ? '\u05D3\u05D7\u05D5\u05E3' : request.requestedDate}
            </span>
            {request.scheduledTime && (
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {request.scheduledTime}
              </span>
            )}
          </div>

          {/* AI Analysis */}
          {request.aiAnalysis && (
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg p-3 border border-teal-100">
              <div className="flex items-center gap-2 text-teal-700 mb-1.5">
                <Brain className="w-4 h-4" />
                <span className="font-bold text-sm">{'\u05E0\u05D9\u05EA\u05D5\u05D7 AI'}</span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed mb-2">
                {request.aiAnalysis.summary || request.service}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {request.aiAnalysis.detectedIssues && request.aiAnalysis.detectedIssues.length > 0 && (
                  <span className="bg-white px-2 py-0.5 rounded text-[10px] font-medium text-orange-700 border border-orange-100 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {request.aiAnalysis.detectedIssues.length} {'\u05D1\u05E2\u05D9\u05D5\u05EA \u05D6\u05D5\u05D4\u05D5'}
                  </span>
                )}
                {request.aiAnalysis.estimatedMaterials && request.aiAnalysis.estimatedMaterials.length > 0 && (
                  <span className="bg-white px-2 py-0.5 rounded text-[10px] font-medium text-blue-700 border border-blue-100 flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    {request.aiAnalysis.estimatedMaterials.length} {'\u05D7\u05D5\u05DE\u05E8\u05D9\u05DD'}
                  </span>
                )}
                <span className="bg-white px-2 py-0.5 rounded text-[10px] font-medium text-teal-700 border border-teal-100 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {Math.round(request.aiAnalysis.confidenceScore * 100)}% {'\u05D3\u05D9\u05D5\u05E7'}
                </span>
              </div>
            </div>
          )}

          {/* Photos */}
          {request.photos && request.photos.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                {'\u05EA\u05DE\u05D5\u05E0\u05D5\u05EA'} ({request.photos.length})
              </span>
              <div className="flex gap-1.5 overflow-x-auto">
                {request.photos.slice(0, 4).map((photo, index) => (
                  <div key={index} className="relative flex-shrink-0">
                    <img
                      src={photo}
                      alt={`\u05EA\u05DE\u05D5\u05E0\u05D4 ${index + 1}`}
                      className="w-11 h-11 rounded-lg object-cover border border-gray-200"
                    />
                    {index === 3 && request.photos && request.photos.length > 4 && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xs">+{request.photos.length - 4}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Client Message */}
          {request.clientMessage && (
            <div className="bg-amber-50 rounded-lg p-2.5 border border-amber-100">
              <div className="flex items-start gap-2">
                <MessageCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-700 leading-relaxed italic">
                  "{request.clientMessage}"
                </p>
              </div>
            </div>
          )}

          {/* Market Insights */}
          {request.competitorStats && request.competitorStats.totalBids > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  {'\u05EA\u05DE\u05D5\u05E0\u05EA \u05DE\u05E6\u05D1 \u05E9\u05D5\u05E7'}
                </h4>
                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {request.competitorStats.totalBids} {'\u05DE\u05EA\u05D7\u05E8\u05D9\u05DD'}
                </span>
              </div>

              {/* Price Range Slider */}
              <div className="mb-2">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-gray-600">{'\u20AA'}{request.competitorStats.minPrice}</span>
                  <span className="text-blue-600 font-bold">{'\u05DE\u05DE\u05D5\u05E6\u05E2'}: {'\u20AA'}{request.competitorStats.avgPrice}</span>
                  <span className="text-gray-600">{'\u20AA'}{request.competitorStats.maxPrice}</span>
                </div>
                <div className="relative h-1.5 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 rounded-full">
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full shadow border-2 border-white"
                    style={{
                      left: `${getPricePosition(
                        parseFloat(bidPrice) || request.suggestedPrice, 
                        request.competitorStats.minPrice, 
                        request.competitorStats.maxPrice
                      )}%`
                    }}
                  >
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[8px] font-bold px-1 py-0.5 rounded whitespace-nowrap">
                      {'\u05D0\u05EA\u05D4'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Competitor Bids */}
              {request.competitorBids && request.competitorBids.length > 0 && (
                <div className="pt-2 border-t border-blue-200">
                  <div className="text-[10px] text-gray-500 mb-1.5">{'\u05D4\u05E6\u05E2\u05D5\u05EA \u05DE\u05EA\u05D7\u05E8\u05D9\u05DD'}:</div>
                  <div className="space-y-1">
                    {request.competitorBids.slice(0, 3).map((bid) => (
                      <div key={bid.id} className="flex items-center justify-between bg-white/60 rounded px-2 py-1 text-xs">
                        <span className="text-gray-600">{bid.label}</span>
                        <span className="font-bold text-gray-900">{'\u20AA'}{bid.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strategic Advice */}
              <div className="mt-2 bg-blue-100 rounded p-2 flex items-center gap-1.5">
                <Info className="w-3 h-3 text-blue-600 flex-shrink-0" />
                <p className="text-[10px] text-blue-900">
                  {'\u05D4\u05E6\u05E2\u05D4 \u05D1-'}{'\u20AA'}{Math.round(request.competitorStats.minPrice * 0.93)} {'\u05EA\u05D2\u05D3\u05D9\u05DC \u05E1\u05D9\u05DB\u05D5\u05D9\u05D9 \u05D6\u05DB\u05D9\u05D9\u05D4 \u05D1-40%'}
                </p>
              </div>
            </div>
          )}

          {/* No Competitors Badge */}
          {(!request.competitorStats || request.competitorStats.totalBids === 0) && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
              <div className="text-green-700 font-bold text-sm">{'\u{1F3AF} \u05D0\u05EA\u05D4 \u05D4\u05E8\u05D0\u05E9\u05D5\u05DF!'}</div>
              <div className="text-xs text-green-600">{'\u05D0\u05D9\u05DF \u05E2\u05D3\u05D9\u05D9\u05DF \u05DE\u05EA\u05D7\u05E8\u05D9\u05DD'}</div>
            </div>
          )}

          {/* Price Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">{'\u05D4\u05DE\u05D7\u05D9\u05E8 \u05E9\u05DC\u05DA'}</label>
            <div className="relative">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">{'\u20AA'}</span>
              <input
                type="number"
                value={bidPrice}
                onChange={(e) => setBidPrice(e.target.value)}
                className="w-full pr-8 pl-3 py-3 text-xl font-bold text-center border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="0"
              />
            </div>
            <div className="flex justify-center gap-1.5 mt-2">
              {request.competitorStats && request.competitorStats.totalBids > 0 ? (
                <>
                  {[
                    { label: '-20%', value: Math.round(request.competitorStats.minPrice * 0.8) },
                    { label: '-10%', value: Math.round(request.competitorStats.minPrice * 0.9) },
                    { label: 'Min', value: request.competitorStats.minPrice },
                    { label: 'Moy', value: request.competitorStats.avgPrice },
                  ].map((option) => (
                    <button
                      key={option.label}
                      onClick={() => setBidPrice(option.value.toString())}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        parseInt(bidPrice) === option.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </>
              ) : (
                [-20, -10, 0, 10, 20].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setBidPrice((request.suggestedPrice + diff).toString())}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      parseInt(bidPrice) === request.suggestedPrice + diff
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {diff >= 0 ? `+${diff}` : diff}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Message Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">{'\u05D4\u05D5\u05D3\u05E2\u05D4 \u05DC\u05DC\u05E7\u05D5\u05D7 (\u05D0\u05D5\u05E4\u05E6\u05D9\u05D5\u05E0\u05DC\u05D9)'}</label>
            <textarea
              value={bidMessage}
              onChange={(e) => setBidMessage(e.target.value)}
              placeholder={'\u05DC\u05D3\u05D5\u05D2\u05DE\u05D4: \u05D4\u05DE\u05D7\u05D9\u05E8 \u05DB\u05D5\u05DC\u05DC \u05D7\u05DC\u05E7\u05D9\u05DD...'}
              className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none text-sm"
              rows={2}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={handleSubmit}
            disabled={!bidPrice}
            className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
              isEditing
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-200'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Send className="w-5 h-5" />
            {isEditing ? '\u05E2\u05D3\u05DB\u05DF \u05D4\u05E6\u05E2\u05D4' : '\u05E9\u05DC\u05D7 \u05D4\u05E6\u05E2\u05D4'}
          </button>
          <p className="text-center text-[10px] text-gray-400 mt-2">
            {'\u05D1\u05DC\u05D7\u05D9\u05E6\u05D4 \u05D0\u05EA\u05D4 \u05DE\u05E1\u05DB\u05D9\u05DD \u05DC\u05EA\u05E0\u05D0\u05D9 \u05D4\u05E9\u05D9\u05DE\u05D5\u05E9'}
          </p>
        </div>
      </div>
    </div>
  );
}
