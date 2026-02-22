import React from 'react';
import { View, Text } from 'react-native';
import { AgentAvatar } from './AgentAvatar';
import { cn } from '../../utils/cn';

interface AgentMessageProps {
  message: string;
  isUser: boolean;
  timestamp: string;
}

/** Parse a line into segments of plain/bold text */
function parseBold(line: string, baseColor: string) {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text key={i} style={{ fontWeight: '700', color: baseColor }}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    return <Text key={i} style={{ color: baseColor }}>{part}</Text>;
  });
}

function MarkdownText({ text, isUser }: { text: string; isUser: boolean }) {
  const textColor = isUser ? '#ffffff' : '#e2e8f0';
  const mutedColor = isUser ? 'rgba(255,255,255,0.7)' : '#94a3b8';

  const lines = text.split('\n');

  return (
    <View style={{ gap: 3 }}>
      {lines.map((line, i) => {
        if (line.trim() === '') return <View key={i} style={{ height: 4 }} />;

        // Bullet points
        if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
          const content = line.trim().replace(/^[-•]\s/, '');
          return (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
              <Text style={{ color: mutedColor, marginTop: 1 }}>•</Text>
              <Text style={{ flex: 1, fontSize: 14, lineHeight: 20, color: textColor }}>
                {parseBold(content, textColor)}
              </Text>
            </View>
          );
        }

        // Normal line
        return (
          <Text key={i} style={{ fontSize: 14, lineHeight: 20, color: textColor }}>
            {parseBold(line, textColor)}
          </Text>
        );
      })}
    </View>
  );
}

export function AgentMessage({ message, isUser, timestamp }: AgentMessageProps) {
  return (
    <View
      className={cn(
        'flex-row mb-4 w-full',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && <AgentAvatar size="sm" className="mr-2 self-end mb-1" />}

      <View
        style={{
          maxWidth: '80%',
          borderRadius: 18,
          paddingHorizontal: 14,
          paddingVertical: 10,
          backgroundColor: isUser ? '#3b82f6' : 'rgba(255,255,255,0.06)',
          borderWidth: 1,
          borderColor: isUser ? 'transparent' : 'rgba(255,255,255,0.08)',
          borderBottomRightRadius: isUser ? 4 : 18,
          borderBottomLeftRadius: isUser ? 18 : 4,
        }}
      >
        <MarkdownText text={message} isUser={isUser} />
        <Text
          style={{
            fontSize: 10,
            marginTop: 6,
            opacity: 0.6,
            color: isUser ? '#fff' : '#64748b',
            textAlign: isUser ? 'right' : 'left',
          }}
        >
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
}
