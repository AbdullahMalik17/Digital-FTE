'use client';

import { useState, useEffect } from 'react';
import { Bell, X, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true);
      setPermission(Notification.permission);

      // Show prompt if permission is default and not dismissed
      const dismissed = localStorage.getItem('notification-prompt-dismissed');
      if (Notification.permission === 'default' && !dismissed) {
        // Delay showing prompt
        setTimeout(() => setShowPrompt(true), 10000);
      }
    }
  }, []);

  const handleEnable = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      setShowPrompt(false);

      if (result === 'granted') {
        // Subscribe to push notifications
        await subscribeToPush();

        // Show confirmation notification
        new Notification('Notifications Enabled', {
          body: 'You will now receive alerts for new drafts and task updates.',
          icon: '/icons/icon-192x192.png',
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('notification-prompt-dismissed', 'true');
  };

  // Don't show if not supported or already decided
  if (!isSupported || permission !== 'default' || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-in slide-in-from-top-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 shadow-2xl max-w-md mx-auto">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-600/20 border border-yellow-600/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Enable Notifications</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Get alerts when drafts need your approval
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            onClick={handleDismiss}
            variant="ghost"
            className="flex-1 text-zinc-400 hover:text-white"
            size="sm"
          >
            Maybe later
          </Button>
          <Button
            onClick={handleEnable}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700"
            size="sm"
          >
            Enable
          </Button>
        </div>
      </div>
    </div>
  );
}

// Subscribe to push notifications
async function subscribeToPush() {
  try {
    const registration = await navigator.serviceWorker.ready;

    // Check if push is supported
    if (!registration.pushManager) {
      console.log('Push notifications not supported');
      return;
    }

    // Get existing subscription or create new one
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Get VAPID public key from server
      let vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      // Try to fetch from API if not in env
      if (!vapidPublicKey) {
        try {
          const response = await fetch('/api/notifications/vapid-public-key');
          if (response.ok) {
            const data = await response.json();
            vapidPublicKey = data.publicKey;
          }
        } catch (e) {
          console.log('Could not fetch VAPID key from API');
        }
      }

      if (!vapidPublicKey) {
        console.log('VAPID public key not configured');
        return;
      }

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
    }

    // Get device name for identification
    const deviceName = getDeviceName();

    // Send subscription to server using our new API
    const response = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: arrayBufferToBase64(subscription.getKey('auth')),
        },
        device_name: deviceName,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Push subscription registered:', result.device_name);
    } else {
      console.error('Failed to register subscription');
    }
  } catch (error) {
    console.error('Error subscribing to push:', error);
  }
}

// Get friendly device name
function getDeviceName(): string {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return 'iPhone';
  if (/Android/.test(ua)) return 'Android Phone';
  if (/Windows/.test(ua)) return 'Windows PC';
  if (/Mac/.test(ua)) return 'Mac';
  return 'Unknown Device';
}

// Convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

// Export for use in other components
export function NotificationBanner({
  enabled,
  onEnable
}: {
  enabled: boolean;
  onEnable: () => void;
}) {
  if (enabled) return null;

  return (
    <div className="bg-yellow-600/10 border border-yellow-600/20 rounded-lg p-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm">
        <BellOff className="w-4 h-4 text-yellow-500" />
        <span className="text-yellow-200">Notifications are disabled</span>
      </div>
      <Button
        onClick={onEnable}
        variant="ghost"
        size="sm"
        className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-600/10"
      >
        Enable
      </Button>
    </div>
  );
}
