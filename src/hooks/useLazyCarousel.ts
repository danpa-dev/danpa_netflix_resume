import { useState, useRef, useEffect, useCallback } from 'react';
import { useIntersectionObserver, type IntersectionEntry } from './useIntersectionObserver';

/**
 * Lazy loading state for a carousel item
 */
interface LazyItemState {
  id: string;
  isVisible: boolean;
  isLoaded: boolean;
}

/**
 * Configuration for lazy loading behavior
 */
interface LazyCarouselOptions {
  preloadDistance?: number;
}

/**
 * Hook return type
 */
interface UseLazyCarouselReturn {
  lazyItems: LazyItemState[];
  observeItem: (id: string, element: Element) => void;
  unobserveItem: (id: string) => void;
  forceLoadItem: (id: string) => void;
}

/**
 * Custom hook for lazy loading carousel items with intersection observer
 *
 * Items are marked as loaded when they enter the viewport (or preload zone).
 * No artificial delays — content from static JSON is available immediately.
 */
export const useLazyCarousel = (
  items: Array<{ id: string }>,
  options: LazyCarouselOptions = {}
): UseLazyCarouselReturn => {
  const { preloadDistance = 100 } = options;

  const [lazyItems, setLazyItems] = useState<LazyItemState[]>([]);
  const itemRefs = useRef<Map<string, Element>>(new Map());

  // Initialize lazy items state
  useEffect(() => {
    setLazyItems(items.map(item => ({
      id: item.id,
      isVisible: false,
      isLoaded: false
    })));
  }, [items]);

  /**
   * Mark an item as loaded immediately when it becomes visible
   */
  const markLoaded = useCallback((itemId: string) => {
    setLazyItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, isLoaded: true } : item
      )
    );
  }, []);

  /**
   * Handle intersection change for an item
   */
  const handleIntersectionChange = useCallback((entry: IntersectionEntry) => {
    const itemId = entry.target.getAttribute('data-item-id');
    if (!itemId) return;

    setLazyItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, isVisible: entry.isIntersecting, isLoaded: item.isLoaded || entry.isIntersecting }
          : item
      )
    );
  }, []);

  // Use intersection observer with preload margin
  const { observeElement, unobserveElement } = useIntersectionObserver({
    rootMargin: `${preloadDistance}px`,
    threshold: 0.1
  }, handleIntersectionChange);

  /**
   * Observe a carousel item element
   */
  const observeItem = useCallback((id: string, element: Element) => {
    element.setAttribute('data-item-id', id);
    itemRefs.current.set(id, element);
    observeElement(element);
  }, [observeElement]);

  /**
   * Unobserve a carousel item element
   */
  const unobserveItem = useCallback((id: string) => {
    const element = itemRefs.current.get(id);
    if (element) {
      unobserveElement(element);
      itemRefs.current.delete(id);
    }
  }, [unobserveElement]);

  /**
   * Force load an item immediately
   */
  const forceLoadItem = useCallback((id: string) => {
    markLoaded(id);
  }, [markLoaded]);

  return {
    lazyItems,
    observeItem,
    unobserveItem,
    forceLoadItem
  };
};
