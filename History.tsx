import { ArrowRight, Calendar, Clock, MapPin, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

type HistoryProps = {
  onBack: () => void;
};

export function History({ onBack }: HistoryProps) {
  const jobs = [
    {
      id: '1',
      service: 'אינסטלציה',
      provider: 'יוסי כהן',
      date: '12 אוק׳ 2023',
      status: 'completed',
      price: 350,
      image: 'https://images.unsplash.com/photo-1581578017093-cd30fba4e9d5?w=150&h=150&fit=crop'
    },
    {
      id: '2',
      service: 'ניקיון',
      provider: 'שרה לוי',
      date: '05 אוק׳ 2023',
      status: 'cancelled',
      price: 50,
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop'
    },
    {
      id: '3',
      service: 'חשמלאי',
      provider: 'דוד מזרחי',
      date: '28 ספט׳ 2023',
      status: 'completed',
      price: 420,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowRight className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">היסטוריית הזמנות</h1>
      </div>

      <div className="p-4 space-y-4">
        {jobs.map((job, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={job.id}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3">
                    <img src={job.image} className="w-12 h-12 rounded-xl object-cover bg-gray-100" alt={job.provider} />
                    <div>
                        <h3 className="font-bold text-gray-900">{job.service}</h3>
                        <p className="text-sm text-gray-500">{job.provider}</p>
                    </div>
                </div>
                <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                    job.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                }`}>
                    {job.status === 'completed' ? 'הושלם' : 'בוטל'}
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                <div className="flex items-center gap-1.5 bg-gray-50 p-2 rounded-lg">
                    <Calendar className="w-3.5 h-3.5" />
                    {job.date}
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 p-2 rounded-lg">
                    <MapPin className="w-3.5 h-3.5" />
                    תל אביב
                </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <span className="font-bold text-lg">₪{job.price}</span>
                <button className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                    <RotateCcw className="w-3.5 h-3.5" />
                    הזמן שוב
                </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}