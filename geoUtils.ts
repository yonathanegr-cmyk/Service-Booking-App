const EARTH_RADIUS_KM = 6371;
const MAX_RADIUS_KM = 40;
const MAX_RADIUS_METERS = MAX_RADIUS_KM * 1000;

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface ProfessionalWithDistance {
  id: string;
  name: string;
  lat: number;
  lng: number;
  price: number;
  rating: number;
  reviews: number;
  image?: string;
  tags?: string[];
  distance_km: number;
  distance_meters: number;
  is_within_radius: boolean;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function calculateHaversineDistance(
  point1: GeoPoint,
  point2: GeoPoint
): number {
  const lat1Rad = toRadians(point1.lat);
  const lat2Rad = toRadians(point2.lat);
  const deltaLat = toRadians(point2.lat - point1.lat);
  const deltaLng = toRadians(point2.lng - point1.lng);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

export function isWithinRadius(
  clientLocation: GeoPoint,
  proLocation: GeoPoint,
  radiusKm: number = MAX_RADIUS_KM
): boolean {
  const distance = calculateHaversineDistance(clientLocation, proLocation);
  return distance <= radiusKm;
}

export function filterProfessionalsByRadius<T extends { lat: number; lng: number }>(
  professionals: T[],
  clientLocation: GeoPoint,
  radiusKm: number = MAX_RADIUS_KM
): (T & { distance_km: number; distance_meters: number })[] {
  return professionals
    .map((pro) => {
      const distance_km = calculateHaversineDistance(clientLocation, {
        lat: pro.lat,
        lng: pro.lng,
      });
      return {
        ...pro,
        distance_km: Math.round(distance_km * 10) / 10,
        distance_meters: Math.round(distance_km * 1000),
      };
    })
    .filter((pro) => pro.distance_km <= radiusKm)
    .sort((a, b) => a.distance_km - b.distance_km);
}

export function calculateDistanceScore(distance_km: number): number {
  if (distance_km <= 2) return 100;
  if (distance_km <= 5) return 90;
  if (distance_km <= 10) return 75;
  if (distance_km <= 20) return 50;
  if (distance_km <= 30) return 30;
  if (distance_km <= 40) return 15;
  return 0;
}

export function calculateRelevanceScore(
  distance_km: number,
  rating: number,
  reviews: number
): number {
  const distanceScore = calculateDistanceScore(distance_km);
  
  const ratingScore = (rating / 5) * 100;
  
  const reviewScore = Math.min(reviews / 100, 1) * 100;
  
  const reputationScore = ratingScore * 0.7 + reviewScore * 0.3;
  
  const finalScore = distanceScore * 0.4 + reputationScore * 0.6;
  
  return Math.round(finalScore);
}

export function formatDistance(distance_km: number): string {
  if (distance_km < 1) {
    return `${Math.round(distance_km * 1000)} מ׳`;
  }
  return `${distance_km.toFixed(1)} ק״מ`;
}

export function getDistanceLabel(distance_km: number): string {
  if (distance_km <= 2) return 'קרוב מאוד';
  if (distance_km <= 5) return 'קרוב';
  if (distance_km <= 15) return 'באזור';
  if (distance_km <= 40) return 'מרחק בינוני';
  return 'רחוק';
}

export const GEO_CONFIG = {
  MAX_RADIUS_KM,
  MAX_RADIUS_METERS,
  EARTH_RADIUS_KM,
};

export const SUPABASE_RPC_TEMPLATE = `
-- =====================================================
-- POSTGRESQL/POSTGIS FUNCTION: find_pros_nearby
-- Rayon: 40 KM avec tri intelligent par pertinence
-- =====================================================

-- 1. ACTIVER POSTGIS (si pas déjà fait)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. AJOUTER COLONNE GEOMETRY (si table existe déjà)
ALTER TABLE professionals 
ADD COLUMN IF NOT EXISTS location GEOGRAPHY(POINT, 4326);

-- 3. METTRE À JOUR LA COLONNE LOCATION
UPDATE professionals 
SET location = ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
WHERE location IS NULL;

-- 4. CRÉER L'INDEX SPATIAL GIST (PERFORMANCE)
CREATE INDEX IF NOT EXISTS idx_professionals_location 
ON professionals USING GIST (location);

-- 5. FONCTION DE RECHERCHE AVEC RAYON 40KM
CREATE OR REPLACE FUNCTION find_pros_nearby(
  client_lat DOUBLE PRECISION,
  client_lng DOUBLE PRECISION,
  radius_meters INTEGER DEFAULT 40000,
  category_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  price NUMERIC,
  rating NUMERIC,
  reviews INTEGER,
  image TEXT,
  tags TEXT[],
  distance_km NUMERIC,
  distance_meters INTEGER,
  relevance_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.lat,
    p.lng,
    p.price,
    p.rating,
    p.reviews,
    p.image,
    p.tags,
    ROUND((ST_Distance(
      p.location,
      ST_SetSRID(ST_MakePoint(client_lng, client_lat), 4326)::geography
    ) / 1000)::NUMERIC, 1) AS distance_km,
    ST_Distance(
      p.location,
      ST_SetSRID(ST_MakePoint(client_lng, client_lat), 4326)::geography
    )::INTEGER AS distance_meters,
    -- Score de pertinence: Distance (40%) + Réputation (60%)
    ROUND(
      (
        -- Distance Score (0-100, décroissant)
        CASE 
          WHEN ST_Distance(p.location, ST_SetSRID(ST_MakePoint(client_lng, client_lat), 4326)::geography) <= 2000 THEN 100
          WHEN ST_Distance(p.location, ST_SetSRID(ST_MakePoint(client_lng, client_lat), 4326)::geography) <= 5000 THEN 90
          WHEN ST_Distance(p.location, ST_SetSRID(ST_MakePoint(client_lng, client_lat), 4326)::geography) <= 10000 THEN 75
          WHEN ST_Distance(p.location, ST_SetSRID(ST_MakePoint(client_lng, client_lat), 4326)::geography) <= 20000 THEN 60
          WHEN ST_Distance(p.location, ST_SetSRID(ST_MakePoint(client_lng, client_lat), 4326)::geography) <= 40000 THEN 40
          ELSE 20
        END
      ) * 0.4 +
      (
        -- Reputation Score (Rating 70% + Reviews 30%)
        ((p.rating / 5.0) * 100 * 0.7) + (LEAST(p.reviews::NUMERIC / 100, 1) * 100 * 0.3)
      ) * 0.6
    , 0) AS relevance_score
  FROM professionals p
  WHERE 
    -- Filtre spatial: dans le rayon
    ST_DWithin(
      p.location,
      ST_SetSRID(ST_MakePoint(client_lng, client_lat), 4326)::geography,
      radius_meters
    )
    -- Filtre catégorie optionnel
    AND (category_filter IS NULL OR category_filter = ANY(p.tags))
    -- Pro actif
    AND p.is_active = true
  ORDER BY relevance_score DESC, distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- 6. EXEMPLE D'APPEL DEPUIS SUPABASE JS
-- const { data, error } = await supabase.rpc('find_pros_nearby', {
--   client_lat: 32.0853,
--   client_lng: 34.7818,
--   radius_meters: 70000,
--   category_filter: 'plumbing'
-- });
`;
