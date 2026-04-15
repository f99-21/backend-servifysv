const db = require("../db");

exports.getHistorial = (req, res) => {

    const { idUsuario } = req.params;

    const query = `
        SELECT 
            s.id_solicitud,
            s.estado,
            s.fecha,
            serv.nombre_servicio,
            serv.categoria,
            serv.precio_referencia,
            u.nombre AS profesional
        FROM Solicitud s
        INNER JOIN Servicio serv ON s.id_servicio = serv.id_servicio
        INNER JOIN Profesional p ON s.id_profesional = p.id_profesional
        INNER JOIN Usuario u ON p.id_usuario = u.id_usuario
        WHERE s.id_cliente = ?
        AND (s.estado = 'completada' OR s.estado = 'cancelada')
        ORDER BY s.fecha DESC
    `;

    db.query(query, [idUsuario], (err, results) => {

        if (err) {
            console.error(err);
            return res.status(500).json({ ok: false });
        }

        const historial = results.map(row => ({
            id: row.id_solicitud,
            estado: row.estado,
            fecha: row.fecha,
            servicio: {
                nombre: row.nombre_servicio,
                categoria: row.categoria,
                precio: row.precio_referencia
            },
            profesional: {
                nombre: row.profesional
            }
        }));

        res.json({
            ok: true,
            historial
        });
    });
};