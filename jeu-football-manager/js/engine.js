/* ============================================================
   MOTEUR — sélection du onze, forces d'équipe, simulation de match
   ============================================================ */
var FM = window.FM;

/* Compatibilité poste ↔ poste demandé (1 = parfait) */
function posFit(playerPos, slotPos){
  if (playerPos === slotPos) return 1;
  if (FM.POS_GROUP[playerPos] === FM.POS_GROUP[slotPos]) return 0.9;
  // Gardien uniquement gardien
  if (FM.POS_GROUP[slotPos] === "G" || FM.POS_GROUP[playerPos] === "G") return 0.4;
  return 0.72;
}

/* Choisit le meilleur onze pour la formation du club (glouton par slot) */
FM.autoPickXI = function(club){
  const slots = FM.FORMATIONS[club.formation];
  const used = new Set();
  const xi = [];
  for (const slot of slots){
    let best=null, bestScore=-1;
    for (const p of club.joueurs){
      if (used.has(p.id)) continue;
      const score = p.note * posFit(p.pos, slot) + p.forme*0.5;
      if (score > bestScore){ bestScore=score; best=p; }
    }
    if (best){ used.add(best.id); xi.push({ id:best.id, slot }); }
  }
  return xi;
};

/* Récupère l'objet joueur depuis un id dans un club */
FM.getPlayer = (club, id) => club.joueurs.find(p => p.id === id);

/* Force d'une ligne (déf / milieu / att) à partir du onze */
FM.teamStrength = function(club){
  let att=0, mid=0, def=0, gk=0, cnt={A:0,M:0,D:0,G:0};
  for (const s of club.onze){
    const p = FM.getPlayer(club, s.id);
    if (!p) continue;
    const eff = p.note * posFit(p.pos, s.slot) + p.forme + (p.moral-70)*0.1;
    const g = FM.POS_GROUP[s.slot];
    if (g==="G"){ gk += eff; cnt.G++; }
    else if (g==="D"){ def += eff; cnt.D++; }
    else if (g==="M"){ mid += eff; cnt.M++; }
    else { att += eff; cnt.A++; }
  }
  def = (def + gk*1.0) / Math.max(1, cnt.D + cnt.G);
  mid = mid / Math.max(1, cnt.M);
  att = att / Math.max(1, cnt.A);

  // Influence tactique
  const t = club.tactique;
  const mentBonus = (t.mentalite-1); // -1..1
  att += mentBonus*3;
  def -= mentBonus*2.5;
  const pressBonus = (t.pressing-1);
  mid += pressBonus*1.5;

  return {
    att, mid, def,
    global: Math.round((att*0.34 + mid*0.32 + def*0.34))
  };
};

/* Note moyenne d'un effectif (pour affichage) */
FM.squadRating = function(club){
  const xi = club.onze.map(s=>FM.getPlayer(club,s.id)).filter(Boolean);
  if (!xi.length) return 0;
  return Math.round(xi.reduce((a,p)=>a+p.note,0)/xi.length);
};

/* ---------- Simulation d'un match ----------
   Renvoie {domScore, extScore, events:[{min,club,joueur}]}     */
FM.simulateMatch = function(dom, ext, opts={}){
  const homeAdv = 3;
  const sD = FM.teamStrength(dom);
  const sE = FM.teamStrength(ext);

  // xG basé sur att vs def adverse + milieu (possession)
  const midDiff = (sD.mid - sE.mid);
  const homeXg = baseXg(sD.att + homeAdv, sE.def) * (1 + midDiff*0.012) * tempoMul(dom);
  const awayXg = baseXg(sE.att, sD.def + homeAdv*0.5) * (1 - midDiff*0.012) * tempoMul(ext);

  const domScore = poisson(Math.max(0.15, homeXg));
  const extScore = poisson(Math.max(0.15, awayXg));

  const events = [];
  addGoalEvents(events, dom, domScore, true);
  addGoalEvents(events, ext, extScore, false);
  events.sort((a,b)=>a.min-b.min);

  return { domScore, extScore, events, ratingDom:sD.global, ratingExt:sE.global };
};

function baseXg(att, def){
  const diff = att - def;                 // écart de niveau
  return 1.25 + diff*0.055;               // ~1.25 but de base + écart
}
function tempoMul(club){ return 0.92 + club.tactique.tempo*0.08; }

function poisson(lambda){
  const L = Math.exp(-lambda);
  let k=0, p=1;
  do { k++; p *= FM._rnd(); } while (p > L);
  return Math.min(7, k-1);
}

function addGoalEvents(events, club, n, isHome){
  // Buteurs pondérés par poste (attaquants plus probables)
  const weights = club.onze.map(s=>{
    const p = FM.getPlayer(club,s.id); if(!p) return null;
    const g = FM.POS_GROUP[s.slot];
    const w = g==="A"?5 : g==="M"?2.2 : g==="D"?0.6 : 0.05;
    return { p, w };
  }).filter(Boolean);
  const total = weights.reduce((a,x)=>a+x.w,0);
  for (let i=0;i<n;i++){
    let r = FM._rnd()*total, chosen=weights[0].p;
    for (const x of weights){ r-=x.w; if(r<=0){ chosen=x.p; break; } }
    events.push({ min: FM._ri(1,90), club: club.nom, clubId: club.id, joueur: chosen.nom, joueurId: chosen.id, isHome });
  }
}
