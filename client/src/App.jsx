import React, { useState } from "react";
import WelcomePage from "./pages/WelcomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import PlayerHomePage from "./pages/PlayerHomePage";
import PlayerReservationsPage from "./pages/PlayerReservationsPage";
import PlayerProfilePage from "./pages/PlayerProfilePage";
import CompanyProfilePage from "./pages/CompanyProfilePage";
import CourtDetailsPage from "./pages/CourtDetailsPage";
import CompanyHomePage from "./pages/CompanyHomePage";
import VenueManagementPage from "./pages/VenueManagementPage";
import VenueHomePage from "./pages/VenueHomePage";
import VenueCourtManagementPage from "./pages/VenueCourtManagementPage";
import VenueReservationManagementPage from "./pages/VenueReservationManagementPage";
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
  const [selectedCourt, setSelectedCourt] = useState(null);

  // Handle page navigation
  const navigateToPage = (page, userData = null, courtData = null) => {
    setCurrentPage(page);

    // If user data is provided (from successful login), store it
    if (userData) {
      setCurrentUser(userData);
    }

    // If court data is provided (for court details), store it
    if (courtData) {
      setSelectedCourt(courtData);
    }

    // Clear user data when navigating to auth pages
    if (page === "welcome" || page === "login" || page === "register") {
      setCurrentUser(null);
      setSelectedCourt(null);
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
    } else if (userData.tipoUsuario === "predio") {
      setCurrentPage("venue-home");
    } else {
      setCurrentPage("player-home"); // Default fallback
    }
  };

  // Handle user data updates (e.g., from profile edits)
  const handleUserUpdate = (updatedUserData) => {
    setCurrentUser(updatedUserData);
  };

  // Render current page
  const renderCurrentPage = () => {
    switch (currentPage) {
      case "welcome":
      case "home":
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
      case "venue-management":
        return (
          <VenueManagementPage onNavigate={navigateToPage} user={currentUser} />
        );
      case "profile":
        // Route to appropriate profile page based on user type
        if (currentUser?.tipoUsuario === "empresa") {
          return (
            <CompanyProfilePage
              onNavigate={navigateToPage}
              user={currentUser}
              onUserUpdate={handleUserUpdate}
            />
          );
        } else {
          return (
            <PlayerProfilePage
              onNavigate={navigateToPage}
              user={currentUser}
              onUserUpdate={handleUserUpdate}
            />
          );
        }
      case "court-details":
        return (
          <CourtDetailsPage
            onNavigate={navigateToPage}
            user={currentUser}
            court={selectedCourt}
          />
        );
      case "company-home":
        return (
          <CompanyHomePage onNavigate={navigateToPage} user={currentUser} />
        );
      case "venue-home":
        return <VenueHomePage onNavigate={navigateToPage} user={currentUser} />;
      case "venue-courts":
        return (
          <VenueCourtManagementPage
            onNavigate={navigateToPage}
            user={currentUser}
          />
        );
      case "venue-reservations":
        return (
          <VenueReservationManagementPage
            onNavigate={navigateToPage}
            user={currentUser}
          />
        );
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
