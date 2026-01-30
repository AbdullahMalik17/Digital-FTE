import React from 'react';
import { View, Platform, LayoutChangeEvent } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { GlassCard } from './glass/GlassCard';
import { AnimatedButton } from './AnimatedButton';
import { cn } from '../../utils/cn';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';

// Import icons to use directly if descriptors don't provide what we want, 
// or we can rely on the options.tabBarIcon which we defined in _layout.
// For a cleaner custom tab bar, we often just render what's passed in options.

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View className="absolute bottom-8 left-4 right-4 items-center">
      <GlassCard 
        intensity={80} 
        className="flex-row p-1.5 rounded-full border-white/20 bg-background/60"
        style={{ width: '100%', maxWidth: 400 }}
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
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
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
      </GlassCard>
    </View>
  );
}

function TabItem({ isFocused, options, onPress, onLongPress }: any) {
  // Animation for the active indicator
  const scale = useSharedValue(isFocused ? 1 : 0);
  
  React.useEffect(() => {
    scale.value = withSpring(isFocused ? 1 : 0, { damping: 15 });
  }, [isFocused]);

  const activeIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  // We need to render the icon. options.tabBarIcon is a function (props) => Node
  const Icon = options.tabBarIcon;
  const label = options.title !== undefined ? options.title : options.tabBarLabel;

  return (
    <AnimatedButton
      label={""} // No text label for cleaner look, or maybe add it conditionally
      onPress={onPress}
      onLongPress={onLongPress}
      className={cn(
        "flex-1 h-12 items-center justify-center rounded-full bg-transparent border-0",
      )}
      // We are customizing the content manually below, so we pass empty label/icon to AnimatedButton 
      // but use its press animation capabilities.
    >
      {/* Active Indicator Background */}
      <Animated.View 
        className="absolute inset-0 bg-primary/20 rounded-full"
        style={activeIndicatorStyle}
      />
      
      {/* Icon */}
      <View className="items-center justify-center">
        {Icon && <Icon color={isFocused ? '#60A5FA' : '#94A3B8'} size={24} />}
        
        {/* Optional: Tiny dot for active state if we prefer minimal look over background */}
        {/* {isFocused && <View className="w-1 h-1 bg-primary rounded-full mt-1" />} */}
      </View>
    </AnimatedButton>
  );
}
