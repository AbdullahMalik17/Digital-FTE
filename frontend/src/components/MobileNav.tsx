'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { name: 'Home',      href: '/',          emoji: '🏠', badge: null },
  { name: 'Tasks',     href: '/tasks',     emoji: '✅', badge: '12' },
  { name: 'Skills',    href: '/skills',    emoji: '⚡', badge: null },
  { name: 'Analytics', href: '/analytics', emoji: '📊', badge: null },
  { name: 'Setup',     href: '/setup',     emoji: '⚙️', badge: null },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50">
      <div className="glass-card bg-background/80 backdrop-blur-2xl border-white/10 shadow-2xl px-2 py-2 rounded-[2rem] flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl transition-all duration-200 active:scale-90',
                isActive ? 'bg-primary/15' : 'opacity-50'
              )}
            >
              <span className={cn('text-xl transition-transform', isActive ? 'scale-110' : 'scale-100')}>
                {item.emoji}
              </span>
              <span className={cn(
                'text-[9px] font-black uppercase tracking-tighter transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground/40'
              )}>
                {item.name}
              </span>
              {item.badge && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-500 rounded-full text-[9px] font-black text-white flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
