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
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight">
          Good {getGreeting()}, <span className="gradient-text">Abdullah</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with your digital employee today.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Pending"
          value={pending.length}
          icon="📋"
          trend="+2 today"
          color="blue"
          delay={1}
        />
        <StatCard
          label="In Progress"
          value={0}
          icon="🔄"
          trend="All on track"
          color="amber"
          delay={2}
        />
        <StatCard
          label="Done Today"
          value={completed.length}
          icon="✅"
          trend="Great progress"
          color="green"
          delay={3}
        />
        <StatCard
          label="Urgent"
          value={0}
          icon="🔴"
          trend="All clear"
          color="red"
          delay={4}
        />
      </div>

      {/* Daily Digest */}
      <div className="animate-fade-in-delay-2">
        <DailyDigestCard />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Chat + Follow-ups */}
        <div className="space-y-6">
          <div className="animate-fade-in-delay-3">
            <AgentChat />
          </div>
          <div className="animate-fade-in-delay-4">
            <FollowUpsWidget />
          </div>
        </div>

        {/* Right: Task Board (wider) */}
        <div className="lg:col-span-2 animate-fade-in-delay-3">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Active Operations</h2>
                <p className="text-sm text-muted-foreground">
                  {pending.length} pending tasks
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  Live
                </span>
              </div>
            </div>
            <TaskBoard initialPending={pending} initialCompleted={completed} />
          </div>
        </div>
      </div>

      {/* Agent Skills Overview */}
      <div className="animate-fade-in-delay-4">
        <h2 className="text-lg font-semibold mb-4">Agent Skills</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <SkillCard emoji="📧" name="Gmail" status="active" actions={24} />
          <SkillCard emoji="💬" name="WhatsApp" status="active" actions={12} />
          <SkillCard emoji="💼" name="LinkedIn" status="active" actions={8} />
          <SkillCard emoji="📱" name="Telegram" status="active" actions={45} />
          <SkillCard emoji="📅" name="Calendar" status="active" actions={6} />
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
  label, value, icon, trend, color, delay
}: {
  label: string; value: number; icon: string; trend: string;
  color: 'blue' | 'green' | 'amber' | 'red'; delay: number
}) {
  const colorMap = {
    blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/20',
    green: 'from-green-500/10 to-green-600/5 border-green-500/20',
    amber: 'from-amber-500/10 to-amber-600/5 border-amber-500/20',
    red: 'from-red-500/10 to-red-600/5 border-red-500/20',
  }

  return (
    <div className={`animate-fade-in-delay-${delay} stat-card bg-gradient-to-br ${colorMap[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs text-muted-foreground">{trend}</span>
      </div>
      <div className="counter-value">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  )
}

function SkillCard({
  emoji, name, status, actions
}: {
  emoji: string; name: string; status: string; actions: number
}) {
  return (
    <div className="glass-card p-4 flex flex-col items-center gap-2 text-center hover:border-primary/20 transition-all duration-200 cursor-default">
      <span className="text-2xl">{emoji}</span>
      <span className="text-sm font-medium">{name}</span>
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        <span className="text-xs text-muted-foreground">{actions} actions</span>
      </div>
    </div>
  )
}
