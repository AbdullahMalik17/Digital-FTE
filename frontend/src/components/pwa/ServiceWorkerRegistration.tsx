'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker
      registerServiceWorker();
    }
  }, []);

  return null;
}

async function registerServiceWorker() {
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    });

    console.log('[PWA] Service worker registered:', registration.scope);

    // Check for updates periodically
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000); // Check every hour

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            showUpdateNotification();
          }
        });
      }
    });

    // Listen for controller change (when new SW takes over)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Optionally reload the page when new service worker activates
      // window.location.reload();
    });

  } catch (error) {
    console.error('[PWA] Service worker registration failed:', error);
  }
}

function showUpdateNotification() {
  // Show a toast or banner that new version is available
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification('Update Available', {
        body: 'A new version of Abdullah Junior is available. Refresh to update.',
        icon: '/icons/icon-192x192.png',
        tag: 'app-update',
      });
    }
  }

  // Alternatively, you can dispatch a custom event for the UI to handle
  window.dispatchEvent(new CustomEvent('pwa-update-available'));
}

// Export utility functions for use elsewhere
export async function checkForUpdate(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    return registration.waiting !== null;
  }
  return false;
}

export async function applyUpdate(): Promise<void> {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }
}

export async function unregisterServiceWorker(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    return registration.unregister();
  }
  return false;
}
