import React, { useEffect, useRef, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FocusTrap } from '../utils/focusTrap';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
  layoutId?: string;
  triggerPosition?: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  onBeforeClose?: () => boolean | Promise<boolean>;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  className = '',
  layoutId,
  triggerPosition,
  onBeforeClose,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const focusTrapRef = useRef<FocusTrap | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  // Enhanced close handler with confirmation support
  const handleClose = useCallback(async () => {
    if (onBeforeClose) {
      try {
        const shouldClose = await onBeforeClose();
        if (shouldClose) {
          onClose();
        }
      } catch (error) {
        console.error('Error in onBeforeClose:', error);
        // If onBeforeClose throws an error, still allow closing
        onClose();
      }
    } else {
      onClose();
    }
  }, [onClose, onBeforeClose]);

  // Handle Escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && closeOnEscape) {
        event.preventDefault();
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey, { capture: true });
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey, { capture: true });
    };
  }, [isOpen, closeOnEscape, handleClose]);

  // Handle overlay click
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === overlayRef.current && closeOnOverlayClick) {
      handleClose();
    }
  };

  // Focus management and focus trapping
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Initialize focus trap
      focusTrapRef.current = new FocusTrap({
        container: modalRef.current,
        onEscape: handleClose
      });
    }

    return () => {
      // Cleanup focus trap
      if (focusTrapRef.current) {
        focusTrapRef.current.destroy();
        focusTrapRef.current = null;
      }
    };
  }, [isOpen, handleClose]);

  // Background isolation: inert and aria-hidden on root app container
  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;

    const anyRoot = root as unknown as { inert?: boolean };

    if (isOpen) {
      root.setAttribute('aria-hidden', 'true');
      if (typeof anyRoot.inert !== 'undefined') {
        anyRoot.inert = true;
      } else {
        root.setAttribute('inert', '');
      }
    } else {
      root.removeAttribute('aria-hidden');
      if (typeof anyRoot.inert !== 'undefined') {
        anyRoot.inert = false;
      } else {
        root.removeAttribute('inert');
      }
    }

    return () => {
      root.removeAttribute('aria-hidden');
      if (typeof anyRoot.inert !== 'undefined') {
        anyRoot.inert = false;
      } else {
        root.removeAttribute('inert');
      }
    };
  }, [isOpen]);

  // Animation variants
  const overlayVariants = {
    hidden: { 
      opacity: 0,
      backdropFilter: 'blur(0px)'
    },
    visible: { 
      opacity: 1,
      backdropFilter: 'blur(4px)'
    },
    exit: {
      opacity: 0,
      backdropFilter: 'blur(0px)'
    }
  };

  const modalVariants = {
    hidden: triggerPosition ? {
      scale: 0.9,
      opacity: 0,
      x: (triggerPosition.x - (window.innerWidth / 2) + (triggerPosition.width / 2)) * 0.3,
      y: (triggerPosition.y - (window.innerHeight / 2) + (triggerPosition.height / 2)) * 0.3
    } : {
      scale: 0.9,
      opacity: 0,
      y: 10
    },
    visible: { 
      scale: 1,
      opacity: 1,
      x: 0,
      y: 0
    },
    exit: triggerPosition ? {
      scale: 0.9,
      opacity: 0,
      x: (triggerPosition.x - (window.innerWidth / 2) + (triggerPosition.width / 2)) * 0.3,
      y: (triggerPosition.y - (window.innerHeight / 2) + (triggerPosition.height / 2)) * 0.3
    } : {
      scale: 0.9,
      opacity: 0,
      y: 10
    }
  };

  // Create portal to render modal outside normal DOM hierarchy
  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div 
          className={`modal-overlay ${className}`}
          ref={overlayRef}
          onClick={handleOverlayClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={descriptionId}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{
            duration: 0.2,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
        <motion.div 
          className="modal-container"
          ref={modalRef}
          tabIndex={-1}
          role="document"
          data-layout-id={layoutId}
          variants={modalVariants}
          layoutId={layoutId}
          transition={{
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.05
          }}
        >
        {/* Floating Close Button (no header band) */}
        {showCloseButton && (
          <button
            className="modal-close-button modal-close-floating"
            onClick={(event) => {
              event.preventDefault();
              handleClose();
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleClose();
              }
            }}
            aria-label="Close modal"
            type="button"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {/* Modal Content */}
        <div className="modal-content" id={descriptionId} aria-live="polite">
          {children}
        </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Modal; 