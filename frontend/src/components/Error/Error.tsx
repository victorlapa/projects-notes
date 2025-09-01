import { useEffect } from 'react';
import './Error.css';

interface ErrorProps {
  message: string | null;
  onDismiss?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
  variant?: 'error' | 'warning' | 'info';
}

function Error({ 
  message, 
  onDismiss, 
  autoClose = false, 
  autoCloseDelay = 5000,
  variant = 'error' 
}: ErrorProps) {
  useEffect(() => {
    if (autoClose && message && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [message, autoClose, autoCloseDelay, onDismiss]);

  if (!message) return null;

  return (
    <div className={`error-message error-message--${variant}`} role="alert">
      <span className="error-text">{message}</span>
      {onDismiss && (
        <button 
          onClick={onDismiss}
          className="error-dismiss"
          aria-label="Dismiss error"
          type="button"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default Error;