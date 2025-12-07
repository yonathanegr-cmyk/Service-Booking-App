
import { createClient } from '@supabase/supabase-js';

// Fonction helper pour récupérer les variables d'env de manière sécurisée
const getEnvVar = (key: string): string => {
  try {
    // @ts-ignore - Vite
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
    // @ts-ignore - Next.js / Create React App / Node
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
       // @ts-ignore
      return process.env[key];
    }
  } catch (e) {
    // Ignorer les erreurs d'accès
  }
  return '';
};

// REMPLACEZ CES VALEURS PAR VOS CLÉS SUPABASE RÉELLES
const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL') || 'https://votre-projet.supabase.co';
const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY') || 'votre-cle-publique';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
