'use client';

import { BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
