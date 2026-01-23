'use client';

import { useEffect, useState } from 'react';
import InstallPrompt from './InstallPrompt';
import NotificationPrompt from './NotificationPrompt';

export default function PWAProvider() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('[PWA] Service worker registered:', registration.scope);
        })
        .catch((error) => {
          console.error('[PWA] Service worker registration failed:', error);
        });
    }
  }, []);

  // Don't render anything on server
  if (!mounted) return null;

  return (
    <>
      <InstallPrompt />
      <NotificationPrompt />
    </>
  );
}
