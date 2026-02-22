import React from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={{
      position: 'absolute',
      bottom: 24,
      left: 12,
      right: 12,
      alignItems: 'center',
    }}>
      <BlurView
        intensity={Platform.OS === 'ios' ? 90 : 0}
        tint="dark"
        style={{
          width: '100%',
          flexDirection: 'row',
          borderRadius: 28,
          overflow: 'hidden',
          backgroundColor: Platform.OS === 'android' ? 'rgba(8,14,30,0.96)' : 'transparent',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)',
          paddingHorizontal: 6,
          paddingVertical: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.5,
          shadowRadius: 20,
          elevation: 20,
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <TabItem
              key={route.key}
              isFocused={isFocused}
              options={options}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </BlurView>
    </View>
  );
}

function TabItem({ isFocused, options, onPress, onLongPress }: {
  isFocused: boolean;
  options: any;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const Icon = options.tabBarIcon;
  const label = (options.title ?? options.tabBarLabel ?? '') as string;

  const handlePressIn = () => {
    scale.value = withSpring(0.88, { damping: 15 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 }}
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={label}
    >
      <Animated.View style={[{ alignItems: 'center', gap: 3 }, animatedStyle]}>
        {/* Active pill background with glow */}
        {isFocused && (
          <View style={{
            position: 'absolute',
            top: -8,
            bottom: -8,
            left: -14,
            right: -14,
            backgroundColor: 'rgba(59,130,246,0.12)',
            borderRadius: 18,
            borderWidth: 1,
            borderColor: 'rgba(96,165,250,0.22)',
          }} />
        )}

        {/* Icon with glow dot */}
        <View style={{ width: 26, height: 26, alignItems: 'center', justifyContent: 'center' }}>
          {Icon && <Icon color={isFocused ? '#60A5FA' : '#475569'} size={21} />}
          {isFocused && (
            <View style={{
              position: 'absolute', bottom: -4,
              width: 4, height: 4, borderRadius: 2,
              backgroundColor: '#60a5fa',
            }} />
          )}
        </View>

        {/* Label */}
        <Text style={{
          fontSize: 9,
          fontWeight: isFocused ? '800' : '500',
          color: isFocused ? '#60A5FA' : '#475569',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          marginTop: 2,
        }}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
