const db = require("../db");

exports.getHistorial = (req, res) => {

    const { idUsuario } = req.validatedParams;

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

exports.obtenerTrabajosProfesional = (req, res) => {
    const { idUsuario } = req.validatedParams;

    const query = `
        SELECT
            s.id_solicitud,
            s.estado,
            s.fecha,
            serv.nombre_servicio,
            serv.categoria,
            serv.precio_referencia,
            u.nombre AS cliente
        FROM Solicitud s
        INNER JOIN Servicio serv ON s.id_servicio = serv.id_servicio
        INNER JOIN Profesional p ON s.id_profesional = p.id_profesional
        INNER JOIN Usuario u ON s.id_cliente = u.id_usuario
        WHERE p.id_usuario = ?
        AND s.estado = 'completada'
        ORDER BY s.fecha DESC
    `;

    db.query(query, [idUsuario], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Error al obtener trabajos"
            });
        }

        const trabajos = results.map(row => ({
            id: row.id_solicitud,
            estado: row.estado,
            fecha: row.fecha,
            servicio: {
                nombre: row.nombre_servicio,
                categoria: row.categoria,
                precio: row.precio_referencia
            },
            cliente: {
                nombre: row.cliente
            }
        }));

        res.json({
            success: true,
            trabajos,
            total: trabajos.length
        });
    });
};

exports.obtenerIngresosProfesional = (req, res) => {
    const { idUsuario } = req.validatedParams;

    const query = `
        SELECT
            serv.categoria,
            COUNT(s.id_solicitud) as cantidad,
            SUM(serv.precio_referencia) as total,
            DATE_FORMAT(s.fecha, '%Y-%m') as mes
        FROM Solicitud s
        INNER JOIN Servicio serv ON s.id_servicio = serv.id_servicio
        INNER JOIN Profesional p ON s.id_profesional = p.id_profesional
        WHERE p.id_usuario = ?
        AND s.estado = 'completada'
        GROUP BY serv.categoria, DATE_FORMAT(s.fecha, '%Y-%m')
        ORDER BY s.fecha DESC
    `;

    db.query(query, [idUsuario], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Error al obtener ingresos"
            });
        }

        const ingresosPorCategoria = {};
        const ingresosPorMes = {};
        let ingresoTotal = 0;

        results.forEach(row => {
            ingresoTotal += row.total || 0;

            if (!ingresosPorCategoria[row.categoria]) {
                ingresosPorCategoria[row.categoria] = {
                    categoria: row.categoria,
                    cantidad: 0,
                    total: 0
                };
            }
            ingresosPorCategoria[row.categoria].cantidad += row.cantidad;
            ingresosPorCategoria[row.categoria].total += row.total || 0;

            if (!ingresosPorMes[row.mes]) {
                ingresosPorMes[row.mes] = {
                    mes: row.mes,
                    total: 0
                };
            }
            ingresosPorMes[row.mes].total += row.total || 0;
        });

        res.json({
            success: true,
            estadisticas: {
                ingresoTotal: parseFloat(ingresoTotal.toFixed(2)),
                totalTrabajosCompletados: results.reduce((sum, r) => sum + r.cantidad, 0)
            },
            ingresosPorCategoria: Object.values(ingresosPorCategoria),
            ingresosPorMes: Object.values(ingresosPorMes).sort((a, b) => a.mes.localeCompare(b.mes))
        });
    });
};