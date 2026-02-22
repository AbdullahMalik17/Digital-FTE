'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Task, EmailCategory } from '@/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  RefreshCw,
  CheckSquare,
  Inbox,
  TrendingUp,
  Calendar,
  Mail,
  Linkedin,
  MessageSquare,
  Filter,
  Sparkles,
} from 'lucide-react'

interface TaskData extends Task {
  category?: EmailCategory
  source?: 'gmail' | 'linkedin' | 'whatsapp' | 'telegram' | 'manual'
}

const SOURCE_META: Record<string, { icon: typeof Mail; color: string; bg: string; label: string }> = {
  gmail:    { icon: Mail,          color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20',    label: 'Gmail'    },
  linkedin: { icon: Linkedin,      color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20',  label: 'LinkedIn' },
  whatsapp: { icon: MessageSquare, color: 'text-emerald-400',bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'WhatsApp' },
  telegram: { icon: MessageSquare, color: 'text-sky-400',    bg: 'bg-sky-500/10 border-sky-500/20',    label: 'Telegram' },
  manual:   { icon: Inbox,         color: 'text-slate-400',  bg: 'bg-slate-500/10 border-slate-500/20',label: 'Manual'   },
}

const PRIORITY_META: Record<string, { color: string; bg: string; label: string }> = {
  urgent: { color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20',    label: 'Urgent' },
  high:   { color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', label: 'High'   },
  medium: { color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20', label: 'Medium' },
  low:    { color: 'text-slate-400',  bg: 'bg-slate-500/10 border-slate-500/20', label: 'Low'    },
}

export default function TasksPage() {
  const [pendingTasks,   setPendingTasks]   = useState<TaskData[]>([])
  const [completedTasks, setCompletedTasks] = useState<TaskData[]>([])
  const [loading,        setLoading]        = useState(true)
  const [searchTerm,     setSearchTerm]     = useState('')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterSource,   setFilterSource]   = useState<string>('all')
  const [activeTab,      setActiveTab]      = useState<'pending' | 'completed'>('pending')

  useEffect(() => {
    fetchTasks()
    const interval = setInterval(fetchTasks, 30000)
    return () => clearInterval(interval)
  }, [])

  async function fetchTasks() {
    try {
      const res = await fetch('/api/tasks')
      if (res.ok) {
        const data = await res.json()
        setPendingTasks(data.pending || [])
        setCompletedTasks(data.completed || [])
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  async function approveTask(taskId: string) {
    try {
      const res = await fetch(`/api/tasks/${taskId}/approve`, { method: 'POST' })
      if (res.ok) {
        toast.success('Task approved')
        fetchTasks()
      } else {
        toast.error('Failed to approve task')
      }
    } catch {
      toast.error('Error approving task')
    }
  }

  async function rejectTask(taskId: string) {
    try {
      const res = await fetch(`/api/tasks/${taskId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Not approved' }),
      })
      if (res.ok) {
        toast.success('Task rejected')
        fetchTasks()
      } else {
        toast.error('Failed to reject task')
      }
    } catch {
      toast.error('Error rejecting task')
    }
  }

  const filteredPending = pendingTasks.filter((task) => {
    const q = searchTerm.toLowerCase()
    const matchesSearch =
      task.content.toLowerCase().includes(q) ||
      task.filename.toLowerCase().includes(q) ||
      (task.title && task.title.toLowerCase().includes(q))
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority || task.importance === filterPriority
    const matchesSource   = filterSource   === 'all' || task.source   === filterSource
    return matchesSearch && matchesPriority && matchesSource
  })

  const filteredCompleted = completedTasks.filter((task) => {
    const q = searchTerm.toLowerCase()
    return (
      task.content.toLowerCase().includes(q) ||
      task.filename.toLowerCase().includes(q)
    )
  })

  const stats = {
    total:     pendingTasks.length + completedTasks.length,
    pending:   pendingTasks.length,
    completed: completedTasks.length,
    urgent:    pendingTasks.filter((t) => t.priority === 'urgent' || t.importance === 'high').length,
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative glass-card border-primary/10 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <CheckSquare className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Task Command Center</h1>
              <p className="text-sm text-muted-foreground/60 font-medium mt-0.5">
                Manage and approve AI-generated actions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-400">Auto-sync 30s</span>
            </div>
            <Button
              onClick={fetchTasks}
              variant="outline"
              size="sm"
              disabled={loading}
              className="border-white/10 bg-white/[0.02] hover:bg-white/[0.05] gap-2"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: stats.total,     icon: Inbox,        color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20'       },
          { label: 'Pending',     value: stats.pending,   icon: Clock,        color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20'     },
          { label: 'Completed',   value: stats.completed, icon: CheckCircle,  color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Urgent',      value: stats.urgent,    icon: AlertCircle,  color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20'         },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={cn('glass-card border p-5 flex flex-col gap-3', bg)}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">{label}</span>
              <Icon className={cn('w-4 h-4', color)} />
            </div>
            <div className={cn('text-3xl font-black tabular-nums', color)}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filters bar */}
      <div className="glass-card border-white/[0.05] p-4">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-3.5 h-3.5 text-muted-foreground/40" />
            <span className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-widest">Filters</span>
          </div>
          <div className="flex flex-1 flex-col md:flex-row gap-3 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
              <Input
                placeholder="Search tasks…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white/[0.02] border-white/[0.07] h-9 text-sm focus-visible:ring-primary/30"
              />
            </div>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full md:w-40 h-9 bg-white/[0.02] border-white/[0.07] text-sm">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSource} onValueChange={setFilterSource}>
              <SelectTrigger className="w-full md:w-40 h-9 bg-white/[0.02] border-white/[0.07] text-sm">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="gmail">Gmail</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="telegram">Telegram</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-5">
        {/* Tab row */}
        <div className="flex gap-2">
          {(['pending', 'completed'] as const).map((tab) => {
            const isActive = activeTab === tab
            const count = tab === 'pending' ? filteredPending.length : filteredCompleted.length
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 border border-primary/20 text-primary shadow-lg shadow-primary/10'
                    : 'bg-white/[0.02] border border-white/[0.05] text-muted-foreground/60 hover:bg-white/[0.04] hover:text-foreground'
                )}
              >
                {tab === 'pending' ? <Clock className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                <span className="capitalize">{tab}</span>
                <span className={cn(
                  'text-[10px] font-black px-1.5 py-0.5 rounded-full',
                  isActive ? 'bg-primary/20 text-primary' : 'bg-white/[0.04] text-muted-foreground/50'
                )}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Pending tasks */}
        {activeTab === 'pending' && (
          <div className="space-y-3">
            {loading ? (
              <div className="glass-card p-12 flex flex-col items-center gap-4 border-white/[0.05]">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-primary animate-spin" />
                </div>
                <p className="text-sm text-muted-foreground/60 font-medium">Loading tasks…</p>
              </div>
            ) : filteredPending.length === 0 ? (
              <div className="glass-card p-12 flex flex-col items-center gap-4 border-emerald-500/10">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <CheckSquare className="w-7 h-7 text-emerald-400" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-foreground/80">All cleared!</p>
                  <p className="text-sm text-muted-foreground/50 mt-1">No pending tasks. Well done.</p>
                </div>
              </div>
            ) : (
              filteredPending.map((task) => {
                const isUrgent = task.priority === 'urgent' || task.importance === 'high'
                const srcMeta  = SOURCE_META[task.source || 'manual'] || SOURCE_META.manual
                const priMeta  = PRIORITY_META[task.priority || 'medium'] || PRIORITY_META.medium
                const SrcIcon  = srcMeta.icon

                return (
                  <div
                    key={task.id}
                    className={cn(
                      'relative glass-card overflow-hidden transition-all duration-200 hover:border-white/10 group',
                      isUrgent ? 'border-red-500/20' : 'border-white/[0.05]'
                    )}
                  >
                    {/* Left priority strip */}
                    <div className={cn(
                      'absolute left-0 top-0 bottom-0 w-0.5',
                      isUrgent ? 'bg-red-500' : 'bg-amber-500/60'
                    )} />

                    <div className="p-5 pl-6 space-y-4">
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={cn(
                            'w-9 h-9 rounded-xl flex items-center justify-center border shrink-0',
                            srcMeta.bg
                          )}>
                            <SrcIcon className={cn('w-4 h-4', srcMeta.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <span className="text-xs font-mono text-foreground/50 truncate max-w-[260px]">
                                {task.filename}
                              </span>
                              <span className={cn('text-[10px] font-black px-1.5 py-0.5 rounded border', priMeta.bg, priMeta.color)}>
                                {priMeta.label}
                              </span>
                              {task.category && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/[0.06] text-muted-foreground/50">
                                  {task.category}
                                </span>
                              )}
                            </div>
                            {task.title && (
                              <p className="text-sm font-semibold text-foreground/80 truncate">{task.title}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground/40 font-medium shrink-0">
                          {new Date(task.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Content preview */}
                      <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3.5">
                        <p className="text-sm font-mono text-foreground/70 whitespace-pre-wrap leading-relaxed line-clamp-4">
                          {task.content}
                        </p>
                      </div>

                      {/* Bottom row */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {task.sentiment && (
                            <span className={cn(
                              'text-[10px] font-bold px-2 py-0.5 rounded border',
                              task.sentiment === 'positive'
                                ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'
                                : task.sentiment === 'negative'
                                  ? 'text-red-400 border-red-500/20 bg-red-500/5'
                                  : 'text-slate-400 border-slate-500/20 bg-slate-500/5'
                            )}>
                              {task.sentiment}
                            </span>
                          )}
                          {task.followUpDue && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-blue-500/20 bg-blue-500/5 text-blue-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {task.followUpDue}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => rejectTask(task.id)}
                            className="h-8 px-3 gap-1.5 text-xs font-bold hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 rounded-lg"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => approveTask(task.id)}
                            className="h-8 px-4 gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-lg shadow-emerald-500/20"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Completed tasks */}
        {activeTab === 'completed' && (
          <div className="space-y-3">
            {loading ? (
              <div className="glass-card p-12 flex flex-col items-center gap-4 border-white/[0.05]">
                <RefreshCw className="w-6 h-6 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground/60">Loading completed tasks…</p>
              </div>
            ) : filteredCompleted.length === 0 ? (
              <div className="glass-card p-12 flex flex-col items-center gap-4 border-white/[0.05]">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                  <Inbox className="w-7 h-7 text-muted-foreground/30" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-foreground/60">No completed tasks yet</p>
                  <p className="text-sm text-muted-foreground/40 mt-1">Approved tasks will appear here.</p>
                </div>
              </div>
            ) : (
              filteredCompleted.map((task) => (
                <div
                  key={task.id}
                  className="relative glass-card border-emerald-500/10 overflow-hidden opacity-70 hover:opacity-100 transition-opacity group"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-500/60" />
                  <div className="p-5 pl-6 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-muted-foreground/50 line-through truncate">
                        {task.filename}
                      </p>
                      <p className="text-xs text-muted-foreground/40 mt-0.5">
                        {new Date(task.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Done
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
