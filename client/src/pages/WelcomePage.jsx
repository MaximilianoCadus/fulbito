import React from "react";
import Button from "../components/Button";
import "./WelcomePage.css";

/**
 * Welcome page component for the Fulbito app
 * Features modern design with brand colors and Spanish UI text
 * @param {Object} props - Component props
 * @param {function} props.onNavigate - Navigation handler function
 * @returns {JSX.Element} Welcome page component
 */
const WelcomePage = ({ onNavigate }) => {
  // Handle login button click
  const handleLoginClick = () => {
    console.log("Navigating to login page");
    // TODO: Implement navigation to login page
    if (onNavigate) onNavigate("login");
  };

  // Handle register button click
  const handleRegisterClick = () => {
    console.log("Navigating to register page");
    if (onNavigate) onNavigate("register");
  };

  return (
    <main className="welcome-page">
      <div className="welcome-container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="logo-container">
              <div className="logo">
                <span className="logo-icon">⚽</span>
                <h1 className="logo-text">Fulbito!</h1>
              </div>
            </div>

            <div className="hero-text">
              <h2 className="hero-title">Reserva tu cancha favorita</h2>
              <p className="hero-description">
                La manera más fácil de encontrar y reservar canchas de fútbol
                cerca de ti. ¡Organiza tu partido perfecto en minutos!
              </p>
            </div>
          </div>
        </section>

        {/* Actions Section */}
        <section className="actions-section">
          <div className="actions-container">
            <h3 className="actions-title">¿Listo para jugar?</h3>
            <div className="actions-buttons">
              <Button
                variant="primary"
                size="large"
                onClick={handleLoginClick}
                className="action-button">
                Iniciar Sesión
              </Button>
              <Button
                variant="secondary"
                size="large"
                onClick={handleRegisterClick}
                className="action-button">
                Registrarse
              </Button>
            </div>
            <p className="actions-subtitle">
              Únete a miles de jugadores que ya reservan con Fulbito
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default WelcomePage;
