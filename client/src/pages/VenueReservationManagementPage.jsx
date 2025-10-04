import React, { useState, useEffect, useCallback } from "react";
import { reservaService, canchaService, ApiError } from "../services";
import Button from "../components/Button";
import UserDropdown from "../components/UserDropdown";
import Logo from "../components/Logo";
import ConfirmationModal from "../components/ConfirmationModal";
import "./VenueReservationManagementPage.css";

/**
 * Venue Reservation Management Page
 * Allows venue users to view reservations for their courts
 * Users can select a court and see all reservations for that court
 */
const VenueReservationManagementPage = ({ user, onNavigate }) => {
  const [canchas, setCanchas] = useState([]);
  const [selectedCancha, setSelectedCancha] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingReservas, setLoadingReservas] = useState(false);
  const [error, setError] = useState(null);
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: null, // 'delete' or 'confirm'
    reservaId: null,
    reservaDetails: null,
  });

  /**
   * Load all courts for the venue
   */
  const loadCanchas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const predioId = user?.predio?._id;
      if (!predioId) {
        throw new Error("No se encontró el predio del usuario");
      }

      const data = await canchaService.getCanchasByPredio(predioId);
      setCanchas(data || []);
    } catch (err) {
      console.error("Failed to load canchas:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Error al cargar las canchas. Por favor, intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Load venue courts on mount
   */
  useEffect(() => {
    loadCanchas();
  }, [loadCanchas]);

  /**
   * Load reservations for a specific court
   */
  const loadReservasForCancha = async (canchaId) => {
    try {
      setLoadingReservas(true);
      setError(null);

      const data = await reservaService.getReservasByCancha(canchaId);
      setReservas(data || []);
    } catch (err) {
      console.error("Failed to load reservas:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          "Error al cargar las reservas. Por favor, intenta nuevamente."
        );
      }
      setReservas([]);
    } finally {
      setLoadingReservas(false);
    }
  };

  /**
   * Handle court selection
   */
  const handleSelectCancha = (cancha) => {
    setSelectedCancha(cancha);
    loadReservasForCancha(cancha._id);
  };

  /**
   * Handle navigation
   */
  const handleNavigation = (page) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    if (onNavigate) {
      onNavigate("logout");
    }
  };

  /**
   * Open delete confirmation modal
   */
  const handleDeleteReservation = (reserva) => {
    setActionModal({
      isOpen: true,
      type: "delete",
      reservaId: reserva._id,
      reservaDetails: `${formatDate(reserva.fechaHora.fecha)} a las ${
        reserva.fechaHora.hora
      }`,
    });
  };

  /**
   * Open confirm reservation modal
   */
  const handleConfirmReservation = (reserva) => {
    setActionModal({
      isOpen: true,
      type: "confirm",
      reservaId: reserva._id,
      reservaDetails: `${formatDate(reserva.fechaHora.fecha)} a las ${
        reserva.fechaHora.hora
      }`,
    });
  };

  /**
   * Open cancel reservation modal
   */
  const handleCancelReservation = (reserva) => {
    setActionModal({
      isOpen: true,
      type: "cancel",
      reservaId: reserva._id,
      reservaDetails: `${formatDate(reserva.fechaHora.fecha)} a las ${
        reserva.fechaHora.hora
      }`,
    });
  };

  /**
   * Close action modal
   */
  const handleCloseModal = () => {
    setActionModal({
      isOpen: false,
      type: null,
      reservaId: null,
      reservaDetails: null,
    });
  };

  /**
   * Perform the confirmed action (delete, confirm, or cancel)
   */
  const handlePerformAction = async () => {
    try {
      setError(null);

      if (actionModal.type === "delete") {
        await reservaService.deleteReserva(actionModal.reservaId);
      } else if (actionModal.type === "confirm") {
        await reservaService.confirmarReserva(actionModal.reservaId);
      } else if (actionModal.type === "cancel") {
        await reservaService.cancelarReserva(actionModal.reservaId);
      }

      // Reload reservations for the selected court
      if (selectedCancha) {
        await loadReservasForCancha(selectedCancha._id);
      }

      handleCloseModal();
    } catch (err) {
      console.error("Failed to perform action:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          `Error al ${
            actionModal.type === "delete"
              ? "eliminar"
              : actionModal.type === "confirm"
              ? "confirmar"
              : "cancelar"
          } la reserva. Por favor, intenta nuevamente.`
        );
      }
      handleCloseModal();
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  /**
   * Get status badge class
   */
  const getStatusClass = (estado) => {
    switch (estado) {
      case "confirmada":
        return "status-confirmed";
      case "pendiente":
        return "status-pending";
      case "cancelada":
        return "status-cancelled";
      default:
        return "";
    }
  };

  /**
   * Get status display text
   */
  const getStatusText = (estado) => {
    switch (estado) {
      case "confirmada":
        return "Confirmada";
      case "pendiente":
        return "Pendiente";
      case "cancelada":
        return "Cancelada";
      default:
        return estado;
    }
  };

  // Render loading state
  if (loading) {
    return (
      <main className="venue-reservation-management-page">
        <header className="venue-reservation-header">
          <div className="header-content">
            <div className="logo-section">
              <Logo />
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

        <div className="venue-reservation-container">
          <div className="loading-card">
            <div className="loading-spinner"></div>
            <p className="loading-text">Cargando canchas...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="venue-reservation-management-page">
      <header className="venue-reservation-header">
        <div className="header-content">
          <div className="logo-section">
            <Logo />
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

      <div className="venue-reservation-container">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-title-section">
            <h2 className="page-title">Reservas</h2>
            <p className="page-subtitle">
              Visualiza las reservas de {user?.predio?.nombrePredio}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* No Courts Message */}
        {!loading && canchas.length === 0 && (
          <div className="empty-state-card">
            <div className="empty-state-icon">⚽</div>
            <h3 className="empty-state-title">No hay canchas disponibles</h3>
            <p className="empty-state-text">
              Para ver reservas, primero debes crear canchas en la sección "Mis
              Canchas".
            </p>
            <Button
              variant="primary"
              onClick={() => handleNavigation("venue-courts")}>
              Ir a Mis Canchas
            </Button>
          </div>
        )}

        {/* Courts Selection & Reservations Display */}
        {canchas.length > 0 && (
          <>
            {/* Court Selection */}
            <div className="court-selection-section">
              <h3 className="section-title">Selecciona una cancha</h3>
              <div className="court-buttons-grid">
                {canchas.map((cancha) => (
                  <button
                    key={cancha._id}
                    onClick={() => handleSelectCancha(cancha)}
                    className={`court-select-button ${
                      selectedCancha?._id === cancha._id ? "selected" : ""
                    }`}>
                    <span className="court-icon">⚽</span>
                    <div className="court-info">
                      <span className="court-number">
                        Cancha {cancha.numero}
                      </span>
                      <span className="court-details">
                        {cancha.cantJugadores} jugadores • {cancha.tipoPiso}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Reservations Display */}
            {selectedCancha && (
              <div className="reservations-section">
                <div className="section-header">
                  <h3 className="section-title">
                    Reservas de Cancha {selectedCancha.numero}
                  </h3>
                  {!loadingReservas && reservas.length > 0 && (
                    <span className="reservations-count">
                      {reservas.length} reserva
                      {reservas.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* Loading Reservations */}
                {loadingReservas && (
                  <div className="loading-reservations">
                    <div className="loading-spinner small"></div>
                    <p className="loading-text">Cargando reservas...</p>
                  </div>
                )}

                {/* No Reservations */}
                {!loadingReservas && reservas.length === 0 && (
                  <div className="no-reservations-card">
                    <div className="no-reservations-icon">📅</div>
                    <p className="no-reservations-text">
                      No hay reservas para esta cancha
                    </p>
                  </div>
                )}

                {/* Reservations List */}
                {!loadingReservas && reservas.length > 0 && (
                  <div className="reservations-list">
                    {reservas.map((reserva) => (
                      <div key={reserva._id} className="reservation-card">
                        <div className="reservation-header">
                          <div className="reservation-date-time">
                            <span className="reservation-date">
                              📅 {formatDate(reserva.fechaHora.fecha)}
                            </span>
                            <span className="reservation-time">
                              🕐 {reserva.fechaHora.hora}
                            </span>
                          </div>
                          <span
                            className={`reservation-status ${getStatusClass(
                              reserva.estado
                            )}`}>
                            {getStatusText(reserva.estado)}
                          </span>
                        </div>

                        <div className="reservation-body">
                          <div className="reservation-info-row">
                            <span className="info-label">Jugador:</span>
                            <span className="info-value">
                              {reserva.jugador?.nombre
                                ? `${reserva.jugador.nombre} ${
                                    reserva.jugador.apellido || ""
                                  }`.trim()
                                : "N/A"}
                            </span>
                          </div>

                          {reserva.jugador?.nroCelular && (
                            <div className="reservation-info-row">
                              <span className="info-label">Teléfono:</span>
                              <span className="info-value">
                                {reserva.jugador.nroCelular}
                              </span>
                            </div>
                          )}

                          <div className="reservation-info-row">
                            <span className="info-label">Precio:</span>
                            <span className="info-value price">
                              ${reserva.precioFinal?.toLocaleString("es-AR")}
                            </span>
                          </div>
                        </div>

                        {/* Reservation Actions - Only show for non-cancelled reservations */}
                        {reserva.estado !== "cancelada" && (
                          <div className="reservation-actions">
                            {reserva.estado === "pendiente" && (
                              <Button
                                variant="primary"
                                size="small"
                                onClick={() =>
                                  handleConfirmReservation(reserva)
                                }>
                                ✓ Confirmar
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="small"
                              onClick={() => handleCancelReservation(reserva)}
                              className="cancel-reservation-button">
                              ✕ Cancelar
                            </Button>
                            <Button
                              variant="outline"
                              size="small"
                              onClick={() => handleDeleteReservation(reserva)}
                              className="delete-reservation-button">
                              🗑️ Eliminar
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Action Confirmation Modal */}
      <ConfirmationModal
        isOpen={actionModal.isOpen}
        onClose={handleCloseModal}
        onConfirm={handlePerformAction}
        title={
          actionModal.type === "delete"
            ? "Eliminar Reserva"
            : actionModal.type === "confirm"
            ? "Confirmar Reserva"
            : "Cancelar Reserva"
        }
        message={
          actionModal.type === "delete"
            ? `¿Estás seguro de que deseas eliminar permanentemente la reserva del ${actionModal.reservaDetails}? Esta acción no se puede deshacer y se perderá el registro.`
            : actionModal.type === "confirm"
            ? `¿Confirmar la reserva del ${actionModal.reservaDetails}?`
            : `¿Cancelar la reserva del ${actionModal.reservaDetails}? El registro se mantendrá en el historial como cancelada.`
        }
        confirmText={
          actionModal.type === "delete"
            ? "Eliminar"
            : actionModal.type === "confirm"
            ? "Confirmar"
            : "Cancelar Reserva"
        }
        cancelText="Volver"
        confirmVariant={actionModal.type === "delete" ? "danger" : "primary"}
      />
    </main>
  );
};

export default VenueReservationManagementPage;
