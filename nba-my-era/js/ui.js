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
    const style = `background:radial-gradient(circle at 30% 25%, ${t.c2}22, ${t.c1});border-color:${t.c2};width:${size}px;height:${size}px;font-size:${size*0.34}px`;
    // Si un vrai logo a été déposé dans assets/logos/<ID>.(png|svg), on l'affiche ; sinon écusson aux couleurs.
    const url = (typeof LOGO_AVAIL !== 'undefined') ? LOGO_AVAIL[id] : null;
    const img = url ? `<img class="logo-img" src="${url}" alt="${id}">` : '';
    return `<span class="badge" style="${style}">${img}<span class="mono">${id}</span></span>`;
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
    const era = this._era && ERAS[this._era] ? this._era : 'modern';
    this._era = era;
    setEra(era);   // aligne LEAGUE/couleurs sur l'époque choisie pour l'aperçu
    const eraBtns = Object.entries(ERAS).map(([k, v]) =>
      `<button class="btn ${k === era ? 'primary' : 'ghost'} sm" data-era="${k}">${v.name.split(' — ')[0].split(' (')[0]}</button>`).join(' ');
    const cards = ERAS[era].teams.map(id => { const t = teamById(id);
      return `<div class="team-card" data-team="${id}">
        <div class="logo" style="background:${t.c1};border-color:${t.c2}">${id}</div>
        <div class="cname">${t.name}</div>
        <div class="cmeta">${t.city}</div>
      </div>`; }).join('');
    const canResume = Game.hasSave();
    return `
      <div class="hero">
        <h1>NBA <span>My Era</span></h1>
        <p>Prenez les rênes d'une franchise NBA. Effectif, tactiques, transferts, draft, blessures,
           playoffs — saison après saison, à travers les époques de l'histoire NBA.</p>
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
          <h3>Choisissez une époque</h3>
          <div class="row" style="flex-wrap:wrap">${eraBtns}</div>
          <p class="muted" style="font-size:12.5px;margin-top:6px">${ERAS[era].name} · ${ERAS[era].rules.note || ''}</p>
          <h3>Votre nom de manager</h3>
          <input type="text" id="mgr-name" placeholder="Ex : Alex" style="width:220px;background:var(--bg3);color:var(--text);border:1px solid var(--border);border-radius:7px;padding:8px 10px">
          <h3>Choisissez votre franchise (${ERAS[era].teams.length} équipes)</h3>
          <div class="team-picker">${cards}</div>
          <div class="row end" style="margin-top:16px">
            <button class="btn primary" id="btn-start" disabled>Démarrer ma carrière →</button>
          </div>
        </div>
        <div class="footer-note">Effectifs modernes = instantané best-effort au 10/08/2026. Époques classiques = rosters de légendes curés (best-effort) + règles adaptées. Joueurs réels ; aucune licence.</div>
      </main>`;
  },

  wireHome() {
    let sel = null;
    document.querySelectorAll('[data-era]').forEach(b => b.addEventListener('click', () => {
      this._era = b.dataset.era; this.render();
    }));
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
      Game.newGame(sel, name, this._era || 'modern');
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
        <span class="badge" style="background:radial-gradient(circle at 30% 25%, ${t.c2}22, ${t.c1});border-color:${t.c2}">${(typeof LOGO_AVAIL!=='undefined'&&LOGO_AVAIL[t.id])?`<img class="logo-img" src="${LOGO_AVAIL[t.id]}" alt="${t.id}">`:''}<span class="mono">${t.id}</span></span>
        <div class="tinfo">
          <b>${t.city} ${t.name}</b>
          <small>${s.managerName} · ${CONFS[t.conf]} · ${t.div}</small>
        </div>
        <div class="spacer"></div>
        <span class="chip">Saison <b>${s.season}</b></span>
        ${s.eraId && s.eraId!=='modern' && ERAS[s.eraId] ? `<span class="chip">${ERAS[s.eraId].name.split(' — ')[0]}</span>` : ''}
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
    const tabs = [['dash', '🏠 Accueil'], ['roster', '👥 Effectif'], ['lineup', '📋 Cinq & Rotations'],
                  ['tactics', '🎯 Tactiques']];
    if (s.phase === 'regular') tabs.push(['play', '🏀 Match'], ['schedule', '🗓️ Calendrier']);
    if (s.phase === 'playoffs') tabs.push(['playoffs', '🏆 Playoffs']);
    if (s.phase === 'offseason') tabs.push(['offseason', '🌴 Intersaison']);
    tabs.push(['trades', '🔁 Transferts'], ['scouting', '🔭 Scouting'],
              ['standings', '📊 Classements'], ['league', '🌐 Ligue'],
              ['history', '📜 Histoire'], ['news', '📰 Actus']);
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
      tactics: () => this.tacticsView(), scouting: () => this.scoutingView(),
      play: () => this.playView(), schedule: () => this.scheduleView(), standings: () => this.standingsView(),
      league: () => this.leagueView(), news: () => this.newsView(), trades: () => this.tradesView(),
      playoffs: () => this.playoffsView(), offseason: () => this.offseasonView(),
      history: () => this.historyView(),
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
      <div class="grid cols2">
        <div class="card"><h2>🏥 Infirmerie</h2>${(() => {
          const inj = ut.roster.filter(p => p.injuryGames > 0).sort((a, b) => b.injuryGames - a.injuryGames);
          return inj.length ? `<div class="table-wrap"><table><thead><tr><th class="name">Joueur</th><th>Blessure</th><th>Absence</th></tr></thead><tbody>${
            inj.map(p => `<tr><td class="name">${this.posTag(p.pos)} ${p.name} ${this.ovrTag(p.ovr)}</td><td class="muted">${p._injuryDesc || '—'}</td><td style="color:var(--red)">~${p.injuryGames} matchs</td></tr>`).join('')
          }</tbody></table></div>` : '<div class="muted">Aucun joueur blessé. 💪</div>';
        })()}</div>
        <div class="card"><h2>Actualités</h2>${news}</div>
      </div>`;
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
        <td class="name">${inLine?'⭐ ':''}${p.name}${p.injuryGames>0?` <span title="${p._injuryDesc||''}" style="color:var(--red)">🏥${p.injuryGames}</span>`:''}</td>
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
      `<div class="kv"><span>${this.posTag(p.pos)} ${p.name} ${this.ovrTag(p.ovr)}${p.injuryGames>0?` <span style="color:var(--red)" title="${p._injuryDesc||''}">🏥${p.injuryGames}</span>`:''}</span>
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

  /* ------------------------------ Tactiques ----------------------------- */
  tacticsView(embedLive) {
    const ut = Game.ut();
    const offCards = Object.entries(OFF_SCHEMES).map(([k, v]) =>
      `<label class="scheme ${ut.offScheme === k ? 'sel' : ''}">
        <input type="radio" name="off" value="${k}" ${ut.offScheme === k ? 'checked' : ''} data-off="${k}" style="display:none">
        <b>${v.name}</b><span class="muted">${v.desc}</span></label>`).join('');
    const defCards = Object.entries(DEF_SCHEMES).map(([k, v]) =>
      `<label class="scheme ${ut.defScheme === k ? 'sel' : ''}">
        <input type="radio" name="def" value="${k}" ${ut.defScheme === k ? 'checked' : ''} data-def="${k}" style="display:none">
        <b>${v.name}</b><span class="muted">${v.desc}</span></label>`).join('');

    // Hiérarchie offensive
    const prio = (ut.priorities || []).map(id => playerById(ut, id)).filter(Boolean);
    const inPrio = new Set(prio.map(p => p.id));
    const rest = [...ut.roster].filter(p => !inPrio.has(p.id)).sort((a, b) => b.ovr - a.ovr);
    const prioRows = prio.map((p, i) => `<div class="kv">
      <span><b style="color:var(--accent)">${i + 1}.</b> ${this.posTag(p.pos)} ${p.name} ${this.ovrTag(p.ovr)}
        <small class="muted">${i === 0 ? 'Option n°1' : i === 1 ? '2e option' : i === 2 ? '3e option' : 'rôle'}</small></span>
      <span class="row" style="gap:4px">
        <button class="btn ghost sm" data-prio-up="${p.id}" ${i === 0 ? 'disabled' : ''}>▲</button>
        <button class="btn ghost sm" data-prio-down="${p.id}" ${i === prio.length - 1 ? 'disabled' : ''}>▼</button>
        <button class="btn red sm" data-prio-rm="${p.id}">✕</button></span></div>`).join('')
      || '<div class="muted">Aucune priorité définie.</div>';
    const addOpts = rest.map(p => `<option value="${p.id}">${p.name} (${p.pos} · ${p.ovr})</option>`).join('');

    return `${embedLive ? '' : ''}
      <div class="grid cols2">
        <div class="card"><h2>🏀 Système offensif</h2>
          <div class="scheme-grid">${offCards}</div>
        </div>
        <div class="card"><h2>🛡️ Système défensif</h2>
          <div class="scheme-grid">${defCards}</div>
        </div>
      </div>
      <div class="card"><h2>🎯 Options prioritaires en attaque</h2>
        <p class="muted" style="margin-bottom:8px">L'ordre définit qui prend le plus de tirs (option n°1, n°2…). Le schéma « Iso — stars » amplifie encore les 2 premières options.</p>
        ${prioRows}
        <div class="row" style="margin-top:12px">
          <select id="prio-add"><option value="">+ Ajouter un joueur…</option>${addOpts}</select>
          <button class="btn ghost sm" data-act="prio-add">Ajouter</button>
          <button class="btn ghost sm" data-act="prio-reset">⚙️ Hiérarchie auto</button>
        </div>
      </div>`;
  },

  /* ------------------------------- Scouting ----------------------------- */
  scoutingView() {
    const s = Game.state;
    const years = Game.scoutingClasses();
    if (!years.length) return `<div class="card center"><h2>Scouting indisponible</h2></div>`;
    const y = years.includes(this._scoutYear) ? this._scoutYear : years[0];
    this._scoutYear = y;
    const cls = s.scouting.classes[y];
    const tabs = years.map(yy => `<button class="btn ${yy === y ? 'primary' : 'ghost'} sm" data-scout-year="${yy}">Draft ${yy}</button>`).join(' ');
    const rows = cls.slice(0, 40).map(p => {
      const d = prospectDisplay(p);
      const stars = '★'.repeat(p.scout || 0) + '☆'.repeat(3 - (p.scout || 0));
      return `<tr>
        <td>${p.projRank}</td>
        <td class="name">${this.posTag(p.pos)} ${p.name}${p.real ? ' <small class="muted">(réel)</small>' : ''}</td>
        <td>${p.age}</td>
        <td class="muted">${d.tier}</td>
        <td>${d.exact ? this.ovrTag(p.ovr) : d.ovr}</td>
        <td class="muted">${d.pot}</td>
        <td title="Niveau de scouting">${stars}</td>
        <td><button class="btn ghost sm" data-scout="${p.id}" ${((p.scout || 0) >= 3 || s.scouting.points <= 0) ? 'disabled' : ''}>Scouter</button></td>
      </tr>`;
    }).join('');
    return `<div class="card">
        <div class="row" style="justify-content:space-between">
          <h2>🔭 Scouting de la draft</h2>
          <span class="chip">Points de scouting : <b>${s.scouting.points}</b></span>
        </div>
        <div class="row" style="margin:8px 0">${tabs}</div>
        <p class="muted" style="font-size:12.5px;margin-bottom:8px">Scoutez pour affiner l'évaluation (fourchette de note → note exacte à 3★). Points limités par saison. Les cuvées futures sont des <b>projections</b> (sauf têtes d'affiche réelles). La cuvée de l'an prochain sera votre draft.</p>
        <div class="table-wrap"><table>
          <thead><tr><th>Proj.</th><th class="name">Prospect</th><th>Âge</th><th>Profil</th><th>OVR est.</th><th>Pot.</th><th>Scout</th><th></th></tr></thead>
          <tbody>${rows}</tbody></table></div>
      </div>`;
  },

  /* -------------------------------- Match ------------------------------- */
  playView() {
    if (Game.state.liveGame) return this.liveGameView();
    return this.pregameView();
  },

  pregameView() {
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
      <p class="center muted" style="font-size:12.5px">Tactiques : ⚔️ ${OFF_SCHEMES[ut.offScheme].name} · 🛡️ ${DEF_SCHEMES[ut.defScheme].name} <small>(modifiables dans l'onglet Tactiques ou en direct)</small></p>
      <div class="row" style="justify-content:center;margin-top:8px">
        <button class="btn primary" data-act="startlive">🏀 Jouer (quart par quart)</button>
        <button class="btn ghost" data-act="simgame">⏩ Simuler rapidement</button>
      </div>
    </div>
    <div class="card"><h2>Résultats récents</h2>${this.recentResults()}</div>`;
  },

  // Vue du match en cours : score, changement de schéma en direct, quart par quart
  liveGameView() {
    const s = Game.state; const lg = s.liveGame; const ut = Game.ut();
    const homeId = lg.gameRef.home, awayId = lg.gameRef.away;
    const meHome = homeId === s.userTeam;
    const myId = s.userTeam, oppId = meHome ? awayId : homeId;
    const myScore = meHome ? lg.home.score : lg.away.score;
    const oppScore = meHome ? lg.away.score : lg.home.score;
    const qLabel = lg.done ? 'Terminé' : (lg.q >= 4 ? 'Prolongation' : `${lg.q}ᵉ quart-temps joué`);
    const qRows = lg.quarters.map(q => {
      const mine = meHome ? q.hs : q.as, opp = meHome ? q.as : q.hs;
      return `<tr><td>Q${q.q}</td><td>${mine}</td><td>${opp}</td></tr>`;
    }).join('');
    const schemeSel = (obj, cur, attr, label) => `<div style="flex:1;min-width:180px">
      <div class="muted" style="font-size:12px;margin-bottom:4px">${label}</div>
      <select data-${attr}-live style="width:100%">${Object.entries(obj).map(([k, v]) =>
        `<option value="${k}" ${cur === k ? 'selected' : ''}>${v.name}</option>`).join('')}</select></div>`;

    const boxMini = lg.done ? '' : `<div class="card"><h3>Ajustements en direct</h3>
      <div class="row">${schemeSel(OFF_SCHEMES, ut.offScheme, 'off', '⚔️ Attaque')}${schemeSel(DEF_SCHEMES, ut.defScheme, 'def', '🛡️ Défense')}</div>
      <p class="muted" style="font-size:12px;margin-top:6px">Changez de système avant de lancer le quart-temps suivant.</p></div>`;

    return `<div class="card">
        <div class="row" style="justify-content:space-between"><h2>Match en direct</h2><span class="chip">${qLabel}${lg.ot?` · ${lg.ot} prol.`:''}</span></div>
        <div class="scoreboard">
          <div class="tm">${this.badge(myId,54)}<div><b>${teamById(myId).name}</b></div><div class="sc ${myScore>=oppScore?'win':''}">${myScore}</div></div>
          <div style="font-weight:800;color:var(--muted)">—</div>
          <div class="tm">${this.badge(oppId,54)}<div><b>${teamById(oppId).name}</b></div><div class="sc ${oppScore>myScore?'win':''}">${oppScore}</div></div>
        </div>
        <div class="row" style="justify-content:center;margin-top:6px">
          ${lg.done
            ? `<button class="btn primary" data-act="finish-live">📋 Feuille de match & résultat</button>`
            : `<button class="btn primary" data-act="sim-quarter">▶ Jouer le quart-temps suivant</button>
               <button class="btn ghost" data-act="finish-live">⏩ Terminer le match</button>`}
        </div>
      </div>
      ${boxMini}
      ${lg.quarters.length ? `<div class="card"><h3>Score par quart-temps</h3>
        <div class="table-wrap"><table><thead><tr><th></th><th>${teamById(myId).id}</th><th>${teamById(oppId).id}</th></tr></thead><tbody>${
          lg.quarters.map(q => { const mine = meHome ? q.hs : q.as, opp = meHome ? q.as : q.hs;
            return `<tr><td>Q${q.q}</td><td><b>${mine}</b></td><td>${opp}</td></tr>`; }).join('')
        }</tbody></table></div></div>` : ''}`;
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
    if (s.confMode === 'single') {
      const st = standings(s);
      return `<div class="card"><h2>Classement — ${ERAS[s.eraId] ? ERAS[s.eraId].name : 'Ligue'}</h2>
        <div class="table-wrap"><table><thead><tr><th>#</th><th class="name">Équipe</th><th>V</th><th>D</th><th>%</th><th>Diff</th><th>Série</th></tr></thead><tbody>${
          st.map((x,i)=>`<tr style="${x.team.id===s.userTeam?'background:rgba(240,165,0,.08)':''}">
            <td>${i+1}</td>
            <td class="name">${this.badge(x.team.id,22)} ${x.team.city} ${x.team.name}${i===7?' <span class="muted">— barrage</span>':''}</td>
            <td><b>${x.w}</b></td><td>${x.l}</td><td>${this.fmt(x.pct*100,0)}</td>
            <td>${x.diff>=0?'+':''}${x.diff}</td>
            <td>${x.streak>0?`<span style="color:var(--green)">${x.streak}V</span>`:x.streak<0?`<span style="color:var(--red)">${-x.streak}D</span>`:'—'}</td></tr>`).join('')
        }</tbody></table></div>
        <p class="muted" style="font-size:12px;margin-top:6px">Les 8 premiers sont qualifiés pour les playoffs (tableau unique).</p></div>`;
    }
    return `<div class="grid cols2">${tbl('EAST')}${tbl('WEST')}</div>`;
  },

  /* ------------------------------ Historique ---------------------------- */
  historyView() {
    const sub = this._histSub || 'seasons';
    this._histSub = sub;
    const nav = [['seasons', '📅 Saisons'], ['franchises', '🏙️ Franchises'], ['legends', '👑 Légendes'],
                 ['records', '📈 Records'], ['exhibition', '⚔️ Finales All-Time']]
      .map(([k, l]) => `<button class="btn ${k === sub ? 'primary' : 'ghost'} sm" data-hist="${k}">${l}</button>`).join(' ');
    const body = { seasons: () => this.histSeasons(), franchises: () => this.histFranchises(),
      legends: () => this.histLegends(), records: () => this.histRecords(), exhibition: () => this.histExhibition() }[sub]();
    return `<div class="card"><div class="row" style="flex-wrap:wrap">${nav}</div></div>${body}`;
  },

  histSeasons() {
    const s = Game.state;
    const trophies = s.trophies.length ? s.trophies.map(y => `🏆 ${y}`).join(' · ') : 'Aucun titre pour l\'instant.';
    const rows = (s.history || []).map(h => {
      const ch = teamById(h.champion);
      const pill = h.userResult === 'Champion' ? 'win' : h.userResult === 'Non qualifié' ? 'loss' : '';
      const mvp = h.awards && h.awards.mvp ? h.awards.mvp.name : '—';
      return `<tr>
        <td>${h.season}</td>
        <td class="name">${this.badge(h.champion,20)} ${ch.city} ${ch.name}</td>
        <td class="name">${h.runnerUp ? teamById(h.runnerUp).name : '—'}</td>
        <td>${h.userW}-${h.userL}</td>
        <td><span class="pill ${pill}">${h.userResult}</span></td>
        <td class="name">${mvp}</td>
      </tr>`;
    }).join('') || '<tr><td colspan="6" class="muted center">Aucune saison terminée. L\'histoire s\'écrit sur le terrain.</td></tr>';

    // Détail des récompenses de la dernière saison terminée
    let awardsCard = '';
    const last = (s.history || [])[0];
    if (last && last.awards) {
      const a = last.awards;
      const item = (label, x) => x ? `<div class="kv"><span>${label}</span><span class="v">${x.name} <small class="muted">${x.line || ''}</small></span></div>` : '';
      const allNBA = (a.allNBA || []).map(x => `${this.posTag(x.pos)} ${x.name}`).join(' · ') || '—';
      const allStars = (a.allStars || []).map(x => x.name).join(' · ') || '—';
      awardsCard = `<div class="card"><h2>🏅 Récompenses ${last.season}</h2>
        <div class="grid cols2">
          <div>${item('🏆 MVP', a.mvp)}${item('🛡️ Défenseur de l\'année', a.dpoy)}${item('🔥 6e homme', a.sixth)}</div>
          <div>${item('📈 Progression (MIP)', a.mip)}${item('🌟 Rookie de l\'année', a.roy)}</div>
        </div>
        <h3>All-NBA (1ère équipe)</h3><div class="muted" style="font-size:13px">${allNBA}</div>
        <h3>All-Stars</h3><div class="muted" style="font-size:13px">${allStars}</div>
      </div>`;
    }

    return `<div class="card"><h2>🏆 Palmarès du club</h2><p>${trophies}</p></div>
      ${awardsCard}
      <div class="card"><h2>📜 Histoire de la ligue</h2>
        <div class="table-wrap"><table><thead><tr><th>Saison</th><th class="name">Champion</th><th class="name">Finaliste</th><th>Votre bilan</th><th>Parcours</th><th class="name">MVP</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
  },

  /* ---------------------- Historique des franchises --------------------- */
  histFranchises() {
    const s = Game.state;
    const ids = Object.keys(s.franchiseStats);
    if (!ids.length) return `<div class="card center"><h2>Aucune histoire de franchise</h2><p class="muted">Terminez au moins une saison pour bâtir le livre des records.</p></div>`;
    const rows = ids.map(id => ({ id, ...s.franchiseStats[id] }))
      .sort((a, b) => b.titles - a.titles || (b.w) - (a.w))
      .map(f => `<tr>
        <td class="name">${this.badge(f.id,20)} ${teamById(f.id).city} ${teamById(f.id).name}</td>
        <td><b>${f.titles}</b> 🏆</td><td>${f.finals}</td>
        <td>${f.w}-${f.l}</td><td>${(f.w+f.l)?this.fmt(f.w/(f.w+f.l)*100,0):0}%</td>
        <td>${f.bestW ? `${f.bestW} V (${f.bestYear})` : '—'}</td><td>${f.mvps}</td>
      </tr>`).join('');
    return `<div class="card"><h2>🏙️ Livre des records des franchises</h2>
      <div class="table-wrap"><table><thead><tr><th class="name">Franchise</th><th>Titres</th><th>Finales</th><th>Bilan all-time</th><th>%</th><th>Meilleure saison</th><th>MVP</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
  },

  /* ---------------------- Légendes / Hall of Fame ----------------------- */
  histLegends() {
    const s = Game.state;
    const legs = s.legends || [];
    if (!legs.length) return `<div class="card center"><h2>👑 Aucune légende (encore)</h2><p class="muted">Les grands joueurs rejoindront ce panthéon à leur retraite.</p></div>`;
    const row = (l, i) => `<tr>
      <td class="name">${this.posTag(l.pos)} ${l.name} ${l.hof ? '<span title="Hall of Fame">🏆</span>' : ''}</td>
      <td>${l.totals.seasons} saisons</td>
      <td>${this.fmt(l.totals.ppg)} pts · ${this.fmt(l.totals.rpg)} reb · ${this.fmt(l.totals.apg)} pas</td>
      <td class="muted">${(l.awards||[]).filter(a=>a.label==='MVP').length} MVP · pic ${l.peakOvr}</td>
      <td><button class="btn ghost sm" data-legend="${i}">Carrière</button></td>
    </tr>`;
    const hof = legs.filter(l => l.hof), others = legs.filter(l => !l.hof);
    return `<div class="card"><h2>🏆 Hall of Fame (${hof.length})</h2>
        ${hof.length ? `<div class="table-wrap"><table><thead><tr><th class="name">Joueur</th><th>Carrière</th><th>Moyennes</th><th>Distinctions</th><th></th></tr></thead><tbody>${hof.map(row).join('')}</tbody></table></div>` : '<div class="muted">Aucun intronisé pour l\'instant.</div>'}
      </div>
      <div class="card"><h2>👴 Autres retraités (${others.length})</h2>
        ${others.length ? `<div class="table-wrap"><table><tbody>${others.slice(0,40).map(row).join('')}</tbody></table></div>` : '<div class="muted">—</div>'}
      </div>`;
  },

  /* --------------------------- Records de la ligue ---------------------- */
  histRecords() {
    const s = Game.state;
    // Meneurs de carrière (joueurs actifs + légendes), d'après les saisons archivées
    const people = [];
    Object.values(s.teams).forEach(t => t.roster.forEach(p => {
      const T = careerTotals(p.history); if (T.gp > 0) people.push({ name: p.name, T, active: true, id: p.id });
    }));
    (s.legends || []).forEach(l => people.push({ name: l.name, T: l.totals, active: false }));
    const topBy = (key, label, unit) => {
      const list = [...people].sort((a, b) => b.T[key] - a.T[key]).slice(0, 10);
      return `<div class="card"><h3>${label}</h3><div class="table-wrap"><table><tbody>${
        list.map((x, i) => `<tr><td>${i+1}</td><td class="name">${x.name}${x.active?'':' <small class="muted">(retraité)</small>'}</td><td><b>${Math.round(x.T[key])}</b> ${unit}</td></tr>`).join('') || '<tr><td class="muted">—</td></tr>'
      }</tbody></table></div></div>`;
    };
    // Meilleures saisons individuelles (marqueurs) depuis l'historique
    const seasonLeaders = (s.history || []).filter(h => h.leader).map(h => ({ ...h.leader, season: h.season }))
      .sort((a, b) => b.ppg - a.ppg).slice(0, 8);
    const slHtml = seasonLeaders.map((x, i) => `<tr><td>${i+1}</td><td class="name">${x.name} <small class="muted">${x.season}</small></td><td><b>${x.ppg}</b> pts/m</td></tr>`).join('') || '<tr><td class="muted">—</td></tr>';
    // Titres par franchise
    const titles = Object.keys(s.franchiseStats).map(id => ({ id, ...s.franchiseStats[id] }))
      .filter(f => f.titles > 0).sort((a, b) => b.titles - a.titles).slice(0, 8);
    const tHtml = titles.map((f, i) => `<tr><td>${i+1}</td><td class="name">${this.badge(f.id,18)} ${teamById(f.id).name}</td><td><b>${f.titles}</b> 🏆</td></tr>`).join('') || '<tr><td class="muted">Aucun champion enregistré.</td></tr>';

    return `<div class="grid cols3">
        ${topBy('pts', '🏀 Points en carrière', 'pts')}
        ${topBy('reb', '💪 Rebonds en carrière', 'reb')}
        ${topBy('ast', '🎯 Passes en carrière', 'pas')}
      </div>
      <div class="grid cols2">
        <div class="card"><h3>🔥 Meilleures saisons (points/match)</h3><div class="table-wrap"><table><tbody>${slHtml}</tbody></table></div></div>
        <div class="card"><h3>🏆 Titres par franchise</h3><div class="table-wrap"><table><tbody>${tHtml}</tbody></table></div></div>
      </div>`;
  },

  /* --------------------------- Finales All-Time ------------------------- */
  eraTeamName(eraId, id) {
    const ov = (typeof ERA_TEAM_META !== 'undefined' && ERA_TEAM_META[eraId] && ERA_TEAM_META[eraId][id]) || {};
    const base = TEAMS.find(t => t.id === id) || { city: id, name: id };
    return `${ov.city || base.city} ${ov.name || base.name}`;
  },
  eraTeamsList(eraId) { return (ERAS[eraId] ? ERAS[eraId].teams : []); },
  histExhibition() {
    const eas = this._exEraA || 'modern', ebs = this._exEraB || 'e1996';
    this._exEraA = eas; this._exEraB = ebs;
    const teamsA = this.eraTeamsList(eas), teamsB = this.eraTeamsList(ebs);
    const ta = (this._exTeamA && teamsA.includes(this._exTeamA)) ? this._exTeamA : teamsA[0];
    const tb = (this._exTeamB && teamsB.includes(this._exTeamB)) ? this._exTeamB : teamsB[0];
    this._exTeamA = ta; this._exTeamB = tb;
    const eraOpts = sel => Object.entries(ERAS).map(([k, v]) => `<option value="${k}" ${k === sel ? 'selected' : ''}>${v.name.split(' (')[0]}</option>`).join('');
    const teamOpts = (era, sel) => this.eraTeamsList(era).map(id => `<option value="${id}" ${id === sel ? 'selected' : ''}>${this.eraTeamName(era, id)}</option>`).join('');
    const side = (label, eraSelId, teamSelId, era, team) => `<div class="card" style="margin:0"><h3>${label}</h3>
      <div class="row" style="flex-direction:column;align-items:stretch;gap:6px">
        <select id="${eraSelId}">${eraOpts(era)}</select>
        <select id="${teamSelId}">${teamOpts(era, team)}</select>
      </div></div>`;

    let result = '';
    const r = this._exResult;
    if (r && r.res) {
      const win = r.res.winner, winName = this.eraTeamName(win === r.A.id ? r.eraA : r.eraB, win);
      const gline = r.res.games.map((g, i) => `M${i+1}: ${g.a}-${g.b}`).join(' · ');
      result = `<div class="card"><h2>🏆 ${winName} remporte la série ${Math.max(r.res.aw,r.res.bw)}-${Math.min(r.res.aw,r.res.bw)}</h2>
        <div class="scoreboard">
          <div class="tm">${this.badge(r.A.id,48)}<div><b>${this.eraTeamName(r.eraA,r.A.id)}</b></div><div class="sc ${r.res.aw>r.res.bw?'win':''}">${r.res.aw}</div></div>
          <div style="font-weight:800;color:var(--muted)">série</div>
          <div class="tm">${this.badge(r.B.id,48)}<div><b>${this.eraTeamName(r.eraB,r.B.id)}</b></div><div class="sc ${r.res.bw>r.res.aw?'win':''}">${r.res.bw}</div></div>
        </div>
        <p class="center muted">${gline}</p>
        ${r.res.mvp ? `<p class="center">🏅 MVP des finales : <b>${r.res.mvp.name}</b> (${r.res.mvp.pts} pts sur la série)</p>` : ''}
      </div>`;
    }

    return `<div class="card"><h2>⚔️ Finales All-Time</h2>
        <p class="muted" style="margin-bottom:10px">Confrontez deux équipes de n'importe quelle époque au meilleur des 7 (terrain neutre, hors partie en cours).</p>
        <div class="grid cols2">${side('Équipe A', 'ex-eraA', 'ex-teamA', eas, ta)}${side('Équipe B', 'ex-eraB', 'ex-teamB', ebs, tb)}</div>
        <div class="row" style="justify-content:center;margin-top:12px"><button class="btn primary" data-act="run-exhib">🏀 Simuler la série (Bo7)</button></div>
      </div>${result}`;
  },

  legendModal(i) {
    const l = (Game.state.legends || [])[i]; if (!l) return;
    this.modal(`<button class="close" onclick="UI.closeModal()">✕</button>
      <h2>${this.posTag(l.pos)} ${l.name} ${l.hof ? '🏆' : ''}</h2>
      <p class="muted">Retraité en ${l.retiredSeason} (${l.retiredAge} ans) · pic de note ${l.peakOvr} · ${l.teamsPlayed.map(t=>teamById(t).id).join(', ')}</p>
      ${this.careerSection(l.history, l.awards)}`);
  },

  // Section carrière réutilisable (saisons + totaux + distinctions)
  careerSection(history, awards) {
    const T = careerTotals(history);
    const rows = (history || []).slice().reverse().map(h => `<tr>
      <td>${h.season}</td><td>${h.team ? teamById(h.team).id : '—'}</td><td>${h.gp}</td>
      <td>${this.fmt(h.pts/h.gp)}</td><td>${this.fmt((h.oreb+h.dreb)/h.gp)}</td><td>${this.fmt(h.ast/h.gp)}</td>
      <td>${h.fga?this.fmt(h.fgm/h.fga*100,0):0}%</td></tr>`).join('') || '<tr><td colspan="7" class="muted center">Aucune saison archivée.</td></tr>';
    const awHtml = (awards && awards.length) ? `<p style="font-size:13px">🏅 ${awards.map(a => `${a.label} ${a.season}`).join(' · ')}</p>` : '';
    return `${awHtml}
      <h3>Carrière (${T.seasons} saisons)</h3>
      <div class="table-wrap"><table><thead><tr><th>Saison</th><th>Éq.</th><th>MJ</th><th>PTS</th><th>REB</th><th>PAS</th><th>%Tir</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr style="border-top:2px solid var(--border)"><td colspan="2"><b>Totaux</b></td><td><b>${T.gp}</b></td>
          <td><b>${this.fmt(T.ppg)}</b></td><td><b>${this.fmt(T.rpg)}</b></td><td><b>${this.fmt(T.apg)}</b></td><td>—</td></tr></tfoot>
      </table></div>`;
  },

  /* --------------------------------- Ligue ------------------------------ */
  leagueView() {
    const s = Game.state;
    const league = LEAGUE;
    const sel = (this._leagueTeam && s.teams[this._leagueTeam]) ? this._leagueTeam : league.find(t=>t.id!==s.userTeam).id;
    this._leagueTeam = sel;
    const opts = league.map(t=>`<option value="${t.id}" ${t.id===sel?'selected':''}>${t.city} ${t.name} (${s.teams[t.id].w}-${s.teams[t.id].l})</option>`).join('');
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
  pickLabel(pk) { return `Pick ${pk.year} T${pk.round}${pk.from !== undefined ? ' (' + pk.from + ')' : ''}`; },

  tradesView() {
    const s = Game.state; const ut = Game.ut();
    if (s.phase === 'playoffs') return `<div class="card center"><h2>Marché fermé</h2><p class="muted">Les transferts sont indisponibles pendant les playoffs.</p></div>`;
    const partner = (this.tradePartner && this.tradePartner !== s.userTeam && s.teams[this.tradePartner]) ? this.tradePartner : LEAGUE.find(t => t.id !== s.userTeam).id;
    this.tradePartner = partner;
    const ot = s.teams[partner];
    const opts = LEAGUE.filter(t => t.id !== s.userTeam).map(t => `<option value="${t.id}" ${t.id === partner ? 'selected' : ''}>${t.city} ${t.name} (note ${teamOverall(s.teams[t.id])})</option>`).join('');

    const col = (team, side) => {
      const players = [...team.roster].sort((a, b) => b.ovr - a.ovr).map(p => `<tr>
        <td><input type="checkbox" class="trade-cb" data-side="${side}" data-kind="player" value="${p.id}"></td>
        <td class="name">${this.posTag(p.pos)} ${p.name}</td><td>${this.ovrTag(p.ovr)}</td>
        <td>${p.age}</td><td>${p.salary} M$</td></tr>`).join('');
      const picks = (team.picks || []).slice().sort((a, b) => a.year - b.year).map(pk => `<tr>
        <td><input type="checkbox" class="trade-cb" data-side="${side}" data-kind="pick" data-year="${pk.year}" data-round="${pk.round}" data-from="${pk.from}"></td>
        <td class="name" colspan="4">🎟️ ${this.pickLabel(pk)} <small class="muted">1er tour</small></td></tr>`).join('');
      return `<div class="table-wrap"><table><thead><tr><th></th><th class="name">Actif</th><th>OVR</th><th>Âge</th><th>Salaire</th></tr></thead>
        <tbody>${players}${picks}</tbody></table></div>`;
    };
    return `<div class="card"><div class="row" style="justify-content:space-between">
        <h2>Bureau des transferts</h2>
        <div class="row"><span class="muted">Négocier avec :</span><select id="trade-partner">${opts}</select></div></div>
      <div class="grid cols2" style="margin-top:12px">
        <div><h3>Vous cédez — ${teamById(s.userTeam).name} <small class="muted">(note ${teamOverall(ut)})</small></h3>${col(ut, 'give')}</div>
        <div><h3>Vous recevez — ${teamById(partner).name} <small class="muted">(note ${teamOverall(ot)})</small></h3>${col(ot, 'get')}</div>
      </div>
      <div id="trade-summary" class="card" style="margin-top:8px"><span class="muted">Sélectionnez des actifs puis « Évaluer ».</span></div>
      <div class="row end" style="margin-top:6px">
        <button class="btn ghost" data-act="trade-eval">Évaluer l'offre</button>
        <button class="btn primary" data-act="trade-propose">Proposer l'échange</button>
      </div>
      <p class="muted" style="font-size:12px;margin-top:8px">Règles : équilibre salarial (l'entrant ≤ 125 % du sortant + 7,5 M$), effectifs entre 8 et 15 joueurs. L'IA valorise jeunesse, potentiel, besoins de poste et picks.</p>
    </div>`;
  },

  gatherTrade() {
    const parse = side => [...document.querySelectorAll(`input.trade-cb[data-side=${side}]:checked`)].map(x => {
      if (x.dataset.kind === 'pick') return { kind: 'pick', year: +x.dataset.year, round: +x.dataset.round, from: x.dataset.from };
      return { kind: 'player', id: +x.value };
    });
    return { userGives: parse('give'), userGets: parse('get') };
  },

  assetName(teamId, a) {
    if (a.kind === 'pick') return `🎟️ ${this.pickLabel(a)}`;
    const p = playerById(Game.state.teams[teamId], a.id);
    return p ? `${p.name} (${p.pos} ${p.ovr})` : '—';
  },

  showPendingTrade() {
    const s = Game.state; const t = s.pendingTrade;
    const recv = t.userGets.map(a => this.assetName(t.partner, a)).join(', ') || '—';
    const give = t.userGives.map(a => this.assetName(s.userTeam, a)).join(', ') || '—';
    this.modal(`<h2>📨 Proposition d'échange</h2>
      <p><b>${teamById(t.partner).city} ${teamById(t.partner).name}</b> vous propose :</p>
      <div class="grid cols2" style="margin:12px 0">
        <div class="card" style="margin:0"><h3>Vous recevez</h3><div>${recv}</div></div>
        <div class="card" style="margin:0"><h3>Vous cédez</h3><div>${give}</div></div>
      </div>
      <div class="row end"><button class="btn ghost" onclick="Game.declinePendingTrade();UI.closeModal();UI.toast('Offre refusée')">Refuser</button>
        <button class="btn green" onclick="Game.acceptPendingTrade();UI.closeModal();UI.render();UI.toast('Transfert accepté !')">Accepter</button></div>`);
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
    if (!s.draftClass || !s.draft) return '';
    const d = s.draft;
    const slot = d.board[d.onClock];
    const onClockUser = slot && slot.teamId === s.userTeam && !d.done;
    const myPicks = d.board.filter(sl => sl.teamId === s.userTeam);
    const myLeft = myPicks.filter(sl => !sl.pickId).length;

    // Bandeau "à qui le tour"
    let header;
    if (d.done) header = `<div class="pill win">Draft terminée</div>`;
    else if (onClockUser) header = `<div class="pill" style="background:rgba(240,165,0,.18);color:var(--accent)">🎯 À VOUS — choix n°${d.onClock + 1} (tour ${slot.round})</div>`;
    else header = `<div class="row" style="align-items:center;gap:8px">${this.badge(slot.teamId, 22)} <b>${teamById(slot.teamId).city} ${teamById(slot.teamId).name}</b> sur la sellette — choix n°${d.onClock + 1} (tour ${slot.round})</div>`;

    // Derniers choix effectués
    const recent = d.board.filter(sl => sl.pickId).slice(-6).reverse().map(sl =>
      `<div class="kv"><span>#${d.board.indexOf(sl) + 1} ${this.badge(sl.teamId, 20)} ${teamById(sl.teamId).id}</span>
        <span>${this.posTag(sl.pickPos)} ${sl.pickName} <span class="muted">(${sl.pickOvr})</span></span></div>`).join('') || '<div class="muted">—</div>';

    const prospects = s.draftClass.slice(0, 24).map(p => `<tr>
      <td>${p.projRank}</td>
      <td class="name">${this.posTag(p.pos)} ${p.name}${p.real ? ' <small class="muted">(réel)</small>' : ''}</td>
      <td>${p.age}</td><td>${this.ovrTag(p.ovr)}</td><td class="muted">${p.potential}</td>
      <td><button class="btn ghost sm" data-player="${p.id}">Fiche</button>
          <button class="btn green sm" data-draft="${p.id}" ${(!onClockUser || ut.roster.length >= 15) ? 'disabled' : ''}>Drafter</button></td>
    </tr>`).join('');

    return `<div class="card"><div class="row" style="justify-content:space-between">
        <h2>Draft ${s.season + 1}</h2>
        <span class="chip">Vos choix restants : <b>${myLeft}</b></span></div>
      <div style="margin:6px 0 10px">${header}</div>
      <div class="grid cols2">
        <div>
          <h3>${onClockUser ? 'Sélectionnez un prospect' : 'Meilleurs prospects disponibles'}</h3>
          <div class="table-wrap"><table><thead><tr><th>Proj.</th><th class="name">Prospect</th><th>Âge</th><th>OVR</th><th>Pot</th><th></th></tr></thead><tbody>${prospects}</tbody></table></div>
        </div>
        <div><h3>Choix récents</h3>${recent}</div>
      </div>
      <div class="row end" style="margin-top:12px">
        ${!d.done && !onClockUser ? `<button class="btn ghost" data-act="advance-draft">⏭ Avancer jusqu'à mon choix</button>` : ''}
        ${!d.done ? `<button class="btn ghost" data-act="sim-draft">⏩ Simuler toute la draft</button>` : ''}
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
    this.modal(`<button class="close" onclick="UI.closeModal()">✕</button>
      <h2>${this.posTag(p.pos)} ${p.name} ${this.ovrTag(p.ovr)}</h2>
      <p class="muted">${p.age} ans · ${teamById(team).city} ${teamById(team).name} · Contrat ${p.salary} M$ (${p.years||1} an) · Potentiel ${p.potential} · pic ${p.peakOvr||p.ovr}</p>
      ${p.injuryGames>0?`<p style="color:var(--red);font-weight:700">🏥 Blessé : ${p._injuryDesc||'indisponible'} — absent ~${p.injuryGames} matchs.</p>`:''}
      <div class="grid cols2" style="margin-top:12px">
        <div>${bar('Tir extérieur', p.shooting)}${bar('Jeu intérieur', p.inside)}${bar('Création', p.playmaking)}</div>
        <div>${bar('Rebond', p.rebounding)}${bar('Défense', p.defense)}${bar('Athlétisme', p.athletic)}</div>
      </div>
      ${statLine}${this.careerSection(p.history, p.awards)}`);
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
    m.querySelectorAll('[data-draft]').forEach(b=>b.addEventListener('click',()=>{
      const r=Game.userDraftPick(+b.dataset.draft); if(r&&r.err)this.toast(r.err); this.render();}));

    // free agency
    m.querySelectorAll('[data-sign]').forEach(b=>b.addEventListener('click',()=>{
      const id=+b.dataset.sign;
      const sal=+m.querySelector(`[data-fa-sal="${id}"]`).value;
      const yr=+m.querySelector(`[data-fa-yr="${id}"]`).value;
      const r=Game.signFreeAgent(id,sal,yr);
      if(r&&r.err)this.toast(r.err);else this.toast('Joueur signé !');this.render();}));

    // tactiques : schémas
    m.querySelectorAll('[data-off]').forEach(el=>el.addEventListener('change',()=>{Game.setOffScheme(el.dataset.off);this.render();}));
    m.querySelectorAll('[data-def]').forEach(el=>el.addEventListener('change',()=>{Game.setDefScheme(el.dataset.def);this.render();}));
    // schémas en direct (match)
    const offLive=m.querySelector('[data-off-live]'); if(offLive)offLive.addEventListener('change',()=>{Game.setOffScheme(offLive.value);this.toast('Attaque : '+OFF_SCHEMES[offLive.value].name);});
    const defLive=m.querySelector('[data-def-live]'); if(defLive)defLive.addEventListener('change',()=>{Game.setDefScheme(defLive.value);this.toast('Défense : '+DEF_SCHEMES[defLive.value].name);});
    // priorités
    m.querySelectorAll('[data-prio-up]').forEach(b=>b.addEventListener('click',()=>{Game.movePriority(+b.dataset.prioUp,-1);this.render();}));
    m.querySelectorAll('[data-prio-down]').forEach(b=>b.addEventListener('click',()=>{Game.movePriority(+b.dataset.prioDown,1);this.render();}));
    m.querySelectorAll('[data-prio-rm]').forEach(b=>b.addEventListener('click',()=>{Game.removePriority(+b.dataset.prioRm);this.render();}));
    // scouting
    m.querySelectorAll('[data-scout]').forEach(b=>b.addEventListener('click',()=>{
      const r=Game.scoutProspect(this._scoutYear,+b.dataset.scout); if(r&&r.err)this.toast(r.err); this.render();}));
    m.querySelectorAll('[data-scout-year]').forEach(b=>b.addEventListener('click',()=>{this._scoutYear=+b.dataset.scoutYear;this.render();}));

    // historique : sous-onglets, carrières de légendes
    m.querySelectorAll('[data-hist]').forEach(b=>b.addEventListener('click',()=>{this._histSub=b.dataset.hist;this.render();}));
    m.querySelectorAll('[data-legend]').forEach(b=>b.addEventListener('click',()=>this.legendModal(+b.dataset.legend)));
    // finales all-time : sélecteurs
    const exEA=this.el('ex-eraA'); if(exEA)exEA.addEventListener('change',()=>{this._exEraA=exEA.value;this._exTeamA=null;this.render();});
    const exEB=this.el('ex-eraB'); if(exEB)exEB.addEventListener('change',()=>{this._exEraB=exEB.value;this._exTeamB=null;this.render();});
    const exTA=this.el('ex-teamA'); if(exTA)exTA.addEventListener('change',()=>{this._exTeamA=exTA.value;});
    const exTB=this.el('ex-teamB'); if(exTB)exTB.addEventListener('change',()=>{this._exTeamB=exTB.value;});
  },

  action(act) {
    const R = () => this.render();
    switch (act) {
      case 'simday': Game.simulateDay(); Game.checkSeasonEnd(); Game.save(); R(); break;
      case 'simweek': Game.simulateToNextUserGame(); Game.checkSeasonEnd(); Game.save(); R(); break;
      case 'goplay': this.tab='play'; R(); break;
      case 'checkend': Game.checkSeasonEnd(); R(); break;
      // match interactif
      case 'startlive': Game.startLiveGame(); this.tab='play'; R(); break;
      case 'sim-quarter': Game.simQuarter(); R(); break;
      case 'finish-live': {
        const out = Game.finishLiveGame();
        if (out && out.game) this.showGameResult(out.game, out.res); else R();
        break;
      }
      case 'simgame': {
        const out = Game.playUserGame(); Game.checkSeasonEnd(); Game.save();
        if (out) this.toast(`${out.res.home.score>out.res.away.score===(out.game.home===Game.state.userTeam)?'Victoire':'Défaite'} ${out.game.hs}-${out.game.as}`);
        R(); break;
      }
      // priorités
      case 'prio-add': { const sel=this.el('prio-add'); if(sel&&sel.value){Game.addPriority(+sel.value);this.render();} break; }
      case 'prio-reset': Game.resetPriorities(); R(); break;
      // finales all-time
      case 'run-exhib': {
        const out = Game.runExhibition(this._exEraA||'modern', this._exTeamA, this._exEraB||'e1996', this._exTeamB);
        if (out && out.err) { this.toast(out.err); break; }
        this._exResult = out; R(); break;
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
      case 'advance-draft': Game.advanceDraft(); R(); break;
      case 'sim-draft': Game.simDraftAll(); this.toast('Draft simulée'); R(); break;
      case 'to-fa': Game.state.offseasonStep=2; Game.save(); R(); break;
      case 'finish-offseason': Game.state.offseasonStep=3; Game.save(); R(); break;
      case 'start-season': Game.finishOffseason(); this.tab='dash'; R(); break;
      // autoline / automin
      case 'autoline': { const ut=Game.ut(); ut.lineup=autoLineup(ut.roster); autoMinutes(ut); Game.save(); R(); break; }
      case 'automin': { autoMinutes(Game.ut()); Game.save(); R(); break; }
      // trades
      case 'trade-eval': {
        const { userGives, userGets } = this.gatherTrade();
        const res = Game.evalUserTrade(this.tradePartner, userGives, userGets);
        const ut = Game.ut(), ot = Game.state.teams[this.tradePartner];
        const outSalU = userGives.filter(a=>a.kind==='player').reduce((s,a)=>s+(playerById(ut,a.id)?.salary||0),0);
        const outSalO = userGets.filter(a=>a.kind==='player').reduce((s,a)=>s+(playerById(ot,a.id)?.salary||0),0);
        const el = this.el('trade-summary');
        el.innerHTML = `<div class="row" style="justify-content:space-between">
            <span class="muted">Salaire cédé : <b>${this.fmt(outSalU)} M$</b> · reçu : <b>${this.fmt(outSalO)} M$</b></span>
            <span class="pill ${res.ok?'win':'loss'}">${res.ok?'✔ Offre acceptable':'✗ '+res.reason}</span>
          </div>`;
        break;
      }
      case 'trade-propose': {
        const { userGives, userGets } = this.gatherTrade();
        const r = Game.proposeUserTrade(this.tradePartner, userGives, userGets);
        if (r.ok) { this.toast('Échange conclu !'); R(); }
        else this.toast(r.err);
        break;
      }
    }
  },
};

/* --------------------- Détection des logos (optionnels) ------------------ */
// Vérifie au démarrage quels vrais logos ont été déposés dans assets/logos/ (PNG ou SVG).
const LOGO_AVAIL = {};
function tryLoad(url) {
  return new Promise(res => { const i = new Image(); i.onload = () => res(url); i.onerror = () => res(null); i.src = url; });
}
function preloadLogos(done) {
  Promise.all(TEAMS.map(async t => {
    const png = await tryLoad('assets/logos/' + t.id + '.png');
    LOGO_AVAIL[t.id] = png || await tryLoad('assets/logos/' + t.id + '.svg') || null;
  })).then(done);
}

/* ------------------------------ Démarrage -------------------------------- */
window.addEventListener('DOMContentLoaded', () => {
  UI.render();                 // rendu immédiat (écussons couleurs)
  preloadLogos(() => UI.render());  // re-rendu si de vrais logos sont présents
});
