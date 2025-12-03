import { apiClient } from "./apiClient";

// Servicios de autenticación y usuarios
export const userService = {
  async login(loginData) {
    return apiClient.post("/users/login", loginData);
  },

  async registerPlayer(playerData) {
    return apiClient.post("/users/complete/jugador", playerData);
  },

  async registerCompany(companyData) {
    return apiClient.post("/users/complete/empresa", companyData);
  },

  async getAllUsers() {
    return apiClient.get("/users");
  },

  async getUserById(userId) {
    return apiClient.get(`/users/${userId}`);
  },

  async updateUser(userId, updateData) {
    return apiClient.put(`/users/${userId}`, updateData);
  },

  async changePassword(userId, passwordData) {
    return apiClient.put(`/users/${userId}`, {
      contraseña: passwordData.newPassword,
    });
  },

  async updateJugador(jugadorId, jugadorData) {
    return apiClient.put(`/jugadores/${jugadorId}`, jugadorData);
  },

  async deleteUser(userId) {
    return apiClient.delete(`/users/${userId}`);
  },
};

// Servicios de localidades
export const locationService = {
  async getAllLocalidades() {
    return apiClient.get("/localidades");
  },

  async searchLocalidadesByName(query) {
    return apiClient.get(
      `/localidades/search/nombre?q=${encodeURIComponent(query)}`
    );
  },

  async getLocalidadByCP(cp) {
    return apiClient.get(`/localidades/cp/${cp}`);
  },

  async getLocalidadById(localidadId) {
    return apiClient.get(`/localidades/${localidadId}`);
  },
};

// Servicios de canchas
export const canchaService = {
  async getAllCanchas() {
    return apiClient.get("/canchas");
  },

  async getCanchaById(canchaId) {
    return apiClient.get(`/canchas/${canchaId}`);
  },

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

  async searchAvailableCanchas(fecha, hora) {
    const queryParams = new URLSearchParams({
      fecha,
      hora,
    });

    return apiClient.get(`/canchas/search/disponibles?${queryParams}`);
  },

  async getCanchasByPredio(predioId) {
    return apiClient.get(`/canchas/predio/${predioId}`);
  },

  async createCancha(canchaData) {
    return apiClient.post("/canchas", canchaData);
  },

  async updateCancha(canchaId, updateData) {
    return apiClient.put(`/canchas/${canchaId}`, updateData);
  },

  async deleteCancha(canchaId) {
    return apiClient.delete(`/canchas/${canchaId}`);
  },
};

// Servicios de empresas
export const empresaService = {
  async getEmpresaByCuit(cuit) {
    return apiClient.get(`/empresas/cuit/${cuit}`);
  },

  async getEmpresaById(empresaId) {
    return apiClient.get(`/empresas/${empresaId}`);
  },

  async updateEmpresa(empresaId, updateData) {
    return apiClient.put(`/empresas/${empresaId}`, updateData);
  },
};

// Servicios de predios
export const predioService = {
  async getPrediosByEmpresa(empresaId) {
    return apiClient.get(`/predios/empresa/${empresaId}`);
  },

  async getPredioById(predioId) {
    return apiClient.get(`/predios/${predioId}`);
  },

  async createPredio(predioData) {
    return apiClient.post("/predios", predioData);
  },

  async updatePredio(predioId, updateData) {
    return apiClient.put(`/predios/${predioId}`, updateData);
  },

  async deletePredio(predioId) {
    return apiClient.delete(`/predios/${predioId}`);
  },

  async addCanchaToPredio(predioId, canchaData) {
    return apiClient.put(`/predios/${predioId}/canchas/add`, canchaData);
  },

  async removeCanchaFromPredio(predioId, canchaId) {
    return apiClient.put(`/predios/${predioId}/canchas/remove`, { canchaId });
  },

  async updatePredioCredentials(predioId, credentialsData) {
    return apiClient.put(`/predios/${predioId}/credentials`, credentialsData);
  },
};

// Servicios de reservas
export const reservaService = {
  async getReservasByJugador(jugadorId) {
    return apiClient.get(`/reservas/jugador/${jugadorId}`);
  },

  async getAllReservas() {
    return apiClient.get("/reservas");
  },

  async getReservaById(reservaId) {
    return apiClient.get(`/reservas/${reservaId}`);
  },

  async createReserva(reservaData) {
    return apiClient.post("/reservas", reservaData);
  },

  async updateReserva(reservaId, updateData) {
    return apiClient.put(`/reservas/${reservaId}`, updateData);
  },

  async confirmarReserva(reservaId) {
    return apiClient.put(`/reservas/${reservaId}/confirmar`);
  },

  async cancelarReserva(reservaId) {
    return apiClient.put(`/reservas/${reservaId}/cancelar`);
  },

  async getReservasByCancha(courtId) {
    return apiClient.get(`/reservas/cancha/${courtId}`);
  },

  async deleteReserva(reservaId) {
    return apiClient.delete(`/reservas/${reservaId}`);
  },

  async getReservasByFecha(fecha) {
    return apiClient.get(`/reservas/fecha/${fecha}`);
  },

  async getReservasByEstado(estado) {
    return apiClient.get(`/reservas/estado/${estado}`);
  },
};

// Servicio de health check
export const healthService = {
  async checkHealth() {
    try {
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
