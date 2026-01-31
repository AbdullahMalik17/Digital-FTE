'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Calendar,
  TrendingUp,
  Lightbulb
} from "lucide-react"
import type { DailyDigest } from '@/types'

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
      <Card className="bg-gradient-to-br from-blue-950/50 to-zinc-900/50 border-blue-900/30">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
            <div className="h-8 bg-zinc-800 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!digest) {
    return null
  }

  return (
    <Card className="bg-gradient-to-br from-blue-950/50 to-zinc-900/50 border-blue-900/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-blue-100">
            {digest.greeting}
          </CardTitle>
          <Badge variant="outline" className="text-blue-400 border-blue-700">
            {new Date(digest.date).toLocaleDateString('en-US', { weekday: 'long' })}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-3">
          <StatBadge
            icon={<AlertCircle className="w-4 h-4" />}
            label="Urgent"
            value={digest.urgentCount}
            color="red"
          />
          <StatBadge
            icon={<CheckCircle2 className="w-4 h-4" />}
            label="Actions"
            value={digest.actionCount}
            color="yellow"
          />
          <StatBadge
            icon={<Clock className="w-4 h-4" />}
            label="Follow-ups"
            value={digest.followUpsCount}
            color="orange"
          />
          <StatBadge
            icon={<Calendar className="w-4 h-4" />}
            label="Events"
            value={digest.todayEvents.length}
            color="blue"
          />
        </div>

        {/* Today's Events */}
        {digest.todayEvents.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Today's Schedule
            </h4>
            <div className="space-y-1">
              {digest.todayEvents.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-2 text-sm text-zinc-400 bg-zinc-900/50 px-2 py-1 rounded"
                >
                  <span className="text-blue-400 font-mono text-xs">
                    {new Date(event.start).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <span className="truncate">{event.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        {digest.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              <Lightbulb className="w-3 h-3" /> Recommendations
            </h4>
            <ul className="space-y-1">
              {digest.recommendations.slice(0, 2).map((rec, i) => (
                <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                  <TrendingUp className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Yesterday Summary */}
        {digest.yesterdaySummary && (
          <div className="pt-2 border-t border-zinc-800">
            <p className="text-xs text-zinc-600">
              Yesterday: {digest.yesterdaySummary.tasksCompleted} tasks completed,
              {digest.yesterdaySummary.emailsSent} emails sent
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function StatBadge({
  icon,
  label,
  value,
  color
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: 'red' | 'yellow' | 'orange' | 'blue' | 'green'
}) {
  const colorClasses = {
    red: 'bg-red-950/50 border-red-900/50 text-red-400',
    yellow: 'bg-yellow-950/50 border-yellow-900/50 text-yellow-400',
    orange: 'bg-orange-950/50 border-orange-900/50 text-orange-400',
    blue: 'bg-blue-950/50 border-blue-900/50 text-blue-400',
    green: 'bg-green-950/50 border-green-900/50 text-green-400',
  }

  return (
    <div className={`flex flex-col items-center p-2 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center gap-1">
        {icon}
        <span className="text-lg font-bold">{value}</span>
      </div>
      <span className="text-[10px] uppercase tracking-wider opacity-70">{label}</span>
    </div>
  )
}
