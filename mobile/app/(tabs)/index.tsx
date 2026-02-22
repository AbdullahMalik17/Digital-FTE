import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, RefreshControl,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { GlassCard } from '../../components/ui/glass/GlassCard';
import { apiService } from '../../services/api';
import {
  Bell, Zap, CheckCircle, AlertTriangle,
  Clock, MessageSquare, Mail, TrendingUp, Activity, Cpu,
} from 'lucide-react-native';

const { width: SCREEN_W } = Dimensions.get('window');

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

const CHANNELS = [
  { icon: '📧', name: 'Gmail',    active: true  },
  { icon: '💬', name: 'WA',       active: true  },
  { icon: '💼', name: 'LinkedIn', active: true  },
  { icon: '✈️', name: 'Telegram', active: true  },
  { icon: '🐦', name: 'Twitter',  active: true  },
  { icon: '📘', name: 'Facebook', active: true  },
  { icon: '📸', name: 'Instagram',active: true  },
  { icon: '🎮', name: 'Discord',  active: false },
  { icon: '💡', name: 'Slack',    active: false },
];

const AGENTS = [
  { icon: '📧', name: 'Inbox Triage',   desc: 'Monitoring emails & messages',    status: 'active'   },
  { icon: '💼', name: 'Social Media',   desc: 'LinkedIn & social scheduling',    status: 'active'   },
  { icon: '🤖', name: 'Orchestrator',   desc: 'Task routing & SLA tracking',     status: 'active'   },
  { icon: '📅', name: 'Calendar',       desc: 'Meeting detection & scheduling',  status: 'active'   },
  { icon: '💰', name: 'Financial',      desc: 'Odoo ERP integration',            status: 'standby'  },
];

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

  const activeChannels = CHANNELS.filter((c) => c.active).length;

  return (
    <LinearGradient
      colors={['#020510', '#0b1220', '#060c18']}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
        }
      >
        {/* ── Header ── */}
        <SafeAreaView edges={['top']} style={{ paddingHorizontal: 20 }}>
          <View style={{
            flexDirection: 'row', justifyContent: 'space-between',
            alignItems: 'center', marginTop: 8, marginBottom: 4,
          }}>
            <View style={{ flex: 1 }}>
              {/* System status pill */}
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 6,
                backgroundColor: connected ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                borderWidth: 1, borderColor: connected ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
                alignSelf: 'flex-start', marginBottom: 10,
              }}>
                <View style={{
                  width: 6, height: 6, borderRadius: 3,
                  backgroundColor: connected ? '#22c55e' : '#ef4444',
                }} />
                <Text style={{
                  color: connected ? '#22c55e' : '#ef4444',
                  fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase',
                }}>
                  {connected ? `${activeChannels} Channels Live` : 'Offline'}
                </Text>
              </View>

              <Text style={{
                color: '#94a3b8', fontSize: 12, fontWeight: '600',
                letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4,
              }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </Text>
              <Text style={{ color: '#f1f5f9', fontSize: 26, fontWeight: '800', letterSpacing: -0.5 }}>
                {greeting},{' '}
                <Text style={{ color: '#60a5fa' }}>Abdullah</Text>
              </Text>
            </View>

            {/* Notification + AI logo */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <TouchableOpacity
                onPress={() => router.push('/approvals' as any)}
                style={{
                  width: 44, height: 44, borderRadius: 22,
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                  justifyContent: 'center', alignItems: 'center',
                }}
              >
                <Bell size={19} color="#94a3b8" />
                {stats.urgent_count > 0 && (
                  <View style={{
                    position: 'absolute', top: 7, right: 7,
                    width: 9, height: 9, borderRadius: 5,
                    backgroundColor: '#ef4444',
                    borderWidth: 1.5, borderColor: '#020510',
                  }} />
                )}
              </TouchableOpacity>
              <View style={{
                width: 44, height: 44, borderRadius: 14,
                backgroundColor: 'rgba(59,130,246,0.15)',
                borderWidth: 1, borderColor: 'rgba(59,130,246,0.3)',
                justifyContent: 'center', alignItems: 'center',
              }}>
                <Text style={{ fontSize: 18 }}>🤖</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>

        {/* ── Stats Grid ── */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <Text style={{
            color: '#475569', fontSize: 10, fontWeight: '700',
            letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12,
          }}>
            Operations Overview
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <StatCard
              icon={<AlertTriangle size={16} color="#f59e0b" />}
              value={stats.urgent_count}
              label="Urgent"
              gradient={['rgba(120,53,15,0.8)', 'rgba(69,26,3,0.9)']}
              accentColor="#f59e0b"
              emoji="⚠️"
            />
            <StatCard
              icon={<Clock size={16} color="#60a5fa" />}
              value={stats.pending_count}
              label="Pending"
              gradient={['rgba(23,37,84,0.8)', 'rgba(12,26,61,0.9)']}
              accentColor="#60a5fa"
              emoji="⏳"
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <StatCard
              icon={<Activity size={16} color="#a78bfa" />}
              value={stats.in_progress_count}
              label="In Progress"
              gradient={['rgba(46,16,101,0.8)', 'rgba(30,16,55,0.9)']}
              accentColor="#a78bfa"
              emoji="⚡"
            />
            <StatCard
              icon={<CheckCircle size={16} color="#34d399" />}
              value={stats.done_today_count}
              label="Done Today"
              gradient={['rgba(20,83,45,0.8)', 'rgba(5,46,22,0.9)']}
              accentColor="#34d399"
              emoji="✅"
            />
          </View>
        </View>

        {/* ── Quick Actions ── */}
        <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
          <Text style={{
            color: '#475569', fontSize: 10, fontWeight: '700',
            letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14,
          }}>
            Quick Actions
          </Text>
          <View style={{
            flexDirection: 'row', gap: 10,
            backgroundColor: 'rgba(255,255,255,0.02)',
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
            borderRadius: 20, padding: 12,
          }}>
            <QuickActionBtn
              icon={<MessageSquare size={20} color="#60a5fa" />}
              label="Chat"
              bgColor="rgba(59,130,246,0.12)"
              borderColor="rgba(59,130,246,0.25)"
              onPress={() => router.push('/chat' as any)}
            />
            <QuickActionBtn
              icon={<CheckCircle size={20} color="#34d399" />}
              label="Approve"
              badge={stats.pending_count > 0 ? stats.pending_count : undefined}
              bgColor="rgba(34,197,94,0.12)"
              borderColor="rgba(34,197,94,0.25)"
              onPress={() => router.push('/approvals' as any)}
            />
            <QuickActionBtn
              icon={<Mail size={20} color="#c084fc" />}
              label="Inbox"
              bgColor="rgba(168,85,247,0.12)"
              borderColor="rgba(168,85,247,0.25)"
              onPress={() => {}}
            />
            <QuickActionBtn
              icon={<TrendingUp size={20} color="#fb923c" />}
              label="Report"
              bgColor="rgba(249,115,22,0.12)"
              borderColor="rgba(249,115,22,0.25)"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* ── Channels — Horizontal Scroll Grid ── */}
        <View style={{ marginTop: 28 }}>
          <View style={{ paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <Text style={{ color: '#475569', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' }}>
              Connected Channels
            </Text>
            <TouchableOpacity onPress={() => router.push('/integrations' as any)}>
              <Text style={{ color: '#60a5fa', fontSize: 12, fontWeight: '600' }}>View all →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
          >
            {CHANNELS.map((ch) => (
              <ChannelChip key={ch.name} {...ch} />
            ))}
          </ScrollView>
        </View>

        {/* ── Agent Team ── */}
        <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
          <Text style={{
            color: '#475569', fontSize: 10, fontWeight: '700',
            letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14,
          }}>
            Agent Team
          </Text>
          <View style={{
            borderRadius: 20, overflow: 'hidden',
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
            backgroundColor: 'rgba(255,255,255,0.02)',
          }}>
            {AGENTS.map((agent, i) => (
              <AgentRow key={agent.name} {...agent} last={i === AGENTS.length - 1} />
            ))}
          </View>
        </View>

        {/* ── System Footer ── */}
        <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
          <LinearGradient
            colors={['rgba(59,130,246,0.08)', 'rgba(139,92,246,0.05)']}
            style={{
              borderRadius: 18, padding: 16,
              borderWidth: 1, borderColor: 'rgba(59,130,246,0.15)',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{
                  width: 38, height: 38, borderRadius: 12,
                  backgroundColor: 'rgba(59,130,246,0.15)',
                  borderWidth: 1, borderColor: 'rgba(59,130,246,0.3)',
                  justifyContent: 'center', alignItems: 'center',
                }}>
                  <Cpu size={18} color="#60a5fa" />
                </View>
                <View>
                  <Text style={{ color: '#f1f5f9', fontWeight: '700', fontSize: 14 }}>Abdullah Junior</Text>
                  <Text style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>AI Chief of Staff v2.0</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: 5,
                  backgroundColor: connected ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4,
                }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: connected ? '#22c55e' : '#ef4444' }} />
                  <Text style={{ color: connected ? '#22c55e' : '#ef4444', fontSize: 11, fontWeight: '600' }}>
                    {connected ? 'Online' : 'Offline'}
                  </Text>
                </View>
                <Text style={{ color: '#475569', fontSize: 10, marginTop: 4 }}>
                  {activeChannels}/9 channels active
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

/* ── Sub-components ── */

function StatCard({ icon, value, label, gradient, accentColor, emoji }: {
  icon: React.ReactNode;
  value: number;
  label: string;
  gradient: [string, string];
  accentColor: string;
  emoji: string;
}) {
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={gradient}
        style={{
          borderRadius: 18, padding: 16,
          borderWidth: 1, borderColor: `${accentColor}25`,
        }}
      >
        {/* Top row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <View style={{
            width: 34, height: 34, borderRadius: 10,
            backgroundColor: `${accentColor}18`,
            borderWidth: 1, borderColor: `${accentColor}30`,
            justifyContent: 'center', alignItems: 'center',
          }}>
            {icon}
          </View>
          <Text style={{ fontSize: 16 }}>{emoji}</Text>
        </View>

        {/* Value */}
        <Text style={{ color: '#f1f5f9', fontSize: 36, fontWeight: '800', letterSpacing: -1, lineHeight: 40 }}>
          {value}
        </Text>

        {/* Label */}
        <Text style={{
          color: accentColor, fontSize: 11, fontWeight: '700',
          letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 4, opacity: 0.9,
        }}>
          {label}
        </Text>

        {/* Sparkline decoration */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, marginTop: 10, height: 16, opacity: 0.3 }}>
          {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
            <View
              key={i}
              style={{
                flex: 1, height: `${h}%`,
                backgroundColor: accentColor,
                borderRadius: 2,
              }}
            />
          ))}
        </View>
      </LinearGradient>
    </View>
  );
}

function QuickActionBtn({ icon, label, badge, bgColor, borderColor, onPress }: {
  icon: React.ReactNode;
  label: string;
  badge?: number;
  bgColor: string;
  borderColor: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={{ flex: 1, alignItems: 'center', gap: 8 }}>
      <View style={{
        width: 52, height: 52, borderRadius: 16,
        backgroundColor: bgColor, borderWidth: 1, borderColor,
        justifyContent: 'center', alignItems: 'center',
      }}>
        {icon}
        {badge !== undefined && badge > 0 && (
          <View style={{
            position: 'absolute', top: -5, right: -5,
            backgroundColor: '#ef4444', borderRadius: 10,
            minWidth: 18, height: 18,
            justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4,
            borderWidth: 1.5, borderColor: '#020510',
          }}>
            <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>{badge}</Text>
          </View>
        )}
      </View>
      <Text style={{ color: '#94a3b8', fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function ChannelChip({ icon, name, active }: { icon: string; name: string; active: boolean }) {
  return (
    <View style={{
      alignItems: 'center', gap: 6,
      backgroundColor: active ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.02)',
      borderWidth: 1, borderColor: active ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
      borderRadius: 16, paddingVertical: 12, paddingHorizontal: 14,
      opacity: active ? 1 : 0.45, minWidth: 64,
    }}>
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      <Text style={{ color: '#94a3b8', fontSize: 10, fontWeight: '600' }}>{name}</Text>
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: active ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)',
        borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2,
      }}>
        <View style={{
          width: 4, height: 4, borderRadius: 2,
          backgroundColor: active ? '#22c55e' : '#475569',
        }} />
        <Text style={{
          color: active ? '#22c55e' : '#475569',
          fontSize: 8, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5,
        }}>
          {active ? 'Live' : 'Soon'}
        </Text>
      </View>
    </View>
  );
}

function AgentRow({ icon, name, desc, status, last }: {
  icon: string; name: string; desc: string; status: string; last?: boolean;
}) {
  const isActive = status === 'active';
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14,
      borderBottomWidth: last ? 0 : 1, borderBottomColor: 'rgba(255,255,255,0.04)',
    }}>
      <View style={{
        width: 38, height: 38, borderRadius: 12,
        backgroundColor: isActive ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.04)',
        borderWidth: 1, borderColor: isActive ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.06)',
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
      }}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#e2e8f0', fontWeight: '700', fontSize: 14 }}>{name}</Text>
        <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{desc}</Text>
      </View>
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: isActive ? 'rgba(34,197,94,0.1)' : 'rgba(148,163,184,0.08)',
        paddingHorizontal: 10, paddingVertical: 5,
        borderRadius: 12, borderWidth: 1,
        borderColor: isActive ? 'rgba(34,197,94,0.2)' : 'rgba(148,163,184,0.1)',
      }}>
        <View style={{
          width: 6, height: 6, borderRadius: 3,
          backgroundColor: isActive ? '#22c55e' : '#64748b',
        }} />
        <Text style={{
          color: isActive ? '#22c55e' : '#64748b',
          fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5,
        }}>
          {isActive ? 'Active' : 'Standby'}
        </Text>
      </View>
    </View>
  );
}
