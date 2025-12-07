import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Send, Phone, MoreVertical, Check, CheckCheck } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export type Provider = {
  id?: string;
  name: string;
  role: string;
  phone: string;
  image: string;
  rating?: number;
  carInfo?: string;
  licensePlate?: string;
};

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'provider';
  timestamp: string;
  read?: boolean;
};

type ChatScreenProps = {
  provider: Provider;
  onBack: () => void;
  onCall?: () => void;
};

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    text: 'שלום! אני בדרך אליך, אגיע בערך בעוד 5 דקות.',
    sender: 'provider',
    timestamp: '14:23',
    read: true
  },
  {
    id: '2',
    text: 'מעולה, תודה! אני מחכה בכניסה לבניין.',
    sender: 'user',
    timestamp: '14:24',
    read: true
  },
  {
    id: '3',
    text: 'סבבה, יש מקום חניה ליד הבניין?',
    sender: 'provider',
    timestamp: '14:25',
    read: true
  },
  {
    id: '4',
    text: 'כן, יש חניה חופשית ברחוב, ממש ליד הכניסה.',
    sender: 'user',
    timestamp: '14:26',
    read: true
  },
  {
    id: '5',
    text: 'מושלם! הגעתי, אני מחפש חניה עכשיו.',
    sender: 'provider',
    timestamp: '14:30',
    read: false
  }
];

export function ChatScreen({ provider, onBack, onCall }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
      read: false
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        'קיבלתי, תודה!',
        'סבבה, מיד מטפל בזה.',
        'בסדר גמור!',
        'אני כבר בדרך.',
        'שמעתי, תודה על העדכון.'
      ];
      const providerMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: 'provider',
        timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
        read: false
      };
      setMessages(prev => [...prev, providerMessage]);
    }, 1500);
  };

  const handleCall = () => {
    if (onCall) {
      onCall();
    } else {
      window.location.href = `tel:${provider.phone}`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[80] bg-gray-50 flex flex-col"
      dir="rtl"
      lang="he"
    >
      <header className="bg-white border-b border-gray-100 shadow-sm z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="חזור אחורה"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3">
              <div className="relative">
                <ImageWithFallback
                  src={provider.image}
                  alt={`תמונה של ${provider.name}`}
                  className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-md"
                />
                <div className="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">{provider.name}</h1>
                <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  מחובר עכשיו
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCall}
              className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={`התקשר ל${provider.name}`}
            >
              <Phone className="w-5 h-5" />
            </button>
            <button
              className="p-2.5 text-gray-400 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="אפשרויות נוספות"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {provider.carInfo && (
          <div className="px-4 pb-3 flex items-center gap-2 text-xs text-gray-500">
            <span className="bg-gray-100 px-2 py-1 rounded-lg font-medium">{provider.carInfo}</span>
            {provider.licensePlate && (
              <span className="bg-gray-900 text-white px-2 py-1 rounded-lg font-mono font-bold">{provider.licensePlate}</span>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="text-center mb-6">
          <span className="inline-block bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">
            היום
          </span>
        </div>

        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`flex ${message.sender === 'user' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`relative max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                <div className={`flex items-center justify-end gap-1 mt-1 ${message.sender === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                  <span className="text-[10px]">{message.timestamp}</span>
                  {message.sender === 'user' && (
                    message.read 
                      ? <CheckCheck className="w-3.5 h-3.5" /> 
                      : <Check className="w-3.5 h-3.5" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex justify-end"
          >
            <div className="bg-white text-gray-500 px-4 py-3 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </main>

      <footer className="p-4 bg-white border-t border-gray-100 pb-8">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-gray-100 rounded-full border border-gray-200 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all overflow-hidden">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="הקלד הודעה..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-900 placeholder-gray-500 py-3 px-4"
              dir="rtl"
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none active:scale-95"
            aria-label="שלח הודעה"
          >
            <Send className="w-5 h-5 -rotate-90" />
          </button>
        </form>
      </footer>
    </motion.div>
  );
}
