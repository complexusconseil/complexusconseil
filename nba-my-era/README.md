# 🏀 NBA My Era — Jeu de gestion de franchise

Un jeu de gestion façon **NBA 2K – mode My Era**, entièrement jouable **en local** dans votre navigateur.
Aucune installation, aucun serveur, aucune connexion internet requise.

## ▶️ Comment jouer

1. Ouvrez le fichier **`index.html`** dans votre navigateur
   (double-cliquez dessus, ou clic droit → « Ouvrir avec » → votre navigateur).
2. Choisissez votre nom de manager et **votre franchise NBA** (les 30 équipes sont disponibles).
3. Gérez votre équipe et enchaînez les saisons !

> La partie est **sauvegardée automatiquement** dans votre navigateur (localStorage).
> Vous pouvez aussi exporter/importer une sauvegarde en fichier `.json` via le menu ☰.

## 🎮 Ce que vous pouvez faire (mode My Era)

- **Effectif** — 15 joueurs par équipe, notes (OVR), potentiel, âge, contrats, stats.
- **Cinq de départ & rotations** — choisissez vos titulaires poste par poste et répartissez les minutes.
- **Matchs** — jouez chaque match avec **feuille de score détaillée** (box score joueur par joueur) ou simulez rapidement.
- **Saison régulière de 82 matchs** — calendrier complet, classements Est/Ouest en direct.
- **Systèmes tactiques** — choisissez un **schéma offensif** (Pace & Space, Seven Seconds, jeu intérieur, Iso stars, Motion…) **et défensif** (homme à homme, switch, zone 2-3, drop, pressing…), avec des effets réels sur la simulation. **Changez de schéma en direct pendant le match** (par quart-temps).
- **Options prioritaires en attaque** — définissez la hiérarchie offensive (qui prend le plus de tirs : option n°1, n°2…). Impacte directement le nombre de tirs et la production.
- **Match par quart-temps** — jouez quart-temps par quart-temps, ajustez vos systèmes selon le score, puis consultez la feuille de match détaillée.
- **Transferts réalistes** — échangez joueurs **et picks de draft** ; l'IA applique un **équilibre salarial** (type NBA), valorise jeunesse, potentiel et besoins de poste, et refuse les offres déséquilibrées. Des offres arrivent aussi spontanément.
- **Scouting de draft** — explorez les **prochaines cuvées (jusqu'à 2030)**, dépensez des points de scouting pour affiner l'évaluation des prospects (fourchette de note → note exacte). Têtes d'affiche réelles connues ; les autres prospects sont des projections.
- **Blessures** — paliers de gravité (légère → **de saison** type rupture d'Achille/LCA), exclusion de la simulation, guérison progressive et **séquelles** possibles au retour d'une blessure majeure.
- **Historique & récompenses** — archive de chaque saison : champion, finaliste, votre parcours, vos titres, et les **trophées individuels** (MVP, Défenseur de l'année, 6e homme, Progression/MIP, Rookie de l'année, équipes **All-NBA** et **All-Stars**). Les récompenses gagnées apparaissent sur la fiche de chaque joueur.
- **Carrières & Panthéon** — carrière complète saison par saison de chaque joueur (totaux, moyennes, distinctions), **Hall of Fame** et registre des retraités (carrière consultable).
- **Livre des records** — histoire de chaque **franchise** (titres, finales, bilan all-time, meilleure saison, MVP), et **records de la ligue** (meneurs de points/rebonds/passes en carrière, meilleures saisons individuelles, titres par franchise).
- **Finales All-Time** — confrontez deux équipes de **n'importe quelle époque** (ex. Bulls 1996 vs Warriors 2016) au meilleur des 7 sur terrain neutre, avec MVP des finales.
- **Objectifs de la direction** — chaque saison, le board fixe une **attente** (titre, playoffs, développement…) selon la force de l'effectif ; réussir renforce sa confiance, échouer l'érode — jusqu'au **limogeage** (avec possibilité de sursis).
- **Numéros retirés** — les Hall of Famers voient leur **maillot retiré** par leur franchise principale (détail dans la fiche de chaque franchise).
- **Récits & jalons** — actualités narratives : **éclosion** de jeunes stars, **paliers de points** en carrière (10k, 20k…).
- **Frise des dynasties** — chronologie des champions et détection des **dynasties** (titres consécutifs), classement des titres par franchise.
- **Staff & entraînement** — embauchez votre **staff technique** (entraîneur principal, coordinateurs offensif/défensif, développement, médical) sur un marché renouvelé chaque intersaison. Un bon staff améliore l'adresse, le **développement des jeunes** et **réduit les blessures**. Choisissez aussi un **axe d'entraînement** (tir, défense…) qui fait progresser vos jeunes.
- **Moral & chimie du vestiaire** — chaque joueur a un **moral** (résultats, temps de jeu vs attendu, blessures) ; la **chimie** de l'équipe module légèrement les performances. Indicateurs sur l'effectif et le tableau de bord.
- **Contrats max & extensions rookie** — salaires **plafonnés** selon l'ancienneté ; les jeunes draftés peuvent recevoir une **extension rookie** (contrat max), avec un moral en hausse à la prolongation.
- **Répartition selon la stratégie** — le schéma offensif détermine **qui prend les tirs** : *Pace & Space* met les tireurs en avant, *Jeu intérieur* les pivots, *Motion* répartit, *Iso stars* concentre sur les options n°1/n°2. Chaque équipe (IA comprise) a donc un profil de marqueurs cohérent avec sa stratégie.
- **Négociations de contrat** — agents libres et prolongations passent par une **vraie négociation** : le joueur peut **accepter**, **faire une contre-offre** (pré-remplie) ou **refuser** selon sa demande (valeur, âge, moral, durée). La **concurrence** signe aussi les meilleurs agents libres — mieux vaut ne pas traîner.
- **Présentation & graphiques** — tableau de bord avec **graphiques** (meilleurs marqueurs, forme des 10 derniers matchs, différentiel de points), et **présentation d'avant-match** (comparatif des deux équipes : note, bilan, chimie, leader, schémas).
- **Infos de négociation** — jauge d'**intérêt** du joueur en temps réel selon votre offre (salaire, durée, moral).
- **Rendu 3D du match** — un **vrai rendu 3D** (Three.js embarqué localement) : terrain, paniers, joueurs, ballon et tirs animés, **caméra orbitale** (glisser/molette). Bouton « 🎥 Regarder en 3D » avant match. *(Stylisé, pas photoréaliste.)*
- **Mode Europe** — jouez une carrière de **club européen (EuroLeague)** : 16 clubs, saison + playoffs, avec toute la gestion (tactiques, transferts, moral, staff…). Sélectionnable à l'accueil comme une époque.
- **Sélections nationales** — disputez l'**EuroBasket**, la **Coupe du Monde FIBA** et les **Jeux Olympiques** : tournois à élimination directe (8 nations) avec vos stars, MVP du tournoi et palmarès international (onglet Histoire → International).
- **Époques historiques** — démarrez à différentes **époques de la NBA** (années 60 « Russell & Wilt », 80 « Magic vs Bird », 90 « ère Jordan », 2010 « Warriors & LeBron », ou moderne), avec des **effectifs de légendes** et des **règles adaptées** (ligne à 3 points absente en 1968, rythme et fréquence du tir extérieur variables selon l'époque).
- **Playoffs** — top 8 par conférence, séries au meilleur des 7, jusqu'aux Finales NBA. Jouez votre série match par match.
- **Intersaison** — prolongations de contrat, **draft** (60 prospects, ordre inversé au classement), **agents libres**.
- **Progression pluriannuelle** — les joueurs vieillissent, progressent ou déclinent, prennent leur retraite ; les rookies éclosent. Votre « era » se construit saison après saison.

## 👤 Vrais noms & 🛡️ logos

- **Vrais joueurs** — chaque équipe démarre avec un **effectif réel** (instantané ~saison 2024-25 :
  titulaires + rotation), complété par des joueurs générés pour le fond de banc. C'est un instantané
  indicatif et **entièrement modifiable en jeu** (transferts, coupes, agents libres, draft).
- **Logos d'équipe** — le jeu affiche par défaut des **écussons stylisés aux vraies couleurs**.
  Pour afficher les **vrais logos NBA**, déposez vos propres fichiers dans **`assets/logos/`**
  (ex. `BOS.png`, `LAL.png`…) : le jeu les détecte automatiquement au démarrage.
  Voir `assets/logos/README.md`. Les logos officiels sont des marques déposées et **ne sont pas fournis**.

## 🧱 Détails techniques

- **HTML / CSS / JavaScript vanilla**, sans dépendance ni build.
- Moteur de simulation de matchs à base de possessions (tirs 2pts/3pts, LF, rebonds, passes, interceptions, contres, ballons perdus).
- Joueurs et données **fictifs** (aucune marque ni licence).

## 📁 Structure

```
nba-my-era/
├── index.html          # point d'entrée — à ouvrir dans le navigateur
├── css/style.css       # thème et mise en page
└── js/
    ├── data.js         # 30 franchises + générateurs de noms
    ├── engine.js       # joueurs, simulation, calendrier, draft, transferts
    ├── main.js         # état global, sauvegarde, flux de saison/playoffs/intersaison
    └── ui.js           # interface et interactions
```

Bon jeu, coach ! 🏆
