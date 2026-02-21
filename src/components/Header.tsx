import React, { useMemo, useState } from 'react';
import './Header.css';
import { useContent } from '../hooks/useContent';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { content } = useContent();

  const { href, downloadName } = useMemo(() => {
    const resume = content?.metadata?.resume;
    // Prefer local public assets so the app is hosting-provider agnostic.
    const chosen = resume?.localPath || resume?.s3Url;
    const fileName = resume?.fileName || 'DanParkResume.pdf';
    return { href: chosen || '/DanParkResume.pdf', downloadName: fileName };
  }, [content]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`header ${className}`} role="banner">
      <div className="header-container">
        {/* Brand/Logo Section */}
        <div className="brand-section">
          <a href="/" className="brand">
            Dan Park
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="nav-desktop" aria-label="Primary">
          <a 
            href="https://www.linkedin.com/in/dansdansrevolution/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="nav-link"
          >
            LinkedIn
          </a>
          <a 
            href="https://github.com/danpa-dev" 
            target="_blank" 
            rel="noopener noreferrer"
            className="nav-link"
          >
            GitHub
          </a>
          <span className="nav-text">(832) 494-0669</span>
          <span className="nav-text">parkdanws@gmail.com</span>
          <a className="btn btn-primary nav-btn" href={href} download={downloadName} target={href?.startsWith('http') ? '_blank' : undefined} rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}>
            Download Resume
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
          aria-controls="nav-mobile"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        {/* Mobile Navigation */}
        <nav id="nav-mobile" className={`nav-mobile ${isMobileMenuOpen ? 'open' : ''}`} aria-label="Mobile">
          <a 
            href="https://www.linkedin.com/in/dansdansrevolution/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="nav-link"
            onClick={closeMobileMenu}
          >
            LinkedIn
          </a>
          <a 
            href="https://github.com/danpa-dev" 
            target="_blank" 
            rel="noopener noreferrer"
            className="nav-link"
            onClick={closeMobileMenu}
          >
            GitHub
          </a>
          <span className="nav-text">(832) 494-0669</span>
          <span className="nav-text">parkdanws@gmail.com</span>
          <a className="btn btn-primary nav-btn" href={href} download={downloadName} target={href?.startsWith('http') ? '_blank' : undefined} rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined} onClick={closeMobileMenu}>
            Download Resume
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header; 
