import React, { useState, useEffect } from "react";
import Button from "../components/Button";
import UserDropdown from "../components/UserDropdown";
import ConfirmationModal from "../components/ConfirmationModal";
import { Logo } from "../components";
import { canchaService, ApiError } from "../services";
import "./VenueCourtManagementPage.css";

/**
 * Venue Court Management page component for predio users
 * Allows venue owners to create, read, update, and delete their courts
 * @param {Object} props - Component props
 * @param {function} props.onNavigate - Navigation handler function
 * @param {Object} [props.user] - Logged-in venue user data
 * @returns {JSX.Element} VenueCourtManagementPage component
 */
const VenueCourtManagementPage = ({ onNavigate, user }) => {
  // State management
  const [canchas, setCanchas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCancha, setEditingCancha] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    canchaId: null,
    canchaNumero: "",
  });
  const [formData, setFormData] = useState({
    numero: "",
    cantJugadores: "",
    tipoPiso: "",
    precio: "",
  });

  // Load court data on component mount
  useEffect(() => {
    loadCanchas();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Load canchas for the logged-in predio user
   */
  const loadCanchas = async () => {
    if (!user?.predio?._id) {
      setError("No se encontraron datos del predio");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      // Load canchas for this predio
      const canchasData = await canchaService.getCanchasByPredio(
        user.predio._id
      );
      setCanchas(canchasData || []);
    } catch (err) {
      console.error("Failed to load court data:", err);
      setError("Error al cargar las canchas. Por favor, intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
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
      onNavigate("welcome");
    }
  };

  /**
   * Handle form input changes
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /**
   * Show create form
   */
  const handleShowCreateForm = () => {
    setFormData({
      numero: "",
      cantJugadores: "",
      tipoPiso: "",
      precio: "",
    });
    setEditingCancha(null);
    setShowCreateForm(true);
  };

  /**
   * Cancel form
   */
  const handleCancelForm = () => {
    setShowCreateForm(false);
    setEditingCancha(null);
    setFormData({
      numero: "",
      cantJugadores: "",
      tipoPiso: "",
      precio: "",
    });
  };

  /**
   * Handle create cancha
   */
  const handleCreateCancha = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const canchaData = {
        numero: parseInt(formData.numero),
        cantJugadores: parseInt(formData.cantJugadores),
        tipoPiso: formData.tipoPiso,
        precio: parseFloat(formData.precio),
        predio: user.predio._id,
      };

      await canchaService.createCancha(canchaData);
      await loadCanchas();
      handleCancelForm();
    } catch (err) {
      console.error("Failed to create cancha:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Error al crear la cancha. Por favor, intenta nuevamente.");
      }
    }
  };

  /**
   * Handle edit cancha
   */
  const handleEditCancha = (cancha) => {
    setEditingCancha(cancha);
    setFormData({
      numero: cancha.numero?.toString() || "",
      cantJugadores: cancha.cantJugadores?.toString() || "",
      tipoPiso: cancha.tipoPiso || "",
      precio: cancha.precio?.toString() || "",
    });
    setShowCreateForm(true);
  };

  /**
   * Handle update cancha
   */
  const handleUpdateCancha = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const canchaData = {
        numero: parseInt(formData.numero),
        cantJugadores: parseInt(formData.cantJugadores),
        tipoPiso: formData.tipoPiso,
        precio: parseFloat(formData.precio),
      };

      await canchaService.updateCancha(editingCancha._id, canchaData);
      await loadCanchas();
      handleCancelForm();
    } catch (err) {
      console.error("Failed to update cancha:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          "Error al actualizar la cancha. Por favor, intenta nuevamente."
        );
      }
    }
  };

  /**
   * Handle delete cancha - Open confirmation modal
   */
  const handleDeleteCancha = (cancha) => {
    setDeleteConfirmation({
      isOpen: true,
      canchaId: cancha._id,
      canchaNumero: cancha.numero,
    });
  };

  /**
   * Close delete confirmation modal
   */
  const handleCloseDeleteConfirmation = () => {
    setDeleteConfirmation({
      isOpen: false,
      canchaId: null,
      canchaNumero: "",
    });
  };

  /**
   * Confirm delete cancha
   */
  const handleConfirmDelete = async () => {
    try {
      await canchaService.deleteCancha(deleteConfirmation.canchaId);
      await loadCanchas();
      handleCloseDeleteConfirmation();
    } catch (err) {
      console.error("Failed to delete cancha:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Error al eliminar la cancha. Por favor, intenta nuevamente.");
      }
      handleCloseDeleteConfirmation();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <main className="venue-court-management-page">
        <header className="venue-court-header">
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

        <div className="venue-court-container">
          <div className="loading-card">
            <div className="loading-spinner"></div>
            <p>Cargando canchas...</p>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error && !showCreateForm) {
    return (
      <main className="venue-court-management-page">
        <header className="venue-court-header">
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

        <div className="venue-court-container">
          <div className="error-card">
            <div className="error-icon">⚠️</div>
            <h3>Error al cargar los datos</h3>
            <p>{error}</p>
            <Button
              variant="primary"
              onClick={loadCanchas}
              className="retry-button">
              Intentar nuevamente
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="venue-court-management-page">
      {/* Header */}
      <header className="venue-court-header">
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

      <div className="venue-court-container">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-title-section">
            <h2 className="page-title">Mis Canchas</h2>
            <p className="page-subtitle">
              Gestiona las canchas de {user?.predio?.nombrePredio}
            </p>
          </div>
          {!showCreateForm && (
            <Button
              variant="primary"
              onClick={handleShowCreateForm}
              className="create-button">
              <span className="button-icon">➕</span>
              Nueva Cancha
            </Button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="form-card">
            <div className="form-header">
              <h3>{editingCancha ? "Editar Cancha" : "Nueva Cancha"}</h3>
            </div>

            <form
              onSubmit={editingCancha ? handleUpdateCancha : handleCreateCancha}
              className="cancha-form">
              <div className="form-group">
                <label htmlFor="numero" className="form-label">
                  Número de Cancha *
                </label>
                <input
                  type="number"
                  id="numero"
                  name="numero"
                  value={formData.numero}
                  onChange={handleInputChange}
                  placeholder="Ej: 1, 2, 3"
                  min="1"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="cantJugadores" className="form-label">
                  Capacidad de Jugadores *
                </label>
                <select
                  id="cantJugadores"
                  name="cantJugadores"
                  value={formData.cantJugadores}
                  onChange={handleInputChange}
                  required
                  className="form-input">
                  <option value="">Seleccionar capacidad</option>
                  <option value="5">5 jugadores (Fútbol 5)</option>
                  <option value="6">6 jugadores (Fútbol 6)</option>
                  <option value="7">7 jugadores (Fútbol 7)</option>
                  <option value="8">8 jugadores (Fútbol 8)</option>
                  <option value="9">9 jugadores (Fútbol 9)</option>
                  <option value="11">11 jugadores (Fútbol 11)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="tipoPiso" className="form-label">
                  Tipo de Piso *
                </label>
                <select
                  id="tipoPiso"
                  name="tipoPiso"
                  value={formData.tipoPiso}
                  onChange={handleInputChange}
                  required
                  className="form-input">
                  <option value="">Seleccionar tipo de piso</option>
                  <option value="sintetico">Sintético</option>
                  <option value="cesped">Césped Natural</option>
                  <option value="salon">Salón</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="precio" className="form-label">
                  Precio por Hora *
                </label>
                <input
                  type="number"
                  id="precio"
                  name="precio"
                  value={formData.precio}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="100"
                  placeholder="Ej: 30000"
                  className="form-input"
                />
                <small className="form-hint">
                  Precio base por hora de alquiler
                </small>
              </div>

              <div className="form-actions">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelForm}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  {editingCancha ? "Actualizar" : "Crear"} Cancha
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Canchas List */}
        {!showCreateForm && (
          <>
            {canchas.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">⚽</div>
                <h3>No hay canchas registradas</h3>
                <p>Comienza agregando tu primera cancha</p>
                <Button variant="primary" onClick={handleShowCreateForm}>
                  <span className="button-icon">➕</span>
                  Crear Primera Cancha
                </Button>
              </div>
            ) : (
              <div className="canchas-grid">
                {canchas.map((cancha) => (
                  <div key={cancha._id} className="cancha-card">
                    <div className="cancha-header">
                      <h3 className="cancha-name">Cancha {cancha.numero}</h3>
                      <span className="court-badge">
                        {cancha.cantJugadores} jugadores
                      </span>
                    </div>

                    <div className="cancha-details">
                      <div className="detail-row">
                        <span className="detail-label">👥 Capacidad:</span>
                        <span className="detail-value">
                          {cancha.cantJugadores} jugadores
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">🏟️ Tipo de Piso:</span>
                        <span className="detail-value">
                          {cancha.tipoPiso === "sintetico"
                            ? "Sintético"
                            : cancha.tipoPiso === "cesped"
                            ? "Césped Natural"
                            : "Salón"}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">💰 Precio:</span>
                        <span className="detail-value price">
                          ${cancha.precio?.toLocaleString("es-AR") || "N/A"}
                          /hora
                        </span>
                      </div>
                    </div>

                    <div className="cancha-actions">
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => handleEditCancha(cancha)}>
                        <span className="button-icon">✏️</span>
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => handleDeleteCancha(cancha)}
                        className="delete-button">
                        <span className="button-icon">🗑️</span>
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={handleCloseDeleteConfirmation}
        onConfirm={handleConfirmDelete}
        title="Eliminar Cancha"
        message={`¿Estás seguro de que deseas eliminar la Cancha ${deleteConfirmation.canchaNumero}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
      />
    </main>
  );
};

export default VenueCourtManagementPage;
