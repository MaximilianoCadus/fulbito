import { userService, locationService, ApiError } from "../services";

/**
 * Development utilities for testing API integration
 */
export const devUtils = {
  /**
   * Test player registration with sample data
   */
  async testPlayerRegistration() {
    const testPlayerData = {
      email: `test.player.${Date.now()}@fulbito.com`,
      contraseña: "testPassword123",
      nombre: "Juan",
      apellido: "Pérez",
      nroCelular: "+5491123456789",
    };

    try {
      console.log("Testing player registration with:", testPlayerData);
      const result = await userService.registerPlayer(testPlayerData);
      console.log("Player registration successful:", result);
      return result;
    } catch (error) {
      console.error("Player registration failed:", error);
      if (error instanceof ApiError) {
        console.error("API Error details:", {
          message: error.message,
          status: error.status,
          details: error.details,
          userMessage: error.getUserMessage(),
        });
      }
      throw error;
    }
  },

  /**
   * Test company registration with sample data
   */
  async testCompanyRegistration() {
    const testCompanyData = {
      email: `test.company.${Date.now()}@fulbito.com`,
      contraseña: "testPassword123",
      cuit: "20" + Math.floor(Math.random() * 100000000) + "1", // Generate random valid CUIT
      razonSocial: "Fulbito Test SA",
      direccion: {
        calle: "Av. Corrientes",
        altura: "1234",
        piso: "5",
        dpto: "A",
        localidad: "Buenos Aires",
      },
    };

    try {
      console.log("Testing company registration with:", testCompanyData);
      const result = await userService.registerCompany(testCompanyData);
      console.log("Company registration successful:", result);
      return result;
    } catch (error) {
      console.error("Company registration failed:", error);
      if (error instanceof ApiError) {
        console.error("API Error details:", {
          message: error.message,
          status: error.status,
          details: error.details,
          userMessage: error.getUserMessage(),
        });
      }
      throw error;
    }
  },

  /**
   * Test API connectivity
   */
  async testConnection() {
    try {
      console.log("Testing API connection...");
      const localities = await locationService.getAllLocalidades();
      console.log(
        "API connection successful. Available localities:",
        localities.length
      );
      return { connected: true, localities };
    } catch (error) {
      console.error("API connection failed:", error);
      return { connected: false, error: error.message };
    }
  },

  /**
   * Get sample localities for testing
   */
  async getSampleLocalidades() {
    try {
      const localities = await locationService.getAllLocalidades();
      console.log("Available localities:", localities);
      return localities;
    } catch (error) {
      console.error("Failed to get localities:", error);
      return [];
    }
  },

  /**
   * Search for specific locality
   */
  async searchLocalidad(query) {
    try {
      const results = await locationService.searchLocalidadesByName(query);
      console.log(`Search results for "${query}":`, results);
      return results;
    } catch (error) {
      console.error("Failed to search localities:", error);
      return [];
    }
  },
};

// Make devUtils available globally in development
if (import.meta.env.DEV) {
  window.devUtils = devUtils;
}
