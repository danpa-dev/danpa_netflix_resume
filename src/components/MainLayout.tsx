import React from 'react';
import { Hero } from './index';
import './MainLayout.css';

interface MainLayoutProps {
  heroTitle: string;
  heroSubtitle?: string;
  heroBackgroundImage?: string;
  heroBackgroundVideo?: string;
  children?: React.ReactNode;
  className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  heroTitle,
  heroSubtitle,
  heroBackgroundImage,
  heroBackgroundVideo,
  children,
  className = ''
}) => {
  return (
    <>
      <a href="#main-content" className="visually-hidden focusable">Skip to main content</a>
      <main id="main-content" className={`main-layout ${className}`} role="main">
      {/* Hero Section */}
      <Hero
        title={heroTitle}
        subtitle={heroSubtitle}
        backgroundImage={heroBackgroundImage}
        backgroundVideo={heroBackgroundVideo}
      />
      
      {/* Carousel Sections Container */}
        <div className="carousel-sections" aria-label="Content sections">
        <div className="carousel-sections-container">
          {children}
        </div>
      </div>
      </main>
    </>
  );
};

export default MainLayout; 