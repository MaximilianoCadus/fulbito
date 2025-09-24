import React, { useState, useEffect } from "react";
import Button from "../components/Button";
import UserDropdown from "../components/UserDropdown";
import { userService, ApiError } from "../services";
import "./PlayerProfilePage.css";

/**
 * PlayerProfilePage component to display and edit player's profile information
 * @param {Object} props - Component props
 * @param {function} props.onNavigate - Navigation handler function
 * @param {Object} [props.user] - Logged-in user data
 * @returns {JSX.Element} PlayerProfilePage component
 */
const PlayerProfilePage = ({ onNavigate, user }) => {
  // State for profile data and loading
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileSuccessMessage, setProfileSuccessMessage] = useState("");
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Form state for editing
  const [editForm, setEditForm] = useState({
    nombre: "",
    apellido: "",
    nroCelular: "",
    email: "",
  });

  // Password change form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    errors: [],
  });

  // Load profile data on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user?._id) {
        setError("No se pudo identificar el usuario");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        console.log("Loading profile data for user:", user._id);
        const result = await userService.getUserById(user._id);
        console.log("Profile data loaded:", result);

        setProfileData(result);

        // Initialize edit form with current data
        setEditForm({
          nombre: result.jugador?.nombre || "",
          apellido: result.jugador?.apellido || "",
          nroCelular: result.jugador?.nroCelular || "",
          email: result.email || "",
        });
      } catch (err) {
        console.error("Failed to load profile data:", err);

        if (err instanceof ApiError) {
          setError(err.getUserMessage());
        } else {
          setError(
            "Error al cargar los datos del perfil. Por favor, intenta nuevamente."
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [user]);

  /**
   * Load user's profile data from the API (for retry functionality)
   */
  const loadProfileData = async () => {
    if (!user?._id) {
      setError("No se pudo identificar el usuario");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("Loading profile data for user:", user._id);
      const result = await userService.getUserById(user._id);
      console.log("Profile data loaded:", result);

      setProfileData(result);

      // Initialize edit form with current data
      setEditForm({
        nombre: result.jugador?.nombre || "",
        apellido: result.jugador?.apellido || "",
        nroCelular: result.jugador?.nroCelular || "",
        email: result.email || "",
      });
    } catch (err) {
      console.error("Failed to load profile data:", err);

      if (err instanceof ApiError) {
        setError(err.getUserMessage());
      } else {
        setError(
          "Error al cargar los datos del perfil. Por favor, intenta nuevamente."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle input changes in edit form
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear any existing messages when user starts typing
    if (error) {
      setError("");
    }
    if (profileSuccessMessage) {
      setProfileSuccessMessage("");
    }
  };

  /**
   * Handle form submission for profile update
   */
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    // Validate form data
    if (!editForm.nombre.trim() || !editForm.apellido.trim()) {
      setError("El nombre y apellido son requeridos");
      return;
    }

    if (!editForm.email.trim() || !/\S+@\S+\.\S+/.test(editForm.email)) {
      setError("Por favor, ingresa un email válido");
      return;
    }

    if (!editForm.nroCelular.trim()) {
      setError("El número de celular es requerido");
      return;
    }

    // Validate phone number format
    const phoneRegex = /^\+549\d{10}$/;
    if (!phoneRegex.test(editForm.nroCelular)) {
      setError("El formato del número de celular debe ser +549XXXXXXXXXX");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const userId = profileData?._id || user?._id;
      const jugadorId = profileData?.jugador?._id;

      if (!userId || !jugadorId) {
        throw new Error(
          "No se pudo identificar el usuario o perfil de jugador"
        );
      }

      // Update user data (email)
      const userUpdateData = {
        email: editForm.email.trim().toLowerCase(),
      };

      // Update jugador data (nombre, apellido, nroCelular)
      const jugadorUpdateData = {
        nombre: editForm.nombre.trim(),
        apellido: editForm.apellido.trim(),
        nroCelular: editForm.nroCelular.trim(),
      };

      // Make API calls to update both user and jugador
      await Promise.all([
        userService.updateUser(userId, userUpdateData),
        userService.updateJugador(jugadorId, jugadorUpdateData),
      ]);

      // Refresh the profile data to get the latest information
      const refreshedUser = await userService.getUserById(userId);

      // Update local state with refreshed data
      setProfileData(refreshedUser);

      // Reset edit form with updated data
      setEditForm({
        nombre: refreshedUser.jugador?.nombre || "",
        apellido: refreshedUser.jugador?.apellido || "",
        nroCelular: refreshedUser.jugador?.nroCelular || "",
        email: refreshedUser.email || "",
      });

      setIsEditing(false);
      setProfileSuccessMessage("Perfil actualizado correctamente");
    } catch (err) {
      console.error("Failed to update profile:", err);

      if (err instanceof ApiError) {
        if (err.status === 409) {
          setError("El email ya está en uso por otro usuario");
        } else {
          setError(err.getUserMessage());
        }
      } else {
        setError(
          "Error al actualizar el perfil. Por favor, intenta nuevamente."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle password form input changes
   */
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    const newPasswordForm = {
      ...passwordForm,
      [name]: value,
    };

    setPasswordForm(newPasswordForm);

    // Clear any existing messages when user starts typing
    if (error) {
      setError("");
    }
    if (passwordSuccessMessage) {
      setPasswordSuccessMessage("");
    }

    // Validate password in real-time
    validatePassword(newPasswordForm);
  };

  /**
   * Validate password requirements
   */
  const validatePassword = (formData) => {
    const errors = [];
    const { newPassword, confirmPassword } = formData;

    // Password length requirement (8 or more characters)
    if (newPassword.length < 8) {
      errors.push("La contraseña debe tener al menos 8 caracteres");
    }

    // Password confirmation
    if (confirmPassword && newPassword !== confirmPassword) {
      errors.push("Las contraseñas no coinciden");
    }

    const isValid =
      errors.length === 0 &&
      newPassword.length > 0 &&
      confirmPassword.length > 0;

    setPasswordValidation({
      isValid,
      errors,
    });
  };

  /**
   * Handle password change form submission
   */
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!passwordValidation.isValid) {
      setError("Por favor, corrige los errores en el formulario de contraseña");
      return;
    }

    if (!passwordForm.currentPassword.trim()) {
      setError("La contraseña actual es requerida");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const userId = profileData?._id || user?._id;
      if (!userId) {
        throw new Error("No se pudo identificar el usuario");
      }

      // First verify current password by attempting login
      await userService.login({
        email: profileData?.email || user?.email,
        contraseña: passwordForm.currentPassword,
      });

      // If login successful, update password
      await userService.changePassword(userId, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      // Reset form and close password change
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordValidation({ isValid: false, errors: [] });
      setIsChangingPassword(false);

      setPasswordSuccessMessage("Contraseña actualizada correctamente");
    } catch (err) {
      console.error("Failed to change password:", err);

      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError("La contraseña actual es incorrecta");
        } else {
          setError(err.getUserMessage());
        }
      } else {
        setError(
          "Error al cambiar la contraseña. Por favor, intenta nuevamente."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle cancel password change
   */
  const handleCancelPasswordChange = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordValidation({ isValid: false, errors: [] });
    setIsChangingPassword(false);
    setError("");
    setPasswordSuccessMessage(""); // Clear success message when canceling
  };

  /**
   * Handle cancel editing
   */
  const handleCancelEdit = () => {
    // Reset form to original data
    if (profileData) {
      setEditForm({
        nombre: profileData.jugador?.nombre || "",
        apellido: profileData.jugador?.apellido || "",
        nroCelular: profileData.jugador?.nroCelular || "",
        email: profileData.email || "",
      });
    }
    setIsEditing(false);
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
   * Format phone number for display
   */
  const formatPhoneNumber = (phone) => {
    if (!phone) return "No especificado";
    // Format +549XXXXXXXXXX to +54 9 XXX XXX XXXX
    const match = phone.match(/^\+549(\d{2})(\d{4})(\d{4})$/);
    if (match) {
      return `+54 9 ${match[1]} ${match[2]} ${match[3]}`;
    }
    return phone;
  };

  if (isLoading) {
    return (
      <main className="player-profile-page">
        <header className="player-profile-header">
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

        <div className="profile-container">
          <div className="loading-message">
            <span className="loading-icon">⏳</span>
            Cargando perfil...
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="player-profile-page">
        <header className="player-profile-header">
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

        <div className="profile-container">
          <div className="error-message" role="alert">
            <span className="error-icon">⚠️</span>
            {error}
            <Button
              variant="secondary"
              size="small"
              onClick={loadProfileData}
              className="retry-button">
              Intentar nuevamente
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="player-profile-page">
      {/* Header */}
      <header className="player-profile-header">
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

      <div className="profile-container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="profile-avatar">
              <span className="avatar-icon">👤</span>
            </div>
            <h2 className="hero-title">Mi Perfil</h2>
            <p className="hero-description">
              Gestiona tu información personal y configuración de cuenta
            </p>
          </div>
        </section>

        {/* Profile Section */}
        <section className="profile-section">
          <div className="profile-card">
            <div className="card-header">
              <h3 className="card-title">Información Personal</h3>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => {
                    setIsEditing(true);
                    setProfileSuccessMessage(""); // Clear success message when entering edit mode
                  }}
                  className="edit-button">
                  Editar perfil
                </Button>
              )}
            </div>

            {profileSuccessMessage && (
              <div className="success-message" role="alert">
                <span className="success-icon">✅</span>
                {profileSuccessMessage}
              </div>
            )}

            {!isEditing ? (
              <div className="profile-info">
                <div className="info-row">
                  <span className="info-icon">👤</span>
                  <div className="info-content">
                    <span className="info-label">Nombre completo</span>
                    <span className="info-value">
                      {profileData?.jugador?.nombre}{" "}
                      {profileData?.jugador?.apellido}
                    </span>
                  </div>
                </div>

                <div className="info-row">
                  <span className="info-icon">📧</span>
                  <div className="info-content">
                    <span className="info-label">Email</span>
                    <span className="info-value">{profileData?.email}</span>
                  </div>
                </div>

                <div className="info-row">
                  <span className="info-icon">📱</span>
                  <div className="info-content">
                    <span className="info-label">Número de celular</span>
                    <span className="info-value">
                      {formatPhoneNumber(profileData?.jugador?.nroCelular)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <form
                className="profile-edit-form"
                onSubmit={handleUpdateProfile}>
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="nombre" className="field-label">
                      <span className="label-icon">👤</span>
                      Nombre
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={editForm.nombre}
                      onChange={handleInputChange}
                      className="field-input"
                      required
                      maxLength="50"
                      minLength="2"
                      placeholder="Ingresa tu nombre"
                      autoComplete="given-name"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="apellido" className="field-label">
                      <span className="label-icon">👤</span>
                      Apellido
                    </label>
                    <input
                      type="text"
                      id="apellido"
                      name="apellido"
                      value={editForm.apellido}
                      onChange={handleInputChange}
                      className="field-input"
                      required
                      maxLength="50"
                      minLength="2"
                      placeholder="Ingresa tu apellido"
                      autoComplete="family-name"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="email" className="field-label">
                    <span className="label-icon">📧</span>
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleInputChange}
                    className="field-input"
                    required
                    placeholder="ejemplo@email.com"
                    autoComplete="email"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="nroCelular" className="field-label">
                    <span className="label-icon">📱</span>
                    Número de celular
                  </label>
                  <input
                    type="tel"
                    id="nroCelular"
                    name="nroCelular"
                    value={editForm.nroCelular}
                    onChange={handleInputChange}
                    className="field-input"
                    placeholder="+549XXXXXXXXXX"
                    required
                    pattern="^\+549\d{10}$"
                    title="Formato: +549XXXXXXXXXX (10 dígitos después del 9)"
                    autoComplete="tel"
                  />
                </div>

                <div className="form-actions">
                  <Button
                    type="submit"
                    variant="primary"
                    size="medium"
                    disabled={isLoading}
                    className="save-button">
                    {isLoading ? "Guardando..." : "Guardar cambios"}
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    size="medium"
                    onClick={handleCancelEdit}
                    disabled={isLoading}
                    className="cancel-button">
                    Cancelar
                  </Button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* Password Change Section */}
        <section className="password-section">
          <div className="password-card">
            <div className="card-header">
              <h3 className="card-title">Cambiar Contraseña</h3>
              {!isChangingPassword && (
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => {
                    setIsChangingPassword(true);
                    setPasswordSuccessMessage(""); // Clear success message when entering edit mode
                  }}
                  className="change-password-button">
                  Cambiar contraseña
                </Button>
              )}
            </div>

            {passwordSuccessMessage && (
              <div className="success-message" role="alert">
                <span className="success-icon">✅</span>
                {passwordSuccessMessage}
              </div>
            )}

            {!isChangingPassword ? (
              <div className="password-info">
                <div className="info-row">
                  <span className="info-icon">🔒</span>
                  <div className="info-content">
                    <span className="info-label">Contraseña</span>
                    <span className="info-value">••••••••</span>
                  </div>
                </div>
                <p className="password-hint">
                  Cambia tu contraseña regularmente para mantener tu cuenta
                  segura
                </p>
              </div>
            ) : (
              <form
                className="password-change-form"
                onSubmit={handleChangePassword}>
                <div className="form-field">
                  <label htmlFor="currentPassword" className="field-label">
                    <span className="label-icon">🔓</span>
                    Contraseña actual
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordInputChange}
                    className="field-input"
                    required
                    autoComplete="current-password"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="newPassword" className="field-label">
                    <span className="label-icon">🔒</span>
                    Nueva contraseña
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordInputChange}
                    className="field-input"
                    required
                    autoComplete="new-password"
                  />
                  {passwordForm.newPassword && (
                    <div className="password-strength">
                      <div className="strength-indicator">
                        <div
                          className={`strength-bar ${
                            passwordForm.newPassword.length >= 12
                              ? "strong"
                              : passwordForm.newPassword.length >= 8
                              ? "medium"
                              : "weak"
                          }`}
                        />
                      </div>
                      <span className="strength-label">
                        {passwordForm.newPassword.length >= 12
                          ? "Contraseña segura"
                          : passwordForm.newPassword.length >= 8
                          ? "Contraseña fuerte"
                          : "Contraseña débil"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="confirmPassword" className="field-label">
                    <span className="label-icon">🔒</span>
                    Confirmar nueva contraseña
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordInputChange}
                    className="field-input"
                    required
                    autoComplete="new-password"
                  />
                </div>

                {passwordValidation.errors.length > 0 && (
                  <div className="password-requirements">
                    <h4 className="requirements-title">
                      Requisitos de contraseña:
                    </h4>
                    <ul className="requirements-list">
                      {passwordValidation.errors.map((error, index) => (
                        <li key={index} className="requirement-item">
                          <span className="requirement-icon">❌</span>
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="form-actions">
                  <Button
                    type="submit"
                    variant="primary"
                    size="medium"
                    disabled={!passwordValidation.isValid}
                    className="save-password-button">
                    Cambiar contraseña
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    size="medium"
                    onClick={handleCancelPasswordChange}
                    className="cancel-password-button">
                    Cancelar
                  </Button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default PlayerProfilePage;
