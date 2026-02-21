'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type { Task, EmailCategory } from '@/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  CheckSquare,
  Inbox,
  TrendingUp,
  Calendar,
  Mail,
  Linkedin,
  MessageSquare,
} from 'lucide-react'

interface TaskData extends Task {
  category?: EmailCategory
  source?: 'gmail' | 'linkedin' | 'whatsapp' | 'telegram' | 'manual'
}

export default function TasksPage() {
  const [pendingTasks, setPendingTasks] = useState<TaskData[]>([])
  const [completedTasks, setCompletedTasks] = useState<TaskData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterSource, setFilterSource] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('pending')

  useEffect(() => {
    fetchTasks()
    const interval = setInterval(fetchTasks, 30000) // Refresh every 30s
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
      const res = await fetch(`/api/tasks/${taskId}/approve`, {
        method: 'POST',
      })
      if (res.ok) {
        toast.success('Task approved successfully')
        fetchTasks()
      } else {
        toast.error('Failed to approve task')
      }
    } catch (error) {
      toast.error('Error approving task')
      console.error(error)
    }
  }

  async function rejectTask(taskId: string, reason: string = 'Not approved') {
    try {
      const res = await fetch(`/api/tasks/${taskId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      if (res.ok) {
        toast.success('Task rejected')
        fetchTasks()
      } else {
        toast.error('Failed to reject task')
      }
    } catch (error) {
      toast.error('Error rejecting task')
      console.error(error)
    }
  }

  function getSourceIcon(source?: string) {
    switch (source) {
      case 'gmail':
        return <Mail className="w-3 h-3" />
      case 'linkedin':
        return <Linkedin className="w-3 h-3" />
      case 'whatsapp':
        return <MessageSquare className="w-3 h-3" />
      case 'telegram':
        return <MessageSquare className="w-3 h-3" />
      default:
        return <Inbox className="w-3 h-3" />
    }
  }

  function getPriorityColor(priority?: string) {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'high':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    }
  }

  function getPriorityIcon(priority?: string) {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="w-3 h-3" />
      case 'high':
        return <TrendingUp className="w-3 h-3" />
      default:
        return <Clock className="w-3 h-3" />
    }
  }

  const filteredPending = pendingTasks.filter((task) => {
    const matchesSearch =
      task.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.filename.toLowerCase().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.title && task.title.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority || task.importance === filterPriority
    const matchesSource = filterSource === 'all' || task.source === filterSource
    return matchesSearch && matchesPriority && matchesSource
  })

  const filteredCompleted = completedTasks.filter((task) => {
    const matchesSearch =
      task.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.filename.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const stats = {
    total: pendingTasks.length + completedTasks.length,
    pending: pendingTasks.length,
    completed: completedTasks.length,
    urgent: pendingTasks.filter((t) => t.priority === 'urgent' || t.importance === 'high').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage and approve AI-generated tasks
          </p>
        </div>
        <Button onClick={fetchTasks} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Inbox className="w-8 h-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Urgent</p>
                <p className="text-2xl font-bold">{stats.urgent}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger>
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
              <SelectTrigger>
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
        </CardContent>
      </Card>

      {/* Task Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            Pending ({filteredPending.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Completed ({filteredCompleted.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin" />
                Loading tasks...
              </CardContent>
            </Card>
          ) : filteredPending.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No pending tasks</p>
                <p className="text-sm">All caught up! New tasks will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredPending.map((task) => (
                <Card
                  key={task.id}
                  className={cn(
                    'transition-all duration-200 hover:shadow-lg',
                    task.priority === 'urgent' || task.importance === 'high'
                      ? 'border-l-4 border-l-red-500 bg-red-500/5'
                      : 'border-l-4 border-l-yellow-500'
                  )}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center',
                            task.source ? 'bg-primary/10 text-primary' : 'bg-muted'
                          )}
                        >
                          {getSourceIcon(task.source)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-sm font-mono truncate max-w-md">
                              {task.filename}
                            </CardTitle>
                            {task.priority && (
                              <Badge className={cn('text-xs', getPriorityColor(task.priority))}>
                                {getPriorityIcon(task.priority)}
                                <span className="ml-1">{task.priority}</span>
                              </Badge>
                            )}
                            {task.category && (
                              <Badge variant="outline" className="text-xs">
                                {task.category}
                              </Badge>
                            )}
                          </div>
                          {task.title && (
                            <p className="text-sm text-muted-foreground mt-1">{task.title}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(task.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/50 rounded-lg p-3 mb-4">
                      <p className="text-sm font-mono whitespace-pre-wrap">{task.content}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {task.sentiment && (
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs',
                              task.sentiment === 'positive'
                                ? 'bg-green-500/10 text-green-500'
                                : task.sentiment === 'negative'
                                  ? 'bg-red-500/10 text-red-500'
                                  : 'bg-gray-500/10 text-gray-500'
                            )}
                          >
                            {task.sentiment}
                          </Badge>
                        )}
                        {task.followUpDue && (
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            Follow-up: {task.followUpDue}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => rejectTask(task.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => approveTask(task.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin" />
                Loading completed tasks...
              </CardContent>
            </Card>
          ) : filteredCompleted.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No completed tasks yet</p>
                <p className="text-sm">Approved tasks will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredCompleted.map((task) => (
                <Card key={task.id} className="bg-muted/30 opacity-80 hover:opacity-100 transition-opacity">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-mono text-muted-foreground line-through">
                            {task.filename}
                          </CardTitle>
                        </div>
                      </div>
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/50 rounded-lg p-3 mb-3">
                      <p className="text-sm font-mono whitespace-pre-wrap opacity-70">{task.content}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Completed: {new Date(task.timestamp).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
