
import clickUrl from '../assets/sounds/click.wav';

let installed=false;
export function installGlobalClickSound({ volume=.6, selector='button,[data-click-sound]', exclude='[data-no-sound]' }={}){
  if(installed) return; installed=true;
  const poolSize=6;
  const pool = Array.from({length:poolSize}, ()=>{
    const a=new Audio(clickUrl); a.volume=volume; a.preload='auto'; return a;
  });
  let i=0;
  function play(){ const a=pool[i]; i=(i+1)%pool.length; try{ a.currentTime=0; a.play(); }catch(e){} }
  document.addEventListener('pointerup', (ev)=>{
    if(ev.button!==0) return;
    const el = ev.target.closest(selector);
    if(!el || el.matches(exclude)) return;
    play();
  }, true);
}
