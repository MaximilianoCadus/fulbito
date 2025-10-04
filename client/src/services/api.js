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
   * Change user password
   * @param {string} userId - User ID
   * @param {Object} passwordData - Password change data
   * @param {string} passwordData.currentPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @returns {Promise<Object>} Updated user data
   */
  async changePassword(userId, passwordData) {
    return apiClient.put(`/users/${userId}`, {
      contraseña: passwordData.newPassword,
    });
  },

  /**
   * Update jugador profile data
   * @param {string} jugadorId - Jugador ID
   * @param {Object} jugadorData - Jugador data to update
   * @param {string} [jugadorData.nombre] - First name
   * @param {string} [jugadorData.apellido] - Last name
   * @param {string} [jugadorData.nroCelular] - Phone number
   * @returns {Promise<Object>} Updated jugador data
   */
  async updateJugador(jugadorId, jugadorData) {
    return apiClient.put(`/jugadores/${jugadorId}`, jugadorData);
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
 * Court (Cancha) service for court search and management
 */
export const canchaService = {
  /**
   * Get all courts
   * @returns {Promise<Array>} List of courts
   */
  async getAllCanchas() {
    return apiClient.get("/canchas");
  },

  /**
   * Get court by ID
   * @param {string} canchaId - Court ID
   * @returns {Promise<Object>} Court data
   */
  async getCanchaById(canchaId) {
    return apiClient.get(`/canchas/${canchaId}`);
  },

  /**
   * Search courts by filters
   * @param {Object} filters - Search filters
   * @param {number} [filters.cantJugadores] - Number of players
   * @param {string} [filters.tipoPiso] - Floor type (sintetico, cesped, salon)
   * @param {string} [filters.predioId] - Venue ID
   * @returns {Promise<Array>} Filtered courts
   */
  async searchCanchas(filters = {}) {
    const queryParams = new URLSearchParams();

    if (filters.cantJugadores) {
      queryParams.append("cantJugadores", filters.cantJugadores.toString());
    }
    if (filters.tipoPiso) {
      queryParams.append("tipoPiso", filters.tipoPiso);
    }
    if (filters.predioId) {
      queryParams.append("predioId", filters.predioId);
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/canchas/search/filters?${queryString}`
      : "/canchas";

    return apiClient.get(endpoint);
  },

  /**
   * Search available courts by date and time
   * @param {string} fecha - Date (YYYY-MM-DD format)
   * @param {string} hora - Time (HH:MM format)
   * @returns {Promise<Array>} Available courts
   */
  async searchAvailableCanchas(fecha, hora) {
    const queryParams = new URLSearchParams({
      fecha,
      hora,
    });

    return apiClient.get(`/canchas/search/disponibles?${queryParams}`);
  },

  /**
   * Get courts by venue
   * @param {string} predioId - Venue ID
   * @returns {Promise<Array>} Courts in venue
   */
  async getCanchasByPredio(predioId) {
    return apiClient.get(`/canchas/predio/${predioId}`);
  },

  /**
   * Create a new court
   * @param {Object} canchaData - Court data
   * @param {number} canchaData.numero - Court number
   * @param {number} canchaData.cantJugadores - Player capacity (5, 6, 7, 8, 9, 11)
   * @param {string} canchaData.tipoPiso - Floor type (sintetico, cesped, salon)
   * @param {string} canchaData.predio - Venue ID
   * @returns {Promise<Object>} Created court
   */
  async createCancha(canchaData) {
    return apiClient.post("/canchas", canchaData);
  },

  /**
   * Update a court
   * @param {string} canchaId - Court ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated court
   */
  async updateCancha(canchaId, updateData) {
    return apiClient.put(`/canchas/${canchaId}`, updateData);
  },

  /**
   * Delete a court
   * @param {string} canchaId - Court ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteCancha(canchaId) {
    return apiClient.delete(`/canchas/${canchaId}`);
  },
};

/**
 * Company/Empresa service for business management
 */
export const empresaService = {
  /**
   * Get company data by CUIT
   * @param {string} cuit - Company CUIT
   * @returns {Promise<Object>} Company data with predios
   */
  async getEmpresaByCuit(cuit) {
    return apiClient.get(`/empresas/cuit/${cuit}`);
  },

  /**
   * Get company data by ID
   * @param {string} empresaId - Company ID
   * @returns {Promise<Object>} Company data with predios
   */
  async getEmpresaById(empresaId) {
    return apiClient.get(`/empresas/${empresaId}`);
  },

  /**
   * Update company data
   * @param {string} empresaId - Company ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated company data
   */
  async updateEmpresa(empresaId, updateData) {
    return apiClient.put(`/empresas/${empresaId}`, updateData);
  },
};

/**
 * Predio service for venue management
 */
export const predioService = {
  /**
   * Get all predios for a company
   * @param {string} empresaId - Company ID
   * @returns {Promise<Array>} List of predios with canchas
   */
  async getPrediosByEmpresa(empresaId) {
    return apiClient.get(`/predios/empresa/${empresaId}`);
  },

  /**
   * Get predio by ID
   * @param {string} predioId - Predio ID
   * @returns {Promise<Object>} Predio data with canchas
   */
  async getPredioById(predioId) {
    return apiClient.get(`/predios/${predioId}`);
  },

  /**
   * Create new predio
   * @param {Object} predioData - Predio data
   * @returns {Promise<Object>} Created predio
   */
  async createPredio(predioData) {
    return apiClient.post("/predios", predioData);
  },

  /**
   * Update predio
   * @param {string} predioId - Predio ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated predio
   */
  async updatePredio(predioId, updateData) {
    return apiClient.put(`/predios/${predioId}`, updateData);
  },

  /**
   * Delete predio
   * @param {string} predioId - Predio ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deletePredio(predioId) {
    return apiClient.delete(`/predios/${predioId}`);
  },

  /**
   * Add cancha to predio
   * @param {string} predioId - Predio ID
   * @param {Object} canchaData - Cancha data
   * @returns {Promise<Object>} Updated predio
   */
  async addCanchaToPredio(predioId, canchaData) {
    return apiClient.put(`/predios/${predioId}/canchas/add`, canchaData);
  },

  /**
   * Remove cancha from predio
   * @param {string} predioId - Predio ID
   * @param {string} canchaId - Cancha ID
   * @returns {Promise<Object>} Updated predio
   */
  async removeCanchaFromPredio(predioId, canchaId) {
    return apiClient.put(`/predios/${predioId}/canchas/remove`, { canchaId });
  },

  /**
   * Update predio credentials (email and password)
   * @param {string} predioId - Predio ID
   * @param {Object} credentialsData - { email, password }
   * @returns {Promise<Object>} Update confirmation
   */
  async updatePredioCredentials(predioId, credentialsData) {
    return apiClient.put(`/predios/${predioId}/credentials`, credentialsData);
  },
};

/**
 * Reservations service for booking management
 */
export const reservaService = {
  /**
   * Get all reservations for a specific player
   * @param {string} jugadorId - Player ID
   * @returns {Promise<Array>} List of player reservations
   */
  async getReservasByJugador(jugadorId) {
    return apiClient.get(`/reservas/jugador/${jugadorId}`);
  },

  /**
   * Get all reservations
   * @returns {Promise<Array>} List of all reservations
   */
  async getAllReservas() {
    return apiClient.get("/reservas");
  },

  /**
   * Get reservation by ID
   * @param {string} reservaId - Reservation ID
   * @returns {Promise<Object>} Reservation data
   */
  async getReservaById(reservaId) {
    return apiClient.get(`/reservas/${reservaId}`);
  },

  /**
   * Create a new reservation
   * @param {Object} reservaData - Reservation data
   * @param {string} reservaData.jugador - Player ID
   * @param {string} reservaData.cancha - Court ID
   * @param {Object} reservaData.fechaHora - Date and time object
   * @param {Date} reservaData.fechaHora.fecha - Reservation date
   * @param {string} reservaData.fechaHora.hora - Reservation time (HH:MM)
   * @param {number} reservaData.precioFinal - Final price
   * @param {string} [reservaData.estado] - Reservation status (defaults to "pendiente")
   * @returns {Promise<Object>} Created reservation
   */
  async createReserva(reservaData) {
    return apiClient.post("/reservas", reservaData);
  },

  /**
   * Update reservation
   * @param {string} reservaId - Reservation ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated reservation
   */
  async updateReserva(reservaId, updateData) {
    return apiClient.put(`/reservas/${reservaId}`, updateData);
  },

  /**
   * Confirm reservation
   * @param {string} reservaId - Reservation ID
   * @returns {Promise<Object>} Confirmed reservation
   */
  async confirmarReserva(reservaId) {
    return apiClient.put(`/reservas/${reservaId}/confirmar`);
  },

  /**
   * Cancel reservation
   * @param {string} reservaId - Reservation ID
   * @returns {Promise<Object>} Cancelled reservation
   */
  async cancelarReserva(reservaId) {
    return apiClient.put(`/reservas/${reservaId}/cancelar`);
  },

  /**
   * Get reservations for a specific court
   * @param {string} courtId - Court ID
   * @returns {Promise<Array>} List of court reservations
   */
  async getReservasByCancha(courtId) {
    return apiClient.get(`/reservas/cancha/${courtId}`);
  },

  /**
   * Delete reservation
   * @param {string} reservaId - Reservation ID
   * @returns {Promise<null>} No content response
   */
  async deleteReserva(reservaId) {
    return apiClient.delete(`/reservas/${reservaId}`);
  },

  /**
   * Get reservations by date
   * @param {string} fecha - Date (YYYY-MM-DD format)
   * @returns {Promise<Array>} Reservations for the specified date
   */
  async getReservasByFecha(fecha) {
    return apiClient.get(`/reservas/fecha/${fecha}`);
  },

  /**
   * Get reservations by status
   * @param {string} estado - Status (pendiente, confirmada, cancelada)
   * @returns {Promise<Array>} Reservations with the specified status
   */
  async getReservasByEstado(estado) {
    return apiClient.get(`/reservas/estado/${estado}`);
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
