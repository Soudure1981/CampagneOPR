import React, { useEffect } from 'react';
import CampaignWizard from './components/CampaignWizard.jsx';
import GalacticMap from './components/GalacticMap.jsx';
import { installGlobalClickSound } from './utils/globalClickSound.js';
import { supabase } from './lib/supabaseClient.js'; // <-- ajout

export default function App(){
  const [config,setConfig]=React.useState(null);

  // Son de clic (déjà présent)
  useEffect(()=>{ installGlobalClickSound({ volume:.6 }); }, []);

  // Test Supabase (temporaire)
  useEffect(()=>{
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? 'OK' : 'MANQUANTE');
    console.log('Supabase client prêt ?', !!supabase);
  },[]);

  return (
    <>
      {!config && <CampaignWizard onFinish={setConfig} />}
      {config && <GalacticMap config={config} onRestart={()=>setConfig(null)} />}
    </>
  );
}
