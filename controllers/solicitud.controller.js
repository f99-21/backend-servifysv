const db = require("../db");

exports.crearSolicitud = (req, res) => {
    const { idCliente, idProfesional, idServicio, descripcion } = req.validatedData;

    const query = `
        INSERT INTO Solicitud (id_cliente, id_profesional, id_servicio, descripcion, estado, fecha)
        VALUES (?, ?, ?, ?, 'pendiente', CURDATE())
    `;

    db.query(query, [idCliente, idProfesional, idServicio, descripcion], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Error al crear solicitud"
            });
        }

        res.status(201).json({
            success: true,
            message: "Solicitud creada exitosamente",
            solicitud: {
                id: result.insertId,
                idCliente,
                idProfesional,
                idServicio,
                descripcion,
                estado: "pendiente",
                fecha: new Date().toISOString().split('T')[0]
            }
        });
    });
};

exports.obtenerSolicitudesProfesional = (req, res) => {
    const { id } = req.validatedParams;

    const query = `
        SELECT
            s.id_solicitud,
            s.estado,
            s.fecha,
            s.descripcion,
            u.id_usuario,
            u.nombre AS cliente,
            u.correo,
            serv.nombre_servicio,
            serv.precio_referencia
        FROM Solicitud s
        INNER JOIN Usuario u ON s.id_cliente = u.id_usuario
        INNER JOIN Servicio serv ON s.id_servicio = serv.id_servicio
        WHERE s.id_profesional = ?
        ORDER BY s.fecha DESC
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Error al obtener solicitudes"
            });
        }

        const solicitudes = results.map(row => ({
            id: row.id_solicitud,
            estado: row.estado,
            fecha: row.fecha,
            descripcion: row.descripcion,
            cliente: {
                id: row.id_usuario,
                nombre: row.cliente,
                correo: row.correo
            },
            servicio: {
                nombre: row.nombre_servicio,
                precio: row.precio_referencia
            }
        }));

        res.json({
            success: true,
            solicitudes
        });
    });
};

exports.obtenerSolicitudesCliente = (req, res) => {
    const { id } = req.validatedParams;

    const query = `
        SELECT
            s.id_solicitud,
            s.estado,
            s.fecha,
            s.descripcion,
            p.id_profesional,
            u.nombre AS profesional,
            u.correo,
            serv.nombre_servicio,
            serv.precio_referencia
        FROM Solicitud s
        INNER JOIN Profesional p ON s.id_profesional = p.id_profesional
        INNER JOIN Usuario u ON p.id_usuario = u.id_usuario
        INNER JOIN Servicio serv ON s.id_servicio = serv.id_servicio
        WHERE s.id_cliente = ?
        ORDER BY s.fecha DESC
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Error al obtener solicitudes"
            });
        }

        const solicitudes = results.map(row => ({
            id: row.id_solicitud,
            estado: row.estado,
            fecha: row.fecha,
            descripcion: row.descripcion,
            profesional: {
                id: row.id_profesional,
                nombre: row.profesional,
                correo: row.correo
            },
            servicio: {
                nombre: row.nombre_servicio,
                precio: row.precio_referencia
            }
        }));

        res.json({
            success: true,
            solicitudes
        });
    });
};

exports.actualizarEstadoSolicitud = (req, res) => {
    const { id } = req.validatedParams;
    const { estado } = req.validatedData;

    const query = `
        UPDATE Solicitud
        SET estado = ?
        WHERE id_solicitud = ?
    `;

    db.query(query, [estado, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Error al actualizar solicitud"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Solicitud no encontrada"
            });
        }

        res.json({
            success: true,
            message: `Solicitud ${estado} exitosamente`
        });
    });
};

exports.obtenerDetalleSolicitud = (req, res) => {
    const { id } = req.validatedParams;

    const query = `
        SELECT
            s.id_solicitud,
            s.estado,
            s.fecha,
            s.descripcion,
            u_cliente.id_usuario AS cliente_id,
            u_cliente.nombre AS cliente_nombre,
            u_cliente.correo AS cliente_correo,
            u_prof.id_usuario AS prof_id,
            u_prof.nombre AS prof_nombre,
            u_prof.correo AS prof_correo,
            serv.nombre_servicio,
            serv.precio_referencia
        FROM Solicitud s
        INNER JOIN Usuario u_cliente ON s.id_cliente = u_cliente.id_usuario
        INNER JOIN Profesional p ON s.id_profesional = p.id_profesional
        INNER JOIN Usuario u_prof ON p.id_usuario = u_prof.id_usuario
        INNER JOIN Servicio serv ON s.id_servicio = serv.id_servicio
        WHERE s.id_solicitud = ?
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Error al obtener solicitud"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Solicitud no encontrada"
            });
        }

        const row = results[0];
        res.json({
            success: true,
            solicitud: {
                id: row.id_solicitud,
                estado: row.estado,
                fecha: row.fecha,
                descripcion: row.descripcion,
                cliente: {
                    id: row.cliente_id,
                    nombre: row.cliente_nombre,
                    correo: row.cliente_correo
                },
                profesional: {
                    id: row.prof_id,
                    nombre: row.prof_nombre,
                    correo: row.prof_correo
                },
                servicio: {
                    nombre: row.nombre_servicio,
                    precio: row.precio_referencia
                }
            }
        });
    });
};
