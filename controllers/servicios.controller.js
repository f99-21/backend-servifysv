const db = require("../db");

exports.getServicios = (req, res) => {
    const query = `
        SELECT 
            s.id_servicio,
            s.nombre_servicio,
            s.categoria,
            s.precio_referencia,
            s.disponibilidad,
            p.especialidad,
            u.nombre AS profesional
        FROM Servicio s
        INNER JOIN Profesional p ON s.id_profesional = p.id_profesional
        INNER JOIN Usuario u ON p.id_usuario = u.id_usuario
    `;

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ ok: false });
        }

        res.json({
            ok: true,
            servicios: results
        });
    });
};


exports.getProfesionalById = (req, res) => {
    const { id } = req.validatedParams;

    const query = `
        SELECT 
            p.id,
            p.especialidad,
            p.descripcion,
            p.experiencia,
            p.estado_verificacion,
            p.calificacion_promedio,
            p.total_calificaciones,
            u.nombre,
            u.correo
        FROM Profesional p
        JOIN Usuario u ON p.id_usuario = u.id
        WHERE p.id = ?
    `;
// 🔥 traer datos del profesional
    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json(err);

        if (result.length === 0) {
            return res.status(404).json({ error: "Profesional no encontrado" });
        }

        const profesional = result[0];

        // 🔥 traer servicios del profesional
        db.query(
            "SELECT id, nombre, precio FROM Servicio WHERE id_profesional = ?",
            [id],
            (err2, servicios) => {
                if (err2) return res.status(500).json(err2);

                res.json({
                    id: profesional.id,
                    especialidad: profesional.especialidad,
                    descripcion: profesional.descripcion,
                    experiencia: profesional.experiencia,
                    estadoVerificacion: profesional.estado_verificacion,
                    calificacionPromedio: profesional.calificacion_promedio,
                    totalCalificaciones: profesional.total_calificaciones,
                    usuario: {
                        nombre: profesional.nombre,
                        correo: profesional.correo
                    },
                    servicios: servicios
                });
            }
        );
    });
};