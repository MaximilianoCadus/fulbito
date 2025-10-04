import React, { useState, useEffect } from "react";
import Button from "../components/Button";
import UserDropdown from "../components/UserDropdown";
import { Logo } from "../components";
import { empresaService, ApiError } from "../services";
import "./CompanyHomePage.css";

/**
 * Home page component for logged-in company users
 * Features predios and canchas management functionality
 * @param {Object} props - Component props
 * @param {function} props.onNavigate - Navigation handler function
 * @param {Object} [props.user] - Logged-in user data
 * @param {string} [props.message] - Optional message to display (e.g., for placeholder features)
 * @returns {JSX.Element} CompanyHomePage component
 */
const CompanyHomePage = ({ onNavigate, user, message }) => {
  // State for company data
  const [companyData, setCompanyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Stats state
  const [stats, setStats] = useState({
    totalPredios: 0,
    totalCanchas: 0,
    totalReservations: 0,
  });

  // Load company data on component mount
  useEffect(() => {
    const loadCompanyData = async () => {
      if (!user?.empresa) {
        setError("No se encontraron datos de la empresa");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        // Load company data
        const company = await empresaService.getEmpresaById(user.empresa._id);
        setCompanyData(company);

        // Reset stats since we're not showing predios/canchas anymore
        setStats({
          totalPredios: 0,
          totalCanchas: 0,
          totalReservations: 0,
        });
      } catch (err) {
        console.error("Failed to load company data:", err);
        setError(
          err instanceof ApiError
            ? err.getUserMessage()
            : "Error al cargar los datos de la empresa"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadCompanyData();
  }, [user]);

  // Handle logout
  const handleLogout = () => {
    console.log("Logging out...");
    if (onNavigate) onNavigate("welcome");
  };

  // Handle navigation from dropdown
  const handleNavigation = (page) => {
    console.log(`Navigating to: ${page}`);
    if (onNavigate) onNavigate(page);
  };

  // Format address for display
  const formatAddress = (direccion) => {
    if (!direccion) return "Dirección no disponible";
    const parts = [direccion.calle, direccion.altura];
    if (direccion.piso) parts.push(`Piso ${direccion.piso}`);
    if (direccion.dpto) parts.push(`Dpto ${direccion.dpto}`);
    return parts.filter(Boolean).join(" ");
  };

  if (isLoading) {
    return (
      <main className="company-home-page">
        <header className="company-home-header">
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

        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando datos de la empresa...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="company-home-page">
        <header className="company-home-header">
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

        <div className="error-container">
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <h2>Error</h2>
            <p>{error}</p>
            <Button
              variant="primary"
              onClick={() => window.location.reload()}
              className="retry-button">
              Intentar nuevamente
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="company-home-page">
      {/* Header */}
      <header className="company-home-header">
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

      <div className="company-home-container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="company-welcome">
              <span className="company-icon">🏢</span>
              <h2 className="hero-title">{user?.empresa?.razonSocial}</h2>
              <p className="hero-description">
                Gestiona tus predios, canchas y reservas desde tu panel de
                control empresarial
              </p>
            </div>
          </div>
        </section>

        {/* Message Section - for temporary notifications */}
        {message && (
          <section className="message-section">
            <div className="message-card">
              <div className="message-icon">ℹ️</div>
              <p className="message-text">{message}</p>
            </div>
          </section>
        )}

        {/* Stats Section */}
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🏟️</div>
              <div className="stat-content">
                <span className="stat-number">{stats.totalPredios}</span>
                <span className="stat-label">
                  {stats.totalPredios === 1 ? "Predio" : "Predios"}
                </span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⚽</div>
              <div className="stat-content">
                <span className="stat-number">{stats.totalCanchas}</span>
                <span className="stat-label">
                  {stats.totalCanchas === 1 ? "Cancha" : "Canchas"}
                </span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <span className="stat-number">{stats.totalReservations}</span>
                <span className="stat-label">
                  {stats.totalReservations === 1 ? "Reserva" : "Reservas"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Company Information */}
        <section className="company-info-section">
          <div className="section-header">
            <h3 className="section-title">Información de la Empresa</h3>
          </div>

          <div className="company-info-card">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">🏢 Razón Social:</span>
                <span className="info-value">
                  {companyData?.razonSocial || "No especificado"}
                </span>
              </div>

              <div className="info-item">
                <span className="info-label">📋 CUIT:</span>
                <span className="info-value">
                  {companyData?.cuit || "No especificado"}
                </span>
              </div>

              <div className="info-item">
                <span className="info-label">📍 Dirección:</span>
                <span className="info-value">
                  {formatAddress(companyData?.direccion)}
                </span>
              </div>

              {companyData?.direccion?.localidad && (
                <div className="info-item">
                  <span className="info-label">🌆 Localidad:</span>
                  <span className="info-value">
                    {typeof companyData.direccion.localidad === "string"
                      ? companyData.direccion.localidad
                      : companyData.direccion.localidad.nombre}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default CompanyHomePage;
