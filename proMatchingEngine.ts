export interface UserRequest {
  category: string;
  ai_description: string;
  specific_issue: string;
  accessibility: 'easy' | 'medium' | 'hard';
  user_location: { lat: number; lng: number };
  is_emergency?: boolean;
}

export interface Professional {
  id: string;
  name: string;
  image?: string;
  tags: string[];
  difficulty_tolerance: 'easy' | 'medium' | 'hard';
  rating: number;
  reviews_count: number;
  location: { lat: number; lng: number };
  response_time_minutes: number;
  emergency_mode: boolean;
  hourly_rate: number;
  years_experience: number;
  completed_jobs: number;
  specializations?: string[];
}

export interface RankedProfessional extends Professional {
  distance_km: number;
  score: number;
  match_reasons: string[];
  scores_breakdown: {
    proximity: number;
    difficulty_match: number;
    reputation: number;
    semantic_match: number;
    emergency_bonus: number;
  };
  estimated_price?: number;
}

export interface MatchingResult {
  professionals: RankedProfessional[];
  total_found: number;
  filters_applied: string[];
  is_emergency_detected: boolean;
}

const EMERGENCY_KEYWORDS = [
  'urgence', 'urgent', 'urgente', 'inondation', 'inonde', 'fuite active',
  'tout de suite', 'immédiatement', 'maintenant', 'vite', 'rapidement',
  'דחוף', 'חירום', 'הצפה', 'מציף', 'נזילה פעילה', 'עכשיו', 'מיד', 'מהר',
  'emergency', 'flooding', 'leaking', 'asap', 'immediately'
];

const SEVERITY_KEYWORDS = {
  high: ['grave', 'sérieux', 'danger', 'risque', 'קשה', 'מסוכן', 'חמור'],
  medium: ['problème', 'défaut', 'בעיה', 'תקלה'],
  low: ['petit', 'mineur', 'קטן', 'קל']
};

const ISSUE_SYNONYMS: { [key: string]: string[] } = {
  'leak': ['fuite', 'נזילה', 'nozila', 'eau', 'מים', 'goutte', 'טפטוף'],
  'clog': ['bouchon', 'סתימה', 'stima', 'bouché', 'סתום', 'drainage'],
  'installation': ['installer', 'התקנה', 'hatkana', 'nouveau', 'חדש', 'poser'],
  'water_heater': ['chauffe-eau', 'דוד', 'dud', 'boiler', 'eau chaude', 'מים חמים'],
  'outlet': ['prise', 'שקע', 'sheka', 'électrique', 'חשמלי'],
  'lighting': ['lumière', 'תאורה', 'teura', 'ampoule', 'נורה', 'lustre'],
  'panel': ['tableau', 'לוח חשמל', 'luach', 'disjoncteur', 'מפסק']
};

function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function detectEmergency(description: string): boolean {
  const lowerDesc = description.toLowerCase();
  return EMERGENCY_KEYWORDS.some(keyword => lowerDesc.includes(keyword.toLowerCase()));
}

function detectSeverity(description: string): 'high' | 'medium' | 'low' {
  const lowerDesc = description.toLowerCase();
  if (SEVERITY_KEYWORDS.high.some(k => lowerDesc.includes(k))) return 'high';
  if (SEVERITY_KEYWORDS.medium.some(k => lowerDesc.includes(k))) return 'medium';
  return 'low';
}

function calculateSemanticMatch(
  description: string,
  specificIssue: string,
  proTags: string[],
  proSpecializations?: string[]
): number {
  let score = 0;
  const lowerDesc = description.toLowerCase();
  const allProKeywords = [...proTags, ...(proSpecializations || [])].map(t => t.toLowerCase());

  if (proTags.includes(specificIssue)) {
    score += 40;
  }

  const synonyms = ISSUE_SYNONYMS[specificIssue] || [];
  const matchedSynonyms = synonyms.filter(syn => lowerDesc.includes(syn.toLowerCase()));
  score += matchedSynonyms.length * 10;

  const descWords = lowerDesc.split(/\s+/);
  const keywordMatches = descWords.filter(word => 
    allProKeywords.some(tag => tag.includes(word) || word.includes(tag))
  );
  score += Math.min(keywordMatches.length * 5, 20);

  return Math.min(score, 100);
}

function calculateProximityScore(distance_km: number, maxRadius: number = 40): number {
  if (distance_km <= 2) return 100;
  if (distance_km <= 5) return 90;
  if (distance_km <= 10) return 75;
  if (distance_km <= 20) return 50;
  if (distance_km <= 30) return 30;
  if (distance_km <= maxRadius) return 15;
  return 0;
}

function calculateDifficultyMatch(
  clientDifficulty: 'easy' | 'medium' | 'hard',
  proDifficulty: 'easy' | 'medium' | 'hard'
): { score: number; isExcluded: boolean; reason?: string } {
  const difficultyLevels = { easy: 1, medium: 2, hard: 3 };
  const clientLevel = difficultyLevels[clientDifficulty];
  const proLevel = difficultyLevels[proDifficulty];

  if (proLevel >= clientLevel) {
    const bonus = proLevel === clientLevel ? 80 : 100;
    return { 
      score: bonus, 
      isExcluded: false,
      reason: proLevel > clientLevel ? 'מומחה לעבודות מורכבות' : undefined
    };
  }

  if (clientDifficulty === 'hard' && proDifficulty === 'easy') {
    return { 
      score: 0, 
      isExcluded: true,
      reason: 'לא מטפל בעבודות מורכבות'
    };
  }

  return { 
    score: 40, 
    isExcluded: false,
    reason: 'יכול לטפל אך לא מתמחה'
  };
}

function calculateReputationScore(
  rating: number,
  reviewsCount: number,
  completedJobs: number,
  yearsExperience: number
): number {
  let score = 0;

  score += (rating / 5) * 50;

  const reviewsWeight = Math.min(reviewsCount / 100, 1) * 20;
  score += reviewsWeight;

  const jobsWeight = Math.min(completedJobs / 500, 1) * 15;
  score += jobsWeight;

  const expWeight = Math.min(yearsExperience / 10, 1) * 15;
  score += expWeight;

  return Math.min(score, 100);
}

function generateMatchReasons(
  pro: Professional,
  distance_km: number,
  scores: RankedProfessional['scores_breakdown'],
  isEmergency: boolean
): string[] {
  const reasons: string[] = [];

  if (distance_km <= 2) {
    reasons.push(`במרחק ${distance_km.toFixed(1)} ק"מ ממך`);
  } else if (distance_km <= 5) {
    reasons.push(`קרוב אליך (${distance_km.toFixed(1)} ק"מ)`);
  }

  if (pro.rating >= 4.8) {
    reasons.push(`דירוג מעולה (${pro.rating}⭐)`);
  } else if (pro.rating >= 4.5) {
    reasons.push(`דירוג גבוה (${pro.rating}⭐)`);
  }

  if (isEmergency && pro.emergency_mode) {
    reasons.push('זמין לקריאות חירום');
  }

  if (pro.response_time_minutes <= 10) {
    reasons.push('זמן תגובה מהיר (< 10 דקות)');
  }

  if (pro.difficulty_tolerance === 'hard') {
    reasons.push('מומחה לעבודות מורכבות');
  }

  if (pro.years_experience >= 10) {
    reasons.push(`ותק של ${pro.years_experience} שנים`);
  }

  if (pro.completed_jobs >= 500) {
    reasons.push(`ביצע ${pro.completed_jobs}+ עבודות`);
  }

  return reasons.slice(0, 3);
}

export function getBestPros(
  userRequest: UserRequest,
  allProfessionals: Professional[],
  options: {
    maxRadius?: number;
    limit?: number;
    includeExcluded?: boolean;
  } = {}
): MatchingResult {
  const { maxRadius = 40, limit = 10, includeExcluded = false } = options;
  const filtersApplied: string[] = [];

  const isEmergency = userRequest.is_emergency || detectEmergency(userRequest.ai_description);
  const severity = detectSeverity(userRequest.ai_description);

  let candidates = allProfessionals.map(pro => {
    const distance_km = haversineDistance(
      userRequest.user_location.lat,
      userRequest.user_location.lng,
      pro.location.lat,
      pro.location.lng
    );
    return { ...pro, distance_km };
  });

  const beforeRadiusCount = candidates.length;
  candidates = candidates.filter(pro => pro.distance_km <= maxRadius);
  if (beforeRadiusCount !== candidates.length) {
    filtersApplied.push(`סינון לפי מרחק (${maxRadius} ק"מ)`);
  }

  const beforeTagCount = candidates.length;
  candidates = candidates.filter(pro => 
    pro.tags.includes(userRequest.specific_issue) ||
    pro.tags.some(tag => {
      const synonyms = ISSUE_SYNONYMS[userRequest.specific_issue] || [];
      return synonyms.some(syn => tag.toLowerCase().includes(syn.toLowerCase()));
    })
  );
  if (beforeTagCount !== candidates.length) {
    filtersApplied.push(`סינון לפי התמחות (${userRequest.specific_issue})`);
  }

  const rankedPros: RankedProfessional[] = [];

  for (const pro of candidates) {
    const difficultyResult = calculateDifficultyMatch(
      userRequest.accessibility,
      pro.difficulty_tolerance
    );

    if (difficultyResult.isExcluded && !includeExcluded) {
      continue;
    }

    const proximityScore = calculateProximityScore(pro.distance_km, maxRadius);
    const semanticScore = calculateSemanticMatch(
      userRequest.ai_description,
      userRequest.specific_issue,
      pro.tags,
      pro.specializations
    );
    const reputationScore = calculateReputationScore(
      pro.rating,
      pro.reviews_count,
      pro.completed_jobs,
      pro.years_experience
    );

    let emergencyBonus = 0;
    if (isEmergency) {
      if (pro.emergency_mode) emergencyBonus += 15;
      if (pro.response_time_minutes <= 10) emergencyBonus += 10;
      if (pro.response_time_minutes <= 5) emergencyBonus += 5;
    }

    const scores_breakdown = {
      proximity: proximityScore,
      difficulty_match: difficultyResult.score,
      reputation: reputationScore,
      semantic_match: semanticScore,
      emergency_bonus: emergencyBonus
    };

    const weights = {
      proximity: 0.30,
      difficulty_match: 0.20,
      reputation: 0.20,
      semantic_match: 0.30
    };

    const baseScore =
      scores_breakdown.proximity * weights.proximity +
      scores_breakdown.difficulty_match * weights.difficulty_match +
      scores_breakdown.reputation * weights.reputation +
      scores_breakdown.semantic_match * weights.semantic_match;

    const finalScore = Math.min(baseScore + emergencyBonus, 100);

    const match_reasons = generateMatchReasons(pro, pro.distance_km, scores_breakdown, isEmergency);

    rankedPros.push({
      ...pro,
      score: Math.round(finalScore * 10) / 10,
      match_reasons,
      scores_breakdown,
      estimated_price: calculateEstimatedPrice(pro, userRequest, severity)
    });
  }

  rankedPros.sort((a, b) => {
    if (isEmergency) {
      const aEmergencyPriority = a.emergency_mode ? 1 : 0;
      const bEmergencyPriority = b.emergency_mode ? 1 : 0;
      if (aEmergencyPriority !== bEmergencyPriority) {
        return bEmergencyPriority - aEmergencyPriority;
      }
    }
    return b.score - a.score;
  });

  return {
    professionals: rankedPros.slice(0, limit),
    total_found: rankedPros.length,
    filters_applied: filtersApplied,
    is_emergency_detected: isEmergency
  };
}

function calculateEstimatedPrice(
  pro: Professional,
  request: UserRequest,
  severity: 'high' | 'medium' | 'low'
): number {
  let basePrice = pro.hourly_rate;

  const difficultyMultiplier = {
    easy: 1,
    medium: 1.3,
    hard: 1.6
  };
  basePrice *= difficultyMultiplier[request.accessibility];

  const severityMultiplier = {
    low: 0.9,
    medium: 1,
    high: 1.2
  };
  basePrice *= severityMultiplier[severity];

  if (request.is_emergency || detectEmergency(request.ai_description)) {
    basePrice *= 1.25;
  }

  return Math.round(basePrice / 10) * 10;
}

export function getMockProfessionals(): Professional[] {
  return [
    {
      id: 'pro-1',
      name: 'יוסי אינסטלטור',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      tags: ['leak', 'clog', 'water_heater', 'installation'],
      difficulty_tolerance: 'hard',
      rating: 4.9,
      reviews_count: 156,
      location: { lat: 32.0900, lng: 34.7750 },
      response_time_minutes: 8,
      emergency_mode: true,
      hourly_rate: 180,
      years_experience: 15,
      completed_jobs: 890,
      specializations: ['נזילות מורכבות', 'צנרת סמויה']
    },
    {
      id: 'pro-2',
      name: 'מוחמד פלמבינג',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      tags: ['leak', 'clog', 'installation'],
      difficulty_tolerance: 'medium',
      rating: 4.7,
      reviews_count: 89,
      location: { lat: 32.0820, lng: 34.7900 },
      response_time_minutes: 15,
      emergency_mode: false,
      hourly_rate: 150,
      years_experience: 8,
      completed_jobs: 420,
      specializations: ['סתימות', 'התקנות']
    },
    {
      id: 'pro-3',
      name: 'דוד השרברב',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      tags: ['leak', 'water_heater', 'installation'],
      difficulty_tolerance: 'hard',
      rating: 4.8,
      reviews_count: 234,
      location: { lat: 32.0780, lng: 34.7850 },
      response_time_minutes: 5,
      emergency_mode: true,
      hourly_rate: 200,
      years_experience: 20,
      completed_jobs: 1250,
      specializations: ['דודי שמש', 'חירום 24/7']
    }
  ];
}
