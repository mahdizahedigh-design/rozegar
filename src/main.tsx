import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
// Self-hosted Vazirmatn font weights (only the ones actually used by the UI).
// Self-hosting avoids the render-blocking round trip to fonts.googleapis.com/
// fonts.gstatic.com on every first load, and lets our own service worker
// cache the font files for offline use — both meaningful wins on mobile
// networks.
import '@fontsource/vazirmatn/400.css';
import '@fontsource/vazirmatn/500.css';
import '@fontsource/vazirmatn/600.css';
import '@fontsource/vazirmatn/700.css';
import '@fontsource/vazirmatn/800.css';
import '@fontsource/vazirmatn/900.css';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register PWA Service Worker
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration.scope);
      })
      .catch((err) => {
        console.log('SW registration failed: ', err);
      });
  });
}

