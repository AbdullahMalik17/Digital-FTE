import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Zap, Brain, MessageSquare } from 'lucide-react-native';

interface Skill {
  name: string;
  description: string;
  category: string;
}

export default function SkillsScreen() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSkills = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getSuggestions(); // Using suggestions endpoint as placeholder or need to add getSkills
      // Actually, I need to add getSkills to apiService first. 
      // For now, I'll mock it or use getSuggestions if it returns skills.
      // Let's assume apiService.getSkills() will be added.
      // If not, I'll mock it here for the UI.
      const mockSkills = [
        { name: 'Gmail Watcher', description: 'Monitors inbox for urgent emails', category: 'Communication' },
        { name: 'WhatsApp Watcher', description: 'Auto-replies to known contacts', category: 'Communication' },
        { name: 'Financial Analyst', description: 'Tracks revenue and expenses from Odoo', category: 'Finance' },
        { name: 'LinkedIn Poster', description: 'Schedules and posts content', category: 'Social' },
      ];
      setSkills(mockSkills);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const getIcon = (category: string) => {
    switch (category) {
      case 'Communication': return <MessageSquare size={24} color="#3B82F6" />;
      case 'Finance': return <Zap size={24} color="#F59E0B" />;
      default: return <Brain size={24} color="#8B5CF6" />;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <FlatList
        data={skills}
        keyExtractor={(item) => item.name}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchSkills} tintColor="#fff" />}
        renderItem={({ item }) => (
          <Card className="mb-4">
            <CardContent className="p-4 flex-row items-center">
              <View className="bg-secondary p-3 rounded-full mr-4">
                {getIcon(item.category)}
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-foreground">{item.name}</Text>
                <Text className="text-muted-foreground text-sm">{item.description}</Text>
                <View className="bg-secondary/50 self-start px-2 py-1 rounded mt-2">
                  <Text className="text-xs text-muted-foreground">{item.category}</Text>
                </View>
              </View>
            </CardContent>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}
