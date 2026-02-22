import React, { useState, useRef, useEffect } from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AgentMessage } from '../../components/agent/AgentMessage';
import { ChatInput } from '../../components/agent/ChatInput';
import { QuickActionChips } from '../../components/agent/QuickActionChips';
import { AgentTypingIndicator } from '../../components/agent/AgentTypingIndicator';
import { apiService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Zap, WifiOff } from 'lucide-react-native';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  suggestions?: string[];
}

export default function ChatScreen() {
  const { showToast } = useToast();
  const settings = useSettingsStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m **Abdullah Junior**, your AI Chief of Staff. How can I help you today?\n\nTry asking me about:\n- System status\n- Pending approvals\n- Creating tasks\n- Scheduling content',
      isUser: false,
      timestamp: new Date().toISOString(),
      suggestions: ['Check status', 'Pending approvals', 'Help'],
    },
  ]);

  // ... (rest of state)

  const handleSend = async (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // Pass OpenAI config in context if enabled
      const context = settings.openai.enabled ? {
        openai_config: {
          model: settings.openai.model,
          system_prompt: settings.openai.systemPrompt,
          temperature: settings.openai.temperature,
          // We don't send the API key here for security unless specifically requested, 
          // but we could if the backend is set up to receive it.
          // For now, let's assume the backend has its own key or we'll send it if non-empty.
          ...(settings.openai.apiKey ? { api_key: settings.openai.apiKey } : {})
        }
      } : {};

      const response = await apiService.sendChatMessage(text, context);

      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.response,
        isUser: false,
        timestamp: response.data.timestamp || new Date().toISOString(),
        suggestions: response.data.suggestions,
      };

      setMessages((prev) => [...prev, agentMsg]);

      if (response.data.suggestions?.length > 0) {
        setCurrentSuggestions(response.data.suggestions);
      }

      if (response.data.action_taken === 'task_created') {
        showToast('Task created successfully!', 'success');
      }

      setIsConnected(true);
    } catch (error: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: isConnected
          ? 'Sorry, I encountered an error. Please try again.'
          : 'I\'m currently offline. Check your connection.',
        isUser: false,
        timestamp: new Date().toISOString(),
        suggestions: ['Retry', 'Check status'],
      };

      setMessages((prev) => [...prev, errorMsg]);
      setCurrentSuggestions(['Retry', 'Check status', 'Help']);

      if (error.message?.includes('Network') || error.code === 'ERR_NETWORK') {
        setIsConnected(false);
        showToast('Connection lost', 'error');
      }
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <LinearGradient
      colors={['#030712', '#0f172a', '#030712']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
          paddingVertical: 12, paddingHorizontal: 16,
          borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
        }}>
          <View style={{
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: 'rgba(59,130,246,0.15)',
            justifyContent: 'center', alignItems: 'center', marginRight: 10,
          }}>
            <Zap size={18} color="#3b82f6" />
          </View>
          <View>
            <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 16 }}>Abdullah Junior</Text>
            <Text style={{ color: isTyping ? '#3b82f6' : isConnected ? '#22c55e' : '#ef4444', fontSize: 12 }}>
              {isTyping ? 'Typing...' : isConnected ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        {/* Offline Banner */}
        {!isConnected && (
          <View style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            backgroundColor: 'rgba(239,68,68,0.15)', paddingVertical: 8,
          }}>
            <WifiOff size={14} color="#ef4444" />
            <Text style={{ color: '#ef4444', fontSize: 12 }}>Offline - Some features unavailable</Text>
          </View>
        )}

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <AgentMessage
                message={item.text}
                isUser={item.isUser}
                timestamp={item.timestamp}
              />
            )}
            contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListFooterComponent={
              isTyping ? (
                <View style={{ marginLeft: 8, marginBottom: 16 }}>
                  <AgentTypingIndicator />
                </View>
              ) : null
            }
          />

          <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', backgroundColor: 'rgba(3,7,18,0.8)' }}>
            <QuickActionChips
              onSelect={(action: string) => handleSend(action)}
              disabled={isTyping}
              suggestions={currentSuggestions}
            />
            <ChatInput onSend={handleSend} disabled={isTyping} />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
