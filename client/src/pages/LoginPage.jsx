import React, { useState } from "react";
import Button from "../components/Button";
import FormField from "../components/FormField";
import { Logo } from "../components";
import { userService, ApiError } from "../services";
import "./LoginPage.css";

const LoginPage = ({ onNavigate, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    contraseña: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "El email es requerido";
    if (!emailRegex.test(email)) return "Formato de email inválido";
    if (email.length > 254) return "Email demasiado largo";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "La contraseña es requerida";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newErrors = {};
    newErrors.email = validateEmail(formData.email);
    newErrors.contraseña = validatePassword(formData.contraseña);

    Object.keys(newErrors).forEach((key) => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        console.log("Attempting login:", { email: formData.email });

        const result = await userService.login({
          email: formData.email,
          contraseña: formData.contraseña,
        });

        console.log("Login successful!", result);

        if (onLoginSuccess) {
          onLoginSuccess(result.user);
        } else {
          const userType = result.user.tipoUsuario;
          const userName =
            userType === "jugador"
              ? `${result.user.jugador?.nombre || "Usuario"}`
              : result.user.empresa?.razonSocial || "Empresa";

          setErrors({
            submit: `¡Bienvenido${
              userType === "jugador" ? "" : "a"
            }, ${userName}! Redirigiendo...`,
          });

          setTimeout(() => {
            console.log(`Redirecting ${userType} to dashboard`);
            if (onNavigate) {
              onNavigate("dashboard");
            }
          }, 1500);
        }
      } catch (error) {
        console.error("Login failed:", error);

        if (error instanceof ApiError) {
          console.log("API Error details:", {
            status: error.status,
            data: error.data,
            message: error.message,
          });

          // Handle specific error codes from backend
          if (error.data?.code) {
            switch (error.data.code) {
              case "MISSING_CREDENTIALS": {
                setErrors({
                  submit: "Email y contraseña son requeridos",
                });
                break;
              }

              case "INVALID_CREDENTIALS": {
                setErrors({
                  submit:
                    "Email o contraseña incorrectos. Verifica tus datos e intenta nuevamente.",
                });
                break;
              }

              case "INTERNAL_SERVER_ERROR": {
                setErrors({
                  submit:
                    "Error interno del servidor. Por favor, intenta más tarde.",
                });
                break;
              }

              default: {
                setErrors({
                  submit: error.getUserMessage() || "Error al iniciar sesión",
                });
                break;
              }
            }
          } else {
            // Fallback error handling
            if (error.status === 401) {
              setErrors({
                submit:
                  "Email o contraseña incorrectos. Verifica tus datos e intenta nuevamente.",
              });
            } else if (error.isNetworkError()) {
              setErrors({
                submit:
                  "Error de conexión. Verifica que el servidor esté funcionando.",
              });
            } else {
              setErrors({
                submit: error.getUserMessage() || "Error al iniciar sesión",
              });
            }
          }
        } else {
          setErrors({
            submit:
              "Error inesperado al iniciar sesión. Por favor, intenta nuevamente.",
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

  // Handle navigate to register
  const handleRegisterClick = () => {
    console.log("Navigating to register page");
    if (onNavigate) onNavigate("register");
  };

  return (
    <main className="login-page">
      <div className="login-container">
        {/* Header */}
        <header className="login-header">
          <button
            type="button"
            className="back-button"
            onClick={handleBackClick}
            aria-label="Volver a la página principal">
            ← Volver
          </button>

          <div className="login-logo">
            <Logo size="40" className="login-logo-icon" />
            <h1 className="login-logo-text">Fulbito!</h1>
          </div>

          <h2 className="login-title">Iniciar sesión</h2>
          <p className="login-subtitle">
            Accede a tu cuenta para gestionar tus reservas
          </p>
        </header>

        {/* Login Form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <section className="form-section">
            <h3 className="form-section-title">Credenciales de acceso</h3>

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
              autoComplete="email"
            />

            <FormField
              label="Contraseña"
              name="contraseña"
              type="password"
              value={formData.contraseña}
              onChange={handleInputChange}
              error={errors.contraseña}
              required
              placeholder="Tu contraseña"
              disabled={isSubmitting}
              autoComplete="current-password"
            />
          </section>

          {/* Submit Error or Success */}
          {errors.submit && (
            <div
              className={
                errors.submit.includes("Bienvenido")
                  ? "form-success"
                  : "form-error"
              }
              role="alert">
              {errors.submit}
            </div>
          )}

          {/* Submit Button */}
          <div className="login-actions">
            <Button
              type="submit"
              variant="primary"
              size="large"
              disabled={isSubmitting}
              className="login-submit">
              {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>

            <p className="login-register-link">
              ¿No tienes una cuenta?{" "}
              <button
                type="button"
                className="link-button"
                onClick={handleRegisterClick}>
                Registrarse
              </button>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
};

export default LoginPage;
