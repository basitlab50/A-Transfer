import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert, ActivityIndicator, Button } from 'react-native';
import { useWalletStore } from '../../store/useWalletStore';
import { db, auth } from '../../config/firebase';
import { doc, setDoc, runTransaction, increment, updateDoc } from 'firebase/firestore';
import { ArrowRightLeft, ArrowRight, ShoppingBag, Landmark, Smartphone, CheckCircle2, Home, Clock, Info, Wallet, Landmark as BankIcon } from 'lucide-react-native';

const WithdrawAmount = ({ route, navigation }: any) => {
  const { merchant } = route.params || {};
  const { availableCountries, balance, userProfile } = useWalletStore();
  
  const [inputValue, setInputValue] = useState('');
  const handleAmountChange = (text: string) => {
    const filtered = text.replace(/[^0-9.]/g, '');
    const parts = filtered.split('.');
    if (parts.length > 2) return;
    setInputValue(filtered);
  };
  const [isLocalCurrencyMode, setIsLocalCurrencyMode] = useState(false);
  const [step, setStep] = useState<'amount' | 'details' | 'success'>('amount');
  const [loading, setLoading] = useState(false);

  // Payout Details State
  const [payoutType, setPayoutType] = useState<'bank' | 'momo'>('bank');
  const [bankName, setBankName] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [accountName, setAccountName] = useState('');
  const [momoProvider, setMomoProvider] = useState('');
  const [momoNumber, setMomoNumber] = useState('');
  const [momoName, setMomoName] = useState(userProfile?.name || '');

  const country = useMemo(() => 
    availableCountries.find(c => c.name === merchant?.country),
    [availableCountries, merchant]
  );

  const rate = country?.rate || 1;
  const currencySymbol = country?.currencySymbol || '$';
  const currencyCode = country?.currencyCode || 'USD';

  const merchantBuyRate = merchant?.buyingRate || 0.90;
  const effectiveRate = merchantBuyRate * rate;

  const creditsToSell = isLocalCurrencyMode 
    ? (parseFloat(inputValue) || 0) / (effectiveRate || 1)
    : (parseFloat(inputValue) || 0);

  const localPayout = isLocalCurrencyMode
    ? (parseFloat(inputValue) || 0)
    : (parseFloat(inputValue) || 0) * (effectiveRate || 1);

  const buyingMin = merchant?.buyingMin || 10;
  const buyingMax = merchant?.buyingMax || 1000;
  const isOutOfRange = creditsToSell > 0 && (creditsToSell < buyingMin || creditsToSell > buyingMax);
  const isInsufficient = creditsToSell > balance;

  const [showNetworkPicker, setShowNetworkPicker] = useState(false);
  const availableNetworks = country?.momoNetworks || ['Other'];

  if (step === 'success') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0A192F' }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
          <View style={{ backgroundColor: 'rgba(118, 179, 58, 0.1)', padding: 40, borderRadius: 60, marginBottom: 30 }}>
            <CheckCircle2 color="#76b33a" size={80} />
          </View>
          <Text style={{ color: '#F8FAFC', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 }}>A-Credits Escrowed</Text>
          <Text style={{ color: '#94A3B8', textAlign: 'center', marginBottom: 40, lineHeight: 22 }}>
            Your A-Credits have been deducted and placed in secure escrow. They are currently inaccessible to both you and the merchant until you confirm receipt of your local currency.
          </Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Dashboard')}
            style={{ width: '100%', backgroundColor: 'rgba(118, 179, 58, 0.2)', paddingVertical: 20, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', borderWidth: 1, borderColor: 'rgba(118, 179, 58, 0.4)' }}
          >
            <Home color="#76b33a" size={20} />
            <Text style={{ color: '#76b33a', fontWeight: 'bold', fontSize: 18, marginLeft: 10 }}>Return to Homepage</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A192F' }}>
      <ScrollView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 20 }}>
        
        {step === 'amount' ? (
          <View>
            <View style={{ marginBottom: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>Selling To</Text>
                <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: 'bold' }}>{merchant?.name}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: 'bold' }}>BALANCE</Text>
                <Text style={{ color: '#76b33a', fontSize: 18, fontWeight: 'bold' }}>A {balance.toLocaleString()}</Text>
              </View>
            </View>

            <View style={{ backgroundColor: '#1E293B', padding: 30, borderRadius: 40, marginBottom: 30, alignItems: 'center' }}>
              <TouchableOpacity onPress={() => setIsLocalCurrencyMode(!isLocalCurrencyMode)} style={{ backgroundColor: 'rgba(10,25,47,0.5)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 100, borderWidth: 1, borderColor: '#334155', flexDirection: 'row', alignItems: 'center', marginBottom: 30 }}>
                <ArrowRightLeft color="#76b33a" size={16} />
                <Text style={{ color: '#F8FAFC', fontSize: 12, fontWeight: 'bold', marginLeft: 10 }}>Switch Currency</Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#76b33a', fontSize: 32, fontWeight: 'bold', marginRight: 10 }}>{isLocalCurrencyMode ? currencySymbol : 'A'}</Text>
                <TextInput
                  style={{ color: '#F8FAFC', fontSize: 48, fontWeight: 'bold', textAlign: 'center', minWidth: 120 }}
                  placeholder="0.00"
                  placeholderTextColor="#334155"
                  keyboardType="decimal-pad"
                  value={inputValue}
                  onChangeText={handleAmountChange}
                  autoFocus
                />
              </View>
              <View style={{ height: 1, width: '100%', backgroundColor: '#334155', marginVertical: 24 }} />
              <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: 'bold' }}>
                You Receive: {isLocalCurrencyMode ? `A ${creditsToSell.toFixed(2)}` : `${currencySymbol}${localPayout.toLocaleString()} ${currencyCode}`}
              </Text>
            </View>

            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={{ color: '#94A3B8', fontSize: 12 }}>Merchant Limits:</Text>
                <Text style={{ color: '#F8FAFC', fontSize: 12, fontWeight: 'bold' }}>{buyingMin} - {buyingMax} A</Text>
              </View>
              {isOutOfRange && (
                <Text style={{ color: '#EF4444', fontSize: 10, fontWeight: 'bold', marginTop: 5, textAlign: 'center', textTransform: 'uppercase' }}>
                  Amount must be between {buyingMin} and {buyingMax} A-Credits
                </Text>
              )}
              {isInsufficient && (
                <Text style={{ color: '#EF4444', fontSize: 10, fontWeight: 'bold', marginTop: 5, textAlign: 'center', textTransform: 'uppercase' }}>
                  Insufficient Balance
                </Text>
              )}
            </View>

            <TouchableOpacity 
              disabled={!inputValue || parseFloat(inputValue) === 0 || isOutOfRange || isInsufficient}
              onPress={() => setStep('details')}
              style={{ 
                backgroundColor: (!inputValue || isOutOfRange || isInsufficient) ? 'rgba(148, 163, 184, 0.1)' : 'rgba(118, 179, 58, 0.2)', 
                paddingVertical: 20, 
                borderRadius: 24, 
                alignItems: 'center', 
                justifyContent: 'center', 
                flexDirection: 'row', 
                borderWidth: 1, 
                borderColor: (!inputValue || isOutOfRange || isInsufficient) ? '#334155' : 'rgba(118, 179, 58, 0.4)' 
              }}
            >
              <Text style={{ color: (!inputValue || isOutOfRange || isInsufficient) ? '#475569' : '#76b33a', fontWeight: 'bold', fontSize: 18, marginRight: 10 }}>Continue to Payout Details</Text>
              <ArrowRight color={(!inputValue || isOutOfRange || isInsufficient) ? '#475569' : '#76b33a'} size={20} />
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={{ color: '#F8FAFC', fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>Payout Details</Text>
            <Text style={{ color: '#94A3B8', fontSize: 14, marginBottom: 24 }}>Where should the merchant send your {currencyCode}?</Text>

            <View style={{ flexDirection: 'row', marginBottom: 25 }}>
              <TouchableOpacity onPress={() => setPayoutType('bank')} style={{ flex: 1, backgroundColor: payoutType === 'bank' ? 'rgba(118, 179, 58, 0.2)' : '#1E293B', padding: 15, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: payoutType === 'bank' ? '#76b33a' : '#334155', marginRight: 10 }}>
                <BankIcon color={payoutType === 'bank' ? '#76b33a' : '#94A3B8'} size={24} />
                <Text style={{ color: payoutType === 'bank' ? '#76b33a' : '#94A3B8', fontWeight: 'bold', marginTop: 5 }}>Bank</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPayoutType('momo')} style={{ flex: 1, backgroundColor: payoutType === 'momo' ? 'rgba(118, 179, 58, 0.2)' : '#1E293B', padding: 15, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: payoutType === 'momo' ? '#76b33a' : '#334155', marginLeft: 10 }}>
                <Smartphone color={payoutType === 'momo' ? '#76b33a' : '#94A3B8'} size={24} />
                <Text style={{ color: payoutType === 'momo' ? '#76b33a' : '#94A3B8', fontWeight: 'bold', marginTop: 5 }}>Momo</Text>
              </TouchableOpacity>
            </View>

            <View style={{ backgroundColor: '#1E293B', padding: 24, borderRadius: 32, marginBottom: 30 }}>
              {payoutType === 'bank' ? (
                <View>
                  <TextInput style={{ backgroundColor: '#0A192F', color: '#fff', padding: 15, borderRadius: 12, marginBottom: 15 }} placeholder="Bank Name" placeholderTextColor="#334155" value={bankName} onChangeText={setBankName} />
                  <TextInput style={{ backgroundColor: '#0A192F', color: '#fff', padding: 15, borderRadius: 12, marginBottom: 15 }} placeholder="Account Number" placeholderTextColor="#334155" keyboardType="numeric" value={accountNo} onChangeText={(t) => setAccountNo(t.replace(/[^0-9]/g, ''))} />
                  <TextInput style={{ backgroundColor: '#0A192F', color: '#fff', padding: 15, borderRadius: 12 }} placeholder="Account Name" placeholderTextColor="#334155" value={accountName} onChangeText={setAccountName} />
                </View>
              ) : (
                <View>
                  <TouchableOpacity 
                    onPress={() => setShowNetworkPicker(!showNetworkPicker)}
                    style={{ backgroundColor: '#0A192F', padding: 15, borderRadius: 12, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Text style={{ color: momoProvider ? '#fff' : '#334155' }}>{momoProvider || "Select Provider"}</Text>
                    <ArrowRight color="#76b33a" size={16} style={{ transform: [{ rotate: showNetworkPicker ? '90deg' : '0deg' }] }} />
                  </TouchableOpacity>

                  {showNetworkPicker && (
                    <View style={{ backgroundColor: '#0A192F', borderRadius: 12, marginBottom: 15, overflow: 'hidden', borderWidth: 1, borderColor: '#334155' }}>
                      {availableNetworks.map((network) => (
                        <TouchableOpacity 
                          key={network} 
                          onPress={() => { setMomoProvider(network); setShowNetworkPicker(false); }}
                          style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: '#1E293B' }}
                        >
                          <Text style={{ color: '#fff' }}>{network}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  <TextInput style={{ backgroundColor: '#0A192F', color: '#fff', padding: 15, borderRadius: 12, marginBottom: 15 }} placeholder="Mobile Number" placeholderTextColor="#334155" keyboardType="phone-pad" value={momoNumber} onChangeText={(t) => setMomoNumber(t.replace(/[^0-9]/g, ''))} />
                  <TextInput style={{ backgroundColor: '#0A192F', color: '#fff', padding: 15, borderRadius: 12 }} placeholder="Registered Name" placeholderTextColor="#334155" value={momoName} onChangeText={setMomoName} />
                </View>
              )}
            </View>

            <TouchableOpacity 
              disabled={loading}
              onPress={async () => {
                if (payoutType === 'momo' && !momoProvider) return Alert.alert('Error', 'Select a network provider');
                setLoading(true);
                try {
                  const txId = 'WD' + Date.now();
                  const payoutDetails = payoutType === 'bank' ? { type: 'bank', bankName, accountNo, accountName } : { type: 'momo', momoProvider, momoNumber, momoName: momoName || userProfile?.name || 'User' };
                  const amt = Number(creditsToSell);

                  await runTransaction(db, async (transaction) => {
                    const uRef = doc(db, 'users', auth.currentUser!.uid);
                    const uSnap = await transaction.get(uRef);
                    if (!uSnap.exists()) throw new Error('User not found');
                    const currentBalance = uSnap.data().balance || 0;
                    if (currentBalance < amt) throw new Error('Insufficient balance');

                    const txData = { 
                      userId: auth.currentUser?.uid || 'anonymous', 
                      userName: userProfile?.name || 'User', 
                      merchantId: merchant.id, 
                      amount: amt, 
                      localAmount: localPayout, 
                      currencyCode, 
                      status: 'awaiting_merchant_payment', 
                      timestamp: new Date().toISOString(), 
                      type: 'withdraw', 
                      senderCountry: 'A-Wallet',
                      destinationCountry: merchant.country,
                      senderCurrency: 'A-Credit',
                      recipientCurrency: currencyCode,
                      payoutDetails,
                      inEscrow: true 
                    };

                    transaction.update(uRef, { balance: increment(-amt) });
                    transaction.set(doc(db, 'ongoing_transactions', txId), txData);
                  });

                  setStep('success');
                } catch (e: any) { 
                  Alert.alert('WITHDRAWAL ERROR', e.message); 
                } finally { 
                  setLoading(false); 
                }
              }}
              style={{ backgroundColor: loading ? '#334155' : '#df7c27', paddingVertical: 20, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Withdraw A-Credit</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setStep('amount')} style={{ marginTop: 20, marginBottom: 50 }}>
              <Text style={{ color: '#94A3B8', textAlign: 'center' }}>Change Amount</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default WithdrawAmount;
