# 📊 Database Analysis Report

## Overview
Análisis de la estructura de BD actual vs. las necesidades del frontend iOS y backend implementado.

---

## ⚠️ PROBLEMAS CRÍTICOS ENCONTRADOS

### 1. **Tabla Solicitud - MISSING id_profesional** 🔴 CRÍTICO

**Problema:**
```sql
-- ACTUAL (INCORRECTO)
CREATE TABLE Solicitud (
    id_solicitud INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_servicio INT NOT NULL,  -- ❌ Solo referencia al servicio
    fecha_solicitud DATE,
    estado VARCHAR(50),
    descripcion TEXT
);
```

**Impacto:**
- No hay forma de saber directamente a qué profesional va dirigida la solicitud
- Se requieren JOINs complejos: `Solicitud → Servicio → Profesional`
- El backend asume `id_profesional` en Solicitud (ver `solicitud.controller.js` línea 8)
- Las queries de historial serán lentas y complicadas

**Solución:**
```sql
ALTER TABLE Solicitud
ADD COLUMN id_profesional INT NOT NULL AFTER id_cliente,
ADD FOREIGN KEY (id_profesional) REFERENCES Profesional(id_profesional);
```

---

### 2. **Tabla Mensaje - Diseño Ineficiente** 🔴 CRÍTICO

**Problema:**
```sql
-- ACTUAL (INEFICIENTE)
CREATE TABLE Chat (
    id_chat INT AUTO_INCREMENT PRIMARY KEY,
    id_solicitud INT NOT NULL
);

CREATE TABLE Mensaje (
    id_mensaje INT AUTO_INCREMENT PRIMARY KEY,
    id_chat INT NOT NULL,        -- ❌ Nivel extra de indirección
    id_remitente INT NOT NULL,
    contenido TEXT,
    fecha_envio DATETIME
);
```

**Impacto:**
- Necesita JOIN extra: `Mensaje → Chat → Solicitud`
- Más queries, más joins, más lentitud
- Backend espera acceso directo: `getMensajes(:idSolicitud)` (chat.controller.js línea 8)
- Tabla Chat es innecesaria

**Query actual (lenta):**
```sql
SELECT m.* FROM Mensaje m
INNER JOIN Chat c ON m.id_chat = c.id_chat
WHERE c.id_solicitud = ?  -- ❌ 2 JOINs para acceder a la solicitud
```

**Query óptima:**
```sql
SELECT m.* FROM Mensaje m
WHERE m.id_solicitud = ?  -- ✅ 1 acceso directo
```

**Solución:**
- Eliminar tabla Chat
- Vincular Mensaje directamente a Solicitud
- Esto reduce complejidad y mejora performance

---

### 3. **Falta Tabla Resena (Calificacion mal estructurada)** 🔴 CRÍTICO

**Problema:**
```sql
-- ACTUAL (INCOMPLETA)
CREATE TABLE Calificacion (
    id_calificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_solicitud INT NOT NULL,
    puntuacion INT CHECK (puntuacion BETWEEN 1 AND 5),
    comentario TEXT,
    fecha DATE
    -- ❌ Falta: id_cliente (quién da la reseña)
    -- ❌ Falta: id_profesional (a quién es la reseña)
);
```

**Impacto:**
- No se sabe quién escribió la reseña
- No se sabe a qué profesional es la reseña
- Backend implementó `Resena` con 5 campos (`resena.controller.js`):
  - id_solicitud ✅
  - id_cliente ❌ FALTA
  - id_profesional ❌ FALTA
  - calificacion ❌ se llama `puntuacion` en BD
  - comentario ✅

**Solución:**
- Renombrar tabla a `Resena`
- Agregar `id_cliente` (quién comenta)
- Agregar `id_profesional` (a quién es la reseña)
- Renombrar `puntuacion` a `calificacion`

---

### 4. **Tabla Usuario - Campos Faltantes** 🟡 IMPORTANTE

**Problema:**
```sql
-- ACTUAL (INCOMPLETO)
CREATE TABLE Usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(20) NOT NULL,
    fecha_registro DATE NOT NULL
    -- ❌ Falta: telefono
    -- ❌ Falta: ubicacion
);
```

**Impacto:**
- Frontend permite editar teléfono (ClienteProfileViewController)
- Frontend permite editar ubicación (ProfileViewController)
- Backend implementó `actualizarPerfil` con telefono (auth.controller.js línea 130)
- No hay lugar para guardar estos datos

**Solución:**
```sql
ALTER TABLE Usuario
ADD COLUMN telefono VARCHAR(20),
ADD COLUMN ubicacion VARCHAR(200);
```

---

### 5. **Tabla Profesional - Campos de Estadísticas Faltantes** 🟡 IMPORTANTE

**Problema:**
```sql
-- ACTUAL (INCOMPLETO)
CREATE TABLE Profesional (
    id_profesional INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    especialidad VARCHAR(100),
    descripcion TEXT,
    experiencia INT,
    estado_verificacion VARCHAR(20)
    -- ❌ Falta: calificacion_promedio
    -- ❌ Falta: total_calificaciones
    -- ❌ Falta: biografia
);
```

**Impacto:**
- Frontend muestra "4.8 ⭐" (ProfesionalDetailViewController)
- Frontend muestra biografía (ProfesionalProfileViewController)
- Backend obtiene estos campos (servicios.controller.js línea 37-40)
- Calcular promedios en tiempo real es ineficiente

**Solución:**
```sql
ALTER TABLE Profesional
ADD COLUMN calificacion_promedio DECIMAL(3,2) DEFAULT 0.00,
ADD COLUMN total_calificaciones INT DEFAULT 0,
ADD COLUMN biografia TEXT;
```

---

### 6. **Tabla Servicio - Campo de Descripción Faltante** 🟡 IMPORTANTE

**Problema:**
```sql
-- ACTUAL (INCOMPLETO)
CREATE TABLE Servicio (
    id_servicio INT AUTO_INCREMENT PRIMARY KEY,
    id_profesional INT NOT NULL,
    nombre_servicio VARCHAR(100),
    categoria VARCHAR(100),
    -- ❌ Falta: descripcion (campo completo)
    precio_referencia DECIMAL(10,2),
    disponibilidad VARCHAR(50)
    -- ❌ Falta: fecha_creacion
);
```

**Impacto:**
- Frontend muestra descripción detallada del servicio (PublicarViewController)
- Backend espera descripción en Servicio (servicios.controller.js línea 12)
- Sin descripción, el PublicarViewController no tiene dónde guardar datos

**Solución:**
```sql
ALTER TABLE Servicio
ADD COLUMN descripcion TEXT,
ADD COLUMN fecha_creacion DATE DEFAULT CURDATE();
```

---

### 7. **Tabla Solicitud - Estado como VARCHAR** 🟡 ISSUE

**Problema:**
```sql
-- ACTUAL (INEFICIENTE)
CREATE TABLE Solicitud (
    ...
    estado VARCHAR(50)  -- ❌ String abierto, permite valores inválidos
);
```

**Impacto:**
- Posibles valores inconsistentes: "Pendiente", "PENDIENTE", "pendiente ", etc.
- Backend espera valores específicos (solicitud.schema.js línea 16):
  - "pendiente"
  - "aceptada"
  - "rechazada"
  - "completada"
  - "cancelada"

**Solución:**
```sql
ALTER TABLE Solicitud
MODIFY COLUMN estado ENUM('pendiente', 'aceptada', 'rechazada', 'completada', 'cancelada') DEFAULT 'pendiente';
```

---

### 8. **Tabla Servicio - Disponibilidad como VARCHAR** 🟡 ISSUE

**Problema:**
```sql
-- ACTUAL (INCORRECTO)
CREATE TABLE Servicio (
    disponibilidad VARCHAR(50)  -- ❌ "Disponible", "No disponible", etc.
);
```

**Impacto:**
- Backend usa BOOLEAN (servicios.controller.js línea 127)
- Frontend usa BOOLEAN (PublicarViewController)
- Conversión innecesaria de string → boolean

**Solución:**
```sql
MODIFY COLUMN disponibilidad TINYINT(1) DEFAULT 1;  -- 0 = false, 1 = true
```

---

### 9. **Tabla Historial - Innecesaria** 🟡 REDUNDANCIA

**Problema:**
```sql
-- ACTUAL (REDUNDANTE)
CREATE TABLE Historial (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_profesional INT NOT NULL,
    id_solicitud INT NOT NULL,
    estado_final VARCHAR(50)
);
```

**Impacto:**
- Los datos ya están en Solicitud
- Historial = SELECT * FROM Solicitud WHERE estado IN ('completada', 'cancelada')
- Duplicación de datos = consistencia comprometida
- Tabla innecesaria que consume espacio

**Solución:**
- Eliminar tabla
- Usar queries sobre Solicitud en lugar de Historial

---

### 10. **Falta Campo fecha en Solicitud** 🟡 NAMING

**Problema:**
```sql
-- ACTUAL (NOMBRE INCONSISTENTE)
CREATE TABLE Solicitud (
    ...
    fecha_solicitud DATE  -- ❌ Nombre largo
);
```

**Impacto:**
- Backend usa `fecha` (solicitud.controller.js línea 8)
- Inconsistencia de naming entre código y BD

**Solución:**
```sql
RENAME COLUMN fecha_solicitud TO fecha;
-- O simplemente usar "fecha" en nuevas tablas
```

---

## 📋 RESUMEN DE CAMBIOS

| Tabla | Cambio | Impacto | Prioridad |
|-------|--------|--------|-----------|
| **Solicitud** | Agregar `id_profesional` | CRÍTICO - Necesario para solicitudes | 🔴 |
| **Mensaje** | Eliminar tabla Chat, vincular a Solicitud | CRÍTICO - Necesario para queries | 🔴 |
| **Resena** | Renombrar Calificacion, agregar campos | CRÍTICO - Necesario para reviews | 🔴 |
| **Usuario** | Agregar telefono, ubicacion | IMPORTANTE - Frontend lo usa | 🟡 |
| **Profesional** | Agregar calificacion_promedio, total, biografia | IMPORTANTE - Frontend lo muestra | 🟡 |
| **Servicio** | Agregar descripcion, fecha_creacion | IMPORTANTE - Frontend requiere | 🟡 |
| **Servicio** | Cambiar disponibilidad a TINYINT | IMPORTANTE - Tipo de dato correcto | 🟡 |
| **Solicitud** | Cambiar estado a ENUM | IMPORTANTE - Validación de datos | 🟡 |
| **Solicitud** | Renombrar fecha_solicitud a fecha | IMPORTANTE - Consistencia | 🟡 |
| **Historial** | Eliminar tabla | IMPORTANTE - Redundancia | 🟡 |

---

## 🔍 EJEMPLO: Query Comparación

### ANTES (Ineficiente)
```sql
-- Para obtener solicitudes de un profesional
SELECT s.* FROM Solicitud s
INNER JOIN Servicio ser ON s.id_servicio = ser.id_servicio
INNER JOIN Profesional p ON ser.id_profesional = p.id_profesional
WHERE p.id_usuario = ? AND s.estado = 'pendiente'
-- ❌ 3 JOINs necesarios
```

### DESPUÉS (Eficiente)
```sql
-- Para obtener solicitudes de un profesional
SELECT s.* FROM Solicitud s
WHERE s.id_profesional = ? AND s.estado = 'pendiente'
-- ✅ Sin JOINs, acceso directo
```

---

## ✅ IMPACTO EN CONTROLLERS

### solicitud.controller.js
```javascript
// Línea 8: INSERT INTO Solicitud (..., id_profesional, ...)
// ❌ REQUIERE: id_profesional en tabla Solicitud
```

### resena.controller.js
```javascript
// Línea 6: { idCliente, idProfesional, calificacion, comentario }
// ❌ REQUIERE: id_cliente, id_profesional en tabla Resena
```

### chat.controller.js
```javascript
// Línea 8: SELECT ... WHERE m.id_solicitud = ?
// ❌ REQUIERE: id_solicitud en tabla Mensaje (sin Chat intermedia)
```

### historial.controller.js
```javascript
// Línea 12: WHERE s.estado = 'completada'
// ✅ Usa Solicitud directamente (Historial no necesaria)
```

---

## 🚀 RECOMENDACIÓN

**Aplicar el script `DATABASE_MIGRATION.sql` ANTES de usar el backend en producción.**

Los cambios son críticos para:
1. ✅ Hacer funcionar los endpoints implementados
2. ✅ Optimizar queries y performance
3. ✅ Mantener integridad de datos
4. ✅ Alinear BD con código frontend y backend

**Riesgo de NO aplicar cambios:**
- ❌ Backend fallará al crear solicitudes (falta id_profesional)
- ❌ Backend fallará al crear reseñas (falta id_cliente, id_profesional)
- ❌ Queries de historial serán incorrectas
- ❌ El frontend no podrá guardar teléfono ni ubicación
- ❌ Performance degradado por JOINs innecesarios
