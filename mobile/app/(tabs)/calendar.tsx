import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Calendar from 'expo-calendar';
import { Card, CardContent } from '../../components/ui/Card';
import { Calendar as CalendarIcon, Clock } from 'lucide-react-native';

interface Event {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  location?: string;
}

export default function CalendarScreen() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const calendarIds = calendars.map(c => c.id);
        
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 7); // Next 7 days

        const upcomingEvents = await Calendar.getEventsAsync(calendarIds, startDate, endDate);
        
        setEvents(upcomingEvents.map(e => ({
          id: e.id,
          title: e.title,
          startDate: new Date(e.startDate),
          endDate: new Date(e.endDate),
          location: e.location || undefined
        })).sort((a, b) => a.startDate.getTime() - b.startDate.getTime()));
      } else {
        Alert.alert('Permission needed', 'Calendar access is required to show your schedule.');
      }
    })();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background p-4">
      <View className="flex-row items-center mb-6">
        <CalendarIcon size={32} color="#fff" />
        <Text className="text-3xl font-bold text-foreground ml-3">Schedule</Text>
      </View>

      <Text className="text-lg font-semibold text-muted-foreground mb-4">Next 7 Days</Text>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card className="mb-3 border-l-4 border-l-primary">
            <CardContent className="p-4">
              <Text className="text-lg font-bold text-foreground">{item.title}</Text>
              <View className="flex-row items-center mt-2">
                <Clock size={14} color="#94A3B8" />
                <Text className="text-muted-foreground text-sm ml-2">
                  {item.startDate.toLocaleDateString()} • {item.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              {item.location && (
                <Text className="text-xs text-muted-foreground mt-1">{item.location}</Text>
              )}
            </CardContent>
          </Card>
        )}
        ListEmptyComponent={
          <Text className="text-center text-muted-foreground mt-10">No upcoming events found.</Text>
        }
      />
    </SafeAreaView>
  );
}
