/* ============================================================
   CARRIÈRE — état du jeu, calendrier, classement, mercato, sauvegarde
   ============================================================ */
var FM = window.FM;
var SAVE_KEY = "fm_carriere_save_v1";

FM.state = null;

/* ---------- Nouvelle partie ---------- */
FM.newGame = function(managerName, clubId, seed){
  FM.setSeed(seed || 20260810);
  const db = FM.buildDatabase();
  const club = db.clubs.find(c => c.id === clubId);
  const ligue = club.ligue;
  const clubsLigue = db.clubs.filter(c => c.ligue === ligue);

  FM.state = {
    db,
    managedClubId: clubId,
    managerName: managerName || "Manager",
    ligueJoueur: ligue,
    saison: 1,
    journee: 0,
    calendrier: FM.makeSchedule(clubsLigue.map(c=>c.id)),
    resultats: [],
    news: [],
    offres: [],          // offres reçues pour nos joueurs listés
    historique: [],
    objectif: objectifFor(club)
  };
  addNews(`Bienvenue ${FM.state.managerName} ! Vous prenez les rênes de ${club.nom}. Objectif : ${FM.state.objectif}.`);
  FM.save();
  return FM.state;
};

function objectifFor(club){
  if (club.rep >= 5) return "remporter le titre";
  if (club.rep === 4) return "terminer sur le podium";
  if (club.rep === 3) return "accrocher une place européenne (top 6)";
  if (club.rep === 2) return "atteindre le milieu de tableau";
  return "assurer le maintien";
}

/* ---------- Calendrier aller-retour (méthode du cercle) ---------- */
FM.makeSchedule = function(ids){
  let teams = ids.slice();
  if (teams.length % 2) teams.push(null); // bye
  const n = teams.length;
  const rounds = [];
  const arr = teams.slice();
  for (let r=0; r<n-1; r++){
    const day = [];
    for (let i=0;i<n/2;i++){
      const a = arr[i], b = arr[n-1-i];
      if (a!=null && b!=null){
        // alterner domicile/extérieur
        day.push(r%2===0 ? {dom:a, ext:b} : {dom:b, ext:a});
      }
    }
    rounds.push(day);
    // rotation (fixer le premier)
    arr.splice(1,0,arr.pop());
  }
  // Retour = inversion domicile/extérieur
  const retour = rounds.map(day => day.map(m => ({dom:m.ext, ext:m.dom})));
  return rounds.concat(retour);
};

/* ---------- Accès pratiques ---------- */
FM.myClub = () => FM.state.db.clubs.find(c => c.id === FM.state.managedClubId);
FM.clubById = id => FM.state.db.clubs.find(c => c.id === id);
FM.clubsInMyLeague = () => FM.state.db.clubs.filter(c => c.ligue === FM.state.ligueJoueur);
FM.totalMatchdays = () => FM.state.calendrier.length;

/* ---------- Classement ---------- */
FM.table = function(ligueId){
  ligueId = ligueId || FM.state.ligueJoueur;
  const clubs = FM.state.db.clubs.filter(c => c.ligue === ligueId).slice();
  clubs.sort((a,b)=>
    b.pts-a.pts || (b.bp-b.bc)-(a.bp-a.bc) || b.bp-a.bp || a.nom.localeCompare(b.nom));
  return clubs;
};
FM.myRank = function(){
  const t = FM.table();
  return t.findIndex(c => c.id === FM.state.managedClubId) + 1;
};

/* ---------- Prochain match du club géré ---------- */
FM.nextFixture = function(){
  const jd = FM.state.calendrier[FM.state.journee];
  if (!jd) return null;
  return jd.find(m => m.dom===FM.state.managedClubId || m.ext===FM.state.managedClubId) || null;
};

/* ---------- Jouer une journée complète ---------- */
FM.playMatchday = function(){
  if (FM.state.journee >= FM.totalMatchdays()) return null;
  const jd = FM.state.calendrier[FM.state.journee];
  const dayResults = [];
  let myResult = null;

  for (const m of jd){
    const dom = FM.clubById(m.dom), ext = FM.clubById(m.ext);
    // L'IA reconstruit son onze (le club du joueur garde son onze choisi)
    if (dom.id !== FM.state.managedClubId) dom.onze = FM.autoPickXI(dom);
    if (ext.id !== FM.state.managedClubId) ext.onze = FM.autoPickXI(ext);

    const res = FM.simulateMatch(dom, ext);
    applyResult(dom, ext, res);
    accumulateStats(dom, ext, res);
    const r = { dom:dom.id, ext:ext.id, ds:res.domScore, es:res.extScore, events:res.events };
    dayResults.push(r);
    if (dom.id===FM.state.managedClubId || ext.id===FM.state.managedClubId) myResult = r;
  }

  FM.state.resultats[FM.state.journee] = dayResults;
  FM.state.journee++;

  postMatchdayUpdates(myResult);
  FM.save();
  return { dayResults, myResult };
};

function applyResult(dom, ext, res){
  dom.j++; ext.j++;
  dom.bp+=res.domScore; dom.bc+=res.extScore;
  ext.bp+=res.extScore; ext.bc+=res.domScore;
  if (res.domScore>res.extScore){ dom.g++; ext.p++; dom.pts+=3; }
  else if (res.domScore<res.extScore){ ext.g++; dom.p++; ext.pts+=3; }
  else { dom.n++; ext.n++; dom.pts++; ext.pts++; }
}

function accumulateStats(dom, ext, res){
  for (const c of [dom, ext]) for (const s of c.onze){
    const p = FM.getPlayer(c, s.id); if (p) p.matchs++;
  }
  for (const e of res.events){
    const c = FM.clubById(e.clubId);
    const p = FM.getPlayer(c, e.joueurId);
    if (p) p.buts++;
  }
}

/* Mises à jour post-journée : forme, moral, mercato IA, actualités */
function postMatchdayUpdates(myResult){
  // Forme/moral légère variation sur tous les joueurs
  for (const c of FM.state.db.clubs){
    for (const p of c.joueurs){
      p.forme = Math.max(-3, Math.min(3, p.forme + FM._ri(-1,1)));
    }
  }
  // Moral du club joueur selon résultat
  if (myResult){
    const my = FM.myClub();
    const gagne = (myResult.dom===my.id && myResult.ds>myResult.es) || (myResult.ext===my.id && myResult.es>myResult.ds);
    const nul   = myResult.ds===myResult.es;
    const delta = gagne?4:(nul?0:-4);
    for (const s of my.onze){ const p=FM.getPlayer(my,s.id); if(p) p.moral=Math.max(30,Math.min(99,p.moral+delta)); }
    const adv = FM.clubById(myResult.dom===my.id?myResult.ext:myResult.dom);
    const s = myResult.dom===my.id ? `${myResult.ds}-${myResult.es}` : `${myResult.es}-${myResult.ds}`;
    addNews(`J${FM.state.journee} — ${my.nom} ${gagne?"s'impose":(nul?"fait match nul":"s'incline")} ${s} face à ${adv.nom}.`);
  }
  // Mercato IA : offres pour nos joueurs listés
  generateAIOffers();
}

/* ---------- MERCATO ---------- */
FM.transferMarket = function(filter={}){
  const my = FM.myClub();
  let list = [];
  for (const c of FM.state.db.clubs){
    if (c.id === my.id) continue;
    for (const p of c.joueurs){
      list.push({ ...p, clubId:c.id, clubNom:c.nom, dispo: p.transferListe });
    }
  }
  if (filter.poste) list = list.filter(p=>p.groupe===filter.poste);
  if (filter.noteMin) list = list.filter(p=>p.note>=filter.noteMin);
  if (filter.ageMax) list = list.filter(p=>p.age<=filter.ageMax);
  if (filter.valeurMax) list = list.filter(p=>p.valeur<=filter.valeurMax);
  if (filter.q){ const q=filter.q.toLowerCase(); list=list.filter(p=>p.nom.toLowerCase().includes(q)); }
  list.sort((a,b)=>b.note-a.note);
  return list.slice(0, filter.limit || 120);
};

/* Acheter : renvoie {ok, msg} */
FM.buyPlayer = function(playerId, offreM){
  const my = FM.myClub();
  let seller=null, player=null;
  for (const c of FM.state.db.clubs){
    if (c.id===my.id) continue;
    const p = c.joueurs.find(x=>x.id===playerId);
    if (p){ seller=c; player=p; break; }
  }
  if (!player) return { ok:false, msg:"Joueur introuvable." };
  if (my.joueurs.length >= 30) return { ok:false, msg:"Effectif complet (30 max). Vendez d'abord." };
  if (offreM > my.budget) return { ok:false, msg:`Budget insuffisant (${my.budget.toFixed(1)} M€ dispo).` };

  // Le club vendeur accepte-t-il ?
  const seuil = player.valeur * (player.transferListe ? 0.9 : (1.15 + seller.rep*0.06));
  if (offreM < seuil){
    return { ok:false, msg:`${seller.nom} refuse. Il faut environ ${seuil.toFixed(1)} M€ pour ${player.nom}.` };
  }
  // Transfert accepté
  seller.joueurs = seller.joueurs.filter(p=>p.id!==playerId);
  seller.budget += offreM * 0.9;
  seller.onze = FM.autoPickXI(seller);
  my.budget -= offreM;
  player.transferListe = false;
  player.moral = Math.min(99, player.moral+8);
  my.joueurs.push(player);
  my.onze = FM.autoPickXI(my);
  addNews(`✅ Recrutement : ${player.nom} (${player.note}, ${FM.POS_LABEL[player.pos]}) rejoint ${my.nom} pour ${offreM.toFixed(1)} M€.`);
  FM.save();
  return { ok:true, msg:`${player.nom} signe pour ${offreM.toFixed(1)} M€ !` };
};

/* Lister / retirer de la liste des transferts */
FM.toggleTransferList = function(playerId){
  const my = FM.myClub();
  const p = my.joueurs.find(x=>x.id===playerId);
  if (!p) return;
  p.transferListe = !p.transferListe;
  FM.save();
};

/* Vendre directement à un prix (offre immédiate d'un club IA) */
FM.acceptOffer = function(offreIndex){
  const o = FM.state.offres[offreIndex];
  if (!o) return { ok:false, msg:"Offre expirée." };
  const my = FM.myClub();
  const p = my.joueurs.find(x=>x.id===o.joueurId);
  if (!p) return { ok:false, msg:"Joueur déjà parti." };
  if (my.joueurs.length <= 16) return { ok:false, msg:"Effectif trop court (16 min)." };
  const buyer = FM.clubById(o.clubId);
  my.joueurs = my.joueurs.filter(x=>x.id!==p.id);
  my.budget += o.montant;
  my.onze = FM.autoPickXI(my);
  p.transferListe = false;
  buyer.joueurs.push(p);
  buyer.onze = FM.autoPickXI(buyer);
  addNews(`💰 Vente : ${p.nom} rejoint ${buyer.nom} pour ${o.montant.toFixed(1)} M€.`);
  FM.state.offres.splice(offreIndex,1);
  FM.save();
  return { ok:true, msg:`${p.nom} vendu pour ${o.montant.toFixed(1)} M€.` };
};
FM.rejectOffer = function(i){ FM.state.offres.splice(i,1); FM.save(); };

function generateAIOffers(){
  const my = FM.myClub();
  const listed = my.joueurs.filter(p=>p.transferListe);
  for (const p of listed){
    if (FM._rnd() < 0.45){
      // Un club IA plausible fait une offre
      const buyers = FM.state.db.clubs.filter(c=>c.id!==my.id && c.budget > p.valeur*0.8);
      if (!buyers.length) continue;
      const buyer = buyers[FM._ri(0,buyers.length-1)];
      const montant = Math.round(p.valeur*(0.85+FM._rnd()*0.4)*10)/10;
      if (buyer.budget >= montant && !FM.state.offres.some(o=>o.joueurId===p.id)){
        FM.state.offres.push({ joueurId:p.id, joueurNom:p.nom, clubId:buyer.id, clubNom:buyer.nom, montant });
        addNews(`📩 ${buyer.nom} propose ${montant.toFixed(1)} M€ pour ${p.nom}.`);
      }
    }
  }
}

/* ---------- Tactique / formation ---------- */
FM.setFormation = function(f){
  const my = FM.myClub();
  my.formation = f;
  my.onze = FM.autoPickXI(my);
  FM.save();
};
FM.setTactic = function(key, val){
  const my = FM.myClub();
  my.tactique[key] = val;
  FM.save();
};
FM.setStarter = function(slotIndex, playerId){
  const my = FM.myClub();
  // retire le joueur de tout autre slot
  my.onze.forEach(s=>{ if(s.id===playerId) s.id=null; });
  my.onze[slotIndex].id = playerId;
  FM.save();
};

/* ---------- Fin de saison ---------- */
FM.isSeasonOver = () => FM.state.journee >= FM.totalMatchdays();

FM.endSeason = function(){
  const t = FM.table();
  const rank = t.findIndex(c=>c.id===FM.state.managedClubId)+1;
  const champ = t[0];
  FM.state.historique.push({
    saison: FM.state.saison,
    classement: rank,
    champion: champ.nom,
    pts: FM.myClub().pts
  });
  addNews(`🏁 Fin de saison ${FM.state.saison} : ${champ.nom} champion. ${FM.myClub().nom} termine ${rank}${rank===1?"er":"e"}.`);

  // Nouvelle saison : reset tables, vieillissement, budget
  const my = FM.myClub();
  const bonus = rank<=3 ? 30 : rank<=6 ? 15 : rank<=10 ? 5 : 0;
  for (const c of FM.state.db.clubs){
    c.pts=c.j=c.g=c.n=c.p=c.bp=c.bc=0;
    c.budget += c.budgetTotal*0.12 + (c===my?bonus:0);
    for (const p of c.joueurs){
      p.age++; p.matchs=0; p.buts=0;
      // progression / déclin
      if (p.age<=23 && p.note<p.potentiel) p.note=Math.min(p.potentiel,p.note+FM._ri(0,3));
      else if (p.age>=31) p.note=Math.max(40,p.note-FM._ri(0,2));
      p.valeur = FM.playerValue(p.note, p.potentiel, p.age);
      p.contrat = Math.max(0, p.contrat-1);
    }
    c.onze = FM.autoPickXI(c);
  }
  FM.state.saison++;
  FM.state.journee=0;
  FM.state.resultats=[];
  FM.state.offres=[];
  FM.state.calendrier = FM.makeSchedule(FM.clubsInMyLeague().map(c=>c.id));
  addNews(`Saison ${FM.state.saison} : nouvel objectif — ${FM.state.objectif}. Budget mercato : ${my.budget.toFixed(1)} M€.`);
  FM.save();
};

/* ---------- Actualités ---------- */
function addNews(txt){ FM.state.news.unshift({ txt, saison:FM.state.saison, j:FM.state.journee }); if(FM.state.news.length>60) FM.state.news.pop(); }
FM.addNews = addNews;

/* ---------- Sauvegarde locale ---------- */
FM.save = function(){
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(FM.state)); } catch(e){ console.warn("save fail", e); }
};
FM.load = function(){
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return false;
  try { FM.state = JSON.parse(raw); return true; } catch(e){ return false; }
};
FM.hasSave = () => !!localStorage.getItem(SAVE_KEY);
FM.deleteSave = function(){ localStorage.removeItem(SAVE_KEY); FM.state=null; };
