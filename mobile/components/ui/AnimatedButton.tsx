import React from 'react';
import { Pressable, Text, PressableProps, ActivityIndicator, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { cn } from '../../utils/cn';

interface AnimatedButtonProps extends PressableProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  label: string;
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
  textClassName?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AnimatedButton({
  variant = 'primary',
  size = 'md',
  label,
  icon,
  loading,
  className,
  textClassName,
  onPress,
  disabled,
  ...props
}: AnimatedButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'primary': return 'bg-primary border-primary';
      case 'secondary': return 'bg-secondary border-secondary';
      case 'outline': return 'bg-transparent border-input border-2';
      case 'ghost': return 'bg-transparent border-transparent';
      default: return 'bg-primary border-primary';
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline': return 'text-foreground';
      case 'ghost': return 'text-foreground';
      default: return 'text-primary-foreground';
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm': return 'h-9 px-3';
      case 'lg': return 'h-12 px-8';
      default: return 'h-10 px-4';
    }
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      className={cn(
        'flex-row items-center justify-center rounded-lg border',
        getVariantStyle(),
        getSizeStyle(),
        disabled && 'opacity-50',
        className
      )}
      style={animatedStyle}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? 'white' : 'black'} />
      ) : (
        <>
          {icon && <View className="mr-2">{icon}</View>}
          <Text className={cn('font-medium', getTextStyle(), textClassName)}>
            {label}
          </Text>
        </>
      )}
    </AnimatedPressable>
  );
}
