import React, { useState, useEffect } from "react";
import Button from "../components/Button";
import UserDropdown from "../components/UserDropdown";
import { Logo } from "../components";
import { predioService, ApiError } from "../services";
import "./VenueHomePage.css";

/**
 * Venue Home page component for predio users
 * Dashboard for venue owners to manage their sports facility
 * @param {Object} props - Component props
 * @param {function} props.onNavigate - Navigation handler function
 * @param {Object} [props.user] - Logged-in venue user data
 * @returns {JSX.Element} VenueHomePage component
 */
const VenueHomePage = ({ onNavigate, user }) => {
  const [venueData, setVenueData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Load venue data on component mount
  useEffect(() => {
    loadVenueData();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Load venue data for the logged-in predio user
   */
  const loadVenueData = async () => {
    if (!user?.predio?._id) {
      setError("No se encontraron datos del predio");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      // Get venue data
      const predioData = await predioService.getPredioById(user.predio._id);
      setVenueData(predioData);
    } catch (err) {
      console.error("Failed to load venue data:", err);
      setError("Error al cargar los datos del predio.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle navigation
   */
  const handleNavigation = (page) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    if (onNavigate) {
      onNavigate("welcome");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <main className="venue-home-page">
        <header className="venue-home-header">
          <div className="header-content">
            <div className="logo-section">
              <Logo size="32" className="logo-icon" />
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

        <div className="venue-home-container">
          <div className="loading-card">
            <div className="loading-spinner"></div>
            <p>Cargando información del predio...</p>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="venue-home-page">
        <header className="venue-home-header">
          <div className="header-content">
            <div className="logo-section">
              <Logo size="32" className="logo-icon" />
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

        <div className="venue-home-container">
          <div className="error-card">
            <div className="error-icon">⚠️</div>
            <h3>Error al cargar los datos</h3>
            <p>{error}</p>
            <Button
              variant="primary"
              onClick={loadVenueData}
              className="retry-button">
              Intentar nuevamente
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="venue-home-page">
      {/* Header */}
      <header className="venue-home-header">
        <div className="header-content">
          <div className="logo-section">
            <Logo size="32" className="logo-icon" />
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

      <div className="venue-home-container">
        {/* Welcome Section */}
        <section className="welcome-section">
          <div className="welcome-content">
            <div className="welcome-header">
              <div className="welcome-text">
                <h2>¡Bienvenido a tu Panel de Gestión!</h2>
                <p className="venue-name">{venueData?.nombrePredio}</p>
              </div>
            </div>
            <p className="welcome-description">
              Gestiona tu predio deportivo, controla reservas y mantén
              actualizada la información de tus canchas.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default VenueHomePage;
