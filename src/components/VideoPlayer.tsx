import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import './VideoPlayer.css';

export interface VideoPlayerProps {
  srcMp4?: string;
  srcWebm?: string;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  className?: string;
  onLoaded?: () => void;
  onError?: (message?: string) => void;
}

const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  srcMp4,
  srcWebm,
  poster,
  autoPlay = true,
  muted = true,
  loop = true,
  className = '',
  onLoaded,
  onError
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(muted);
  const [autoplayBlocked, setAutoplayBlocked] = useState<boolean>(false);

  const canAutoplay = useMemo(() => autoPlay && !prefersReducedMotion(), [autoPlay]);

  // Attempt autoplay on mount when allowed
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = isMuted; // ensure muted aligns
    if (!canAutoplay) {
      setIsLoading(false);
      setIsPlaying(false);
      return;
    }

    const tryPlay = async () => {
      try {
        await video.play();
        setIsPlaying(true);
        setAutoplayBlocked(false);
      } catch {
        // Most likely autoplay policy
        setAutoplayBlocked(true);
        setIsPlaying(false);
      } finally {
        // Loading finishes when data is available; this ensures we don't hang
        // The real onLoadedData will also clear loading state
      }
    };
    // Start load explicitly to trigger metadata fetch
    video.load();
    // Some browsers need a tick before play
    setTimeout(tryPlay, 0);
  }, [canAutoplay, isMuted]);

  const handleLoadedData = () => {
    setIsLoading(false);
    onLoaded?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.('Video failed to load');
  };

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (video.paused) {
        await video.play();
        setIsPlaying(true);
        setAutoplayBlocked(false);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    } catch {
      setAutoplayBlocked(true);
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  // native controls toggling disabled in this design

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      togglePlay();
    } else if (e.key.toLowerCase() === 'm') {
      e.preventDefault();
      toggleMute();
    }
  };

  return (
    <div className={`video-player ${className}`} onKeyDown={onKeyDown}>
      <div className="video-wrapper">
        <video
          ref={videoRef}
          className={`video-element ${isLoading ? 'loading' : ''}`}
          muted={isMuted}
          loop={loop}
          playsInline
          {...({ 'webkit-playsinline': 'true' } as Record<string, unknown>)}
          poster={poster}
          controls={false}
          onLoadedData={handleLoadedData}
          onError={handleError}
        >
          {srcWebm && <source src={srcWebm} type="video/webm" />}
          {srcMp4 && <source src={srcMp4} type="video/mp4" />}
        </video>

        {/* Central play button overlay when paused or autoplay blocked */}
        {(!isPlaying || autoplayBlocked) && !hasError && (
          <button
            className="video-overlay-play"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M8 5v14l11-7z" fill="currentColor" />
            </svg>
          </button>
        )}

        {/* Bottom-left control: Unmute only */}
        <div className="video-controls">
          <button
            className="video-control-btn"
            onClick={toggleMute}
            aria-pressed={!isMuted}
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
          >
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
        </div>

        {/* Error UI */}
        {hasError && (
          <div className="video-error" role="alert">
            <p>Unable to load video.</p>
            <button className="video-control-btn" onClick={() => {
              setHasError(false);
              const v = videoRef.current;
              if (!v) return;
              v.load();
              setTimeout(() => togglePlay(), 0);
            }}>Retry</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;

