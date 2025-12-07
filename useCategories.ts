import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Category {
  id: string;
  name: string;
  nameHe: string;
  icon: string;
  color?: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

interface UseCategoriesResult {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const CACHE_KEY = 'beedy_categories_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheData {
  categories: Category[];
  timestamp: number;
}

const defaultCategories: Category[] = [
  { id: '1', name: 'cleaning', nameHe: 'ניקיון', icon: '🧹', color: '#3B82F6', isActive: true, sortOrder: 1 },
  { id: '2', name: 'plumbing', nameHe: 'אינסטלציה', icon: '🔧', color: '#6366F1', isActive: true, sortOrder: 2 },
  { id: '3', name: 'electrical', nameHe: 'חשמל', icon: '💡', color: '#F59E0B', isActive: true, sortOrder: 3 },
  { id: '4', name: 'beauty', nameHe: 'יופי', icon: '💅', color: '#EC4899', isActive: true, sortOrder: 4 },
  { id: '5', name: 'renovation', nameHe: 'שיפוצים', icon: '🔨', color: '#8B5CF6', isActive: true, sortOrder: 5 },
  { id: '6', name: 'gardening', nameHe: 'גינון', icon: '🌱', color: '#10B981', isActive: true, sortOrder: 6 },
  { id: '7', name: 'ac', nameHe: 'מיזוג', icon: '❄️', color: '#06B6D4', isActive: true, sortOrder: 7 },
  { id: '8', name: 'painting', nameHe: 'צביעה', icon: '🎨', color: '#F97316', isActive: true, sortOrder: 8 },
  { id: '9', name: 'moving', nameHe: 'הובלות', icon: '📦', color: '#84CC16', isActive: true, sortOrder: 9 },
];

function getCachedCategories(): Category[] | null {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const data: CacheData = JSON.parse(cached);
    const isExpired = Date.now() - data.timestamp > CACHE_TTL;
    
    if (isExpired) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return data.categories;
  } catch {
    return null;
  }
}

function setCachedCategories(categories: Category[]): void {
  try {
    const data: CacheData = {
      categories,
      timestamp: Date.now()
    };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Silently fail if sessionStorage is not available
  }
}

export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>(() => {
    return getCachedCategories() || defaultCategories;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    // Check if Supabase is properly configured
    const isSupabaseConfigured = typeof supabase?.from === 'function';
    
    if (!isSupabaseConfigured) {
      // Use default categories when Supabase is not configured
      setCategories(defaultCategories);
      setCachedCategories(defaultCategories);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const query = supabase.from('categories').select('id, name, name_he, icon, color, description, is_active, sort_order');
      
      // Check if query methods exist (mock client might not have them)
      if (typeof query?.eq !== 'function') {
        throw new Error('Supabase client not fully configured');
      }
      
      const { data, error: supabaseError } = await query
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      if (data && data.length > 0) {
        const mappedCategories: Category[] = data.map((row: any) => ({
          id: row.id,
          name: row.name,
          nameHe: row.name_he,
          icon: row.icon,
          color: row.color,
          description: row.description,
          isActive: row.is_active,
          sortOrder: row.sort_order
        }));

        setCategories(mappedCategories);
        setCachedCategories(mappedCategories);
      } else {
        setCategories(defaultCategories);
        setCachedCategories(defaultCategories);
      }
    } catch (err) {
      // Silent fallback to default categories
      setCategories(defaultCategories);
      setCachedCategories(defaultCategories);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = getCachedCategories();
    if (!cached) {
      fetchCategories();
    }
  }, [fetchCategories]);

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCategories
  };
}

export function getActiveCategories(): Category[] {
  const cached = getCachedCategories();
  return cached || defaultCategories;
}

export function getCategoryById(id: string): Category | undefined {
  const categories = getActiveCategories();
  return categories.find(cat => cat.id === id);
}

export function getCategoryByName(nameHe: string): Category | undefined {
  const categories = getActiveCategories();
  return categories.find(cat => cat.nameHe === nameHe);
}
