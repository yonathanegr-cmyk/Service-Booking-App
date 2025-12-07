import { getBestPros, getMockProfessionals, UserRequest, MatchingResult } from './proMatchingEngine';

const exampleUserRequest: UserRequest = {
  category: 'plomberie',
  ai_description: 'יש לי נזילה תחת הכיור שמציפה את המטבח, זה דחוף!',
  specific_issue: 'leak',
  accessibility: 'hard',
  user_location: { lat: 32.0853, lng: 34.7818 }
};

const result: MatchingResult = getBestPros(
  exampleUserRequest,
  getMockProfessionals(),
  { maxRadius: 20, limit: 10 }
);

console.log('=== MATCHING ENGINE RESULT ===');
console.log(JSON.stringify(result, null, 2));

export const exampleApiResponse = {
  success: true,
  data: {
    request_id: 'req_abc123',
    timestamp: '2025-01-15T14:30:00Z',
    user_request: {
      category: 'plomberie',
      specific_issue: 'leak',
      accessibility: 'hard',
      is_emergency_detected: true,
      location: { lat: 32.0853, lng: 34.7818, address: 'רחוב דיזנגוף 50, תל אביב' }
    },
    matching_summary: {
      total_pros_in_db: 150,
      after_radius_filter: 45,
      after_tag_filter: 28,
      after_difficulty_filter: 22,
      returned: 10
    },
    professionals: [
      {
        id: 'pro-1',
        name: 'יוסי אינסטלטור',
        image: 'https://example.com/yossi.jpg',
        rating: 4.9,
        reviews_count: 156,
        distance_km: 1.2,
        response_time: '< 10 דקות',
        estimated_price: 280,
        score: 94.5,
        match_reasons: [
          'במרחק 1.2 ק"מ ממך',
          'דירוג מעולה (4.9⭐)',
          'זמין לקריאות חירום'
        ],
        scores_breakdown: {
          proximity: 100,
          difficulty_match: 100,
          reputation: 92,
          semantic_match: 85,
          emergency_bonus: 25
        },
        badges: ['מומחה חירום', 'מוסמך', 'ותק 15+ שנה'],
        availability: {
          today: ['14:00', '16:00', '18:00'],
          tomorrow: ['09:00', '11:00', '14:00', '16:00']
        }
      },
      {
        id: 'pro-3',
        name: 'דוד השרברב',
        image: 'https://example.com/david.jpg',
        rating: 4.8,
        reviews_count: 234,
        distance_km: 0.8,
        response_time: '< 5 דקות',
        estimated_price: 320,
        score: 91.2,
        match_reasons: [
          'במרחק 0.8 ק"מ ממך',
          'זמן תגובה מהיר (< 10 דקות)',
          'ביצע 1250+ עבודות'
        ],
        scores_breakdown: {
          proximity: 100,
          difficulty_match: 100,
          reputation: 95,
          semantic_match: 70,
          emergency_bonus: 30
        },
        badges: ['24/7 חירום', 'מומחה דודי שמש'],
        availability: {
          today: ['15:00', '17:00'],
          tomorrow: ['08:00', '10:00', '13:00', '15:00', '17:00']
        }
      },
      {
        id: 'pro-2',
        name: 'מוחמד פלמבינג',
        image: 'https://example.com/mohamed.jpg',
        rating: 4.7,
        reviews_count: 89,
        distance_km: 2.1,
        response_time: '< 15 דקות',
        estimated_price: 240,
        score: 72.8,
        match_reasons: [
          'קרוב אליך (2.1 ק"מ)',
          'דירוג גבוה (4.7⭐)',
          'מחיר תחרותי'
        ],
        scores_breakdown: {
          proximity: 90,
          difficulty_match: 40,
          reputation: 78,
          semantic_match: 75,
          emergency_bonus: 0
        },
        badges: ['מחיר הוגן'],
        availability: {
          today: [],
          tomorrow: ['10:00', '14:00', '16:00']
        },
        warning: 'מתמחה בגישה בינונית - יתכנו עלויות נוספות לגישה מורכבת'
      }
    ],
    emergency_info: {
      detected: true,
      keywords_found: ['דחוף', 'מציפה'],
      priority_boost_applied: true,
      message: 'זיהינו שמדובר במקרה דחוף. העדפנו בעלי מקצוע עם זמינות מיידית.'
    }
  },
  meta: {
    algorithm_version: '2.0',
    processing_time_ms: 45,
    cache_hit: false
  }
};
