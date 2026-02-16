import React from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useApprovals, useApproveTask, useRejectTask } from '../../hooks/useApprovals';
import { ApprovalCard } from '../../components/approvals/ApprovalCard';
import { SwipeableRow } from '../../components/approvals/SwipeableRow';
import { Skeleton } from '../../components/ui/LoadingSkeleton';
import { CheckSquare, ShieldCheck } from 'lucide-react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function ApprovalsScreen() {
  const { data: tasks, isLoading, refetch, isRefetching } = useApprovals();
  const approveMutation = useApproveTask();
  const rejectMutation = useRejectTask();

  const onRefresh = React.useCallback(() => {
    refetch();
  }, [refetch]);

  const handleApprove = (id: string) => {
    approveMutation.mutate({ taskId: id });
  };

  const handleReject = (id: string) => {
    rejectMutation.mutate({ taskId: id });
  };

  if (isLoading) {
    return (
      <LinearGradient colors={['#030712', '#0f172a', '#030712']} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, padding: 24 }} edges={['top']}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#f1f5f9', marginBottom: 16 }}>Pending Approvals</Text>
          {[1, 2, 3].map((i) => (
            <View key={i} style={{ height: 120, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, marginBottom: 12 }} />
          ))}
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#030712', '#0f172a', '#030712']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 16 }} edges={['top']}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: '#f1f5f9' }}>Pending Approvals</Text>
            <Text style={{ color: '#64748b', marginTop: 4 }}>
              {tasks?.length || 0} tasks waiting for your review
            </Text>
          </View>

          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SwipeableRow
                onApprove={() => handleApprove(item.id)}
                onReject={() => handleReject(item.id)}
              >
                <ApprovalCard task={item} />
              </SwipeableRow>
            )}
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor="#3b82f6" />
            }
            ListEmptyComponent={
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
                <View style={{
                  backgroundColor: 'rgba(34,197,94,0.1)',
                  padding: 24, borderRadius: 999, marginBottom: 20,
                }}>
                  <ShieldCheck size={48} color="#22c55e" />
                </View>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#f1f5f9' }}>All caught up!</Text>
                <Text style={{ color: '#64748b', textAlign: 'center', paddingHorizontal: 32, marginTop: 8, lineHeight: 20 }}>
                  No pending approvals at the moment. Your AI agents are handling everything smoothly.
                </Text>
              </View>
            }
          />
        </GestureHandlerRootView>
      </SafeAreaView>
    </LinearGradient>
  );
}
