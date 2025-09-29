import React, { useState, useEffect, useCallback } from "react";
import Button from "../components/Button";
import ReservationCard from "../components/ReservationCard";
import UserDropdown from "../components/UserDropdown";
import ConfirmationModal from "../components/ConfirmationModal";
import { Logo } from "../components";
import { reservaService, ApiError } from "../services";
import "./PlayerReservationsPage.css";

/**
 * PlayerReservationsPage component to display all player's reservations
 * @param {Object} props - Component props
 * @param {function} props.onNavigate - Navigation handler function
 * @param {Object} [props.user] - Logged-in user data
 * @returns {JSX.Element} PlayerReservationsPage component
 */
const PlayerReservationsPage = ({ onNavigate, user }) => {
  console.log("PlayerReservationsPage component rendering with props:", {
    onNavigate,
    user,
  });

  // State for reservations and loading
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isProcessingExpired, setIsProcessingExpired] = useState(false);

  // Filter state
  const [activeFilter, setActiveFilter] = useState("all");

  // Modal state for cancellation confirmation
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  /**
   * Process reservations to automatically cancel expired pending ones
   * @param {Array} reservations - Array of reservations
   * @returns {Promise<Array>} - Processed reservations with expired ones cancelled
   */
  const processExpiredReservations = useCallback(async (reservations) => {
    const now = new Date();
    const updatedReservations = [];
    let expiredCount = 0;

    // Check how many reservations need to be cancelled
    const expiredReservations = reservations.filter((reservation) => {
      if (reservation.estado === "pendiente") {
        const reservationDateTime = new Date(reservation.fechaHora.fecha);
        const [hours, minutes] = reservation.fechaHora.hora.split(":");
        reservationDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return reservationDateTime < now;
      }
      return false;
    });

    if (expiredReservations.length > 0) {
      setIsProcessingExpired(true);
      console.log(
        `Processing ${expiredReservations.length} expired pending reservations...`
      );
    }

    for (const reservation of reservations) {
      // Check if reservation is past due and still pending
      if (reservation.estado === "pendiente") {
        const reservationDateTime = new Date(reservation.fechaHora.fecha);
        const [hours, minutes] = reservation.fechaHora.hora.split(":");
        reservationDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // If the reservation time has passed, automatically cancel it
        if (reservationDateTime < now) {
          try {
            console.log(
              `Auto-cancelling expired reservation: ${reservation._id}`
            );
            const updatedReservation = await reservaService.cancelarReserva(
              reservation._id
            );
            updatedReservations.push(updatedReservation);
            expiredCount++;
          } catch (error) {
            console.error(
              `Failed to auto-cancel reservation ${reservation._id}:`,
              error
            );
            // If cancellation fails, keep the original reservation
            updatedReservations.push(reservation);
          }
        } else {
          // Reservation is still valid, keep as is
          updatedReservations.push(reservation);
        }
      } else {
        // Reservation is not pending, keep as is
        updatedReservations.push(reservation);
      }
    }

    if (expiredCount > 0) {
      console.log(
        `Successfully auto-cancelled ${expiredCount} expired reservations`
      );
    }

    setIsProcessingExpired(false);
    return updatedReservations;
  }, []);

  // Load reservations on component mount
  useEffect(() => {
    const loadPlayerReservations = async () => {
      console.log("PlayerReservationsPage - User object:", user);
      console.log("PlayerReservationsPage - User.jugador:", user?.jugador);
      console.log(
        "PlayerReservationsPage - User.jugador._id:",
        user?.jugador?._id
      );

      if (!user?.jugador?._id) {
        console.error("No player ID found in user object");
        setError(
          "No se pudo identificar el jugador. Estructura del usuario: " +
            JSON.stringify(user)
        );
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        console.log("Loading reservations for player:", user.jugador._id);
        const result = await reservaService.getReservasByJugador(
          user.jugador._id
        );
        console.log("Reservations loaded:", result);

        // For now, skip the auto-cancellation processing to debug
        // const processedReservations = await processExpiredReservations(result);

        // Sort reservations by date (most recent first)
        const sortedReservations = result.sort((a, b) => {
          const dateA = new Date(a.fechaHora.fecha);
          const dateB = new Date(b.fechaHora.fecha);
          return dateB - dateA;
        });

        setReservations(sortedReservations);
      } catch (err) {
        console.error("Failed to load reservations:", err);

        if (err instanceof ApiError) {
          setError(err.getUserMessage());
        } else {
          setError(
            "Error al cargar las reservas. Por favor, intenta nuevamente."
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPlayerReservations();
  }, [user]);

  // Set up periodic check for expired reservations - TEMPORARILY DISABLED FOR DEBUGGING
  /*
  useEffect(() => {
    // Check every 60 seconds for expired reservations
    const intervalId = setInterval(async () => {
      if (reservations.length > 0) {
        const hasExpiredPending = reservations.some((reservation) => {
          if (reservation.estado === "pendiente") {
            const reservationDateTime = new Date(reservation.fechaHora.fecha);
            const [hours, minutes] = reservation.fechaHora.hora.split(":");
            reservationDateTime.setHours(
              parseInt(hours),
              parseInt(minutes),
              0,
              0
            );
            return reservationDateTime < new Date();
          }
          return false;
        });

        if (hasExpiredPending) {
          console.log("Found expired pending reservations, refreshing...");
          await loadReservations();
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [reservations, loadReservations]);
  */

  // Apply filter when reservations or filter changes
  useEffect(() => {
    const filterReservations = () => {
      let filtered = [...reservations];

      switch (activeFilter) {
        case "pending":
          filtered = reservations.filter((r) => r.estado === "pendiente");
          break;
        case "confirmed":
          filtered = reservations.filter((r) => r.estado === "confirmada");
          break;
        case "cancelled":
          filtered = reservations.filter((r) => r.estado === "cancelada");
          break;
        case "upcoming": {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          filtered = reservations.filter((r) => {
            const reservationDate = new Date(r.fechaHora.fecha);
            return reservationDate >= today && r.estado !== "cancelada";
          });
          break;
        }
        case "past": {
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          filtered = reservations.filter((r) => {
            const reservationDate = new Date(r.fechaHora.fecha);
            return reservationDate < now;
          });
          break;
        }
        case "all":
        default:
          // No filtering
          break;
      }

      setFilteredReservations(filtered);
    };

    filterReservations();
  }, [reservations, activeFilter]);

  /**
   * Load player's reservations from the API
   */
  const loadReservations = useCallback(async () => {
    if (!user?.jugador?._id) {
      setError("No se pudo identificar el jugador");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("Loading reservations for player:", user.jugador._id);
      const result = await reservaService.getReservasByJugador(
        user.jugador._id
      );
      console.log("Reservations loaded:", result);

      // Process reservations to auto-cancel past pending ones
      const processedReservations = await processExpiredReservations(result);

      // Sort reservations by date (most recent first)
      const sortedReservations = processedReservations.sort((a, b) => {
        const dateA = new Date(a.fechaHora.fecha);
        const dateB = new Date(b.fechaHora.fecha);
        return dateB - dateA;
      });

      setReservations(sortedReservations);
    } catch (err) {
      console.error("Failed to load reservations:", err);

      if (err instanceof ApiError) {
        setError(err.getUserMessage());
      } else {
        setError(
          "Error al cargar las reservas. Por favor, intenta nuevamente."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?.jugador?._id, processExpiredReservations]);

  /**
   * Handle reservation cancellation - show confirmation modal
   */
  const handleCancelReservation = (reservation) => {
    setReservationToCancel(reservation);
    setShowCancelModal(true);
  };

  /**
   * Confirm and execute reservation cancellation
   */
  const confirmCancelReservation = async () => {
    if (!reservationToCancel) return;

    setIsCancelling(true);

    try {
      console.log("Cancelling reservation:", reservationToCancel._id);
      await reservaService.cancelarReserva(reservationToCancel._id);

      // Reload reservations to get updated data
      await loadReservations();

      console.log("Reservation cancelled successfully");

      // Close modal and reset state
      setShowCancelModal(false);
      setReservationToCancel(null);
    } catch (err) {
      console.error("Failed to cancel reservation:", err);

      if (err instanceof ApiError) {
        setError(err.getUserMessage());
      } else {
        setError(
          "Error al cancelar la reserva. Por favor, intenta nuevamente."
        );
      }
    } finally {
      setIsCancelling(false);
    }
  };

  /**
   * Cancel the cancellation - close modal without action
   */
  const cancelCancelReservation = () => {
    setShowCancelModal(false);
    setReservationToCancel(null);
    setIsCancelling(false);
  };

  /**
   * Helper functions for formatting (used in modal)
   */
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    console.log("Logging out...");
    if (onNavigate) onNavigate("welcome");
  };

  /**
   * Handle navigation from dropdown
   */
  const handleNavigation = (page) => {
    console.log(`Navigating to: ${page}`);
    if (onNavigate) onNavigate(page);
  };

  /**
   * Get filter button class
   */
  const getFilterButtonClass = (filterType) => {
    return `filter-button ${activeFilter === filterType ? "active" : ""}`;
  };

  /**
   * Get filter count
   */
  const getFilterCount = (filterType) => {
    switch (filterType) {
      case "pending":
        return reservations.filter((r) => r.estado === "pendiente").length;
      case "confirmed":
        return reservations.filter((r) => r.estado === "confirmada").length;
      case "cancelled":
        return reservations.filter((r) => r.estado === "cancelada").length;
      case "upcoming": {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return reservations.filter((r) => {
          const reservationDate = new Date(r.fechaHora.fecha);
          return reservationDate >= today && r.estado !== "cancelada";
        }).length;
      }
      case "past": {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return reservations.filter((r) => {
          const reservationDate = new Date(r.fechaHora.fecha);
          return reservationDate < now;
        }).length;
      }
      case "all":
      default:
        return reservations.length;
    }
  };

  // Early debug return if we have issues
  if (!user) {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Debug: No User</h1>
        <p>The user prop is null or undefined</p>
        <button onClick={() => onNavigate && onNavigate("welcome")}>
          Go to Welcome
        </button>
      </div>
    );
  }

  return (
    <main className="player-reservations-page">
      {/* Header */}
      <header className="player-reservations-header">
        <div className="header-content">
          <div className="logo-section">
            <Logo size="32" className="logo-icon" />
            <h1 className="logo-text">Fulbito!</h1>
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

      <div className="reservations-container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h2 className="hero-title">Mis Reservas</h2>
            <p className="hero-description">
              Gestiona todas tus reservas de canchas de fútbol
            </p>
          </div>
        </section>

        {/* Filter Section */}
        <section className="filter-section">
          <div className="filter-header">
            <h3 className="filter-title">Filtrar reservas</h3>
          </div>

          <div className="filter-buttons">
            <button
              className={getFilterButtonClass("all")}
              onClick={() => setActiveFilter("all")}>
              Todas ({getFilterCount("all")})
            </button>

            <button
              className={getFilterButtonClass("upcoming")}
              onClick={() => setActiveFilter("upcoming")}>
              Próximas ({getFilterCount("upcoming")})
            </button>

            <button
              className={getFilterButtonClass("pending")}
              onClick={() => setActiveFilter("pending")}>
              Pendientes ({getFilterCount("pending")})
            </button>

            <button
              className={getFilterButtonClass("confirmed")}
              onClick={() => setActiveFilter("confirmed")}>
              Confirmadas ({getFilterCount("confirmed")})
            </button>

            <button
              className={getFilterButtonClass("cancelled")}
              onClick={() => setActiveFilter("cancelled")}>
              Canceladas ({getFilterCount("cancelled")})
            </button>

            <button
              className={getFilterButtonClass("past")}
              onClick={() => setActiveFilter("past")}>
              Pasadas ({getFilterCount("past")})
            </button>
          </div>
        </section>

        {/* Results Section */}
        <section className="results-section">
          <div className="results-header">
            <h3 className="results-title">
              {isLoading
                ? "Cargando reservas..."
                : error
                ? "Error al cargar reservas"
                : filteredReservations.length > 0
                ? `${filteredReservations.length} ${
                    filteredReservations.length === 1 ? "reserva" : "reservas"
                  } ${
                    activeFilter === "all"
                      ? ""
                      : "filtrada" +
                        (filteredReservations.length === 1 ? "" : "s")
                  }`
                : reservations.length === 0
                ? "No tienes reservas aún"
                : "No hay reservas que coincidan con el filtro seleccionado"}
            </h3>
          </div>

          {error && (
            <div className="error-message" role="alert">
              <span className="error-icon">⚠️</span>
              {error}
              <Button
                variant="secondary"
                size="small"
                onClick={loadReservations}
                className="retry-button">
                Intentar nuevamente
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="loading-message">
              <span className="loading-icon">⏳</span>
              Cargando reservas...
            </div>
          )}

          {isProcessingExpired && (
            <div className="processing-message">
              <span className="processing-icon">🔄</span>
              Cancelando reservas vencidas automáticamente...
            </div>
          )}

          <div className="reservations-list">
            {filteredReservations.map((reservation) => (
              <ReservationCard
                key={reservation._id}
                reservation={reservation}
                onCancel={handleCancelReservation}
              />
            ))}
          </div>

          {!isLoading &&
            !error &&
            filteredReservations.length === 0 &&
            reservations.length === 0 && (
              <div className="empty-results">
                <span className="empty-icon">📅</span>
                <h4 className="empty-title">No tienes reservas aún</h4>
                <p className="empty-description">
                  ¡Es hora de reservar tu primera cancha! Busca canchas
                  disponibles y haz tu primera reserva.
                </p>
                <Button
                  variant="primary"
                  onClick={() => handleNavigation("player-home")}>
                  Buscar canchas
                </Button>
              </div>
            )}

          {!isLoading &&
            !error &&
            filteredReservations.length === 0 &&
            reservations.length > 0 && (
              <div className="empty-results">
                <span className="empty-icon">🔍</span>
                <h4 className="empty-title">No hay reservas con este filtro</h4>
                <p className="empty-description">
                  Intenta seleccionar un filtro diferente para ver tus reservas.
                </p>
                <Button
                  variant="secondary"
                  onClick={() => setActiveFilter("all")}>
                  Ver todas las reservas
                </Button>
              </div>
            )}
        </section>
      </div>

      {/* Cancellation Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={cancelCancelReservation}
        onConfirm={confirmCancelReservation}
        title="Cancelar Reserva"
        message={
          reservationToCancel
            ? `¿Estás seguro de que quieres cancelar la reserva para ${getCourtName(
                reservationToCancel.cancha
              )} el ${formatDate(reservationToCancel.fechaHora.fecha)} a las ${
                reservationToCancel.fechaHora.hora
              }?`
            : "¿Estás seguro de que quieres cancelar esta reserva?"
        }
        confirmText="Sí, cancelar"
        cancelText="No, mantener"
        confirmVariant="danger"
        isLoading={isCancelling}
      />
    </main>
  );
};

export default PlayerReservationsPage;
