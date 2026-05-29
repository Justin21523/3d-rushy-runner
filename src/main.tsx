// src/main.tsx

/**
 * Application Entry Point
 * Bootstraps the React root and injects the main App component.
 * StrictMode is enabled for development lifecycle checks.
 */
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Assumes Tailwind CSS directives are present

// Clear stale persisted state so god-mode and fresh player state always load correctly
localStorage.removeItem('game-progress');

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Ensure index.html contains <div id="root"></div>');
}

// StrictMode disabled: its double-invocation of effects re-creates all game
// systems and resets the controller position to (0,1,0) mid-session.
ReactDOM.createRoot(rootElement).render(<App />);