const db = require("../db");

exports.getDetalleSolicitud = (req, res) => {
    const { id } = req.params;

    const query = `
    SELECT 
        s.id_solicitud,
        s.descripcion,
        s.estado,
        s.fecha_solicitud,

        up.nombre AS profesional_nombre,
        p.especialidad,

        serv.nombre_servicio,
        serv.precio_referencia,

        c.puntuacion,
        c.comentario

    FROM Solicitud s
    JOIN Profesional p ON s.id_profesional = p.id_profesional
    JOIN Usuario up ON p.id_usuario = up.id_usuario
    JOIN Servicio serv ON s.id_servicio = serv.id_servicio
    LEFT JOIN Calificacion c ON c.id_solicitud = s.id_solicitud

    WHERE s.id_solicitud = ?
    `;

    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json(err);

        if (results.length === 0) {
            return res.status(404).json({ message: "No encontrada" });
        }

        const r = results[0];

        res.json({
            id: r.id_solicitud,
            descripcion: r.descripcion,
            estado: r.estado,
            fechaSolicitud: r.fecha_solicitud,

            profesional: {
                nombre: r.profesional_nombre,
                especialidad: r.especialidad
            },

            servicio: {
                nombreServicio: r.nombre_servicio,
                precioReferencia: r.precio_referencia
            },

            calificacion: r.puntuacion ? {
                puntuacion: r.puntuacion,
                comentario: r.comentario
            } : null
        });
    });
};