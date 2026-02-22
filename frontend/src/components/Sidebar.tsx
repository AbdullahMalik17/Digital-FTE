'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ModeToggle } from '@/components/mode-toggle'

const navigation = [
  { name: 'Dashboard', href: '/',          icon: LayoutDashboardIcon, badge: null          },
  { name: 'Tasks',     href: '/tasks',     icon: CheckSquareIcon,     badge: { count: 12, color: 'bg-amber-500' } },
  { name: 'Skills',   href: '/skills',    icon: ZapIcon,             badge: null          },
  { name: 'Analytics',href: '/analytics', icon: BarChart3Icon,       badge: null          },
  { name: 'Setup',    href: '/setup',     icon: GearIcon,            badge: null          },
]

const integrations = [
  { name: 'Gmail',       icon: '📧', active: true,  stat: '24 msgs'   },
  { name: 'WhatsApp',    icon: '💬', active: true,  stat: '8 chats'   },
  { name: 'LinkedIn',    icon: '💼', active: true,  stat: '3 alerts'  },
  { name: 'Telegram',    icon: '✈️', active: true,  stat: 'Live'      },
  { name: 'Twitter / X', icon: '🐦', active: true,  stat: 'Live'      },
  { name: 'Facebook',    icon: '📘', active: true,  stat: 'Live'      },
  { name: 'Instagram',   icon: '📸', active: true,  stat: 'Live'      },
  { name: 'Discord',     icon: '🎮', active: false, stat: 'Soon'      },
  { name: 'Slack',       icon: '💡', active: false, stat: 'Soon'      },
]

const agentMetrics = [
  { label: 'Response Rate', value: 98, color: 'bg-emerald-500' },
  { label: 'Task Accuracy', value: 94, color: 'bg-primary'    },
  { label: 'Auto-handled',  value: 76, color: 'bg-violet-500' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 border-r border-white/5 bg-background/60 backdrop-blur-3xl">
        {/* Ambient gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-violet-500/5 to-transparent" />
        </div>

        <div className="relative flex flex-col flex-1 overflow-y-auto scrollbar-hide">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-white/[0.05]">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary via-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-primary/30">
                <span className="text-white font-black text-lg tracking-tighter">AJ</span>
              </div>
              {/* Online dot */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-black text-sm tracking-tighter leading-none">
                Abdullah <span className="text-primary">Junior</span>
              </h1>
              <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest mt-1">
                AI Executive FTE
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-400 uppercase">Live</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-5 space-y-6">
            <div className="space-y-0.5">
              <p className="px-3 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] mb-3">
                Operations
              </p>
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground/60 hover:bg-white/[0.03] hover:text-foreground'
                    )}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full shadow-[0_0_8px_2px_rgba(59,130,246,0.4)]" />
                    )}
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0',
                      isActive
                        ? 'bg-primary/20 shadow-inner'
                        : 'bg-white/[0.03] group-hover:bg-white/[0.06]'
                    )}>
                      <item.icon className={cn(
                        'w-4 h-4 transition-colors',
                        isActive ? 'text-primary' : 'text-muted-foreground/50 group-hover:text-foreground/70'
                      )} />
                    </div>
                    <span className={cn(
                      'font-bold text-sm tracking-tight flex-1',
                      isActive ? 'text-foreground' : ''
                    )}>
                      {item.name}
                    </span>
                    {item.badge && (
                      <span className={cn(
                        'text-[10px] font-black text-white px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                        item.badge.color
                      )}>
                        {item.badge.count}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Connected channels */}
            <div className="space-y-0.5">
              <p className="px-3 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] mb-3">
                Connected Nodes
              </p>
              {integrations.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/[0.02] transition-colors group cursor-default"
                >
                  <span className="text-base group-hover:scale-110 transition-transform shrink-0">
                    {item.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold tracking-tight truncate">{item.name}</p>
                  </div>
                  <span className={cn(
                    'text-[9px] font-black uppercase tracking-wider shrink-0',
                    item.active ? 'text-emerald-400/70' : 'text-muted-foreground/30'
                  )}>
                    {item.stat}
                  </span>
                  <div className="relative flex h-1.5 w-1.5 shrink-0">
                    {item.active ? (
                      <>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-40" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                      </>
                    ) : (
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-muted-foreground/20" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          {/* AI Performance Card */}
          <div className="px-4 pb-3">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">
                  AI Performance
                </span>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-black text-emerald-400">Optimal</span>
                </div>
              </div>
              {agentMetrics.map(({ label, value, color }) => (
                <div key={label} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-muted-foreground/50 font-bold">{label}</span>
                    <span className="text-[9px] font-black text-foreground/70">{value}%</span>
                  </div>
                  <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full', color)}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 pb-5 border-t border-white/[0.05] pt-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Mainframe</span>
                </div>
                <span className="text-[9px] text-muted-foreground/40 font-bold">Uptime 99.9%</span>
              </div>
              <ModeToggle />
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50 glass-card bg-background/80 backdrop-blur-2xl border-white/10 shadow-2xl safe-area-bottom px-2 rounded-[2rem]">
        <div className="flex items-center justify-around py-2.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'relative flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all active:scale-90',
                  isActive ? 'text-primary' : 'text-muted-foreground/50'
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl bg-primary/10" />
                )}
                <item.icon className="w-5 h-5 relative z-10" />
                <span className="text-[9px] font-black uppercase tracking-tighter relative z-10">
                  {item.name}
                </span>
                {item.badge && (
                  <span className="absolute -top-0.5 right-2 text-[8px] font-black text-white bg-amber-500 px-1 rounded-full">
                    {item.badge.count}
                  </span>
                )}
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
