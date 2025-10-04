import React, { useState, useEffect } from "react";
import Button from "../components/Button";
import UserDropdown from "../components/UserDropdown";
import { Logo } from "../components";
import { empresaService, userService, ApiError } from "../services";
import "./CompanyProfilePage.css";

/**
 * CompanyProfilePage component to display and edit company's profile information
 * @param {Object} props - Component props
 * @param {function} props.onNavigate - Navigation handler function
 * @param {Object} [props.user] - Logged-in user data
 * @param {function} [props.onUserUpdate] - Callback when user data is updated
 * @returns {JSX.Element} CompanyProfilePage component
 */
const CompanyProfilePage = ({ onNavigate, user, onUserUpdate }) => {
  // State for profile data and loading
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Form state for editing
  const [editForm, setEditForm] = useState({
    email: "",
    razonSocial: "",
    calle: "",
    altura: "",
    piso: "",
    dpto: "",
    localidad: "",
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
    const loadCompanyProfile = async () => {
      if (!user?._id || !user?.empresa?._id) {
        setError("No se pudo identificar la empresa");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        console.log("Loading company profile data for user:", user._id);

        // Load company data
        const companyData = await empresaService.getEmpresaById(
          user.empresa._id
        );
        console.log("Company profile data loaded:", companyData);

        // Combine user and company data
        const combinedData = {
          ...user,
          empresa: companyData,
        };

        setProfileData(combinedData);

        // Initialize edit form with current data
        setEditForm({
          email: user.email || "",
          razonSocial: companyData.razonSocial || "",
          calle: companyData.direccion?.calle || "",
          altura: companyData.direccion?.altura || "",
          piso: companyData.direccion?.piso || "",
          dpto: companyData.direccion?.dpto || "",
          localidad:
            typeof companyData.direccion?.localidad === "string"
              ? companyData.direccion.localidad
              : companyData.direccion?.localidad?.nombre || "",
        });
      } catch (err) {
        console.error("Failed to load company profile data:", err);

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

    loadCompanyProfile();
  }, [user]);

  /**
   * Load company profile data from the API (for retry functionality)
   */
  const loadProfileData = async () => {
    if (!user?._id || !user?.empresa?._id) {
      setError("No se pudo identificar la empresa");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("Loading company profile data for user:", user._id);

      // Load company data
      const companyData = await empresaService.getEmpresaById(user.empresa._id);
      console.log("Company profile data loaded:", companyData);

      // Combine user and company data
      const combinedData = {
        ...user,
        empresa: companyData,
      };

      setProfileData(combinedData);

      // Initialize edit form with current data
      setEditForm({
        email: user.email || "",
        razonSocial: companyData.razonSocial || "",
        calle: companyData.direccion?.calle || "",
        altura: companyData.direccion?.altura || "",
        piso: companyData.direccion?.piso || "",
        dpto: companyData.direccion?.dpto || "",
        localidad:
          typeof companyData.direccion?.localidad === "string"
            ? companyData.direccion.localidad
            : companyData.direccion?.localidad?.nombre || "",
      });
    } catch (err) {
      console.error("Failed to load company profile data:", err);

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
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  /**
   * Handle form submission for profile update
   */
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    // Validate form data
    if (!editForm.email.trim() || !/\S+@\S+\.\S+/.test(editForm.email)) {
      setError("Por favor, ingresa un email válido");
      return;
    }

    if (!editForm.razonSocial.trim()) {
      setError("La razón social es requerida");
      return;
    }

    if (!editForm.calle.trim() || !editForm.altura.trim()) {
      setError("La dirección (calle y altura) es requerida");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const userId = user._id;
      const empresaId = user.empresa._id;

      if (!userId || !empresaId) {
        throw new Error("No se pudo identificar el usuario o empresa");
      }

      // Prepare update data
      const empresaUpdateData = {
        razonSocial: editForm.razonSocial.trim(),
        direccion: {
          calle: editForm.calle.trim(),
          altura: editForm.altura.trim(),
          piso: editForm.piso.trim() || null,
          dpto: editForm.dpto.trim() || null,
          localidad: editForm.localidad.trim() || null,
        },
      };

      // Make API calls to update both user and empresa
      await Promise.all([
        // TODO: Add userService.updateUser when available
        // userService.updateUser(userId, userUpdateData),
        empresaService.updateEmpresa(empresaId, empresaUpdateData),
      ]);

      // Refresh the profile data to get the latest information
      const refreshedCompany = await empresaService.getEmpresaById(empresaId);
      const updatedProfileData = {
        ...profileData,
        email: editForm.email, // Update email in local state since we can't update it via API yet
        empresa: refreshedCompany,
      };

      // Update local state with refreshed data
      setProfileData(updatedProfileData);

      // Notify parent component about user data update
      if (onUserUpdate) {
        onUserUpdate({
          ...user,
          email: editForm.email,
          empresa: refreshedCompany,
        });
      }

      // Reset edit form with updated data
      setEditForm({
        email: editForm.email,
        razonSocial: refreshedCompany.razonSocial || "",
        calle: refreshedCompany.direccion?.calle || "",
        altura: refreshedCompany.direccion?.altura || "",
        piso: refreshedCompany.direccion?.piso || "",
        dpto: refreshedCompany.direccion?.dpto || "",
        localidad:
          typeof refreshedCompany.direccion?.localidad === "string"
            ? refreshedCompany.direccion.localidad
            : refreshedCompany.direccion?.localidad?.nombre || "",
      });

      setIsEditing(false);
      setSuccessMessage("Perfil actualizado correctamente");
    } catch (err) {
      console.error("Failed to update company profile:", err);

      if (err instanceof ApiError) {
        if (err.status === 409) {
          setError("El email ya está en uso por otro usuario");
        } else if (err.status === 400) {
          // Validation error - show detailed message
          const errorMessage = err.details?.details || err.message;
          setError(`Error de validación: ${errorMessage}`);
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
   * Handle cancel editing
   */
  const handleCancelEdit = () => {
    // Reset form to original data
    if (profileData) {
      setEditForm({
        email: profileData.email || "",
        razonSocial: profileData.empresa?.razonSocial || "",
        calle: profileData.empresa?.direccion?.calle || "",
        altura: profileData.empresa?.direccion?.altura || "",
        piso: profileData.empresa?.direccion?.piso || "",
        dpto: profileData.empresa?.direccion?.dpto || "",
        localidad:
          typeof profileData.empresa?.direccion?.localidad === "string"
            ? profileData.empresa.direccion.localidad
            : profileData.empresa?.direccion?.localidad?.nombre || "",
      });
    }
    setIsEditing(false);
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
   * Format address for display
   */
  const formatAddress = (direccion) => {
    if (!direccion || !direccion.calle || !direccion.altura) {
      return "No especificado";
    }

    const parts = [direccion.calle, direccion.altura];
    if (direccion.piso) parts.push(`Piso ${direccion.piso}`);
    if (direccion.dpto) parts.push(`Dpto ${direccion.dpto}`);

    let address = parts.filter(Boolean).join(" ");
    if (direccion.localidad) {
      const localidadName =
        typeof direccion.localidad === "string"
          ? direccion.localidad
          : direccion.localidad.nombre;
      if (localidadName) {
        address += `, ${localidadName}`;
      }
    }

    return address;
  };

  if (isLoading) {
    return (
      <main className="company-profile-page">
        <header className="company-profile-header">
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

        <div className="profile-container">
          <div className="loading-message">
            <span className="loading-icon">⏳</span>
            Cargando perfil de la empresa...
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="company-profile-page">
        <header className="company-profile-header">
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
    <main className="company-profile-page">
      {/* Header */}
      <header className="company-profile-header">
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

      <div className="profile-container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="profile-avatar">
              <span className="avatar-icon">🏢</span>
            </div>
            <h2 className="hero-title">Perfil de Empresa</h2>
            <p className="hero-description">
              Gestiona la información de tu empresa
            </p>
          </div>
        </section>

        {/* Profile Section */}
        <section className="profile-section">
          <div className="profile-card">
            <div className="card-header">
              <h3 className="card-title">Información de la Empresa</h3>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => {
                    setIsEditing(true);
                    setSuccessMessage(""); // Clear success message when entering edit mode
                  }}
                  className="edit-button">
                  Editar perfil
                </Button>
              )}
            </div>

            {successMessage && (
              <div className="success-message" role="alert">
                <span className="success-icon">✅</span>
                {successMessage}
              </div>
            )}

            {!isEditing ? (
              <div className="profile-info">
                <div className="info-row">
                  <span className="info-icon">📧</span>
                  <div className="info-content">
                    <span className="info-label">Email</span>
                    <span className="info-value">{profileData?.email}</span>
                  </div>
                </div>

                <div className="info-row">
                  <span className="info-icon">🏢</span>
                  <div className="info-content">
                    <span className="info-label">Razón Social</span>
                    <span className="info-value">
                      {profileData?.empresa?.razonSocial || "No especificado"}
                    </span>
                  </div>
                </div>

                <div className="info-row">
                  <span className="info-icon">📍</span>
                  <div className="info-content">
                    <span className="info-label">Dirección</span>
                    <span className="info-value">
                      {formatAddress(profileData?.empresa?.direccion)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <form
                className="profile-edit-form"
                onSubmit={handleUpdateProfile}>
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
                    placeholder="ejemplo@empresa.com"
                    autoComplete="email"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="razonSocial" className="field-label">
                    <span className="label-icon">🏢</span>
                    Razón Social
                  </label>
                  <input
                    type="text"
                    id="razonSocial"
                    name="razonSocial"
                    value={editForm.razonSocial}
                    onChange={handleInputChange}
                    className="field-input"
                    required
                    maxLength="100"
                    placeholder="Nombre legal de la empresa"
                    autoComplete="organization"
                  />
                </div>

                <div className="address-section">
                  <h4 className="address-title">
                    <span className="label-icon">📍</span>
                    Dirección
                  </h4>

                  <div className="form-row">
                    <div className="form-field">
                      <label htmlFor="calle" className="field-label">
                        Calle
                      </label>
                      <input
                        type="text"
                        id="calle"
                        name="calle"
                        value={editForm.calle}
                        onChange={handleInputChange}
                        className="field-input"
                        required
                        maxLength="100"
                        placeholder="Nombre de la calle"
                        autoComplete="address-line1"
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="altura" className="field-label">
                        Altura
                      </label>
                      <input
                        type="text"
                        id="altura"
                        name="altura"
                        value={editForm.altura}
                        onChange={handleInputChange}
                        className="field-input"
                        required
                        maxLength="10"
                        placeholder="Número"
                        autoComplete="address-line2"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label htmlFor="piso" className="field-label">
                        Piso (opcional)
                      </label>
                      <input
                        type="text"
                        id="piso"
                        name="piso"
                        value={editForm.piso}
                        onChange={handleInputChange}
                        className="field-input"
                        maxLength="5"
                        placeholder="Piso"
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="dpto" className="field-label">
                        Departamento (opcional)
                      </label>
                      <input
                        type="text"
                        id="dpto"
                        name="dpto"
                        value={editForm.dpto}
                        onChange={handleInputChange}
                        className="field-input"
                        maxLength="10"
                        placeholder="Dpto"
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="localidad" className="field-label">
                      Localidad (opcional)
                    </label>
                    <input
                      type="text"
                      id="localidad"
                      name="localidad"
                      value={editForm.localidad}
                      onChange={handleInputChange}
                      className="field-input"
                      maxLength="50"
                      placeholder="Ciudad o localidad"
                      autoComplete="address-level2"
                    />
                  </div>
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
                    variant="danger"
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
                    variant="danger"
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

export default CompanyProfilePage;
