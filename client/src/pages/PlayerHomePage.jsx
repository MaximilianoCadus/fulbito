import React, { useState } from "react";
import Button from "../components/Button";
import FloorTypeSelect from "../components/FloorTypeSelect";
import PlayerCountSelect from "../components/PlayerCountSelect";
import CourtCard from "../components/CourtCard";
import UserDropdown from "../components/UserDropdown";
import { canchaService, ApiError } from "../services";
import "./PlayerHomePage.css";

/**
 * Home page component for logged-in player users
 * Features court search functionality with floor type and player count filters
 * @param {Object} props - Component props
 * @param {function} props.onNavigate - Navigation handler function
 * @param {Object} [props.user] - Logged-in user data
 * @returns {JSX.Element} PlayerHomePage component
 */
const PlayerHomePage = ({ onNavigate, user }) => {
  // Search form state
  const [searchFilters, setSearchFilters] = useState({
    tipoPiso: "",
    cantJugadores: "",
  });

  // Search results and loading states
  const [courts, setCourts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");

  // Handle input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle search form submission
  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setHasSearched(true);

    try {
      console.log("Searching courts with filters:", searchFilters);

      // Create filters object, excluding empty values
      const filters = {};
      if (searchFilters.tipoPiso) filters.tipoPiso = searchFilters.tipoPiso;
      if (searchFilters.cantJugadores)
        filters.cantJugadores = searchFilters.cantJugadores;

      const result = await canchaService.searchCanchas(filters);
      console.log("Search results:", result);
      setCourts(result);
    } catch (err) {
      console.error("Search failed:", err);

      if (err instanceof ApiError) {
        setError(err.getUserMessage());
      } else {
        setError("Error al buscar canchas. Por favor, intenta nuevamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchFilters({
      tipoPiso: "",
      cantJugadores: "",
    });
    setCourts([]);
    setHasSearched(false);
    setError("");
  };

  // Handle court selection
  const handleCourtSelect = (court) => {
    console.log("Court selected:", court);
    // TODO: Navigate to court details or booking page
    // For now, just log the selection
  };

  // Handle logout
  const handleLogout = () => {
    console.log("Logging out...");
    // TODO: Implement actual logout logic (clear session/tokens)
    if (onNavigate) onNavigate("welcome");
  };

  // Handle navigation from dropdown
  const handleNavigation = (page) => {
    console.log(`Navigating to: ${page}`);
    if (onNavigate) onNavigate(page);
  };

  return (
    <main className="player-home-page">
      {/* Header */}
      <header className="player-home-header">
        <div className="header-content">
          <div className="logo-section">
            <span className="logo-icon">⚽</span>
            <h1 className="logo-text">Fulbito!</h1>
          </div>

          <div className="user-section">
            <UserDropdown
              user={user}
              onNavigate={handleNavigation}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </header>

      <div className="player-home-container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h2 className="hero-title">Encuentra tu cancha perfecta</h2>
            <p className="hero-description">
              Busca y reserva canchas de fútbol que se adapten a tu equipo y
              preferencias
            </p>
          </div>
        </section>

        {/* Search Section */}
        <section className="search-section">
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-form-header">
              <h3 className="search-title">Buscar canchas</h3>
              <p className="search-subtitle">
                Filtra por tipo de piso y cantidad de jugadores
              </p>
            </div>

            <div className="search-filters">
              <div className="filter-row">
                <FloorTypeSelect
                  value={searchFilters.tipoPiso}
                  onChange={handleFilterChange}
                  disabled={isLoading}
                />

                <PlayerCountSelect
                  value={searchFilters.cantJugadores}
                  onChange={handleFilterChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="search-actions">
              <Button
                type="submit"
                variant="primary"
                size="large"
                disabled={isLoading}
                className="search-button">
                {isLoading ? "Buscando..." : "Buscar canchas"}
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="large"
                disabled={isLoading}
                onClick={handleClearSearch}
                className="clear-button">
                Limpiar filtros
              </Button>
            </div>
          </form>
        </section>

        {/* Results Section */}
        <section className="results-section">
          <div className="results-header">
            <h3 className="results-title">
              {!hasSearched
                ? "Usa los filtros para buscar canchas"
                : courts.length > 0
                ? `${courts.length} canchas encontradas`
                : error
                ? "Error al cargar canchas"
                : "No se encontraron canchas"}
            </h3>
          </div>

          {error && (
            <div className="error-message" role="alert">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {isLoading && (
            <div className="loading-message">
              <span className="loading-icon">⏳</span>
              Buscando canchas...
            </div>
          )}

          <div className="courts-grid">
            {courts.map((court) => (
              <CourtCard
                key={court._id}
                court={court}
                onSelect={handleCourtSelect}
              />
            ))}
          </div>

          {!isLoading && !error && courts.length === 0 && hasSearched && (
            <div className="empty-results">
              <span className="empty-icon">🏟️</span>
              <h4 className="empty-title">No se encontraron canchas</h4>
              <p className="empty-description">
                Intenta ajustar los filtros de búsqueda o realiza una búsqueda
                sin filtros para ver todas las canchas disponibles
              </p>
              <Button variant="secondary" onClick={handleClearSearch}>
                Limpiar filtros
              </Button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default PlayerHomePage;
