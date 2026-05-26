const db = require("../db");

// 📋 TODOS LOS PROFESIONALES
exports.getProfesionales = (req, res) => {

    const query = `
        SELECT
            p.id_profesional,
            p.especialidad,
            p.descripcion,
            p.experiencia,
            p.estado_verificacion,
            p.calificacion_promedio,
            p.total_calificaciones,
            u.id_usuario,
            u.nombre,
            u.correo,
            u.tipo_usuario,
            s.id_servicio,
            s.nombre_servicio,
            s.categoria,
            s.precio_referencia,
            s.disponibilidad
        FROM Profesional p
        INNER JOIN Usuario u ON p.id_usuario = u.id_usuario
        INNER JOIN Servicio s ON s.id_profesional = p.id_profesional
    `;

    db.query(query, (err, results) => {

        if (err) {
            return res.status(500).json({ ok: false });
        }

        const map = {};

        results.forEach(row => {

            if (!map[row.id_profesional]) {
                map[row.id_profesional] = {
                    id_profesional: row.id_profesional,
                    especialidad: row.especialidad,
                    descripcion: row.descripcion,
                    experiencia: row.experiencia,
                    estado_verificacion: row.estado_verificacion,
                    calificacion_promedio: row.calificacion_promedio,
                    total_calificaciones: row.total_calificaciones,
                    usuario: {
                        id_usuario: row.id_usuario,
                        nombre: row.nombre,
                        correo: row.correo,
                        tipo_usuario: row.tipo_usuario
                    },
                    servicios: []
                };
            }

            map[row.id_profesional].servicios.push({
                id_servicio: row.id_servicio,
                nombre_servicio: row.nombre_servicio,
                categoria: row.categoria,
                precio_referencia: row.precio_referencia,
                disponibilidad: row.disponibilidad
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
            p.especialidad,
            p.descripcion,
            p.experiencia,
            p.estado_verificacion,
            p.calificacion_promedio,
            p.total_calificaciones,
            u.id_usuario,
            u.nombre,
            u.correo,
            u.tipo_usuario,
            s.id_servicio,
            s.nombre_servicio,
            s.categoria,
            s.precio_referencia,
            s.disponibilidad
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
                    id_profesional: row.id_profesional,
                    especialidad: row.especialidad,
                    descripcion: row.descripcion,
                    experiencia: row.experiencia,
                    estado_verificacion: row.estado_verificacion,
                    calificacion_promedio: row.calificacion_promedio,
                    total_calificaciones: row.total_calificaciones,
                    usuario: {
                        id_usuario: row.id_usuario,
                        nombre: row.nombre,
                        correo: row.correo,
                        tipo_usuario: row.tipo_usuario
                    },
                    servicios: []
                };
            }

            map[row.id_profesional].servicios.push({
                id_servicio: row.id_servicio,
                nombre_servicio: row.nombre_servicio,
                categoria: row.categoria,
                precio_referencia: row.precio_referencia,
                disponibilidad: row.disponibilidad
            });
        });

        res.json({
            ok: true,
            profesionales: Object.values(map)
        });
    });
};

exports.buscar = (req, res) => {
    const { q, categoria, precioMin, precioMax, calificacion } = req.query;

    let conditions = [];
    let values = [];

    if (q) {
        conditions.push("(u.nombre LIKE ? OR p.especialidad LIKE ? OR p.descripcion LIKE ?)");
        values.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (categoria) {
        conditions.push("s.categoria = ?");
        values.push(categoria);
    }
    if (precioMin) {
        conditions.push("s.precio_referencia >= ?");
        values.push(Number(precioMin));
    }
    if (precioMax) {
        conditions.push("s.precio_referencia <= ?");
        values.push(Number(precioMax));
    }
    if (calificacion) {
        conditions.push("p.calificacion_promedio >= ?");
        values.push(Number(calificacion));
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
        SELECT DISTINCT
            p.id_profesional,
            p.especialidad,
            p.descripcion,
            p.experiencia,
            p.calificacion_promedio,
            p.total_calificaciones,
            u.id_usuario,
            u.nombre,
            u.correo,
            s.categoria,
            s.precio_referencia
        FROM Profesional p
        INNER JOIN Usuario u ON p.id_usuario = u.id_usuario
        INNER JOIN Servicio s ON s.id_profesional = p.id_profesional
        ${where}
        ORDER BY p.calificacion_promedio DESC
    `;

    db.query(query, values, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Error al buscar profesionales" });
        }

        res.json({ success: true, total: results.length, profesionales: results });
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
                id_profesional: row.id_profesional,
                especialidad: row.especialidad,
                descripcion: row.descripcion,
                experiencia: row.experiencia,
                estado_verificacion: row.estado_verificacion,
                calificacion_promedio: row.calificacion_promedio,
                total_calificaciones: row.total_calificaciones,
                biografia: row.biografia,
                usuario: {
                    id_usuario: row.id_usuario,
                    nombre: row.nombre,
                    correo: row.correo,
                    tipo_usuario: row.tipo_usuario
                }
            }
        });
    });
};