import { fetchTasks } from '@/app/actions'
import TaskBoard from '@/components/TaskBoard'
import AgentChat from '@/components/AgentChat'
import { DailyDigestCard, FollowUpsWidget } from '@/components/widgets'

export const revalidate = 30

export default async function Home() {
  let pending: any[] = [], completed: any[] = [];

  try {
    const tasksPromise = fetchTasks();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('SSR timeout')), 5000)
    );
    const results = await Promise.race([tasksPromise, timeoutPromise]);
    if (results && typeof results === 'object') {
      ({ pending, completed } = results as any);
    }
  } catch {
    // Render with empty data
  }

  return (
    <div className="relative space-y-12 pb-24">
      {/* Ambient Background Orbs */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute -top-20 right-0 w-[400px] h-[400px] bg-violet-500/6 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-purple-500/4 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* ── Hero Section ── */}
      <div className="animate-fade-in relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 glass-card border-primary/10 relative overflow-hidden">
          {/* Shimmer top border */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          {/* Subtle bottom glow */}
          <div className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

          <div className="space-y-2">
            {/* Status badges */}
            <div className="flex items-center flex-wrap gap-2 mb-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[11px] font-bold text-green-400 tracking-widest uppercase">Systems Online</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <span className="text-[11px] font-bold text-primary tracking-widest uppercase">9 Channels Active</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
                <span className="text-[11px] font-bold text-violet-400 tracking-widest uppercase">AI Chief of Staff</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
              Good {getGreeting()},{' '}
              <span className="gradient-text">Abdullah</span>
            </h1>
            <p className="text-muted-foreground text-lg font-medium max-w-lg mt-2">
              Your AI Chief of Staff is actively monitoring and managing your digital presence across all connected platforms.
            </p>
          </div>

          {/* Right: live clock + collaborators */}
          <div className="flex flex-col items-start md:items-end gap-4 shrink-0">
            <div className="text-left md:text-right">
              <div className="text-4xl font-black tabular-nums text-foreground tracking-tighter font-mono">
                {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2.5">
                {(['JD', 'AS', 'MK'] as const).map((init, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full border-2 border-background bg-gradient-to-br from-primary/30 to-violet-500/30 flex items-center justify-center text-[11px] font-black shadow-lg"
                  >
                    {init}
                  </div>
                ))}
              </div>
              <span className="text-xs text-muted-foreground font-medium">3 collaborators</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Pending Tasks"    value={pending.length}   icon="📋" trend="+2 since 9 AM"       color="blue"    delay={1} />
        <StatCard label="Intelligence Ops" value={12}               icon="🧠" trend="84% efficiency"      color="purple"  delay={2} />
        <StatCard label="Completed Today"  value={completed.length} icon="✨" trend="Top 5% productivity" color="green"   delay={3} />
        <StatCard label="System Health"    value={99}               icon="🛡️" trend="All nominal"         color="emerald" delay={4} suffix="%" />
      </div>

      <GradientDivider />

      {/* ── Daily Digest ── */}
      <div className="animate-fade-in-delay-2">
        <SectionHeader
          accent="bg-amber-500"
          title="Daily Digest"
          subtitle="AI-curated summary of your day"
          badge={{ text: 'Auto-updated', color: 'amber' }}
        />
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/15 to-purple-500/15 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-700" />
          <div className="relative">
            <DailyDigestCard />
          </div>
        </div>
      </div>

      <GradientDivider />

      {/* ── Main Grid: Chat + Follow-ups | Task Board ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="space-y-8">
          <div className="animate-fade-in-delay-3">
            <SectionHeader
              accent="bg-primary"
              title="Executive Assistant"
              subtitle="Talk to your AI Chief of Staff"
            />
            <AgentChat />
          </div>
          <div className="animate-fade-in-delay-4">
            <SectionHeader
              accent="bg-amber-500"
              title="Critical Follow-ups"
              subtitle="Items needing your attention"
              badge={{ text: 'Urgent', color: 'amber' }}
            />
            <FollowUpsWidget />
          </div>
        </div>

        {/* Right: Task Board (wider) */}
        <div className="lg:col-span-2 animate-fade-in-delay-3">
          <div className="glass-card p-8 border-primary/10 shadow-2xl shadow-primary/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="w-2 h-7 bg-gradient-to-b from-primary to-violet-500 rounded-full" />
                  <h2 className="text-2xl font-black tracking-tight">Active Operations</h2>
                </div>
                <p className="text-muted-foreground mt-1 ml-5">
                  Managing <span className="text-foreground font-bold">{pending.length}</span> autonomous workflows
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </div>
                <span className="text-xs font-bold text-green-400 tracking-wider uppercase">Live Sync</span>
              </div>
            </div>
            <TaskBoard initialPending={pending} initialCompleted={completed} />
          </div>
        </div>
      </div>

      <GradientDivider />

      {/* ── Connected Channels ── */}
      <div className="animate-fade-in-delay-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="w-2 h-7 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full" />
              <h2 className="text-2xl font-black tracking-tight">Connected Channels</h2>
            </div>
            <p className="text-muted-foreground text-sm mt-1 ml-5">
              Active integrations from{' '}
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">config/integrations.env</code>
            </p>
          </div>
          <a
            href="/skills"
            className="text-sm font-bold text-primary hover:underline underline-offset-4 decoration-primary/40 transition-colors"
          >
            View All Skills →
          </a>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
          <SkillCard emoji="📧" name="Gmail"     status="active" actions={24} color="red"    />
          <SkillCard emoji="💬" name="WhatsApp"  status="active" actions={12} color="green"  />
          <SkillCard emoji="💼" name="LinkedIn"  status="active" actions={8}  color="blue"   />
          <SkillCard emoji="✈️" name="Telegram"  status="active" actions={31} color="sky"    />
          <SkillCard emoji="🐦" name="Twitter/X" status="active" actions={15} color="slate"  />
          <SkillCard emoji="📘" name="Facebook"  status="active" actions={9}  color="blue"   />
          <SkillCard emoji="📸" name="Instagram" status="active" actions={7}  color="pink"   />
          <SkillCard emoji="🎮" name="Discord"   status="soon"   actions={0}  color="indigo" />
          <SkillCard emoji="💡" name="Slack"     status="soon"   actions={0}  color="amber"  />
        </div>
      </div>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

function GradientDivider() {
  return (
    <div className="relative h-px my-2">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/10 to-transparent blur-sm" />
    </div>
  )
}

function SectionHeader({
  accent, title, subtitle, badge,
}: {
  accent: string
  title: string
  subtitle?: string
  badge?: { text: string; color: string }
}) {
  const badgeColors: Record<string, string> = {
    amber:  'bg-amber-500/10  border-amber-500/20  text-amber-400',
    blue:   'bg-blue-500/10   border-blue-500/20   text-blue-400',
    green:  'bg-green-500/10  border-green-500/20  text-green-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    red:    'bg-red-500/10    border-red-500/20    text-red-400',
  }
  const bc = badge ? (badgeColors[badge.color] ?? badgeColors.blue) : ''

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-start gap-3">
        <span className={`w-2 h-6 ${accent} rounded-full mt-0.5 shrink-0`} />
        <div>
          <h2 className="text-xl font-black tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground font-medium mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {badge && (
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${bc}`}>
          {badge.text}
        </div>
      )}
    </div>
  )
}

function StatCard({
  label, value, icon, trend, color, delay, suffix = '',
}: {
  label: string; value: number; icon: string; trend: string
  color: string; delay: number; suffix?: string
}) {
  const palette: Record<string, { bg: string; border: string; text: string; accent: string; bar: string }> = {
    blue:    { bg: 'from-blue-500/20 to-blue-600/5',     border: 'border-blue-500/20',    text: 'text-blue-400',    accent: 'from-blue-500 to-blue-400',      bar: 'bg-blue-500'    },
    purple:  { bg: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/20',  text: 'text-purple-400',  accent: 'from-purple-500 to-violet-400',   bar: 'bg-purple-500'  },
    green:   { bg: 'from-emerald-500/20 to-emerald-600/5',border: 'border-emerald-500/20',text: 'text-emerald-400', accent: 'from-emerald-500 to-green-400',   bar: 'bg-emerald-500' },
    emerald: { bg: 'from-teal-500/20 to-teal-600/5',     border: 'border-teal-500/20',    text: 'text-teal-400',    accent: 'from-teal-500 to-cyan-400',       bar: 'bg-teal-500'    },
  }
  const c = palette[color] ?? palette.blue

  return (
    <div className={`animate-fade-in-delay-${delay} group relative overflow-hidden rounded-2xl border ${c.border} bg-gradient-to-br ${c.bg} p-6 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}>
      {/* Top shimmer */}
      <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-current to-transparent ${c.text} opacity-40`} />
      {/* Left accent bar */}
      <div className={`absolute left-0 top-4 bottom-4 w-[3px] bg-gradient-to-b ${c.accent} rounded-r-full opacity-60`} />

      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${c.bg} border ${c.border} text-2xl group-hover:scale-110 transition-transform duration-200 shadow-inner`}>
          {icon}
        </div>
        <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border ${c.border} ${c.text}`}>
          {trend}
        </div>
      </div>

      <div className="flex items-baseline gap-1">
        <div className={`text-4xl font-black tracking-tighter tabular-nums ${c.text}`}>{value}</div>
        {suffix && <span className={`text-lg font-bold ${c.text}`}>{suffix}</span>}
      </div>
      <div className="text-sm font-semibold text-muted-foreground mt-1">{label}</div>

      {/* Sparkline bars */}
      <div className="mt-4 flex items-end gap-0.5 h-6 opacity-30 group-hover:opacity-60 transition-opacity duration-300">
        {[30, 50, 40, 70, 55, 80, 65].map((h, i) => (
          <div key={i} className={`flex-1 ${c.bar} rounded-t-sm`} style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  )
}

function SkillCard({
  emoji, name, status, actions, color,
}: {
  emoji: string; name: string; status: 'active' | 'soon'; actions: number; color: string
}) {
  const isSoon = status === 'soon'
  return (
    <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer group
      ${isSoon
        ? 'border-white/5 bg-white/[0.01] opacity-40'
        : 'border-white/10 bg-white/[0.03] hover:border-primary/30 hover:bg-primary/5 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10'
      } p-4 flex flex-col items-center gap-3 text-center backdrop-blur-md`}
    >
      {!isSoon && (
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
      <div className={`w-11 h-11 rounded-xl bg-${color}-500/15 border border-${color}-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
        {emoji}
      </div>
      <div className="space-y-1">
        <span className="text-xs font-black tracking-tight block leading-tight">{name}</span>
        {isSoon ? (
          <span className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest">Soon</span>
        ) : (
          <div className="flex items-center justify-center gap-1">
            <div className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
            </div>
            <span className="text-[9px] font-bold text-green-400/70 uppercase tracking-widest">{actions} ops</span>
          </div>
        )}
      </div>
    </div>
  )
}
