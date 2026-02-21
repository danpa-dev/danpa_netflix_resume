import React from 'react';
import './SkeletonLoader.css';

interface SkeletonLoaderProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  animationDuration?: number;
  ariaLabel?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = '',
  width = '100%',
  height = '100%',
  borderRadius = '4px',
  animationDuration = 1.5,
  ariaLabel = 'Loading...'
}) => {
  const style = {
    width,
    height,
    borderRadius,
    '--animation-duration': `${animationDuration}s`
  } as React.CSSProperties;

  return (
    <div
      className={`skeleton-loader ${className}`}
      style={style}
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      <div className="skeleton-shimmer" />
    </div>
  );
};

export default SkeletonLoader; 