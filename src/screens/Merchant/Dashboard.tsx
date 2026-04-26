import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Image, Switch } from 'react-native';
import { 
  ShoppingBag, 
  TrendingUp, 
  Users, 
  Package, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ChevronRight, 
  Bell, 
  User, 
  ShieldCheck, 
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
  CreditCard
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useWalletStore } from '../../store/useWalletStore';
import { AppCard } from '../../components/ui/AppCard';
import { AppButton } from '../../components/ui/AppButton';

const MerchantDashboard = ({ navigation }: any) => {
  const { 
    merchantInventory,
    merchantEarnings, 
    isOnline, 
    toggleOnlineStatus, 
    toggleMerchantMode,
    userCountry,
    availableCountries
  } = useWalletStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const currentCountry = availableCountries.find(c => c.name === userCountry);
  const rate = currentCountry?.rate || 1;
  const currencySymbol = currentCountry?.currencySymbol || '$';
  const currencyCode = currentCountry?.currencyCode || 'USD';

  const localInventory = merchantInventory * rate;
  const localEarnings = merchantEarnings * rate;

  // Mock peer requests
  const peerRequests = [
    { id: '1', name: 'Kwame Osei', amount: 'A 500.00', type: 'Deposit', time: '2m ago', status: 'Action Required', priority: 'high' },
    { id: '2', name: 'Sarah Mensah', amount: 'A 1,200.00', type: 'Withdrawal', time: '15m ago', status: 'Pending Approval', priority: 'medium' },
    { id: '3', name: 'Abidjan Trader', amount: 'A 3,000.00', type: 'Deposit', time: '45m ago', status: 'Completed', priority: 'low' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <StatusBar barStyle="light-content" />
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20 }}
      >
        
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6 h-16 z-50">
          <View>
            <View className="flex-row items-center mb-1">
              <View className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-accent shadow-[0_0_8px_rgba(118,179,58,0.8)]' : 'bg-slate-500'}`} />
              <Text className="text-textSecondary text-[10px] uppercase font-bold tracking-widest">
                {isOnline ? 'Active & Receiving' : 'Offline / Private'}
              </Text>
            </View>
            <Text className="text-textPrimary text-xl font-bold">Merchant Hub</Text>
          </View>

          <View className="flex-row items-center">
            <TouchableOpacity className="mr-4 relative">
              <Bell color="#94A3B8" size={24} />
              <View className="absolute top-0 right-0 w-2 h-2 bg-orange rounded-full" />
            </TouchableOpacity>
            
            <View className="relative">
              <TouchableOpacity 
                onPress={() => setIsMenuOpen(!isMenuOpen)}
                className="w-10 h-10 rounded-full border border-slate-700 items-center justify-center bg-surface"
              >
                <User color={isMenuOpen ? "#76b33a" : "#94A3B8"} size={20} />
              </TouchableOpacity>

              {/* Profile Dropdown Menu */}
              {isMenuOpen && (
                <Animated.View 
                  entering={FadeInUp.duration(300).springify()}
                  exiting={FadeOutUp.duration(200)}
                  className="absolute right-0 top-12 w-56 border border-slate-100 rounded-[28px] p-5 shadow-2xl z-[100]"
                  style={{ backgroundColor: '#FFFFFF', opacity: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 15 }}
                >
                  <View className="mb-4 pb-4 border-b border-slate-50">
                    <Text className="text-slate-900 font-bold text-lg">Merchant Account</Text>
                    <Text className="text-accent text-[10px] font-bold uppercase tracking-widest mt-1">STAR RATING: 4.9 ★</Text>
                  </View>

                  <TouchableOpacity 
                    className="flex-row items-center py-2 mb-4"
                    onPress={() => {
                      setIsMenuOpen(false);
                      navigation.navigate('HomeStack' as any, { screen: 'MerchantPaymentSettings' });
                    }}
                  >
                    <CreditCard color="#64748B" size={16} />
                    <Text className="text-slate-600 text-sm font-bold ml-3">Payout Details</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    className="flex-row items-center py-2 mb-4"
                    onPress={() => {
                      setIsMenuOpen(false);
                      toggleMerchantMode();
                    }}
                  >
                    <Users color="#64748B" size={16} />
                    <Text className="text-slate-600 text-sm font-bold ml-3">User Mode</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    className="flex-row items-center py-3 bg-red-50 rounded-2xl px-4"
                    onPress={() => setIsMenuOpen(false)}
                  >
                    <LogOut color="#EF4444" size={16} />
                    <Text className="text-red-500 text-sm font-bold ml-3">Log Out</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          </View>
        </View>

        {/* Online Status Toggle Card */}
        <AppCard className="mb-6 flex-row items-center justify-between border-slate-800/50 py-4">
          <View className="flex-row items-center">
            <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${isOnline ? 'bg-accent/10' : 'bg-slate-800'}`}>
              <TrendingUp color={isOnline ? "#76b33a" : "#94A3B8"} size={24} />
            </View>
            <View>
              <Text className="text-textPrimary font-bold">Accepting Requests</Text>
              <Text className="text-textSecondary text-xs">Visible to local users</Text>
            </View>
          </View>
          <Switch 
            value={isOnline} 
            onValueChange={toggleOnlineStatus}
            trackColor={{ false: '#1E293B', true: '#76b33a' }}
            thumbColor="#FFFFFF"
          />
        </AppCard>

        {/* Main Merchant Card */}
        <AppCard variant="gradient" className="mb-8 overflow-hidden">
          <View className="flex-row justify-between items-start mb-6">
            <View>
              <Text className="text-accent text-[10px] font-bold tracking-[3px] uppercase mb-1">Liquidity Inventory</Text>
              <View className="flex-row items-baseline">
                <Text className="text-accent text-xl font-bold mr-1">A</Text>
                <Text className="text-textPrimary text-3xl font-bold">
                  {merchantInventory.toLocaleString()}
                </Text>
              </View>
              <Text className="text-white/60 text-[10px] font-medium italic mt-1">
                ≈ {currencySymbol}{localInventory.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currencyCode}
              </Text>
            </View>
            <View className="bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
              <Text className="text-white text-[10px] font-bold">TOP TIER</Text>
            </View>
          </View>

          <View className="space-y-4">
            <View>
              <View className="flex-row justify-between mb-1.5">
                <Text className="text-textSecondary text-[10px] font-bold uppercase">Stock Level</Text>
                <Text className="text-textPrimary text-[10px] font-bold">82%</Text>
              </View>
              <View className="h-1.5 bg-primary/40 rounded-full overflow-hidden">
                <View className="h-full bg-accent w-[82%]" />
              </View>
            </View>
            
            <View className="flex-row justify-between mt-4 border-t border-white/5 pt-4">
              <View>
                <Text className="text-textSecondary text-[10px] font-bold uppercase mb-1">Today's Profit</Text>
                <View className="flex-row items-baseline">
                  <Text className="text-accent font-bold text-lg">+A {merchantEarnings}</Text>
                  <Text className="text-accent/60 text-[10px] ml-2 italic">
                    ({currencySymbol}{localEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                  </Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-textSecondary text-[10px] font-bold uppercase mb-1">Rank</Text>
                <Text className="text-textPrimary font-bold text-lg">#14 Accra</Text>
              </View>
            </View>
          </View>
        </AppCard>

        <View className="flex-row flex-wrap justify-between mb-8">
          {[
            { icon: <Package color="#76b33a" size={20} />, label: 'Restock', action: () => navigation.navigate('MerchantRestock') },
            { icon: <RefreshCcw color="#eab308" size={20} />, label: 'Ongoing', action: () => navigation.navigate('MerchantOngoingTransactions') },
            { icon: <CreditCard color="#6366f1" size={20} />, label: 'Payouts', action: () => navigation.navigate('MerchantPaymentSettings') },
            { icon: <ShieldCheck color="#df7c27" size={20} />, label: 'KYC' },
          ].map((item, index) => (
            <TouchableOpacity 
              key={index} 
              onPress={item.action}
              activeOpacity={0.7}
              className="w-[22%] aspect-square bg-surface rounded-[24px] border border-card-border items-center justify-center mb-4"
            >
              <View className="mb-2">{item.icon}</View>
              <Text className="text-textSecondary text-[9px] font-bold uppercase">{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Peer Requests Section */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-textPrimary text-xl font-bold tracking-tight">Active Peer Requests</Text>
          <View className="bg-orange/20 px-2 py-1 rounded-md">
            <Text className="text-orange text-[10px] font-bold">2 NEW</Text>
          </View>
        </View>

        {peerRequests.map((req) => (
          <TouchableOpacity 
            key={req.id} 
            className="flex-row items-center bg-surface/40 p-5 rounded-[28px] mb-4 border border-card-border/30"
          >
            <View className={`w-14 h-14 rounded-2xl items-center justify-center mr-4 ${req.type === 'Withdrawal' ? 'bg-orange/10' : 'bg-accent/10'}`}>
              {req.type === 'Withdrawal' ? 
                <ArrowDownLeft color="#df7c27" size={24} /> : 
                <ArrowUpRight color="#76b33a" size={24} />
              }
            </View>
            <View className="flex-1">
              <View className="flex-row items-center mb-0.5">
                <Text className="text-textPrimary font-bold text-base mr-2">{req.name}</Text>
                {req.priority === 'high' && <AlertCircle color="#EF4444" size={12} />}
              </View>
              <View className="flex-row items-center">
                <Clock color="#94A3B8" size={10} className="mr-1" />
                <Text className="text-textSecondary text-[11px] font-medium">{req.time} • {req.type}</Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-textPrimary font-bold text-lg">{req.amount}</Text>
              <View className={`px-2 py-0.5 rounded-full mt-1 ${req.status === 'Completed' ? 'bg-accent/10' : 'bg-orange/10'}`}>
                 <Text className={`text-[9px] uppercase font-bold tracking-wider ${req.status === 'Completed' ? 'text-accent' : 'text-orange'}`}>
                  {req.status}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View className="h-24" />
      </ScrollView>

      {/* Action Footer */}
      <View className="absolute bottom-10 left-6 right-6">
        <AppButton 
          title="Fulfill Pending Orders"
          variant="accent"
          size="large"
          className="shadow-2xl shadow-accent/20"
          onPress={() => {}}
        />
      </View>
    </SafeAreaView>
  );
};

export default MerchantDashboard;
