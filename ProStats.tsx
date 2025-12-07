import { TrendingUp, DollarSign, Star, Users, Calendar, CheckCircle } from 'lucide-react';

export function ProStats() {
  const stats = [
    { label: 'הכנסות החודש', value: '₪18,200', change: '+12%', icon: DollarSign, color: 'bg-green-500' },
    { label: 'עבודות שהושלמו', value: '38', change: '+8%', icon: CheckCircle, color: 'bg-blue-500' },
    { label: 'דירוג ממוצע', value: '4.9', change: '+0.2', icon: Star, color: 'bg-yellow-500' },
    { label: 'לקוחות חדשים', value: '12', change: '+15%', icon: Users, color: 'bg-purple-500' },
  ];

  const recentJobs = [
    { client: 'דני כהן', service: 'אינסטלציה', date: '27 נוב', revenue: '₪450', rating: 5 },
    { client: 'רונית שחר', service: 'חשמל', date: '26 נוב', revenue: '₪350', rating: 5 },
    { client: 'יוסי לוי', service: 'אינסטלציה', date: '25 נוב', revenue: '₪550', rating: 4 },
    { client: 'מיכל אברהם', service: 'אינסטלציה', date: '24 נוב', revenue: '₪280', rating: 5 },
    { client: 'אבי גולן', service: 'חשמל', date: '23 נוב', revenue: '₪420', rating: 5 },
  ];

  const monthlyData = [
    { month: 'ינו', revenue: 12500 },
    { month: 'פבר', revenue: 14200 },
    { month: 'מרץ', revenue: 11800 },
    { month: 'אפר', revenue: 15600 },
    { month: 'מאי', revenue: 13400 },
    { month: 'יונ', revenue: 16800 },
    { month: 'יול', revenue: 14500 },
    { month: 'אוג', revenue: 12900 },
    { month: 'ספט', revenue: 17200 },
    { month: 'אוק', revenue: 15800 },
    { month: 'נוב', revenue: 18200 },
  ];

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));

  return (
    <div dir="rtl" className="pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">סטטיסטיקות והכנסות</h2>
        <p className="text-gray-600">סקירה כללית של הפעילות שלך</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-green-600 text-sm font-bold bg-green-50 px-2 py-1 rounded-full">{stat.change}</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-gray-500 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                הכנסות חודשיות
              </h3>
              <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100">
                <option>2025</option>
                <option>2024</option>
              </select>
            </div>
            
            <div className="space-y-4">
              {monthlyData.map((data) => {
                const percentage = (data.revenue / maxRevenue) * 100;
                
                return (
                  <div key={data.month}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600 text-sm font-medium w-12">{data.month}</span>
                      <span className="text-gray-900 font-bold">₪{data.revenue.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-l from-blue-600 to-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-gray-500 text-xs mb-1">סה"כ שנתי</p>
                <p className="text-xl font-bold text-gray-900">₪162,900</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-xs mb-1">ממוצע חודשי</p>
                <p className="text-xl font-bold text-gray-900">₪14,809</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-xs mb-1">החודש הטוב ביותר</p>
                <p className="text-xl font-bold text-green-600">נוב</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              עבודות אחרונות
            </h3>
            
            <div className="space-y-4">
              {recentJobs.map((job, idx) => (
                <div key={idx} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <div className="font-medium text-gray-900">{job.client}</div>
                      <div className="text-gray-500 text-sm">{job.service}</div>
                    </div>
                    <div className="text-left">
                      <div className="text-green-600 font-bold">{job.revenue}</div>
                      <div className="flex items-center gap-1 text-sm justify-end">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-gray-600">{job.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-400 text-xs">{job.date}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl shadow-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="relative z-10">
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                ביצועים
              </h4>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="text-gray-300">אחוז קבלת עבודות</span>
                    <span className="font-bold">94%</span>
                  </div>
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-green-400 rounded-full" style={{ width: '94%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="text-gray-300">אחוז השלמת עבודות</span>
                    <span className="font-bold">98%</span>
                  </div>
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full" style={{ width: '98%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="text-gray-300">זמן תגובה ממוצע</span>
                    <span className="font-bold">12 דק'</span>
                  </div>
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="text-gray-300">שביעות רצון לקוחות</span>
                    <span className="font-bold">4.9/5</span>
                  </div>
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: '98%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
