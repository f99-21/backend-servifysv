const db = require("../db");


// 📥 OBTENER MENSAJES
exports.getMensajes = (req, res) => {

    const { idSolicitud } = req.validatedParams;

    const query = `
        SELECT 
            m.id_mensaje,
            m.contenido,
            m.fecha_envio,
            u.id_usuario,
            u.nombre
        FROM Mensaje m
        INNER JOIN Usuario u ON m.id_remitente = u.id_usuario
        WHERE m.id_solicitud = ?
        ORDER BY m.fecha_envio ASC
    `;

    db.query(query, [idSolicitud], (err, results) => {

        if (err) {
            console.error(err);
            return res.status(500).json({ ok: false });
        }

        const mensajes = results.map(row => ({
            id: row.id_mensaje,
            contenido: row.contenido,
            fechaEnvio: row.fecha_envio,
            remitente: {
                id: row.id_usuario,
                nombre: row.nombre
            }
        }));

        res.json({
            ok: true,
            mensajes
        });
    });
};
exports.sendMensaje = (req, res) => {

    const { idSolicitud, idRemitente, contenido } = req.validatedData;

    const query = `
        INSERT INTO Mensaje (id_solicitud, id_remitente, contenido)
        VALUES (?, ?, ?)
    `;

    db.query(query, [idSolicitud, idRemitente, contenido], (err) => {

        if (err) {
            console.error(err);
            return res.status(500).json({ ok: false });
        }

        res.json({
            ok: true,
            message: "Mensaje enviado"
        });
    });
};

exports.getChats = (req, res) => {

    const { idUsuario } = req.validatedParams;

    const query = `
        SELECT 
            s.id_solicitud,
            u.nombre AS profesional,
            m.contenido,
            m.fecha_envio
        FROM Solicitud s
        INNER JOIN Profesional p ON s.id_profesional = p.id_profesional
        INNER JOIN Usuario u ON p.id_usuario = u.id_usuario
        LEFT JOIN Mensaje m ON m.id_solicitud = s.id_solicitud
        WHERE s.id_cliente = ?
        ORDER BY m.fecha_envio DESC
    `;

    db.query(query, [idUsuario], (err, results) => {

        if (err) {
            return res.status(500).json({ ok: false });
        }

        const chatsMap = {};

        results.forEach(row => {

            if (!chatsMap[row.id_solicitud]) {
                chatsMap[row.id_solicitud] = {
                    id: row.id_solicitud,
                    solicitud: {
                        profesional: {
                            usuario: {
                                nombre: row.profesional
                            }
                        }
                    },
                    mensajes: []
                };
            }

            if (row.contenido) {
                chatsMap[row.id_solicitud].mensajes.push({
                    contenido: row.contenido,
                    fechaEnvio: row.fecha_envio
                });
            }
        });

        res.json({
            ok: true,
            chats: Object.values(chatsMap)
        });
    });
};