import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const INTEGRATIONS = [
  { id: 'gmail',     name: 'Gmail',       icon: '📧', color: '#ef4444', description: 'Email monitoring & auto-reply',     envKey: 'GOOGLE_CLIENT_ID',        active: true  },
  { id: 'whatsapp',  name: 'WhatsApp',    icon: '💬', color: '#22c55e', description: 'Message monitoring & automation',  envKey: 'WHATSAPP_ENABLED',         active: true  },
  { id: 'linkedin',  name: 'LinkedIn',    icon: '💼', color: '#3b82f6', description: 'Social posting & networking',      envKey: 'LINKEDIN_EMAIL',           active: true  },
  { id: 'telegram',  name: 'Telegram',    icon: '✈️', color: '#0ea5e9', description: 'Command bot interface',            envKey: 'TELEGRAM_BOT_TOKEN',       active: true  },
  { id: 'twitter',   name: 'Twitter / X', icon: '🐦', color: '#64748b', description: 'Tweet & thread automation',        envKey: 'TWITTER_API_KEY',          active: true  },
  { id: 'facebook',  name: 'Facebook',    icon: '📘', color: '#3b82f6', description: 'Post & page management',           envKey: 'FACEBOOK_ACCESS_TOKEN',    active: true  },
  { id: 'instagram', name: 'Instagram',   icon: '📸', color: '#ec4899', description: 'Media posting & insights',         envKey: 'INSTAGRAM_ACCESS_TOKEN',   active: true  },
  { id: 'discord',   name: 'Discord',     icon: '🎮', color: '#6366f1', description: 'Bot commands & notifications',     envKey: 'DISCORD_BOT_TOKEN',        active: false },
  { id: 'slack',     name: 'Slack',       icon: '💡', color: '#f59e0b', description: 'Workspace automation',             envKey: 'SLACK_BOT_TOKEN',          active: false },
];

export default function IntegrationsScreen() {
  const activeCount = INTEGRATIONS.filter(i => i.active).length;
  const soonCount = INTEGRATIONS.filter(i => !i.active).length;

  return (
    <LinearGradient colors={['#030712', '#0f172a', '#030712']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          style={{ paddingHorizontal: 24 }}
          contentContainerStyle={{ paddingBottom: 120, paddingTop: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#f1f5f9', marginBottom: 4 }}>
            Channels
          </Text>
          <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
            {activeCount} active · {soonCount} coming soon · config/integrations.env
          </Text>

          {/* Stats Row */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
            <View style={{ flex: 1, backgroundColor: 'rgba(34,197,94,0.1)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)', borderRadius: 16, padding: 16, alignItems: 'center' }}>
              <Text style={{ fontSize: 28, fontWeight: '700', color: '#22c55e' }}>{activeCount}</Text>
              <Text style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Active</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: 'rgba(99,102,241,0.1)', borderWidth: 1, borderColor: 'rgba(99,102,241,0.2)', borderRadius: 16, padding: 16, alignItems: 'center' }}>
              <Text style={{ fontSize: 28, fontWeight: '700', color: '#818cf8' }}>{INTEGRATIONS.length}</Text>
              <Text style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Total</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: 'rgba(245,158,11,0.1)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)', borderRadius: 16, padding: 16, alignItems: 'center' }}>
              <Text style={{ fontSize: 28, fontWeight: '700', color: '#fbbf24' }}>{soonCount}</Text>
              <Text style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Soon</Text>
            </View>
          </View>

          {/* Integration Cards */}
          <View style={{ gap: 12 }}>
            {INTEGRATIONS.map(integration => (
              <View
                key={integration.id}
                style={{
                  backgroundColor: integration.active ? 'rgba(15,23,42,0.8)' : 'rgba(15,23,42,0.4)',
                  borderWidth: 1,
                  borderColor: integration.active ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                  borderRadius: 16,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  opacity: integration.active ? 1 : 0.6,
                }}
              >
                {/* Icon */}
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: `${integration.color}18`,
                  borderWidth: 1,
                  borderColor: `${integration.color}30`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: 22 }}>{integration.icon}</Text>
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: '#f1f5f9' }}>
                    {integration.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                    {integration.description}
                  </Text>
                  <Text style={{ fontSize: 10, color: '#334155', marginTop: 4, fontFamily: 'monospace' }}>
                    {integration.envKey}
                  </Text>
                </View>

                {/* Status */}
                <View style={{ alignItems: 'center', gap: 4 }}>
                  <View style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: integration.active ? '#22c55e' : '#475569',
                  }} />
                  <Text style={{ fontSize: 9, color: integration.active ? '#22c55e' : '#475569', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {integration.active ? 'Active' : 'Soon'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
