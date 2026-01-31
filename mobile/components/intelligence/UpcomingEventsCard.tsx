import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Calendar, Clock, MapPin, Users, ChevronRight } from 'lucide-react-native';
import { apiService } from '../../services/api';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
  attendees?: string[];
  link?: string;
}

export function UpcomingEventsCard() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const res = await apiService.getUpcomingEvents(3, 5);
      setEvents(res.data?.events || getMockEvents());
    } catch (error) {
      console.log('Failed to load calendar events:', error);
      setEvents(getMockEvents());
    } finally {
      setLoading(false);
    }
  };

  const formatEventTime = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const now = new Date();

    const isToday = startDate.toDateString() === now.toDateString();
    const isTomorrow = startDate.toDateString() === new Date(now.getTime() + 86400000).toDateString();

    const timeStr = startDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const endTimeStr = endDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    if (isToday) {
      return { date: 'Today', time: `${timeStr} - ${endTimeStr}` };
    } else if (isTomorrow) {
      return { date: 'Tomorrow', time: `${timeStr} - ${endTimeStr}` };
    } else {
      return {
        date: startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        time: `${timeStr} - ${endTimeStr}`
      };
    }
  };

  const getTimeUntil = (start: string) => {
    const startDate = new Date(start);
    const now = new Date();
    const diffMs = startDate.getTime() - now.getTime();

    if (diffMs < 0) return 'In progress';

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `In ${diffMins} min`;
    if (diffHours < 24) return `In ${diffHours}h`;
    return `In ${diffDays}d`;
  };

  if (loading) {
    return (
      <View className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
        <View className="flex-row items-center gap-2 mb-3">
          <Calendar size={16} color="#94a3b8" />
          <Text className="text-slate-400 text-sm font-semibold">Upcoming Events</Text>
        </View>
        <ActivityIndicator color="#60a5fa" />
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <View className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
        <View className="flex-row items-center gap-2 mb-3">
          <Calendar size={16} color="#94a3b8" />
          <Text className="text-slate-400 text-sm font-semibold">Upcoming Events</Text>
        </View>
        <View className="py-4">
          <Text className="text-slate-500 text-sm text-center">No upcoming events</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Calendar size={16} color="#94a3b8" />
          <Text className="text-slate-400 text-sm font-semibold">Upcoming Events</Text>
        </View>
        <View className="bg-blue-500/20 px-2 py-0.5 rounded-full">
          <Text className="text-blue-400 text-xs">{events.length} Scheduled</Text>
        </View>
      </View>

      {events.slice(0, 3).map((event, index) => (
        <EventItem key={event.id} event={event} isLast={index === Math.min(events.length, 3) - 1} />
      ))}

      {events.length > 3 && (
        <TouchableOpacity className="flex-row items-center justify-center mt-2 py-2">
          <Text className="text-blue-400 text-xs mr-1">View all {events.length} events</Text>
          <ChevronRight size={12} color="#60a5fa" />
        </TouchableOpacity>
      )}
    </View>
  );
}

function EventItem({ event, isLast }: { event: CalendarEvent; isLast: boolean }) {
  const { date, time } = formatEventTime(event.start, event.end);
  const timeUntil = getTimeUntil(event.start);
  const isImminent = timeUntil.includes('min') && parseInt(timeUntil) <= 30;

  return (
    <View
      className={`py-3 ${!isLast ? 'border-b border-slate-700/50' : ''}`}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-white text-sm font-medium mb-1" numberOfLines={1}>
            {event.title}
          </Text>

          <View className="flex-row items-center gap-2 mb-1">
            <Clock size={10} color="#64748b" />
            <Text className="text-slate-500 text-xs">
              {date} • {time}
            </Text>
          </View>

          {event.location && (
            <View className="flex-row items-center gap-2">
              <MapPin size={10} color="#64748b" />
              <Text className="text-slate-500 text-xs" numberOfLines={1}>
                {event.location}
              </Text>
            </View>
          )}

          {event.attendees && event.attendees.length > 0 && (
            <View className="flex-row items-center gap-2 mt-1">
              <Users size={10} color="#64748b" />
              <Text className="text-slate-600 text-[10px]">
                {event.attendees.length} attendee{event.attendees.length > 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>

        <View
          className={`px-2 py-1 rounded-lg ${
            isImminent
              ? 'bg-orange-900/40'
              : timeUntil === 'In progress'
                ? 'bg-green-900/40'
                : 'bg-slate-700/50'
          }`}
        >
          <Text
            className={`text-[10px] font-medium ${
              isImminent
                ? 'text-orange-400'
                : timeUntil === 'In progress'
                  ? 'text-green-400'
                  : 'text-slate-400'
            }`}
          >
            {timeUntil}
          </Text>
        </View>
      </View>
    </View>
  );
}

function formatEventTime(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const now = new Date();

  const isToday = startDate.toDateString() === now.toDateString();
  const isTomorrow = startDate.toDateString() === new Date(now.getTime() + 86400000).toDateString();

  const timeStr = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const endTimeStr = endDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  if (isToday) {
    return { date: 'Today', time: `${timeStr} - ${endTimeStr}` };
  } else if (isTomorrow) {
    return { date: 'Tomorrow', time: `${timeStr} - ${endTimeStr}` };
  } else {
    return {
      date: startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      time: `${timeStr} - ${endTimeStr}`
    };
  }
}

function getTimeUntil(start: string) {
  const startDate = new Date(start);
  const now = new Date();
  const diffMs = startDate.getTime() - now.getTime();

  if (diffMs < 0) return 'In progress';

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `In ${diffMins} min`;
  if (diffHours < 24) return `In ${diffHours}h`;
  return `In ${diffDays}d`;
}

function getMockEvents(): CalendarEvent[] {
  const now = new Date();
  return [
    {
      id: 'mock-1',
      title: 'Team Standup',
      start: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      end: new Date(now.getTime() + 2.25 * 60 * 60 * 1000).toISOString(),
      location: 'Google Meet',
      attendees: ['team@example.com']
    },
    {
      id: 'mock-2',
      title: 'Project Review Meeting',
      start: new Date(now.getTime() + 26 * 60 * 60 * 1000).toISOString(),
      end: new Date(now.getTime() + 27 * 60 * 60 * 1000).toISOString(),
      location: 'Conference Room A',
      attendees: ['manager@example.com', 'stakeholder@example.com']
    },
    {
      id: 'mock-3',
      title: 'Client Call - Q1 Planning',
      start: new Date(now.getTime() + 50 * 60 * 60 * 1000).toISOString(),
      end: new Date(now.getTime() + 51 * 60 * 60 * 1000).toISOString(),
      location: 'Zoom',
      attendees: ['client@acme.com']
    }
  ];
}
