import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Mail, Clock, AlertTriangle, CheckCircle, X, Bell } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { apiService } from '../../services/api';
import type { FollowUp } from '../../types/api';

export function FollowUpsList() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFollowUps();
  }, []);

  const loadFollowUps = async () => {
    try {
      const res = await apiService.getFollowUps();
      setFollowUps(res.data?.followUps || getMockFollowUps());
    } catch (error) {
      console.log('Failed to load follow-ups:', error);
      setFollowUps(getMockFollowUps());
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'resolve' | 'snooze' | 'dismiss') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await apiService.updateFollowUp(id, action);
      // Remove from local state
      setFollowUps((prev) => prev.filter((f) => f.id !== id));
    } catch (error) {
      Alert.alert('Error', 'Failed to update follow-up');
    }
  };

  const pendingFollowUps = followUps.filter((f) => f.status === 'pending');

  if (loading) {
    return (
      <View className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
        <View className="flex-row items-center gap-2 mb-3">
          <Bell size={16} color="#94a3b8" />
          <Text className="text-slate-400 text-sm font-semibold">Follow-up Reminders</Text>
        </View>
        <ActivityIndicator color="#60a5fa" />
      </View>
    );
  }

  if (pendingFollowUps.length === 0) {
    return (
      <View className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
        <View className="flex-row items-center gap-2 mb-3">
          <Bell size={16} color="#94a3b8" />
          <Text className="text-slate-400 text-sm font-semibold">Follow-up Reminders</Text>
        </View>
        <View className="flex-row items-center justify-center py-4">
          <CheckCircle size={16} color="#22c55e" />
          <Text className="text-slate-500 text-sm ml-2">All caught up!</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Bell size={16} color="#94a3b8" />
          <Text className="text-slate-400 text-sm font-semibold">Follow-up Reminders</Text>
        </View>
        <View className="bg-orange-500/20 px-2 py-0.5 rounded-full">
          <Text className="text-orange-400 text-xs">{pendingFollowUps.length} Pending</Text>
        </View>
      </View>

      {pendingFollowUps.slice(0, 3).map((followUp) => (
        <FollowUpItem
          key={followUp.id}
          followUp={followUp}
          onAction={handleAction}
        />
      ))}

      {pendingFollowUps.length > 3 && (
        <Text className="text-slate-600 text-xs text-center mt-2">
          +{pendingFollowUps.length - 3} more
        </Text>
      )}
    </View>
  );
}

function FollowUpItem({
  followUp,
  onAction,
}: {
  followUp: FollowUp;
  onAction: (id: string, action: 'resolve' | 'snooze' | 'dismiss') => void;
}) {
  const isOverdue = followUp.daysSince > 3;
  const isWarning = followUp.daysSince > 1;

  return (
    <View
      className={`p-3 rounded-xl mb-2 ${
        isOverdue
          ? 'bg-red-950/30 border border-red-900/30'
          : isWarning
          ? 'bg-yellow-950/30 border border-yellow-900/30'
          : 'bg-slate-700/30 border border-slate-600/30'
      }`}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-2">
          <View className="flex-row items-center gap-2 mb-1">
            <Mail size={12} color="#94a3b8" />
            <Text className="text-slate-200 text-sm font-medium" numberOfLines={1}>
              {followUp.contact}
            </Text>
            {isOverdue && <AlertTriangle size={12} color="#f87171" />}
          </View>
          <Text className="text-slate-500 text-xs mb-1" numberOfLines={1}>
            {followUp.subject}
          </Text>
          <View className="flex-row items-center gap-2">
            <Clock size={10} color="#64748b" />
            <Text className="text-slate-600 text-[10px]">
              {followUp.daysSince === 0
                ? 'Today'
                : followUp.daysSince === 1
                ? 'Yesterday'
                : `${followUp.daysSince} days ago`}
            </Text>
            <View
              className={`px-1.5 py-0.5 rounded ${
                followUp.priority === 'high'
                  ? 'bg-red-900/50'
                  : followUp.priority === 'medium'
                  ? 'bg-yellow-900/50'
                  : 'bg-slate-700/50'
              }`}
            >
              <Text
                className={`text-[9px] uppercase ${
                  followUp.priority === 'high'
                    ? 'text-red-400'
                    : followUp.priority === 'medium'
                    ? 'text-yellow-400'
                    : 'text-slate-500'
                }`}
              >
                {followUp.priority}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-1">
          <TouchableOpacity
            onPress={() => onAction(followUp.id, 'resolve')}
            className="w-8 h-8 items-center justify-center rounded-lg bg-green-900/30"
          >
            <CheckCircle size={16} color="#22c55e" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onAction(followUp.id, 'snooze')}
            className="w-8 h-8 items-center justify-center rounded-lg bg-yellow-900/30"
          >
            <Clock size={16} color="#fbbf24" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onAction(followUp.id, 'dismiss')}
            className="w-8 h-8 items-center justify-center rounded-lg bg-red-900/30"
          >
            <X size={16} color="#f87171" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function getMockFollowUps(): FollowUp[] {
  const now = new Date();
  return [
    {
      id: 'fu-1',
      emailId: 'email-123',
      contact: 'John Smith',
      subject: 'Project Proposal Review',
      sentDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      reminderDate: now.toISOString(),
      status: 'pending',
      priority: 'high',
      daysSince: 4,
    },
    {
      id: 'fu-2',
      emailId: 'email-124',
      contact: 'Sarah Johnson',
      subject: 'Invoice Payment',
      sentDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      reminderDate: now.toISOString(),
      status: 'pending',
      priority: 'high',
      daysSince: 2,
    },
  ];
}
