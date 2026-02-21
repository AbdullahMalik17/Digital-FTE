import { fetchTasks, fetchFinancials } from '@/app/actions'
import TaskBoard from '@/components/TaskBoard'
import AgentChat from '@/components/AgentChat'
import { DailyDigestCard, FollowUpsWidget, AnalyticsCard } from '@/components/widgets'

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
    <div className="relative space-y-10 pb-20">
      {/* Decorative Background Elements */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px] -z-10" />

      {/* Header */}
      <div className="animate-fade-in flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Good {getGreeting()}, <span className="gradient-text">Abdullah</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Your digital employee is monitoring <span className="text-foreground font-medium underline decoration-primary/30 underline-offset-4">9 channels</span> for you today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold">
                {i === 1 ? 'JD' : i === 2 ? 'AS' : 'MK'}
              </div>
            ))}
          </div>
          <span className="text-xs text-muted-foreground font-medium">3 active collaborators</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Pending Tasks"
          value={pending.length}
          icon="📋"
          trend="+2 since 9 AM"
          color="blue"
          delay={1}
        />
        <StatCard
          label="Intelligence Ops"
          value={12}
          icon="🧠"
          trend="84% efficiency"
          color="purple"
          delay={2}
        />
        <StatCard
          label="Completed Today"
          value={completed.length}
          icon="✨"
          trend="Top 5% productivity"
          color="green"
          delay={3}
        />
        <StatCard
          label="System Health"
          value={99}
          icon="🛡️"
          trend="All systems nominal"
          color="emerald"
          delay={4}
          suffix="%"
        />
      </div>

      {/* Daily Digest */}
      <div className="animate-fade-in-delay-2 group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative">
          <DailyDigestCard />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Chat + Follow-ups */}
        <div className="space-y-8">
          <div className="animate-fade-in-delay-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="w-2 h-6 bg-primary rounded-full" />
                Executive Assistant
              </h2>
            </div>
            <AgentChat />
          </div>
          <div className="animate-fade-in-delay-4">
             <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="w-2 h-6 bg-amber-500 rounded-full" />
                Critical Follow-ups
              </h2>
            </div>
            <FollowUpsWidget />
          </div>
        </div>

        {/* Right: Task Board (wider) */}
        <div className="lg:col-span-2 animate-fade-in-delay-3">
          <div className="glass-card p-8 border-primary/10 shadow-2xl shadow-primary/5">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Active Operations</h2>
                <p className="text-muted-foreground mt-1">
                  Managing {pending.length} autonomous workflows
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-xs font-bold text-primary tracking-wider uppercase">Live Sync</span>
              </div>
            </div>
            <TaskBoard initialPending={pending} initialCompleted={completed} />
          </div>
        </div>
      </div>

      {/* Integration Channels Overview */}
      <div className="animate-fade-in-delay-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Connected Channels</h2>
            <p className="text-muted-foreground text-sm mt-1">Active integrations from <code className="text-xs bg-muted px-1.5 py-0.5 rounded">config/integrations.env</code></p>
          </div>
          <a href="/skills" className="text-sm font-semibold text-primary hover:underline">View All Skills →</a>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
          <SkillCard emoji="📧" name="Gmail"       status="active"  actions={24} color="red"    />
          <SkillCard emoji="💬" name="WhatsApp"    status="active"  actions={12} color="green"  />
          <SkillCard emoji="💼" name="LinkedIn"    status="active"  actions={8}  color="blue"   />
          <SkillCard emoji="✈️" name="Telegram"    status="active"  actions={31} color="sky"    />
          <SkillCard emoji="🐦" name="Twitter/X"   status="active"  actions={15} color="slate"  />
          <SkillCard emoji="📘" name="Facebook"    status="active"  actions={9}  color="blue"   />
          <SkillCard emoji="📸" name="Instagram"   status="active"  actions={7}  color="pink"   />
          <SkillCard emoji="🎮" name="Discord"     status="soon"    actions={0}  color="indigo" />
          <SkillCard emoji="💡" name="Slack"       status="soon"    actions={0}  color="amber"  />
        </div>
      </div>
    </div>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

function StatCard({
  label, value, icon, trend, color, delay, suffix = ""
}: {
  label: string; value: number; icon: string; trend: string;
  color: string; delay: number; suffix?: string;
}) {
  return (
    <div className={`animate-fade-in-delay-${delay} stat-card group glass-card-hover`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-xl bg-primary/10 text-xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1 rounded-lg bg-muted/50">
          {trend}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <div className="counter-value">{value}</div>
        {suffix && <span className="text-lg font-bold text-muted-foreground">{suffix}</span>}
      </div>
      <div className="text-sm font-semibold text-muted-foreground/80 mt-1 uppercase tracking-tight">{label}</div>
      
      {/* Mini sparkline visualization (purely decorative) */}
      <div className="mt-4 flex items-end gap-1 h-8 opacity-30">
        {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
          <div 
            key={i} 
            className="flex-1 bg-primary rounded-t-sm transition-all duration-500 group-hover:opacity-100"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  )
}

function SkillCard({
  emoji, name, status, actions, color
}: {
  emoji: string; name: string; status: 'active' | 'soon'; actions: number; color: string;
}) {
  const isSoon = status === 'soon'
  return (
    <div className={`glass-card p-3 flex flex-col items-center gap-2 text-center glass-card-hover cursor-pointer group ${isSoon ? 'opacity-50' : ''}`}>
      <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 flex items-center justify-center text-xl group-hover:rotate-6 transition-transform shadow-inner`}>
        {emoji}
      </div>
      <div className="space-y-0.5">
        <span className="text-xs font-bold tracking-tight block leading-tight">{name}</span>
        {isSoon ? (
          <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Soon</span>
        ) : (
          <div className="flex items-center justify-center gap-1">
            <div className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
            </div>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{actions} ops</span>
          </div>
        )}
      </div>
    </div>
  )
}
