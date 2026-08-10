/* ==========================================================================
   NBA My Era — Données statiques (équipes, noms, constantes)
   ========================================================================== */

const CONFS = { EAST: 'Est', WEST: 'Ouest' };

// 30 franchises (noms de villes = pas de marque déposée sur les patronymes de joueurs, générés)
const TEAMS = [
  // --- CONFÉRENCE EST ---
  { id: 'BOS', city: 'Boston',       name: 'Celtics',       conf: 'EAST', div: 'Atlantique', c1: '#007A33', c2: '#BA9653' },
  { id: 'BKN', city: 'Brooklyn',     name: 'Nets',          conf: 'EAST', div: 'Atlantique', c1: '#000000', c2: '#ffffff' },
  { id: 'NYK', city: 'New York',     name: 'Knicks',        conf: 'EAST', div: 'Atlantique', c1: '#006BB6', c2: '#F58426' },
  { id: 'PHI', city: 'Philadelphie', name: 'Sixers',        conf: 'EAST', div: 'Atlantique', c1: '#006BB6', c2: '#ED174C' },
  { id: 'TOR', city: 'Toronto',      name: 'Raptors',       conf: 'EAST', div: 'Atlantique', c1: '#CE1141', c2: '#000000' },

  { id: 'CHI', city: 'Chicago',      name: 'Bulls',         conf: 'EAST', div: 'Centrale',   c1: '#CE1141', c2: '#000000' },
  { id: 'CLE', city: 'Cleveland',    name: 'Cavaliers',     conf: 'EAST', div: 'Centrale',   c1: '#860038', c2: '#FDBB30' },
  { id: 'DET', city: 'Détroit',      name: 'Pistons',       conf: 'EAST', div: 'Centrale',   c1: '#C8102E', c2: '#1D42BA' },
  { id: 'IND', city: 'Indiana',      name: 'Pacers',        conf: 'EAST', div: 'Centrale',   c1: '#002D62', c2: '#FDBB30' },
  { id: 'MIL', city: 'Milwaukee',    name: 'Bucks',         conf: 'EAST', div: 'Centrale',   c1: '#00471B', c2: '#EEE1C6' },

  { id: 'ATL', city: 'Atlanta',      name: 'Hawks',         conf: 'EAST', div: 'Sud-Est',    c1: '#E03A3E', c2: '#26282A' },
  { id: 'CHA', city: 'Charlotte',    name: 'Hornets',       conf: 'EAST', div: 'Sud-Est',    c1: '#1D1160', c2: '#00788C' },
  { id: 'MIA', city: 'Miami',        name: 'Heat',          conf: 'EAST', div: 'Sud-Est',    c1: '#98002E', c2: '#F9A01B' },
  { id: 'ORL', city: 'Orlando',      name: 'Magic',         conf: 'EAST', div: 'Sud-Est',    c1: '#0077C0', c2: '#C4CED4' },
  { id: 'WAS', city: 'Washington',   name: 'Wizards',       conf: 'EAST', div: 'Sud-Est',    c1: '#002B5C', c2: '#E31837' },

  // --- CONFÉRENCE OUEST ---
  { id: 'DEN', city: 'Denver',       name: 'Nuggets',       conf: 'WEST', div: 'Nord-Ouest', c1: '#0E2240', c2: '#FEC524' },
  { id: 'MIN', city: 'Minnesota',    name: 'Timberwolves',  conf: 'WEST', div: 'Nord-Ouest', c1: '#0C2340', c2: '#236192' },
  { id: 'OKC', city: 'Oklahoma City',name: 'Thunder',       conf: 'WEST', div: 'Nord-Ouest', c1: '#007AC1', c2: '#EF3B24' },
  { id: 'POR', city: 'Portland',     name: 'Blazers',       conf: 'WEST', div: 'Nord-Ouest', c1: '#E03A3E', c2: '#000000' },
  { id: 'UTA', city: 'Utah',         name: 'Jazz',          conf: 'WEST', div: 'Nord-Ouest', c1: '#002B5C', c2: '#00471B' },

  { id: 'GSW', city: 'Golden State', name: 'Warriors',      conf: 'WEST', div: 'Pacifique',  c1: '#1D428A', c2: '#FFC72C' },
  { id: 'LAC', city: 'Los Angeles',  name: 'Clippers',      conf: 'WEST', div: 'Pacifique',  c1: '#C8102E', c2: '#1D428A' },
  { id: 'LAL', city: 'Los Angeles',  name: 'Lakers',        conf: 'WEST', div: 'Pacifique',  c1: '#552583', c2: '#FDB927' },
  { id: 'PHX', city: 'Phoenix',      name: 'Suns',          conf: 'WEST', div: 'Pacifique',  c1: '#1D1160', c2: '#E56020' },
  { id: 'SAC', city: 'Sacramento',   name: 'Kings',         conf: 'WEST', div: 'Pacifique',  c1: '#5A2D81', c2: '#63727A' },

  { id: 'DAL', city: 'Dallas',       name: 'Mavericks',     conf: 'WEST', div: 'Sud-Ouest',  c1: '#00538C', c2: '#002B5E' },
  { id: 'HOU', city: 'Houston',      name: 'Rockets',       conf: 'WEST', div: 'Sud-Ouest',  c1: '#CE1141', c2: '#000000' },
  { id: 'MEM', city: 'Memphis',      name: 'Grizzlies',     conf: 'WEST', div: 'Sud-Ouest',  c1: '#5D76A9', c2: '#12173F' },
  { id: 'NOP', city: 'La Nouvelle-Orléans', name: 'Pelicans', conf: 'WEST', div: 'Sud-Ouest', c1: '#0C2340', c2: '#C8102E' },
  { id: 'SAS', city: 'San Antonio',  name: 'Spurs',         conf: 'WEST', div: 'Sud-Ouest',  c1: '#C4CED4', c2: '#000000' },
];

function teamById(id) { return TEAMS.find(t => t.id === id); }

// Pools de noms pour générer des joueurs fictifs plausibles
const FIRST_NAMES = [
  'James','Marcus','DeAndre','Tyrese','Malik','Jordan','Isaiah','Cameron','Trey','Julian',
  'Elijah','Xavier','Darius','Kobe','Jalen','Zion','Ja','Devin','Anthony','Brandon',
  'Kyrie','Damian','Bradley','Donovan','Shai','Terry','Immanuel','RJ','Coby','Jaylen',
  'Deni','Franz','Alperen','Bennedict','Scoot','Chet','Paolo','Keegan','Jabari','Bilal',
  'Amari','Dereck','Onyeka','Naz','Precious','Herbert','Quentin','Cade','Jaden','Ausar',
  'Marcus','Tobias','Nicolas','Rudy','Evan','Killian','Théo','Ousmane','Victor','Bilal',
  'Luka','Nikola','Domantas','Bogdan','Goran','Dario','Vasilije','Deni','Jusuf','Alperen',
  'Giannis','Thanasis','Pascal','Serge','Joel','Clint','Bam','Myles','Jarrett','Robert',
];
const LAST_NAMES = [
  'Carter','Robinson','Thompson','Bryant','Walker','Hayes','Coleman','Foster','Brooks','Reed',
  'Bennett','Morgan','Franklin','Sullivan','Freeman','Newton','Grant','Wallace','Bishop','Stone',
  'Harper','Vaughn','Sawyer','Whitfield','Ellison','Barnes','Dawson','Lambert','Merritt','Nash',
  'Okafor','Adebayo','Mobley','Banchero','Wembanyama','Holmgren','Edwards','Gilgeous','Haliburton','Maxey',
  'Sengun','Markkanen','Sabonis','Doncic','Jokic','Antetokounmpo','Siakam','Embiid','Fox','Booker',
  'Fontaine','Lemaire','Moreau','Dubois','Girard','Rousseau','Blanc','Faure','Perrin','Renaud',
  'Ivanov','Petrovic','Novak','Horvat','Kovac','Marinovic','Radic','Vukovic','Tomic','Zoric',
  'Washington','Jefferson','Jackson','Bradley','Sanders','Powell','Simmons','Bryant','Griffin','Love',
];
