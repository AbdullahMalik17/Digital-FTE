import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  theme: 'dark' | 'light' | 'system';
  apiBaseUrl: string;
  notifications: {
    approvals: boolean;
    suggestions: boolean;
    digest: boolean;
  };
  openai: {
    enabled: boolean;
    apiKey: string;
    model: string;
    systemPrompt: string;
    temperature: number;
  };
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  setApiBaseUrl: (url: string) => void;
  setOpenAIConfig: (config: Partial<SettingsState['openai']>) => void;
  toggleNotification: (key: 'approvals' | 'suggestions' | 'digest') => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      apiBaseUrl: 'http://10.0.2.2:8000',
      notifications: {
        approvals: true,
        suggestions: true,
        digest: true,
      },
      openai: {
        enabled: true,
        apiKey: '',
        model: 'gpt-4o',
        systemPrompt: 'You are Abdullah Junior, an AI Chief of Staff. You help the user manage their professional and personal life.',
        temperature: 0.7,
      },
      setTheme: (theme) => set({ theme }),
      setApiBaseUrl: (url) => set({ apiBaseUrl: url }),
      setOpenAIConfig: (config) =>
        set((state) => ({
          openai: { ...state.openai, ...config },
        })),
      toggleNotification: (key) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            [key]: !state.notifications[key],
          },
        })),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
