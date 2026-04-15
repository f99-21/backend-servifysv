const db = require("../db");
const bcrypt = require("bcrypt");

// 🔑 REGISTRO
exports.register = async (req, res) => {
    const { nombre, correo, password, tipo_usuario, especialidad } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
            "INSERT INTO Usuario (nombre, correo, contraseña, tipo_usuario, fecha_registro) VALUES (?, ?, ?, ?, CURDATE())",
            [nombre, correo, hashedPassword, tipo_usuario],
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

    } catch (error) {
        res.status(500).json({ ok: false, message: "Error servidor" });
    }
};
//login 
exports.login = (req, res) => {
    const { correo, password } = req.body;

    db.query(
        "SELECT * FROM Usuario WHERE correo = ?",
        [correo],
        async (err, results) => {

            if (err) {
                return res.status(500).json({ ok: false });
            }

            if (results.length === 0) {
                return res.json({ ok: false, message: "Usuario no existe" });
            }

            const user = results[0];

            const match = await bcrypt.compare(password, user.contraseña);

            if (!match) {
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