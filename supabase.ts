import { createClient, SupabaseClient } from '@supabase/supabase-js';

type ActiveEnv = 'dev' | 'prod';

const getEnv = (key: string): string => {
  try {
    return (import.meta as any).env?.[key] || '';
  } catch (e) {
    console.warn('Error accessing environment variables:', e);
    return '';
  }
};

const isProductionBuild = (): boolean => {
  try {
    return (import.meta as any).env?.PROD === true;
  } catch {
    return false;
  }
};

const getActiveEnv = (): ActiveEnv => {
  if (typeof window === 'undefined') {
    return isProductionBuild() ? 'prod' : 'dev';
  }
  
  const storedEnv = localStorage.getItem('beed_active_env') as ActiveEnv | null;
  
  if (storedEnv) {
    return storedEnv;
  }
  
  return isProductionBuild() ? 'prod' : 'dev';
};

export const setActiveEnv = (env: ActiveEnv): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('beed_active_env', env);
};

export const toggleEnv = (): void => {
  const current = getActiveEnv();
  const next = current === 'dev' ? 'prod' : 'dev';
  setActiveEnv(next);
  window.location.reload();
};

export const getCurrentEnv = (): ActiveEnv => getActiveEnv();

export const enableDevTools = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('beed_devtools_enabled', 'true');
    console.log('[Beedy] DevTools enabled. Refresh the page to see the switcher.');
  }
};

export const disableDevTools = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('beed_devtools_enabled');
    console.log('[Beedy] DevTools disabled.');
  }
};

const getSupabaseCredentials = (): { url: string; anonKey: string } => {
  const activeEnv = getActiveEnv();
  const isProdBuild = isProductionBuild();
  
  let url: string;
  let anonKey: string;
  
  if (activeEnv === 'prod') {
    url = getEnv('VITE_SUPABASE_URL_PROD');
    anonKey = getEnv('VITE_SUPABASE_ANON_KEY_PROD');
    
    if (isProdBuild && (!url || !anonKey)) {
      console.error('[Supabase] CRITICAL: PROD credentials missing in production build!');
      console.error('[Supabase] Set VITE_SUPABASE_URL_PROD and VITE_SUPABASE_ANON_KEY_PROD');
    }
    
    if (!url) url = getEnv('VITE_SUPABASE_URL');
    if (!anonKey) anonKey = getEnv('VITE_SUPABASE_ANON_KEY');
  } else {
    url = getEnv('VITE_SUPABASE_URL_DEV');
    anonKey = getEnv('VITE_SUPABASE_ANON_KEY_DEV');
    
    if (!url) url = getEnv('VITE_SUPABASE_URL');
    if (!anonKey) anonKey = getEnv('VITE_SUPABASE_ANON_KEY');
  }
  
  console.log(`[Supabase] Environment: ${activeEnv.toUpperCase()}`);
  console.log(`[Supabase] URL: ${url ? url.substring(0, 30) + '...' : 'NOT SET'}`);
  console.log(`[Supabase] Build mode: ${isProdBuild ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  
  if (isProdBuild && activeEnv === 'prod') {
    console.log('[Supabase] Production mode active - using PROD database only');
  }
  
  return { url, anonKey };
};

const createSupabaseClient = (): SupabaseClient | ReturnType<typeof createMockClient> => {
  const { url, anonKey } = getSupabaseCredentials();
  
  if (url && anonKey) {
    console.log(`[Supabase] ✅ Connected to ${getActiveEnv().toUpperCase()} database`);
    return createClient(url, anonKey);
  }
  
  console.log('[Supabase] ⚠️ No credentials configured. Using mock client with test data.');
  return createMockClient();
};

const createMockClient = () => ({
  from: () => ({
    select: () => Promise.resolve({ data: null, error: { message: 'No Supabase connection' } }),
    insert: () => Promise.resolve({ data: null, error: { message: 'No Supabase connection' } }),
    update: () => Promise.resolve({ data: null, error: { message: 'No Supabase connection' } }),
    delete: () => Promise.resolve({ data: null, error: { message: 'No Supabase connection' } }),
    eq: () => ({
      select: () => Promise.resolve({ data: null, error: { message: 'No Supabase connection' } }),
      update: () => Promise.resolve({ data: null, error: { message: 'No Supabase connection' } }),
      single: () => Promise.resolve({ data: null, error: { message: 'No Supabase connection' } })
    }),
    single: () => Promise.resolve({ data: null, error: { message: 'No Supabase connection' } }),
    order: () => ({
      limit: () => Promise.resolve({ data: null, error: { message: 'No Supabase connection' } })
    }),
    lte: () => ({
      eq: () => Promise.resolve({ data: null, error: { message: 'No Supabase connection' } })
    })
  }),
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'No Supabase connection' } }),
    signUp: () => Promise.resolve({ data: null, error: { message: 'No Supabase connection' } }),
    signOut: () => Promise.resolve({ error: null })
  }
} as any);

export const supabase = createSupabaseClient();

export const isUsingMockData = (): boolean => {
  const { url, anonKey } = getSupabaseCredentials();
  return !url || !anonKey;
};
