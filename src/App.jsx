
import React, { useEffect } from 'react';
import CampaignWizard from './components/CampaignWizard.jsx';
import GalacticMap from './components/GalacticMap.jsx';
import { installGlobalClickSound } from './utils/globalClickSound.js';

export default function App(){
  const [config,setConfig]=React.useState(null);
  useEffect(()=>{ installGlobalClickSound({ volume:.6 }); }, []);
  return (<>
    {!config && <CampaignWizard onFinish={setConfig} />}
    {config && <GalacticMap config={config} onRestart={()=>setConfig(null)} />}
  </>);
}
