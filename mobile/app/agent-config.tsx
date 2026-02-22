import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettingsStore } from '../stores/settingsStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { Zap, Shield, MessageSquare, Cpu, Sliders } from 'lucide-react-native';

export default function AgentConfigScreen() {
  const settings = useSettingsStore();
  const { showToast } = useToast();

  const [apiKey, setApiKey] = useState(settings.openai.apiKey);
  const [model, setModel] = useState(settings.openai.model);
  const [systemPrompt, setSystemPrompt] = useState(settings.openai.systemPrompt);
  const [temperature, setTemperature] = useState(settings.openai.temperature.toString());

  const handleSave = () => {
    settings.setOpenAIConfig({
      apiKey,
      model,
      systemPrompt,
      temperature: parseFloat(temperature) || 0.7,
    });
    showToast('OpenAI Configuration saved', 'success');
  };

  return (
    <LinearGradient colors={['#030712', '#0f172a', '#030712']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <ScrollView style={{ paddingHorizontal: 24 }} contentContainerStyle={{ paddingBottom: 120, paddingTop: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#f1f5f9', marginBottom: 24 }}>OpenAI Agent</Text>

          {/* Enable/Disable */}
          <SectionLabel text="Status" />
          <ConfigCard>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Zap size={20} color={settings.openai.enabled ? "#22c55e" : "#64748b"} />
                <View>
                  <Text style={{ color: '#e2e8f0', fontSize: 15 }}>Enable OpenAI Agent</Text>
                  <Text style={{ color: '#64748b', fontSize: 12 }}>Use OpenAI for chat processing</Text>
                </View>
              </View>
              <Switch
                value={settings.openai.enabled}
                onValueChange={(val) => settings.setOpenAIConfig({ enabled: val })}
                trackColor={{ false: '#1e293b', true: '#1d4ed8' }}
                thumbColor="#f8fafc"
              />
            </View>
          </ConfigCard>

          {/* API Credentials */}
          <SectionLabel text="API Credentials" />
          <ConfigCard>
            <View style={{ padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Shield size={18} color="#3b82f6" />
                <Text style={{ color: '#e2e8f0', fontWeight: '500' }}>OpenAI API Key</Text>
              </View>
              <Input
                value={apiKey}
                onChangeText={setApiKey}
                placeholder="sk-..."
                secureTextEntry
              />
              <Text style={{ color: '#64748b', fontSize: 11, marginTop: 8 }}>
                Keys are stored locally and encrypted on your device.
              </Text>
            </View>
          </ConfigCard>

          {/* Model Selection */}
          <SectionLabel text="Model Configuration" />
          <ConfigCard>
            <View style={{ padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Cpu size={18} color="#8b5cf6" />
                <Text style={{ color: '#e2e8f0', fontWeight: '500' }}>Model Name</Text>
              </View>
              <Input
                value={model}
                onChangeText={setModel}
                placeholder="gpt-4o"
              />
              
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 20 }}>
                <Sliders size={18} color="#f59e0b" />
                <Text style={{ color: '#e2e8f0', fontWeight: '500' }}>Temperature ({temperature})</Text>
              </View>
              <Input
                value={temperature}
                onChangeText={setTemperature}
                placeholder="0.7"
                keyboardType="numeric"
              />
            </View>
          </ConfigCard>

          {/* System Prompt */}
          <SectionLabel text="Behavior" />
          <ConfigCard>
            <View style={{ padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <MessageSquare size={18} color="#ec4899" />
                <Text style={{ color: '#e2e8f0', fontWeight: '500' }}>System Prompt</Text>
              </View>
              <Input
                value={systemPrompt}
                onChangeText={setSystemPrompt}
                placeholder="You are an AI assistant..."
                multiline
                numberOfLines={4}
                style={{ height: 100, textAlignVertical: 'top' }}
              />
            </View>
          </ConfigCard>

          <Button 
            className="mt-8 bg-blue-600 h-14 rounded-2xl" 
            onPress={handleSave}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Save Configuration</Text>
          </Button>

          <TouchableOpacity
            onPress={() => {
              setApiKey('');
              setModel('gpt-4o');
              setSystemPrompt('You are Abdullah Junior, an AI Chief of Staff. You help the user manage their professional and personal life.');
              setTemperature('0.7');
            }}
            style={{
              paddingVertical: 14, alignItems: 'center', marginTop: 16,
            }}
          >
            <Text style={{ color: '#64748b', fontSize: 14 }}>Reset to Defaults</Text>
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

function ConfigCard({ children }: { children: React.ReactNode }) {
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
