/* ==========================================================================
   NBA My Era — Époques historiques (règles + effectifs légendaires étoffés)
   --------------------------------------------------------------------------
   ⚠️ BEST-EFFORT : rosters de stars curés par époque (~8-10 joueurs/équipe),
   notes indicatives. Certaines franchises portent leur nom d'époque (ERA_TEAM_META).
   Les règles adaptent la simulation (ligne à 3 pts, rythme…). Tableau de playoffs
   unique (8 qualifiés) pour les époques classiques.
   ========================================================================== */

const ERAS = {
  modern: {
    name: 'Époque moderne (2026-27)', year: 2026,
    teams: TEAMS.map(t => t.id),
    rules: { threePA: 1.0, pace: 1.0, fgAdj: 0, confMode: 'conf', note: 'Règles actuelles, tir à 3 pts omniprésent.' },
  },
  e2016: {
    name: 'Années 2010 — Warriors & LeBron (2015-16)', year: 2016,
    teams: ['GSW', 'CLE', 'SAS', 'OKC', 'TOR', 'LAC', 'MIA', 'BOS', 'ATL', 'HOU', 'POR', 'IND', 'DAL', 'MEM', 'WAS', 'NOP'],
    rules: { threePA: 0.82, pace: 0.99, fgAdj: 0, confMode: 'single', note: 'Essor du 3 pts, spacing moderne.' },
  },
  e1996: {
    name: "Années 90 — l'ère Jordan (1995-96)", year: 1996,
    teams: ['CHI', 'OKC', 'ORL', 'HOU', 'SAS', 'UTA', 'LAL', 'NYK', 'IND', 'PHX', 'POR', 'PHI', 'DET', 'MIA', 'ATL', 'DAL'],
    rules: { threePA: 0.5, pace: 0.95, fgAdj: -0.01, confMode: 'single', note: 'Jeu physique, hand-check, 3 pts secondaire.' },
  },
  e1986: {
    name: 'Années 80 — Magic vs Bird (1985-86)', year: 1986,
    teams: ['BOS', 'LAL', 'PHI', 'MIL', 'HOU', 'DET', 'ATL', 'DAL', 'POR', 'DEN', 'UTA', 'PHX', 'CHI', 'NYK', 'WAS', 'BKN'],
    rules: { threePA: 0.14, pace: 1.14, fgAdj: 0, confMode: 'single', note: 'Rythme élevé, ligne à 3 pts rare.' },
  },
  e1968: {
    name: 'Années 60 — Russell & Wilt (1967-68)', year: 1968,
    teams: ['BOS', 'PHI', 'LAL', 'NYK', 'DET', 'ATL', 'GSW', 'SAC', 'CHI', 'OKC'],
    rules: { threePA: 0.0, pace: 1.22, fgAdj: -0.02, confMode: 'single', note: 'Pas de ligne à 3 points, jeu très rapide.' },
  },
};

// Surcharges de nom/ville par époque (franchises relocalisées/renommées)
const ERA_TEAM_META = {
  e2016: {},
  e1996: { OKC: { city: 'Seattle', name: 'SuperSonics' } },
  e1986: { WAS: { city: 'Washington', name: 'Bullets' }, BKN: { city: 'New Jersey', name: 'Nets' } },
  e1968: {
    ATL: { city: 'St. Louis', name: 'Hawks' },
    GSW: { city: 'San Francisco', name: 'Warriors' },
    SAC: { city: 'Cincinnati', name: 'Royals' },
    OKC: { city: 'Seattle', name: 'SuperSonics' },
  },
};

const ERA_ROSTERS = {
  /* ============================== 1967-68 =============================== */
  e1968: {
    BOS: [ { n: 'Bill Russell', pos: 'C', ovr: 94, age: 34 }, { n: 'John Havlicek', pos: 'SF', ovr: 90, age: 28 },
      { n: 'Sam Jones', pos: 'SG', ovr: 88, age: 35 }, { n: 'Bailey Howell', pos: 'PF', ovr: 82, age: 31 },
      { n: 'Larry Siegfried', pos: 'SG', ovr: 78, age: 28 }, { n: 'Satch Sanders', pos: 'SF', ovr: 75, age: 29 },
      { n: 'Don Nelson', pos: 'PF', ovr: 74, age: 27 }, { n: 'Wayne Embry', pos: 'C', ovr: 72, age: 31 },
      { n: 'Bud Olsen', pos: 'PF', ovr: 68, age: 27 } ],
    PHI: [ { n: 'Wilt Chamberlain', pos: 'C', ovr: 97, age: 31 }, { n: 'Hal Greer', pos: 'SG', ovr: 88, age: 31 },
      { n: 'Billy Cunningham', pos: 'SF', ovr: 86, age: 24 }, { n: 'Chet Walker', pos: 'SF', ovr: 82, age: 27 },
      { n: 'Wali Jones', pos: 'PG', ovr: 78, age: 25 }, { n: 'Luke Jackson', pos: 'PF', ovr: 76, age: 26 },
      { n: 'Matt Guokas', pos: 'SG', ovr: 72, age: 23 }, { n: 'Johnny Green', pos: 'PF', ovr: 72, age: 34 } ],
    LAL: [ { n: 'Jerry West', pos: 'SG', ovr: 94, age: 29 }, { n: 'Elgin Baylor', pos: 'SF', ovr: 91, age: 33 },
      { n: 'Gail Goodrich', pos: 'SG', ovr: 80, age: 24 }, { n: 'Archie Clark', pos: 'PG', ovr: 78, age: 26 },
      { n: 'Darrall Imhoff', pos: 'C', ovr: 74, age: 29 }, { n: 'Tommy Hawkins', pos: 'PF', ovr: 72, age: 31 },
      { n: 'Mel Counts', pos: 'C', ovr: 72, age: 26 }, { n: 'Fred Crawford', pos: 'SG', ovr: 70, age: 25 } ],
    NYK: [ { n: 'Willis Reed', pos: 'C', ovr: 88, age: 25 }, { n: 'Walt Frazier', pos: 'PG', ovr: 86, age: 23 },
      { n: 'Dave DeBusschere', pos: 'PF', ovr: 84, age: 27 }, { n: 'Dick Barnett', pos: 'SG', ovr: 80, age: 31 },
      { n: 'Bill Bradley', pos: 'SF', ovr: 78, age: 24 }, { n: 'Cazzie Russell', pos: 'SF', ovr: 76, age: 23 },
      { n: 'Walt Bellamy', pos: 'C', ovr: 80, age: 28 }, { n: 'Dick Van Arsdale', pos: 'SG', ovr: 76, age: 25 } ],
    DET: [ { n: 'Dave Bing', pos: 'PG', ovr: 88, age: 24 }, { n: 'Eddie Miles', pos: 'SG', ovr: 80, age: 27 },
      { n: 'Happy Hairston', pos: 'PF', ovr: 78, age: 25 }, { n: 'Jimmy Walker', pos: 'PG', ovr: 76, age: 23 },
      { n: 'Terry Dischinger', pos: 'PF', ovr: 74, age: 27 }, { n: 'Joe Strawder', pos: 'C', ovr: 72, age: 27 },
      { n: 'Tom Van Arsdale', pos: 'SF', ovr: 76, age: 24 }, { n: 'John Tresvant', pos: 'PF', ovr: 70, age: 28 } ],
    ATL: [ { n: 'Lenny Wilkens', pos: 'PG', ovr: 86, age: 30 }, { n: 'Lou Hudson', pos: 'SF', ovr: 82, age: 23 },
      { n: 'Zelmo Beaty', pos: 'C', ovr: 82, age: 28 }, { n: 'Bill Bridges', pos: 'PF', ovr: 80, age: 28 },
      { n: 'Joe Caldwell', pos: 'SG', ovr: 76, age: 26 }, { n: 'Paul Silas', pos: 'PF', ovr: 76, age: 24 },
      { n: 'Richie Guerin', pos: 'SG', ovr: 74, age: 35 }, { n: 'Jim Davis', pos: 'C', ovr: 68, age: 26 } ],
    GSW: [ { n: 'Rick Barry', pos: 'SF', ovr: 90, age: 23 }, { n: 'Nate Thurmond', pos: 'C', ovr: 88, age: 26 },
      { n: 'Rudy LaRusso', pos: 'PF', ovr: 78, age: 30 }, { n: 'Jeff Mullins', pos: 'SG', ovr: 80, age: 25 },
      { n: 'Al Attles', pos: 'PG', ovr: 76, age: 31 }, { n: 'Fred Hetzel', pos: 'PF', ovr: 74, age: 25 },
      { n: 'Paul Neumann', pos: 'PG', ovr: 72, age: 30 }, { n: 'Clyde Lee', pos: 'C', ovr: 70, age: 23 } ],
    SAC: [ { n: 'Oscar Robertson', pos: 'PG', ovr: 95, age: 29 }, { n: 'Jerry Lucas', pos: 'PF', ovr: 88, age: 27 },
      { n: 'Adrian Smith', pos: 'SG', ovr: 78, age: 31 }, { n: 'Flynn Robinson', pos: 'SG', ovr: 74, age: 26 },
      { n: 'Connie Dierking', pos: 'C', ovr: 74, age: 31 }, { n: 'Bob Love', pos: 'SF', ovr: 74, age: 25 },
      { n: 'Jon McGlocklin', pos: 'SG', ovr: 72, age: 24 } ],
    CHI: [ { n: 'Bob Boozer', pos: 'PF', ovr: 80, age: 30 }, { n: 'Jerry Sloan', pos: 'SG', ovr: 80, age: 25 },
      { n: 'Guy Rodgers', pos: 'PG', ovr: 78, age: 32 }, { n: 'Keith Erickson', pos: 'SF', ovr: 74, age: 24 },
      { n: 'Erwin Mueller', pos: 'C', ovr: 72, age: 24 }, { n: 'McCoy McLemore', pos: 'PF', ovr: 70, age: 25 },
      { n: 'Barry Clemens', pos: 'SF', ovr: 68, age: 24 }, { n: 'Jim Washington', pos: 'PF', ovr: 70, age: 24 } ],
    OKC: [ { n: 'Bob Rule', pos: 'C', ovr: 80, age: 24 }, { n: 'Walt Hazzard', pos: 'PG', ovr: 80, age: 25 },
      { n: 'Tom Meschery', pos: 'PF', ovr: 76, age: 29 }, { n: 'Rod Thorn', pos: 'SG', ovr: 74, age: 26 },
      { n: 'Al Tucker', pos: 'SF', ovr: 72, age: 24 }, { n: 'Bob Weiss', pos: 'PG', ovr: 72, age: 25 },
      { n: 'Tom Kron', pos: 'SG', ovr: 68, age: 25 }, { n: 'Dorie Murrey', pos: 'C', ovr: 68, age: 25 } ],
  },
  /* ============================== 1985-86 =============================== */
  e1986: {
    BOS: [ { n: 'Larry Bird', pos: 'SF', ovr: 96, age: 29 }, { n: 'Kevin McHale', pos: 'PF', ovr: 90, age: 28 },
      { n: 'Robert Parish', pos: 'C', ovr: 86, age: 32 }, { n: 'Dennis Johnson', pos: 'PG', ovr: 82, age: 31 },
      { n: 'Danny Ainge', pos: 'SG', ovr: 80, age: 26 }, { n: 'Bill Walton', pos: 'C', ovr: 78, age: 33 },
      { n: 'Scott Wedman', pos: 'SF', ovr: 74, age: 33 }, { n: 'Jerry Sichting', pos: 'PG', ovr: 72, age: 29 },
      { n: 'David Thirdkill', pos: 'SF', ovr: 66, age: 25 } ],
    LAL: [ { n: 'Magic Johnson', pos: 'PG', ovr: 95, age: 26 }, { n: 'Kareem Abdul-Jabbar', pos: 'C', ovr: 90, age: 38 },
      { n: 'James Worthy', pos: 'SF', ovr: 88, age: 24 }, { n: 'Byron Scott', pos: 'SG', ovr: 82, age: 24 },
      { n: 'Michael Cooper', pos: 'SG', ovr: 80, age: 29 }, { n: 'A.C. Green', pos: 'PF', ovr: 76, age: 22, pot: 84 },
      { n: 'Kurt Rambis', pos: 'PF', ovr: 74, age: 27 }, { n: 'Maurice Lucas', pos: 'PF', ovr: 74, age: 33 },
      { n: 'Mike McGee', pos: 'SG', ovr: 70, age: 26 } ],
    PHI: [ { n: 'Charles Barkley', pos: 'PF', ovr: 88, age: 23, pot: 94 }, { n: 'Julius Erving', pos: 'SF', ovr: 87, age: 35 },
      { n: 'Moses Malone', pos: 'C', ovr: 88, age: 30 }, { n: 'Maurice Cheeks', pos: 'PG', ovr: 84, age: 29 },
      { n: 'Andrew Toney', pos: 'SG', ovr: 80, age: 28 }, { n: 'Bobby Jones', pos: 'SF', ovr: 78, age: 34 },
      { n: 'Sedale Threatt', pos: 'PG', ovr: 72, age: 24 }, { n: 'Clint Richardson', pos: 'SG', ovr: 70, age: 29 } ],
    MIL: [ { n: 'Sidney Moncrief', pos: 'SG', ovr: 87, age: 28 }, { n: 'Terry Cummings', pos: 'PF', ovr: 84, age: 25 },
      { n: 'Paul Pressey', pos: 'SF', ovr: 80, age: 26 }, { n: 'Ricky Pierce', pos: 'SG', ovr: 78, age: 26 },
      { n: 'Alton Lister', pos: 'C', ovr: 74, age: 27 }, { n: 'Craig Hodges', pos: 'SG', ovr: 74, age: 25 },
      { n: 'Paul Mokeski', pos: 'C', ovr: 70, age: 29 }, { n: 'Jerry Reynolds', pos: 'SF', ovr: 70, age: 23 } ],
    HOU: [ { n: 'Hakeem Olajuwon', pos: 'C', ovr: 90, age: 23, pot: 96 }, { n: 'Ralph Sampson', pos: 'C', ovr: 84, age: 25 },
      { n: 'Rodney McCray', pos: 'SF', ovr: 78, age: 24 }, { n: 'Lewis Lloyd', pos: 'SG', ovr: 76, age: 27 },
      { n: 'Robert Reid', pos: 'SF', ovr: 75, age: 30 }, { n: 'Allen Leavell', pos: 'PG', ovr: 74, age: 28 },
      { n: 'Mitchell Wiggins', pos: 'SG', ovr: 72, age: 26 }, { n: 'Jim Petersen', pos: 'PF', ovr: 70, age: 23 } ],
    DET: [ { n: 'Isiah Thomas', pos: 'PG', ovr: 90, age: 24 }, { n: 'Joe Dumars', pos: 'SG', ovr: 80, age: 22, pot: 88 },
      { n: 'Bill Laimbeer', pos: 'C', ovr: 82, age: 28 }, { n: 'Kelly Tripucka', pos: 'SF', ovr: 78, age: 26 },
      { n: 'Vinnie Johnson', pos: 'SG', ovr: 78, age: 29 }, { n: 'Rick Mahorn', pos: 'PF', ovr: 76, age: 27 },
      { n: 'John Long', pos: 'SG', ovr: 72, age: 29 }, { n: 'Sidney Green', pos: 'PF', ovr: 70, age: 24 } ],
    ATL: [ { n: 'Dominique Wilkins', pos: 'SF', ovr: 90, age: 26 }, { n: 'Kevin Willis', pos: 'PF', ovr: 80, age: 23 },
      { n: 'Doc Rivers', pos: 'PG', ovr: 80, age: 24 }, { n: 'Spud Webb', pos: 'PG', ovr: 76, age: 22 },
      { n: 'Randy Wittman', pos: 'SG', ovr: 74, age: 26 }, { n: 'Cliff Levingston', pos: 'PF', ovr: 73, age: 24 },
      { n: 'Tree Rollins', pos: 'C', ovr: 74, age: 30 }, { n: 'Antoine Carr', pos: 'PF', ovr: 72, age: 24 } ],
    DAL: [ { n: 'Mark Aguirre', pos: 'SF', ovr: 84, age: 26 }, { n: 'Rolando Blackman', pos: 'SG', ovr: 84, age: 26 },
      { n: 'Derek Harper', pos: 'PG', ovr: 82, age: 24 }, { n: 'Sam Perkins', pos: 'PF', ovr: 80, age: 24 },
      { n: 'Dale Ellis', pos: 'SG', ovr: 78, age: 25 }, { n: 'Brad Davis', pos: 'PG', ovr: 74, age: 30 },
      { n: 'James Donaldson', pos: 'C', ovr: 76, age: 28 }, { n: 'Detlef Schrempf', pos: 'SF', ovr: 74, age: 23, pot: 84 } ],
    POR: [ { n: 'Clyde Drexler', pos: 'SG', ovr: 87, age: 23, pot: 92 }, { n: 'Kiki Vandeweghe', pos: 'SF', ovr: 82, age: 27 },
      { n: 'Terry Porter', pos: 'PG', ovr: 80, age: 22, pot: 86 }, { n: 'Mychal Thompson', pos: 'C', ovr: 78, age: 31 },
      { n: 'Jerome Kersey', pos: 'SF', ovr: 76, age: 23 }, { n: 'Steve Johnson', pos: 'C', ovr: 74, age: 28 },
      { n: 'Sam Bowie', pos: 'C', ovr: 74, age: 24 }, { n: 'Darnell Valentine', pos: 'PG', ovr: 72, age: 26 } ],
    DEN: [ { n: 'Alex English', pos: 'SF', ovr: 88, age: 32 }, { n: 'Fat Lever', pos: 'PG', ovr: 82, age: 25 },
      { n: 'Dan Issel', pos: 'C', ovr: 80, age: 37 }, { n: 'Calvin Natt', pos: 'PF', ovr: 78, age: 28 },
      { n: 'Bill Hanzlik', pos: 'SG', ovr: 72, age: 28 }, { n: 'Danny Schayes', pos: 'C', ovr: 72, age: 26 },
      { n: 'Wayne Cooper', pos: 'C', ovr: 70, age: 29 }, { n: 'T.R. Dunn', pos: 'SG', ovr: 68, age: 30 } ],
    UTA: [ { n: 'Karl Malone', pos: 'PF', ovr: 86, age: 22, pot: 95 }, { n: 'Adrian Dantley', pos: 'SF', ovr: 86, age: 29 },
      { n: 'John Stockton', pos: 'PG', ovr: 82, age: 23, pot: 92 }, { n: 'Mark Eaton', pos: 'C', ovr: 78, age: 29 },
      { n: 'Thurl Bailey', pos: 'PF', ovr: 78, age: 24 }, { n: 'Rickey Green', pos: 'PG', ovr: 74, age: 31 },
      { n: 'Bobby Hansen', pos: 'SG', ovr: 72, age: 24 }, { n: 'Marc Iavaroni', pos: 'PF', ovr: 68, age: 29 } ],
    PHX: [ { n: 'Larry Nance', pos: 'PF', ovr: 82, age: 26 }, { n: 'Walter Davis', pos: 'SG', ovr: 82, age: 31 },
      { n: 'Alvan Adams', pos: 'C', ovr: 76, age: 31 }, { n: 'James Edwards', pos: 'C', ovr: 76, age: 30 },
      { n: 'Jay Humphries', pos: 'PG', ovr: 74, age: 24 }, { n: 'Mike Sanders', pos: 'SF', ovr: 72, age: 25 },
      { n: 'Rod Foster', pos: 'PG', ovr: 68, age: 25 }, { n: 'Georgi Glouchkov', pos: 'PF', ovr: 66, age: 25 } ],
    CHI: [ { n: 'Michael Jordan', pos: 'SG', ovr: 90, age: 23, pot: 99 }, { n: 'Orlando Woolridge', pos: 'SF', ovr: 80, age: 25 },
      { n: 'Charles Oakley', pos: 'PF', ovr: 78, age: 22, pot: 84 }, { n: 'Dave Corzine', pos: 'C', ovr: 74, age: 30 },
      { n: 'John Paxson', pos: 'PG', ovr: 74, age: 25 }, { n: 'Kyle Macy', pos: 'PG', ovr: 70, age: 28 },
      { n: 'Gene Banks', pos: 'SF', ovr: 72, age: 26 }, { n: 'Mike Smrek', pos: 'C', ovr: 66, age: 24 } ],
    NYK: [ { n: 'Bernard King', pos: 'SF', ovr: 84, age: 29 }, { n: 'Patrick Ewing', pos: 'C', ovr: 82, age: 23, pot: 92 },
      { n: 'Bill Cartwright', pos: 'C', ovr: 76, age: 28 }, { n: 'Gerald Wilkins', pos: 'SG', ovr: 74, age: 22 },
      { n: 'Rory Sparrow', pos: 'PG', ovr: 72, age: 27 }, { n: 'Trent Tucker', pos: 'SG', ovr: 72, age: 26 },
      { n: 'Pat Cummings', pos: 'PF', ovr: 72, age: 29 }, { n: 'Louis Orr', pos: 'SF', ovr: 70, age: 27 } ],
    WAS: [ { n: 'Jeff Malone', pos: 'SG', ovr: 82, age: 24 }, { n: 'Jeff Ruland', pos: 'C', ovr: 78, age: 27 },
      { n: 'Gus Williams', pos: 'PG', ovr: 76, age: 32 }, { n: 'Cliff Robinson', pos: 'PF', ovr: 76, age: 25 },
      { n: 'Dan Roundfield', pos: 'PF', ovr: 74, age: 33 }, { n: 'Manute Bol', pos: 'C', ovr: 70, age: 23 },
      { n: 'Gus Nevárez', pos: 'PG', ovr: 66, age: 24 }, { n: 'Dudley Bradley', pos: 'SG', ovr: 68, age: 29 } ],
    BKN: [ { n: 'Buck Williams', pos: 'PF', ovr: 82, age: 26 }, { n: 'Otis Birdsong', pos: 'SG', ovr: 78, age: 30 },
      { n: 'Micheal Ray Richardson', pos: 'PG', ovr: 78, age: 30 }, { n: 'Mike Gminski', pos: 'C', ovr: 76, age: 26 },
      { n: 'Darryl Dawkins', pos: 'C', ovr: 76, age: 29 }, { n: 'Albert King', pos: 'SF', ovr: 74, age: 26 },
      { n: 'Darwin Cook', pos: 'PG', ovr: 70, age: 27 }, { n: 'Mike O\'Koren', pos: 'SF', ovr: 68, age: 27 } ],
  },
  /* ============================== 1995-96 =============================== */
  e1996: {
    CHI: [ { n: 'Michael Jordan', pos: 'SG', ovr: 99, age: 33 }, { n: 'Scottie Pippen', pos: 'SF', ovr: 92, age: 30 },
      { n: 'Dennis Rodman', pos: 'PF', ovr: 82, age: 34 }, { n: 'Toni Kukoc', pos: 'SF', ovr: 82, age: 27 },
      { n: 'Ron Harper', pos: 'PG', ovr: 78, age: 32 }, { n: 'Steve Kerr', pos: 'SG', ovr: 76, age: 30 },
      { n: 'Luc Longley', pos: 'C', ovr: 74, age: 27 }, { n: 'Bill Wennington', pos: 'C', ovr: 70, age: 32 },
      { n: 'Jud Buechler', pos: 'SF', ovr: 68, age: 27 } ],
    OKC: [ { n: 'Gary Payton', pos: 'PG', ovr: 90, age: 27 }, { n: 'Shawn Kemp', pos: 'PF', ovr: 90, age: 26 },
      { n: 'Detlef Schrempf', pos: 'SF', ovr: 84, age: 33 }, { n: 'Hersey Hawkins', pos: 'SG', ovr: 80, age: 29 },
      { n: 'Sam Perkins', pos: 'PF', ovr: 76, age: 34 }, { n: 'Nate McMillan', pos: 'PG', ovr: 74, age: 31 },
      { n: 'Ervin Johnson', pos: 'C', ovr: 72, age: 28 }, { n: 'Vincent Askew', pos: 'SF', ovr: 70, age: 29 } ],
    ORL: [ { n: 'Shaquille O\'Neal', pos: 'C', ovr: 94, age: 24 }, { n: 'Anfernee Hardaway', pos: 'PG', ovr: 91, age: 24 },
      { n: 'Horace Grant', pos: 'PF', ovr: 80, age: 30 }, { n: 'Nick Anderson', pos: 'SG', ovr: 80, age: 28 },
      { n: 'Dennis Scott', pos: 'SF', ovr: 78, age: 27 }, { n: 'Brian Shaw', pos: 'PG', ovr: 72, age: 30 },
      { n: 'Donald Royal', pos: 'SF', ovr: 68, age: 30 }, { n: 'Jon Koncak', pos: 'C', ovr: 66, age: 32 } ],
    HOU: [ { n: 'Hakeem Olajuwon', pos: 'C', ovr: 92, age: 33 }, { n: 'Clyde Drexler', pos: 'SG', ovr: 86, age: 33 },
      { n: 'Robert Horry', pos: 'PF', ovr: 78, age: 25 }, { n: 'Sam Cassell', pos: 'PG', ovr: 78, age: 26 },
      { n: 'Kenny Smith', pos: 'PG', ovr: 76, age: 30 }, { n: 'Mario Elie', pos: 'SF', ovr: 76, age: 32 },
      { n: 'Chucky Brown', pos: 'PF', ovr: 70, age: 27 }, { n: 'Pete Chilcutt', pos: 'C', ovr: 68, age: 27 } ],
    SAS: [ { n: 'David Robinson', pos: 'C', ovr: 94, age: 30 }, { n: 'Sean Elliott', pos: 'SF', ovr: 82, age: 28 },
      { n: 'Avery Johnson', pos: 'PG', ovr: 80, age: 31 }, { n: 'Vinny Del Negro', pos: 'SG', ovr: 76, age: 29 },
      { n: 'Chuck Person', pos: 'SF', ovr: 76, age: 31 }, { n: 'Will Perdue', pos: 'C', ovr: 72, age: 30 },
      { n: 'Doc Rivers', pos: 'PG', ovr: 72, age: 34 }, { n: 'J.R. Reid', pos: 'PF', ovr: 70, age: 28 } ],
    UTA: [ { n: 'Karl Malone', pos: 'PF', ovr: 92, age: 32 }, { n: 'John Stockton', pos: 'PG', ovr: 88, age: 33 },
      { n: 'Jeff Hornacek', pos: 'SG', ovr: 82, age: 32 }, { n: 'Bryon Russell', pos: 'SF', ovr: 74, age: 25 },
      { n: 'Antoine Carr', pos: 'PF', ovr: 74, age: 34 }, { n: 'Greg Ostertag', pos: 'C', ovr: 72, age: 23 },
      { n: 'Chris Morris', pos: 'SF', ovr: 72, age: 29 }, { n: 'Howard Eisley', pos: 'PG', ovr: 68, age: 23 } ],
    LAL: [ { n: 'Eddie Jones', pos: 'SG', ovr: 82, age: 24 }, { n: 'Magic Johnson', pos: 'PG', ovr: 82, age: 36 },
      { n: 'Vlade Divac', pos: 'C', ovr: 82, age: 28 }, { n: 'Nick Van Exel', pos: 'PG', ovr: 80, age: 24 },
      { n: 'Cedric Ceballos', pos: 'SF', ovr: 80, age: 26 }, { n: 'Elden Campbell', pos: 'PF', ovr: 76, age: 27 },
      { n: 'Anthony Peeler', pos: 'SG', ovr: 72, age: 26 }, { n: 'Corie Blount', pos: 'PF', ovr: 68, age: 26 } ],
    NYK: [ { n: 'Patrick Ewing', pos: 'C', ovr: 90, age: 33 }, { n: 'John Starks', pos: 'SG', ovr: 82, age: 30 },
      { n: 'Anthony Mason', pos: 'PF', ovr: 80, age: 29 }, { n: 'Charles Oakley', pos: 'PF', ovr: 80, age: 32 },
      { n: 'Derek Harper', pos: 'PG', ovr: 78, age: 34 }, { n: 'Allan Houston', pos: 'SG', ovr: 78, age: 25 },
      { n: 'Charlie Ward', pos: 'PG', ovr: 70, age: 25 }, { n: 'Hubert Davis', pos: 'SG', ovr: 72, age: 25 } ],
    IND: [ { n: 'Reggie Miller', pos: 'SG', ovr: 88, age: 30 }, { n: 'Rik Smits', pos: 'C', ovr: 82, age: 29 },
      { n: 'Mark Jackson', pos: 'PG', ovr: 80, age: 31 }, { n: 'Dale Davis', pos: 'PF', ovr: 80, age: 27 },
      { n: 'Antonio Davis', pos: 'PF', ovr: 78, age: 27 }, { n: 'Derrick McKey', pos: 'SF', ovr: 76, age: 29 },
      { n: 'Ricky Pierce', pos: 'SG', ovr: 72, age: 36 }, { n: 'Travis Best', pos: 'PG', ovr: 70, age: 23 } ],
    PHX: [ { n: 'Charles Barkley', pos: 'PF', ovr: 90, age: 33 }, { n: 'Kevin Johnson', pos: 'PG', ovr: 86, age: 30 },
      { n: 'Michael Finley', pos: 'SG', ovr: 80, age: 23, pot: 88 }, { n: 'A.C. Green', pos: 'PF', ovr: 76, age: 32 },
      { n: 'Wesley Person', pos: 'SG', ovr: 76, age: 24 }, { n: 'Danny Manning', pos: 'PF', ovr: 78, age: 29 },
      { n: 'Wayman Tisdale', pos: 'PF', ovr: 74, age: 32 }, { n: 'Elliot Perry', pos: 'PG', ovr: 70, age: 27 } ],
    POR: [ { n: 'Arvydas Sabonis', pos: 'C', ovr: 84, age: 31 }, { n: 'Rod Strickland', pos: 'PG', ovr: 82, age: 29 },
      { n: 'Clifford Robinson', pos: 'SF', ovr: 80, age: 29 }, { n: 'Isaiah Rider', pos: 'SG', ovr: 78, age: 24 },
      { n: 'Buck Williams', pos: 'PF', ovr: 76, age: 35 }, { n: 'Aaron McKie', pos: 'SG', ovr: 74, age: 23 },
      { n: 'Gary Trent', pos: 'PF', ovr: 70, age: 21 }, { n: 'James Robinson', pos: 'PG', ovr: 68, age: 25 } ],
    PHI: [ { n: 'Jerry Stackhouse', pos: 'SG', ovr: 82, age: 21, pot: 88 }, { n: 'Derrick Coleman', pos: 'PF', ovr: 80, age: 28 },
      { n: 'Clarence Weatherspoon', pos: 'PF', ovr: 78, age: 25 }, { n: 'Vernon Maxwell', pos: 'SG', ovr: 74, age: 30 },
      { n: 'Sharone Wright', pos: 'C', ovr: 72, age: 22, pot: 80 }, { n: 'Rex Walters', pos: 'PG', ovr: 70, age: 25 },
      { n: 'Trevor Ruffin', pos: 'PG', ovr: 68, age: 24 }, { n: 'Scott Williams', pos: 'C', ovr: 68, age: 28 } ],
    DET: [ { n: 'Grant Hill', pos: 'SF', ovr: 88, age: 23, pot: 92 }, { n: 'Joe Dumars', pos: 'SG', ovr: 82, age: 32 },
      { n: 'Otis Thorpe', pos: 'PF', ovr: 78, age: 33 },
      { n: 'Lindsey Hunter', pos: 'PG', ovr: 74, age: 25 }, { n: 'Terry Mills', pos: 'PF', ovr: 74, age: 28 },
      { n: 'Theo Ratliff', pos: 'C', ovr: 72, age: 22, pot: 82 }, { n: 'Michael Curry', pos: 'SG', ovr: 68, age: 27 } ],
    MIA: [ { n: 'Alonzo Mourning', pos: 'C', ovr: 88, age: 26 }, { n: 'Tim Hardaway', pos: 'PG', ovr: 84, age: 29 },
      { n: 'Rex Chapman', pos: 'SG', ovr: 76, age: 28 }, { n: 'P.J. Brown', pos: 'PF', ovr: 76, age: 26 },
      { n: 'Kurt Thomas', pos: 'PF', ovr: 72, age: 23 }, { n: 'Voshon Lenard', pos: 'SG', ovr: 72, age: 23 },
      { n: 'Keith Askins', pos: 'SF', ovr: 68, age: 28 }, { n: 'Bimbo Coles', pos: 'PG', ovr: 70, age: 27 } ],
    ATL: [ { n: 'Mookie Blaylock', pos: 'PG', ovr: 82, age: 29 }, { n: 'Steve Smith', pos: 'SG', ovr: 82, age: 27 },
      { n: 'Christian Laettner', pos: 'PF', ovr: 80, age: 26 }, { n: 'Ken Norman', pos: 'SF', ovr: 74, age: 32 },
      { n: 'Grant Long', pos: 'PF', ovr: 74, age: 29 }, { n: 'Tyrone Corbin', pos: 'SF', ovr: 72, age: 33 },
      { n: 'Craig Ehlo', pos: 'SG', ovr: 70, age: 35 }, { n: 'Alan Henderson', pos: 'PF', ovr: 68, age: 23 } ],
    DAL: [ { n: 'Jason Kidd', pos: 'PG', ovr: 84, age: 23, pot: 90 }, { n: 'Jim Jackson', pos: 'SG', ovr: 80, age: 25 },
      { n: 'Jamal Mashburn', pos: 'SF', ovr: 80, age: 23 }, { n: 'Popeye Jones', pos: 'PF', ovr: 74, age: 25 },
      { n: 'George McCloud', pos: 'SF', ovr: 74, age: 28 }, { n: 'Cherokee Parks', pos: 'C', ovr: 70, age: 23 },
      { n: 'Tony Dumas', pos: 'SG', ovr: 68, age: 23 }, { n: 'Loren Meyer', pos: 'C', ovr: 66, age: 23 } ],
  },
  /* ============================== 2015-16 =============================== */
  e2016: {
    GSW: [ { n: 'Stephen Curry', pos: 'PG', ovr: 96, age: 28 }, { n: 'Klay Thompson', pos: 'SG', ovr: 88, age: 26 },
      { n: 'Draymond Green', pos: 'PF', ovr: 86, age: 26 }, { n: 'Andre Iguodala', pos: 'SF', ovr: 80, age: 32 },
      { n: 'Andrew Bogut', pos: 'C', ovr: 78, age: 31 }, { n: 'Harrison Barnes', pos: 'SF', ovr: 78, age: 24 },
      { n: 'Shaun Livingston', pos: 'PG', ovr: 76, age: 30 }, { n: 'Festus Ezeli', pos: 'C', ovr: 72, age: 26 },
      { n: 'Leandro Barbosa', pos: 'SG', ovr: 72, age: 33 } ],
    CLE: [ { n: 'LeBron James', pos: 'SF', ovr: 96, age: 31 }, { n: 'Kyrie Irving', pos: 'PG', ovr: 88, age: 24 },
      { n: 'Kevin Love', pos: 'PF', ovr: 84, age: 27 }, { n: 'Tristan Thompson', pos: 'C', ovr: 78, age: 25 },
      { n: 'J.R. Smith', pos: 'SG', ovr: 78, age: 30 }, { n: 'Channing Frye', pos: 'C', ovr: 74, age: 33 },
      { n: 'Iman Shumpert', pos: 'SG', ovr: 74, age: 26 }, { n: 'Matthew Dellavedova', pos: 'PG', ovr: 72, age: 25 },
      { n: 'Richard Jefferson', pos: 'SF', ovr: 72, age: 35 } ],
    SAS: [ { n: 'Kawhi Leonard', pos: 'SF', ovr: 90, age: 24, pot: 95 }, { n: 'LaMarcus Aldridge', pos: 'PF', ovr: 86, age: 31 },
      { n: 'Tim Duncan', pos: 'C', ovr: 82, age: 40 }, { n: 'Tony Parker', pos: 'PG', ovr: 82, age: 34 },
      { n: 'Manu Ginobili', pos: 'SG', ovr: 80, age: 39 }, { n: 'Danny Green', pos: 'SG', ovr: 78, age: 29 },
      { n: 'Patty Mills', pos: 'PG', ovr: 74, age: 28 }, { n: 'David West', pos: 'PF', ovr: 76, age: 35 },
      { n: 'Boris Diaw', pos: 'PF', ovr: 74, age: 34 } ],
    OKC: [ { n: 'Kevin Durant', pos: 'SF', ovr: 95, age: 28 }, { n: 'Russell Westbrook', pos: 'PG', ovr: 92, age: 28 },
      { n: 'Serge Ibaka', pos: 'PF', ovr: 82, age: 27 }, { n: 'Steven Adams', pos: 'C', ovr: 80, age: 23, pot: 86 },
      { n: 'Enes Kanter', pos: 'C', ovr: 78, age: 24 }, { n: 'Andre Roberson', pos: 'SF', ovr: 74, age: 25 },
      { n: 'Dion Waiters', pos: 'SG', ovr: 76, age: 25 }, { n: 'Cameron Payne', pos: 'PG', ovr: 70, age: 22 } ],
    TOR: [ { n: 'Kyle Lowry', pos: 'PG', ovr: 86, age: 30 }, { n: 'DeMar DeRozan', pos: 'SG', ovr: 85, age: 27 },
      { n: 'Jonas Valanciunas', pos: 'C', ovr: 80, age: 24 }, { n: 'DeMarre Carroll', pos: 'SF', ovr: 76, age: 30 },
      { n: 'Cory Joseph', pos: 'PG', ovr: 74, age: 25 }, { n: 'Patrick Patterson', pos: 'PF', ovr: 74, age: 27 },
      { n: 'Terrence Ross', pos: 'SG', ovr: 74, age: 25 }, { n: 'Bismack Biyombo', pos: 'C', ovr: 76, age: 24 } ],
    LAC: [ { n: 'Chris Paul', pos: 'PG', ovr: 90, age: 31 }, { n: 'Blake Griffin', pos: 'PF', ovr: 88, age: 27 },
      { n: 'DeAndre Jordan', pos: 'C', ovr: 84, age: 28 }, { n: 'J.J. Redick', pos: 'SG', ovr: 80, age: 32 },
      { n: 'Jamal Crawford', pos: 'SG', ovr: 78, age: 36 }, { n: 'Luc Mbah a Moute', pos: 'SF', ovr: 72, age: 30 },
      { n: 'Paul Pierce', pos: 'SF', ovr: 74, age: 39 }, { n: 'Austin Rivers', pos: 'PG', ovr: 72, age: 24 } ],
    MIA: [ { n: 'Dwyane Wade', pos: 'SG', ovr: 86, age: 34 }, { n: 'Chris Bosh', pos: 'PF', ovr: 84, age: 32 },
      { n: 'Hassan Whiteside', pos: 'C', ovr: 82, age: 27 }, { n: 'Goran Dragic', pos: 'PG', ovr: 82, age: 30 },
      { n: 'Luol Deng', pos: 'SF', ovr: 78, age: 31 }, { n: 'Justise Winslow', pos: 'SF', ovr: 74, age: 20, pot: 84 },
      { n: 'Josh Richardson', pos: 'SG', ovr: 72, age: 23 }, { n: 'Gerald Green', pos: 'SG', ovr: 72, age: 30 } ],
    BOS: [ { n: 'Isaiah Thomas', pos: 'PG', ovr: 86, age: 27 }, { n: 'Avery Bradley', pos: 'SG', ovr: 80, age: 26 },
      { n: 'Jae Crowder', pos: 'SF', ovr: 78, age: 26 }, { n: 'Marcus Smart', pos: 'PG', ovr: 78, age: 22, pot: 84 },
      { n: 'Kelly Olynyk', pos: 'C', ovr: 76, age: 25 }, { n: 'Amir Johnson', pos: 'PF', ovr: 74, age: 29 },
      { n: 'Jared Sullinger', pos: 'PF', ovr: 74, age: 24 }, { n: 'Evan Turner', pos: 'SG', ovr: 74, age: 28 } ],
    ATL: [ { n: 'Paul Millsap', pos: 'PF', ovr: 85, age: 31 }, { n: 'Al Horford', pos: 'C', ovr: 84, age: 30 },
      { n: 'Jeff Teague', pos: 'PG', ovr: 80, age: 28 }, { n: 'Kyle Korver', pos: 'SG', ovr: 80, age: 35 },
      { n: 'Dennis Schroder', pos: 'PG', ovr: 78, age: 23, pot: 85 }, { n: 'Kent Bazemore', pos: 'SF', ovr: 76, age: 27 },
      { n: 'Thabo Sefolosha', pos: 'SF', ovr: 72, age: 32 }, { n: 'Tiago Splitter', pos: 'C', ovr: 74, age: 31 } ],
    HOU: [ { n: 'James Harden', pos: 'SG', ovr: 90, age: 27 }, { n: 'Dwight Howard', pos: 'C', ovr: 82, age: 30 },
      { n: 'Trevor Ariza', pos: 'SF', ovr: 78, age: 31 }, { n: 'Patrick Beverley', pos: 'PG', ovr: 76, age: 28 },
      { n: 'Michael Beasley', pos: 'SF', ovr: 74, age: 27 }, { n: 'Corey Brewer', pos: 'SF', ovr: 72, age: 30 },
      { n: 'Terrence Jones', pos: 'PF', ovr: 74, age: 24 }, { n: 'K.J. McDaniels', pos: 'SG', ovr: 70, age: 23 } ],
    POR: [ { n: 'Damian Lillard', pos: 'PG', ovr: 88, age: 26 }, { n: 'C.J. McCollum', pos: 'SG', ovr: 84, age: 25 },
      { n: 'Al-Farouq Aminu', pos: 'SF', ovr: 78, age: 26 }, { n: 'Mason Plumlee', pos: 'C', ovr: 78, age: 26 },
      { n: 'Maurice Harkless', pos: 'SF', ovr: 74, age: 23 }, { n: 'Ed Davis', pos: 'PF', ovr: 74, age: 27 },
      { n: 'Allen Crabbe', pos: 'SG', ovr: 74, age: 24 }, { n: 'Meyers Leonard', pos: 'C', ovr: 72, age: 24 } ],
    IND: [ { n: 'Paul George', pos: 'SF', ovr: 88, age: 26 }, { n: 'Monta Ellis', pos: 'SG', ovr: 80, age: 30 },
      { n: 'George Hill', pos: 'PG', ovr: 80, age: 30 }, { n: 'Myles Turner', pos: 'C', ovr: 80, age: 20, pot: 89 },
      { n: 'C.J. Miles', pos: 'SF', ovr: 74, age: 29 }, { n: 'Ian Mahinmi', pos: 'C', ovr: 74, age: 29 },
      { n: 'Jordan Hill', pos: 'PF', ovr: 72, age: 28 }, { n: 'Rodney Stuckey', pos: 'SG', ovr: 72, age: 30 } ],
    DAL: [ { n: 'Dirk Nowitzki', pos: 'PF', ovr: 84, age: 37 }, { n: 'Wesley Matthews', pos: 'SG', ovr: 78, age: 29 },
      { n: 'Chandler Parsons', pos: 'SF', ovr: 78, age: 27 }, { n: 'Deron Williams', pos: 'PG', ovr: 78, age: 31 },
      { n: 'Zaza Pachulia', pos: 'C', ovr: 76, age: 32 }, { n: 'J.J. Barea', pos: 'PG', ovr: 74, age: 31 },
      { n: 'Raymond Felton', pos: 'PG', ovr: 72, age: 31 }, { n: 'Dwight Powell', pos: 'PF', ovr: 70, age: 24 } ],
    MEM: [ { n: 'Marc Gasol', pos: 'C', ovr: 84, age: 31 }, { n: 'Mike Conley', pos: 'PG', ovr: 84, age: 28 },
      { n: 'Zach Randolph', pos: 'PF', ovr: 80, age: 34 }, { n: 'Tony Allen', pos: 'SG', ovr: 76, age: 34 },
      { n: 'Courtney Lee', pos: 'SG', ovr: 74, age: 30 }, { n: 'Matt Barnes', pos: 'SF', ovr: 74, age: 36 },
      { n: 'JaMychal Green', pos: 'PF', ovr: 72, age: 25 }, { n: 'Vince Carter', pos: 'SG', ovr: 74, age: 39 } ],
    WAS: [ { n: 'John Wall', pos: 'PG', ovr: 86, age: 25 }, { n: 'Bradley Beal', pos: 'SG', ovr: 82, age: 22, pot: 90 },
      { n: 'Otto Porter Jr.', pos: 'SF', ovr: 76, age: 23 }, { n: 'Marcin Gortat', pos: 'C', ovr: 78, age: 32 },
      { n: 'Nene', pos: 'C', ovr: 74, age: 33 }, { n: 'Markieff Morris', pos: 'PF', ovr: 74, age: 26 },
      { n: 'Ramon Sessions', pos: 'PG', ovr: 72, age: 30 }, { n: 'Jared Dudley', pos: 'SF', ovr: 72, age: 30 } ],
    NOP: [ { n: 'Anthony Davis', pos: 'C', ovr: 88, age: 23, pot: 95 }, { n: 'Jrue Holiday', pos: 'PG', ovr: 82, age: 25 },
      { n: 'Tyreke Evans', pos: 'SG', ovr: 78, age: 26 }, { n: 'Ryan Anderson', pos: 'PF', ovr: 76, age: 28 },
      { n: 'Eric Gordon', pos: 'SG', ovr: 76, age: 27 }, { n: 'Omer Asik', pos: 'C', ovr: 72, age: 30 },
      { n: 'Norris Cole', pos: 'PG', ovr: 70, age: 27 }, { n: 'Dante Cunningham', pos: 'PF', ovr: 70, age: 29 } ],
  },
};

/* ==========================================================================
   Profondeur d'effectif par époque (best-effort) : rôle-players réels ajoutés
   pour porter chaque équipe à ~11-13 joueurs. Fusionnés avec dédoublonnage
   (un joueur déjà présent dans l'effectif de base n'est pas ré-ajouté).
   ========================================================================== */
const ERA_ROSTERS_EXTRA = {
  e1968: {
    "BOS":[{"n":"Larry Siegfried","pos":"SG","ovr":74,"age":28},{"n":"Wayne Embry","pos":"C","ovr":70,"age":31}],
    "PHI":[{"n":"Wali Jones","pos":"PG","ovr":74,"age":26},{"n":"Luke Jackson","pos":"PF","ovr":74,"age":26},{"n":"Matt Guokas","pos":"SG","ovr":70,"age":24},{"n":"Bill Melchionni","pos":"PG","ovr":65,"age":23}],
    "LAL":[{"n":"Darrall Imhoff","pos":"C","ovr":72,"age":29},{"n":"Mel Counts","pos":"C","ovr":71,"age":26},{"n":"Jerry Chambers","pos":"SF","ovr":66,"age":24}],
    "NYK":[{"n":"Emmette Bryant","pos":"PG","ovr":68,"age":29},{"n":"Phil Jackson","pos":"PF","ovr":66,"age":22},{"n":"Nate Bowman","pos":"C","ovr":64,"age":25}],
    "DET":[{"n":"Terry Dischinger","pos":"PF","ovr":73,"age":27},{"n":"Joe Strawder","pos":"C","ovr":68,"age":28},{"n":"John Tresvant","pos":"PF","ovr":68,"age":28}],
    "ATL":[{"n":"Joe Caldwell","pos":"SF","ovr":76,"age":26},{"n":"Paul Silas","pos":"PF","ovr":74,"age":25},{"n":"Don Ohl","pos":"SG","ovr":73,"age":32},{"n":"Gene Tormohlen","pos":"C","ovr":64,"age":30}],
    "GSW":[{"n":"Al Attles","pos":"PG","ovr":72,"age":31},{"n":"Fred Hetzel","pos":"PF","ovr":72,"age":26},{"n":"Clyde Lee","pos":"C","ovr":70,"age":24},{"n":"Jim King","pos":"PG","ovr":69,"age":27}],
    "SAC":[{"n":"Connie Dierking","pos":"C","ovr":72,"age":31},{"n":"Bob Love","pos":"SF","ovr":71,"age":25},{"n":"Flynn Robinson","pos":"PG","ovr":71,"age":27},{"n":"Walt Wesley","pos":"C","ovr":66,"age":23}],
    "CHI":[{"n":"Keith Erickson","pos":"SF","ovr":72,"age":24},{"n":"Clem Haskins","pos":"SG","ovr":72,"age":24},{"n":"Jim Washington","pos":"PF","ovr":69,"age":24},{"n":"Erwin Mueller","pos":"SF","ovr":67,"age":25}],
    "OKC":[{"n":"Rod Thorn","pos":"SG","ovr":70,"age":27},{"n":"Bud Olsen","pos":"PF","ovr":64,"age":28},{"n":"Al Tucker","pos":"SF","ovr":64,"age":24},{"n":"Tommy Kron","pos":"PG","ovr":63,"age":25}]
  },
  e1986: {
    "BOS":[{"n":"Rick Carlisle","pos":"PG","ovr":64,"age":27},{"n":"Greg Kite","pos":"C","ovr":62,"age":25}],
    "LAL":[{"n":"Larry Spriggs","pos":"SF","ovr":63,"age":27}],
    "PHI":[{"n":"Clemon Johnson","pos":"C","ovr":66,"age":30},{"n":"Leon Wood","pos":"PG","ovr":63,"age":24}],
    "MIL":[{"n":"Craig Hodges","pos":"SG","ovr":69,"age":26},{"n":"Randy Breuer","pos":"C","ovr":65,"age":26}],
    "HOU":[{"n":"Robert Reid","pos":"SF","ovr":72,"age":31},{"n":"Mitchell Wiggins","pos":"SG","ovr":68,"age":27},{"n":"Allen Leavell","pos":"PG","ovr":67,"age":29}],
    "DET":[{"n":"John Long","pos":"SG","ovr":70,"age":30},{"n":"Kent Benson","pos":"C","ovr":66,"age":32},{"n":"Earl Cureton","pos":"PF","ovr":63,"age":29}],
    "ATL":[{"n":"Cliff Levingston","pos":"PF","ovr":68,"age":25},{"n":"Jon Koncak","pos":"C","ovr":65,"age":23}],
    "DAL":[{"n":"Dale Ellis","pos":"SG","ovr":74,"age":26},{"n":"James Donaldson","pos":"C","ovr":73,"age":29},{"n":"Brad Davis","pos":"PG","ovr":71,"age":31},{"n":"Detlef Schrempf","pos":"SF","ovr":66,"age":23}],
    "POR":[{"n":"Jim Paxson","pos":"SG","ovr":74,"age":29},{"n":"Kenny Carr","pos":"PF","ovr":70,"age":31},{"n":"Terry Porter","pos":"PG","ovr":68,"age":23},{"n":"Jerome Kersey","pos":"SF","ovr":67,"age":24}],
    "DEN":[{"n":"Wayne Cooper","pos":"C","ovr":69,"age":30},{"n":"Danny Schayes","pos":"C","ovr":67,"age":27},{"n":"Bill Hanzlik","pos":"SF","ovr":66,"age":29},{"n":"T.R. Dunn","pos":"SG","ovr":65,"age":31}],
    "UTA":[{"n":"Darrell Griffith","pos":"SG","ovr":73,"age":28},{"n":"Thurl Bailey","pos":"PF","ovr":73,"age":25},{"n":"Rickey Green","pos":"PG","ovr":72,"age":32},{"n":"Bobby Hansen","pos":"SG","ovr":66,"age":25}],
    "PHX":[{"n":"James Edwards","pos":"C","ovr":72,"age":31},{"n":"Alvan Adams","pos":"C","ovr":72,"age":32},{"n":"Jay Humphries","pos":"PG","ovr":68,"age":24},{"n":"Mike Sanders","pos":"SF","ovr":66,"age":26}],
    "CHI":[{"n":"Quintin Dailey","pos":"SG","ovr":71,"age":25},{"n":"Dave Corzine","pos":"C","ovr":68,"age":30},{"n":"Gene Banks","pos":"SF","ovr":68,"age":27},{"n":"John Paxson","pos":"PG","ovr":66,"age":26}],
    "NYK":[{"n":"Rory Sparrow","pos":"PG","ovr":68,"age":28},{"n":"Trent Tucker","pos":"SG","ovr":68,"age":27},{"n":"Pat Cummings","pos":"PF","ovr":68,"age":30},{"n":"Gerald Wilkins","pos":"SG","ovr":67,"age":23}],
    "WAS":[{"n":"Cliff Robinson","pos":"SF","ovr":72,"age":26},{"n":"Dan Roundfield","pos":"PF","ovr":71,"age":33},{"n":"Manute Bol","pos":"C","ovr":64,"age":24},{"n":"Frank Johnson","pos":"PG","ovr":65,"age":28}],
    "BKN":[{"n":"Mike Gminski","pos":"C","ovr":72,"age":27},{"n":"Albert King","pos":"SF","ovr":70,"age":27},{"n":"Darwin Cook","pos":"PG","ovr":66,"age":28},{"n":"Mike O'Koren","pos":"SF","ovr":64,"age":28}]
  },
  e1996: {
    "CHI":[{"n":"Bill Wennington","pos":"C","ovr":68,"age":33},{"n":"Jud Buechler","pos":"SF","ovr":65,"age":28},{"n":"Randy Brown","pos":"PG","ovr":66,"age":28},{"n":"Dickey Simpkins","pos":"PF","ovr":64,"age":24}],
    "OKC":[{"n":"Sam Perkins","pos":"C","ovr":74,"age":34},{"n":"Nate McMillan","pos":"PG","ovr":71,"age":31},{"n":"Vincent Askew","pos":"SF","ovr":68,"age":30},{"n":"Ervin Johnson","pos":"C","ovr":66,"age":28}],
    "ORL":[{"n":"Brian Shaw","pos":"PG","ovr":68,"age":30},{"n":"Anthony Bowie","pos":"SG","ovr":65,"age":33},{"n":"Donald Royal","pos":"SF","ovr":64,"age":30},{"n":"Jeff Turner","pos":"PF","ovr":62,"age":34}],
    "HOU":[{"n":"Kenny Smith","pos":"PG","ovr":72,"age":30},{"n":"Mario Elie","pos":"SF","ovr":73,"age":32},{"n":"Chucky Brown","pos":"PF","ovr":64,"age":28},{"n":"Pete Chilcutt","pos":"PF","ovr":63,"age":27}],
    "SAS":[{"n":"Will Perdue","pos":"C","ovr":68,"age":30},{"n":"J.R. Reid","pos":"PF","ovr":68,"age":28},{"n":"Doc Rivers","pos":"PG","ovr":68,"age":34},{"n":"Monty Williams","pos":"SF","ovr":64,"age":24}],
    "UTA":[{"n":"Chris Morris","pos":"SF","ovr":70,"age":30},{"n":"Adam Keefe","pos":"PF","ovr":65,"age":26},{"n":"Greg Ostertag","pos":"C","ovr":65,"age":23},{"n":"Bryon Russell","pos":"SF","ovr":67,"age":25}],
    "LAL":[{"n":"Magic Johnson","pos":"PF","ovr":79,"age":36},{"n":"Anthony Peeler","pos":"SG","ovr":68,"age":26},{"n":"George Lynch","pos":"SF","ovr":65,"age":25},{"n":"Corie Blount","pos":"PF","ovr":62,"age":27}],
    "NYK":[{"n":"Charles Smith","pos":"PF","ovr":68,"age":30},{"n":"Hubert Davis","pos":"SG","ovr":68,"age":26},{"n":"Charlie Ward","pos":"PG","ovr":64,"age":25},{"n":"Herb Williams","pos":"C","ovr":62,"age":38}],
    "IND":[{"n":"Derrick McKey","pos":"SF","ovr":72,"age":30},{"n":"Ricky Pierce","pos":"SG","ovr":68,"age":36},{"n":"Duane Ferrell","pos":"SF","ovr":63,"age":31},{"n":"Haywoode Workman","pos":"PG","ovr":63,"age":30}],
    "PHX":[{"n":"Wesley Person","pos":"SG","ovr":71,"age":25},{"n":"Danny Manning","pos":"PF","ovr":74,"age":30},{"n":"A.C. Green","pos":"PF","ovr":71,"age":32},{"n":"Wayman Tisdale","pos":"PF","ovr":68,"age":32}],
    "POR":[{"n":"Aaron McKie","pos":"SG","ovr":68,"age":23},{"n":"Buck Williams","pos":"PF","ovr":68,"age":35},{"n":"James Robinson","pos":"SG","ovr":63,"age":26},{"n":"Harvey Grant","pos":"SF","ovr":63,"age":30}],
    "PHI":[{"n":"Sharone Wright","pos":"C","ovr":64,"age":23},{"n":"Ed Pinckney","pos":"C","ovr":63,"age":33},{"n":"Rex Walters","pos":"PG","ovr":62,"age":25},{"n":"Willie Burton","pos":"SG","ovr":65,"age":28}],
    "DET":[{"n":"Joe Dumars","pos":"SG","ovr":78,"age":33},{"n":"Terry Mills","pos":"PF","ovr":68,"age":28},{"n":"Theo Ratliff","pos":"C","ovr":64,"age":23},{"n":"Don Reid","pos":"C","ovr":62,"age":23}],
    "MIA":[{"n":"Kevin Willis","pos":"PF","ovr":72,"age":33},{"n":"Walt Williams","pos":"SF","ovr":68,"age":25},{"n":"Keith Askins","pos":"SF","ovr":62,"age":28},{"n":"Kurt Thomas","pos":"PF","ovr":64,"age":23}],
    "ATL":[{"n":"Ken Norman","pos":"SF","ovr":68,"age":32},{"n":"Tyrone Corbin","pos":"SF","ovr":65,"age":33},{"n":"Craig Ehlo","pos":"SG","ovr":64,"age":35},{"n":"Alan Henderson","pos":"PF","ovr":63,"age":23}],
    "DAL":[{"n":"George McCloud","pos":"SG","ovr":70,"age":28},{"n":"Chris Gatling","pos":"PF","ovr":70,"age":28},{"n":"Cherokee Parks","pos":"C","ovr":63,"age":24},{"n":"Loren Meyer","pos":"C","ovr":62,"age":23}]
  },
  e2016: {
    "GSW":[{"n":"Festus Ezeli","pos":"C","ovr":70,"age":26},{"n":"Marreese Speights","pos":"C","ovr":70,"age":28},{"n":"Leandro Barbosa","pos":"SG","ovr":71,"age":33},{"n":"Brandon Rush","pos":"SF","ovr":66,"age":30}],
    "CLE":[{"n":"Iman Shumpert","pos":"SG","ovr":73,"age":25},{"n":"Matthew Dellavedova","pos":"PG","ovr":71,"age":25},{"n":"Timofey Mozgov","pos":"C","ovr":73,"age":29},{"n":"Richard Jefferson","pos":"SF","ovr":70,"age":35}],
    "SAS":[{"n":"Boris Diaw","pos":"PF","ovr":74,"age":33},{"n":"David West","pos":"PF","ovr":74,"age":35},{"n":"Kyle Anderson","pos":"SF","ovr":68,"age":22},{"n":"Boban Marjanovic","pos":"C","ovr":67,"age":27}],
    "OKC":[{"n":"Dion Waiters","pos":"SG","ovr":74,"age":24},{"n":"Anthony Morrow","pos":"SG","ovr":68,"age":30},{"n":"Cameron Payne","pos":"PG","ovr":66,"age":21},{"n":"Nick Collison","pos":"PF","ovr":66,"age":35}],
    "TOR":[{"n":"Patrick Patterson","pos":"PF","ovr":74,"age":27},{"n":"Terrence Ross","pos":"SG","ovr":72,"age":25},{"n":"Bismack Biyombo","pos":"C","ovr":73,"age":23},{"n":"Luis Scola","pos":"PF","ovr":71,"age":35}],
    "LAC":[{"n":"Austin Rivers","pos":"SG","ovr":71,"age":23},{"n":"Wesley Johnson","pos":"SF","ovr":68,"age":28},{"n":"Paul Pierce","pos":"SF","ovr":72,"age":38},{"n":"Cole Aldrich","pos":"C","ovr":69,"age":27}],
    "MIA":[{"n":"Josh Richardson","pos":"SG","ovr":69,"age":22},{"n":"Justise Winslow","pos":"SF","ovr":71,"age":20},{"n":"Tyler Johnson","pos":"SG","ovr":70,"age":24},{"n":"Gerald Green","pos":"SG","ovr":70,"age":30}],
    "BOS":[{"n":"Jared Sullinger","pos":"PF","ovr":74,"age":24},{"n":"Tyler Zeller","pos":"C","ovr":69,"age":26},{"n":"Jonas Jerebko","pos":"PF","ovr":68,"age":29},{"n":"Terry Rozier","pos":"PG","ovr":66,"age":22}],
    "ATL":[{"n":"Kent Bazemore","pos":"SF","ovr":73,"age":26},{"n":"Thabo Sefolosha","pos":"SF","ovr":70,"age":31},{"n":"Tiago Splitter","pos":"C","ovr":71,"age":31},{"n":"Mike Scott","pos":"PF","ovr":67,"age":27}],
    "HOU":[{"n":"Clint Capela","pos":"C","ovr":73,"age":21},{"n":"Corey Brewer","pos":"SF","ovr":71,"age":30},{"n":"Terrence Jones","pos":"PF","ovr":72,"age":24},{"n":"Ty Lawson","pos":"PG","ovr":72,"age":28}],
    "POR":[{"n":"Allen Crabbe","pos":"SG","ovr":72,"age":23},{"n":"Meyers Leonard","pos":"C","ovr":70,"age":24},{"n":"Ed Davis","pos":"PF","ovr":72,"age":26},{"n":"Maurice Harkless","pos":"SF","ovr":71,"age":22}],
    "IND":[{"n":"C.J. Miles","pos":"SF","ovr":72,"age":28},{"n":"Rodney Stuckey","pos":"SG","ovr":72,"age":29},{"n":"Solomon Hill","pos":"SF","ovr":68,"age":24},{"n":"Jordan Hill","pos":"C","ovr":70,"age":28}],
    "DAL":[{"n":"J.J. Barea","pos":"PG","ovr":72,"age":31},{"n":"Devin Harris","pos":"PG","ovr":71,"age":33},{"n":"Raymond Felton","pos":"PG","ovr":70,"age":31},{"n":"Dwight Powell","pos":"PF","ovr":69,"age":24}],
    "MEM":[{"n":"Matt Barnes","pos":"SF","ovr":72,"age":36},{"n":"Vince Carter","pos":"SG","ovr":70,"age":39},{"n":"Mario Chalmers","pos":"PG","ovr":72,"age":29},{"n":"JaMychal Green","pos":"PF","ovr":70,"age":25}],
    "WAS":[{"n":"Ramon Sessions","pos":"PG","ovr":71,"age":30},{"n":"Jared Dudley","pos":"SF","ovr":70,"age":30},{"n":"Garrett Temple","pos":"SG","ovr":69,"age":30},{"n":"Markieff Morris","pos":"PF","ovr":74,"age":26}]
  }
};

// Fusion dédoublonnée des rôle-players dans les effectifs d'époque.
(function () {
  if (typeof ERA_ROSTERS_EXTRA === 'undefined') return;
  Object.keys(ERA_ROSTERS_EXTRA).forEach(function (era) {
    if (!ERA_ROSTERS[era]) return;
    Object.keys(ERA_ROSTERS_EXTRA[era]).forEach(function (tid) {
      if (!ERA_ROSTERS[era][tid]) return;
      var have = {};
      ERA_ROSTERS[era][tid].forEach(function (p) { have[p.n] = 1; });
      ERA_ROSTERS_EXTRA[era][tid].forEach(function (p) {
        if (!have[p.n]) { ERA_ROSTERS[era][tid].push(p); have[p.n] = 1; }
      });
    });
  });
})();

/* ==========================================================================
   Second passage de profondeur : bancs profonds réels (9e-12e homme) vérifiés,
   pour porter chaque équipe d'époque à ~11-12 joueurs. Clés « name » ou « n »
   tolérées et normalisées à la fusion.
   ========================================================================== */
const ERA_ROSTERS_EXTRA2 = {
  e1968: {
    "BOS":[{"n":"Tom Thacker","pos":"SG","ovr":65,"age":28},{"n":"Mal Graham","pos":"PG","ovr":61,"age":22},{"n":"Rick Weitzman","pos":"SG","ovr":60,"age":21}],
    "PHI":[{"n":"Larry Costello","pos":"PG","ovr":68,"age":36},{"n":"Craig Raymond","pos":"C","ovr":61,"age":24},{"n":"Jim Reid","pos":"PF","ovr":60,"age":23}],
    "LAL":[{"n":"John Wetzel","pos":"SG","ovr":62,"age":24},{"n":"Jim Barnes","pos":"C","ovr":66,"age":27},{"n":"Cliff Anderson","pos":"PF","ovr":61,"age":24}],
    "NYK":[{"n":"Howard Komives","pos":"PG","ovr":68,"age":26}],
    "DET":[{"n":"Len Chappell","pos":"PF","ovr":66,"age":27},{"n":"Wayne Hightower","pos":"SF","ovr":65,"age":28}],
    "ATL":[{"n":"Dick Snyder","pos":"SG","ovr":66,"age":24},{"n":"Tom Workman","pos":"SF","ovr":60,"age":24}],
    "GSW":[{"n":"Joe Ellis","pos":"SF","ovr":64,"age":24},{"n":"Bill Turner","pos":"PF","ovr":61,"age":24},{"n":"Bob Warlick","pos":"SG","ovr":63,"age":28}],
    "SAC":[{"n":"Jim Fox","pos":"C","ovr":62,"age":24}],
    "CHI":[{"n":"Dave Schellhase","pos":"SG","ovr":60,"age":24},{"n":"Craig Spitzer","pos":"C","ovr":60,"age":22},{"n":"Reggie Harding","pos":"C","ovr":63,"age":25}],
    "OKC":[{"n":"George Wilson","pos":"PF","ovr":63,"age":25},{"n":"Henry Akin","pos":"C","ovr":60,"age":23},{"n":"Plummer Lott","pos":"SF","ovr":60,"age":23}]
  },
  e1986: {
    "BOS":[{"name":"Sam Vincent","pos":"PG","age":22,"ovr":66}],
    "LAL":[{"name":"Mitch Kupchak","pos":"PF","age":31,"ovr":66},{"name":"Petur Gudmundsson","pos":"C","age":27,"ovr":61}],
    "PHI":[{"name":"Terry Catledge","pos":"PF","age":22,"ovr":66},{"name":"Greg Stokes","pos":"C","age":22,"ovr":61}],
    "MIL":[{"name":"Mike Glenn","pos":"SG","age":30,"ovr":65},{"name":"Kenny Fields","pos":"SF","age":24,"ovr":63},{"name":"Charles Davis","pos":"PF","age":27,"ovr":62}],
    "HOU":[{"name":"John Lucas","pos":"PG","age":32,"ovr":68},{"name":"Craig Ehlo","pos":"SG","age":24,"ovr":64},{"name":"Steve Harris","pos":"SG","age":22,"ovr":62},{"name":"Granville Waiters","pos":"C","age":25,"ovr":60}],
    "DET":[{"name":"Tony Campbell","pos":"SF","age":23,"ovr":65}],
    "ATL":[{"name":"Eddie Johnson","pos":"PG","age":31,"ovr":66},{"name":"Scott Hastings","pos":"C","age":25,"ovr":61},{"name":"Sedric Toney","pos":"PG","age":23,"ovr":60}],
    "DAL":[{"name":"Jay Vincent","pos":"PF","age":26,"ovr":68},{"name":"Uwe Blab","pos":"C","age":24,"ovr":60},{"name":"Wallace Bryant","pos":"C","age":26,"ovr":60},{"name":"Charlie Sitton","pos":"PF","age":24,"ovr":60}],
    "POR":[{"name":"Steve Colter","pos":"PG","age":23,"ovr":65},{"name":"Caldwell Jones","pos":"C","age":35,"ovr":64}],
    "DEN":[{"name":"Mike Evans","pos":"PG","age":30,"ovr":64},{"name":"Blair Rasmussen","pos":"C","age":23,"ovr":63},{"name":"Elston Turner","pos":"SG","age":26,"ovr":62},{"name":"Willie White","pos":"SG","age":24,"ovr":60}],
    "UTA":[{"name":"Fred Roberts","pos":"SF","age":25,"ovr":63},{"name":"Pace Mannion","pos":"SG","age":25,"ovr":61},{"name":"Carey Scurry","pos":"SF","age":23,"ovr":60}],
    "PHX":[{"name":"Bernard Thompson","pos":"SG","age":23,"ovr":62},{"name":"Michael Holton","pos":"PG","age":24,"ovr":61},{"name":"Charles Pittman","pos":"SF","age":28,"ovr":60},{"name":"Nick Vanos","pos":"C","age":22,"ovr":60}],
    "CHI":[{"name":"George Gervin","pos":"SG","age":33,"ovr":70},{"name":"Jawann Oldham","pos":"C","age":28,"ovr":62},{"name":"Ennis Whatley","pos":"PG","age":23,"ovr":62}],
    "NYK":[{"name":"Darrell Walker","pos":"SG","age":25,"ovr":66},{"name":"James Bailey","pos":"PF","age":28,"ovr":63},{"name":"Ernie Grunfeld","pos":"SF","age":30,"ovr":62},{"name":"Ken Bannister","pos":"C","age":26,"ovr":61}],
    "WAS":[{"name":"Tom McMillen","pos":"PF","age":33,"ovr":63},{"name":"Darren Daye","pos":"SF","age":25,"ovr":62},{"name":"Charles Jones","pos":"C","age":28,"ovr":61}],
    "BKN":[{"name":"Kelvin Ransey","pos":"PG","age":28,"ovr":65},{"name":"Mickey Johnson","pos":"SF","age":33,"ovr":64},{"name":"Jeff Turner","pos":"PF","age":23,"ovr":62}]
  },
  e1996: {
    "CHI":[{"name":"Jason Caffey","pos":"PF","age":22,"ovr":64}],
    "OKC":[{"name":"Frank Brickowski","pos":"PF","age":36,"ovr":66},{"name":"Sarunas Marciulionis","pos":"SG","age":32,"ovr":70},{"name":"David Wingate","pos":"SG","age":32,"ovr":63},{"name":"Eric Snow","pos":"PG","age":23,"ovr":62}],
    "ORL":[{"name":"Darrell Armstrong","pos":"PG","age":28,"ovr":63},{"name":"Anthony Avent","pos":"PF","age":27,"ovr":61}],
    "HOU":[{"name":"Eddie Johnson","pos":"SF","age":37,"ovr":70},{"name":"Charles Jones","pos":"C","age":38,"ovr":60},{"name":"Tim Breaux","pos":"SF","age":26,"ovr":61}],
    "SAS":[{"name":"Cory Alexander","pos":"PG","age":22,"ovr":62},{"name":"Carl Herrera","pos":"PF","age":29,"ovr":65},{"name":"Greg Anderson","pos":"C","age":32,"ovr":64}],
    "UTA":[{"name":"David Benoit","pos":"SF","age":27,"ovr":65},{"name":"Felton Spencer","pos":"C","age":28,"ovr":64},{"name":"Jamie Watson","pos":"SF","age":26,"ovr":61}],
    "LAL":[{"name":"Sedale Threatt","pos":"PG","age":35,"ovr":67},{"name":"Fred Roberts","pos":"SF","age":36,"ovr":61},{"name":"Derek Strong","pos":"PF","age":28,"ovr":63}],
    "NYK":[{"name":"Doug Christie","pos":"SG","age":26,"ovr":66},{"name":"Anthony Bonner","pos":"SF","age":30,"ovr":61}],
    "IND":[{"name":"LaSalle Thompson","pos":"C","age":34,"ovr":62},{"name":"Fred Hoiberg","pos":"SG","age":23,"ovr":62}],
    "PHX":[{"name":"Danny Ainge","pos":"SG","age":37,"ovr":69},{"name":"Joe Kleine","pos":"C","age":34,"ovr":61},{"name":"Mario Bennett","pos":"PF","age":23,"ovr":60},{"name":"Antonio Lang","pos":"SF","age":23,"ovr":60}],
    "POR":[{"name":"Randolph Childress","pos":"PG","age":23,"ovr":62},{"name":"Dontonio Wingfield","pos":"SF","age":21,"ovr":61}],
    "PHI":[{"name":"Greg Graham","pos":"SG","age":25,"ovr":62},{"name":"Richard Dumas","pos":"SF","age":26,"ovr":63}],
    "DET":[{"name":"Mark West","pos":"C","age":35,"ovr":63},{"name":"Rafael Addison","pos":"SF","age":31,"ovr":62}],
    "MIA":[{"name":"Sasha Danilovic","pos":"SG","age":26,"ovr":68},{"name":"John Salley","pos":"C","age":31,"ovr":63}],
    "ATL":[{"name":"Stacey Augmon","pos":"SF","age":27,"ovr":68},{"name":"Andrew Lang","pos":"C","age":30,"ovr":64},{"name":"Ivano Newbill","pos":"C","age":25,"ovr":60},{"name":"Donnie Boyce","pos":"SG","age":23,"ovr":60}],
    "DAL":[{"name":"Lorenzo Williams","pos":"C","age":27,"ovr":62},{"name":"Scott Brooks","pos":"PG","age":30,"ovr":61},{"name":"Terry Davis","pos":"PF","age":28,"ovr":62}]
  },
  e2016: {
    "GSW":[{"name":"Ian Clark","ovr":68,"age":25,"pos":"SG"}],
    "CLE":[{"name":"Mo Williams","ovr":70,"age":33,"pos":"PG"},{"name":"James Jones","ovr":64,"age":35,"pos":"SF"}],
    "SAS":[{"name":"Jonathon Simmons","ovr":69,"age":26,"pos":"SG"}],
    "OKC":[{"name":"Kyle Singler","ovr":66,"age":28,"pos":"SF"},{"name":"Randy Foye","ovr":67,"age":32,"pos":"SG"}],
    "TOR":[{"name":"James Johnson","ovr":70,"age":29,"pos":"PF"},{"name":"Norman Powell","ovr":68,"age":22,"pos":"SG"},{"name":"Delon Wright","ovr":65,"age":23,"pos":"PG"}],
    "LAC":[{"name":"Jeff Green","ovr":72,"age":29,"pos":"SF"},{"name":"Pablo Prigioni","ovr":64,"age":38,"pos":"PG"}],
    "MIA":[{"name":"Joe Johnson","ovr":72,"age":34,"pos":"SF"},{"name":"Amar'e Stoudemire","ovr":68,"age":33,"pos":"C"},{"name":"Udonis Haslem","ovr":64,"age":35,"pos":"PF"}],
    "BOS":[{"name":"R.J. Hunter","ovr":62,"age":22,"pos":"SG"}],
    "ATL":[{"name":"Tim Hardaway Jr.","ovr":70,"age":24,"pos":"SG"},{"name":"Kris Humphries","ovr":68,"age":31,"pos":"PF"},{"name":"Kirk Hinrich","ovr":64,"age":35,"pos":"PG"}],
    "HOU":[{"name":"Jason Terry","ovr":68,"age":38,"pos":"PG"},{"name":"Donatas Motiejunas","ovr":69,"age":25,"pos":"PF"}],
    "POR":[{"name":"Gerald Henderson","ovr":70,"age":28,"pos":"SG"},{"name":"Noah Vonleh","ovr":66,"age":20,"pos":"PF"},{"name":"Chris Kaman","ovr":65,"age":33,"pos":"C"},{"name":"Pat Connaughton","ovr":62,"age":23,"pos":"SG"}],
    "IND":[{"name":"Lavoy Allen","ovr":66,"age":27,"pos":"PF"},{"name":"Glenn Robinson III","ovr":64,"age":22,"pos":"SF"},{"name":"Joe Young","ovr":61,"age":23,"pos":"PG"}],
    "DAL":[{"name":"David Lee","ovr":71,"age":32,"pos":"PF"},{"name":"Justin Anderson","ovr":64,"age":22,"pos":"SG"},{"name":"Salah Mejri","ovr":62,"age":29,"pos":"C"}],
    "MEM":[{"name":"Lance Stephenson","ovr":69,"age":25,"pos":"SG"}],
    "WAS":[{"name":"Kelly Oubre Jr.","ovr":66,"age":20,"pos":"SF"},{"name":"Drew Gooden","ovr":63,"age":34,"pos":"PF"},{"name":"Alan Anderson","ovr":63,"age":33,"pos":"SG"}],
    "NOP":[{"name":"Alexis Ajinca","ovr":67,"age":28,"pos":"C"},{"name":"Luke Babbitt","ovr":65,"age":26,"pos":"SF"},{"name":"Alonzo Gee","ovr":63,"age":28,"pos":"SF"},{"name":"Toney Douglas","ovr":63,"age":30,"pos":"PG"}]
  }
};

// Fusion du second passage (normalise la clé nom, dédoublonne).
(function () {
  if (typeof ERA_ROSTERS_EXTRA2 === 'undefined') return;
  Object.keys(ERA_ROSTERS_EXTRA2).forEach(function (era) {
    if (!ERA_ROSTERS[era]) return;
    Object.keys(ERA_ROSTERS_EXTRA2[era]).forEach(function (tid) {
      if (!ERA_ROSTERS[era][tid]) return;
      var have = {};
      ERA_ROSTERS[era][tid].forEach(function (p) { have[p.n] = 1; });
      ERA_ROSTERS_EXTRA2[era][tid].forEach(function (p) {
        var nm = p.n || p.name;
        if (nm && !have[nm]) { ERA_ROSTERS[era][tid].push({ n: nm, pos: p.pos, ovr: p.ovr, age: p.age }); have[nm] = 1; }
      });
    });
  });
})();
