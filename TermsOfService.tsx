import { ArrowRight, Shield, FileText, AlertCircle, CheckCircle } from 'lucide-react';

type TermsOfServiceProps = {
  onBack: () => void;
};

export function TermsOfService({ onBack }: TermsOfServiceProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors group"
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-2xl mb-6">
            <FileText className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-5xl lg:text-6xl text-gray-900 mb-4">תנאי שימוש</h1>
          <p className="text-xl text-gray-600">
            עדכון אחרון: 27 נובמבר 2025
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 space-y-12">
          {/* Section 1 */}
          <section>
            <h2 className="text-3xl text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-blue-600">1</span>
              </div>
              כללי
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                ברוכים הבאים ל-Beedy! תנאי שימוש אלה ("התנאים") מסדירים את השימוש שלך בפלטפורמה שלנו, 
                אפליקציות המובייל והשירותים המוצעים באמצעותם (יחד, "השירות").
              </p>
              <p>
                על ידי גישה לשירות או שימוש בו, אתה מסכים להיות מחויב בתנאים אלה. אם אינך מסכים לתנאים אלה, 
                אנא אל תשתמש בשירות שלנו.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg text-gray-900 mb-2">חשוב לדעת</h3>
                  <p className="text-gray-700">
                    השימוש בפלטפורמה שלנו מהווה הסכמה מלאה לכל התנאים המפורטים במסמך זה. 
                    אנו ממליצים לקרוא בעיון את כל הסעיפים.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-3xl text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-purple-600">2</span>
              </div>
              הגדרות
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <strong>"פלטפורמה"</strong> - אתר האינטרנט, אפליקציית המובייל וכל שירות נלווה של Beedy
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <strong>"משתמש"</strong> - כל אדם או גוף המשתמש בפלטפורמה
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <strong>"מקצוען"</strong> - ספק שירות רשום בפלטפורמה המציע שירותים ביתיים
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <strong>"לקוח"</strong> - משתמש המזמין שירותים מהמקצוענים
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-3xl text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-green-600">3</span>
              </div>
              השימוש בפלטפורמה
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <h3 className="text-xl text-gray-900 mt-6 mb-3">3.1 זכאות</h3>
              <p>
                כדי להשתמש בפלטפורמה, עליך להיות בגיל 18 לפחות או לפעול בהסכמת אפוטרופוס חוקי. 
                השימוש בפלטפורמה אסור לכל אדם או ישות שנאסר עליהם להשתמש בשירות.
              </p>

              <h3 className="text-xl text-gray-900 mt-6 mb-3">3.2 חשבון משתמש</h3>
              <p>
                לשימוש מלא בפלטפורמה, עליך ליצור חשבון משתמש. אתה מתחייב לספק מידע מדויק, שלם ומעודכן. 
                אתה אחראי לשמירה על סודיות פרטי החשבון שלך ולכל הפעילויות המתרחשות תחת החשבון שלך.
              </p>

              <h3 className="text-xl text-gray-900 mt-6 mb-3">3.3 שימוש אסור</h3>
              <p>אתה מסכים שלא:</p>
              <ul className="space-y-2 mr-6">
                <li>• להשתמש בפלטפורמה למטרות בלתי חוקיות או לא מורשות</li>
                <li>• לפרסם או להעביר תוכן פוגעני, מעליב או בלתי הולם</li>
                <li>• להפר זכויות של אחרים או להתחזות לאדם או גוף אחר</li>
                <li>• להפריע לתפעול התקין של הפלטפורמה או לנסות לחדור למערכות</li>
                <li>• לאסוף מידע על משתמשים אחרים ללא הסכמתם</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-3xl text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <span className="text-orange-600">4</span>
              </div>
              שירותים והזמנות
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <h3 className="text-xl text-gray-900 mt-6 mb-3">4.1 תיאור השירות</h3>
              <p>
                Beedy מספקת פלטפורמה המחברת בין לקוחות למקצוענים המציעים שירותים ביתיים. 
                אנו משתמשים בבינה מלאכותית (Beedy AI Bidding Engine) לניתוח בעיות ויצירת הצעות מחיר מדויקות.
              </p>

              <h3 className="text-xl text-gray-900 mt-6 mb-3">4.2 הזמנת שירותים</h3>
              <p>
                כאשר אתה מזמין שירות דרך הפלטפורמה, אתה יוצר חוזה ישירות עם המקצוען. Beedy משמשת כמתווך 
                ואינה צד לחוזה זה. עם זאת, אנו מספקים אחריות ותמיכה לכל השירותים.
              </p>

              <h3 className="text-xl text-gray-900 mt-6 mb-3">4.3 תשלום</h3>
              <p>
                התשלום מתבצע דרך הפלטפורמה. המחירים המוצגים הם סופיים וכוללים את כל העלויות. 
                אנו שומרים את הזכות לשנות את המחירים בכל עת, אך שינויים אלה לא יחולו על הזמנות שכבר בוצעו.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-3xl text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <span className="text-red-600">5</span>
              </div>
              ביטולים והחזרים
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <h3 className="text-xl text-gray-900 mt-6 mb-3">5.1 ביטול הזמנה</h3>
              <p>
                תוכל לבטל הזמנה עד 24 שעות לפני מועד השירות המתוכנן ללא עלות. 
                ביטולים בתוך 24 שעות עשויים להיות כפופים לדמי ביטול של עד 50% מעלות השירות.
              </p>

              <h3 className="text-xl text-gray-900 mt-6 mb-3">5.2 החזרים</h3>
              <p>
                במקרה של אי שביעות רצון מהשירות, תוכל לפנות לתמיכה תוך 14 יום מביצוע השירות. 
                נבדוק את הבקשה ונחליט אם להחזיר כספים, לספק תיקון חינם או לפצות בדרך אחרת.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-3xl text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-indigo-600" />
              </div>
              אחריות והגבלת אחריות
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Beedy מספקת את הפלטפורמה "כמות שהיא" ו"כפי שזמינה". אנו עושים כל שביכולתנו כדי להבטיח 
                איכות ואמינות, אך אינם מתחייבים שהשירות יהיה נטול טעויות או יפעל ללא הפרעות.
              </p>
              <p>
                Beedy לא תהיה אחראית לנזקים עקיפים, מקריים, מיוחדים או תוצאתיים הנובעים מהשימוש 
                בפלטפורמה או אי היכולת להשתמש בה.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="text-lg text-gray-900 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  האחריות שלנו לך
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li>✓ אחריות 14 יום על כל שירות</li>
                  <li>✓ אפשרות להרחבת אחריות ל-30 יום</li>
                  <li>✓ תמיכה 24/7 לכל בעיה</li>
                  <li>✓ מקצוענים מאומתים ומבוטחים</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-3xl text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                <span className="text-teal-600">7</span>
              </div>
              שינויים בתנאים
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                אנו שומרים את הזכות לעדכן ולשנות תנאים אלה בכל עת. שינויים יכנסו לתוקף מיד עם פרסומם 
                באתר. המשך השימוש בפלטפורמה לאחר פרסום השינויים מהווה הסכמה לתנאים המעודכנים.
              </p>
              <p>
                שינויים מהותיים יובאו לידיעתך באמצעות הודעה באתר או בדוא"ל.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-3xl text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                <span className="text-pink-600">8</span>
              </div>
              יצירת קשר
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                לשאלות או הבהרות בנוגע לתנאי שימוש אלה, ניתן ליצור איתנו קשר:
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-gray-900">📧</span>
                  <span className="text-gray-700">support@beed.co.il</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-900">📞</span>
                  <span className="text-gray-700">03-1234567</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-900">📍</span>
                  <span className="text-gray-700">רחוב רוטשילד 1, תל אביב</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full hover:shadow-2xl hover:shadow-blue-500/50 transition-all"
          >
            <ArrowRight className="w-5 h-5" />
            <span>חזור לדף הבית</span>
          </button>
        </div>
      </div>
    </div>
  );
}
