/**
 * API configuration and base URL
 */
const API_BASE_URL = "http://localhost:5000/api";

/**
 * HTTP client wrapper with error handling
 */
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Makes an HTTP request with proper error handling
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Response data
   */
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

      // Handle different response statuses
      if (response.status === 204) {
        return null; // No content
      }

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.error || `HTTP ${response.status}`,
          response.status,
          data // Store the full error response data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Network or other errors
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

  /**
   * GET request
   */
  async get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  }

  /**
   * POST request
   */
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }
}

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }

  /**
   * Get the full error data from the API response
   */
  get data() {
    return this.details;
  }

  /**
   * Check if error is due to validation issues
   */
  isValidationError() {
    return this.status === 400;
  }

  /**
   * Check if error is due to conflict (e.g., email already exists)
   */
  isConflictError() {
    return this.status === 409 || this.message.includes("ya está registrado");
  }

  /**
   * Check if error is due to network issues
   */
  isNetworkError() {
    return this.status === 0;
  }

  /**
   * Get user-friendly error message
   */
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

// Create singleton instance
const apiClient = new ApiClient();

export { apiClient, ApiError };
