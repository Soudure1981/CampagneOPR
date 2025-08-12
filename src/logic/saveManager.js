
const KEY='gd_campaign_save_v1';
export function saveCampaign(state){ try{ localStorage.setItem(KEY, JSON.stringify(state)); return true;}catch(e){console.error(e); return false;}}
export function loadCampaign(){ try{ const s=localStorage.getItem(KEY); return s?JSON.parse(s):null; }catch(e){ return null; } }
export function clearCampaign(){ try{ localStorage.removeItem(KEY);}catch(e){} }
export function exportJSON(state){ return JSON.stringify(state, null, 2); }
export function importJSON(text){ return JSON.parse(text); }
