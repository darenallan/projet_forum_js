// Permet la connexion à la base de données MySQL en mode promesse.
const mysql = require("mysql2/promise");

// createPool est plus performant qu'une connexion unique à chaque requête.
// Il gère un pool de connexions réutilisables vers la base de données.
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Priscille@2008",
  database: "forum_db"
});

module.exports = db; 