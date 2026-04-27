import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Image, Alert } from 'react-native';
import { Wallet, ArrowUpRight, ArrowDownLeft, Landmark, User, History, Repeat, Bell, ShieldCheck, ChevronRight, LogOut, LayoutDashboard, ShoppingBag, Clock, RefreshCcw, XCircle } from 'lucide-react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useWalletStore } from '../../store/useWalletStore';
import { AppCard } from '../../components/ui/AppCard';
import { AppButton } from '../../components/ui/AppButton';
import { AppAlert } from '../../components/ui/AppAlert';
import { auth, db } from '../../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { DashboardNavigationProp } from '../../types/navigation';

interface Props {
  navigation: DashboardNavigationProp;
}

const Dashboard = ({ navigation }: Props) => {
  const { balance, userCountry, availableCountries, transactions, toggleMerchantMode, toggleAdminMode, isKYCVerified, userProfile, signOut, merchantStatus, isAdmin, activeTransaction, notifications, resetMerchantStatus } = useWalletStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  // Reset dismiss state whenever a NEW transaction appears
  React.useEffect(() => {
    if (activeTransaction?.id) {
      setIsBannerDismissed(false);
    }
  }, [activeTransaction?.id]);

  const handleLogout = () => {
    setIsMenuOpen(false);
    setLogoutVisible(true);
  };

  const currentCountry = availableCountries.find(c => c.name === userCountry);
  const localEquivalent = balance * (currentCountry?.rate || 1);
  const currencySymbol = currentCountry?.currencySymbol || '$';
  const currencyCode = currentCountry?.currencyCode || 'USD';

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <AppAlert 
        visible={logoutVisible}
        type="warning"
        title="Log Out"
        message="Are you sure you want to log out of your A-Transfer account?"
        confirmText="Yes, Log Out"
        cancelText="Stay Logged In"
        onConfirm={() => {
          setLogoutVisible(false);
          signOut();
        }}
        onCancel={() => setLogoutVisible(false)}
      />
      <StatusBar barStyle="light-content" />
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20 }}
      >
        
        {/* Header - Symmetrical Branding & Logo */}
        <View className="flex-row justify-between items-center mb-2 h-24 relative z-50">
          {/* Left: User Greet & Status */}
          <View className="flex-1">
            <TouchableOpacity 
              className="flex-row items-center mb-1"
              onPress={() => !isKYCVerified && navigation.navigate('IdentityVerification' as any)}
            >
              <ShieldCheck color={isKYCVerified ? "#76b33a" : "#94A3B8"} size={14} />
              <Text className={`${isKYCVerified ? 'text-accent' : 'text-textSecondary'} text-[10px] ml-1 uppercase font-bold tracking-widest`}>
                {isKYCVerified ? 'Verified User' : 'Unverified • Verify Now'}
              </Text>
            </TouchableOpacity>
            <Text className="text-textSecondary text-xs font-medium">Hello,</Text>
            <Text className="text-textPrimary text-xl font-bold tracking-tight">{userProfile?.name || 'User'}</Text>
            <Text className="text-textSecondary text-[8px] font-mono opacity-50">My AID: {userProfile?.aid || '...'}</Text>
            {isAdmin && (
              <View className="bg-accent/20 px-2 py-0.5 rounded-md mt-1 self-start">
                <Text className="text-accent text-[8px] font-bold uppercase">Super Admin</Text>
              </View>
            )}
          </View>

          {/* Middle: Brand Logo (Centered Absolutely) */}
          <View 
            className="absolute left-0 right-0 items-center justify-center pointer-events-none" 
            style={{ top: -10 }}
          >
            <View className="h-16 w-48 overflow-hidden">
              <Image 
                source={require('../../../assets/logo.png')} 
                className="w-64 h-24 -mt-4 -ml-8" 
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Right: Notifications & Profile */}
          <View className="flex-row items-center z-50">
            <TouchableOpacity 
              onPress={() => navigation.navigate('Notifications' as any)}
              className="mr-4 relative"
            >
              <Bell color="#94A3B8" size={24} />
              {notifications && notifications.some(n => !n.isRead) && (
                <View className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-primary items-center justify-center">
                  <Text className="text-[8px] text-white font-bold">
                    {notifications.filter(n => !n.isRead).length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <View className="relative">
              <TouchableOpacity 
                onPress={() => setIsMenuOpen(!isMenuOpen)}
                className="w-10 h-10 rounded-full border border-slate-700 items-center justify-center bg-surface overflow-hidden"
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
                    <Text className="text-slate-900 font-bold text-lg">{userProfile?.name || 'User'}</Text>
                    <Text className="text-accent text-[10px] font-bold uppercase tracking-widest mt-1">AID: {userProfile?.aid || '...'}</Text>
                  </View>

                  <TouchableOpacity 
                    className="flex-row items-center py-2 mb-4"
                    onPress={() => {
                      setIsMenuOpen(false);
                      navigation.navigate('Profile' as any);
                    }}
                  >
                    <User color="#64748B" size={16} />
                    <Text className="text-slate-600 text-sm font-medium ml-3">View Profile</Text>
                  </TouchableOpacity>

                  {(merchantStatus === 'none' || merchantStatus === 'declined') && (
                    <TouchableOpacity 
                      className="flex-row items-center py-2 mb-4"
                      onPress={() => {
                        setIsMenuOpen(false);
                        navigation.navigate('MerchantOnboarding');
                      }}
                    >
                      <ShoppingBag color="#64748B" size={16} />
                      <Text className="text-slate-600 text-sm font-bold ml-3">Be an A-Merchant</Text>
                    </TouchableOpacity>
                  )}

                  {merchantStatus === 'pending' && (
                    <View className="flex-row items-center py-2 mb-4 opacity-50">
                      <Clock color="#64748B" size={16} />
                      <Text className="text-slate-600 text-sm font-bold ml-3">App Pending...</Text>
                    </View>
                  )}

                  {merchantStatus === 'approved' && (
                    <TouchableOpacity 
                      className="flex-row items-center py-2 mb-4"
                      onPress={() => {
                        setIsMenuOpen(false);
                        toggleMerchantMode();
                      }}
                    >
                      <ShoppingBag color="#76b33a" size={16} />
                      <Text className="text-slate-600 text-sm font-bold ml-3">Merchant Hub</Text>
                    </TouchableOpacity>
                  )}

                  {isAdmin && (
                    <TouchableOpacity 
                      className="flex-row items-center py-2 mb-4"
                      onPress={() => {
                        setIsMenuOpen(false);
                        toggleAdminMode();
                      }}
                    >
                      <ShieldCheck color="#eab308" size={16} />
                      <Text className="text-slate-600 text-sm font-bold ml-3">Super Panel</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity 
                    className="flex-row items-center py-3 bg-red-50 rounded-2xl px-4"
                    onPress={handleLogout}
                  >
                    <LogOut color="#EF4444" size={16} />
                    <Text className="text-red-500 text-sm font-bold ml-3">Log Out</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          </View>
        </View>

        {/* The Branded A-Wallet Card */}
        <AppCard variant="gradient" className="mb-6 py-4 relative">
          {/* Brand Green to Orange Glow background logic handled by component variant if needed, 
              but adding a custom branded touch here */}
          <View className="absolute -right-16 -bottom-16 w-60 h-60 bg-accent/10 rounded-full blur-3xl opacity-50" />
          <View className="absolute -left-16 -top-16 w-60 h-60 bg-orange/10 rounded-full blur-3xl opacity-30" />

          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="bg-accent/20 p-2.5 rounded-xl mr-3">
                <Wallet color="#76b33a" size={20} />
              </View>
              <Text className="text-accent text-xs font-bold tracking-[3px] uppercase">A-wallet</Text>
            </View>
            <Text className="text-textSecondary/40 text-[10px] font-mono tracking-widest">PREMIUM ELITE</Text>
          </View>

          <View className="mb-6">
            <View className="flex-row items-baseline">
              <Text className="text-accent text-xl font-bold mr-2">A</Text>
              <Text className="text-textPrimary text-4xl font-bold tracking-tighter">
                {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <Text className="text-textSecondary text-xs mt-0.5 font-medium italic">
               ≈ {currencySymbol}{localEquivalent.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currencyCode}
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <AppButton 
              title="Deposit" 
              variant="accent" 
              className="flex-1 mr-2 border-accent/20"
              onPress={() => navigation.navigate('SelectCountry', { mode: 'deposit' })}
              icon={<ArrowUpRight color="#76b33a" size={18} />} 
              size="medium"
            />
            <AppButton 
              title="Withdraw" 
              variant="orange" 
              className="flex-1 ml-2 border-orange/20"
              onPress={() => navigation.navigate('SelectCountry', { mode: 'withdraw' })}
              icon={<ArrowDownLeft color="#df7c27" size={18} />} 
              size="medium"
            />
          </View>
        </AppCard>

        {/* Ongoing Transaction Tracker */}
        {activeTransaction && !isBannerDismissed && (
          <Animated.View entering={FadeInUp} className="mb-6">
            <TouchableOpacity 
              onPress={() => navigation.navigate('TransactionStatus', { transactionId: activeTransaction.id })}
              className="bg-orange/10 p-5 rounded-[28px] border border-orange/20 flex-row items-center"
            >
              <View className="w-12 h-12 rounded-2xl bg-orange/20 items-center justify-center mr-4">
                <RefreshCcw color="#df7c27" size={24} />
              </View>
              <View className="flex-1">
                <Text className="text-orange font-bold text-base">Ongoing Transaction</Text>
                <Text className="text-textSecondary text-[8px] font-mono mb-1">ID: {activeTransaction.id}</Text>
                <Text className="text-textSecondary text-[10px] uppercase font-bold tracking-widest">
                  {activeTransaction.type === 'withdraw' 
                    ? (activeTransaction.status === 'merchant_paid' ? '🔥 PAID - CONFIRM NOW' : '⏳ WAITING FOR MERCHANT')
                    : '⏳ WAITING FOR APPROVAL'}
                </Text>
              </View>
              <View className="bg-orange/20 px-3 py-1 rounded-full flex-row items-center">
                <Text className="text-orange font-bold text-xs mr-2">View</Text>
                <TouchableOpacity 
                  onPress={(e) => {
                    e.stopPropagation();
                    setIsBannerDismissed(true);
                    // ARCHIVE LOCALLY & REMOTELY
                    if (activeTransaction?.id) {
                      updateDoc(doc(db, 'ongoing_transactions', activeTransaction.id), { status: 'archived' }).catch(() => {});
                      useWalletStore.setState({ activeTransaction: null });
                    }
                  }}
                  className="bg-orange/30 p-1 rounded-full"
                >
                  <XCircle color="#df7c27" size={14} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Merchant Application Tracker */}
        {merchantStatus === 'pending' && (
          <Animated.View entering={FadeInUp} className="mb-6">
            <View className="bg-accent/10 p-5 rounded-[28px] border border-accent/20 flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-accent/20 items-center justify-center mr-4">
                <ShieldCheck color="#76b33a" size={24} />
              </View>
              <View className="flex-1">
                <Text className="text-accent font-bold text-base">Merchant Review</Text>
                <Text className="text-textSecondary text-[10px] mt-1">Your A-Merchant application is currently being reviewed by our team.</Text>
                <View className="flex-row items-center mt-2">
                  <Clock color="#76b33a" size={12} />
                  <Text className="text-accent text-[9px] font-bold uppercase ml-1">Status: Pending Verification</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {merchantStatus === 'declined' && (
          <Animated.View entering={FadeInUp} className="mb-6">
            <View className="bg-red-500/10 p-5 rounded-[28px] border border-red-500/20 flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-red-500/20 items-center justify-center mr-4">
                <XCircle color="#EF4444" size={24} />
              </View>
              <View className="flex-1">
                <Text className="text-red-500 font-bold text-base">Application Declined</Text>
                <Text className="text-textSecondary text-[10px] mt-1">Unfortunately, your merchant application was not approved. Check your notifications for details.</Text>
                <TouchableOpacity 
                  onPress={() => resetMerchantStatus()}
                  className="bg-red-500/20 self-start px-4 py-2 rounded-xl mt-3"
                >
                  <Text className="text-red-500 font-bold text-[10px] uppercase">Close & Reapply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Quick Transfer - Branded for Success (Green) */}
        <View className="items-center mb-10">
          <AppButton 
            title="Quick Transfer" 
            variant="accent" 
            className="px-12 py-4 shadow-xl shadow-accent/10 rounded-[24px]" 
            textClassName="text-lg"
            icon={<Repeat color="#76b33a" size={20} />}
            onPress={() => navigation.navigate('SelectCountry', { mode: 'transfer' })}
          />
        </View>

        {/* Branded Services Section */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-textPrimary text-xl font-bold tracking-tight">Financial Services</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6 mb-10">
          {[
            { icon: <ArrowDownLeft color="#df7c27" size={22} />, label: 'Request', action: () => navigation.navigate('RequestFunds' as any) },
            { icon: <ArrowUpRight color="#76b33a" size={22} />, label: 'Send', action: () => navigation.navigate('SelectCountry', { mode: 'transfer' }) },
            { icon: <History color="#94a3b8" size={22} />, label: 'History', action: () => (navigation as any).navigate('History') },
            { icon: <ShieldCheck color="#76b33a" size={22} />, label: 'Safety' },
          ].map((item, index) => (
            <View key={index} className="mr-6 items-center">
              <TouchableOpacity 
                onPress={item.action}
                className="bg-surface w-16 h-16 rounded-[24px] border border-card-border items-center justify-center mb-3"
              >
                {item.icon}
              </TouchableOpacity>
              <Text className="text-textSecondary text-[11px] font-bold uppercase tracking-wider">{item.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Transaction Feed */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-textPrimary text-xl font-bold tracking-tight">Recent Activity</Text>
          <TouchableOpacity className="flex-row items-center">
            <Text className="text-accent text-sm font-bold mr-1">Activity Log</Text>
            <ChevronRight color="#76b33a" size={16} />
          </TouchableOpacity>
        </View>

        {transactions.slice(0, 3).map((tx) => {
          const isOutbound = ['withdraw', 'transfer', 'outbound'].includes(tx.type);
          return (
            <TouchableOpacity 
              key={tx.id} 
              onPress={() => navigation.navigate('Receipt', { transaction: tx })}
              className="flex-row items-center bg-surface/40 p-5 rounded-[28px] mb-4 border border-card-border/30"
            >
              <View className={`w-14 h-14 rounded-2xl items-center justify-center mr-4 ${isOutbound ? 'bg-red-500/10' : 'bg-accent/10'}`}>
                {isOutbound ? 
                  <ArrowUpRight color="#EF4444" size={24} /> : 
                  <ArrowDownLeft color="#76b33a" size={24} />
                }
              </View>
              <View className="flex-1">
                <Text className="text-textPrimary font-bold text-[15px] mb-0.5" numberOfLines={1}>{tx.name || (isOutbound ? 'Withdrawal' : 'Deposit')}</Text>
                <Text className="text-textSecondary text-xs font-medium">{tx.date || new Date(tx.timestamp).toLocaleDateString()}</Text>
              </View>
              <View className="items-end">
                <Text className={`font-bold text-lg ${isOutbound ? 'text-textPrimary' : 'text-accent'}`}>
                  {typeof tx.amount === 'number' ? `A ${tx.amount.toLocaleString()}` : tx.amount}
                </Text>
                <View className={`px-2 py-0.5 rounded-full mt-1 ${tx.status === 'In Escrow' ? 'bg-orange/10' : 'bg-accent/10'}`}>
                   <Text className={`text-[9px] uppercase font-bold tracking-wider ${tx.status === 'In Escrow' ? 'text-orange' : 'text-accent'}`}>
                    {tx.status}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Dashboard;
