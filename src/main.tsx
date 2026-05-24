// src/main.tsx

/**
 * Application Entry Point
 * Bootstraps the React root and injects the main App component.
 * StrictMode is enabled for development lifecycle checks.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Assumes Tailwind CSS directives are present

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Ensure index.html contains <div id="root"></div>');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);