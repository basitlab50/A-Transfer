import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useWalletStore } from '../../store/useWalletStore';
import { db, auth } from '../../config/firebase';
import { setDoc, doc } from 'firebase/firestore';
import { ArrowLeft, Landmark, Smartphone, Repeat, Info, Wallet, CheckCircle2, Globe, ChevronRight } from 'lucide-react-native';
import { AppCard } from '../../components/ui/AppCard';
import { AppButton } from '../../components/ui/AppButton';

const QuickTransferAmount = ({ route, navigation }: any) => {
  const { country: destinationCountryName } = route.params || {};
  const { availableCountries, balance, userProfile, userCountry: senderCountryName } = useWalletStore();
  
  const [inputValue, setInputValue] = useState('');
  const handleAmountChange = (text: string) => {
    // Allow only digits and a single decimal point
    const filtered = text.replace(/[^0-9.]/g, '');
    const parts = filtered.split('.');
    if (parts.length > 2) return; // Ignore more than one dot
    setInputValue(filtered);
  };
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'amount' | 'details'>('amount');
  const [mode, setMode] = useState<'acredit' | 'sender' | 'recipient'>('acredit');

  const destinationCountry = useMemo(() => 
    availableCountries.find(c => c.name === destinationCountryName),
    [availableCountries, destinationCountryName]
  );
  
  const senderCountry = useMemo(() => 
    availableCountries.find(c => c.name === senderCountryName),
    [availableCountries, senderCountryName]
  );

  const destRate = destinationCountry?.rate || 1;
  const sendRate = senderCountry?.rate || 1;
  const destSymbol = destinationCountry?.currencySymbol || '$';
  const sendSymbol = senderCountry?.currencySymbol || '$';
  const destCode = destinationCountry?.currencyCode || 'GHS';
  const sendCode = senderCountry?.currencyCode || 'USD';

  // Calculate base A-Credits regardless of input mode
  const baseCredits = useMemo(() => {
    const val = parseFloat(inputValue) || 0;
    if (mode === 'acredit') return val;
    if (mode === 'sender') return val / sendRate;
    if (mode === 'recipient') return val / destRate;
    return 0;
  }, [inputValue, mode, sendRate, destRate]);

  // Derived amounts for display
  const senderAmount = baseCredits * sendRate;
  const recipientAmount = baseCredits * destRate;

  const [payoutMethod, setPayoutMethod] = useState<'bank' | 'momo'>('momo');
  const [bankName, setBankName] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [accountName, setAccountName] = useState('');
  const [momoNumber, setMomoNumber] = useState('');
  const [momoProvider, setMomoProvider] = useState('');
  const [momoName, setMomoName] = useState('');

  const isBridge = baseCredits > balance;
  const amountNeeded = isBridge ? baseCredits - balance : 0;

  const handleProcessSubmit = async () => {
    if (payoutMethod === 'bank' && (!bankName || !accountNo)) {
      return Alert.alert('Missing Details', 'Please fill in bank name and account number.');
    }
    if (payoutMethod === 'momo' && (!momoNumber || !momoProvider)) {
      return Alert.alert('Missing Details', 'Please fill in mobile number and provider.');
    }
    if (baseCredits <= 0) return Alert.alert('Invalid Amount', 'Please enter a valid amount.');

    setLoading(true);
    const txId = (isBridge ? 'BR_' : 'QX_') + Date.now();

    try {
      const transaction = {
        userId: auth.currentUser?.uid,
        userName: userProfile?.name || 'User',
        userPhone: userProfile?.phone || 'N/A',
        amount: baseCredits,
        type: isBridge ? 'deposit' : 'withdraw',
        status: isBridge ? 'awaiting_confirmation' : 'awaiting_merchant_payment',
        timestamp: new Date().toISOString(),
        destinationCountry: destinationCountryName,
        senderCountry: senderCountryName,
        senderCurrency: sendCode,
        recipientCurrency: destCode,
        totalAmount: senderAmount, // Local amount sent
        finalAmount: recipientAmount, // Local amount to be received
        payoutDetails: payoutMethod === 'bank' 
          ? { type: 'bank', bankName, accountNo, accountName: accountName || (userProfile?.name || 'User') } 
          : { type: 'momo', momoNumber, momoProvider, momoName: momoName || (userProfile?.name || 'User') },
        merchantId: 'SYSTEM_AUTO_ASSIGN',
        isChained: isBridge,
        bridgeData: isBridge ? {
          destinationCountry: destinationCountryName,
          totalAmount: baseCredits,
          payoutDetails: payoutMethod === 'bank' 
            ? { type: 'bank', bankName, accountNo, accountName: accountName || (userProfile?.name || 'User') } 
            : { type: 'momo', momoNumber, momoProvider, momoName: momoName || (userProfile?.name || 'User') }
        } : null
      };

      await setDoc(doc(db, 'ongoing_transactions', txId), transaction);
      navigation.navigate('TransactionStatus', { transactionId: txId });
    } catch (e: any) {
      Alert.alert('Submission Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const currentSymbol = mode === 'acredit' ? 'A' : (mode === 'sender' ? sendSymbol : destSymbol);
  const currentLabel = mode === 'acredit' ? 'A-Credits' : (mode === 'sender' ? sendCode : destCode);

  const availableNetworks = destinationCountry?.momoNetworks || ['Other'];
  const [showNetworkPicker, setShowNetworkPicker] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 25, paddingBottom: 100 }}>
          
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            className="w-12 h-12 rounded-2xl bg-surface border border-card-border items-center justify-center mb-8"
          >
             <ArrowLeft color="#F8FAFC" size={24} />
          </TouchableOpacity>

          {step === 'amount' ? (
            <View>
              <View className="mb-8">
                <Text className="text-textSecondary text-xs font-bold uppercase tracking-widest mb-2">Target Destination</Text>
                <View className="flex-row items-center bg-surface/50 p-4 rounded-3xl border border-card-border/50">
                   <Text className="text-2xl mr-3">{destinationCountry?.flag}</Text>
                   <View>
                      <Text className="text-textPrimary font-bold text-lg">{destinationCountryName}</Text>
                      <Text className="text-accent text-[10px] font-bold uppercase">Cross-Border Pulse Active</Text>
                   </View>
                </View>
              </View>

              <AppCard variant="primary" className="mb-8 items-center">
                {/* Mode Selector Tabs */}
                <View className="flex-row bg-primary/50 p-1.5 rounded-2xl mb-8 w-full">
                  {(['sender', 'acredit', 'recipient'] as const).map((m) => (
                    <TouchableOpacity 
                      key={m}
                      onPress={() => setMode(m)}
                      className={`flex-1 py-2 rounded-xl items-center ${mode === m ? 'bg-accent/20 border border-accent/30' : ''}`}
                    >
                      <Text className={`text-[10px] font-bold uppercase tracking-wider ${mode === m ? 'text-accent' : 'text-textSecondary'}`}>
                        {m === 'sender' ? sendCode : (m === 'acredit' ? 'A-Credit' : destCode)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View className="flex-row items-baseline mb-2">
                  <Text className="text-accent text-2xl font-bold mr-2">{currentSymbol}</Text>
                  <TextInput
                    className="text-textPrimary text-5xl font-bold text-center min-w-[150px]"
                    placeholder="0.00"
                    placeholderTextColor="#1E293B"
                    keyboardType="numeric"
                    value={inputValue}
                    onChangeText={handleAmountChange}
                    autoFocus
                  />
                </View>
                <Text className="text-textSecondary text-xs font-medium mb-6">Enter amount in {currentLabel}</Text>

                <View className="w-full h-[1px] bg-slate-800/50 mb-6" />

                <View className="w-full flex-row justify-between px-2">
                  <View className="items-center">
                    <Text className="text-textSecondary text-[10px] uppercase font-bold mb-1">You Send</Text>
                    <Text className="text-textPrimary font-bold">{sendSymbol}{senderAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Text>
                  </View>
                  <View className="w-[1px] h-8 bg-slate-800/50 self-center" />
                  <View className="items-center">
                    <Text className="text-textSecondary text-[10px] uppercase font-bold mb-1">A-Credits</Text>
                    <Text className="text-accent font-bold">A {baseCredits.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Text>
                  </View>
                  <View className="w-[1px] h-8 bg-slate-800/50 self-center" />
                  <View className="items-center">
                    <Text className="text-textSecondary text-[10px] uppercase font-bold mb-1">They Receive</Text>
                    <Text className="text-textPrimary font-bold">{destSymbol}{recipientAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Text>
                  </View>
                </View>
              </AppCard>

              {isBridge && (
                <View className="bg-orange/10 p-5 rounded-[32px] border border-orange/20 mb-8">
                  <View className="flex-row items-center mb-4">
                    <View className="w-12 h-12 rounded-2xl bg-orange/20 items-center justify-center mr-4">
                      <Wallet color="#df7c27" size={24} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-orange font-bold text-lg">Top-Up Required</Text>
                      <Text className="text-textSecondary text-xs">
                        You need <Text className="text-orange font-bold">A {amountNeeded.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text> more to complete this transfer.
                      </Text>
                    </View>
                  </View>
                  <AppButton 
                    title="Top Up Now" 
                    variant="orange" 
                    size="small"
                    className="w-full h-12 rounded-2xl"
                    onPress={() => navigation.navigate('AMerchants', { country: senderCountryName, mode: 'deposit' })}
                    icon={<ChevronRight color="#df7c27" size={16} />}
                  />
                </View>
              )}

              <AppButton 
                title={isBridge ? "Insufficient Balance" : "Continue to Payout"} 
                variant={isBridge ? "secondary" : "accent"}
                disabled={isBridge}
                onPress={() => {
                  if (!inputValue || parseFloat(inputValue) <= 0) return Alert.alert('Error', 'Enter a valid amount');
                  setStep('details');
                }}
                icon={<ChevronRight color={isBridge ? "#64748B" : "#76b33a"} size={20} />}
                size="large"
              />
            </View>
          ) : (
            <View>
              <Text className="text-textPrimary text-2xl font-bold mb-2">Recipient Payout</Text>
              <Text className="text-textSecondary text-sm mb-8">Where should the international merchant send the {destSymbol}{recipientAmount.toLocaleString()} {destCode}?</Text>
              
              <View className="flex-row gap-4 mb-8">
                <TouchableOpacity 
                  onPress={() => setPayoutMethod('bank')} 
                  className={`flex-1 p-5 rounded-3xl border items-center justify-center ${payoutMethod === 'bank' ? 'bg-accent/10 border-accent/50' : 'bg-surface border-card-border'}`}
                >
                  <Landmark color={payoutMethod === 'bank' ? '#76b33a' : '#64748B'} size={24} />
                  <Text className={`mt-2 font-bold ${payoutMethod === 'bank' ? 'text-accent' : 'text-textSecondary'}`}>Bank Account</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setPayoutMethod('momo')} 
                  className={`flex-1 p-5 rounded-3xl border items-center justify-center ${payoutMethod === 'momo' ? 'bg-accent/10 border-accent/50' : 'bg-surface border-card-border'}`}
                >
                  <Smartphone color={payoutMethod === 'momo' ? '#76b33a' : '#64748B'} size={24} />
                  <Text className={`mt-2 font-bold ${payoutMethod === 'momo' ? 'text-accent' : 'text-textSecondary'}`}>Mobile Money</Text>
                </TouchableOpacity>
              </View>

              <AppCard variant="secondary" className="mb-8">
                {payoutMethod === 'bank' ? (
                  <View>
                    <View className="mb-4">
                      <Text className="text-textSecondary text-[10px] font-bold uppercase mb-2 ml-1">Bank Name</Text>
                      <TextInput 
                        value={bankName} onChangeText={setBankName} 
                        placeholder="e.g. EcoBank, Stanbic" placeholderTextColor="#334155" 
                        className="bg-primary border border-slate-800 text-textPrimary p-4 rounded-2xl" 
                      />
                    </View>
                    <View className="mb-4">
                      <Text className="text-textSecondary text-[10px] font-bold uppercase mb-2 ml-1">Account Number</Text>
                      <TextInput 
                        value={accountNo} onChangeText={(t) => setAccountNo(t.replace(/[^0-9]/g, ''))} 
                        placeholder="0000 0000 0000" placeholderTextColor="#334155" 
                        className="bg-primary border border-slate-800 text-textPrimary p-4 rounded-2xl font-mono" 
                        keyboardType="numeric"
                      />
                    </View>
                    <View>
                      <Text className="text-textSecondary text-[10px] font-bold uppercase mb-2 ml-1">Full Account Name</Text>
                      <TextInput 
                        value={accountName} onChangeText={setAccountName} 
                        placeholder="Recipient's Registered Name" placeholderTextColor="#334155" 
                        className="bg-primary border border-slate-800 text-textPrimary p-4 rounded-2xl" 
                      />
                    </View>
                  </View>
                ) : (
                  <View>
                    <View className="mb-4">
                      <Text className="text-textSecondary text-[10px] font-bold uppercase mb-2 ml-1">Network Provider</Text>
                      <TouchableOpacity 
                        onPress={() => setShowNetworkPicker(!showNetworkPicker)}
                        className="bg-primary border border-slate-800 p-4 rounded-2xl flex-row justify-between items-center"
                      >
                        <Text className={momoProvider ? "text-textPrimary" : "text-slate-600"}>
                          {momoProvider || "Select Network"}
                        </Text>
                        <ChevronRight color="#64748B" size={16} style={{ transform: [{ rotate: showNetworkPicker ? '90deg' : '0deg' }] }} />
                      </TouchableOpacity>
                      
                      {showNetworkPicker && (
                        <View className="mt-2 bg-surface border border-card-border rounded-2xl overflow-hidden">
                          {availableNetworks.map((network) => (
                            <TouchableOpacity 
                              key={network}
                              onPress={() => {
                                setMomoProvider(network);
                                setShowNetworkPicker(false);
                              }}
                              className="p-4 border-b border-card-border last:border-b-0 active:bg-accent/10"
                            >
                              <Text className="text-textPrimary">{network}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                    <View className="mb-4">
                      <Text className="text-textSecondary text-[10px] font-bold uppercase mb-2 ml-1">Mobile Number</Text>
                      <TextInput 
                        value={momoNumber} onChangeText={(t) => setMomoNumber(t.replace(/[^0-9]/g, ''))} 
                        placeholder="024 XXX XXXX" placeholderTextColor="#334155" 
                        className="bg-primary border border-slate-800 text-textPrimary p-4 rounded-2xl font-mono" 
                        keyboardType="phone-pad"
                      />
                    </View>
                    <View>
                      <Text className="text-textSecondary text-[10px] font-bold uppercase mb-2 ml-1">Registered Name</Text>
                      <TextInput 
                        value={momoName} onChangeText={setMomoName} 
                        placeholder="Owner's Full Name" placeholderTextColor="#334155" 
                        className="bg-primary border border-slate-800 text-textPrimary p-4 rounded-2xl" 
                      />
                    </View>
                  </View>
                )}
              </AppCard>

              <AppButton 
                title="CONFIRM & PROCESS" 
                variant="accent" 
                loading={loading}
                onPress={handleProcessSubmit}
                icon={<CheckCircle2 color="#76b33a" size={20} />}
                size="large"
              />

              <TouchableOpacity 
                onPress={() => setStep('amount')} 
                className="mt-6 self-center py-2"
              >
                <Text className="text-textSecondary font-bold text-xs uppercase tracking-widest">Adjust Amount</Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default QuickTransferAmount;

