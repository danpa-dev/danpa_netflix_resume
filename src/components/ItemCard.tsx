import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import SkeletonLoader from './SkeletonLoader';
const Modal = lazy(() => import('./Modal'));
const VideoPlayer = lazy(() => import('./VideoPlayer'));
import SeasonSelector, { type SeasonLite } from './SeasonSelector';
import useModal from '../hooks/useModal';
import './ItemCard.css';
import type { ISectionModalConfig } from '../types/content';

interface ItemCardProps {
  item?: Record<string, unknown>;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  className?: string;
  onClick?: () => void;
  videoMp4Url?: string;
  videoWebmUrl?: string;
  videoPosterUrl?: string;
  seasons?: SeasonLite[];
  defaultThumbnailUrl?: string;
  modalConfig?: ISectionModalConfig;
}

interface ImageState {
  isLoading: boolean;
  isLoaded: boolean;
  hasError: boolean;
  isVisible: boolean;
  currentSrc: string | null;
}

const ItemCard: React.FC<ItemCardProps> = ({
  item,
  title,
  description,
  thumbnailUrl,
  className = '',
  onClick,
  videoMp4Url,
  videoWebmUrl,
  videoPosterUrl,
  seasons,
  defaultThumbnailUrl,
  modalConfig
}) => {
  const { isOpen, open, close, triggerPosition, setTriggerPosition, setIsAnimating } = useModal();
  const cardRef = useRef<HTMLDivElement>(null);
  const [imageState, setImageState] = useState<ImageState>({
    isLoading: false,
    isLoaded: false,
    hasError: false,
    isVisible: false,
    currentSrc: null
  });

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedSeasonIndex, setSelectedSeasonIndex] = useState<number>(0);

  const defaultThumbnail = defaultThumbnailUrl;

  // Derive current season overrides if provided
  const currentSeason: SeasonLite | undefined = seasons && seasons[selectedSeasonIndex];
  const effectiveVideoUrl = (currentSeason?.videoUrl as string | undefined) || videoMp4Url;
  const effectiveDescription = currentSeason?.description || description;
  const itemData = item || {};
  const modalHeading = modalConfig?.heading || 'Details';
  const modalFields = modalConfig?.fields || [];

  const formatDate = (value: string | undefined) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
  };

  const getDateRange = () => {
    const seasonData = currentSeason as Record<string, unknown> | undefined;
    const start = (seasonData?.startDate as string) || (itemData.startDate as string | undefined);
    const end = (seasonData?.endDate as string) || (itemData.endDate as string | undefined);
    if (!start && !end) return '';
    const startLabel = start ? formatDate(start) : '';
    const endLabel = end ? formatDate(end) : (itemData.isCurrent ? 'Present' : '');
    if (startLabel && endLabel) return `${startLabel} - ${endLabel}`;
    return startLabel || endLabel || '';
  };

  const getFieldValue = (key: string): unknown => {
    switch (key) {
      case 'title':
        return title;
      case 'description':
        return effectiveDescription;
      case 'dates':
        return getDateRange();
      case 'location':
        return itemData.location;
      case 'company':
      case 'role': {
        const sv = currentSeason ? (currentSeason as Record<string, unknown>)[key] : undefined;
        if (sv) return sv;
        return itemData[key];
      }
      case 'institution':
      case 'degree':
      case 'field':
      case 'organization':
      case 'impact':
        return itemData[key];
      case 'hoursPerWeek':
        return itemData.hoursPerWeek ? `${itemData.hoursPerWeek} hrs/week` : '';
      case 'technologies':
      case 'achievements':
      case 'features':
      case 'challenges':
      case 'solutions':
      case 'skills': {
        const seasonValue = currentSeason ? (currentSeason as Record<string, unknown>)[key] : undefined;
        if (Array.isArray(seasonValue) && seasonValue.length > 0) return seasonValue;
        return Array.isArray(itemData[key]) ? itemData[key] : [];
      }
      case 'relevantCoursework':
        return Array.isArray(itemData[key]) ? itemData[key] : [];
      case 'githubUrl':
      case 'liveUrl':
      case 'companyUrl':
      case 'institutionUrl':
        return itemData[key];
      default:
        return itemData[key];
    }
  };

  const renderFieldValue = (key: string, value: unknown) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    if (Array.isArray(value)) {
      return (
        <ul className="modal-detail-list">
          {value.map((entry) => (
            <li key={String(entry)}>{String(entry)}</li>
          ))}
        </ul>
      );
    }
    if (key.endsWith('Url')) {
      return (
        <a href={String(value)} target="_blank" rel="noopener noreferrer">
          {String(value)}
        </a>
      );
    }
    return <span>{String(value)}</span>;
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!containerRef.current) {
      // If no container yet (SSR/tests), eagerly set thumbnail to avoid blank
      const initialSrc = thumbnailUrl || defaultThumbnail || null;
      setImageState(prev => ({
        ...prev,
        isVisible: true,
        isLoading: Boolean(initialSrc),
        currentSrc: initialSrc
      }));
      return;
    }

    const node = containerRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Initialize currentSrc when item becomes visible
            const initialSrc = thumbnailUrl || defaultThumbnail || null;
            setImageState(prev => ({
              ...prev,
              isVisible: true,
              isLoading: Boolean(initialSrc),
              currentSrc: initialSrc
            }));
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.1
      }
    );

    observer.observe(node);

    return () => {
      observer.unobserve(node);
    };
  }, [thumbnailUrl, defaultThumbnail]);

  // Image load handlers
  const handleImageLoad = () => {
    setImageState(prev => ({ 
      ...prev, 
      isLoading: false, 
      isLoaded: true 
    }));
  };

  const handleImageError = () => {
    // Try a single fallback to the default thumbnail if available
    setImageState(prev => {
      const fallback = defaultThumbnail || null;
      const shouldUseFallback = fallback && prev.currentSrc !== fallback;
      if (shouldUseFallback) {
        return {
          ...prev,
          isLoading: true,
          isLoaded: false,
          hasError: false,
          currentSrc: fallback
        };
      }
      return {
        ...prev,
        isLoading: false,
        hasError: true
      };
    });
  };

  // Generate optimized image sources
  const renderImage = () => {
    if (!imageState.currentSrc) {
      return (
        <div className="item-card-placeholder" role="img" aria-label={`No image available for ${title}`}>
          <div className="item-card-placeholder-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path 
                d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" 
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
      );
    }

    if (imageState.hasError) {
      return (
        <div className="item-card-error" role="img" aria-label={`Image failed to load for ${title}`}>
          <div className="item-card-error-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path 
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" 
                fill="currentColor"
              />
            </svg>
          </div>
          <span className="item-card-error-text">Image unavailable</span>
        </div>
      );
    }

    const imgEl = (
      <img
        ref={imageRef}
        src={imageState.currentSrc as string}
        alt={`${title} thumbnail`}
        className={`item-card-image ${imageState.isLoaded ? 'loaded' : ''} ${imageState.isLoading ? 'loading' : ''}`}
        loading="lazy"
        onLoad={handleImageLoad}
        onError={handleImageError}
        sizes="(max-width: 480px) 33vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
        decoding="async"
        fetchPriority="low"
      />
    );

    return imgEl;
  };

  // Animation variants
  const cardVariants = {
    initial: { 
      scale: 1,
      boxShadow: "0 0 0 rgba(0, 0, 0, 0)"
    },
    hover: { 
      scale: 1.05,
      boxShadow: "0 8px 25px rgba(0, 0, 0, 0.3)"
    },
    tap: {
      scale: 1.02
    }
  };

  const overlayVariants = {
    initial: { 
      y: "100%",
      opacity: 0
    },
    hover: { 
      y: "0%",
      opacity: 1
    }
  };

  const chevronVariants = {
    initial: { 
      opacity: 0,
      x: -10,
      scale: 0.8
    },
    hover: { 
      opacity: 1,
      x: 0,
      scale: 1
    }
  };

  const imageVariants = {
    initial: { 
      scale: 1
    },
    hover: { 
      scale: 1.1
    }
  };

  // Handle keyboard interactions
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };



  const handleCardClick = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setTriggerPosition({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      });
      setIsAnimating(true);
    }
    open();
    onClick?.();
  };

  const handleModalClose = () => {
    close();
    setIsAnimating(false);
  };

  const modalLayoutId = `modal-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <>
      <motion.div 
        ref={cardRef}
        className={`item-card u-hover-lift ${className}`}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`View details for ${title}`}
        aria-describedby={`item-card-desc-${title.replace(/\s+/g, '-').toLowerCase()}`}
        aria-pressed="false"
        aria-busy={imageState.isLoading}
        variants={cardVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        whileFocus="hover"
        transition={{
          duration: 0.2,
          ease: "easeOut"
        }}
        layout
      >
      {/* 16:9 Aspect Ratio Container */}
      <div className="item-card-container" ref={containerRef}>
        {/* Image Container */}
        <motion.div 
          className="item-card-image-container"
          variants={imageVariants}
          transition={{
            duration: 0.3,
            ease: "easeOut"
          }}
        >
          {/* Loading Skeleton */}
          {imageState.isLoading && !imageState.isLoaded && (
            <SkeletonLoader
              className="item-card-skeleton"
              ariaLabel={`Loading image for ${title}`}
            />
          )}
          
          {/* Image or Placeholder */}
          {renderImage()}
        </motion.div>

        {/* Title Overlay */}
        <motion.div 
          className="item-card-overlay"
          variants={overlayVariants}
          transition={{
            duration: 0.2,
            ease: "easeOut"
          }}
        >
          <div className="item-card-content">
            <h3 className="item-card-title">{title}</h3>
            {description && (
              <p 
                className="item-card-description"
                id={`item-card-desc-${title.replace(/\s+/g, '-').toLowerCase()}`}
              >
                {description}
              </p>
            )}
            {/* Screen reader only description for loading states */}
            <div className="sr-only" aria-live="polite">
              {imageState.isLoading && 'Loading image'}
              {imageState.hasError && 'Image failed to load'}
            </div>
          </div>
          
          {/* More Info Chevron */}
          <motion.div 
            className="item-card-chevron"
            variants={chevronVariants}
            transition={{
              duration: 0.2,
              ease: "easeOut",
              delay: 0.1
            }}
            aria-hidden="true"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path 
                d="M9 18L15 12L9 6" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>

          {/* Detail Modal */}
      <Suspense fallback={null}>
      <Modal
        isOpen={isOpen}
        onClose={handleModalClose}
        title={title}
        layoutId={modalLayoutId}
        triggerPosition={triggerPosition}
        closeOnOverlayClick={true}
        closeOnEscape={true}
        showCloseButton={true}
      >
        <div className="modal-detail-content">
          <div className="modal-video-section full-bleed">

            {/* Animated swap for video section */}
            <motion.div
              key={effectiveVideoUrl || 'video-placeholder'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {effectiveVideoUrl || videoWebmUrl ? (
                <Suspense fallback={<div className="modal-video-placeholder" /> }>
                  <VideoPlayer
                    srcMp4={effectiveVideoUrl}
                    srcWebm={videoWebmUrl}
                    poster={videoPosterUrl || thumbnailUrl}
                    autoPlay
                    muted
                    loop
                  />
                </Suspense>
              ) : (
                <div className="modal-video-placeholder">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                    <path d="M8 5v14l11-7z" fill="currentColor" />
                  </svg>
                  <p>Video content would go here</p>
                </div>
              )}
            </motion.div>

            {/* Media overlay: title only (left) */}
            <div className="modal-media-overlay">
              <h2 className="modal-media-title" id={modalLayoutId + '-title'}>{title}</h2>
            </div>
          </div>

          {/* Season selector row below the video, aligned to the right */}
          {seasons && seasons.length > 0 && (
            <div className="modal-season-row">
              <SeasonSelector
                seasons={seasons}
                selectedIndex={selectedSeasonIndex}
                onChange={setSelectedSeasonIndex}
              />
            </div>
          )}
        
        {modalFields.length > 0 && (
          <div className="modal-metadata-section">
            <h3>{modalHeading}</h3>
            {modalFields.map((field) => {
              const value = getFieldValue(field.key);
              const renderedValue = renderFieldValue(field.key, value);
              if (!renderedValue) return null;
              return (
                <div key={field.key} className="modal-detail-field">
                  <p><strong>{field.label || field.key}:</strong></p>
                  {field.key === 'description' ? (
                    <motion.p
                      key={effectiveDescription || 'desc-empty'}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {renderedValue}
                    </motion.p>
                  ) : (
                    renderedValue
                  )}
                </div>
              );
            })}
          </div>
        )}
        
      </div>
    </Modal>
    </Suspense>
  </>
  );
};

export default ItemCard; 
