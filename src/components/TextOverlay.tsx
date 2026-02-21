import React from 'react';
import './TextOverlay.css';

interface TextOverlayProps {
  title: string;
  subtitle?: string;
  className?: string;
  role?: string;
  'aria-label'?: string;
}

const TextOverlay: React.FC<TextOverlayProps> = ({
  title,
  subtitle,
  className = '',
  role,
  'aria-label': ariaLabel
}) => {
  return (
    <div 
      className={`text-overlay ${className}`}
      role={role}
      aria-label={ariaLabel || `${title}${subtitle ? ` - ${subtitle}` : ''}`}
    >
      <div className="text-overlay-content" role="presentation">
        <h1 
          className="text-overlay-title"
          aria-label={title}
        >
          {title}
        </h1>
        
        {subtitle && (
          <h2 
            className="text-overlay-subtitle"
            aria-label={subtitle}
          >
            {subtitle}
          </h2>
        )}
      </div>
    </div>
  );
};

export default TextOverlay; 