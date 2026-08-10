/* ============================================================
   BASE DE DONNÉES — Équipes européennes & générateur de joueurs
   ============================================================ */

var FM = window.FM || {};
window.FM = FM;

/* ---------- Pools de noms par nationalité ---------- */
const NAMES = {
  FRA: {
    first: ["Lucas","Hugo","Théo","Nathan","Enzo","Léo","Gabriel","Raphaël","Louis","Jules","Adam","Maël","Noah","Ethan","Sacha","Tom","Antoine","Kylian","Ousmane","Aurélien","Marcus","Randal","Ibrahima","Wesley","Bradley"],
    last: ["Martin","Bernard","Dubois","Thomas","Robert","Petit","Durand","Leroy","Moreau","Simon","Laurent","Lefebvre","Michel","Garcia","David","Bertrand","Roux","Fontaine","Girard","Bonnet","Dupont","Lambert","Fernandez","Rousseau","Blanc","Guerin","Muller","Henry","Roussel","Nicolas"]
  },
  ENG: {
    first: ["Harry","Jack","Oliver","George","Jacob","Charlie","Thomas","Oscar","William","James","Henry","Leo","Alfie","Joshua","Freddie","Archie","Ethan","Jude","Phil","Marcus","Bukayo","Declan","Reece","Trent","Mason"],
    last: ["Smith","Jones","Taylor","Brown","Williams","Wilson","Johnson","Davies","Robinson","Wright","Thompson","Evans","Walker","White","Roberts","Green","Hall","Wood","Jackson","Clarke","Kane","Bellingham","Foden","Saka","Rice","Rashford","Sterling","Grealish","Maddison","Stones"]
  },
  ESP: {
    first: ["Pablo","Alejandro","Daniel","David","Adrián","Álvaro","Javier","Sergio","Marcos","Diego","Mario","Carlos","Hugo","Iker","Pau","Gavi","Pedri","Ferran","Dani","Rodri","Marco","Álex","Nico","Ansu","Yeremy"],
    last: ["García","Fernández","González","Rodríguez","López","Martínez","Sánchez","Pérez","Gómez","Ruiz","Díaz","Torres","Ramos","Morales","Ortega","Castillo","Vázquez","Molina","Serrano","Iglesias","Olmo","Fati","Asensio","Isco","Merino"]
  },
  ITA: {
    first: ["Francesco","Alessandro","Lorenzo","Matteo","Andrea","Gabriele","Riccardo","Tommaso","Federico","Davide","Marco","Luca","Nicolò","Giacomo","Simone","Sandro","Gianluigi","Manuel","Bryan","Wilfried","Moise","Giovanni","Nicola","Alessio","Samuele"],
    last: ["Rossi","Russo","Ferrari","Esposito","Bianchi","Romano","Colombo","Ricci","Marino","Greco","Bruno","Gallo","Conti","De Luca","Mancini","Costa","Giordano","Rizzo","Lombardi","Barbieri","Chiesa","Barella","Locatelli","Verratti","Scamacca"]
  },
  GER: {
    first: ["Leon","Luca","Felix","Maximilian","Paul","Elias","Jonas","Ben","Noah","Finn","Luis","Niklas","Julian","Kai","Serge","Jamal","Florian","Joshua","Timo","Leroy","Thomas","Marco","Nico","Robin","David"],
    last: ["Müller","Schmidt","Schneider","Fischer","Weber","Meyer","Wagner","Becker","Schulz","Hoffmann","Koch","Bauer","Richter","Klein","Wolf","Neuer","Kimmich","Goretzka","Wirtz","Havertz","Sané","Gündogan","Rüdiger","Süle","Brandt"]
  },
  POR: {
    first: ["João","Diogo","Rúben","Bruno","Bernardo","Rafael","Gonçalo","André","Tomás","Miguel","Nuno","Vitinha","Otávio","Pedro","Ricardo","Nélson","José","Cristiano","Rúi","Fábio","Gabriel","Danilo","Matheus","Pepe","Trincão"],
    last: ["Silva","Santos","Ferreira","Pereira","Oliveira","Costa","Rodrigues","Martins","Jesus","Sousa","Fernandes","Gonçalves","Gomes","Lopes","Marques","Almeida","Ribeiro","Pinto","Carvalho","Neves","Leão","Cancelo","Dalot","Palhinha","Ramos"]
  },
  BRA: {
    first: ["Gabriel","Lucas","Bruno","Rodrygo","Vinícius","Éder","Antony","Raphinha","Casemiro","Marquinhos","Danilo","Fabinho","Richarlison","Alisson","Ederson","Neymar","Pedro","Endrick","Savinho","Wesley","Douglas","André","João","Matheus","Bento"],
    last: ["Silva","Souza","Santos","Oliveira","Pereira","Lima","Carlos","Costa","Rodrigues","Almeida","Nascimento","Barbosa","Ribeiro","Alves","Ferreira","Jesus","Júnior","Martins","Rocha","Gomes","Vieira","Cardoso","Moraes","Correia","Dias"]
  },
  ARG: {
    first: ["Lionel","Julián","Lautaro","Enzo","Alexis","Rodrigo","Nicolás","Emiliano","Ángel","Cristian","Leandro","Nahuel","Facundo","Gonzalo","Thiago","Alejandro","Exequiel","Giovani","Marcos","Germán","Franco","Valentín","Matías","Lucas","Nicolás"],
    last: ["González","Rodríguez","Martínez","Fernández","López","Díaz","Álvarez","Romero","Sánchez","Torres","Gómez","Paredes","Mac Allister","Molina","Otamendi","Acuña","Palacios","Lo Celso","Correa","Simeone","Dybala","Nico","Garnacho","Foyth","Tagliafico"]
  },
  NED: {
    first: ["Daan","Sem","Luuk","Bram","Lucas","Milan","Levi","Cody","Frenkie","Memphis","Denzel","Nathan","Virgil","Matthijs","Xavi","Ryan","Steven","Wout","Teun","Jurriën","Micky","Tijjani","Quinten","Joey","Noa"],
    last: ["de Jong","van Dijk","Bakker","de Vries","van den Berg","Jansen","Visser","Smit","Meijer","de Boer","Dumfries","Gakpo","Simons","Timber","Reijnders","Malen","Weghorst","Koopmeiners","Depay","Bergwijn","Frimpong","de Ligt","Wijnaldum","Klaassen","Berghuis"]
  },
  BEL: {
    first: ["Kevin","Romelu","Youri","Jérémy","Amadou","Charles","Leandro","Dodi","Arthur","Thomas","Yannick","Timothy","Loïs","Wout","Jan","Axel","Dries","Michy","Hans","Zeno","Maxim","Aster","Roméo","Orel","Johan"],
    last: ["De Bruyne","Lukaku","Tielemans","Doku","Onana","De Ketelaere","Trossard","Lukebakio","Theate","Meunier","Carrasco","Castagne","Openda","Faes","Vertonghen","Witsel","Mertens","Batshuayi","Vanaken","Debast","De Cuyper","Vermeeren","Lavia","Mangala","Bakayoko"]
  }
};

/* ---------- Postes ---------- */
const POSITIONS = ["GB","DC","DG","DD","MDC","MC","MO","AG","AD","BU"];
const POS_GROUP = { GB:"G", DC:"D", DG:"D", DD:"D", MDC:"M", MC:"M", MO:"M", AG:"A", AD:"A", BU:"A" };
const POS_LABEL = {
  GB:"Gardien", DC:"Déf. central", DG:"Latéral gauche", DD:"Latéral droit",
  MDC:"Milieu déf.", MC:"Milieu central", MO:"Milieu off.", AG:"Ailier gauche",
  AD:"Ailier droit", BU:"Buteur"
};

/* ---------- Formations : postes requis ---------- */
const FORMATIONS = {
  "4-4-2":  ["GB","DD","DC","DC","DG","AD","MC","MC","AG","BU","BU"],
  "4-3-3":  ["GB","DD","DC","DC","DG","MDC","MC","MC","AD","BU","AG"],
  "4-2-3-1":["GB","DD","DC","DC","DG","MDC","MDC","AD","MO","AG","BU"],
  "3-5-2":  ["GB","DC","DC","DC","AD","MC","MDC","MC","AG","BU","BU"],
  "5-3-2":  ["GB","DD","DC","DC","DC","DG","MC","MDC","MC","BU","BU"],
  "4-5-1":  ["GB","DD","DC","DC","DG","AD","MC","MDC","MC","AG","BU"]
};

/* ---------- Clubs européens (réels) avec réputation & budget ----------
   rep: 1 (modeste) → 5 (élite continentale) ; budget en M€           */
const LEAGUES = [
  { id:"L1", nom:"Ligue 1", pays:"FRA", clubs:[
    ["Paris SG",5,220],["Marseille",4,90],["Monaco",4,85],["Lille",3,55],
    ["Lyon",3,60],["Nice",3,50],["Rennes",3,48],["Lens",3,45],
    ["Strasbourg",2,28],["Reims",2,25],["Nantes",2,24],["Toulouse",2,26],
    ["Brest",2,22],["Montpellier",2,23],["Le Havre",1,15],["Auxerre",1,14]
  ]},
  { id:"PL", nom:"Premier League", pays:"ENG", clubs:[
    ["Manchester City",5,250],["Arsenal",5,180],["Liverpool",5,190],["Chelsea",4,160],
    ["Manchester Utd",4,150],["Tottenham",4,120],["Newcastle",4,110],["Aston Villa",3,80],
    ["Brighton",3,70],["West Ham",3,72],["Everton",2,40],["Crystal Palace",2,42],
    ["Fulham",2,44],["Brentford",2,38],["Wolves",2,45],["Nottingham",2,36]
  ]},
  { id:"LL", nom:"La Liga", pays:"ESP", clubs:[
    ["Real Madrid",5,240],["Barcelone",5,180],["Atlético",4,130],["Athletic Bilbao",3,55],
    ["Real Sociedad",3,60],["Villarreal",3,58],["Betis",3,50],["Valence",3,48],
    ["Séville",3,52],["Girona",2,35],["Getafe",2,26],["Osasuna",2,24],
    ["Celta Vigo",2,28],["Rayo Vallecano",1,18],["Mallorca",2,22],["Las Palmas",1,16]
  ]},
  { id:"SA", nom:"Serie A", pays:"ITA", clubs:[
    ["Inter",5,170],["Juventus",4,150],["Milan",4,140],["Napoli",4,130],
    ["Roma",4,100],["Atalanta",4,95],["Lazio",3,80],["Fiorentina",3,65],
    ["Bologna",3,55],["Torino",2,40],["Udinese",2,32],["Monza",2,28],
    ["Genoa",2,26],["Lecce",1,18],["Cagliari",1,17],["Empoli",1,16]
  ]},
  { id:"BL", nom:"Bundesliga", pays:"GER", clubs:[
    ["Bayern Munich",5,230],["Leverkusen",5,150],["Dortmund",4,140],["RB Leipzig",4,130],
    ["Stuttgart",3,70],["Francfort",3,68],["Wolfsburg",3,60],["Fribourg",3,50],
    ["Hoffenheim",2,45],["Mönchengladbach",2,44],["Werder Brême",2,38],["Mayence",2,30],
    ["Augsbourg",2,28],["Union Berlin",2,32],["Bochum",1,16],["Heidenheim",1,15]
  ]}
];

/* Répartition des origines par pays du club (probabilités) */
const ORIGIN_MIX = {
  FRA: [["FRA",.55],["POR",.06],["BRA",.06],["ARG",.04],["ESP",.05],["BEL",.05],["NED",.04],["ENG",.03],["ITA",.04],["GER",.04],["ARG",.04]],
  ENG: [["ENG",.50],["BRA",.07],["ARG",.05],["POR",.06],["NED",.06],["BEL",.06],["FRA",.06],["ESP",.05],["ITA",.04],["GER",.05]],
  ESP: [["ESP",.62],["ARG",.08],["BRA",.07],["POR",.05],["FRA",.05],["NED",.03],["ITA",.03],["BEL",.03],["ENG",.02],["GER",.02]],
  ITA: [["ITA",.60],["ARG",.07],["BRA",.06],["FRA",.05],["POR",.04],["NED",.04],["BEL",.04],["ESP",.04],["ENG",.03],["GER",.03]],
  GER: [["GER",.58],["FRA",.06],["NED",.06],["BRA",.05],["ARG",.04],["POR",.04],["BEL",.05],["ESP",.04],["ENG",.04],["ITA",.04]]
};

/* ---------- Générateur pseudo-aléatoire déterministe (seed) ---------- */
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
let RNG = mulberry32(20260810);
FM.setSeed = s => { RNG = mulberry32(s); };
function rnd(){return RNG();}
function ri(min,max){return Math.floor(rnd()*(max-min+1))+min;}
function pick(arr){return arr[Math.floor(rnd()*arr.length)];}
function pickWeighted(pairs){let r=rnd(),s=0;for(const[v,w]of pairs){s+=w;if(r<=s)return v;}return pairs[pairs.length-1][0];}

/* ---------- Génération d'un joueur ---------- */
let PID = 1;
function makePlayer(clubRep, forcedPos, clubCountry){
  const origin = pickWeighted(ORIGIN_MIX[clubCountry] || ORIGIN_MIX.FRA);
  const pool = NAMES[origin] || NAMES.FRA;
  const name = pick(pool.first)+" "+pick(pool.last);
  const pos = forcedPos || pick(POSITIONS);

  // Note globale corrélée à la réputation du club
  const base = 46 + clubRep*7;                       // 53 → 81
  let overall = Math.max(38, Math.min(93, base + ri(-9, 9)));
  const age = ri(17, 35);
  // Jeunes = potentiel plus haut, note actuelle un peu plus basse
  let potential = overall;
  if (age <= 23) { potential = Math.min(94, overall + ri(2, 12)); overall = Math.max(40, overall - ri(0,4)); }
  else if (age >= 31) { overall = Math.max(40, overall - ri(0,3)); potential = overall; }

  const value = playerValue(overall, potential, age);
  const wage = Math.round((value*2.2 + overall*0.3) * 10) / 10;   // k€/semaine approx
  return {
    id: PID++, nom:name, nat:origin, pos, groupe:POS_GROUP[pos],
    age, note:overall, potentiel:potential,
    valeur:value, salaire:wage,
    forme: ri(-2,2), moral: ri(60,90),
    contrat: ri(1,4),
    buts:0, passes:0, matchs:0, transferListe:false
  };
}

function playerValue(ov, pot, age){
  // Courbe exponentielle douce : 60→~1.3M, 70→~6M, 80→~30M, 85→~66M, 90→~150M
  let v = 0.6 * Math.pow(1.17, Math.max(0, ov-55));     // M€
  if (age <= 21) v *= 1.4 + (pot-ov)*0.04;
  else if (age <= 25) v *= 1.2;
  else if (age >= 31) v *= 0.5;
  else if (age >= 29) v *= 0.78;
  return Math.max(0.2, Math.round(v*10)/10);
}
FM.playerValue = playerValue;

/* ---------- Génération d'un effectif équilibré (~22 joueurs) ---------- */
function makeSquad(rep, country){
  const plan = ["GB","GB","DD","DD","DG","DG","DC","DC","DC","DC",
                "MDC","MDC","MC","MC","MC","MO","MO","AD","AG","AD","BU","BU","BU"];
  return plan.map(p => makePlayer(rep, p, country));
}

/* ---------- Construction de la base complète ---------- */
FM.buildDatabase = function(){
  PID = 1;
  const clubs = [];
  let cid = 1;
  for (const lg of LEAGUES){
    for (const [nom, rep, budget] of lg.clubs){
      const squad = makeSquad(rep, lg.pays);
      clubs.push({
        id: cid++, nom, ligue: lg.id, ligueNom: lg.nom, pays: lg.pays,
        rep, budget: budget * (0.15 + rnd()*0.15),   // budget transferts dispo (part du budget total)
        budgetTotal: budget,
        joueurs: squad,
        formation: rep>=4 ? "4-3-3" : "4-4-2",
        tactique: { mentalite:1, tempo:1, pressing:1, largeur:1 }, // 0 bas / 1 moyen / 2 haut
        onze: [], // rempli plus tard
        pts:0, j:0, g:0, n:0, p:0, bp:0, bc:0
      });
    }
  }
  clubs.forEach(c => { c.onze = FM.autoPickXI(c); });
  return { clubs, leagues: LEAGUES };
};

/* Exports internes utiles */
FM.POSITIONS = POSITIONS;
FM.POS_GROUP = POS_GROUP;
FM.POS_LABEL = POS_LABEL;
FM.FORMATIONS = FORMATIONS;
FM.LEAGUES = LEAGUES;
FM._rnd = rnd; FM._ri = ri; FM._pick = pick;
