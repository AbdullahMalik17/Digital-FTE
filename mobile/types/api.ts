import { Task } from './task';

export interface DashboardResponse {
  pending_count: number;
  completed_today: number;
  urgent_count: number;
  agent_status: 'online' | 'offline' | 'busy';
  recent_activity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  details?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PushSubscriptionRequest {
  fcm_token: string;
  device_name: string;
  platform: 'ios' | 'android';
}

// Intelligence Types
export interface DailyDigest {
  date: string;
  greeting: string;
  urgentCount: number;
  actionCount: number;
  followUpsCount: number;
  pendingDrafts: number;
  todayEvents: CalendarEvent[];
  recommendations: string[];
  yesterdaySummary: ActivitySummary;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
  attendees?: string[];
}

export interface ActivitySummary {
  tasksCompleted: number;
  emailsSent: number;
  draftsApproved: number;
  timeActive: string;
}

export interface FollowUp {
  id: string;
  emailId: string;
  contact: string;
  subject: string;
  sentDate: string;
  reminderDate: string;
  status: 'pending' | 'reminded' | 'resolved';
  priority: 'high' | 'medium' | 'low';
  daysSince: number;
}

export interface Analytics {
  tasksToday: number;
  tasksThisWeek: number;
  avgResponseTime: string;
  topCategories: { category: string; count: number }[];
  approvalRate: number;
}
