import React from 'react';
import { View, ViewProps, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { cn } from '../../../utils/cn';

interface GlassCardProps extends ViewProps {
  intensity?: number;
  className?: string;
  children: React.ReactNode;
}

export function GlassCard({ intensity = 20, className, children, style, ...props }: GlassCardProps) {
  const isAndroid = Platform.OS === 'android';

  // Android doesn't support BlurView natively as well as iOS, so we fallback to a semi-transparent background
  if (isAndroid) {
    return (
      <View
        className={cn(
          'overflow-hidden rounded-2xl border border-white/10 bg-surface/80',
          className
        )}
        style={style}
        {...props}
      >
        {children}
      </View>
    );
  }

  return (
    <View
      className={cn(
        'overflow-hidden rounded-2xl border border-white/10',
        className
      )}
      style={style}
      {...props}
    >
      <BlurView intensity={intensity} tint="dark" className="flex-1">
        <View className="flex-1 bg-background/40 p-4">
          {children}
        </View>
      </BlurView>
    </View>
  );
}
