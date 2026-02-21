import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Configuration options for the intersection observer
 */
interface IntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
}

/**
 * Intersection observer entry with additional metadata
 */
export interface IntersectionEntry {
  target: Element;
  isIntersecting: boolean;
  intersectionRatio: number;
  boundingClientRect: DOMRectReadOnly;
  rootBounds: DOMRectReadOnly | null;
  time: number;
}

/**
 * Hook return type
 */
interface UseIntersectionObserverReturn {
  ref: React.RefObject<HTMLElement | null>;
  isIntersecting: boolean;
  intersectionRatio: number;
  observeElement: (element: Element) => void;
  unobserveElement: (element: Element) => void;
}

/**
 * Custom hook for intersection observer
 *
 * Provides lazy loading and visibility detection for carousel items
 * and other scrollable content.
 */
export const useIntersectionObserver = (
  options: IntersectionObserverOptions = {},
  onIntersectionChange?: (entry: IntersectionEntry) => void
): UseIntersectionObserverReturn => {
  const ref = useRef<HTMLElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [intersectionRatio, setIntersectionRatio] = useState(0);

  // Track observed elements for cleanup
  const observedElements = useRef<Set<Element>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  /**
   * Initialize intersection observer
   */
  const initializeObserver = useCallback(() => {
    if (typeof IntersectionObserver === 'undefined') {
      console.warn('IntersectionObserver not supported in this browser');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Update state for the main ref
          if (entry.target === ref.current) {
            setIsIntersecting(entry.isIntersecting);
            setIntersectionRatio(entry.intersectionRatio);
          }

          // Call optional callback
          if (onIntersectionChange) {
            onIntersectionChange({
              target: entry.target,
              isIntersecting: entry.isIntersecting,
              intersectionRatio: entry.intersectionRatio,
              boundingClientRect: entry.boundingClientRect,
              rootBounds: entry.rootBounds,
              time: entry.time
            });
          }
        });
      },
      {
        root: options.root || null,
        rootMargin: options.rootMargin || '0px',
        threshold: options.threshold || 0
      }
    );

    observerRef.current = observer;

    // Observe the main ref if it exists
    if (ref.current) {
      observer.observe(ref.current);
    }

    return observer;
  }, [options.root, options.rootMargin, options.threshold, onIntersectionChange]);

  /**
   * Observe a specific element
   */
  const observeElement = useCallback((element: Element) => {
    if (observerRef.current && !observedElements.current.has(element)) {
      observerRef.current.observe(element);
      observedElements.current.add(element);
    }
  }, []);

  /**
   * Unobserve a specific element
   */
  const unobserveElement = useCallback((element: Element) => {
    if (observerRef.current && observedElements.current.has(element)) {
      observerRef.current.unobserve(element);
      observedElements.current.delete(element);
    }
  }, []);

  // Initialize observer on mount
  useEffect(() => {
    const observer = initializeObserver();
    const elements = observedElements.current;

    return () => {
      if (observer) {
        observer.disconnect();
      }
      elements.clear();
    };
  }, [initializeObserver]);

  // Observe ref when it changes
  useEffect(() => {
    const element = ref.current;
    if (observerRef.current && element) {
      observerRef.current.observe(element);
    }
  }, []);

  return {
    ref,
    isIntersecting,
    intersectionRatio,
    observeElement,
    unobserveElement
  };
};
