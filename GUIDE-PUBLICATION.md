# Mise en ligne sur GitHub Pages, pas à pas

Tout ce qui doit être publié se trouve dans ce dossier `SITE-A-PUBLIER`, et **rien d'autre**. Les dossiers `refonte-v2/apercu` et les explorations précédentes ne doivent pas être envoyés.

Compte environ 15 minutes, dont 10 d'attente.

---

## Avant de commencer : sauvegarder l'ancien site

Ton site actuel est un seul fichier `index.html`. Il va être remplacé. Récupère-le d'abord, au cas où.

1. Va sur `https://github.com/complexusconseil/complexusconseil`
2. Clique sur `index.html`, puis sur le bouton **Download raw file** (l'icône de téléchargement, en haut à droite du fichier)
3. Range-le quelque part sous le nom `index-ancien-site.html`

Si quelque chose se passe mal, tu pourras toujours le remettre en ligne.

---

## Étape 1 — Supprimer les anciens dossiers, s'il y en a

Ton dépôt ne contient normalement que des fichiers à la racine (`index.html`, `robots.txt`, `sitemap.xml`). Dans ce cas, passe directement à l'étape 2 : les fichiers du même nom seront simplement écrasés.

---

## Étape 2 — Envoyer les nouveaux fichiers

1. Sur la page d'accueil du dépôt, clique sur **Add file**, puis **Upload files**.
2. Ouvre le dossier `SITE-A-PUBLIER` dans ton explorateur Windows.
3. **Sélectionne tout le contenu** du dossier (`Ctrl + A`), pas le dossier lui-même. Tu dois avoir sélectionné :

   - `index.html`
   - les 6 dossiers : `accompagnement-du-changement`, `demarche-rse`, `methode`, `a-propos`, `contact`, `mentions-legales`
   - le dossier `assets`
   - `sitemap.xml`, `robots.txt`, `og-image.png`, `logo.png`
   - le fichier `GUIDE-PUBLICATION.md` n'a pas besoin d'être envoyé, tu peux le désélectionner

4. **Glisse tout ça** dans la zone de dépôt de GitHub. La structure des dossiers est conservée automatiquement.
5. Attends que la liste des fichiers s'affiche entièrement, tu dois voir une quinzaine de lignes.

> **Le fichier `.nojekyll`** est invisible dans l'explorateur Windows par défaut. Pour l'afficher : onglet **Affichage** de l'explorateur, puis coche **Éléments masqués**. Il empêche GitHub d'appliquer un traitement inutile à des pages déjà finies. Si tu ne le trouves pas, ce n'est pas bloquant, tu peux publier sans.

---

## Étape 3 — Valider l'envoi

1. Dans le champ de description en bas, écris par exemple :
   `Refonte : accompagnement du changement, site multi-pages`
2. Laisse l'option **Commit directly to the main branch** cochée.
3. Clique sur **Commit changes**.

---

## Étape 4 — Attendre la mise en ligne

1. Onglet **Actions** du dépôt : une tâche apparaît avec une pastille orange, puis verte quand c'est fini. Compte 1 à 2 minutes.
2. Ensuite, il faut encore 5 à 10 minutes pour que le réseau de diffusion se mette à jour.

**Ne juge pas le résultat avec un simple F5.** Ton navigateur garde l'ancienne version en mémoire. Ouvre une fenêtre de navigation privée, ou fais `Ctrl + Maj + R`. Pendant la propagation, il est normal de voir alterner l'ancienne et la nouvelle version.

---

## Étape 5 — Vérifier que tout fonctionne

Ouvre `https://complexusconseil.github.io/complexusconseil/` en navigation privée et contrôle dans l'ordre :

1. La page s'affiche **avec sa mise en forme**. Si tu vois du texte brut sans couleurs, c'est que le dossier `assets` n'est pas monté correctement, retourne à l'étape 2.
2. La photo apparaît en haut à droite.
3. Les 4 liens du menu fonctionnent : Accompagnement du changement, Démarche RSE, Méthode, À propos.
4. L'auto-diagnostic : réponds aux 4 questions, clique sur **Afficher la lecture**, un résultat doit s'afficher.
5. Sur ton téléphone, le bouton **Menu** ouvre bien la navigation.
6. Ces deux adresses doivent s'ouvrir directement :
   `.../complexusconseil/sitemap.xml` et `.../complexusconseil/og-image.png`

---

## Étape 6 — Activer le formulaire de contact

Le formulaire passe par FormSubmit, qui demande une activation unique.

1. Depuis le site en ligne, remplis le formulaire du bas de page avec ta propre adresse et envoie-le.
2. Tu reçois un email de FormSubmit sur `complexusconseil@gmail.com` avec un lien d'activation.
3. Clique sur ce lien. À partir de là, les messages t'arrivent normalement.

Tant que cette activation n'est pas faite, **les demandes envoyées par tes visiteurs sont perdues**. À faire le jour même de la mise en ligne.

---

## Étape 7 — Prévenir Google et LinkedIn

Sans cette étape, ton nouveau site mettra plusieurs semaines à être vu.

**Search Console** (`search.google.com/search-console`)

1. Menu **Sitemaps**, saisis `sitemap.xml`, clique sur **Envoyer**.
2. Menu **Inspection de l'URL**, colle successivement chacune des 7 adresses et clique sur **Demander une indexation**. Fais-le au moins pour l'accueil et la page Accompagnement du changement.

**LinkedIn** (`linkedin.com/post-inspector`)

Colle l'adresse du site et clique sur **Inspect**. Ça force LinkedIn à recharger l'aperçu, sinon il continue d'afficher l'ancienne image pendant des semaines.

---

## Si quelque chose ne va pas

**La page s'affiche sans mise en forme.** Le dossier `assets` n'a pas été envoyé, ou pas au bon endroit. Vérifie sur GitHub que tu vois bien `assets/style.css` à la racine du dépôt.

**Erreur 404 sur une page intérieure.** Vérifie que le dossier contient bien un fichier nommé exactement `index.html`, en minuscules.

**Rien n'a changé après 15 minutes.** Regarde l'onglet **Actions** : si la pastille est rouge, le déploiement a échoué, ouvre la tâche pour lire le message.

**Tu veux revenir en arrière.** Onglet **Commits**, ouvre le commit précédent, bouton **Revert**. Ou renvoie simplement le fichier `index-ancien-site.html` renommé en `index.html`.

---

## Après la mise en ligne

Deux choses valent bien plus que du polissage supplémentaire.

**Des cas clients réels.** Trois situations racontées, même anonymisées, avec le problème, ce que tu as fait et le résultat. C'est ce qui manque le plus au site aujourd'hui.

**Un nom de domaine.** `complexusconseil.fr` coûte une dizaine d'euros par an et fait nettement plus sérieux qu'une adresse GitHub sur une carte de visite. La configuration se fait dans **Settings → Pages → Custom domain**, et je peux te guider le moment venu.
