import { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ArrowLeft, 
  ArrowRight, 
  Mail, 
  Lock, 
  Phone, 
  Eye, 
  EyeOff, 
  User, 
  Building2,
  Camera,
  MapPin,
  Briefcase,
  Plus,
  X,
  Upload,
  Image,
  FileCheck,
  Shield,
  CheckCircle2,
  Sparkles,
  Star,
  Clock,
  Award,
  BadgeCheck,
  CheckCircle,
  Smartphone,
  TrendingUp,
  Calendar,
  DollarSign,
  Wrench
} from 'lucide-react';
import { BeadyLogo } from './ui/BeadyLogo';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

type ProAuthProps = {
  onBack: () => void;
  onBackToLanding: () => void;
  onLoginSuccess: () => void;
};

const SERVICE_CATEGORIES = [
  { id: 'plumbing', name: 'אינסטלציה', icon: '🔧' },
  { id: 'electrical', name: 'חשמל', icon: '⚡' },
  { id: 'cleaning', name: 'ניקיון', icon: '✨' },
  { id: 'beauty', name: 'יופי', icon: '💅' },
  { id: 'locksmith', name: 'מנעולנות', icon: '🔐' },
  { id: 'appliances', name: 'מכשירי חשמל', icon: '🔌' },
  { id: 'renovation', name: 'שיפוצים', icon: '🏗️' },
  { id: 'gardening', name: 'גינון', icon: '🌿' },
  { id: 'ac', name: 'מיזוג אוויר', icon: '❄️' },
  { id: 'painting', name: 'צביעה', icon: '🎨' },
  { id: 'moving', name: 'הובלות', icon: '🚚' },
  { id: 'pest_control', name: 'הדברה', icon: '🐜' },
];

const stepOneSchema = z.object({
  email: z.string().email('כתובת אימייל לא תקינה'),
  password: z.string().min(8, 'הסיסמה חייבת להכיל לפחות 8 תווים')
    .regex(/[A-Z]/, 'הסיסמה חייבת להכיל אות גדולה אחת לפחות')
    .regex(/[0-9]/, 'הסיסמה חייבת להכיל ספרה אחת לפחות'),
  confirmPassword: z.string(),
  phone: z.string().min(9, 'מספר טלפון לא תקין').max(15, 'מספר טלפון לא תקין'),
  acceptTerms: z.boolean().refine(val => val === true, 'יש לאשר את תנאי השימוש'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'הסיסמאות אינן תואמות',
  path: ['confirmPassword'],
});

const stepTwoSchema = z.object({
  fullName: z.string().min(2, 'שם מלא נדרש'),
  businessName: z.string().optional(),
  bio: z.string().min(20, 'תיאור קצר מדי - לפחות 20 תווים').max(500, 'תיאור ארוך מדי - מקסימום 500 תווים'),
  city: z.string().min(2, 'יש לבחור עיר'),
  serviceRadius: z.number().min(1, 'יש לבחור רדיוס שירות').max(100),
});

const stepThreeSchema = z.object({
  categories: z.array(z.string()).min(1, 'יש לבחור לפחות קטגוריה אחת'),
  customSkills: z.array(z.string()),
  hourlyRate: z.number().min(50, 'תעריף מינימלי הוא 50 ש"ח לשעה'),
  experienceYears: z.number().min(0).max(50),
});

const stepFourSchema = z.object({
  portfolioImages: z.array(z.string()).min(0).max(5),
  certificationFile: z.string().optional(),
  idVerification: z.string().optional(),
  acceptingClients: z.boolean(),
  availabilityDays: z.array(z.string()),
});

type StepOneData = z.infer<typeof stepOneSchema>;
type StepTwoData = z.infer<typeof stepTwoSchema>;
type StepThreeData = z.infer<typeof stepThreeSchema>;
type StepFourData = z.infer<typeof stepFourSchema>;

type WizardData = StepOneData & StepTwoData & StepThreeData & StepFourData;

const STEPS = [
  { id: 1, title: 'פרטי חשבון', icon: Lock, emoji: '🔐', description: 'אימייל וסיסמה' },
  { id: 2, title: 'מידע אישי', icon: User, emoji: '👤', description: 'שם ותיאור' },
  { id: 3, title: 'מומחיות', icon: Briefcase, emoji: '🛠️', description: 'שירותים ותעריפים' },
  { id: 4, title: 'אמון ופורטפוליו', icon: Shield, emoji: '✅', description: 'אימות ועבודות' },
];

const DAYS_OF_WEEK = [
  { id: 'sunday', name: 'ראשון' },
  { id: 'monday', name: 'שני' },
  { id: 'tuesday', name: 'שלישי' },
  { id: 'wednesday', name: 'רביעי' },
  { id: 'thursday', name: 'חמישי' },
  { id: 'friday', name: 'שישי' },
  { id: 'saturday', name: 'שבת' },
];

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.734 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.424 44.599 -10.174 45.789 L -6.764 42.379 C -8.804 40.479 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
    </g>
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);

export function ProAuth({ onBack, onBackToLanding, onLoginSuccess }: ProAuthProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [certificationFile, setCertificationFile] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState('');
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);

  const [wizardData, setWizardData] = useState<Partial<WizardData>>({
    categories: [],
    customSkills: [],
    portfolioImages: [],
    availabilityDays: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
    acceptingClients: true,
    serviceRadius: 15,
    experienceYears: 0,
    hourlyRate: 100,
  });

  const stepOneForm = useForm<StepOneData>({
    resolver: zodResolver(stepOneSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      acceptTerms: false,
    },
  });

  const stepTwoForm = useForm<StepTwoData>({
    resolver: zodResolver(stepTwoSchema),
    defaultValues: {
      fullName: '',
      businessName: '',
      bio: '',
      city: '',
      serviceRadius: 15,
    },
  });

  const stepThreeForm = useForm<StepThreeData>({
    resolver: zodResolver(stepThreeSchema),
    defaultValues: {
      categories: [],
      customSkills: [],
      hourlyRate: 100,
      experienceYears: 0,
    },
  });

  const stepFourForm = useForm<StepFourData>({
    resolver: zodResolver(stepFourSchema),
    defaultValues: {
      portfolioImages: [],
      certificationFile: '',
      idVerification: '',
      acceptingClients: true,
      availabilityDays: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error('נא למלא את כל השדות');
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsLoading(false);
    toast.success('התחברת בהצלחה!');
    onLoginSuccess();
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    toast.info(mode === 'login' ? 'מתחבר עם Google...' : 'נרשם עם Google...', { duration: 1500 });
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    onLoginSuccess();
  };

  const handleAppleAuth = async () => {
    setIsLoading(true);
    toast.info(mode === 'login' ? 'מתחבר עם Apple...' : 'נרשם עם Apple...', { duration: 1500 });
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    onLoginSuccess();
  };

  const demoLogin = () => {
    setLoginEmail('pro@beedy.com');
    setLoginPassword('demo123');
    toast.info('פרטי חשבון דמו הוזנו', { duration: 2000 });
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePortfolioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && portfolioImages.length < 5) {
      Array.from(files).slice(0, 5 - portfolioImages.length).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPortfolioImages(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleCertUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCertificationFile(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      toast.success('קובץ הועלה בהצלחה');
    }
  };

  const removePortfolioImage = (index: number) => {
    setPortfolioImages(prev => prev.filter((_, i) => i !== index));
  };

  const toggleCategory = (categoryId: string) => {
    const current = stepThreeForm.getValues('categories') || [];
    const updated = current.includes(categoryId)
      ? current.filter(id => id !== categoryId)
      : [...current, categoryId];
    stepThreeForm.setValue('categories', updated, { shouldValidate: true });
  };

  const addCustomSkill = () => {
    if (newSkill.trim()) {
      const current = stepThreeForm.getValues('customSkills') || [];
      if (!current.includes(newSkill.trim())) {
        stepThreeForm.setValue('customSkills', [...current, newSkill.trim()]);
        setNewSkill('');
        toast.success('יכולת נוספה');
      }
    }
  };

  const removeCustomSkill = (skill: string) => {
    const current = stepThreeForm.getValues('customSkills') || [];
    stepThreeForm.setValue('customSkills', current.filter(s => s !== skill));
  };

  const toggleAvailabilityDay = (dayId: string) => {
    const current = stepFourForm.getValues('availabilityDays') || [];
    const updated = current.includes(dayId)
      ? current.filter(id => id !== dayId)
      : [...current, dayId];
    stepFourForm.setValue('availabilityDays', updated);
  };

  const handleNextStep = async () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = await stepOneForm.trigger();
        if (isValid) {
          setWizardData(prev => ({ ...prev, ...stepOneForm.getValues() }));
        }
        break;
      case 2:
        isValid = await stepTwoForm.trigger();
        if (isValid) {
          setWizardData(prev => ({ ...prev, ...stepTwoForm.getValues() }));
        }
        break;
      case 3:
        isValid = await stepThreeForm.trigger();
        if (isValid) {
          setWizardData(prev => ({ ...prev, ...stepThreeForm.getValues() }));
        }
        break;
      case 4:
        isValid = await stepFourForm.trigger();
        if (isValid) {
          handleFinalSubmit();
          return;
        }
        break;
    }

    if (isValid && currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    
    const finalData = {
      ...wizardData,
      ...stepFourForm.getValues(),
      profileImage,
      portfolioImages,
      certificationFile,
    };

    console.log('Final registration data:', finalData);

    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    toast.success('נרשמת בהצלחה! ברוכים הבאים ל-Beedy', {
      description: 'החשבון שלך נמצא בבדיקה. נעדכן אותך תוך 24 שעות.',
    });
    
    onLoginSuccess();
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setCurrentStep(1);
  };

  const benefits = [
    { icon: TrendingUp, text: 'קבל הזמנות עם ניתוח AI חכם' },
    { icon: DollarSign, text: 'הצע הצעות מחיר מדויקות בזמן אמת' },
    { icon: Calendar, text: 'נהל את היומן והלקוחות שלך' },
    { icon: Shield, text: 'עקוב אחר ההכנסות בזמן אמת' },
  ];

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10 rounded-full" />
        <div 
          className="absolute top-5 left-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500 -z-10 transition-all duration-500 rounded-full"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />
        
        {STEPS.map((step) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          
          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              <div 
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                  isCompleted 
                    ? 'bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-teal-200' 
                    : isActive 
                      ? 'bg-gradient-to-br from-teal-500 to-emerald-500 text-white ring-4 ring-teal-100 shadow-teal-300' 
                      : 'bg-white border-2 border-gray-200 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <span className="text-lg">✓</span>
                ) : (
                  <span className="text-lg">{step.emoji}</span>
                )}
              </div>
              <div className="mt-2 text-center">
                <div className={`text-xs sm:text-sm font-semibold ${isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                  {step.title}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-400 hidden sm:block">{step.description}</div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="sm:hidden text-center mt-4 bg-teal-50 rounded-lg py-2 px-3">
        <div className="text-base font-bold text-teal-700">{STEPS[currentStep - 1].emoji} {STEPS[currentStep - 1].title}</div>
        <div className="text-xs text-teal-600">{STEPS[currentStep - 1].description}</div>
      </div>
    </div>
  );

  const renderLoginForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 bg-white text-gray-700 border-2 border-gray-200 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
        >
          <GoogleIcon />
          <span className="font-medium text-sm">Google</span>
        </button>
        <button
          type="button"
          onClick={handleAppleAuth}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50"
        >
          <AppleIcon />
          <span className="font-medium text-sm">Apple</span>
        </button>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative bg-white px-4 text-sm text-gray-500">או עם אימייל</div>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">אימייל מקצועי</label>
          <div className="relative">
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all"
              placeholder="your@email.com"
              dir="ltr"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">סיסמה</label>
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full pr-10 pl-12 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all"
              placeholder="••••••••"
              dir="ltr"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700">זכור אותי</span>
          </label>
          <button type="button" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
            שכחת סיסמה?
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-3.5 rounded-xl font-medium hover:from-teal-600 hover:to-emerald-600 transition-all disabled:opacity-50 shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'התחבר'
          )}
        </button>
      </form>

      <button
        type="button"
        onClick={demoLogin}
        className="w-full border-2 border-teal-500 text-teal-600 py-3 rounded-xl font-medium hover:bg-teal-50 transition-colors flex items-center justify-center gap-2"
      >
        <Smartphone className="w-5 h-5" />
        השתמש בחשבון דמו
      </button>

      <div className="pt-6 border-t border-gray-100">
        <div className="text-sm text-gray-700 mb-4 font-medium">יתרונות אזור המקצוענים:</div>
        <div className="space-y-3">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-gray-600 text-sm">{benefit.text}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderStepOne = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleGoogleAuth}
          className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          <GoogleIcon />
          <span className="font-medium text-gray-700">Google</span>
        </button>
        <button
          type="button"
          onClick={handleAppleAuth}
          className="flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-all"
        >
          <AppleIcon />
          <span className="font-medium">Apple</span>
        </button>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative bg-white px-4 text-sm text-gray-500">או עם אימייל</div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">אימייל מקצועי *</label>
          <div className="relative">
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              {...stepOneForm.register('email')}
              className={`w-full pr-10 pl-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                stepOneForm.formState.errors.email 
                  ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                  : 'border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100'
              }`}
              placeholder="your@email.com"
              dir="ltr"
            />
          </div>
          {stepOneForm.formState.errors.email && (
            <p className="mt-1 text-sm text-red-500">{stepOneForm.formState.errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">מספר טלפון *</label>
          <div className="relative">
            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              {...stepOneForm.register('phone')}
              className={`w-full pr-10 pl-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                stepOneForm.formState.errors.phone 
                  ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                  : 'border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100'
              }`}
              placeholder="050-1234567"
              dir="ltr"
            />
          </div>
          {stepOneForm.formState.errors.phone && (
            <p className="mt-1 text-sm text-red-500">{stepOneForm.formState.errors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">סיסמה *</label>
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              {...stepOneForm.register('password')}
              className={`w-full pr-10 pl-12 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                stepOneForm.formState.errors.password 
                  ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                  : 'border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100'
              }`}
              placeholder="לפחות 8 תווים"
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {stepOneForm.formState.errors.password && (
            <p className="mt-1 text-sm text-red-500">{stepOneForm.formState.errors.password.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">חייב להכיל לפחות 8 תווים, אות גדולה וספרה</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">אימות סיסמה *</label>
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              {...stepOneForm.register('confirmPassword')}
              className={`w-full pr-10 pl-12 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                stepOneForm.formState.errors.confirmPassword 
                  ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                  : 'border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100'
              }`}
              placeholder="הזן סיסמה שוב"
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {stepOneForm.formState.errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">{stepOneForm.formState.errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex items-start gap-3 pt-2">
          <input
            type="checkbox"
            {...stepOneForm.register('acceptTerms')}
            className="mt-1 w-5 h-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
          />
          <label className="text-sm text-gray-600">
            אני מסכים/ה ל<a href="#" className="text-teal-600 hover:underline">תנאי השימוש</a> ו<a href="#" className="text-teal-600 hover:underline">מדיניות הפרטיות</a> של Beedy
          </label>
        </div>
        {stepOneForm.formState.errors.acceptTerms && (
          <p className="text-sm text-red-500">{stepOneForm.formState.errors.acceptTerms.message}</p>
        )}
      </div>
    </motion.div>
  );

  const renderStepTwo = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div 
            className="w-28 h-28 rounded-full bg-gradient-to-r from-teal-100 to-emerald-100 flex items-center justify-center border-4 border-white shadow-lg cursor-pointer overflow-hidden"
            onClick={() => fileInputRef.current?.click()}
          >
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-10 h-10 text-gray-400" />
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-teal-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleProfileImageUpload}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">שם מלא *</label>
          <div className="relative">
            <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              {...stepTwoForm.register('fullName')}
              className={`w-full pr-10 pl-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                stepTwoForm.formState.errors.fullName 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100'
              }`}
              placeholder="השם המלא שלך"
            />
          </div>
          {stepTwoForm.formState.errors.fullName && (
            <p className="mt-1 text-sm text-red-500">{stepTwoForm.formState.errors.fullName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">שם העסק (אופציונלי)</label>
          <div className="relative">
            <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              {...stepTwoForm.register('businessName')}
              className="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all"
              placeholder="שם העסק שלך"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">תיאור קצר *</label>
          <textarea
            {...stepTwoForm.register('bio')}
            rows={4}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all resize-none ${
              stepTwoForm.formState.errors.bio 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100'
            }`}
            placeholder="ספר/י על עצמך, הניסיון שלך והשירותים שאת/ה מציע/ה..."
          />
          <div className="flex justify-between mt-1">
            {stepTwoForm.formState.errors.bio && (
              <p className="text-sm text-red-500">{stepTwoForm.formState.errors.bio.message}</p>
            )}
            <p className="text-xs text-gray-400 mr-auto">
              {stepTwoForm.watch('bio')?.length || 0}/500
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">עיר *</label>
            <div className="relative">
              <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                {...stepTwoForm.register('city')}
                className={`w-full pr-10 pl-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                  stepTwoForm.formState.errors.city 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100'
                }`}
                placeholder="תל אביב"
              />
            </div>
            {stepTwoForm.formState.errors.city && (
              <p className="mt-1 text-sm text-red-500">{stepTwoForm.formState.errors.city.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">רדיוס שירות (ק"מ)</label>
            <Controller
              name="serviceRadius"
              control={stepTwoForm.control}
              render={({ field }) => (
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                  <div className="text-center mt-2 text-lg font-semibold text-teal-600">
                    {field.value} ק"מ
                  </div>
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderStepThree = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">קטגוריות שירות * (בחר לפחות אחת)</label>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
          {SERVICE_CATEGORIES.map(cat => {
            const isSelected = stepThreeForm.watch('categories')?.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  isSelected
                    ? 'border-teal-500 bg-teal-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-1">{cat.icon}</div>
                <div className={`text-xs font-medium ${isSelected ? 'text-teal-700' : 'text-gray-600'}`}>
                  {cat.name}
                </div>
              </button>
            );
          })}
        </div>
        {stepThreeForm.formState.errors.categories && (
          <p className="mt-2 text-sm text-red-500">{stepThreeForm.formState.errors.categories.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">יכולות מיוחדות (אופציונלי)</label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all"
            placeholder="הוסף יכולת מיוחדת..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomSkill();
              }
            }}
          />
          <button
            type="button"
            onClick={addCustomSkill}
            className="px-4 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(stepThreeForm.watch('customSkills') || []).map(skill => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeCustomSkill(skill)}
                className="hover:text-emerald-900"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">תעריף שעתי (₪) *</label>
          <Controller
            name="hourlyRate"
            control={stepThreeForm.control}
            render={({ field }) => (
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₪</span>
                <input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  className="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all"
                  min={50}
                />
              </div>
            )}
          />
          {stepThreeForm.formState.errors.hourlyRate && (
            <p className="mt-1 text-sm text-red-500">{stepThreeForm.formState.errors.hourlyRate.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">שנות ניסיון</label>
          <Controller
            name="experienceYears"
            control={stepThreeForm.control}
            render={({ field }) => (
              <div className="relative">
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  className="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all"
                  min={0}
                  max={50}
                />
              </div>
            )}
          />
        </div>
      </div>

      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex gap-3">
        <Sparkles className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-teal-800">
          <p className="font-medium mb-1">טיפ מקצועי</p>
          <p>מקצוענים עם תיאור מפורט ותעריפים שקופים מקבלים עד 40% יותר הזמנות!</p>
        </div>
      </div>
    </motion.div>
  );

  const renderStepFour = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            פורטפוליו - עבודות קודמות (עד 5 תמונות)
          </div>
        </label>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {portfolioImages.map((img, idx) => (
            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
              <img src={img} alt={`Portfolio ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePortfolioImage(idx)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {portfolioImages.length < 5 && (
            <button
              type="button"
              onClick={() => portfolioInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 hover:border-teal-500 hover:bg-teal-50 transition-all"
            >
              <Upload className="w-6 h-6 text-gray-400" />
              <span className="text-xs text-gray-500">העלה תמונה</span>
            </button>
          )}
        </div>
        <input
          ref={portfolioInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handlePortfolioUpload}
        />
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Award className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <label className="block text-sm font-medium text-amber-800 mb-2">תעודות והסמכות (אופציונלי)</label>
            <p className="text-xs text-amber-700 mb-3">העלאת תעודות מקצועיות תעזור לבנות אמון עם לקוחות</p>
            <button
              type="button"
              onClick={() => certInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-amber-300 rounded-lg text-amber-700 hover:bg-amber-50 transition-colors text-sm font-medium"
            >
              <FileCheck className="w-4 h-4" />
              {certificationFile ? 'קובץ הועלה ✓' : 'העלה תעודה/הסמכה'}
            </button>
            <input
              ref={certInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleCertUpload}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">ימי זמינות</label>
        <div className="flex flex-wrap gap-2">
          {DAYS_OF_WEEK.map(day => {
            const isSelected = stepFourForm.watch('availabilityDays')?.includes(day.id);
            return (
              <button
                key={day.id}
                type="button"
                onClick={() => toggleAvailabilityDay(day.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {day.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
        <div className="flex items-center gap-3">
          <BadgeCheck className="w-6 h-6 text-emerald-600" />
          <div>
            <div className="font-medium text-emerald-800">מקבל/ת לקוחות חדשים</div>
            <div className="text-xs text-emerald-600">הפרופיל שלך יוצג בתוצאות החיפוש</div>
          </div>
        </div>
        <Controller
          name="acceptingClients"
          control={stepFourForm.control}
          render={({ field }) => (
            <button
              type="button"
              onClick={() => field.onChange(!field.value)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                field.value ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  field.value ? 'right-0.5' : 'right-7'
                }`}
              />
            </button>
          )}
        />
      </div>

      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex gap-3">
        <Star className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-teal-800">
          <p className="font-medium mb-1">כמעט סיימנו!</p>
          <p>לאחר ההרשמה, הצוות שלנו יבדוק את הפרופיל שלך. תקבל/י אישור תוך 24 שעות.</p>
        </div>
      </div>
    </motion.div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStepOne();
      case 2: return renderStepTwo();
      case 3: return renderStepThree();
      case 4: return renderStepFour();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700" dir="rtl">
      <div className="bg-white sticky top-0 z-50 shadow-md border-b border-gray-100">
        <div className="max-w-4xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToLanding}
              className="flex items-center gap-2 text-gray-800 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
            >
              <BeadyLogo size="md" />
            </button>
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-800 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-800" />
              <span className="text-gray-800 font-medium">חזרה</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🚀</span>
            </div>
            <div>
              <div className="font-bold text-gray-900">אזור מקצוענים</div>
              <div className="text-xs text-gray-500">Beedy Pro</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 py-4 text-center font-medium transition-all ${
                mode === 'login'
                  ? 'text-teal-600 bg-teal-50 border-b-2 border-teal-500'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              התחברות
            </button>
            <button
              onClick={() => switchMode('register')}
              className={`flex-1 py-4 text-center font-medium transition-all ${
                mode === 'register'
                  ? 'text-teal-600 bg-teal-50 border-b-2 border-teal-500'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              הרשמה חדשה
            </button>
          </div>

          <div className="p-6 md:p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl transform rotate-3 border-2 border-white/30">
                <span className="text-5xl">🚀</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {mode === 'login' ? 'התחברות מקצוענים' : 'הצטרף כמקצוען Beedy'}
              </h1>
              <p className="text-gray-600">
                {mode === 'login' ? 'גישה ללוח הבקרה שלך' : 'התחל לקבל עבודות היום'}
              </p>
            </div>

            {mode === 'register' && renderStepIndicator()}
            
            <AnimatePresence mode="wait">
              {mode === 'login' ? renderLoginForm() : renderCurrentStep()}
            </AnimatePresence>

            {mode === 'register' && (
              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowRight className="w-5 h-5" />
                    הקודם
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={isSubmitting}
                  className={`flex-1 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-medium hover:from-teal-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                    currentStep === 1 ? 'w-full' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : currentStep === 4 ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      סיים הרשמה
                    </>
                  ) : (
                    <>
                      הבא
                      <ArrowLeft className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-white/70 text-sm">
            בעיה בכניסה? <a href="#" className="text-white hover:underline">צור קשר עם התמיכה</a>
          </p>
        </div>
      </div>
    </div>
  );
}
