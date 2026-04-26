import React, { useState } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Landmark, Smartphone, ArrowLeft, CheckCircle2, Trash2, Plus, CreditCard, ChevronRight } from 'lucide-react-native';
import { useWalletStore } from '../../store/useWalletStore';
import { AppButton } from '../../components/ui/AppButton';
import Animated, { FadeInUp } from 'react-native-reanimated';

const MerchantPaymentSettings = ({ navigation }: any) => {
  const { userProfile, updatePaymentDetails, availableCountries } = useWalletStore();
  const [method, setMethod] = useState<'bank' | 'momo' | null>(null);

  const myCountry = availableCountries.find(c => c.name === userProfile?.country);
  const availableNetworks = myCountry?.momoNetworks || ['Other'];
  const [showNetworkPicker, setShowNetworkPicker] = useState(false);
  
  // Current saved details
  const savedDetails = userProfile?.paymentDetails;
  const hasSavedDetails = savedDetails && savedDetails.type;

  // Bank States
  const [bankName, setBankName] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [accountName, setAccountName] = useState('');

  // Momo States
  const [momoNumber, setMomoNumber] = useState('');
  const [momoProvider, setMomoProvider] = useState('');
  const [momoName, setMomoName] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!method) return;

    setLoading(true);
    try {
      const details = method === 'bank' 
        ? { type: 'bank', bankName, accountNo, accountName }
        : { type: 'momo', momoNumber, momoProvider, momoName };

      await updatePaymentDetails(details);
      Alert.alert('Success', 'Payout method updated.');
      setMethod(null); // Reset form
      setBankName(''); setAccountNo(''); setAccountName('');
      setMomoNumber(''); setMomoProvider(''); setMomoName('');
    } catch (err) {
      Alert.alert('Error', 'Failed to save payout details.');
    } finally {
      setLoading(false);
    }
  };

  const renderSavedMethod = () => (
    <Animated.View entering={FadeInUp} className="mb-10">
      <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-widest mb-4 ml-1">Available Payout Method</Text>
      <View className="bg-accent/5 p-6 rounded-[32px] border border-accent/20 flex-row items-center">
        <View className="w-12 h-12 rounded-2xl bg-accent/10 items-center justify-center mr-4">
          {savedDetails.type === 'bank' ? <Landmark color="#76b33a" size={24} /> : <Smartphone color="#76b33a" size={24} />}
        </View>
        <View className="flex-1">
          <Text className="text-textPrimary font-bold text-lg">
            {savedDetails.type === 'bank' ? savedDetails.bankName : savedDetails.momoProvider}
          </Text>
          <Text className="text-textSecondary text-xs">
            {savedDetails.type === 'bank' ? savedDetails.accountNo : savedDetails.momoNumber}
          </Text>
          <Text className="text-textSecondary text-[10px] uppercase font-bold mt-1 opacity-60">
            {savedDetails.type === 'bank' ? savedDetails.accountName : savedDetails.momoName}
          </Text>
        </View>
        <CheckCircle2 color="#76b33a" size={24} />
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1 px-6 pt-6">
          <View className="flex-row items-center mb-8">
            <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 rounded-full bg-surface items-center justify-center mr-4">
              <ArrowLeft color="#F8FAFC" size={20} />
            </TouchableOpacity>
            <Text className="text-textPrimary text-xl font-bold">Payout Settings</Text>
          </View>

          {hasSavedDetails ? renderSavedMethod() : (
            <View className="bg-surface/30 p-6 rounded-3xl border border-dashed border-slate-800 mb-8 items-center">
              <Text className="text-textSecondary text-[10px] uppercase font-bold italic tracking-widest">No Active Payout Method</Text>
              <Text className="text-textSecondary text-[10px] mt-1">Please set up your details below.</Text>
            </View>
          )}

          <View className="mb-4">
            <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-widest mb-1 ml-1">
              {hasSavedDetails ? 'Add Different Payment Method' : 'Setup Payout Method'}
            </Text>
            <Text className="text-textSecondary text-xs mb-6 ml-1">Choose how you want to receive local currency from customers.</Text>
          </View>
          
          <View className="flex-row justify-between mb-8">
            <TouchableOpacity 
              onPress={() => setMethod('bank')}
              className={`w-[48%] p-6 rounded-3xl border ${method === 'bank' ? 'bg-accent/10 border-accent' : 'bg-surface border-slate-800'}`}
            >
              <Landmark color={method === 'bank' ? '#76b33a' : '#94A3B8'} size={24} />
              <Text className={`font-bold mt-4 ${method === 'bank' ? 'text-accent' : 'text-textPrimary'}`}>Bank</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setMethod('momo')}
              className={`w-[48%] p-6 rounded-3xl border ${method === 'momo' ? 'bg-accent/10 border-accent' : 'bg-surface border-slate-800'}`}
            >
              <Smartphone color={method === 'momo' ? '#76b33a' : '#94A3B8'} size={24} />
              <Text className={`font-bold mt-4 ${method === 'momo' ? 'text-accent' : 'text-textPrimary'}`}>Momo</Text>
            </TouchableOpacity>
          </View>

          {method === 'bank' && (
            <Animated.View entering={FadeInUp} className="space-y-6">
              <View>
                <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-widest mb-2 ml-1">Bank Name</Text>
                <View className="bg-surface p-4 rounded-2xl border border-slate-800">
                  <TextInput className="text-textPrimary font-semibold" placeholder="e.g. Absa Bank" placeholderTextColor="#475569" value={bankName} onChangeText={setBankName} />
                </View>
              </View>
              <View>
                <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-widest mb-2 ml-1">Account Number</Text>
                <View className="bg-surface p-4 rounded-2xl border border-slate-800">
                  <TextInput className="text-textPrimary font-semibold" placeholder="0000 0000 0000" placeholderTextColor="#475569" keyboardType="numeric" value={accountNo} onChangeText={(t) => setAccountNo(t.replace(/[^0-9]/g, ''))} />
                </View>
              </View>
              <View>
                <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-widest mb-2 ml-1">Account Name</Text>
                <View className="bg-surface p-4 rounded-2xl border border-slate-800">
                  <TextInput className="text-textPrimary font-semibold" placeholder="Full Name" placeholderTextColor="#475569" value={accountName} onChangeText={setAccountName} />
                </View>
              </View>
            </Animated.View>
          )}

          {method === 'momo' && (
            <Animated.View entering={FadeInUp} className="space-y-6">
              <View>
                <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-widest mb-2 ml-1">Provider</Text>
                <TouchableOpacity 
                  onPress={() => setShowNetworkPicker(!showNetworkPicker)}
                  className="bg-surface p-4 rounded-2xl border border-slate-800 flex-row justify-between items-center"
                >
                  <Text className={momoProvider ? "text-textPrimary font-semibold" : "text-slate-600 font-semibold"}>
                    {momoProvider || "Select Network"}
                  </Text>
                  <ChevronRight color="#64748B" size={16} style={{ transform: [{ rotate: showNetworkPicker ? '90deg' : '0deg' }] }} />
                </TouchableOpacity>
                
                {showNetworkPicker && (
                  <View className="mt-2 bg-surface border border-slate-800 rounded-2xl overflow-hidden">
                    {availableNetworks.map((network) => (
                      <TouchableOpacity 
                        key={network}
                        onPress={() => {
                          setMomoProvider(network);
                          setShowNetworkPicker(false);
                        }}
                        className="p-4 border-b border-slate-800 last:border-b-0 active:bg-accent/10"
                      >
                        <Text className="text-textPrimary font-medium">{network}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              <View>
                <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-widest mb-2 ml-1">Mobile Number</Text>
                <View className="bg-surface p-4 rounded-2xl border border-slate-800">
                  <TextInput className="text-textPrimary font-semibold" placeholder="+27..." placeholderTextColor="#475569" keyboardType="phone-pad" value={momoNumber} onChangeText={(t) => setMomoNumber(t.replace(/[^0-9]/g, ''))} />
                </View>
              </View>
              <View>
                <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-widest mb-2 ml-1">Registered Name</Text>
                <View className="bg-surface p-4 rounded-2xl border border-slate-800">
                  <TextInput className="text-textPrimary font-semibold" placeholder="Name on Momo" placeholderTextColor="#475569" value={momoName} onChangeText={setMomoName} />
                </View>
              </View>
            </Animated.View>
          )}

          {method && (
            <AppButton title="Update Payout Details" variant="accent" size="large" className="mt-10 mb-20" onPress={handleSave} loading={loading} />
          )}

          <View className="h-20" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MerchantPaymentSettings;
