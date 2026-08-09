# Empires en Ligne 🏰

Un jeu de stratégie en temps réel (façon *Age of Empires*) intégré au site, jouable
sur **mobile et PC**, en **solo contre l'IA** ou **à deux en ligne** (chacun chez soi).

➡️ **Accès : [complexusconseil.fr/jeu/](https://complexusconseil.fr/jeu/)**

## Comment jouer à deux depuis chez soi

Aucun serveur, aucun compte, aucune installation. La connexion se fait en
**pair-à-pair (WebRTC via PeerJS)** :

1. Un joueur clique **« Créer une partie »** → il obtient un **code** à 4 caractères.
2. Il envoie ce code à son ami (SMS, WhatsApp, etc.).
3. L'ami clique **« Rejoindre »** et saisit le code.
4. La partie démarre dès la connexion établie.

> Une connexion Internet est requise (la bibliothèque réseau se charge depuis un CDN).
> Le **mode solo** contre l'ordinateur fonctionne même hors ligne une fois la page chargée.

## Principe du jeu

- **But :** détruire le centre-ville 🏰 adverse.
- **Ressources :** nourriture 🍖 (baies 🍒), bois 🪵 (arbres 🌲), or 🪙 (mines 💰).
- **Unités :** villageois 🧑‍🌾 (récolte + construction), soldats ⚔️, archers 🏹.
- **Bâtiments :** centre-ville 🏰 (villageois + dépôt), maison 🏠 (population), caserne 🛡️ (armée).

## Détails techniques

- 100 % côté client : un seul fichier `index.html` (Canvas 2D + PeerJS).
- Architecture réseau **hôte-autoritaire** : l'hôte simule la partie et diffuse
  l'état ~10×/s ; l'invité envoie ses ordres et affiche l'état reçu (avec interpolation).
- Contrôles unifiés souris/clavier (PC) et tactile (mobile : tap, glisser, pincer).
- Page en `noindex` : elle n'apparaît pas dans les moteurs de recherche et reste
  indépendante du site vitrine.
