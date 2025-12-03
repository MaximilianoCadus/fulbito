import React from "react";
import Button from "./Button";
import Logo from "./Logo";
import "./ReservationCard.css";

const ReservationCard = ({ reservation, onConfirm, onCancel }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  const getStatusBadgeClass = (estado) => {
    switch (estado) {
      case "confirmada":
        return "status-badge status-confirmed";
      case "cancelada":
        return "status-badge status-cancelled";
      case "pendiente":
      default:
        return "status-badge status-pending";
    }
  };

  const getStatusText = (estado) => {
    switch (estado) {
      case "confirmada":
        return "Confirmada";
      case "cancelada":
        return "Cancelada";
      case "pendiente":
      default:
        return "Pendiente";
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price);
  };

  const getCourtName = (cancha) => {
    if (!cancha) return "Cancha no disponible";

    const floorType =
      cancha.tipoPiso === "sintetico"
        ? "Sintético"
        : cancha.tipoPiso === "cesped"
        ? "Césped"
        : cancha.tipoPiso === "salon"
        ? "Salón"
        : "Cancha";

    return `${floorType} ${cancha.cantJugadores || ""}`;
  };

  const getVenueName = (cancha) => {
    return cancha?.predio?.nombrePredio || "Predio sin nombre";
  };

  const canConfirm = reservation.estado === "pendiente";
  const canCancel =
    reservation.estado === "pendiente" || reservation.estado === "confirmada";

  return (
    <div className="reservation-card">
      <div className="reservation-header">
        <div className="court-info">
          <h3 className="court-name">{getCourtName(reservation.cancha)}</h3>
          <p className="venue-name">{getVenueName(reservation.cancha)}</p>
        </div>
        <div className={getStatusBadgeClass(reservation.estado)}>
          {getStatusText(reservation.estado)}
        </div>
      </div>

      <div className="reservation-details">
        <div className="detail-row">
          <span className="detail-icon">📅</span>
          <div className="detail-content">
            <span className="detail-label">Fecha:</span>
            <span className="detail-value">
              {formatDate(reservation.fechaHora.fecha)}
            </span>
          </div>
        </div>

        <div className="detail-row">
          <span className="detail-icon">🕐</span>
          <div className="detail-content">
            <span className="detail-label">Hora:</span>
            <span className="detail-value">
              {formatTime(reservation.fechaHora.hora)}
            </span>
          </div>
        </div>

        <div className="detail-row">
          <span className="detail-icon">
            <Logo size="16" />
          </span>
          <div className="detail-content">
            <span className="detail-label">Tipo de piso:</span>
            <span className="detail-value court-floor">
              {reservation.cancha?.tipoPiso === "sintetico" && "Sintético"}
              {reservation.cancha?.tipoPiso === "cesped" && "Césped"}
              {reservation.cancha?.tipoPiso === "salon" && "Salón"}
            </span>
          </div>
        </div>

        <div className="detail-row">
          <span className="detail-icon">👥</span>
          <div className="detail-content">
            <span className="detail-label">Jugadores:</span>
            <span className="detail-value">
              {reservation.cancha?.cantJugadores || "N/A"}
            </span>
          </div>
        </div>

        <div className="detail-row price-row">
          <span className="detail-icon">💰</span>
          <div className="detail-content">
            <span className="detail-label">Precio:</span>
            <span className="detail-value price">
              {formatPrice(reservation.precioFinal)}
            </span>
          </div>
        </div>

        {reservation.cancha?.direccion && (
          <div className="detail-row">
            <span className="detail-icon">📍</span>
            <div className="detail-content">
              <span className="detail-label">Ubicación:</span>
              <span className="detail-value address">
                {`${reservation.cancha.direccion.calle} ${
                  reservation.cancha.direccion.numero
                }, ${reservation.cancha.direccion.localidad?.nombre || "N/A"}`}
              </span>
            </div>
          </div>
        )}
      </div>

      {((canConfirm && onConfirm) || (canCancel && onCancel)) && (
        <div className="reservation-actions">
          {canConfirm && onConfirm && (
            <Button
              variant="primary"
              size="small"
              onClick={() => onConfirm(reservation)}
              className="action-button confirm-button">
              Confirmar
            </Button>
          )}

          {canCancel && onCancel && (
            <Button
              variant="danger"
              size="small"
              onClick={() => onCancel(reservation)}
              className="action-button cancel-button">
              Cancelar
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ReservationCard;
