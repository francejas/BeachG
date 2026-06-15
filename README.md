# BeachG 🏖️

**Sistema de gestión y reservas para balnearios**  
Proyecto académico · Universidad Tecnológica Nacional (UTN)

---

## ¿Qué es BeachG?

BeachG es una plataforma completa para la administración de balnearios y la reserva de carpas y sombrillas. Permite a los clientes explorar balnearios, elegir su unidad en un mapa interactivo, pagar online con MercadoPago y acceder con un código QR. Los administradores cuentan con un panel completo para gestionar su balneario, reservas, unidades y huéspedes.

---

## Características principales

### Para clientes
- Búsqueda y exploración de balnearios con filtros por ciudad y nombre
- **Mapa interactivo** de carpas y sombrillas (estilo selector de asientos)
- Reserva online con pago integrado vía **MercadoPago**
- Ingreso al balneario mediante **código QR** o DNI
- Panel personal con reservas activas, próximas e historial

### Para administradores
- Dashboard con métricas en tiempo real: reservas activas, unidades libres, ingresos del mes
- **Widget de clima** en tiempo real para la ubicación del balneario
- Gestión completa de unidades (crear, bloquear, actualizar precios)
- Reservas presenciales (walk-in) con confirmación instantánea
- Validación de QR en puerta

---

## Stack tecnológico

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| Java | 21 | Lenguaje |
| Spring Boot | 4.0.6 | Framework principal |
| Spring Security + JWT | JJWT 0.12.7 | Autenticación stateless |
| Spring Data JPA / Hibernate | — | ORM y persistencia |
| MySQL | 8.0 | Base de datos |
| MercadoPago SDK | 2.1.23 | Pagos online |
| springdoc-openapi | 2.8.6 | Swagger / OpenAPI 3 |
| Lombok | — | Reducción de boilerplate |
| Docker + Docker Compose | — | Contenedores |

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| React | 18 | UI |
| TypeScript | — | Tipado estático |
| Vite | — | Bundler |
| Tailwind CSS | 3 | Estilos |
| TanStack Query | — | Server state |
| React Router | v6 | Navegación |
| Lucide React | — | Iconografía |
| Nominatim + Open-Meteo | — | Geocodificación y clima (gratis, sin API key) |

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                        Cliente                              │
│                  React + Vite (Puerto 5173)                  │
│                                                             │
│  Landing · Dashboard · Mapa interactivo · Admin Panel       │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP / REST (JWT Bearer)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│               Spring Boot API (Puerto 8080)                 │
│                                                             │
│  /api/auth        → Autenticación JWT                       │
│  /api/resorts     → Balnearios                              │
│  /api/bookings    → Reservas + callbacks MP                 │
│  /api/rental-units → Carpas y sombrillas                    │
│  /api/clients     → Clientes                                │
│  /api/amenities   → Amenidades                              │
│  /api/guests      → Validación QR / DNI                     │
│  /swagger-ui      → Documentación interactiva               │
└──────────────┬──────────────────┬───────────────────────────┘
               │                  │
               ▼                  ▼
     ┌─────────────────┐  ┌─────────────────────┐
     │   MySQL 8.0     │  │   MercadoPago API   │
     │  (Puerto 3307)  │  │  (pagos + webhooks) │
     └─────────────────┘  └─────────────────────┘
```

---

## Primeros pasos

### Prerrequisitos

- [Docker](https://www.docker.com/) y Docker Compose
- [Node.js 18+](https://nodejs.org/) (solo para desarrollo frontend)
- [Java 21](https://adoptium.net/) + Maven (solo para desarrollo backend sin Docker)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/beachg.git
cd beachg
```

### 2. Configurar variables de entorno

Creá un archivo `.env` en la raíz del proyecto:

```env
# Base de datos
MYSQL_URL=jdbc:mysql://localhost:3307/beachg_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
MYSQL_USER=root
MYSQL_PASSWORD=root

# JWT — usá una clave larga y aleatoria en producción
JWT_SECRET=tu_clave_secreta_muy_larga_y_segura_aqui

# MercadoPago
MP_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxxxxxx

# URL pública del backend (ngrok para desarrollo local, dominio real en prod)
NGROK_BASE_URL=https://xxxx.ngrok-free.app

# URL del frontend
FRONTEND_URL=http://localhost:5173
```

### 3. Levantar con Docker Compose

```bash
docker-compose up --build
```

Esto levanta:
- **MySQL** en el puerto `3307`
- **Backend** en `http://localhost:8080`

### 4. Levantar el frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend disponible en `http://localhost:5173`.

---

## Documentación de la API

Con el backend corriendo, accedé a la UI interactiva de Swagger:

```
http://localhost:8080/swagger-ui/index.html
```

O descargá el spec en JSON:

```
http://localhost:8080/v3/api-docs
```

### Endpoints principales

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `POST` | `/api/auth/login` | — | Obtener JWT |
| `POST` | `/api/clients` | — | Registrar cliente |
| `GET` | `/api/resorts` | — | Listar balnearios |
| `GET` | `/api/resorts/{id}` | — | Detalle de balneario |
| `GET` | `/api/resorts/my` | Admin | Mi balneario |
| `PUT` | `/api/resorts/my` | Admin | Actualizar mi balneario |
| `POST` | `/api/bookings` | Usuario | Crear reserva (con pago MP) |
| `POST` | `/api/bookings/walkin` | Admin | Reserva presencial |
| `GET` | `/api/bookings/client/{id}` | Auth | Reservas de un cliente |
| `PATCH` | `/api/bookings/{id}/cancel` | Admin | Cancelar reserva |
| `POST` | `/api/rental-units` | Admin | Crear unidad |
| `PATCH` | `/api/rental-units/{id}/price` | Admin | Actualizar precio |
| `PATCH` | `/api/rental-units/{id}/block` | Admin | Bloquear/desbloquear |
| `POST` | `/api/guests/validate/{token}` | — | Validar QR |
| `POST` | `/api/guests/validate/dni/{dni}` | — | Validar por DNI |

### Autenticación

Todos los endpoints protegidos requieren:

```
Authorization: Bearer <JWT>
```

El JWT se obtiene desde `POST /api/auth/login` y expira automáticamente.

---

## Flujo de reserva

```
Cliente elige resort
       ↓
Selecciona unidad en el mapa interactivo
       ↓
Completa datos de huéspedes
       ↓
POST /api/bookings → recibe paymentUrl
       ↓
Redirige a MercadoPago
       ↓
MP llama a /api/bookings/success
       ↓
Reserva confirmada → QR generado por huésped
       ↓
Administrador escanea QR en puerta
POST /api/guests/validate/{token}
       ↓
Ingreso validado ✓
```

---

## Estructura del proyecto

```
beachg/
├── src/                          # Backend Spring Boot
│   └── main/java/com/beachg/backend/
│       ├── config/               # OpenAPI config
│       ├── controllers/          # 7 REST controllers
│       ├── dtos/                 # Request / Response DTOs
│       ├── exceptions/           # Manejo global de errores
│       ├── models/               # Entidades JPA
│       ├── repositories/         # Spring Data repos
│       ├── security/             # JWT filter + SecurityConfig
│       └── services/             # Lógica de negocio
│
├── frontend/                     # React + Vite
│   └── src/
│       ├── components/           # UI, Layout, Navbar, AdminLayout
│       ├── lib/                  # auth, api, queries, types, utils
│       └── pages/
│           ├── admin/            # Dashboard, Resort, Bookings, Units
│           ├── LandingPage.tsx
│           ├── DashboardPage.tsx
│           ├── ResortDetailPage.tsx  # Mapa interactivo
│           ├── BookingPage.tsx
│           └── BookingDetailPage.tsx
│
├── docker-compose.yml
├── Dockerfile
└── .env                          # Variables de entorno (no commitear)
```

---

## Variables de entorno — referencia completa

| Variable | Descripción | Ejemplo |
|---|---|---|
| `MYSQL_URL` | JDBC URL de la base de datos | `jdbc:mysql://...` |
| `MYSQL_USER` | Usuario de MySQL | `root` |
| `MYSQL_PASSWORD` | Contraseña de MySQL | `root` |
| `JWT_SECRET` | Clave para firmar tokens JWT (mín. 32 chars) | `s3cr3t...` |
| `MP_ACCESS_TOKEN` | Token de MercadoPago (TEST o PROD) | `TEST-xxx` |
| `NGROK_BASE_URL` | URL pública del backend (para callbacks de MP) | `https://xxx.ngrok-free.app` |
| `FRONTEND_URL` | URL del frontend (para redirecciones post-pago) | `http://localhost:5173` |

---

## Roles de usuario

| Rol | Acceso |
|---|---|
| Sin autenticar | Landing, detalle de balnearios, registro |
| `USER` | Dashboard, reservas propias, perfil |
| `ADMIN` | Panel completo: balneario, unidades, todas las reservas, walk-in, validación QR |

---

## Desarrollo local (sin Docker)

### Backend

```bash
# Requiere MySQL local corriendo en puerto 3306
# Crear .env en la raíz con las variables de entorno
./mvnw spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev       # Dev server con HMR
npm run build     # Build de producción
npm run preview   # Preview del build
```

---

## Equipo

Proyecto académico desarrollado para la materia de **Laboratorio de Aplicaciones** · UTN
