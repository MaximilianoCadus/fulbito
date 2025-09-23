import React, { useState, useEffect } from "react";
import { healthService } from "../services";
import "./NetworkStatus.css";

/**
 * Network status indicator component
 * Shows connection status to the backend API
 * @returns {JSX.Element} NetworkStatus component
 */
const NetworkStatus = () => {
  const [status, setStatus] = useState("checking");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    checkServerConnection();

    // Check connection every 30 seconds
    const interval = setInterval(checkServerConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  const checkServerConnection = async () => {
    try {
      const health = await healthService.checkHealth();
      if (health.status === "healthy") {
        setStatus("connected");
        // Hide indicator after 3 seconds if connected
        setTimeout(() => setIsVisible(false), 3000);
      } else {
        setStatus("disconnected");
        setIsVisible(true);
      }
    } catch {
      setStatus("disconnected");
      setIsVisible(true);
    }
  };

  // Show indicator initially or when disconnected
  useEffect(() => {
    if (status === "checking" || status === "disconnected") {
      setIsVisible(true);
    }
  }, [status]);

  if (!isVisible) return null;

  const getStatusConfig = () => {
    switch (status) {
      case "checking":
        return {
          className: "network-status--checking",
          icon: "🔄",
          message: "Verificando conexión...",
          description: "Conectando con el servidor",
        };
      case "connected":
        return {
          className: "network-status--connected",
          icon: "✅",
          message: "Conectado",
          description: "Conexión estable con el servidor",
        };
      case "disconnected":
        return {
          className: "network-status--disconnected",
          icon: "⚠️",
          message: "Sin conexión",
          description:
            "No se puede conectar con el servidor. Verifica tu conexión.",
        };
      default:
        return {
          className: "",
          icon: "",
          message: "",
          description: "",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`network-status ${config.className}`}>
      <div className="network-status__content">
        <span className="network-status__icon">{config.icon}</span>
        <div className="network-status__text">
          <div className="network-status__message">{config.message}</div>
          <div className="network-status__description">
            {config.description}
          </div>
        </div>
        {status !== "checking" && (
          <button
            className="network-status__close"
            onClick={() => setIsVisible(false)}
            aria-label="Cerrar notificación">
            ×
          </button>
        )}
        {status === "disconnected" && (
          <button
            className="network-status__retry"
            onClick={checkServerConnection}
            aria-label="Reintentar conexión">
            🔄
          </button>
        )}
      </div>
    </div>
  );
};

export default NetworkStatus;
