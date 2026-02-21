'use client';

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { subscribeToPush } from '@/lib/pwa-utils';

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
