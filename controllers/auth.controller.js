const db = require("../db");
const bcrypt = require("bcrypt");
const { generateToken } = require("../middleware/auth.middleware");

exports.register = (req, res) => {
    const { nombre, correo, contraseña, tipo_usuario } = req.validatedData;

    db.query(
        "SELECT correo FROM Usuario WHERE correo = ?",
        [correo],
        async (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Error en el servidor"
                });
            }

            if (results.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "El correo ya está registrado"
                });
            }

            try {
                const hashedPassword = await bcrypt.hash(contraseña, 10);

                db.query(
                    "INSERT INTO Usuario (nombre, correo, contraseña, tipo_usuario, fecha_registro) VALUES (?, ?, ?, ?, CURDATE())",
                    [nombre, correo, hashedPassword, tipo_usuario],
                    (err) => {
                        if (err) {
                            return res.status(500).json({
                                success: false,
                                message: "Error al registrar usuario"
                            });
                        }

                        res.status(201).json({
                            success: true,
                            message: "Usuario registrado exitosamente"
                        });
                    }
                );
            } catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "Error al procesar la contraseña"
                });
            }
        }
    );
};

exports.login = (req, res) => {
    const { correo, contraseña } = req.validatedData;

    db.query(
        "SELECT * FROM Usuario WHERE correo = ?",
        [correo],
        async (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Error en el servidor"
                });
            }

            if (results.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: "Credenciales inválidas"
                });
            }

            try {
                const user = results[0];
                const isPasswordValid = await bcrypt.compare(contraseña, user.contraseña);

                if (!isPasswordValid) {
                    return res.status(401).json({
                        success: false,
                        message: "Credenciales inválidas"
                    });
                }

                const token = generateToken(user);

                res.json({
                    success: true,
                    message: "Login exitoso",
                    token,
                    usuario: {
                        id: user.id_usuario,
                        nombre: user.nombre,
                        correo: user.correo,
                        tipo_usuario: user.tipo_usuario
                    }
                });
            } catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "Error al validar credenciales"
                });
            }
        }
    );
};

exports.getPerfil = (req, res) => {
    const { id } = req.validatedParams;

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
                return res.status(404).json({
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

exports.actualizarPerfil = (req, res) => {
    const { id } = req.validatedParams;
    const { nombre, telefono, correo } = req.validatedData;

    const updates = [];
    const values = [];

    if (nombre) {
        updates.push("nombre = ?");
        values.push(nombre);
    }
    if (correo) {
        updates.push("correo = ?");
        values.push(correo);
    }

    if (updates.length === 0) {
        return res.status(400).json({
            success: false,
            message: "No hay datos para actualizar"
        });
    }

    values.push(id);

    const query = `UPDATE Usuario SET ${updates.join(", ")} WHERE id_usuario = ?`;

    db.query(query, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Error al actualizar perfil"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }

        res.json({
            success: true,
            message: "Perfil actualizado exitosamente"
        });
    });
};
