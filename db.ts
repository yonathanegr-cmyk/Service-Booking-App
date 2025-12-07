import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

function createMockClient(): SupabaseClient {
  const mockQuery = () => ({
    select: () => mockQuery(),
    insert: () => Promise.resolve({ data: null, error: { message: 'No Supabase connection' } }),
    update: () => mockQuery(),
    delete: () => Promise.resolve({ data: null, error: { message: 'No Supabase connection' } }),
    eq: () => mockQuery(),
    lte: () => mockQuery(),
    single: () => Promise.resolve({ data: null, error: { message: 'No Supabase connection' } }),
    order: () => Promise.resolve({ data: null, error: { message: 'No Supabase connection' } }),
    then: (resolve: (value: any) => void) => resolve({ data: null, error: { message: 'No Supabase connection' } })
  });

  return {
    from: () => mockQuery(),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    }
  } as unknown as SupabaseClient;
}

export const supabase: SupabaseClient = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : createMockClient();

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);

if (!isSupabaseConfigured) {
  console.warn('[DB] Supabase credentials not configured. Using mock client.');
}
