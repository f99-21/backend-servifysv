const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// 🔑 REGISTRO
router.post("/register", async (req, res) => {
    const { email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
        "INSERT INTO usuarios (email, password) VALUES (?, ?)",
        [email, hashedPassword],
        (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ success: true });
        }
    );
});

// 🔑 LOGIN
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.query(
        "SELECT * FROM usuarios WHERE email = ?",
        [email],
        async (err, results) => {

            if (results.length === 0) {
                return res.status(401).json({ success: false });
            }

            const user = results[0];

            const valid = await bcrypt.compare(password, user.password);

            if (!valid) {
                return res.status(401).json({ success: false });
            }

            const token = jwt.sign(
                { id: user.id },
                "secret_key",
                { expiresIn: "1h" }
            );

            res.json({
                success: true,
                token: token
            });
        }
    );
});

module.exports = router;