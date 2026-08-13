/* ==========================================================================
   Broadcast — « diffusion TV » 2D animée d'un match.
   Reconstitue un déroulé de match (play-by-play) à partir de la feuille de
   match finale, puis l'anime : tableau d'affichage + horloge, shot chart qui
   s'allume, barre de momentum, meilleurs marqueurs en direct et commentaire.
   Aucune dépendance externe (Canvas/SVG/DOM). API calquée sur Court3D.

   window.Broadcast.play(container, homeMeta, awayMeta, res, {
     onScore(h,a), onClock(label, clock), onDone(), speed
   }) -> { skip(), stop() }
   ========================================================================== */
(function () {
  'use strict';

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const rf = (a, b) => a + Math.random() * (b - a);

  // Dimensions logiques du terrain (1 pied = 10 px) : 94 x 50 pieds.
  const CW = 940, CH = 500, RIM_L = 55, RIM_R = 885, MIDY = 250;

  // Modèles de commentaire (fr) selon le type d'action.
  const SAY = {
    three: [n => `${n} dégaine de loin… ﻿dedans ! 🎯`, n => `3 points signé ${n} !`, n => `${n} enflamme la salle à 3 points ! 🔥`],
    two: [n => `${n} conclut près du cercle`, n => `Panier de ${n}`, n => `${n} marque en pénétration`, n => `${n} au mi-distance, ça rentre`],
    dunk: [n => `⚡ DUNK de ${n} ! La salle debout !`, n => `${n} écrase le cercle ! 💥`],
    ft: [n => `${n} au lancer-franc`, n => `${n} ne tremble pas sur la ligne`],
    miss3: [n => `${n} tente de loin… à côté`, n => `Le 3 points de ${n} ne tombe pas`],
    miss2: [n => `${n} manque son tir`, n => `Tir contré/raté de ${n}`],
    ast: [n => `Superbe caviar de ${n}`, n => `${n} distribue le jeu`],
    stl: [n => `Interception de ${n} ! 🛡️`, n => `${n} vole le ballon !`],
    blk: [n => `CONTRE de ${n} ! 🚫`, n => `${n} envoie le tir au 3e balcon !`],
    tov: [n => `Perte de balle de ${n}`, n => `${n} gâche la possession`],
    oreb: [n => `${n} arrache le rebond offensif`, n => `Seconde chance pour ${n} !`],
  };
  const pick = a => a[Math.floor(Math.random() * a.length)];

  // Construit un point de tir plausible pour une équipe attaquant `rimX`.
  function shotXY(rimX, kind) {
    const dir = rimX > CW / 2 ? -1 : 1; // sens vers le camp de tir
    let dist, spread;
    if (kind === 'three') { dist = rf(250, 360); spread = 190; }
    else if (kind === 'ft') { dist = 150; spread = 22; }
    else { dist = rf(30, 210); spread = 150; }
    const x = clamp(rimX + dir * dist, 40, CW - 40);
    const y = clamp(MIDY + rf(-spread, spread), 34, CH - 34);
    return { x, y };
  }

  // Reconstitue une liste d'évènements horodatés depuis la feuille de match.
  function buildEvents(res, homeMeta, awayMeta) {
    const totalMin = 48 + 5 * (res.ot || 0);
    const evs = [];
    const addTeam = (box, meta, side) => {
      const rimX = side === 'home' ? RIM_R : RIM_L;
      (box.box || []).forEach(b => {
        const s = b.s; if (!s || s.min <= 0) return;
        const name = b.p.name;
        const two = Math.max(0, (s.fgm || 0) - (s.tpm || 0));
        const three = s.tpm || 0;
        const ft = s.ftm || 0;
        const miss = Math.max(0, (s.fga || 0) - (s.fgm || 0));
        const missT = Math.round(miss * ((s.tpa || 0) / Math.max(1, s.fga || 1)));
        for (let i = 0; i < three; i++) evs.push({ side, meta, name, type: 'three', pts: 3, ...shotXY(rimX, 'three') });
        for (let i = 0; i < two; i++) { const dunk = Math.random() < 0.22; evs.push({ side, meta, name, type: dunk ? 'dunk' : 'two', pts: 2, ...shotXY(rimX, 'two') }); }
        for (let i = 0; i < ft; i++) evs.push({ side, meta, name, type: 'ft', pts: 1, ...shotXY(rimX, 'ft') });
        for (let i = 0; i < missT; i++) evs.push({ side, meta, name, type: 'miss3', pts: 0, ...shotXY(rimX, 'three') });
        for (let i = 0; i < miss - missT; i++) evs.push({ side, meta, name, type: 'miss2', pts: 0, ...shotXY(rimX, 'two') });
        for (let i = 0; i < (s.ast || 0); i++) evs.push({ side, meta, name, type: 'ast', pts: 0 });
        for (let i = 0; i < (s.stl || 0); i++) evs.push({ side, meta, name, type: 'stl', pts: 0 });
        for (let i = 0; i < (s.blk || 0); i++) evs.push({ side, meta, name, type: 'blk', pts: 0 });
        for (let i = 0; i < (s.tov || 0); i++) evs.push({ side, meta, name, type: 'tov', pts: 0 });
        for (let i = 0; i < (s.oreb || 0); i++) if (Math.random() < 0.4) evs.push({ side, meta, name, type: 'oreb', pts: 0 });
      });
    };
    addTeam(res.home, homeMeta, 'home');
    addTeam(res.away, awayMeta, 'away');
    // Horodatage (en minutes de jeu écoulées) + tri chronologique.
    evs.forEach(e => { e.t = rf(0, totalMin); });
    evs.sort((a, b) => a.t - b.t);
    return { evs, totalMin };
  }

  // Convertit un temps écoulé (min) en libellé de période + horloge décomptée.
  function clockLabel(tMin, totalMin) {
    if (tMin >= 48) {
      const otIdx = Math.floor((tMin - 48) / 5) + 1;
      const into = (tMin - 48) - (otIdx - 1) * 5;
      return { label: `Prol. ${otIdx}`, clock: fmtClock(5 - into) };
    }
    const q = Math.min(4, Math.floor(tMin / 12) + 1);
    const into = tMin - (q - 1) * 12;
    return { label: `Q${q}`, clock: fmtClock(12 - into) };
  }
  function fmtClock(minLeft) {
    const total = Math.max(0, Math.round(minLeft * 60));
    const m = Math.floor(total / 60), s = total % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function courtSVG() {
    // Terrain stylisé, deux camps, cercles et arcs à 3 points schématiques.
    return `<svg class="bc-court" viewBox="0 0 ${CW} ${CH}" preserveAspectRatio="xMidYMid meet">
      <defs><linearGradient id="bcFloor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3a2a18"/><stop offset="1" stop-color="#2a1e11"/></linearGradient></defs>
      <rect x="0" y="0" width="${CW}" height="${CH}" fill="url(#bcFloor)"/>
      <g fill="none" stroke="#e8d9b5" stroke-width="3" opacity="0.75">
        <rect x="14" y="14" width="${CW - 28}" height="${CH - 28}"/>
        <line x1="${CW / 2}" y1="14" x2="${CW / 2}" y2="${CH - 14}"/>
        <circle cx="${CW / 2}" cy="${MIDY}" r="60"/>
        <rect x="14" y="${MIDY - 95}" width="190" height="190"/>
        <rect x="${CW - 204}" y="${MIDY - 95}" width="190" height="190"/>
        <circle cx="${RIM_L}" cy="${MIDY}" r="9" stroke="#ff8a3d" stroke-width="4"/>
        <circle cx="${RIM_R}" cy="${MIDY}" r="9" stroke="#ff8a3d" stroke-width="4"/>
        <path d="M 14 ${MIDY - 220} A 235 235 0 0 1 14 ${MIDY + 220}"/>
        <path d="M ${CW - 14} ${MIDY - 220} A 235 235 0 0 0 ${CW - 14} ${MIDY + 220}"/>
      </g>
      <g id="bc-marks"></g>
    </svg>`;
  }

  function play(container, homeMeta, awayMeta, res, opts = {}) {
    opts = opts || {};
    const onScore = opts.onScore || function () {};
    const onClock = opts.onClock || function () {};
    const onDone = opts.onDone || function () {};
    const speed = opts.speed || 1;

    const { evs, totalMin } = buildEvents(res, homeMeta, awayMeta);
    const cH = homeMeta.c1 || '#3aa0ff', cA = awayMeta.c1 || '#ff5a5a';

    container.innerHTML = `
      <div class="bc-wrap">
        <div class="bc-left">
          ${courtSVG()}
          <div class="bc-mom" title="Momentum">
            <span class="bc-mom-badge" style="background:${cA}">${awayMeta.id || 'EXT'}</span>
            <div class="bc-mom-track"><div class="bc-mom-fillA" style="background:${cA}"></div><div class="bc-mom-fillH" style="background:${cH}"></div><div class="bc-mom-dot"></div></div>
            <span class="bc-mom-badge" style="background:${cH}">${homeMeta.id || 'DOM'}</span>
          </div>
        </div>
        <div class="bc-right">
          <div class="bc-leaders" id="bc-leaders"></div>
          <div class="bc-feed" id="bc-feed"></div>
        </div>
      </div>`;

    const marks = container.querySelector('#bc-marks');
    const feed = container.querySelector('#bc-feed');
    const leadersEl = container.querySelector('#bc-leaders');
    const momDot = container.querySelector('.bc-mom-dot');
    const momH = container.querySelector('.bc-mom-fillH');
    const momA = container.querySelector('.bc-mom-fillA');

    let hs = 0, as = 0;
    const pts = {}; // name -> {pts, side, meta}
    const recent = []; // deltas récents pour le momentum
    let idx = 0, raf = null, stopped = false, done = false;
    const svgNS = 'http://www.w3.org/2000/svg';

    function addMark(e) {
      if (e.x == null) return;
      const made = e.pts > 0;
      const col = e.side === 'home' ? cH : cA;
      const c = document.createElementNS(svgNS, 'circle');
      c.setAttribute('cx', e.x); c.setAttribute('cy', e.y);
      c.setAttribute('r', made ? 9 : 7);
      if (made) { c.setAttribute('fill', col); c.setAttribute('stroke', '#fff'); c.setAttribute('stroke-width', '1.5'); }
      else { c.setAttribute('fill', 'none'); c.setAttribute('stroke', col); c.setAttribute('stroke-width', '2.5'); c.setAttribute('opacity', '0.6'); }
      c.setAttribute('class', 'bc-mark' + (made ? ' made' : ''));
      marks.appendChild(c);
      if (e.type === 'three') { const t = document.createElementNS(svgNS, 'circle'); t.setAttribute('cx', e.x); t.setAttribute('cy', e.y); t.setAttribute('r', 14); t.setAttribute('fill', 'none'); t.setAttribute('stroke', col); t.setAttribute('stroke-width', '1.5'); t.setAttribute('opacity', '0.5'); marks.appendChild(t); }
    }

    function updateMomentum() {
      const net = recent.slice(-10).reduce((a, b) => a + b, 0); // + = home
      const pct = clamp(50 + net * 3.2, 6, 94);
      momDot.style.left = pct + '%';
      momH.style.width = pct + '%';
      momA.style.width = (100 - pct) + '%';
    }

    function updateLeaders() {
      const arr = Object.keys(pts).map(n => ({ n, ...pts[n] })).sort((a, b) => b.pts - a.pts);
      const top = side => arr.filter(x => x.side === side).slice(0, 3);
      const col = side => side === 'home' ? cH : cA;
      const list = (side, meta) => `<div class="bc-lead-col">
        <div class="bc-lead-team"><span class="bc-dot" style="background:${col(side)}"></span>${meta.name}</div>
        ${top(side).map(x => `<div class="bc-lead-row"><span>${x.n}</span><b>${x.pts}</b></div>`).join('') || '<div class="bc-lead-row muted">—</div>'}
      </div>`;
      leadersEl.innerHTML = list('away', awayMeta) + list('home', homeMeta);
    }

    function say(e) {
      const fn = SAY[e.type]; if (!fn) return;
      const col = e.side === 'home' ? cH : cA;
      const line = document.createElement('div');
      line.className = 'bc-line';
      const { label } = clockLabel(e.t, totalMin);
      line.innerHTML = `<span class="bc-when" style="border-color:${col}">${label}</span> <span class="bc-dot" style="background:${col}"></span> ${pick(fn)(e.name)}${e.pts ? ` <b class="bc-pts">+${e.pts}</b>` : ''}`;
      feed.insertBefore(line, feed.firstChild);
      while (feed.childNodes.length > 60) feed.removeChild(feed.lastChild);
    }

    function applyEvent(e) {
      if (e.pts > 0) {
        if (e.side === 'home') hs += e.pts; else as += e.pts;
        pts[e.name] = pts[e.name] || { pts: 0, side: e.side, meta: e.meta };
        pts[e.name].pts += e.pts;
        recent.push(e.side === 'home' ? e.pts : -e.pts);
        onScore(hs, as);
        updateMomentum(); updateLeaders();
      }
      addMark(e);
      say(e);
    }

    function finish() {
      if (done) return; done = true;
      if (raf) cancelAnimationFrame(raf);
      // Sécurité : cale le score final exact sur la feuille de match.
      hs = res.home.score; as = res.away.score; onScore(hs, as);
      const last = clockLabel(totalMin, totalMin);
      onClock('Final', '0:00');
      onDone();
    }

    // Boucle d'animation : temps de jeu virtuel piloté par une horloge murale.
    const PLAYBACK_MS = 34000 / clamp(speed, 0.25, 8); // durée totale ~34s
    let startWall = null;
    function frame(now) {
      if (stopped) return;
      if (startWall == null) startWall = now;
      const p = clamp((now - startWall) / PLAYBACK_MS, 0, 1);
      const vt = p * totalMin;
      while (idx < evs.length && evs[idx].t <= vt) { applyEvent(evs[idx]); idx++; }
      const { label, clock } = clockLabel(Math.min(vt, totalMin - 0.001), totalMin);
      onClock(label, clock);
      if (p >= 1) { finish(); return; }
      raf = requestAnimationFrame(frame);
    }
    updateLeaders();
    raf = requestAnimationFrame(frame);

    return {
      skip() { // révèle tout instantanément
        while (idx < evs.length) { applyEvent(evs[idx]); idx++; }
        finish();
      },
      stop() { stopped = true; if (raf) cancelAnimationFrame(raf); },
    };
  }

  window.Broadcast = { play };
})();
