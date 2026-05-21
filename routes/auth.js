const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Route d'inscription utilisateur
router.post("/register", authController.register);
// Route de connexion utilisateur
router.post("/login", authController.login);
// Route de déconnexion utilisateur
router.post("/logout", authController.logout);
// Route pour vérifier l'état de connexion
router.get("/me", authController.me);

module.exports = router;