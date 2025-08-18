// src/services/campaignStorage.js
import { supabase } from '../lib/supabaseClient';

const TABLE = 'campaign_states';
const SLUG = import.meta.env.VITE_CAMPAIGN_SLUG || 'default';

export function getCurrentStateFallback() {
  try {
    if (typeof window !== 'undefined' && typeof window.__getCampaignState === 'function') {
      return window.__getCampaignState();
    }
  } catch {}
  try {
    const raw = localStorage.getItem('campaignState');
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function applyStateFallback(state) {
  try {
    if (typeof window !== 'undefined' && typeof window.__setCampaignState === 'function') {
      window.__setCampaignState(state);
      return;
    }
  } catch {}
  try {
    localStorage.setItem('campaignState', JSON.stringify(state ?? {}));
    window.dispatchEvent(new StorageEvent('storage', { key: 'campaignState' }));
  } catch {}
}

export async function loadState() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('data')
    .eq('slug', SLUG)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('[loadState] error:', error);
    throw error;
  }
  return data?.data ?? null;
}

export async function saveState(state) {
  const payload = { slug: SLUG, data: state ?? {}, updated_at: new Date().toISOString() };
  const { error } = await supabase
    .from(TABLE)
    .upsert(payload, { onConflict: 'slug' });
  if (error) {
    console.error('[saveState] error:', error);
    throw error;
  }
}
