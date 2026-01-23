import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-black text-zinc-300 flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-md">
        {/* Offline Icon */}
        <div className="w-24 h-24 mx-auto bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
          <svg
            className="w-12 h-12 text-zinc-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-12.728-12.728m12.728 12.728L5.636 5.636m12.728 12.728A9 9 0 015.636 5.636"
            />
          </svg>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">You are Offline</h1>
          <p className="text-zinc-500">
            Abdullah Junior is waiting for you to reconnect.
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-left">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-mono text-zinc-400">OFFLINE MODE</span>
          </div>
          <ul className="text-sm text-zinc-500 space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Cached pages available
            </li>
            <li className="flex items-center gap-2">
              <span className="text-yellow-500">○</span>
              Approvals queued for sync
            </li>
            <li className="flex items-center gap-2">
              <span className="text-red-500">✗</span>
              Live updates paused
            </li>
          </ul>
        </div>

        {/* Retry Link */}
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Go to Dashboard
        </Link>

        {/* Hint */}
        <p className="text-xs text-zinc-600">
          Your pending approvals will sync automatically when you are back online.
        </p>
      </div>
    </div>
  );
}
