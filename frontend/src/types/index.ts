// Type definitions for Digital FTE Dashboard

export type EmailCategory =
  | 'urgent_action'
  | 'high_priority'
  | 'normal'
  | 'low_priority'
  | 'newsletter'
  | 'social'
  | 'promotional'
  | 'meeting'
  | 'financial'

export interface Task {
  id: string
  filename: string
  content: string
  status: 'pending' | 'done'
  timestamp: number
  importance: 'high' | 'medium' | 'low'
  priority?: 'urgent' | 'high' | 'medium' | 'low'
  source?: string
  title?: string
  // Intelligence fields
  category?: EmailCategory
  summary?: string
  sentiment?: 'positive' | 'neutral' | 'negative'
  followUpDue?: string
  actionItems?: string[]
}

export interface Skill {
  name: string
  description: string
  category: string
  status?: 'available'
}

export interface CreateTaskInput {
  content: string
  title: string
  priority?: 'medium' | 'high' | 'urgent'
}

// Intelligence Types
export interface DailyDigest {
  date: string
  greeting: string
  urgentCount: number
  actionCount: number
  followUpsCount: number
  pendingDrafts: number
  todayEvents: CalendarEvent[]
  recommendations: string[]
  yesterdaySummary: ActivitySummary
}

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  location?: string
  attendees?: string[]
}

export interface ActivitySummary {
  tasksCompleted: number
  emailsSent: number
  draftsApproved: number
  timeActive: string
}

export interface FollowUp {
  id: string
  emailId: string
  contact: string
  subject: string
  sentDate: string
  reminderDate: string
  status: 'pending' | 'reminded' | 'resolved'
  priority: 'high' | 'medium' | 'low'
  daysSince: number
}

export interface Analytics {
  tasksToday: number
  tasksThisWeek: number
  avgResponseTime: string
  topCategories: { category: string; count: number }[]
  approvalRate: number
}
