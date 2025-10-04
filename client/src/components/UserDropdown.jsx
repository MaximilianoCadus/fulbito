import React, { useState, useRef, useEffect } from "react";
import "./UserDropdown.css";

/**
 * User dropdown menu component
 * Provides navigation options for logged-in users including profile, reservations, and logout
 * @param {Object} props - Component props
 * @param {Object} [props.user] - User data object
 * @param {function} props.onNavigate - Navigation handler function
 * @param {function} props.onLogout - Logout handler function
 * @returns {JSX.Element} UserDropdown component
 */
const UserDropdown = ({ user, onNavigate, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Get user display name based on user type
  const userName =
    user?.jugador?.nombre ||
    user?.empresa?.razonSocial ||
    user?.predio?.nombrePredio ||
    user?.email?.split("@")[0] ||
    "Usuario";

  // Handle clicking outside dropdown to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle escape key to close dropdown
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      return () => {
        document.removeEventListener("keydown", handleEscapeKey);
      };
    }
  }, [isOpen]);

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Handle menu item clicks
  const handleMenuClick = (action) => {
    setIsOpen(false);

    switch (action) {
      case "home":
        console.log("Navigate to home");
        if (onNavigate) onNavigate("home");
        break;
      case "search":
        console.log("Navigate to court search");
        if (onNavigate) onNavigate("player-home");
        break;
      case "company-home":
        console.log("Navigate to company home");
        if (onNavigate) onNavigate("company-home");
        break;
      case "dashboard":
        console.log("Navigate to company dashboard");
        if (onNavigate) onNavigate("company-home");
        break;
      case "venue-management":
        console.log("Navigate to venue management");
        if (onNavigate) onNavigate("venue-management");
        break;
      case "venue-home":
        console.log("Navigate to venue home");
        if (onNavigate) onNavigate("venue-home");
        break;
      case "venue-courts":
        console.log("Navigate to venue courts");
        if (onNavigate) onNavigate("venue-courts");
        break;
      case "venue-reservations":
        console.log("Navigate to venue reservations");
        if (onNavigate) onNavigate("venue-reservations");
        break;
      case "venue-profile":
        console.log("Navigate to venue profile");
        if (onNavigate) onNavigate("venue-profile");
        break;
      case "reservations":
        console.log("Navigate to reservations");
        if (onNavigate) onNavigate("reservations");
        break;
      case "profile":
        console.log("Navigate to profile");
        if (onNavigate) onNavigate("profile");
        break;
      case "logout":
        if (onLogout) onLogout();
        break;
      default:
        break;
    }
  };

  return (
    <div className="user-dropdown" ref={dropdownRef}>
      <button
        className="dropdown-trigger"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Menú de usuario">
        <span className="user-name">¡Hola, {userName}!</span>
        <span className="dropdown-icon">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="dropdown-menu" role="menu">
          {user?.empresa ? (
            // Company user menu
            <>
              <button
                className="dropdown-item"
                onClick={() => handleMenuClick("company-home")}
                role="menuitem">
                <span className="item-icon">🏠</span>
                <span className="item-text">Inicio</span>
              </button>

              <button
                className="dropdown-item"
                onClick={() => handleMenuClick("venue-management")}
                role="menuitem">
                <span className="item-icon">🏟️</span>
                <span className="item-text">Gestión de predios</span>
              </button>

              <button
                className="dropdown-item"
                onClick={() => handleMenuClick("profile")}
                role="menuitem">
                <span className="item-icon">👤</span>
                <span className="item-text">Mi perfil</span>
              </button>
            </>
          ) : user?.predio ? (
            // Venue user menu
            <>
              <button
                className="dropdown-item"
                onClick={() => handleMenuClick("venue-home")}
                role="menuitem">
                <span className="item-icon">🏠</span>
                <span className="item-text">Inicio</span>
              </button>

              <button
                className="dropdown-item"
                onClick={() => handleMenuClick("venue-courts")}
                role="menuitem">
                <span className="item-icon">⚽</span>
                <span className="item-text">Mis Canchas</span>
              </button>

              <button
                className="dropdown-item"
                onClick={() => handleMenuClick("venue-reservations")}
                role="menuitem">
                <span className="item-icon">📅</span>
                <span className="item-text">Reservas</span>
              </button>
            </>
          ) : (
            // Player user menu
            <>
              <button
                className="dropdown-item"
                onClick={() => handleMenuClick("search")}
                role="menuitem">
                <span className="item-icon">🔍</span>
                <span className="item-text">Buscar canchas</span>
              </button>

              <button
                className="dropdown-item"
                onClick={() => handleMenuClick("reservations")}
                role="menuitem">
                <span className="item-icon">📅</span>
                <span className="item-text">Mis reservas</span>
              </button>

              <button
                className="dropdown-item"
                onClick={() => handleMenuClick("profile")}
                role="menuitem">
                <span className="item-icon">👤</span>
                <span className="item-text">Mi perfil</span>
              </button>
            </>
          )}

          <div className="dropdown-divider" />

          <button
            className="dropdown-item logout-item"
            onClick={() => handleMenuClick("logout")}
            role="menuitem">
            <span className="item-icon">🚪</span>
            <span className="item-text">Cerrar sesión</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
