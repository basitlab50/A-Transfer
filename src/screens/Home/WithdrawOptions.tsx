import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Send, Landmark, ChevronRight, CornerDownRight, ArrowRightLeft } from 'lucide-react-native';
import { AppCard } from '../../components/ui/AppCard';
import { WithdrawOptionsNavigationProp } from '../../types/navigation';

interface Props {
  navigation: WithdrawOptionsNavigationProp;
}

const WithdrawOptions = ({ navigation }: Props) => {
  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScrollView className="flex-1 px-6 pt-6">
        <Text className="text-textSecondary text-sm font-medium mb-2 uppercase tracking-widest">Payout Methods</Text>
        <Text className="text-textPrimary text-3xl font-bold mb-8 tracking-tight">How would you like to receive funds?</Text>

        {/* Option 1: Internal Transfer */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('InternalTransfer')}
          activeOpacity={0.8}
          className="mb-6"
        >
          <AppCard className="flex-row items-center p-6 border-accent/20">
            <View className="bg-accent/10 p-4 rounded-2xl mr-5">
              <Send color="#76b33a" size={28} />
            </View>
            <View className="flex-1">
              <Text className="text-textPrimary text-lg font-bold mb-1">Transfer to AT Account</Text>
              <Text className="text-textSecondary text-xs leading-5">Send instantly to any A-Transfer user using their AID #.</Text>
            </View>
            <ChevronRight color="#94A3B8" size={20} />
          </AppCard>
        </TouchableOpacity>

        {/* Option 2: Merchant Payout */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('SelectCountry')}
          activeOpacity={0.8}
        >
          <AppCard className="flex-row items-center p-6 border-orange/20">
            <View className="bg-orange/10 p-4 rounded-2xl mr-5">
              <Landmark color="#df7c27" size={28} />
            </View>
            <View className="flex-1">
              <Text className="text-textPrimary text-lg font-bold mb-1">Withdraw to A-Merchant</Text>
              <Text className="text-textSecondary text-xs leading-5">Cash out locally via our trusted network of merchants.</Text>
            </View>
            <ChevronRight color="#94A3B8" size={20} />
          </AppCard>
        </TouchableOpacity>

        <View className="mt-12 bg-surface/30 p-6 rounded-[32px] border border-card-border/50">
          <View className="flex-row items-center mb-4">
            <ArrowRightLeft color="#76b33a" size={18} />
            <Text className="text-textPrimary font-bold ml-2">Eco-Transfer System</Text>
          </View>
          <Text className="text-textSecondary text-xs leading-5 italic">
            All internal transfers between AT accounts are processed through our secure escrow system with zero fees for premium members.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WithdrawOptions;
