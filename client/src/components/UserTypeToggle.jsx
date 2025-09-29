import React from "react";
import Logo from "./Logo";
import "./UserTypeToggle.css";

/**
 * User type toggle component for switching between player and company registration
 * @param {Object} props - UserTypeToggle props
 * @param {string} props.selectedType - Currently selected user type ('jugador' or 'empresa')
 * @param {function} props.onTypeChange - Handler for type change
 * @param {boolean} props.disabled - Whether toggle is disabled
 * @returns {JSX.Element} UserTypeToggle component
 */
const UserTypeToggle = ({ selectedType, onTypeChange, disabled = false }) => {
  const handleToggleChange = (type) => {
    if (!disabled && type !== selectedType) {
      onTypeChange(type);
    }
  };

  return (
    <div className="user-type-toggle">
      <div className="user-type-toggle__label">
        Tipo de cuenta
        <span className="user-type-toggle__required">*</span>
      </div>
      <div className="user-type-toggle__container">
        <button
          type="button"
          className={`user-type-toggle__option ${
            selectedType === "jugador" ? "user-type-toggle__option--active" : ""
          }`}
          onClick={() => handleToggleChange("jugador")}
          disabled={disabled}
          aria-pressed={selectedType === "jugador"}>
          <div className="user-type-toggle__icon">
            <Logo size="24" />
          </div>
          <div className="user-type-toggle__text">
            <div className="user-type-toggle__title">Jugador</div>
            <div className="user-type-toggle__description">
              Para reservar canchas y jugar partidos
            </div>
          </div>
        </button>

        <button
          type="button"
          className={`user-type-toggle__option ${
            selectedType === "empresa" ? "user-type-toggle__option--active" : ""
          }`}
          onClick={() => handleToggleChange("empresa")}
          disabled={disabled}
          aria-pressed={selectedType === "empresa"}>
          <div className="user-type-toggle__icon">🏢</div>
          <div className="user-type-toggle__text">
            <div className="user-type-toggle__title">Empresa</div>
            <div className="user-type-toggle__description">
              Para administrar predios y canchas
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default UserTypeToggle;
