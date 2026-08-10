/* ============================================================
   INTERFACE — rendu des écrans & interactions
   ============================================================ */
var FM = window.FM;
var $ = sel => document.querySelector(sel);
const el = (tag, cls, html) => { const e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e; };
const money = m => (m>=0? "" : "-") + Math.abs(m).toFixed(1) + " M€";
const FLAG = { FRA:"🇫🇷",ENG:"🏴",ESP:"🇪🇸",ITA:"🇮🇹",GER:"🇩🇪",POR:"🇵🇹",BRA:"🇧🇷",ARG:"🇦🇷",NED:"🇳🇱",BEL:"🇧🇪" };

let currentTab = "accueil";

/* ============= ÉCRAN DE DÉMARRAGE ============= */
function renderStart(){
  const app = $("#app");
  app.innerHTML = "";
  const wrap = el("div","start");
  wrap.appendChild(el("h1","logo","⚽ Euro Manager"));
  wrap.appendChild(el("p","tagline","Mode Carrière Manager — gérez un club européen, du mercato au terrain."));

  const card = el("div","card start-card");
  card.appendChild(el("label",null,"Nom du manager"));
  const nameIn = el("input"); nameIn.type="text"; nameIn.value="Manager"; nameIn.id="mgrName";
  card.appendChild(nameIn);

  card.appendChild(el("label",null,"Choisissez un championnat"));
  const ligueSel = el("select"); ligueSel.id="ligueSel";
  FM.LEAGUES.forEach(l=> ligueSel.appendChild(new Option(`${l.nom}`, l.id)));
  card.appendChild(ligueSel);

  card.appendChild(el("label",null,"Choisissez votre club"));
  const clubSel = el("select"); clubSel.id="clubSel";
  card.appendChild(clubSel);

  const fillClubs = ()=>{
    clubSel.innerHTML="";
    const lg = FM.LEAGUES.find(l=>l.id===ligueSel.value);
    lg.clubs.forEach((c,i)=> clubSel.appendChild(new Option(`${c[0]}  ${"★".repeat(c[1])}`, i)));
  };
  ligueSel.onchange = fillClubs; fillClubs();

  const btn = el("button","btn primary big","🚀 Démarrer la carrière");
  btn.onclick = ()=>{
    // Construire la base pour retrouver l'id du club choisi
    FM.setSeed(20260810);
    const tmp = FM.buildDatabase();
    const lgId = ligueSel.value;
    const idx = parseInt(clubSel.value,10);
    const clubsLg = tmp.clubs.filter(c=>c.ligue===lgId);
    const chosen = clubsLg[idx];
    FM.newGame(nameIn.value.trim()||"Manager", chosen.id, 20260810);
    currentTab="accueil";
    renderGame();
  };
  card.appendChild(btn);

  if (FM.hasSave()){
    const cont = el("button","btn ghost","▶ Reprendre la partie sauvegardée");
    cont.onclick = ()=>{ if(FM.load()){ currentTab="accueil"; renderGame(); } };
    card.appendChild(cont);
    const del = el("button","btn danger-ghost","🗑 Supprimer la sauvegarde");
    del.onclick = ()=>{ if(confirm("Supprimer la sauvegarde ?")){ FM.deleteSave(); renderStart(); } };
    card.appendChild(del);
  }
  wrap.appendChild(card);
  wrap.appendChild(el("p","hint","💾 Partie sauvegardée automatiquement dans votre navigateur (localStorage)."));
  app.appendChild(wrap);
}

/* ============= COQUE DU JEU ============= */
function renderGame(){
  const app = $("#app");
  app.innerHTML = "";
  const my = FM.myClub();

  // Barre supérieure
  const top = el("div","topbar");
  top.innerHTML = `
    <div class="club-id">
      <span class="flag">${FLAG[my.pays]}</span>
      <div><b>${my.nom}</b><small>${my.ligueNom} · ${FM.state.managerName}</small></div>
    </div>
    <div class="stats">
      <div><small>Saison</small><b>${FM.state.saison}</b></div>
      <div><small>Journée</small><b>${Math.min(FM.state.journee+1,FM.totalMatchdays())}/${FM.totalMatchdays()}</b></div>
      <div><small>Classement</small><b>${FM.myRank()}${ord(FM.myRank())}</b></div>
      <div><small>Budget</small><b class="${my.budget<0?'neg':'pos'}">${money(my.budget)}</b></div>
      <div><small>Note effectif</small><b>${FM.squadRating(my)}</b></div>
    </div>`;
  app.appendChild(top);

  // Onglets
  const tabs = el("div","tabs");
  const T = [["accueil","🏠 Accueil"],["effectif","👥 Effectif"],["tactique","📋 Tactique"],
             ["mercato","💱 Mercato"],["classement","🏆 Classement"],["calendrier","📅 Calendrier"],["actus","📰 Actus"]];
  T.forEach(([k,lbl])=>{
    const b = el("button","tab"+(currentTab===k?" active":""),lbl);
    b.onclick=()=>{ currentTab=k; renderGame(); };
    tabs.appendChild(b);
  });
  app.appendChild(tabs);

  const body = el("div","content"); body.id="content";
  app.appendChild(body);

  switch(currentTab){
    case "accueil": renderHome(body); break;
    case "effectif": renderSquad(body); break;
    case "tactique": renderTactics(body); break;
    case "mercato": renderMarket(body); break;
    case "classement": renderTable(body); break;
    case "calendrier": renderCalendar(body); break;
    case "actus": renderNews(body); break;
  }

  // pied
  const foot = el("div","footbar");
  const quit = el("button","btn ghost small","⏻ Menu principal");
  quit.onclick = ()=>{ renderStart(); };
  foot.appendChild(quit);
  app.appendChild(foot);
}

function ord(n){ return n===1?"er":"e"; }

/* ============= ACCUEIL ============= */
function renderHome(body){
  const my = FM.myClub();
  if (FM.isSeasonOver()){
    const c = el("div","card center");
    const t = FM.table();
    const rank = FM.myRank();
    c.innerHTML = `<h2>🏁 Saison ${FM.state.saison} terminée</h2>
      <p>Champion : <b>${t[0].nom}</b></p>
      <p>${my.nom} termine <b>${rank}${ord(rank)}</b> avec ${my.pts} pts.</p>`;
    const b = el("button","btn primary big","➡ Saison suivante");
    b.onclick=()=>{ FM.endSeason(); currentTab="accueil"; renderGame(); };
    c.appendChild(b);
    body.appendChild(c);
    return;
  }

  const fx = FM.nextFixture();
  const card = el("div","card match-card");
  if (fx){
    const dom = FM.clubById(fx.dom), ext = FM.clubById(fx.ext);
    const iAmHome = fx.dom===my.id;
    card.innerHTML = `
      <div class="match-header">Journée ${FM.state.journee+1} · ${FM.state.ligueJoueurNom||FM.myClub().ligueNom}</div>
      <div class="match-teams">
        <div class="side ${iAmHome?'me':''}"><span class="flag">${FLAG[dom.pays]}</span><b>${dom.nom}</b><small>Note ${FM.squadRating(dom)}</small></div>
        <div class="vs">VS</div>
        <div class="side ${!iAmHome?'me':''}"><span class="flag">${FLAG[ext.pays]}</span><b>${ext.nom}</b><small>Note ${FM.squadRating(ext)}</small></div>
      </div>
      <p class="match-loc">${iAmHome?'🏟 À domicile':'✈ À l\'extérieur'} · Vous êtes ${iAmHome?dom.nom:ext.nom}</p>`;
  }
  const play = el("button","btn primary big","▶ Jouer le match");
  play.onclick = ()=> playMatchFlow();
  card.appendChild(play);
  const sim = el("button","btn ghost","⏩ Simuler rapidement");
  sim.onclick = ()=>{ FM.playMatchday(); currentTab="accueil"; renderGame(); };
  card.appendChild(sim);
  body.appendChild(card);

  // objectif + offres
  const info = el("div","card");
  info.innerHTML = `<h3>🎯 Objectif de saison</h3><p>${cap(FM.state.objectif)} — actuellement <b>${FM.myRank()}${ord(FM.myRank())}</b> / ${FM.clubsInMyLeague().length}.</p>`;
  body.appendChild(info);

  if (FM.state.offres.length){
    const off = el("div","card");
    off.appendChild(el("h3",null,"📩 Offres reçues"));
    FM.state.offres.forEach((o,i)=>{
      const row = el("div","offer-row");
      row.innerHTML = `<span><b>${o.clubNom}</b> offre <b>${o.montant.toFixed(1)} M€</b> pour ${o.joueurNom}</span>`;
      const ok = el("button","btn small primary","Accepter");
      ok.onclick=()=>{ const r=FM.acceptOffer(i); toast(r.msg); renderGame(); };
      const no = el("button","btn small ghost","Refuser");
      no.onclick=()=>{ FM.rejectOffer(i); renderGame(); };
      row.appendChild(ok); row.appendChild(no);
      off.appendChild(row);
    });
    body.appendChild(off);
  }

  // dernières actus
  const news = el("div","card");
  news.appendChild(el("h3",null,"📰 Dernières actualités"));
  FM.state.news.slice(0,5).forEach(n=> news.appendChild(el("p","news-item",n.txt)));
  body.appendChild(news);
}

/* ============= DÉROULÉ DU MATCH (animation) ============= */
function playMatchFlow(){
  const my = FM.myClub();
  // Vérifier onze complet
  const missing = my.onze.filter(s=>!s.id).length;
  if (missing){ toast("⚠ Onze incomplet — complétez votre équipe (Tactique)."); currentTab="tactique"; renderGame(); return; }

  const res = FM.playMatchday();
  const mr = res.myResult;
  if (!mr){ renderGame(); return; }
  const dom = FM.clubById(mr.dom), ext = FM.clubById(mr.ext);

  const overlay = el("div","overlay");
  const box = el("div","match-live card");
  box.innerHTML = `<div class="live-head">
      <div><span class="flag">${FLAG[dom.pays]}</span> ${dom.nom}</div>
      <div class="live-score" id="liveScore">0 - 0</div>
      <div>${ext.nom} <span class="flag">${FLAG[ext.pays]}</span></div>
    </div>
    <div class="live-min" id="liveMin">Coup d'envoi…</div>
    <div class="live-feed" id="liveFeed"></div>`;
  overlay.appendChild(box);
  const skip = el("button","btn ghost","⏭ Passer");
  box.appendChild(skip);
  document.body.appendChild(overlay);

  const events = mr.events.slice().sort((a,b)=>a.min-b.min);
  let ds=0, es=0, idx=0, minute=0;
  const feed = box.querySelector("#liveFeed");
  const scoreEl = box.querySelector("#liveScore");
  const minEl = box.querySelector("#liveMin");

  function finish(){
    ds=mr.ds; es=mr.es;
    scoreEl.textContent = `${ds} - ${es}`;
    minEl.textContent = "Coup de sifflet final ⏱";
    // afficher tous buts manqués
    feed.innerHTML="";
    events.forEach(e=> feed.appendChild(buteurLine(e, dom, ext)));
    skip.textContent="✔ Continuer";
    skip.className="btn primary";
    skip.onclick=()=>{ overlay.remove(); currentTab="accueil"; renderGame(); };
    clearInterval(timer);
  }
  skip.onclick = finish;

  const timer = setInterval(()=>{
    minute += 3;
    if (minute>90){ finish(); return; }
    minEl.textContent = `${minute}'`;
    while (idx<events.length && events[idx].min<=minute){
      const e = events[idx++];
      if (e.clubId===dom.id) ds++; else es++;
      scoreEl.textContent = `${ds} - ${es}`;
      const line = buteurLine(e, dom, ext);
      line.classList.add("flash");
      feed.prepend(line);
    }
  }, 220);
}
function buteurLine(e, dom, ext){
  const side = e.clubId===dom.id ? "left":"right";
  return el("div","feed-line "+side, `<span class="fmin">${e.min}'</span> ⚽ <b>${e.joueur}</b> <small>(${e.club})</small>`);
}

/* ============= EFFECTIF ============= */
function renderSquad(body){
  const my = FM.myClub();
  const card = el("div","card");
  card.appendChild(el("h3",null,`👥 Effectif — ${my.joueurs.length} joueurs · Masse salariale ~${my.joueurs.reduce((a,p)=>a+p.salaire,0).toFixed(0)} k€/sem`));

  const table = el("table","squad-table");
  table.innerHTML = `<thead><tr>
    <th>Poste</th><th>Nom</th><th>Nat</th><th>Âge</th><th>Note</th><th>Pot</th>
    <th>Valeur</th><th>Forme</th><th>Moral</th><th>Buts</th><th></th></tr></thead>`;
  const tb = el("tbody");
  const order = {G:0,D:1,M:2,A:3};
  my.joueurs.slice().sort((a,b)=> order[a.groupe]-order[b.groupe] || b.note-a.note).forEach(p=>{
    const inXI = my.onze.some(s=>s.id===p.id);
    const tr = el("tr", inXI?"in-xi":"");
    tr.innerHTML = `
      <td><span class="pos-badge ${p.groupe}">${p.pos}</span></td>
      <td>${inXI?'⭐ ':''}${p.nom}</td>
      <td>${FLAG[p.nat]||''}</td>
      <td>${p.age}</td>
      <td><b class="note ${noteClass(p.note)}">${p.note}</b></td>
      <td>${p.potentiel}</td>
      <td>${p.valeur.toFixed(1)} M€</td>
      <td>${formeIcon(p.forme)}</td>
      <td>${moralBar(p.moral)}</td>
      <td>${p.buts}</td>
      <td></td>`;
    const btn = el("button","btn tiny "+(p.transferListe?"danger-ghost":"ghost"), p.transferListe?"Retirer":"Vendre");
    btn.onclick=()=>{ FM.toggleTransferList(p.id); renderGame(); };
    tr.lastChild.appendChild(btn);
    tb.appendChild(tr);
  });
  table.appendChild(tb);
  const scroll = el("div","table-scroll"); scroll.appendChild(table);
  card.appendChild(scroll);
  body.appendChild(card);
}

/* ============= TACTIQUE ============= */
function renderTactics(body){
  const my = FM.myClub();

  // Formation + réglages
  const setup = el("div","card");
  setup.appendChild(el("h3",null,"📋 Formation & consignes"));
  const row = el("div","tac-row");
  const fLabel = el("label",null,"Formation");
  const fSel = el("select");
  Object.keys(FM.FORMATIONS).forEach(f=> fSel.appendChild(new Option(f,f)));
  fSel.value = my.formation;
  fSel.onchange=()=>{ FM.setFormation(fSel.value); renderGame(); };
  fLabel.appendChild(fSel);
  row.appendChild(fLabel);

  row.appendChild(sliderTac("Mentalité", ["Défensive","Équilibrée","Offensive"], my.tactique.mentalite, v=>{FM.setTactic("mentalite",v);}));
  row.appendChild(sliderTac("Tempo", ["Lent","Normal","Rapide"], my.tactique.tempo, v=>{FM.setTactic("tempo",v);}));
  row.appendChild(sliderTac("Pressing", ["Bas","Moyen","Haut"], my.tactique.pressing, v=>{FM.setTactic("pressing",v);}));
  setup.appendChild(row);

  const auto = el("button","btn ghost small","🔄 Composer automatiquement");
  auto.onclick=()=>{ my.onze=FM.autoPickXI(my); FM.save(); renderGame(); };
  setup.appendChild(auto);
  body.appendChild(setup);

  // Terrain visuel
  const pitchCard = el("div","card");
  pitchCard.appendChild(el("h3",null,"🟩 Composition sur le terrain"));
  const st = FM.teamStrength(my);
  pitchCard.appendChild(el("p","strength-line",
    `Attaque <b>${Math.round(st.att)}</b> · Milieu <b>${Math.round(st.mid)}</b> · Défense <b>${Math.round(st.def)}</b> · Global <b>${st.global}</b>`));
  const pitch = el("div","pitch");
  const slots = FM.FORMATIONS[my.formation];
  const rows = pitchRows(my.formation);
  let si=0;
  rows.forEach(count=>{
    const line = el("div","pitch-line");
    for (let k=0;k<count;k++){
      const slotIdx=si;
      const s = my.onze[slotIdx];
      const p = s && s.id ? FM.getPlayer(my,s.id) : null;
      const spot = el("div","spot"+(p?"":" empty"));
      spot.innerHTML = p
        ? `<div class="spot-pos">${slots[slotIdx]}</div><div class="spot-note ${noteClass(p.note)}">${p.note}</div><div class="spot-name">${shortName(p.nom)}</div>`
        : `<div class="spot-pos">${slots[slotIdx]}</div><div class="spot-add">+</div>`;
      spot.onclick=()=> openPlayerPicker(slotIdx, slots[slotIdx]);
      line.appendChild(spot);
      si++;
    }
    pitch.appendChild(line);
  });
  pitchCard.appendChild(pitch);
  pitchCard.appendChild(el("p","hint","Cliquez sur un poste pour changer le joueur titulaire."));
  body.appendChild(pitchCard);
}

function sliderTac(title, labels, val, onchange){
  const box = el("label","tac-slider");
  box.appendChild(el("span","tac-title",title));
  const out = el("span","tac-val",labels[val]);
  const inp = el("input"); inp.type="range"; inp.min=0; inp.max=2; inp.value=val;
  inp.oninput=()=>{ out.textContent=labels[inp.value]; onchange(parseInt(inp.value,10)); };
  box.appendChild(inp); box.appendChild(out);
  return box;
}

function pitchRows(formation){
  // Nombre de joueurs par ligne pour l'affichage (GK en bas)
  const map = {
    "4-4-2":[1,4,4,2], "4-3-3":[1,4,3,3], "4-2-3-1":[1,4,2,3,1],
    "3-5-2":[1,3,5,2], "5-3-2":[1,5,3,2], "4-5-1":[1,4,5,1]
  };
  return map[formation] || [1,4,4,2];
}

function openPlayerPicker(slotIdx, slotPos){
  const my = FM.myClub();
  const overlay = el("div","overlay");
  const box = el("div","card picker");
  box.appendChild(el("h3",null,`Choisir un joueur — ${FM.POS_LABEL[slotPos]} (${slotPos})`));
  const list = el("div","picker-list");
  const usedIds = new Set(my.onze.filter((_,i)=>i!==slotIdx).map(s=>s.id));
  my.joueurs.slice().sort((a,b)=>b.note-a.note).forEach(p=>{
    const row = el("div","picker-row"+(usedIds.has(p.id)?" used":""));
    row.innerHTML = `<span class="pos-badge ${p.groupe}">${p.pos}</span>
      <b>${p.nom}</b> <span class="note ${noteClass(p.note)}">${p.note}</span>
      <small>${formeIcon(p.forme)} ${usedIds.has(p.id)?'· déjà titulaire':''}</small>`;
    row.onclick=()=>{ FM.setStarter(slotIdx, p.id); overlay.remove(); renderGame(); };
    list.appendChild(row);
  });
  box.appendChild(list);
  const close = el("button","btn ghost","Fermer");
  close.onclick=()=> overlay.remove();
  box.appendChild(close);
  overlay.appendChild(box);
  overlay.onclick=e=>{ if(e.target===overlay) overlay.remove(); };
  document.body.appendChild(overlay);
}

/* ============= MERCATO ============= */
let marketFilter = { poste:"", noteMin:0, ageMax:40, q:"" };
function renderMarket(body){
  const my = FM.myClub();
  const head = el("div","card");
  head.innerHTML = `<h3>💱 Mercato — Budget : <span class="${my.budget<0?'neg':'pos'}">${money(my.budget)}</span></h3>`;

  const filters = el("div","market-filters");
  const q = el("input"); q.type="text"; q.placeholder="Rechercher un joueur…"; q.value=marketFilter.q;
  q.oninput=()=>{ marketFilter.q=q.value; refreshMarket(listBox); };
  filters.appendChild(q);

  const posSel = el("select");
  posSel.appendChild(new Option("Tous postes",""));
  [["G","Gardiens"],["D","Défenseurs"],["M","Milieux"],["A","Attaquants"]].forEach(([v,l])=>posSel.appendChild(new Option(l,v)));
  posSel.value=marketFilter.poste;
  posSel.onchange=()=>{ marketFilter.poste=posSel.value; refreshMarket(listBox); };
  filters.appendChild(posSel);

  const noteSel = el("select");
  [0,60,70,75,80,85].forEach(n=> noteSel.appendChild(new Option(n?`Note ≥ ${n}`:"Toute note", n)));
  noteSel.value=marketFilter.noteMin;
  noteSel.onchange=()=>{ marketFilter.noteMin=parseInt(noteSel.value,10); refreshMarket(listBox); };
  filters.appendChild(noteSel);

  const ageSel = el("select");
  [40,21,23,25,28,32].forEach(a=> ageSel.appendChild(new Option(a===40?"Tout âge":`≤ ${a} ans`, a)));
  ageSel.value=marketFilter.ageMax;
  ageSel.onchange=()=>{ marketFilter.ageMax=parseInt(ageSel.value,10); refreshMarket(listBox); };
  filters.appendChild(ageSel);

  head.appendChild(filters);
  body.appendChild(head);

  const listBox = el("div","card"); listBox.id="marketList";
  body.appendChild(listBox);
  refreshMarket(listBox);
}
function refreshMarket(container){
  container.innerHTML="";
  const my = FM.myClub();
  const list = FM.transferMarket({
    poste: marketFilter.poste, noteMin: marketFilter.noteMin,
    ageMax: marketFilter.ageMax===40?null:marketFilter.ageMax,
    q: marketFilter.q, limit:80
  });
  const table = el("table","squad-table");
  table.innerHTML = `<thead><tr><th>Poste</th><th>Nom</th><th>Club</th><th>Âge</th><th>Note</th><th>Valeur</th><th>Statut</th><th></th></tr></thead>`;
  const tb = el("tbody");
  list.forEach(p=>{
    const tr = el("tr", p.dispo?"listed":"");
    tr.innerHTML = `<td><span class="pos-badge ${p.groupe}">${p.pos}</span></td>
      <td>${p.nom} ${FLAG[p.nat]||''}</td><td>${p.clubNom}</td><td>${p.age}</td>
      <td><b class="note ${noteClass(p.note)}">${p.note}</b></td>
      <td>${p.valeur.toFixed(1)} M€</td>
      <td>${p.dispo?'<span class="tag">Transférable</span>':'—'}</td><td></td>`;
    const btn = el("button","btn tiny primary","Offre");
    btn.onclick=()=> openBid(p);
    tr.lastChild.appendChild(btn);
    tb.appendChild(tr);
  });
  table.appendChild(tb);
  const scroll = el("div","table-scroll"); scroll.appendChild(table);
  container.appendChild(scroll);
  if(!list.length) container.appendChild(el("p","hint","Aucun joueur ne correspond aux filtres."));
}
function openBid(p){
  const my = FM.myClub();
  const overlay = el("div","overlay");
  const box = el("div","card picker");
  const suggested = Math.round(p.valeur*(p.dispo?1.0:1.2)*10)/10;
  box.innerHTML = `<h3>Offre pour ${p.nom}</h3>
    <p><span class="pos-badge ${p.groupe}">${p.pos}</span> ${FM.POS_LABEL[p.pos]} · ${p.clubNom} · ${p.age} ans · Note <b>${p.note}</b></p>
    <p>Valeur estimée : <b>${p.valeur.toFixed(1)} M€</b> · Votre budget : <b>${my.budget.toFixed(1)} M€</b></p>`;
  const inp = el("input"); inp.type="number"; inp.step="0.5"; inp.min="0"; inp.value=suggested;
  box.appendChild(el("label",null,"Montant de l'offre (M€)"));
  box.appendChild(inp);
  const msg = el("p","bid-msg","");
  const send = el("button","btn primary","💰 Soumettre l'offre");
  send.onclick=()=>{
    const r = FM.buyPlayer(p.id, parseFloat(inp.value));
    msg.textContent = r.msg; msg.className = "bid-msg "+(r.ok?"ok":"ko");
    if (r.ok){ setTimeout(()=>{ overlay.remove(); renderGame(); },900); }
  };
  box.appendChild(send);
  box.appendChild(msg);
  const close = el("button","btn ghost","Annuler");
  close.onclick=()=> overlay.remove();
  box.appendChild(close);
  overlay.appendChild(box);
  overlay.onclick=e=>{ if(e.target===overlay) overlay.remove(); };
  document.body.appendChild(overlay);
}

/* ============= CLASSEMENT ============= */
function renderTable(body){
  const card = el("div","card");
  card.appendChild(el("h3",null,`🏆 ${FM.myClub().ligueNom} — Saison ${FM.state.saison}`));
  const t = FM.table();
  const table = el("table","rank-table");
  table.innerHTML = `<thead><tr><th>#</th><th>Club</th><th>J</th><th>G</th><th>N</th><th>P</th><th>BP</th><th>BC</th><th>Diff</th><th>Pts</th></tr></thead>`;
  const tb = el("tbody");
  t.forEach((c,i)=>{
    const tr = el("tr", c.id===FM.state.managedClubId?"me":"");
    let zone=""; const total=t.length;
    if (i<3) zone="ucl"; else if (i<6) zone="uel"; else if (i>=total-3) zone="rel";
    if (zone) tr.classList.add(zone);
    tr.innerHTML = `<td>${i+1}</td><td>${FLAG[c.pays]} ${c.nom}</td>
      <td>${c.j}</td><td>${c.g}</td><td>${c.n}</td><td>${c.p}</td>
      <td>${c.bp}</td><td>${c.bc}</td><td>${c.bp-c.bc>0?'+':''}${c.bp-c.bc}</td><td><b>${c.pts}</b></td>`;
    tb.appendChild(tr);
  });
  table.appendChild(tb);
  const scroll = el("div","table-scroll"); scroll.appendChild(table);
  card.appendChild(scroll);
  card.appendChild(el("p","legend","🟩 Ligue des Champions (1-3) · 🟦 Europa (4-6) · 🟥 Relégation (3 derniers)"));
  body.appendChild(card);

  // Meilleurs buteurs
  const scorers = [];
  FM.state.db.clubs.filter(c=>c.ligue===FM.state.ligueJoueur).forEach(c=>
    c.joueurs.forEach(p=>{ if(p.buts>0) scorers.push({...p, club:c.nom}); }));
  scorers.sort((a,b)=>b.buts-a.buts);
  if (scorers.length){
    const sc = el("div","card");
    sc.appendChild(el("h3",null,"👟 Meilleurs buteurs"));
    const ol = el("ol","scorers");
    scorers.slice(0,10).forEach(p=> ol.appendChild(el("li",null,`<b>${p.buts}</b> — ${p.nom} <small>(${p.club})</small>`)));
    sc.appendChild(ol);
    body.appendChild(sc);
  }
}

/* ============= CALENDRIER ============= */
function renderCalendar(body){
  const my = FM.myClub();
  const card = el("div","card");
  card.appendChild(el("h3",null,"📅 Calendrier & résultats"));
  const list = el("div","fixtures");
  FM.state.calendrier.forEach((jd, i)=>{
    const m = jd.find(x=>x.dom===my.id||x.ext===my.id);
    if (!m) return;
    const dom = FM.clubById(m.dom), ext = FM.clubById(m.ext);
    const res = FM.state.resultats[i];
    let scoreTxt = "—", cls="upcoming";
    if (res){
      const r = res.find(x=>x.dom===m.dom&&x.ext===m.ext);
      if (r){
        scoreTxt = `${r.ds} - ${r.es}`;
        const won = (r.dom===my.id&&r.ds>r.es)||(r.ext===my.id&&r.es>r.ds);
        const draw = r.ds===r.es;
        cls = won?"won":(draw?"draw":"lost");
      }
    } else if (i===FM.state.journee){ cls="next"; }
    const row = el("div","fixture "+cls);
    row.innerHTML = `<span class="jd">J${i+1}</span>
      <span class="ft-dom ${m.dom===my.id?'me':''}">${dom.nom}</span>
      <span class="ft-score">${scoreTxt}</span>
      <span class="ft-ext ${m.ext===my.id?'me':''}">${ext.nom}</span>`;
    list.appendChild(row);
  });
  card.appendChild(list);
  body.appendChild(card);
}

/* ============= ACTUS ============= */
function renderNews(body){
  const card = el("div","card");
  card.appendChild(el("h3",null,"📰 Journal du club"));
  if (!FM.state.news.length) card.appendChild(el("p","hint","Rien à signaler pour l'instant."));
  FM.state.news.forEach(n=> card.appendChild(el("p","news-item",`<small>S${n.saison} J${n.j}</small> ${n.txt}`)));
  body.appendChild(card);

  // Historique
  if (FM.state.historique.length){
    const h = el("div","card");
    h.appendChild(el("h3",null,"📚 Palmarès / historique"));
    FM.state.historique.forEach(s=> h.appendChild(el("p","news-item",
      `Saison ${s.saison} — ${FM.myClub().nom} : ${s.classement}${ord(s.classement)} · Champion : ${s.champion}`)));
    body.appendChild(h);
  }
}

/* ============= HELPERS UI ============= */
function noteClass(n){ return n>=82?"elite":n>=75?"good":n>=68?"ok":"low"; }
function formeIcon(f){ return f>=2?"🔥":f===1?"↗":f===0?"→":f===-1?"↘":"❄"; }
function moralBar(m){ const w=Math.round(m); return `<span class="moral"><span style="width:${w}%"></span></span>`; }
function shortName(n){ const parts=n.split(" "); return parts.length>1?parts[0][0]+". "+parts.slice(1).join(" "):n; }
function cap(s){ return s.charAt(0).toUpperCase()+s.slice(1); }
function toast(msg){
  const t = el("div","toast",msg);
  document.body.appendChild(t);
  setTimeout(()=>t.classList.add("show"),10);
  setTimeout(()=>{ t.classList.remove("show"); setTimeout(()=>t.remove(),300); },2200);
}

/* ============= INIT ============= */
window.addEventListener("DOMContentLoaded", ()=>{
  if (FM.hasSave() && FM.load()) { renderGame(); }
  else renderStart();
});
