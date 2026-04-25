-- ============================================
-- SERVIFY DATABASE - ESTRUCTURA FINAL COMPLETA
-- ============================================
-- Esta es la estructura de base de datos DESPUÉS de aplicar migraciones
-- Muestra cómo quedarán todas las tablas

USE railway;

-- ============================================
-- TABLA: Usuario
-- CAMBIOS: +telefono, +ubicacion
-- ============================================
CREATE TABLE Usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('cliente', 'profesional')),
    telefono VARCHAR(20),
    ubicacion VARCHAR(200),
    fecha_registro DATE NOT NULL,

    INDEX idx_correo (correo),
    INDEX idx_tipo_usuario (tipo_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: Profesional
-- CAMBIOS: +calificacion_promedio, +total_calificaciones, +biografia
-- ============================================
CREATE TABLE Profesional (
    id_profesional INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    especialidad VARCHAR(100),
    descripcion TEXT,
    experiencia INT DEFAULT 0,
    estado_verificacion VARCHAR(20) DEFAULT 'no_verificado',
    calificacion_promedio DECIMAL(3,2) DEFAULT 0.00,
    total_calificaciones INT DEFAULT 0,
    biografia TEXT,

    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    INDEX idx_usuario (id_usuario),
    INDEX idx_calificacion (calificacion_promedio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: Servicio
-- CAMBIOS: +descripcion, +fecha_creacion, disponibilidad = TINYINT
-- ============================================
CREATE TABLE Servicio (
    id_servicio INT AUTO_INCREMENT PRIMARY KEY,
    id_profesional INT NOT NULL,
    nombre_servicio VARCHAR(100) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio_referencia DECIMAL(10,2) NOT NULL,
    disponibilidad TINYINT(1) DEFAULT 1,
    fecha_creacion DATE DEFAULT CURDATE(),

    FOREIGN KEY (id_profesional) REFERENCES Profesional(id_profesional) ON DELETE CASCADE,
    INDEX idx_profesional (id_profesional),
    INDEX idx_categoria (categoria),
    INDEX idx_disponibilidad (disponibilidad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: Solicitud
-- CAMBIOS: +id_profesional, fecha_solicitud→fecha, estado=ENUM
-- ============================================
CREATE TABLE Solicitud (
    id_solicitud INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_profesional INT NOT NULL,
    id_servicio INT NOT NULL,
    descripcion TEXT,
    estado ENUM('pendiente', 'aceptada', 'rechazada', 'completada', 'cancelada') DEFAULT 'pendiente',
    fecha DATE DEFAULT CURDATE(),

    FOREIGN KEY (id_cliente) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_profesional) REFERENCES Profesional(id_profesional) ON DELETE CASCADE,
    FOREIGN KEY (id_servicio) REFERENCES Servicio(id_servicio) ON DELETE CASCADE,
    INDEX idx_cliente (id_cliente),
    INDEX idx_profesional (id_profesional),
    INDEX idx_servicio (id_servicio),
    INDEX idx_estado (estado),
    INDEX idx_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: Mensaje
-- CAMBIOS: Rediseñada - vincular directamente a Solicitud (SIN Chat intermedia)
-- ============================================
CREATE TABLE Mensaje (
    id_mensaje INT AUTO_INCREMENT PRIMARY KEY,
    id_solicitud INT NOT NULL,
    id_remitente INT NOT NULL,
    contenido TEXT NOT NULL,
    fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_solicitud) REFERENCES Solicitud(id_solicitud) ON DELETE CASCADE,
    FOREIGN KEY (id_remitente) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    INDEX idx_solicitud (id_solicitud),
    INDEX idx_remitente (id_remitente),
    INDEX idx_fecha (fecha_envio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: Resena (renamed from Calificacion)
-- CAMBIOS: renombrada, +id_cliente, +id_profesional, puntuacion→calificacion
-- ============================================
CREATE TABLE Resena (
    id_resena INT AUTO_INCREMENT PRIMARY KEY,
    id_solicitud INT NOT NULL UNIQUE,
    id_cliente INT NOT NULL,
    id_profesional INT NOT NULL,
    calificacion INT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    comentario TEXT,
    fecha_resena DATE DEFAULT CURDATE(),

    FOREIGN KEY (id_solicitud) REFERENCES Solicitud(id_solicitud) ON DELETE CASCADE,
    FOREIGN KEY (id_cliente) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_profesional) REFERENCES Profesional(id_profesional) ON DELETE CASCADE,
    INDEX idx_profesional (id_profesional),
    INDEX idx_cliente (id_cliente),
    INDEX idx_fecha (fecha_resena)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: Eliminadas (NO EXISTEN)
-- ============================================
-- ❌ Chat - Innecesaria (Mensaje ahora vincula directamente a Solicitud)
-- ❌ Calificacion - Renombrada a Resena
-- ❌ Historial - Redundante (datos en Solicitud)

-- ============================================
-- SAMPLE DATA (Para pruebas)
-- ============================================

-- Usuarios
INSERT INTO Usuario (nombre, correo, contraseña, tipo_usuario, telefono, ubicacion, fecha_registro) VALUES
('Juan Pérez', 'juan@test.com', '$2b$10$...', 'cliente', '+503 7123-4567', 'San Salvador', CURDATE()),
('María López', 'maria@test.com', '$2b$10$...', 'cliente', '+503 7234-5678', 'San Salvador', CURDATE()),
('Carlos López', 'carlos@test.com', '$2b$10$...', 'profesional', '+503 7345-6789', 'San Salvador', CURDATE()),
('Ana García', 'ana@test.com', '$2b$10$...', 'profesional', '+503 7456-7890', 'San Salvador', CURDATE());

-- Profesionales
INSERT INTO Profesional (id_usuario, especialidad, descripcion, experiencia, estado_verificacion, calificacion_promedio, total_calificaciones, biografia) VALUES
(3, 'Electricista', 'Reparaciones eléctricas profesionales', 5, 'verificado', 4.8, 42, 'Con más de 5 años de experiencia en electricidad residencial'),
(4, 'Limpieza General', 'Servicios de limpieza profunda', 3, 'verificado', 4.6, 28, 'Especializados en limpieza de hogar y oficinas');

-- Servicios
INSERT INTO Servicio (id_profesional, nombre_servicio, categoria, descripcion, precio_referencia, disponibilidad, fecha_creacion) VALUES
(1, 'Instalación eléctrica', 'electricidad', 'Instalación de circuitos y toma corrientes en el hogar', 50.00, 1, CURDATE()),
(1, 'Reparación de cortocircuito', 'electricidad', 'Diagnóstico y reparación de problemas eléctricos', 30.00, 1, CURDATE()),
(2, 'Limpieza profunda de hogar', 'limpieza', 'Limpieza detallada y profunda de toda la casa', 45.50, 1, CURDATE()),
(2, 'Limpieza de oficinas', 'limpieza', 'Servicios de limpieza para espacios comerciales', 60.00, 1, CURDATE());

-- Solicitudes
INSERT INTO Solicitud (id_cliente, id_profesional, id_servicio, descripcion, estado, fecha) VALUES
(1, 1, 1, 'Necesito instalación de circuitos en mi casa nueva', 'completada', DATE_SUB(CURDATE(), INTERVAL 5 DAY)),
(2, 2, 3, 'Quiero limpieza profunda para mi hogar', 'completada', DATE_SUB(CURDATE(), INTERVAL 3 DAY)),
(1, 2, 4, 'Necesito limpiar mi oficina', 'aceptada', CURDATE());

-- Mensajes
INSERT INTO Mensaje (id_solicitud, id_remitente, contenido, fecha_envio) VALUES
(1, 1, 'Hola, necesito los servicios', NOW()),
(1, 3, 'Claro, puedo ayudarte', NOW()),
(1, 1, '¿Cuándo puedes venir?', NOW()),
(3, 1, 'Hola, aún necesito el servicio', NOW()),
(3, 4, 'Sí, puedo ir mañana', NOW());

-- Reseñas
INSERT INTO Resena (id_solicitud, id_cliente, id_profesional, calificacion, comentario, fecha_resena) VALUES
(1, 1, 1, 5, 'Excelente trabajo, muy profesional y puntual', DATE_SUB(CURDATE(), INTERVAL 5 DAY)),
(2, 2, 2, 5, 'Quedó impecable, muy recomendable', DATE_SUB(CURDATE(), INTERVAL 3 DAY));

-- ============================================
-- VERIFICAR ESTRUCTURA
-- ============================================
-- SHOW TABLES;
-- SELECT * FROM Usuario;
-- SELECT * FROM Profesional;
-- SELECT * FROM Servicio;
-- SELECT * FROM Solicitud;
-- SELECT * FROM Mensaje;
-- SELECT * FROM Resena;

-- ============================================
-- QUERIES EJEMPLO - USANDO NUEVA ESTRUCTURA
-- ============================================

-- 1. Obtener solicitudes para un profesional
-- SELECT s.* FROM Solicitud s
-- WHERE s.id_profesional = ? AND s.estado = 'pendiente';

-- 2. Obtener mensajes de una solicitud
-- SELECT m.* FROM Mensaje m
-- WHERE m.id_solicitud = ?
-- ORDER BY m.fecha_envio ASC;

-- 3. Obtener reseñas de un profesional con promedio
-- SELECT r.*,
--        AVG(r.calificacion) as promedio
-- FROM Resena r
-- WHERE r.id_profesional = ?
-- GROUP BY r.id_profesional;

-- 4. Obtener historial completado de un cliente
-- SELECT s.*, ser.nombre_servicio, p.id_profesional, u.nombre as profesional
-- FROM Solicitud s
-- INNER JOIN Servicio ser ON s.id_servicio = ser.id_servicio
-- INNER JOIN Profesional p ON s.id_profesional = p.id_profesional
-- INNER JOIN Usuario u ON p.id_usuario = u.id_usuario
-- WHERE s.id_cliente = ? AND s.estado IN ('completada', 'cancelada')
-- ORDER BY s.fecha DESC;

-- 5. Obtener ingresos de un profesional por mes
-- SELECT DATE_FORMAT(s.fecha, '%Y-%m') as mes,
--        COUNT(s.id_solicitud) as trabajos,
--        SUM(ser.precio_referencia) as total
-- FROM Solicitud s
-- INNER JOIN Servicio ser ON s.id_servicio = ser.id_servicio
-- WHERE s.id_profesional = ? AND s.estado = 'completada'
-- GROUP BY DATE_FORMAT(s.fecha, '%Y-%m')
-- ORDER BY mes DESC;
