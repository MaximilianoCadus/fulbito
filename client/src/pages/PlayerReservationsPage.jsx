import React, { useState, useEffect } from "react";
import Button from "../components/Button";
import ReservationCard from "../components/ReservationCard";
import UserDropdown from "../components/UserDropdown";
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
  // State for reservations and loading
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter state
  const [activeFilter, setActiveFilter] = useState("all");

  // Load reservations on component mount
  useEffect(() => {
    const loadPlayerReservations = async () => {
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
  const loadReservations = async () => {
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

  /**
   * Handle reservation confirmation
   */
  const handleConfirmReservation = async (reservation) => {
    try {
      console.log("Confirming reservation:", reservation._id);
      await reservaService.confirmarReserva(reservation._id);

      // Reload reservations to get updated data
      await loadReservations();

      console.log("Reservation confirmed successfully");
    } catch (err) {
      console.error("Failed to confirm reservation:", err);

      if (err instanceof ApiError) {
        setError(err.getUserMessage());
      } else {
        setError(
          "Error al confirmar la reserva. Por favor, intenta nuevamente."
        );
      }
    }
  };

  /**
   * Handle reservation cancellation
   */
  const handleCancelReservation = async (reservation) => {
    if (
      !window.confirm("¿Estás seguro de que quieres cancelar esta reserva?")
    ) {
      return;
    }

    try {
      console.log("Cancelling reservation:", reservation._id);
      await reservaService.cancelarReserva(reservation._id);

      // Reload reservations to get updated data
      await loadReservations();

      console.log("Reservation cancelled successfully");
    } catch (err) {
      console.error("Failed to cancel reservation:", err);

      if (err instanceof ApiError) {
        setError(err.getUserMessage());
      } else {
        setError(
          "Error al cancelar la reserva. Por favor, intenta nuevamente."
        );
      }
    }
  };

  /**
   * Handle viewing reservation details
   */
  const handleViewDetails = (reservation) => {
    console.log("Viewing reservation details:", reservation);
    // TODO: Navigate to reservation details page or open modal
    alert(
      `Detalles de la reserva:\n\nCancha: ${
        reservation.cancha?.nombre
      }\nFecha: ${new Date(
        reservation.fechaHora.fecha
      ).toLocaleDateString()}\nHora: ${reservation.fechaHora.hora}\nEstado: ${
        reservation.estado
      }`
    );
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

  return (
    <main className="player-reservations-page">
      {/* Header */}
      <header className="player-reservations-header">
        <div className="header-content">
          <div className="logo-section">
            <span className="logo-icon">⚽</span>
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

          <div className="reservations-list">
            {filteredReservations.map((reservation) => (
              <ReservationCard
                key={reservation._id}
                reservation={reservation}
                onConfirm={handleConfirmReservation}
                onCancel={handleCancelReservation}
                onViewDetails={handleViewDetails}
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
    </main>
  );
};

export default PlayerReservationsPage;
