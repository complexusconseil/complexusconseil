/* ==========================================================================
   NBA My Era — Mode Europe : clubs (EuroLeague) + sélections nationales
   --------------------------------------------------------------------------
   ⚠️ BEST-EFFORT : rosters de stars européens/nationaux (~7 joueurs), notes
   indicatives. Le championnat de club représente à la fois les championnats
   domestiques et la compétition continentale (EuroLeague). Les compétitions de
   sélections (EuroBasket, Coupe du Monde, Jeux Olympiques) sont des tournois
   à élimination directe jouables depuis l'onglet Histoire → International.
   ========================================================================== */

/* -------------------- Clubs européens (era « euro ») ------------------- */
const EURO_META = {
  RMA: { city: 'Madrid', name: 'Real Madrid', c1: '#ffffff', c2: '#febe10' },
  FCB: { city: 'Barcelone', name: 'Barça', c1: '#154284', c2: '#a50044' },
  PAN: { city: 'Athènes', name: 'Panathinaïkos', c1: '#0a5b34', c2: '#ffffff' },
  OLY: { city: 'Le Pirée', name: 'Olympiakos', c1: '#c8102e', c2: '#ffffff' },
  FEN: { city: 'Istanbul', name: 'Fenerbahçe', c1: '#1a3a6b', c2: '#ffed00' },
  EFS: { city: 'Istanbul', name: 'Anadolu Efes', c1: '#0033a0', c2: '#e4002b' },
  MIL: { city: 'Milan', name: 'Olimpia Milano', c1: '#c8102e', c2: '#ffffff' },
  VIR: { city: 'Bologne', name: 'Virtus Bologna', c1: '#000000', c2: '#ffffff' },
  MON: { city: 'Monaco', name: 'AS Monaco', c1: '#c8102e', c2: '#ffffff' },
  ASV: { city: 'Villeurbanne', name: 'LDLC ASVEL', c1: '#c8102e', c2: '#000000' },
  BAY: { city: 'Munich', name: 'Bayern', c1: '#c8102e', c2: '#0066b2' },
  ZAL: { city: 'Kaunas', name: 'Žalgiris', c1: '#0a5b34', c2: '#ffffff' },
  PAR: { city: 'Belgrade', name: 'Partizan', c1: '#000000', c2: '#ffffff' },
  RED: { city: 'Belgrade', name: 'Crvena zvezda', c1: '#c8102e', c2: '#ffffff' },
  MAC: { city: 'Tel-Aviv', name: 'Maccabi', c1: '#f4d03f', c2: '#1a3a6b' },
  BAS: { city: 'Vitoria', name: 'Baskonia', c1: '#0033a0', c2: '#e4002b' },
};
const EURO_ROSTERS = {
  RMA: [ { n: 'Facundo Campazzo', pos: 'PG', ovr: 84, age: 34 }, { n: 'Mario Hezonja', pos: 'SF', ovr: 83, age: 30 },
    { n: 'Walter Tavares', pos: 'C', ovr: 84, age: 33 }, { n: 'Dzanan Musa', pos: 'SG', ovr: 82, age: 26 },
    { n: 'Gabriel Deck', pos: 'PF', ovr: 81, age: 30 }, { n: 'Sergio Llull', pos: 'SG', ovr: 76, age: 38 },
    { n: 'Rudy Fernández', pos: 'SG', ovr: 73, age: 40 }, { n: 'Andrés Feliz', pos: 'PG', ovr: 76, age: 27 } ],
  FCB: [ { n: 'Tomas Satoransky', pos: 'PG', ovr: 82, age: 33 }, { n: 'Jabari Parker', pos: 'PF', ovr: 82, age: 30 },
    { n: 'Kevin Punter', pos: 'SG', ovr: 83, age: 32 }, { n: 'Willy Hernangómez', pos: 'C', ovr: 82, age: 31 },
    { n: 'Nicolás Laprovittola', pos: 'PG', ovr: 80, age: 35 }, { n: 'Jan Vesely', pos: 'C', ovr: 80, age: 32 },
    { n: 'Nikola Kalinić', pos: 'SF', ovr: 78, age: 34 }, { n: 'Álex Abrines', pos: 'SG', ovr: 76, age: 31 } ],
  PAN: [ { n: 'Kostas Sloukas', pos: 'PG', ovr: 84, age: 35 }, { n: 'Kendrick Nunn', pos: 'SG', ovr: 86, age: 30 },
    { n: 'Mathias Lessort', pos: 'C', ovr: 84, age: 30 }, { n: 'Juancho Hernangómez', pos: 'PF', ovr: 80, age: 30 },
    { n: 'Jerian Grant', pos: 'PG', ovr: 79, age: 32 }, { n: 'Marius Grigonis', pos: 'SF', ovr: 78, age: 31 },
    { n: 'Luca Vildoza', pos: 'PG', ovr: 78, age: 30 } ],
  OLY: [ { n: 'Sasha Vezenkov', pos: 'PF', ovr: 85, age: 30 }, { n: 'Thomas Walkup', pos: 'SG', ovr: 81, age: 33 },
    { n: 'Nikola Milutinov', pos: 'C', ovr: 83, age: 31 }, { n: 'Kostas Papanikolaou', pos: 'SF', ovr: 79, age: 35 },
    { n: 'Shaquielle McKissic', pos: 'SG', ovr: 80, age: 33 }, { n: 'Moustapha Fall', pos: 'C', ovr: 79, age: 33 },
    { n: 'Evan Fournier', pos: 'SG', ovr: 80, age: 33 } ],
  FEN: [ { n: 'Scottie Wilbekin', pos: 'PG', ovr: 83, age: 32 }, { n: 'Nigel Hayes-Davis', pos: 'PF', ovr: 84, age: 30 },
    { n: 'Marko Gudurić', pos: 'SG', ovr: 81, age: 30 }, { n: 'Nick Calathes', pos: 'PG', ovr: 80, age: 36 },
    { n: 'Devon Hall', pos: 'SG', ovr: 78, age: 30 }, { n: 'Johnathan Motley', pos: 'C', ovr: 80, age: 30 },
    { n: 'Tarik Biberović', pos: 'SF', ovr: 76, age: 24 } ],
  EFS: [ { n: 'Shane Larkin', pos: 'PG', ovr: 84, age: 33 }, { n: 'Isaïa Cordinier', pos: 'SG', ovr: 81, age: 29 },
    { n: 'Rodrigue Beaubois', pos: 'PG', ovr: 79, age: 37 }, { n: 'Elijah Bryant', pos: 'SG', ovr: 79, age: 30 },
    { n: 'Vincent Poirier', pos: 'C', ovr: 79, age: 32 }, { n: 'Ercan Osmani', pos: 'PF', ovr: 76, age: 25 },
    { n: 'Dan Oturu', pos: 'C', ovr: 77, age: 26 } ],
  MIL: [ { n: 'Nikola Mirotić', pos: 'PF', ovr: 85, age: 34 }, { n: 'Shavon Shields', pos: 'SF', ovr: 82, age: 31 },
    { n: 'Zach LeDay', pos: 'C', ovr: 81, age: 31 }, { n: 'Nicolò Melli', pos: 'PF', ovr: 79, age: 34 },
    { n: 'Billy Baron', pos: 'PG', ovr: 79, age: 35 }, { n: 'Armoni Brooks', pos: 'SG', ovr: 78, age: 27 },
    { n: 'Josh Nebo', pos: 'C', ovr: 78, age: 28 } ],
  VIR: [ { n: 'Toko Shengelia', pos: 'PF', ovr: 84, age: 33 }, { n: 'Marco Belinelli', pos: 'SG', ovr: 78, age: 39 },
    { n: 'Daniel Hackett', pos: 'PG', ovr: 78, age: 37 }, { n: 'Achille Polonara', pos: 'PF', ovr: 78, age: 33 },
    { n: 'Iffe Lundberg', pos: 'SG', ovr: 79, age: 30 }, { n: 'Ante Žižić', pos: 'C', ovr: 80, age: 28 },
    { n: 'Will Clyburn', pos: 'SF', ovr: 80, age: 35 } ],
  MON: [ { n: 'Mike James', pos: 'PG', ovr: 87, age: 35 }, { n: 'Elie Okobo', pos: 'PG', ovr: 82, age: 27 },
    { n: 'Alpha Diallo', pos: 'SF', ovr: 80, age: 28 }, { n: 'Jordan Loyd', pos: 'SG', ovr: 81, age: 31 },
    { n: 'Donatas Motiejūnas', pos: 'C', ovr: 80, age: 34 }, { n: 'Matthew Strazel', pos: 'PG', ovr: 78, age: 23 },
    { n: 'Kemba Walker', pos: 'PG', ovr: 78, age: 35 } ],
  ASV: [ { n: 'Nando de Colo', pos: 'SG', ovr: 82, age: 38 }, { n: 'Joffrey Lauvergne', pos: 'C', ovr: 78, age: 33 },
    { n: 'Paris Lee', pos: 'PG', ovr: 78, age: 30 }, { n: 'David Lighty', pos: 'SF', ovr: 74, age: 37 },
    { n: 'Néal Sako', pos: 'C', ovr: 74, age: 26 }, { n: 'Mbaye Ndiaye', pos: 'PF', ovr: 72, age: 22 },
    { n: 'Shaquille Harrison', pos: 'SG', ovr: 77, age: 31 } ],
  BAY: [ { n: 'Carsen Edwards', pos: 'PG', ovr: 83, age: 27 }, { n: 'Vladimir Lučić', pos: 'SF', ovr: 80, age: 35 },
    { n: 'Nick Weiler-Babb', pos: 'SG', ovr: 79, age: 29 }, { n: 'Andreas Obst', pos: 'SG', ovr: 80, age: 29 },
    { n: 'Devin Booker', pos: 'PF', ovr: 79, age: 33 }, { n: 'Serhii Gladyr', pos: 'PG', ovr: 73, age: 35 },
    { n: 'Xavier Rathan-Mayes', pos: 'PG', ovr: 77, age: 30 } ],
  ZAL: [ { n: 'Sylvain Francisco', pos: 'PG', ovr: 82, age: 27 }, { n: 'Ignas Brazdeikis', pos: 'SF', ovr: 81, age: 26 },
    { n: 'Keenan Evans', pos: 'SG', ovr: 80, age: 29 }, { n: 'Edgaras Ulanovas', pos: 'SF', ovr: 76, age: 33 },
    { n: 'Laurynas Birutis', pos: 'C', ovr: 77, age: 27 }, { n: 'Deividas Sirvydis', pos: 'SF', ovr: 75, age: 25 },
    { n: 'Nigel Williams-Goss', pos: 'PG', ovr: 78, age: 30 } ],
  PAR: [ { n: 'Carlik Jones', pos: 'PG', ovr: 83, age: 27 }, { n: 'Sterling Brown', pos: 'SG', ovr: 80, age: 30 },
    { n: 'Bruno Caboclo', pos: 'PF', ovr: 80, age: 30 }, { n: 'Frank Ntilikina', pos: 'PG', ovr: 78, age: 27 },
    { n: 'Aleksa Avramović', pos: 'SG', ovr: 79, age: 30 }, { n: 'Tyrique Jones', pos: 'C', ovr: 78, age: 28 },
    { n: 'Isaac Bonga', pos: 'SF', ovr: 77, age: 26 } ],
  RED: [ { n: 'Shabazz Napier', pos: 'PG', ovr: 82, age: 33 }, { n: 'Codi Miller-McIntyre', pos: 'PG', ovr: 80, age: 30 },
    { n: 'Filip Petrušev', pos: 'C', ovr: 81, age: 25 }, { n: 'Ognjen Dobrić', pos: 'SF', ovr: 77, age: 30 },
    { n: 'Nemanja Nedović', pos: 'SG', ovr: 78, age: 34 }, { n: 'Joel Bolomboy', pos: 'PF', ovr: 78, age: 31 },
    { n: 'Isaiah Canaan', pos: 'PG', ovr: 77, age: 34 } ],
  MAC: [ { n: 'Lorenzo Brown', pos: 'PG', ovr: 83, age: 35 }, { n: 'Wade Baldwin', pos: 'PG', ovr: 81, age: 29 },
    { n: 'Josh Nebo', pos: 'C', ovr: 0, age: 0 }, { n: 'Bonzie Colson', pos: 'PF', ovr: 80, age: 29 },
    { n: 'Roman Sorkin', pos: 'C', ovr: 76, age: 28 }, { n: 'Tamir Blatt', pos: 'PG', ovr: 74, age: 27 },
    { n: 'Jasiel Rivero', pos: 'PF', ovr: 76, age: 31 }, { n: 'Marcio Santos', pos: 'C', ovr: 74, age: 25 } ],
  BAS: [ { n: 'Markus Howard', pos: 'PG', ovr: 83, age: 26 }, { n: 'Chima Moneke', pos: 'PF', ovr: 81, age: 29 },
    { n: 'Tadas Sedekerskis', pos: 'PF', ovr: 78, age: 26 }, { n: 'Rokas Giedraitis', pos: 'SF', ovr: 77, age: 33 },
    { n: 'Trent Forrest', pos: 'PG', ovr: 78, age: 27 }, { n: 'Kobi Simmons', pos: 'SG', ovr: 76, age: 28 },
    { n: 'Khalifa Diop', pos: 'C', ovr: 75, age: 23 } ],
};
// corrige un doublon (Josh Nebo est à Milan) : on remplace côté Maccabi
EURO_ROSTERS.MAC = EURO_ROSTERS.MAC.filter(p => p.ovr > 0);

// Enregistre l'époque « euro » (mutation des tables d'époques définies dans eras.js)
if (typeof ERAS !== 'undefined') {
  ERAS.euro = {
    name: 'Europe — EuroLeague (clubs)', year: 2025,
    teams: Object.keys(EURO_META),
    rules: { threePA: 0.85, pace: 0.90, fgAdj: -0.005, confMode: 'single', note: 'Basket européen : rythme plus posé, jeu collectif.' },
  };
  ERA_TEAM_META.euro = EURO_META;
  ERA_ROSTERS.euro = EURO_ROSTERS;
}

/* -------------------- Sélections nationales & tournois ----------------- */
const NATIONS = {
  USA: { name: 'États-Unis', flag: '🇺🇸', c1: '#0a3161', c2: '#b31942', players: [
    { n: 'LeBron James', pos: 'SF', ovr: 93 }, { n: 'Stephen Curry', pos: 'PG', ovr: 93 }, { n: 'Kevin Durant', pos: 'SF', ovr: 92 },
    { n: 'Anthony Edwards', pos: 'SG', ovr: 92 }, { n: 'Anthony Davis', pos: 'C', ovr: 91 }, { n: 'Jayson Tatum', pos: 'PF', ovr: 92 },
    { n: 'Devin Booker', pos: 'SG', ovr: 89 }, { n: 'Bam Adebayo', pos: 'C', ovr: 86 }, { n: 'Jrue Holiday', pos: 'PG', ovr: 84 } ] },
  FRA: { name: 'France', flag: '🇫🇷', c1: '#0055a4', c2: '#ef4135', players: [
    { n: 'Victor Wembanyama', pos: 'C', ovr: 94 }, { n: 'Rudy Gobert', pos: 'C', ovr: 85 }, { n: 'Evan Fournier', pos: 'SG', ovr: 80 },
    { n: 'Nicolas Batum', pos: 'SF', ovr: 78 }, { n: 'Guerschon Yabusele', pos: 'PF', ovr: 80 }, { n: 'Isaïa Cordinier', pos: 'SG', ovr: 80 },
    { n: 'Frank Ntilikina', pos: 'PG', ovr: 78 }, { n: 'Nando de Colo', pos: 'PG', ovr: 79 } ] },
  SRB: { name: 'Serbie', flag: '🇷🇸', c1: '#c6363c', c2: '#0c4076', players: [
    { n: 'Nikola Jokić', pos: 'C', ovr: 97 }, { n: 'Bogdan Bogdanović', pos: 'SG', ovr: 84 }, { n: 'Vasilije Micić', pos: 'PG', ovr: 82 },
    { n: 'Nikola Jović', pos: 'PF', ovr: 79 }, { n: 'Filip Petrušev', pos: 'C', ovr: 80 }, { n: 'Aleksa Avramović', pos: 'SG', ovr: 79 },
    { n: 'Marko Gudurić', pos: 'SF', ovr: 80 }, { n: 'Ognjen Dobrić', pos: 'SF', ovr: 77 } ] },
  CAN: { name: 'Canada', flag: '🇨🇦', c1: '#d80621', c2: '#ffffff', players: [
    { n: 'Shai Gilgeous-Alexander', pos: 'SG', ovr: 95 }, { n: 'Jamal Murray', pos: 'PG', ovr: 86 }, { n: 'RJ Barrett', pos: 'SF', ovr: 82 },
    { n: 'Dillon Brooks', pos: 'SF', ovr: 78 }, { n: 'Andrew Wiggins', pos: 'SF', ovr: 81 }, { n: 'Lu Dort', pos: 'SG', ovr: 79 },
    { n: 'Kelly Olynyk', pos: 'C', ovr: 78 }, { n: 'Nickeil Alexander-Walker', pos: 'SG', ovr: 77 } ] },
  GER: { name: 'Allemagne', flag: '🇩🇪', c1: '#000000', c2: '#dd0000', players: [
    { n: 'Franz Wagner', pos: 'SF', ovr: 86 }, { n: 'Dennis Schröder', pos: 'PG', ovr: 83 }, { n: 'Moritz Wagner', pos: 'C', ovr: 79 },
    { n: 'Daniel Theis', pos: 'C', ovr: 78 }, { n: 'Andreas Obst', pos: 'SG', ovr: 80 }, { n: 'Isaac Bonga', pos: 'SF', ovr: 77 },
    { n: 'Maodo Lô', pos: 'PG', ovr: 77 }, { n: 'Johannes Voigtmann', pos: 'PF', ovr: 77 } ] },
  ESP: { name: 'Espagne', flag: '🇪🇸', c1: '#aa151b', c2: '#f1bf00', players: [
    { n: 'Santi Aldama', pos: 'PF', ovr: 80 }, { n: 'Willy Hernangómez', pos: 'C', ovr: 81 }, { n: 'Lorenzo Brown', pos: 'PG', ovr: 82 },
    { n: 'Juancho Hernangómez', pos: 'SF', ovr: 79 }, { n: 'Rudy Fernández', pos: 'SG', ovr: 74 }, { n: 'Usman Garuba', pos: 'PF', ovr: 76 },
    { n: 'Dario Brizuela', pos: 'SG', ovr: 78 }, { n: 'Jaime Fernández', pos: 'SG', ovr: 76 } ] },
  GRE: { name: 'Grèce', flag: '🇬🇷', c1: '#0d5eaf', c2: '#ffffff', players: [
    { n: 'Giannis Antetokounmpo', pos: 'PF', ovr: 96 }, { n: 'Kostas Sloukas', pos: 'PG', ovr: 82 }, { n: 'Thomas Walkup', pos: 'SG', ovr: 80 },
    { n: 'Kostas Antetokounmpo', pos: 'PF', ovr: 76 }, { n: 'Giannoulis Larentzakis', pos: 'SG', ovr: 76 }, { n: 'Tyler Dorsey', pos: 'SG', ovr: 79 },
    { n: 'Dinos Mitoglou', pos: 'C', ovr: 77 } ] },
  SLO: { name: 'Slovénie', flag: '🇸🇮', c1: '#005da4', c2: '#ed1c24', players: [
    { n: 'Luka Dončić', pos: 'PG', ovr: 95 }, { n: 'Vlatko Čančar', pos: 'SF', ovr: 77 }, { n: 'Klemen Prepelič', pos: 'SG', ovr: 78 },
    { n: 'Mike Tobey', pos: 'C', ovr: 77 }, { n: 'Zoran Dragić', pos: 'SG', ovr: 74 }, { n: 'Josh Nebo', pos: 'C', ovr: 76 },
    { n: 'Aleksej Nikolić', pos: 'PG', ovr: 73 } ] },
  LTU: { name: 'Lituanie', flag: '🇱🇹', c1: '#fdb913', c2: '#006a44', players: [
    { n: 'Jonas Valančiūnas', pos: 'C', ovr: 84 }, { n: 'Domantas Sabonis', pos: 'C', ovr: 87 }, { n: 'Rokas Jokubaitis', pos: 'PG', ovr: 79 },
    { n: 'Ignas Brazdeikis', pos: 'SF', ovr: 80 }, { n: 'Marek Blaževič', pos: 'C', ovr: 73 }, { n: 'Tadas Sedekerskis', pos: 'PF', ovr: 77 },
    { n: 'Deividas Sirvydis', pos: 'SF', ovr: 74 } ] },
  ITA: { name: 'Italie', flag: '🇮🇹', c1: '#0064aa', c2: '#ffffff', players: [
    { n: 'Simone Fontecchio', pos: 'SF', ovr: 80 }, { n: 'Danilo Gallinari', pos: 'PF', ovr: 77 }, { n: 'Nicolò Melli', pos: 'PF', ovr: 78 },
    { n: 'Marco Spissu', pos: 'PG', ovr: 77 }, { n: 'Simone Anchisi', pos: 'SG', ovr: 72 }, { n: 'Alessandro Pajola', pos: 'PG', ovr: 76 },
    { n: 'Momo Diouf', pos: 'C', ovr: 74 } ] },
  AUS: { name: 'Australie', flag: '🇦🇺', c1: '#00843d', c2: '#ffcd00', players: [
    { n: 'Josh Giddey', pos: 'PG', ovr: 82 }, { n: 'Dyson Daniels', pos: 'SG', ovr: 81 }, { n: 'Patty Mills', pos: 'PG', ovr: 76 },
    { n: 'Jock Landale', pos: 'C', ovr: 78 }, { n: 'Joe Ingles', pos: 'SF', ovr: 74 }, { n: 'Dante Exum', pos: 'PG', ovr: 77 },
    { n: 'Matisse Thybulle', pos: 'SF', ovr: 76 }, { n: 'Duop Reath', pos: 'C', ovr: 74 } ] },
  TUR: { name: 'Turquie', flag: '🇹🇷', c1: '#e30a17', c2: '#ffffff', players: [
    { n: 'Alperen Şengün', pos: 'C', ovr: 86 }, { n: 'Cedi Osman', pos: 'SF', ovr: 79 }, { n: 'Şehmus Hazer', pos: 'PG', ovr: 75 },
    { n: 'Ercan Osmani', pos: 'PF', ovr: 76 }, { n: 'Furkan Korkmaz', pos: 'SG', ovr: 77 }, { n: 'Adem Bona', pos: 'C', ovr: 76 },
    { n: 'Tarik Biberović', pos: 'SF', ovr: 76 } ] },
};

const INT_COMPS = {
  eurobasket: { name: "EuroBasket (Championnat d'Europe)", flag: '🏆', nations: ['FRA', 'SRB', 'GER', 'ESP', 'GRE', 'SLO', 'LTU', 'ITA'] },
  worldcup:   { name: 'Coupe du Monde FIBA', flag: '🌍', nations: ['USA', 'CAN', 'SRB', 'FRA', 'GER', 'ESP', 'SLO', 'AUS'] },
  olympics:   { name: 'Jeux Olympiques', flag: '🥇', nations: ['USA', 'FRA', 'SRB', 'CAN', 'GER', 'ESP', 'GRE', 'SLO'] },
};

/* ------------- Renforts (étoffe les rotations, best-effort) ------------ */
const EURO_EXTRA = {
  RMA: [{ n: 'Bruno Fernando', pos: 'C', ovr: 78, age: 27 }, { n: 'Alberto Abalde', pos: 'SG', ovr: 76, age: 30 }],
  FCB: [{ n: 'Chimezie Metu', pos: 'PF', ovr: 78, age: 28 }, { n: 'Youssoupha Fall', pos: 'C', ovr: 76, age: 30 }],
  PAN: [{ n: 'Omer Yurtseven', pos: 'C', ovr: 79, age: 27 }, { n: 'Panagiotis Kalaitzakis', pos: 'SF', ovr: 74, age: 26 }],
  OLY: [{ n: 'Alec Peters', pos: 'PF', ovr: 79, age: 30 }, { n: 'Luke Sikma', pos: 'PF', ovr: 76, age: 36 }],
  FEN: [{ n: 'Bobby Dixon', pos: 'SG', ovr: 74, age: 41 }, { n: 'Melih Mahmutoğlu', pos: 'SG', ovr: 74, age: 35 }],
  EFS: [{ n: 'PJ Dozier', pos: 'SG', ovr: 77, age: 29 }, { n: 'Yağız Aksu', pos: 'PF', ovr: 72, age: 25 }],
  MIL: [{ n: 'Fabien Causeur', pos: 'SG', ovr: 74, age: 38 }, { n: 'Ousmane Diop', pos: 'PF', ovr: 72, age: 24 }],
  VIR: [{ n: 'Matt Morgan', pos: 'PG', ovr: 76, age: 28 }, { n: 'Alessandro Pajola', pos: 'PG', ovr: 77, age: 25 }],
  MON: [{ n: 'Georgios Papagiannis', pos: 'C', ovr: 78, age: 28 }, { n: 'Jaron Blossomgame', pos: 'SF', ovr: 76, age: 32 }],
  ASV: [{ n: 'Théo Maledon', pos: 'PG', ovr: 79, age: 24 }, { n: 'Charles Kahudi', pos: 'SF', ovr: 72, age: 39 }],
  BAY: [{ n: 'Leandro Bolmaro', pos: 'SG', ovr: 76, age: 25 }, { n: 'Niels Giffey', pos: 'SF', ovr: 73, age: 34 }],
  ZAL: [{ n: 'Tyson Carter', pos: 'SG', ovr: 76, age: 28 }, { n: 'Arnas Butkevičius', pos: 'SG', ovr: 73, age: 34 }],
  PAR: [{ n: 'Duane Washington Jr.', pos: 'SG', ovr: 78, age: 26 }, { n: 'Balša Koprivica', pos: 'C', ovr: 74, age: 25 }],
  RED: [{ n: 'Luka Mitrović', pos: 'PF', ovr: 74, age: 32 }, { n: 'Dejan Davidovac', pos: 'SF', ovr: 73, age: 30 }],
  MAC: [{ n: 'John DiBartolomeo', pos: 'PG', ovr: 73, age: 34 }, { n: 'Rafi Menco', pos: 'SF', ovr: 72, age: 30 }],
  BAS: [{ n: 'Luka Šamanić', pos: 'PF', ovr: 78, age: 25 }, { n: 'Maik Kotsar', pos: 'C', ovr: 74, age: 28 }],
};
Object.keys(EURO_EXTRA).forEach(k => { if (EURO_ROSTERS[k]) EURO_ROSTERS[k] = EURO_ROSTERS[k].concat(EURO_EXTRA[k]); });
if (typeof ERA_ROSTERS !== 'undefined') ERA_ROSTERS.euro = EURO_ROSTERS;

const NAT_EXTRA = {
  USA: [{ n: 'Tyrese Haliburton', pos: 'PG', ovr: 88 }, { n: 'Jalen Brunson', pos: 'PG', ovr: 87 }, { n: 'Paolo Banchero', pos: 'PF', ovr: 86 }],
  FRA: [{ n: 'Bilal Coulibaly', pos: 'SF', ovr: 78 }, { n: 'Théo Maledon', pos: 'PG', ovr: 76 }, { n: 'Ousmane Dieng', pos: 'SF', ovr: 74 }],
  SRB: [{ n: 'Nikola Milutinov', pos: 'C', ovr: 80 }, { n: 'Vanja Marinković', pos: 'SG', ovr: 75 }],
  CAN: [{ n: 'Andrew Nembhard', pos: 'PG', ovr: 78 }, { n: 'Trey Lyles', pos: 'PF', ovr: 74 }, { n: 'Dwight Powell', pos: 'C', ovr: 72 }],
  GER: [{ n: 'Johannes Thiemann', pos: 'PF', ovr: 76 }, { n: 'David Krämer', pos: 'SG', ovr: 73 }, { n: 'Justus Hollatz', pos: 'PG', ovr: 73 }],
  ESP: [{ n: 'Sergio Llull', pos: 'SG', ovr: 74 }, { n: 'Alberto Díaz', pos: 'PG', ovr: 74 }, { n: 'Jaime Pradilla', pos: 'PF', ovr: 73 }],
  GRE: [{ n: 'Nick Calathes', pos: 'PG', ovr: 80 }, { n: 'Georgios Papagiannis', pos: 'C', ovr: 78 }, { n: 'Vasilis Toliopoulos', pos: 'SG', ovr: 72 }],
  SLO: [{ n: 'Edo Murić', pos: 'SF', ovr: 74 }, { n: 'Gregor Hrovat', pos: 'SG', ovr: 73 }, { n: 'Žiga Samar', pos: 'PG', ovr: 72 }],
  LTU: [{ n: 'Gytis Radzevičius', pos: 'SF', ovr: 73 }, { n: 'Vaidas Kariniauskas', pos: 'SG', ovr: 72 }],
  ITA: [{ n: 'Gabriele Procida', pos: 'SG', ovr: 76 }, { n: 'Nicola Akele', pos: 'PF', ovr: 72 }, { n: 'Guglielmo Caruso', pos: 'C', ovr: 72 }],
  AUS: [{ n: 'Josh Green', pos: 'SG', ovr: 75 }, { n: 'Xavier Cooks', pos: 'PF', ovr: 74 }, { n: 'Jack White', pos: 'PF', ovr: 72 }],
  TUR: [{ n: 'Onuralp Bitim', pos: 'SF', ovr: 74 }, { n: 'Yiğitcan Saybir', pos: 'C', ovr: 72 }, { n: 'Berkay Candan', pos: 'SF', ovr: 71 }],
};
Object.keys(NAT_EXTRA).forEach(k => { if (NATIONS[k]) NATIONS[k].players = NATIONS[k].players.concat(NAT_EXTRA[k].map(p => ({ ...p, age: p.age || 26 }))); });
