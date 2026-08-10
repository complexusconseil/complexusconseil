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
- **Scouting de draft** — explorez les **prochaines cuvées** (2027, 2028…), dépensez des points de scouting pour affiner l'évaluation des prospects (fourchette de note → note exacte). Têtes d'affiche réelles connues ; les autres prospects sont des projections.
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
