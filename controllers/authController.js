 
const db = require("../db");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

// INSCRIPTION: crée un nouvel utilisateur avec un mot de passe haché.
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const [user] = await db.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    // On évite les doublons de nom d'utilisateur.
    if (user.length > 0) {
      return res.status(400).json({ error: "Utilisateur existe déjà" });
    }

    // Hachage du mot de passe pour ne jamais stocker de texte en clair.
    const hash = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    await db.execute(
      "INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)",
      [userId, username, email, hash]
    );

    res.json({ message: "Compte créé 💜", userId: userId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIN: vérifie l'utilisateur et crée une session via cookie.
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [users] = await db.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    // Si l'utilisateur n'existe pas, on refuse la connexion.
    if (users.length === 0) {
      return res.status(400).json({ error: "Utilisateur introuvable" });
    }

    const user = users[0];

    // Compare le mot de passe fourni avec le hash stocké.
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: "Mot de passe incorrect" });
    }

    // Enregistre la session utilisateur dans un cookie sécurisé pendant 24 heures.
    // httpOnly empêche l'accès au cookie depuis JavaScript côté client.
    res.cookie("user_session", JSON.stringify({ userId: user.id, username: user.username }), {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      path: "/"
    });

    res.json({
      message: "Connexion réussie 💜",
      username: user.username,
      userId: user.id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGOUT: supprime le cookie de session.
exports.logout = (req, res) => {
  res.clearCookie("user_session", { path: "/" });
  res.json({ message: "Déconnecté. 💜" });
};

// vérifie si l'utilisateur est déjà connecté.
exports.me = (req, res) => {
  const { getUser } = require("../middleware/auth");
  const user = getUser(req);
  if (!user) return res.json({ loggedIn: false });
  res.json({ loggedIn: true, username: user.username, userId: user.userId });
};
