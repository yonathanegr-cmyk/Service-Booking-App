import { motion, AnimatePresence } from 'motion/react';
import { Phone, X } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Provider } from './ChatScreen';

type CallConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider;
};

export function CallConfirmModal({ isOpen, onClose, provider }: CallConfirmModalProps) {
  const handleCall = () => {
    window.location.href = `tel:${provider.phone}`;
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          dir="rtl"
          lang="he"
          role="dialog"
          aria-modal="true"
          aria-labelledby="call-modal-title"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="bg-gradient-to-b from-blue-50 to-white pt-8 pb-4 px-6 text-center relative">
              <button
                onClick={onClose}
                className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label="סגור חלון"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative inline-block mb-4">
                <ImageWithFallback
                  src={provider.image}
                  alt={`תמונה של ${provider.name}`}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-xl"
                />
                <div className="absolute -bottom-1 -left-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                  <Phone className="w-4 h-4 text-white" />
                </div>
              </div>

              <h2 id="call-modal-title" className="text-xl font-bold text-gray-900 mb-1">
                להתקשר ל{provider.name}?
              </h2>
              <p className="text-gray-500 text-sm">{provider.role}</p>
            </div>

            <div className="px-6 pb-6">
              <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
                <div className="flex items-center justify-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-lg font-mono font-bold text-gray-900 tracking-wide" dir="ltr">
                    {provider.phone}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onClose}
                  className="py-4 rounded-2xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors min-h-[52px]"
                >
                  ביטול
                </button>
                <button
                  onClick={handleCall}
                  className="py-4 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2 min-h-[52px]"
                >
                  <Phone className="w-5 h-5" />
                  <span>התקשר</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
