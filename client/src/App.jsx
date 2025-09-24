import React, { useState } from "react";
import WelcomePage from "./pages/WelcomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import PlayerHomePage from "./pages/PlayerHomePage";
import PlayerReservationsPage from "./pages/PlayerReservationsPage";
import PlayerProfilePage from "./pages/PlayerProfilePage";
import { NetworkStatus } from "./components";
import "./App.css";

/**
 * Main App component for the Fulbito application
 * Handles basic page navigation and user authentication state
 * @returns {JSX.Element} App component
 */
function App() {
  const [currentPage, setCurrentPage] = useState("welcome");
  const [currentUser, setCurrentUser] = useState(null);

  // Handle page navigation
  const navigateToPage = (page, userData = null) => {
    setCurrentPage(page);

    // If user data is provided (from successful login), store it
    if (userData) {
      setCurrentUser(userData);
    }

    // Clear user data when navigating to auth pages
    if (page === "welcome" || page === "login" || page === "register") {
      setCurrentUser(null);
    }
  };

  // Handle successful login
  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);

    // Navigate based on user type
    if (userData.tipoUsuario === "jugador") {
      setCurrentPage("player-home");
    } else if (userData.tipoUsuario === "empresa") {
      setCurrentPage("company-home"); // TODO: Implement company home page
    } else {
      setCurrentPage("player-home"); // Default fallback
    }
  };

  // Render current page
  const renderCurrentPage = () => {
    switch (currentPage) {
      case "welcome":
        return <WelcomePage onNavigate={navigateToPage} />;
      case "register":
        return <RegisterPage onNavigate={navigateToPage} />;
      case "login":
        return (
          <LoginPage
            onNavigate={navigateToPage}
            onLoginSuccess={handleLoginSuccess}
          />
        );
      case "player-home":
        return (
          <PlayerHomePage onNavigate={navigateToPage} user={currentUser} />
        );
      case "reservations":
        return (
          <PlayerReservationsPage
            onNavigate={navigateToPage}
            user={currentUser}
          />
        );
      case "profile":
        return (
          <PlayerProfilePage onNavigate={navigateToPage} user={currentUser} />
        );
      case "company-home":
        // TODO: Implement CompanyHomePage
        return <WelcomePage onNavigate={navigateToPage} />;
      case "dashboard":
        // Handle legacy dashboard navigation
        if (currentUser?.tipoUsuario === "jugador") {
          return (
            <PlayerHomePage onNavigate={navigateToPage} user={currentUser} />
          );
        } else {
          return <WelcomePage onNavigate={navigateToPage} />;
        }
      default:
        return <WelcomePage onNavigate={navigateToPage} />;
    }
  };

  return (
    <div className="app">
      <NetworkStatus />
      {renderCurrentPage()}
    </div>
  );
}

export default App;
