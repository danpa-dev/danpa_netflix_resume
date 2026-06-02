import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import useVideoPreferences from '../hooks/useVideoPreferences';
import './VideoPlayer.css';

const FEEDBACK_DURATION_MS = 1000;

export interface VideoPlayerProps {
  srcMp4?: string;
  srcWebm?: string;
  poster?: string;
  autoPlay?: boolean;
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
  loop = true,
  className = '',
  onLoaded,
  onError,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isMuted, setIsMuted } = useVideoPreferences();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState<boolean>(false);
  const [feedbackIcon, setFeedbackIcon] = useState<'play' | 'pause' | null>(
    null
  );
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canAutoplay = useMemo(
    () => autoPlay && !prefersReducedMotion(),
    [autoPlay]
  );

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Attempt autoplay on mount and when the source changes.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!canAutoplay) {
      setIsLoading(false);
      setIsPlaying(false);
      setAutoplayBlocked(true);
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
    const playTimeout = setTimeout(tryPlay, 0);
    return () => clearTimeout(playTimeout);
  }, [canAutoplay, srcMp4, srcWebm]);

  const handleLoadedData = () => {
    setIsLoading(false);
    onLoaded?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.('Video failed to load');
  };

  const showFeedback = useCallback((icon: 'play' | 'pause') => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    setFeedbackIcon(icon);
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedbackIcon(null);
      feedbackTimeoutRef.current = null;
    }, FEEDBACK_DURATION_MS);
  }, []);

  useEffect(() => {
    setFeedbackIcon(null);
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, [srcMp4, srcWebm]);

  const handleNativePlay = () => {
    setIsPlaying(true);
    setAutoplayBlocked(false);
  };

  const handleNativePause = () => {
    setIsPlaying(false);
  };

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (video.paused) {
        await video.play();
        showFeedback('play');
      } else {
        video.pause();
        showFeedback('pause');
      }
    } catch {
      setAutoplayBlocked(true);
      setIsPlaying(false);
    }
  }, [showFeedback]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, [setIsMuted]);

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
    <div className={`video-player ${className}`}>
      <div className="video-wrapper">
        <video
          ref={videoRef}
          className={`video-element ${isLoading ? 'loading' : ''}`}
          role="button"
          tabIndex={0}
          aria-label={isPlaying ? 'Pause video' : 'Play video'}
          muted={isMuted}
          loop={loop}
          playsInline
          preload="auto"
          {...({ 'webkit-playsinline': 'true' } as Record<string, unknown>)}
          poster={poster}
          controls={false}
          onClick={togglePlay}
          onKeyDown={onKeyDown}
          onPlay={handleNativePlay}
          onPause={handleNativePause}
          onLoadedData={handleLoadedData}
          onError={handleError}
        >
          {srcWebm && <source src={srcWebm} type="video/webm" />}
          {srcMp4 && <source src={srcMp4} type="video/mp4" />}
        </video>

        {/* Recovery control stays visible when autoplay cannot start. */}
        {autoplayBlocked && !hasError && (
          <button
            className="video-recovery-play"
            onClick={event => {
              event.stopPropagation();
              togglePlay();
            }}
            aria-label="Play video"
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z" fill="currentColor" />
            </svg>
          </button>
        )}

        {/* Transient playback feedback after a tap or click. */}
        {feedbackIcon && !hasError && (
          <div className="video-playback-feedback" aria-hidden="true">
            {feedbackIcon === 'pause' ? (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" />
              </svg>
            ) : (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M8 5v14l11-7z" fill="currentColor" />
              </svg>
            )}
          </div>
        )}

        {/* Top-left control: mute preference remains persistent. */}
        <div className="video-controls">
          <button
            className="video-control-btn"
            onClick={event => {
              event.stopPropagation();
              toggleMute();
            }}
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
            <button
              className="video-control-btn"
              onClick={() => {
                setHasError(false);
                const v = videoRef.current;
                if (!v) return;
                v.load();
                setTimeout(() => togglePlay(), 0);
              }}
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
