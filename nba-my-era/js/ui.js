/* ==========================================================================
   NBA My Era — Interface (rendu, écrans, interactions)
   ========================================================================== */

const UI = {
  tab: 'dash',
  tradePartner: null,

  /* ------------------------------- Helpers ------------------------------ */
  el(id) { return document.getElementById(id); },
  avg(s, k) { return s.gp ? s[k] / s.gp : 0; },
  fmt(n, d = 1) { return (Math.round(n * 10 ** d) / 10 ** d).toFixed(d); },
  ovrClass(o) { return o >= 88 ? 'elite' : o >= 80 ? 'great' : o >= 73 ? 'good' : o >= 65 ? 'avg' : 'low'; },
  ovrTag(o) { return `<span class="ovr ${this.ovrClass(o)}">${o}</span>`; },
  posTag(p) { return `<span class="pos-tag">${p}</span>`; },
  badge(id, size = 42) {
    const t = teamById(id);
    return `<span class="badge" style="background:${t.c1};border-color:${t.c2};width:${size}px;height:${size}px;font-size:${size*0.34}px">${id}</span>`;
  },

  toast(msg) {
    let wrap = this.el('toasts');
    if (!wrap) { wrap = document.createElement('div'); wrap.id = 'toasts'; wrap.className = 'toast-wrap'; document.body.appendChild(wrap); }
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
    wrap.appendChild(t);
    setTimeout(() => t.remove(), 3400);
  },

  modal(html) {
    this.closeModal();
    const bg = document.createElement('div');
    bg.className = 'modal-bg'; bg.id = 'modal-bg';
    bg.innerHTML = `<div class="modal">${html}</div>`;
    bg.addEventListener('click', e => { if (e.target === bg) this.closeModal(); });
    document.body.appendChild(bg);
  },
  closeModal() { const m = this.el('modal-bg'); if (m) m.remove(); },

  /* -------------------------------- Rendu ------------------------------- */
  render() {
    const root = this.el('app');
    if (!Game.state) { root.innerHTML = this.homeScreen(); this.wireHome(); return; }
    root.innerHTML = this.topbar() + this.tabsBar() + `<main id="main"></main>` + this.footer();
    this.renderTab();
    this.wireGlobal();
  },

  footer() {
    return `<div class="footer-note">NBA My Era — mode My Era · jeu de gestion local · joueurs & données fictifs</div>`;
  },

  /* --------------------------- Écran d'accueil -------------------------- */
  homeScreen() {
    const cards = TEAMS.map(t => `
      <div class="team-card" data-team="${t.id}">
        <div class="logo" style="background:${t.c1};border-color:${t.c2}">${t.id}</div>
        <div class="cname">${t.name}</div>
        <div class="cmeta">${t.city} · ${CONFS[t.conf]}</div>
      </div>`).join('');
    const canResume = Game.hasSave();
    return `
      <div class="hero">
        <h1>NBA <span>My Era</span></h1>
        <p>Prenez les rênes d'une franchise NBA. Gérez l'effectif, le cinq de départ, les rotations,
           les transferts, la draft et les agents libres — saison après saison.</p>
      </div>
      <main>
        <div class="card">
          <div class="row" style="justify-content:space-between">
            <h2>🏀 Nouvelle carrière</h2>
            <div class="row">
              ${canResume ? `<button class="btn green" id="btn-resume">▶ Reprendre la partie</button>` : ''}
              <button class="btn ghost" id="btn-import">📂 Importer une sauvegarde</button>
              <input type="file" id="file-import" accept="application/json" class="hidden">
            </div>
          </div>
          <h3>Votre nom de manager</h3>
          <input type="text" id="mgr-name" placeholder="Ex : Alex" style="width:220px;background:var(--bg3);color:var(--text);border:1px solid var(--border);border-radius:7px;padding:8px 10px">
          <h3>Choisissez votre franchise</h3>
          <div class="team-picker">${cards}</div>
          <div class="row end" style="margin-top:16px">
            <button class="btn primary" id="btn-start" disabled>Démarrer ma carrière →</button>
          </div>
        </div>
      </main>`;
  },

  wireHome() {
    let sel = null;
    document.querySelectorAll('.team-card').forEach(c => {
      c.addEventListener('click', () => {
        document.querySelectorAll('.team-card').forEach(x => x.classList.remove('selected'));
        c.classList.add('selected'); sel = c.dataset.team;
        this.el('btn-start').disabled = false;
      });
    });
    this.el('btn-start').addEventListener('click', () => {
      if (!sel) return;
      const name = this.el('mgr-name').value.trim() || 'Manager';
      Game.newGame(sel, name);
      this.tab = 'dash'; this.render();
    });
    const resume = this.el('btn-resume');
    if (resume) resume.addEventListener('click', () => { if (Game.load()) { this.tab = 'dash'; this.render(); } });
    this.el('btn-import').addEventListener('click', () => this.el('file-import').click());
    this.el('file-import').addEventListener('change', e => {
      const f = e.target.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = () => { try { Game.importSave(r.result); this.tab='dash'; this.render(); this.toast('Sauvegarde importée'); } catch { alert('Fichier invalide'); } };
      r.readAsText(f);
    });
  },

  /* -------------------------------- Topbar ------------------------------ */
  topbar() {
    const s = Game.state; const t = Game.userTeamFull(); const ut = Game.ut();
    const phaseLabel = { regular: 'Saison régulière', playoffs: 'Playoffs', offseason: 'Intersaison' }[s.phase];
    const sal = teamSalary(ut);
    return `
      <header class="topbar" style="background:linear-gradient(90deg, ${t.c1}, var(--bg2) 70%)">
        <span class="badge" style="background:${t.c1};border-color:${t.c2}">${t.id}</span>
        <div class="tinfo">
          <b>${t.city} ${t.name}</b>
          <small>${s.managerName} · ${CONFS[t.conf]} · ${t.div}</small>
        </div>
        <div class="spacer"></div>
        <span class="chip">Saison <b>${s.season}</b></span>
        <span class="chip">${phaseLabel}</span>
        <span class="chip">Bilan <b>${ut.w}-${ut.l}</b></span>
        <span class="chip">Masse sal. <b>${sal} M$</b></span>
        ${s.trophies.length ? `<span class="chip">🏆 <b>${s.trophies.length}</b></span>` : ''}
        <button class="btn-mini" id="btn-save">💾 Sauver</button>
        <button class="btn-mini" id="btn-menu">☰</button>
      </header>`;
  },

  tabsBar() {
    const s = Game.state;
    const tabs = [['dash', '🏠 Accueil'], ['roster', '👥 Effectif'], ['lineup', '📋 Cinq & Rotations']];
    if (s.phase === 'regular') tabs.push(['play', '🏀 Match'], ['schedule', '🗓️ Calendrier']);
    if (s.phase === 'playoffs') tabs.push(['playoffs', '🏆 Playoffs']);
    if (s.phase === 'offseason') tabs.push(['offseason', '🌴 Intersaison']);
    tabs.push(['trades', '🔁 Transferts'], ['standings', '📊 Classements'], ['league', '🌐 Ligue'], ['news', '📰 Actus']);
    // onglet actif par défaut cohérent avec la phase
    if (s.phase === 'playoffs' && this.tab === 'play') this.tab = 'playoffs';
    if (s.phase === 'offseason' && (this.tab === 'play' || this.tab === 'schedule' || this.tab==='playoffs')) this.tab = 'offseason';
    if (s.phase === 'regular' && (this.tab === 'playoffs' || this.tab === 'offseason')) this.tab = 'dash';
    return `<nav class="tabs">${tabs.map(([id, l]) =>
      `<button data-tab="${id}" class="${this.tab === id ? 'active' : ''}">${l}</button>`).join('')}</nav>`;
  },

  wireGlobal() {
    document.querySelectorAll('nav.tabs button').forEach(b =>
      b.addEventListener('click', () => { this.tab = b.dataset.tab; this.render(); }));
    this.el('btn-save').addEventListener('click', () => { Game.save(); this.toast('Partie sauvegardée'); });
    this.el('btn-menu').addEventListener('click', () => this.menuModal());
    // proposition de transfert IA en attente
    if (Game.state.pendingTrade && !this._tradeShown) { this._tradeShown = true; this.showPendingTrade(); }
    if (!Game.state.pendingTrade) this._tradeShown = false;
  },

  renderTab() {
    const m = this.el('main');
    const map = {
      dash: () => this.dashView(), roster: () => this.rosterView(), lineup: () => this.lineupView(),
      play: () => this.playView(), schedule: () => this.scheduleView(), standings: () => this.standingsView(),
      league: () => this.leagueView(), news: () => this.newsView(), trades: () => this.tradesView(),
      playoffs: () => this.playoffsView(), offseason: () => this.offseasonView(),
    };
    m.innerHTML = (map[this.tab] || map.dash)();
    this.wireTab();
  },

  /* ----------------------------- Tableau de bord ------------------------ */
  dashView() {
    const s = Game.state; const ut = Game.ut(); const t = Game.userTeamFull();
    const conf = standings(s, t.conf);
    const rank = conf.findIndex(x => x.team.id === t.id) + 1;
    const played = ut.w + ut.l;
    const next = Game.nextUserGame();
    let nextHtml = '<span class="muted">Aucun match à venir</span>';
    if (next && s.phase === 'regular') {
      const g = next.game; const home = g.home === t.id;
      const oppId = home ? g.away : g.home; const opp = teamById(oppId);
      nextHtml = `<div class="row" style="gap:14px;align-items:center">
        ${this.badge(oppId, 40)}
        <div><b>${home ? 'vs' : '@'} ${opp.city} ${opp.name}</b><br>
        <small class="muted">${CONFS[opp.conf]} · ${s.teams[oppId].w}-${s.teams[oppId].l}</small></div>
        <div class="spacer" style="flex:1"></div>
        <button class="btn primary" data-act="goplay">Jouer →</button></div>`;
    }
    // meilleurs joueurs
    const leaders = [...ut.roster].filter(p=>p.stats.gp>0).sort((a,b)=>this.avg(b.stats,'pts')-this.avg(a.stats,'pts')).slice(0,3);
    const news = s.news.slice(0, 6).map(n => `<div class="kv"><span>${n.msg}</span><span class="muted">${n.s}</span></div>`).join('') || '<div class="muted">—</div>';

    return `
      <div class="grid cols3">
        <div class="card"><h3>Classement ${CONFS[t.conf]}</h3>
          <div class="big">${rank}<small class="muted" style="font-size:16px">e</small></div>
          <div class="muted">Bilan ${ut.w}-${ut.l} · ${played?this.fmt(ut.w/played*100,0):0}% victoires</div>
        </div>
        <div class="card"><h3>Attaque / Défense</h3>
          <div class="kv"><span>Points marqués</span><span class="v">${played?this.fmt(ut.ptsFor/played):'—'}</span></div>
          <div class="kv"><span>Points encaissés</span><span class="v">${played?this.fmt(ut.ptsAgn/played):'—'}</span></div>
          <div class="kv"><span>Différentiel</span><span class="v">${played?(ut.ptsFor>=ut.ptsAgn?'+':'')+this.fmt((ut.ptsFor-ut.ptsAgn)/played):'—'}</span></div>
        </div>
        <div class="card"><h3>Franchise</h3>
          <div class="kv"><span>Note d'équipe</span><span class="v">${teamOverall(ut)} OVR</span></div>
          <div class="kv"><span>Masse salariale</span><span class="v">${teamSalary(ut)} M$</span></div>
          <div class="kv"><span>Titres remportés</span><span class="v">${s.trophies.length} 🏆</span></div>
        </div>
      </div>
      <div class="grid cols2">
        <div class="card"><h2>Prochain match</h2>${nextHtml}
          ${s.phase==='regular' ? `<div class="row" style="margin-top:14px">
            <button class="btn ghost sm" data-act="simday">Simuler la journée</button>
            <button class="btn ghost sm" data-act="simweek">Avancer jusqu'à mon match</button>
          </div>`:''}
          ${s.phase==='playoffs'?`<div class="muted">Les playoffs ont commencé — voir l'onglet Playoffs.</div>`:''}
          ${s.phase==='offseason'?`<div class="muted">Intersaison en cours — voir l'onglet Intersaison.</div>`:''}
        </div>
        <div class="card"><h2>Cadres de l'équipe</h2>
          ${leaders.length ? `<div class="table-wrap"><table><thead><tr><th class="name">Joueur</th><th>MIN</th><th>PTS</th><th>REB</th><th>PAS</th></tr></thead><tbody>${
            leaders.map(p=>`<tr><td class="name">${this.posTag(p.pos)} ${p.name} ${this.ovrTag(p.ovr)}</td>
              <td>${this.fmt(this.avg(p.stats,'min'))}</td><td><b>${this.fmt(this.avg(p.stats,'pts'))}</b></td>
              <td>${this.fmt(this.avg(p.stats,'oreb')+this.avg(p.stats,'dreb'))}</td><td>${this.fmt(this.avg(p.stats,'ast'))}</td></tr>`).join('')
          }</tbody></table></div>` : '<div class="muted">Statistiques disponibles après quelques matchs.</div>'}
        </div>
      </div>
      <div class="card"><h2>Actualités</h2>${news}</div>`;
  },

  /* ------------------------------- Effectif ----------------------------- */
  rosterView(teamId, embed) {
    const ut = teamId ? Game.state.teams[teamId] : Game.ut();
    const isUser = ut.id === Game.state.userTeam;
    const starters = new Set(Object.values(ut.lineup));
    const rows = [...ut.roster].sort((a,b)=>b.ovr-a.ovr).map(p => {
      const st = p.stats; const inLine = starters.has(p.id);
      return `<tr>
        <td>${this.posTag(p.pos)}</td>
        <td class="name">${inLine?'⭐ ':''}${p.name}</td>
        <td>${p.age}</td>
        <td>${this.ovrTag(p.ovr)}</td>
        <td class="muted">${p.potential}</td>
        <td>${p.salary} M$ <small class="muted">(${p.years||1}a)</small></td>
        <td>${ut.minutes[p.id]||0}</td>
        <td>${st.gp?this.fmt(this.avg(st,'pts')):'—'}</td>
        <td>${st.gp?this.fmt(this.avg(st,'oreb')+this.avg(st,'dreb')):'—'}</td>
        <td>${st.gp?this.fmt(this.avg(st,'ast')):'—'}</td>
        <td><button class="btn ghost sm" data-player="${p.id}">Fiche</button>
        ${isUser?`<button class="btn red sm" data-release="${p.id}">✕</button>`:''}</td>
      </tr>`;
    }).join('');
    const cap = `<div class="row" style="justify-content:space-between;margin-bottom:6px">
      <span class="muted">${ut.roster.length}/15 joueurs · Note ${teamOverall(ut)} OVR</span>
      <span class="muted">Masse : <b>${teamSalary(ut)} M$</b> / plafond ${SALARY_CAP} M$ ${teamSalary(ut)>LUXURY_TAX?'· <span style="color:var(--red)">taxe de luxe</span>':''}</span>
    </div>`;
    return `<div class="card"><h2>Effectif — ${teamById(ut.id).city} ${teamById(ut.id).name}</h2>
      ${cap}
      <div class="table-wrap"><table>
        <thead><tr><th>Pos</th><th class="name">Joueur</th><th>Âge</th><th>OVR</th><th>Pot</th><th>Contrat</th><th>MIN</th><th>PTS</th><th>REB</th><th>PAS</th><th></th></tr></thead>
        <tbody>${rows}</tbody></table></div></div>`;
  },

  /* --------------------------- Cinq & Rotations ------------------------- */
  lineupView() {
    const ut = Game.ut();
    const totalMin = ut.roster.reduce((s,p)=>s+(ut.minutes[p.id]||0),0);
    const starterRows = POSITIONS.map(pos => {
      const options = ut.roster.slice().sort((a,b)=>b.ovr-a.ovr).map(p =>
        `<option value="${p.id}" ${ut.lineup[pos]===p.id?'selected':''}>${p.name} (${p.pos} · ${p.ovr})</option>`).join('');
      return `<div class="kv"><span>${this.posTag(pos)} Titulaire</span>
        <select data-line="${pos}">${options}</select></div>`;
    }).join('');
    const minRows = [...ut.roster].sort((a,b)=>(ut.minutes[b.id]||0)-(ut.minutes[a.id]||0)).map(p =>
      `<div class="kv"><span>${this.posTag(p.pos)} ${p.name} ${this.ovrTag(p.ovr)}</span>
        <input class="mins" type="number" min="0" max="42" value="${ut.minutes[p.id]||0}" data-min="${p.id}"></div>`).join('');
    const okColor = totalMin===240?'var(--green)':'var(--red)';
    return `<div class="grid cols2">
      <div class="card"><h2>Cinq de départ</h2>${starterRows}
        <div class="row" style="margin-top:12px"><button class="btn ghost sm" data-act="autoline">⚙️ Cinq automatique</button></div>
      </div>
      <div class="card"><h2>Rotation (minutes)</h2>
        <div class="row" style="justify-content:space-between;margin-bottom:8px">
          <span class="muted">Total minutes</span>
          <span style="font-weight:800;color:${okColor}">${totalMin} / 240</span></div>
        ${minRows}
        <div class="row" style="margin-top:12px"><button class="btn ghost sm" data-act="automin">⚙️ Minutes auto (240)</button></div>
        <p class="muted" style="margin-top:8px;font-size:12px">Astuce : le total idéal est 240 minutes (5 joueurs × 48 min). Les joueurs à 0 minute ne jouent pas.</p>
      </div>
    </div>`;
  },

  /* -------------------------------- Match ------------------------------- */
  playView() {
    const s = Game.state; const next = Game.nextUserGame();
    if (!next) return `<div class="card center"><h2>Saison régulière terminée</h2>
      <p class="muted">Direction les playoffs !</p>
      <button class="btn primary" data-act="checkend">Continuer →</button></div>`;
    const g = next.game; const home = g.home === s.userTeam;
    const oppId = home ? g.away : g.home; const opp = teamById(oppId);
    const ut = Game.ut(); const ot = s.teams[oppId];
    return `<div class="card">
      <h2>Match ${ut.w+ut.l+1}</h2>
      <div class="scoreboard">
        <div class="tm">${this.badge(home?oppId:s.userTeam,54)}<div style="margin-top:6px"><b>${teamById(home?oppId:s.userTeam).name}</b></div>
          <small class="muted">${(home?ot:ut).w}-${(home?ot:ut).l}</small></div>
        <div style="font-weight:800;font-size:24px;color:var(--muted)">@</div>
        <div class="tm">${this.badge(home?s.userTeam:oppId,54)}<div style="margin-top:6px"><b>${teamById(home?s.userTeam:oppId).name}</b></div>
          <small class="muted">${(home?ut:ot).w}-${(home?ut:ot).l}</small></div>
      </div>
      <p class="center muted">${home?'À domicile':'À l\'extérieur'} · Note ${teamOverall(ut)} vs ${teamOverall(ot)}</p>
      <div class="row" style="justify-content:center;margin-top:8px">
        <button class="btn primary" data-act="playgame">🏀 Jouer le match</button>
        <button class="btn ghost" data-act="simgame">⏩ Simuler rapidement</button>
      </div>
    </div>
    <div class="card"><h2>Résultats récents</h2>${this.recentResults()}</div>`;
  },

  recentResults() {
    const log = Game.state.seasonLog.slice(0, 8);
    if (!log.length) return '<div class="muted">Aucun match joué.</div>';
    return `<div class="table-wrap"><table><thead><tr><th></th><th class="name">Adversaire</th><th>Score</th><th>Résultat</th></tr></thead><tbody>${
      log.map(r => `<tr><td>${r.home?'vs':'@'}</td><td class="name">${teamById(r.oppId).city} ${teamById(r.oppId).name}</td>
        <td>${r.my}-${r.opp}</td><td><span class="pill ${r.win?'win':'loss'}">${r.win?'V':'D'}</span></td></tr>`).join('')
    }</tbody></table></div>`;
  },

  // Modale de résultat de match avec box score
  showGameResult(g, res) {
    const s = Game.state; const home = g.home === s.userTeam;
    const myBox = home ? res.home : res.away; const oppBox = home ? res.away : res.home;
    const myId = s.userTeam; const oppId = home ? g.away : g.home;
    const myScore = myBox.score, oppScore = oppBox.score; const win = myScore > oppScore;
    const boxTable = (box, teamId) => `<h3>${teamById(teamId).city} ${teamById(teamId).name}</h3>
      <div class="table-wrap"><table><thead><tr><th class="name">Joueur</th><th>MIN</th><th>PTS</th><th>TIR</th><th>3PTS</th><th>REB</th><th>PAS</th><th>INT</th><th>CTR</th></tr></thead><tbody>${
        box.box.filter(b=>b.s.min>0).sort((a,b)=>b.s.pts-a.s.pts).map(b=>{const x=b.s;return `<tr>
          <td class="name">${b.p.name}</td><td>${x.min}</td><td><b>${x.pts}</b></td>
          <td>${x.fgm}/${x.fga}</td><td>${x.tpm}/${x.tpa}</td>
          <td>${x.oreb+x.dreb}</td><td>${x.ast}</td><td>${x.stl}</td><td>${x.blk}</td></tr>`;}).join('')
      }</tbody></table></div>`;
    this.modal(`<button class="close" onclick="UI.closeModal();UI.render()">✕</button>
      <h2>${win?'🎉 Victoire !':'😞 Défaite'}${res.ot?` (${res.ot} prol.)`:''}</h2>
      <div class="scoreboard">
        <div class="tm">${this.badge(myId,48)}<div><b>${teamById(myId).name}</b></div><div class="sc ${win?'win':''}">${myScore}</div></div>
        <div class="tm">${this.badge(oppId,48)}<div><b>${teamById(oppId).name}</b></div><div class="sc ${!win?'win':''}">${oppScore}</div></div>
      </div>
      ${boxTable(myBox, myId)}
      ${boxTable(oppBox, oppId)}
      <div class="row end" style="margin-top:14px"><button class="btn primary" onclick="UI.closeModal();UI.render()">Continuer</button></div>`);
  },

  /* ------------------------------ Calendrier ---------------------------- */
  scheduleView() {
    const s = Game.state;
    const mine = [];
    s.schedule.forEach((day, di) => {
      day.forEach(g => { if (g.home===s.userTeam||g.away===s.userTeam) mine.push({di,g}); });
    });
    const rows = mine.map(({di,g}) => {
      const home = g.home===s.userTeam; const oppId = home?g.away:g.home;
      let result = '<span class="muted">à venir</span>';
      if (g.played) {
        const my = home?g.hs:g.as, opp = home?g.as:g.hs; const win = my>opp;
        result = `<span class="pill ${win?'win':'loss'}">${win?'V':'D'} ${my}-${opp}</span>`;
      }
      return `<tr><td>${di+1}</td><td>${home?'vs':'@'}</td>
        <td class="name">${teamById(oppId).city} ${teamById(oppId).name}</td><td>${result}</td></tr>`;
    }).join('');
    return `<div class="card"><h2>Calendrier — ${mine.length} matchs</h2>
      <div class="table-wrap"><table><thead><tr><th>J</th><th></th><th class="name">Adversaire</th><th>Résultat</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
  },

  /* ------------------------------ Classements --------------------------- */
  standingsView() {
    const s = Game.state;
    const tbl = conf => {
      const st = standings(s, conf);
      return `<div class="card"><h2>Conférence ${CONFS[conf]}</h2>
        <div class="table-wrap"><table><thead><tr><th>#</th><th class="name">Équipe</th><th>V</th><th>D</th><th>%</th><th>Diff</th><th>Série</th></tr></thead><tbody>${
          st.map((x,i)=>`<tr style="${x.team.id===s.userTeam?'background:rgba(240,165,0,.08)':''}">
            <td>${i+1}${i<8?'':''}</td>
            <td class="name">${this.badge(x.team.id,22)} ${x.team.city} ${x.team.name}${i===7?' <span class="muted">— barrage</span>':''}</td>
            <td><b>${x.w}</b></td><td>${x.l}</td><td>${this.fmt(x.pct*100,0)}</td>
            <td>${x.diff>=0?'+':''}${x.diff}</td>
            <td>${x.streak>0?`<span style="color:var(--green)">${x.streak}V</span>`:x.streak<0?`<span style="color:var(--red)">${-x.streak}D</span>`:'—'}</td></tr>`).join('')
        }</tbody></table></div>
        <p class="muted" style="font-size:12px;margin-top:6px">Les 8 premiers de chaque conférence sont qualifiés pour les playoffs.</p></div>`;
    };
    return `<div class="grid cols2">${tbl('EAST')}${tbl('WEST')}</div>`;
  },

  /* --------------------------------- Ligue ------------------------------ */
  leagueView() {
    const s = Game.state;
    const sel = this._leagueTeam || TEAMS.find(t=>t.id!==s.userTeam).id;
    this._leagueTeam = sel;
    const opts = TEAMS.map(t=>`<option value="${t.id}" ${t.id===sel?'selected':''}>${t.city} ${t.name} (${s.teams[t.id].w}-${s.teams[t.id].l})</option>`).join('');
    return `<div class="card"><div class="row" style="justify-content:space-between">
        <h2>Explorer la ligue</h2>
        <select id="league-sel">${opts}</select></div></div>
      ${this.rosterView(sel, true)}`;
  },

  /* --------------------------------- Actus ------------------------------ */
  newsView() {
    const s = Game.state;
    const rows = s.news.map(n=>`<div class="kv"><span>${n.msg}</span><span class="muted">${n.s}</span></div>`).join('') || '<div class="muted">Aucune actualité.</div>';
    return `<div class="card"><h2>Fil d'actualité</h2>${rows}</div>`;
  },

  /* ------------------------------- Transferts --------------------------- */
  tradesView() {
    const s = Game.state; const ut = Game.ut();
    if (s.phase === 'playoffs') return `<div class="card center"><h2>Marché fermé</h2><p class="muted">Les transferts sont indisponibles pendant les playoffs.</p></div>`;
    const partner = this.tradePartner || TEAMS.find(t=>t.id!==s.userTeam).id;
    this.tradePartner = partner;
    const ot = s.teams[partner];
    const opts = TEAMS.filter(t=>t.id!==s.userTeam).map(t=>`<option value="${t.id}" ${t.id===partner?'selected':''}>${t.city} ${t.name}</option>`).join('');
    const col = (team, side) => `<div class="table-wrap"><table><thead><tr><th></th><th class="name">Joueur</th><th>OVR</th><th>Âge</th><th>Salaire</th></tr></thead><tbody>${
      [...team.roster].sort((a,b)=>b.ovr-a.ovr).map(p=>`<tr>
        <td><input type="checkbox" data-side="${side}" value="${p.id}"></td>
        <td class="name">${this.posTag(p.pos)} ${p.name}</td><td>${this.ovrTag(p.ovr)}</td>
        <td>${p.age}</td><td>${p.salary} M$</td></tr>`).join('')
    }</tbody></table></div>`;
    return `<div class="card"><div class="row" style="justify-content:space-between">
        <h2>Bureau des transferts</h2>
        <div class="row"><span class="muted">Négocier avec :</span><select id="trade-partner">${opts}</select></div></div>
      <div class="grid cols2" style="margin-top:12px">
        <div><h3>Vous donnez — ${teamById(s.userTeam).name}</h3>${col(ut,'give')}</div>
        <div><h3>Vous recevez — ${teamById(partner).name}</h3>${col(ot,'get')}</div>
      </div>
      <div id="trade-summary" class="row" style="justify-content:space-between;margin-top:8px"></div>
      <div class="row end" style="margin-top:6px">
        <button class="btn ghost" data-act="trade-eval">Évaluer</button>
        <button class="btn primary" data-act="trade-propose">Proposer l'échange</button>
      </div>
      <p class="muted" style="font-size:12px;margin-top:8px">L'IA accepte si elle reçoit une valeur au moins équivalente (jeunesse et potentiel valorisés).</p>
    </div>`;
  },

  gatherTrade() {
    const give = [...document.querySelectorAll('input[data-side=give]:checked')].map(x=>+x.value);
    const get = [...document.querySelectorAll('input[data-side=get]:checked')].map(x=>+x.value);
    return { give, get };
  },

  showPendingTrade() {
    const s = Game.state; const t = s.pendingTrade;
    const from = s.teams[t.fromId];
    const giveNames = t.give.map(id=>{const p=playerById(from,id);return p?`${p.name} (${p.pos} ${p.ovr})`:'';}).filter(Boolean).join(', ');
    const getNames = t.get.map(id=>{const p=playerById(Game.ut(),id);return p?`${p.name} (${p.pos} ${p.ovr})`:'';}).filter(Boolean).join(', ');
    this.modal(`<h2>📨 Proposition d'échange</h2>
      <p><b>${teamById(t.fromId).city} ${teamById(t.fromId).name}</b> vous propose un transfert :</p>
      <div class="grid cols2" style="margin:12px 0">
        <div class="card" style="margin:0"><h3>Vous recevez</h3><div>${giveNames||'—'}</div></div>
        <div class="card" style="margin:0"><h3>Vous cédez</h3><div>${getNames||'—'}</div></div>
      </div>
      <div class="row end"><button class="btn ghost" onclick="Game.declinePendingTrade();UI.closeModal();UI.toast('Offre refusée')">Refuser</button>
        <button class="btn green" onclick="Game.acceptPendingTrade();UI.closeModal();UI.render();UI.toast('Transfert accepté')">Accepter</button></div>`);
  },

  /* -------------------------------- Playoffs ---------------------------- */
  playoffsView() {
    const s = Game.state; const p = s.playoffs;
    if (!p) return `<div class="card center"><h2>Pas de playoffs en cours</h2></div>`;
    const roundNames = ['1er tour', 'Demi-finales de conférence', 'Finales de conférence', 'Finales NBA'];
    let userPanel = '';
    const sr = Game.currentUserSeries();
    if (p.champion) {
      const won = p.champion === s.userTeam;
      userPanel = `<div class="card center"><h2>${won?'🏆 CHAMPIONS NBA !':'Playoffs terminés'}</h2>
        <p>${teamById(p.champion).city} ${teamById(p.champion).name} remporte le titre ${s.season}.</p>
        <button class="btn primary" data-act="to-offseason">Aller à l'intersaison →</button></div>`;
    } else if (sr) {
      const hi = sr.hi===s.userTeam; const me = s.userTeam; const foe = hi?sr.lo:sr.hi;
      const myW = hi?sr.hw:sr.lw, foeW = hi?sr.lw:sr.hw;
      userPanel = `<div class="card"><h2>Votre série — ${roundNames[p.round]||'Finales'}</h2>
        <div class="scoreboard">
          <div class="tm">${this.badge(me,48)}<div><b>${teamById(me).name}</b></div><div class="sc ${myW>foeW?'win':''}">${myW}</div></div>
          <div style="font-weight:800;color:var(--muted)">série</div>
          <div class="tm">${this.badge(foe,48)}<div><b>${teamById(foe).name}</b></div><div class="sc ${foeW>myW?'win':''}">${foeW}</div></div>
        </div>
        <p class="center muted">Premier à 4 victoires. Note ${teamOverall(s.teams[me])} vs ${teamOverall(s.teams[foe])}</p>
        <div class="row" style="justify-content:center">
          <button class="btn primary" data-act="po-playgame">🏀 Jouer le prochain match</button>
          <button class="btn ghost" data-act="po-simseries">⏩ Simuler la série</button>
        </div></div>`;
    } else {
      userPanel = `<div class="card center"><h2>Éliminé des playoffs</h2>
        <p class="muted">Votre parcours s'arrête là cette saison.</p>
        <button class="btn ghost" data-act="po-simall">⏩ Simuler la fin des playoffs</button></div>`;
    }

    const seriesCard = (sr) => {
      const done = sr.done;
      const hiW = sr.hw, loW = sr.lw;
      return `<div class="series">
        <div class="s-row ${done&&sr.winner===sr.hi?'won':''}"><span>${this.badge(sr.hi,20)} ${teamById(sr.hi).name}</span><b>${hiW}</b></div>
        <div class="s-row ${done&&sr.winner===sr.lo?'won':''}"><span>${this.badge(sr.lo,20)} ${teamById(sr.lo).name}</span><b>${loW}</b></div>
      </div>`;
    };
    const bracket = p.finals
      ? `<div class="card"><h2>Finales NBA</h2>${seriesCard(p.finals)}</div>`
      : `<div class="grid cols2">
          <div class="card"><h2>Conférence Est — ${roundNames[p.round]}</h2>${p.east.map(seriesCard).join('')}</div>
          <div class="card"><h2>Conférence Ouest — ${roundNames[p.round]}</h2>${p.west.map(seriesCard).join('')}</div>
        </div>`;
    return userPanel + bracket;
  },

  /* ------------------------------ Intersaison --------------------------- */
  offseasonView() {
    const s = Game.state; const ut = Game.ut();
    const step = s.offseasonStep;
    const stepper = ['1 · Prolongations', '2 · Draft', '3 · Agents libres', '4 · Nouvelle saison']
      .map((l,i)=>`<span class="chip" style="${i===step?'border-color:var(--accent);color:var(--accent)':''}">${l}</span>`).join(' ');

    let body = '';
    if (step === 0) body = this.resignStep();
    else if (step === 1) body = this.draftStep();
    else if (step === 2) body = this.freeAgencyStep();
    else body = `<div class="card center"><h2>Prêt pour la saison ${s.season+1}</h2>
      <p class="muted">Votre effectif : ${ut.roster.length} joueurs · Note ${teamOverall(ut)} OVR · Masse ${teamSalary(ut)} M$</p>
      <button class="btn primary" data-act="start-season">Lancer la saison ${s.season+1} →</button></div>`;

    return `<div class="card"><h2>🌴 Intersaison ${s.season}</h2><div class="row">${stepper}</div></div>${body}`;
  },

  resignStep() {
    const ut = Game.ut();
    const expiring = ut.roster.filter(p => (p.years||0) <= 0);
    const rows = expiring.length ? expiring.map(p => `<tr>
        <td class="name">${this.posTag(p.pos)} ${p.name} ${this.ovrTag(p.ovr)}</td>
        <td>${p.age}</td>
        <td>${contractValue(p.ovr,p.age)} M$ <small class="muted">estimé</small></td>
        <td><input class="mins" style="width:66px" type="number" step="0.5" min="${MIN_SALARY}" value="${contractValue(p.ovr,p.age)}" data-resign-sal="${p.id}"></td>
        <td><select data-resign-yr="${p.id}"><option>1</option><option selected>2</option><option>3</option><option>4</option></select></td>
        <td><button class="btn green sm" data-resign="${p.id}">Prolonger</button>
            <button class="btn red sm" data-let-go="${p.id}">Laisser partir</button></td>
      </tr>`).join('') : '<tr><td colspan="6" class="muted center">Aucun contrat expirant — tous vos joueurs sont sous contrat.</td></tr>';
    return `<div class="card"><h2>Contrats expirants</h2>
      <p class="muted" style="margin-bottom:10px">Prolongez vos joueurs clés avant qu'ils ne deviennent agents libres.</p>
      <div class="table-wrap"><table><thead><tr><th class="name">Joueur</th><th>Âge</th><th>Valeur</th><th>Salaire/an</th><th>Durée</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="row end" style="margin-top:12px"><button class="btn primary" data-act="to-draft">Passer à la Draft →</button></div>
    </div>`;
  },

  draftStep() {
    const s = Game.state; const ut = Game.ut();
    if (!s.draftClass) return '';
    const order = draftOrder(s);
    const userPickPos = order.indexOf(s.userTeam) + 1;
    const prospects = s.draftClass.slice(0, 30).map((p,i) => `<tr>
      <td>${p.draftRank}</td>
      <td class="name">${this.posTag(p.pos)} ${p.name}</td>
      <td>${p.age}</td><td>${this.ovrTag(p.ovr)}</td><td class="muted">${p.potential}</td>
      <td><button class="btn green sm" data-draft="${p.id}" ${ut.roster.length>=15?'disabled':''}>Drafter</button></td>
    </tr>`).join('');
    return `<div class="card"><h2>Draft ${s.season+1}</h2>
      <p class="muted" style="margin-bottom:8px">Votre premier tour : <b>${userPickPos}${userPickPos===1?'er':'e'} choix</b> (ordre inversé au classement). Sélectionnez un ou plusieurs prospects, puis simulez le reste.</p>
      <div class="table-wrap"><table><thead><tr><th>Rang</th><th class="name">Prospect</th><th>Âge</th><th>OVR</th><th>Pot</th><th></th></tr></thead><tbody>${prospects}</tbody></table></div>
      <div class="row end" style="margin-top:12px">
        <button class="btn ghost" data-act="sim-draft">Simuler la fin de la draft (IA)</button>
        <button class="btn primary" data-act="to-fa">Passer aux agents libres →</button>
      </div></div>`;
  },

  freeAgencyStep() {
    const s = Game.state; const ut = Game.ut();
    if (!s.freeAgents) return '';
    const rows = s.freeAgents.slice(0, 30).map(p => {
      const ask = contractValue(p.ovr, p.age);
      return `<tr>
        <td class="name">${this.posTag(p.pos)} ${p.name} ${this.ovrTag(p.ovr)}</td>
        <td>${p.age}</td><td class="muted">${p.potential}</td>
        <td>${ask} M$ <small class="muted">demandé</small></td>
        <td><input class="mins" style="width:66px" type="number" step="0.5" min="${MIN_SALARY}" value="${ask}" data-fa-sal="${p.id}"></td>
        <td><select data-fa-yr="${p.id}"><option selected>1</option><option>2</option><option>3</option></select></td>
        <td><button class="btn green sm" data-sign="${p.id}" ${ut.roster.length>=15?'disabled':''}>Signer</button></td>
      </tr>`;
    }).join('');
    return `<div class="card"><h2>Agents libres</h2>
      <p class="muted" style="margin-bottom:8px">Effectif : ${ut.roster.length}/15 · Masse ${teamSalary(ut)} M$. Renforcez votre équipe.</p>
      <div class="table-wrap"><table><thead><tr><th class="name">Joueur</th><th>Âge</th><th>Pot</th><th>Valeur</th><th>Offre/an</th><th>Durée</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="row end" style="margin-top:12px"><button class="btn primary" data-act="finish-offseason">Terminer l'intersaison →</button></div>
    </div>`;
  },

  /* ------------------------- Fiche joueur (modale) ---------------------- */
  playerModal(pid) {
    let p = null, team = null;
    for (const id in Game.state.teams) { const pp = playerById(Game.state.teams[id], pid); if (pp) { p = pp; team = id; break; } }
    if (!p) return;
    const bar = (label, v) => `<div style="margin:5px 0"><div class="row" style="justify-content:space-between;font-size:12.5px"><span>${label}</span><b>${v}</b></div>
      <div class="progress"><div style="width:${v}%"></div></div></div>`;
    const st = p.stats;
    const statLine = st.gp ? `<div class="grid cols3" style="margin-top:10px">
      <div class="kv"><span>PTS</span><span class="v">${this.fmt(this.avg(st,'pts'))}</span></div>
      <div class="kv"><span>REB</span><span class="v">${this.fmt(this.avg(st,'oreb')+this.avg(st,'dreb'))}</span></div>
      <div class="kv"><span>PAS</span><span class="v">${this.fmt(this.avg(st,'ast'))}</span></div>
      <div class="kv"><span>INT</span><span class="v">${this.fmt(this.avg(st,'stl'))}</span></div>
      <div class="kv"><span>CTR</span><span class="v">${this.fmt(this.avg(st,'blk'))}</span></div>
      <div class="kv"><span>%Tir</span><span class="v">${st.fga?this.fmt(st.fgm/st.fga*100,0):0}%</span></div>
    </div>` : '<p class="muted" style="margin-top:8px">Pas encore de statistiques cette saison.</p>';
    const hist = p.history.length ? `<h3>Historique</h3><div class="table-wrap"><table><thead><tr><th>Saison</th><th>MJ</th><th>PTS</th><th>REB</th><th>PAS</th></tr></thead><tbody>${
      p.history.slice(-6).reverse().map(h=>`<tr><td>${h.season}</td><td>${h.gp}</td><td>${this.fmt(h.pts/h.gp)}</td><td>${this.fmt((h.oreb+h.dreb)/h.gp)}</td><td>${this.fmt(h.ast/h.gp)}</td></tr>`).join('')
    }</tbody></table></div>` : '';
    this.modal(`<button class="close" onclick="UI.closeModal()">✕</button>
      <h2>${this.posTag(p.pos)} ${p.name} ${this.ovrTag(p.ovr)}</h2>
      <p class="muted">${p.age} ans · ${teamById(team).city} ${teamById(team).name} · Contrat ${p.salary} M$ (${p.years||1} an) · Potentiel ${p.potential}</p>
      <div class="grid cols2" style="margin-top:12px">
        <div>${bar('Tir extérieur', p.shooting)}${bar('Jeu intérieur', p.inside)}${bar('Création', p.playmaking)}</div>
        <div>${bar('Rebond', p.rebounding)}${bar('Défense', p.defense)}${bar('Athlétisme', p.athletic)}</div>
      </div>
      ${statLine}${hist}`);
  },

  menuModal() {
    this.modal(`<button class="close" onclick="UI.closeModal()">✕</button>
      <h2>Menu</h2>
      <div class="row" style="flex-direction:column;align-items:stretch;gap:10px">
        <button class="btn ghost" onclick="Game.save();UI.toast('Partie sauvegardée')">💾 Sauvegarder</button>
        <button class="btn ghost" onclick="Game.exportSave()">⬇️ Exporter la sauvegarde (fichier)</button>
        <button class="btn red" onclick="if(confirm('Abandonner cette partie et revenir au menu ? La sauvegarde locale est conservée.')){UI.closeModal();Game.state=null;UI.render()}">🚪 Retour au menu principal</button>
        <button class="btn red" onclick="if(confirm('Supprimer définitivement la sauvegarde locale ?')){Game.deleteSave();Game.state=null;UI.closeModal();UI.render()}">🗑️ Supprimer la sauvegarde</button>
      </div>`);
  },

  /* --------------------------- Câblage des vues ------------------------- */
  wireTab() {
    const m = this.el('main');

    // fiches joueur / libération / actions data-*
    m.querySelectorAll('[data-player]').forEach(b=>b.addEventListener('click',()=>this.playerModal(+b.dataset.player)));
    m.querySelectorAll('[data-release]').forEach(b=>b.addEventListener('click',()=>{
      if(confirm('Libérer ce joueur ?')){Game.releasePlayer(+b.dataset.release);this.render();}}));

    // actions génériques
    m.querySelectorAll('[data-act]').forEach(b=>b.addEventListener('click',()=>this.action(b.dataset.act)));

    // lineup / minutes
    m.querySelectorAll('[data-line]').forEach(sel=>sel.addEventListener('change',()=>{Game.setLineup(sel.dataset.line,+sel.value);this.render();}));
    m.querySelectorAll('[data-min]').forEach(inp=>inp.addEventListener('change',()=>{Game.setMinutes(+inp.dataset.min,+inp.value);this.render();}));

    // ligue / transferts sélecteurs
    const ls = this.el('league-sel'); if (ls) ls.addEventListener('change',()=>{this._leagueTeam=ls.value;this.render();});
    const tp = this.el('trade-partner'); if (tp) tp.addEventListener('change',()=>{this.tradePartner=tp.value;this.render();});

    // offseason: resign
    m.querySelectorAll('[data-resign]').forEach(b=>b.addEventListener('click',()=>{
      const id=+b.dataset.resign;
      const sal=+m.querySelector(`[data-resign-sal="${id}"]`).value;
      const yr=+m.querySelector(`[data-resign-yr="${id}"]`).value;
      Game.resignPlayer(id,sal,yr);this.toast('Joueur prolongé');this.render();}));
    m.querySelectorAll('[data-let-go]').forEach(b=>b.addEventListener('click',()=>{
      Game.releasePlayer(+b.dataset.letGo);this.toast('Joueur libéré');this.render();}));

    // draft
    m.querySelectorAll('[data-draft]').forEach(b=>b.addEventListener('click',()=>{Game.draftPlayer(+b.dataset.draft);this.render();}));

    // free agency
    m.querySelectorAll('[data-sign]').forEach(b=>b.addEventListener('click',()=>{
      const id=+b.dataset.sign;
      const sal=+m.querySelector(`[data-fa-sal="${id}"]`).value;
      const yr=+m.querySelector(`[data-fa-yr="${id}"]`).value;
      const r=Game.signFreeAgent(id,sal,yr);
      if(r&&r.err)this.toast(r.err);else this.toast('Joueur signé !');this.render();}));
  },

  action(act) {
    const R = () => this.render();
    switch (act) {
      case 'simday': Game.simulateDay(); Game.checkSeasonEnd(); Game.save(); R(); break;
      case 'simweek': Game.simulateToNextUserGame(); Game.checkSeasonEnd(); Game.save(); R(); break;
      case 'goplay': this.tab='play'; R(); break;
      case 'checkend': Game.checkSeasonEnd(); R(); break;
      case 'playgame': {
        const out = Game.playUserGame(); Game.checkSeasonEnd(); Game.save();
        if (out) this.showGameResult(out.game, out.res); else R();
        break;
      }
      case 'simgame': {
        const out = Game.playUserGame(); Game.checkSeasonEnd(); Game.save();
        if (out) this.toast(`${out.res.home.score>out.res.away.score===(out.game.home===Game.state.userTeam)?'Victoire':'Défaite'} ${out.game.hs}-${out.game.as}`);
        R(); break;
      }
      // playoffs
      case 'po-playgame': {
        const r = Game.playUserSeriesGame();
        if (r) { this.showGameResult({home:r.home,away:r.away}, r.res); }
        else R();
        break;
      }
      case 'po-simseries': Game.simUserSeriesToEnd(); R(); break;
      case 'po-simall': {
        // simuler tout le reste jusqu'au champion
        let guard=0;
        while(!Game.state.playoffs.champion && guard++<20){ Game.autoSimNonUserSeries(); }
        R(); break;
      }
      case 'to-offseason': this.tab='offseason'; R(); break;
      // offseason navigation
      case 'to-draft': Game.state.offseasonStep=1; Game.save(); R(); break;
      case 'sim-draft': {
        const order = draftOrder(Game.state);
        // l'IA drafte pour toutes les équipes sauf s'il reste des prospects ; on complète 1 tour
        order.forEach(id=>{ if(id!==Game.state.userTeam) Game.aiDraft(id); });
        Game.save(); this.toast('Draft simulée'); R(); break;
      }
      case 'to-fa': Game.state.offseasonStep=2; Game.save(); R(); break;
      case 'finish-offseason': Game.state.offseasonStep=3; Game.save(); R(); break;
      case 'start-season': Game.finishOffseason(); this.tab='dash'; R(); break;
      // autoline / automin
      case 'autoline': { const ut=Game.ut(); ut.lineup=autoLineup(ut.roster); autoMinutes(ut); Game.save(); R(); break; }
      case 'automin': { autoMinutes(Game.ut()); Game.save(); R(); break; }
      // trades
      case 'trade-eval': {
        const {give,get} = this.gatherTrade();
        const gv = give.reduce((s,id)=>s+tradeValue(playerById(Game.ut(),id)),0);
        const gt = get.reduce((s,id)=>s+tradeValue(playerById(Game.state.teams[this.tradePartner],id)),0);
        const el = this.el('trade-summary');
        const ok = gv >= gt*0.95;
        el.innerHTML = `<span class="muted">Valeur cédée : <b>${Math.round(gv)}</b> · Valeur reçue : <b>${Math.round(gt)}</b></span>
          <span class="pill ${ok?'win':'loss'}">${ok?'Offre probablement acceptée':'Offre insuffisante'}</span>`;
        break;
      }
      case 'trade-propose': {
        const {give,get} = this.gatherTrade();
        const r = Game.proposeUserTrade(this.tradePartner, give, get);
        if (r.ok) { this.toast('Échange conclu !'); R(); }
        else this.toast(r.err);
        break;
      }
    }
  },
};

/* ------------------------------ Démarrage -------------------------------- */
window.addEventListener('DOMContentLoaded', () => {
  UI.render();
});
