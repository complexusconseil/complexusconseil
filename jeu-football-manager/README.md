# ⚽ Euro Manager — Mode Carrière

Jeu de gestion football (à mi-chemin entre FIFA et Football Manager), **centré uniquement sur le mode carrière manager**. Jouable **100 % en local** dans un navigateur, sans installation ni connexion internet.

## 🎮 Comment jouer en local

**Le plus simple :** double-cliquez sur `index.html` — le jeu s'ouvre dans votre navigateur.

> Si le navigateur bloque certains scripts en `file://`, lancez un mini-serveur local depuis ce dossier :
> ```bash
> # Python (déjà installé sur Mac/Linux)
> python3 -m http.server 8000
> # puis ouvrez http://localhost:8000
> ```

La partie est **sauvegardée automatiquement** dans le navigateur (localStorage). Vous pouvez fermer et reprendre plus tard.

## ✨ Fonctionnalités

- **Base de données de clubs européens** — 80 clubs réels répartis dans 5 grands championnats : Ligue 1 🇫🇷, Premier League 🏴, La Liga 🇪🇸, Serie A 🇮🇹, Bundesliga 🇩🇪. Chaque club a un effectif complet (~23 joueurs générés avec nationalités, âges, notes, potentiels et valeurs cohérents avec le niveau du club).
- **Gestion de l'effectif** — consultez notes, potentiel, forme, moral, valeur marchande et statistiques de chaque joueur.
- **Mercato (acheter / vendre)** — recherchez des joueurs dans toute l'Europe avec filtres (poste, note, âge), faites des offres, négociez selon votre budget. Placez vos joueurs sur la liste des transferts et recevez des offres des clubs IA.
- **Tactique avant match** — choisissez votre formation (4-4-2, 4-3-3, 4-2-3-1, 3-5-2, 5-3-2, 4-5-1), composez votre onze sur un terrain visuel, et réglez vos consignes (mentalité, tempo, pressing) qui influencent réellement la simulation.
- **Matchs simulés** — moteur basé sur la force des lignes (attaque / milieu / défense), la tactique, l'avantage du terrain et une part d'aléatoire. Match joué avec animation minute par minute et buteurs, ou simulation rapide.
- **Carrière sur plusieurs saisons** — classement en direct (places européennes / relégation), meilleurs buteurs, calendrier aller-retour complet, objectifs de saison, actualités du club, vieillissement/progression des joueurs et évolution du budget entre saisons.

## 🕹 Prise en main

1. Choisissez un championnat et un club (les étoiles ★ indiquent la réputation / le niveau).
2. Onglet **Tactique** : réglez formation et consignes, vérifiez votre onze.
3. Onglet **Mercato** : renforcez l'effectif selon votre budget.
4. Onglet **Accueil** : jouez le match (animé) ou simulez rapidement.
5. Enchaînez les journées, visez votre objectif, puis passez à la saison suivante.

## 🛠 Technique

100 % HTML / CSS / JavaScript vanilla, aucune dépendance externe.

| Fichier | Rôle |
|---|---|
| `index.html` | Page principale |
| `css/style.css` | Interface (thème stade) |
| `js/data.js` | Base de données : clubs européens + générateur de joueurs |
| `js/engine.js` | Moteur : composition, forces d'équipe, simulation de match |
| `js/game.js` | Carrière : calendrier, classement, mercato, sauvegarde |
| `js/ui.js` | Rendu des écrans et interactions |

Bon jeu ! ⚽
