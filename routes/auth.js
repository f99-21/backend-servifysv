const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// 🔑 REGISTRO
router.post("/register", async (req, res) => {
    const { correo, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
            "INSERT INTO Usuario (nombre, correo, contraseña, tipo_usuario, fecha_registro) VALUES (?, ?, ?, ?, CURDATE())",
            ["Usuario", correo, hashedPassword, "cliente"],
            (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ success: false });
                }
                res.json({ success: true });
            }
        );

    } catch (error) {
        res.status(500).json({ success: false });
    }
});


// 🔑 LOGIN
router.post("/login", (req, res) => {
    const { correo, password } = req.body;

    db.query(
        "SELECT * FROM Usuario WHERE correo = ?",
        [correo],
        async (err, results) => {

            if (err) {
                console.error(err);
                return res.status(500).json({ success: false });
            }

            if (results.length === 0) {
                return res.json({ success: false });
            }

            const user = results[0];

            const valid = await bcrypt.compare(password, user.contraseña);

            if (!valid) {
                return res.json({ success: false });
            }

            const token = jwt.sign(
                { id: user.id_usuario },
                "secret_key",
                { expiresIn: "1h" }
            );

            res.json({
                success: true,
                token: token,
                usuario: user
            });
        }
    );
});

module.exports = router;