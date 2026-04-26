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
  ChevronDown,
  User
} from 'lucide-react-native';
import { useWalletStore } from '../../store/useWalletStore';
import { AppCard } from '../../components/ui/AppCard';
import { AppButton } from '../../components/ui/AppButton';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AdminDashboard = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { fetchAllUsers, updateUserStatus, allocateCredits, systemSettings, updateGlobalSettings, toggleAdminMode } = useWalletStore();
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
  
  const [rates, setRates] = useState(systemSettings?.exchangeRates || {});
  const [mBuyRate, setMBuyRate] = useState(systemSettings?.merchantBuyRate || 0);
  const [mSellRange, setMSellRange] = useState(systemSettings?.merchantSellRange || { min: 0, max: 0 });

  useEffect(() => {
    loadUsers();
    if (systemSettings) {
      setRates(systemSettings.exchangeRates || {});
      setMBuyRate(systemSettings.merchantBuyRate || 0);
      setMSellRange(systemSettings.merchantSellRange || { min: 0, max: 0 });
    }
  }, [systemSettings]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchAllUsers();
      setUsers(data || []);
    } catch (e) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
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
      await updateGlobalSettings({ 
        exchangeRates: rates,
        merchantBuyRate: mBuyRate,
        merchantSellRange: mSellRange
      });
      Alert.alert('Success', 'Global settings updated!');
      setIsSettingsOpen(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to update settings');
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
          <View 
            style={{ position: 'absolute', top: '100%', left: 24, backgroundColor: '#112240', padding: 15, borderRadius: 24, borderWidth: 1, borderColor: '#1E293B', zIndex: 50, width: 192, elevation: 20 }}
          >
            <TouchableOpacity 
              onPress={() => {
                setIsModeMenuOpen(false);
                toggleAdminMode();
              }}
              style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12 }}
            >
              <User color="#94A3B8" size={16} />
              <Text style={{ color: '#94A3B8', fontWeight: 'bold', marginLeft: 12 }}>User Mode</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setIsModeMenuOpen(false)}
              style={{ flexDirection: 'row', alignItems: 'center', padding: 12, marginTop: 8, borderRadius: 12, backgroundColor: 'rgba(118, 179, 58, 0.1)' }}
            >
              <ShieldCheck color="#76b33a" size={16} />
              <Text style={{ color: '#76b33a', fontWeight: 'bold', marginLeft: 12 }}>Admin Mode</Text>
            </TouchableOpacity>
          </View>
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
          <View style={{ backgroundColor: '#112240', padding: 30, borderRadius: 40, borderWidth: 1, borderColor: '#1E293B', marginBottom: 30 }}>
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
          </View>
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
            {filteredUsers.map((user) => (
              <View key={user.id}>
                <TouchableOpacity 
                  onPress={() => {
                    setSelectedUser(user);
                    setIsModalOpen(true);
                  }}
                  style={{ backgroundColor: 'rgba(17, 34, 64, 0.4)', padding: 20, borderRadius: 28, borderWidth: 1, borderColor: 'rgba(30, 41, 59, 0.5)', marginBottom: 15, flexDirection: 'row', alignItems: 'center' }}
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
              </View>
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
      <Modal visible={isSettingsOpen} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 20 }}>
          <View style={{ backgroundColor: '#0A192F', borderRadius: 40, padding: 30, borderWidth: 1, borderColor: '#1E293B' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 30 }}>
              <Globe color="#eab308" size={24} />
              <Text style={{ color: '#F8FAFC', fontSize: 24, fontWeight: 'bold', marginLeft: 15 }}>System Controls</Text>
            </View>
            
            <ScrollView style={{ maxHeight: 400 }}>
              <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1 }}>User Exchange Rates (1 A = ...)</Text>
              {rates && Object.keys(rates).map(country => (
                <View key={country} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15, backgroundColor: '#112240', padding: 15, borderRadius: 20, borderWidth: 1, borderColor: '#1E293B' }}>
                  <Text style={{ color: '#F8FAFC', fontWeight: 'bold', flex: 1 }}>{country}</Text>
                  <TextInput 
                    style={{ backgroundColor: '#0A192F', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12, color: '#76b33a', fontWeight: 'bold', width: 120, textAlign: 'right' }}
                    keyboardType="numeric"
                    value={String(rates[country])}
                    onChangeText={(val) => setRates({...rates, [country]: parseFloat(val) || 0})}
                  />
                </View>
              ))}

              <View style={{ height: 1, backgroundColor: '#1E293B', marginVertical: 20 }} />

              <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1 }}>Merchant Purchase Price</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15, backgroundColor: '#112240', padding: 15, borderRadius: 20, borderWidth: 1, borderColor: '#1E293B' }}>
                <Text style={{ color: '#F8FAFC', fontWeight: 'bold', flex: 1 }}>Buy A-Credit Rate</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A192F', paddingHorizontal: 12, borderRadius: 12, width: 120 }}>
                  <Text style={{ color: '#eab308', fontWeight: 'bold' }}>$</Text>
                  <TextInput 
                    style={{ flex: 1, paddingVertical: 8, color: '#eab308', fontWeight: 'bold', textAlign: 'right' }}
                    keyboardType="numeric"
                    value={String(mBuyRate)}
                    onChangeText={(val) => setMBuyRate(parseFloat(val) || 0)}
                  />
                </View>
              </View>

              <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginVertical: 15, letterSpacing: 1 }}>Global Merchant Sell Range</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ width: '48%', backgroundColor: '#112240', padding: 15, borderRadius: 20, borderWidth: 1, borderColor: '#1E293B' }}>
                  <Text style={{ color: '#94A3B8', fontSize: 9, marginBottom: 5 }}>MIN RATE</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 16 }}>$</Text>
                    <TextInput 
                      style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 16, flex: 1, marginLeft: 2 }}
                      keyboardType="numeric"
                      value={String(mSellRange.min)}
                      onChangeText={(val) => setMSellRange({...mSellRange, min: parseFloat(val) || 0})}
                    />
                  </View>
                </View>
                <View style={{ width: '48%', backgroundColor: '#112240', padding: 15, borderRadius: 20, borderWidth: 1, borderColor: '#1E293B' }}>
                  <Text style={{ color: '#94A3B8', fontSize: 9, marginBottom: 5 }}>MAX RATE</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: '#76b33a', fontWeight: 'bold', fontSize: 16 }}>$</Text>
                    <TextInput 
                      style={{ color: '#76b33a', fontWeight: 'bold', fontSize: 16, flex: 1, marginLeft: 2 }}
                      keyboardType="numeric"
                      value={String(mSellRange.max)}
                      onChangeText={(val) => setMSellRange({...mSellRange, max: parseFloat(val) || 0})}
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={{ marginTop: 30 }}>
              <AppButton title="Save Platform Rates" variant="accent" onPress={handleUpdateRates} />
              <TouchableOpacity onPress={() => setIsSettingsOpen(false)} style={{ marginTop: 15, paddingVertical: 15, borderRadius: 20, borderWidth: 1, borderColor: '#1E293B' }}>
                <Text style={{ color: '#94A3B8', textAlign: 'center', fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AdminDashboard;
