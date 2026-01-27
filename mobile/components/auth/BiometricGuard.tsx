import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Lock } from 'lucide-react-native';

interface BiometricGuardProps {
  children: React.ReactNode;
}

export function BiometricGuard({ children }: BiometricGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    checkSupport();
  }, []);

  const checkSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    setIsSupported(compatible);
    if (compatible) {
      authenticate();
    } else {
      // If no hardware, bypass (or force pin - but let's bypass for this MVP)
      setIsAuthenticated(true);
    }
  };

  const authenticate = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Abdullah Junior',
        fallbackLabel: 'Enter Passcode',
      });

      if (result.success) {
        setIsAuthenticated(true);
      } else {
        // Allow retry
      }
    } catch (error) {
      Alert.alert('Authentication Error', 'Could not verify identity.');
    }
  };

  if (!isSupported) {
    return <>{children}</>;
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <View className="bg-card p-8 rounded-2xl items-center w-4/5 border border-border">
        <View className="bg-secondary p-4 rounded-full mb-4">
          <Lock size={48} color="#94A3B8" />
        </View>
        <Text className="text-xl font-bold text-foreground mb-2">Locked</Text>
        <Text className="text-muted-foreground text-center mb-6">
          Biometric authentication required to access your Digital FTE.
        </Text>
        
        <TouchableOpacity 
          className="bg-primary px-6 py-3 rounded-full w-full items-center"
          onPress={authenticate}
        >
          <Text className="text-white font-semibold text-lg">Unlock</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
