
const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "proyecto",
    database: "servifysv"
});

db.connect(err => {
    if (err) {
        console.error("Error conexión DB:", err);
    } else {
        console.log("Conectado a MySQL 🔥");
    }
});

module.exports = db;