import React from "react";
import "./CourtCard.css";

/**
 * Court card component for displaying court information in search results
 * @param {Object} props - Component props
 * @param {Object} props.court - Court data object
 * @param {function} [props.onSelect] - Handler for court selection
 * @returns {JSX.Element} CourtCard component
 */
const CourtCard = ({ court, onSelect }) => {
  // Format floor type for display
  const formatFloorType = (tipoPiso) => {
    switch (tipoPiso) {
      case "sintetico":
        return "Sintético";
      case "cesped":
        return "Césped";
      case "salon":
        return "Salón";
      default:
        return tipoPiso;
    }
  };

  // Get floor type icon
  const getFloorIcon = (tipoPiso) => {
    switch (tipoPiso) {
      case "sintetico":
        return "🏟️";
      case "cesped":
        return "🌱";
      case "salon":
        return "🏢";
      default:
        return "⚽";
    }
  };

  // Format player count
  const formatPlayerCount = (count) => {
    return `${count} jugadores`;
  };

  // Get venue name from predio
  const venueName = court.predio?.nombrePredio || "Predio no especificado";

  // Get venue address
  const venueAddress = court.predio?.direccion
    ? `${court.predio.direccion.calle} ${court.predio.direccion.altura}`
    : "Dirección no disponible";

  // Check if court has availability
  const hasAvailability =
    court.disponibilidad && court.disponibilidad.length > 0;
  const nextAvailable = hasAvailability ? court.disponibilidad[0] : null;

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(court);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <div
      className="court-card"
      onClick={handleCardClick}
      onKeyPress={handleKeyPress}
      tabIndex={0}
      role="button"
      aria-label={`Cancha de ${formatPlayerCount(
        court.cantJugadores
      )} en ${venueName}`}>
      <div className="court-card-header">
        <div className="court-type-info">
          <span className="court-icon" aria-hidden="true">
            {getFloorIcon(court.tipoPiso)}
          </span>
          <div className="court-details">
            <h3 className="court-title">
              Cancha de {formatPlayerCount(court.cantJugadores)}
            </h3>
            <p className="court-floor-type">
              {formatFloorType(court.tipoPiso)}
            </p>
          </div>
        </div>
        <div className="court-status">
          {hasAvailability ? (
            <span className="status-available">Disponible</span>
          ) : (
            <span className="status-unavailable">Sin disponibilidad</span>
          )}
        </div>
      </div>

      <div className="court-venue-info">
        <h4 className="venue-name">📍 {venueName}</h4>
        <p className="venue-address">{venueAddress}</p>
      </div>

      {hasAvailability && nextAvailable && (
        <div className="court-availability">
          <h5 className="availability-title">Próximo horario disponible:</h5>
          <div className="availability-info">
            <span className="availability-date">
              📅 {new Date(nextAvailable.fecha).toLocaleDateString("es-AR")}
            </span>
            <span className="availability-time">🕐 {nextAvailable.hora}</span>
            <span className="availability-price">
              💰 ${nextAvailable.precio}
            </span>
          </div>
        </div>
      )}

      <div className="court-card-footer">
        <button
          className="court-action-button"
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}>
          Ver detalles
        </button>
      </div>
    </div>
  );
};

export default CourtCard;
