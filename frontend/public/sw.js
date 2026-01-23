// Abdullah Junior PWA Service Worker
const CACHE_NAME = 'abdullah-junior-v1';
const OFFLINE_URL = '/offline';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching core assets');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Take control immediately
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip API calls - always go to network
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone and cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(async () => {
        // Network failed, try cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // If HTML request, show offline page
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match(OFFLINE_URL);
        }
        return new Response('Offline', { status: 503 });
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);

  let data = {
    title: 'Abdullah Junior',
    body: 'New notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72.png',
    tag: 'default',
    data: { url: '/' },
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/badge-72.png',
    tag: data.tag || 'notification',
    vibrate: [200, 100, 200],
    data: data.data || { url: '/' },
    actions: data.actions || [
      { action: 'view', title: 'View', icon: '/icons/view-24.png' },
      { action: 'dismiss', title: 'Dismiss', icon: '/icons/dismiss-24.png' },
    ],
    requireInteraction: data.requireInteraction || false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  if (event.action === 'dismiss') {
    return;
  }

  // Handle approve/reject actions
  if (event.action === 'approve' && event.notification.data?.taskId) {
    event.waitUntil(
      fetch(`/api/tasks/${event.notification.data.taskId}/approve`, {
        method: 'POST',
      }).then(() => {
        self.registration.showNotification('Task Approved', {
          body: 'The task has been approved and will be executed.',
          icon: '/icons/icon-192x192.png',
          tag: 'approval-success',
        });
      })
    );
    return;
  }

  if (event.action === 'reject' && event.notification.data?.taskId) {
    event.waitUntil(
      fetch(`/api/tasks/${event.notification.data.taskId}/reject`, {
        method: 'POST',
      }).then(() => {
        self.registration.showNotification('Task Rejected', {
          body: 'The task has been rejected.',
          icon: '/icons/icon-192x192.png',
          tag: 'rejection-success',
        });
      })
    );
    return;
  }

  // Default: open app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync for offline approvals
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-approvals') {
    event.waitUntil(syncPendingApprovals());
  }
});

async function syncPendingApprovals() {
  // Get pending approvals from IndexedDB
  // This would sync any approvals made while offline
  console.log('[SW] Syncing pending approvals...');
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-drafts') {
    event.waitUntil(checkForNewDrafts());
  }
});

async function checkForNewDrafts() {
  try {
    const response = await fetch('/api/drafts/count');
    const data = await response.json();

    if (data.newCount > 0) {
      self.registration.showNotification('New Drafts Available', {
        body: `${data.newCount} draft(s) awaiting your approval`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72.png',
        tag: 'new-drafts',
        data: { url: '/?view=drafts' },
        actions: [
          { action: 'view', title: 'Review Now' },
        ],
      });
    }
  } catch (error) {
    console.error('[SW] Error checking drafts:', error);
  }
}
