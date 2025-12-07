import { useState } from 'react';
import { ArrowRight, Search, HelpCircle, Video, DollarSign, Shield, Clock, User, Smartphone, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

type HelpCenterProps = {
  onBack: () => void;
};

type FAQItem = {
  question: string;
  answer: string;
  category: string;
};

export function HelpCenter({ onBack }: HelpCenterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const categories = [
    { id: 'all', name: 'הכל', icon: '📚' },
    { id: 'getting-started', name: 'תחילת עבודה', icon: '🚀' },
    { id: 'booking', name: 'הזמנות', icon: '📅' },
    { id: 'payment', name: 'תשלומים', icon: '💳' },
    { id: 'ai', name: 'בינה מלאכותית', icon: '🤖' },
    { id: 'guarantee', name: 'אחריות', icon: '🛡️' },
    { id: 'account', name: 'חשבון', icon: '👤' },
  ];

  const faqs: FAQItem[] = [
    {
      category: 'getting-started',
      question: 'איך מתחילים להשתמש ב-Beedy?',
      answer: 'התחלת השימוש ב-Beedy פשוטה: 1) הירשמו לחשבון בחינם 2) צלמו וידאו קצר של הבעיה 3) קבלו הצעות מחיר מיידיות ממקצוענים 4) בחרו את המקצוען המתאים 5) קבעו תור והמקצוען יגיע אליכם!'
    },
    {
      category: 'getting-started',
      question: 'האם יש עלות להרשמה?',
      answer: 'ההרשמה והשימוש בפלטפורמה הם בחינם לחלוטין. אתם משלמים רק עבור השירותים שאתם מזמינים מהמקצוענים.'
    },
    {
      category: 'ai',
      question: 'מה זה Beedy AI Bidding Engine?',
      answer: 'Beedy AI Bidding Engine הוא מנוע בינה מלאכותית מתקדם המנתח את הווידאו או התמונות שלכם כדי לזהות את הבעיה. המערכת מזהה את סוג התקלה, רמת הסיבוכיות והחומרים הנדרשים, ומייצרת דוח טכני מפורט שמאפשר למקצוענים לתת הצעת מחיר מדויקת ללא צורך בביקור מקדים.'
    },
    {
      category: 'ai',
      question: 'עד כמה מדויק ניתוח ה-AI?',
      answer: 'מנוע ה-AI שלנו מאומן על מיליוני מקרים ומשיג דיוק של מעל 95%. במקרים מורכבים במיוחד, המקצוען עשוי לבקש מידע נוסף או להציע ביקור קצר לפני מתן הצעת מחיר סופית.'
    },
    {
      category: 'booking',
      question: 'כמה זמן לוקח לקבל הצעות מחיר?',
      answer: 'לאחר העלאת הווידאו, ניתוח ה-AI לוקח בדרך כלל פחות מדקה. הצעות המחיר מהמקצוענים מתחילות להגיע תוך מספר דקות ועד מספר שעות, תלוי בזמינות המקצוענים באזורכם.'
    },
    {
      category: 'booking',
      question: 'האם אני מחויב לקבל הצעה?',
      answer: 'לא בהחלט! אתם יכולים לעיין בהצעות, להשוות מחירים ודירוגים, ולבחור את המקצוען המתאים לכם. אין שום התחייבות עד לאישור ההזמנה הסופי.'
    },
    {
      category: 'booking',
      question: 'מה קורה אם צריך לבטל הזמנה?',
      answer: 'ניתן לבטל הזמנה עד 24 שעות לפני מועד השירות ללא עלות. ביטול בתוך 24 שעות עשוי להיות כפוף לדמי ביטול של עד 50% מעלות השירות, בהתאם למדיניות המקצוען.'
    },
    {
      category: 'payment',
      question: 'איזה אמצעי תשלום מקובלים?',
      answer: 'אנו מקבלים את כל כרטיסי האשראי המרכזיים (ויזה, מאסטרקארד, אמריקן אקספרס), PayPal, Apple Pay ו-Google Pay. התשלום מעובד בצורה מאובטחת דרך הפלטפורמה.'
    },
    {
      category: 'payment',
      question: 'מתי מבוצע החיוב?',
      answer: 'החיוב מבוצע רק לאחר השלמת השירות ואישורכם. אנו מחזיקים את הכסף באבטחה עד לסיום העבודה לשביעות רצונכם.'
    },
    {
      category: 'payment',
      question: 'האם המחירים כוללים מע"מ?',
      answer: 'כן, כל המחירים המוצגים בפלטפורמה כוללים מע"מ ואין עלויות נסתרות. המחיר שאתם רואים הוא המחיר שתשלמו.'
    },
    {
      category: 'guarantee',
      question: 'מה כוללת האחריות?',
      answer: 'כל שירות מגיע עם אחריות סטנדרטית של 14 יום הכוללת החזר מלא או תיקון חינם במקרה של בעיה. ניתן להרחיב את האחריות ל-30 יום תמורת תשלום נוסף של ₪29.'
    },
    {
      category: 'guarantee',
      question: 'איך מגישים תביעת אחריות?',
      answer: 'פשוט פנו אלינו דרך הצ\'אט באפליקציה או בטלפון תוך תקופת האחריות. אנו נבדוק את המקרה ונספק פתרון תוך 24 שעות - החזר כספי מלא, תיקון חינם או פיצוי אחר.'
    },
    {
      category: 'guarantee',
      question: 'מה קורה אם המקצוען לא מגיע?',
      answer: 'אם המקצוען לא מגיע בזמן שנקבע, תקבלו החזר מלא מיידי + פיצוי של 50 ש"ח. אנו גם נעזור לכם למצוא מקצוען חלופי בהקדם האפשרי.'
    },
    {
      category: 'account',
      question: 'איך משנים פרטים בחשבון?',
      answer: 'היכנסו לחשבון שלכם, לחצו על ההגדרות בפינה השמאלית העליונה ובחרו "עריכת פרופיל". שם תוכלו לעדכן את כל הפרטים האישיים, פרטי התשלום והעדפות ההתראות.'
    },
    {
      category: 'account',
      question: 'איך מוחקים חשבון?',
      answer: 'אם ברצונכם למחוק את החשבון, צרו איתנו קשר דרך support@beed.co.il או הטלפון שלנו. נעבד את הבקשה תוך 48 שעות ונמחק את כל המידע האישי שלכם מהמערכת.'
    },
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors group"
          >
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span>חזור לדף הבית</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
            <HelpCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl lg:text-7xl text-gray-900 mb-6">איך נוכל לעזור?</h1>
          <p className="text-xl text-gray-600 mb-12">
            חפשו במרכז העזרה שלנו או צרו איתנו קשר ישירות
          </p>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              placeholder="חפשו את מה שאתם צריכים..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-14 pl-6 py-5 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <a href="#" className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all group border-2 border-transparent hover:border-blue-500">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Video className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl text-gray-900 mb-2">מדריכי וידאו</h3>
              <p className="text-gray-600 text-sm">למדו איך להשתמש בפלטפורמה</p>
            </a>

            <a href="#" className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all group border-2 border-transparent hover:border-green-500">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl text-gray-900 mb-2">צ'אט חי</h3>
              <p className="text-gray-600 text-sm">דברו איתנו בזמן אמת</p>
            </a>

            <a href="#" className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all group border-2 border-transparent hover:border-purple-500">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Smartphone className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl text-gray-900 mb-2">צור קשר</h3>
              <p className="text-gray-600 text-sm">03-1234567 | support@beed.co.il</p>
            </a>

            <a href="#" className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all group border-2 border-transparent hover:border-orange-500">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Clock className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl text-gray-900 mb-2">זמני פעילות</h3>
              <p className="text-gray-600 text-sm">ראשון-חמישי 9:00-18:00</p>
            </a>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl whitespace-nowrap transition-all ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-xl">{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl text-gray-900 mb-8 text-center">שאלות נפוצות</h2>
          
          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all"
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className="w-full px-8 py-6 flex items-center justify-between text-right"
                >
                  <span className="text-lg text-gray-900 flex-1">{faq.question}</span>
                  {openFAQ === index ? (
                    <ChevronUp className="w-6 h-6 text-blue-600 flex-shrink-0 mr-4" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0 mr-4" />
                  )}
                </button>
                
                {openFAQ === index && (
                  <div className="px-8 pb-6 text-gray-700 leading-relaxed border-t border-gray-100 pt-6">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl text-gray-900 mb-2">לא נמצאו תוצאות</h3>
              <p className="text-gray-600">נסו לחפש במילים אחרות או צרו איתנו קשר ישירות</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white shadow-2xl">
            <h2 className="text-4xl mb-4">עדיין צריכים עזרה?</h2>
            <p className="text-xl mb-8 opacity-90">
              הצוות שלנו זמין לעזור לכם בכל שאלה
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="mailto:support@beed.co.il"
                className="bg-white text-blue-600 px-8 py-4 rounded-full hover:shadow-2xl transition-all inline-flex items-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                <span>שלחו לנו מייל</span>
              </a>
              <a
                href="tel:03-1234567"
                className="bg-white/20 backdrop-blur text-white border-2 border-white px-8 py-4 rounded-full hover:bg-white/30 transition-all inline-flex items-center gap-2"
              >
                <Smartphone className="w-5 h-5" />
                <span>התקשרו אלינו</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
