import React, { useState } from 'react';
import { View, Text, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSettingsStore } from '../../stores/settingsStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useNotifications } from '../../hooks/useNotifications';
import { useToast } from '../../context/ToastContext';
import * as Clipboard from 'expo-clipboard';
import { Moon, Sun, Monitor, Server, Bell, Shield, Copy, Brain, ChevronRight, FileText, Zap } from 'lucide-react-native';
import { apiService } from '../../services/api';

export default function SettingsScreen() {
  const settings = useSettingsStore();
  const { expoPushToken } = useNotifications();
  const { showToast } = useToast();

  const [urlInput, setUrlInput] = useState(settings.apiBaseUrl);

  const handleSaveUrl = async () => {
    settings.setApiBaseUrl(urlInput);
    await apiService.setBaseUrl(urlInput);
    showToast('Server URL updated', 'success');
  };

  const copyToken = async () => {
    if (expoPushToken) {
      await Clipboard.setStringAsync(expoPushToken);
      showToast('FCM Token copied', 'info');
    }
  };

  return (
    <LinearGradient colors={['#030712', '#0f172a', '#030712']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView style={{ paddingHorizontal: 24 }} contentContainerStyle={{ paddingBottom: 120, paddingTop: 16 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#f1f5f9', marginBottom: 24 }}>Settings</Text>

          {/* Agent Section */}
          <SectionLabel text="Agent" />
          <SettingsCard>
            <TouchableOpacity
              onPress={() => router.push('/skills')}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Brain size={20} color="#3b82f6" />
                <Text style={{ color: '#e2e8f0', fontSize: 15 }}>Agent Skills</Text>
              </View>
              <ChevronRight size={18} color="#64748b" />
            </TouchableOpacity>
          </SettingsCard>

          {/* Appearance */}
          <SectionLabel text="Appearance" />
          <SettingsCard>
            <View style={{ flexDirection: 'row' }}>
              {(['light', 'dark', 'system'] as const).map((theme) => (
                <TouchableOpacity
                  key={theme}
                  onPress={() => settings.setTheme(theme)}
                  style={{
                    flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 16,
                    backgroundColor: settings.theme === theme ? 'rgba(59,130,246,0.1)' : 'transparent',
                    borderBottomWidth: 2,
                    borderBottomColor: settings.theme === theme ? '#3b82f6' : 'transparent',
                  }}
                >
                  {theme === 'light' && <Sun size={22} color={settings.theme === theme ? '#3b82f6' : '#64748b'} />}
                  {theme === 'dark' && <Moon size={22} color={settings.theme === theme ? '#3b82f6' : '#64748b'} />}
                  {theme === 'system' && <Monitor size={22} color={settings.theme === theme ? '#3b82f6' : '#64748b'} />}
                  <Text style={{
                    marginTop: 6, fontSize: 12, textTransform: 'capitalize',
                    color: settings.theme === theme ? '#3b82f6' : '#64748b',
                    fontWeight: settings.theme === theme ? '600' : '400',
                  }}>{theme}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </SettingsCard>

          {/* Server */}
          <SectionLabel text="Server Configuration" />
          <SettingsCard>
            <View style={{ padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Server size={18} color="#3b82f6" />
                <Text style={{ color: '#e2e8f0', fontWeight: '500' }}>Backend URL</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Input
                    value={urlInput}
                    onChangeText={setUrlInput}
                    placeholder="https://abdullah-junior-api.fly.dev"
                  />
                </View>
                <Button size="sm" onPress={handleSaveUrl}>
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Save</Text>
                </Button>
              </View>
            </View>
          </SettingsCard>

          {/* Notifications */}
          <SectionLabel text="Notifications" />
          <SettingsCard>
            {[
              { key: 'approvals', label: 'Approval Requests', icon: Shield },
              { key: 'suggestions', label: 'Proactive Suggestions', icon: Zap },
              { key: 'digest', label: 'Daily Digest', icon: FileText },
            ].map((item, index) => (
              <View
                key={item.key}
                style={{
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                  paddingHorizontal: 16, paddingVertical: 14,
                  borderBottomWidth: index < 2 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.04)',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <item.icon size={18} color="#64748b" />
                  <Text style={{ color: '#e2e8f0', fontSize: 15 }}>{item.label}</Text>
                </View>
                <Switch
                  value={settings.notifications[item.key as keyof typeof settings.notifications]}
                  onValueChange={() => settings.toggleNotification(item.key as any)}
                  trackColor={{ false: '#1e293b', true: '#1d4ed8' }}
                  thumbColor="#f8fafc"
                />
              </View>
            ))}
          </SettingsCard>

          {/* Debug */}
          <SectionLabel text="Debug Info" />
          <SettingsCard>
            <View style={{ padding: 16 }}>
              <Text style={{ color: '#64748b', fontSize: 12, marginBottom: 6 }}>FCM Token</Text>
              <TouchableOpacity
                onPress={copyToken}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: 'rgba(255,255,255,0.03)', padding: 10,
                  borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
                }}
              >
                <Text style={{ color: '#94a3b8', fontSize: 11, flex: 1, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }} numberOfLines={1}>
                  {expoPushToken || 'Not registered'}
                </Text>
                <Copy size={14} color="#64748b" style={{ marginLeft: 8 }} />
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                <Text style={{ color: '#64748b', fontSize: 12 }}>App Version</Text>
                <Text style={{ color: '#94a3b8', fontSize: 12 }}>2.0.0 (Build 1)</Text>
              </View>
            </View>
          </SettingsCard>

          <TouchableOpacity
            onPress={() => showToast('Cache cleared', 'info')}
            style={{
              backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)',
              borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 24,
            }}
          >
            <Text style={{ color: '#ef4444', fontWeight: '600' }}>Clear Cache & Reset</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <Text style={{
      color: '#64748b', fontSize: 12, fontWeight: '600',
      textTransform: 'uppercase', letterSpacing: 1,
      marginBottom: 8, marginTop: 20, marginLeft: 4,
    }}>{text}</Text>
  );
}

function SettingsCard({ children }: { children: React.ReactNode }) {
  return (
    <View style={{
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
      borderRadius: 16, overflow: 'hidden',
    }}>
      {children}
    </View>
  );
}

import { Platform } from 'react-native';
