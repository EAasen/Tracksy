import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './utils/performance'; // Import performance utilities

// Initialize performance monitoring
if (process.env.NODE_ENV !== 'production') {
  const { startMeasure, endMeasure } = require('./utils/performance');
  const startTime = startMeasure('app-initialization');
  
  // Log initial load performance
  window.addEventListener('load', () => {
    endMeasure('app-initialization', startTime);
    
    // Log any performance metrics available
    if (window.performance && window.performance.getEntriesByType) {
      const navigationEntries = window.performance.getEntriesByType('navigation');
      if (navigationEntries && navigationEntries[0]) {
        console.log('[Performance] Navigation Timing:', navigationEntries[0]);
      }
    }
  });
}

// Render the application with React 18 createRoot API if available
// Otherwise fallback to legacy render for React 17
const rootElement = document.getElementById('root');

// Feature detection for React 18 API
const renderApp = () => {
  if (rootElement) {
    if (ReactDOM.createRoot) {
      // React 18 API
      const root = ReactDOM.createRoot(rootElement);
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    } else {
      // React 17 API
      ReactDOM.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>,
        rootElement
      );
    }
  } else {
    console.error('Root element not found');
  }
};

// Register service worker if in production
if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('ServiceWorker registration successful:', registration);
      })
      .catch((error) => {
        console.error('ServiceWorker registration failed:', error);
      });
  });
}

// Implement a basic error handler for the entire application
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  // Could send to error reporting service here
});

// Initialize the app
renderApp();
