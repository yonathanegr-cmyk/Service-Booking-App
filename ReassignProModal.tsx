import { useState, useMemo } from 'react';
import { UserPlus, Star, MapPin, CheckCircle, Search, Filter } from 'lucide-react';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { ReassignProPayload, AvailablePro } from '../../../types/adminActions';

interface ReassignProModalProps {
  orderId: string;
  currentProName?: string;
  availablePros: AvailablePro[];
  isLoading: boolean;
  onConfirm: (payload: ReassignProPayload) => Promise<void>;
  onCancel: () => void;
}

type SortOption = 'distance' | 'rating' | 'jobs';

export function ReassignProModal({
  orderId,
  currentProName,
  availablePros,
  isLoading,
  onConfirm,
  onCancel
}: ReassignProModalProps) {
  const [selectedProId, setSelectedProId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('distance');

  const filteredAndSortedPros = useMemo(() => {
    let result = [...availablePros];
    
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter(pro => 
        pro.name.toLowerCase().includes(query) ||
        pro.category.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return a.distance - b.distance;
        case 'rating':
          return b.rating - a.rating;
        case 'jobs':
          return b.completedJobs - a.completedJobs;
        default:
          return 0;
      }
    });

    return result;
  }, [availablePros, searchQuery, sortBy]);

  const selectedPro = availablePros.find(p => p.id === selectedProId);

  const handleSubmit = () => {
    if (!selectedProId) return;
    onConfirm({
      orderId,
      newProId: selectedProId,
      reason: reason.trim() || undefined
    });
  };

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center gap-3 text-purple-600">
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
          <UserPlus className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold">החלפת בעל מקצוע</h3>
          {currentProName && (
            <p className="text-sm text-gray-500">
              נוכחי: <span className="font-medium text-gray-700">{currentProName}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חיפוש לפי שם או קטגוריה..."
            className="pr-9"
          />
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setSortBy('distance')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              sortBy === 'distance' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 inline ml-1" />
            מרחק
          </button>
          <button
            onClick={() => setSortBy('rating')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              sortBy === 'rating' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Star className="w-3.5 h-3.5 inline ml-1" />
            דירוג
          </button>
          <button
            onClick={() => setSortBy('jobs')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              sortBy === 'jobs' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            עבודות
          </button>
        </div>
      </div>

      <div className="max-h-[240px] overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2">
        {filteredAndSortedPros.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">לא נמצאו בעלי מקצוע זמינים</p>
          </div>
        ) : (
          filteredAndSortedPros.map((pro) => (
            <button
              key={pro.id}
              onClick={() => setSelectedProId(pro.id)}
              className={`w-full p-3 rounded-lg border-2 transition-all text-right ${
                selectedProId === pro.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold">
                  {pro.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 truncate">{pro.name}</span>
                    {pro.isVerified && (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      {pro.rating.toFixed(1)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {pro.distance} ק"מ
                    </span>
                    <span>{pro.completedJobs} עבודות</span>
                  </div>
                </div>
                {selectedProId === pro.id && (
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                )}
              </div>
            </button>
          ))
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
          סיבת ההחלפה (אופציונלי)
        </Label>
        <Textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="תאר את הסיבה להחלפת בעל המקצוע..."
          className="min-h-[60px] resize-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          onClick={handleSubmit}
          disabled={!selectedProId || isLoading}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
        >
          {isLoading ? 'מבצע...' : selectedPro ? `החלף ל${selectedPro.name}` : 'בחר בעל מקצוע'}
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
