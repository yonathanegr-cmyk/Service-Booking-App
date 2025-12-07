-- ==============================================================================
-- BEED AI - GLOBAL DATA SCHEMA (ORDER-CENTRIC)
-- Architecture: PostgreSQL / Supabase
-- Date: 2024
-- ==============================================================================

-- 1. ENUMS (Types de données contraints)
-- ==============================================================================
CREATE TYPE user_role AS ENUM ('admin', 'client', 'provider');
CREATE TYPE booking_status AS ENUM ('waiting_start', 'in_progress', 'completed', 'cancelled', 'pending', 'accepted', 'en_route');
CREATE TYPE event_type AS ENUM ('status_change', 'gps_arrival', 'system_alert', 'user_action');
CREATE TYPE media_type AS ENUM ('image', 'video');
CREATE TYPE media_stage AS ENUM ('before', 'after', 'incident');
CREATE TYPE invoice_status AS ENUM ('pending', 'paid', 'refunded');
CREATE TYPE cost_item_type AS ENUM ('base', 'time', 'extra', 'penalty');

-- 2. CORE USERS & PROFILES
-- ==============================================================================
-- Table extension de auth.users (Supabase gère auth.users, nous gérons profiles)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role user_role DEFAULT 'client',
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE clients (
    id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
    default_address JSONB, -- { street, city, lat, lng }
    payment_methods_token JSONB -- Stripe Customer ID etc.
);

CREATE TABLE providers (
    id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
    is_verified BOOLEAN DEFAULT FALSE,
    rating_avg FLOAT DEFAULT 5.0,
    skills JSONB, -- ['plumbing', 'electrical']
    insurance_docs JSONB,
    current_location GEOGRAPHY(POINT) -- PostGIS pour la géolocalisation temps réel
);

-- 3. THE KEYSTONE: BOOKINGS (MISSIONS)
-- ==============================================================================
CREATE TABLE bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES profiles(id) NOT NULL,
    provider_id UUID REFERENCES profiles(id), -- Peut être NULL au début (marketplace ouverte)
    status booking_status DEFAULT 'pending',
    
    -- Détails de la mission
    title TEXT NOT NULL,
    description TEXT,
    location_address TEXT NOT NULL,
    location_coords GEOGRAPHY(POINT), -- Pour calculs de distance
    scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    
    -- Metadatas
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour requêtes rapides sur le statut et les acteurs
CREATE INDEX idx_bookings_client ON bookings(client_id);
CREATE INDEX idx_bookings_provider ON bookings(provider_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- 4. UNIFIED TIMELINE (CHAT + EVENTS)
-- ==============================================================================

-- Messages Humains (Chat)
CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES profiles(id) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Événements Système (Audit Log / Tracking)
CREATE TABLE booking_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    event_type event_type NOT NULL,
    description TEXT, -- "Le prestataire a démarré la mission"
    metadata JSONB, -- { "gps_lat": ..., "battery_level": ... }
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PROOFS & MEDIA
-- ==============================================================================
CREATE TABLE booking_media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    uploader_id UUID REFERENCES profiles(id),
    media_url TEXT NOT NULL,
    media_type media_type DEFAULT 'image',
    stage media_stage NOT NULL, -- 'before' ou 'after' est CRUCIAL pour le litige
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. FINANCIALS (INVOICES)
-- ==============================================================================
CREATE TABLE invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) ON DELETE RESTRICT NOT NULL, -- On ne supprime pas une commande facturée
    status invoice_status DEFAULT 'pending',
    
    -- Totaux
    total_amount FLOAT DEFAULT 0,
    tip_amount FLOAT DEFAULT 0,
    platform_fee FLOAT DEFAULT 0,
    
    -- Stripe / Paiement
    stripe_payment_intent_id TEXT,
    invoice_pdf_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ
);

CREATE TABLE invoice_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
    label TEXT NOT NULL,
    amount FLOAT NOT NULL,
    type cost_item_type DEFAULT 'base'
);

-- 7. AUTOMATION & TRIGGERS
-- ==============================================================================

-- Trigger: Mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bookings_modtime
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Trigger AVANCÉ: Créer un event dans la timeline quand le statut change
CREATE OR REPLACE FUNCTION log_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO booking_events (booking_id, event_type, description, metadata)
        VALUES (
            NEW.id, 
            'status_change', 
            'Status changed from ' || OLD.status || ' to ' || NEW.status,
            jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_log_status_change
    AFTER UPDATE ON bookings
    FOR EACH ROW
    EXECUTE PROCEDURE log_booking_status_change();

-- 8. ROW LEVEL SECURITY (RLS) - BASICS
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Politique EXEMPLE pour les messages :
-- "Un utilisateur peut voir les messages S'IL est le client OU le provider de la mission liée"
CREATE POLICY "Users can view messages of their own bookings" ON messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.id = messages.booking_id
            AND (b.client_id = auth.uid() OR b.provider_id = auth.uid())
        )
    );

-- Politique ADMIN (Oeil de Dieu) :
-- Créer un rôle admin ou utiliser une table whitelist d'emails admin
-- (Simplifié ici pour l'exemple)
