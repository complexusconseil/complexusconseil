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

// teamById renvoie la métadonnée d'époque active si disponible (LEAGUE), sinon la moderne.
function teamById(id) {
  return (typeof LEAGUE !== 'undefined' && LEAGUE.find(t => t.id === id)) || TEAMS.find(t => t.id === id);
}

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
// Noms d'entraîneurs réels (best-effort) pour le staff technique
const COACH_NAMES = [
  'Erik Spoelstra', 'Steve Kerr', 'Gregg Popovich', 'Tyronn Lue', 'Rick Carlisle', 'Michael Malone',
  'Nick Nurse', 'Taylor Jenkins', 'Jamahl Mosley', 'Willie Green', 'Chris Finch', 'Mark Daigneault',
  'Ime Udoka', 'Joe Mazzulla', 'JJ Redick', 'Billy Donovan', 'Tom Thibodeau', 'Jason Kidd',
  'Quin Snyder', 'Jacque Vaughn', 'Kenny Atkinson', 'Frank Vogel', 'Wes Unseld Jr.', 'J.B. Bickerstaff',
  'Jordi Fernández', 'Charles Lee', 'Mike Brown', 'Doc Rivers', 'Monty Williams', 'Mike Budenholzer',
  'Nate McMillan', 'David Adelman', 'Dwane Casey', 'Terry Stotts', 'Mike D\'Antoni', 'Alvin Gentry',
  'Stan Van Gundy', 'George Karl', 'Lionel Hollins', 'Vinny Del Negro', 'Brian Shaw', 'Luke Walton',
  'David Fizdale', 'Igor Kokoškov', 'Ettore Messina', 'Sam Cassell', 'Adrian Griffin', 'Darko Rajaković',
];

// Entraîneurs principaux réels par époque et par franchise (best-effort) avec
// une « note » reflétant leur standing/talent à l'époque. Sert à nommer le staff
// et à pondérer le coaching de chaque équipe (l'utilisateur reçoit le vrai coach
// de sa franchise, ajustable ensuite via le marché du staff).
const HEAD_COACHES = {
  modern: {
    ATL: { name: 'Quin Snyder', quality: 86 }, BOS: { name: 'Joe Mazzulla', quality: 87 },
    BKN: { name: 'Jordi Fernández', quality: 78 }, CHA: { name: 'Charles Lee', quality: 76 },
    CHI: { name: 'Billy Donovan', quality: 82 }, CLE: { name: 'Kenny Atkinson', quality: 85 },
    DAL: { name: 'Jason Kidd', quality: 85 }, DEN: { name: 'David Adelman', quality: 80 },
    DET: { name: 'J.B. Bickerstaff', quality: 81 }, GSW: { name: 'Steve Kerr', quality: 92 },
    HOU: { name: 'Ime Udoka', quality: 86 }, IND: { name: 'Rick Carlisle', quality: 89 },
    LAC: { name: 'Tyronn Lue', quality: 88 }, LAL: { name: 'JJ Redick', quality: 80 },
    MEM: { name: 'Tuomas Iisalo', quality: 77 }, MIA: { name: 'Erik Spoelstra', quality: 93 },
    MIL: { name: 'Doc Rivers', quality: 84 }, MIN: { name: 'Chris Finch', quality: 86 },
    NOP: { name: 'Willie Green', quality: 79 }, NYK: { name: 'Mike Brown', quality: 84 },
    OKC: { name: 'Mark Daigneault', quality: 91 }, ORL: { name: 'Jamahl Mosley', quality: 83 },
    PHI: { name: 'Nick Nurse', quality: 86 }, PHX: { name: 'Jordan Ott', quality: 76 },
    POR: { name: 'Chauncey Billups', quality: 80 }, SAC: { name: 'Doug Christie', quality: 76 },
    SAS: { name: 'Mitch Johnson', quality: 79 }, TOR: { name: 'Darko Rajaković', quality: 79 },
    UTA: { name: 'Will Hardy', quality: 81 }, WAS: { name: 'Brian Keefe', quality: 74 },
  },
  e1968: {
    BOS: { name: 'Bill Russell', quality: 88 }, PHI: { name: 'Alex Hannum', quality: 91 },
    LAL: { name: 'Butch van Breda Kolff', quality: 83 }, NYK: { name: 'Red Holzman', quality: 90 },
    DET: { name: 'Donnie Butcher', quality: 75 }, ATL: { name: 'Richie Guerin', quality: 85 },
    GSW: { name: 'Bill Sharman', quality: 89 }, SAC: { name: 'Ed Jucker', quality: 79 },
    CHI: { name: 'Johnny Kerr', quality: 80 }, OKC: { name: 'Al Bianchi', quality: 76 },
  },
  e1986: {
    BOS: { name: 'K.C. Jones', quality: 88 }, LAL: { name: 'Pat Riley', quality: 93 },
    PHI: { name: 'Matt Guokas', quality: 78 }, MIL: { name: 'Don Nelson', quality: 90 },
    HOU: { name: 'Bill Fitch', quality: 86 }, DET: { name: 'Chuck Daly', quality: 89 },
    ATL: { name: 'Mike Fratello', quality: 85 }, DAL: { name: 'Dick Motta', quality: 84 },
    POR: { name: 'Jack Ramsay', quality: 89 }, DEN: { name: 'Doug Moe', quality: 85 },
    UTA: { name: 'Frank Layden', quality: 82 }, PHX: { name: 'John MacLeod', quality: 82 },
    CHI: { name: 'Stan Albeck', quality: 78 }, NYK: { name: 'Hubie Brown', quality: 85 },
    WAS: { name: 'Gene Shue', quality: 80 }, BKN: { name: 'Dave Wohl', quality: 75 },
  },
  e1996: {
    CHI: { name: 'Phil Jackson', quality: 95 }, OKC: { name: 'George Karl', quality: 88 },
    ORL: { name: 'Brian Hill', quality: 80 }, HOU: { name: 'Rudy Tomjanovich', quality: 89 },
    SAS: { name: 'Bob Hill', quality: 78 }, UTA: { name: 'Jerry Sloan', quality: 92 },
    LAL: { name: 'Del Harris', quality: 80 }, NYK: { name: 'Don Nelson', quality: 88 },
    IND: { name: 'Larry Brown', quality: 90 }, PHX: { name: 'Cotton Fitzsimmons', quality: 79 },
    POR: { name: 'P.J. Carlesimo', quality: 82 }, PHI: { name: 'John Lucas', quality: 74 },
    DET: { name: 'Doug Collins', quality: 84 }, MIA: { name: 'Pat Riley', quality: 93 },
    ATL: { name: 'Lenny Wilkens', quality: 90 }, DAL: { name: 'Dick Motta', quality: 79 },
  },
  e2016: {
    GSW: { name: 'Steve Kerr', quality: 94 }, CLE: { name: 'Tyronn Lue', quality: 80 },
    SAS: { name: 'Gregg Popovich', quality: 96 }, OKC: { name: 'Billy Donovan', quality: 83 },
    TOR: { name: 'Dwane Casey', quality: 85 }, LAC: { name: 'Doc Rivers', quality: 87 },
    MIA: { name: 'Erik Spoelstra', quality: 90 }, BOS: { name: 'Brad Stevens', quality: 86 },
    ATL: { name: 'Mike Budenholzer', quality: 88 }, HOU: { name: 'J.B. Bickerstaff', quality: 74 },
    POR: { name: 'Terry Stotts', quality: 84 }, IND: { name: 'Frank Vogel', quality: 84 },
    DAL: { name: 'Rick Carlisle', quality: 89 }, MEM: { name: 'Dave Joerger', quality: 82 },
    WAS: { name: 'Randy Wittman', quality: 76 }, NOP: { name: 'Alvin Gentry', quality: 80 },
  },
  euro: {
    RMA: { name: 'Chus Mateo', quality: 85 }, FCB: { name: 'Joan Peñarroya', quality: 80 },
    PAN: { name: 'Ergin Ataman', quality: 91 }, OLY: { name: 'Georgios Bartzokas', quality: 88 },
    FEN: { name: 'Šarūnas Jasikevičius', quality: 88 }, EFS: { name: 'Igor Kokoškov', quality: 80 },
    MIL: { name: 'Ettore Messina', quality: 86 }, VIR: { name: 'Duško Ivanović', quality: 82 },
    MON: { name: 'Vassilis Spanoulis', quality: 85 }, ASV: { name: 'Guillaume Vizade', quality: 74 },
    BAY: { name: 'Gordon Herbert', quality: 83 }, ZAL: { name: 'Andrea Trinchieri', quality: 83 },
    PAR: { name: 'Željko Obradović', quality: 93 }, RED: { name: 'Saša Obradović', quality: 82 },
    MAC: { name: 'Oded Kattash', quality: 80 }, BAS: { name: 'Paolo Galbiati', quality: 76 },
  },
};

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
