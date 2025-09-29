import React, { useState } from "react";
import Button from "../components/Button";
import FormField from "../components/FormField";
import UserTypeToggle from "../components/UserTypeToggle";
import LocalitySelect from "../components/LocalitySelect";
import MobileNumberField from "../components/MobileNumberField";
import { Logo } from "../components";
import { userService, ApiError } from "../services";
import "./RegisterPage.css";

/**
 * Registration page component for the Fulbito app
 * Supports both player and company registration with proper validation
 * @param {Object} props - Component props
 * @param {function} props.onNavigate - Navigation handler function
 * @returns {JSX.Element} RegisterPage component
 */
const RegisterPage = ({ onNavigate }) => {
  // Form state
  const [userType, setUserType] = useState("jugador");
  const [formData, setFormData] = useState({
    // Common fields
    email: "",
    contraseña: "",
    confirmarContraseña: "",

    // Player fields
    nombre: "",
    apellido: "",
    nroCelular: "",

    // Company fields
    cuit: "",
    razonSocial: "",
    calle: "",
    altura: "",
    piso: "",
    dpto: "",
    codigoPostal: "",
    localidad: "",
  });

  // Form errors and success state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle user type change
  const handleUserTypeChange = (type) => {
    setUserType(type);
    // Clear type-specific errors when switching
    const commonFields = ["email", "contraseña", "confirmarContraseña"];
    const newErrors = {};
    Object.keys(errors).forEach((key) => {
      if (commonFields.includes(key)) {
        newErrors[key] = errors[key];
      }
    });
    setErrors(newErrors);
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "El email es requerido";
    if (!emailRegex.test(email)) return "Formato de email inválido";
    if (email.length > 254) return "Email demasiado largo";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "La contraseña es requerida";
    if (password.length < 8)
      return "La contraseña debe tener al menos 8 caracteres";
    if (password.length > 60) return "La contraseña es demasiado larga";
    return "";
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return "Confirma tu contraseña";
    if (password !== confirmPassword) return "Las contraseñas no coinciden";
    return "";
  };

  const validateCellPhone = (phone) => {
    if (!phone) return "El número de celular es requerido";

    // Argentina mobile format: +549XXXXXXXXX (E.164 format)
    // Must start with +549 followed by 10 digits (area code + number)
    const argentinaPhoneRegex = /^\+549\d{10}$/;

    if (!argentinaPhoneRegex.test(phone)) {
      return "Formato de celular argentino inválido";
    }

    return "";
  };

  const validateCuit = (cuit) => {
    const cuitRegex = /^\d{11}$/;
    if (!cuit) return "El CUIT es requerido";
    if (!cuitRegex.test(cuit)) return "El CUIT debe tener 11 dígitos";
    return "";
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate all fields
    const newErrors = {};

    // Common validations
    newErrors.email = validateEmail(formData.email);
    newErrors.contraseña = validatePassword(formData.contraseña);
    newErrors.confirmarContraseña = validateConfirmPassword(
      formData.contraseña,
      formData.confirmarContraseña
    );

    // Type-specific validations
    if (userType === "jugador") {
      if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido";
      else if (formData.nombre.length > 50)
        newErrors.nombre = "El nombre es demasiado largo";

      if (!formData.apellido.trim())
        newErrors.apellido = "El apellido es requerido";
      else if (formData.apellido.length > 50)
        newErrors.apellido = "El apellido es demasiado largo";

      newErrors.nroCelular = validateCellPhone(formData.nroCelular);
    } else if (userType === "empresa") {
      newErrors.cuit = validateCuit(formData.cuit);

      if (!formData.razonSocial.trim())
        newErrors.razonSocial = "La razón social es requerida";
      else if (formData.razonSocial.length > 100)
        newErrors.razonSocial = "La razón social es demasiado larga";

      if (!formData.calle.trim()) newErrors.calle = "La calle es requerida";
      else if (formData.calle.length > 100)
        newErrors.calle = "La calle es demasiado larga";

      if (!formData.altura.trim()) newErrors.altura = "La altura es requerida";
      else if (formData.altura.length > 10)
        newErrors.altura = "La altura es demasiado larga";

      if (formData.piso && formData.piso.length > 10)
        newErrors.piso = "El piso es demasiado largo";
      if (formData.dpto && formData.dpto.length > 10)
        newErrors.dpto = "El departamento es demasiado largo";

      if (!formData.localidad)
        newErrors.localidad = "La localidad es requerida";
    }

    // Remove empty errors
    Object.keys(newErrors).forEach((key) => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);
    setIsSuccess(false); // Reset success state on validation errors

    // If no errors, submit form
    if (Object.keys(newErrors).length === 0) {
      try {
        let registrationData;
        let result;

        if (userType === "jugador") {
          // Prepare player registration data
          registrationData = {
            email: formData.email,
            contraseña: formData.contraseña,
            nombre: formData.nombre,
            apellido: formData.apellido,
            nroCelular: formData.nroCelular,
          };

          console.log("Registering player:", registrationData);
          result = await userService.registerPlayer(registrationData);
        } else {
          // Prepare company registration data
          registrationData = {
            email: formData.email,
            contraseña: formData.contraseña,
            cuit: formData.cuit,
            razonSocial: formData.razonSocial,
            direccion: {
              calle: formData.calle,
              altura: formData.altura,
              piso: formData.piso || undefined,
              dpto: formData.dpto || undefined,
              localidad: formData.localidad,
            },
          };

          console.log("Registering company:", registrationData);
          result = await userService.registerCompany(registrationData);
        }

        console.log("Registration successful!", result);

        // Show success message and redirect to login
        const userName =
          userType === "jugador"
            ? result.jugador.nombre
            : result.empresa.razonSocial;

        // Set success state and message
        setIsSuccess(true);
        setErrors({
          submit: `¡Registro exitoso! Bienvenido${
            userType === "jugador" ? "" : "a"
          }, ${userName}! Redirigiendo al inicio de sesión...`,
        });

        // Redirect to login page after a brief delay
        setTimeout(() => {
          if (onNavigate) {
            onNavigate("login");
          }
        }, 2000);
      } catch (error) {
        console.error("Registration failed:", error);
        setIsSuccess(false); // Reset success state

        if (error instanceof ApiError) {
          // Enhanced error handling with specific messages
          console.log("API Error details:", {
            status: error.status,
            data: error.data,
            isConflict: error.isConflictError(),
            isValidation: error.isValidationError(),
            fullError: error,
          });

          console.log("Full error response:", error.data);
          console.log("Attempted registration with email:", formData.email);

          // Handle specific error codes from backend
          if (error.data?.code) {
            switch (error.data.code) {
              case "EMAIL_EXISTS":
              case "USER_EMAIL_EXISTS": {
                console.log("Email conflict detected:", {
                  attemptedEmail: formData.email,
                  existingEmail: error.data?.existingEmail,
                  errorData: error.data,
                });
                setErrors({
                  email: error.data?.existingEmail
                    ? `Este email ya está registrado (encontrado: ${error.data.existingEmail}). Por favor, utiliza otro email.`
                    : "Este email ya está registrado. Por favor, utiliza otro email.",
                  submit: "",
                });
                break;
              }

              case "CUIT_EXISTS": {
                setErrors({
                  cuit: "Este CUIT ya está registrado. Una empresa con este CUIT ya existe en el sistema.",
                  submit: "",
                });
                break;
              }

              case "MISSING_FIELDS": {
                const missingFields = error.data.missingFields || [];
                const fieldErrors = {};
                missingFields.forEach((field) => {
                  fieldErrors[field] = "Este campo es requerido";
                });
                setErrors({
                  ...fieldErrors,
                  submit: `Faltan campos requeridos: ${missingFields.join(
                    ", "
                  )}`,
                });
                break;
              }

              case "MISSING_ADDRESS_FIELDS": {
                const missingAddressFields = error.data.missingFields || [];
                const addressErrors = {};
                missingAddressFields.forEach((field) => {
                  addressErrors[field] = "Este campo de dirección es requerido";
                });
                setErrors({
                  ...addressErrors,
                  submit: `Faltan campos de dirección: ${missingAddressFields.join(
                    ", "
                  )}`,
                });
                break;
              }

              case "LOCALITY_NOT_FOUND": {
                const suggestions = error.data.suggestions || [];
                let localityMessage = `No se encontró la localidad: "${error.data.searchedLocality}"`;
                if (suggestions.length > 0) {
                  localityMessage += `. Localidades disponibles: ${suggestions.join(
                    ", "
                  )}`;
                }
                setErrors({
                  localidad: localityMessage,
                  submit: "",
                });
                break;
              }

              case "EMPRESA_VALIDATION_ERROR": {
                const validationErrors = error.data.validationErrors || [];
                setErrors({
                  submit: `Error de validación: ${validationErrors.join(". ")}`,
                });
                break;
              }

              case "USER_VALIDATION_ERROR": {
                const userValidationErrors = error.data.validationErrors || [];
                setErrors({
                  submit: `Error en datos del usuario: ${userValidationErrors.join(
                    ". "
                  )}`,
                });
                break;
              }

              case "PASSWORD_HASH_ERROR": {
                setErrors({
                  submit:
                    "Error interno al procesar la contraseña. Por favor, intenta nuevamente.",
                });
                break;
              }

              case "INTERNAL_SERVER_ERROR": {
                setErrors({
                  submit:
                    "Error interno del servidor. Por favor, contacta al administrador del sistema.",
                });
                break;
              }

              default: {
                // Fallback to original error handling
                if (error.isConflictError()) {
                  setErrors({
                    email:
                      "El email ya está registrado. Intenta con otro email.",
                    submit: "",
                  });
                } else if (error.isValidationError()) {
                  setErrors({
                    submit: error.getUserMessage(),
                  });
                } else {
                  setErrors({
                    submit:
                      error.getUserMessage() ||
                      error.data?.error ||
                      "Error desconocido al registrar",
                  });
                }
                break;
              }
            }
          } else {
            // Original error handling for backward compatibility
            if (error.isConflictError()) {
              setErrors({
                email: "El email ya está registrado. Intenta con otro email.",
                submit: "",
              });
            } else if (error.isValidationError()) {
              setErrors({
                submit: error.getUserMessage(),
              });
            } else if (error.isNetworkError()) {
              setErrors({
                submit:
                  "Error de conexión. Verifica que el servidor esté funcionando.",
              });
            } else {
              setErrors({
                submit: error.getUserMessage(),
              });
            }
          }
        } else {
          setErrors({
            submit:
              "Error inesperado al registrar. Por favor, intenta nuevamente.",
          });
        }
      }
    }

    setIsSubmitting(false);
  };

  // Handle back to welcome page
  const handleBackClick = () => {
    console.log("Navigating back to welcome page");
    if (onNavigate) onNavigate("welcome");
  };

  return (
    <main className="register-page">
      <div className="register-container">
        {/* Header */}
        <header className="register-header">
          <button
            type="button"
            className="back-button"
            onClick={handleBackClick}
            aria-label="Volver a la página principal">
            ← Volver
          </button>

          <div className="register-logo">
            <Logo size="40" className="register-logo-icon" />
            <h1 className="register-logo-text">Fulbito!</h1>
          </div>

          <h2 className="register-title">Crear cuenta</h2>
          <p className="register-subtitle">
            Únete a la comunidad de Fulbito y comienza a reservar
          </p>
        </header>

        {/* Registration Form */}
        <form className="register-form" onSubmit={handleSubmit} noValidate>
          {/* User Type Selection */}
          <UserTypeToggle
            selectedType={userType}
            onTypeChange={handleUserTypeChange}
            disabled={isSubmitting}
          />

          {/* Common Fields */}
          <section className="form-section">
            <h3 className="form-section-title">Información de cuenta</h3>

            <FormField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              required
              placeholder="tu@email.com"
              maxLength={254}
              disabled={isSubmitting}
            />

            <FormField
              label="Contraseña"
              name="contraseña"
              type="password"
              value={formData.contraseña}
              onChange={handleInputChange}
              error={errors.contraseña}
              required
              placeholder="Mínimo 8 caracteres"
              maxLength={60}
              disabled={isSubmitting}
            />

            <FormField
              label="Confirmar contraseña"
              name="confirmarContraseña"
              type="password"
              value={formData.confirmarContraseña}
              onChange={handleInputChange}
              error={errors.confirmarContraseña}
              required
              placeholder="Repite tu contraseña"
              maxLength={60}
              disabled={isSubmitting}
            />
          </section>

          {/* Player-specific Fields */}
          {userType === "jugador" && (
            <section className="form-section">
              <h3 className="form-section-title">Información personal</h3>

              <div className="form-row">
                <FormField
                  label="Nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  error={errors.nombre}
                  required
                  placeholder="Tu nombre"
                  maxLength={50}
                  disabled={isSubmitting}
                />

                <FormField
                  label="Apellido"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  error={errors.apellido}
                  required
                  placeholder="Tu apellido"
                  maxLength={50}
                  disabled={isSubmitting}
                />
              </div>

              <MobileNumberField
                value={formData.nroCelular}
                onChange={handleInputChange}
                error={errors.nroCelular}
                required
                disabled={isSubmitting}
              />
            </section>
          )}

          {/* Company-specific Fields */}
          {userType === "empresa" && (
            <>
              <section className="form-section">
                <h3 className="form-section-title">Información de empresa</h3>

                <FormField
                  label="CUIT"
                  name="cuit"
                  value={formData.cuit}
                  onChange={handleInputChange}
                  error={errors.cuit}
                  required
                  placeholder="12345678901"
                  maxLength={11}
                  pattern="\d{11}"
                  disabled={isSubmitting}
                />

                <FormField
                  label="Razón social"
                  name="razonSocial"
                  value={formData.razonSocial}
                  onChange={handleInputChange}
                  error={errors.razonSocial}
                  required
                  placeholder="Nombre de la empresa"
                  maxLength={100}
                  disabled={isSubmitting}
                />
              </section>

              <section className="form-section">
                <h3 className="form-section-title">Dirección</h3>

                <div className="form-row">
                  <FormField
                    label="Calle"
                    name="calle"
                    value={formData.calle}
                    onChange={handleInputChange}
                    error={errors.calle}
                    required
                    placeholder="Av. Corrientes"
                    maxLength={100}
                    disabled={isSubmitting}
                  />

                  <FormField
                    label="Altura"
                    name="altura"
                    value={formData.altura}
                    onChange={handleInputChange}
                    error={errors.altura}
                    required
                    placeholder="1234"
                    maxLength={10}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-row">
                  <FormField
                    label="Piso"
                    name="piso"
                    value={formData.piso}
                    onChange={handleInputChange}
                    error={errors.piso}
                    placeholder="5"
                    maxLength={10}
                    disabled={isSubmitting}
                  />

                  <FormField
                    label="Departamento"
                    name="dpto"
                    value={formData.dpto}
                    onChange={handleInputChange}
                    error={errors.dpto}
                    placeholder="A"
                    maxLength={10}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-row">
                  <LocalitySelect
                    value={formData.localidad}
                    onChange={handleInputChange}
                    onPostalCodeChange={handleInputChange}
                    error={errors.localidad}
                    required
                    disabled={isSubmitting}
                  />

                  {/* Display selected postal code (read-only) */}
                  {formData.codigoPostal && (
                    <FormField
                      label="Código postal"
                      name="codigoPostal"
                      value={formData.codigoPostal}
                      onChange={() => {}} // Read-only
                      error={errors.codigoPostal}
                      disabled={true}
                      placeholder="Auto-completado"
                    />
                  )}
                </div>
              </section>
            </>
          )}

          {/* Submit Error or Success */}
          {errors.submit && (
            <div
              className={isSuccess ? "form-success" : "form-error"}
              role="alert">
              {errors.submit}
            </div>
          )}

          {/* Submit Button */}
          <div className="register-actions">
            <Button
              type="submit"
              variant="primary"
              size="large"
              disabled={isSubmitting}
              className="register-submit">
              {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
            </Button>

            <p className="register-login-link">
              ¿Ya tienes una cuenta?{" "}
              <button
                type="button"
                className="link-button"
                onClick={() => onNavigate && onNavigate("login")}>
                Iniciar sesión
              </button>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
};

export default RegisterPage;
