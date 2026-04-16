const db = require("../db");

// 🔑 REGISTRO
exports.register = (req, res) => {
    const { nombre, correo, password, tipo_usuario } = req.body;

    db.query(
        "INSERT INTO Usuario (nombre, correo, password, tipo_usuario, fecha_registro) VALUES (?, ?, ?, ?, CURDATE())",
        [nombre, correo, password, tipo_usuario],
        (err) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: "Error al registrar usuario"
                });
            }

            res.json({
                ok: true,
                message: "Usuario registrado"
            });
        }
    );
};
//login 
exports.login = (req, res) => {
    const { correo, password } = req.body;

    db.query(
        "SELECT * FROM Usuario WHERE correo = ?",
        [correo],
        (err, results) => {

            if (err) {
                return res.status(500).json({ ok: false });
            }

            if (results.length === 0) {
                return res.json({ ok: false, message: "Usuario no existe" });
            }

            const user = results[0];

            if (password !== user.password) {
                return res.json({ ok: false, message: "Contraseña incorrecta" });
            }

            res.json({
                ok: true,
                usuario: {
                    id: user.id_usuario,
                    nombre: user.nombre,
                    correo: user.correo,
                    tipo: user.tipo_usuario
                }
            });
        }
    );
};

//perfil
exports.getPerfil = (req, res) => {
    const { id } = req.params;

    db.query(
        "SELECT id, nombre, correo, tipo_usuario FROM Usuario WHERE id = ?",
        [id],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json(result[0]);
        }
    );
};