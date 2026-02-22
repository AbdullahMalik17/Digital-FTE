'use client'

import { useEffect, useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, TrendingDown, CheckCircle2, Clock, Inbox } from "lucide-react"
import type { Analytics } from '@/types'

interface AnalyticsData extends Analytics {
  trends?: {
    tasksCompletedTrend: string
    responseTimeTrend: string
    emailVolumeTrend: string
  }
}

const MOCK_ANALYTICS: AnalyticsData = {
  tasksToday: 8,
  tasksThisWeek: 47,
  avgResponseTime: 12,
  approvalRate: 94,
  topCategories: [
    { category: 'urgent_action',  count: 12 },
    { category: 'high_priority',  count: 18 },
    { category: 'normal',         count: 30 },
    { category: 'meeting',        count: 9  },
  ],
  trends: {
    tasksCompletedTrend: '+15%',
    responseTimeTrend: '-2m',
    emailVolumeTrend: '+8%',
  },
}

const CATEGORY_LABELS: Record<string, string> = {
  urgent_action: 'Urgent',
  high_priority: 'High Priority',
  normal:        'Normal',
  low_priority:  'Low',
  newsletter:    'Newsletter',
  social:        'Social',
  promotional:   'Promo',
  meeting:       'Meeting',
  financial:     'Financial',
}

const CATEGORY_COLORS: Record<string, { bar: string; bg: string; text: string }> = {
  urgent_action: { bar: 'bg-red-500',     bg: 'bg-red-500/10',     text: 'text-red-400'     },
  high_priority: { bar: 'bg-orange-500',  bg: 'bg-orange-500/10',  text: 'text-orange-400'  },
  normal:        { bar: 'bg-blue-500',    bg: 'bg-blue-500/10',    text: 'text-blue-400'    },
  low_priority:  { bar: 'bg-slate-500',   bg: 'bg-slate-500/10',   text: 'text-slate-400'   },
  newsletter:    { bar: 'bg-purple-500',  bg: 'bg-purple-500/10',  text: 'text-purple-400'  },
  social:        { bar: 'bg-pink-500',    bg: 'bg-pink-500/10',    text: 'text-pink-400'    },
  promotional:   { bar: 'bg-yellow-500',  bg: 'bg-yellow-500/10',  text: 'text-yellow-400'  },
  meeting:       { bar: 'bg-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  financial:     { bar: 'bg-teal-500',    bg: 'bg-teal-500/10',    text: 'text-teal-400'    },
}

export function AnalyticsCard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/analytics')
        if (res.ok) {
          const data = await res.json()
          setAnalytics(data)
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="glass-card p-6 border-primary/10">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/[0.04] rounded-xl" />
            <div className="h-4 bg-white/[0.04] rounded w-1/3" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-white/[0.03] rounded-xl" />)}
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-6 bg-white/[0.03] rounded" />)}
          </div>
        </div>
      </div>
    )
  }

  const data = analytics || MOCK_ANALYTICS
  const total = data.topCategories.reduce((a, b) => a + b.count, 0)

  const metrics = [
    {
      icon: CheckCircle2,
      label: 'Tasks Today',
      value: data.tasksToday,
      trend: data.trends?.tasksCompletedTrend,
      iconColor: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      isTime: false,
    },
    {
      icon: Inbox,
      label: 'This Week',
      value: data.tasksThisWeek,
      trend: data.trends?.emailVolumeTrend,
      iconColor: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
      isTime: false,
    },
    {
      icon: Clock,
      label: 'Avg Response',
      value: `${data.avgResponseTime}m`,
      trend: data.trends?.responseTimeTrend,
      iconColor: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      isTime: true,
    },
  ]

  return (
    <div className="glass-card border-primary/10 relative overflow-hidden">
      {/* Top shimmer */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/20 flex items-center justify-center shadow-lg">
              <BarChart3 className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <h3 className="font-black text-foreground tracking-tight">Performance Analytics</h3>
              <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-widest">
                Real-time metrics
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-400">{data.approvalRate}% Approval</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-3">
          {metrics.map(({ icon: Icon, label, value, trend, iconColor, bg, isTime }) => {
            const isPositive = trend?.startsWith('+')
            const isNegative = trend?.startsWith('-')
            const trendGood  = isTime ? isNegative : isPositive

            return (
              <div key={label} className={`flex flex-col p-3 rounded-xl border ${bg} gap-2`}>
                <div className="flex items-center justify-between">
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                  {trend && (
                    <span className={`text-[10px] flex items-center gap-0.5 font-bold ${trendGood ? 'text-emerald-400' : 'text-red-400'}`}>
                      {trendGood ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {trend}
                    </span>
                  )}
                </div>
                <div className="text-xl font-black text-foreground tabular-nums">{value}</div>
                <div className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">{label}</div>
              </div>
            )
          })}
        </div>

        {/* Category Distribution */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.15em]">
            Email Category Distribution
          </h4>
          <div className="space-y-2.5">
            {data.topCategories.slice(0, 4).map((cat) => {
              const pct = Math.round((cat.count / total) * 100)
              const c   = CATEGORY_COLORS[cat.category] || { bar: 'bg-slate-500', bg: 'bg-slate-500/10', text: 'text-slate-400' }

              return (
                <div key={cat.category} className="flex items-center gap-3">
                  <span className={`text-[11px] font-bold w-20 truncate ${c.text}`}>
                    {CATEGORY_LABELS[cat.category] || cat.category}
                  </span>
                  <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${c.bar} rounded-full transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground/50 w-7 text-right tabular-nums">{cat.count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
