import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Send, Mic, Square } from 'lucide-react-native';
import * as Audio from 'expo-av';
import { cn } from '../../utils/cn';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState('');
  const [recording, setRecording] = useState<any>(); // Using any due to expo-av typing issues
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [recording]);

  const startRecording = async () => {
    try {
      const permission = await (Audio as any).requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission needed', 'Microphone permission is required to record voice messages.');
        return;
      }

      await (Audio as any).setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await (Audio as any).Recording.createAsync(
        (Audio as any).RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    try {
      await (recording as any).stopAndUnloadAsync();
      const uri = (recording as any).getURI();
      setRecording(undefined);

      // In a real app, we would upload 'uri' to /api/voice/transcribe
      // For this demo, we'll simulate a transcription
      if (uri) {
        onSend("[Voice Message Transcribed]: Please schedule a meeting for tomorrow.");
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText('');
    }
  };

  const handleMicPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <View style={{
      flexDirection: 'row', alignItems: 'flex-end',
      paddingHorizontal: 12, paddingVertical: 10,
      backgroundColor: 'rgba(8,14,30,0.95)',
      borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
      gap: 8,
    }}>
      <View style={{
        flex: 1, flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1, borderColor: isRecording ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)',
        borderRadius: 22, paddingHorizontal: 16, paddingVertical: 6,
        minHeight: 44,
      }}>
        <TextInput
          style={{
            flex: 1, color: '#f1f5f9', fontSize: 15, maxHeight: 120,
            paddingVertical: 4,
          }}
          placeholder={isRecording ? 'Recording…' : 'Message Abdullah Junior…'}
          placeholderTextColor={isRecording ? '#ef4444' : '#475569'}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
          editable={!disabled && !isRecording}
        />
      </View>

      {/* Mic or Send button */}
      {text.trim() ? (
        <TouchableOpacity
          onPress={handleSend}
          disabled={disabled}
          style={{
            width: 44, height: 44, borderRadius: 22,
            backgroundColor: '#3b82f6',
            justifyContent: 'center', alignItems: 'center',
            shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
          }}
        >
          <Send size={18} color="white" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={handleMicPress}
          disabled={disabled}
          style={{
            width: 44, height: 44, borderRadius: 22,
            backgroundColor: isRecording ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)',
            borderWidth: 1, borderColor: isRecording ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)',
            justifyContent: 'center', alignItems: 'center',
          }}
        >
          {isRecording ? <Square size={18} color="#ef4444" /> : <Mic size={18} color="#64748b" />}
        </TouchableOpacity>
      )}
    </View>
  );
}
