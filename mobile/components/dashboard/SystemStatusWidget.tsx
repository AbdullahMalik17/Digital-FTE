import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { GlassCard } from '../ui/glass/GlassCard';
import { Activity, Brain, Wifi } from 'lucide-react-native';

interface SystemStatusWidgetProps {
  status: 'online' | 'offline' | 'processing';
  memoryUsage: string; // e.g. "Active Context: 40%"
}

export function SystemStatusWidget({ status = 'online', memoryUsage }: SystemStatusWidgetProps) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (status === 'processing' || status === 'online') {
      pulse.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 1500 }),
          withTiming(1, { duration: 1500 })
        ),
        -1,
        true
      );
    }
  }, [status]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  const getStatusColor = () => {
    switch (status) {
      case 'online': return 'bg-emerald-500';
      case 'processing': return 'bg-amber-500';
      case 'offline': return 'bg-slate-500';
    }
  };

  return (
    <GlassCard className="p-4 mb-4">
      <View className="flex-row justify-between items-start">
        <View className="flex-row items-center space-x-3">
          <View className="relative">
            <Animated.View className={`w-3 h-3 rounded-full absolute top-0 left-0 ${getStatusColor()}`} style={pulseStyle} />
            <View className={`w-3 h-3 rounded-full ${getStatusColor()} opacity-40`} />
          </View>
          <View>
             <Text className="text-white font-bold text-lg">Abdullah's Cloud Agent</Text>
             <Text className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
               {status === 'online' ? 'System Active' : status}
             </Text>
          </View>
        </View>
        <Wifi size={18} color={status === 'offline' ? '#64748B' : '#10B981'} />
      </View>

      <View className="mt-4 pt-4 border-t border-white/10 flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Brain size={16} color="#8B5CF6" className="mr-2" />
          <Text className="text-slate-300 text-sm">Long-term Memory</Text>
        </View>
        <Text className="text-emerald-400 font-mono text-xs">SYNCED</Text>
      </View>
    </GlassCard>
  );
}
