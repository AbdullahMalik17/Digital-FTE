'use client';

import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Listen for install prompt (Android/Desktop)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);

      // Show prompt after 3 seconds if not dismissed before
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    // Listen for successful install
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Show iOS instructions after delay if iOS
    if (isIOSDevice && !localStorage.getItem('pwa-ios-dismissed')) {
      setTimeout(() => setShowIOSInstructions(true), 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setShowPrompt(false);
    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSInstructions(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
    localStorage.setItem('pwa-ios-dismissed', 'true');
  };

  // Don't show if already installed
  if (isInstalled) return null;

  // iOS Instructions
  if (isIOS && showIOSInstructions) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-4">
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 shadow-2xl max-w-md mx-auto">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Install App</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Add to your home screen for quick access
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

          <div className="mt-4 bg-black/50 rounded-lg p-3 text-xs text-zinc-400">
            <p className="font-medium text-zinc-300 mb-2">On iOS Safari:</p>
            <ol className="space-y-1.5">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-zinc-800 rounded text-center text-[10px] leading-5">1</span>
                Tap the Share button <span className="text-blue-400">(box with arrow)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-zinc-800 rounded text-center text-[10px] leading-5">2</span>
                Scroll down and tap "Add to Home Screen"
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-zinc-800 rounded text-center text-[10px] leading-5">3</span>
                Tap "Add" to install
              </li>
            </ol>
          </div>

          <Button
            onClick={handleDismiss}
            variant="ghost"
            className="w-full mt-3 text-zinc-400 hover:text-white"
            size="sm"
          >
            Got it
          </Button>
        </div>
      </div>
    );
  }

  // Android/Desktop Install Prompt
  if (!showPrompt || !installPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 shadow-2xl max-w-md mx-auto">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center flex-shrink-0">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Install Abdullah Junior</h3>
              <p className="text-sm text-zinc-400 mt-0.5">
                Get quick access from your home screen
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
          >
            Not now
          </Button>
          <Button
            onClick={handleInstall}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Install App
          </Button>
        </div>
      </div>
    </div>
  );
}
