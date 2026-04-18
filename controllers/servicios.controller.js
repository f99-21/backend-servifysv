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

exports.crearServicio = (req, res) => {
    const { idProfesional, nombreServicio, categoria, descripcion, precioReferencia, disponibilidad } = req.validatedData;

    const query = `
        INSERT INTO Servicio (id_profesional, nombre_servicio, categoria, descripcion, precio_referencia, disponibilidad, fecha_creacion)
        VALUES (?, ?, ?, ?, ?, ?, CURDATE())
    `;

    db.query(query, [idProfesional, nombreServicio, categoria, descripcion, precioReferencia, disponibilidad ? 1 : 0], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Error al crear servicio"
            });
        }

        res.status(201).json({
            success: true,
            message: "Servicio creado exitosamente",
            servicio: {
                id: result.insertId,
                idProfesional,
                nombreServicio,
                categoria,
                descripcion,
                precioReferencia,
                disponibilidad
            }
        });
    });
};

exports.obtenerServiciosProfesional = (req, res) => {
    const { id } = req.validatedParams;

    const query = `
        SELECT
            id_servicio,
            nombre_servicio,
            categoria,
            descripcion,
            precio_referencia,
            disponibilidad,
            fecha_creacion
        FROM Servicio
        WHERE id_profesional = ?
        ORDER BY fecha_creacion DESC
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Error al obtener servicios"
            });
        }

        const servicios = results.map(row => ({
            id: row.id_servicio,
            nombre: row.nombre_servicio,
            categoria: row.categoria,
            descripcion: row.descripcion,
            precio: row.precio_referencia,
            disponible: row.disponibilidad === 1,
            fechaCreacion: row.fecha_creacion
        }));

        res.json({
            success: true,
            servicios
        });
    });
};

exports.actualizarServicio = (req, res) => {
    const { id } = req.validatedParams;
    const updates = req.validatedData;

    const setClause = Object.keys(updates).map(key => {
        const fieldMap = {
            nombreServicio: "nombre_servicio",
            categoria: "categoria",
            descripcion: "descripcion",
            precioReferencia: "precio_referencia",
            disponibilidad: "disponibilidad"
        };
        return `${fieldMap[key]} = ?`;
    }).join(", ");

    const values = Object.keys(updates).map(key => {
        if (key === "disponibilidad") {
            return updates[key] ? 1 : 0;
        }
        return updates[key];
    });

    const query = `UPDATE Servicio SET ${setClause} WHERE id_servicio = ?`;
    values.push(id);

    db.query(query, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Error al actualizar servicio"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Servicio no encontrado"
            });
        }

        res.json({
            success: true,
            message: "Servicio actualizado exitosamente"
        });
    });
};

exports.eliminarServicio = (req, res) => {
    const { id } = req.validatedParams;

    const query = "DELETE FROM Servicio WHERE id_servicio = ?";

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Error al eliminar servicio"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Servicio no encontrado"
            });
        }

        res.json({
            success: true,
            message: "Servicio eliminado exitosamente"
        });
    });
};