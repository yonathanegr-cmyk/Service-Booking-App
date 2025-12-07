import { User, Settings, Shield, Users, ShoppingBag, HelpCircle, Award, Briefcase } from 'lucide-react';

type ProBusinessMenuProps = {
  onNavigate: (view: string) => void;
};

export function ProBusinessMenu({ onNavigate }: ProBusinessMenuProps) {
  const menuItems = [
    { id: 'profile', label: 'פרופיל ומוניטין', icon: User, description: 'ניהול תיק עבודות, דירוג וביקורות' },
    { id: 'crm', label: 'ניהול לקוחות (CRM)', icon: Users, description: 'מאגר לקוחות, היסטוריה והערות' },
    { id: 'insurance', label: 'ביטוח וביטחון', icon: Shield, description: 'כיסוי צד ג׳, התראות בטיחות' },
    { id: 'community', label: 'קהילה ומרקט', icon: ShoppingBag, description: 'פורום מקצועי, קנייה ומכירה של ציוד' },
    { id: 'settings', label: 'הגדרות עסק', icon: Settings, description: 'אזורי שירות, שעות פעילות, רכב' },
    { id: 'support', label: 'מרכז עזרה', icon: HelpCircle, description: 'שאלות ותשובות, פנייה לתמיכה' },
  ];

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
          YY
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ישראל ישראלי</h2>
          <div className="flex items-center gap-2 mt-1">
            <Award className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-600">Pro Score: 94/100</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all text-right flex items-start gap-4 group"
          >
            <div className="p-3 bg-gray-50 rounded-xl text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              <item.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{item.label}</h3>
              <p className="text-sm text-gray-500 mt-1">{item.description}</p>
            </div>
          </button>
        ))}
      </div>
      
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
            <Briefcase className="w-6 h-6" />
            <h3 className="font-bold text-lg">Business OS Pro</h3>
        </div>
        <p className="text-purple-100 text-sm mb-4">שדרג לגרסת המומחים וקבל גישה מוקדמת למכרזים גדולים.</p>
        <button className="bg-white text-purple-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-50 transition-colors">
            למד עוד
        </button>
      </div>
    </div>
  );
}