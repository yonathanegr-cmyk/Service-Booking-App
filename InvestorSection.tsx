import { TrendingUp, PieChart, ShieldCheck, Brain, ArrowRight, Users, Globe } from 'lucide-react';

export function InvestorSection() {
  return (
    <section className="py-24 bg-[#0f172a] text-white overflow-hidden relative" dir="rtl">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-full bg-purple-600/10 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full mb-6 border border-blue-500/20">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-bold">הזדמנות השקעה</span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              להשקיע ב-
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"> עתיד השירותים הביתיים</span>
            </h2>
            
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Beedy משנה את כללי המשחק בשוק של 500 מיליארד דולר באמצעות בינה מלאכותית. אנחנו הופכים שוק מפוצל ולא יעיל לחוויה דיגיטלית חלקה, בטוחה ורווחית. הצטרפו אלינו למסע.
            </p>

            <div className="space-y-6 mb-10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                  <Brain className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-1">טכנולוגיה פורצת דרך</h4>
                  <p className="text-gray-400 text-sm">מנוע AI בלעדי לניתוח וידאו ותמחור אוטומטי, המייצר יתרון תחרותי מובהק.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-purple-500/20">
                  <PieChart className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-1">מודל עסקי סקיילבילי</h4>
                  <p className="text-gray-400 text-sm">שילוב של עמלות Marketplace ומנויי SaaS למקצוענים מבטיח תזרים מזומנים יציב וצומח.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-green-500/20">
                  <Users className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-1">צמיחה אקספוננציאלית</h4>
                  <p className="text-gray-400 text-sm">צמיחה של 300% שנה-מול-שנה במספר המשתמשים והעסקאות בפלטפורמה.</p>
                </div>
              </div>
            </div>

            <button className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all inline-flex items-center gap-2 group">
              קבלו את ה-Pitch Deck
              <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform rotate-180" />
            </button>
          </div>

          {/* Visual Content */}
          <div className="relative">
            {/* Main Card */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="text-gray-400 text-sm mb-1">שווי שוק מוערך (TAM)</div>
                  <div className="text-3xl font-bold text-white">$500B+</div>
                </div>
                <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +12.5% YoY
                </div>
              </div>

              {/* Mock Chart */}
              <div className="h-48 w-full bg-gradient-to-b from-blue-500/10 to-transparent rounded-xl border border-blue-500/10 relative overflow-hidden flex items-end px-4 gap-2 mb-6">
                 {/* Bars */}
                 <div className="w-1/6 bg-blue-500/20 h-[30%] rounded-t-md hover:bg-blue-500/40 transition-all"></div>
                 <div className="w-1/6 bg-blue-500/30 h-[45%] rounded-t-md hover:bg-blue-500/50 transition-all"></div>
                 <div className="w-1/6 bg-blue-500/40 h-[60%] rounded-t-md hover:bg-blue-500/60 transition-all"></div>
                 <div className="w-1/6 bg-blue-500/50 h-[70%] rounded-t-md hover:bg-blue-500/70 transition-all"></div>
                 <div className="w-1/6 bg-blue-500/60 h-[85%] rounded-t-md hover:bg-blue-500/80 transition-all"></div>
                 <div className="w-1/6 bg-blue-500 h-[100%] rounded-t-md shadow-[0_0_20px_rgba(59,130,246,0.5)] relative">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-blue-600 text-xs font-bold px-2 py-1 rounded shadow-sm">
                      2025
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/30 rounded-xl p-4">
                  <div className="text-gray-400 text-xs mb-1">משתמשים פעילים</div>
                  <div className="text-xl font-bold text-white">450K</div>
                </div>
                <div className="bg-gray-700/30 rounded-xl p-4">
                  <div className="text-gray-400 text-xs mb-1">עסקאות בחודש</div>
                  <div className="text-xl font-bold text-white">₪12M</div>
                </div>
              </div>
            </div>

            {/* Floating Card 1 */}
            <div className="absolute -top-6 -right-6 bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-xl animate-bounce [animation-duration:4s]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-bold text-sm">התרחבות גלובלית</div>
                  <div className="text-gray-400 text-xs">יעדים: EU, USA</div>
                </div>
              </div>
            </div>

            {/* Floating Card 2 */}
            <div className="absolute -bottom-6 -left-6 bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-xl animate-bounce [animation-duration:5s] [animation-delay:1s]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-bold text-sm">מובילי שוק</div>
                  <div className="text-gray-400 text-xs">בבטיחות ואמינות</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
