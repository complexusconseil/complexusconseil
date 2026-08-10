# Empires en Ligne 🏰

Un jeu de stratégie en temps réel (façon *Age of Empires*), jouable sur **mobile et PC**,
en **solo contre l'IA** ou **à deux en ligne** (chacun chez soi). 100 % côté client,
aucun serveur, aucun compte, aucune installation.

➡️ **Jouer : [complexusconseil.github.io/empires-rts/](https://complexusconseil.github.io/empires-rts/)**
*(disponible une fois GitHub Pages activé — voir plus bas)*

## Comment jouer à deux depuis chez soi

La connexion se fait en **pair-à-pair (WebRTC via PeerJS)** :

1. Un joueur clique **« Créer une partie »** → il obtient un **code** à 4 caractères.
2. Il envoie ce code à son ami (SMS, WhatsApp, etc.).
3. L'ami clique **« Rejoindre »** et saisit le code.
4. La partie démarre dès la connexion établie.

> Une connexion Internet est requise (la bibliothèque réseau se charge depuis un CDN).
> Le **mode solo** contre l'ordinateur fonctionne même hors ligne une fois la page chargée.

## Principe du jeu

- **But :** détruire le centre-ville 🏰 adverse.
- **4 ressources :** nourriture 🍖 (baies 🍒), bois 🪵 (arbres 🌲), or 🪙 (mines 💰), pierre 🪨.
- **Évolution par âges I → IV** au centre-ville : débloque unités, bâtiments et améliorations.
- **Contres** (pierre-feuille-ciseaux) : 🛡️ lancier bat 🐎 cavalier • 🐎 cavalier bat 🏹 archer • 🏹 archer bat l'infanterie. Compose ton armée en conséquence.
- **Unités :** villageois 🧑‍🌾, lancier 🛡️, archer 🏹, cavalier 🐎, homme d'armes ⚔️, bélier 🪵 (siège).
- **Bâtiments :** centre-ville 🏰, maison 🏠, moulin 🌾 / camp de bûcherons 🪓 / camp minier ⛏️ (dépôts de proximité), caserne, atelier de tir 🏹, écurie 🐴, forge 🔨 (améliorations), atelier de siège 🛠️, tour 🗼 (défense).

## Moteur 3D (Three.js) — rendu moderne

Le jeu tourne dans un **vrai moteur 3D WebGL** (Three.js) avec un pipeline de
rendu moderne :

- **Matériaux PBR** (metalness/roughness) et **éclairage par image (IBL)** via un
  ciel procédural → surfaces réalistes, or et métal qui brillent, eau réfléchissante.
- **Tone mapping ACES** (rendu « cinéma ») et espace colorimétrique correct.
- **Post-traitement** : occlusion ambiante **SSAO** (ombres de contact), **bloom**,
  anti-aliasing **SMAA**, **ombres douces**.
- Caméra RTS inclinée (pan, rotation, zoom), **brouillard de guerre 3D**, flèches en vol.
- **Réglage de qualité automatique** : version allégée sur mobile pour rester fluide.

Le moteur de jeu (pathfinding A\*, âges, contres, combat, réseau, IA) est inchangé.

## Fichiers (2)

Ce dépôt contient **deux fichiers**, tous deux à placer **à la racine** :

- `index.html` — le jeu.
- `three.bundle.js` — le moteur 3D Three.js + post-traitement, regroupé en un seul
  fichier (aucune dépendance CDN). Généré depuis Three.js r160 (licence MIT).

## Contrôles

- **Caméra :** un doigt (mobile) ou molette pour zoomer ; deux doigts pour pivoter/zoomer ;
  flèches et touches **Q/E** au clavier. Mini-carte pour te déplacer vite.
- **Sélection :** tap/clic ; glisser (souris) = sélection multiple ; double-tap = même type visible.
- **Ordres :** unités sélectionnées → tap/clic droit sur le sol / une ressource / un ennemi.

## Activer GitHub Pages

Dans le dépôt : **Settings → Pages → Build and deployment → Source : `Deploy from a branch`**,
branche **`main`**, dossier **`/ (root)`**, puis **Save**. Le jeu sera en ligne à l'adresse
ci-dessus après quelques minutes.

## Détails techniques

- Rendu **3D WebGL** (Three.js) avec pipeline PBR + IBL + post-traitement ;
  logique de jeu 100 % côté client, réseau pair-à-pair via PeerJS.
- Architecture réseau **hôte-autoritaire** : l'hôte simule la partie et diffuse
  l'état ~10×/s ; l'invité envoie ses ordres et affiche l'état reçu (avec interpolation).
- Contrôles unifiés souris/clavier (PC) et tactiles (mobile : tap, glisser, pincer).
