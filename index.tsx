
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register Service Worker using a relative path to avoid origin mismatch in sandboxed environments
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Using a relative path './sw.js' instead of '/sw.js' to ensure it respects the current origin
    navigator.serviceWorker.register('./sw.js', { scope: './' }).then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      // In some preview environments, service workers are intentionally blocked
      console.warn('SW registration skipped or failed:', registrationError.message);
    });
  });
}
