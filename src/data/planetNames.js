// src/data/planetNames.js

// 50+ préfixes (partie 1 du nom)
export const prefixes = [
  "Astra","Nova","Vega","Epsilon","Omega","Delta","Zenith","Lumen","Aurora","Nexus",
  "Orion","Titan","Helios","Arcadia","Celestis","Nebula","Solaris","Aether","Chronos","Hyperion",
  "Lyra","Draconis","Andromeda","Proxima","Altair","Rigel","Sirius","Polaris","Borealis","Meridian",
  "Horizon","Phoenix","Valkyrie","Atlas","Prometheus","Aeon","Seraph","Obsidian","Radiant","Umbra",
  "Quasar","Pulsar","Echo","Mythos","Vortex","Cygnus","Carina","Perseus","Arcturus","Callisto",
  "Icarus","Erebus","Nyx","Triton","Rhea","Ceres","Daedalus","Janus","Aquila","Volantis"
];

// 50+ suffixes (partie 2 du nom)
export const suffixes = [
  "Prime","Secundus","Tertius","Quartus","Quintus","VI","VII","VIII","IX","X",
  "XI","XII","Alpha","Beta","Gamma","Delta","Epsilon","Zeta","Theta","Sigma",
  "Omega","Station","Outpost","Colony","Haven","Sanctum","Stronghold","Reach","Gate","Relay",
  "Nexus","Port","Spire","Citadel","Bastion","Hold","Anchorage","Terminal","Platform","Harbor",
  "Arc","Ridge","Crest","Fields","Expanse","Drift","Frontier","Prospect","Primea","Array"
];

// Génère un nom unique en combinant préfixe + suffixe
export function generatePlanetName(usedNames) {
  let name; let tries = 0;
  do {
    const pre = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suf = suffixes[Math.floor(Math.random() * suffixes.length)];
    name = `${pre} ${suf}`;
    tries++;
  } while (usedNames.has(name) && tries < 200);
  usedNames.add(name);
  return name;
}
