# API ServifySV v1 - Documentación

## 🚀 Configuración

### Variables de Entorno
Copia `.env.example` a `.env` y llena los valores:

```bash
PORT=3000
DB_HOST=gondola.proxy.rlwy.net
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=railway
DB_PORT=19147
JWT_SECRET=tu_secreto_super_seguro
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

### Instalación
```bash
npm install
npm start
```

---

## 🔐 Autenticación

### Token JWT
Todas las rutas protegidas requieren el header:
```
Authorization: Bearer <tu_token_jwt>
```

### ✨ Obtén el token en el login

---

## 📚 Endpoints

### 1. Autenticación `/api/v1/auth`

#### Registro
```
POST /api/v1/auth/register
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "correo": "juan@example.com",
  "contraseña": "password123",
  "tipo_usuario": "cliente"  // "cliente" o "profesional"
}

Response 201:
{
  "success": true,
  "message": "Usuario registrado exitosamente"
}
```

#### Login
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "correo": "juan@example.com",
  "contraseña": "password123"
}

Response 200:
{
  "success": true,
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {
    "id": 1,
    "nombre": "Juan Pérez",
    "correo": "juan@example.com",
    "tipo_usuario": "cliente"
  }
}
```

#### Obtener Perfil (Requiere Token)
```
GET /api/v1/auth/perfil/1
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "usuario": {
    "id_usuario": 1,
    "nombre": "Juan Pérez",
    "correo": "juan@example.com",
    "tipo_usuario": "cliente"
  }
}
```

---

### 2. Servicios `/api/v1/servicios`

#### Listar Todos los Servicios
```
GET /api/v1/servicios

Response 200:
{
  "ok": true,
  "servicios": [
    {
      "id_servicio": 1,
      "nombre_servicio": "Limpieza de hogar",
      "categoria": "limpieza",
      "precio_referencia": 25.00,
      "disponibilidad": true,
      "especialidad": "limpieza general",
      "profesional": "Carlos López"
    }
  ]
}
```

#### Obtener Profesional por ID
```
GET /api/v1/servicios/profesional/1

Response 200:
{
  "id": 1,
  "especialidad": "Limpieza General",
  "descripcion": "Experto en limpieza...",
  "experiencia": 5,
  "estadoVerificacion": "verificado",
  "calificacionPromedio": 4.8,
  "totalCalificaciones": 42,
  "usuario": {
    "nombre": "Carlos López",
    "correo": "carlos@example.com"
  },
  "servicios": [
    {
      "id": 1,
      "nombre": "Limpieza de hogar",
      "precio": 25.00
    }
  ]
}
```

---

### 3. Profesionales `/api/v1/profesionales`

#### Listar Todos
```
GET /api/v1/profesionales

Response 200:
{
  "ok": true,
  "profesionales": [
    {
      "id": 1,
      "nombre": "Carlos López",
      "especialidad": "Limpieza General",
      "servicios": [
        {
          "nombre": "Limpieza de hogar",
          "categoria": "limpieza",
          "precio": 25.00
        }
      ]
    }
  ]
}
```

#### Por Categoría
```
GET /api/v1/profesionales/categoria/limpieza

Response 200:
{
  "ok": true,
  "profesionales": [...]
}
```

---

### 4. Chat `/api/v1/chat` (Requiere Token)

#### Obtener Mensajes
```
GET /api/v1/chat/mensajes/1
Authorization: Bearer <token>

Response 200:
{
  "ok": true,
  "mensajes": [
    {
      "id": 1,
      "contenido": "¿Cuándo puedes comenzar?",
      "fechaEnvio": "2026-04-16T10:30:00",
      "remitente": {
        "id": 1,
        "nombre": "Juan Pérez"
      }
    }
  ]
}
```

#### Enviar Mensaje
```
POST /api/v1/chat/mensaje
Authorization: Bearer <token>
Content-Type: application/json

{
  "idSolicitud": 1,
  "idRemitente": 1,
  "contenido": "¿Cuándo puedes comenzar?"
}

Response 200:
{
  "ok": true,
  "message": "Mensaje enviado"
}
```

#### Obtener Chats del Usuario
```
GET /api/v1/chat/chats/1
Authorization: Bearer <token>

Response 200:
{
  "ok": true,
  "chats": [
    {
      "id": 1,
      "solicitud": {
        "profesional": {
          "usuario": {
            "nombre": "Carlos López"
          }
        }
      },
      "mensajes": [...]
    }
  ]
}
```

---

### 5. Historial `/api/v1/historial` (Requiere Token)

#### Obtener Historial del Cliente
```
GET /api/v1/historial/1
Authorization: Bearer <token>

Response 200:
{
  "ok": true,
  "historial": [
    {
      "id": 1,
      "estado": "completada",
      "fecha": "2026-04-10",
      "servicio": {
        "nombre": "Limpieza de hogar",
        "categoria": "limpieza",
        "precio": 25.00
      },
      "profesional": {
        "nombre": "Carlos López"
      }
    }
  ]
}
```

---

## 🛡️ Seguridad

### Rate Limiting
- General: 100 requests/15 min
- Login/Register: 5 requests/15 min

### Contraseñas
- Mínimo 6 caracteres
- Hasheadas con bcrypt (no se guardan en texto plano)

### JWT
- Válido por 7 días
- Incluye: id, correo, tipo_usuario

---

## 📱 Implementación en iOS (Swift)

### Ejemplo: Login

```swift
let url = URL(string: "https://tu-dominio.com/api/v1/auth/login")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

let loginData: [String: Any] = [
    "correo": "juan@example.com",
    "contraseña": "password123"
]

request.httpBody = try? JSONSerialization.data(withJSONObject: loginData)

URLSession.shared.dataTask(with: request) { data, response, error in
    guard let data = data else { return }
    if let response = try? JSONDecoder().decode(LoginResponse.self, from: data) {
        UserDefaults.standard.set(response.token, forKey: "jwt_token")
    }
}.resume()

struct LoginResponse: Codable {
    let success: Bool
    let token: String
    let usuario: User
}

struct User: Codable {
    let id: Int
    let nombre: String
    let correo: String
    let tipo_usuario: String
}
```

### Ejemplo: Request Autenticado

```swift
func getProfile(userId: Int, token: String) {
    let url = URL(string: "https://tu-dominio.com/api/v1/auth/perfil/\(userId)")!
    var request = URLRequest(url: url)
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    
    URLSession.shared.dataTask(with: request) { data, response, error in
        guard let data = data else { return }
        if let response = try? JSONDecoder().decode(ProfileResponse.self, from: data) {
            print(response.usuario)
        }
    }.resume()
}
```

---

## 🐛 Códigos de Error

| Código | Descripción |
|--------|-------------|
| 200 | OK |
| 201 | Creado |
| 400 | Datos inválidos |
| 401 | No autorizado / Token inválido |
| 404 | No encontrado |
| 429 | Demasiadas solicitudes |
| 500 | Error del servidor |

---

## 📋 Checklist para iOS

- [ ] Guardar JWT en Keychain (no UserDefaults)
- [ ] Refrescar token antes de expiración
- [ ] Manejar errores 401 (re-login)
- [ ] Mostrar mensajes de error amigables
- [ ] Validar email antes de enviar
- [ ] Usar HTTPS en producción
- [ ] Implementar loading states

---

## 🚀 Deploy en Fly.io

```bash
fly deploy
```

La app se desplegará automáticamente en tu dominio asignado.
