/* ==========================================================================
   NBA My Era — Moteur de jeu (RNG, joueurs, simulation, saison, franchise)
   ========================================================================== */

/* ----------------------------- Utilitaires ------------------------------- */
const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'];
const SALARY_CAP = 141.0;     // en M$
const LUXURY_TAX = 172.0;     // seuil taxe de luxe (M$)
const MIN_SALARY = 2.1;
const MAX_SALARY = 55.0;

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
    injuredGames: 0,
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

// Effectif d'une équipe : joueurs réels (si disponibles) complétés par des joueurs générés
function makeRosterForTeam(teamId, strength) {
  const real = (typeof REAL_ROSTERS !== 'undefined') ? REAL_ROSTERS[teamId] : null;
  if (!real || !real.length) return makeRoster(strength);
  const roster = real.map(makePlayerReal);
  const posCycle = ['C', 'PF', 'SF', 'SG', 'PG', 'SF', 'SG'];
  let i = 0;
  while (roster.length < 15) {
    const pos = posCycle[i++ % posCycle.length];
    const base = clamp(randInt(56, 69) + Math.round((strength - 0.6) * 10), 50, 73);
    roster.push(makePlayer(pos, { base, age: randInt(19, 33) }));
  }
  return roster;
}

// Construit l'univers : toutes les équipes avec leur effectif + rotation auto
function buildLeague(userTeamId) {
  const strengths = {};
  TEAMS.forEach(t => strengths[t.id] = 0.4 + rnd() * 0.5);
  const teams = {};
  TEAMS.forEach(t => {
    const roster = makeRosterForTeam(t.id, strengths[t.id]);
    teams[t.id] = {
      id: t.id,
      roster,
      lineup: autoLineup(roster),   // 5 titulaires (ids)
      minutes: {},                  // id -> minutes cible
      w: 0, l: 0, streak: 0,
      ptsFor: 0, ptsAgn: 0,
    };
    autoMinutes(teams[t.id]);
  });
  return teams;
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
// Renvoie {home:{score,box}, away:{score,box}, log}
function simGame(home, away, opts = {}) {
  const H = simTeamBox(home, away);
  const A = simTeamBox(away, home);

  // Ajustement avantage du terrain
  H.score += randInt(1, 4);

  // Éviter l'égalité (prolongation simplifiée)
  let ot = 0;
  while (H.score === A.score) {
    if (rnd() < 0.5) H.score += randInt(2,3); else A.score += randInt(2,3);
    ot++;
    if (ot > 4) { H.score += 1; }
  }
  return { home: H, away: A, ot };
}

// Construit le box score d'une équipe face à un adversaire
function simTeamBox(team, opp) {
  const oppDef = defenseRating(opp);
  // Joueurs en rotation (minutes > 0)
  const rot = team.roster.filter(p => (team.minutes[p.id]||0) > 0 && !p._injured);
  const list = rot.length >= 5 ? rot : team.roster.slice().sort((a,b)=>b.ovr-a.ovr).slice(0,8);

  // ~100 possessions offensives, on calcule les tirs par joueur selon usage & minutes
  const box = list.map(p => ({ p, s: emptyStats() }));
  // Poids d'usage = minutes * facteur d'usage offensif
  box.forEach(b => {
    const m = clamp(team.minutes[b.p.id]||0, 0, 40);
    const usage = 0.4 + (b.p.shooting + b.p.inside + b.p.playmaking) / 300;
    b.weight = m * usage;
    b.min = m;
  });
  const totW = box.reduce((s,b)=>s+b.weight, 0) || 1;

  const possessions = randInt(96, 104);
  box.forEach(b => {
    const share = b.weight / totW;
    const poss = share * possessions;
    const p = b.p, st = b.s;

    // Nombre de tirs tentés proportionnel aux possessions utilisées
    const fga = Math.max(0, Math.round(gauss(poss * 0.95, poss * 0.18)));
    // Part de 3-points selon le tir extérieur
    const threeRate = clamp((p.shooting - 55) / 90, 0.05, 0.62) * (p.pos==='C'?0.4:1);
    let tpa = Math.round(fga * threeRate);
    let twoA = fga - tpa;

    // Réussite ajustée par défense adverse
    const defAdj = (oppDef - 75) * 0.0035;
    const two_pct = clamp((0.40 + (p.inside - 60) * 0.0032) - defAdj, 0.30, 0.66);
    const three_pct = clamp((0.30 + (p.shooting - 65) * 0.0032) - defAdj, 0.22, 0.47);

    let fgm2 = 0; for (let i=0;i<twoA;i++) if (rnd() < two_pct) fgm2++;
    let tpm = 0;  for (let i=0;i<tpa;i++)  if (rnd() < three_pct) tpm++;

    // Lancers francs
    const ftTrips = Math.round(gauss(poss * 0.14, 1.2));
    let fta = Math.max(0, ftTrips) * 2;
    const ft_pct = clamp(0.62 + (p.shooting - 55) * 0.004, 0.5, 0.94);
    let ftm = 0; for (let i=0;i<fta;i++) if (rnd() < ft_pct) ftm++;

    st.fga = twoA + tpa; st.fgm = fgm2 + tpm;
    st.tpa = tpa; st.tpm = tpm;
    st.fta = fta; st.ftm = ftm;
    st.pts = fgm2*2 + tpm*3 + ftm;

    st.ast = Math.max(0, Math.round(gauss(poss * (p.playmaking-50)/240, 1.6)));
    const rebW = (p.rebounding-40)/60;
    st.oreb = Math.max(0, Math.round(gauss(b.min * 0.05 * rebW, 1)));
    st.dreb = Math.max(0, Math.round(gauss(b.min * 0.13 * rebW, 1.4)));
    st.stl = Math.max(0, Math.round(gauss(b.min * 0.03 * (p.defense-40)/50, 0.8)));
    st.blk = Math.max(0, Math.round(gauss(b.min * 0.03 * (p.athletic-40)/50 * (p.pos==='C'?1.8:1), 0.7)));
    st.tov = Math.max(0, Math.round(gauss(poss * 0.13, 1.2)));
    st.pf  = Math.max(0, Math.round(gauss(b.min * 0.07, 1)));
    st.min = b.min;
  });

  const score = box.reduce((s,b)=>s+b.s.pts, 0);
  return { score, box };
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

/* --------------------------------- IA ------------------------------------ */
// L'IA ajuste automatiquement lineup + minutes (déjà fait) et propose parfois des transferts.
// Retourne true si un transfert avec l'utilisateur est proposé
function aiConsiderTrade(gameState) {
  // simple : 8% de chance par simulation de journée qu'une IA propose un échange
  if (rnd() > 0.08) return null;
  const others = TEAMS.filter(t => t.id !== gameState.userTeam);
  const other = pick(others);
  return proposeTrade(gameState, other.id, gameState.userTeam);
}

// Construit une proposition équilibrée : from donne X, veut Y de l'utilisateur
function proposeTrade(gameState, fromId, toId) {
  const from = gameState.teams[fromId], to = gameState.teams[toId];
  const target = [...to.roster].sort((a,b)=>b.ovr-a.ovr)[randInt(0, Math.min(6, to.roster.length-1))];
  if (!target) return null;
  // L'IA propose des joueurs pour ~ égaler la valeur + prime
  const need = tradeValue(target) * (0.9 + rnd()*0.35);
  const pool = [...from.roster].sort((a,b)=>b.ovr-a.ovr);
  const give = [];
  let acc = 0;
  for (const p of pool) {
    if (acc >= need) break;
    if (give.length >= 2) break;
    give.push(p); acc += tradeValue(p);
  }
  if (!give.length) return null;
  return { fromId, toId, give: give.map(p=>p.id), get: [target.id] };
}

function tradeValue(p) {
  const ageAdj = p.age <= 24 ? 1.15 : p.age >= 31 ? 0.8 : 1.0;
  return Math.pow(Math.max(0, p.ovr - 45), 1.8) * ageAdj;
}

// Vérifie légalité salariale (règle simplifiée: masses ± 25%)
function tradeSalaryOk(gameState, fromId, toId, giveIds, getIds) {
  const from = gameState.teams[fromId], to = gameState.teams[toId];
  const outFrom = giveIds.reduce((s,id)=>s+(playerById(from,id)?.salary||0),0);
  const outTo   = getIds.reduce((s,id)=>s+(playerById(to,id)?.salary||0),0);
  // Après échange, aucune limite dure ici (souple pour le confort de jeu)
  return true;
}

function executeTrade(gameState, fromId, toId, giveIds, getIds) {
  const from = gameState.teams[fromId], to = gameState.teams[toId];
  const moving1 = giveIds.map(id => playerById(from, id)).filter(Boolean);
  const moving2 = getIds.map(id => playerById(to, id)).filter(Boolean);
  from.roster = from.roster.filter(p => !giveIds.includes(p.id));
  to.roster   = to.roster.filter(p => !getIds.includes(p.id));
  from.roster.push(...moving2);
  to.roster.push(...moving1);
  // recalcule rotations
  [from, to].forEach(t => { t.lineup = autoLineup(t.roster); autoMinutes(t); });
  return true;
}

// Évalue si l'IA accepte une offre de l'utilisateur (user donne giveIds à otherId, reçoit getIds)
function aiAcceptsTrade(gameState, otherId, userGiveIds, userGetIds) {
  const user = gameState.teams[gameState.userTeam];
  const other = gameState.teams[otherId];
  const inVal  = userGiveIds.reduce((s,id)=>s+tradeValue(playerById(user,id)),0);   // ce que l'IA reçoit
  const outVal = userGetIds.reduce((s,id)=>s+tradeValue(playerById(other,id)),0);   // ce que l'IA perd
  // L'IA accepte si elle reçoit au moins ~95% de valeur, avec un peu d'aléa
  return inVal >= outVal * (0.95 + rnd()*0.15);
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

// Génère la classe de draft (60 prospects)
function genDraftClass(season) {
  const cls = [];
  for (let i = 0; i < 60; i++) {
    const pos = POSITIONS[i % 5 === 0 ? randInt(0,4) : randInt(0,4)];
    // top picks meilleurs
    const tierBase = i < 5 ? randInt(74, 84) : i < 14 ? randInt(68, 78) : i < 30 ? randInt(62, 72) : randInt(55, 66);
    const p = makePlayer(pos, { base: tierBase, age: randInt(19, 21), years: 3,
                                salary: round1(clamp(8 - i*0.12, MIN_SALARY, 8)) });
    p.potential = clamp(p.ovr + randInt(4, 20 - Math.floor(i/6)), p.ovr, 99);
    p.draftRank = i + 1;
    cls.push(p);
  }
  return cls.sort((a,b) => (b.ovr + (b.potential-b.ovr)*0.6) - (a.ovr + (a.potential-a.ovr)*0.6))
            .map((p,i) => (p.draftRank = i+1, p));
}

// Ordre de draft = pire bilan en premier (loterie simplifiée)
function draftOrder(gameState) {
  return TEAMS.map(t => gameState.teams[t.id])
    .sort((a,b) => a.w - b.w || rnd()-0.5)
    .map(s => s.id);
}

// Génère un pool d'agents libres pour l'intersaison
function genFreeAgents(count = 40) {
  const fas = [];
  for (let i=0;i<count;i++){
    const pos = pick(POSITIONS);
    const base = randInt(55, 80);
    fas.push(makePlayer(pos, { base, age: randInt(22, 35), years: 0 }));
  }
  return fas.sort((a,b)=>b.ovr-a.ovr);
}
