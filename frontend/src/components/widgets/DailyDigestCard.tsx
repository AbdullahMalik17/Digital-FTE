'use client'

import { useEffect, useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, Clock, Calendar, TrendingUp, Lightbulb, Sparkles } from "lucide-react"
import type { DailyDigest } from '@/types'

const MOCK_DIGEST = {
  greeting: "AI Intelligence Briefing",
  date: new Date().toISOString(),
  urgentCount: 3,
  actionCount: 7,
  followUpsCount: 2,
  todayEvents: [
    { id: '1', title: 'Team Standup', start: new Date(Date.now() + 3_600_000).toISOString() },
    { id: '2', title: 'Client Strategy Review', start: new Date(Date.now() + 7_200_000).toISOString() },
  ],
  recommendations: [
    'Follow up on 3 unanswered LinkedIn messages from yesterday.',
    'Schedule pending invoice review — 2 invoices awaiting approval.',
  ],
  yesterdaySummary: { tasksCompleted: 12, emailsSent: 8 },
}

export function DailyDigestCard() {
  const [digest, setDigest] = useState<DailyDigest | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDigest() {
      try {
        const res = await fetch('/api/digest')
        if (res.ok) {
          const data = await res.json()
          setDigest(data)
        }
      } catch (error) {
        console.error('Failed to fetch digest:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDigest()
  }, [])

  if (loading) {
    return (
      <div className="glass-card p-6 border-primary/10 relative overflow-hidden">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/[0.04] rounded-xl" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-white/[0.04] rounded w-1/2" />
              <div className="h-3 bg-white/[0.04] rounded w-1/4" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-white/[0.03] rounded-xl" />)}
          </div>
          <div className="h-20 bg-white/[0.03] rounded-xl" />
        </div>
      </div>
    )
  }

  const data = (digest as any) || MOCK_DIGEST

  const stats = [
    { icon: AlertCircle,   label: 'Urgent',    value: data.urgentCount,        color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20'    },
    { icon: CheckCircle2,  label: 'Actions',   value: data.actionCount,        color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20' },
    { icon: Clock,         label: 'Follow-ups', value: data.followUpsCount,     color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20'},
    { icon: Calendar,      label: 'Events',    value: data.todayEvents.length, color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20'   },
  ]

  return (
    <div className="glass-card border-primary/10 relative overflow-hidden">
      {/* Top shimmer */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/30 to-violet-500/30 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-black text-foreground tracking-tight">{data.greeting}</h3>
              <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">
                {new Date(data.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Live Briefing</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {stats.map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className={`flex flex-col items-center p-3 rounded-xl border ${bg} gap-1.5`}>
              <div className="flex items-center gap-1.5">
                <Icon className={`w-3.5 h-3.5 ${color}`} />
                <span className={`text-xl font-black tabular-nums ${color}`}>{value}</span>
              </div>
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground/60 font-bold">{label}</span>
            </div>
          ))}
        </div>

        {/* Today's Schedule */}
        {data.todayEvents.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground/40" />
              <h4 className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.15em]">Today&apos;s Schedule</h4>
            </div>
            <div className="space-y-2">
              {data.todayEvents.slice(0, 3).map((event: any) => (
                <div key={event.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                  <span className="text-primary font-mono text-[11px] font-black min-w-[48px]">
                    {new Date(event.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-primary/50 shrink-0" />
                  <span className="text-sm text-foreground/80 font-medium truncate">{event.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        {data.recommendations.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400/60" />
              <h4 className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.15em]">AI Recommendations</h4>
            </div>
            <div className="space-y-2">
              {data.recommendations.slice(0, 2).map((rec: string, i: number) => (
                <div key={i} className="flex items-start gap-2.5 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400/70 mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground/80 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Yesterday Summary */}
        {data.yesterdaySummary && (
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-widest">Yesterday</span>
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-black text-emerald-400">{data.yesterdaySummary.tasksCompleted} tasks done</span>
              <span className="text-[11px] font-black text-primary">{data.yesterdaySummary.emailsSent} emails sent</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
