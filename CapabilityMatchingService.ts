/**
 * CapabilityMatchingService
 * 
 * Service de matching intelligent entre les demandes de services (avec leurs spécificités)
 * et les compétences des professionnels.
 * 
 * Architecture:
 * 1. Catégories générales (plumbing, electrical, cleaning, etc.)
 * 2. Sous-problèmes/spécificités de chaque catégorie (leak, clog, outlet, etc.)
 * 3. Compétences des professionnels (leak_repair, drain_cleaning, outlet_install, etc.)
 * 4. Niveaux de compétence (basic, intermediate, expert)
 */

// Types
export type ServiceCategory = 'plumbing' | 'electrical' | 'cleaning' | 'beauty' | 'locksmith' | 'appliances' | 'renovation' | 'gardening' | 'ac' | 'painting' | 'moving';

export type ProficiencyLevel = 'basic' | 'intermediate' | 'expert';

export interface ProfessionalCapability {
  id: string;
  name: string;
  category: ServiceCategory;
  proficiency: ProficiencyLevel;
  isFavorite?: boolean;
}

export interface ServiceRequirement {
  category: ServiceCategory;
  subProblem?: string;
  complexity?: 'standard' | 'complex' | 'critical';
  urgency?: 'immediate' | 'planned';
  description?: string;
}

export interface MatchResult {
  providerId: string;
  providerName: string;
  matchScore: number; // 0-100
  matchedCapabilities: string[];
  proficiencyBonus: number;
  urgencyBonus: number;
  matchReasons: string[];
}

// Mapping des sous-problèmes utilisateur vers les compétences professionnelles
// Format: { [category]: { [subProblem]: capabilityIds[] } }
const SUBPROBLEM_TO_CAPABILITIES: Record<string, Record<string, string[]>> = {
  plumbing: {
    leak: ['leak_repair', 'pipe_replacement', 'emergency'],
    clog: ['drain_cleaning', 'emergency'],
    installation: ['toilet_install', 'faucet_repair', 'shower_install', 'sink_install', 'washing_machine', 'dishwasher'],
    water_heater: ['water_heater', 'emergency'],
    renovation: ['renovation', 'pipe_replacement', 'shower_install', 'sink_install', 'toilet_install'],
  },
  electrical: {
    outlet: ['outlet_install', 'wiring'],
    lighting: ['light_fixtures', 'wiring'],
    panel: ['panel_repair', 'circuit_breaker', 'inspection'],
    wiring: ['wiring', 'inspection'],
    ac: ['ac_install'],
    smart_home: ['smart_home', 'wiring', 'outlet_install'],
    emergency: ['emergency_electrical'],
  },
  cleaning: {
    deep_cleaning: ['deep_clean', 'carpet_clean', 'window_clean', 'kitchen_clean'],
    regular_cleaning: ['regular_clean', 'kitchen_clean'],
    move_in_out: ['move_out', 'deep_clean', 'window_clean'],
    post_construction: ['post_construction', 'window_clean'],
    office: ['office_clean', 'regular_clean'],
  },
  beauty: {
    hair: ['haircut', 'coloring'],
    nails: ['manicure', 'pedicure'],
    makeup: ['makeup'],
    skincare: ['facial'],
    massage: ['massage'],
    waxing: ['waxing'],
  },
  locksmith: {
    lock_open: ['lock_open', 'emergency_lock'],
    lock_replace: ['lock_replace'],
    key_copy: ['key_copy'],
    safe: ['safe_open'],
    car: ['car_lockout', 'emergency_lock'],
  },
  appliances: {
    fridge: ['fridge_repair'],
    washer: ['washer_repair'],
    dryer: ['dryer_repair'],
    oven: ['oven_repair'],
    dishwasher: ['dishwasher_repair'],
    ac: ['ac_repair'],
    microwave: ['microwave_repair'],
  },
  ac: {
    installation: ['ac_install'],
    repair: ['ac_repair'],
    maintenance: ['ac_maintenance'],
    emergency: ['ac_repair', 'ac_emergency'],
  },
  renovation: {
    bathroom: ['renovation'],
    painting: ['painting'],
    tiling: ['tiling'],
    drywall: ['drywall'],
    general: ['renovation', 'painting', 'tiling', 'drywall'],
  },
};

// Cross-category capability mapping: maps capability IDs to their compatible categories
// This allows matching capabilities that may be categorized under related categories
const CROSS_CATEGORY_CAPABILITIES: Record<string, ServiceCategory[]> = {
  ac_install: ['ac', 'electrical'],
  ac_repair: ['ac', 'appliances'],
  ac_maintenance: ['ac', 'appliances'],
  ac_emergency: ['ac', 'electrical'],
  emergency_electrical: ['electrical', 'ac'],
};

// Labels en hébreu pour les catégories
export const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  plumbing: 'אינסטלציה',
  electrical: 'חשמל',
  cleaning: 'ניקיון',
  beauty: 'יופי וטיפוח',
  locksmith: 'מסגרות',
  appliances: 'מכשירי חשמל',
  renovation: 'שיפוצים',
  gardening: 'גינון',
  ac: 'מיזוג אוויר',
  painting: 'צביעה',
  moving: 'הובלות',
};

// Labels en hébreu pour les capacités
export const CAPABILITY_LABELS: Record<string, string> = {
  // Plumbing
  leak_repair: 'תיקון נזילות',
  drain_cleaning: 'פתיחת סתימות',
  toilet_install: 'התקנת אסלות',
  faucet_repair: 'תיקון ברזים',
  pipe_replacement: 'החלפת צנרת',
  water_heater: 'דודי שמש וחימום',
  shower_install: 'התקנת מקלחונים',
  sink_install: 'התקנת כיורים',
  washing_machine: 'חיבור מכונות כביסה',
  dishwasher: 'חיבור מדיחי כלים',
  emergency: 'קריאות חירום',
  renovation: 'שיפוץ חדרי רחצה',
  // Electrical
  outlet_install: 'התקנת שקעים',
  light_fixtures: 'התקנת גופי תאורה',
  panel_repair: 'תיקון לוח חשמל',
  circuit_breaker: 'החלפת נתיכים',
  wiring: 'חיווט חשמלי',
  ac_install: 'התקנת מזגנים',
  smart_home: 'בית חכם',
  emergency_electrical: 'קריאות חירום חשמל',
  inspection: 'בדיקות חשמל',
  // Cleaning
  deep_clean: 'ניקיון יסודי',
  regular_clean: 'ניקיון שוטף',
  post_construction: 'ניקיון לאחר שיפוץ',
  carpet_clean: 'ניקוי שטיחים',
  window_clean: 'ניקוי חלונות',
  kitchen_clean: 'ניקיון מטבחים',
  office_clean: 'ניקיון משרדים',
  move_out: 'ניקיון לפני/אחרי מעבר דירה',
  // Beauty
  haircut: 'תספורת',
  coloring: 'צביעת שיער',
  manicure: 'מניקור',
  pedicure: 'פדיקור',
  makeup: 'איפור',
  waxing: 'הסרת שיער',
  massage: 'עיסוי',
  facial: 'טיפולי פנים',
  // Locksmith
  lock_open: 'פתיחת דלתות נעולות',
  lock_replace: 'החלפת מנעולים',
  key_copy: 'שכפול מפתחות',
  safe_open: 'פתיחת כספות',
  car_lockout: 'פתיחת רכבים',
  emergency_lock: 'קריאות חירום',
  // Appliances
  fridge_repair: 'תיקון מקררים',
  washer_repair: 'תיקון מכונות כביסה',
  dryer_repair: 'תיקון מייבשים',
  oven_repair: 'תיקון תנורים',
  dishwasher_repair: 'תיקון מדיחי כלים',
  ac_repair: 'תיקון מזגנים',
  ac_maintenance: 'תחזוקת מזגנים',
  ac_emergency: 'קריאות חירום מזגנים',
  microwave_repair: 'תיקון מיקרוגל',
};

// Score weights
const PROFICIENCY_SCORES: Record<ProficiencyLevel, number> = {
  basic: 60,
  intermediate: 80,
  expert: 100,
};

const COMPLEXITY_MULTIPLIER: Record<string, number> = {
  standard: 1.0,
  complex: 1.1,
  critical: 1.2,
};

/**
 * Trouve les compétences requises pour une demande de service
 */
export function getRequiredCapabilities(requirement: ServiceRequirement): string[] {
  const categoryMapping = SUBPROBLEM_TO_CAPABILITIES[requirement.category];
  
  if (!categoryMapping) {
    return [];
  }
  
  if (requirement.subProblem && categoryMapping[requirement.subProblem]) {
    return categoryMapping[requirement.subProblem];
  }
  
  // Si pas de sous-problème spécifique, retourner toutes les compétences de la catégorie
  const allCapabilities = new Set<string>();
  Object.values(categoryMapping).forEach(caps => {
    caps.forEach(cap => allCapabilities.add(cap));
  });
  
  return Array.from(allCapabilities);
}

/**
 * Calcule le score de correspondance entre une demande et les compétences d'un professionnel
 */
export function calculateMatchScore(
  requirement: ServiceRequirement,
  professionalCapabilities: ProfessionalCapability[]
): { score: number; matchedCapabilities: string[]; reasons: string[] } {
  const requiredCapabilities = getRequiredCapabilities(requirement);
  const matchedCapabilities: string[] = [];
  const reasons: string[] = [];
  
  if (requiredCapabilities.length === 0) {
    // Matching générique par catégorie
    const categoryMatch = professionalCapabilities.filter(
      cap => cap.category === requirement.category
    );
    
    if (categoryMatch.length > 0) {
      const avgProficiency = categoryMatch.reduce(
        (sum, cap) => sum + PROFICIENCY_SCORES[cap.proficiency], 0
      ) / categoryMatch.length;
      
      reasons.push(`מתאים לקטגוריית ${CATEGORY_LABELS[requirement.category]}`);
      return {
        score: avgProficiency * 0.7, // Score réduit pour matching générique
        matchedCapabilities: categoryMatch.map(c => c.id),
        reasons,
      };
    }
    
    return { score: 0, matchedCapabilities: [], reasons: ['אין התאמה לקטגוריה'] };
  }
  
  // Helper to check if capability matches the required category (including cross-category)
  const isCompatibleCategory = (capId: string, capCategory: ServiceCategory, reqCategory: ServiceCategory): boolean => {
    if (capCategory === reqCategory) return true;
    const crossCategories = CROSS_CATEGORY_CAPABILITIES[capId];
    if (crossCategories) {
      return crossCategories.includes(reqCategory);
    }
    return false;
  };

  // Calcul du score basé sur les compétences matchées
  let totalScore = 0;
  let matchCount = 0;
  
  for (const requiredCap of requiredCapabilities) {
    const matchingCap = professionalCapabilities.find(
      cap => cap.id === requiredCap && isCompatibleCategory(cap.id, cap.category, requirement.category)
    );
    
    if (matchingCap) {
      matchedCapabilities.push(requiredCap);
      const profScore = PROFICIENCY_SCORES[matchingCap.proficiency];
      totalScore += profScore;
      matchCount++;
      
      if (matchingCap.proficiency === 'expert') {
        reasons.push(`מומחה ב${CAPABILITY_LABELS[requiredCap] || requiredCap}`);
      } else if (matchingCap.isFavorite) {
        reasons.push(`מתמחה ב${CAPABILITY_LABELS[requiredCap] || requiredCap}`);
      }
    }
  }
  
  if (matchCount === 0) {
    return { score: 0, matchedCapabilities: [], reasons: ['אין התאמה לדרישות'] };
  }
  
  // Score de base: moyenne des scores des compétences matchées
  let baseScore = totalScore / matchCount;
  
  // Bonus pour couverture complète des compétences requises
  const coverageRatio = matchCount / requiredCapabilities.length;
  baseScore *= coverageRatio;
  
  // Bonus pour complexité si le pro a les compétences d'expert
  if (requirement.complexity) {
    const hasExpert = matchedCapabilities.some(capId => {
      const cap = professionalCapabilities.find(c => c.id === capId);
      return cap?.proficiency === 'expert';
    });
    
    if (hasExpert && (requirement.complexity === 'complex' || requirement.complexity === 'critical')) {
      baseScore *= COMPLEXITY_MULTIPLIER[requirement.complexity];
      reasons.push('מתאים לעבודות מורכבות');
    }
  }
  
  // Bonus pour urgence si le pro a des compétences d'urgence
  if (requirement.urgency === 'immediate') {
    const hasEmergency = matchedCapabilities.some(capId => 
      capId.includes('emergency') || professionalCapabilities.find(c => c.id === capId)?.isFavorite
    );
    
    if (hasEmergency) {
      baseScore *= 1.15;
      reasons.push('זמין לקריאות דחופות');
    }
  }
  
  // Normaliser le score à 0-100
  const finalScore = Math.min(100, Math.round(baseScore));
  
  if (coverageRatio >= 0.8) {
    reasons.push('התאמה גבוהה לדרישות');
  } else if (coverageRatio >= 0.5) {
    reasons.push('התאמה חלקית לדרישות');
  }
  
  return {
    score: finalScore,
    matchedCapabilities,
    reasons,
  };
}

/**
 * Trie et filtre les professionnels par pertinence pour une demande
 */
export function matchProfessionals(
  requirement: ServiceRequirement,
  professionals: Array<{
    id: string;
    name: string;
    capabilities: ProfessionalCapability[];
    rating?: number;
    completedJobs?: number;
  }>,
  minScore: number = 30
): MatchResult[] {
  const results: MatchResult[] = [];
  
  for (const pro of professionals) {
    const { score, matchedCapabilities, reasons } = calculateMatchScore(
      requirement,
      pro.capabilities
    );
    
    if (score >= minScore) {
      // Bonus pour rating et expérience
      let adjustedScore = score;
      
      if (pro.rating && pro.rating >= 4.5) {
        adjustedScore += 5;
        reasons.push(`דירוג ${pro.rating} כוכבים`);
      }
      
      if (pro.completedJobs && pro.completedJobs >= 100) {
        adjustedScore += 3;
        reasons.push(`${pro.completedJobs}+ עבודות שהושלמו`);
      }
      
      results.push({
        providerId: pro.id,
        providerName: pro.name,
        matchScore: Math.min(100, adjustedScore),
        matchedCapabilities,
        proficiencyBonus: Math.round(score * 0.1),
        urgencyBonus: requirement.urgency === 'immediate' ? 10 : 0,
        matchReasons: reasons,
      });
    }
  }
  
  // Trier par score décroissant
  return results.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Vérifie si un professionnel peut répondre à une demande (matching de base)
 */
export function canHandleRequest(
  requirement: ServiceRequirement,
  professionalCapabilities: ProfessionalCapability[]
): boolean {
  // Helper to check if capability is compatible with category (including cross-category)
  const isCompatibleCategory = (cap: ProfessionalCapability, reqCategory: ServiceCategory): boolean => {
    if (cap.category === reqCategory) return true;
    const crossCategories = CROSS_CATEGORY_CAPABILITIES[cap.id];
    if (crossCategories) {
      return crossCategories.includes(reqCategory);
    }
    return false;
  };

  // Vérifier d'abord la catégorie
  const hasCategory = professionalCapabilities.some(
    cap => isCompatibleCategory(cap, requirement.category)
  );
  
  if (!hasCategory) {
    return false;
  }
  
  // Si pas de sous-problème spécifique, accepter si catégorie match
  if (!requirement.subProblem) {
    return true;
  }
  
  // Vérifier les compétences spécifiques
  const requiredCapabilities = getRequiredCapabilities(requirement);
  
  if (requiredCapabilities.length === 0) {
    return true; // Pas de requirements spécifiques
  }
  
  // Au moins une compétence requise doit matcher
  return requiredCapabilities.some(reqCap =>
    professionalCapabilities.some(proCap => proCap.id === reqCap)
  );
}

/**
 * Extrait les requirements d'une demande de service (Job)
 */
export function extractRequirementsFromJob(job: {
  serviceData: {
    category: string;
    subcategory?: string;
    complexity?: 'standard' | 'complex' | 'critical';
    aiDescription?: string;
    urgencyLevel?: string;
  };
}): ServiceRequirement {
  // Mapper la catégorie au format attendu
  const categoryMap: Record<string, ServiceCategory> = {
    plumbing: 'plumbing',
    electrical: 'electrical',
    cleaning: 'cleaning',
    beauty: 'beauty',
    locksmith: 'locksmith',
    appliances: 'appliances',
    renovation: 'renovation',
    gardening: 'gardening',
    ac: 'ac',
    painting: 'painting',
    moving: 'moving',
  };
  
  const category = categoryMap[job.serviceData.category] || 'plumbing';
  
  // Priorité 1: Utiliser le champ subcategory s'il existe (données structurées de SmartDataCollection)
  let subProblem: string | undefined = job.serviceData.subcategory;
  
  // Priorité 2: Si pas de subcategory, analyser la description pour identifier le sous-problème (fallback)
  if (!subProblem) {
    const description = (job.serviceData.aiDescription || '').toLowerCase();
    
    if (category === 'plumbing') {
      if (description.includes('נזילה') || description.includes('leak')) subProblem = 'leak';
      else if (description.includes('סתימה') || description.includes('clog')) subProblem = 'clog';
      else if (description.includes('התקנ') || description.includes('install')) subProblem = 'installation';
      else if (description.includes('דוד') || description.includes('heater')) subProblem = 'water_heater';
    } else if (category === 'electrical') {
      if (description.includes('שקע') || description.includes('outlet')) subProblem = 'outlet';
      else if (description.includes('תאור') || description.includes('light')) subProblem = 'lighting';
      else if (description.includes('לוח') || description.includes('panel')) subProblem = 'panel';
      else if (description.includes('חיווט') || description.includes('wiring')) subProblem = 'wiring';
    } else if (category === 'cleaning') {
      if (description.includes('יסודי') || description.includes('deep')) subProblem = 'deep_cleaning';
      else if (description.includes('שוטף') || description.includes('regular')) subProblem = 'regular_cleaning';
      else if (description.includes('מעבר') || description.includes('move')) subProblem = 'move_in_out';
      else if (description.includes('שיפוץ') || description.includes('construction')) subProblem = 'post_construction';
    } else if (category === 'beauty') {
      if (description.includes('שיער') || description.includes('תספורת') || description.includes('hair')) subProblem = 'hair';
      else if (description.includes('ציפורן') || description.includes('nail')) subProblem = 'nails';
      else if (description.includes('איפור') || description.includes('makeup')) subProblem = 'makeup';
      else if (description.includes('עיסוי') || description.includes('massage')) subProblem = 'massage';
    } else if (category === 'ac') {
      if (description.includes('התקנ') || description.includes('install')) subProblem = 'installation';
      else if (description.includes('תיקון') || description.includes('repair')) subProblem = 'repair';
      else if (description.includes('תחזוק') || description.includes('ניקוי') || description.includes('maintenance')) subProblem = 'maintenance';
    } else if (category === 'renovation') {
      if (description.includes('חדר רחצה') || description.includes('bathroom')) subProblem = 'bathroom';
      else if (description.includes('מטבח') || description.includes('kitchen')) subProblem = 'kitchen';
      else if (description.includes('צביעה') || description.includes('paint')) subProblem = 'painting';
    } else if (category === 'gardening') {
      if (description.includes('דשא') || description.includes('lawn')) subProblem = 'lawn';
      else if (description.includes('גיזום') || description.includes('prun')) subProblem = 'pruning';
      else if (description.includes('שתיל') || description.includes('plant')) subProblem = 'planting';
    } else if (category === 'painting') {
      if (description.includes('חדר') || description.includes('room')) subProblem = 'room';
      else if (description.includes('דירה') || description.includes('apartment')) subProblem = 'apartment';
    } else if (category === 'moving') {
      if (description.includes('דירה') || description.includes('apartment')) subProblem = 'apartment';
      else if (description.includes('משרד') || description.includes('office')) subProblem = 'office';
    }
  }
  
  // Mapper l'urgence
  let urgency: 'immediate' | 'planned' = 'planned';
  if (job.serviceData.urgencyLevel === 'emergency' || job.serviceData.urgencyLevel === 'urgent') {
    urgency = 'immediate';
  }
  
  // Lire la complexité directement depuis serviceData
  const complexity = job.serviceData.complexity || 'standard';
  
  return {
    category,
    subProblem,
    complexity,
    urgency,
    description: job.serviceData.aiDescription,
  };
}

export default {
  getRequiredCapabilities,
  calculateMatchScore,
  matchProfessionals,
  canHandleRequest,
  extractRequirementsFromJob,
  CATEGORY_LABELS,
  CAPABILITY_LABELS,
  SUBPROBLEM_TO_CAPABILITIES,
};
