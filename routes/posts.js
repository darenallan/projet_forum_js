const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const { requireAuth } = require("../middleware/auth");

// GET /posts
// Retourne la liste des posts avec l'auteur et la catégorie associée.
router.get("/", postController.getPosts);

// POST /posts
// Crée un nouveau post et vérifie que l'utilisateur est connecté.
router.post("/", requireAuth, postController.createPost);

// DELETE /posts/:id
// Supprime un post uniquement si l'utilisateur connecté en est le propriétaire.
router.delete("/:id", requireAuth, postController.deletePost);

module.exports = router;