'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ModeToggle } from '@/components/mode-toggle'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboardIcon },
  { name: 'Tasks', href: '/tasks', icon: CheckSquareIcon },
  { name: 'Skills', href: '/skills', icon: ZapIcon },
  { name: 'Analytics', href: '/analytics', icon: BarChart3Icon },
  { name: 'Setup', href: '/setup', icon: GearIcon },
]

const integrations = [
  { name: 'Gmail',       icon: '📧', active: true  },
  { name: 'WhatsApp',    icon: '💬', active: true  },
  { name: 'LinkedIn',    icon: '💼', active: true  },
  { name: 'Telegram',    icon: '✈️', active: true  },
  { name: 'Twitter / X', icon: '🐦', active: true  },
  { name: 'Facebook',    icon: '📘', active: true  },
  { name: 'Instagram',   icon: '📸', active: true  },
  { name: 'Discord',     icon: '🎮', active: false },
  { name: 'Slack',       icon: '💡', active: false },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 border-r border-white/5 bg-background/50 backdrop-blur-3xl">
        <div className="flex flex-col flex-1 overflow-y-auto scrollbar-hide">
          {/* Logo */}
          <div className="flex items-center gap-4 px-8 py-8 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary via-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-primary/20 group relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-white font-black text-lg tracking-tighter relative z-10">AJ</span>
            </div>
            <div>
              <h1 className="font-black text-base tracking-tighter leading-none">Abdullah <span className="text-primary">Junior</span></h1>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">AI Executive FTE</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-8">
            <div className="space-y-1">
              <p className="px-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] mb-4">
                Operations
              </p>
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'sidebar-link group',
                      isActive && 'active'
                    )}
                  >
                    <div className={cn(
                      'p-2 rounded-lg transition-colors',
                      isActive ? 'bg-primary/20' : 'bg-transparent group-hover:bg-white/5'
                    )}>
                      <item.icon className={cn('w-4 h-4', isActive ? 'text-primary' : 'text-muted-foreground/60')} />
                    </div>
                    <span className="font-semibold tracking-tight">{item.name}</span>
                    {isActive && <div className="ml-auto w-1 h-4 bg-primary rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
                  </Link>
                )
              })}
            </div>

            <div className="space-y-2">
              <p className="px-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] mb-4">
                Connected Nodes
              </p>
              {integrations.map((item) => (
                <div key={item.name} className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5 cursor-default group">
                  <span className="text-lg group-hover:scale-110 transition-transform">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold tracking-tight truncate">{item.name}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: item.active ? 'rgb(74 222 128 / 0.7)' : 'rgb(156 163 175 / 0.5)' }}>
                      {item.active ? 'Protocol Active' : 'Coming Soon'}
                    </p>
                  </div>
                  <div className="relative flex h-2 w-2 flex-shrink-0">
                    {item.active ? (
                      <>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-40"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </>
                    ) : (
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-muted-foreground/30"></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="px-6 py-6 border-t border-white/5 bg-gradient-to-t from-white/[0.01] to-transparent">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Mainframe</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-bold mt-1">Uptime 99.9%</span>
                </div>
                <ModeToggle />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50 glass-card bg-background/80 backdrop-blur-2xl border-white/10 shadow-2xl safe-area-bottom px-2 rounded-[2rem]">
        <div className="flex items-center justify-around py-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1.5 px-5 py-2 rounded-2xl transition-all active:scale-90',
                  isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground/60'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Spacer for sidebar on desktop */}
      <div className="hidden md:block md:w-72 flex-shrink-0" />
    </>
  )
}

function LayoutDashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
    </svg>
  )
}

function CheckSquareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/>
    </svg>
  )
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>
    </svg>
  )
}

function BarChart3Icon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M7 16h8"/><path d="M7 11h12"/><path d="M7 6h3"/>
    </svg>
  )
}

function GearIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}
