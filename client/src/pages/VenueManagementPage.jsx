import React, { useState, useEffect } from "react";
import Button from "../components/Button";
import UserDropdown from "../components/UserDropdown";
import ConfirmationModal from "../components/ConfirmationModal";
import { Logo } from "../components";
import { predioService, locationService, ApiError } from "../services";
import "./VenueManagementPage.css";

/**
 * Venue Management page component for company users
 * Allows companies to create, read, update, and delete their venues (predios)
 * @param {Object} props - Component props
 * @param {function} props.onNavigate - Navigation handler function
 * @param {Object} [props.user] - Logged-in user data
 * @returns {JSX.Element} VenueManagementPage component
 */
const VenueManagementPage = ({ onNavigate, user }) => {
  // State management
  const [predios, setPredios] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPredio, setEditingPredio] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    predioId: null,
    predioName: "",
  });
  const [formData, setFormData] = useState({
    nombrePredio: "",
    email: "",
    password: "",
    direccion: {
      calle: "",
      altura: "",
      localidad: "",
    },
    horarios: [
      {
        desde: "08:00",
        hasta: "22:00",
      },
    ],
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Load predios and localidades data
   */
  const loadData = async () => {
    if (!user?.empresa?._id) {
      setError("No se encontraron datos de la empresa");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      // Load company predios and localidades in parallel
      const [prediosData, localidadesData] = await Promise.all([
        predioService.getPrediosByEmpresa(user.empresa._id),
        locationService.getAllLocalidades(),
      ]);

      setPredios(prediosData || []);
      setLocalidades(localidadesData || []);
    } catch (err) {
      console.error("Failed to load venue data:", err);
      setError("Error al cargar los datos. Por favor, intenta nuevamente.");
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
    const { name, value } = e.target;

    if (name.startsWith("direccion.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        direccion: {
          ...prev.direccion,
          [field]: value,
        },
      }));
    } else if (name.startsWith("horarios.")) {
      const [, index, field] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        horarios: prev.horarios.map((horario, i) =>
          i === parseInt(index) ? { ...horario, [field]: value } : horario
        ),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  /**
   * Handle form submission for create/update
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombrePredio.trim()) {
      setError("El nombre del predio es obligatorio");
      return;
    }

    if (!formData.direccion.calle.trim() || !formData.direccion.altura.trim()) {
      setError("La dirección completa es obligatoria");
      return;
    }

    if (!formData.direccion.localidad) {
      setError("Debe seleccionar una localidad");
      return;
    }

    // Validate email and password
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Por favor, ingresa un email válido");
        return;
      }
    }

    // For new venues, email and password are required
    if (!editingPredio) {
      if (!formData.email.trim()) {
        setError("El email del predio es obligatorio");
        return;
      }

      if (!formData.password.trim()) {
        setError("La contraseña es obligatoria");
        return;
      }

      if (formData.password.length < 8) {
        setError("La contraseña debe tener al menos 8 caracteres");
        return;
      }
    } else {
      // For editing, validate password only if provided
      if (formData.password.trim() && formData.password.length < 8) {
        setError("La contraseña debe tener al menos 8 caracteres");
        return;
      }
    }

    try {
      setIsLoading(true);
      setError("");

      const predioData = {
        ...formData,
        empresa: user.empresa.cuit, // Backend expects CUIT
      };

      console.log("FRONTEND - Form data before submit:", formData);
      console.log("FRONTEND - Editing predio:", editingPredio);

      if (editingPredio) {
        // Update existing predio - handle venue data and credentials separately
        console.log("FRONTEND - Updating predio with ID:", editingPredio._id);

        // Prepare venue data (without credentials)
        const venueUpdateData = { ...predioData };
        delete venueUpdateData.email;
        delete venueUpdateData.password;

        console.log("FRONTEND - Venue data to send:", venueUpdateData);
        await predioService.updatePredio(editingPredio._id, venueUpdateData);

        // Update credentials if email is provided
        if (formData.email.trim()) {
          const credentialsData = {
            email: formData.email.trim(),
          };

          // Only include password if it's provided
          if (formData.password.trim()) {
            credentialsData.password = formData.password.trim();
          }

          console.log("FRONTEND - Updating credentials:", {
            email: credentialsData.email,
            hasPassword: !!credentialsData.password,
          });
          await predioService.updatePredioCredentials(
            editingPredio._id,
            credentialsData
          );
        }
      } else {
        // Create new predio
        console.log("FRONTEND - Creating new predio");
        console.log("FRONTEND - Predio data to send:", predioData);
        await predioService.createPredio(predioData);
      }

      // Reset form and reload data
      setFormData({
        nombrePredio: "",
        email: "",
        password: "",
        direccion: {
          calle: "",
          altura: "",
          localidad: "",
        },
        horarios: [
          {
            desde: "08:00",
            hasta: "22:00",
          },
        ],
      });
      setShowCreateForm(false);
      setEditingPredio(null);

      await loadData();
    } catch (err) {
      console.error("FRONTEND - Failed to save predio:", err);
      console.error("FRONTEND - Error details:", err.message);
      console.error("FRONTEND - Error response:", err.response);

      if (err instanceof ApiError) {
        console.log("FRONTEND - ApiError details:", err.details);
        setError(err.getUserMessage());
      } else if (err.response?.data?.error) {
        setError(
          `Error: ${err.response.data.error}${
            err.response.data.details ? ` - ${err.response.data.details}` : ""
          }`
        );
      } else {
        setError("Error al guardar el predio. Por favor, intenta nuevamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle edit predio
   */
  const handleEdit = (predio) => {
    console.log("FRONTEND - Editing predio:", predio);
    console.log("FRONTEND - Predio direccion:", predio.direccion);
    console.log("FRONTEND - Predio localidad:", predio.direccion.localidad);

    setEditingPredio(predio);

    const localidadValue =
      predio.direccion.localidad?.nombre || predio.direccion.localidad || "";
    console.log("FRONTEND - Localidad value for form:", localidadValue);

    setFormData({
      nombrePredio: predio.nombrePredio,
      email: predio.userEmail || "", // Pre-populate email from backend
      password: "", // Don't pre-populate password for security
      direccion: {
        calle: predio.direccion.calle,
        altura: predio.direccion.altura,
        localidad: localidadValue,
      },
      horarios:
        predio.horarios.length > 0
          ? predio.horarios
          : [
              {
                desde: "08:00",
                hasta: "22:00",
              },
            ],
    });
    setShowCreateForm(true);
  };

  /**
   * Handle delete predio - Show confirmation modal
   */
  const handleDelete = (predioId, predioName) => {
    console.log("Opening delete confirmation modal for:", predioName);
    setDeleteConfirmation({
      isOpen: true,
      predioId: predioId,
      predioName: predioName,
    });
  };

  /**
   * Confirm delete predio
   */
  const confirmDelete = async () => {
    const { predioId, predioName } = deleteConfirmation;
    console.log("Confirming delete for predio:", predioName, "ID:", predioId);

    try {
      setIsLoading(true);
      setError("");

      await predioService.deletePredio(predioId);
      await loadData();

      console.log("Predio deleted successfully");

      // Close confirmation modal
      setDeleteConfirmation({
        isOpen: false,
        predioId: null,
        predioName: "",
      });
    } catch (err) {
      console.error("Failed to delete predio:", err);

      if (err instanceof ApiError) {
        setError(err.getUserMessage());
      } else {
        setError("Error al eliminar el predio. Por favor, intenta nuevamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cancel delete predio
   */
  const cancelDelete = () => {
    console.log("Delete confirmation cancelled");
    setDeleteConfirmation({
      isOpen: false,
      predioId: null,
      predioName: "",
    });
  };

  /**
   * Cancel form editing
   */
  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingPredio(null);
    setFormData({
      nombrePredio: "",
      email: "",
      password: "",
      direccion: {
        calle: "",
        altura: "",
        localidad: "",
      },
      horarios: [
        {
          desde: "08:00",
          hasta: "22:00",
        },
      ],
    });
    setError("");
  };

  /**
   * Add new horario
   */
  const addHorario = () => {
    setFormData((prev) => ({
      ...prev,
      horarios: [
        ...prev.horarios,
        {
          desde: "08:00",
          hasta: "22:00",
        },
      ],
    }));
  };

  /**
   * Remove horario
   */
  const removeHorario = (index) => {
    if (formData.horarios.length > 1) {
      setFormData((prev) => ({
        ...prev,
        horarios: prev.horarios.filter((_, i) => i !== index),
      }));
    }
  };

  // Loading state
  if (isLoading && !showCreateForm) {
    return (
      <main className="venue-management-page">
        <header className="venue-management-header">
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

        <div className="venue-management-container">
          <div className="loading-card">
            <div className="loading-spinner"></div>
            <p>Cargando predios...</p>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error && !showCreateForm) {
    return (
      <main className="venue-management-page">
        <header className="venue-management-header">
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

        <div className="venue-management-container">
          <div className="error-card">
            <div className="error-icon">⚠️</div>
            <h3>Error al cargar los datos</h3>
            <p>{error}</p>
            <Button
              variant="primary"
              onClick={loadData}
              className="retry-button">
              Intentar nuevamente
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="venue-management-page">
      {/* Header */}
      <header className="venue-management-header">
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

      <div className="venue-management-container">
        {/* Page Header */}
        <section className="page-header">
          <div className="page-title">
            <span className="page-icon">🏟️</span>
            <h2>Gestión de Predios</h2>
          </div>
          <p className="page-description">
            Administra los predios deportivos de {user?.empresa?.razonSocial}
          </p>
        </section>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* Action Bar */}
        <section className="action-bar">
          <Button
            variant="primary"
            onClick={() => setShowCreateForm(true)}
            className="create-button">
            <span className="button-icon">➕</span>
            Nuevo Predio
          </Button>
        </section>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <section className="form-section">
            <div className="form-card">
              <div className="form-header">
                <h3>
                  {editingPredio ? "Editar Predio" : "Crear Nuevo Predio"}
                </h3>
                <button
                  type="button"
                  className="close-button"
                  onClick={handleCancel}>
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="predio-form">
                {/* Basic Info */}
                <div className="form-group">
                  <label htmlFor="nombrePredio">Nombre del Predio *</label>
                  <input
                    type="text"
                    id="nombrePredio"
                    name="nombrePredio"
                    value={formData.nombrePredio}
                    onChange={handleInputChange}
                    placeholder="Ej: Complejo Deportivo San Lorenzo"
                    required
                  />
                </div>

                {/* Address Section */}
                <div className="form-section-title">
                  <span className="section-icon">📍</span>
                  <h4>Dirección</h4>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="direccion.calle">Calle *</label>
                    <input
                      type="text"
                      id="direccion.calle"
                      name="direccion.calle"
                      value={formData.direccion.calle}
                      onChange={handleInputChange}
                      placeholder="Ej: Av. San Martín"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="direccion.altura">Altura *</label>
                    <input
                      type="text"
                      id="direccion.altura"
                      name="direccion.altura"
                      value={formData.direccion.altura}
                      onChange={handleInputChange}
                      placeholder="Ej: 1234"
                      required
                    />
                  </div>
                </div>

                {/* Authentication Section */}
                <div className="form-section-title">
                  <span className="section-icon">🔐</span>
                  <h4>Acceso del Predio</h4>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">
                      Email del Predio {!editingPredio ? "*" : ""}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Ej: predio@ejemplo.com"
                      required={!editingPredio}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">
                      Contraseña {!editingPredio ? "*" : ""}
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder={
                        editingPredio
                          ? "Dejar vacío para mantener actual"
                          : "Mínimo 8 caracteres"
                      }
                      minLength="8"
                      required={!editingPredio}
                    />
                  </div>
                </div>

                <div className="form-info">
                  <p className="info-text">
                    <span className="info-icon">ℹ️</span>
                    {editingPredio
                      ? "Modifica el email o contraseña para actualizar las credenciales de acceso del predio."
                      : "El predio podrá usar estos datos para acceder a su propia interfaz de gestión."}
                  </p>
                </div>

                <div className="form-group">
                  <label htmlFor="direccion.localidad">Localidad *</label>
                  <select
                    id="direccion.localidad"
                    name="direccion.localidad"
                    value={formData.direccion.localidad}
                    onChange={handleInputChange}
                    required>
                    <option value="">Selecciona una localidad</option>
                    {localidades.map((localidad) => (
                      <option key={localidad._id} value={localidad.nombre}>
                        {localidad.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Hours Section */}
                <div className="form-section-title">
                  <span className="section-icon">🕒</span>
                  <h4>Horarios de Funcionamiento</h4>
                </div>

                {formData.horarios.map((horario, index) => (
                  <div key={index} className="horario-row">
                    <div className="form-group">
                      <label htmlFor={`horarios.${index}.desde`}>Desde</label>
                      <input
                        type="time"
                        id={`horarios.${index}.desde`}
                        name={`horarios.${index}.desde`}
                        value={horario.desde}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`horarios.${index}.hasta`}>Hasta</label>
                      <input
                        type="time"
                        id={`horarios.${index}.hasta`}
                        name={`horarios.${index}.hasta`}
                        value={horario.hasta}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    {formData.horarios.length > 1 && (
                      <button
                        type="button"
                        className="remove-horario"
                        onClick={() => removeHorario(index)}>
                        🗑️
                      </button>
                    )}
                  </div>
                ))}

                <Button
                  type="button"
                  variant="secondary"
                  onClick={addHorario}
                  className="add-horario">
                  ➕ Agregar Horario
                </Button>

                {/* Form Actions */}
                <div className="form-actions">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={isLoading}>
                    Cancelar
                  </Button>

                  <Button type="submit" variant="primary" disabled={isLoading}>
                    {isLoading
                      ? "Guardando..."
                      : editingPredio
                      ? "Actualizar"
                      : "Crear"}
                  </Button>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* Predios List */}
        <section className="predios-section">
          {predios.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏟️</div>
              <h3>No hay predios registrados</h3>
              <p>Comienza creando tu primer predio deportivo.</p>
              <Button
                variant="primary"
                onClick={() => setShowCreateForm(true)}
                className="create-first-button">
                Crear Predio
              </Button>
            </div>
          ) : (
            <div className="predios-grid">
              {predios.map((predio) => (
                <div key={predio._id} className="predio-card">
                  <div className="predio-header">
                    <h3 className="predio-name">{predio.nombrePredio}</h3>
                    <div className="predio-actions">
                      <button
                        className="action-button edit"
                        onClick={() => handleEdit(predio)}
                        title="Editar predio">
                        ✏️
                      </button>
                      <button
                        className="action-button delete"
                        onClick={() =>
                          handleDelete(predio._id, predio.nombrePredio)
                        }
                        title="Eliminar predio">
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="predio-info">
                    <div className="info-item">
                      <span className="info-icon">📍</span>
                      <span className="info-text">
                        {predio.direccion.calle} {predio.direccion.altura}
                      </span>
                    </div>

                    <div className="info-item">
                      <span className="info-icon">🏘️</span>
                      <span className="info-text">
                        {predio.direccion.localidad?.nombre ||
                          predio.direccion.localidad}
                      </span>
                    </div>

                    <div className="info-item">
                      <span className="info-icon">🕒</span>
                      <span className="info-text">
                        {predio.horarios.length > 0
                          ? `${predio.horarios[0].desde} - ${predio.horarios[0].hasta}`
                          : "Sin horarios definidos"}
                        {predio.horarios.length > 1 && (
                          <span className="extra-horarios">
                            {" "}
                            (+{predio.horarios.length - 1} más)
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="info-item">
                      <span className="info-icon">⚽</span>
                      <span className="info-text">
                        {predio.canchas?.length || 0}{" "}
                        {(predio.canchas?.length || 0) === 1
                          ? "cancha"
                          : "canchas"}
                      </span>
                    </div>

                    {predio.userEmail && (
                      <div className="info-item">
                        <span className="info-icon">📧</span>
                        <span className="info-text">{predio.userEmail}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Confirmar eliminación"
        message={`¿Estás seguro de que deseas eliminar el predio "${deleteConfirmation.predioName}"? Esta acción no se puede deshacer y se perderán todos los datos asociados.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
        isLoading={isLoading}
      />
    </main>
  );
};

export default VenueManagementPage;
