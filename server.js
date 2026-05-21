

const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");

// Parse le corps JSON des requêtes entrantes.
// La limite 50mb est volontaire pour accepter un encodage Base64 d'images.
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

// Route de la page d'accueil. Elle envoie explicitement index.html.
// Cela évite que l'index ne soit résolu uniquement par express.static.
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Sert les fichiers statiques du dossier public (CSS, JS, HTML, uploads, etc.)
app.use(express.static(path.join(__dirname, "public")));

// Chargement des routes métier
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");

// Préfixe les routes d'authentification et de posts
app.use("/auth", authRoutes);
app.use("/posts", postRoutes);

// Démarre le serveur sur le port 4200
app.listen(4200, () => {
  console.log("Serveur sur http://localhost:4200 ✅");
});
