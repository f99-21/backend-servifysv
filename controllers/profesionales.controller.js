const db = require("../db");

// 📋 TODOS LOS PROFESIONALES
exports.getProfesionales = (req, res) => {

    const query = `
        SELECT 
            p.id_profesional,
            u.nombre,
            p.especialidad,
            s.nombre_servicio,
            s.categoria,
            s.precio_referencia
        FROM Profesional p
        INNER JOIN Usuario u ON p.id_usuario = u.id_usuario
        INNER JOIN Servicio s ON s.id_profesional = p.id_profesional
    `;

    db.query(query, (err, results) => {

        if (err) {
            return res.status(500).json({ ok: false });
        }

        // agrupar por profesional
        const map = {};

        results.forEach(row => {

            if (!map[row.id_profesional]) {
                map[row.id_profesional] = {
                    id: row.id_profesional,
                    nombre: row.nombre,
                    especialidad: row.especialidad,
                    servicios: []
                };
            }

            map[row.id_profesional].servicios.push({
                nombre: row.nombre_servicio,
                categoria: row.categoria,
                precio: row.precio_referencia
            });
        });

        res.json({
            ok: true,
            profesionales: Object.values(map)
        });
    });
};

exports.getByCategoria = (req, res) => {

    const { categoria } = req.params;

    const query = `
        SELECT 
            p.id_profesional,
            u.nombre,
            p.especialidad,
            s.nombre_servicio,
            s.categoria,
            s.precio_referencia
        FROM Profesional p
        INNER JOIN Usuario u ON p.id_usuario = u.id_usuario
        INNER JOIN Servicio s ON s.id_profesional = p.id_profesional
        WHERE s.categoria = ?
    `;

    db.query(query, [categoria], (err, results) => {

        if (err) return res.status(500).json({ ok: false });

        const map = {};

        results.forEach(row => {

            if (!map[row.id_profesional]) {
                map[row.id_profesional] = {
                    id: row.id_profesional,
                    nombre: row.nombre,
                    especialidad: row.especialidad,
                    servicios: []
                };
            }

            map[row.id_profesional].servicios.push({
                nombre: row.nombre_servicio,
                categoria: row.categoria,
                precio: row.precio_referencia
            });
        });

        res.json({
            ok: true,
            profesionales: Object.values(map)
        });
    });
};