import { Lock, Eye, FileCheck } from 'lucide-react';
import { Separator } from '../ui/separator';

export function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto p-6 md:p-12 bg-white min-h-screen" dir="rtl">
      <div className="space-y-6">
        
        <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-green-600 rounded-xl shadow-lg shadow-green-200">
                <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-gray-900">מדיניות פרטיות</h1>
                <p className="text-gray-500">עודכן לאחרונה: 30 בנובמבר 2024</p>
            </div>
        </div>

        <div className="prose prose-green max-w-none space-y-8 text-gray-700 leading-relaxed">
            <p className="text-lg font-medium bg-green-50 p-4 rounded-xl border border-green-100">
                הפרטיות שלך חשובה לנו. מסמך זה מסביר איזה מידע אנו אוספים וכיצד אנו משתמשים בו כדי לשפר את השירות עבורך.
            </p>

            <section>
                <h2 className="text-lg font-bold text-gray-900">1. המידע שאנו אוספים</h2>
                <ul className="list-disc list-inside space-y-2">
                    <li><strong>מידע אישי:</strong> שם, כתובת אימייל, מספר טלפון, ופרטי עסק.</li>
                    <li><strong>מידע פיננסי:</strong> היסטוריית עסקאות ופרטי תשלום (הנשמרים ע"י ספק סליקה מאובטח).</li>
                    <li><strong>מידע טכני:</strong> כתובת IP, סוג מכשיר, ונתוני שימוש באתר.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900">2. שימוש במידע</h2>
                <p>
                    אנו משתמשים במידע כדי:
                </p>
                <ul className="list-disc list-inside space-y-1">
                    <li>לספק ולתפעל את השירותים.</li>
                    <li>לשפר את חווית המשתמש והתאמה אישית.</li>
                    <li>לשלוח עדכונים תפעוליים ושיווקיים (בכפוף להסכמתך).</li>
                    <li>למנוע הונאות ולשמור על אבטחת המערכת.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900">3. שיתוף מידע עם צדדים שלישיים</h2>
                <p>
                    איננו מוכרים את המידע האישי שלך. אנו עשויים לשתף מידע עם ספקים נותני שירות (כגון שירותי ענן וסליקה) אך ורק לצורך מתן השירות.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-gray-900">4. אבטחת מידע</h2>
                <p>
                    אנו משקיעים משאבים רבים באבטחת המידע ומשתמשים בטכנולוגיות הצפנה מתקדמות (SSL/TLS) להגנה על הנתונים שלך.
                </p>
            </section>
        </div>
      </div>
    </div>
  );
}