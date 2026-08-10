/* ==========================================================================
   NBA My Era — Moteur de jeu (RNG, joueurs, simulation, saison, franchise)
   ========================================================================== */

/* ----------------------------- Utilitaires ------------------------------- */
const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'];
const SALARY_CAP = 141.0;     // en M$
const LUXURY_TAX = 172.0;     // seuil taxe de luxe (M$)
const MIN_SALARY = 2.1;
const MAX_SALARY = 55.0;

/* --------------------------- Schémas tactiques --------------------------- */
// Chaque schéma applique des multiplicateurs à la simulation.
const OFF_SCHEMES = {
  balanced:   { name: 'Équilibré',            pace: 1.00, three: 1.00, inside: 1.00, ast: 1.00, tov: 1.00, star: 1.00, desc: "Attaque équilibrée, sans excès." },
  paceSpace:  { name: 'Pace & Space',         pace: 1.05, three: 1.24, inside: 0.88, ast: 1.05, tov: 1.00, star: 1.00, desc: "Priorité au tir à 3 points et à l'espacement." },
  sevenSec:   { name: 'Seven Seconds',        pace: 1.14, three: 1.06, inside: 1.02, ast: 1.00, tov: 1.10, star: 1.00, desc: "Rythme très élevé, jeu en transition." },
  insideOut:  { name: 'Jeu intérieur',        pace: 0.97, three: 0.82, inside: 1.22, ast: 0.96, tov: 0.97, star: 1.00, desc: "Domination dans la raquette, jeu poste bas." },
  isoStars:   { name: 'Iso — stars',          pace: 0.98, three: 1.00, inside: 1.06, ast: 0.82, tov: 0.94, star: 1.35, desc: "Le ballon aux options prioritaires, isolations." },
  motion:     { name: 'Motion (mouvement)',   pace: 1.01, three: 1.06, inside: 1.06, ast: 1.22, tov: 0.88, star: 0.9,  desc: "Circulation du ballon, beaucoup de passes, peu de pertes." },
};
const DEF_SCHEMES = {
  balanced:   { name: 'Équilibré',            opp3: 1.00, oppInside: 1.00, stl: 1.00, blk: 1.00, foul: 1.00, oppTov: 1.00, pace: 1.00, desc: "Défense standard." },
  manToMan:   { name: 'Homme à homme',        opp3: 0.98, oppInside: 0.98, stl: 1.02, blk: 1.00, foul: 1.05, oppTov: 1.02, pace: 1.00, desc: "Pression individuelle, solide partout." },
  switchAll:  { name: 'Switch systématique',  opp3: 0.90, oppInside: 1.06, stl: 1.02, blk: 0.95, foul: 1.02, oppTov: 1.00, pace: 1.00, desc: "Ferme le périmètre, concède un peu l'intérieur." },
  zone23:     { name: 'Zone 2-3',             opp3: 1.10, oppInside: 0.84, stl: 1.06, blk: 1.05, foul: 0.95, oppTov: 1.04, pace: 0.98, desc: "Protège la raquette, laisse le tir extérieur." },
  drop:       { name: 'Drop (protège l\'arceau)', opp3: 1.07, oppInside: 0.83, stl: 0.98, blk: 1.18, foul: 1.00, oppTov: 0.98, pace: 0.99, desc: "Le pivot recule et protège le cercle." },
  press:      { name: 'Pressing tout terrain', opp3: 1.03, oppInside: 1.02, stl: 1.35, blk: 1.00, foul: 1.16, oppTov: 1.22, pace: 1.10, desc: "Force les pertes de balle mais fatigue et concède des fautes." },
};
const DEFAULT_OFF = 'balanced', DEFAULT_DEF = 'manToMan';
// Multiplicateurs d'usage selon le rang dans la hiérarchie offensive (option 1, 2, 3…)
const PRIORITY_MULT = [1.65, 1.35, 1.15, 1.02, 0.95];

const rnd = () => Math.random();
const randInt = (a, b) => Math.floor(rnd() * (b - a + 1)) + a;
const pick = arr => arr[Math.floor(rnd() * arr.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const round1 = v => Math.round(v * 10) / 10;
// Loi normale (Box–Muller) pour donner du réalisme aux performances
function gauss(mean, sd) {
  let u = 0, v = 0;
  while (u === 0) u = rnd();
  while (v === 0) v = rnd();
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

let _pid = 1;
const nextPid = () => _pid++;

/* --------------------------- Génération joueurs -------------------------- */
function genName() {
  return pick(FIRST_NAMES) + ' ' + pick(LAST_NAMES);
}

// Crée un joueur. teamStrength (0..1) biaise le niveau moyen de la recrue.
function makePlayer(pos, opts = {}) {
  const age = opts.age != null ? opts.age : randInt(19, 34);
  // potentiel plafond selon l'âge
  const base = opts.base != null ? opts.base : randInt(58, 88);

  // Attributs par archétype selon le poste
  const g = () => clamp(Math.round(gauss(base, 6)), 40, 99);
  let shooting, inside, playmaking, rebounding, defense, athletic;
  switch (pos) {
    case 'PG': shooting=g(); inside=clamp(g()-8,40,99); playmaking=clamp(g()+8,40,99); rebounding=clamp(g()-15,40,99); defense=g(); athletic=g(); break;
    case 'SG': shooting=clamp(g()+5,40,99); inside=g(); playmaking=g(); rebounding=clamp(g()-12,40,99); defense=g(); athletic=g(); break;
    case 'SF': shooting=g(); inside=clamp(g()+3,40,99); playmaking=clamp(g()-3,40,99); rebounding=g(); defense=g(); athletic=g(); break;
    case 'PF': shooting=clamp(g()-4,40,99); inside=clamp(g()+8,40,99); playmaking=clamp(g()-8,40,99); rebounding=clamp(g()+8,40,99); defense=g(); athletic=g(); break;
    case 'C':  shooting=clamp(g()-12,40,99); inside=clamp(g()+12,40,99); playmaking=clamp(g()-12,40,99); rebounding=clamp(g()+14,40,99); defense=clamp(g()+4,40,99); athletic=g(); break;
  }
  const stamina = clamp(Math.round(gauss(80, 8)), 55, 99);

  const p = {
    id: nextPid(),
    name: genName(),
    pos, age,
    shooting, inside, playmaking, rebounding, defense, athletic, stamina,
    potential: clamp(base + randInt(0, Math.max(0, 24 - age)), base, 99),
    // Contrat
    salary: 0, years: 0,
    // Cumul saison courante (réinitialisé chaque saison)
    stats: emptyStats(),
    // Historique carrière (par saison)
    history: [],
    injuryGames: 0,   // matchs d'indisponibilité restants (blessure)
    _injuryDesc: null,
  };
  p.ovr = overall(p);
  p.salary = opts.salary != null ? opts.salary : contractValue(p.ovr, age);
  p.years = opts.years != null ? opts.years : randInt(1, 4);
  return p;
}

function overall(p) {
  // Pondération par poste
  const w = {
    PG: [.28,.10,.28,.05,.17,.12], SG: [.30,.16,.14,.06,.20,.14],
    SF: [.24,.18,.14,.12,.20,.12], PF: [.16,.26,.08,.20,.22,.08],
    C:  [.10,.30,.06,.26,.24,.04],
  }[p.pos];
  const v = w[0]*p.shooting + w[1]*p.inside + w[2]*p.playmaking + w[3]*p.rebounding + w[4]*p.defense + w[5]*p.athletic;
  return clamp(Math.round(v), 40, 99);
}

// Valeur de contrat estimée (M$) selon overall + âge
function contractValue(ovr, age) {
  let v;
  if (ovr >= 90) v = 45 + (ovr - 90) * 3;
  else if (ovr >= 82) v = 25 + (ovr - 82) * 2.5;
  else if (ovr >= 75) v = 12 + (ovr - 75) * 1.8;
  else if (ovr >= 68) v = 4 + (ovr - 68) * 1.1;
  else v = MIN_SALARY;
  if (age >= 33) v *= 0.85;
  if (age <= 22) v *= 0.9;
  return round1(clamp(v, MIN_SALARY, MAX_SALARY));
}

function emptyStats() {
  return { gp:0, min:0, pts:0, fgm:0, fga:0, tpm:0, tpa:0, ftm:0, fta:0,
           oreb:0, dreb:0, ast:0, stl:0, blk:0, tov:0, pf:0 };
}

/* ---------------------------- Effectif équipe ---------------------------- */
function makeRoster(teamStrength) {
  // teamStrength: 0.35 (faible) → 0.9 (contender). Décale le niveau moyen.
  const roster = [];
  const shift = Math.round((teamStrength - 0.6) * 30);
  // 3 joueurs par poste + quelques rôles => 15 joueurs
  const layout = ['PG','SG','SF','PF','C','PG','SG','SF','PF','C','SG','SF','PF','C','PG'];
  layout.forEach((pos, i) => {
    const tier = i < 5 ? randInt(6, 18) : (i < 10 ? randInt(-4, 8) : randInt(-14, -2));
    const base = clamp(66 + shift + tier, 52, 95);
    const age = i < 5 ? randInt(21, 32) : randInt(19, 35);
    roster.push(makePlayer(pos, { base, age }));
  });
  return roster;
}

// Crée un joueur à partir d'une entrée d'effectif réel (nom/poste/note fournis)
function makePlayerReal(e) {
  const p = makePlayer(e.pos, { base: e.ovr, age: e.age != null ? e.age : randInt(22, 32) });
  p.name = e.n;
  p.ovr = clamp(e.ovr, 40, 99);            // respecter la note fournie
  p.potential = Math.max(p.potential, p.ovr, e.pot || 0);
  if ((e.age || 30) <= 23) p.potential = Math.max(p.potential, clamp(p.ovr + randInt(3, 9), p.ovr, 99));
  p.salary = contractValue(p.ovr, p.age);
  p.years = randInt(1, 4);
  return p;
}

// Effectif d'une équipe : UNIQUEMENT des joueurs réels (aucun nom généré).
function makeRosterForTeam(teamId, strength) {
  const real = (typeof REAL_ROSTERS !== 'undefined') ? REAL_ROSTERS[teamId] : null;
  if (!real || !real.length) return makeRoster(strength);
  return real.map(makePlayerReal);
}

// Construit l'univers : toutes les équipes avec leur effectif + rotation auto
function buildLeague(userTeamId) {
  const strengths = {};
  TEAMS.forEach(t => strengths[t.id] = 0.4 + rnd() * 0.5);
  const teams = {};
  TEAMS.forEach(t => {
    const roster = makeRosterForTeam(t.id, strengths[t.id]);
    // Schéma par défaut adapté à l'effectif
    const off = suggestOffScheme(roster), def = suggestDefScheme(roster);
    teams[t.id] = {
      id: t.id,
      roster,
      lineup: autoLineup(roster),   // 5 titulaires (ids)
      minutes: {},                  // id -> minutes cible
      priorities: [],               // hiérarchie offensive (ids), calculée ci-dessous
      offScheme: off, defScheme: def,
      w: 0, l: 0, streak: 0,
      ptsFor: 0, ptsAgn: 0,
    };
    autoMinutes(teams[t.id]);
    teams[t.id].priorities = autoPriorities(teams[t.id]);
  });
  // Picks de draft échangeables : chaque équipe possède ses 1er & 2e tours des 3 prochaines années
  const startSeason = 2026;
  TEAMS.forEach(t => {
    teams[t.id].picks = [];
    for (let y = 1; y <= 3; y++) {
      teams[t.id].picks.push({ kind: 'pick', year: startSeason + y, round: 1, from: t.id });
      teams[t.id].picks.push({ kind: 'pick', year: startSeason + y, round: 2, from: t.id });
    }
  });
  return teams;
}

// Qui possède le pick (année, tour) issu de l'équipe origId ? (défaut : l'équipe d'origine)
function resolvePickOwner(gameState, year, round, origId) {
  for (const tid in gameState.teams) {
    if ((gameState.teams[tid].picks || []).some(pk => pk.year === year && pk.round === round && pk.from === origId))
      return tid;
  }
  return origId;
}

// Suggère un schéma offensif selon les forces de l'effectif
function suggestOffScheme(roster) {
  const top = [...roster].sort((a, b) => b.ovr - a.ovr).slice(0, 8);
  const avgShoot = top.reduce((s, p) => s + p.shooting, 0) / (top.length || 1);
  const avgInside = top.reduce((s, p) => s + p.inside, 0) / (top.length || 1);
  const star = top[0];
  if (star && star.ovr >= 90) return 'isoStars';
  if (avgShoot >= 80) return 'paceSpace';
  if (avgInside >= 82) return 'insideOut';
  return 'balanced';
}
function suggestDefScheme(roster) {
  const top = [...roster].sort((a, b) => b.ovr - a.ovr).slice(0, 8);
  const bigs = top.filter(p => p.pos === 'C' || p.pos === 'PF');
  const rim = bigs.length ? bigs.reduce((s, p) => s + p.athletic + p.defense, 0) / (bigs.length * 2) : 70;
  if (rim >= 82) return 'drop';
  return 'manToMan';
}

// Hiérarchie offensive automatique : par overall + usage offensif
function autoPriorities(team) {
  return [...team.roster]
    .filter(p => (team.minutes[p.id] || 0) > 0)
    .sort((a, b) => {
      const ua = a.ovr + (a.shooting + a.inside + a.playmaking) / 30;
      const ub = b.ovr + (b.shooting + b.inside + b.playmaking) / 30;
      return ub - ua;
    })
    .slice(0, 8)
    .map(p => p.id);
}

// Choisit les 5 meilleurs par poste pour le cinq de départ
function autoLineup(roster) {
  const lineup = {};
  const used = new Set();
  POSITIONS.forEach(pos => {
    const cand = roster.filter(p => p.pos === pos && !used.has(p.id))
                       .sort((a,b) => b.ovr - a.ovr);
    if (cand[0]) { lineup[pos] = cand[0].id; used.add(cand[0].id); }
  });
  // combler les postes vides avec les meilleurs restants
  POSITIONS.forEach(pos => {
    if (!lineup[pos]) {
      const cand = roster.filter(p => !used.has(p.id)).sort((a,b)=>b.ovr-a.ovr);
      if (cand[0]) { lineup[pos] = cand[0].id; used.add(cand[0].id); }
    }
  });
  return lineup;
}

// Répartit 240 minutes selon overall (titulaires priorisés)
function autoMinutes(team) {
  const starters = new Set(Object.values(team.lineup));
  const sorted = [...team.roster].sort((a,b) => {
    const sa = starters.has(a.id) ? 100 : 0, sb = starters.has(b.id) ? 100 : 0;
    return (sb + b.ovr) - (sa + a.ovr);
  });
  team.minutes = {};
  // Répartition type: 34,32,30,28,26 titulaires ; bancs 18,16,12,8,6 ; reste 0
  const dist = [34, 32, 31, 29, 26, 20, 16, 12, 10, 8, 6, 0, 0, 0, 0];
  let total = 0;
  sorted.forEach((p, i) => { const m = dist[i] || 0; team.minutes[p.id] = m; total += m; });
  // normaliser à 240
  const scale = 240 / (total || 1);
  sorted.forEach(p => { team.minutes[p.id] = Math.round(team.minutes[p.id] * scale); });
  return team;
}

function playerById(team, id) { return team.roster.find(p => p.id === id); }
function teamOverall(team) {
  const rot = team.roster.filter(p => (team.minutes[p.id]||0) > 0)
                         .sort((a,b)=>b.ovr-a.ovr).slice(0, 9);
  if (!rot.length) return 60;
  // moyenne pondérée par minutes du top 9
  let s = 0, w = 0;
  rot.forEach(p => { const m = team.minutes[p.id]||1; s += p.ovr*m; w += m; });
  return Math.round(s / (w||1));
}
function teamSalary(team) {
  return round1(team.roster.reduce((s,p)=>s+p.salary, 0));
}

/* --------------------------- Simulation de match ------------------------- */
function schemeOff(team) { return OFF_SCHEMES[team.offScheme] || OFF_SCHEMES.balanced; }
function schemeDef(team) { return DEF_SCHEMES[team.defScheme] || DEF_SCHEMES.balanced; }

// Simule un match complet. Renvoie {home:{score,box}, away:{score,box}, ot}
function simGame(home, away, opts = {}) {
  const H = genTeamBox(home, away, 1);
  const A = genTeamBox(away, home, 1);
  H.score += randInt(1, 4);   // avantage du terrain
  let ot = 0;
  while (H.score === A.score) {
    if (rnd() < 0.5) H.score += randInt(2, 3); else A.score += randInt(2, 3);
    if (++ot > 4) H.score += 1;
  }
  return { home: H, away: A, ot };
}

// Box score d'une équipe pour une fraction de match (portion=1 → match entier ;
// 0.25 → un quart-temps). Intègre le schéma offensif + la hiérarchie de l'équipe,
// et le schéma défensif de l'adversaire.
function genTeamBox(team, opp, portion = 1) {
  const off = schemeOff(team);
  const oppD = schemeDef(opp);
  const oppDefR = defenseRating(opp);

  const healthy = p => !(p.injuryGames > 0);
  const rot = team.roster.filter(p => (team.minutes[p.id] || 0) > 0 && healthy(p));
  const list = rot.length >= 5 ? rot
    : [...team.roster].filter(healthy).sort((a, b) => b.ovr - a.ovr).slice(0, 8);
  const prioRank = {};
  (team.priorities || []).forEach((id, i) => { prioRank[id] = i; });

  const box = list.map(p => ({ p, s: emptyStats() }));
  box.forEach(b => {
    const m = clamp(team.minutes[b.p.id] || 0, 0, 40);
    let usage = 0.4 + (b.p.shooting + b.p.inside + b.p.playmaking) / 300;
    const r = prioRank[b.p.id];
    if (r != null) {
      usage *= PRIORITY_MULT[Math.min(r, PRIORITY_MULT.length - 1)];
      if (r < 2) usage *= off.star;   // iso stars amplifie les 2 premières options
    }
    b.weight = m * usage;
    b.min = m * portion;
  });
  const totW = box.reduce((s, b) => s + b.weight, 0) || 1;

  const basePoss = 100 * off.pace * oppD.pace;
  const possessions = Math.max(4, gauss(basePoss, 3) * portion);

  box.forEach(b => {
    const share = b.weight / totW;
    const poss = share * possessions;
    const p = b.p, st = b.s;

    const fgaMean = poss * 0.95;
    const fga = Math.max(0, Math.round(gauss(fgaMean, Math.max(0.6, fgaMean * 0.2))));
    let threeRate = clamp((p.shooting - 55) / 90, 0.05, 0.62) * (p.pos === 'C' ? 0.4 : 1) * off.three * oppD.opp3;
    threeRate = clamp(threeRate, 0.02, 0.82);
    const tpa = Math.round(fga * threeRate);
    const twoA = fga - tpa;

    const defAdj = (oppDefR - 75) * 0.0035;
    let two_pct = (clamp(0.40 + (p.inside - 60) * 0.0032 - defAdj, 0.30, 0.66)) * off.inside * oppD.oppInside;
    two_pct = clamp(two_pct, 0.27, 0.70);
    let three_pct = clamp(0.30 + (p.shooting - 65) * 0.0032 - defAdj, 0.22, 0.47) * (0.55 + 0.45 * off.three);
    three_pct = clamp(three_pct, 0.20, 0.48);

    let fgm2 = 0; for (let i = 0; i < twoA; i++) if (rnd() < two_pct) fgm2++;
    let tpm = 0; for (let i = 0; i < tpa; i++) if (rnd() < three_pct) tpm++;

    const ftTrips = Math.max(0, Math.round(gauss(poss * 0.14 * oppD.foul, 1.0)));
    const fta = ftTrips * 2;
    const ft_pct = clamp(0.62 + (p.shooting - 55) * 0.004, 0.5, 0.94);
    let ftm = 0; for (let i = 0; i < fta; i++) if (rnd() < ft_pct) ftm++;

    st.fga = twoA + tpa; st.fgm = fgm2 + tpm;
    st.tpa = tpa; st.tpm = tpm;
    st.fta = fta; st.ftm = ftm;
    st.pts = fgm2 * 2 + tpm * 3 + ftm;

    st.ast = Math.max(0, Math.round(gauss(poss * (p.playmaking - 50) / 240 * off.ast, 1.4)));
    const rebW = (p.rebounding - 40) / 60;
    st.oreb = Math.max(0, Math.round(gauss(b.min * 0.05 * rebW, 1)));
    st.dreb = Math.max(0, Math.round(gauss(b.min * 0.13 * rebW, 1.3)));
    st.stl = Math.max(0, Math.round(gauss(b.min * 0.03 * (p.defense - 40) / 50, 0.7)));
    st.blk = Math.max(0, Math.round(gauss(b.min * 0.03 * (p.athletic - 40) / 50 * (p.pos === 'C' ? 1.8 : 1), 0.7)));
    st.tov = Math.max(0, Math.round(gauss(poss * 0.13 * off.tov * oppD.oppTov, 1.1)));
    st.pf = Math.max(0, Math.round(gauss(b.min * 0.07, 1)));
    st.min = b.min;
  });

  const score = box.reduce((s, b) => s + b.s.pts, 0);
  return { score, box };
}

/* ------------------------------- Blessures ------------------------------- */
const INJURIES = [
  'entorse de la cheville', 'élongation à la cuisse', 'contusion au genou', 'claquage aux ischios',
  'tendinite', 'commotion', 'douleur au bas du dos', 'entorse du poignet', 'foulure du pied',
  'inflammation au genou', 'étirement à l\'aine', 'contusion à l\'épaule',
];
// Décrémente les blessures de toute la ligue (un jour de calendrier)
function healInjuries(gameState) {
  Object.values(gameState.teams).forEach(t => t.roster.forEach(p => {
    if (p.injuryGames > 0) { p.injuryGames--; if (p.injuryGames <= 0) { p.injuryGames = 0; p._injuryDesc = null; } }
  }));
}
// Génère d'éventuelles blessures pour une équipe qui vient de jouer. Renvoie la liste des nouvelles.
function maybeInjure(team) {
  const out = [];
  team.roster.forEach(p => {
    if (p.injuryGames > 0) return;
    const load = clamp((team.minutes[p.id] || 0) / 34, 0, 1.2);
    const risk = 0.004 * load;                 // ~0.4% pondéré par les minutes
    if (rnd() < risk) {
      p.injuryGames = randInt(2, 24);
      p._injuryDesc = pick(INJURIES);
      out.push({ id: p.id, name: p.name, games: p.injuryGames, desc: p._injuryDesc });
    }
  });
  return out;
}

// Fusionne des box scores partiels (pour le jeu par quart-temps)
function newBox() { return { score: 0, box: [] }; }
function mergeBox(target, add) {
  add.box.forEach(b => {
    let t = target.box.find(x => x.p.id === b.p.id);
    if (!t) { t = { p: b.p, s: emptyStats() }; target.box.push(t); }
    for (const k in b.s) t.s[k] += b.s[k];
  });
  target.score += add.score;
  return target;
}

function defenseRating(team) {
  const rot = team.roster.filter(p => (team.minutes[p.id]||0) > 0)
                         .sort((a,b)=>b.ovr-a.ovr).slice(0, 8);
  if (!rot.length) return 72;
  let s=0,w=0; rot.forEach(p=>{const m=team.minutes[p.id]||1; s+=p.defense*m; w+=m;});
  return s/(w||1);
}

// Applique un résultat de match aux cumuls des équipes & joueurs
function applyGameResult(gameState, homeId, awayId, res) {
  const H = gameState.teams[homeId], A = gameState.teams[awayId];
  const hWin = res.home.score > res.away.score;
  H.w += hWin?1:0; H.l += hWin?0:1;
  A.w += hWin?0:1; A.l += hWin?1:0;
  H.ptsFor += res.home.score; H.ptsAgn += res.away.score;
  A.ptsFor += res.away.score; A.ptsAgn += res.home.score;
  H.streak = hWin ? Math.max(1, H.streak+1) : Math.min(-1, H.streak-1);
  A.streak = hWin ? Math.min(-1, A.streak-1) : Math.max(1, A.streak+1);
  accumulate(H, res.home.box);
  accumulate(A, res.away.box);
}
function accumulate(team, box) {
  box.forEach(b => {
    const p = playerById(team, b.p.id); if (!p) return;
    const s = p.stats; const x = b.s;
    s.gp++; s.min+=x.min; s.pts+=x.pts; s.fgm+=x.fgm; s.fga+=x.fga;
    s.tpm+=x.tpm; s.tpa+=x.tpa; s.ftm+=x.ftm; s.fta+=x.fta;
    s.oreb+=x.oreb; s.dreb+=x.dreb; s.ast+=x.ast; s.stl+=x.stl;
    s.blk+=x.blk; s.tov+=x.tov; s.pf+=x.pf;
  });
}

/* ------------------------------ Calendrier ------------------------------- */
// Génère un calendrier équilibré (chaque équipe ~ nbGames matchs)
function buildSchedule(nbGames = 82) {
  const ids = TEAMS.map(t => t.id);
  const games = [];  // {home, away}
  // Round-robin double, puis on limite/complète
  for (let i=0;i<ids.length;i++){
    for (let j=0;j<ids.length;j++){
      if (i===j) continue;
      games.push({ home: ids[i], away: ids[j] });   // 29*2 = 58 par équipe environ
    }
  }
  // compléter jusqu'à ~nbGames en dupliquant des affrontements aléatoires
  const perTeam = {}; ids.forEach(id=>perTeam[id]=0);
  games.forEach(g=>{perTeam[g.home]++; perTeam[g.away]++;});
  let guard = 0;
  while (Math.min(...ids.map(id=>perTeam[id])) < nbGames && guard++ < 5000) {
    const a = pick(ids); let b = pick(ids); if (a===b) continue;
    if (perTeam[a] >= nbGames || perTeam[b] >= nbGames) continue;
    games.push({ home: rnd()<0.5?a:b, away: rnd()<0.5?b:a, _f:a, _s:b });
    // corriger home/away pour ne pas avoir home==away
    const last = games[games.length-1];
    last.home = a; last.away = b; if (rnd()<0.5){last.home=b;last.away=a;}
    perTeam[a]++; perTeam[b]++;
  }
  // Mélanger puis regrouper par "journées" (jours) : chaque équipe joue au plus 1 fois/jour
  shuffle(games);
  const days = [];
  const remaining = games.slice();
  while (remaining.length) {
    const day = []; const busy = new Set();
    for (let k=0; k<remaining.length; ) {
      const g = remaining[k];
      if (!busy.has(g.home) && !busy.has(g.away)) {
        day.push(g); busy.add(g.home); busy.add(g.away);
        remaining.splice(k,1);
      } else k++;
      if (day.length >= 15) break;
    }
    days.push(day);
  }
  return days; // tableau de journées, chaque journée = tableau de {home,away}
}
function shuffle(a){ for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]];} }

/* ------------------------------ Classements ------------------------------ */
function standings(gameState, conf) {
  return TEAMS.filter(t => !conf || t.conf === conf)
    .map(t => {
      const s = gameState.teams[t.id];
      return { team: t, ...s, pct: s.w+s.l ? s.w/(s.w+s.l) : 0,
               diff: s.ptsFor - s.ptsAgn };
    })
    .sort((a,b) => b.pct - a.pct || b.diff - a.diff);
}

/* ------------------------------ Transferts ------------------------------- */
// Valeur d'échange d'un joueur (barème non linéaire, jeunesse & potentiel valorisés)
function tradeValue(p) {
  if (!p) return 0;
  const ageAdj = p.age <= 23 ? 1.22 : p.age <= 26 ? 1.08 : p.age <= 30 ? 1.0 : p.age <= 33 ? 0.82 : 0.62;
  const potAdj = 1 + Math.max(0, (p.potential || p.ovr) - p.ovr) * 0.012; // marge de progression
  return Math.pow(Math.max(0, p.ovr - 45), 1.9) * ageAdj * potAdj;
}
// Valeur d'un pick de draft futur : dépend de la faiblesse (probable) de l'équipe d'origine
function pickValue(gameState, pk) {
  const orig = gameState.teams[pk.from];
  const ovr = orig ? teamOverall(orig) : 78;
  // équipe faible -> pick élevé -> grande valeur
  const base = clamp(120 - (ovr - 70) * 6, 10, 130);
  const yearsOut = Math.max(0, (pk.year || gameState.season + 1) - (gameState.season));
  const round = pk.round || 1;
  const roundAdj = round === 1 ? 1 : 0.28;
  const distAdj = Math.pow(0.92, yearsOut);   // les picks lointains valent un peu moins
  return base * roundAdj * distAdj;
}
function assetValue(gameState, teamId, asset) {
  if (asset.kind === 'pick') return pickValue(gameState, asset);
  return tradeValue(playerById(gameState.teams[teamId], asset.id));
}

// Somme des salaires sortants d'une liste d'assets joueurs
function outgoingSalary(team, assets) {
  return assets.filter(a => a.kind === 'player')
               .reduce((s, a) => s + (playerById(team, a.id)?.salary || 0), 0);
}
// Règle d'équilibre salarial simplifiée (inspirée NBA) : l'entrant ≤ 125% du sortant + 7.5 M$
function salaryMatchOk(outSal, inSal) {
  if (inSal <= outSal * 1.25 + 7.5) return true;
  if (outSal <= inSal * 1.25 + 7.5) return true; // l'autre sens (équipe qui reçoit moins)
  return false;
}

// Besoin positionnel d'une équipe (0..1) : plus c'est haut, plus elle manque à ce poste
function positionalNeed(team, pos) {
  const atPos = team.roster.filter(p => p.pos === pos).sort((a, b) => b.ovr - a.ovr);
  const best = atPos[0]?.ovr || 55;
  return clamp((82 - best) / 30, 0, 1);
}

// Évalue une offre du point de vue de l'IA "otherId".
// userGives / userGets : listes d'assets {kind:'player',id} ou {kind:'pick',year,round,from}
// (userGives = ce que l'IA REÇOIT ; userGets = ce que l'IA CÈDE)
function aiEvaluateTrade(gameState, otherId, userGives, userGets) {
  const user = gameState.teams[gameState.userTeam];
  const other = gameState.teams[otherId];
  if (!userGives.length && !userGets.length) return { ok: false, reason: 'Offre vide.' };

  // Valeurs
  const inVal = userGives.reduce((s, a) => s + assetValue(gameState, gameState.userTeam, a), 0);
  let outVal = userGets.reduce((s, a) => s + assetValue(gameState, otherId, a), 0);

  // Bonus de besoin : l'IA valorise les joueurs qui comblent un manque
  let needBonus = 0;
  userGives.filter(a => a.kind === 'player').forEach(a => {
    const p = playerById(user, a.id);
    if (p) needBonus += positionalNeed(other, p.pos) * tradeValue(p) * 0.18;
  });

  // Contraintes de faisabilité
  const otherRosterAfter = other.roster.length - userGets.filter(a => a.kind === 'player').length
                                          + userGives.filter(a => a.kind === 'player').length;
  const userRosterAfter = user.roster.length - userGives.filter(a => a.kind === 'player').length
                                             + userGets.filter(a => a.kind === 'player').length;
  if (otherRosterAfter < 8) return { ok: false, reason: `${teamById(otherId).city} ne peut pas descendre sous 8 joueurs.` };
  if (otherRosterAfter > 15) return { ok: false, reason: `${teamById(otherId).city} dépasserait 15 joueurs.` };
  if (userRosterAfter > 15) return { ok: false, reason: 'Votre effectif dépasserait 15 joueurs.' };
  if (userRosterAfter < 8) return { ok: false, reason: 'Votre effectif descendrait sous 8 joueurs.' };

  // Équilibre salarial (des deux côtés)
  const outSalOther = outgoingSalary(other, userGets);   // salaires que l'IA envoie
  const outSalUser = outgoingSalary(user, userGives);    // salaires que l'utilisateur envoie
  if (!salaryMatchOk(outSalOther, outSalUser))
    return { ok: false, reason: `Masses salariales incompatibles (${round1(outSalUser)} M$ ↔ ${round1(outSalOther)} M$).` };

  // Décision : l'IA accepte si elle gagne de la valeur nette (avec un peu d'aléa)
  const gain = (inVal + needBonus) - outVal;
  const threshold = outVal * (0.02 + rnd() * 0.06);   // exige un petit surplus
  const ok = gain >= threshold;
  return {
    ok,
    reason: ok ? 'Offre acceptée.' :
      `${teamById(otherId).city} refuse : valeur reçue insuffisante.`,
    inVal, outVal, needBonus,
  };
}

// Exécute un échange (assets des deux côtés). userGives -> otherId ; userGets -> user.
function executeTrade(gameState, otherId, userGives, userGets) {
  const user = gameState.teams[gameState.userTeam];
  const other = gameState.teams[otherId];

  // Joueurs
  const uPlayers = userGives.filter(a => a.kind === 'player').map(a => a.id);
  const oPlayers = userGets.filter(a => a.kind === 'player').map(a => a.id);
  const movingU = uPlayers.map(id => playerById(user, id)).filter(Boolean);
  const movingO = oPlayers.map(id => playerById(other, id)).filter(Boolean);
  user.roster = user.roster.filter(p => !uPlayers.includes(p.id));
  other.roster = other.roster.filter(p => !oPlayers.includes(p.id));
  user.roster.push(...movingO);
  other.roster.push(...movingU);

  // Picks
  const uPicks = userGives.filter(a => a.kind === 'pick');
  const oPicks = userGets.filter(a => a.kind === 'pick');
  uPicks.forEach(pk => movePick(user, other, pk));
  oPicks.forEach(pk => movePick(other, user, pk));

  [user, other].forEach(t => {
    t.lineup = autoLineup(t.roster);
    autoMinutes(t);
    t.priorities = autoPriorities(t);
  });
  return true;
}
function samePick(a, b) { return a.year === b.year && a.round === b.round && a.from === b.from; }
function movePick(fromTeam, toTeam, pk) {
  const i = (fromTeam.picks || []).findIndex(x => samePick(x, pk));
  if (i >= 0) { const [p] = fromTeam.picks.splice(i, 1); (toTeam.picks = toTeam.picks || []).push(p); }
}

// L'IA propose parfois un échange réaliste à l'utilisateur (retour du point de vue user)
function aiConsiderTrade(gameState) {
  if (rnd() > 0.10) return null;
  const user = gameState.teams[gameState.userTeam];
  const others = TEAMS.filter(t => t.id !== gameState.userTeam).map(t => t.id);
  const otherId = pick(others);
  const other = gameState.teams[otherId];

  // L'IA cible un joueur de l'utilisateur à un poste où elle a besoin
  const wantPos = pick(POSITIONS);
  const target = [...user.roster].filter(p => p.pos === wantPos).sort((a, b) => b.ovr - a.ovr)[0]
              || [...user.roster].sort((a, b) => b.ovr - a.ovr)[randInt(0, Math.min(6, user.roster.length - 1))];
  if (!target) return null;
  const targetVal = tradeValue(target);

  // Construit une contrepartie (joueurs de l'IA + éventuellement un pick) de valeur proche
  const pool = [...other.roster].sort((a, b) => tradeValue(b) - tradeValue(a))
                                .filter(p => p.ovr < target.ovr + 3); // évite de céder un meilleur joueur
  const offer = [];
  let acc = 0;
  for (const p of pool) {
    if (acc >= targetVal * 1.05) break;
    if (offer.length >= 2) break;
    offer.push({ kind: 'player', id: p.id }); acc += tradeValue(p);
  }
  // Compléter avec un pick si l'IA en a un et que l'offre est un peu courte
  if (acc < targetVal * 0.95 && (other.picks || []).length) {
    const pk = other.picks[0];
    offer.push({ kind: 'pick', year: pk.year, round: pk.round, from: pk.from });
  }
  if (!offer.length) return null;

  const userGives = [{ kind: 'player', id: target.id }];  // l'IA reçoit la cible
  const userGets = offer;                                 // l'utilisateur reçoit l'offre
  // Ne proposer que si l'IA elle-même accepterait (offre équilibrée et légale)
  const evalRes = aiEvaluateTrade(gameState, otherId, userGives, userGets);
  if (!evalRes.ok) return null;
  return { partner: otherId, userGives, userGets };
}

/* ------------------------------ Intersaison ------------------------------ */
// Vieillissement + progression des jeunes / déclin des vétérans
function ageAndDevelop(gameState) {
  const retired = [];
  Object.values(gameState.teams).forEach(team => {
    team.roster.forEach(p => {
      p.age++;
      // archivage stats saison
      if (p.stats.gp > 0) p.history.push({ season: gameState.season, ...p.stats });
      p.stats = emptyStats();
      // Développement
      let delta = 0;
      if (p.age <= 23 && p.ovr < p.potential) delta = randInt(0, 4);
      else if (p.age <= 27) delta = randInt(-1, 2);
      else if (p.age <= 30) delta = randInt(-1, 1);
      else if (p.age <= 33) delta = randInt(-3, 0);
      else delta = randInt(-5, -1);
      applyOvrDelta(p, delta);
      // Contrat -1 an
      if (p.years > 0) p.years--;
    });
    // Retraites (vétérans faibles)
    team.roster = team.roster.filter(p => {
      const retire = p.age >= 38 || (p.age >= 35 && p.ovr < 68 && rnd() < 0.5);
      if (retire) retired.push({ team: team.id, name: p.name, age: p.age });
      return !retire;
    });
  });
  return retired;
}

function applyOvrDelta(p, delta) {
  // répartit le delta sur les attributs principaux
  const keys = ['shooting','inside','playmaking','rebounding','defense','athletic'];
  const per = delta / keys.length;
  keys.forEach(k => { p[k] = clamp(Math.round(p[k] + per + gauss(0,0.6)), 40, 99); });
  p.ovr = overall(p);
  if (p.ovr > p.potential) p.potential = p.ovr;
}

/* ------------------------- Draft & scouting ------------------------------ */
// Génère une cuvée de 60 prospects pour une année de draft donnée.
// Les têtes d'affiche connues (REAL_PROSPECTS) sont réelles ; le reste est projeté.
function genProspectClass(year) {
  const cls = [];
  const reals = (typeof REAL_PROSPECTS !== 'undefined' && REAL_PROSPECTS[year]) || [];
  for (let i = 0; i < 60; i++) {
    const real = reals[i];
    const tierBase = i < 3 ? randInt(75, 82) : i < 9 ? randInt(70, 78) : i < 20 ? randInt(64, 72)
                   : i < 40 ? randInt(58, 67) : randInt(52, 62);
    const pos = real ? real.pos : pick(POSITIONS);
    const p = makePlayer(pos, { base: real ? real.ovr : tierBase, age: randInt(18, 20), years: 3,
                                salary: round1(clamp(9 - i * 0.13, MIN_SALARY, 9)) });
    if (real) { p.name = real.n; p.ovr = real.ovr; p.real = true; }
    p.potential = clamp(Math.max(p.ovr, real ? (real.pot || 0) : 0,
                                 p.ovr + randInt(6, Math.max(8, 26 - Math.floor(i / 4)))), p.ovr, 99);
    p.prospect = true;
    p.draftYear = year;
    p.scout = 0;                    // niveau de scouting 0..3
    p._noise = gauss(0, 1);         // décalage stable pour le "brouillard" d'évaluation
    cls.push(p);
  }
  cls.sort((a, b) => (b.ovr + (b.potential - b.ovr) * 0.7) - (a.ovr + (a.potential - a.ovr) * 0.7));
  cls.forEach((p, i) => { p.projRank = i + 1; });
  return cls;
}

function prospectTier(rank) {
  if (rank <= 4) return 'Top 5 (loterie)';
  if (rank <= 14) return 'Loterie';
  if (rank <= 30) return '1er tour';
  return '2e tour';
}
// Affichage "scouté" d'un prospect : plus le niveau de scouting est élevé,
// plus l'estimation est précise (jusqu'à la valeur exacte au niveau 3).
function prospectDisplay(p) {
  const lvl = p.scout || 0;
  const tier = prospectTier(p.projRank);
  if (lvl >= 3) return { ovr: '' + p.ovr, pot: '' + p.potential, tier, exact: true };
  const span = [9, 5, 2][lvl];
  const est = clamp(Math.round(p.ovr + p._noise * (span / 2)), 40, 99);
  const potEst = clamp(Math.round(p.potential + p._noise * (span / 2)), est, 99);
  const h = Math.ceil(span / 2);
  return { ovr: `${clamp(est - h,40,99)}-${clamp(est + h,40,99)}`, pot: `~${potEst}`, tier, exact: false };
}

// Ordre de draft = pire bilan en premier (loterie simplifiée)
function draftOrder(gameState) {
  return TEAMS.map(t => gameState.teams[t.id])
    .sort((a, b) => a.w - b.w || rnd() - 0.5)
    .map(s => s.id);
}

// Pool d'agents libres : vétérans réels connus (REAL_FREE_AGENTS) + éventuels compléments
function genFreeAgents(count = 40) {
  const fas = [];
  const pool = (typeof REAL_FREE_AGENTS !== 'undefined') ? REAL_FREE_AGENTS.slice() : [];
  pool.forEach(e => {
    const p = makePlayer(e.pos, { base: e.ovr, age: e.age || randInt(24, 35), years: 0 });
    p.name = e.n; p.ovr = e.ovr; p.real = true;
    p.potential = Math.max(p.potential, p.ovr, e.pot || 0);
    p.salary = contractValue(p.ovr, p.age);
    fas.push(p);
  });
  return fas.sort((a, b) => b.ovr - a.ovr);
}
