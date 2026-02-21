import React, { useState, useEffect, useRef } from 'react';
import './BackgroundMedia.css';

interface BackgroundMediaProps {
  videoSrc?: string;
  imageSrc?: string;
  posterSrc?: string;
  className?: string;
  onLoad?: () => void;
  onError?: (error: string) => void;
}

const BackgroundMedia: React.FC<BackgroundMediaProps> = ({
  videoSrc,
  imageSrc,
  posterSrc,
  className = '',
  onLoad,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentMedia, setCurrentMedia] = useState<'video' | 'image' | 'gradient'>('gradient');
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Determine which media to show based on availability
    if (videoSrc) {
      setCurrentMedia('video');
    } else if (imageSrc) {
      setCurrentMedia('image');
    } else {
      setCurrentMedia('gradient');
      setIsLoading(false);
    }
  }, [videoSrc, imageSrc]);

  const handleVideoLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleVideoError = () => {
    console.warn('Video failed to load, falling back to image');
    setCurrentMedia('image');
    setHasError(false);
    // Don't call onError here as we're falling back
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleImageError = () => {
    console.warn('Image failed to load, falling back to gradient');
    setCurrentMedia('gradient');
    setIsLoading(false);
    setHasError(true);
    onError?.('Both video and image failed to load');
  };

  const handleVideoCanPlay = () => {
    // Video is ready to play
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.warn('Video autoplay failed:', error);
        // Fall back to image if autoplay fails
        setCurrentMedia('image');
      });
    }
  };

  return (
    <div className={`background-media ${className} ${isLoading ? 'loading' : ''} ${hasError ? 'error' : ''}`} aria-hidden="true">
      {/* Video Background */}
      {currentMedia === 'video' && videoSrc && (
        <video
          ref={videoRef}
          className="background-video"
          autoPlay
          loop
          muted
          playsInline
          poster={posterSrc || imageSrc}
          onLoadedData={handleVideoLoad}
          onError={handleVideoError}
          onCanPlay={handleVideoCanPlay}
        >
          <source src={videoSrc} type="video/mp4" />
          <source src={videoSrc} type="video/webm" />
          {imageSrc && (
            <img src={imageSrc} alt="" className="video-fallback" />
          )}
        </video>
      )}

      {/* Image Background */}
      {currentMedia === 'image' && imageSrc && (
        <img
          ref={imageRef}
          src={imageSrc}
          alt=""
          className="background-image"
          loading="lazy"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}

      {/* Gradient Fallback */}
      {currentMedia === 'gradient' && (
        <div className="background-gradient" />
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
        </div>
      )}
    </div>
  );
};

export default BackgroundMedia; 