import React, { useState, useEffect } from "react";
import Button from "../components/Button";
import UserDropdown from "../components/UserDropdown";
import { Logo } from "../components";
import { canchaService, reservaService, ApiError } from "../services";
import "./CourtDetailsPage.css";

/**
 * CourtDetailsPage component to display court details and available time slots
 * @param {Object} props - Component props
 * @param {function} props.onNavigate - Navigation handler function
 * @param {Object} [props.user] - Logged-in user data
 * @param {Object} [props.court] - Selected court data
 * @returns {JSX.Element} CourtDetailsPage component
 */
const CourtDetailsPage = ({ onNavigate, user, court }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [courtDetails, setCourtDetails] = useState(null);
  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isReserving, setIsReserving] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [reservationDetails, setReservationDetails] = useState(null);

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

  // Format player count
  const formatPlayerCount = (count) => {
    return `${count} jugadores`;
  };

  // Get day name in Spanish
  const getDayName = (date) => {
    const dayNames = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    return dayNames[date.getDay()];
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  // Fetch court details and availability
  useEffect(() => {
    const fetchCourtDetails = async () => {
      if (!court?._id) {
        setError("No se ha seleccionado una cancha válida");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        // Generate 7 consecutive days starting from today
        const today = new Date();
        const weekDates = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          weekDates.push(date);
        }

        // Fetch detailed court information
        const courtData = await canchaService.getCanchaById(court._id);
        setCourtDetails(courtData);

        // Generate time slots based on predio's operating hours
        const timeSlots = [];

        // Extract operating hours from predio if available
        if (
          courtData.predio?.horarios &&
          courtData.predio.horarios.length > 0
        ) {
          console.log("Predio horarios:", courtData.predio.horarios);

          // Handle multiple horario entries (split operating hours)
          courtData.predio.horarios.forEach((horario, index) => {
            const startHour = parseInt(horario.desde.split(":")[0]);
            const endHour = parseInt(horario.hasta.split(":")[0]);

            console.log(
              `Horario ${index + 1}: ${startHour}:00 to ${endHour}:00`
            );

            // Generate time slots for this range
            for (let hour = startHour; hour <= endHour; hour++) {
              const timeSlot = `${hour.toString().padStart(2, "0")}:00`;
              // Avoid duplicates if ranges overlap
              if (!timeSlots.includes(timeSlot)) {
                timeSlots.push(timeSlot);
              }
            }
          });

          console.log("Generated time slots (before sort):", timeSlots);
        } else {
          // Fallback: default business hours (8am - 10pm)
          for (let hour = 8; hour <= 22; hour++) {
            timeSlots.push(`${hour.toString().padStart(2, "0")}:00`);
          }
        }

        // Sort time slots to ensure they're in chronological order
        timeSlots.sort();

        console.log("Final sorted time slots:", timeSlots);

        // Fetch existing reservations for this court
        let existingReservations = [];
        try {
          existingReservations = await reservaService.getReservasByCancha(
            court._id
          );
        } catch (reservationError) {
          console.error(
            "Failed to fetch existing reservations:",
            reservationError
          );
          // Continue with empty reservations array - better to show availability than break the app
        }

        // Helper function for consistent date formatting (local date without timezone issues)
        const formatDateForServer = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        // Generate weekly schedule with availability
        const schedule = weekDates.map((date) => {
          const dateStr = formatDateForServer(date);
          const now = new Date();
          const isToday = date.toDateString() === now.toDateString();

          // Filter time slots for today to only show future slots
          const availableTimeSlots = isToday
            ? timeSlots.filter((time) => {
                const [hour] = time.split(":").map(Number);
                return hour > now.getHours();
              })
            : timeSlots;

          return {
            date,
            dayName: getDayName(date),
            slots: availableTimeSlots.map((time) => {
              // Check if this time slot exists in court's availability
              const availableSlot = courtData.disponibilidad?.find((disp) => {
                // Convert the MongoDB date to a string for comparison using local formatting
                const dispDate = new Date(disp.fecha);
                const dispDateStr = formatDateForServer(dispDate);
                return dispDateStr === dateStr && disp.hora === time;
              });

              // Check against existing reservations
              const isReserved = existingReservations?.some((res) => {
                if (res.estado === "cancelada") return false; // Don't count cancelled reservations

                // Handle different date formats from the backend using local formatting
                const resDate = new Date(res.fechaHora.fecha);
                const resDateStr = formatDateForServer(resDate);
                const resTime = res.fechaHora.hora;

                return resDateStr === dateStr && resTime === time;
              });

              // If we have specific availability data, use it; otherwise default to available during operating hours
              // Since time slots are generated based on operating hours, if the time is in our list, it's within business hours
              const isBusinessHours = true; // All generated time slots are within business hours
              const hasAvailabilitySlot = !!availableSlot;

              return {
                time,
                available:
                  !isReserved && (hasAvailabilitySlot ? true : isBusinessHours), // Available if not reserved and either specifically set or during business hours
                price: availableSlot?.precio || courtData.precio || 30000,
                reservationId: null,
                disponibilidadId: availableSlot?._id,
              };
            }),
          };
        });

        setWeeklySchedule(schedule);
      } catch (err) {
        console.error("Failed to fetch court details:", err);
        setError(
          err instanceof ApiError
            ? err.message
            : "Error al cargar los detalles de la cancha"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourtDetails();
  }, [court]);

  // Handle keyboard events for modal
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && showSuccessModal) {
        closeSuccessModal();
      }
    };

    if (showSuccessModal) {
      document.addEventListener("keydown", handleEscapeKey);
      // Prevent background scrolling when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "unset";
    };
  }, [showSuccessModal]);

  // Handle navigation
  const handleNavigation = (page) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  // Handle logout
  const handleLogout = () => {
    if (onNavigate) {
      onNavigate("welcome");
    }
  };

  // Handle day selection
  const handleDaySelect = (dayIndex) => {
    setSelectedDayIndex(dayIndex);
    setSelectedSlot(null); // Clear selected slot when changing day
  };

  // Handle time slot selection
  const handleSlotSelect = (slotIndex) => {
    if (selectedDayIndex === null) return;

    const day = weeklySchedule[selectedDayIndex];
    const slot = day.slots[slotIndex];

    if (!slot.available) {
      return;
    }

    setSelectedSlot({
      date: day.date,
      time: slot.time,
      price: slot.price,
      dayIndex: selectedDayIndex,
      slotIndex,
    });
  };

  // Close success modal
  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setReservationDetails(null);
  };

  // Refresh court availability after reservation
  const refreshAvailability = async () => {
    try {
      // Re-fetch reservations to get the most current data
      const existingReservations = await reservaService.getReservasByCancha(
        court._id
      );

      // Helper function for consistent date formatting
      const formatDateForComparison = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      // Update the schedule with current reservation data
      const updatedSchedule = weeklySchedule.map((day) => ({
        ...day,
        slots: day.slots.map((slot) => {
          const dateStr = formatDateForComparison(day.date);
          const isReserved = existingReservations?.some((res) => {
            if (res.estado === "cancelada") return false;

            // Parse the reservation date properly using local formatting
            const resDate = new Date(res.fechaHora.fecha);
            const resDateStr = formatDateForComparison(resDate);
            const resTime = res.fechaHora.hora;

            console.log("Comparing dates:", {
              slotDate: dateStr,
              slotTime: slot.time,
              resDate: resDateStr,
              resTime: resTime,
              match: resDateStr === dateStr && resTime === slot.time,
            });

            return resDateStr === dateStr && resTime === slot.time;
          });

          return {
            ...slot,
            available: !isReserved && slot.available, // Keep original availability rules but exclude reserved slots
          };
        }),
      }));

      setWeeklySchedule(updatedSchedule);
    } catch (error) {
      console.error("Failed to refresh availability:", error);
    }
  };

  // Handle reservation
  const handleReservation = async () => {
    if (!selectedSlot || !user) return;

    // Prevent double submissions
    if (isReserving) {
      console.log(
        "Reservation already in progress, ignoring duplicate request"
      );
      return;
    }

    try {
      setIsReserving(true);
      setError("");

      // Double-check availability before creating reservation
      console.log("Double-checking slot availability before reservation...");
      await refreshAvailability();

      // Verify the selected slot is still available after refresh
      const currentSlot = weeklySchedule
        .find((day) => day.date.getTime() === selectedSlot.date.getTime())
        ?.slots.find((slot) => slot.time === selectedSlot.time);

      if (!currentSlot || !currentSlot.available) {
        setError(
          "Lo sentimos, este horario ya no está disponible. Por favor selecciona otro horario."
        );
        setSelectedSlot(null);
        return;
      }

      // Format date consistently without timezone issues
      const formatDateForServer = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const reservationData = {
        jugador: user.jugador._id,
        cancha: court._id,
        fechaHora: {
          fecha: formatDateForServer(selectedSlot.date),
          hora: selectedSlot.time,
        },
        precioFinal: selectedSlot.price,
        estado: "pendiente",
      };

      console.log("Creating reservation with data:", reservationData);

      const createdReservation = await reservaService.createReserva(
        reservationData
      );

      // Refresh availability data from server to ensure accuracy
      await refreshAvailability();
      setSelectedSlot(null);

      // Show success modal with reservation details
      setReservationDetails({
        date: selectedSlot.date,
        time: selectedSlot.time,
        courtInfo: `${formatPlayerCount(
          displayCourt.cantJugadores
        )} - ${formatFloorType(displayCourt.tipoPiso)}`,
        venue: displayCourt.predio?.nombrePredio,
        price: selectedSlot.price,
        reservationId: createdReservation._id,
      });
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Failed to create reservation:", err);
      setError(
        err instanceof ApiError
          ? err.message
          : "Error al crear la reserva. Por favor, intenta nuevamente."
      );
    } finally {
      setIsReserving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="court-details-page">
        <header className="court-details-header">
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

        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando detalles de la cancha...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="court-details-page">
        <header className="court-details-header">
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

        <div className="error-container">
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <h2>Error</h2>
            <p>{error}</p>
            <Button
              variant="primary"
              onClick={() => handleNavigation("player-home")}
              className="back-to-search-button">
              Volver a la búsqueda
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const displayCourt = courtDetails || court;

  return (
    <main className="court-details-page">
      {/* Header */}
      <header className="court-details-header">
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

      {/* Back Navigation */}
      <div className="back-navigation">
        <Button
          variant="outline"
          size="small"
          onClick={() => handleNavigation("player-home")}
          className="back-button">
          ← Volver a la búsqueda
        </Button>
      </div>

      {/* Court Information */}
      <section className="court-info-section">
        <div className="court-info-container">
          {/* Comprehensive Court Details */}
          <div className="court-comprehensive-info">
            {/* Venue Information */}
            <div className="info-section venue-section">
              <h3 className="section-title">📍 Información del Predio</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">🏢 Nombre:</span>
                  <span className="info-value">
                    {displayCourt.predio?.nombrePredio ||
                      "Predio no especificado"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">🗺️ Dirección:</span>
                  <span className="info-value">
                    {displayCourt.predio?.direccion
                      ? `${displayCourt.predio.direccion.calle} ${
                          displayCourt.predio.direccion.altura
                        }${
                          displayCourt.predio.direccion.piso
                            ? `, Piso ${displayCourt.predio.direccion.piso}`
                            : ""
                        }${
                          displayCourt.predio.direccion.dpto
                            ? `, Dpto ${displayCourt.predio.direccion.dpto}`
                            : ""
                        }`
                      : "Dirección no disponible"}
                  </span>
                </div>
                {displayCourt.predio?.direccion?.localidad && (
                  <div className="info-item">
                    <span className="info-label">🌆 Localidad:</span>
                    <span className="info-value">
                      {typeof displayCourt.predio.direccion.localidad ===
                      "string"
                        ? displayCourt.predio.direccion.localidad
                        : displayCourt.predio.direccion.localidad.nombre ||
                          displayCourt.predio.direccion.localidad}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Court Specifications */}
            <div className="info-section court-specs-section">
              <h3 className="section-title">
                ⚽ Especificaciones de la Cancha
              </h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">👥 Capacidad:</span>
                  <span className="info-value">
                    {formatPlayerCount(displayCourt.cantJugadores)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">🏟️ Tipo de Piso:</span>
                  <span className="info-value">
                    {formatFloorType(displayCourt.tipoPiso)}
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing Information */}
            {displayCourt.disponibilidad &&
              displayCourt.disponibilidad.length > 0 && (
                <div className="info-section pricing-section">
                  <h3 className="section-title">💰 Información de Precios</h3>
                  <div className="pricing-info">
                    {(() => {
                      const prices = displayCourt.disponibilidad.map(
                        (slot) => slot.precio
                      );
                      const avgPrice = Math.round(
                        prices.reduce((a, b) => a + b, 0) / prices.length
                      );

                      return (
                        <div className="pricing-grid">
                          <div className="price-item">
                            <span className="price-label">
                              � Precio por hora:
                            </span>
                            <span className="price-value">
                              ${avgPrice.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

            {/* Operating Hours */}
            {displayCourt.predio?.horarios &&
              displayCourt.predio.horarios.length > 0 && (
                <div className="info-section hours-section">
                  <h3 className="section-title">
                    🕐 Horarios de Funcionamiento
                  </h3>
                  <div className="hours-info">
                    {displayCourt.predio.horarios.map((horario, index) => (
                      <div key={index} className="hour-item">
                        <span className="hour-label">
                          {index === 0
                            ? "📅 Horario:"
                            : `📅 Horario ${index + 1}:`}
                        </span>
                        <span className="hour-value">
                          {horario.desde} - {horario.hasta}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section className="schedule-section">
        <div className="schedule-container">
          <h3 className="schedule-title">Selecciona un día y horario</h3>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {/* Day Selector */}
          <div className="day-selector">
            <h4 className="day-selector-title">📅 Elige un día</h4>
            <div className="day-selector-buttons">
              {weeklySchedule.map((day, dayIndex) => {
                const availableSlots = day.slots.filter(
                  (slot) => slot.available
                ).length;

                return (
                  <button
                    key={dayIndex}
                    className={`day-selector-button ${
                      selectedDayIndex === dayIndex ? "selected" : ""
                    }`}
                    onClick={() => handleDaySelect(dayIndex)}
                    disabled={availableSlots === 0}>
                    <div className="day-button-content">
                      <span className="day-name">{day.dayName}</span>
                      <span className="day-date">{formatDate(day.date)}</span>
                      <span className="available-count">
                        {availableSlots > 0
                          ? `${availableSlots} disponible${
                              availableSlots !== 1 ? "s" : ""
                            }`
                          : "Sin horarios"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* No Day Selected Message */}
          {weeklySchedule.length > 0 && selectedDayIndex === null && (
            <div className="no-day-selected">
              <div className="no-day-message">
                <span className="no-day-icon">📅</span>
                <h4 className="no-day-title">Selecciona un día</h4>
                <p className="no-day-subtitle">
                  Elige un día de la semana para ver los horarios disponibles
                </p>
              </div>
            </div>
          )}

          {/* Time Slots Display */}
          {weeklySchedule.length > 0 && selectedDayIndex !== null && (
            <div className="time-slots-section">
              <div className="selected-day-info">
                <h4 className="selected-day-title">
                  🕐 Horarios para {weeklySchedule[selectedDayIndex]?.dayName}{" "}
                  {formatDate(weeklySchedule[selectedDayIndex]?.date)}
                </h4>
                <p className="selected-day-subtitle">
                  Selecciona el horario que prefieras para tu reserva
                </p>
              </div>

              <div className="time-slots-grid">
                {weeklySchedule[selectedDayIndex]?.slots.map(
                  (slot, slotIndex) => (
                    <button
                      key={slotIndex}
                      className={`time-slot-card ${
                        slot.available ? "available" : "unavailable"
                      } ${
                        selectedSlot &&
                        selectedSlot.dayIndex === selectedDayIndex &&
                        selectedSlot.slotIndex === slotIndex
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => handleSlotSelect(slotIndex)}
                      disabled={!slot.available}
                      title={
                        slot.available
                          ? `${slot.time} - $${slot.price.toLocaleString()}`
                          : "No disponible"
                      }>
                      <div className="time-slot-content">
                        <span className="slot-time">{slot.time}</span>
                        {slot.available && (
                          <span className="slot-price">
                            ${slot.price.toLocaleString()}
                          </span>
                        )}
                        {!slot.available && (
                          <span className="slot-unavailable">
                            No disponible
                          </span>
                        )}
                      </div>
                    </button>
                  )
                )}
              </div>

              {weeklySchedule[selectedDayIndex]?.slots.filter(
                (slot) => slot.available
              ).length === 0 && (
                <div className="no-slots-available">
                  <span className="no-slots-icon">⏰</span>
                  <h4>No hay horarios disponibles</h4>
                  <p>
                    Este día no tiene horarios disponibles para reservar. Prueba
                    con otro día.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Reservation Panel */}
      {selectedSlot && (
        <section className="reservation-panel">
          <div className="reservation-container">
            <h3 className="reservation-title">Confirmar reserva</h3>

            {/* Booking Summary */}
            <div className="booking-summary">
              <h4 className="summary-title">Resumen de la reserva</h4>
              <div className="reservation-details">
                <div className="detail-row">
                  <span className="detail-label">📅 Fecha:</span>
                  <span className="detail-value">
                    {selectedSlot.date.toLocaleDateString("es-AR", {
                      weekday: "long",
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">🕐 Horario:</span>
                  <span className="detail-value">
                    {selectedSlot.time} -{" "}
                    {String(
                      parseInt(selectedSlot.time.split(":")[0]) + 1
                    ).padStart(2, "0")}
                    :00
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">⏱️ Duración:</span>
                  <span className="detail-value">60 minutos</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">🏟️ Cancha:</span>
                  <span className="detail-value">
                    {formatPlayerCount(displayCourt.cantJugadores)} -{" "}
                    {formatFloorType(displayCourt.tipoPiso)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">📍 Ubicación:</span>
                  <span className="detail-value">
                    {displayCourt.predio?.nombrePredio ||
                      "Predio no especificado"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">🗺️ Dirección:</span>
                  <span className="detail-value">
                    {displayCourt.predio?.direccion
                      ? `${displayCourt.predio.direccion.calle} ${displayCourt.predio.direccion.altura}`
                      : "Dirección no disponible"}
                  </span>
                </div>
                {displayCourt.predio?.direccion?.localidad && (
                  <div className="detail-row">
                    <span className="detail-label">� Localidad:</span>
                    <span className="detail-value">
                      {displayCourt.predio.direccion.localidad.nombre}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div className="pricing-breakdown">
              <h4 className="pricing-title">Detalle del precio</h4>
              <div className="pricing-details">
                <div className="pricing-row">
                  <span className="pricing-label">Precio por hora:</span>
                  <span className="pricing-value">
                    ${selectedSlot.price.toLocaleString()}
                  </span>
                </div>
                <div className="pricing-row">
                  <span className="pricing-label">Duración:</span>
                  <span className="pricing-value">1 hora</span>
                </div>
                <div className="pricing-row subtotal">
                  <span className="pricing-label">Subtotal:</span>
                  <span className="pricing-value">
                    ${selectedSlot.price.toLocaleString()}
                  </span>
                </div>
                <div className="pricing-row total">
                  <span className="pricing-label">💰 Total a pagar:</span>
                  <span className="pricing-value">
                    ${selectedSlot.price.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Booking Information */}
            <div className="booking-info">
              <h4 className="info-title">Información importante</h4>
              <ul className="info-list">
                <li>
                  🔄 <strong>Estado inicial:</strong> Tu reserva será marcada
                  como "Pendiente" hasta ser confirmada
                </li>
                <li>
                  📱 <strong>Contacto:</strong> El predio se contactará contigo
                  para confirmar la reserva
                </li>
                <li>
                  💳 <strong>Pago:</strong> El pago se realiza directamente en
                  el predio
                </li>
                <li>
                  ⏰ <strong>Puntualidad:</strong> Se recomienda llegar 10
                  minutos antes del horario reservado
                </li>
                <li>
                  🚫 <strong>Cancelación:</strong> Puedes cancelar tu reserva
                  desde tu perfil hasta 2 horas antes
                </li>
              </ul>
            </div>

            {/* Player Information */}
            {user && (
              <div className="player-info">
                <h4 className="player-title">Datos del jugador</h4>
                <div className="player-details">
                  <div className="detail-row">
                    <span className="detail-label">👤 Nombre:</span>
                    <span className="detail-value">
                      {user.jugador.nombre} {user.jugador.apellido}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">📞 Teléfono:</span>
                    <span className="detail-value">
                      {user.jugador.nroCelular}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">📧 Email:</span>
                    <span className="detail-value">{user.email}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="reservation-actions">
              <Button
                variant="danger"
                size="medium"
                onClick={() => setSelectedSlot(null)}
                className="cancel-reservation-button">
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="medium"
                onClick={handleReservation}
                disabled={isReserving}
                className="confirm-reservation-button">
                {isReserving ? "Reservando..." : "Confirmar reserva"}
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Success Modal */}
      {showSuccessModal && reservationDetails && (
        <div className="modal-overlay" onClick={closeSuccessModal}>
          <div className="success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="success-icon">✅</span>
              <h3 className="modal-title">¡Reserva creada exitosamente!</h3>
            </div>

            <div className="modal-content">
              <div className="reservation-summary">
                <div className="summary-row">
                  <span className="summary-label">📅 Fecha:</span>
                  <span className="summary-value">
                    {reservationDetails.date.toLocaleDateString("es-AR", {
                      weekday: "long",
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="summary-row">
                  <span className="summary-label">🕐 Horario:</span>
                  <span className="summary-value">
                    {reservationDetails.time}
                  </span>
                </div>

                <div className="summary-row">
                  <span className="summary-label">🏟️ Cancha:</span>
                  <span className="summary-value">
                    {reservationDetails.courtInfo}
                  </span>
                </div>

                <div className="summary-row">
                  <span className="summary-label">📍 Lugar:</span>
                  <span className="summary-value">
                    {reservationDetails.venue}
                  </span>
                </div>

                <div className="summary-row">
                  <span className="summary-label">💰 Precio:</span>
                  <span className="summary-value">
                    ${reservationDetails.price.toLocaleString()}
                  </span>
                </div>

                <div className="summary-row">
                  <span className="summary-label">📋 Estado:</span>
                  <span className="summary-value status-pending">
                    Pendiente de confirmación
                  </span>
                </div>
              </div>

              <div className="modal-info">
                <p className="info-text">
                  El predio se contactará contigo para confirmar la reserva.
                  Puedes ver el estado de tu reserva en tu perfil.
                </p>
              </div>
            </div>

            <div className="modal-actions">
              <Button
                variant="primary"
                size="medium"
                onClick={closeSuccessModal}
                className="modal-confirm-button">
                Entendido
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default CourtDetailsPage;
