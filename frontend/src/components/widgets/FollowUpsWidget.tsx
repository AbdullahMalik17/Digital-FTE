'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Clock, Mail, AlertTriangle, CheckCircle, X, Bell } from "lucide-react"
import type { FollowUp } from '@/types'

export function FollowUpsWidget() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFollowUps()
  }, [])

  async function fetchFollowUps() {
    try {
      const res = await fetch('/api/follow-ups')
      if (res.ok) {
        const data = await res.json()
        setFollowUps(data.followUps || [])
      }
    } catch (error) {
      console.error('Failed to fetch follow-ups:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(id: string, action: 'resolve' | 'snooze' | 'dismiss') {
    try {
      await fetch(`/api/follow-ups/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      fetchFollowUps()
    } catch (error) {
      console.error('Failed to update follow-up:', error)
    }
  }

  if (loading) {
    return (
      <div className="glass-card p-6 border-amber-500/10 relative overflow-hidden">
        <div className="animate-pulse space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/[0.04] rounded-xl" />
            <div className="h-4 bg-white/[0.04] rounded w-1/3" />
          </div>
          {[1, 2].map((i) => <div key={i} className="h-16 bg-white/[0.03] rounded-xl" />)}
        </div>
      </div>
    )
  }

  const pendingFollowUps = followUps.filter((f) => f.status === 'pending')
  const overdueCount     = pendingFollowUps.filter((f) => f.daysSince > 3).length

  return (
    <div className="glass-card border-amber-500/10 relative overflow-hidden">
      {/* Top shimmer */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Bell className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="font-black text-foreground tracking-tight text-sm">Follow-up Reminders</h3>
              <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-widest">
                {pendingFollowUps.length} pending
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {overdueCount > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                <span className="text-[10px] font-bold text-red-400">{overdueCount} Overdue</span>
              </div>
            )}
          </div>
        </div>

        {/* Empty state */}
        {pendingFollowUps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-foreground/70">All caught up!</p>
              <p className="text-xs text-muted-foreground/50 mt-0.5">No pending follow-ups.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingFollowUps.slice(0, 5).map((followUp) => {
              const isOverdue = followUp.daysSince > 3
              const isWarning = followUp.daysSince > 1

              return (
                <div
                  key={followUp.id}
                  className={`relative overflow-hidden rounded-xl border transition-all duration-200 p-3 group ${
                    isOverdue
                      ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/30'
                      : isWarning
                        ? 'bg-amber-500/5 border-amber-500/15 hover:border-amber-500/25'
                        : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                  }`}
                >
                  {/* Left priority strip */}
                  <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${isOverdue ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-white/10'}`} />

                  <div className="flex items-start justify-between gap-2 pl-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Mail className="w-3 h-3 text-muted-foreground/50 shrink-0" />
                        <span className="text-sm font-bold text-foreground/90 truncate">{followUp.contact}</span>
                        {isOverdue && <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground/60 truncate mb-1">{followUp.subject}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground/40" />
                          <span className="text-[10px] text-muted-foreground/50 font-medium">
                            {followUp.daysSince === 0
                              ? 'Today'
                              : followUp.daysSince === 1
                                ? 'Yesterday'
                                : `${followUp.daysSince}d ago`}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          followUp.priority === 'high'
                            ? 'text-red-400 border-red-500/20 bg-red-500/5'
                            : followUp.priority === 'medium'
                              ? 'text-amber-400 border-amber-500/20 bg-amber-500/5'
                              : 'text-muted-foreground/50 border-white/5'
                        }`}>
                          {followUp.priority}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 hover:bg-emerald-500/10 hover:text-emerald-400 rounded-lg"
                        onClick={() => handleAction(followUp.id, 'resolve')}
                        title="Resolve"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 hover:bg-amber-500/10 hover:text-amber-400 rounded-lg"
                        onClick={() => handleAction(followUp.id, 'snooze')}
                        title="Snooze 2 days"
                      >
                        <Clock className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 hover:bg-red-500/10 hover:text-red-400 rounded-lg"
                        onClick={() => handleAction(followUp.id, 'dismiss')}
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}

            {pendingFollowUps.length > 5 && (
              <p className="text-center text-xs text-muted-foreground/40 font-bold uppercase tracking-widest pt-1">
                +{pendingFollowUps.length - 5} more follow-ups
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
