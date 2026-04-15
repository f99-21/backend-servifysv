const express = require("express");
const router = express.Router();
const db = require("../db");

// 🔑 REGISTRO SIN HASH
router.post("/register", (req, res) => {
    const { correo, password } = req.body;

    db.query(
        "INSERT INTO Usuario (nombre, correo, contraseña, tipo_usuario, fecha_registro) VALUES (?, ?, ?, ?, CURDATE())",
        ["Usuario", correo, password, "cliente"], // 👈 contraseña en texto plano
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    message: "Error al registrar"
                });
            }

            res.json({
                success: true,
                message: "Usuario registrado"
            });
        }
    );
});


// 🔑 LOGIN SIN HASH
router.post("/login", (req, res) => {
    const { correo, password } = req.body;

    db.query(
        "SELECT * FROM Usuario WHERE correo = ?",
        [correo],
        (err, results) => {

            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false
                });
            }

            if (results.length === 0) {
                return res.json({
                    success: false,
                    message: "Usuario no existe"
                });
            }

            const user = results[0];

            // 👇 COMPARACIÓN DIRECTA
            if (password !== user.contraseña) {
                return res.json({
                    success: false,
                    message: "Contraseña incorrecta"
                });
            }

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