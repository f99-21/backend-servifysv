const db = require("../db");

// 🔑 REGISTRO
exports.register = (req, res) => {
    const { nombre, correo, contraseña, tipo_usuario } = req.body;

    db.query(
        "INSERT INTO Usuario (nombre, correo, contraseña, tipo_usuario, fecha_registro) VALUES (?, ?, ?, ?, CURDATE())",
        [nombre, correo, contraseña, tipo_usuario],
        (err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Error al registrar usuario"
                });
            }

            res.json({
                success: true,
                message: "Usuario registrado"
            });
        }
    );
};

// 🔑 LOGIN
exports.login = (req, res) => {
    const { correo, contraseña } = req.body;

    db.query(
        "SELECT * FROM Usuario WHERE correo = ?",
        [correo],
        (err, results) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Error en el servidor"
                });
            }

            if (results.length === 0) {
                return res.json({
                    success: false,
                    message: "Usuario no existe"
                });
            }

            const user = results[0];

            // comparación directa (sin encriptar)
            if (contraseña !== user.contraseña) {
                return res.json({
                    success: false,
                    message: "Contraseña incorrecta"
                });
            }

            res.json({
                success: true,
                usuario: {
                    id: user.id_usuario,
                    nombre: user.nombre,
                    correo: user.correo,
                    tipo_usuario: user.tipo_usuario
                }
            });
        }
    );
};

// 👤 PERFIL
exports.getPerfil = (req, res) => {
    const { id } = req.params;

    db.query(
        "SELECT id_usuario, nombre, correo, tipo_usuario FROM Usuario WHERE id_usuario = ?",
        [id],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Error en el servidor"
                });
            }

            if (result.length === 0) {
                return res.json({
                    success: false,
                    message: "Usuario no encontrado"
                });
            }

            res.json({
                success: true,
                usuario: result[0]
            });
        }
    );
};