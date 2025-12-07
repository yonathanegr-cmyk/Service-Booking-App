import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Camera, AlertCircle, Clock, CheckCircle, Video, X, Upload, Brain } from 'lucide-react';
import { ServiceRequest, Bid } from '../App';
import { generateBids } from '../utils/biddingEngine';
import { analyzeMedia } from '../utils/videoAnalysis';
import { useOrderStore } from '../stores/OrderStore';
import { useBooking } from '../context/BookingContext';

const CATEGORY_TO_SLUG: Record<string, string> = {
  'ניקיון': 'cleaning',
  'אינסטלציה': 'plumbing',
  'חשמל': 'electrical',
  'יופי': 'beauty',
  'שיפוצים': 'renovation',
  'גינון': 'gardening',
  'מיזוג אוויר': 'ac',
  'צביעה': 'painting',
  'הובלות': 'moving',
  'cleaning': 'cleaning',
  'plumbing': 'plumbing',
  'electrical': 'electrical',
  'beauty': 'beauty',
  'renovation': 'renovation',
  'gardening': 'gardening',
  'ac': 'ac',
  'painting': 'painting',
  'moving': 'moving'
};

type Question = {
  id: string;
  type: 'select' | 'multiselect' | 'photo' | 'text' | 'video';
  question: string;
  options?: { value: string; label: string; icon?: string }[];
  required: boolean;
};

const serviceQuestions: { [key: string]: Question[] } = {
  'ניקיון': [
    {
      id: 'problemDescription',
      type: 'text',
      question: 'ספרו לנו על הניקיון הנדרש',
      required: true,
    },
    {
      id: 'subProblem',
      type: 'select',
      question: 'איזה סוג ניקיון אתם צריכים?',
      options: [
        { value: 'deep_cleaning', label: 'ניקיון יסודי', icon: '🧹' },
        { value: 'regular_cleaning', label: 'ניקיון שוטף', icon: '✨' },
        { value: 'move_in_out', label: 'ניקיון מעבר דירה', icon: '📦' },
        { value: 'post_construction', label: 'ניקיון אחרי שיפוץ', icon: '🏗️' },
      ],
      required: true,
    },
    {
      id: 'complexity',
      type: 'select',
      question: 'מה גודל החלל?',
      options: [
        { value: 'standard', label: 'קטן (סטודיו - 2 חדרים)', icon: '🏠' },
        { value: 'complex', label: 'בינוני (3-4 חדרים)', icon: '🏡' },
        { value: 'critical', label: 'גדול (5+ חדרים)', icon: '🏰' },
      ],
      required: true,
    },
    {
      id: 'accessibility',
      type: 'select',
      question: 'נגישות המקום?',
      options: [
        { value: 'ground_floor', label: 'קומת קרקע', icon: '⬇️' },
        { value: 'elevator', label: 'קומה עם מעלית', icon: '🛗' },
        { value: 'no_elevator', label: 'קומה ללא מעלית', icon: '🪜' },
      ],
      required: true,
    },
    {
      id: 'duration',
      type: 'select',
      question: 'כמה שעות דרוש השירות?',
      options: [
        { value: '2', label: 'שעתיים', icon: '2️⃣' },
        { value: '3', label: '3 שעות', icon: '3️⃣' },
        { value: '4', label: '4 שעות', icon: '4️⃣' },
        { value: '5+', label: '5 שעות ומעלה', icon: '➕' },
        { value: 'unknown', label: 'לא יודע/ת (לפי הצורך)', icon: '❓' },
      ],
      required: true,
    },
    {
      id: 'urgency',
      type: 'select',
      question: 'מתי אתם צריכים את השירות?',
      options: [
        { value: 'immediate', label: 'היום / מחר', icon: '⚡' },
        { value: 'planned', label: 'השבוע', icon: '📅' },
      ],
      required: true,
    },
  ],
  'אינסטלציה': [
    {
      id: 'problemDescription',
      type: 'text',
      question: 'ספרו לנו על הבעיה',
      required: true,
    },
    {
      id: 'subProblem',
      type: 'select',
      question: 'מה הבעיה באינסטלציה?',
      options: [
        { value: 'leak', label: 'נזילה', icon: '💧' },
        { value: 'clog', label: 'סתימה', icon: '🚽' },
        { value: 'installation', label: 'התקנת ציוד', icon: '🔧' },
        { value: 'water_heater', label: 'דוד שמש/חשמל', icon: '♨️' },
      ],
      required: true,
    },
    {
      id: 'complexity',
      type: 'select',
      question: 'סוג הצנרת?',
      options: [
        { value: 'standard', label: 'גלויה / נראית לעין', icon: '👁️' },
        { value: 'complex', label: 'חצי סמויה', icon: '🔍' },
        { value: 'critical', label: 'סמויה בקיר', icon: '🧱' },
      ],
      required: true,
    },
    {
      id: 'accessibility',
      type: 'select',
      question: 'נגישות?',
      options: [
        { value: 'easy', label: 'גישה נוחה', icon: '✅' },
        { value: 'medium', label: 'גישה בינונית', icon: '⚠️' },
        { value: 'difficult', label: 'גישה קשה', icon: '🚧' },
      ],
      required: true,
    },
    {
      id: 'duration',
      type: 'select',
      question: 'כמה שעות דרוש השירות?',
      options: [
        { value: '1', label: 'שעה אחת', icon: '1️⃣' },
        { value: '2', label: 'שעתיים', icon: '2️⃣' },
        { value: '3+', label: '3 שעות ומעלה', icon: '➕' },
        { value: 'unknown', label: 'לא יודע/ת (לפי הצורך)', icon: '❓' },
      ],
      required: true,
    },
    {
      id: 'urgency',
      type: 'select',
      question: 'רמת דחיפות?',
      options: [
        { value: 'immediate', label: 'חירום (נזילה פעילה)', icon: '🚨' },
        { value: 'planned', label: 'סובל דיחוי', icon: '📅' },
      ],
      required: true,
    },
  ],
  'חשמל': [
    {
      id: 'problemDescription',
      type: 'text',
      question: 'ספרו לנו על בעיית החשמל',
      required: true,
    },
    {
      id: 'subProblem',
      type: 'select',
      question: 'איזה שירות חשמל?',
      options: [
        { value: 'outlet', label: 'שקע / מתג', icon: '🔌' },
        { value: 'lighting', label: 'תאורה', icon: '💡' },
        { value: 'panel', label: 'לוח חשמל', icon: '⚡' },
        { value: 'wiring', label: 'חיווט', icon: '🔋' },
      ],
      required: true,
    },
    {
      id: 'complexity',
      type: 'select',
      question: 'מורכבות העבודה?',
      options: [
        { value: 'standard', label: 'פשוט (החלפה)', icon: '🔧' },
        { value: 'complex', label: 'בינוני (התקנה)', icon: '⚙️' },
        { value: 'critical', label: 'מורכב (מעגל חדש)', icon: '🏗️' },
      ],
      required: true,
    },
    {
      id: 'accessibility',
      type: 'select',
      question: 'היכן הבעיה ממוקמת?',
      options: [
        { value: 'accessible', label: 'נגיש בקלות', icon: '✅' },
        { value: 'height', label: 'בגובה', icon: '🪜' },
        { value: 'hidden', label: 'מאחורי קיר/תקרה', icon: '🧱' },
      ],
      required: true,
    },
    {
      id: 'duration',
      type: 'select',
      question: 'כמה שעות דרוש השירות?',
      options: [
        { value: '1', label: 'שעה אחת', icon: '1️⃣' },
        { value: '2', label: 'שעתיים', icon: '2️⃣' },
        { value: '3+', label: '3 שעות ומעלה', icon: '➕' },
        { value: 'unknown', label: 'לא יודע/ת (לפי הצורך)', icon: '❓' },
      ],
      required: true,
    },
    {
      id: 'urgency',
      type: 'select',
      question: 'מתי אתם צריכים את השירות?',
      options: [
        { value: 'immediate', label: 'דחוף (קצר/תקלה)', icon: '🚨' },
        { value: 'planned', label: 'ניתן לתכנון', icon: '📅' },
      ],
      required: true,
    },
  ],
  'יופי': [
    {
      id: 'problemDescription',
      type: 'text',
      question: 'ספרו לנו מה אתם מחפשים',
      required: true,
    },
    {
      id: 'subProblem',
      type: 'select',
      question: 'איזה טיפול יופי אתם מחפשים?',
      options: [
        { value: 'hair', label: 'שיער (תספורת/צבע)', icon: '💇' },
        { value: 'nails', label: 'ציפורניים (מניקור/פדיקור)', icon: '💅' },
        { value: 'makeup', label: 'איפור', icon: '💄' },
        { value: 'skincare', label: 'טיפולי פנים', icon: '✨' },
        { value: 'massage', label: 'עיסוי', icon: '💆' },
        { value: 'waxing', label: 'הסרת שיער', icon: '🪒' },
      ],
      required: true,
    },
    {
      id: 'complexity',
      type: 'select',
      question: 'רמת הטיפול?',
      options: [
        { value: 'standard', label: 'בסיסי', icon: '⭐' },
        { value: 'complex', label: 'מתקדם', icon: '⭐⭐' },
        { value: 'critical', label: 'פרימיום / אירוע מיוחד', icon: '👑' },
      ],
      required: true,
    },
    {
      id: 'location',
      type: 'select',
      question: 'היכן תרצו לקבל את הטיפול?',
      options: [
        { value: 'home', label: 'אצלי בבית', icon: '🏠' },
        { value: 'salon', label: 'בסלון של המטפל/ת', icon: '💈' },
      ],
      required: true,
    },
    {
      id: 'duration',
      type: 'select',
      question: 'משך הטיפול המשוער?',
      options: [
        { value: '1', label: 'עד שעה', icon: '1️⃣' },
        { value: '2', label: '1-2 שעות', icon: '2️⃣' },
        { value: '3+', label: 'יותר משעתיים', icon: '➕' },
      ],
      required: true,
    },
    {
      id: 'urgency',
      type: 'select',
      question: 'מתי אתם צריכים את השירות?',
      options: [
        { value: 'immediate', label: 'היום / מחר', icon: '⚡' },
        { value: 'planned', label: 'השבוע הקרוב', icon: '📅' },
      ],
      required: true,
    },
  ],
  'שיפוצים': [
    {
      id: 'problemDescription',
      type: 'text',
      question: 'ספרו לנו על השיפוץ המבוקש',
      required: true,
    },
    {
      id: 'subProblem',
      type: 'select',
      question: 'איזה סוג שיפוץ אתם צריכים?',
      options: [
        { value: 'bathroom', label: 'שיפוץ חדר רחצה', icon: '🚿' },
        { value: 'kitchen', label: 'שיפוץ מטבח', icon: '🍳' },
        { value: 'room', label: 'שיפוץ חדר', icon: '🛋️' },
        { value: 'full', label: 'שיפוץ דירה שלמה', icon: '🏠' },
        { value: 'tiles', label: 'ריצוף / חיפוי', icon: '🔲' },
        { value: 'drywall', label: 'גבס / תקרות', icon: '🧱' },
      ],
      required: true,
    },
    {
      id: 'complexity',
      type: 'select',
      question: 'היקף העבודה?',
      options: [
        { value: 'standard', label: 'קטן (עד 10 מ"ר)', icon: '📏' },
        { value: 'complex', label: 'בינוני (10-30 מ"ר)', icon: '📐' },
        { value: 'critical', label: 'גדול (מעל 30 מ"ר)', icon: '🏗️' },
      ],
      required: true,
    },
    {
      id: 'materials',
      type: 'select',
      question: 'מי מספק את החומרים?',
      options: [
        { value: 'contractor', label: 'הקבלן יספק', icon: '🚚' },
        { value: 'client', label: 'אני מספק/ת', icon: '🛒' },
        { value: 'partial', label: 'חלקי (לפי סיכום)', icon: '🤝' },
      ],
      required: true,
    },
    {
      id: 'duration',
      type: 'select',
      question: 'לוח זמנים צפוי?',
      options: [
        { value: 'days', label: 'כמה ימים', icon: '📆' },
        { value: 'week', label: 'שבוע', icon: '🗓️' },
        { value: 'weeks', label: 'כמה שבועות', icon: '📅' },
        { value: 'month+', label: 'חודש ומעלה', icon: '🗃️' },
      ],
      required: true,
    },
    {
      id: 'urgency',
      type: 'select',
      question: 'מתי תרצו להתחיל?',
      options: [
        { value: 'immediate', label: 'בהקדם האפשרי', icon: '⚡' },
        { value: 'planned', label: 'גמיש / לתאם', icon: '📅' },
      ],
      required: true,
    },
  ],
  'גינון': [
    {
      id: 'problemDescription',
      type: 'text',
      question: 'ספרו לנו על עבודת הגינון',
      required: true,
    },
    {
      id: 'subProblem',
      type: 'select',
      question: 'איזה שירות גינון אתם צריכים?',
      options: [
        { value: 'lawn', label: 'כיסוח דשא', icon: '🌿' },
        { value: 'pruning', label: 'גיזום עצים/שיחים', icon: '✂️' },
        { value: 'planting', label: 'שתילה והקמת גינה', icon: '🌱' },
        { value: 'irrigation', label: 'מערכת השקיה', icon: '💧' },
        { value: 'cleanup', label: 'ניקוי וסילוק פסולת', icon: '🍂' },
        { value: 'design', label: 'עיצוב גינה', icon: '🎨' },
      ],
      required: true,
    },
    {
      id: 'complexity',
      type: 'select',
      question: 'גודל השטח?',
      options: [
        { value: 'standard', label: 'קטן (עד 50 מ"ר)', icon: '🌻' },
        { value: 'complex', label: 'בינוני (50-200 מ"ר)', icon: '🌳' },
        { value: 'critical', label: 'גדול (מעל 200 מ"ר)', icon: '🏞️' },
      ],
      required: true,
    },
    {
      id: 'frequency',
      type: 'select',
      question: 'תדירות השירות?',
      options: [
        { value: 'once', label: 'פעם אחת', icon: '1️⃣' },
        { value: 'monthly', label: 'פעם בחודש', icon: '📅' },
        { value: 'biweekly', label: 'פעמיים בחודש', icon: '🔄' },
        { value: 'weekly', label: 'פעם בשבוע', icon: '📆' },
      ],
      required: true,
    },
    {
      id: 'equipment',
      type: 'select',
      question: 'ציוד נדרש?',
      options: [
        { value: 'gardener', label: 'הגנן יביא ציוד', icon: '🧰' },
        { value: 'client', label: 'יש לי ציוד', icon: '🔧' },
      ],
      required: true,
    },
    {
      id: 'urgency',
      type: 'select',
      question: 'מתי אתם צריכים את השירות?',
      options: [
        { value: 'immediate', label: 'השבוע', icon: '⚡' },
        { value: 'planned', label: 'גמיש', icon: '📅' },
      ],
      required: true,
    },
  ],
  'מיזוג': [
    {
      id: 'problemDescription',
      type: 'text',
      question: 'ספרו לנו על בעיית המיזוג',
      required: true,
    },
    {
      id: 'subProblem',
      type: 'select',
      question: 'איזה שירות מיזוג אוויר?',
      options: [
        { value: 'installation', label: 'התקנת מזגן חדש', icon: '🆕' },
        { value: 'repair', label: 'תיקון מזגן', icon: '🔧' },
        { value: 'maintenance', label: 'ניקוי ותחזוקה', icon: '🧹' },
        { value: 'gas', label: 'מילוי גז', icon: '❄️' },
        { value: 'relocation', label: 'העברת מזגן', icon: '🚚' },
      ],
      required: true,
    },
    {
      id: 'units',
      type: 'select',
      question: 'כמה יחידות?',
      options: [
        { value: '1', label: 'יחידה אחת', icon: '1️⃣' },
        { value: '2', label: 'שתי יחידות', icon: '2️⃣' },
        { value: '3+', label: 'שלוש ומעלה', icon: '➕' },
      ],
      required: true,
    },
    {
      id: 'type',
      type: 'select',
      question: 'סוג המזגן?',
      options: [
        { value: 'split', label: 'מיני מרכזי (ספליט)', icon: '🌀' },
        { value: 'window', label: 'מזגן חלון', icon: '🪟' },
        { value: 'central', label: 'מיזוג מרכזי', icon: '🏢' },
        { value: 'unknown', label: 'לא יודע/ת', icon: '❓' },
      ],
      required: true,
    },
    {
      id: 'accessibility',
      type: 'select',
      question: 'נגישות להתקנה?',
      options: [
        { value: 'easy', label: 'קלה (קומה נמוכה)', icon: '✅' },
        { value: 'medium', label: 'בינונית (דורש סולם)', icon: '🪜' },
        { value: 'difficult', label: 'קשה (קומה גבוהה/מנוף)', icon: '🏗️' },
      ],
      required: true,
    },
    {
      id: 'urgency',
      type: 'select',
      question: 'מתי אתם צריכים את השירות?',
      options: [
        { value: 'immediate', label: 'דחוף (אין קירור)', icon: '🚨' },
        { value: 'planned', label: 'גמיש', icon: '📅' },
      ],
      required: true,
    },
  ],
  'צביעה': [
    {
      id: 'problemDescription',
      type: 'text',
      question: 'ספרו לנו על עבודת הצביעה',
      required: true,
    },
    {
      id: 'subProblem',
      type: 'select',
      question: 'מה צריך לצבוע?',
      options: [
        { value: 'room', label: 'חדר בודד', icon: '🚪' },
        { value: 'apartment', label: 'דירה שלמה', icon: '🏠' },
        { value: 'exterior', label: 'חיצוני (מרפסת/חזית)', icon: '🏢' },
        { value: 'ceiling', label: 'תקרה בלבד', icon: '⬆️' },
        { value: 'furniture', label: 'רהיטים', icon: '🪑' },
      ],
      required: true,
    },
    {
      id: 'complexity',
      type: 'select',
      question: 'גודל השטח?',
      options: [
        { value: 'standard', label: 'קטן (עד 20 מ"ר)', icon: '📏' },
        { value: 'complex', label: 'בינוני (20-60 מ"ר)', icon: '📐' },
        { value: 'critical', label: 'גדול (מעל 60 מ"ר)', icon: '🏗️' },
      ],
      required: true,
    },
    {
      id: 'preparation',
      type: 'select',
      question: 'מצב הקירות?',
      options: [
        { value: 'ready', label: 'מוכנים לצביעה', icon: '✅' },
        { value: 'minor', label: 'צריך מעט הכנה (סדקים קטנים)', icon: '🔨' },
        { value: 'major', label: 'צריך הכנה רבה (קילוף/טיח)', icon: '🧱' },
      ],
      required: true,
    },
    {
      id: 'materials',
      type: 'select',
      question: 'מי מספק את הצבע?',
      options: [
        { value: 'painter', label: 'הצבעי יספק', icon: '🎨' },
        { value: 'client', label: 'אני מספק/ת', icon: '🛒' },
      ],
      required: true,
    },
    {
      id: 'urgency',
      type: 'select',
      question: 'מתי תרצו להתחיל?',
      options: [
        { value: 'immediate', label: 'השבוע', icon: '⚡' },
        { value: 'planned', label: 'גמיש', icon: '📅' },
      ],
      required: true,
    },
  ],
  'הובלות': [
    {
      id: 'problemDescription',
      type: 'text',
      question: 'ספרו לנו על ההובלה',
      required: true,
    },
    {
      id: 'subProblem',
      type: 'select',
      question: 'איזה סוג הובלה?',
      options: [
        { value: 'apartment', label: 'מעבר דירה', icon: '🏠' },
        { value: 'office', label: 'הובלת משרד', icon: '🏢' },
        { value: 'furniture', label: 'פריט בודד (רהיט)', icon: '🛋️' },
        { value: 'appliance', label: 'מוצר חשמלי גדול', icon: '🧊' },
        { value: 'storage', label: 'העברה למחסן', icon: '📦' },
      ],
      required: true,
    },
    {
      id: 'complexity',
      type: 'select',
      question: 'כמות הפריטים?',
      options: [
        { value: 'standard', label: 'מעט (עד חדר אחד)', icon: '📦' },
        { value: 'complex', label: 'בינוני (2-3 חדרים)', icon: '📦📦' },
        { value: 'critical', label: 'הרבה (דירה שלמה)', icon: '🚛' },
      ],
      required: true,
    },
    {
      id: 'floors',
      type: 'select',
      question: 'קומות (מוצא ויעד)?',
      options: [
        { value: 'ground', label: 'קרקע - קרקע', icon: '⬇️' },
        { value: 'elevator', label: 'יש מעלית', icon: '🛗' },
        { value: 'no_elevator', label: 'ללא מעלית (סבלות)', icon: '🪜' },
      ],
      required: true,
    },
    {
      id: 'packing',
      type: 'select',
      question: 'שירותי אריזה?',
      options: [
        { value: 'none', label: 'לא צריך (ארוז מוכן)', icon: '✅' },
        { value: 'partial', label: 'אריזה חלקית', icon: '📦' },
        { value: 'full', label: 'אריזה מלאה', icon: '🎁' },
      ],
      required: true,
    },
    {
      id: 'urgency',
      type: 'select',
      question: 'מתי ההובלה?',
      options: [
        { value: 'immediate', label: 'השבוע', icon: '⚡' },
        { value: 'planned', label: 'תאריך ספציפי', icon: '📅' },
      ],
      required: true,
    },
  ],
};

// Default questions for other services
const defaultQuestions: Question[] = [
  {
    id: 'subProblem',
    type: 'text',
    question: 'תארו בקצרה את הצורך שלכם',
    required: true,
  },
  {
    id: 'complexity',
    type: 'select',
    question: 'מה גודל הפרויקט?',
    options: [
      { value: 'standard', label: 'קטן', icon: '📏' },
      { value: 'complex', label: 'בינוני', icon: '📐' },
      { value: 'critical', label: 'גדול', icon: '📊' },
    ],
    required: true,
  },
  {
    id: 'duration',
    type: 'select',
    question: 'כמה שעות דרוש השירות?',
    options: [
      { value: '2', label: 'שעתיים', icon: '2️⃣' },
      { value: '3', label: '3 שעות', icon: '3️⃣' },
      { value: '4', label: '4 שעות', icon: '4️⃣' },
      { value: '5+', label: '5 שעות ומעלה', icon: '➕' },
      { value: 'unknown', label: 'לא יודע/ת (לפי הצורך)', icon: '❓' },
    ],
    required: true,
  },
  {
    id: 'urgency',
    type: 'select',
    question: 'מתי אתם צריכים את השירות?',
    options: [
      { value: 'immediate', label: 'היום / מחר', icon: '⚡' },
      { value: 'planned', label: 'השבוע', icon: '📅' },
    ],
    required: true,
  },
];

type SmartDataCollectionProps = {
  initialCategory: string;
  initialScheduledDate?: string;
  initialScheduledHour?: string;
  initialUrgency?: 'immediate' | 'planned';
  initialLocation?: { address: string; details?: string; lat?: number; lng?: number };
  onRequestComplete: (request: ServiceRequest, bids: Bid[]) => void;
  onBack: () => void;
};

export function SmartDataCollection({ initialCategory, initialScheduledDate, initialScheduledHour, initialUrgency, initialLocation, onRequestComplete, onBack }: SmartDataCollectionProps) {
  const [storedLocation, setStoredLocation] = useState(initialLocation);
  
  const { createOrder } = useOrderStore();
  const { bookingData } = useBooking();
  
  useEffect(() => {
    if (initialLocation && !storedLocation) {
      setStoredLocation(initialLocation);
    }
  }, [initialLocation, storedLocation]);
  
  const [currentStep, setCurrentStep] = useState(0);
  
  const getInitialAnswers = () => {
    const initial: { [key: string]: any } = {};
    if (initialUrgency) {
      initial['urgency'] = initialUrgency;
    }
    if (initialScheduledDate && initialScheduledHour) {
      initial['scheduledTime'] = `${initialScheduledDate}T${initialScheduledHour}`;
    }
    return initial;
  };
  
  const [answers, setAnswers] = useState<{ [key: string]: any }>(getInitialAnswers);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const questions = serviceQuestions[initialCategory] || defaultQuestions;
  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const startVideoRecording = async (targetId?: any) => {
    setCameraError(null);
    const effectiveQuestionId = typeof targetId === 'string' ? targetId : currentQuestion.id;
    
    try {
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Votre navigateur ne supporte pas l\'accès à la caméra. Utilisez l\'option d\'import à la place.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Check if MediaRecorder is supported
      if (!window.MediaRecorder) {
        setCameraError('Enregistrement vidéo non supporté par votre navigateur. Utilisez l\'option d\'import.');
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      const recorder = new MediaRecorder(stream, { 
        mimeType: MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/mp4'
      });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        handleAnswer(effectiveQuestionId, { type: 'video', url: videoUrl, blob });
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };

      setRecordedChunks(chunks);
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      setCameraError(null);
    } catch (error: any) {
      // Only log unexpected errors (not permission errors which are normal)
      if (error.name !== 'NotAllowedError' && error.name !== 'PermissionDeniedError') {
        console.warn('Camera access issue:', error.name);
      }
      
      let errorMessage = 'Impossible d\'accéder à la caméra.';
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Permission refusée. Veuillez autoriser l\'accès à la caméra dans les paramètres de votre navigateur, puis réessayez.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = 'Aucune caméra détectée sur cet appareil. Utilisez l\'option d\'import à la place.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = 'La caméra est déjà utilisée par une autre application. Fermez les autres applications et réessayez.';
      } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
        errorMessage = 'Les paramètres de la caméra ne sont pas compatibles. Utilisez l\'option d\'import.';
      } else if (error.name === 'TypeError') {
        errorMessage = 'Erreur technique. Utilisez l\'option d\'import à la place.';
      }
      
      setCameraError(errorMessage);
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video/');
      handleAnswer(currentQuestion.id, { 
        type: isVideo ? 'video' : 'photo', 
        url, 
        blob: file 
      });
    }
  };

  const removeMedia = () => {
    handleAnswer(currentQuestion.id, null);
    if (isRecording) {
      stopVideoRecording();
    }
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsAnalyzing(true);

    // Simulate AI processing (longer if video is present)
    const processingTime = answers.media ? 4000 : 2000;
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Generate service SKU
    const serviceSKU = `${initialCategory.toUpperCase()}_${answers.subProblem || 'GENERAL'}_${answers.complexity || 'L1'}`.replace(/\s+/g, '_');

    // Perform AI analysis if media is present
    const hasVideo = !!answers.media;
    const aiAnalysis = hasVideo 
      ? analyzeMedia(
          initialCategory, 
          answers.subProblem || 'general',
          answers.complexity || 'standard',
          answers.media?.type === 'video'
        )
      : undefined;

    // Create order in OrderStore with status 'searching' for demo purposes
    // Normalize category to slug for consistent filtering across dashboards
    const categorySlug = CATEGORY_TO_SLUG[initialCategory] || initialCategory.toLowerCase();
    
    // Collect media URLs from uploaded photos/videos
    const mediaUrls: string[] = [];
    if (answers.photo) {
      const photoUrl = typeof answers.photo === 'string' ? answers.photo : answers.photo.url || answers.photo.preview || '';
      if (photoUrl) mediaUrls.push(photoUrl);
    }
    if (answers.media) {
      const mediaItem = answers.media;
      if (typeof mediaItem === 'string') {
        mediaUrls.push(mediaItem);
      } else if (mediaItem.url) {
        mediaUrls.push(mediaItem.url);
      } else if (mediaItem.preview) {
        mediaUrls.push(mediaItem.preview);
      }
    }

    const request: ServiceRequest = {
      id: `REQ-${Date.now()}`,
      category: initialCategory,
      subProblem: answers.subProblem || answers.text || '',
      complexity: answers.complexity || 'standard',
      accessibility: answers.accessibility || 'standard',
      urgency: answers.urgency || 'planned',
      photos: mediaUrls.length > 0 ? mediaUrls : undefined,
      serviceSKU,
      aiAnalysis,
      hasVideo,
      location: storedLocation ? { ...storedLocation, details: storedLocation.details || '' } : undefined,
      scheduledDate: initialScheduledDate,
      scheduledHour: initialScheduledHour,
      description: aiAnalysis?.summary || answers.problemDescription || answers.text || '',
    };

    const orderBookingData = {
      selectedCategory: categorySlug,
      selectedCategoryId: categorySlug,
      categoryIcon: null,
      address: storedLocation?.address || bookingData.address || '',
      coordinates: storedLocation?.lat && storedLocation?.lng 
        ? { lat: storedLocation.lat, lng: storedLocation.lng }
        : bookingData.coordinates,
      isAutoDetected: bookingData.isAutoDetected || false,
      additionalDetails: answers.problemDescription || answers.text || bookingData.additionalDetails || '',
      bookingType: (answers.urgency === 'immediate' ? 'now' : 'scheduled') as 'now' | 'scheduled',
      scheduledDate: initialScheduledDate || bookingData.scheduledDate || '',
      scheduledTime: initialScheduledHour || bookingData.scheduledTime || '',
      // Structured data for capability matching
      subProblem: answers.subProblem as string | undefined,
      complexity: (answers.complexity || 'standard') as 'standard' | 'complex' | 'critical',
      urgency: (answers.urgency === 'immediate' ? 'immediate' : 'planned') as 'immediate' | 'planned',
      accessibility: (answers.accessibility || 'standard') as 'standard' | 'difficult',
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined
    };
    
    try {
      await createOrder(orderBookingData, 'client_1');
    } catch (error) {
      console.warn('Failed to create order in store:', error);
    }

    // Generate bids using the bidding engine
    const generatedBids = generateBids(request, initialCategory);

    setIsAnalyzing(false);
    onRequestComplete(request, generatedBids);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const canProceed = () => {
    if (!currentQuestion.required) return true;
    const answer = answers[currentQuestion.id];
    const hasBasicAnswer = answer !== undefined && answer !== '';
    
    if (currentQuestion.type === 'text') {
      const hasMedia = answers['media'] !== undefined && answers['media'] !== null;
      return hasBasicAnswer && hasMedia;
    }
    
    return hasBasicAnswer;
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center px-6" dir="rtl">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <div className="absolute inset-0 border-4 border-white/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-white mb-4">מנתח את הבקשה שלך...</h2>
          <p className="text-white/80 mb-6">
            {answers.media ? 'הבינה המלאכותית מנתחת את התמונה/וידאו ומחפשת את המקצוענים הטובים ביותר' : 'הבינה המלאכותית מנתחת את הצורך שלך ומחפשת את המקצוענים הטובים ביותר'}
          </p>
          <div className="space-y-3">
            {answers.media ? (
              <>
                {[
                  { icon: Video, text: 'ניתוח וידאו/תמונה באמצעות ראייה ממוחשבת' },
                  { icon: Brain, text: 'זיהוי בעיות וחומרים דרושים' },
                  { icon: CheckCircle, text: 'הפקת דוח מפורט' },
                  { icon: Clock, text: 'חישוב מחירים מובטחים' },
                ].map((step, idx) => (
                  <div key={idx} className="bg-white/10 rounded-lg p-3 flex items-center gap-3 text-white">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                      <step.icon className="w-4 h-4" />
                    </div>
                    <span>{step.text}</span>
                  </div>
                ))}
              </>
            ) : (
              <>
                {['ניתוח נתונים', 'חישוב מחירים', 'חיפוש מקצוענים'].map((step, idx) => (
                  <div key={idx} className="bg-white/10 rounded-lg p-3 flex items-center gap-3 text-white">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                      {idx + 1}
                    </div>
                    <span>{step}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={handleBack}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h2>{initialCategory === 'cleaning' ? 'ניקיון' : initialCategory === 'plumbing' ? 'אינסטלציה' : initialCategory === 'electrical' ? 'חשמל' : initialCategory}</h2>
              <div className="text-gray-500">שלב {currentStep + 1} מתוך {questions.length}</div>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="mb-3">{currentQuestion.question}</h1>
            {!currentQuestion.required && (
              <div className="flex items-center gap-2 text-gray-500">
                <AlertCircle className="w-4 h-4" />
                <span>אופציונלי</span>
              </div>
            )}
          </div>

          {/* Answer Options */}
          <div className="space-y-3 mb-8">
            {currentQuestion.type === 'select' && currentQuestion.options && (
              <>
                {currentQuestion.options.map((option) => (
                  <div key={option.value} className="w-full">
                    <button
                      onClick={() => handleAnswer(currentQuestion.id, option.value)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                        answers[currentQuestion.id] === option.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      {option.icon && <span className="text-3xl">{option.icon}</span>}
                      <span className="flex-1">{option.value === 'immediate' ? 'עכשיו' : option.label}</span>
                      {answers[currentQuestion.id] === option.value && (
                        <CheckCircle className="w-6 h-6 text-blue-600" />
                      )}
                    </button>
                    
                    {/* Date Picker for "Planned" option */}
                    {answers[currentQuestion.id] === option.value && option.value === 'planned' && (
                       <div className="mt-3 bg-white border border-gray-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                          <label className="block text-sm font-bold text-gray-700 mb-2">באיזה תאריך ושעה?</label>
                          <input 
                            type="datetime-local"
                            value={answers['scheduledTime'] || ''}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            onChange={(e) => handleAnswer('scheduledTime', e.target.value)}
                            min={new Date().toISOString().slice(0, 16)}
                          />
                          {answers['scheduledTime'] && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              <span>נקבע ל: {new Date(answers['scheduledTime']).toLocaleString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          )}
                       </div>
                    )}
                  </div>
                ))}
              </>
            )}

            {currentQuestion.type === 'text' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <Brain className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-900 mb-2 text-lg">תיאור חכם בסיוע AI</h3>
                      <p className="text-blue-700 text-sm leading-relaxed mb-3">
                        המערכת החכמה שלנו תנתח את הטקסט שלך כדי להבין בדיוק מה הבעיה ולהתאים לך את אנשי המקצוע הרלוונטיים ביותר.
                      </p>
                      <div className="bg-white/50 rounded-lg p-3 text-sm text-blue-800">
                        <span className="font-bold block mb-1">איך זה עובד?</span>
                        <ul className="list-disc list-inside space-y-1 opacity-90">
                          <li>תארו את הבעיה במילים שלכם</li>
                          <li>הבינה המלאכותית תזהה את סוג התקלה והדחיפות</li>
                          <li>תקבלו הצעות מחיר מותאמות אישית תוך שניות</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <textarea
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                  placeholder="לדוגמה: יש לי נזילה בברז במטבח, המים מטפטפים גם כשהברז סגור..."
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none min-h-[160px] text-lg leading-relaxed shadow-sm"
                  dir="rtl"
                />
                
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <Brain className="w-4 h-4 text-blue-600" />
                  <span>טיפ: ככל שתפרטו יותר, הצעת המחיר תהיה מדויקת יותר</span>
                </div>

                <div className="border-t border-gray-100 my-6"></div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">חובה *</span>
                    <h3 className="font-bold text-gray-900 text-right">הוספת תמונה או וידאו</h3>
                  </div>
                  {!answers['media'] && (
                    <p className="text-sm text-red-600 text-right">* יש להעלות תמונה או וידאו כדי להמשיך</p>
                  )}
                  
                  {!answers['media'] && !isRecording && (
                    <>
                      {cameraError && (
                        <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-4 mb-4" dir="rtl">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <div className="text-orange-900 mb-1 font-bold">אין גישה למצלמה</div>
                              <div className="text-orange-700 text-sm mb-3">{cameraError}</div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setCameraError(null)}
                                  className="text-sm px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                                >
                                  נסה שוב
                                </button>
                                <button
                                  onClick={() => {
                                    setCameraError(null);
                                    fileInputRef.current?.click();
                                  }}
                                  className="text-sm px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  העלה קובץ
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => startVideoRecording('media')}
                          className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-red-600 hover:bg-red-50 transition-all flex flex-col items-center gap-3"
                        >
                          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                            <Video className="w-8 h-8 text-red-600" />
                          </div>
                          <div className="text-center">
                            <div className="mb-1 font-bold">צלם וידאו</div>
                            <div className="text-gray-500 text-sm">עם המצלמה שלך</div>
                          </div>
                        </button>

                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition-all flex flex-col items-center gap-3"
                        >
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <Upload className="w-8 h-8 text-blue-600" />
                          </div>
                          <div className="text-center">
                            <div className="mb-1 font-bold">העלה קובץ</div>
                            <div className="text-gray-500 text-sm">תמונה או וידאו</div>
                          </div>
                        </button>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            const isVideo = file.type.startsWith('video/');
                            handleAnswer('media', { 
                              type: isVideo ? 'video' : 'photo', 
                              url, 
                              blob: file 
                            });
                          }
                        }}
                      />

                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4" dir="rtl">
                        <div className="flex items-start gap-3">
                          <Video className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="text-blue-900">
                            <div className="mb-1 font-bold">למה וידאו?</div>
                            <div className="text-blue-700 text-sm">
                              וידאו קצר (15-30 שניות) עוזר למומחה להבין את הבעיה ולתת הצעת מחיר מדויקת. אין מצלמה? אפשר להעלות תמונה.
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {isRecording && (
                    <div className="bg-white border-2 border-red-500 rounded-xl p-6">
                      <div className="relative mb-4">
                        <video
                          ref={videoRef}
                          className="w-full rounded-lg bg-black"
                          autoPlay
                          muted
                          playsInline
                        />
                        <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-full">
                          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                          <span dir="rtl">מקליט...</span>
                        </div>
                      </div>
                      <button
                        onClick={stopVideoRecording}
                        className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-colors font-bold"
                      >
                        עצור הקלטה
                      </button>
                    </div>
                  )}

                  {answers['media'] && !isRecording && (
                    <div className="bg-white border-2 border-green-500 rounded-xl p-4" dir="rtl">
                      <div className="flex items-start gap-3 mb-3">
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-green-900 mb-1 font-bold">
                            {answers['media'].type === 'video' ? 'הוידאו נשמר' : 'התמונה נוספה'}
                          </div>
                          <div className="text-green-700 text-sm">
                            המומחה יוכל לראות את הקובץ כדי להעריך את העבודה
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            handleAnswer('media', null);
                            if (isRecording) stopVideoRecording();
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <X className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>
                      
                      {answers['media'].type === 'video' ? (
                        <video
                          src={answers['media'].url}
                          controls
                          className="w-full rounded-lg bg-black"
                        />
                      ) : (
                        <img
                          src={answers['media'].url}
                          alt="Preview"
                          className="w-full rounded-lg"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentQuestion.type === 'photo' && (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-600 transition-colors cursor-pointer">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <div className="mb-2">Prendre une photo</div>
                <div className="text-gray-500">Aide l'IA à mieux estimer le travail</div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleAnswer(currentQuestion.id, URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                />
              </div>
            )}

            {currentQuestion.type === 'video' && (
              <div className="space-y-4">
                {!answers[currentQuestion.id] && !isRecording && (
                  <>
                    {cameraError && (
                      <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-4 mb-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="text-orange-900 mb-1">Accès caméra impossible</div>
                            <div className="text-orange-700 text-sm mb-3">{cameraError}</div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setCameraError(null)}
                                className="text-sm px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                              >
                                Réessayer
                              </button>
                              <button
                                onClick={() => {
                                  setCameraError(null);
                                  fileInputRef.current?.click();
                                }}
                                className="text-sm px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                Importer un fichier
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={startVideoRecording}
                        className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-red-600 hover:bg-red-50 transition-all flex flex-col items-center gap-3"
                      >
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                          <Video className="w-8 h-8 text-red-600" />
                        </div>
                        <div className="text-center">
                          <div className="mb-1">Filmer en direct</div>
                          <div className="text-gray-500 text-sm">Avec votre caméra</div>
                        </div>
                      </button>

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition-all flex flex-col items-center gap-3"
                      >
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                          <Upload className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="text-center">
                          <div className="mb-1">Importer</div>
                          <div className="text-gray-500 text-sm">Photo ou vidéo</div>
                        </div>
                      </button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Video className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-blue-900">
                          <div className="mb-1">Pourquoi une vidéo ?</div>
                          <div className="text-blue-700 text-sm">
                            Une courte vidéo (15-30s) permet à l'IA d'analyser précisément le problème et aux professionnels d'établir un devis exact. Pas de caméra ? Importez une photo ou vidéo existante.
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {isRecording && (
                  <div className="bg-white border-2 border-red-500 rounded-xl p-6">
                    <div className="relative mb-4">
                      <video
                        ref={videoRef}
                        className="w-full rounded-lg bg-black"
                        autoPlay
                        muted
                        playsInline
                      />
                      <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-full">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                        <span>Enregistrement...</span>
                      </div>
                    </div>
                    <button
                      onClick={stopVideoRecording}
                      className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-colors"
                    >
                      Arrêter l'enregistrement
                    </button>
                  </div>
                )}

                {answers[currentQuestion.id] && !isRecording && (
                  <div className="bg-white border-2 border-green-500 rounded-xl p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-green-900 mb-1">
                          {answers[currentQuestion.id].type === 'video' ? 'Vidéo enregistrée' : 'Photo ajoutée'}
                        </div>
                        <div className="text-green-700">
                          Le professionnel pourra voir ce fichier pour mieux évaluer votre besoin
                        </div>
                      </div>
                      <button
                        onClick={removeMedia}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <X className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                    
                    {answers[currentQuestion.id].type === 'video' ? (
                      <video
                        src={answers[currentQuestion.id].url}
                        controls
                        className="w-full rounded-lg bg-black"
                      />
                    ) : (
                      <img
                        src={answers[currentQuestion.id].url}
                        alt="Preview"
                        className="w-full rounded-lg"
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`w-full py-4 rounded-xl transition-colors ${
              canProceed()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {currentStep < questions.length - 1 ? 'הבא' : 'צפייה בהצעות'}
          </button>
        </div>
      </div>
    </div>
  );
}
