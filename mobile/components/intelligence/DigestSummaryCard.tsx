import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertCircle, CheckCircle, Clock, Calendar, Lightbulb } from 'lucide-react-native';
import { apiService } from '../../services/api';
import type { DailyDigest } from '../../types/api';

export function DigestSummaryCard() {
  const [digest, setDigest] = useState<DailyDigest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDigest();
  }, []);

  const loadDigest = async () => {
    try {
      const res = await apiService.getDigest();
      setDigest(res.data);
    } catch (error) {
      console.log('Failed to load digest:', error);
      // Use mock data as fallback
      setDigest(getMockDigest());
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
        <ActivityIndicator color="#60a5fa" />
      </View>
    );
  }

  if (!digest) return null;

  return (
    <LinearGradient
      colors={['#1e3a5f', '#1e293b']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="rounded-2xl p-4 border border-blue-900/30"
    >
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-blue-100 text-lg font-semibold">
          {digest.greeting}
        </Text>
        <View className="bg-blue-500/20 px-2 py-1 rounded-full">
          <Text className="text-blue-300 text-xs">
            {new Date(digest.date).toLocaleDateString('en-US', { weekday: 'short' })}
          </Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View className="flex-row justify-between mb-4">
        <StatBadge
          icon={<AlertCircle size={16} color="#f87171" />}
          value={digest.urgentCount}
          label="Urgent"
          color="#7f1d1d"
        />
        <StatBadge
          icon={<CheckCircle size={16} color="#fbbf24" />}
          value={digest.actionCount}
          label="Actions"
          color="#78350f"
        />
        <StatBadge
          icon={<Clock size={16} color="#fb923c" />}
          value={digest.followUpsCount}
          label="Follow-ups"
          color="#7c2d12"
        />
        <StatBadge
          icon={<Calendar size={16} color="#60a5fa" />}
          value={digest.todayEvents.length}
          label="Events"
          color="#1e3a8a"
        />
      </View>

      {/* Today's Events */}
      {digest.todayEvents.length > 0 && (
        <View className="mb-3">
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Today's Schedule
          </Text>
          {digest.todayEvents.slice(0, 2).map((event) => (
            <View
              key={event.id}
              className="flex-row items-center bg-slate-900/50 rounded-lg px-3 py-2 mb-1"
            >
              <Text className="text-blue-400 text-xs font-mono w-16">
                {new Date(event.start).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              <Text className="text-slate-300 text-sm flex-1" numberOfLines={1}>
                {event.title}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* AI Recommendation */}
      {digest.recommendations.length > 0 && (
        <View className="flex-row items-start bg-slate-900/30 rounded-lg p-3">
          <Lightbulb size={14} color="#fbbf24" style={{ marginRight: 8, marginTop: 2 }} />
          <Text className="text-slate-400 text-xs flex-1" numberOfLines={2}>
            {digest.recommendations[0]}
          </Text>
        </View>
      )}
    </LinearGradient>
  );
}

function StatBadge({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <View
      className="items-center p-2 rounded-xl"
      style={{ backgroundColor: color + '40' }}
    >
      <View className="flex-row items-center gap-1 mb-1">
        {icon}
        <Text className="text-white text-lg font-bold">{value}</Text>
      </View>
      <Text className="text-slate-400 text-[10px] uppercase tracking-wider">
        {label}
      </Text>
    </View>
  );
}

function getMockDigest(): DailyDigest {
  const now = new Date();
  const hour = now.getHours();
  let greeting = 'Good morning';
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  else if (hour >= 17) greeting = 'Good evening';

  return {
    date: now.toISOString(),
    greeting: `${greeting}, Abdullah`,
    urgentCount: 2,
    actionCount: 5,
    followUpsCount: 3,
    pendingDrafts: 1,
    todayEvents: [
      {
        id: '1',
        title: 'Team Standup',
        start: new Date(now.setHours(10, 0)).toISOString(),
        end: new Date(now.setHours(10, 30)).toISOString(),
      },
    ],
    recommendations: ['Review 2 urgent emails from clients'],
    yesterdaySummary: {
      tasksCompleted: 12,
      emailsSent: 8,
      draftsApproved: 3,
      timeActive: '6h 23m',
    },
  };
}
