-- ============================================
-- SERVIFY DATABASE MIGRATION
-- ============================================
-- This script updates the database schema to support the new features
-- Existing data will be preserved where possible
-- ============================================

USE railway;

-- ============================================
-- 1. MODIFICAR TABLA Usuario
-- ============================================
-- Agregar campos faltantes para el perfil de usuario

ALTER TABLE Usuario
ADD COLUMN telefono VARCHAR(20) AFTER tipo_usuario,
ADD COLUMN ubicacion VARCHAR(200) AFTER telefono;

-- ============================================
-- 2. MODIFICAR TABLA Profesional
-- ============================================
-- Agregar estadísticas de calificación y biografía

ALTER TABLE Profesional
ADD COLUMN calificacion_promedio DECIMAL(3,2) DEFAULT 0.00 AFTER experiencia,
ADD COLUMN total_calificaciones INT DEFAULT 0 AFTER calificacion_promedio,
ADD COLUMN biografia TEXT AFTER total_calificaciones;

-- ============================================
-- 3. MODIFICAR TABLA Servicio
-- ============================================
-- Agregar descripción, fecha de creación y mejorar disponibilidad

ALTER TABLE Servicio
ADD COLUMN descripcion TEXT AFTER categoria,
ADD COLUMN fecha_creacion DATE DEFAULT CURDATE() AFTER descripcion,
MODIFY COLUMN disponibilidad TINYINT(1) DEFAULT 1;

-- ============================================
-- 4. MODIFICAR TABLA Solicitud
-- ============================================
-- CRÍTICO: Agregar id_profesional (relación directa)
-- Renombrar fecha_solicitud a fecha
-- Mejorar manejo de estado

ALTER TABLE Solicitud
ADD COLUMN id_profesional INT NOT NULL AFTER id_cliente,
ADD FOREIGN KEY (id_profesional) REFERENCES Profesional(id_profesional),
CHANGE COLUMN fecha_solicitud fecha DATE DEFAULT CURDATE(),
MODIFY COLUMN estado ENUM('pendiente', 'aceptada', 'rechazada', 'completada', 'cancelada') DEFAULT 'pendiente';

-- ============================================
-- 5. REDISEÑAR TABLA Mensaje
-- ============================================
-- Cambio crítico: Vincular directamente a Solicitud en lugar de Chat
-- Esto simplifica las queries y mejora el performance

-- Crear nueva tabla Mensaje con estructura correcta
CREATE TABLE Mensaje_New (
    id_mensaje INT AUTO_INCREMENT PRIMARY KEY,
    id_solicitud INT NOT NULL,
    id_remitente INT NOT NULL,
    contenido TEXT NOT NULL,
    fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_solicitud) REFERENCES Solicitud(id_solicitud) ON DELETE CASCADE,
    FOREIGN KEY (id_remitente) REFERENCES Usuario(id_usuario),
    INDEX idx_solicitud (id_solicitud),
    INDEX idx_remitente (id_remitente)
);

-- Copiar datos existentes (si existen)
INSERT INTO Mensaje_New (id_mensaje, id_solicitud, id_remitente, contenido, fecha_envio)
SELECT m.id_mensaje, c.id_solicitud, m.id_remitente, m.contenido, m.fecha_envio
FROM Mensaje m
INNER JOIN Chat c ON m.id_chat = c.id_chat
ON DUPLICATE KEY UPDATE id_mensaje = VALUES(id_mensaje);

-- Eliminar tablas antiguas
DROP TABLE IF EXISTS Mensaje;
DROP TABLE IF EXISTS Chat;

-- Renombrar tabla nueva
RENAME TABLE Mensaje_New TO Mensaje;

-- ============================================
-- 6. RENOMBRAR/REDISEÑAR TABLA Calificacion -> Resena
-- ============================================
-- Cambio importante: renombrar a Resena y agregar campos faltantes

CREATE TABLE Resena (
    id_resena INT AUTO_INCREMENT PRIMARY KEY,
    id_solicitud INT NOT NULL UNIQUE,
    id_cliente INT NOT NULL,
    id_profesional INT NOT NULL,
    calificacion INT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    comentario TEXT,
    fecha_resena DATE DEFAULT CURDATE(),
    FOREIGN KEY (id_solicitud) REFERENCES Solicitud(id_solicitud) ON DELETE CASCADE,
    FOREIGN KEY (id_cliente) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_profesional) REFERENCES Profesional(id_profesional),
    INDEX idx_profesional (id_profesional),
    INDEX idx_cliente (id_cliente)
);

-- Copiar datos existentes de Calificacion si existen
INSERT INTO Resena (id_resena, id_solicitud, calificacion, comentario, fecha_resena)
SELECT c.id_calificacion, c.id_solicitud, c.puntuacion, c.comentario, c.fecha
FROM Calificacion c
ON DUPLICATE KEY UPDATE id_resena = VALUES(id_resena);

-- Eliminar tabla antigua
DROP TABLE IF EXISTS Calificacion;

-- ============================================
-- 7. ELIMINAR TABLA Historial (innecesaria)
-- ============================================
-- Los datos de historial se pueden derivar de Solicitud
-- donde estado = 'completada' o 'cancelada'

DROP TABLE IF EXISTS Historial;

-- ============================================
-- 8. CREAR ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices para búsquedas comunes
CREATE INDEX idx_usuario_tipo ON Usuario(tipo_usuario);
CREATE INDEX idx_profesional_usuario ON Profesional(id_usuario);
CREATE INDEX idx_servicio_profesional ON Servicio(id_profesional);
CREATE INDEX idx_servicio_categoria ON Servicio(categoria);
CREATE INDEX idx_solicitud_cliente ON Solicitud(id_cliente);
CREATE INDEX idx_solicitud_profesional ON Solicitud(id_profesional);
CREATE INDEX idx_solicitud_estado ON Solicitud(estado);

-- ============================================
-- 9. VERIFICAR LA ESTRUCTURA FINAL
-- ============================================

-- Ver estructura de todas las tablas
SHOW TABLES;

-- Ver estructura detallada
DESCRIBE Usuario;
DESCRIBE Profesional;
DESCRIBE Servicio;
DESCRIBE Solicitud;
DESCRIBE Mensaje;
DESCRIBE Resena;

-- ============================================
-- RESUMEN DE CAMBIOS
-- ============================================
/*

CAMBIOS REALIZADOS:

1. TABLA Usuario:
   ✅ Agregado: telefono VARCHAR(20)
   ✅ Agregado: ubicacion VARCHAR(200)

2. TABLA Profesional:
   ✅ Agregado: calificacion_promedio DECIMAL(3,2)
   ✅ Agregado: total_calificaciones INT
   ✅ Agregado: biografia TEXT

3. TABLA Servicio:
   ✅ Agregado: descripcion TEXT
   ✅ Agregado: fecha_creacion DATE
   ✅ Modificado: disponibilidad a TINYINT(1) para mejor manejo

4. TABLA Solicitud (CAMBIOS CRÍTICOS):
   ✅ Agregado: id_profesional INT (RELACIÓN DIRECTA)
   ✅ Renombrado: fecha_solicitud → fecha
   ✅ Modificado: estado a ENUM con valores válidos

5. TABLA Mensaje (REDISEÑO):
   ✅ Eliminada: dependencia de tabla Chat
   ✅ Agregado: id_solicitud (vinculación directa)
   ✅ Agregados: índices para performance

6. TABLA Resena (nueva):
   ✅ Renombrada: Calificacion → Resena
   ✅ Agregado: id_cliente (quién escribe la reseña)
   ✅ Agregado: id_profesional (a quién es la reseña)
   ✅ Agregado: id_solicitud (vinculación)
   ✅ Cambio: puntuacion → calificacion

7. TABLAS ELIMINADAS:
   ✅ Chat (innecesaria con Mensaje vinculado a Solicitud)
   ✅ Historial (datos se derivan de Solicitud)

8. ÍNDICES:
   ✅ Agregados índices para mejorar performance en queries comunes

COMPATIBILIDAD CON BACKEND:
✅ Solicitud ahora tiene id_profesional (requerido por solicitud.controller.js)
✅ Resena tabla con estructura completa (requerido por resena.controller.js)
✅ Mensaje vinculado directamente a Solicitud (simplifica chat.controller.js)
✅ Servicio con descripcion completa (requerido por PublicarViewController)
✅ Profesional con calificaciones (requerido por ProfesionalDetailViewController)
✅ Usuario con telefono (requerido por perfiles)

*/
