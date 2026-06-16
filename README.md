# BeachG

**Sistema de gestión y reservas para balnearios**  
Proyecto académico · Programación 3 · Universidad Tecnológica Nacional (UTN)

---

## ¿Qué es BeachG?

BeachG es una plataforma completa para la administración de balnearios y la reserva de carpas y sombrillas. Los clientes pueden explorar balnearios, elegir su unidad en un mapa interactivo, pagar online con MercadoPago y acceder al balneario con un código QR. Los administradores cuentan con un panel completo para gestionar reservas, unidades, precios y validar el ingreso de huéspedes.

---

## Demo

| Recurso | URL |
|---|---|
| Frontend (producción) | [beach-g.vercel.app](https://beach-g.vercel.app) |
| API Swagger | [germicide-moistness-overhead.ngrok-free.dev/swagger-ui/index.html](https://germicide-moistness-overhead.ngrok-free.dev/swagger-ui/index.html) |

### Credenciales de prueba

| Rol | Email | Contraseña |
|---|---|---|
| Admin (Mar del Plata) | `admin.mdp@beachg.com` | `admin123` |
| Admin (Pinamar) | `admin.pinamar@beachg.com` | `admin123` |
| Admin (Gesell) | `admin.gesell@beachg.com` | `admin123` |
| Admin (Miramar) | `admin.miramar@beachg.com` | `admin123` |
| Admin (Necochea) | `admin.necochea@beachg.com` | `admin123` |
| Usuario | `santi.rodriguez@gmail.com` | `admin123` |

---

## Características

### Para clientes
- Exploración de balnearios con filtros por ciudad y nombre
- **Mapa interactivo** de carpas y sombrillas con selección visual (estilo selector de asientos)
- Reserva online con pago integrado vía **MercadoPago Sandbox**
- Ingreso al balneario con **código QR** generado automáticamente por huésped
- Panel personal con reservas activas, próximas e historial completo
- Visualización del estado de cada reserva (pendiente, confirmada, cancelada)

### Para administradores
- **Dashboard** con métricas en tiempo real: reservas del día, unidades libres, ingresos del mes
- **Widget de clima** en tiempo real (Open-Meteo + Nominatim, sin API key)
- Gestión de unidades: crear, bloquear, actualizar precios individualmente
- **Reservas presenciales (walk-in)** con confirmación y QR instantáneo
- Validación de ingreso por **código QR** o **DNI**
- Historial completo de todas las reservas del balneario

---

## Stack tecnológico

### Backend
| Tecnología | Versión | Rol |
|---|---|---|
| Java | 21 | Lenguaje |
| Spring Boot | 4.0.6 | Framework principal |
| Spring Security + JWT | JJWT 0.12.7 | Autenticación stateless |
| Spring Data JPA / Hibernate | — | ORM y persistencia |
| MySQL | 8.0 | Base de datos relacional |
| MercadoPago SDK | 2.1.23 | Procesamiento de pagos |
| springdoc-openapi | 2.8.6 | Documentación Swagger / OpenAPI 3 |
| Lombok | — | Reducción de boilerplate |
| Docker + Docker Compose | — | Contenerización |

### Frontend
| Tecnología | Versión | Rol |
|---|---|---|
| React | 18 | UI |
| TypeScript | — | Tipado estático |
| Vite | 5 | Bundler y dev server |
| Tailwind CSS | 3 | Estilos utilitarios |
| TanStack Query | — | Caché y sincronización de datos del servidor |
| React Router | v6 | Navegación SPA |
| Axios | — | Cliente HTTP con interceptors JWT |
| Lucide React | — | Iconografía |
| Nominatim + Open-Meteo | — | Geocodificación y clima (sin API key) |

### Infraestructura (producción)
| Servicio | Tecnología |
|---|---|
| Frontend | Vercel |
| Backend | AWS EC2 (t3.micro) + Docker Compose |
| Túnel HTTPS | ngrok (para callbacks de MercadoPago) |
| Base de datos | MySQL 8.0 en Docker |

---

## Arquitectura

### Desarrollo local
```
┌─────────────────────────────┐
│   React + Vite (Puerto 3000) │
│   Frontend                   │
└──────────────┬──────────────┘
               │ REST + JWT
               ▼
┌─────────────────────────────┐
│  Spring Boot (Puerto 8080)   │
│  Backend                     │
└──────────┬──────────────────┘
           │
    ┌──────┴──────┐
    ▼             ▼
 MySQL 8.0    MercadoPago API
 (Puerto 3307)
```

### Producción
```
┌──────────────────────┐
│   beach-g.vercel.app │  ← Usuario accede desde browser
│   React (Vercel)     │
└──────────┬───────────┘
           │ HTTPS + JWT
           ▼
┌────────────────────────────────────────────────┐
│  germicide-moistness-overhead.ngrok-free.dev   │  ← ngrok (HTTPS)
│               AWS EC2 t3.micro                 │
│                                                │
│  ┌──────────────────┐   ┌──────────────────┐  │
│  │  Spring Boot     │   │   MySQL 8.0      │  │
│  │  Puerto 8080     │   │   Puerto 3307    │  │
│  └──────────────────┘   └──────────────────┘  │
└────────────────────────────────────────────────┘
           │
           ▼
    MercadoPago API
    (callbacks → ngrok → backend → redirect → Vercel)
```

---

## Flujo de reserva

```
Cliente selecciona balneario
        ↓
Elige unidad en el mapa interactivo
        ↓
Completa datos (fechas + huéspedes)
        ↓
POST /api/bookings → recibe paymentUrl de MercadoPago
        ↓
Redirige a MercadoPago Sandbox
        ↓
MercadoPago llama a GET /api/bookings/success (ngrok → EC2)
        ↓
Backend confirma reserva → genera tokens QR por huésped
        ↓
Redirige a beach-g.vercel.app/payment/success?bookingId=X
        ↓
Cliente ve resumen de reserva con detalle de pago
        ↓
En el balneario: Admin escanea QR o valida por DNI
POST /api/guests/validate/{token}
        ↓
Ingreso validado ✓
```

---

## Endpoints de la API

Con el backend corriendo, la documentación interactiva está en:
```
https://germicide-moistness-overhead.ngrok-free.dev/swagger-ui/index.html
```

### Referencia rápida

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `POST` | `/api/auth/login` | — | Obtener JWT |
| `POST` | `/api/clients` | — | Registrar cliente |
| `GET` | `/api/resorts` | — | Listar balnearios |
| `GET` | `/api/resorts/{id}` | — | Detalle + unidades del balneario |
| `GET` | `/api/resorts/my` | ADMIN | Mi balneario |
| `PUT` | `/api/resorts/my` | ADMIN | Actualizar datos del balneario |
| `GET` | `/api/resorts/{id}/amenities` | — | Amenidades del balneario |
| `POST` | `/api/bookings` | USER | Crear reserva (flujo MercadoPago) |
| `POST` | `/api/bookings/walkin` | ADMIN | Reserva presencial instantánea |
| `GET` | `/api/bookings` | ADMIN | Todas las reservas |
| `GET` | `/api/bookings/{id}` | AUTH | Detalle de reserva |
| `GET` | `/api/bookings/client/{id}` | AUTH | Reservas de un cliente |
| `PATCH` | `/api/bookings/{id}/cancel` | ADMIN | Cancelar reserva |
| `GET` | `/api/bookings/success` | — | Callback pago exitoso (MercadoPago) |
| `POST` | `/api/rental-units` | ADMIN | Crear unidad |
| `PATCH` | `/api/rental-units/{id}/price` | ADMIN | Actualizar precio |
| `PATCH` | `/api/rental-units/{id}/block` | ADMIN | Bloquear / desbloquear |
| `POST` | `/api/guests/validate/{token}` | — | Validar QR |
| `POST` | `/api/guests/validate/dni/{dni}` | — | Validar por DNI |
| `GET` | `/api/clients/{id}` | AUTH | Perfil del cliente |
| `PUT` | `/api/clients/{id}` | AUTH | Actualizar perfil |

### Autenticación

```http
Authorization: Bearer <JWT>
```

El JWT se obtiene con `POST /api/auth/login` y lleva el rol (`USER` o `ADMIN`) embebido en el payload.

---

## Instalación y desarrollo local

### Prerrequisitos

- [Docker](https://www.docker.com/) y Docker Compose
- [Node.js 18+](https://nodejs.org/)
- [Java 21](https://adoptium.net/) + Maven (opcional, solo sin Docker)

### 1. Clonar el repositorio

```bash
git clone https://github.com/francejas/BeachG.git
cd BeachG
git checkout develop
```

### 2. Configurar variables de entorno

Creá un `.env` en la raíz del proyecto:

```env
# MercadoPago (modo sandbox)
MP_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxxxxxx

# URL pública del backend — usá ngrok para desarrollo local
NGROK_BASE_URL=https://xxxx.ngrok-free.app

# URL del frontend
FRONTEND_URL=http://localhost:3000

# JWT — usá una clave larga y aleatoria en producción
JWT_SECRET=tu_clave_secreta_muy_larga_aqui
```

### 3. Levantar el backend con Docker

```bash
docker-compose up --build
```

Levanta:
- **MySQL 8.0** en `localhost:3307` (con datos de prueba cargados automáticamente)
- **Backend Spring Boot** en `http://localhost:8080`

Para recargar datos de seed sin reconstruir la imagen:

```bash
docker-compose up --build -d backend
```

### 4. Levantar el frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend disponible en `http://localhost:3000`.

### 5. (Opcional) Habilitar pagos con MercadoPago en local

MercadoPago necesita una URL pública HTTPS para los callbacks. Usá [ngrok](https://ngrok.com):

```bash
ngrok http 8080
# Copiá la URL HTTPS generada → pegála en NGROK_BASE_URL del .env
# Reiniciá el backend: docker-compose restart backend
```

---

## Despliegue en producción

### Backend en AWS EC2

```bash
# Conectarse al servidor
ssh -i clave-beachg.pem ubuntu@<IP_EC2>

# Clonar e instalar
git clone https://github.com/francejas/BeachG.git
cd BeachG

# Crear .env con variables de producción
# Levantar contenedores
sudo docker compose up --build -d

# ngrok (mantener corriendo con nohup)
nohup ngrok http --domain=<tu-dominio-estatico>.ngrok-free.dev 8080 &
```

### Frontend en Vercel

```bash
cd frontend
npx vercel --prod
```

Configurar en Vercel:
- **Root Directory**: `frontend`
- **Framework**: Vite (autodetectado)
- **Env var**: `VITE_API_URL` = URL ngrok del backend

---

## Estructura del proyecto

```
BeachG/
├── src/main/java/com/beachg/backend/
│   ├── config/               # OpenAPI / Swagger config
│   ├── controllers/          # AuthController, BookingController,
│   │                         # ClientController, ResortController,
│   │                         # RentalUnitController, GuestController,
│   │                         # AmenityController
│   ├── dtos/                 # Request / Response DTOs
│   ├── exceptions/           # GlobalExceptionHandler + excepciones tipadas
│   ├── models/               # Entidades JPA (Client, Resort, RentalUnit,
│   │                         # Booking, Guest, Amenity)
│   ├── repositories/         # Spring Data JPA repositories
│   ├── security/             # JwtUtil, JwtFilter, SecurityConfig
│   └── services/             # AuthService, BookingService,
│                             # ResortService, MercadoPagoService, ...
│
├── src/main/resources/
│   ├── application.properties
│   └── data.sql              # Seed data: 5 balnearios, 25 clientes,
│                             # 100 unidades, 47 reservas
│
├── frontend/src/
│   ├── components/           # Navbar, Layout, AdminLayout, UI primitivos
│   ├── lib/                  # api.ts, auth.ts, queries.ts, types.ts, utils.ts
│   └── pages/
│       ├── LandingPage.tsx
│       ├── LoginPage.tsx / RegisterPage.tsx
│       ├── DashboardPage.tsx / ProfilePage.tsx
│       ├── ResortDetailPage.tsx    # Mapa interactivo responsive
│       ├── BookingPage.tsx
│       ├── BookingDetailPage.tsx / MyBookingsPage.tsx
│       ├── PaymentSuccessPage.tsx / PaymentFailurePage.tsx
│       └── admin/
│           ├── AdminDashboardPage.tsx
│           ├── AdminResortPage.tsx
│           ├── AdminUnitsPage.tsx
│           ├── AdminBookingsPage.tsx
│           ├── AdminBookingDetailPage.tsx
│           ├── AdminWalkInPage.tsx
│           └── AdminValidatePage.tsx
│
├── docker-compose.yml
├── Dockerfile                # Multi-stage build (Maven → JRE Alpine)
└── .env                      # Variables de entorno (no commitear)
```

---

## Roles y permisos

| Rol | Acceso |
|---|---|
| Sin autenticar | Landing, explorar balnearios, registro |
| `USER` | Dashboard, crear reservas, ver mis reservas, perfil |
| `ADMIN` | Panel completo: gestión del balneario, unidades, todas las reservas, walk-in, validar QR/DNI |

Un admin solo puede gestionar **su propio balneario** (el asignado en la base de datos).

---

## Variables de entorno — referencia

| Variable | Descripción |
|---|---|
| `MP_ACCESS_TOKEN` | Token de MercadoPago (prefijo `TEST-` para sandbox) |
| `NGROK_BASE_URL` | URL HTTPS pública del backend (callbacks de MercadoPago) |
| `FRONTEND_URL` | URL del frontend (redirección post-pago) |
| `JWT_SECRET` | Clave para firmar JWT (mín. 32 caracteres) |

---

## Equipo

| Integrante | GitHub |
|---|---|
| Francisco Cejas | [@francejas](https://github.com/francejas) |
| Axel Ovejero Gallardo | [@AxelOvejeroGallardo](https://github.com/AxelOvejeroGallardo) |
| Juan Pablo Bercovsky | [@Berkovv](https://github.com/Berkovv) |
| Facundo Gauthier | [@FacuGauthier](https://github.com/FacuGauthier) |

---

Proyecto académico · Programación 3 · UTN
