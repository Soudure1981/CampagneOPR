import PLIST from '../data/planets.js';
import { generatePlanetName } from '../data/planetNames.js';

function rnd(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
function cheb(a,b){ return Math.max(Math.abs(a[0]-b[0]), Math.abs(a[1]-b[1])); }

export function generateMap({ gridSize, numPlanets }){
  const grid = Array.from({length:gridSize},()=>Array.from({length:gridSize},()=>({type:'empty'})));
  const planets=[]; const usedTypes=new Set();
  const usedNames=new Set();

  function pickValid(){
    const cand=[];
    for(let r=0;r<gridSize;r++){
      for(let c=0;c<gridSize;c++){
        if(grid[r][c].type!=='empty') continue;
        if(planets.every(p=> cheb([r,c], p) > 1 )) cand.push([r,c]);
      }
    }
    if(!cand.length) return null;
    return cand[rnd(0,cand.length-1)];
  }

  for(let i=0;i<numPlanets;i++){
    const pos=pickValid(); if(!pos){ console.warn('Non-adjacency saturated'); break; }
    let idx, guard=0;
    do{
      idx=rnd(0,PLIST.length-1);
      guard++; if(guard>200) break;
    }while(usedTypes.has(idx) && usedTypes.size<PLIST.length);
    usedTypes.add(idx);

    const t = PLIST[idx]; // { name: 'Océanique', img: '/assets/oceaniqueV2.png' }
    const [r,c]=pos;

    grid[r][c] = {
      type: 'planet',              // type de cellule
      name: generatePlanetName(usedNames),    // NOM ALÉATOIRE
      planetType: t.name,          // type “Océanique”, “Désertique”, etc.
      img: t.img,                  // sprite planète
      revealed: false,
      owner: null,
      vp: 1,
      terrain: '—',
      infrastructure: '—'
    };
    planets.push([r,c]);
  }

  // Stargates dans les coins
  grid[0][0] = { type:'stargate', revealed:true };
  grid[gridSize-1][gridSize-1] = { type:'stargate', revealed:true };

  return { grid };
}
