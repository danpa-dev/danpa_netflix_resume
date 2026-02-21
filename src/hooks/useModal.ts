import { useState, useCallback, useRef, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  isClosing: boolean;
  closeWithConfirmation: (confirmationMessage?: string) => Promise<boolean>;
  triggerPosition: Position | null;
  setTriggerPosition: (position: Position) => void;
  isAnimating: boolean;
  setIsAnimating: (animating: boolean) => void;
}

/**
 * Custom hook for managing modal state, scroll lock, and animation position tracking
 */
const useModal = (initialState: boolean = false): UseModalReturn => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [isClosing, setIsClosing] = useState(false);
  const [triggerPosition, setTriggerPosition] = useState<Position | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollPositionRef = useRef<number>(0);

  const open = useCallback(() => {
    // Capture current scroll position
    scrollPositionRef.current = window.scrollY;

    // Apply position fixed with negative top to maintain visual position
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPositionRef.current}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';

    // Preserve body width to prevent layout shift from scrollbar removal
    document.body.style.width = '100%';

    setIsOpen(true);
    setIsClosing(false);
  }, []);

  const close = useCallback(() => {
    setIsClosing(true);

    // Extract the saved scroll position from the negative top value
    const bodyTop = document.body.style.top;
    const scrollY = bodyTop ? parseInt(bodyTop || '0') * -1 : 0;

    // Set scroll behavior to auto to prevent smooth scrolling
    const html = document.documentElement;
    html.style.scrollBehavior = 'auto';

    // Remove position fixed and restore scroll in one go
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.overflow = '';
    document.body.style.width = '';

    // Immediately restore scroll position
    window.scrollTo(0, scrollY);

    // Small delay to allow exit animations to complete
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 250);
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  const closeWithConfirmation = useCallback(async (confirmationMessage?: string): Promise<boolean> => {
    if (confirmationMessage) {
      const confirmed = window.confirm(confirmationMessage);
      if (confirmed) {
        close();
        return true;
      }
      return false;
    } else {
      close();
      return true;
    }
  }, [close]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
    isClosing,
    closeWithConfirmation,
    triggerPosition,
    setTriggerPosition,
    isAnimating,
    setIsAnimating
  };
};

export default useModal;
