import { useState, useEffect, useCallback } from 'react';

/**
 * Breakpoint configuration for responsive carousel behavior
 */
interface CarouselBreakpoint {
  minWidth: number;
  maxWidth?: number;
  cardCount: number;
  gapSize: number; // in px
}

/**
 * Calculated carousel dimensions
 */
interface CarouselDimensions {
  cardWidth: number;
  cardCount: number;
  gapSize: number;
  containerPadding: number;
}

/**
 * Configuration options for the responsive carousel hook
 */
interface UseResponsiveCarouselOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  minCardWidth?: number; // Minimum card width to prevent cards from being too small
  maxCardWidth?: number; // Maximum card width to prevent cards from being too large
}

/**
 * Default breakpoint configuration following the design system
 */
const DEFAULT_BREAKPOINTS: CarouselBreakpoint[] = [
  { minWidth: 0, maxWidth: 480, cardCount: 3, gapSize: 8 },     // Mobile: 3 cards, small gap
  { minWidth: 481, maxWidth: 768, cardCount: 3, gapSize: 12 },  // Large mobile: 3 cards, medium gap
  { minWidth: 769, maxWidth: 1024, cardCount: 4, gapSize: 16 }, // Tablet: 4 cards, medium gap
  { minWidth: 1025, maxWidth: 1440, cardCount: 5, gapSize: 20 }, // Desktop: 5 cards, large gap
  { minWidth: 1441, cardCount: 5, gapSize: 24 }                 // Large desktop: 5 cards, larger gap
];

/**
 * Custom hook for responsive carousel calculations
 * 
 * Calculates optimal card width based on:
 * - Current viewport width
 * - Desired number of cards per breakpoint
 * - Available container space
 * - Consistent gap spacing
 * 
 * @param options Configuration options for the hook
 * @returns Calculated carousel dimensions and utility functions
 */
export const useResponsiveCarousel = ({
  containerRef,
  minCardWidth = 200,
  maxCardWidth = 400
}: UseResponsiveCarouselOptions) => {
  const [dimensions, setDimensions] = useState<CarouselDimensions>({
    cardWidth: 300,
    cardCount: 4,
    gapSize: 16,
    containerPadding: 16
  });

  /**
   * Calculate optimal card dimensions based on current viewport and container size
   */
  const calculateDimensions = useCallback(() => {
    const viewportWidth = window.innerWidth;
    const container = containerRef.current;
    
    if (!container) {
      return;
    }

    // Get current breakpoint configuration
    const breakpoint = DEFAULT_BREAKPOINTS.find(bp => 
      viewportWidth >= bp.minWidth && (!bp.maxWidth || viewportWidth <= bp.maxWidth)
    ) || DEFAULT_BREAKPOINTS[DEFAULT_BREAKPOINTS.length - 1];

    // Get container dimensions
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    
    // Calculate padding based on viewport (using design system spacing)
    const containerPadding = viewportWidth <= 480 ? 8 : 
                            viewportWidth <= 768 ? 16 : 
                            viewportWidth <= 1024 ? 24 : 32;

    // Available width for cards and gaps
    const availableWidth = containerWidth - (containerPadding * 2);
    
    // Calculate total gap space needed
    const totalGapSpace = (breakpoint.cardCount - 1) * breakpoint.gapSize;
    
    // Calculate optimal card width
    const calculatedCardWidth = (availableWidth - totalGapSpace) / breakpoint.cardCount;
    
    // Apply min/max constraints
    const constrainedCardWidth = Math.max(
      minCardWidth, 
      Math.min(maxCardWidth, calculatedCardWidth)
    );

    // If card width hits constraints, we might need to adjust card count
    let finalCardCount = breakpoint.cardCount;
    let finalCardWidth = constrainedCardWidth;
    
    // If we hit the minimum width constraint, reduce card count if possible
    if (calculatedCardWidth < minCardWidth && breakpoint.cardCount > 2) {
      finalCardCount = Math.max(2, breakpoint.cardCount - 1);
      const newTotalGapSpace = (finalCardCount - 1) * breakpoint.gapSize;
      finalCardWidth = (availableWidth - newTotalGapSpace) / finalCardCount;
      finalCardWidth = Math.max(minCardWidth, Math.min(maxCardWidth, finalCardWidth));
    }

    setDimensions({
      cardWidth: Math.floor(finalCardWidth),
      cardCount: finalCardCount,
      gapSize: breakpoint.gapSize,
      containerPadding
    });
  }, [containerRef, minCardWidth, maxCardWidth]);

  /**
   * Debounced resize handler to prevent excessive calculations
   */
  const debouncedCalculate = useCallback(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const handler = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(calculateDimensions, 100);
    };
    return handler;
  }, [calculateDimensions]);

  // Set up resize listener
  useEffect(() => {
    const resizeHandler = debouncedCalculate();
    
    // Calculate initial dimensions
    calculateDimensions();
    
    // Add resize listener
    window.addEventListener('resize', resizeHandler);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, [calculateDimensions, debouncedCalculate]);

  // Recalculate when container ref changes
  useEffect(() => {
    if (containerRef.current) {
      calculateDimensions();
    }
  }, [containerRef, calculateDimensions]);

  /**
   * Get CSS custom properties for the calculated dimensions
   */
  const getCSSProperties = useCallback(() => ({
    '--carousel-card-width': `${dimensions.cardWidth}px`,
    '--carousel-gap-size': `${dimensions.gapSize}px`,
    '--carousel-container-padding': `${dimensions.containerPadding}px`,
    '--carousel-card-count': dimensions.cardCount.toString()
  }), [dimensions]);

  return {
    dimensions,
    getCSSProperties,
    recalculate: calculateDimensions
  };
};
