import { useState } from 'react';
import { Camera, Star, CheckCircle, DollarSign, Clock, Save, Edit3, Award, Briefcase } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function ProProfile() {
  const [hourlyRate, setHourlyRate] = useState('150');
  const [bio, setBio] = useState('אינסטלטור מוסמך עם 10 שנות ניסיון. מתמחה בתיקוני חירום והתקנות סניטריות. עובד באזור תל אביב והמרכז.');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [availability, setAvailability] = useState({
    sunday: true,
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
  });

  const profile = {
    name: 'ישראל ישראלי',
    image: 'https://i.pravatar.cc/150?img=11',
    service: 'אינסטלציה',
    rating: 4.9,
    reviews: 127,
    jobsCompleted: 156,
    joinDate: 'ינואר 2023',
    verified: true,
  };

  const specialties = [
    'תיקון נזילות',
    'פתיחת סתימות',
    'התקנות סניטריות',
    'דוד שמש וחימום',
    'צנרת ואינסטלציה',
  ];

  const reviews = [
    { name: 'דני כ.', rating: 5, comment: 'שירות מעולה, מקצועי ואמין. הגיע בזמן ותיקן את הבעיה במהירות!', date: '25 נוב 2025' },
    { name: 'רונית ש.', rating: 5, comment: 'מהיר ויעיל, ממליצה בחום לכולם', date: '23 נוב 2025' },
    { name: 'יוסי ל.', rating: 4, comment: 'עבודה טובה, מחיר הוגן. היה אדיב ומקצועי', date: '20 נוב 2025' },
  ];

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
    }, 1000);
  };

  return (
    <div dir="rtl" className="pb-20">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">הפרופיל שלי</h2>
          <p className="text-gray-500">נהל את המידע המקצועי שלך</p>
        </div>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={isSaving}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
            isEditing 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              שומר...
            </>
          ) : isEditing ? (
            <>
              <Save className="w-4 h-4" />
              שמור שינויים
            </>
          ) : (
            <>
              <Edit3 className="w-4 h-4" />
              עריכה
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="relative mb-6">
              <div className="w-32 h-32 mx-auto relative">
                <ImageWithFallback
                  src={profile.image}
                  alt={profile.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
                {isEditing && (
                  <button className="absolute bottom-0 left-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg">
                    <Camera className="w-5 h-5" />
                  </button>
                )}
                {profile.verified && (
                  <div className="absolute top-0 left-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{profile.name}</h3>
              <div className="text-gray-500 mb-3">{profile.service}</div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="flex">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className={`w-4 h-4 ${i <= Math.floor(profile.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="font-bold text-gray-900">{profile.rating}</span>
                <span className="text-gray-400">({profile.reviews} ביקורות)</span>
              </div>
              <div className="text-gray-400 text-sm flex items-center justify-center gap-1">
                <Award className="w-4 h-4" />
                חבר מאז {profile.joinDate}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">{profile.jobsCompleted}</div>
                <div className="text-gray-500 text-sm">עבודות</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">₪{hourlyRate}</div>
                <div className="text-gray-500 text-sm">לשעה</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              התמחויות
            </h3>
            <div className="flex flex-wrap gap-2">
              {specialties.map((specialty, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                >
                  {specialty}
                </span>
              ))}
            </div>
            {isEditing && (
              <button className="w-full mt-4 border-2 border-dashed border-gray-200 rounded-xl py-2.5 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm font-medium">
                + הוסף התמחות
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              תמחור
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">תעריף שעתי בסיסי (₪)</label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                    isEditing 
                      ? 'border-gray-200 focus:border-blue-500 focus:outline-none' 
                      : 'border-gray-100 bg-gray-50 text-gray-600'
                  }`}
                />
                <div className="text-xs text-gray-400 mt-2">
                  המחיר הסופי יחושב אוטומטית על ידי מנוע ההצעות החכם
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="text-blue-900 font-medium mb-1">תעריף ממוצע בשוק</div>
                <div className="text-blue-600 text-sm">
                  לסוג השירות והאזור שלך: ₪120-180 לשעה
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">אודותיי</h3>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={!isEditing}
              className={`w-full px-4 py-3 border-2 rounded-xl transition-all resize-none ${
                isEditing 
                  ? 'border-gray-200 focus:border-blue-500 focus:outline-none' 
                  : 'border-gray-100 bg-gray-50 text-gray-600'
              }`}
              rows={4}
              placeholder="תאר את הניסיון והמומחיות שלך..."
            />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              זמינות
            </h3>
            
            <div className="grid grid-cols-7 gap-2">
              {Object.entries(availability).map(([day, available]) => {
                const dayLabels: { [key: string]: string } = {
                  sunday: 'א׳',
                  monday: 'ב׳',
                  tuesday: 'ג׳',
                  wednesday: 'ד׳',
                  thursday: 'ה׳',
                  friday: 'ו׳',
                  saturday: 'ש׳',
                };

                return (
                  <button
                    key={day}
                    onClick={() => isEditing && setAvailability({ ...availability, [day]: !available })}
                    disabled={!isEditing}
                    className={`p-3 rounded-xl text-center font-bold transition-all ${
                      available
                        ? 'bg-green-100 text-green-700 border-2 border-green-200'
                        : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                    } ${isEditing ? 'hover:scale-105 cursor-pointer' : 'cursor-default'}`}
                  >
                    {dayLabels[day]}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              {isEditing ? 'לחץ על יום כדי לשנות את הזמינות' : 'ימים בירוק = זמין לעבודה'}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                ביקורות אחרונות
              </h3>
              <span className="text-sm text-gray-400">{reviews.length} ביקורות</span>
            </div>
            
            <div className="space-y-4">
              {reviews.map((review, idx) => (
                <div key={idx} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{review.name}</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-gray-400 text-sm">{review.date}</span>
                  </div>
                  <p className="text-gray-600 text-sm pr-13">{review.comment}</p>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 text-blue-600 font-medium text-sm hover:text-blue-700 transition-colors">
              הצג את כל הביקורות →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
