// src/data/planetNames.js
export const prefixes = [
  "Sanctis", "Nova", "Vega", "Epsilon", "Omega", "Delta", "Astra", "Zenith", "Lumen", "Oblivion",
  "Aurora", "Nexus", "Orion", "Titan", "Helios", "Arcadia", "Celestis", "Nebula"
];

export const suffixes = [
  "Prime", "Secundus", "Tertius", "IV", "V", "X", "VII", "Station", "Colony", "Outpost",
  "Alpha", "Beta", "Gamma", "Omega", "Sanctum", "Haven", "Stronghold"
];

// Génération d'un nom unique
export function generatePlanetName(usedNames) {
  let name;
  let tries = 0;
  do {
    const pre = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suf = suffixes[Math.floor(Math.random() * suffixes.length)];
    name = `${pre} ${suf}`;
    tries++;
  } while (usedNames.has(name) && tries < 50);
  usedNames.add(name);
  return name;
}
