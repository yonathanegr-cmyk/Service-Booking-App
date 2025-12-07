import { useState } from 'react';
import { ArrowRight, Mail, Phone, MapPin, Clock, Send, CheckCircle, MessageSquare, Headphones } from 'lucide-react';

type ContactUsProps = {
  onBack: () => void;
};

export function ContactUs({ onBack }: ContactUsProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" dir="rtl">
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

      {/* Hero */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl lg:text-7xl text-gray-900 mb-6">צרו איתנו קשר</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            יש לכם שאלה? הצעה? או סתם רוצים לדבר? אנחנו כאן בשבילכם
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <a
              href="mailto:support@beed.co.il"
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all group border-2 border-transparent hover:border-blue-500"
            >
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Mail className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl text-gray-900 mb-2">דוא"ל</h3>
              <p className="text-gray-600 text-sm mb-2">support@beed.co.il</p>
              <p className="text-blue-600 text-sm">שלחו לנו מייל →</p>
            </a>

            <a
              href="tel:03-1234567"
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all group border-2 border-transparent hover:border-green-500"
            >
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Phone className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl text-gray-900 mb-2">טלפון</h3>
              <p className="text-gray-600 text-sm mb-2">03-1234567</p>
              <p className="text-green-600 text-sm">התקשרו אלינו →</p>
            </a>

            <div className="bg-white rounded-2xl p-8 shadow-lg group border-2 border-transparent">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl text-gray-900 mb-2">כתובת</h3>
              <p className="text-gray-600 text-sm">רחוב רוטשילד 1<br />תל אביב, ישראל</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg group border-2 border-transparent">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl text-gray-900 mb-2">שעות פעילות</h3>
              <p className="text-gray-600 text-sm">
                ראשון-חמישי: 9:00-18:00<br />
                שישי: 9:00-14:00
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12">
              <h2 className="text-3xl text-gray-900 mb-8">שלחו לנו הודעה</h2>
              
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl text-gray-900 mb-3">ההודעה נשלחה!</h3>
                  <p className="text-gray-600">נחזור אליכם בהקדם האפשרי</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 mb-2">שם מלא</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="איך קוראים לך?"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">דוא"ל</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">טלפון (אופציונלי)</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="050-1234567"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">נושא</label>
                    <select
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                    >
                      <option value="">בחרו נושא...</option>
                      <option value="general">שאלה כללית</option>
                      <option value="support">תמיכה טכנית</option>
                      <option value="billing">חיוב ותשלומים</option>
                      <option value="partnership">שותפויות עסקיות</option>
                      <option value="feedback">משוב והצעות</option>
                      <option value="complaint">תלונה</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">הודעה</label>
                    <textarea
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                      placeholder="ספרו לנו במה נוכל לעזור..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all inline-flex items-center justify-center gap-3 text-lg"
                  >
                    <span>שלחו הודעה</span>
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              )}
            </div>

            {/* Additional Info */}
            <div className="space-y-8">
              {/* Quick Response */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 border-2 border-blue-200">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <Headphones className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl text-gray-900 mb-4">תמיכה מהירה</h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  צוות התמיכה שלנו זמין לעזור לכם בכל שאלה. זמן תגובה ממוצע של פחות מ-2 שעות.
                </p>
                <div className="space-y-3 text-gray-700">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>תגובה תוך 2 שעות</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>תמיכה בעברית ובאנגלית</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>מענה אנושי, לא בוטים</span>
                  </div>
                </div>
              </div>

              {/* FAQ Link */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-8 border-2 border-purple-200">
                <div className="text-5xl mb-4">❓</div>
                <h3 className="text-2xl text-gray-900 mb-4">שאלות נפוצות</h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  מצאו תשובות מהירות לשאלות הנפוצות ביותר במרכז העזרה שלנו.
                </p>
                <button className="text-purple-600 hover:text-purple-700 font-medium inline-flex items-center gap-2 group">
                  <span>למרכז העזרה</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform rotate-180" />
                </button>
              </div>

              {/* Social Media */}
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-3xl p-8 border-2 border-pink-200">
                <div className="text-5xl mb-4">🌐</div>
                <h3 className="text-2xl text-gray-900 mb-4">עקבו אחרינו</h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  הישארו מעודכנים בחדשות, טיפים ומבצעים מיוחדים.
                </p>
                <div className="flex gap-4">
                  <a
                    href="#"
                    className="w-12 h-12 bg-white rounded-xl flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                  >
                    <span className="text-xl">f</span>
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 bg-white rounded-xl flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                  >
                    <span className="text-xl">𝕏</span>
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 bg-white rounded-xl flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                  >
                    <span className="text-xl">in</span>
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 bg-white rounded-xl flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                  >
                    <span className="text-xl">📸</span>
                  </a>
                </div>
              </div>

              {/* Emergency */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-3xl p-8 border-2 border-red-200">
                <div className="text-5xl mb-4">🚨</div>
                <h3 className="text-2xl text-gray-900 mb-4">מצב חירום?</h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  במקרה של בעיה דחופה, התקשרו אלינו ישירות ונעזור לכם למצוא פתרון מהיר.
                </p>
                <a
                  href="tel:03-1234567"
                  className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors inline-flex items-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  <span>03-1234567</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section (Placeholder) */}
      <section className="pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="relative h-[500px] w-full group">
              <iframe
                width="100%"
                height="100%"
                title="map"
                className="absolute inset-0 w-full h-full"
                src="https://maps.google.com/maps?width=100%25&height=600&hl=he&q=Rothschild%201,%20Tel%20Aviv&t=&z=15&ie=UTF8&iwloc=B&output=embed"
                style={{ filter: 'grayscale(100%)', border: 0 }}
                allowFullScreen
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90 flex items-center justify-center text-white backdrop-blur-[2px] transition-all duration-500 hover:bg-gradient-to-r hover:from-blue-600/80 hover:to-purple-600/80">
                <div className="text-center transform hover:scale-105 transition-transform duration-300">
                  <div className="bg-white/20 p-6 rounded-full inline-flex items-center justify-center mb-6 backdrop-blur-md border border-white/30 shadow-lg">
                    <MapPin className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-4xl font-bold mb-3 tracking-tight">בואו לבקר אותנו</h3>
                  <p className="text-2xl opacity-95 font-light mb-8">רחוב רוטשילד 1, תל אביב</p>
                  <a
                    href="https://waze.com/ul?q=Rothschild+1+Tel+Aviv"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-full font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <span>נווטו ב-Waze</span>
                    <ArrowRight className="w-5 h-5 rotate-180" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
