// Configuración de la API
const API_BASE_URL = "http://localhost:5000/api";

// Cliente HTTP con manejo de errores
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
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

      if (response.status === 204) {
        return null;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.error || `HTTP ${response.status}`,
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Errores de red
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new ApiError(
          "Error de conexión. Verifica que el servidor esté funcionando.",
          0,
          "Network error"
        );
      }

      throw new ApiError(
        "Error inesperado al comunicarse con el servidor",
        0,
        error.message
      );
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }
}

class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }

  get data() {
    return this.details;
  }

  isValidationError() {
    return this.status === 400;
  }

  isConflictError() {
    return this.status === 409 || this.message.includes("ya está registrado");
  }

  isNetworkError() {
    return this.status === 0;
  }

  getUserMessage() {
    if (this.isNetworkError()) {
      return "Error de conexión. Verifica tu conexión a internet.";
    }

    if (this.isConflictError()) {
      return "El email ya está registrado. Intenta con otro email.";
    }

    if (this.isValidationError()) {
      return this.message || "Error en los datos proporcionados.";
    }

    return this.message || "Error inesperado. Intenta nuevamente.";
  }
}

const apiClient = new ApiClient();

export { apiClient, ApiError };
