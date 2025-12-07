import { ArrowRight, Target, Heart, Zap, Users, TrendingUp, Award, Globe, Sparkles, Shield } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

type AboutUsProps = {
  onBack: () => void;
};

export function AboutUs({ onBack }: AboutUsProps) {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
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
      <section className="relative py-20 lg:py-32 px-6 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptMCAyYy0yLjIxIDAtNCAxLjc5LTQgNHMxLjc5IDQgNCA0IDQtMS43OSA0LTQtMS43OS00LTQtNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full mb-6 border border-white/30">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">משנים את תעשיית השירותים הביתיים</span>
            </div>
            <h1 className="text-5xl lg:text-7xl mb-6">אודות Beedy</h1>
            <p className="text-2xl lg:text-3xl opacity-90 max-w-4xl mx-auto leading-relaxed">
              אנחנו בונים את הפלטפורמה הראשונה מסוגה המשלבת בינה מלאכותית מתקדמת עם שירותים ביתיים, 
              כדי ליצור חוויה שקופה, מהירה ואמינה.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 lg:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Mission */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-12 border-2 border-blue-200">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl text-gray-900 mb-6">המשימה שלנו</h2>
              <p className="text-xl text-gray-700 leading-relaxed">
                להפוך כל שירות ביתי לפשוט, שקוף ואמין באמצעות טכנולוגיה מתקדמת. 
                אנו מאמינים שכל אדם ראוי לגישה קלה למקצוענים איכותיים במחיר הוגן.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-12 border-2 border-purple-200">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl text-gray-900 mb-6">החזון שלנו</h2>
              <p className="text-xl text-gray-700 leading-relaxed">
                להיות הפלטפורמה המובילה בעולם לשירותים ביתיים, שבה בינה מלאכותית והטכנולוגיה 
                משרתות את האנשים ומקלות על חיי היומיום.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 lg:py-32 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6">
                <Heart className="w-4 h-4" />
                <span className="text-sm">הסיפור שלנו</span>
              </div>
              <h2 className="text-4xl lg:text-5xl text-gray-900 mb-6">
                הכל התחיל מחוויה אישית
              </h2>
              <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                <p>
                  ב-2022, המייסדים שלנו חיו את הסיפור המוכר לכולנו - ברז נוזל באמצע הלילה, 
                  אי אפשר למצוא אינסטלטור אמין, והמחיר? רק לאחר שהמקצוען יגיע.
                </p>
                <p>
                  מתוך התסכול הזה נולדה הרעיון של Beedy - פלטפורמה שמשלבת בינה מלאכותית מתקדמת 
                  עם רשת של מקצוענים מאומתים, כדי לתת לך מחיר מדויק מראש, ללא הפתעות.
                </p>
                <p>
                  היום, אחרי מאות אלפי שירותים שבוצעו בהצלחה, אנחנו ממשיכים לחדש ולשפר, 
                  כי אנחנו מאמינים שכולם ראויים לשירות טוב יותר.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1634326080825-985cfc816db6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwbWVldGluZyUyMG9mZmljZXxlbnwxfHx8fDE3NjQyNTUwMjd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="צוות Beedy"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 lg:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl text-gray-900 mb-6">הערכים שלנו</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              הערכים שמנחים אותנו בכל החלטה ופעולה
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-2xl text-gray-900 mb-3">שקיפות</h3>
              <p className="text-gray-600 leading-relaxed">
                מחיר ברור מראש, ללא הפתעות או עלויות נסתרות
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-green-500">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Award className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-2xl text-gray-900 mb-3">איכות</h3>
              <p className="text-gray-600 leading-relaxed">
                רק מקצוענים מאומתים ומוסמכים עם דירוג גבוה
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-500">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-2xl text-gray-900 mb-3">חדשנות</h3>
              <p className="text-gray-600 leading-relaxed">
                שימוש בטכנולוגיה מתקדמת לחוויה משופרת
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-orange-500">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                <Heart className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-2xl text-gray-900 mb-3">אכפתיות</h3>
              <p className="text-gray-600 leading-relaxed">
                תמיכה אמיתית וזמינה בכל שלב של הדרך
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 lg:py-32 px-6 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl mb-6">Beedy במספרים</h2>
            <p className="text-xl opacity-90">
              הישגים שאנחנו גאים בהם
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
              <div className="text-6xl lg:text-7xl mb-3">+250K</div>
              <p className="text-xl opacity-90">שירותים בוצעו</p>
            </div>

            <div className="text-center bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
              <div className="text-6xl lg:text-7xl mb-3">+12K</div>
              <p className="text-xl opacity-90">מקצוענים פעילים</p>
            </div>

            <div className="text-center bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
              <div className="text-6xl lg:text-7xl mb-3">4.9</div>
              <p className="text-xl opacity-90">דירוג ממוצע</p>
            </div>

            <div className="text-center bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
              <div className="text-6xl lg:text-7xl mb-3">98%</div>
              <p className="text-xl opacity-90">שביעות רצון</p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="py-20 lg:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">הטכנולוגיה שלנו</span>
            </div>
            <h2 className="text-4xl lg:text-5xl text-gray-900 mb-6">
              Beedy AI Bidding Engine
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              מנוע הבינה המלאכותית המתקדם שלנו משנה את כללי המשחק
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border-2 border-blue-200">
              <div className="text-5xl mb-4">👁️</div>
              <h3 className="text-2xl text-gray-900 mb-3">ניתוח חכם</h3>
              <p className="text-gray-700 leading-relaxed">
                המערכת מזהה את הבעיה מתוך תמונות וסרטונים, מנתחת את רמת המורכבות ומעריכה את החומרים הנדרשים
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 border-2 border-purple-200">
              <div className="text-5xl mb-4">💡</div>
              <h3 className="text-2xl text-gray-900 mb-3">מחיר מיידי</h3>
              <p className="text-gray-700 leading-relaxed">
                בתוך דקות אתם מקבלים הצעות מחיר מדויקות ממקצוענים שבדקו את הניתוח שלנו
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border-2 border-green-200">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-2xl text-gray-900 mb-3">התאמה מושלמת</h3>
              <p className="text-gray-700 leading-relaxed">
                האלגוריתם שלנו מתאים אתכם למקצוען הכי מתאים לפי מיקום, זמינות ומומחיות
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-32 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl text-gray-900 mb-6">
            רוצים להצטרף למהפכה?
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            בין אם אתם לקוחות או מקצוענים - יש לנו מקום בשבילכם
          </p>
          <div className="flex flex-wrap gap-6 justify-center">
            <button
              onClick={onBack}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-full hover:shadow-2xl hover:shadow-blue-500/50 transition-all inline-flex items-center gap-3 text-xl"
            >
              <span>התחילו עכשיו</span>
              <ArrowRight className="w-6 h-6 rotate-180" />
            </button>
            <button
              className="bg-white text-blue-600 border-2 border-blue-600 px-10 py-5 rounded-full hover:bg-blue-50 transition-all inline-flex items-center gap-3 text-xl"
            >
              <span>הצטרפו כמקצוענים</span>
              <Users className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
