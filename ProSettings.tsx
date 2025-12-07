import { useState, useRef, useCallback } from 'react';
import { Save, Mail, Phone, Lock, Bell, Shield, User, Globe, Moon, Camera, Car, MapPin, Upload, Trash2, CheckCircle, X, ZoomIn, ZoomOut, RotateCcw, Image as ImageIcon, Wrench, Star, Search, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';

type ServiceCategory = 'plumbing' | 'electrical' | 'cleaning' | 'beauty' | 'locksmith' | 'appliances';

type Capability = {
  id: string;
  name: string;
  category: ServiceCategory;
  selected: boolean;
  proficiency: 'basic' | 'intermediate' | 'expert';
  isFavorite: boolean;
};

const CAPABILITIES_BY_CATEGORY: Record<ServiceCategory, { id: string; name: string }[]> = {
  plumbing: [
    { id: 'leak_repair', name: 'תיקון נזילות' },
    { id: 'drain_cleaning', name: 'פתיחת סתימות' },
    { id: 'toilet_install', name: 'התקנת אסלות' },
    { id: 'faucet_repair', name: 'תיקון ברזים' },
    { id: 'pipe_replacement', name: 'החלפת צנרת' },
    { id: 'water_heater', name: 'דודי שמש וחימום' },
    { id: 'shower_install', name: 'התקנת מקלחונים' },
    { id: 'sink_install', name: 'התקנת כיורים' },
    { id: 'washing_machine', name: 'חיבור מכונות כביסה' },
    { id: 'dishwasher', name: 'חיבור מדיחי כלים' },
    { id: 'emergency', name: 'קריאות חירום' },
    { id: 'renovation', name: 'שיפוץ חדרי רחצה' },
  ],
  electrical: [
    { id: 'outlet_install', name: 'התקנת שקעים' },
    { id: 'light_fixtures', name: 'התקנת גופי תאורה' },
    { id: 'panel_repair', name: 'תיקון לוח חשמל' },
    { id: 'circuit_breaker', name: 'החלפת נתיכים' },
    { id: 'wiring', name: 'חיווט חשמלי' },
    { id: 'ac_install', name: 'התקנת מזגנים' },
    { id: 'smart_home', name: 'בית חכם' },
    { id: 'emergency_electrical', name: 'קריאות חירום חשמל' },
    { id: 'inspection', name: 'בדיקות חשמל' },
  ],
  cleaning: [
    { id: 'deep_clean', name: 'ניקיון יסודי' },
    { id: 'regular_clean', name: 'ניקיון שוטף' },
    { id: 'post_construction', name: 'ניקיון לאחר שיפוץ' },
    { id: 'carpet_clean', name: 'ניקוי שטיחים' },
    { id: 'window_clean', name: 'ניקוי חלונות' },
    { id: 'kitchen_clean', name: 'ניקיון מטבחים' },
    { id: 'office_clean', name: 'ניקיון משרדים' },
    { id: 'move_out', name: 'ניקיון לפני/אחרי מעבר דירה' },
  ],
  beauty: [
    { id: 'haircut', name: 'תספורת' },
    { id: 'coloring', name: 'צביעת שיער' },
    { id: 'manicure', name: 'מניקור' },
    { id: 'pedicure', name: 'פדיקור' },
    { id: 'makeup', name: 'איפור' },
    { id: 'waxing', name: 'הסרת שיער' },
    { id: 'massage', name: 'עיסוי' },
    { id: 'facial', name: 'טיפולי פנים' },
  ],
  locksmith: [
    { id: 'lock_open', name: 'פתיחת דלתות נעולות' },
    { id: 'lock_replace', name: 'החלפת מנעולים' },
    { id: 'key_copy', name: 'שכפול מפתחות' },
    { id: 'safe_open', name: 'פתיחת כספות' },
    { id: 'car_lockout', name: 'פתיחת רכבים' },
    { id: 'emergency_lock', name: 'קריאות חירום' },
  ],
  appliances: [
    { id: 'fridge_repair', name: 'תיקון מקררים' },
    { id: 'washer_repair', name: 'תיקון מכונות כביסה' },
    { id: 'dryer_repair', name: 'תיקון מייבשים' },
    { id: 'oven_repair', name: 'תיקון תנורים' },
    { id: 'dishwasher_repair', name: 'תיקון מדיחי כלים' },
    { id: 'ac_repair', name: 'תיקון מזגנים' },
    { id: 'microwave_repair', name: 'תיקון מיקרוגל' },
  ],
};

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  plumbing: 'אינסטלציה',
  electrical: 'חשמל',
  cleaning: 'ניקיון',
  beauty: 'יופי וטיפוח',
  locksmith: 'מסגרות',
  appliances: 'מכשירי חשמל',
};

export function ProSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'vehicle' | 'service' | 'capabilities' | 'notifications' | 'security'>('profile');
  const [searchCapability, setSearchCapability] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('plumbing');
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newCustomCapability, setNewCustomCapability] = useState('');
  const [capabilities, setCapabilities] = useState<Capability[]>(() => {
    const initialCapabilities: Capability[] = [];
    Object.entries(CAPABILITIES_BY_CATEGORY).forEach(([category, caps]) => {
      caps.forEach(cap => {
        initialCapabilities.push({
          ...cap,
          category: category as ServiceCategory,
          selected: ['leak_repair', 'drain_cleaning', 'toilet_install', 'faucet_repair'].includes(cap.id),
          proficiency: ['leak_repair', 'drain_cleaning'].includes(cap.id) ? 'expert' : 'intermediate',
          isFavorite: ['leak_repair', 'drain_cleaning'].includes(cap.id),
        });
      });
    });
    return initialCapabilities;
  });
  
  const [formData, setFormData] = useState({
    firstName: 'ישראל',
    lastName: 'ישראלי',
    email: 'israel.israeli@example.com',
    phone: '050-1234567',
    profileImage: 'https://i.pravatar.cc/150?img=11',
    bio: 'אינסטלטור מוסמך עם 15 שנות ניסיון. מתמחה בתיקון נזילות, סתימות והתקנות.',
    language: 'he',
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false
    },
    vehicle: {
      type: 'רכב מסחרי',
      make: 'פיאט',
      model: 'דוקאטו',
      year: '2022',
      plateNumber: '123-45-678',
      color: 'לבן'
    },
    serviceArea: {
      radius: 15,
      cities: ['תל אביב', 'רמת גן', 'גבעתיים', 'בני ברק'],
      maxDailyJobs: 5
    }
  });

  const [showImageUpload, setShowImageUpload] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageZoom, setImageZoom] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('ההגדרות נשמרו בהצלחה!');
    }, 1000);
  };

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setImageZoom(100);
      setUploadSuccess(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleImageUpload = () => {
    if (!previewUrl) return;
    
    setIsUploading(true);
    
    setTimeout(() => {
      setFormData(prev => ({ ...prev, profileImage: previewUrl }));
      setIsUploading(false);
      setUploadSuccess(true);
      
      setTimeout(() => {
        setShowImageUpload(false);
        setSelectedImage(null);
        setPreviewUrl(null);
        setImageZoom(100);
        setUploadSuccess(false);
      }, 1500);
    }, 1500);
  };

  const handleCancelUpload = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setShowImageUpload(false);
    setSelectedImage(null);
    setPreviewUrl(null);
    setImageZoom(100);
    setUploadSuccess(false);
    setIsUploading(false);
  };

  const handleResetImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedImage(null);
    setPreviewUrl(null);
    setImageZoom(100);
    setUploadSuccess(false);
  };

  const toggleCapability = (id: string) => {
    setCapabilities(prev => prev.map(cap => 
      cap.id === id ? { ...cap, selected: !cap.selected } : cap
    ));
  };

  const toggleFavorite = (id: string) => {
    setCapabilities(prev => prev.map(cap => 
      cap.id === id ? { ...cap, isFavorite: !cap.isFavorite } : cap
    ));
  };

  const setProficiency = (id: string, proficiency: 'basic' | 'intermediate' | 'expert') => {
    setCapabilities(prev => prev.map(cap => 
      cap.id === id ? { ...cap, proficiency } : cap
    ));
  };

  const saveCapabilities = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('היכולות נשמרו בהצלחה!', {
        description: `${capabilities.filter(c => c.selected).length} יכולות נבחרו`,
      });
    }, 1000);
  };

  const addCustomCapability = () => {
    const trimmedName = newCustomCapability.trim();
    if (!trimmedName) {
      toast.error('יש להזין שם יכולת');
      return;
    }
    
    const existingCap = capabilities.find(
      cap => cap.category === selectedCategory && cap.name.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (existingCap) {
      toast.error('יכולת זו כבר קיימת בקטגוריה');
      return;
    }
    
    const customId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newCapability: Capability = {
      id: customId,
      name: trimmedName,
      category: selectedCategory,
      selected: true,
      proficiency: 'intermediate',
      isFavorite: false,
    };
    
    setCapabilities(prev => [...prev, newCapability]);
    setNewCustomCapability('');
    setShowAddCustom(false);
    toast.success('יכולת חדשה נוספה!', {
      description: trimmedName,
    });
  };

  const removeCustomCapability = (id: string) => {
    setCapabilities(prev => prev.filter(cap => cap.id !== id));
    toast.success('היכולת הוסרה');
  };

  const isCustomCapability = (id: string) => id.startsWith('custom_');

  const selectedCapabilitiesCount = capabilities.filter(c => c.selected).length;
  const customCapabilitiesCount = capabilities.filter(c => isCustomCapability(c.id)).length;
  const favoriteCapabilities = capabilities.filter(c => c.isFavorite && c.selected);

  const filteredCapabilities = capabilities.filter(cap => {
    const matchesCategory = cap.category === selectedCategory;
    const normalizedSearch = searchCapability.trim().toLowerCase();
    const matchesSearch = normalizedSearch === '' || cap.name.toLowerCase().includes(normalizedSearch);
    return matchesCategory && matchesSearch;
  });

  const sections = [
    { id: 'profile', label: 'פרופיל אישי', icon: User },
    { id: 'capabilities', label: 'יכולות מקצועיות', icon: Wrench, badge: selectedCapabilitiesCount },
    { id: 'vehicle', label: 'פרטי רכב', icon: Car },
    { id: 'service', label: 'אזור שירות', icon: MapPin },
    { id: 'notifications', label: 'התראות', icon: Bell },
    { id: 'security', label: 'אבטחה', icon: Shield },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">הגדרות</h2>
        <p className="text-gray-500">נהל את פרטי החשבון, הרכב ואזור השירות שלך</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64 flex-shrink-0">
          <nav className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-right transition-all ${
                  activeSection === section.id
                    ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 border-r-4 border-transparent'
                }`}
              >
                <section.icon className={`w-5 h-5 ${activeSection === section.id ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="font-medium flex-1">{section.label}</span>
                {'badge' in section && section.badge ? (
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {section.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 space-y-6">
          {activeSection === 'profile' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  פרופיל אישי
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      <img 
                        src={formData.profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => setShowImageUpload(true)}
                      className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Camera className="w-8 h-8 text-white" />
                    </button>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{formData.firstName} {formData.lastName}</h4>
                    <p className="text-gray-500 text-sm">אינסטלטור מוסמך</p>
                    <button 
                      onClick={() => setShowImageUpload(true)}
                      className="mt-2 text-blue-600 text-sm font-medium hover:underline flex items-center gap-1"
                    >
                      <Upload className="w-4 h-4" />
                      שנה תמונה
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">שם פרטי</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">שם משפחה</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">כתובת אימייל</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                      />
                      <Mail className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">מספר טלפון</label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-left"
                        dir="ltr"
                      />
                      <Phone className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">תיאור קצר</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none"
                    placeholder="ספר ללקוחות על עצמך והניסיון שלך..."
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'capabilities' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-l from-blue-50 to-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Wrench className="w-5 h-5 text-blue-600" />
                        יכולות מקצועיות
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">הגדר את היכולות הספציפיות שלך כדי לקבל בקשות מתאימות</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                        {selectedCapabilitiesCount} נבחרו
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {favoriteCapabilities.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        היכולות המועדפות שלי
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {favoriteCapabilities.map(cap => (
                          <div key={cap.id} className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1.5">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-medium text-gray-800">{cap.name}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                              cap.proficiency === 'expert' ? 'bg-green-100 text-green-700' :
                              cap.proficiency === 'intermediate' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {cap.proficiency === 'expert' ? 'מומחה' : cap.proficiency === 'intermediate' ? 'מנוסה' : 'בסיסי'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(CATEGORY_LABELS) as ServiceCategory[]).map(cat => {
                      const totalInCategory = capabilities.filter(c => c.category === cat).length;
                      const selectedInCategory = capabilities.filter(c => c.category === cat && c.selected).length;
                      const customInCategory = capabilities.filter(c => c.category === cat && isCustomCapability(c.id)).length;
                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            selectedCategory === cat
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {CATEGORY_LABELS[cat]}
                          <span className={`mr-2 text-xs ${selectedCategory === cat ? 'text-blue-200' : 'text-gray-400'}`}>
                            ({selectedInCategory}/{totalInCategory})
                          </span>
                          {customInCategory > 0 && (
                            <span className={`mr-1 text-[10px] ${selectedCategory === cat ? 'text-green-200' : 'text-green-500'}`}>
                              +{customInCategory}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Search className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchCapability}
                        onChange={(e) => setSearchCapability(e.target.value)}
                        placeholder="חפש יכולת..."
                        className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                    <button
                      onClick={() => setShowAddCustom(true)}
                      className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      הוסף יכולת
                    </button>
                  </div>

                  {showAddCustom && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-green-700">
                        <Plus className="w-5 h-5" />
                        <span className="font-medium">הוסף יכולת מותאמת אישית ל{CATEGORY_LABELS[selectedCategory]}</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCustomCapability}
                          onChange={(e) => setNewCustomCapability(e.target.value)}
                          placeholder="הזן שם יכולת חדשה..."
                          className="flex-1 px-4 py-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none transition-all bg-white"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addCustomCapability();
                            }
                          }}
                          autoFocus
                        />
                        <button
                          onClick={addCustomCapability}
                          className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                        >
                          הוסף
                        </button>
                        <button
                          onClick={() => {
                            setShowAddCustom(false);
                            setNewCustomCapability('');
                          }}
                          className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
                        >
                          ביטול
                        </button>
                      </div>
                    </div>
                  )}

                  {customCapabilitiesCount > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                        {customCapabilitiesCount} יכולות מותאמות אישית
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredCapabilities.map(cap => (
                      <div
                        key={cap.id}
                        className={`border rounded-xl p-4 transition-all cursor-pointer relative ${
                          cap.selected
                            ? isCustomCapability(cap.id) 
                              ? 'border-green-300 bg-green-50/50 shadow-sm'
                              : 'border-blue-300 bg-blue-50/50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                        onClick={() => toggleCapability(cap.id)}
                      >
                        {isCustomCapability(cap.id) && (
                          <span className="absolute top-2 left-2 bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded font-medium">
                            מותאם אישית
                          </span>
                        )}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              cap.selected 
                                ? isCustomCapability(cap.id) ? 'border-green-600 bg-green-600' : 'border-blue-600 bg-blue-600' 
                                : 'border-gray-300'
                            }`}>
                              {cap.selected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className="font-medium text-gray-800">{cap.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(cap.id);
                              }}
                              className={`p-1.5 rounded-full transition-colors ${
                                cap.isFavorite ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'
                              }`}
                            >
                              <Star className={`w-4 h-4 ${cap.isFavorite ? 'fill-yellow-500' : ''}`} />
                            </button>
                            {isCustomCapability(cap.id) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeCustomCapability(cap.id);
                                }}
                                className="p-1.5 rounded-full text-gray-300 hover:text-red-500 transition-colors"
                                title="הסר יכולת מותאמת אישית"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {cap.selected && (
                          <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                            {(['basic', 'intermediate', 'expert'] as const).map(level => (
                              <button
                                key={level}
                                onClick={() => setProficiency(cap.id, level)}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                  cap.proficiency === level
                                    ? level === 'expert' ? 'bg-green-600 text-white' :
                                      level === 'intermediate' ? 'bg-blue-600 text-white' :
                                      'bg-gray-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {level === 'expert' ? 'מומחה' : level === 'intermediate' ? 'מנוסה' : 'בסיסי'}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={saveCapabilities}
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                שמור יכולות
              </button>
            </div>
          )}

          {activeSection === 'vehicle' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Car className="w-5 h-5 text-blue-600" />
                  פרטי רכב
                </h3>
                <p className="text-sm text-gray-500 mt-1">פרטי הרכב שלך משמשים לחישוב מרחקים וזמני הגעה</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">סוג רכב</label>
                    <select
                      value={formData.vehicle.type}
                      onChange={(e) => setFormData({...formData, vehicle: {...formData.vehicle, type: e.target.value}})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-white"
                    >
                      <option value="רכב פרטי">רכב פרטי</option>
                      <option value="רכב מסחרי">רכב מסחרי</option>
                      <option value="משאית קלה">משאית קלה</option>
                      <option value="אופנוע">אופנוע</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">יצרן</label>
                    <input
                      type="text"
                      value={formData.vehicle.make}
                      onChange={(e) => setFormData({...formData, vehicle: {...formData.vehicle, make: e.target.value}})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                      placeholder="לדוגמה: פיאט"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">דגם</label>
                    <input
                      type="text"
                      value={formData.vehicle.model}
                      onChange={(e) => setFormData({...formData, vehicle: {...formData.vehicle, model: e.target.value}})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                      placeholder="לדוגמה: דוקאטו"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">שנת ייצור</label>
                    <input
                      type="text"
                      value={formData.vehicle.year}
                      onChange={(e) => setFormData({...formData, vehicle: {...formData.vehicle, year: e.target.value}})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                      placeholder="2022"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">מספר רישוי</label>
                    <input
                      type="text"
                      value={formData.vehicle.plateNumber}
                      onChange={(e) => setFormData({...formData, vehicle: {...formData.vehicle, plateNumber: e.target.value}})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-left"
                      dir="ltr"
                      placeholder="123-45-678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">צבע</label>
                    <input
                      type="text"
                      value={formData.vehicle.color}
                      onChange={(e) => setFormData({...formData, vehicle: {...formData.vehicle, color: e.target.value}})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                      placeholder="לבן"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Car className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-900">למה זה חשוב?</h4>
                    <p className="text-sm text-blue-700 mt-1">פרטי הרכב שלך עוזרים ללקוחות לזהות אותך כשאתה מגיע, ומאפשרים לנו לחשב זמני הגעה מדויקים יותר.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'service' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  אזור שירות
                </h3>
                <p className="text-sm text-gray-500 mt-1">הגדר את אזורי העבודה המועדפים עליך</p>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">רדיוס שירות מקסימלי</label>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl font-bold text-gray-900">{formData.serviceArea.radius} ק"מ</span>
                      <span className="text-sm text-gray-500">מהמיקום הנוכחי שלך</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={formData.serviceArea.radius}
                      onChange={(e) => setFormData({
                        ...formData, 
                        serviceArea: {...formData.serviceArea, radius: parseInt(e.target.value)}
                      })}
                      className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                      <span>5 ק"מ</span>
                      <span>25 ק"מ</span>
                      <span>50 ק"מ</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">ערים מועדפות</label>
                  <div className="flex flex-wrap gap-2">
                    {formData.serviceArea.cities.map((city, index) => (
                      <span 
                        key={index}
                        className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2"
                      >
                        {city}
                        <button 
                          onClick={() => {
                            const newCities = formData.serviceArea.cities.filter((_, i) => i !== index);
                            setFormData({...formData, serviceArea: {...formData.serviceArea, cities: newCities}});
                          }}
                          className="hover:text-red-600 transition-colors"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <button className="border-2 border-dashed border-gray-300 text-gray-500 px-3 py-1.5 rounded-full text-sm font-medium hover:border-blue-400 hover:text-blue-600 transition-colors">
                      + הוסף עיר
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">מספר עבודות מקסימלי ביום</label>
                  <select
                    value={formData.serviceArea.maxDailyJobs}
                    onChange={(e) => setFormData({
                      ...formData, 
                      serviceArea: {...formData.serviceArea, maxDailyJobs: parseInt(e.target.value)}
                    })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-white"
                  >
                    {[3, 4, 5, 6, 7, 8, 10].map(num => (
                      <option key={num} value={num}>{num} עבודות</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-600" />
                  התראות והודעות
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { id: 'email', label: 'קבלת עדכונים במייל על הצעות חדשות', desc: 'נשלח לך מייל בכל פעם שלקוח מפרסם בקשה רלוונטית' },
                  { id: 'push', label: 'התראות דפדפן (Push Notifications)', desc: 'קבל התראות בזמן אמת כשהדפדפן פתוח' },
                  { id: 'sms', label: 'עדכונים ב-SMS', desc: 'קבלת הודעות טקסט לנייד (עלול לכלול חיובים נוספים)' },
                  { id: 'marketing', label: 'עדכונים שיווקיים ומבצעים', desc: 'קבל מידע על פיצ׳רים חדשים והטבות למקצוענים' },
                ].map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex h-6 items-center">
                      <input
                        id={item.id}
                        type="checkbox"
                        checked={formData.notifications[item.id as keyof typeof formData.notifications]}
                        onChange={(e) => setFormData({
                          ...formData,
                          notifications: {
                            ...formData.notifications,
                            [item.id]: e.target.checked
                          }
                        })}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                      />
                    </div>
                    <div className="flex-1">
                      <label htmlFor={item.id} className="font-medium text-gray-900 block cursor-pointer">
                        {item.label}
                      </label>
                      <p className="text-gray-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  אבטחה וסיסמה
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">סיסמה נוכחית</label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                      />
                      <Lock className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">סיסמה חדשה</label>
                    <div className="relative">
                      <input
                        type="password"
                        className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                      />
                      <Lock className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">אימות סיסמה חדשה</label>
                    <div className="relative">
                      <input
                        type="password"
                        className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                      />
                      <Lock className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex items-start gap-3">
                  <Shield className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-yellow-900">אימות דו-שלבי</h4>
                    <p className="text-sm text-yellow-700 mt-1">הגן על החשבון שלך עם שכבת אבטחה נוספת</p>
                    <button className="mt-2 text-yellow-700 font-medium text-sm hover:underline">
                      הפעל אימות דו-שלבי
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-4 pt-4">
            <button className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors">
              ביטול שינויים
            </button>
            <button 
              onClick={handleSave}
              disabled={isLoading}
              className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              שמור שינויים
            </button>
          </div>
        </div>
      </div>

      {showImageUpload && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
          onClick={handleCancelUpload}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" />
                עדכון תמונת פרופיל
              </h3>
              <button
                onClick={handleCancelUpload}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {uploadSuccess ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-1">התמונה הועלתה בהצלחה!</h4>
                  <p className="text-gray-500 text-sm">תמונת הפרופיל שלך עודכנה</p>
                </div>
              ) : !previewUrl ? (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                  />
                  
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${
                      isDragging 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${
                      isDragging ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Upload className={`w-8 h-8 ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} />
                    </div>
                    <p className="text-gray-700 font-medium mb-1">
                      {isDragging ? 'שחרר את התמונה כאן' : 'גרור ושחרר תמונה כאן'}
                    </p>
                    <p className="text-gray-500 text-sm mb-4">או</p>
                    <button
                      type="button"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                    >
                      <ImageIcon className="w-4 h-4" />
                      בחר מהמכשיר
                    </button>
                    <p className="text-gray-400 text-xs mt-4">PNG, JPG, WEBP עד 5MB</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium text-gray-700 text-sm mb-2">טיפים לתמונה טובה:</h4>
                    <ul className="text-gray-500 text-sm space-y-1">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        תמונה ברורה של הפנים
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        תאורה טובה
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        רקע נקי
                      </li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <div className="relative">
                    <div className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-gray-200 shadow-lg bg-gray-100">
                      <img 
                        src={previewUrl} 
                        alt="תצוגה מקדימה" 
                        className="w-full h-full object-cover transition-transform duration-200"
                        style={{ transform: `scale(${imageZoom / 100})` }}
                      />
                    </div>
                    
                    <button
                      onClick={handleResetImage}
                      className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                      title="הסר תמונה"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">התאמת גודל</span>
                      <button
                        onClick={() => setImageZoom(100)}
                        className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        איפוס
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setImageZoom(prev => Math.max(50, prev - 10))}
                        className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        disabled={imageZoom <= 50}
                      >
                        <ZoomOut className="w-4 h-4 text-gray-600" />
                      </button>
                      
                      <div className="flex-1">
                        <input
                          type="range"
                          min="50"
                          max="150"
                          value={imageZoom}
                          onChange={(e) => setImageZoom(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </div>
                      
                      <button
                        onClick={() => setImageZoom(prev => Math.min(150, prev + 10))}
                        className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        disabled={imageZoom >= 150}
                      >
                        <ZoomIn className="w-4 h-4 text-gray-600" />
                      </button>
                      
                      <span className="text-sm font-medium text-gray-600 w-12 text-center">
                        {imageZoom}%
                      </span>
                    </div>
                  </div>
                  
                  {selectedImage && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                      <ImageIcon className="w-4 h-4" />
                      <span className="truncate flex-1">{selectedImage.name}</span>
                      <span>({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {!uploadSuccess && (
              <div className="p-5 border-t border-gray-100 flex gap-3">
                <button
                  onClick={handleCancelUpload}
                  disabled={isUploading}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  ביטול
                </button>
                <button
                  onClick={handleImageUpload}
                  disabled={!previewUrl || isUploading}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      מעלה...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      שמור תמונה
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
