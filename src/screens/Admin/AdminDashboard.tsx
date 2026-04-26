import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { 
  ShieldCheck, 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  Search, 
  Filter, 
  ChevronRight, 
  ArrowLeft, 
  Plus, 
  Minus,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Trash2,
  CreditCard,
  Settings,
  Globe,
  AlertTriangle,
  History,
  LayoutDashboard,
  LogOut,
  ChevronDown
} from 'lucide-react-native';
import { useWalletStore } from '../../store/useWalletStore';
import { AppCard } from '../../components/ui/AppCard';
import { AppButton } from '../../components/ui/AppButton';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AdminDashboard = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { fetchAllUsers, updateUserStatus, allocateCredits, systemSettings, updateGlobalSettings } = useWalletStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState<'users' | 'merchants' | 'circulation'>('users');
  const [creditAmount, setCreditAmount] = useState('');
  const [creditType, setCreditType] = useState<'balance' | 'inventory'>('balance');
  
  const [rates, setRates] = useState(systemSettings.exchangeRates);

  useEffect(() => {
    loadUsers();
    setRates(systemSettings.exchangeRates);
  }, [systemSettings]);

  const loadUsers = async () => {
    setLoading(true);
    const data = await fetchAllUsers();
    setUsers(data);
    setLoading(false);
  };

  const handleAllocate = async () => {
    const amount = parseFloat(creditAmount);
    if (isNaN(amount)) {
      Alert.alert('Error', 'Invalid amount');
      return;
    }
    try {
      await allocateCredits(selectedUser.id, amount, creditType);
      Alert.alert('Success', `Allocated A ${amount} to ${selectedUser.name}`);
      setIsModalOpen(false);
      setCreditAmount('');
      loadUsers();
    } catch (err) {
      Alert.alert('Error', 'Failed to allocate credits');
    }
  };

  const handleStatusUpdate = async (uid: string, status: string) => {
    try {
      await updateUserStatus(uid, { merchantStatus: status });
      Alert.alert('Success', `Merchant status updated to ${status}`);
      loadUsers();
    } catch (err) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleUpdateRates = async () => {
    try {
      await updateGlobalSettings({ exchangeRates: rates });
      Alert.alert('Success', 'Global exchange rates updated!');
      setIsSettingsOpen(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to update rates');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (
      (u.name || '').toLowerCase().includes(search.toLowerCase()) || 
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.aid || '').includes(search)
    );
    
    if (activeView === 'merchants') return matchesSearch && u.merchantStatus === 'approved';
    return matchesSearch;
  });

  const stats = {
    totalUsers: users.length,
    totalMerchants: users.filter(u => u.merchantStatus === 'approved').length,
    walletBalance: users.reduce((acc, u) => acc + (u.balance || 0), 0),
    inventoryBalance: users.reduce((acc, u) => acc + (u.merchantInventory || 0), 0),
  };
  
  const totalCirculation = stats.walletBalance + stats.inventoryBalance;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-primary items-center justify-center">
        <ActivityIndicator size="large" color="#76b33a" />
        <Text className="text-textSecondary mt-4">Loading Super Dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary">
      {/* Header */}
      <View style={{ paddingTop: insets.top + 10 }} className="px-6 pb-4 flex-row items-center justify-between">
        <TouchableOpacity 
          onPress={() => setIsModeMenuOpen(!isModeMenuOpen)} 
          className="flex-row items-center bg-yellow-500/10 px-4 py-2 rounded-2xl border border-yellow-500/20"
        >
          <ShieldCheck color="#eab308" size={16} />
          <Text className="text-yellow-500 font-bold ml-2 mr-1">Super Admin</Text>
          <ChevronDown color="#eab308" size={14} />
        </TouchableOpacity>
        
        {isModeMenuOpen && (
          <Animated.View 
            entering={FadeInUp}
            className="absolute top-[100%] left-6 bg-surface p-4 rounded-3xl border border-slate-800 z-50 shadow-2xl w-48"
          >
            <TouchableOpacity 
              onPress={() => {
                setIsModeMenuOpen(false);
                navigation.navigate('Dashboard');
              }}
              className="flex-row items-center p-3 rounded-xl hover:bg-primary"
            >
              <LayoutDashboard color="#94A3B8" size={16} />
              <Text className="text-textSecondary font-bold ml-3">User Mode</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setIsModeMenuOpen(false)}
              className="flex-row items-center p-3 mt-2 rounded-xl bg-accent/10"
            >
              <ShieldCheck color="#76b33a" size={16} />
              <Text className="text-accent font-bold ml-3">Admin Mode</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

          <TouchableOpacity onPress={() => setIsSettingsOpen(true)} className="w-10 h-10 rounded-full bg-surface items-center justify-center">
            <Settings color="#eab308" size={20} />
          </TouchableOpacity>
        </View>

        {/* Pending Actions Section */}
        <View className="mb-6">
          <Text className="text-textSecondary text-xs font-bold uppercase tracking-widest mb-4">Pending Approvals</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('AdminMerchantRequests')}
            className="bg-surface p-6 rounded-[32px] border border-slate-800 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-yellow-500/10 items-center justify-center mr-4">
                <ShoppingBag color="#eab308" size={24} />
              </View>
              <View>
                <Text className="text-textPrimary font-bold text-lg">Merchant Requests</Text>
                <Text className="text-textSecondary text-xs">Review and approve new applications</Text>
              </View>
            </View>
            <View className="bg-primary p-2 rounded-full">
              <ChevronRight color="#eab308" size={20} />
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View className="flex-row justify-between mb-8 mt-4">
          <TouchableOpacity 
            onPress={() => navigation.navigate('AdminDetailList', { type: 'users' })}
            className={`w-[31%] p-4 items-center rounded-3xl border ${activeView === 'users' ? 'bg-accent/10 border-accent' : 'bg-surface border-slate-800'}`}
          >
            <Users color={activeView === 'users' ? "#76b33a" : "#3b82f6"} size={20} />
            <Text className="text-textPrimary text-lg font-bold mt-2">{stats.totalUsers}</Text>
            <Text className="text-textSecondary text-[8px] uppercase font-bold">Users</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('AdminDetailList', { type: 'merchants' })}
            className={`w-[31%] p-4 items-center rounded-3xl border ${activeView === 'merchants' ? 'bg-accent/10 border-accent' : 'bg-surface border-slate-800'}`}
          >
            <ShoppingBag color="#76b33a" size={20} />
            <Text className="text-textPrimary text-lg font-bold mt-2">{stats.totalMerchants}</Text>
            <Text className="text-textSecondary text-[8px] uppercase font-bold">Merchants</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('AdminDetailList', { type: 'circulation' })}
            className={`w-[31%] p-4 items-center rounded-3xl border ${activeView === 'circulation' ? 'bg-accent/10 border-accent' : 'bg-surface border-slate-800'}`}
          >
            <CreditCard color={activeView === 'circulation' ? "#76b33a" : "#eab308"} size={20} />
            <Text className="text-textPrimary text-sm font-bold mt-2">A {Math.round(totalCirculation / 1000)}k</Text>
            <Text className="text-textSecondary text-[8px] uppercase font-bold">Circulation</Text>
          </TouchableOpacity>
        </View>

        {activeView === 'circulation' ? (
          <Animated.View entering={FadeIn} className="bg-surface p-8 rounded-[40px] border border-slate-800 mb-8">
            <Text className="text-textPrimary text-2xl font-bold mb-6">Financial Report</Text>
            <View className="space-y-4">
              <View className="flex-row justify-between items-center bg-primary/50 p-5 rounded-2xl">
                <View>
                  <Text className="text-textSecondary text-xs uppercase font-bold">User Wallet Total</Text>
                  <Text className="text-textPrimary text-xl font-bold mt-1">A {stats.walletBalance.toLocaleString()}</Text>
                </View>
                <TrendingUp color="#3b82f6" size={24} />
              </View>
              <View className="flex-row justify-between items-center bg-primary/50 p-5 rounded-2xl">
                <View>
                  <Text className="text-textSecondary text-xs uppercase font-bold">Merchant Inventory Total</Text>
                  <Text className="text-textPrimary text-xl font-bold mt-1">A {stats.inventoryBalance.toLocaleString()}</Text>
                </View>
                <ShoppingBag color="#76b33a" size={24} />
              </View>
              <View className="h-[1px] bg-slate-800 my-2" />
              <View className="flex-row justify-between items-center bg-accent/5 p-6 rounded-3xl border border-accent/20">
                <View>
                  <Text className="text-accent text-xs uppercase font-bold">Total A-Credits in Play</Text>
                  <Text className="text-textPrimary text-3xl font-bold mt-1">A {totalCirculation.toLocaleString()}</Text>
                </View>
                <ShieldCheck color="#76b33a" size={32} />
              </View>
            </View>
          </Animated.View>
        ) : (
          <>
            <View className="flex-row items-center bg-surface px-4 py-3 rounded-2xl border border-slate-800 mb-6">
              <Search color="#94A3B8" size={20} />
              <TextInput 
                className="flex-1 ml-3 text-textPrimary"
                placeholder={activeView === 'merchants' ? "Search merchants..." : "Search users..."}
                placeholderTextColor="#475569"
                value={search}
                onChangeText={setSearch}
              />
            </View>
            <Text className="text-textSecondary text-xs font-bold uppercase tracking-widest mb-4">
              {activeView === 'merchants' ? 'Approved Merchants' : 'Global User Directory'}
            </Text>
            {filteredUsers.map((user, index) => (
              <Animated.View key={user.id} entering={FadeInUp.delay(index * 50)}>
                <TouchableOpacity 
                  onPress={() => {
                    setSelectedUser(user);
                    setIsModalOpen(true);
                  }}
                  className="bg-surface/40 p-5 rounded-[28px] border border-slate-800/50 mb-4 flex-row items-center"
                >
                  <View className="w-12 h-12 rounded-2xl bg-slate-800 items-center justify-center mr-4">
                    <Text className="text-textPrimary font-bold">{user.name?.charAt(0) || 'U'}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-textPrimary font-bold text-base">{user.name || 'Unnamed User'}</Text>
                    <Text className="text-textSecondary text-[10px]">AID: {user.aid || '---'} • {user.country || 'N/A'}</Text>
                    <Text className="text-textSecondary text-[10px] mt-0.5">{user.phone || 'No Phone'}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-accent font-bold">A {user.balance?.toLocaleString() || 0}</Text>
                    <View className="flex-row mt-1">
                      {user.merchantStatus === 'approved' && (
                        <View className="bg-accent/10 px-2 py-0.5 rounded-full mr-1">
                          <Text className="text-accent text-[7px] font-bold uppercase">Merchant</Text>
                        </View>
                      )}
                      {user.isAdmin && (
                        <View className="bg-yellow-500/10 px-2 py-0.5 rounded-full">
                          <Text className="text-yellow-500 text-[7px] font-bold uppercase">Admin</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-textSecondary text-[8px] mt-1 italic">Inv: A {user.merchantInventory?.toLocaleString() || 0}</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </>
        )}
      </ScrollView>

      {/* User Management Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-primary rounded-t-[40px] p-8 min-h-[60%]">
            <View className="w-12 h-1 bg-slate-800 rounded-full self-center mb-8" />
            {selectedUser && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="items-center mb-8">
                  <View className="w-20 h-20 rounded-[30px] bg-slate-800 items-center justify-center mb-4">
                    <Text className="text-textPrimary text-3xl font-bold">{selectedUser.name?.charAt(0) || 'U'}</Text>
                  </View>
                  <Text className="text-textPrimary text-2xl font-bold">{selectedUser.name || 'Unnamed User'}</Text>
                  <Text className="text-textSecondary text-sm">{selectedUser.email}</Text>
                </View>

                <View className="flex-row justify-between mb-8">
                  <View className="bg-surface p-4 rounded-3xl border border-slate-800 w-[48%]">
                    <Text className="text-textSecondary text-[10px] font-bold uppercase mb-1">Wallet Balance</Text>
                    <Text className="text-textPrimary text-xl font-bold">A {selectedUser.balance?.toLocaleString() || 0}</Text>
                  </View>
                  <View className="bg-surface p-4 rounded-3xl border border-slate-800 w-[48%]">
                    <Text className="text-textSecondary text-[10px] font-bold uppercase mb-1">Inventory</Text>
                    <Text className="text-textPrimary text-xl font-bold">A {selectedUser.merchantInventory?.toLocaleString() || 0}</Text>
                  </View>
                </View>

                <Text className="text-textSecondary text-xs font-bold uppercase tracking-widest mb-4">Admin Actions</Text>
                <View className="flex-row flex-wrap justify-between">
                  {selectedUser.merchantStatus === 'approved' ? (
                    <TouchableOpacity 
                      onPress={() => handleStatusUpdate(selectedUser.id, 'none')}
                      className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20 w-[48%] mb-4 flex-row items-center"
                    >
                      <XCircle color="#EF4444" size={16} />
                      <Text className="text-red-500 font-bold ml-2">Revoke Merchant</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      onPress={() => handleStatusUpdate(selectedUser.id, 'approved')}
                      className="bg-accent/10 p-4 rounded-2xl border border-accent/20 w-[48%] mb-4 flex-row items-center"
                    >
                      <CheckCircle2 color="#76b33a" size={16} />
                      <Text className="text-accent font-bold ml-2">Approve Merchant</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity className="bg-surface p-4 rounded-2xl border border-slate-800 w-[48%] mb-4 flex-row items-center">
                    <History color="#94A3B8" size={16} />
                    <Text className="text-textSecondary font-bold ml-2">View Activity</Text>
                  </TouchableOpacity>
                </View>

                <View className="mt-4 bg-surface p-6 rounded-3xl border border-slate-800">
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-textPrimary font-bold">Allocate A-Credits</Text>
                    <View className="bg-yellow-500/10 px-2 py-1 rounded-lg">
                      <Text className="text-yellow-500 text-[10px] font-bold">TREASURY</Text>
                    </View>
                  </View>
                  <View className="flex-row items-center space-x-2 mb-4">
                    <TouchableOpacity 
                      onPress={() => setCreditType('balance')}
                      className={`flex-1 p-3 rounded-xl border ${creditType === 'balance' ? 'bg-accent/10 border-accent' : 'bg-primary border-slate-800'}`}
                    >
                      <Text className={`text-center font-bold ${creditType === 'balance' ? 'text-accent' : 'text-textSecondary'}`}>To Wallet</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => setCreditType('inventory')}
                      className={`flex-1 p-3 rounded-xl border ${creditType === 'inventory' ? 'bg-accent/10 border-accent' : 'bg-primary border-slate-800'}`}
                    >
                      <Text className={`text-center font-bold ${creditType === 'inventory' ? 'text-accent' : 'text-textSecondary'}`}>To Inventory</Text>
                    </TouchableOpacity>
                  </View>
                  <View className="flex-row items-center bg-primary px-4 py-3 rounded-xl border border-slate-800 mb-4">
                    <Text className="text-textPrimary font-bold mr-2">A</Text>
                    <TextInput 
                      className="flex-1 text-textPrimary"
                      placeholder="Amount"
                      placeholderTextColor="#475569"
                      keyboardType="numeric"
                      value={creditAmount}
                      onChangeText={setCreditAmount}
                    />
                  </View>
                  <AppButton title="Confirm Treasury Action" variant="accent" onPress={handleAllocate} />
                </View>

                <TouchableOpacity className="mt-6 flex-row items-center justify-center p-4 rounded-2xl bg-red-500/5 border border-red-500/10">
                  <Trash2 color="#EF4444" size={16} />
                  <Text className="text-red-500 font-bold ml-2">Delete Account</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setIsModalOpen(false)} className="mt-8 py-4 bg-slate-900 rounded-2xl">
                  <Text className="text-textSecondary text-center font-bold">Close Panel</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Global Settings Modal */}
      <Modal visible={isSettingsOpen} animationType="fade" transparent>
        <View className="flex-1 justify-center bg-black/80 px-6">
          <Animated.View entering={FadeInUp} className="bg-primary rounded-[40px] p-8 border border-slate-800">
            <View className="flex-row items-center mb-8">
              <Globe color="#eab308" size={24} />
              <Text className="text-textPrimary text-2xl font-bold ml-3">System Controls</Text>
            </View>
            <Text className="text-textSecondary text-xs font-bold uppercase tracking-widest mb-6">Exchange Rates (1 A = ...)</Text>
            {Object.keys(rates).map(country => (
              <View key={country} className="flex-row items-center mb-4 bg-surface p-4 rounded-2xl border border-slate-800">
                <Text className="text-textPrimary font-bold flex-1">{country}</Text>
                <TextInput 
                  className="bg-primary px-4 py-2 rounded-xl text-accent font-bold w-32 text-right"
                  keyboardType="numeric"
                  value={String(rates[country])}
                  onChangeText={(val) => setRates({...rates, [country]: parseFloat(val) || 0})}
                />
              </View>
            ))}
            <View className="mt-8 space-y-4">
              <AppButton title="Save Platform Rates" variant="accent" onPress={handleUpdateRates} />
              <TouchableOpacity onPress={() => setIsSettingsOpen(false)} className="py-4 rounded-2xl border border-slate-800">
                <Text className="text-textSecondary text-center font-bold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AdminDashboard;
