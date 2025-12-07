-- ============================================================
-- SCRIPT DE NETTOYAGE D'URGENCE - BASE DE DONNÉES PRODUCTION
-- ============================================================
-- 
-- ⚠️ ATTENTION : CE SCRIPT EFFACE TOUTES LES DONNÉES UTILISATEUR
-- 
-- À EXÉCUTER UNIQUEMENT :
-- 1. Sur la VRAIE base de données de Production (pas DEV)
-- 2. APRÈS avoir vérifié que les données sont bien des données de TEST
-- 3. APRÈS avoir fait une sauvegarde
--
-- Comment utiliser :
-- 1. Aller sur https://supabase.com/dashboard
-- 2. Sélectionner votre projet PRODUCTION
-- 3. Aller dans SQL Editor
-- 4. Coller ce script et l'exécuter
-- ============================================================

-- ÉTAPE 1 : Vérification avant suppression (LIRE LES RÉSULTATS)
SELECT 
    'users' as table_name, COUNT(*) as row_count FROM auth.users
UNION ALL SELECT 
    'professionals' as table_name, COUNT(*) as row_count FROM professionals
UNION ALL SELECT 
    'bookings' as table_name, COUNT(*) as row_count FROM bookings
UNION ALL SELECT 
    'transactions' as table_name, COUNT(*) as row_count FROM transactions
UNION ALL SELECT 
    'reviews' as table_name, COUNT(*) as row_count FROM reviews
UNION ALL SELECT 
    'messages' as table_name, COUNT(*) as row_count FROM messages;

-- ÉTAPE 2 : Afficher les noms pour confirmation (données de test ?)
SELECT id, email, created_at FROM auth.users LIMIT 10;
SELECT id, first_name, last_name FROM professionals LIMIT 10;

-- ============================================================
-- ÉTAPE 3 : NETTOYAGE (DÉCOMMENTER POUR EXÉCUTER)
-- ============================================================

-- TRUNCATE TABLE 
--     messages,
--     reviews,
--     transactions,
--     bookings,
--     professionals
-- RESTART IDENTITY CASCADE;

-- Note : Pour effacer les utilisateurs auth.users, utiliser :
-- DELETE FROM auth.users;

-- ============================================================
-- VÉRIFICATION POST-NETTOYAGE
-- ============================================================

-- SELECT 
--     'users' as table_name, COUNT(*) as row_count FROM auth.users
-- UNION ALL SELECT 
--     'professionals' as table_name, COUNT(*) as row_count FROM professionals
-- UNION ALL SELECT 
--     'bookings' as table_name, COUNT(*) as row_count FROM bookings;
