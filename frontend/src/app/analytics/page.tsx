'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Analytics } from '@/types'
import { cn } from '@/lib/utils'
import {
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle,
  Clock,
  Mail,
  BarChart3,
  PieChart,
  Calendar,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap,
  Users,
  DollarSign,
} from 'lucide-react'

interface AnalyticsData extends Analytics {
  tasksToday: number
  tasksThisWeek: number
  avgResponseTime: string
  topCategories: { category: string; count: number }[]
  approvalRate: number
  trends?: {
    tasksCompletedTrend: string
    responseTimeTrend: string
    emailVolumeTrend: string
  }
  hourlyActivity?: { hour: string; count: number }[]
  sourceBreakdown?: { source: string; count: number; percentage: number }[]
  weeklyData?: { day: string; tasks: number; completed: number }[]
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  async function fetchAnalytics() {
    setLoading(true)
    try {
      const res = await fetch(`/api/analytics?range=${timeRange}`)
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

  function getTrendIcon(value: string) {
    if (value.startsWith('+')) {
      return <ArrowUpRight className="w-4 h-4 text-green-500" />
    } else if (value.startsWith('-')) {
      return <ArrowDownRight className="w-4 h-4 text-red-500" />
    }
    return null
  }

  function getTrendColor(value: string) {
    if (value.startsWith('+')) {
      return 'text-green-500'
    } else if (value.startsWith('-')) {
      return 'text-red-500'
    }
    return 'text-muted-foreground'
  }

  function getCategoryColor(category: string) {
    const colors: Record<string, string> = {
      urgent_action: 'bg-red-500',
      high_priority: 'bg-orange-500',
      normal: 'bg-blue-500',
      newsletter: 'bg-purple-500',
      meeting: 'bg-green-500',
      financial: 'bg-yellow-500',
      social: 'bg-pink-500',
      promotional: 'bg-gray-500',
    }
    return colors[category] || 'bg-blue-500'
  }

  function getSourceIcon(source: string) {
    switch (source) {
      case 'gmail':
        return <Mail className="w-4 h-4" />
      case 'linkedin':
        return <Users className="w-4 h-4" />
      case 'whatsapp':
        return <Zap className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No analytics data available</p>
        </div>
      </div>
    )
  }

  const totalTasks = analytics.topCategories.reduce((sum, cat) => sum + cat.count, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Performance insights and task metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as '7d' | '30d' | '90d')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <button
            onClick={fetchAnalytics}
            className="p-2 rounded-lg border border-border hover:bg-accent transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tasks Today
              </CardTitle>
              <CheckCircle className="w-4 h-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.tasksToday}</div>
            {analytics.trends && (
              <div className={cn('flex items-center gap-1 mt-2 text-xs', getTrendColor(analytics.trends.tasksCompletedTrend))}>
                {getTrendIcon(analytics.trends.tasksCompletedTrend)}
                {analytics.trends.tasksCompletedTrend} vs last week
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tasks This Week
              </CardTitle>
              <BarChart3 className="w-4 h-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.tasksThisWeek}</div>
            {analytics.trends && (
              <div className={cn('flex items-center gap-1 mt-2 text-xs', getTrendColor(analytics.trends.emailVolumeTrend))}>
                {getTrendIcon(analytics.trends.emailVolumeTrend)}
                {analytics.trends.emailVolumeTrend} volume
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Response Time
              </CardTitle>
              <Clock className="w-4 h-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgResponseTime}</div>
            {analytics.trends && (
              <div className={cn('flex items-center gap-1 mt-2 text-xs', getTrendColor(analytics.trends.responseTimeTrend))}>
                {getTrendIcon(analytics.trends.responseTimeTrend)}
                {analytics.trends.responseTimeTrend} improvement
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Approval Rate
              </CardTitle>
              <Target className="w-4 h-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.approvalRate}%</div>
            <Progress value={analytics.approvalRate} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Task Categories
            </CardTitle>
            <CardDescription>Distribution of tasks by category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.topCategories.map((category) => {
              const percentage = totalTasks > 0 ? Math.round((category.count / totalTasks) * 100) : 0
              return (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-3 h-3 rounded-full', getCategoryColor(category.category))} />
                      <span className="text-sm capitalize">{category.category.replace('_', ' ')}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {category.count} ({percentage}%)
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Performance Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Performance Trends
            </CardTitle>
            <CardDescription>Key metrics over time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-blue-500/5">
                <div className="text-2xl font-bold text-blue-500">
                  {analytics.trends?.tasksCompletedTrend}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Task Volume</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-500/5">
                <div className="text-2xl font-bold text-green-500">
                  {analytics.trends?.responseTimeTrend}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Response Time</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-purple-500/5">
                <div className="text-2xl font-bold text-purple-500">
                  {analytics.trends?.emailVolumeTrend}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Email Volume</div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-3">Weekly Activity</h4>
              <div className="space-y-2">
                {analytics.weeklyData?.slice(0, 5).map((day, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-16 text-xs text-muted-foreground">{day.day}</div>
                    <div className="flex-1 flex gap-1">
                      <div 
                        className="h-2 bg-blue-500 rounded-l-sm" 
                        style={{ width: `${(day.tasks / 20) * 100}%` }}
                      />
                      <div 
                        className="h-2 bg-green-500 rounded-r-sm" 
                        style={{ width: `${(day.completed / 20) * 100}%` }}
                      />
                    </div>
                    <div className="w-12 text-xs text-right text-muted-foreground">
                      {day.completed}/{day.tasks}
                    </div>
                  </div>
                )) || (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-16 text-xs text-muted-foreground">Mon</div>
                      <div className="flex-1 flex gap-1">
                        <div className="h-2 bg-blue-500 rounded-l-sm" style={{ width: '60%' }} />
                        <div className="h-2 bg-green-500 rounded-r-sm" style={{ width: '50%' }} />
                      </div>
                      <div className="w-12 text-xs text-right text-muted-foreground">10/12</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-16 text-xs text-muted-foreground">Tue</div>
                      <div className="flex-1 flex gap-1">
                        <div className="h-2 bg-blue-500 rounded-l-sm" style={{ width: '80%' }} />
                        <div className="h-2 bg-green-500 rounded-r-sm" style={{ width: '75%' }} />
                      </div>
                      <div className="w-12 text-xs text-right text-muted-foreground">15/16</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-16 text-xs text-muted-foreground">Wed</div>
                      <div className="flex-1 flex gap-1">
                        <div className="h-2 bg-blue-500 rounded-l-sm" style={{ width: '70%' }} />
                        <div className="h-2 bg-green-500 rounded-r-sm" style={{ width: '65%' }} />
                      </div>
                      <div className="w-12 text-xs text-right text-muted-foreground">13/14</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Source Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Task Sources
            </CardTitle>
            <CardDescription>Where your tasks are coming from</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(analytics.sourceBreakdown || [
              { source: 'gmail', count: 45, percentage: 45 },
              { source: 'linkedin', count: 28, percentage: 28 },
              { source: 'whatsapp', count: 18, percentage: 18 },
              { source: 'manual', count: 9, percentage: 9 },
            ]).map((item) => (
              <div key={item.source} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {getSourceIcon(item.source)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{item.source}</span>
                    <span className="text-sm text-muted-foreground">{item.count} tasks</span>
                  </div>
                  <Progress value={item.percentage} className="h-1.5 mt-2" />
                </div>
                <div className="text-sm font-medium">{item.percentage}%</div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Hourly Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Hourly Activity
            </CardTitle>
            <CardDescription>Task distribution by hour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-2">
              {(analytics.hourlyActivity || [
                { hour: '6AM', count: 2 },
                { hour: '8AM', count: 8 },
                { hour: '10AM', count: 15 },
                { hour: '12PM', count: 12 },
                { hour: '2PM', count: 18 },
                { hour: '4PM', count: 14 },
                { hour: '6PM', count: 8 },
                { hour: '8PM', count: 4 },
              ]).map((item, idx) => {
                const maxCount = 20
                const intensity = (item.count / maxCount) * 100
                return (
                  <div
                    key={idx}
                    className="aspect-square rounded-lg flex flex-col items-center justify-center gap-1 transition-all hover:scale-105"
                    style={{
                      backgroundColor: `rgba(59, 130, 246, ${intensity / 100 * 0.3})`,
                      border: `1px solid rgba(59, 130, 246, ${intensity / 100 * 0.5})`,
                    }}
                  >
                    <span className="text-[10px] text-muted-foreground">{item.hour}</span>
                    <span className="text-sm font-bold">{item.count}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Business Impact
          </CardTitle>
          <CardDescription>Estimated value generated by AI agent</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
              <div className="text-3xl font-bold text-green-500">$12,450</div>
              <div className="text-sm text-muted-foreground mt-1">Invoices Generated</div>
              <div className="flex items-center justify-center gap-1 mt-2 text-xs text-green-500">
                <TrendingUp className="w-3 h-3" />
                +18% this month
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
              <div className="text-3xl font-bold text-blue-500">47.5 hrs</div>
              <div className="text-sm text-muted-foreground mt-1">Time Saved</div>
              <div className="flex items-center justify-center gap-1 mt-2 text-xs text-blue-500">
                <TrendingUp className="w-3 h-3" />
                +12% this month
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
              <div className="text-3xl font-bold text-purple-500">94%</div>
              <div className="text-sm text-muted-foreground mt-1">Auto-Resolution Rate</div>
              <div className="flex items-center justify-center gap-1 mt-2 text-xs text-purple-500">
                <TrendingUp className="w-3 h-3" />
                +5% this month
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
