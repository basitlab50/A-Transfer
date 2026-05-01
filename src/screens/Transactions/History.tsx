import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { ArrowUpRight, ArrowDownLeft, Filter, Search, Clock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useWalletStore } from '../../store/useWalletStore';
import { AppCard } from '../../components/ui/AppCard';

const HistoryScreen = () => {
  const { transactions, merchantTransactions, isMerchantMode } = useWalletStore();
  const navigation = useNavigation<any>();

  const currentTransactions = isMerchantMode ? merchantTransactions : transactions;
  
  // Calculate stats based on mode
  const totalIn = currentTransactions
    .filter(tx => !(['withdraw', 'transfer', 'outbound', 'inventory_purchase'].includes(tx.type)))
    .reduce((acc, tx) => acc + (typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount.replace(/[^0-9.]/g, '')) || 0), 0);
    
  const totalOut = currentTransactions
    .filter(tx => (['withdraw', 'transfer', 'outbound', 'inventory_purchase'].includes(tx.type)))
    .reduce((acc, tx) => acc + (typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount.replace(/[^0-9.]/g, '')) || 0), 0);

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <StatusBar barStyle="light-content" />
      <View className="px-6 py-4 flex-1">
        
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-textPrimary text-3xl font-bold">Activity</Text>
            <Text className="text-textSecondary text-xs mt-1">{isMerchantMode ? 'Merchant Transaction History' : 'Personal Transaction History'}</Text>
          </View>
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
            <Text className="text-textSecondary text-[10px] uppercase font-bold mb-1 tracking-wider">{isMerchantMode ? 'Total Sales' : 'Total Received'}</Text>
            <Text className="text-accent font-bold text-lg">A {totalIn.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
          </AppCard>
          <AppCard className="flex-1 ml-2 p-4 border-slate-800">
            <Text className="text-textSecondary text-[10px] uppercase font-bold mb-1 tracking-wider">{isMerchantMode ? 'Inventory Cost' : 'Total Spent'}</Text>
            <Text className="text-textPrimary font-bold text-lg">A {totalOut.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
          </AppCard>
        </View>

        {/* Transactions List */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {currentTransactions.length === 0 ? (
            <View className="items-center py-20">
              <Clock color="#475569" size={48} />
              <Text className="text-textSecondary text-base mt-4">No activity found yet</Text>
            </View>
          ) : (
            currentTransactions.map((tx) => {
              const isOut = (['withdraw', 'transfer', 'outbound', 'inventory_purchase'].includes(tx.type));
              return (
                <TouchableOpacity 
                  key={tx.id} 
                  onPress={() => navigation.navigate('Receipt', { transaction: tx })}
                  className="flex-row items-center bg-surface p-4 rounded-2xl mb-3 border border-slate-800"
                >
                  <View className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${isOut ? 'bg-red-500/10' : 'bg-accent/10'}`}>
                    {isOut ? 
                      <ArrowUpRight color="#EF4444" size={20} /> : 
                      <ArrowDownLeft color="#10B981" size={20} />
                    }
                  </View>
                  <View className="flex-1">
                    <Text className="text-textPrimary font-semibold" numberOfLines={1}>{tx.name || (isOut ? 'Payment' : 'Deposit')}</Text>
                    <Text className="text-textSecondary text-[10px]">{tx.date || new Date(tx.timestamp).toLocaleDateString()}</Text>
                  </View>
                  <View className="items-end">
                    <Text className={`font-bold ${isOut ? 'text-textPrimary' : 'text-accent'}`}>
                      {isOut ? '-' : '+'} A {typeof tx.amount === 'number' ? tx.amount.toLocaleString() : tx.amount.replace(/[^0-9.,]/g, '')}
                    </Text>
                    <View className={`px-2 py-0.5 rounded-full mt-1 ${tx.status === 'In Escrow' ? 'bg-luxury/20' : 'bg-accent/20'}`}>
                      <Text className={`text-[8px] uppercase font-bold ${tx.status === 'In Escrow' ? 'text-luxury' : 'text-accent'}`}>
                        {tx.status}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
          <View className="h-10" />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default HistoryScreen;
