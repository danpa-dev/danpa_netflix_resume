import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { initWebVitalsReporter } from './utils/webVitals';
import ErrorBoundary from './components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

// Initialize Web Vitals reporter only in production
if (import.meta.env.PROD) {
  initWebVitalsReporter();
}
