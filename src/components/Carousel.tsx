import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useResponsiveCarousel, useLazyCarousel } from '../hooks';
import ItemCard from './ItemCard';
import type { SeasonLite } from './SeasonSelector';
import type { ISectionModalConfig } from '../types/content';
import './Carousel.css';

interface CarouselItem {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  seasons?: Array<{ id?: string; title?: string; name?: string; description?: string; videoUrl?: string }>;
}

interface CarouselProps {
  title: string;
  items: CarouselItem[];
  className?: string;
  defaultThumbnailUrl?: string;
  modalConfig?: ISectionModalConfig;
}

const Carousel: React.FC<CarouselProps> = ({ 
  title, 
  items, 
  className = '',
  defaultThumbnailUrl,
  modalConfig
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isPointerDownRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragBlockClickRef = useRef(false);
  const scrollStopTimeoutRef = useRef<number | null>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  // Hover tracking removed; arrows follow scrollability only
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Use responsive carousel hook for dynamic sizing
  const { dimensions, getCSSProperties } = useResponsiveCarousel({
    containerRef,
    minCardWidth: 200,
    maxCardWidth: 400
  });

  // Use lazy loading hook for intersection-based visibility
  const {
    lazyItems,
    observeItem,
    unobserveItem,
    forceLoadItem
  } = useLazyCarousel(items, {
    preloadDistance: 150
  });

  // Check scroll position to enable/disable arrows
  const checkScrollPosition = () => {
    if (trackRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1); // -1 for precision
    }
  };

  // Handle wheel/touchpad: only intercept horizontal intent so vertical page scroll still works
  const handleWheel = useCallback((event: WheelEvent) => {
    const track = trackRef.current;
    if (!track) return;

    const { scrollLeft, scrollWidth, clientWidth } = track;
    const maxScrollLeft = scrollWidth - clientWidth;
    if (maxScrollLeft <= 0) return; // let page scroll normally

    const absDeltaX = Math.abs(event.deltaX);
    const isHorizontalIntent = absDeltaX >= 2 || event.shiftKey;
    if (!isHorizontalIntent) return;

    const horizontalDelta = absDeltaX > 0 ? event.deltaX : event.deltaY;
    if (horizontalDelta === 0) return;

    const nextScrollLeft = scrollLeft + horizontalDelta;
    const atLeftBoundary = scrollLeft <= 0 && horizontalDelta < 0;
    const atRightBoundary = scrollLeft >= maxScrollLeft && horizontalDelta > 0;
    if (atLeftBoundary || atRightBoundary) return;

    event.preventDefault();
    setIsUserScrolling(true);
    if (scrollStopTimeoutRef.current) {
      window.clearTimeout(scrollStopTimeoutRef.current);
    }
    scrollStopTimeoutRef.current = window.setTimeout(() => {
      setIsUserScrolling(false);
    }, 120);
    track.scrollLeft = Math.min(maxScrollLeft, Math.max(0, nextScrollLeft));
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    isPointerDownRef.current = true;
    isDraggingRef.current = false;
    dragStartXRef.current = event.clientX;
    dragStartScrollLeftRef.current = track.scrollLeft;
    setIsUserScrolling(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track || !isPointerDownRef.current) return;

    const deltaX = event.clientX - dragStartXRef.current;
    if (!isDraggingRef.current && Math.abs(deltaX) > 4) {
      isDraggingRef.current = true;
    }

    if (isDraggingRef.current) {
      event.preventDefault();
      track.scrollLeft = dragStartScrollLeftRef.current - deltaX;
    }
  };

  const handlePointerUp = () => {
    const track = trackRef.current;
    if (!track) return;
    if (isDraggingRef.current) {
      dragBlockClickRef.current = true;
    }
    isPointerDownRef.current = false;
    isDraggingRef.current = false;
    if (scrollStopTimeoutRef.current) {
      window.clearTimeout(scrollStopTimeoutRef.current);
    }
    scrollStopTimeoutRef.current = window.setTimeout(() => {
      setIsUserScrolling(false);
    }, 120);
  };

  const handlePointerCancel = () => {
    const track = trackRef.current;
    if (!track) return;
    isPointerDownRef.current = false;
    isDraggingRef.current = false;
    if (scrollStopTimeoutRef.current) {
      window.clearTimeout(scrollStopTimeoutRef.current);
    }
    scrollStopTimeoutRef.current = window.setTimeout(() => {
      setIsUserScrolling(false);
    }, 120);
  };

  const handleClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!dragBlockClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    dragBlockClickRef.current = false;
  };

  // Set up scroll position checking
  useEffect(() => {
    // Use a small delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(() => {
      checkScrollPosition();
    }, 0);

    const track = trackRef.current;
    if (track) {
      track.addEventListener('scroll', checkScrollPosition);
      // Add wheel handler with passive: false to allow preventDefault when needed
      track.addEventListener('wheel', handleWheel, { passive: false });
      // Also check on resize to handle initial render and window resizing
      const resizeObserver = new ResizeObserver(() => {
        checkScrollPosition();
      });
      resizeObserver.observe(track);

      return () => {
        clearTimeout(timeoutId);
        track.removeEventListener('scroll', checkScrollPosition);
        track.removeEventListener('wheel', handleWheel);
        resizeObserver.disconnect();
      };
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [items, handleWheel]);

  useEffect(() => {
    return () => {
      if (scrollStopTimeoutRef.current) {
        window.clearTimeout(scrollStopTimeoutRef.current);
      }
    };
  }, []);

  // Ensure initial viewport items are available immediately after lazy state initializes
  useEffect(() => {
    if (!items || items.length === 0) return;
    // Load the first window of items eagerly (e.g., first row)
    const initialCount = Math.min(items.length, 8);
    for (let i = 0; i < initialCount; i++) {
      forceLoadItem(items[i].id);
    }
  }, [items, forceLoadItem]);

  // State for bounce animation
  const [bouncingArrow, setBouncingArrow] = useState<'left' | 'right' | null>(null);

  // Scroll functions
  const scrollToDirection = (direction: 'left' | 'right', event?: React.MouseEvent) => {
    if (!trackRef.current) return;

    // Always prevent click-through to items underneath
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const track = trackRef.current;
    const { scrollLeft, scrollWidth, clientWidth } = track;

    // Check if we can actually scroll in this direction (with small threshold for precision)
    const canScroll = direction === 'left' 
      ? scrollLeft > 1
      : scrollLeft < scrollWidth - clientWidth - 1;

    if (!canScroll) {
      // Already at the limit - trigger bounce animation and prevent any action
      setBouncingArrow(direction);
      setTimeout(() => setBouncingArrow(null), 400);
      return;
    }

    // Use dynamic dimensions for accurate scroll calculation
    const scrollDistance = dimensions.cardWidth + dimensions.gapSize;

    const targetScrollLeft = direction === 'left' 
      ? track.scrollLeft - scrollDistance
      : track.scrollLeft + scrollDistance;

    // Clamp to valid scroll range
    const maxScroll = scrollWidth - clientWidth;
    const clampedScroll = Math.max(0, Math.min(maxScroll, targetScrollLeft));

    track.scrollTo({
      left: clampedScroll,
      behavior: 'smooth'
    });
  };

  // Arrows are shown via CSS hover on the container; disabled state still applies

  // Ref callback to observe carousel items
  const itemRefCallback = useCallback((element: HTMLDivElement | null, itemId: string) => {
    if (element) {
      observeItem(itemId, element);
    } else {
      unobserveItem(itemId);
    }
  }, [observeItem, unobserveItem]);

  return (
    <section 
      className={`carousel ${className}`}
      role="region"
      aria-labelledby={`carousel-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      {/* Section Title */}
      <div className="carousel-header">
        <h2 id={`carousel-${title.replace(/\s+/g, '-').toLowerCase()}`} className="carousel-title">{title}</h2>
      </div>
      
              {/* Horizontal Scrolling Container */}
        <div 
          ref={containerRef}
          className="carousel-container"
          style={getCSSProperties() as React.CSSProperties}
        >
        {/* Left Arrow - Only show when scrolling left is possible */}
        {canScrollLeft && (
          <motion.button
            className={`carousel-arrow carousel-arrow-left ${bouncingArrow === 'left' ? 'bounce' : ''}`}
            onClick={(e) => scrollToDirection('left', e)}
            aria-label="Previous items"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.button>
        )}

        {/* Right Arrow - Only show when scrolling right is possible */}
        {canScrollRight && (
          <motion.button
            className={`carousel-arrow carousel-arrow-right ${bouncingArrow === 'right' ? 'bounce' : ''}`}
            onClick={(e) => scrollToDirection('right', e)}
            aria-label="Next items"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.button>
        )}

        <div
          className={`carousel-track${isUserScrolling ? ' is-user-scrolling' : ''}`}
          ref={trackRef}
          role="list"
          aria-label={`${title} items`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onClickCapture={handleClickCapture}
        >
          {items.map((item) => {
            const lazyItem = lazyItems.find(li => li.id === item.id);
            const isLoaded = lazyItem?.isLoaded || false;

            return (
              <div 
                key={item.id} 
                className={`carousel-item ${isLoaded ? 'loaded' : ''}`}
                ref={(element) => itemRefCallback(element, item.id)}
                role="listitem"
              >
                {/* Loading Placeholder */}
                {!isLoaded && (
                  <div className="carousel-item-placeholder">
                    <div className="carousel-item-skeleton">
                      <div className="skeleton-thumbnail"></div>
                      <div className="skeleton-content">
                        <div className="skeleton-title"></div>
                        <div className="skeleton-description"></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actual Content - Only render when loaded */}
                {isLoaded && (
                  <ItemCard
                    item={item as unknown as Record<string, unknown>}
                    title={item.title}
                    description={item.description}
                    thumbnailUrl={item.thumbnailUrl}
                    videoMp4Url={item.videoUrl as string | undefined}
                    videoPosterUrl={item.thumbnailUrl}
                    seasons={item.seasons as SeasonLite[] | undefined}
                    defaultThumbnailUrl={defaultThumbnailUrl}
                    modalConfig={modalConfig}
                    onClick={() => console.log(`Clicked on ${item.title}`)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Carousel;
