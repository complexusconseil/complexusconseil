/* ==========================================================================
   NBA My Era — Orchestration (état global, sauvegarde, flux de saison)
   ========================================================================== */

const SAVE_KEY = 'nba_my_era_save_v1';
const GAMES_PER_SEASON = 82;

const Game = {
  state: null,

  /* ------------------------------ Nouvelle partie ----------------------- */
  newGame(userTeamId, managerName, eraId) {
    eraId = eraId || 'modern';
    const era = setEra(eraId);
    const startYear = era ? era.year : 2026;
    const teams = buildLeague(userTeamId, eraId);
    const classes = {};
    for (let y = 1; y <= 4; y++) classes[startYear + y] = genProspectClass(startYear + y);
    this.state = {
      season: startYear,
      eraId,
      confMode: (era && era.rules && era.rules.confMode) || 'conf',
      managerName: managerName || 'Manager',
      userTeam: userTeamId,
      teams,
      schedule: buildSchedule(GAMES_PER_SEASON),
      dayIndex: 0,
      phase: 'regular',            // regular | playoffs | offseason
      playoffs: null,
      draftClass: null,
      freeAgents: null,
      offseasonStep: 0,            // 0 resign, 1 draft, 2 FA, 3 done
      news: [],
      pendingTrade: null,
      trophies: [],                // titres remportés par le user
      seasonLog: [],               // résultats des matchs du user cette saison
      liveGame: null,              // match en cours (jeu par quart-temps)
      history: [],                 // archive des saisons (champions, résultats, leaders, récompenses)
      legends: [],                 // joueurs retraités (carrières + Hall of Fame)
      franchiseStats: {},          // bilan/titres cumulés par franchise
      retiredNumbers: {},          // numéros retirés par franchise
      board: { patience: 60 },     // direction : objectif & patience
      fired: false,
      staff: defaultStaff(),       // staff technique de l'utilisateur
      staffMarket: genStaffMarket(),
      trainingFocus: 'none',       // axe d'entraînement de la saison
      intlTrophies: [],            // titres internationaux (sélections)
      scouting: { points: 12, classes },
    };
    applyUserStaff(this.ut(), this.state.staff);
    this.log(`Bienvenue à la tête des ${this.userTeamFull().name} ! (${era ? era.name : 'Époque moderne'})`);
    this.setBoardGoal();
    this.save();
  },

  /* --------------------------- Staff & entraînement --------------------- */
  hireStaff(role, index) {
    const s = this.state;
    const cand = s.staffMarket[role] && s.staffMarket[role][index];
    if (!cand) return;
    s.staff[role] = { name: cand.name, quality: cand.quality, salary: cand.salary };
    applyUserStaff(this.ut(), s.staff);
    this.log(`Staff : ${cand.name} rejoint le poste « ${STAFF_ROLES.find(r => r[0] === role)[1]} » (qualité ${cand.quality}).`);
    this.save();
  },
  setTrainingFocus(focus) { if (TRAINING_FOCUS[focus]) { this.state.trainingFocus = focus; this.save(); } },

  /* --------------------------- Direction (board) ------------------------ */
  setBoardGoal() {
    const s = this.state; const ut = this.ut(); const ovr = teamOverall(ut);
    let goal, targetWins, desc;
    if (ovr >= 88) { goal = 'Titre NBA'; targetWins = 52; desc = 'La direction vise le titre. Rien d\'autre ne suffira.'; }
    else if (ovr >= 84) { goal = 'Finale de conférence'; targetWins = 48; desc = 'Un parcours profond en playoffs est attendu.'; }
    else if (ovr >= 80) { goal = 'Playoffs'; targetWins = 44; desc = 'La qualification en playoffs est exigée.'; }
    else if (ovr >= 75) { goal = 'Lutter pour les playoffs'; targetWins = 36; desc = 'Se battre pour une place (barrage acceptable).'; }
    else { goal = 'Développement'; targetWins = 26; desc = 'Faire progresser les jeunes et bâtir l\'avenir.'; }
    s.board = s.board || { patience: 60 };
    s.board.goal = goal; s.board.targetWins = targetWins; s.board.desc = desc;
    s.board.seasonSet = s.season; s.board.result = null;
  },
  evaluateBoard(userResult) {
    const s = this.state; const b = s.board; if (!b) return;
    const ut = this.ut(); const wins = ut.w;
    const rank = { 'Champion': 5, 'Finaliste': 4, 'Playoffs': 3, 'Non qualifié': 1 }[userResult] || 1;
    const goalRank = { 'Titre NBA': 5, 'Finale de conférence': 4, 'Playoffs': 3, 'Lutter pour les playoffs': 2, 'Développement': 1 }[b.goal] || 3;
    let met, delta, note;
    if (rank >= goalRank || wins >= b.targetWins) { met = true; delta = rank > goalRank ? 20 : 15; note = 'Objectif atteint 👍'; }
    else if (rank >= goalRank - 1 && wins >= b.targetWins - 8) { met = false; delta = -5; note = 'Objectif manqué de peu.'; }
    else { met = false; delta = -16; note = 'Objectif non atteint 👎'; }
    b.patience = clamp((b.patience || 60) + delta, 0, 100);
    b.result = { met, note, userResult, wins };
    this.log(`Direction : ${note} (patience ${Math.round(b.patience)}/100).`);
    if (met && s.fired) { s.fired = false; this.log('La direction vous renouvelle sa confiance.'); }
    else if (b.patience <= 0 && !s.fired) { s.fired = true; this.log('⚠️ La direction vous a démis de vos fonctions.'); }
  },
  boardReprieve() { this.state.fired = false; this.state.board.patience = 45; this.log('La direction vous accorde un sursis.'); this.save(); },

  /* ----------------------------- Récits / storylines -------------------- */
  generateStorylines() {
    const s = this.state; const ut = this.ut();
    ut.roster.forEach(p => {
      if (p.stats.gp >= 15) {
        const ppg = p.stats.pts / p.stats.gp;
        if (p.age <= 23 && ppg >= 22 && !p._breakout) { p._breakout = true; this.log(`⭐ ${p.name} (${p.age} ans) éclôt : ${Math.round(ppg)} pts/m — une future star !`); }
      }
      const career = careerTotals(p.history).pts + (p.stats ? p.stats.pts : 0);
      p._milestones = p._milestones || [];
      [5000, 10000, 15000, 20000, 25000, 30000, 38000].forEach(m => {
        if (career >= m && !p._milestones.includes(m)) { p._milestones.push(m); this.log(`🏀 ${p.name} franchit les ${m.toLocaleString('fr-FR')} points en carrière.`); }
      });
    });
  },

  /* -------------------------------- Accès ------------------------------- */
  ut() { return this.state.teams[this.state.userTeam]; },
  userTeamFull() { return teamById(this.state.userTeam); },
  log(msg) { this.state.news.unshift({ s: this.state.season, msg }); if (this.state.news.length > 60) this.state.news.pop(); },

  /* ------------------------------ Sauvegarde ---------------------------- */
  save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ pid: _pid, state: this.state }));
      return true;
    } catch (e) { console.warn('Sauvegarde impossible', e); return false; }
  },
  hasSave() { return !!localStorage.getItem(SAVE_KEY); },
  load() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    try {
      const obj = JSON.parse(raw);
      this.state = obj.state;
      _pid = obj.pid || 1;
      setEra(this.state.eraId || 'modern');   // restaure la ligue active + les règles d'époque
      return true;
    } catch (e) { console.warn(e); return false; }
  },
  deleteSave() { localStorage.removeItem(SAVE_KEY); },
  exportSave() {
    const data = JSON.stringify({ pid: _pid, state: this.state });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `my-era-${this.state.season}-${this.state.userTeam}.json`;
    a.click(); URL.revokeObjectURL(url);
  },
  importSave(text) {
    const obj = JSON.parse(text);
    this.state = obj.state; _pid = obj.pid || 1;
    setEra(this.state.eraId || 'modern');
    this.save();
  },

  /* ------------------------- Calendrier utilisateur --------------------- */
  // Prochain match de l'utilisateur (jour + match) ou null
  nextUserGame() {
    const s = this.state;
    for (let d = s.dayIndex; d < s.schedule.length; d++) {
      const g = s.schedule[d].find(g => (g.home === s.userTeam || g.away === s.userTeam) && !g.played);
      if (g) return { day: d, game: g };
    }
    return null;
  },

  // Simule une journée complète du calendrier
  simulateDay() {
    const s = this.state;
    if (s.dayIndex >= s.schedule.length) return false;
    const day = s.schedule[s.dayIndex];
    day.forEach(g => {
      if (g.played) return;
      const res = simGame(s.teams[g.home], s.teams[g.away]);
      applyGameResult(s, g.home, g.away, res);
      g.played = true;
      g.hs = res.home.score; g.as = res.away.score;
      if (g.home === s.userTeam || g.away === s.userTeam) this.recordUserGame(g, res);
    });
    // Blessures : cicatrisation (toute la ligue) puis nouvelles blessures des équipes du jour
    healInjuries(s);
    const playedTeams = new Set();
    day.forEach(g => { playedTeams.add(g.home); playedTeams.add(g.away); });
    playedTeams.forEach(tid => {
      const newInj = maybeInjure(s.teams[tid]);
      if (tid === s.userTeam) newInj.forEach(n => this.log(`🏥 ${n.name} blessé (${n.desc}) — absent ~${n.games} matchs.`));
    });
    // Moral du vestiaire (résultat + temps de jeu)
    day.forEach(g => { if (g.hs == null) return; const hWon = g.hs > g.as;
      updateMorale(s.teams[g.home], hWon); updateMorale(s.teams[g.away], !hWon); });
    s.dayIndex++;
    if (s.dayIndex % 10 === 0) this.generateStorylines();
    // proposition de transfert IA de temps en temps
    if (!s.pendingTrade) {
      const offer = aiConsiderTrade(s);
      if (offer) s.pendingTrade = offer;
    }
    return true;
  },

  // Simule jusqu'au prochain match de l'utilisateur (sans le jouer)
  simulateToNextUserGame() {
    const s = this.state;
    let guard = 0;
    while (guard++ < 400) {
      const next = this.nextUserGame();
      if (!next) { this.checkSeasonEnd(); return; }
      if (next.day === s.dayIndex) return;    // le match du user est aujourd'hui
      this.simulateDay();
      if (s.pendingTrade) return;             // stop si l'IA propose un échange
    }
  },

  // Joue (simule) le prochain match de l'utilisateur et renvoie le résultat détaillé
  playUserGame() {
    const s = this.state;
    const next = this.nextUserGame();
    if (!next) return null;
    // avance jusqu'au jour du match
    while (s.dayIndex < next.day) this.simulateDay();
    const day = s.schedule[s.dayIndex];
    const g = day.find(x => x === next.game);
    const res = simGame(s.teams[g.home], s.teams[g.away]);
    applyGameResult(s, g.home, g.away, res);
    g.played = true; g.hs = res.home.score; g.as = res.away.score;
    this.recordUserGame(g, res);
    // simuler le reste de la journée
    this.simulateDay();
    return { game: g, res };
  },

  // Prévisualise le prochain match (simulé, non appliqué) — pour le rendu 3D
  previewUserGame() {
    const s = this.state; const next = this.nextUserGame(); if (!next) return null;
    while (s.dayIndex < next.day) this.simulateDay();
    const g = s.schedule[s.dayIndex].find(x => x === next.game);
    const res = simGame(s.teams[g.home], s.teams[g.away]);
    return { g, res };
  },
  // Applique un résultat prévisualisé (après la 3D)
  commitUserGame(g, res) {
    const s = this.state;
    if (g.played) return;
    applyGameResult(s, g.home, g.away, res);
    g.played = true; g.hs = res.home.score; g.as = res.away.score;
    this.recordUserGame(g, res);
    this.simulateDay();
    this.checkSeasonEnd();
    this.save();
  },

  recordUserGame(g, res) {
    const s = this.state;
    const home = g.home === s.userTeam;
    const my = home ? res.home.score : res.away.score;
    const opp = home ? res.away.score : res.home.score;
    const oppId = home ? g.away : g.home;
    s.seasonLog.unshift({ home, oppId, my, opp, win: my > opp });
  },

  checkSeasonEnd() {
    const s = this.state;
    if (s.phase !== 'regular') return;
    if (!this.nextUserGame()) {
      // plus aucun match de l'utilisateur : terminer les journées restantes puis lancer les playoffs
      let guard = 0;
      while (s.dayIndex < s.schedule.length && guard++ < 400) this.simulateDay();
      this.startPlayoffs();
    }
  },

  /* -------------------------------- Playoffs ---------------------------- */
  startPlayoffs() {
    const s = this.state;
    s.phase = 'playoffs';
    const eConf = standings(s, 'EAST'), wConf = standings(s, 'WEST');
    let east, west;
    if (s.confMode !== 'single' && eConf.length >= 8 && wConf.length >= 8) {
      // Playoffs par conférences (moderne)
      east = eConf.slice(0, 8).map(x => x.team.id);
      west = wConf.slice(0, 8).map(x => x.team.id);
    } else {
      // Bracket unique top-8 (époques / petites ligues), réparti en 2 demi-tableaux
      const top = standings(s).slice(0, 8).map(x => x.team.id);
      east = [top[0], top[7], top[3], top[4]];   // (1v8) & (4v5)
      west = [top[1], top[6], top[2], top[5]];   // (2v7) & (3v6)
    }
    const seeds = new Set([...east, ...west]);
    s._userInPlayoffs = seeds.has(s.userTeam);
    s.playoffs = {
      round: 0,
      east: this.makeRoundSeries(east),
      west: this.makeRoundSeries(west),
      finals: null,
      champion: null,
    };
    this.autoSimNonUserSeries();
    this.log(`Playoffs ${s.season} : que le meilleur gagne !`);
    this.save();
  },

  makeRoundSeries(seeds) {
    // 8 têtes de série -> 1v8,4v5,3v6,2v7 ; 4 têtes (demi-tableau déjà apparié) -> (0v1),(2v3)
    const pairs = seeds.length >= 8 ? [[0,7],[3,4],[2,5],[1,6]] : [[0,1],[2,3]];
    return pairs.filter(([a,b]) => seeds[a] && seeds[b]).map(([a,b]) => ({
      hi: seeds[a], lo: seeds[b], hiSeed: a+1, loSeed: b+1,
      hw: 0, lw: 0, done: false, winner: null,
    }));
  },

  currentUserSeries() {
    const p = this.state.playoffs;
    if (!p) return null;
    if (p.finals && !p.finals.done) {
      if (p.finals.hi === this.state.userTeam || p.finals.lo === this.state.userTeam) return p.finals;
    }
    const all = [...(p.east||[]), ...(p.west||[])];
    return all.find(sr => !sr.done && (sr.hi === this.state.userTeam || sr.lo === this.state.userTeam)) || null;
  },

  // Simule intégralement les séries ne concernant pas l'utilisateur du round courant
  autoSimNonUserSeries() {
    const p = this.state.playoffs;
    const list = p.finals ? [p.finals] : [...p.east, ...p.west];
    list.forEach(sr => {
      if (sr.done) return;
      if (sr.hi === this.state.userTeam || sr.lo === this.state.userTeam) return;
      this.simSeriesToEnd(sr);
    });
    this.maybeAdvanceRound();
  },

  simSeriesToEnd(sr) {
    const s = this.state;
    let guard = 0;
    while (!sr.done && guard++ < 40) {
      this.simSeriesGame(sr);
    }
  },

  // Simule un match de la série (home court alterné 2-2-1-1-1 au plus fort seed)
  simSeriesGame(sr) {
    const s = this.state;
    const gameNo = sr.hw + sr.lw + 1;
    // home court: matchs 1,2,5,7 chez hi ; 3,4,6 chez lo
    const hiHome = [1,2,5,7].includes(gameNo);
    const home = hiHome ? sr.hi : sr.lo;
    const away = hiHome ? sr.lo : sr.hi;
    const res = simGame(s.teams[home], s.teams[away]);
    const hiWon = (home === sr.hi) ? res.home.score > res.away.score : res.away.score > res.home.score;
    if (hiWon) sr.hw++; else sr.lw++;
    if (sr.hw === 4) { sr.done = true; sr.winner = sr.hi; }
    if (sr.lw === 4) { sr.done = true; sr.winner = sr.lo; }
    return { res, home, away, hiWon };
  },

  // L'utilisateur joue le prochain match de sa série
  playUserSeriesGame() {
    const sr = this.currentUserSeries();
    if (!sr) return null;
    const result = this.simSeriesGame(sr);
    if (sr.done) {
      const won = sr.winner === this.state.userTeam;
      this.log(`Série remportée par ${teamById(sr.winner).city} (${sr.hw}-${sr.lw}).`);
      // relancer l'auto-sim du reste éventuel + avancer
      this.autoSimNonUserSeries();
    } else {
      this.maybeAdvanceRound();
    }
    this.save();
    return result;
  },

  simUserSeriesToEnd() {
    const sr = this.currentUserSeries();
    if (!sr) return;
    this.simSeriesToEnd(sr);
    this.autoSimNonUserSeries();
    this.save();
  },

  maybeAdvanceRound() {
    const p = this.state.playoffs;
    if (p.champion) return;

    // Finals en cours
    if (p.finals) {
      if (p.finals.done) {
        p.champion = p.finals.winner;
        this.endPlayoffs();
      }
      return;
    }

    const eastDone = p.east.every(s => s.done);
    const westDone = p.west.every(s => s.done);
    if (!eastDone || !westDone) return;

    if (p.east.length > 1 || p.west.length > 1) {
      // avancer d'un tour dans chaque demi-tableau
      p.east = this.nextConfRound(p.east);
      p.west = this.nextConfRound(p.west);
      p.round++;
      this.autoSimNonUserSeries();
    } else {
      // champions de conf -> Finals
      const eChamp = p.east[0].winner;
      const wChamp = p.west[0].winner;
      // meilleur bilan reçoit l'avantage
      const eb = this.state.teams[eChamp], wb = this.state.teams[wChamp];
      const hi = eb.w >= wb.w ? eChamp : wChamp;
      const lo = hi === eChamp ? wChamp : eChamp;
      p.finals = { hi, lo, hiSeed: '', loSeed: '', hw:0, lw:0, done:false, winner:null };
      p.round = 3;
      this.log('Finales NBA !');
      this.autoSimNonUserSeries();
    }
  },

  nextConfRound(series) {
    const winners = series.map(s => s.winner);
    // apparier (0v1, 2v3) selon l'ordre du bracket
    const pairs = [];
    for (let i = 0; i < winners.length; i += 2) {
      const a = winners[i], b = winners[i+1];
      const ta = this.state.teams[a], tb = this.state.teams[b];
      const hi = ta.w >= tb.w ? a : b;
      const lo = hi === a ? b : a;
      pairs.push({ hi, lo, hw:0, lw:0, done:false, winner:null });
    }
    return pairs;
  },

  endPlayoffs() {
    const s = this.state;
    const p = s.playoffs;
    const champ = p.champion;
    const runnerUp = p.finals ? (p.finals.winner === p.finals.hi ? p.finals.lo : p.finals.hi) : null;
    if (champ === s.userTeam) {
      s.trophies.push(s.season);
      this.log(`🏆 CHAMPIONS NBA ${s.season} ! Félicitations !`);
    } else {
      this.log(`${teamById(champ).city} ${teamById(champ).name} champions ${s.season}.`);
    }
    // Meilleur marqueur de la ligue cette saison
    let leader = null;
    Object.values(s.teams).forEach(t => t.roster.forEach(pl => {
      if (pl.stats.gp >= 20) {
        const ppg = pl.stats.pts / pl.stats.gp;
        if (!leader || ppg > leader.ppg) leader = { name: pl.name, ppg: Math.round(ppg * 10) / 10, team: t.id };
      }
    }));
    // Bilan & parcours de l'utilisateur
    const ut = this.ut();
    const userResult = champ === s.userTeam ? 'Champion'
      : (runnerUp === s.userTeam ? 'Finaliste'
      : (s._userInPlayoffs ? 'Playoffs' : 'Non qualifié'));

    // Récompenses individuelles (stats de saison régulière encore intactes)
    const aw = seasonAwards(s);
    if (aw.pack && aw.winners) {
      const give = (x, label) => { if (x && x.p) x.p.awards.unshift({ season: s.season, label }); };
      give(aw.winners.mvp, 'MVP');
      give(aw.winners.dpoy, 'Défenseur de l\'année');
      give(aw.winners.sixth, '6e homme');
      give(aw.winners.mip, 'Progression (MIP)');
      give(aw.winners.roy, 'Rookie de l\'année');
      if (aw.winners.mvp) this.log(`🏅 MVP ${s.season} : ${aw.winners.mvp.p.name} (${teamById(aw.winners.mvp.team).name}).`);
    }

    // Évaluation de la direction (objectif de saison)
    this.evaluateBoard(userResult);

    s.history.unshift({
      season: s.season, era: s.eraId,
      champion: champ, runnerUp,
      userTeam: s.userTeam, userW: ut.w, userL: ut.l, userResult,
      leader,
      awards: aw.pack || null,
      boardGoal: s.board ? s.board.goal : null,
      boardMet: s.board && s.board.result ? s.board.result.met : null,
    });

    // Histoire des franchises : bilan cumulé, titres, finales, meilleure saison
    const finalists = new Set(p.finals ? [p.finals.hi, p.finals.lo] : []);
    Object.keys(s.teams).forEach(id => {
      const t = s.teams[id];
      const fs = s.franchiseStats[id] || (s.franchiseStats[id] = { w: 0, l: 0, titles: 0, finals: 0, seasons: 0, bestW: 0, bestYear: null, mvps: 0 });
      fs.w += t.w; fs.l += t.l; fs.seasons++;
      if (t.w > fs.bestW) { fs.bestW = t.w; fs.bestYear = s.season; }
      if (id === champ) fs.titles++;
      if (finalists.has(id)) fs.finals++;
      if (aw.winners && aw.winners.mvp && aw.winners.mvp.team === id) fs.mvps++;
    });

    this.startOffseason();
  },

  /* --------------------------- Finales All-Time ------------------------- */
  runExhibition(eraA, teamA, eraB, teamB) {
    const A = buildExhibitionTeam(eraA, teamA);
    const B = buildExhibitionTeam(eraB, teamB);
    if (!A || !B) return { err: 'Équipes indisponibles pour cette confrontation.' };
    A.eraId = eraA; B.eraId = eraB;
    const res = simExhibitionSeries(A, B);
    return { ok: true, res, A, B, eraA, eraB };
  },

  /* --------------------- Tournois internationaux ------------------------ */
  buildNationalTeam(nationId) {
    const nat = (typeof NATIONS !== 'undefined') ? NATIONS[nationId] : null;
    if (!nat) return null;
    const roster = nat.players.map(makePlayerReal);
    const team = { id: nationId, roster, lineup: autoLineup(roster), minutes: {},
      offScheme: suggestOffScheme(roster), defScheme: suggestDefScheme(roster),
      coachOff: 78, coachDef: 78, coachDev: 78, coachHealth: 78, w: 0, l: 0 };
    autoMinutes(team); team.priorities = autoPriorities(team);
    return team;
  },
  runInternational(compId, userNationId) {
    const comp = (typeof INT_COMPS !== 'undefined') ? INT_COMPS[compId] : null;
    if (!comp) return { err: 'Compétition inconnue.' };
    const teams = {}; comp.nations.forEach(id => teams[id] = this.buildNationalTeam(id));
    const seeds = [...comp.nations].sort((a, b) => teamOverall(teams[b]) - teamOverall(teams[a]));
    const scorers = {};
    const saved = ERA_RULES; ERA_RULES = { threePA: 0.8, pace: 0.92, fgAdj: 0, confMode: 'single' };
    const simMatch = (a, b) => {
      const res = simGame(teams[a], teams[b]);
      const as = res.home.score, bs = res.away.score;
      res.home.box.forEach(x => scorers[x.p.name] = (scorers[x.p.name] || 0) + x.s.pts);
      res.away.box.forEach(x => scorers[x.p.name] = (scorers[x.p.name] || 0) + x.s.pts);
      return { a, b, as, bs, winner: as >= bs ? a : b };
    };
    const qfPairs = [[0, 7], [3, 4], [2, 5], [1, 6]].map(([i, j]) => [seeds[i], seeds[j]]);
    const qf = qfPairs.map(([a, b]) => simMatch(a, b));
    const sf = [simMatch(qf[0].winner, qf[1].winner), simMatch(qf[2].winner, qf[3].winner)];
    const fn = simMatch(sf[0].winner, sf[1].winner);
    ERA_RULES = saved;
    const mvpE = Object.entries(scorers).sort((x, y) => y[1] - x[1])[0];
    const bracket = { rounds: [qf, sf, [fn]], champion: fn.winner, mvp: mvpE ? { name: mvpE[0], pts: mvpE[1] } : null };
    if (userNationId && bracket.champion === userNationId) {
      this.state.intlTrophies = this.state.intlTrophies || [];
      this.state.intlTrophies.push({ comp: compId, nation: userNationId, season: this.state.season });
      this.log(`🥇 ${NATIONS[userNationId].name} remporte ${comp.name} !`);
      this.save();
    }
    return { ok: true, comp: compId, userNation: userNationId, bracket, seeds };
  },

  /* ------------------------------ Intersaison --------------------------- */
  startOffseason() {
    const s = this.state;
    s.phase = 'offseason';
    s.offseasonStep = 0;
    // Vieillissement/progression + retraites
    const retired = ageAndDevelop(s);
    retired.filter(r => r.team === s.userTeam)
           .forEach(r => this.log(`${r.name} (${r.age} ans) prend sa retraite.`));
    // recalcule priorités (des joueurs ont pu partir en retraite)
    Object.values(s.teams).forEach(t => { t.priorities = autoPriorities(t); });
    // Draft = cuvée scoutée de l'an prochain (ou générée si absente), meilleur d'abord
    const dy = s.season + 1;
    s.draftClass = (s.scouting.classes[dy] || genProspectClass(dy)).slice()
                     .sort((a, b) => a.projRank - b.projRank);
    this.startDraft(dy);       // construit l'ordre (2 tours) et avance jusqu'à votre 1er choix
    s.freeAgents = genFreeAgents(s.eraId);
    this.save();
  },

  finishOffseason() {
    const s = this.state;
    // Les IA comblent leurs effectifs < 12 joueurs avec des agents libres
    Object.values(s.teams).forEach(team => {
      if (team.id === s.userTeam) return;
      let guard = 0;
      while (team.roster.length < 12 && s.freeAgents.length && guard++ < 20) {
        const fa = s.freeAgents.shift();
        fa.salary = contractValue(fa.ovr, fa.age);
        fa.years = randInt(1, 3);
        team.roster.push(fa);
      }
      team.lineup = autoLineup(team.roster);
      autoMinutes(team);
      team.priorities = autoPriorities(team);
    });
    // Gestion des picks : on retire l'année écoulée, on ajoute une nouvelle année lointaine
    const usedYear = s.season + 1;
    Object.values(s.teams).forEach(t => {
      t.picks = (t.picks || []).filter(pk => pk.year > usedYear);
      t.picks.push({ kind: 'pick', year: s.season + 4, round: 1, from: t.id });
      t.picks.push({ kind: 'pick', year: s.season + 4, round: 2, from: t.id });
    });
    s.draft = null;
    // Nouvelle saison
    s.season++;
    s.schedule = buildSchedule(GAMES_PER_SEASON);
    s.dayIndex = 0;
    s.phase = 'regular';
    s.playoffs = null;
    s.seasonLog = [];
    s.draftClass = null;
    s.freeAgents = null;
    s.pendingTrade = null;
    s.liveGame = null;
    // Scouting : la cuvée jouée disparaît, on génère une nouvelle cuvée lointaine
    delete s.scouting.classes[usedYear];
    const far = s.season + 3;
    if (!s.scouting.classes[far]) s.scouting.classes[far] = genProspectClass(far);
    s.scouting.points = 12;
    // Staff : nouveau marché ; moral qui se recentre légèrement entre les saisons
    s.staffMarket = genStaffMarket();
    applyUserStaff(this.ut(), s.staff);
    Object.values(s.teams).forEach(t => t.roster.forEach(p => { p.morale = clamp((p.morale != null ? p.morale : 70) + (72 - (p.morale != null ? p.morale : 70)) * 0.5, 5, 100); }));
    // reset bilans
    Object.values(s.teams).forEach(t => { t.w = 0; t.l = 0; t.streak = 0; t.ptsFor = 0; t.ptsAgn = 0; });
    this.setBoardGoal();     // nouvel objectif de la direction
    this.log(`Début de la saison ${s.season}. Objectif : ${s.board.goal}.`);
    this.save();
  },

  /* ------------------------------ Scouting ------------------------------ */
  scoutingClasses() {
    // années futures encore scoutables (hors cuvée en cours de draft)
    return Object.keys(this.state.scouting.classes).map(Number).sort();
  },
  scoutProspect(year, pid) {
    const s = this.state;
    const cls = s.scouting.classes[year]; if (!cls) return { err: 'Cuvée indisponible.' };
    const p = cls.find(x => x.id === pid); if (!p) return { err: 'Prospect introuvable.' };
    if ((p.scout || 0) >= 3) return { err: 'Prospect déjà scouté à fond.' };
    if (s.scouting.points <= 0) return { err: 'Plus de points de scouting cette saison.' };
    p.scout = (p.scout || 0) + 1;
    s.scouting.points--;
    this.save();
    return { ok: true, level: p.scout };
  },

  /* --------------------------- Actions manager -------------------------- */
  signFreeAgent(faId, salary, years) {
    const s = this.state; const ut = this.ut();
    const idx = s.freeAgents.findIndex(p => p.id === faId);
    if (idx < 0) return false;
    if (ut.roster.length >= 15) return { err: 'Effectif complet (15 max).' };
    const fa = s.freeAgents[idx];
    fa.salary = round1(clamp(salary, MIN_SALARY, maxSalary(fa))); fa.years = years;
    fa.morale = 75;
    s.freeAgents.splice(idx, 1);
    ut.roster.push(fa);
    ut.lineup = autoLineup(ut.roster); autoMinutes(ut); ut.priorities = autoPriorities(ut);
    this.log(`${fa.name} signe pour ${years} an(s) à ${round1(salary)} M$/an.`);
    this.save();
    return true;
  },

  releasePlayer(pid) {
    const s = this.state; const ut = this.ut();
    const p = playerById(ut, pid); if (!p) return;
    ut.roster = ut.roster.filter(x => x.id !== pid);
    ut.lineup = autoLineup(ut.roster); autoMinutes(ut); ut.priorities = autoPriorities(ut);
    if (s.freeAgents) { p.years = 0; s.freeAgents.unshift(p); }
    this.log(`${p.name} est libéré.`);
    this.save();
  },

  resignPlayer(pid, salary, years) {
    const p = playerById(this.ut(), pid); if (!p) return;
    const cap = maxSalary(p);
    p.salary = round1(clamp(salary, MIN_SALARY, cap)); p.years = years;
    p.morale = clamp((p.morale != null ? p.morale : 70) + 8, 5, 100);   // prolongation = moral en hausse
    const rookie = p.draftedSeason && p.age <= 25;
    this.log(`${rookie ? 'Prolongation rookie' : 'Prolongation'} : ${p.name} — ${years} an(s), ${p.salary} M$/an${p.salary >= cap ? ' (max)' : ''}.`);
    this.save();
  },

  /* -------------------------- Négociations de contrat ------------------- */
  contractDemand(p, resign) {
    const market = contractValue(p.ovr, p.age);
    const factor = 0.90 + (nameHash(p.name) % 24) / 100;       // 0.90..1.13, stable par joueur
    const morale = p.morale != null ? p.morale : 70;
    const loyalty = resign ? clamp((morale - 60) / 45, -0.18, 0.12) : 0;  // bon moral => accepte un peu moins
    const wantYears = p.age <= 26 ? 4 : p.age <= 30 ? 3 : p.age <= 33 ? 2 : 1;
    const ask = round1(clamp(market * factor * (resign ? 1 : 1.05), MIN_SALARY, maxSalary(p)));
    return { market, factor, loyalty, wantYears, ask, cap: maxSalary(p) };
  },
  // Intérêt du joueur pour une offre (pour l'affichage temps réel)
  contractInterest(p, salary, years, resign) {
    const d = this.contractDemand(p, resign);
    const ratio = salary / (d.ask || 1);
    const yearsPen = years < d.wantYears ? (d.wantYears - years) * 0.05 : 0;
    const eff = ratio - yearsPen + d.loyalty;
    const pct = clamp(Math.round(eff * 100), 0, 100);
    const label = eff >= 0.98 ? 'Prêt à signer' : eff >= 0.84 ? 'Ouvert (contre-offre)' : eff >= 0.62 ? 'Réticent' : 'Refuse';
    const color = eff >= 0.98 ? 'var(--green)' : eff >= 0.84 ? 'var(--accent)' : 'var(--red)';
    return { pct, label, color, ask: d.ask, wantYears: d.wantYears, cap: d.cap };
  },
  _evalContract(p, salary, years, d) {
    const ratio = salary / (d.ask || 1);
    const yearsPen = years < d.wantYears ? (d.wantYears - years) * 0.05 : 0;
    const eff = ratio - yearsPen + d.loyalty;
    if (salary >= d.cap - 0.01 && years >= d.wantYears) return { status: 'accept' };
    if (eff >= 0.98) return { status: 'accept' };
    if (eff >= 0.84) return { status: 'counter', counterSalary: round1(Math.min(d.ask, d.cap)), counterYears: d.wantYears, ask: d.ask };
    return { status: 'reject', ask: d.ask, wantYears: d.wantYears };
  },
  negotiateFreeAgent(faId, salary, years) {
    const s = this.state; const fa = (s.freeAgents || []).find(p => p.id === faId);
    if (!fa) return { status: 'gone', msg: 'Ce joueur n\'est plus disponible.' };
    if (this.ut().roster.length >= 15) return { status: 'reject', msg: 'Effectif complet (15 max).' };
    const d = this.contractDemand(fa, false);
    const r = this._evalContract(fa, salary, years, d);
    if (r.status === 'accept') { this.signFreeAgent(faId, salary, years); return { status: 'accept', msg: `${fa.name} accepte et signe !` }; }
    if (r.status === 'counter') return { status: 'counter', counterSalary: r.counterSalary, counterYears: r.counterYears, msg: `${fa.name} demande ${r.counterSalary} M$ sur ${r.counterYears} ans.` };
    return { status: 'reject', msg: `${fa.name} refuse (attend ~${Math.round(d.ask)} M$/an sur ${d.wantYears} ans).` };
  },
  negotiateResign(pid, salary, years) {
    const p = playerById(this.ut(), pid); if (!p) return { status: 'gone' };
    const d = this.contractDemand(p, true);
    const r = this._evalContract(p, salary, years, d);
    if (r.status === 'accept') { this.resignPlayer(pid, salary, years); return { status: 'accept', msg: `${p.name} prolonge !` }; }
    if (r.status === 'counter') return { status: 'counter', counterSalary: r.counterSalary, counterYears: r.counterYears, msg: `${p.name} veut ${r.counterSalary} M$ sur ${r.counterYears} ans.` };
    return { status: 'reject', msg: `${p.name} décline — il veut tester le marché (~${Math.round(d.ask)} M$/an).` };
  },
  advanceFAMarket() {
    const s = this.state; if (!s.freeAgents || !s.freeAgents.length) return [];
    const signed = [];
    const n = 2 + randInt(0, 3);
    for (let k = 0; k < n && s.freeAgents.length; k++) {
      const fa = s.freeAgents[0];   // les meilleurs partent en premier
      const suitors = leagueIds().filter(id => id !== s.userTeam && s.teams[id].roster.length < 14);
      if (!suitors.length || rnd() > 0.7) { s.freeAgents.shift(); continue; }
      const tid = pick(suitors);
      s.freeAgents.shift();
      fa.salary = contractValue(fa.ovr, fa.age); fa.years = randInt(1, 3); fa.morale = 72;
      const t = s.teams[tid]; t.roster.push(fa);
      t.lineup = autoLineup(t.roster); autoMinutes(t); t.priorities = autoPriorities(t);
      signed.push({ name: fa.name, ovr: fa.ovr, team: tid });
    }
    signed.forEach(x => this.log(`Agent libre : ${x.name} (${x.ovr}) signe chez ${teamById(x.team).city}.`));
    this.save();
    return signed;
  },

  /* --------------------------------- Draft ------------------------------ */
  // Construit l'ordre de draft (2 tours, pire bilan d'abord) selon la propriété des picks
  startDraft(year) {
    const s = this.state;
    const rec = draftOrder(s);   // 30 équipes, pire bilan d'abord
    const board = [];
    [1, 2].forEach(round => {
      rec.forEach(origId => {
        board.push({ round, origId, teamId: resolvePickOwner(s, year, round, origId), pickId: null });
      });
    });
    s.draft = { year, board, onClock: 0, done: false };
    s.userPicksLeft = board.filter(sl => sl.teamId === s.userTeam).length;
    this.advanceDraft();
  },
  // Fait avancer la draft : l'IA choisit automatiquement jusqu'à un choix de l'utilisateur (ou fin)
  advanceDraft() {
    const s = this.state; const d = s.draft; if (!d) return;
    let guard = 0;
    while (d.onClock < d.board.length && guard++ < 200) {
      const slot = d.board[d.onClock];
      if (slot.pickId) { d.onClock++; continue; }
      if (slot.teamId === s.userTeam) { this.save(); return; }   // à l'utilisateur de choisir
      // L'IA prend le meilleur prospect disponible
      const p = s.draftClass.shift();
      if (!p) { d.done = true; break; }
      this._assignPick(slot, p);
      d.onClock++;
    }
    if (d.onClock >= d.board.length) d.done = true;
    this.save();
  },
  _assignPick(slot, p) {
    const s = this.state;
    p.prospect = false; delete p.scout; delete p._noise;
    p.draftedSeason = s.season + 1;   // saison de début NBA (pour le trophée de rookie)
    slot.pickId = p.id; slot.pickName = p.name; slot.pickPos = p.pos; slot.pickOvr = p.ovr;
    const team = s.teams[slot.teamId];
    team.roster.push(p);
    team.lineup = autoLineup(team.roster); autoMinutes(team); team.priorities = autoPriorities(team);
  },
  // L'utilisateur sélectionne un prospect (quand c'est son tour)
  userDraftPick(pid) {
    const s = this.state; const d = s.draft; if (!d || d.done) return { err: 'Draft terminée.' };
    const slot = d.board[d.onClock];
    if (!slot || slot.teamId !== s.userTeam) return { err: 'Ce n\'est pas votre tour.' };
    if (this.ut().roster.length >= 15) return { err: 'Effectif complet (15 max).' };
    const idx = s.draftClass.findIndex(p => p.id === pid);
    if (idx < 0) return { err: 'Prospect indisponible.' };
    const p = s.draftClass.splice(idx, 1)[0];
    this._assignPick(slot, p);
    this.log(`Draft (choix ${d.onClock + 1}, tour ${slot.round}) : vous sélectionnez ${p.name} (${p.pos}, ${p.ovr} OVR, pot. ${p.potential}).`);
    d.onClock++;
    this.advanceDraft();
    return { ok: true };
  },
  // Simule tout le reste de la draft (l'IA choisit aussi pour vos éventuels picks restants)
  simDraftAll() {
    const s = this.state; const d = s.draft; if (!d) return;
    let guard = 0;
    while (!d.done && d.onClock < d.board.length && guard++ < 200) {
      const slot = d.board[d.onClock];
      if (slot.pickId) { d.onClock++; continue; }
      const p = s.draftClass.shift();
      if (!p) { d.done = true; break; }
      this._assignPick(slot, p);
      d.onClock++;
    }
    d.done = true;
    this.save();
  },

  setLineup(pos, pid) {
    const ut = this.ut();
    // empêcher un même joueur à 2 postes
    Object.keys(ut.lineup).forEach(k => { if (ut.lineup[k] === pid) delete ut.lineup[k]; });
    ut.lineup[pos] = pid;
    autoMinutes(ut);
    this.save();
  },

  setMinutes(pid, mins) {
    const ut = this.ut();
    ut.minutes[pid] = clamp(Math.round(mins), 0, 42);
    this.save();
  },

  autoManage() {
    const ut = this.ut();
    ut.lineup = autoLineup(ut.roster); autoMinutes(ut); ut.priorities = autoPriorities(ut);
    this.save();
  },

  /* --------------------------- Schémas & priorités ---------------------- */
  setOffScheme(key) { if (OFF_SCHEMES[key]) { this.ut().offScheme = key; this.save(); } },
  setDefScheme(key) { if (DEF_SCHEMES[key]) { this.ut().defScheme = key; this.save(); } },
  // Réordonne la hiérarchie offensive : déplace un joueur d'un cran (dir -1 = monte)
  movePriority(pid, dir) {
    const ut = this.ut();
    let arr = (ut.priorities || []).slice();
    if (!arr.includes(pid)) arr.push(pid);
    const i = arr.indexOf(pid);
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    ut.priorities = arr;
    this.save();
  },
  addPriority(pid) {
    const ut = this.ut();
    ut.priorities = (ut.priorities || []).filter(x => x !== pid);
    ut.priorities.push(pid);
    this.save();
  },
  removePriority(pid) {
    const ut = this.ut();
    ut.priorities = (ut.priorities || []).filter(x => x !== pid);
    this.save();
  },
  resetPriorities() { const ut = this.ut(); ut.priorities = autoPriorities(ut); this.save(); },

  /* --------------------------- Transferts (assets) ---------------------- */
  // Un asset est { kind:'player', id } ou { kind:'pick', year, round, from }
  acceptPendingTrade() {
    const s = this.state; const t = s.pendingTrade; if (!t) return;
    executeTrade(s, t.partner, t.userGives, t.userGets);
    this.log(`Transfert conclu avec ${teamById(t.partner).city}.`);
    s.pendingTrade = null; this.save();
  },
  declinePendingTrade() { this.state.pendingTrade = null; this.save(); },

  // Offre de l'utilisateur vers une IA (assets des deux côtés)
  proposeUserTrade(otherId, userGives, userGets) {
    const s = this.state;
    if (!userGives.length && !userGets.length) return { err: 'Sélectionnez au moins un élément.' };
    const res = aiEvaluateTrade(s, otherId, userGives, userGets);
    if (res.ok) {
      executeTrade(s, otherId, userGives, userGets);
      this.log(`Échange conclu avec ${teamById(otherId).city}.`);
      this.save();
      return { ok: true };
    }
    return { ok: false, err: res.reason };
  },
  // Évaluation sans exécuter (pour le bouton "Évaluer")
  evalUserTrade(otherId, userGives, userGets) {
    return aiEvaluateTrade(this.state, otherId, userGives, userGets);
  },

  /* --------------------- Match interactif (quart-temps) ----------------- */
  startLiveGame() {
    const s = this.state;
    const next = this.nextUserGame();
    if (!next) return null;
    while (s.dayIndex < next.day) this.simulateDay();
    const g = s.schedule[s.dayIndex].find(x => x === next.game);
    s.liveGame = {
      gameRef: { home: g.home, away: g.away },
      q: 0,
      home: newBox(), away: newBox(),
      quarters: [],   // [{q, hs, as}]
      done: false,
    };
    this.save();
    return s.liveGame;
  },
  // Simule le prochain quart-temps avec les schémas actuels de l'utilisateur
  simQuarter() {
    const s = this.state; const lg = s.liveGame; if (!lg || lg.done) return null;
    const H = s.teams[lg.gameRef.home], A = s.teams[lg.gameRef.away];
    // ~un quart de match
    const portion = 0.25;
    const qh = genTeamBox(H, A, portion);
    const qa = genTeamBox(A, H, portion);
    if (lg.q === 0) qh.score += randInt(1, 4);  // avantage terrain au 1er quart
    mergeBox(lg.home, qh); mergeBox(lg.away, qa);
    lg.q++;
    lg.quarters.push({ q: lg.q, hs: qh.score, as: qa.score });
    if (lg.q >= 4) {
      // prolongations si égalité
      let ot = 0;
      while (lg.home.score === lg.away.score) {
        const oh = genTeamBox(H, A, 0.12), oa = genTeamBox(A, H, 0.12);
        mergeBox(lg.home, oh); mergeBox(lg.away, oa);
        if (++ot > 4) { lg.home.score++; }
      }
      lg.ot = ot; lg.done = true;
    }
    this.save();
    return lg;
  },
  // Termine le match en cours et applique le résultat au calendrier/cumuls
  finishLiveGame() {
    const s = this.state; const lg = s.liveGame; if (!lg) return null;
    while (!lg.done) this.simQuarter();
    const g = s.schedule[s.dayIndex].find(x => x.home === lg.gameRef.home && x.away === lg.gameRef.away && !x.played);
    const res = { home: lg.home, away: lg.away, ot: lg.ot || 0 };
    if (g) {
      applyGameResult(s, g.home, g.away, res);
      g.played = true; g.hs = res.home.score; g.as = res.away.score;
      this.recordUserGame(g, res);
    }
    this.simulateDay();
    this.checkSeasonEnd();
    s.liveGame = null;
    this.save();
    return { game: g, res };
  },
};
