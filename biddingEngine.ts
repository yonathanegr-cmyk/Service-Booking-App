import { ServiceRequest, Bid } from '../App';
import { getBestPros, getMockProfessionals, UserRequest, Professional } from './proMatchingEngine';
import { calculateHaversineDistance, calculateDistanceScore, GEO_CONFIG, formatDistance } from './geoUtils';

const MAX_RADIUS_KM = GEO_CONFIG.MAX_RADIUS_KM;

const HEBREW_PROVIDERS: Professional[] = [
  {
    id: 'PRO_101',
    name: 'יוסי כהן',
    image: 'https://images.unsplash.com/photo-1581578017093-cd30fba4e9d5?w=400&h=400&fit=crop',
    tags: ['leak', 'clog', 'water_heater', 'installation'],
    difficulty_tolerance: 'hard',
    rating: 4.9,
    reviews_count: 127,
    location: { lat: 32.0900, lng: 34.7750 },
    response_time_minutes: 8,
    emergency_mode: true,
    hourly_rate: 180,
    years_experience: 15,
    completed_jobs: 890,
    specializations: ['נזילות מורכבות', 'צנרת סמויה']
  },
  {
    id: 'PRO_102',
    name: 'דניאל לוי',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop',
    tags: ['leak', 'clog', 'installation'],
    difficulty_tolerance: 'medium',
    rating: 4.7,
    reviews_count: 85,
    location: { lat: 32.0820, lng: 34.7900 },
    response_time_minutes: 15,
    emergency_mode: false,
    hourly_rate: 150,
    years_experience: 8,
    completed_jobs: 420,
    specializations: ['סתימות', 'התקנות']
  },
  {
    id: 'PRO_103',
    name: 'רונית אלמוג',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
    tags: ['outlet', 'lighting', 'panel', 'wiring'],
    difficulty_tolerance: 'hard',
    rating: 5.0,
    reviews_count: 210,
    location: { lat: 32.0780, lng: 34.7850 },
    response_time_minutes: 5,
    emergency_mode: true,
    hourly_rate: 200,
    years_experience: 20,
    completed_jobs: 1250,
    specializations: ['לוחות חשמל', 'חירום 24/7']
  },
  {
    id: 'PRO_104',
    name: 'אבי יצחק',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    tags: ['leak', 'water_heater', 'installation'],
    difficulty_tolerance: 'hard',
    rating: 4.6,
    reviews_count: 56,
    location: { lat: 32.0950, lng: 34.7700 },
    response_time_minutes: 20,
    emergency_mode: false,
    hourly_rate: 160,
    years_experience: 12,
    completed_jobs: 560,
    specializations: ['דודי שמש', 'התקנות']
  },
  {
    id: 'PRO_105',
    name: 'מיכל ברק',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
    tags: ['deep_cleaning', 'regular_cleaning', 'move_in_out', 'post_construction'],
    difficulty_tolerance: 'hard',
    rating: 4.9,
    reviews_count: 189,
    location: { lat: 32.0870, lng: 34.7920 },
    response_time_minutes: 30,
    emergency_mode: false,
    hourly_rate: 80,
    years_experience: 10,
    completed_jobs: 780,
    specializations: ['ניקיון יסודי', 'אחרי שיפוץ']
  },
  {
    id: 'PRO_106',
    name: 'עומר שלום',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    tags: ['installation', 'repair', 'maintenance'],
    difficulty_tolerance: 'medium',
    rating: 4.8,
    reviews_count: 145,
    location: { lat: 32.0800, lng: 34.7880 },
    response_time_minutes: 12,
    emergency_mode: true,
    hourly_rate: 170,
    years_experience: 14,
    completed_jobs: 920,
    specializations: ['מזגנים', 'תחזוקה']
  }
];

const CATEGORY_TO_TAGS: { [key: string]: string[] } = {
  'ניקיון': ['deep_cleaning', 'regular_cleaning', 'move_in_out', 'post_construction'],
  'אינסטלציה': ['leak', 'clog', 'installation', 'water_heater'],
  'חשמל': ['outlet', 'lighting', 'panel', 'wiring'],
  'מיזוג': ['installation', 'repair', 'maintenance'],
  'Cleaning': ['deep_cleaning', 'regular_cleaning'],
  'Plumbing': ['leak', 'clog', 'installation'],
  'Electrical': ['outlet', 'lighting', 'panel']
};

const ACCESSIBILITY_MAP: { [key: string]: 'easy' | 'medium' | 'hard' } = {
  'easy': 'easy',
  'ground_floor': 'easy',
  'accessible': 'easy',
  'medium': 'medium',
  'elevator': 'medium',
  'height': 'medium',
  'hard': 'hard',
  'difficult': 'hard',
  'no_elevator': 'hard',
  'hidden': 'hard'
};


export function generateBids(request: ServiceRequest, category: string): Bid[] {
  const userLat = request.location?.lat || 32.0853;
  const userLng = request.location?.lng || 34.7818;
  const userLocation = { lat: userLat, lng: userLng };

  const categoryTags = CATEGORY_TO_TAGS[category] || [];
  
  const eligibleProviders = HEBREW_PROVIDERS.filter(provider => 
    provider.tags.some(tag => categoryTags.includes(tag))
  );

  const accessibility = ACCESSIBILITY_MAP[request.accessibility || 'medium'] || 'medium';
  
  const isEmergency = request.urgency === 'immediate';

  const bids: Bid[] = [];

  for (const provider of eligibleProviders) {
    const distance = calculateHaversineDistance(userLocation, provider.location);
    
    if (distance > MAX_RADIUS_KM) continue;

    if (accessibility === 'hard' && provider.difficulty_tolerance === 'easy') {
      continue;
    }

    let basePrice = provider.hourly_rate;
    
    const complexityMultiplier = { standard: 1, complex: 1.5, critical: 2 };
    basePrice *= complexityMultiplier[request.complexity] || 1;

    const accessibilityMultiplier = { easy: 1, medium: 1.2, hard: 1.5 };
    basePrice *= accessibilityMultiplier[accessibility];

    if (isEmergency) {
      basePrice *= 1.3;
    }

    const travelTime = Math.round((distance / 30) * 60);
    
    let score = 0;
    score += calculateDistanceScore(distance) * 0.3;
    score += (provider.rating / 5) * 100 * 0.25;
    score += (provider.difficulty_tolerance === 'hard' ? 100 : provider.difficulty_tolerance === 'medium' ? 70 : 40) * 0.2;
    score += Math.min(provider.completed_jobs / 10, 100) * 0.15;
    score += (provider.emergency_mode && isEmergency ? 100 : 0) * 0.1;

    const matchReasons: string[] = [];
    if (distance <= 2) matchReasons.push(`במרחק ${distance.toFixed(1)} ק"מ ממך`);
    if (provider.rating >= 4.8) matchReasons.push(`דירוג מעולה (${provider.rating}⭐)`);
    if (provider.emergency_mode && isEmergency) matchReasons.push('זמין לקריאות חירום');
    if (provider.response_time_minutes <= 10) matchReasons.push('זמן תגובה מהיר');
    if (provider.years_experience >= 10) matchReasons.push(`ותק של ${provider.years_experience} שנים`);

    const bid: Bid = {
      id: `BID_${provider.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      providerId: provider.id,
      providerName: provider.name,
      providerImage: provider.image,
      rating: provider.rating,
      reviews: provider.reviews_count,
      distanceTime: `${Math.max(travelTime, 5)} דק׳`,
      distance: Math.round(distance * 10) / 10,
      totalPriceGuaranteed: Math.round(basePrice / 10) * 10,
      priceBreakdown: {
        baseRate: provider.hourly_rate,
        estimatedDuration: complexityMultiplier[request.complexity] || 1,
        travelFee: Math.round(distance * 5),
        urgencyMultiplier: isEmergency ? basePrice * 0.3 : 0,
      },
      currency: '₪',
      status: travelTime <= 30 ? 'available_now' : 'available_later',
      estimatedArrival: isEmergency ? `${Math.max(travelTime, 5)} דק׳` : 'לפי תיאום',
      lat: provider.location.lat,
      lng: provider.location.lng,
      score: Math.round(score),
      matchReasons,
      badges: [
        ...(provider.emergency_mode ? ['emergency'] : []),
        ...(provider.rating >= 4.8 ? ['top_rated'] : []),
        ...(provider.response_time_minutes <= 10 ? ['fast_response'] : []),
        ...(provider.years_experience >= 10 ? ['experienced'] : [])
      ]
    };

    bids.push(bid);
  }

  bids.sort((a, b) => {
    if (isEmergency) {
      const aEmergency = a.badges?.includes('emergency') ? 1 : 0;
      const bEmergency = b.badges?.includes('emergency') ? 1 : 0;
      if (aEmergency !== bEmergency) return bEmergency - aEmergency;
    }
    return (b.score || 0) - (a.score || 0);
  });

  return bids;
}

export function generateBidsWithMatching(request: ServiceRequest, category: string): Bid[] {
  const userRequest: UserRequest = {
    category: category,
    ai_description: request.description || '',
    specific_issue: request.serviceSKU || 'general',
    accessibility: (ACCESSIBILITY_MAP[request.accessibility || 'medium'] || 'medium') as 'easy' | 'medium' | 'hard',
    user_location: {
      lat: request.location?.lat || 32.0853,
      lng: request.location?.lng || 34.7818
    },
    is_emergency: request.urgency === 'immediate'
  };

  const matchingResult = getBestPros(userRequest, HEBREW_PROVIDERS, {
    maxRadius: MAX_RADIUS_KM,
    limit: 10
  });

  return matchingResult.professionals.map(pro => ({
    id: `BID_${pro.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    providerId: pro.id,
    providerName: pro.name,
    providerImage: pro.image,
    rating: pro.rating,
    reviews: pro.reviews_count,
    distanceTime: `${Math.max(Math.round(pro.distance_km * 2), 5)} דק׳`,
    distance: Math.round(pro.distance_km * 10) / 10,
    totalPriceGuaranteed: pro.estimated_price || Math.round(pro.hourly_rate * 1.5),
    priceBreakdown: {
      baseRate: pro.hourly_rate,
      estimatedDuration: 1.5,
      travelFee: Math.round(pro.distance_km * 5),
      urgencyMultiplier: userRequest.is_emergency ? pro.hourly_rate * 0.25 : 0,
    },
    currency: '₪',
    status: pro.response_time_minutes <= 15 ? 'available_now' : 'available_later',
    estimatedArrival: userRequest.is_emergency ? `${pro.response_time_minutes} דק׳` : 'לפי תיאום',
    lat: pro.location.lat,
    lng: pro.location.lng,
    score: pro.score,
    matchReasons: pro.match_reasons,
    badges: [
      ...(pro.emergency_mode ? ['emergency'] : []),
      ...(pro.rating >= 4.8 ? ['top_rated'] : []),
      ...(pro.response_time_minutes <= 10 ? ['fast_response'] : []),
      ...(pro.years_experience >= 10 ? ['experienced'] : [])
    ]
  }));
}
