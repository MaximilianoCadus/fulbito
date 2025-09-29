import React, { useEffect, useRef } from "react";
import Button from "./Button";
import "./ConfirmationModal.css";

/**
 * ConfirmationModal component for custom confirmation dialogs
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {function} props.onClose - Handler to close the modal
 * @param {function} props.onConfirm - Handler for confirmation action
 * @param {string} props.title - Modal title
 * @param {string} props.message - Main confirmation message
 * @param {string} [props.confirmText] - Text for confirm button (default: "Confirmar")
 * @param {string} [props.cancelText] - Text for cancel button (default: "Cancelar")
 * @param {string} [props.confirmVariant] - Button variant for confirm button (default: "danger")
 * @param {boolean} [props.isLoading] - Whether the confirm action is loading
 * @returns {JSX.Element} ConfirmationModal component
 */
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmVariant = "danger",
  isLoading = false,
}) => {
  const modalRef = useRef(null);
  const confirmButtonRef = useRef(null);

  // Focus management
  useEffect(() => {
    if (isOpen && confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }
  }, [isOpen]);

  // Don't render if not open
  if (!isOpen) return null;

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle keyboard events
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "Enter") {
      onConfirm();
    }
  };

  return (
    <div
      className="confirmation-modal-backdrop"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-message">
      <div className="confirmation-modal" ref={modalRef}>
        <div className="modal-header">
          <h3 id="modal-title" className="modal-title">
            {title}
          </h3>
          <button
            className="modal-close-button"
            onClick={onClose}
            aria-label="Cerrar modal"
            disabled={isLoading}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p id="modal-message" className="modal-message">
            {message}
          </p>
        </div>

        <div className="modal-actions">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="modal-cancel-button">
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={isLoading}
            className="modal-confirm-button"
            ref={confirmButtonRef}>
            {isLoading ? "Procesando..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
