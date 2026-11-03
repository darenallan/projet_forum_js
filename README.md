# Forum JS

Forum web : inscription et connexion, publication de messages avec images, consultation des fils de discussion.

## Stack

- Node.js, Express, MySQL (`mysql2`), sessions par cookie (`cookie-parser`), mots de passe hachés avec `bcrypt`
- Interface en HTML, CSS et JavaScript (`public/`)

## Structure

```
server.js         point d'entrée Express
db.js             pool de connexions MySQL
routes/           auth.js, posts.js
controllers/      authController.js, postController.js
middleware/       auth.js (routes protégées)
public/           pages (accueil, connexion, inscription, post) et uploads
```

## Lancer

Prérequis : Node.js et un serveur MySQL local (paramètres de connexion dans `db.js`).

```bash
npm install
npm run dev      # ou npm start
```

> `node_modules/` est versionné dans ce dépôt. Il pourrait être retiré et ajouté à `.gitignore`, `npm install` suffisant à le recréer.

> Licence : ISC (déclarée dans `package.json`, sans fichier `LICENSE`).
