import React from 'react';
import './Footer.css';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`footer ${className}`} role="contentinfo" aria-label="Footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <p className="copyright">
              &copy; {currentYear} Dan Park. All rights reserved.
            </p>
          </div>
          
          <div className="footer-section">
            <div className="social-links">
              <a 
                href="https://www.linkedin.com/in/dansdansrevolution/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link"
                aria-label="LinkedIn Profile"
              >
                LinkedIn
              </a>
              <a 
                href="https://github.com/danpa-dev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link"
                aria-label="GitHub Profile"
              >
                GitHub
              </a>
              <span className="social-text">(832) 494-0669</span>
              <span className="social-text">parkdanws@gmail.com</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
