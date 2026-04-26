import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useWalletStore } from '../../store/useWalletStore';
import { ArrowLeft, Bell, CheckCircle2, XCircle, Info, ChevronRight, Clock } from 'lucide-react-native';
import { AppButton } from '../../components/ui/AppButton';

const Notifications = ({ navigation }: any) => {
  const { notifications, markNotificationAsRead } = useWalletStore();

  const handleRead = async (id: string) => {
    await markNotificationAsRead(id);
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffInMs = now.getTime() - then.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${diffInDays}d ago`;
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-1 px-6 pt-6">
        
        {/* Header */}
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            className="w-10 h-10 rounded-full bg-surface items-center justify-center"
          >
            <ArrowLeft color="#F8FAFC" size={20} />
          </TouchableOpacity>
          <Text className="text-textPrimary text-xl font-bold">Notifications</Text>
          <View className="w-10" />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {notifications.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <View className="w-20 h-20 rounded-full bg-surface items-center justify-center mb-6">
                <Bell color="#475569" size={32} />
              </View>
              <Text className="text-textPrimary text-lg font-bold">No Notifications yet</Text>
              <Text className="text-textSecondary text-center mt-2 px-10">
                When you get updates on your application or transfers, they'll appear here.
              </Text>
            </View>
          ) : (
            notifications.map((note) => (
              <TouchableOpacity 
                key={note.id}
                onPress={() => handleRead(note.id)}
                className={`p-5 rounded-[32px] border mb-4 flex-row items-start ${note.isRead ? 'bg-surface/30 border-slate-800' : 'bg-surface border-accent/30'}`}
              >
                <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${note.type === 'success' ? 'bg-green-500/10' : note.type === 'error' ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
                  {note.type === 'success' ? <CheckCircle2 color="#76b33a" size={24} /> : note.type === 'error' ? <XCircle color="#EF4444" size={24} /> : <Info color="#3B82F6" size={24} />}
                </View>
                
                <View className="flex-1">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className={`font-bold text-base ${note.isRead ? 'text-textSecondary' : 'text-textPrimary'}`}>{note.title}</Text>
                    {!note.isRead && <View className="w-2 h-2 rounded-full bg-accent" />}
                  </View>
                  <Text className={`text-sm leading-5 mb-2 ${note.isRead ? 'text-textSecondary/60' : 'text-textSecondary'}`}>{note.message}</Text>
                  <View className="flex-row items-center">
                    <Clock color="#475569" size={12} />
                    <Text className="text-textSecondary text-[10px] ml-1">{getTimeAgo(note.timestamp)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
          <View className="h-20" />
        </ScrollView>

      </View>
    </SafeAreaView>
  );
};

export default Notifications;
