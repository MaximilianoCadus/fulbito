import React, { useEffect, useRef } from "react";
import Button from "./Button";
import "./ConfirmationModal.css";

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

  useEffect(() => {
    if (isOpen && confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

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
