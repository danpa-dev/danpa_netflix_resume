import React from 'react';
import BackgroundMedia from './BackgroundMedia';
import TextOverlay from './TextOverlay';
import './Hero.css';

interface HeroProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  className?: string;
}

const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  backgroundImage,
  backgroundVideo,
  className = ''
}) => {
  return (
    <section className={`hero ${className}`} aria-label="Hero">
      <BackgroundMedia
        videoSrc={backgroundVideo}
        imageSrc={backgroundImage}
        posterSrc={backgroundImage}
      />
      
      <TextOverlay
        title={title}
        subtitle={subtitle}
        aria-label={`Hero section: ${title}${subtitle ? ` - ${subtitle}` : ''}`}
      />
    </section>
  );
};

export default Hero; 