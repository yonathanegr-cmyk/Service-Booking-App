import { ScrollText, ShieldCheck, Scale } from 'lucide-react';
import { Separator } from '../ui/separator';

export function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto p-6 md:p-12 bg-white min-h-screen" dir="rtl">
      <div className="space-y-6">
        
        <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-gray-900 rounded-xl shadow-lg">
                <Scale className="w-8 h-8 text-white" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-gray-900">תנאי שימוש</h1>
                <p className="text-gray-500">עודכן לאחרונה: 30 בנובמבר 2024</p>
            </div>
        </div>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">
            <p>
                ברוכים הבאים ל-Beedy ("הפלטפורמה"). השימוש בפלטפורמה ובשירותים הנלווים כפוף לתנאים המפורטים להלן.
                עצם השימוש בפלטפורמה מהווה הסכמה לתנאים אלה.
            </p>

            <section>
                <h2 className="text-lg font-bold text-gray-900">1. כללי</h2>
                <p>
                    השירות מיועד לבעלי מקצוע ("הספקים") וללקוחות קצה ("הלקוחות").
                    Beedy משמשת כפלטפורמה טכנולוגית המקשרת בין הצדדים ומספקת כלי ניהול.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900">2. הרשמה ושימוש בחשבון</h2>
                <p>
                    השימוש בשירות מותנה ברישום ומסירת פרטים נכונים ומדויקים.
                    המשתמש אחראי בלעדית לשמירה על סודיות פרטי הגישה שלו.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900">3. תשלומים ועמלות</h2>
                <p>
                    חלק מהשירותים כרוכים בתשלום דמי מנוי או עמלות עסקה.
                    התעריפים מפורסמים באתר ועשויים להשתנות מעת לעת בהודעה מראש.
                </p>
            </section>
            
             <section>
                <h2 className="text-lg font-bold text-gray-900">4. הגבלת אחריות</h2>
                <p>
                    Beedy אינה אחראית לטיב השירות המסופק ע"י בעלי המקצוע או לתשלומים בין הצדדים.
                    האחריות המקצועית חלה במלואה על נותן השירות.
                </p>
            </section>

        </div>
      </div>
    </div>
  );
}