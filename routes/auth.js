const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");

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


// 🔑 LOGIN SIN TOKEN
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
                return res.json({ success: false, message: "Usuario no existe" });
            }

            const user = results[0];

            const valid = await bcrypt.compare(password, user.contraseña);

            if (!valid) {
                return res.json({ success: false, message: "Contraseña incorrecta" });
            }

            // ✅ SIN TOKEN, SOLO RESPUESTA SIMPLE
            res.json({
                success: true,
                usuario: {
                    id: user.id_usuario,
                    correo: user.correo,
                    nombre: user.nombre,
                    tipo: user.tipo_usuario
                }
            });
        }
    );
});

module.exports = router;