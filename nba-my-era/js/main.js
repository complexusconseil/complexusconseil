/* ==========================================================================
   NBA My Era — Orchestration (état global, sauvegarde, flux de saison)
   ========================================================================== */

const SAVE_KEY = 'nba_my_era_save_v1';
const GAMES_PER_SEASON = 82;

const Game = {
  state: null,

  /* ------------------------------ Nouvelle partie ----------------------- */
  newGame(userTeamId, managerName) {
    const teams = buildLeague(userTeamId);
    this.state = {
      season: 2026,
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
      scouting: {                  // cuvées futures pour le scouting
        points: 12,
        classes: {
          2027: genProspectClass(2027),
          2028: genProspectClass(2028),
          2029: genProspectClass(2029),
        },
      },
    };
    this.log(`Bienvenue à la tête des ${this.userTeamFull().name} !`);
    this.save();
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
    this.state = obj.state; _pid = obj.pid || 1; this.save();
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
    s.dayIndex++;
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
    const east = standings(s, 'EAST').slice(0, 8).map(x => x.team.id);
    const west = standings(s, 'WEST').slice(0, 8).map(x => x.team.id);
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
    // seeds ordonnés 1..8 -> 1v8,4v5,3v6,2v7
    const pairs = [[0,7],[3,4],[2,5],[1,6]];
    return pairs.map(([a,b]) => ({
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

    if (p.round < 2) {
      // avancer d'un tour dans chaque conférence
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
    const champ = s.playoffs.champion;
    if (champ === s.userTeam) {
      s.trophies.push(s.season);
      this.log(`🏆 CHAMPIONS NBA ${s.season} ! Félicitations !`);
    } else {
      this.log(`${teamById(champ).city} ${teamById(champ).name} champions ${s.season}.`);
    }
    this.startOffseason();
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
    // Draft = cuvée scoutée de l'an prochain (ou générée si absente)
    const dy = s.season + 1;
    s.draftClass = (s.scouting.classes[dy] || genProspectClass(dy)).slice()
                     .sort((a, b) => a.projRank - b.projRank);
    // Nombre de choix de 1er tour possédés par l'utilisateur cette année
    s.userPicksLeft = this.ut().picks.filter(p => p.year === dy && p.round === 1).length || 1;
    s.freeAgents = genFreeAgents();
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
    });
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
    // reset bilans
    Object.values(s.teams).forEach(t => { t.w = 0; t.l = 0; t.streak = 0; t.ptsFor = 0; t.ptsAgn = 0; });
    this.log(`Début de la saison ${s.season}.`);
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
    fa.salary = round1(salary); fa.years = years;
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
    p.salary = round1(salary); p.years = years;
    this.log(`${p.name} prolongé : ${years} an(s), ${round1(salary)} M$/an.`);
    this.save();
  },

  draftPlayer(pid) {
    const s = this.state; const ut = this.ut();
    if ((s.userPicksLeft || 0) <= 0) return { err: 'Vous n\'avez plus de choix de draft cette année.' };
    if (ut.roster.length >= 15) return { err: 'Effectif complet (15 max).' };
    const idx = s.draftClass.findIndex(p => p.id === pid);
    if (idx < 0) return;
    const p = s.draftClass.splice(idx, 1)[0];
    // nettoie les champs de prospect
    p.prospect = false; delete p.scout; delete p._noise; delete p.projRank;
    ut.roster.push(p);
    ut.lineup = autoLineup(ut.roster); autoMinutes(ut); ut.priorities = autoPriorities(ut);
    s.userPicksLeft--;
    this.log(`Draft : vous sélectionnez ${p.name} (${p.pos}, ${p.ovr} OVR, potentiel ${p.potential}).`);
    this.save();
    return { ok: true };
  },

  // L'IA drafte automatiquement (meilleur prospect dispo) pour un pick
  aiDraft(teamId) {
    const s = this.state;
    if (!s.draftClass.length) return null;
    const p = s.draftClass.shift();
    s.teams[teamId].roster.push(p);
    return p;
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
