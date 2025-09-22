# Guía de API - Fulbito App

Esta guía documenta todos los endpoints de la API Fulbito, con ejemplos prácticos para Postman y consideraciones para implementación en React. La guía está organizada por recursos y operaciones CRUD.

## Base URL

```text
http://localhost:3000/api
```

## Índice de Contenidos

### 📱 Recursos Principales

1. [Usuarios](#1-usuarios) - Gestión de cuentas de usuario
2. [Predios](#2-predios) - Gestión de complejos deportivos
3. [Canchas](#3-canchas) - Gestión de canchas de fútbol
4. [Reservas](#4-reservas) - Gestión del sistema de reservas

### 👥 Gestión de Perfiles

- [Jugadores](#5-jugadores) - Gestión de perfiles de jugadores
- [Empresas](#6-empresas) - Gestión de perfiles empresariales
- [Localidades](#7-localidades) - Gestión de ubicaciones geográficas

### 🔧 Utilidades

- [Utilidades de la API](#8-utilidades-de-la-api) - Health check y información general

### 📋 Información Adicional

- [Flujo Recomendado](#flujo-recomendado-de-creación)
- [Consideraciones Técnicas](#consideraciones-importantes)
- [Ejemplos de Implementación](#ejemplo-completo-en-react)

---

## 1. USUARIOS

Los usuarios son la base del sistema. Existen dos tipos principales: **Jugadores** (quienes hacen reservas) y **Empresas** (quienes administran predios y canchas).

### 1.1 Crear Usuario Jugador Completo

> **Operación:** CREATE  
> **Endpoint:** `POST /api/users/complete/jugador`  
> **Descripción:** Crea un usuario y su perfil de jugador en una sola operación

Este endpoint permite registrar un nuevo jugador en el sistema, creando tanto la cuenta de usuario como el perfil específico del jugador.

**Datos requeridos:** para Jugador

```json
{
  "email": "string",
  "contraseña": "string (min 8 caracteres)",
  "nombre": "string",
  "apellido": "string",
  "nroCelular": "string"
}
```

#### Ejemplo - Crear Usuario Jugador

```json
{
  "email": "juan.perez@gmail.com",
  "contraseña": "miPassword123",
  "nombre": "Juan",
  "apellido": "Pérez",
  "nroCelular": "1123456789"
}
```

#### Respuesta exitosa - Usuario Jugador Creado (201)

```json
{
  "_id": "64f8b12c5e8f4a2b3c9d1234",
  "email": "juan.perez@gmail.com",
  "tipoUsuario": "jugador",
  "jugador": {
    "_id": "64f8b12c5e8f4a2b3c9d1235",
    "nombre": "Juan",
    "apellido": "Pérez",
    "nroCelular": "1123456789"
  }
}
```

**Implementación React:**

```javascript
const createPlayerUser = async (userData) => {
  try {
    const response = await fetch("/api/users/complete/jugador", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error("Error al crear usuario jugador");
    }

    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
```

---

### 1.2 Crear Usuario Empresa Completo

> **Operación:** CREATE  
> **Endpoint:** `POST /api/users/complete/empresa`  
> **Descripción:** Crea un usuario y su perfil de empresa en una sola operación

Este endpoint permite registrar una nueva empresa en el sistema, creando tanto la cuenta de usuario como el perfil empresarial con información comercial.

**Datos requeridos:** para Usuario Empresa

```json
{
  "email": "string",
  "contraseña": "string (min 8 caracteres)",
  "cuit": "string (11 dígitos)",
  "razonSocial": "string",
  "direccion": {
    "calle": "string",
    "altura": "string",
    "piso": "string (opcional)",
    "dpto": "string (opcional)",
    "localidad": "string (nombre de localidad)"
  }
}
```

**Petición:** Empresa

```json
{
  "email": "empresa@futbol.com",
  "contraseña": "empresaPass123",
  "cuit": "20123456789",
  "razonSocial": "Futbol Center SA",
  "direccion": {
    "calle": "Av. Corrientes",
    "altura": "1234",
    "piso": "5",
    "dpto": "A",
    "localidad": "Capital Federal"
  }
}
```

#### Respuesta exitosa para Usuario Empresa (201)

```json
{
  "_id": "64f8b12c5e8f4a2b3c9d1236",
  "email": "empresa@futbol.com",
  "tipoUsuario": "empresa",
  "empresa": {
    "_id": "64f8b12c5e8f4a2b3c9d1237",
    "cuit": "20123456789",
    "razonSocial": "Futbol Center SA",
    "direccion": {
      "calle": "Av. Corrientes",
      "altura": "1234",
      "piso": "5",
      "dpto": "A",
      "localidad": {
        "_id": "64f8b12c5e8f4a2b3c9d1238",
        "nombre": "Capital Federal"
      }
    }
  }
}
```

**Implementación React:** Empresa

```javascript
const createCompanyUser = async (userData) => {
  try {
    const response = await fetch("/api/users/complete/empresa", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error("Error al crear usuario empresa");
    }

    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
```

### 1.3 Listar Todos los Usuarios

> **Operación:** READ  
> **Endpoint:** `GET /api/users`  
> **Descripción:** Obtiene la lista completa de usuarios del sistema

**Petición:**

```http
GET http://localhost:3000/api/users
```

**Respuesta exitosa (200):**

```json
[
  {
    "_id": "64f8b12c5e8f4a2b3c9d1234",
    "email": "juan.perez@gmail.com",
    "tipoUsuario": "jugador",
    "jugador": {
      "_id": "64f8b12c5e8f4a2b3c9d1235",
      "nombre": "Juan",
      "apellido": "Pérez",
      "nroCelular": "1123456789"
    }
  },
  {
    "_id": "64f8b12c5e8f4a2b3c9d1236",
    "email": "empresa@futbol.com",
    "tipoUsuario": "empresa",
    "empresa": {
      "_id": "64f8b12c5e8f4a2b3c9d1237",
      "cuit": "20123456789",
      "razonSocial": "Futbol Center SA"
    }
  }
]
```

### 1.4 Obtener Usuario por ID

> **Operación:** READ  
> **Endpoint:** `GET /api/users/{id}`  
> **Descripción:** Obtiene un usuario específico por su ID

**Petición:**

```http
GET http://localhost:3000/api/users/64f8b12c5e8f4a2b3c9d1234
```

**Respuesta exitosa (200):**

```json
{
  "_id": "64f8b12c5e8f4a2b3c9d1234",
  "email": "juan.perez@gmail.com",
  "tipoUsuario": "jugador",
  "jugador": {
    "_id": "64f8b12c5e8f4a2b3c9d1235",
    "nombre": "Juan",
    "apellido": "Pérez",
    "nroCelular": "1123456789",
    "reservas": []
  }
}
```

### 1.5 Crear Usuario Básico

> **Operación:** CREATE  
> **Endpoint:** `POST /api/users`  
> **Descripción:** Crea solo la cuenta de usuario sin perfil específico

**Datos requeridos:**

```json
{
  "email": "string",
  "contraseña": "string (min 8 caracteres)",
  "tipoUsuario": "string (jugador o empresa)"
}
```

**Petición:**

```json
{
  "email": "usuario@ejemplo.com",
  "contraseña": "miPassword123",
  "tipoUsuario": "jugador"
}
```

**Respuesta exitosa (201):**

```json
{
  "_id": "64f8b12c5e8f4a2b3c9d1234",
  "email": "usuario@ejemplo.com",
  "tipoUsuario": "jugador"
}
```

### 1.6 Actualizar Usuario

> **Operación:** UPDATE  
> **Endpoint:** `PUT /api/users/{id}`  
> **Descripción:** Actualiza información del usuario

**Datos opcionales:**

```json
{
  "email": "string (opcional)",
  "contraseña": "string (opcional)",
  "tipoUsuario": "string (opcional)"
}
```

**Petición:**

```json
{
  "email": "nuevo.email@ejemplo.com"
}
```

### 1.7 Eliminar Usuario

> **Operación:** DELETE  
> **Endpoint:** `DELETE /api/users/{id}`  
> **Descripción:** Elimina un usuario del sistema

**Petición:**

```http
DELETE http://localhost:3000/api/users/64f8b12c5e8f4a2b3c9d1234
```

**Respuesta exitosa (204):**

Sin contenido

### 1.8 Asociar Usuario con Jugador

> **Operación:** UPDATE  
> **Endpoint:** `PUT /api/users/{id}/associate/jugador`  
> **Descripción:** Asocia un usuario existente con un perfil de jugador

**Datos requeridos:**

```json
{
  "jugadorId": "ObjectId del jugador"
}
```

### 1.9 Asociar Usuario con Empresa

> **Operación:** UPDATE  
> **Endpoint:** `PUT /api/users/{id}/associate/empresa`  
> **Descripción:** Asocia un usuario existente con un perfil de empresa

**Datos requeridos:**

```json
{
  "empresaId": "ObjectId de la empresa"
}
```

### 1.10 Asociar Usuario con Predio

> **Operación:** UPDATE  
> **Endpoint:** `PUT /api/users/{id}/associate/predio`  
> **Descripción:** Asocia un usuario existente con un predio

**Datos requeridos:**

```json
{
  "predioId": "ObjectId del predio"
}
```

---

## 5. JUGADORES

Los jugadores son usuarios específicos que pueden realizar reservas de canchas. Este endpoint permite gestionar los perfiles de jugadores independientemente de sus cuentas de usuario.

### 5.1 Listar Todos los Jugadores

> **Operación:** READ  
> **Endpoint:** `GET /api/jugadores`  
> **Descripción:** Obtiene la lista completa de jugadores registrados

**Petición:**

```http
GET http://localhost:3000/api/jugadores
```

**Respuesta exitosa (200):**

```json
[
  {
    "_id": "64f8b12c5e8f4a2b3c9d1235",
    "nombre": "Juan",
    "apellido": "Pérez",
    "nroCelular": "1123456789",
    "reservas": []
  },
  {
    "_id": "64f8b12c5e8f4a2b3c9d1236",
    "nombre": "María",
    "apellido": "González",
    "nroCelular": "1187654321",
    "reservas": ["64f8b12c5e8f4a2b3c9d1245"]
  }
]
```

### 5.2 Obtener Jugador por ID

> **Operación:** READ  
> **Endpoint:** `GET /api/jugadores/{id}`  
> **Descripción:** Obtiene información detallada de un jugador específico

**Petición:**

```http
GET http://localhost:3000/api/jugadores/64f8b12c5e8f4a2b3c9d1235
```

**Respuesta exitosa (200):**

```json
{
  "_id": "64f8b12c5e8f4a2b3c9d1235",
  "nombre": "Juan",
  "apellido": "Pérez",
  "nroCelular": "1123456789",
  "reservas": [
    {
      "_id": "64f8b12c5e8f4a2b3c9d1245",
      "cancha": "64f8b12c5e8f4a2b3c9d1242",
      "fechaHora": {
        "fecha": "2024-12-15T00:00:00.000Z",
        "hora": "20:00"
      },
      "estado": "confirmada"
    }
  ]
}
```

### 5.3 Crear Jugador

> **Operación:** CREATE  
> **Endpoint:** `POST /api/jugadores`  
> **Descripción:** Crea un nuevo perfil de jugador

**Datos requeridos:**

```json
{
  "nombre": "string",
  "apellido": "string",
  "nroCelular": "string"
}
```

**Petición:**

```json
{
  "nombre": "Carlos",
  "apellido": "Rodríguez",
  "nroCelular": "1155667788"
}
```

**Respuesta exitosa (201):**

```json
{
  "_id": "64f8b12c5e8f4a2b3c9d1237",
  "nombre": "Carlos",
  "apellido": "Rodríguez",
  "nroCelular": "1155667788",
  "reservas": []
}
```

### 5.4 Actualizar Jugador

> **Operación:** UPDATE  
> **Endpoint:** `PUT /api/jugadores/{id}`  
> **Descripción:** Actualiza información de un jugador existente

**Datos opcionales:**

```json
{
  "nombre": "string (opcional)",
  "apellido": "string (opcional)",
  "nroCelular": "string (opcional)"
}
```

**Petición:**

```json
{
  "nroCelular": "1199887766"
}
```

### 5.5 Eliminar Jugador

> **Operación:** DELETE  
> **Endpoint:** `DELETE /api/jugadores/{id}`  
> **Descripción:** Elimina un jugador del sistema

**Petición:**

```http
DELETE http://localhost:3000/api/jugadores/64f8b12c5e8f4a2b3c9d1237
```

**Respuesta exitosa (204):**

Sin contenido

### 5.6 Agregar Reserva a Jugador

> **Operación:** UPDATE  
> **Endpoint:** `PUT /api/jugadores/{id}/reservas/add`  
> **Descripción:** Asocia una reserva existente a un jugador

**Datos requeridos:**

```json
{
  "reservaId": "ObjectId de la reserva"
}
```

**Petición:**

```json
{
  "reservaId": "64f8b12c5e8f4a2b3c9d1245"
}
```

### 5.7 Remover Reserva de Jugador

> **Operación:** UPDATE  
> **Endpoint:** `PUT /api/jugadores/{id}/reservas/remove`  
> **Descripción:** Desasocia una reserva de un jugador

**Datos requeridos:**

```json
{
  "reservaId": "ObjectId de la reserva"
}
```

**Implementación React:** - Jugadores

```javascript
// Servicio para gestionar jugadores
const jugadorService = {
  // Obtener todos los jugadores
  getAllJugadores: async () => {
    const response = await fetch("/api/jugadores");
    return response.json();
  },

  // Crear nuevo jugador
  createJugador: async (jugadorData) => {
    const response = await fetch("/api/jugadores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jugadorData),
    });
    return response.json();
  },

  // Actualizar jugador
  updateJugador: async (id, updates) => {
    const response = await fetch(`/api/jugadores/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    return response.json();
  },

  // Gestionar reservas del jugador
  addReserva: async (jugadorId, reservaId) => {
    const response = await fetch(`/api/jugadores/${jugadorId}/reservas/add`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reservaId }),
    });
    return response.json();
  },
};
```

---

## 6. EMPRESAS

Las empresas son entidades que administran uno o más predios deportivos. Este endpoint permite gestionar los perfiles empresariales y sus predios asociados.

### 6.1 Listar Todas las Empresas

> **Operación:** READ  
> **Endpoint:** `GET /api/empresas`  
> **Descripción:** Obtiene la lista completa de empresas registradas

**Petición:**

```http
GET http://localhost:3000/api/empresas
```

**Respuesta exitosa (200):**

```json
[
  {
    "_id": "64f8b12c5e8f4a2b3c9d1237",
    "cuit": "20123456789",
    "razonSocial": "Futbol Center SA",
    "direccion": {
      "calle": "Av. Corrientes",
      "altura": "1234",
      "localidad": {
        "_id": "64f8b12c5e8f4a2b3c9d1238",
        "nombre": "Capital Federal"
      }
    },
    "predios": ["64f8b12c5e8f4a2b3c9d1239"]
  }
]
```

### 6.2 Obtener Empresa por ID

> **Operación:** READ  
> **Endpoint:** `GET /api/empresas/{id}`  
> **Descripción:** Obtiene información detallada de una empresa específica

**Petición:**

```http
GET http://localhost:3000/api/empresas/64f8b12c5e8f4a2b3c9d1237
```

### 6.3 Obtener Empresa por CUIT

> **Operación:** READ  
> **Endpoint:** `GET /api/empresas/cuit/{cuit}`  
> **Descripción:** Busca una empresa específica por su CUIT

**Petición:**

```http
GET http://localhost:3000/api/empresas/cuit/20123456789
```

**Respuesta exitosa (200):**

```json
{
  "_id": "64f8b12c5e8f4a2b3c9d1237",
  "cuit": "20123456789",
  "razonSocial": "Futbol Center SA",
  "direccion": {
    "calle": "Av. Corrientes",
    "altura": "1234",
    "piso": "5",
    "dpto": "A",
    "localidad": {
      "_id": "64f8b12c5e8f4a2b3c9d1238",
      "nombre": "Capital Federal"
    }
  },
  "predios": [
    {
      "_id": "64f8b12c5e8f4a2b3c9d1239",
      "nombrePredio": "Complejo Deportivo San Lorenzo"
    }
  ]
}
```

### 6.4 Crear Empresa

> **Operación:** CREATE  
> **Endpoint:** `POST /api/empresas`  
> **Descripción:** Crea una nueva empresa

**Datos requeridos:**

```json
{
  "cuit": "string (11 dígitos)",
  "razonSocial": "string",
  "direccion": {
    "calle": "string",
    "altura": "string",
    "piso": "string (opcional)",
    "dpto": "string (opcional)",
    "localidad": "string (nombre de localidad)"
  }
}
```

### 6.5 Actualizar Empresa

> **Operación:** UPDATE  
> **Endpoint:** `PUT /api/empresas/{id}`  
> **Descripción:** Actualiza información de una empresa existente

### 6.6 Eliminar Empresa

> **Operación:** DELETE  
> **Endpoint:** `DELETE /api/empresas/{id}`  
> **Descripción:** Elimina una empresa del sistema

### 6.7 Agregar Predio a Empresa

> **Operación:** UPDATE  
> **Endpoint:** `PUT /api/empresas/{id}/predios/add`  
> **Descripción:** Asocia un predio existente a una empresa

**Datos requeridos:**

```json
{
  "predioId": "ObjectId del predio"
}
```

### 6.8 Remover Predio de Empresa

> **Operación:** UPDATE  
> **Endpoint:** `PUT /api/empresas/{id}/predios/remove`  
> **Descripción:** Desasocia un predio de una empresa

**Implementación React:** - Empresas

```javascript
// Servicio para gestionar empresas
const empresaService = {
  // Buscar empresa por CUIT
  getByCuit: async (cuit) => {
    const response = await fetch(`/api/empresas/cuit/${cuit}`);
    return response.json();
  },

  // Crear nueva empresa
  createEmpresa: async (empresaData) => {
    const response = await fetch("/api/empresas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(empresaData),
    });
    return response.json();
  },

  // Gestionar predios de la empresa
  addPredio: async (empresaId, predioId) => {
    const response = await fetch(`/api/empresas/${empresaId}/predios/add`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ predioId }),
    });
    return response.json();
  },
};
```

---

## 7. LOCALIDADES

Las localidades son referencias geográficas utilizadas en las direcciones de empresas y predios. El sistema permite buscar y gestionar localidades.

### 7.1 Listar Todas las Localidades

> **Operación:** READ  
> **Endpoint:** `GET /api/localidades`  
> **Descripción:** Obtiene la lista completa de localidades disponibles

**Petición:**

```http
GET http://localhost:3000/api/localidades
```

**Respuesta exitosa (200):**

```json
[
  {
    "_id": "64f8b12c5e8f4a2b3c9d1238",
    "nombre": "Capital Federal",
    "cp": "1000"
  },
  {
    "_id": "64f8b12c5e8f4a2b3c9d1240",
    "nombre": "San Isidro",
    "cp": "1642"
  }
]
```

### 7.2 Obtener Localidad por ID

> **Operación:** READ  
> **Endpoint:** `GET /api/localidades/{id}`  
> **Descripción:** Obtiene información de una localidad específica

### 7.3 Buscar Localidad por Código Postal

> **Operación:** READ  
> **Endpoint:** `GET /api/localidades/cp/{cp}`  
> **Descripción:** Busca localidades por código postal

**Petición:**

```http
GET http://localhost:3000/api/localidades/cp/1000
```

### 7.4 Buscar Localidades por Nombre

> **Operación:** READ  
> **Endpoint:** `GET /api/localidades/search/nombre?q={query}`  
> **Descripción:** Busca localidades que coincidan con el nombre proporcionado

**Petición:**

```http
GET http://localhost:3000/api/localidades/search/nombre?q=Capital
```

**Respuesta exitosa (200):**

```json
[
  {
    "_id": "64f8b12c5e8f4a2b3c9d1238",
    "nombre": "Capital Federal",
    "cp": "1000"
  }
]
```

### 7.5 Crear Localidad

> **Operación:** CREATE  
> **Endpoint:** `POST /api/localidades`  
> **Descripción:** Crea una nueva localidad

**Datos requeridos:**

```json
{
  "nombre": "string",
  "cp": "string"
}
```

### 7.6 Actualizar Localidad

> **Operación:** UPDATE  
> **Endpoint:** `PUT /api/localidades/{id}`  
> **Descripción:** Actualiza información de una localidad

### 7.7 Eliminar Localidad

> **Operación:** DELETE  
> **Endpoint:** `DELETE /api/localidades/{id}`  
> **Descripción:** Elimina una localidad del sistema

**Implementación React:** - Localidades

```javascript
// Servicio para gestionar localidades
const localidadService = {
  // Buscar por nombre
  searchByName: async (query) => {
    const response = await fetch(`/api/localidades/search/nombre?q=${query}`);
    return response.json();
  },

  // Buscar por código postal
  getByCP: async (cp) => {
    const response = await fetch(`/api/localidades/cp/${cp}`);
    return response.json();
  },

  // Obtener todas
  getAll: async () => {
    const response = await fetch("/api/localidades");
    return response.json();
  },
};
```

---

## 2. PREDIOS

Los predios son complejos deportivos administrados por empresas, que contienen una o más canchas de fútbol.

### 2.1 Crear Predio

> **Operación:** CREATE  
> **Endpoint:** `POST /api/predios`  
> **Descripción:** Crea un nuevo predio asociado a una empresa

Este endpoint permite crear un complejo deportivo con sus horarios de funcionamiento y datos de ubicación.

### Datos requeridos para Predio

```json
{
  "nombrePredio": "string",
  "direccion": {
    "calle": "string",
    "altura": "string",
    "piso": "string (opcional)",
    "dpto": "string (opcional)",
    "localidad": "string (nombre de localidad)"
  },
  "empresa": "string (CUIT de la empresa)",
  "horarios": [
    {
      "desde": "string (formato HH:mm)",
      "hasta": "string (formato HH:mm)"
    }
  ]
}
```

**Petición:** Predio

```json
{
  "nombrePredio": "Complejo Deportivo San Lorenzo",
  "direccion": {
    "calle": "San Martin",
    "altura": "500",
    "localidad": "San Isidro"
  },
  "empresa": "20123456789",
  "horarios": [
    {
      "desde": "08:00",
      "hasta": "22:00"
    }
  ]
}
```

#### Respuesta exitosa para Predio (201)

````json

```json
{
  "_id": "64f8b12c5e8f4a2b3c9d1239",
  "nombrePredio": "Complejo Deportivo San Lorenzo",
  "direccion": {
    "calle": "San Martin",
    "altura": "500",
    "localidad": {
      "_id": "64f8b12c5e8f4a2b3c9d1240",
      "nombre": "San Isidro"
    }
  },
  "empresa": {
    "_id": "64f8b12c5e8f4a2b3c9d1237",
    "razonSocial": "Futbol Center SA"
  },
  "horarios": [
    {
      "_id": "64f8b12c5e8f4a2b3c9d1241",
      "desde": "08:00",
      "hasta": "22:00"
    }
  ],
  "canchas": []
}
````

**Implementación React:** Predio

```javascript
const createPredio = async (predioData) => {
  try {
    const response = await fetch("/api/predios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(predioData),
    });

    if (!response.ok) {
      throw new Error("Error al crear predio");
    }

    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
```

### 8.2 Listar Todos los Predios

> **Operación:** READ  
> **Endpoint:** `GET /api/predios`  
> **Descripción:** Obtiene la lista completa de predios registrados

**Petición:**

```http
GET http://localhost:3000/api/predios
```

**Respuesta exitosa (200):**

```json
[
  {
    "_id": "64f8b12c5e8f4a2b3c9d1239",
    "nombrePredio": "Complejo Deportivo San Lorenzo",
    "direccion": {
      "calle": "San Martin",
      "altura": "500",
      "localidad": {
        "_id": "64f8b12c5e8f4a2b3c9d1240",
        "nombre": "San Isidro"
      }
    },
    "empresa": {
      "_id": "64f8b12c5e8f4a2b3c9d1237",
      "razonSocial": "Futbol Center SA"
    },
    "horarios": [
      {
        "_id": "64f8b12c5e8f4a2b3c9d1241",
        "desde": "08:00",
        "hasta": "22:00"
      }
    ],
    "canchas": []
  }
]
```

### 8.3 Obtener Predio por ID

> **Operación:** READ  
> **Endpoint:** `GET /api/predios/{id}`  
> **Descripción:** Obtiene información detallada de un predio específico

**Petición:**

```http
GET http://localhost:3000/api/predios/64f8b12c5e8f4a2b3c9d1239
```

### 8.4 Obtener Predios por Empresa

> **Operación:** READ  
> **Endpoint:** `GET /api/predios/empresa/{empresaId}`  
> **Descripción:** Obtiene todos los predios pertenecientes a una empresa específica

**Petición:**

```http
GET http://localhost:3000/api/predios/empresa/64f8b12c5e8f4a2b3c9d1237
```

**Respuesta exitosa (200):**

```json
[
  {
    "_id": "64f8b12c5e8f4a2b3c9d1239",
    "nombrePredio": "Complejo Deportivo San Lorenzo",
    "direccion": {
      "calle": "San Martin",
      "altura": "500",
      "localidad": {
        "nombre": "San Isidro"
      }
    },
    "horarios": [
      {
        "desde": "08:00",
        "hasta": "22:00"
      }
    ],
    "canchas": [
      {
        "_id": "64f8b12c5e8f4a2b3c9d1242",
        "cantJugadores": 5,
        "tipoPiso": "sintetico"
      }
    ]
  }
]
```

### 8.5 Actualizar Predio

> **Operación:** UPDATE  
> **Endpoint:** `PUT /api/predios/{id}`  
> **Descripción:** Actualiza información de un predio existente

**Datos opcionales:** para actualización

```json
{
  "nombrePredio": "string (opcional)",
  "direccion": {
    "calle": "string (opcional)",
    "altura": "string (opcional)",
    "piso": "string (opcional)",
    "dpto": "string (opcional)",
    "localidad": "string (opcional)"
  },
  "horarios": [
    {
      "desde": "string (opcional)",
      "hasta": "string (opcional)"
    }
  ]
}
```

### 8.6 Eliminar Predio

> **Operación:** DELETE  
> **Endpoint:** `DELETE /api/predios/{id}`  
> **Descripción:** Elimina un predio del sistema

**Petición:**

```http
DELETE http://localhost:3000/api/predios/64f8b12c5e8f4a2b3c9d1239
```

### 8.7 Agregar Cancha a Predio

> **Operación:** UPDATE  
> **Endpoint:** `PUT /api/predios/{id}/canchas/add`  
> **Descripción:** Asocia una cancha existente a un predio

**Datos requeridos:**

```json
{
  "canchaId": "ObjectId de la cancha"
}
```

### 8.8 Remover Cancha de Predio

> **Operación:** UPDATE  
> **Endpoint:** `PUT /api/predios/{id}/canchas/remove`  
> **Descripción:** Desasocia una cancha de un predio

**Datos requeridos:**

```json
{
  "canchaId": "ObjectId de la cancha"
}
```

### 8.9 Agregar Horario a Predio

> **Operación:** UPDATE  
> **Endpoint:** `PUT /api/predios/{id}/horarios/add`  
> **Descripción:** Agrega un nuevo horario de funcionamiento al predio

**Datos requeridos:**

```json
{
  "horario": {
    "desde": "string (formato HH:mm)",
    "hasta": "string (formato HH:mm)"
  }
}
```

### 8.10 Remover Horario de Predio

> **Operación:** UPDATE  
> **Endpoint:** `PUT /api/predios/{id}/horarios/remove`  
> **Descripción:** Elimina un horario específico del predio

**Datos requeridos:**

```json
{
  "horarioId": "ObjectId del horario"
}
```

**Implementación React:** - Predios Actualizada

```javascript
const predioService = {
  // Obtener todos los predios
  getAllPredios: async () => {
    const response = await fetch("/api/predios");
    return response.json();
  },

  // Obtener predios por empresa
  getByEmpresa: async (empresaId) => {
    const response = await fetch(`/api/predios/empresa/${empresaId}`);
    return response.json();
  },

  // Actualizar predio
  updatePredio: async (id, updates) => {
    const response = await fetch(`/api/predios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    return response.json();
  },

  // Gestionar canchas del predio
  addCancha: async (predioId, canchaId) => {
    const response = await fetch(`/api/predios/${predioId}/canchas/add`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ canchaId }),
    });
    return response.json();
  },

  // Gestionar horarios del predio
  addHorario: async (predioId, horario) => {
    const response = await fetch(`/api/predios/${predioId}/horarios/add`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ horario }),
    });
    return response.json();
  },
};
```

---

## 3. CANCHAS

Las canchas son espacios de juego dentro de los predios, con características específicas como tipo de piso y capacidad de jugadores.

### 3.1 Crear Cancha

> **Operación:** CREATE  
> **Endpoint:** `POST /api/canchas`  
> **Descripción:** Crea una nueva cancha asociada a un predio

Este endpoint permite añadir una nueva cancha a un predio existente, con características específicas y horarios disponibles.

### Datos requeridos para Cancha

```json
{
  "cantJugadores": "number (5, 6, 7, 8, 9, 11)",
  "tipoPiso": "string (sintetico, cesped, salon)",
  "predio": "string (nombre del predio)",
  "disponibilidad": [
    {
      "fecha": "Date",
      "hora": "string (formato HH:mm)",
      "precio": "number"
    }
  ]
}
```

**Petición:** Cancha

```json
{
  "cantJugadores": 5,
  "tipoPiso": "sintetico",
  "predio": "Complejo Deportivo San Lorenzo",
  "disponibilidad": [
    {
      "fecha": "2024-12-15T00:00:00.000Z",
      "hora": "20:00",
      "precio": 15000
    },
    {
      "fecha": "2024-12-15T00:00:00.000Z",
      "hora": "21:00",
      "precio": 18000
    }
  ]
}
```

#### Respuesta exitosa para Cancha (201)

```json
{
  "_id": "64f8b12c5e8f4a2b3c9d1242",
  "cantJugadores": 5,
  "tipoPiso": "sintetico",
  "predio": {
    "_id": "64f8b12c5e8f4a2b3c9d1239",
    "nombrePredio": "Complejo Deportivo San Lorenzo"
  },
  "disponibilidad": [
    {
      "_id": "64f8b12c5e8f4a2b3c9d1243",
      "fecha": "2024-12-15T00:00:00.000Z",
      "hora": "20:00",
      "precio": 15000
    },
    {
      "_id": "64f8b12c5e8f4a2b3c9d1244",
      "fecha": "2024-12-15T00:00:00.000Z",
      "hora": "21:00",
      "precio": 18000
    }
  ]
}
```

**Implementación React:** Cancha

```javascript
const createCancha = async (canchaData) => {
  try {
    const response = await fetch("/api/canchas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(canchaData),
    });

    if (!response.ok) {
      throw new Error("Error al crear cancha");
    }

    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
```

### 9.2 Listar Todas las Canchas

> **Operación:** READ  
> **Endpoint:** `GET /api/canchas`  
> **Descripción:** Obtiene la lista completa de canchas registradas

**Petición:**

```http
GET http://localhost:3000/api/canchas
```

**Respuesta exitosa (200):**

```json
[
  {
    "_id": "64f8b12c5e8f4a2b3c9d1242",
    "cantJugadores": 5,
    "tipoPiso": "sintetico",
    "predio": {
      "_id": "64f8b12c5e8f4a2b3c9d1239",
      "nombrePredio": "Complejo Deportivo San Lorenzo"
    },
    "disponibilidad": [
      {
        "_id": "64f8b12c5e8f4a2b3c9d1243",
        "fecha": "2024-12-15T00:00:00.000Z",
        "hora": "20:00",
        "precio": 15000
      }
    ]
  }
]
```

### 9.3 Obtener Cancha por ID

> **Operación:** READ  
> **Endpoint:** `GET /api/canchas/{id}`  
> **Descripción:** Obtiene información detallada de una cancha específica

**Petición:**

```http
GET http://localhost:3000/api/canchas/64f8b12c5e8f4a2b3c9d1242
```

### 9.4 Obtener Canchas por Predio

> **Operación:** READ  
> **Endpoint:** `GET /api/canchas/predio/{predioId}`  
> **Descripción:** Obtiene todas las canchas pertenecientes a un predio específico

**Petición:**

```http
GET http://localhost:3000/api/canchas/predio/64f8b12c5e8f4a2b3c9d1239
```

### 9.5 Buscar Canchas Disponibles

> **Operación:** READ  
> **Endpoint:** `GET /api/canchas/search/disponibles?fecha={fecha}&hora={hora}`  
> **Descripción:** Busca canchas disponibles para una fecha y hora específica

#### Parámetros de consulta

- `fecha`: Fecha en formato ISO 8601 (YYYY-MM-DD)
- `hora`: Hora en formato HH:mm

**Petición:**

```http
GET http://localhost:3000/api/canchas/search/disponibles?fecha=2024-12-15&hora=20:00
```

**Respuesta exitosa (200):**

```json
[
  {
    "_id": "64f8b12c5e8f4a2b3c9d1242",
    "cantJugadores": 5,
    "tipoPiso": "sintetico",
    "predio": {
      "nombrePredio": "Complejo Deportivo San Lorenzo",
      "direccion": {
        "calle": "San Martin",
        "altura": "500",
        "localidad": "San Isidro"
      }
    },
    "disponibilidad": [
      {
        "fecha": "2024-12-15T00:00:00.000Z",
        "hora": "20:00",
        "precio": 15000
      }
    ]
  }
]
```

### 9.6 Buscar Canchas por Filtros

> **Operación:** READ  
> **Endpoint:** `GET /api/canchas/search/filters?cantJugadores={num}&tipoPiso={tipo}&localidad={localidad}`  
> **Descripción:** Busca canchas aplicando múltiples filtros

#### Parámetros de consulta opcionales

- `cantJugadores`: Número de jugadores (5, 6, 7, 8, 9, 11)
- `tipoPiso`: Tipo de piso (sintetico, cesped, salon)
- `localidad`: Nombre de la localidad

**Petición:**

```http
GET http://localhost:3000/api/canchas/search/filters?cantJugadores=5&tipoPiso=sintetico
```

### 9.7 Actualizar Cancha

> **Operación:** UPDATE  
> **Endpoint:** `PUT /api/canchas/{id}`  
> **Descripción:** Actualiza información de una cancha existente

**Datos opcionales:** para actualización

```json
{
  "cantJugadores": "number (opcional)",
  "tipoPiso": "string (opcional)",
  "disponibilidad": [
    {
      "fecha": "Date (opcional)",
      "hora": "string (opcional)",
      "precio": "number (opcional)"
    }
  ]
}
```

### 9.8 Eliminar Cancha

> **Operación:** DELETE  
> **Endpoint:** `DELETE /api/canchas/{id}`  
> **Descripción:** Elimina una cancha del sistema

**Petición:**

```http
DELETE http://localhost:3000/api/canchas/64f8b12c5e8f4a2b3c9d1242
```

### 9.9 Agregar Disponibilidad a Cancha

> **Operación:** UPDATE  
> **Endpoint:** `PUT /api/canchas/{id}/disponibilidad/add`  
> **Descripción:** Agrega nuevos horarios disponibles a una cancha

**Datos requeridos:**

```json
{
  "disponibilidad": {
    "fecha": "Date",
    "hora": "string (formato HH:mm)",
    "precio": "number"
  }
}
```

**Petición:**

```json
{
  "disponibilidad": {
    "fecha": "2024-12-16T00:00:00.000Z",
    "hora": "19:00",
    "precio": 14000
  }
}
```

### 9.10 Remover Disponibilidad de Cancha

> **Operación:** UPDATE  
> **Endpoint:** `PUT /api/canchas/{id}/disponibilidad/remove`  
> **Descripción:** Elimina un horario específico de la disponibilidad

**Datos requeridos:**

```json
{
  "disponibilidadId": "ObjectId de la disponibilidad"
}
```

### 9.11 Actualizar Disponibilidad de Cancha

> **Operación:** UPDATE  
> **Endpoint:** `PUT /api/canchas/{id}/disponibilidad/update`  
> **Descripción:** Modifica un horario existente en la disponibilidad

**Datos requeridos:**

```json
{
  "disponibilidadId": "ObjectId de la disponibilidad",
  "updates": {
    "fecha": "Date (opcional)",
    "hora": "string (opcional)",
    "precio": "number (opcional)"
  }
}
```

**Implementación React:** - Canchas Actualizada

```javascript
const canchaService = {
  // Obtener todas las canchas
  getAllCanchas: async () => {
    const response = await fetch("/api/canchas");
    return response.json();
  },

  // Buscar canchas disponibles
  getDisponibles: async (fecha, hora) => {
    const params = new URLSearchParams({ fecha, hora });
    const response = await fetch(`/api/canchas/search/disponibles?${params}`);
    return response.json();
  },

  // Buscar por filtros
  searchByFilters: async (filters) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`/api/canchas/search/filters?${params}`);
    return response.json();
  },

  // Obtener canchas por predio
  getByPredio: async (predioId) => {
    const response = await fetch(`/api/canchas/predio/${predioId}`);
    return response.json();
  },

  // Actualizar cancha
  updateCancha: async (id, updates) => {
    const response = await fetch(`/api/canchas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    return response.json();
  },

  // Gestionar disponibilidad
  addDisponibilidad: async (canchaId, disponibilidad) => {
    const response = await fetch(
      `/api/canchas/${canchaId}/disponibilidad/add`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disponibilidad }),
      }
    );
    return response.json();
  },

  updateDisponibilidad: async (canchaId, disponibilidadId, updates) => {
    const response = await fetch(
      `/api/canchas/${canchaId}/disponibilidad/update`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disponibilidadId, updates }),
      }
    );
    return response.json();
  },
};
```

---

## 4. RESERVAS

Las reservas permiten a los jugadores separar canchas para fechas y horarios específicos.

### 4.1 Crear Reserva

> **Operación:** CREATE  
> **Endpoint:** `POST /api/reservas`  
> **Descripción:** Crea una nueva reserva para un jugador en una cancha específica

Este endpoint permite a los jugadores reservar canchas en fechas y horarios disponibles, con validación de conflictos.

### Datos requeridos para Reserva

```jsonjson
{
  "jugador": "ObjectId del jugador",
  "cancha": "ObjectId de la cancha",
  "fechaHora": {
    "fecha": "Date",
    "hora": "string (formato HH:mm)"
  },
  "precioFinal": "number",
  "estado": "string (pendiente, confirmada, cancelada) - opcional, default: pendiente"
}
```

**Petición:** Reserva

```json
{
  "jugador": "64f8b12c5e8f4a2b3c9d1235",
  "cancha": "64f8b12c5e8f4a2b3c9d1242",
  "fechaHora": {
    "fecha": "2024-12-15T00:00:00.000Z",
    "hora": "20:00"
  },
  "precioFinal": 15000,
  "estado": "pendiente"
}
```

#### Respuesta exitosa para Reserva (201)

```json
{
  "_id": "64f8b12c5e8f4a2b3c9d1245",
  "jugador": {
    "_id": "64f8b12c5e8f4a2b3c9d1235",
    "nombre": "Juan",
    "apellido": "Pérez"
  },
  "cancha": {
    "_id": "64f8b12c5e8f4a2b3c9d1242",
    "cantJugadores": 5,
    "tipoPiso": "sintetico"
  },
  "estado": "pendiente",
  "fechaHora": {
    "fecha": "2024-12-15T00:00:00.000Z",
    "hora": "20:00"
  },
  "precioFinal": 15000
}
```

**Implementación React:** Reserva

```javascript
const createReserva = async (reservaData) => {
  try {
    const response = await fetch("/api/reservas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reservaData),
    });

    if (!response.ok) {
      throw new Error("Error al crear reserva");
    }

    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
```

### 10.2 Listar Todas las Reservas

> **Operación:** READ  
> **Endpoint:** `GET /api/reservas`  
> **Descripción:** Obtiene la lista completa de reservas en el sistema

**Petición:**

```http
GET http://localhost:3000/api/reservas
```

**Respuesta exitosa (200):**

```json
[
  {
    "_id": "64f8b12c5e8f4a2b3c9d1245",
    "jugador": {
      "_id": "64f8b12c5e8f4a2b3c9d1235",
      "nombre": "Juan",
      "apellido": "Pérez"
    },
    "cancha": {
      "_id": "64f8b12c5e8f4a2b3c9d1242",
      "cantJugadores": 5,
      "tipoPiso": "sintetico",
      "predio": {
        "nombrePredio": "Complejo Deportivo San Lorenzo"
      }
    },
    "estado": "confirmada",
    "fechaHora": {
      "fecha": "2024-12-15T00:00:00.000Z",
      "hora": "20:00"
    },
    "precioFinal": 15000,
    "fechaCreacion": "2024-12-01T10:30:00.000Z"
  }
]
```

### 10.3 Obtener Reserva por ID

> **Operación:** READ  
> **Endpoint:** `GET /api/reservas/{id}`  
> **Descripción:** Obtiene información detallada de una reserva específica

**Petición:**

```http
GET http://localhost:3000/api/reservas/64f8b12c5e8f4a2b3c9d1245
```

### 10.4 Obtener Reservas por Jugador

> **Operación:** READ  
> **Endpoint:** `GET /api/reservas/jugador/{jugadorId}`  
> **Descripción:** Obtiene todas las reservas de un jugador específico

**Petición:**

```http
GET http://localhost:3000/api/reservas/jugador/64f8b12c5e8f4a2b3c9d1235
```

**Respuesta exitosa (200):**

```json
[
  {
    "_id": "64f8b12c5e8f4a2b3c9d1245",
    "cancha": {
      "_id": "64f8b12c5e8f4a2b3c9d1242",
      "cantJugadores": 5,
      "tipoPiso": "sintetico",
      "predio": {
        "nombrePredio": "Complejo Deportivo San Lorenzo",
        "direccion": {
          "calle": "San Martin",
          "altura": "500",
          "localidad": "San Isidro"
        }
      }
    },
    "estado": "confirmada",
    "fechaHora": {
      "fecha": "2024-12-15T00:00:00.000Z",
      "hora": "20:00"
    },
    "precioFinal": 15000
  }
]
```

### 10.5 Obtener Reservas por Cancha

> **Operación:** READ  
> **Endpoint:** `GET /api/reservas/cancha/{canchaId}`  
> **Descripción:** Obtiene todas las reservas de una cancha específica

**Petición:**

```http
GET http://localhost:3000/api/reservas/cancha/64f8b12c5e8f4a2b3c9d1242
```

### 10.6 Obtener Reservas por Estado

> **Operación:** READ  
> **Endpoint:** `GET /api/reservas/estado/{estado}`  
> **Descripción:** Obtiene todas las reservas con un estado específico

#### Estados disponibles

- `pendiente`: Reservas creadas pero no confirmadas
- `confirmada`: Reservas confirmadas por el establecimiento
- `cancelada`: Reservas canceladas

**Petición:**

```http
GET http://localhost:3000/api/reservas/estado/pendiente
```

### 10.7 Obtener Reservas por Fecha

> **Operación:** READ  
> **Endpoint:** `GET /api/reservas/fecha/{fecha}`  
> **Descripción:** Obtiene todas las reservas para una fecha específica

**Petición:**

```http
GET http://localhost:3000/api/reservas/fecha/2024-12-15
```

**Respuesta exitosa (200):**

```json
[
  {
    "_id": "64f8b12c5e8f4a2b3c9d1245",
    "jugador": {
      "nombre": "Juan",
      "apellido": "Pérez",
      "nroCelular": "1123456789"
    },
    "cancha": {
      "cantJugadores": 5,
      "tipoPiso": "sintetico",
      "predio": {
        "nombrePredio": "Complejo Deportivo San Lorenzo"
      }
    },
    "estado": "confirmada",
    "fechaHora": {
      "fecha": "2024-12-15T00:00:00.000Z",
      "hora": "20:00"
    },
    "precioFinal": 15000
  }
]
```

### 10.8 Actualizar Reserva

> **Operación:** UPDATE  
> **Endpoint:** `PUT /api/reservas/{id}`  
> **Descripción:** Actualiza información de una reserva existente

**Datos opcionales:** para actualización

```json
{
  "fechaHora": {
    "fecha": "Date (opcional)",
    "hora": "string (opcional)"
  },
  "precioFinal": "number (opcional)",
  "estado": "string (opcional): pendiente, confirmada, cancelada"
}
```

**Petición:**

```json
{
  "estado": "confirmada",
  "precioFinal": 16000
}
```

### 10.9 Confirmar Reserva

> **Operación:** UPDATE  
> **Endpoint:** `PUT /api/reservas/{id}/confirmar`  
> **Descripción:** Cambia el estado de una reserva a "confirmada"

**Petición:**

```http
PUT http://localhost:3000/api/reservas/64f8b12c5e8f4a2b3c9d1245/confirmar
```

**Respuesta exitosa (200):**

```json
{
  "_id": "64f8b12c5e8f4a2b3c9d1245",
  "estado": "confirmada",
  "jugador": {
    "nombre": "Juan",
    "apellido": "Pérez"
  },
  "cancha": {
    "cantJugadores": 5,
    "tipoPiso": "sintetico"
  },
  "fechaHora": {
    "fecha": "2024-12-15T00:00:00.000Z",
    "hora": "20:00"
  },
  "precioFinal": 15000
}
```

### 10.10 Cancelar Reserva

> **Operación:** UPDATE  
> **Endpoint:** `PUT /api/reservas/{id}/cancelar`  
> **Descripción:** Cambia el estado de una reserva a "cancelada"

**Petición:**

```http
PUT http://localhost:3000/api/reservas/64f8b12c5e8f4a2b3c9d1245/cancelar
```

**Datos opcionales:**

```json
{
  "motivoCancelacion": "string (opcional)"
}
```

### 10.11 Eliminar Reserva

> **Operación:** DELETE  
> **Endpoint:** `DELETE /api/reservas/{id}`  
> **Descripción:** Elimina una reserva del sistema

**Petición:**

```http
DELETE http://localhost:3000/api/reservas/64f8b12c5e8f4a2b3c9d1245
```

**Implementación React:** - Reservas Actualizada

```javascript
const reservaService = {
  // Obtener todas las reservas
  getAllReservas: async () => {
    const response = await fetch("/api/reservas");
    return response.json();
  },

  // Obtener reservas por jugador
  getByJugador: async (jugadorId) => {
    const response = await fetch(`/api/reservas/jugador/${jugadorId}`);
    return response.json();
  },

  // Obtener reservas por cancha
  getByCancha: async (canchaId) => {
    const response = await fetch(`/api/reservas/cancha/${canchaId}`);
    return response.json();
  },

  // Obtener reservas por estado
  getByEstado: async (estado) => {
    const response = await fetch(`/api/reservas/estado/${estado}`);
    return response.json();
  },

  // Obtener reservas por fecha
  getByFecha: async (fecha) => {
    const response = await fetch(`/api/reservas/fecha/${fecha}`);
    return response.json();
  },

  // Actualizar reserva
  updateReserva: async (id, updates) => {
    const response = await fetch(`/api/reservas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    return response.json();
  },

  // Confirmar reserva
  confirmarReserva: async (id) => {
    const response = await fetch(`/api/reservas/${id}/confirmar`, {
      method: "PUT",
    });
    return response.json();
  },

  // Cancelar reserva
  cancelarReserva: async (id, motivo = null) => {
    const body = motivo ? JSON.stringify({ motivoCancelacion: motivo }) : null;
    const response = await fetch(`/api/reservas/${id}/cancelar`, {
      method: "PUT",
      headers: body ? { "Content-Type": "application/json" } : {},
      body,
    });
    return response.json();
  },

  // Eliminar reserva
  deleteReserva: async (id) => {
    const response = await fetch(`/api/reservas/${id}`, {
      method: "DELETE",
    });
    return response.ok;
  },
};

// Ejemplo de uso en componente React
const ReservaManager = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar reservas pendientes
  const loadPendingReservas = async () => {
    setLoading(true);
    try {
      const reservasPendientes = await reservaService.getByEstado("pendiente");
      setReservas(reservasPendientes);
    } catch (error) {
      console.error("Error al cargar reservas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Confirmar una reserva
  const handleConfirmar = async (reservaId) => {
    try {
      await reservaService.confirmarReserva(reservaId);
      // Recargar lista
      loadPendingReservas();
    } catch (error) {
      console.error("Error al confirmar reserva:", error);
    }
  };

  // Cancelar una reserva
  const handleCancelar = async (reservaId, motivo) => {
    try {
      await reservaService.cancelarReserva(reservaId, motivo);
      // Recargar lista
      loadPendingReservas();
    } catch (error) {
      console.error("Error al cancelar reserva:", error);
    }
  };

  return <div>{/* UI para mostrar y gestionar reservas */}</div>;
};
```

---

## 8. UTILIDADES DE LA API

### 11.1 Health Check

> **Operación:** READ  
> **Endpoint:** `GET /api/health`  
> **Descripción:** Verifica el estado de funcionamiento de la API

**Petición:**

```http
GET http://localhost:3000/api/health
```

**Respuesta exitosa (200):**

```json
{
  "status": "OK",
  "message": "Fulbito API funcionando correctamente",
  "timestamp": "2024-12-01T15:30:45.123Z"
}
```

**Implementación React:**

```javascript
const checkApiHealth = async () => {
  try {
    const response = await fetch("/api/health");
    const health = await response.json();
    console.log("API Status:", health.status);
    return health;
  } catch (error) {
    console.error("API no disponible:", error);
    return { status: "ERROR" };
  }
};
```

### 11.2 Información General de la API

> **Operación:** READ  
> **Endpoint:** `GET /api/`  
> **Descripción:** Obtiene información básica sobre la API y sus endpoints disponibles

**Petición:**

```http
GET http://localhost:3000/api/
```

**Respuesta exitosa (200):**

```json
{
  "message": "Bienvenido a Fulbito API",
  "version": "1.0.0",
  "endpoints": {
    "users": "/api/users",
    "jugadores": "/api/jugadores",
    "empresas": "/api/empresas",
    "predios": "/api/predios",
    "canchas": "/api/canchas",
    "reservas": "/api/reservas",
    "localidades": "/api/localidades",
    "health": "/api/health"
  }
}
```

**Implementación React:**

```javascript
const getApiInfo = async () => {
  try {
    const response = await fetch("/api/");
    const apiInfo = await response.json();
    console.log("API Version:", apiInfo.version);
    console.log("Available endpoints:", apiInfo.endpoints);
    return apiInfo;
  } catch (error) {
    console.error("Error obteniendo información de la API:", error);
    throw error;
  }
};
```

### 11.3 Configuración de Base URL Dinámica

Para aplicaciones que pueden ejecutarse en diferentes entornos:

```javascript
// Configuración de entorno
const API_CONFIG = {
  development: "http://localhost:3000/api",
  production: "https://fulbito-api.com/api",
  staging: "https://staging-fulbito-api.com/api",
};

const getBaseURL = () => {
  const env = process.env.NODE_ENV || "development";
  return API_CONFIG[env];
};

// Cliente API genérico
class FulbitoAPI {
  constructor() {
    this.baseURL = getBaseURL();
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error en ${endpoint}:`, error);
      throw error;
    }
  }

  // Métodos de conveniencia
  get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }
}

// Uso del cliente API
const api = new FulbitoAPI();

// Ejemplos de uso
const createUser = (userData) => api.post("/users/complete/jugador", userData);
const getAvailableCourts = (fecha, hora) =>
  api.get(`/canchas/search/disponibles?fecha=${fecha}&hora=${hora}`);
const confirmReservation = (reservaId) =>
  api.put(`/reservas/${reservaId}/confirmar`);
```

---

## FLUJO RECOMENDADO DE CREACIÓN

### Para una Empresa

1. **Crear Usuario Empresa** → `POST /api/users/complete/empresa`
2. **Crear Predio** → `POST /api/predios` (usando CUIT de la empresa)
3. **Crear Canchas** → `POST /api/canchas` (usando nombre del predio)

### Para un Jugador

1. **Crear Usuario Jugador** → `POST /api/users/complete/jugador`
2. **Crear Reserva** → `POST /api/reservas` (usando jugador.\_id y cancha.\_id)

---

## CONSIDERACIONES IMPORTANTES

### Validaciones

- **Email**: Debe ser único y válido
- **CUIT**: 11 dígitos numéricos únicos
- **Contraseña**: Mínimo 8 caracteres
- **Horarios**: Formato HH:mm (24 horas)
- **Localidades**: Deben existir en la base de datos
- **Empresas**: Se puede enviar CUIT (string) y se buscará automáticamente
- **Predios**: Se puede enviar nombre del predio (string) y se buscará automáticamente

### Manejo Inteligente de Referencias

La API maneja automáticamente las conversiones de strings a ObjectIds:

- **Localidades**: Envía el nombre → se busca por nombre (case insensitive)
- **Empresas**: Envía el CUIT → se busca por CUIT exacto
- **Predios**: Envía el nombre → se busca por nombre (case insensitive)

### Errores Comunes

- **400**: Datos inválidos o email/CUIT duplicado
- **400**: Localidad no encontrada
- **400**: Empresa con CUIT no encontrada
- **400**: Predio no encontrado
- **404**: Localidad no encontrada
- **500**: Error interno del servidor

### Headers requeridos

```text
Content-Type: application/json
```

### Fechas

Las fechas deben enviarse en formato ISO 8601:

```text
"2024-12-15T00:00:00.000Z"
```

### Para React

- Usar `try/catch` para manejo de errores
- Validar datos en el frontend antes de enviar
- Considerar estados de loading y error en la UI
- Almacenar IDs retornados para operaciones posteriores

---

## EJEMPLO COMPLETO EN REACT

```javascript
// Componente para crear empresa completa
const CreateCompanyFlow = () => {
  const [loading, setLoading] = useState(false);

  const handleCreateCompany = async (formData) => {
    setLoading(true);
    try {
      // 1. Crear usuario empresa
      const user = await createCompanyUser({
        email: formData.email,
        contraseña: formData.password,
        cuit: formData.cuit,
        razonSocial: formData.companyName,
        direccion: formData.address,
      });

      // 2. Crear predio
      const predio = await createPredio({
        nombrePredio: formData.predioName,
        direccion: formData.predioAddress,
        empresa: formData.cuit, // Usar CUIT en lugar de ObjectId
        horarios: formData.schedules,
      });

      // 3. Crear cancha
      const cancha = await createCancha({
        cantJugadores: formData.playersCount,
        tipoPiso: formData.floorType,
        predio: formData.predioName, // Usar nombre del predio en lugar de ObjectId
        disponibilidad: formData.availability,
      });

      console.log("Empresa, predio y cancha creados exitosamente");
    } catch (error) {
      console.error("Error en el flujo:", error);
    } finally {
      setLoading(false);
    }
  };
};
```
