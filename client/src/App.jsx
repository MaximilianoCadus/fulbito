import React, { useState } from "react";
import WelcomePage from "./pages/WelcomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import { NetworkStatus } from "./components";
import "./App.css";

/**
 * Main App component for the Fulbito application
 * Handles basic page navigation between welcome and register pages
 * @returns {JSX.Element} App component
 */
function App() {
  const [currentPage, setCurrentPage] = useState("welcome");

  // Handle page navigation
  const navigateToPage = (page) => {
    setCurrentPage(page);
  };

  // Render current page
  const renderCurrentPage = () => {
    switch (currentPage) {
      case "welcome":
        return <WelcomePage onNavigate={navigateToPage} />;
      case "register":
        return <RegisterPage onNavigate={navigateToPage} />;
      case "login":
        return <LoginPage onNavigate={navigateToPage} />;
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
