import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { GlassCard } from '../../components/ui/glass/GlassCard';
import { apiService } from '../../services/api';
import {
  Bell, ChevronRight, Zap, CheckCircle, AlertTriangle,
  Clock, MessageSquare, Mail, TrendingUp, Activity,
} from 'lucide-react-native';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

interface DashboardStats {
  pending_count: number;
  in_progress_count: number;
  done_today_count: number;
  urgent_count: number;
}

export default function Dashboard() {
  const [greeting, setGreeting] = useState(getGreeting());
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    pending_count: 0, in_progress_count: 0, done_today_count: 0, urgent_count: 0,
  });
  const [connected, setConnected] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await apiService.getDashboard();
      setStats(res.data);
      setConnected(true);
    } catch {
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    setGreeting(getGreeting());
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  return (
    <LinearGradient
      colors={['#030712', '#0f172a', '#030712']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
        }
      >
        {/* Header */}
        <SafeAreaView edges={['top']} style={{ paddingHorizontal: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, marginTop: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#64748b', fontSize: 13, fontWeight: '500', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </Text>
              <Text style={{ color: '#f1f5f9', fontSize: 28, fontWeight: '700', marginTop: 4 }}>
                {greeting}, Abdullah
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: connected ? '#22c55e' : '#ef4444' }} />
              <TouchableOpacity
                style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' }}
                onPress={() => router.push('/approvals' as any)}
              >
                <Bell size={20} color="#94a3b8" />
                {stats.urgent_count > 0 && (
                  <View style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' }} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>

        {/* Stats Grid */}
        <View style={{ paddingHorizontal: 24, marginTop: 20 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <StatCard
              icon={<AlertTriangle size={18} color="#f59e0b" />}
              value={stats.urgent_count}
              label="Urgent"
              gradient={['#451a03', '#78350f']}
              accentColor="#f59e0b"
            />
            <StatCard
              icon={<Clock size={18} color="#3b82f6" />}
              value={stats.pending_count}
              label="Pending"
              gradient={['#0c1a3d', '#172554']}
              accentColor="#3b82f6"
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <StatCard
              icon={<Activity size={18} color="#a78bfa" />}
              value={stats.in_progress_count}
              label="In Progress"
              gradient={['#1e1037', '#2e1065']}
              accentColor="#a78bfa"
            />
            <StatCard
              icon={<CheckCircle size={18} color="#22c55e" />}
              value={stats.done_today_count}
              label="Done Today"
              gradient={['#052e16', '#14532d']}
              accentColor="#22c55e"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 24, marginTop: 28 }}>
          <Text style={{ color: '#e2e8f0', fontSize: 18, fontWeight: '600', marginBottom: 14 }}>Quick Actions</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <QuickActionBtn
              icon={<MessageSquare size={20} color="#3b82f6" />}
              label="Chat"
              onPress={() => router.push('/chat' as any)}
            />
            <QuickActionBtn
              icon={<CheckCircle size={20} color="#22c55e" />}
              label="Approve"
              badge={stats.pending_count > 0 ? stats.pending_count : undefined}
              onPress={() => router.push('/approvals' as any)}
            />
            <QuickActionBtn
              icon={<Mail size={20} color="#a78bfa" />}
              label="Inbox"
              onPress={() => {}}
            />
            <QuickActionBtn
              icon={<TrendingUp size={20} color="#f59e0b" />}
              label="Report"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Agent Status */}
        <View style={{ paddingHorizontal: 24, marginTop: 28 }}>
          <Text style={{ color: '#e2e8f0', fontSize: 18, fontWeight: '600', marginBottom: 14 }}>Agent Team</Text>
          <GlassCard style={{ borderRadius: 16, borderColor: 'rgba(255,255,255,0.06)', borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.03)' }}>
            <AgentRow icon="📧" name="Inbox Triage" desc="Monitoring emails & messages" status="active" />
            <AgentRow icon="💼" name="Social Media" desc="LinkedIn scheduling" status="active" />
            <AgentRow icon="🤖" name="Orchestrator" desc="Task routing & SLA tracking" status="active" />
            <AgentRow icon="📅" name="Calendar" desc="Meeting detection" status="active" />
            <AgentRow icon="💰" name="Financial" desc="Odoo integration" status="standby" last />
          </GlassCard>
        </View>

        {/* Active Channels */}
        <View style={{ paddingHorizontal: 24, marginTop: 28 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <Text style={{ color: '#e2e8f0', fontSize: 18, fontWeight: '600' }}>Active Channels</Text>
            <TouchableOpacity onPress={() => router.push('/integrations' as any)}>
              <Text style={{ color: '#3b82f6', fontSize: 13, fontWeight: '500' }}>View all →</Text>
            </TouchableOpacity>
          </View>
          <GlassCard style={{ borderRadius: 16, borderColor: 'rgba(255,255,255,0.06)', borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.03)' }}>
            <ChannelRow icon="📧" name="Gmail"       active last={false} />
            <ChannelRow icon="💬" name="WhatsApp"    active last={false} />
            <ChannelRow icon="💼" name="LinkedIn"    active last={false} />
            <ChannelRow icon="✈️" name="Telegram"    active last={false} />
            <ChannelRow icon="🐦" name="Twitter / X" active last={false} />
            <ChannelRow icon="📘" name="Facebook"    active last={false} />
            <ChannelRow icon="📸" name="Instagram"   active last={false} />
            <ChannelRow icon="🎮" name="Discord"     active={false} last={false} />
            <ChannelRow icon="💡" name="Slack"       active={false} last />
          </GlassCard>
        </View>

        {/* System Info */}
        <View style={{ paddingHorizontal: 24, marginTop: 28 }}>
          <GlassCard style={{ borderRadius: 16, borderColor: 'rgba(255,255,255,0.06)', borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Zap size={18} color="#3b82f6" />
                <Text style={{ color: '#e2e8f0', fontWeight: '600' }}>Abdullah Junior</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: connected ? '#22c55e' : '#ef4444' }} />
                <Text style={{ color: '#94a3b8', fontSize: 12 }}>{connected ? 'Connected' : 'Offline'}</Text>
              </View>
            </View>
            <Text style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>
              v2.0.0 • AI Chief of Staff • 9 channels connected
            </Text>
          </GlassCard>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function StatCard({ icon, value, label, gradient, accentColor }: {
  icon: React.ReactNode; value: number; label: string;
  gradient: [string, string]; accentColor: string;
}) {
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={gradient}
        style={{ borderRadius: 16, padding: 16, borderWidth: 1, borderColor: `${accentColor}20` }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          {icon}
          <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: '500' }}>{label}</Text>
        </View>
        <Text style={{ color: '#f1f5f9', fontSize: 32, fontWeight: '700' }}>{value}</Text>
      </LinearGradient>
    </View>
  );
}

function QuickActionBtn({ icon, label, badge, onPress }: {
  icon: React.ReactNode; label: string; badge?: number; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ flex: 1, alignItems: 'center', gap: 8 }}
    >
      <View style={{
        width: 52, height: 52, borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center', alignItems: 'center',
      }}>
        {icon}
        {badge !== undefined && badge > 0 && (
          <View style={{
            position: 'absolute', top: -4, right: -4,
            backgroundColor: '#ef4444', borderRadius: 10,
            minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center',
            paddingHorizontal: 4,
          }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{badge}</Text>
          </View>
        )}
      </View>
      <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '500' }}>{label}</Text>
    </TouchableOpacity>
  );
}

function AgentRow({ icon, name, desc, status, last }: {
  icon: string; name: string; desc: string; status: string; last?: boolean;
}) {
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14,
      borderBottomWidth: last ? 0 : 1, borderBottomColor: 'rgba(255,255,255,0.04)',
    }}>
      <Text style={{ fontSize: 20, marginRight: 12 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#e2e8f0', fontWeight: '600', fontSize: 14 }}>{name}</Text>
        <Text style={{ color: '#64748b', fontSize: 12, marginTop: 1 }}>{desc}</Text>
      </View>
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(148,163,184,0.1)',
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
      }}>
        <View style={{
          width: 6, height: 6, borderRadius: 3,
          backgroundColor: status === 'active' ? '#22c55e' : '#64748b',
        }} />
        <Text style={{
          color: status === 'active' ? '#22c55e' : '#64748b',
          fontSize: 11, fontWeight: '500',
        }}>{status}</Text>
      </View>
    </View>
  );
}

function ChannelRow({ icon, name, active, last }: {
  icon: string; name: string; active: boolean; last?: boolean;
}) {
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
      borderBottomWidth: last ? 0 : 1, borderBottomColor: 'rgba(255,255,255,0.04)',
      opacity: active ? 1 : 0.5,
    }}>
      <Text style={{ fontSize: 18, marginRight: 12 }}>{icon}</Text>
      <Text style={{ flex: 1, color: '#e2e8f0', fontWeight: '500', fontSize: 14 }}>{name}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: active ? '#22c55e' : '#475569' }} />
        <Text style={{ color: active ? '#22c55e' : '#475569', fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {active ? 'Live' : 'Soon'}
        </Text>
      </View>
    </View>
  );
}
