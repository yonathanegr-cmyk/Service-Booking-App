import { Accessibility, Mail, Phone, MapPin } from 'lucide-react';
import { Separator } from '../ui/separator';

export function AccessibilityStatement() {
  return (
    <div className="max-w-3xl mx-auto p-6 md:p-12 bg-white min-h-screen" dir="rtl">
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                <Accessibility className="w-8 h-8 text-white" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-gray-900">הצהרת נגישות</h1>
                <p className="text-gray-500">עודכן לאחרונה: 30 בנובמבר 2024</p>
            </div>
        </div>

        <div className="prose prose-blue max-w-none space-y-8 text-gray-700 leading-relaxed">
            
            <section>
                <p className="text-lg font-medium">
                    אנו ב-Beedy רואים חשיבות עליונה במתן שירות שוויוני לכלל הלקוחות והגולשים ובשיפור השירות הניתן ללקוחות עם מוגבלות.
                    אנו משקיעים משאבים רבים בהנגשת האתר והאפליקציה על מנת לאפשר לכל האוכלוסייה לגלוש בשירותינו בקלות ובנוחות.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                    רמת הנגישות
                </h2>
                <p>
                    האתר והאפליקציה מותאמים לדרישות תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג 2013.
                    ההתאמות בוצעו עפ"י המלצות התקן הישראלי (ת"י 5568) לנגישות תכנים באינטרנט ברמת AA ומסמך WCAG2.0 הבינלאומי.
                </p>
                <ul className="list-disc list-inside mt-4 space-y-2 bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <li>האתר מספק מבנה סמנטי עבור טכנולוגיות מסייעות ותמיכה בדפוס השימוש המקובל להפעלה עם מקלדת.</li>
                    <li>מותאם לתצוגה בדפדפנים הנפוצים ולשימוש בטלפון הסלולרי.</li>
                    <li>לשם קבלת חווית גלישה מיטבית עם תוכנת הקראת מסך, אנו ממליצים להשתמש בתוכנת NVDA העדכנית ביותר.</li>
                </ul>
            </section>

            <Separator />

            <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                    הסדרי נגישות פיזיים
                </h2>
                <p>
                    חברתנו פועלת כחברה דיגיטלית ואין קבלת קהל במשרדי החברה.
                    ניתן ליצור עמנו קשר דרך הערוצים הדיגיטליים או המוקד הטלפוני.
                </p>
            </section>

            <Separator />

            <section className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">פרטי רכז הנגישות</h2>
                <p className="mb-4">
                    אם נתקלת בבעיה או שיש לך הצעות לשיפור, נשמח לשמוע ממך.
                </p>
                
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-blue-100">
                        <div className="bg-blue-100 p-2 rounded-full">
                            <Mail className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <span className="block text-xs text-gray-500">אימייל</span>
                            <a href="mailto:accessibility@beed.ai" className="font-bold text-gray-900 hover:text-blue-600 transition-colors">accessibility@beed.ai</a>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-blue-100">
                        <div className="bg-blue-100 p-2 rounded-full">
                            <Phone className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <span className="block text-xs text-gray-500">טלפון</span>
                            <a href="tel:03-555-1234" className="font-bold text-gray-900 hover:text-blue-600 transition-colors">03-555-1234</a>
                        </div>
                    </div>
                </div>
            </section>

        </div>
      </div>
    </div>
  );
}