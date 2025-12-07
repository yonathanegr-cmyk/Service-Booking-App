import { motion, AnimatePresence } from 'motion/react';
import { X, Home, Clock, CreditCard, Settings, HelpCircle, LogOut, ChevronRight, User, LayoutDashboard, Send, MessageSquare, Calendar, Bookmark, Star, RotateCcw, ShoppingBag } from 'lucide-react';

import { ImageWithFallback } from './figma/ImageWithFallback';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  user?: { name: string; image: string; email: string };
};

export function Sidebar({ isOpen, onClose, onNavigate, user }: SidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[2000] backdrop-blur-sm"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-80 sm:w-96 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 z-[2001] shadow-2xl flex flex-col overflow-y-auto p-4 border-l border-white/50"
            dir="rtl"
          >
              {/* Decorative Background Elements */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

              {/* Header / Close */}
              <div className="flex justify-between items-center mb-4 relative z-10">
                <button 
                  onClick={onClose}
                  className="p-1.5 hover:bg-black/5 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
                <div className="text-xs text-gray-500 font-medium">{user?.email || 'משתמש אורח'}</div>
                <div className="w-8"></div> {/* Spacer */}
              </div>

              {/* Profile Info */}
              <div className="flex flex-col items-center mb-6 relative z-10">
                <div className="w-16 h-16 rounded-full border-4 border-white shadow-lg overflow-hidden mb-3">
                  <ImageWithFallback
                    src={user?.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop"}
                    alt={user?.name || "User"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-lg font-bold text-gray-900">שלום {user?.name || 'אורח'}!</h2>
              </div>

              {/* User Dashboard Button */}
              <button 
                onClick={() => {
                  onNavigate('dashboard');
                  onClose();
                }}
                className="w-full bg-blue-50 text-blue-600 font-bold py-2.5 px-4 rounded-xl border border-blue-100 mb-4 shadow-sm hover:bg-blue-100 transition-colors relative z-10 text-sm flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>לוח בקרה אישי</span>
              </button>

              {/* Actions Grid */}
              <div className="space-y-2.5 relative z-10">
                {/* Pro Account & Logout Row */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button 
                    onClick={() => {
                        onNavigate('pro-access');
                        onClose();
                    }}
                    className="bg-white p-3 rounded-xl shadow-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-gray-700"
                  >
                    <div className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold">+</div>
                    <span className="font-medium text-xs">חשבון מקצועי</span>
                  </button>
                  <button 
                    onClick={() => {
                      onClose();
                      onNavigate('logout');
                    }}
                    className="bg-white p-3 rounded-xl shadow-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-gray-700"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="font-medium text-xs">התנתק</span>
                  </button>
                </div>

                {/* Main Menu Items */}
                <button 
                  onClick={() => {
                    onNavigate('new-tender');
                    onClose();
                  }}
                  className="w-full bg-white p-3 rounded-xl shadow-sm flex items-center gap-3 hover:bg-gray-50 transition-colors text-gray-700 group"
                >
                  <Send className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <span className="font-medium text-xs flex-1 text-right">פרסם מכרז חדש</span>
                </button>

                <button 
                  onClick={() => {
                    onNavigate('messages');
                    onClose();
                  }}
                  className="w-full bg-white p-3 rounded-xl shadow-sm flex items-center gap-3 hover:bg-gray-50 transition-colors text-gray-700 group"
                >
                  <MessageSquare className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <span className="font-medium text-xs flex-1 text-right">הודעות</span>
                </button>

                <button 
                  onClick={() => {
                    onNavigate('orders');
                    onClose();
                  }}
                  className="w-full bg-white p-3 rounded-xl shadow-sm flex items-center gap-3 hover:bg-gray-50 transition-colors text-gray-700 group"
                >
                  <Calendar className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <span className="font-medium text-xs flex-1 text-right">ההזמנות שלי</span>
                </button>

                <button 
                  onClick={() => {
                    onNavigate('activity');
                    onClose();
                  }}
                  className="w-full bg-white p-3 rounded-xl shadow-sm flex items-center gap-3 hover:bg-gray-50 transition-colors text-gray-700 group"
                >
                  <Bookmark className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <span className="font-medium text-xs flex-1 text-right">הצעות שמורות</span>
                </button>

                <button 
                  onClick={() => {
                    onNavigate('schedule');
                    onClose();
                  }}
                  className="w-full bg-white p-3 rounded-xl shadow-sm flex items-center gap-3 hover:bg-gray-50 transition-colors text-gray-700 group"
                >
                  <Calendar className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <span className="font-medium text-xs flex-1 text-right">לוח שנה</span>
                </button>

                <button 
                  onClick={() => {
                    onNavigate('refunds');
                    onClose();
                  }}
                  className="w-full bg-white p-3 rounded-xl shadow-sm flex items-center gap-3 hover:bg-gray-50 transition-colors text-gray-700 group"
                >
                  <RotateCcw className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <span className="font-medium text-xs flex-1 text-right">החזרים</span>
                </button>

                <button 
                  onClick={() => {
                    onNavigate('loyalty');
                    onClose();
                  }}
                  className="w-full bg-white p-3 rounded-xl shadow-sm flex items-center gap-3 hover:bg-gray-50 transition-colors text-gray-700 group"
                >
                  <Star className="w-4 h-4 text-gray-400 group-hover:text-yellow-500 transition-colors" />
                  <span className="font-medium text-xs flex-1 text-right">מועדון לקוחות</span>
                </button>

                <button 
                  onClick={() => {
                    onNavigate('store');
                    onClose();
                  }}
                  className="w-full bg-white p-3 rounded-xl shadow-sm flex items-center gap-3 hover:bg-gray-50 transition-colors text-gray-700 group"
                >
                  <ShoppingBag className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <span className="font-medium text-xs flex-1 text-right">חנות</span>
                </button>

                {/* Bottom Row */}
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <button 
                    onClick={() => {
                      onNavigate('profile');
                      onClose();
                    }}
                    className="bg-white p-3 rounded-xl shadow-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-gray-700"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span className="font-medium text-xs">הגדרות</span>
                  </button>
                  <button 
                    onClick={() => {
                      onNavigate('help');
                      onClose();
                    }}
                    className="bg-white p-3 rounded-xl shadow-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-gray-700"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span className="font-medium text-xs">עזרה</span>
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 flex justify-center items-center gap-4 text-[10px] text-gray-400 pb-2 relative z-10">
                <button className="hover:text-gray-700 transition-colors">מדיניות פרטיות</button>
                <div className="w-0.5 h-0.5 bg-gray-300 rounded-full"></div>
                <button className="hover:text-gray-700 transition-colors">תנאי שימוש</button>
              </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}