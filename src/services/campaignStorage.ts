// src/services/campaignStorage.ts
import { supabase } from '../lib/supabaseClient';

const TABLE = 'campaign_states';
const SLUG = import.meta.env.VITE_CAMPAIGN_SLUG || 'default';

export type CampaignState = unknown; // remplace par ton vrai type si tu en as un

export async function loadState<T = CampaignState>(): Promise<T | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('data')
    .eq('slug', SLUG)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
    console.error('[loadState] error:', error);
    throw error;
  }
  return (data?.data ?? null) as T | null;
}

export async function saveState(state: CampaignState): Promise<void> {
  const payload = {
    slug: SLUG,
    data: state,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from(TABLE)
    .upsert(payload, { onConflict: 'slug' });

  if (error) {
    console.error('[saveState] error:', error);
    throw error;
  }
}
