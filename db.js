const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "gondola.proxy.rlwy.net",
    user: "root",
    password: "EHmQyFZKIOUtThmiwgWOqeoKmGCooNUw",
    database: "railway",
    port: 19147
});

db.connect(err => {
    if (err) {
        console.error("Error conexión DB:", err);
    } else {
        console.log("Conectado a Railway MySQL 🔥");
    }
});

module.exports = db;