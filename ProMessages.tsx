import { useState, useRef, useEffect } from 'react';
import { Search, Send, MoreVertical, Phone, Video, Image, Paperclip, CheckCheck, Check } from 'lucide-react';

type Message = {
  id: string;
  content: string;
  sender: 'me' | 'other';
  time: string;
  status: 'sent' | 'delivered' | 'read';
};

type Conversation = {
  id: string;
  user: {
    name: string;
    avatar: string;
    status: 'online' | 'offline';
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
};

const initialConversations: Conversation[] = [
  {
    id: '1',
    user: {
      name: 'דני כהן',
      avatar: 'https://i.pravatar.cc/150?img=68',
      status: 'online'
    },
    lastMessage: 'תודה רבה, נתראה מחר בבוקר',
    lastMessageTime: '10:30',
    unreadCount: 0,
    messages: [
      { id: '1', content: 'היי, רציתי לשאול לגבי הצעת המחיר', sender: 'other', time: '10:00', status: 'read' },
      { id: '2', content: 'היי דני, בטח. מה השאלה?', sender: 'me', time: '10:05', status: 'read' },
      { id: '3', content: 'האם המחיר כולל מע"מ?', sender: 'other', time: '10:15', status: 'read' },
      { id: '4', content: 'כן, המחיר כולל מע"מ וחלקים', sender: 'me', time: '10:20', status: 'read' },
      { id: '5', content: 'מעולה, אז נקבע למחר?', sender: 'other', time: '10:25', status: 'read' },
      { id: '6', content: 'תודה רבה, נתראה מחר בבוקר', sender: 'me', time: '10:30', status: 'read' },
    ]
  },
  {
    id: '2',
    user: {
      name: 'שרה לוי',
      avatar: 'https://i.pravatar.cc/150?img=44',
      status: 'offline'
    },
    lastMessage: 'מתי תוכל להגיע?',
    lastMessageTime: 'אתמול',
    unreadCount: 2,
    messages: [
      { id: '1', content: 'היי, יש לי נזילה בכיור', sender: 'other', time: '14:00', status: 'read' },
      { id: '2', content: 'אשמח לקבל פרטים נוספים', sender: 'me', time: '14:10', status: 'read' },
      { id: '3', content: 'מתי תוכל להגיע?', sender: 'other', time: '14:15', status: 'delivered' },
    ]
  },
  {
    id: '3',
    user: {
      name: 'רון שחר',
      avatar: 'https://i.pravatar.cc/150?img=33',
      status: 'offline'
    },
    lastMessage: 'שלחתי לך את התמונות',
    lastMessageTime: 'יום ג׳',
    unreadCount: 0,
    messages: [
      { id: '1', content: 'שלחתי לך את התמונות', sender: 'other', time: '09:00', status: 'read' },
    ]
  }
];

export function ProMessages() {
  const [activeConversation, setActiveConversation] = useState<string>('1');
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = conversations.find(c => c.id === activeConversation);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  const getCurrentTime = (): string => {
    const now = new Date();
    return now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const messageId = `msg-${Date.now()}`;
    const currentTime = getCurrentTime();

    const newMsg: Message = {
      id: messageId,
      content: newMessage.trim(),
      sender: 'me',
      time: currentTime,
      status: 'sent'
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConversation) {
        return {
          ...conv,
          messages: [...conv.messages, newMsg],
          lastMessage: newMessage.trim(),
          lastMessageTime: currentTime
        };
      }
      return conv;
    }));

    setNewMessage('');

    setTimeout(() => {
      setConversations(prev => prev.map(conv => {
        if (conv.id === activeConversation) {
          return {
            ...conv,
            messages: conv.messages.map(msg => 
              msg.id === messageId ? { ...msg, status: 'delivered' } : msg
            )
          };
        }
        return conv;
      }));
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Conversations List - Right Side */}
      <div className="w-1/3 border-l border-gray-200 flex flex-col bg-gray-50">
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="חיפוש שיחה..."
              className="w-full pr-10 pl-4 py-2 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setActiveConversation(conversation.id)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-white transition-colors border-b border-gray-100 ${
                activeConversation === conversation.id ? 'bg-white border-r-4 border-r-blue-600 shadow-sm' : ''
              }`}
            >
              <div className="relative">
                <img
                  src={conversation.user.avatar}
                  alt={conversation.user.name}
                  className="w-12 h-12 rounded-full object-cover border border-gray-200"
                />
                {conversation.user.status === 'online' && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div className="flex-1 text-right min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className={`font-semibold truncate ${activeConversation === conversation.id ? 'text-blue-700' : 'text-gray-900'}`}>
                    {conversation.user.name}
                  </h4>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{conversation.lastMessageTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500 truncate max-w-[180px]">
                    {conversation.lastMessage}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area - Left Side */}
      {activeChat ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
            <div className="flex items-center gap-3">
              <img
                src={activeChat.user.avatar}
                alt={activeChat.user.name}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
              <div>
                <h3 className="font-bold text-gray-900">{activeChat.user.name}</h3>
                <span className="text-xs text-green-600 flex items-center gap-1">
                  {activeChat.user.status === 'online' ? '● מחובר כעת' : 'נראה לאחרונה היום ב-14:30'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                <Video className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
            {activeChat.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'me' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${
                    message.sender === 'me'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                      message.sender === 'me' ? 'text-blue-100' : 'text-gray-400'
                    }`}
                  >
                    <span>{message.time}</span>
                    {message.sender === 'me' && (
                      message.status === 'sent' ? (
                        <Check className="w-3 h-3 opacity-70" />
                      ) : (
                        <CheckCheck className={`w-3 h-3 ${message.status === 'read' ? 'text-blue-300' : 'opacity-70'}`} />
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-end gap-2">
              <div className="flex-1 bg-gray-100 rounded-2xl p-2 flex items-end gap-2 border border-transparent focus-within:border-blue-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <div className="flex pb-2 pr-2 gap-1">
                  <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-200 rounded-full transition-colors">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-200 rounded-full transition-colors">
                    <Image className="w-5 h-5" />
                  </button>
                </div>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="הקלד הודעה..."
                  className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 py-3 text-sm"
                  rows={1}
                  style={{ minHeight: '44px' }}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="p-3 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-center p-8">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Send className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">ההודעות שלך</h3>
          <p className="text-gray-500 max-w-xs">
            בחר שיחה מהרשימה מימין כדי לצפות בהודעות ולהתכתב עם הלקוחות
          </p>
        </div>
      )}
    </div>
  );
}
