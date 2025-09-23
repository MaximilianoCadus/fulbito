import { apiClient } from "./apiClient";

/**
 * User authentication and registration service
 */
export const userService = {
  /**
   * Login user
   * @param {Object} loginData - Login credentials
   * @param {string} loginData.email - User email
   * @param {string} loginData.contraseña - User password
   * @returns {Promise<Object>} User data and login result
   */
  async login(loginData) {
    return apiClient.post("/users/login", loginData);
  },

  /**
   * Register a new player user
   * @param {Object} playerData - Player registration data
   * @param {string} playerData.email - User email
   * @param {string} playerData.contraseña - User password
   * @param {string} playerData.nombre - Player first name
   * @param {string} playerData.apellido - Player last name
   * @param {string} playerData.nroCelular - Player phone number
   * @returns {Promise<Object>} Created user with player profile
   */
  async registerPlayer(playerData) {
    return apiClient.post("/users/complete/jugador", playerData);
  },

  /**
   * Register a new company user
   * @param {Object} companyData - Company registration data
   * @param {string} companyData.email - User email
   * @param {string} companyData.contraseña - User password
   * @param {string} companyData.cuit - Company CUIT
   * @param {string} companyData.razonSocial - Company name
   * @param {Object} companyData.direccion - Company address
   * @returns {Promise<Object>} Created user with company profile
   */
  async registerCompany(companyData) {
    return apiClient.post("/users/complete/empresa", companyData);
  },

  /**
   * Get all users
   * @returns {Promise<Array>} List of users
   */
  async getAllUsers() {
    return apiClient.get("/users");
  },

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User data
   */
  async getUserById(userId) {
    return apiClient.get(`/users/${userId}`);
  },

  /**
   * Update user
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user data
   */
  async updateUser(userId, updateData) {
    return apiClient.put(`/users/${userId}`, updateData);
  },

  /**
   * Delete user
   * @param {string} userId - User ID
   * @returns {Promise<null>} No content response
   */
  async deleteUser(userId) {
    return apiClient.delete(`/users/${userId}`);
  },
};

/**
 * Location service for address validation
 */
export const locationService = {
  /**
   * Get all localities
   * @returns {Promise<Array>} List of localities
   */
  async getAllLocalidades() {
    return apiClient.get("/localidades");
  },

  /**
   * Search localities by name
   * @param {string} query - Search query
   * @returns {Promise<Array>} Matching localities
   */
  async searchLocalidadesByName(query) {
    return apiClient.get(
      `/localidades/search/nombre?q=${encodeURIComponent(query)}`
    );
  },

  /**
   * Get locality by postal code
   * @param {string} cp - Postal code
   * @returns {Promise<Object>} Locality data
   */
  async getLocalidadByCP(cp) {
    return apiClient.get(`/localidades/cp/${cp}`);
  },

  /**
   * Get locality by ID
   * @param {string} localidadId - Locality ID
   * @returns {Promise<Object>} Locality data
   */
  async getLocalidadById(localidadId) {
    return apiClient.get(`/localidades/${localidadId}`);
  },
};

/**
 * Health check service
 */
export const healthService = {
  /**
   * Check API health
   * @returns {Promise<Object>} Health status
   */
  async checkHealth() {
    try {
      // Try to get users endpoint as a health check
      await apiClient.get("/users");
      return { status: "healthy", timestamp: new Date().toISOString() };
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  },
};
