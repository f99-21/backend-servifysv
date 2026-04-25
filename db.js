require("dotenv").config();
const mysql = require("mysql2");
const { URL } = require("url");

const databaseUrl = process.env.DATABASE_URL;
const url = new URL(databaseUrl);

const db = mysql.createPool({
    host: url.hostname,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    port: url.port || 3306,
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