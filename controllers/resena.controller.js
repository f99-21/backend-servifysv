const db = require("../db");

exports.crearResena = (req, res) => {
    const { idSolicitud, idCliente, idProfesional, calificacion, comentario } = req.validatedData;

    const query = `
        INSERT INTO Resena (id_solicitud, id_cliente, id_profesional, calificacion, comentario, fecha_resena)
        VALUES (?, ?, ?, ?, ?, CURDATE())
    `;

    db.query(query, [idSolicitud, idCliente, idProfesional, calificacion, comentario], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Error al crear reseña"
            });
        }

        res.status(201).json({
            success: true,
            message: "Reseña creada exitosamente",
            resena: {
                id: result.insertId,
                idSolicitud,
                idCliente,
                idProfesional,
                calificacion,
                comentario,
                fechaResena: new Date().toISOString().split('T')[0]
            }
        });
    });
};

exports.obtenerResenasProfesional = (req, res) => {
    const { id } = req.validatedParams;

    const query = `
        SELECT
            r.id_resena,
            r.calificacion,
            r.comentario,
            r.fecha_resena,
            u.id_usuario,
            u.nombre AS cliente
        FROM Resena r
        INNER JOIN Usuario u ON r.id_cliente = u.id_usuario
        WHERE r.id_profesional = ?
        ORDER BY r.fecha_resena DESC
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Error al obtener reseñas"
            });
        }

        const resenas = results.map(row => ({
            id: row.id_resena,
            calificacion: row.calificacion,
            comentario: row.comentario,
            fechaResena: row.fecha_resena,
            cliente: {
                id: row.id_usuario,
                nombre: row.cliente
            }
        }));

        const calificacionPromedio = results.length > 0
            ? (results.reduce((sum, r) => sum + r.calificacion, 0) / results.length).toFixed(1)
            : 0;

        res.json({
            success: true,
            resenas,
            estadisticas: {
                totalResenas: results.length,
                calificacionPromedio: parseFloat(calificacionPromedio)
            }
        });
    });
};

exports.obtenerResenasPorSolicitud = (req, res) => {
    const { id } = req.validatedParams;

    const query = `
        SELECT
            r.id_resena,
            r.calificacion,
            r.comentario,
            r.fecha_resena,
            u.nombre AS cliente
        FROM Resena r
        INNER JOIN Usuario u ON r.id_cliente = u.id_usuario
        WHERE r.id_solicitud = ?
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Error al obtener reseña"
            });
        }

        if (results.length === 0) {
            return res.json({
                success: true,
                resena: null,
                message: "No hay reseña para esta solicitud"
            });
        }

        const row = results[0];
        res.json({
            success: true,
            resena: {
                id: row.id_resena,
                calificacion: row.calificacion,
                comentario: row.comentario,
                fechaResena: row.fecha_resena,
                cliente: row.cliente
            }
        });
    });
};

exports.actualizarResena = (req, res) => {
    const { id } = req.validatedParams;
    const { calificacion, comentario } = req.validatedData;

    const updates = [];
    const values = [];

    if (calificacion !== undefined) {
        updates.push("calificacion = ?");
        values.push(calificacion);
    }
    if (comentario) {
        updates.push("comentario = ?");
        values.push(comentario);
    }

    if (updates.length === 0) {
        return res.status(400).json({
            success: false,
            message: "No hay datos para actualizar"
        });
    }

    values.push(id);
    const query = `UPDATE Resena SET ${updates.join(", ")} WHERE id_resena = ?`;

    db.query(query, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Error al actualizar reseña"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Reseña no encontrada"
            });
        }

        res.json({
            success: true,
            message: "Reseña actualizada exitosamente"
        });
    });
};

exports.eliminarResena = (req, res) => {
    const { id } = req.validatedParams;

    const query = "DELETE FROM Resena WHERE id_resena = ?";

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Error al eliminar reseña"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Reseña no encontrada"
            });
        }

        res.json({
            success: true,
            message: "Reseña eliminada exitosamente"
        });
    });
};
