import React from "react";
import "./CourtCard.css";

/**
 * Court card component for displaying court information in search results
 * @param {Object} props - Component       {hasAvailability && (
        <div className="court-availability">
          {nextAvailable ? (
            <h5 className="availability-title">🕐 Próximo horario disponible:</h5>
          ) : (
            <h5 className="availability-title">📅 Horarios disponibles:</h5>
          )}    {hasAvailability && (
        <div className="court-availability">
          {nextAvailable ? (
            <h5 className="availability-title">🕐 Próximo horario disponible:</h5>
          ) : (
            <h5 className="availability-title">📅 Horarios disponibles:</h5>
          )}s
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

  // Get venue address with locality
  const getVenueAddress = () => {
    if (!court.predio?.direccion) {
      return "Dirección no disponible";
    }

    const { calle, altura, localidad } = court.predio.direccion;
    let address = `${calle} ${altura}`;

    // Add locality if available
    if (localidad) {
      const localidadName =
        typeof localidad === "string"
          ? localidad
          : localidad.nombre || localidad;
      address += `, ${localidadName}`;
    }

    return address;
  };

  const venueAddress = getVenueAddress();

  // Find the next available time slot (considering current date/time and reservations)
  const findNextAvailableSlot = () => {
    if (!court.disponibilidad || court.disponibilidad.length === 0) {
      return null;
    }

    const now = new Date();
    const currentDateStr = now.toISOString().split("T")[0];
    const currentHour = now.getHours();

    // Filter and sort available slots
    const availableSlots = court.disponibilidad
      .filter((slot) => {
        try {
          const slotDate = new Date(slot.fecha);
          const slotDateStr = slotDate.toISOString().split("T")[0];
          const slotHour = parseInt(slot.hora.split(":")[0]);

          // Only include future slots
          if (slotDateStr > currentDateStr) {
            return true; // Future dates are always valid
          } else if (slotDateStr === currentDateStr) {
            return slotHour > currentHour; // Today, only future hours
          }
          return false; // Past dates are invalid
        } catch (error) {
          console.error("Error processing slot:", slot, error);
          return false;
        }
      })
      .sort((a, b) => {
        // Sort by date first, then by time
        const dateComparison = new Date(a.fecha) - new Date(b.fecha);
        if (dateComparison !== 0) return dateComparison;
        return a.hora.localeCompare(b.hora);
      });

    return availableSlots.length > 0 ? availableSlots[0] : null;
  };

  const nextAvailable = findNextAvailableSlot();

  // Determine availability status
  // Since we're not checking against actual reservations in this view,
  // we should be more conservative about showing specific availability
  // Only show as "available" if there are future time slots
  const hasAvailability = nextAvailable !== null;

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
            <span className="status-unavailable">Ver disponibilidad</span>
          )}
        </div>
      </div>

      <div className="court-venue-info">
        <h4 className="venue-name">📍 {venueName}</h4>
        <p className="venue-address">{venueAddress}</p>
      </div>

      {hasAvailability && nextAvailable && (
        <div className="court-availability">
          <h5 className="availability-title">� Próximo horario disponible:</h5>
          <div className="availability-info">
            {nextAvailable ? (
              <>
                <span className="availability-date">
                  📅{" "}
                  {(() => {
                    const date = new Date(nextAvailable.fecha);
                    const today = new Date();
                    const tomorrow = new Date(today);
                    tomorrow.setDate(today.getDate() + 1);

                    if (date.toDateString() === today.toDateString()) {
                      return "Hoy";
                    } else if (
                      date.toDateString() === tomorrow.toDateString()
                    ) {
                      return "Mañana";
                    } else {
                      return date.toLocaleDateString("es-AR", {
                        weekday: "short",
                        day: "2-digit",
                        month: "2-digit",
                      });
                    }
                  })()}
                </span>
                <span className="availability-time">
                  🕐 {nextAvailable.hora}hs
                </span>
                <span className="availability-price">
                  💰 $
                  {nextAvailable.precio?.toLocaleString() ||
                    nextAvailable.precio}
                </span>
              </>
            ) : (
              <span className="availability-general">
                {court.disponibilidad && court.disponibilidad.length > 0
                  ? `${court.disponibilidad.length} horario${
                      court.disponibilidad.length !== 1 ? "s" : ""
                    } disponible${court.disponibilidad.length !== 1 ? "s" : ""}`
                  : "Ver horarios disponibles en los detalles"}
              </span>
            )}
          </div>
          {court.disponibilidad && court.disponibilidad.length > 1 && (
            <div className="additional-availability">
              <span className="additional-info">
                {nextAvailable
                  ? `+${
                      court.disponibilidad.length - 1
                    } horarios más disponibles`
                  : `Ver todos los horarios disponibles`}
                {(() => {
                  if (
                    !court.disponibilidad ||
                    court.disponibilidad.length === 0
                  )
                    return "";

                  const prices = court.disponibilidad
                    .map((slot) => slot.precio)
                    .filter((price) => price != null); // Filter out null/undefined prices

                  if (prices.length === 0) return "";

                  const minPrice = Math.min(...prices);
                  const maxPrice = Math.max(...prices);

                  if (minPrice !== maxPrice) {
                    return ` • Precios desde $${minPrice.toLocaleString()} hasta $${maxPrice.toLocaleString()}`;
                  }
                  return "";
                })()}
              </span>
            </div>
          )}
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
