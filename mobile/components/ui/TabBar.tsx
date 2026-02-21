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
        intensity={Platform.OS === 'ios' ? 80 : 0}
        tint="dark"
        style={{
          width: '100%',
          flexDirection: 'row',
          borderRadius: 24,
          overflow: 'hidden',
          backgroundColor: Platform.OS === 'android' ? 'rgba(15,23,42,0.92)' : 'transparent',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.1)',
          paddingHorizontal: 4,
          paddingVertical: 6,
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
        {/* Active pill background */}
        {isFocused && (
          <View style={{
            position: 'absolute',
            top: -6,
            bottom: -6,
            left: -12,
            right: -12,
            backgroundColor: 'rgba(96,165,250,0.15)',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: 'rgba(96,165,250,0.25)',
          }} />
        )}

        {/* Icon */}
        <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
          {Icon && <Icon color={isFocused ? '#60A5FA' : '#64748b'} size={22} />}
        </View>

        {/* Label */}
        <Text style={{
          fontSize: 9,
          fontWeight: isFocused ? '700' : '500',
          color: isFocused ? '#60A5FA' : '#64748b',
          letterSpacing: 0.3,
          textTransform: 'uppercase',
        }}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
