const db = require("../db");

exports.getSolicitudes = (req, res) => {
    const { id_usuario, estado } = req.query;

    let query = `
    SELECT 
        s.id_solicitud,
        s.descripcion,
        s.estado,
        s.fecha_solicitud,

        p.id_profesional,
        u.nombre AS profesional_nombre,
        p.especialidad,

        serv.nombre_servicio,
        serv.precio_referencia

    FROM Solicitud s
    JOIN Profesional p ON s.id_profesional = p.id_profesional
    JOIN Usuario u ON p.id_usuario = u.id_usuario
    JOIN Servicio serv ON s.id_servicio = serv.id_servicio

    WHERE s.id_cliente = ?
    `;

    let params = [id_usuario];

    // 🔥 filtro opcional
    if (estado) {
        query += " AND s.estado = ?";
        params.push(estado);
    }

    query += " ORDER BY s.fecha_solicitud DESC";

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json(err);

        const data = results.map(r => ({
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
            }
        }));

        res.json(data);
    });
};