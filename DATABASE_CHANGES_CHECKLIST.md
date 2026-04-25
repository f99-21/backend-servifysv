# 📋 Database Changes Checklist

## Cambios Necesarios a la Base de Datos

### 🔴 CRÍTICOS (Sin estos, el backend fallará)

- [ ] **Solicitud: Agregar `id_profesional`**
  ```sql
  ALTER TABLE Solicitud
  ADD COLUMN id_profesional INT NOT NULL AFTER id_cliente,
  ADD FOREIGN KEY (id_profesional) REFERENCES Profesional(id_profesional);
  ```
  **Por qué:** Backend espera `id_profesional` en Solicitud.controller.js línea 8
  **Impacto:** Sin esto, no se pueden crear solicitudes

---

- [ ] **Mensaje: Eliminar tabla Chat y vincular Mensaje directamente a Solicitud**
  ```sql
  -- Paso 1: Copiar datos con nueva estructura
  CREATE TABLE Mensaje_New (...);
  INSERT INTO Mensaje_New SELECT ...;
  
  -- Paso 2: Eliminar tablas viejas
  DROP TABLE Mensaje;
  DROP TABLE Chat;
  
  -- Paso 3: Renombrar
  RENAME TABLE Mensaje_New TO Mensaje;
  ```
  **Por qué:** Backend en chat.controller.js línea 8 accede directamente `id_solicitud`
  **Impacto:** Las queries de chat serán lentas sin esto, o no funcionarán

---

- [ ] **Resena: Renombrar Calificacion y agregar campos**
  ```sql
  CREATE TABLE Resena (
      id_resena INT AUTO_INCREMENT PRIMARY KEY,
      id_solicitud INT NOT NULL,
      id_cliente INT NOT NULL,        -- ← NUEVO
      id_profesional INT NOT NULL,    -- ← NUEVO
      calificacion INT,               -- ← RENOMBRADO
      comentario TEXT,
      fecha_resena DATE
  );
  ```
  **Por qué:** resena.controller.js requiere estos 5 campos
  **Impacto:** Sin esto, no se pueden crear reseñas

---

### 🟡 IMPORTANTES (Sin estos, funcionalidades clave no funcionan)

- [ ] **Usuario: Agregar `telefono` y `ubicacion`**
  ```sql
  ALTER TABLE Usuario
  ADD COLUMN telefono VARCHAR(20),
  ADD COLUMN ubicacion VARCHAR(200);
  ```
  **Por qué:** auth.controller.js línea 130 intenta guardar `telefono`
  **Impacto:** No se puede guardar teléfono del usuario

---

- [ ] **Profesional: Agregar estadísticas y biografía**
  ```sql
  ALTER TABLE Profesional
  ADD COLUMN calificacion_promedio DECIMAL(3,2) DEFAULT 0.00,
  ADD COLUMN total_calificaciones INT DEFAULT 0,
  ADD COLUMN biografia TEXT;
  ```
  **Por qué:** Frontend muestra estas métricas en ProfesionalDetailViewController
  **Impacto:** No se muestra calificación ni biografía

---

- [ ] **Servicio: Agregar `descripcion` y `fecha_creacion`**
  ```sql
  ALTER TABLE Servicio
  ADD COLUMN descripcion TEXT,
  ADD COLUMN fecha_creacion DATE DEFAULT CURDATE();
  ```
  **Por qué:** PublicarViewController envía descripción al crear servicio
  **Impacto:** No se guarda descripción completa del servicio

---

- [ ] **Solicitud: Cambiar `estado` a ENUM**
  ```sql
  ALTER TABLE Solicitud
  MODIFY COLUMN estado ENUM('pendiente', 'aceptada', 'rechazada', 'completada', 'cancelada') DEFAULT 'pendiente';
  ```
  **Por qué:** Validar estados correctos, evitar valores inválidos
  **Impacto:** Datos inconsistentes en base de datos

---

- [ ] **Servicio: Cambiar `disponibilidad` a TINYINT**
  ```sql
  ALTER TABLE Servicio
  MODIFY COLUMN disponibilidad TINYINT(1) DEFAULT 1;
  ```
  **Por qué:** Tipo de dato correcto para booleano
  **Impacto:** Conversión innecesaria de string a boolean

---

### 💡 OPTIMIZACIONES (Sin estos, funciona pero lentamente)

- [ ] **Agregar índices para performance**
  ```sql
  CREATE INDEX idx_usuario_tipo ON Usuario(tipo_usuario);
  CREATE INDEX idx_solicitud_cliente ON Solicitud(id_cliente);
  CREATE INDEX idx_solicitud_profesional ON Solicitud(id_profesional);
  CREATE INDEX idx_solicitud_estado ON Solicitud(estado);
  CREATE INDEX idx_servicio_categoria ON Servicio(categoria);
  -- ... más en DATABASE_MIGRATION.sql
  ```
  **Por qué:** Queries más rápidas
  **Impacto:** Mejor performance en producción

---

- [ ] **Eliminar tabla Historial**
  ```sql
  DROP TABLE IF EXISTS Historial;
  ```
  **Por qué:** Datos redundantes, se pueden derivar de Solicitud
  **Impacto:** Ahorro de espacio, menos código de mantenimiento

---

## 📊 Resumen de Cambios

| Tabla | Tipo | Cambio | Necesario |
|-------|------|--------|-----------|
| Solicitud | CRÍTICO | +id_profesional | ✅ SÍ |
| Mensaje | CRÍTICO | Vincular a Solicitud | ✅ SÍ |
| Chat | CRÍTICO | ELIMINAR | ✅ SÍ |
| Resena | CRÍTICO | Renombrar, +campos | ✅ SÍ |
| Usuario | IMPORTANTE | +telefono, +ubicacion | ✅ SÍ |
| Profesional | IMPORTANTE | +estadísticas | ✅ SÍ |
| Servicio | IMPORTANTE | +descripcion | ✅ SÍ |
| Solicitud | IMPORTANTE | estado=ENUM | ✅ SÍ |
| Servicio | IMPORTANTE | disponibilidad=TINYINT | ✅ SÍ |
| Índices | OPTIMIZACIÓN | Agregar índices | ⚠️ RECOMENDADO |
| Historial | OPTIMIZACIÓN | Eliminar | ⚠️ RECOMENDADO |

---

## 🚀 Pasos para Aplicar

### Opción 1: Usar Script de Migración (RECOMENDADO)
```bash
mysql -u root -p < DATABASE_MIGRATION.sql
```

### Opción 2: Manual por partes
1. Hacer backup de la base de datos
2. Ejecutar cada ALTER TABLE en orden
3. Verificar que los datos se guardaron correctamente

### Opción 3: Ver estructura nueva completa
```bash
cat DATABASE_SCHEMA_FINAL.sql
```

---

## ✅ Validación Después de Cambios

Después de aplicar los cambios, verificar:

```sql
-- 1. Verificar estructura de Solicitud
DESC Solicitud;
-- Debe tener: id_solicitud, id_cliente, id_profesional, id_servicio, descripcion, estado, fecha

-- 2. Verificar Mensaje
DESC Mensaje;
-- Debe tener: id_mensaje, id_solicitud, id_remitente, contenido, fecha_envio
-- NO debe referirse a Chat

-- 3. Verificar Resena
DESC Resena;
-- Debe tener: id_resena, id_solicitud, id_cliente, id_profesional, calificacion, comentario, fecha_resena

-- 4. Verificar Usuario
DESC Usuario;
-- Debe tener: telefono, ubicacion

-- 5. Verificar Profesional
DESC Profesional;
-- Debe tener: calificacion_promedio, total_calificaciones, biografia

-- 6. Verificar Servicio
DESC Servicio;
-- Debe tener: descripcion, fecha_creacion
-- disponibilidad debe ser TINYINT(1)

-- 7. Verificar que Chat no exista
SHOW TABLES;
-- NO debe mostrar tabla Chat

-- 8. Verificar que Historial no exista (si fue eliminada)
SHOW TABLES;
-- Puede eliminar Historial (es redundante)
```

---

## 📝 Notas Importantes

1. **Hacer Backup ANTES:** 
   ```bash
   mysqldump -u root -p railway > backup.sql
   ```

2. **Los datos existentes se preservarán** en la mayoría de cambios
   - Algunas inserciones de prueba pueden no migrar si tienen datos incompatibles

3. **Después de los cambios, el backend funcionará correctamente:**
   - ✅ Crear solicitudes
   - ✅ Crear reseñas
   - ✅ Obtener mensajes
   - ✅ Actualizar perfiles
   - ✅ Historial completado

4. **No hay cambios en el código necesarios** después de ejecutar estas migraciones
   - El backend ya está escrito esperando esta estructura

---

## 🔗 Archivos Relacionados

- `DATABASE_MIGRATION.sql` - Script completo de cambios
- `DATABASE_SCHEMA_FINAL.sql` - Estructura nueva completa
- `DATABASE_ANALYSIS.md` - Análisis detallado de por qué se necesitan cambios
