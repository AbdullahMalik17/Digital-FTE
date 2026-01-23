'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Zap, BarChart3, PlusCircle } from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t z-40 pb-safe">
      <div className="flex items-center justify-around py-2">
        <Link
          href="/"
          className={`flex flex-col items-center p-2 text-xs transition-colors ${
            isActive('/') && !pathname.includes('view=')
              ? 'text-blue-500'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Home className="w-5 h-5 mb-1" />
          <span>Home</span>
        </Link>

        <Link
          href="/?view=drafts"
          className={`flex flex-col items-center p-2 text-xs transition-colors ${
            pathname.includes('view=drafts')
              ? 'text-blue-500'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="w-5 h-5 mb-1" />
          <span>Drafts</span>
        </Link>

        <Link
          href="/?view=command"
          className="flex flex-col items-center p-2 text-xs text-muted-foreground hover:text-foreground transition-colors relative"
        >
          <div className="absolute -top-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <PlusCircle className="w-6 h-6 text-white" />
          </div>
          <span className="mt-5">Command</span>
        </Link>

        <Link
          href="/skills"
          className={`flex flex-col items-center p-2 text-xs transition-colors ${
            isActive('/skills')
              ? 'text-blue-500'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Zap className="w-5 h-5 mb-1" />
          <span>Skills</span>
        </Link>

        <Link
          href="/?view=status"
          className={`flex flex-col items-center p-2 text-xs transition-colors ${
            pathname.includes('view=status')
              ? 'text-blue-500'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BarChart3 className="w-5 h-5 mb-1" />
          <span>Status</span>
        </Link>
      </div>
    </nav>
  );
}
