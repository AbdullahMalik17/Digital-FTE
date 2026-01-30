import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { getGreeting } from '../../utils/greeting';
import { SystemStatusWidget } from '../../components/dashboard/SystemStatusWidget';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { GlassCard } from '../../components/ui/glass/GlassCard';
import { apiService } from '../../services/api';
import { Mic, Plus, Scan, FileText, Bell } from 'lucide-react-native';

export default function Dashboard() {
  const [greeting, setGreeting] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Initial greeting
    setGreeting(getGreeting());

    // Update greeting every minute
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);

    loadData();

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      // Placeholder for actual data fetching
      const pendingTasks = await apiService.getPendingTasks(3);
      // setTasks(pendingTasks.data); 
    } catch (e) {
      console.log("Error loading dashboard", e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <LinearGradient
      colors={['#0f172a', '#1e293b', '#0f172a']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      >
        {/* Header Section */}
        <SafeAreaView edges={['top']} className="px-6 mb-6">
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-slate-400 text-sm font-medium uppercase tracking-widest mb-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </Text>
              <Text className="text-3xl font-bold text-white shadow-md">
                {greeting}, Abdullah
              </Text>
            </View>
            <AnimatedButton
              label=""
              variant="ghost"
              size="sm"
              icon={<Bell size={24} color="#F8FAFC" />}
              onPress={() => { }}
              className="w-10 h-10 rounded-full border border-white/10 bg-white/5"
            />
          </View>

          {/* System Widget */}
          <SystemStatusWidget status="online" memoryUsage="Synced" />
        </SafeAreaView>

        {/* Quick Actions Grid */}
        <View className="px-6 mb-8">
          <Text className="text-white text-lg font-semibold mb-4">Quick Actions</Text>
          <View className="flex-row flex-wrap gap-4">
            <QuickAction icon={<Plus size={24} color="#fff" />} label="New Task" color="bg-blue-600" />
            <QuickAction icon={<Mic size={24} color="#fff" />} label="Voice" color="bg-violet-600" />
            <QuickAction icon={<Scan size={24} color="#fff" />} label="Scan" color="bg-emerald-600" />
            <QuickAction icon={<FileText size={24} color="#fff" />} label="Report" color="bg-rose-600" />
          </View>
        </View>

        {/* Recent Activity / Context */}
        <View className="px-6">
          <Text className="text-white text-lg font-semibold mb-4">Recent Context</Text>
          <GlassCard className="p-0 border-white/10 bg-white/5">
            <ActivityItem
              title="Email Digest Generated"
              time="10:00 AM"
              type="system"
            />
            <ActivityItem
              title="Odoo Report Synced"
              time="Yesterday"
              type="finance"
              last
            />
          </GlassCard>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function QuickAction({ icon, label, color }: any) {
  return (
    <AnimatedButton
      label=""
      className={`w-[47%] aspect-[1.2] rounded-2xl border-0 ${color} shadow-lg shadow-blue-500/20`}
      onPress={() => { }}
    >
      <View className="items-center justify-center space-y-2">
        <View className="bg-white/20 p-3 rounded-full mb-2">
          {icon}
        </View>
        <Text className="text-white font-bold">{label}</Text>
      </View>
    </AnimatedButton>
  );
}

function ActivityItem({ title, time, type, last }: any) {
  return (
    <View className={`p-4 flex-row items-center border-b border-white/5 ${last ? 'border-b-0' : ''}`}>
      <View className="w-2 h-2 rounded-full bg-blue-400 mr-4" />
      <View className="flex-1">
        <Text className="text-white font-medium">{title}</Text>
        <Text className="text-slate-400 text-xs">{time}</Text>
      </View>
    </View>
  );
}
