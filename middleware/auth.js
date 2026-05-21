// Lit le cookie de session et retourne l'objet utilisateur.
function getUser(req) {
  if (req.cookies && req.cookies.user_session) {
    try {
      return JSON.parse(req.cookies.user_session);
    } catch (e) {
      return null;
    }
  }
  return null; // Invité non connecté
}

//protège les routes privées.
function requireAuth(req, res, next) {
  const user = getUser(req);
  if (!user) {
    return res.status(401).json({ error: "Connexion requise." });
  }
  req.user = user;
  next();
}

module.exports = {
  getUser,
  requireAuth
};
