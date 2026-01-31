'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  Inbox
} from "lucide-react"
import type { Analytics } from '@/types'

interface AnalyticsData extends Analytics {
  trends?: {
    tasksCompletedTrend: string
    responseTimeTrend: string
    emailVolumeTrend: string
  }
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
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-zinc-800 rounded w-1/3"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-16 bg-zinc-800 rounded"></div>
              <div className="h-16 bg-zinc-800 rounded"></div>
              <div className="h-16 bg-zinc-800 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analytics) return null

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Performance Analytics
          </CardTitle>
          <Badge variant="outline" className="text-xs text-green-500 border-green-800">
            {analytics.approvalRate}% Approval Rate
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <MetricCard
            icon={<CheckCircle2 className="w-4 h-4 text-green-500" />}
            label="Tasks Today"
            value={analytics.tasksToday}
            trend={analytics.trends?.tasksCompletedTrend}
          />
          <MetricCard
            icon={<Inbox className="w-4 h-4 text-blue-500" />}
            label="This Week"
            value={analytics.tasksThisWeek}
            trend={analytics.trends?.emailVolumeTrend}
          />
          <MetricCard
            icon={<Clock className="w-4 h-4 text-yellow-500" />}
            label="Avg Response"
            value={analytics.avgResponseTime}
            trend={analytics.trends?.responseTimeTrend}
            isTime
          />
        </div>

        {/* Category Distribution */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Email Categories
          </h4>
          <div className="space-y-2">
            {analytics.topCategories.slice(0, 4).map((cat) => (
              <CategoryBar
                key={cat.category}
                category={cat.category}
                count={cat.count}
                total={analytics.topCategories.reduce((a, b) => a + b.count, 0)}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MetricCard({
  icon,
  label,
  value,
  trend,
  isTime = false
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  trend?: string
  isTime?: boolean
}) {
  const isPositive = trend?.startsWith('+')
  const isNegative = trend?.startsWith('-')

  return (
    <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
      <div className="flex items-center justify-between mb-1">
        {icon}
        {trend && (
          <span className={`text-[10px] flex items-center gap-0.5 ${
            isTime
              ? isNegative ? 'text-green-500' : 'text-red-500'
              : isPositive ? 'text-green-500' : 'text-red-500'
          }`}>
            {(isTime ? isNegative : isPositive) ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trend}
          </span>
        )}
      </div>
      <div className="text-lg font-bold text-zinc-200">{value}</div>
      <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{label}</div>
    </div>
  )
}

function CategoryBar({
  category,
  count,
  total
}: {
  category: string
  count: number
  total: number
}) {
  const percentage = Math.round((count / total) * 100)

  const categoryColors: Record<string, string> = {
    urgent_action: 'bg-red-500',
    high_priority: 'bg-orange-500',
    normal: 'bg-blue-500',
    low_priority: 'bg-zinc-500',
    newsletter: 'bg-purple-500',
    social: 'bg-pink-500',
    promotional: 'bg-yellow-500',
    meeting: 'bg-green-500',
    financial: 'bg-emerald-500',
  }

  const categoryLabels: Record<string, string> = {
    urgent_action: 'Urgent',
    high_priority: 'High Priority',
    normal: 'Normal',
    low_priority: 'Low',
    newsletter: 'Newsletter',
    social: 'Social',
    promotional: 'Promo',
    meeting: 'Meeting',
    financial: 'Financial',
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-zinc-500 w-20 truncate">
        {categoryLabels[category] || category}
      </span>
      <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${categoryColors[category] || 'bg-zinc-600'} transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-zinc-600 w-8 text-right">{count}</span>
    </div>
  )
}
