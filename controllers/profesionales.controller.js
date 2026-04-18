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

    const { categoria } = req.validatedParams;

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

exports.actualizarPerfil = (req, res) => {
    const { id } = req.validatedParams;
    const { especialidad, descripcion, experiencia, biografia } = req.validatedData;

    const updates = [];
    const values = [];

    if (especialidad) {
        updates.push("especialidad = ?");
        values.push(especialidad);
    }
    if (descripcion) {
        updates.push("descripcion = ?");
        values.push(descripcion);
    }
    if (experiencia !== undefined) {
        updates.push("experiencia = ?");
        values.push(experiencia);
    }
    if (biografia) {
        updates.push("biografia = ?");
        values.push(biografia);
    }

    if (updates.length === 0) {
        return res.status(400).json({
            success: false,
            message: "No hay datos para actualizar"
        });
    }

    values.push(id);
    const query = `UPDATE Profesional SET ${updates.join(", ")} WHERE id_profesional = ?`;

    db.query(query, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Error al actualizar perfil profesional"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Profesional no encontrado"
            });
        }

        res.json({
            success: true,
            message: "Perfil profesional actualizado exitosamente"
        });
    });
};

exports.obtenerPerfilCompleto = (req, res) => {
    const { id } = req.validatedParams;

    const query = `
        SELECT
            p.id_profesional,
            p.especialidad,
            p.descripcion,
            p.experiencia,
            p.estado_verificacion,
            p.calificacion_promedio,
            p.total_calificaciones,
            p.biografia,
            u.id_usuario,
            u.nombre,
            u.correo,
            u.tipo_usuario
        FROM Profesional p
        INNER JOIN Usuario u ON p.id_usuario = u.id_usuario
        WHERE p.id_profesional = ?
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Error al obtener perfil"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Profesional no encontrado"
            });
        }

        const row = results[0];
        res.json({
            success: true,
            profesional: {
                id: row.id_profesional,
                usuario: {
                    id: row.id_usuario,
                    nombre: row.nombre,
                    correo: row.correo,
                    tipo: row.tipo_usuario
                },
                especialidad: row.especialidad,
                descripcion: row.descripcion,
                experiencia: row.experiencia,
                biografia: row.biografia,
                estadoVerificacion: row.estado_verificacion,
                calificacionPromedio: row.calificacion_promedio,
                totalCalificaciones: row.total_calificaciones
            }
        });
    });
};