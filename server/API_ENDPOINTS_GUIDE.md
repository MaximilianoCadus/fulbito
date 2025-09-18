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

#### Datos requeridos

```json
{
  "email": "string",
  "contraseña": "string (min 8 caracteres)",
  "nombre": "string",
  "apellido": "string",
  "nroCelular": "string"
}
```

#### Ejemplo Postman

```json
{
  "email": "juan.perez@gmail.com",
  "contraseña": "miPassword123",
  "nombre": "Juan",
  "apellido": "Pérez",
  "nroCelular": "1123456789"
}
```

#### Respuesta exitosa (201)

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

#### Implementación React

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

#### Datos requeridos para Usuario Empresa

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

#### Ejemplo Postman Empresa

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

#### Implementación React Empresa

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

### 1.3 Otras Operaciones de Usuarios

> 🔄 **Próximamente:** Documentación completa para:
>
> - **GET** `/api/users` - Listar todos los usuarios
> - **GET** `/api/users/{id}` - Obtener usuario por ID
> - **PUT** `/api/users/{id}` - Actualizar usuario
> - **DELETE** `/api/users/{id}` - Eliminar usuario
> - **POST** `/api/users/login` - Autenticación de usuario

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

#### Ejemplo Postman Predio

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

#### Implementación React Predio

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

### 2.2 Otras Operaciones de Predios

> 🔄 **Próximamente:** Documentación completa para:
>
> - **GET** `/api/predios` - Listar todos los predios
> - **GET** `/api/predios/{id}` - Obtener predio por ID
> - **GET** `/api/predios/empresa/{empresaId}` - Obtener predios por empresa
> - **PUT** `/api/predios/{id}` - Actualizar predio
> - **DELETE** `/api/predios/{id}` - Eliminar predio

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

#### Ejemplo Postman Cancha

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

#### Implementación React Cancha

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

### 3.2 Otras Operaciones de Canchas

> 🔄 **Próximamente:** Documentación completa para:
>
> - **GET** `/api/canchas` - Listar todas las canchas
> - **GET** `/api/canchas/{id}` - Obtener cancha por ID
> - **GET** `/api/canchas/predio/{predioId}` - Obtener canchas por predio
> - **GET** `/api/canchas/disponibles` - Buscar canchas disponibles
> - **PUT** `/api/canchas/{id}` - Actualizar cancha
> - **DELETE** `/api/canchas/{id}` - Eliminar cancha

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

#### Ejemplo Postman Reserva

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

#### Implementación React Reserva

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

### 4.2 Otras Operaciones de Reservas

> 🔄 **Próximamente:** Documentación completa para:
>
> - **GET** `/api/reservas` - Listar todas las reservas
> - **GET** `/api/reservas/{id}` - Obtener reserva por ID
> - **GET** `/api/reservas/jugador/{jugadorId}` - Obtener reservas por jugador
> - **GET** `/api/reservas/cancha/{canchaId}` - Obtener reservas por cancha
> - **PUT** `/api/reservas/{id}` - Actualizar reserva
> - **PUT** `/api/reservas/{id}/confirmar` - Confirmar reserva
> - **PUT** `/api/reservas/{id}/cancelar` - Cancelar reserva
> - **DELETE** `/api/reservas/{id}` - Eliminar reserva

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
