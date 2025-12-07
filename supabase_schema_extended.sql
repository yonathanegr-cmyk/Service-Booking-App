-- ==============================================================================
-- BEED AI - EXTENDED UNIFIED SCHEMA
-- Architecture: PostgreSQL / Supabase
-- Version: 2.0 - Multi-Interface Support (Client, Pro, Admin)
-- ==============================================================================

-- =============================================================================
-- PART 1: ADDITIONAL ENUMS
-- =============================================================================
CREATE TYPE dispute_status AS ENUM ('open', 'investigating', 'resolved_client', 'resolved_pro', 'escalated', 'closed');
CREATE TYPE dispute_reason AS ENUM ('no_show', 'quality_issue', 'pricing_dispute', 'damage', 'harassment', 'other');
CREATE TYPE commission_type AS ENUM ('platform_fee', 'insurance', 'premium_listing', 'cancellation_fee');
CREATE TYPE notification_channel AS ENUM ('push', 'sms', 'email', 'in_app');

-- =============================================================================
-- PART 2: EXTENDED BOOKINGS TABLE (THE PIVOT)
-- =============================================================================
-- Enrichir la table bookings existante avec les champs manquants
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS 
    category TEXT, -- 'plumbing', 'cleaning', 'electrical'
    urgency_level TEXT DEFAULT 'normal', -- 'emergency', 'normal', 'flexible'
    estimated_duration_minutes INTEGER,
    actual_duration_minutes INTEGER,
    
    -- Pricing
    estimated_price DECIMAL(10,2),
    final_price DECIMAL(10,2),
    currency TEXT DEFAULT 'ILS',
    
    -- Location Details (Client-Sensitive)
    location_building_code TEXT, -- Digicode - SENSIBLE
    location_floor TEXT,
    location_apartment TEXT,
    location_notes TEXT, -- "Sonner 2 fois"
    
    -- Timestamps
    confirmed_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancelled_by UUID REFERENCES profiles(id),
    cancellation_reason TEXT,
    
    -- Ratings (Post-Mission)
    client_rating INTEGER CHECK (client_rating >= 1 AND client_rating <= 5),
    client_review TEXT,
    pro_rating INTEGER CHECK (pro_rating >= 1 AND pro_rating <= 5),
    pro_review TEXT,
    
    -- Admin Fields
    admin_notes TEXT,
    is_flagged BOOLEAN DEFAULT FALSE,
    flagged_reason TEXT;

-- =============================================================================
-- PART 3: DISPUTES TABLE (LITIGES)
-- =============================================================================
CREATE TABLE disputes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) ON DELETE RESTRICT NOT NULL,
    
    -- Qui a créé le litige
    created_by UUID REFERENCES profiles(id) NOT NULL,
    created_by_role user_role NOT NULL,
    
    -- Détails du litige
    reason dispute_reason NOT NULL,
    description TEXT NOT NULL,
    evidence_urls JSONB DEFAULT '[]'::jsonb, -- Photos/Vidéos de preuve
    
    -- Résolution
    status dispute_status DEFAULT 'open',
    assigned_admin UUID REFERENCES profiles(id),
    resolution_notes TEXT,
    refund_amount DECIMAL(10,2) DEFAULT 0,
    compensation_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_disputes_booking ON disputes(booking_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_assigned ON disputes(assigned_admin);

-- =============================================================================
-- PART 4: DISPUTE MESSAGES (Thread de discussion litige)
-- =============================================================================
CREATE TABLE dispute_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dispute_id UUID REFERENCES disputes(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES profiles(id) NOT NULL,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE, -- Notes internes admin
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- PART 5: ADMIN COMMISSIONS & LOGS
-- =============================================================================
CREATE TABLE commissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) ON DELETE RESTRICT NOT NULL,
    type commission_type NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    percentage DECIMAL(5,2), -- Ex: 15.00 pour 15%
    description TEXT,
    collected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE admin_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES profiles(id) NOT NULL,
    action TEXT NOT NULL, -- 'booking_cancelled', 'dispute_resolved', 'pro_banned'
    target_table TEXT NOT NULL,
    target_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- PART 6: SQL VIEWS - INTERFACE-SPECIFIC DATA ACCESS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- VIEW 1: CLIENT BOOKINGS (App Client)
-- Montre les infos publiques du Pro, cache les données sensibles admin
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW view_client_bookings AS
SELECT 
    b.id AS booking_id,
    b.status,
    b.category,
    b.title,
    b.description,
    b.scheduled_for,
    b.estimated_price,
    b.final_price,
    b.currency,
    b.created_at,
    b.confirmed_at,
    b.started_at,
    b.completed_at,
    
    -- Infos Client (propres données)
    b.client_id,
    b.location_address,
    b.location_building_code,
    b.location_floor,
    b.location_apartment,
    
    -- Infos Pro (PUBLIQUES UNIQUEMENT)
    b.provider_id,
    pro_profile.full_name AS pro_name,
    pro_profile.avatar_url AS pro_avatar,
    pro_profile.phone AS pro_phone, -- Visible seulement si confirmed
    prov.rating_avg AS pro_rating,
    prov.is_verified AS pro_is_verified,
    
    -- Rating (visible après completion)
    CASE WHEN b.status = 'completed' THEN b.client_rating ELSE NULL END AS my_rating,
    CASE WHEN b.status = 'completed' THEN b.client_review ELSE NULL END AS my_review,
    
    -- Dispute status
    (SELECT COUNT(*) FROM disputes d WHERE d.booking_id = b.id) AS dispute_count
    
FROM bookings b
LEFT JOIN profiles pro_profile ON b.provider_id = pro_profile.id
LEFT JOIN providers prov ON b.provider_id = prov.id;

-- -----------------------------------------------------------------------------
-- VIEW 2: PRO BOOKINGS (App Pro)
-- Montre l'adresse exacte SEULEMENT si CONFIRMED ou après
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW view_pro_bookings AS
SELECT 
    b.id AS booking_id,
    b.status,
    b.category,
    b.title,
    b.description,
    b.scheduled_for,
    b.estimated_price,
    b.final_price,
    b.estimated_duration_minutes,
    b.actual_duration_minutes,
    b.urgency_level,
    b.created_at,
    b.confirmed_at,
    b.started_at,
    b.completed_at,
    
    -- Infos Pro (propres données)
    b.provider_id,
    
    -- Infos Client (CONDITIONNELLES - SEULEMENT SI CONFIRMÉ)
    b.client_id,
    client_profile.full_name AS client_name,
    client_profile.avatar_url AS client_avatar,
    
    -- Adresse SENSIBLE (UNIQUEMENT si status >= accepted)
    CASE 
        WHEN b.status IN ('accepted', 'en_route', 'in_progress', 'completed') 
        THEN b.location_address 
        ELSE 'Adresse visible après acceptation' 
    END AS location_address,
    
    -- Digicode ULTRA-SENSIBLE (UNIQUEMENT si en_route ou après)
    CASE 
        WHEN b.status IN ('en_route', 'in_progress', 'completed') 
        THEN b.location_building_code 
        ELSE NULL 
    END AS location_building_code,
    
    CASE 
        WHEN b.status IN ('en_route', 'in_progress', 'completed') 
        THEN b.location_floor 
        ELSE NULL 
    END AS location_floor,
    
    CASE 
        WHEN b.status IN ('en_route', 'in_progress', 'completed') 
        THEN b.location_apartment 
        ELSE NULL 
    END AS location_apartment,
    
    CASE 
        WHEN b.status IN ('en_route', 'in_progress', 'completed') 
        THEN b.location_notes 
        ELSE NULL 
    END AS location_notes,
    
    -- Coordonnées GPS (toujours visible pour calcul distance)
    b.location_coords,
    
    -- Téléphone client (seulement si confirmé)
    CASE 
        WHEN b.status IN ('accepted', 'en_route', 'in_progress', 'completed') 
        THEN client_profile.phone 
        ELSE NULL 
    END AS client_phone,
    
    -- Rating reçu
    CASE WHEN b.status = 'completed' THEN b.pro_rating ELSE NULL END AS rating_received,
    CASE WHEN b.status = 'completed' THEN b.pro_review ELSE NULL END AS review_received
    
FROM bookings b
LEFT JOIN profiles client_profile ON b.client_id = client_profile.id;

-- -----------------------------------------------------------------------------
-- VIEW 3: ADMIN BOOKINGS (Dashboard Admin - "God Mode")
-- Montre TOUT : données sensibles, commissions, logs, litiges
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW view_admin_bookings AS
SELECT 
    -- BOOKING COMPLET
    b.*,
    
    -- CLIENT FULL DATA
    client_profile.full_name AS client_name,
    client_profile.email AS client_email,
    client_profile.phone AS client_phone,
    client_profile.avatar_url AS client_avatar,
    client_profile.created_at AS client_registered_at,
    cli.default_address AS client_default_address,
    cli.payment_methods_token AS client_payment_info,
    
    -- PRO FULL DATA
    pro_profile.full_name AS pro_name,
    pro_profile.email AS pro_email,
    pro_profile.phone AS pro_phone,
    pro_profile.avatar_url AS pro_avatar,
    prov.is_verified AS pro_verified,
    prov.rating_avg AS pro_rating,
    prov.skills AS pro_skills,
    prov.insurance_docs AS pro_insurance,
    
    -- FINANCIAL DATA
    (SELECT SUM(amount) FROM commissions c WHERE c.booking_id = b.id) AS total_commission,
    (SELECT json_agg(c.*) FROM commissions c WHERE c.booking_id = b.id) AS commission_details,
    
    inv.id AS invoice_id,
    inv.status AS invoice_status,
    inv.total_amount AS invoice_total,
    inv.platform_fee AS invoice_platform_fee,
    inv.stripe_payment_intent_id,
    
    -- DISPUTES
    (SELECT COUNT(*) FROM disputes d WHERE d.booking_id = b.id) AS dispute_count,
    (SELECT json_agg(d.*) FROM disputes d WHERE d.booking_id = b.id) AS disputes_data,
    
    -- TIMELINE (Messages + Events)
    (SELECT COUNT(*) FROM messages m WHERE m.booking_id = b.id) AS message_count,
    (SELECT json_agg(e.* ORDER BY e.created_at DESC) FROM booking_events e WHERE e.booking_id = b.id LIMIT 10) AS recent_events,
    
    -- MEDIA PROOFS
    (SELECT json_agg(bm.*) FROM booking_media bm WHERE bm.booking_id = b.id) AS media_proofs,
    
    -- ADMIN FLAGS
    b.is_flagged,
    b.flagged_reason,
    b.admin_notes
    
FROM bookings b
LEFT JOIN profiles client_profile ON b.client_id = client_profile.id
LEFT JOIN clients cli ON b.client_id = cli.id
LEFT JOIN profiles pro_profile ON b.provider_id = pro_profile.id
LEFT JOIN providers prov ON b.provider_id = prov.id
LEFT JOIN invoices inv ON inv.booking_id = b.id;

-- =============================================================================
-- PART 7: ADMIN DISPUTE VIEW (Avec historique mission complet)
-- =============================================================================
CREATE OR REPLACE VIEW view_admin_disputes AS
SELECT 
    d.*,
    
    -- Qui a créé le litige
    creator.full_name AS creator_name,
    creator.email AS creator_email,
    
    -- Admin assigné
    admin.full_name AS assigned_admin_name,
    
    -- Booking associé (CONTEXTE COMPLET)
    b.title AS booking_title,
    b.category AS booking_category,
    b.status AS booking_status,
    b.scheduled_for AS booking_scheduled,
    b.final_price AS booking_price,
    b.location_address AS booking_address,
    
    -- Client de la mission
    client.full_name AS booking_client_name,
    client.email AS booking_client_email,
    
    -- Pro de la mission
    pro.full_name AS booking_pro_name,
    pro.email AS booking_pro_email,
    
    -- Timeline du litige
    (SELECT json_agg(dm.* ORDER BY dm.created_at) FROM dispute_messages dm WHERE dm.dispute_id = d.id) AS message_thread,
    
    -- Historique complet de la mission (pour contexte)
    (SELECT json_agg(e.* ORDER BY e.created_at) FROM booking_events e WHERE e.booking_id = d.booking_id) AS booking_timeline,
    
    -- Preuves média
    (SELECT json_agg(bm.*) FROM booking_media bm WHERE bm.booking_id = d.booking_id) AS booking_media
    
FROM disputes d
LEFT JOIN profiles creator ON d.created_by = creator.id
LEFT JOIN profiles admin ON d.assigned_admin = admin.id
LEFT JOIN bookings b ON d.booking_id = b.id
LEFT JOIN profiles client ON b.client_id = client.id
LEFT JOIN profiles pro ON b.provider_id = pro.id;

-- =============================================================================
-- PART 8: ROW LEVEL SECURITY (RLS) FOR VIEWS
-- =============================================================================

-- RLS sur disputes
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

-- Clients peuvent voir leurs propres litiges
CREATE POLICY "Clients can view own disputes" ON disputes
    FOR SELECT
    USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM bookings b 
            WHERE b.id = disputes.booking_id 
            AND b.client_id = auth.uid()
        )
    );

-- Pros peuvent voir les litiges sur leurs missions
CREATE POLICY "Providers can view related disputes" ON disputes
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM bookings b 
            WHERE b.id = disputes.booking_id 
            AND b.provider_id = auth.uid()
        )
    );

-- Admins voient tout
CREATE POLICY "Admins can view all disputes" ON disputes
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
    );

-- =============================================================================
-- PART 9: TRIGGERS FOR DISPUTES
-- =============================================================================

-- Trigger: Auto-update updated_at sur disputes
CREATE TRIGGER update_disputes_modtime
    BEFORE UPDATE ON disputes
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Trigger: Log admin actions
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        INSERT INTO admin_audit_logs (admin_id, action, target_table, target_id, old_values, new_values)
        VALUES (
            auth.uid(),
            'update_' || TG_TABLE_NAME,
            TG_TABLE_NAME,
            NEW.id,
            to_jsonb(OLD),
            to_jsonb(NEW)
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================================================
-- PART 10: HELPER FUNCTIONS (RPC)
-- =============================================================================

-- Fonction pour obtenir le résumé d'une mission (utilisable par tous les interfaces)
CREATE OR REPLACE FUNCTION get_booking_summary(booking_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
    user_role_val user_role;
BEGIN
    -- Déterminer le rôle de l'utilisateur courant
    SELECT role INTO user_role_val FROM profiles WHERE id = auth.uid();
    
    IF user_role_val = 'admin' THEN
        SELECT to_jsonb(v.*) INTO result FROM view_admin_bookings v WHERE v.id = booking_uuid;
    ELSIF user_role_val = 'provider' THEN
        SELECT to_jsonb(v.*) INTO result FROM view_pro_bookings v WHERE v.booking_id = booking_uuid;
    ELSE
        SELECT to_jsonb(v.*) INTO result FROM view_client_bookings v WHERE v.booking_id = booking_uuid;
    END IF;
    
    RETURN result;
END;
$$;

-- Fonction pour créer un litige
CREATE OR REPLACE FUNCTION create_dispute(
    p_booking_id UUID,
    p_reason dispute_reason,
    p_description TEXT,
    p_evidence_urls JSONB DEFAULT '[]'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role_val user_role;
    new_dispute_id UUID;
BEGIN
    -- Vérifier le rôle
    SELECT role INTO user_role_val FROM profiles WHERE id = auth.uid();
    
    -- Créer le litige
    INSERT INTO disputes (booking_id, created_by, created_by_role, reason, description, evidence_urls)
    VALUES (p_booking_id, auth.uid(), user_role_val, p_reason, p_description, p_evidence_urls)
    RETURNING id INTO new_dispute_id;
    
    -- Flaguer la mission automatiquement
    UPDATE bookings SET is_flagged = TRUE, flagged_reason = 'Dispute opened: ' || p_reason
    WHERE id = p_booking_id;
    
    RETURN new_dispute_id;
END;
$$;

-- =============================================================================
-- PART 11: ADMIN USER PROFILE 360° (Vue complète utilisateur)
-- =============================================================================

-- Table Support Tickets (si non existante)
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    subject TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    priority TEXT DEFAULT 'medium',
    category TEXT,
    assigned_to UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES profiles(id) NOT NULL,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table Message Audit (messages supprimés)
CREATE TABLE IF NOT EXISTS message_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID NOT NULL,
    booking_id UUID REFERENCES bookings(id),
    sender_id UUID REFERENCES profiles(id),
    recipient_id UUID REFERENCES profiles(id),
    content TEXT NOT NULL,
    action TEXT NOT NULL, -- 'deleted', 'edited'
    deleted_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_by UUID REFERENCES profiles(id)
);

-- Table User Activity Log
CREATE TABLE IF NOT EXISTS user_activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id UUID,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: Log deleted messages
CREATE OR REPLACE FUNCTION log_deleted_message()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO message_audit_log (message_id, booking_id, sender_id, content, action, deleted_by)
    VALUES (OLD.id, OLD.booking_id, OLD.sender_id, OLD.content, 'deleted', auth.uid());
    RETURN OLD;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_log_deleted_message
    BEFORE DELETE ON messages
    FOR EACH ROW
    EXECUTE PROCEDURE log_deleted_message();

-- =============================================================================
-- FONCTION PRINCIPALE: get_user_profile_360
-- Récupère toutes les données d'un utilisateur pour l'Admin
-- =============================================================================
CREATE OR REPLACE FUNCTION get_user_profile_360(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
    user_data JSONB;
    stats_data JSONB;
    bookings_data JSONB;
    pros_data JSONB;
    transactions_data JSONB;
    messages_data JSONB;
    tickets_data JSONB;
    activity_data JSONB;
BEGIN
    -- Vérifier que l'appelant est admin
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
        RAISE EXCEPTION 'Accès refusé: Admin uniquement';
    END IF;

    -- 1. USER DATA
    SELECT jsonb_build_object(
        'id', p.id,
        'email', p.email,
        'full_name', p.full_name,
        'phone', p.phone,
        'avatar_url', p.avatar_url,
        'role', p.role,
        'created_at', p.created_at,
        'updated_at', p.updated_at,
        'is_verified', COALESCE(prov.is_verified, FALSE),
        'last_login_at', (SELECT MAX(created_at) FROM user_activity_log WHERE user_id = target_user_id AND action = 'login'),
        'login_count', (SELECT COUNT(*) FROM user_activity_log WHERE user_id = target_user_id AND action = 'login')
    ) INTO user_data
    FROM profiles p
    LEFT JOIN providers prov ON p.id = prov.id
    WHERE p.id = target_user_id;

    -- 2. STATS
    SELECT jsonb_build_object(
        'total_bookings', (SELECT COUNT(*) FROM bookings WHERE client_id = target_user_id OR provider_id = target_user_id),
        'completed_bookings', (SELECT COUNT(*) FROM bookings WHERE (client_id = target_user_id OR provider_id = target_user_id) AND status = 'completed'),
        'cancelled_bookings', (SELECT COUNT(*) FROM bookings WHERE (client_id = target_user_id OR provider_id = target_user_id) AND status = 'cancelled'),
        'total_spent', COALESCE((SELECT SUM(final_price) FROM bookings WHERE client_id = target_user_id AND status = 'completed'), 0),
        'average_rating_given', COALESCE((SELECT AVG(client_rating) FROM bookings WHERE client_id = target_user_id AND client_rating IS NOT NULL), 0),
        'average_rating_received', COALESCE((SELECT AVG(pro_rating) FROM bookings WHERE provider_id = target_user_id AND pro_rating IS NOT NULL), 0),
        'disputes_opened', (SELECT COUNT(*) FROM disputes WHERE created_by = target_user_id),
        'disputes_won', (SELECT COUNT(*) FROM disputes WHERE created_by = target_user_id AND status IN ('resolved_client', 'resolved_pro'))
    ) INTO stats_data;

    -- 3. BOOKINGS
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', b.id,
        'title', b.title,
        'category', b.category,
        'status', b.status,
        'scheduled_for', b.scheduled_for,
        'created_at', b.created_at,
        'completed_at', b.completed_at,
        'final_price', b.final_price,
        'pro_id', b.provider_id,
        'pro_name', pro.full_name,
        'pro_avatar', pro.avatar_url,
        'client_rating', b.client_rating,
        'pro_rating', b.pro_rating,
        'has_dispute', EXISTS(SELECT 1 FROM disputes d WHERE d.booking_id = b.id)
    ) ORDER BY b.created_at DESC), '[]'::jsonb)
    INTO bookings_data
    FROM bookings b
    LEFT JOIN profiles pro ON b.provider_id = pro.id
    WHERE b.client_id = target_user_id OR b.provider_id = target_user_id;

    -- 4. PROS WORKED WITH
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', pro.id,
        'name', pro.full_name,
        'avatar_url', pro.avatar_url,
        'rating', prov.rating_avg,
        'is_verified', prov.is_verified,
        'bookings_together', pro_stats.booking_count,
        'total_spent_with', pro_stats.total_spent,
        'first_booking_date', pro_stats.first_booking,
        'last_booking_date', pro_stats.last_booking
    )), '[]'::jsonb)
    INTO pros_data
    FROM (
        SELECT 
            provider_id,
            COUNT(*) as booking_count,
            SUM(final_price) as total_spent,
            MIN(created_at) as first_booking,
            MAX(created_at) as last_booking
        FROM bookings 
        WHERE client_id = target_user_id AND provider_id IS NOT NULL
        GROUP BY provider_id
    ) pro_stats
    JOIN profiles pro ON pro_stats.provider_id = pro.id
    LEFT JOIN providers prov ON pro.id = prov.id;

    -- 5. TRANSACTIONS (from invoices)
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', inv.id,
        'booking_id', inv.booking_id,
        'amount', inv.total_amount,
        'currency', 'ILS',
        'type', 'payment',
        'status', inv.status,
        'payment_method', 'card',
        'stripe_id', inv.stripe_payment_intent_id,
        'created_at', inv.created_at
    ) ORDER BY inv.created_at DESC), '[]'::jsonb)
    INTO transactions_data
    FROM invoices inv
    JOIN bookings b ON inv.booking_id = b.id
    WHERE b.client_id = target_user_id;

    -- 6. MESSAGES (incluant supprimés depuis audit_log)
    SELECT COALESCE(jsonb_agg(msg ORDER BY created_at DESC), '[]'::jsonb)
    INTO messages_data
    FROM (
        -- Messages actifs
        SELECT 
            m.id, m.booking_id, m.content, 
            FALSE as is_deleted, NULL::timestamptz as deleted_at,
            m.created_at,
            CASE WHEN m.sender_id = target_user_id THEN b.provider_id ELSE b.client_id END as recipient_id,
            CASE WHEN m.sender_id = target_user_id THEN pro.full_name ELSE client.full_name END as recipient_name
        FROM messages m
        JOIN bookings b ON m.booking_id = b.id
        LEFT JOIN profiles pro ON b.provider_id = pro.id
        LEFT JOIN profiles client ON b.client_id = client.id
        WHERE m.sender_id = target_user_id
        
        UNION ALL
        
        -- Messages supprimés (audit log)
        SELECT 
            mal.message_id as id, mal.booking_id, mal.content,
            TRUE as is_deleted, mal.deleted_at,
            mal.deleted_at as created_at,
            mal.recipient_id,
            r.full_name as recipient_name
        FROM message_audit_log mal
        LEFT JOIN profiles r ON mal.recipient_id = r.id
        WHERE mal.sender_id = target_user_id
    ) msg;

    -- 7. SUPPORT TICKETS
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', st.id,
        'subject', st.subject,
        'status', st.status,
        'priority', st.priority,
        'category', st.category,
        'created_at', st.created_at,
        'updated_at', st.updated_at,
        'assigned_to', admin.full_name,
        'messages_count', (SELECT COUNT(*) FROM support_messages sm WHERE sm.ticket_id = st.id)
    ) ORDER BY st.created_at DESC), '[]'::jsonb)
    INTO tickets_data
    FROM support_tickets st
    LEFT JOIN profiles admin ON st.assigned_to = admin.id
    WHERE st.user_id = target_user_id;

    -- 8. ACTIVITY LOG
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', ual.id,
        'action', ual.action,
        'target_type', ual.target_type,
        'target_id', ual.target_id,
        'metadata', ual.metadata,
        'ip_address', ual.ip_address,
        'user_agent', ual.user_agent,
        'created_at', ual.created_at
    ) ORDER BY ual.created_at DESC LIMIT 100), '[]'::jsonb)
    INTO activity_data
    FROM user_activity_log ual
    WHERE ual.user_id = target_user_id;

    -- ASSEMBLE FINAL RESULT
    result := jsonb_build_object(
        'user', user_data,
        'stats', stats_data,
        'bookings', bookings_data,
        'pros_worked_with', pros_data,
        'transactions', transactions_data,
        'messages', messages_data,
        'support_tickets', tickets_data,
        'activity_log', activity_data
    );

    RETURN result;
END;
$$;

-- =============================================================================
-- EXEMPLE D'APPEL DEPUIS SUPABASE JS
-- =============================================================================
-- const { data, error } = await supabase.rpc('get_user_profile_360', {
--   target_user_id: 'uuid-de-l-utilisateur'
-- });
-- 
-- // data contiendra l'objet UserProfileFull complet
