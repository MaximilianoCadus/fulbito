# ⚽ Fulbito - Sistema de Reserva de Canchas de Fútbol

![Estado del Proyecto](https://img.shields.io/badge/estado-en%20desarrollo-yellow)
![React](https://img.shields.io/badge/React-19.1-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/MongoDB-NoSQL-brightgreen)
![Licencia](https://img.shields.io/badge/licencia-ISC-blue)

Sistema web completo para gestionar reservas de canchas de fútbol que conecta jugadores con empresas que administran predios deportivos.

## 📋 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Características](#-características)
- [Arquitectura del Proyecto](#%EF%B8%8F-arquitectura-del-proyecto)
- [Tecnologías Utilizadas](#%EF%B8%8F-tecnolog%C3%ADas-utilizadas)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#%EF%B8%8F-configuraci%C3%B3n)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)
- [Quick Start](#-quick-start)

## 🎯 Descripción General

**Fulbito** es una aplicación web full-stack moderna que permite:

- **A los Jugadores**: Buscar, visualizar y reservar canchas de fútbol según su disponibilidad
- **A las Empresas**: Administrar predios deportivos, gestionar canchas y controlar reservas
- **Al Sistema**: Coordinar la disponibilidad, procesamiento de reservas y comunicación entre partes

### Roles del Sistema

1. **👤 Jugadores**: Usuarios que buscan y reservan canchas para jugar
2. **🏢 Empresas**: Administradores de predios y canchas deportivas
3. **⚙️ Sistema**: Coordinador de reservas y disponibilidad en tiempo real

## ✨ Características

### Para Jugadores

- ✅ Registro e inicio de sesión de cuenta personal
- 🔍 Búsqueda de canchas por ubicación, tipo y disponibilidad
- 📅 Visualización de horarios disponibles
- 💳 Reserva de canchas con confirmación inmediata
- 📱 Gestión de reservas activas y historial
- 👤 Perfil personalizado con información de contacto

### Para Empresas

- 🏢 Registro y gestión de perfil empresarial
- 🏟️ Administración de múltiples predios deportivos
- ⚽ Gestión completa de canchas (crear, editar, eliminar)
- 📊 Panel de control de reservas
- 🔧 Configuración de horarios y disponibilidad
- 📈 Vista general del estado de las instalaciones

### Características Técnicas

- 🎨 Interfaz moderna y responsiva (mobile-first)
- ⚡ Rendimiento optimizado con Vite
- 🔒 Autenticación segura con bcrypt
- 🌐 API RESTful bien documentada
- 📡 Comunicación en tiempo real cliente-servidor
- 🎯 Validación de datos en frontend y backend

## 🏗️ Arquitectura del Proyecto

```text
┌─────────────────────┐         ┌──────────────────────┐         ┌─────────────────────┐
│                     │         │                      │         │                     │
│     FRONTEND        │ ◄─────► │      BACKEND         │ ◄─────► │   BASE DE DATOS     │
│   (Cliente Web)     │   HTTP  │   (API REST)         │  Query  │     (MongoDB)       │
│                     │   API   │                      │         │                     │
│   React 19 + Vite   │         │   Node.js + Express  │         │   MongoDB Atlas     │
│                     │         │                      │         │                     │
└─────────────────────┘         └──────────────────────┘         └─────────────────────┘
```

### Flujo de Comunicación

1. 🖥️ **Usuario** interactúa con la interfaz web (Frontend React)
2. 📤 **Frontend** envía solicitud HTTP a la API (Backend Express)
3. ⚙️ **Backend** procesa la solicitud y consulta la Base de Datos (MongoDB)
4. 📥 **Respuesta** regresa al Frontend con los datos solicitados
5. 🎨 **Frontend** actualiza la interfaz para mostrar los resultados al usuario

## 🛠️ Tecnologías Utilizadas

### Frontend (`/client`)

| Tecnología       | Versión | Propósito                               |
| ---------------- | ------- | --------------------------------------- |
| **React**        | 19.1.1  | Librería principal para construir la UI |
| **Vite**         | 7.1.6   | Herramienta de desarrollo y compilación |
| **React Router** | -       | Navegación entre páginas (SPA)          |
| **ESLint**       | 9.35.0  | Análisis y formateo de código           |
| **CSS Modules**  | -       | Estilos modulares por componente        |

#### Características del Frontend

- ⚛️ Componentes funcionales con Hooks
- 🎨 Sistema de diseño modular con colores de marca (#1b9c3f)
- 📱 Diseño totalmente responsive (mobile-first)
- ♿ Accesibilidad con HTML semántico
- 🔄 Estado local y custom hooks para validación

### Backend (`/server`)

| Tecnología            | Versión | Propósito                       |
| --------------------- | ------- | ------------------------------- |
| **Node.js**           | LTS     | Entorno de ejecución JavaScript |
| **Express.js**        | 4.18.3  | Framework web minimalista       |
| **MongoDB**           | 8.15.0  | Base de datos NoSQL             |
| **Mongoose**          | 8.15.0  | ODM para MongoDB                |
| **bcrypt**            | 6.0.0   | Hashing de contraseñas          |
| **express-validator** | 7.2.1   | Validación de datos             |
| **cors**              | 2.8.5   | Manejo de CORS                  |
| **dotenv**            | 16.5.0  | Variables de entorno            |
| **axios**             | 1.11.0  | Cliente HTTP                    |

#### Características del Backend

- 🛣️ API RESTful con rutas organizadas
- 🔐 Autenticación y seguridad
- ✅ Validación de datos en todas las operaciones
- 📝 Logging de peticiones
- 🚨 Manejo centralizado de errores
- 📊 Modelos con esquemas Mongoose

## 📦 Requisitos Previos

Antes de instalar el proyecto, asegúrate de tener instalado:

- **Node.js** (versión 16.x o superior) - [Descargar](https://nodejs.org/)
- **npm** (viene incluido con Node.js) o **yarn**
- **MongoDB** - Cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (gratuita) o instalación local
- **Git** - [Descargar](https://git-scm.com/)
- Un editor de código (recomendado: **VS Code**)

### Verificar instalaciones

```bash
node --version    # Debe mostrar v16.x.x o superior
npm --version     # Debe mostrar 8.x.x o superior
git --version     # Debe mostrar 2.x.x o superior
```

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/MaximilianoCadus/fulbito.git
cd fulbito
```

### 2. Instalar Dependencias del Backend

```bash
cd server
npm install
```

### 3. Instalar Dependencias del Frontend

```bash
cd ../client
npm install
```

## ⚙️ Configuración

### Configuración del Backend

1. **Crear archivo de variables de entorno** en la carpeta `server`:

```bash
cd server
```

1. **Crear archivo `.env`** con el siguiente contenido:

```env
# Puerto del servidor
PORT=5000

# URI de conexión a MongoDB
# Opción 1: MongoDB Atlas (recomendado para producción)
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/<nombre-db>?retryWrites=true&w=majority

# Opción 2: MongoDB Local (desarrollo)
# MONGODB_URI=mongodb://localhost:27017/fulbito

# Otras variables (opcional)
NODE_ENV=development
```

1. **Reemplazar los valores**:
   - `<usuario>`: Tu usuario de MongoDB Atlas
   - `<password>`: Tu contraseña de MongoDB Atlas
   - `<cluster>`: El nombre de tu cluster
   - `<nombre-db>`: Nombre de tu base de datos (ej: `fulbito`)

#### Obtener URI de MongoDB Atlas

1. Crear cuenta gratuita en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crear un nuevo cluster (free tier M0)
3. Ir a "Database Access" y crear un usuario de base de datos
4. Ir a "Network Access" y agregar tu IP (o 0.0.0.0/0 para permitir todas)
5. Hacer clic en "Connect" → "Connect your application"
6. Copiar la URI de conexión y reemplazar los valores

### Configuración del Frontend

El frontend se conecta al backend en `http://localhost:5000`. Si necesitas cambiar esta URL:

1. Crear archivo de configuración (si es necesario)
2. Actualizar las llamadas a la API en los servicios

## 🎮 Uso

### Iniciar el Proyecto

Necesitas **dos terminales** abiertas para ejecutar frontend y backend simultáneamente.

#### Terminal 1: Iniciar Backend

```bash
cd server
npm run dev
```

Deberías ver:

```text
✔️ Conectado a MongoDB
🚀 Servidor escuchando en puerto 5000
📡 API disponible en http://localhost:5000/api
```

#### Terminal 2: Iniciar Frontend

```bash
cd client
npm run dev
```

Deberías ver:

```text
  VITE v7.1.6  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Acceder a la Aplicación

1. Abrir navegador en **<http://localhost:5173>**
2. La página de bienvenida debería cargarse
3. Puedes registrarte como Jugador o Empresa
4. Explorar las funcionalidades según el tipo de usuario

### Scripts Disponibles

#### Scripts del Backend

```bash
npm start        # Inicia el servidor en producción
npm run dev      # Inicia con nodemon (recarga automática)
npm test         # Ejecuta pruebas (pendiente configurar)
```

#### Scripts del Frontend

```bash
npm run dev      # Inicia servidor de desarrollo con Vite
npm run build    # Compila para producción
npm run preview  # Previsualiza la compilación de producción
npm run lint     # Ejecuta ESLint para revisar código
```

## 📁 Estructura del Proyecto

```text
fulbito/
│
├── client/                      # Frontend de la aplicación
│   ├── public/                  # Archivos estáticos públicos
│   ├── src/
│   │   ├── assets/              # Imágenes, iconos, etc.
│   │   ├── components/          # Componentes reutilizables
│   │   │   ├── Button.jsx
│   │   │   ├── CourtCard.jsx
│   │   │   ├── FormField.jsx
│   │   │   ├── ReservationCard.jsx
│   │   │   └── ... (más componentes)
│   │   ├── hooks/               # Custom hooks de React
│   │   │   └── useFormValidation.js
│   │   ├── pages/               # Componentes de páginas
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── PlayerHomePage.jsx
│   │   │   ├── CompanyHomePage.jsx
│   │   │   └── ... (más páginas)
│   │   ├── services/            # Servicios de API
│   │   ├── utils/               # Utilidades y helpers
│   │   ├── App.jsx              # Componente raíz
│   │   ├── main.jsx             # Punto de entrada
│   │   └── index.css            # Estilos globales
│   ├── index.html
│   ├── vite.config.js           # Configuración de Vite
│   ├── package.json
│   └── README.md
│
├── server/                      # Backend de la aplicación
│   ├── controllers/             # Lógica de negocio
│   │   ├── userController.js
│   │   ├── jugadorController.js
│   │   ├── empresaController.js
│   │   ├── predioController.js
│   │   ├── canchaController.js
│   │   ├── reservaController.js
│   │   └── localidadController.js
│   ├── models/                  # Modelos de Mongoose
│   │   ├── User.js
│   │   ├── Jugador.js
│   │   ├── Empresa.js
│   │   ├── Predio.js
│   │   ├── Cancha.js
│   │   ├── Reserva.js
│   │   ├── Localidad.js
│   │   └── submodels/           # Sub-esquemas
│   ├── routes/                  # Definición de rutas
│   │   ├── index.js             # Router principal
│   │   ├── userRoutes.js
│   │   ├── jugadorRoutes.js
│   │   ├── empresaRoutes.js
│   │   ├── predioRoutes.js
│   │   ├── canchaRoutes.js
│   │   ├── reservaRoutes.js
│   │   └── localidadRoutes.js
│   ├── middleware/              # Middleware personalizado
│   │   ├── errorHandler.js
│   │   ├── logger.js
│   │   └── validation.js
│   ├── server.js                # Punto de entrada del servidor
│   ├── package.json
│   └── API_ENDPOINTS_GUIDE.md   # Documentación completa de la API
│
├── docs/                        # Documentación adicional
│   ├── mobile-number-implementation.md
│   ├── mobile-field-styling-fixes.md
│   └── anexos/
│
├── PRESENTACION.md              # Presentación del proyecto
└── README.md                    # Este archivo
```

### Organización de Componentes

#### Componentes Principales (`/client/src/components`)

- **Button**: Botón reutilizable con variantes (primary, secondary, ghost)
- **CourtCard**: Tarjeta para mostrar información de canchas
- **ReservationCard**: Tarjeta para mostrar reservas
- **FormField**: Campo de formulario con validación
- **MobileNumberField**: Campo especializado para números de teléfono
- **LocalitySelect**: Selector de localidades
- **FloorTypeSelect**: Selector de tipo de piso
- **PlayerCountSelect**: Selector de cantidad de jugadores
- **UserDropdown**: Menú desplegable de usuario
- **ConfirmationModal**: Modal de confirmación
- **NetworkStatus**: Indicador de estado de conexión
- **Logo**: Componente del logo de la aplicación

#### Páginas Principales (`/client/src/pages`)

**Para Jugadores:**

- `LoginPage`: Inicio de sesión
- `RegisterPage`: Registro de nuevos usuarios
- `PlayerHomePage`: Página principal con búsqueda de canchas
- `PlayerProfilePage`: Perfil del jugador
- `PlayerReservationsPage`: Gestión de reservas
- `CourtDetailsPage`: Detalles de una cancha específica

**Para Empresas:**

- `CompanyHomePage`: Dashboard de la empresa
- `CompanyProfilePage`: Perfil empresarial
- `VenueHomePage`: Gestión de predios
- `VenueManagementPage`: Administración de un predio
- `VenueCourtManagementPage`: Gestión de canchas del predio

## 🔌 API Endpoints

El backend expone una API RESTful en `http://localhost:5000/api`

### Resumen de Recursos

| Recurso         | Endpoint Base    | Descripción                   |
| --------------- | ---------------- | ----------------------------- |
| **Usuarios**    | `/api/users`     | Gestión de cuentas de usuario |
| **Jugadores**   | `/api/jugador`   | Perfiles de jugadores         |
| **Empresas**    | `/api/empresa`   | Perfiles empresariales        |
| **Predios**     | `/api/predio`    | Complejos deportivos          |
| **Canchas**     | `/api/cancha`    | Canchas de fútbol             |
| **Reservas**    | `/api/reserva`   | Sistema de reservas           |
| **Localidades** | `/api/localidad` | Ubicaciones geográficas       |

### Endpoints Principales

#### Usuarios

```http
POST   /api/users/complete/jugador     # Registro completo de jugador
POST   /api/users/complete/empresa     # Registro completo de empresa
POST   /api/users/login                # Inicio de sesión
GET    /api/users/:id                  # Obtener usuario por ID
PUT    /api/users/:id                  # Actualizar usuario
DELETE /api/users/:id                  # Eliminar usuario
```

#### Predios

```http
GET    /api/predio                     # Listar todos los predios
POST   /api/predio                     # Crear nuevo predio
GET    /api/predio/:id                 # Obtener predio por ID
PUT    /api/predio/:id                 # Actualizar predio
DELETE /api/predio/:id                 # Eliminar predio
GET    /api/predio/empresa/:empresaId  # Predios de una empresa
```

#### Canchas

```http
GET    /api/cancha                     # Listar todas las canchas
POST   /api/cancha                     # Crear nueva cancha
GET    /api/cancha/:id                 # Obtener cancha por ID
PUT    /api/cancha/:id                 # Actualizar cancha
DELETE /api/cancha/:id                 # Eliminar cancha
GET    /api/cancha/predio/:predioId    # Canchas de un predio
```

#### Reservas

```http
GET    /api/reserva                    # Listar todas las reservas
POST   /api/reserva                    # Crear nueva reserva
GET    /api/reserva/:id                # Obtener reserva por ID
PUT    /api/reserva/:id                # Actualizar reserva
DELETE /api/reserva/:id                # Cancelar reserva
GET    /api/reserva/jugador/:jugadorId # Reservas de un jugador
GET    /api/reserva/cancha/:canchaId   # Reservas de una cancha
```

### Documentación Completa de la API

Para una documentación detallada de todos los endpoints con ejemplos de uso, consulta:

📖 **[Guía Completa de API](./server/API_ENDPOINTS_GUIDE.md)**

Esta guía incluye:

- Ejemplos completos de peticiones y respuestas
- Datos requeridos para cada operación
- Códigos de error y su significado
- Flujos recomendados de operaciones
- Ejemplos de implementación en React
- Casos de uso comunes

---

## 🚀 Quick Start

Para empezar rápidamente:

```bash
# 1. Clonar repositorio
git clone https://github.com/MaximilianoCadus/fulbito.git
cd fulbito

# 2. Instalar dependencias del backend
cd server
npm install

# 3. Configurar variables de entorno
# Crear archivo .env con MONGODB_URI y PORT

# 4. Iniciar backend
npm run dev

# 5. En otra terminal, instalar dependencias del frontend
cd ../client
npm install

# 6. Iniciar frontend
npm run dev

# 7. Abrir http://localhost:5173 en el navegador
```

---

**⚽ ¡Disfruta usando Fulbito!**
