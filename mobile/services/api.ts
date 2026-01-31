import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Config from '../configuration/appConfig';

const DEFAULT_BASE_URL = Config.API_BASE_URL; // Production Fly.io URL

const api = axios.create({
  timeout: Config.API_TIMEOUT || 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  async (config: any) => {
    const storedUrl = await AsyncStorage.getItem('api_base_url');
    const storedKey = await AsyncStorage.getItem('api_secret_key');

    config.baseURL = storedUrl || DEFAULT_BASE_URL;

    // Add API Security Header
    if (storedKey || Config.API_SECRET_KEY) {
      config.headers['X-API-Key'] = storedKey || Config.API_SECRET_KEY;
    }

    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

export const apiService = {
  // Auth/Settings
  setApiKey: async (key: string) => {
    await AsyncStorage.setItem('api_secret_key', key);
  },

  getApiKey: async () => {
    return (await AsyncStorage.getItem('api_secret_key')) || Config.API_SECRET_KEY;
  },

  // Dashboard
  getDashboard: () => api.get('/api/dashboard'),

  // Tasks
  getTasks: (folder: string = 'Pending_Approval', limit = 20) =>
    api.get('/api/tasks', { params: { folder, limit } }),

  getPendingTasks: (limit = 20) =>
    api.get('/api/tasks/pending', { params: { limit } }),

  getTask: (id: string) => api.get(`/api/tasks/${id}`),

  approveTask: (id: string, note?: string) =>
    api.post(`/api/tasks/${id}/approve`, { approved: true, note }),

  rejectTask: (id: string, note?: string) =>
    api.post(`/api/tasks/${id}/reject`, { note }),

  // Chat
  sendChatMessage: (message: string, context?: Record<string, any>) =>
    api.post('/api/chat/send', { message, context }),

  getChatHistory: (limit = 50) =>
    api.get('/api/chat/history', { params: { limit } }),

  // Activity
  getRecentActivity: (limit = 10) =>
    api.get('/api/activity', { params: { limit } }),

  // Notifications (FCM for mobile)
  registerPush: (token: string, deviceName: string) =>
    api.post('/api/notifications/subscribe/mobile', {
      fcm_token: token,
      device_name: deviceName,
      platform: Platform.OS,
    }),

  // Suggestions
  getSuggestions: () => api.get('/api/suggestions'),

  // Drafts
  getDraftsCount: () => api.get('/api/drafts/count'),

  // Health
  health: () => api.get('/api/health'),

  // Intelligence - Daily Digest
  getDigest: () => api.get('/api/digest'),

  // Intelligence - Follow-ups
  getFollowUps: () => api.get('/api/follow-ups'),

  updateFollowUp: (id: string, action: 'resolve' | 'snooze' | 'dismiss') =>
    api.patch(`/api/follow-ups/${id}`, { action }),

  // Intelligence - Analytics
  getAnalytics: () => api.get('/api/analytics'),

  // Calendar Intelligence
  getUpcomingEvents: (days: number = 7, limit: number = 10) =>
    api.get('/api/calendar/upcoming', { params: { days, limit } }),

  checkAvailability: (startTime: string, endTime: string, calendarId?: string) =>
    api.post('/api/calendar/check-availability', {
      start_time: startTime,
      end_time: endTime,
      calendar_id: calendarId || 'primary'
    }),

  suggestMeetingTimes: (durationMinutes: number = 30, daysAhead: number = 5, preferMorning: boolean = false, preferAfternoon: boolean = false) =>
    api.post('/api/calendar/suggest-times', {
      duration_minutes: durationMinutes,
      days_ahead: daysAhead,
      prefer_morning: preferMorning,
      prefer_afternoon: preferAfternoon
    }),

  detectMeetingFromEmail: (emailId: string, subject: string, body: string, sender: string, recipients?: string[]) =>
    api.post('/api/calendar/detect-meeting', {
      email_id: emailId,
      subject,
      body,
      sender,
      recipients
    }),

  createCalendarEvent: (event: {
    title: string;
    start_time: string;
    end_time: string;
    description?: string;
    attendees?: string[];
    location?: string;
    send_invitations?: boolean;
  }) => api.post('/api/calendar/create-event', event),

  createEventFromEmail: (emailId: string, subject: string, body: string, sender: string, recipients?: string[]) =>
    api.post('/api/calendar/create-from-email', {
      email_id: emailId,
      subject,
      body,
      sender,
      recipients
    }),

  // Settings
  setBaseUrl: async (url: string) => {
    await AsyncStorage.setItem('api_base_url', url);
  },

  getBaseUrl: async () => {
    return (await AsyncStorage.getItem('api_base_url')) || DEFAULT_BASE_URL;
  }
};
