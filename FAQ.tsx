import { HelpCircle, MessageCircle, Search } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

export function FAQ() {
  return (
    <div className="max-w-3xl mx-auto p-6 md:p-12 bg-white min-h-screen" dir="rtl">
      <div className="space-y-8">
        
        <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">מרכז עזרה ושאלות נפוצות</h1>
            <p className="text-gray-500 max-w-lg mx-auto">
                מצא תשובות לשאלות נפוצות או צור קשר עם צוות התמיכה שלנו.
            </p>
            
            <div className="relative max-w-md mx-auto">
                <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                <Input className="pr-10" placeholder="חפש תשובה..." />
            </div>
        </div>

        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">שאלות נפוצות</h2>
            
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger>כיצד ניתן לשנות את הסיסמה שלי?</AccordionTrigger>
                    <AccordionContent>
                        ניתן לשנות את הסיסמה דרך מסך ההגדרות תחת קטגוריית "אבטחה". יש להזין את הסיסמה הישנה ואת החדשה לאימות.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger>האם השימוש באפליקציה כרוך בתשלום?</AccordionTrigger>
                    <AccordionContent>
                        האפליקציה מציעה מסלול חינמי בסיסי ומסלולי פרימיום עם פיצ'רים מתקדמים לניהול העסק. ניתן לראות את המחירון המלא בעמוד התמחור.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger>איך אני מוציא חשבונית מס?</AccordionTrigger>
                    <AccordionContent>
                        במסך "פיננסים", לחץ על כפתור הפלוס ובחר "חשבונית חדשה". המערכת תפיק חשבונית חתומה דיגיטלית שניתן לשלוח ללקוח במייל או בוואטסאפ.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                    <AccordionTrigger>האם המידע שלי מאובטח?</AccordionTrigger>
                    <AccordionContent>
                        כן, אנו משתמשים בתקני האבטחה המחמירים ביותר ושומרים את המידע בשרתים מאובטחים ומגובים באופן יומי.
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>

        <div className="bg-blue-50 rounded-2xl p-6 text-center space-y-4 mt-12">
            <HelpCircle className="w-10 h-10 text-blue-600 mx-auto" />
            <div>
                <h3 className="font-bold text-gray-900 text-lg">עדיין צריכים עזרה?</h3>
                <p className="text-gray-600">צוות התמיכה שלנו זמין בימים א'-ה' בין השעות 09:00-18:00</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                <MessageCircle className="w-4 h-4" />
                פתח פנייה לתמיכה
            </Button>
        </div>

      </div>
    </div>
  );
}