import { ArrowRight, Eye, Ear, MousePointer, Keyboard, Smartphone, Monitor, CheckCircle } from 'lucide-react';

type AccessibilityProps = {
  onBack: () => void;
};

export function Accessibility({ onBack }: AccessibilityProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors group"
          >
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span>חזור לדף הבית</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-2xl mb-6">
            <Eye className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-5xl lg:text-6xl text-gray-900 mb-4">הצהרת נגישות</h1>
          <p className="text-xl text-gray-600">
            Beedy מחויבת להנגיש את השירותים שלה לכל אדם
          </p>
        </div>

        {/* Commitment Statement */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-3xl p-8 lg:p-12 mb-12">
          <h2 className="text-3xl text-gray-900 mb-6">המחויבות שלנו</h2>
          <p className="text-xl text-gray-700 leading-relaxed mb-6">
            ב-Beedy אנו מאמינים שכל אדם זכאי לגישה מלאה ושווה לשירותים שלנו. אנו פועלים ללא הרף 
            כדי להבטיח שהפלטפורמה שלנו תהיה נגישה ושימושית לכולם, כולל אנשים עם מוגבלויות.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            אתר זה עומד בדרישות תקן ישראלי 5568 ברמת AA ובהתאם להנחיות 
            WCAG 2.1 (Web Content Accessibility Guidelines).
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 space-y-12">
          {/* Features */}
          <section>
            <h2 className="text-3xl text-gray-900 mb-8">תכונות נגישות באתר</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl text-gray-900 mb-3">נגישות חזותית</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>ניגודיות צבעים גבוהה</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>אפשרות להגדלת טקסט</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>תמיכה בקוראי מסך</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>טקסט חלופי לתמונות</span>
                  </li>
                </ul>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <Keyboard className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl text-gray-900 mb-3">ניווט במקלדת</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>ניווט מלא במקלדת בלבד</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>סדר פוקוס לוגי וברור</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>קיצורי מקלדת נוחים</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>אינדיקציית פוקוס ברורה</span>
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4">
                  <Monitor className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl text-gray-900 mb-3">עיצוב רספונסיבי</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>התאמה לכל גודל מסך</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>תמיכה בטלפונים וטאבלטים</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>מבנה אחיד בכל העמודים</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>גלילה חלקה ונוחה</span>
                  </li>
                </ul>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mb-4">
                  <Ear className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl text-gray-900 mb-3">נגישות שמיעתית</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>כתוביות לסרטונים</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>תמליל לתוכן אודיו</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>התראות חזותיות</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>חלופות טקסטואליות</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Standards Compliance */}
          <section>
            <h2 className="text-3xl text-gray-900 mb-6">תקנים ותאימות</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                האתר שלנו עומד בתקנים הבאים:
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">✓</span>
                  <div>
                    <h3 className="text-lg text-gray-900 mb-2">תקן ישראלי 5568</h3>
                    <p className="text-gray-700">
                      האתר עומד בדרישות תקן הנגישות הישראלי ברמת AA
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-3xl">✓</span>
                  <div>
                    <h3 className="text-lg text-gray-900 mb-2">WCAG 2.1 Level AA</h3>
                    <p className="text-gray-700">
                      עמידה בהנחיות הנגישות הבינלאומיות לתוכן אינטרנט
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-3xl">✓</span>
                  <div>
                    <h3 className="text-lg text-gray-900 mb-2">ARIA</h3>
                    <p className="text-gray-700">
                      שימוש בתגיות ARIA לשיפור הנגישות עבור קוראי מסך
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Assistive Technologies */}
          <section>
            <h2 className="text-3xl text-gray-900 mb-6">טכנולוגיות מסייעות נתמכות</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="text-4xl mb-3">🔊</div>
                <h3 className="text-lg text-gray-900 mb-2">קוראי מסך</h3>
                <p className="text-sm text-gray-600">NVDA, JAWS, VoiceOver</p>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-lg text-gray-900 mb-2">זום</h3>
                <p className="text-sm text-gray-600">תמיכה בהגדלה עד 200%</p>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="text-4xl mb-3">⌨️</div>
                <h3 className="text-lg text-gray-900 mb-2">מקלדת</h3>
                <p className="text-sm text-gray-600">ניווט מלא ללא עכבר</p>
              </div>
            </div>
          </section>

          {/* Known Limitations */}
          <section>
            <h2 className="text-3xl text-gray-900 mb-6">מגבלות ידועות</h2>
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                אנו עובדים ללא הרף כדי לשפר את הנגישות של הפלטפורמה. המגבלות הידועות כרגע:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600">•</span>
                  <span>חלק מהסרטונים עדיין לא כוללים כתוביות - אנו עובדים על זה</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600">•</span>
                  <span>מפות אינטראקטיביות עשויות להיות מאתגרות לחלק מהמשתמשים</span>
                </li>
              </ul>
              <p className="text-gray-700 mt-4">
                אנו מחויבים לפתור את המגבלות הללו במהירות האפשרית.
              </p>
            </div>
          </section>

          {/* Feedback Section */}
          <section>
            <h2 className="text-3xl text-gray-900 mb-6">משוב ותמיכה</h2>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-8">
              <p className="text-xl text-gray-700 leading-relaxed mb-6">
                נתקלתם בבעיית נגישות? יש לכם הצעות לשיפור? אנו רוצים לשמוע מכם!
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📧</span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">דוא"ל</div>
                    <div className="text-lg text-gray-900">accessibility@beed.co.il</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📞</span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">טלפון</div>
                    <div className="text-lg text-gray-900">03-1234567</div>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mt-6 text-sm">
                נעשה כל מאמץ להגיב לפניות תוך 48 שעות ולפתור בעיות תוך 7 ימי עבודה.
              </p>
            </div>
          </section>

          {/* Last Updated */}
          <section>
            <div className="text-center pt-8 border-t border-gray-200">
              <p className="text-gray-600">
                הצהרה זו עודכנה לאחרונה ב-27 בנובמבר 2025
              </p>
            </div>
          </section>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-full hover:shadow-2xl hover:shadow-green-500/50 transition-all"
          >
            <ArrowRight className="w-5 h-5" />
            <span>חזור לדף הבית</span>
          </button>
        </div>
      </div>
    </div>
  );
}
