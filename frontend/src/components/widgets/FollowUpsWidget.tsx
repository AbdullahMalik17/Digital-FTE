'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
        body: JSON.stringify({ action })
      })
      // Refresh the list
      fetchFollowUps()
    } catch (error) {
      console.error('Failed to update follow-up:', error)
    }
  }

  if (loading) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-zinc-800 rounded w-1/3"></div>
            <div className="h-16 bg-zinc-800 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const pendingFollowUps = followUps.filter(f => f.status === 'pending')
  const overdueFollowUps = pendingFollowUps.filter(f => f.daysSince > 3)

  if (pendingFollowUps.length === 0) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Follow-up Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6 text-zinc-600 text-sm">
            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
            All caught up! No pending follow-ups.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Follow-up Reminders
          </CardTitle>
          <div className="flex gap-2">
            {overdueFollowUps.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {overdueFollowUps.length} Overdue
              </Badge>
            )}
            <Badge variant="outline" className="text-xs text-zinc-500">
              {pendingFollowUps.length} Pending
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {pendingFollowUps.slice(0, 5).map((followUp) => (
          <div
            key={followUp.id}
            className={`p-3 rounded-lg border transition-colors ${
              followUp.daysSince > 3
                ? 'bg-red-950/20 border-red-900/30'
                : followUp.daysSince > 1
                ? 'bg-yellow-950/20 border-yellow-900/30'
                : 'bg-zinc-800/50 border-zinc-700/50'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-3 h-3 text-zinc-500" />
                  <span className="text-sm font-medium text-zinc-300 truncate">
                    {followUp.contact}
                  </span>
                  {followUp.daysSince > 3 && (
                    <AlertTriangle className="w-3 h-3 text-red-500" />
                  )}
                </div>
                <p className="text-xs text-zinc-500 truncate">{followUp.subject}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-3 h-3 text-zinc-600" />
                  <span className="text-xs text-zinc-600">
                    {followUp.daysSince === 0
                      ? 'Sent today'
                      : followUp.daysSince === 1
                      ? 'Sent yesterday'
                      : `${followUp.daysSince} days ago`}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      followUp.priority === 'high'
                        ? 'text-red-400 border-red-800'
                        : followUp.priority === 'medium'
                        ? 'text-yellow-400 border-yellow-800'
                        : 'text-zinc-500 border-zinc-700'
                    }`}
                  >
                    {followUp.priority}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-zinc-500 hover:text-green-400"
                  onClick={() => handleAction(followUp.id, 'resolve')}
                  title="Mark as resolved"
                >
                  <CheckCircle className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-zinc-500 hover:text-yellow-400"
                  onClick={() => handleAction(followUp.id, 'snooze')}
                  title="Snooze 2 days"
                >
                  <Clock className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-zinc-500 hover:text-red-400"
                  onClick={() => handleAction(followUp.id, 'dismiss')}
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {pendingFollowUps.length > 5 && (
          <p className="text-xs text-center text-zinc-600">
            +{pendingFollowUps.length - 5} more follow-ups
          </p>
        )}
      </CardContent>
    </Card>
  )
}
