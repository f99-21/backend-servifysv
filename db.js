const mysql = require("mysql2");

const db = mysql.createPool({
    host: "gondola.proxy.rlwy.net",
    user: "root",
    password: "EHmQyFZKIOUtThmiwgWOqeoKmGCooNUw",
    database: "railway",
    port: 19147,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Probar conexión
db.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Error conexión DB:", err);
    } else {
        console.log("✅ Conectado a Railway MySQL 🔥");
        connection.release();
    }
});

module.exports = db;