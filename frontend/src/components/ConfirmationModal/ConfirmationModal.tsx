import React from 'react';
import './ConfirmationModal.css';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter') {
      onConfirm();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div 
      className="modal-backdrop" 
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="modal-content" role="dialog" aria-labelledby="modal-title" aria-describedby="modal-message">
        <h3 id="modal-title" className="modal-title">{title}</h3>
        <p id="modal-message" className="modal-message">{message}</p>
        <div className="modal-actions">
          <button
            onClick={onCancel}
            className="modal-btn modal-btn--cancel"
            disabled={isLoading}
            autoFocus
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="modal-btn modal-btn--confirm"
            disabled={isLoading}
          >
            {isLoading ? '...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;