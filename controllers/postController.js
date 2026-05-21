
const db = require("../db");
const { v4: uuidv4 } = require("uuid");

// Récupère tous les posts avec le nom de l'auteur.
exports.getPosts = async (req, res) => {
  try {
    const [posts] = await db.execute(`
      SELECT posts.*, users.username
      FROM posts
      JOIN users ON posts.user_id = users.id
      ORDER BY posts.created_at DESC
    `);

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crée un post lié à l'utilisateur connecté.
exports.createPost = async (req, res) => {
  const { title, content, category_id, image } = req.body;
  const user_id = req.user ? req.user.userId : req.body.user_id;

  let imageUrl = null;

  if (image) {
    const fs = require("fs");
    const path = require("path");
    
    // Validation de la chaîne Data URL et extraction du type MIME / base64.
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
    if (matches && matches.length === 3) {
      const ext = matches[1].split('/')[1]; // ex: 'png', 'jpeg'
      const buffer = Buffer.from(matches[2], 'base64'); // Décodage du contenu image
      const filename = `${uuidv4()}.${ext}`; // Nom unique pour éviter les collisions
      const uploadsDir = path.join(__dirname, "..", "public", "uploads");

      try {
        // Création du dossier uploads si nécessaire.
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        // Écriture de l'image en local dans public/uploads.
        fs.writeFileSync(path.join(uploadsDir, filename), buffer);
        
        // Le chemin est accessible via express.static.
        imageUrl = `/uploads/${filename}`;
      } catch (uploadErr) {
        console.error("Erreur d'écriture de l'image:", uploadErr);
      }
    }
  }

  try {
    const postId = uuidv4();
    const categoriesMap = {
      1: "Technologie",
      2: "Études",
      3: "Vacances",
      4: "Musique",
      5: "Danse",
      6: "Voyage"
    };
    const categoryName = categoriesMap[category_id] || "Général";

    await db.execute(
      "INSERT INTO posts (id, user_id, title, content, category, image_url) VALUES (?, ?, ?, ?, ?, ?)",
      [postId, user_id, title, content, categoryName, imageUrl]
    );

    res.json({ message: "Post créé 💜", id: postId });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Supprime un post seulement si l'utilisateur connecté en est le propriétaire.
exports.deletePost = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user ? req.user.userId : req.body.user_id;

  if (!user_id) {
    return res.status(401).json({ error: "Connexion requise pour supprimer un post." });
  }

  try {
    const [rows] = await db.execute(
      "SELECT user_id FROM posts WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Post introuvable." });
    }

    const postOwnerId = rows[0].user_id;
    if (String(postOwnerId) !== String(user_id)) {
      return res.status(403).json({ error: "Vous ne pouvez supprimer que vos propres posts." });
    }

    await db.execute("DELETE FROM posts WHERE id = ?", [id]);

    res.json({ message: "Post supprimé 💜" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
