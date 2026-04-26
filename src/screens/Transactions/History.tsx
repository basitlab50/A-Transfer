import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { ArrowUpRight, ArrowDownLeft, Filter, Search } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useWalletStore } from '../../store/useWalletStore';
import { AppCard } from '../../components/ui/AppCard';

const HistoryScreen = () => {
  const { transactions } = useWalletStore();
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <StatusBar barStyle="light-content" />
      <View className="px-6 py-4 flex-1">
        
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-textPrimary text-3xl font-bold">Activity</Text>
          <View className="flex-row">
            <TouchableOpacity className="bg-surface p-3 rounded-xl border border-slate-700 mr-2">
              <Search color="#94A3B8" size={20} />
            </TouchableOpacity>
            <TouchableOpacity className="bg-surface p-3 rounded-xl border border-slate-700">
              <Filter color="#94A3B8" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats */}
        <View className="flex-row justify-between mb-8">
          <AppCard className="flex-1 mr-2 p-4 border-slate-800">
            <Text className="text-textSecondary text-xs mb-1">Total Sent</Text>
            <Text className="text-textPrimary font-bold text-lg">A 250.00</Text>
          </AppCard>
          <AppCard className="flex-1 ml-2 p-4 border-slate-800">
            <Text className="text-textSecondary text-xs mb-1">Total Received</Text>
            <Text className="text-accent font-bold text-lg">A 1,500.00</Text>
          </AppCard>
        </View>

        {/* Transactions List */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {transactions.map((tx) => (
            <TouchableOpacity 
              key={tx.id} 
              onPress={() => navigation.navigate('Receipt', { transaction: tx })}
              className="flex-row items-center bg-surface p-4 rounded-2xl mb-3 border border-slate-800"
            >
              <View className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${(['withdraw', 'transfer', 'outbound'].includes(tx.type)) ? 'bg-red-500/10' : 'bg-accent/10'}`}>
                {(['withdraw', 'transfer', 'outbound'].includes(tx.type)) ? 
                  <ArrowUpRight color="#EF4444" size={20} /> : 
                  <ArrowDownLeft color="#10B981" size={20} />
                }
              </View>
              <View className="flex-1">
                <Text className="text-textPrimary font-semibold">{tx.name}</Text>
                <Text className="text-textSecondary text-xs">{tx.date}</Text>
              </View>
              <View className="items-end">
                <Text className={`font-bold ${(['withdraw', 'transfer', 'outbound'].includes(tx.type)) ? 'text-textPrimary' : 'text-accent'}`}>
                  {typeof tx.amount === 'number' ? `A ${tx.amount.toLocaleString()}` : tx.amount}
                </Text>
                <View className={`px-2 py-0.5 rounded-full mt-1 ${tx.status === 'In Escrow' ? 'bg-luxury/20' : 'bg-accent/20'}`}>
                  <Text className={`text-[8px] uppercase font-bold ${tx.status === 'In Escrow' ? 'text-luxury' : 'text-accent'}`}>
                    {tx.status}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          <View className="h-10" />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default HistoryScreen;
