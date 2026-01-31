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
    <View className="flex-row items-center p-3 bg-card border-t border-border">
      <View className="flex-1 flex-row items-center bg-secondary rounded-full px-4 py-2 mr-2">
        <TextInput
          className="flex-1 text-foreground max-h-24 text-base"
          placeholder={isRecording ? "Recording..." : "Message Abdullah Junior..."}
          placeholderTextColor={isRecording ? "#EF4444" : "#94A3B8"}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
          editable={!disabled && !isRecording}
        />
      </View>
      
      {text.trim() ? (
        <TouchableOpacity
          onPress={handleSend}
          disabled={disabled}
          className="h-10 w-10 rounded-full items-center justify-center bg-primary"
        >
          <Send size={20} color="white" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={handleMicPress}
          disabled={disabled}
          className={cn(
            'h-10 w-10 rounded-full items-center justify-center',
            isRecording ? 'bg-red-500' : 'bg-secondary'
          )}
        >
          {isRecording ? (
            <Square size={20} color="white" />
          ) : (
            <Mic size={20} color="#94A3B8" />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}
