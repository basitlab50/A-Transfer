import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert, ActivityIndicator, Button } from 'react-native';
import { useWalletStore } from '../../store/useWalletStore';
import { db, auth } from '../../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ArrowRightLeft, ArrowRight, ShoppingBag, Landmark, Smartphone, CheckCircle2, Home, Clock } from 'lucide-react-native';

const DepositAmount = ({ route, navigation }: any) => {
  const { merchant } = route.params || {};
  const { availableCountries, userProfile } = useWalletStore();
  
  const [inputValue, setInputValue] = useState('');
  const handleAmountChange = (text: string) => {
    const filtered = text.replace(/[^0-9.]/g, '');
    const parts = filtered.split('.');
    if (parts.length > 2) return;
    setInputValue(filtered);
  };
  const [isLocalCurrencyMode, setIsLocalCurrencyMode] = useState(false);
  const [step, setStep] = useState<'amount' | 'payment' | 'success'>('amount');
  const [loading, setLoading] = useState(false);

  const country = useMemo(() => 
    availableCountries.find(c => c.name === merchant?.country),
    [availableCountries, merchant]
  );

  const merchantRate = merchant?.sellingRate || 1.5;
  const countryBaseRate = country?.rate || 1;
  const effectiveRate = merchantRate * countryBaseRate;

  const currencySymbol = country?.currencySymbol || '$';
  const currencyCode = country?.currencyCode || 'USD';

  const creditsToBuy = isLocalCurrencyMode 
    ? (parseFloat(inputValue) || 0) / effectiveRate 
    : (parseFloat(inputValue) || 0);

  const localCost = isLocalCurrencyMode
    ? (parseFloat(inputValue) || 0)
    : (parseFloat(inputValue) || 0) * effectiveRate;

  const sellingMin = merchant?.sellingMin || 5;
  const merchantInventory = merchant?.merchantInventory || 0;
  const isOutOfRangeActual = creditsToBuy > 0 && (creditsToBuy < sellingMin || creditsToBuy > merchantInventory);

  const handleIHavePaid = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const txId = 'TX' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
      const transaction = {
        userId: auth.currentUser?.uid || 'anonymous',
        userName: userProfile?.name || auth.currentUser?.displayName || 'User',
        userPhone: userProfile?.phone || 'N/A',
        merchantId: merchant.id,
        amount: Number(creditsToBuy),
        localAmount: localCost,
        finalAmount: Number(creditsToBuy),
        currencyCode: currencyCode,
        status: 'awaiting_confirmation',
        timestamp: new Date().toISOString(),
        type: 'deposit',
        senderCountry: merchant.country,
        destinationCountry: 'A-Wallet',
        senderCurrency: currencyCode,
        recipientCurrency: 'A-Credit',
        merchantDetails: merchant.paymentDetails || {}
      };
      await setDoc(doc(db, 'ongoing_transactions', txId), transaction);
      setStep('success');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0A192F' }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
          <View style={{ backgroundColor: 'rgba(223, 124, 39, 0.1)', padding: 40, borderRadius: 60, marginBottom: 30 }}>
            <Clock color="#df7c27" size={80} />
          </View>
          <Text style={{ color: '#F8FAFC', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 }}>Awaiting Approval</Text>
          <Text style={{ color: '#94A3B8', textAlign: 'center', marginBottom: 40, lineHeight: 22 }}>
            We've notified the merchant of your payment. Please hold on while they verify the transfer. You can track progress from your dashboard.
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
            <View style={{ marginBottom: 30 }}>
              <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 5 }}>Buying From</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ShoppingBag color="#76b33a" size={24} />
                <Text style={{ color: '#F8FAFC', fontSize: 20, fontWeight: 'bold', marginLeft: 10 }}>{merchant?.merchantApplication?.businessName || merchant?.name}</Text>
              </View>
            </View>

            <View style={{ backgroundColor: '#1E293B', padding: 30, borderRadius: 40, marginBottom: 30, alignItems: 'center' }}>
              <TouchableOpacity onPress={() => setIsLocalCurrencyMode(!isLocalCurrencyMode)} style={{ backgroundColor: 'rgba(10,25,47,0.5)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 100, borderWidth: 1, borderColor: '#334155', flexDirection: 'row', alignItems: 'center', marginBottom: 30 }}>
                <ArrowRightLeft color="#76b33a" size={16} />
                <Text style={{ color: '#F8FAFC', fontSize: 12, fontWeight: 'bold', marginLeft: 10 }}>Switch to {isLocalCurrencyMode ? 'A-Credits' : currencyCode}</Text>
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
              
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ marginBottom: 40 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                  <Text style={{ color: '#94A3B8', fontSize: 12 }}>Merchant Limits:</Text>
                  <Text style={{ color: '#F8FAFC', fontSize: 12, fontWeight: 'bold' }}>{sellingMin} - {merchantInventory} A</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#94A3B8', fontSize: 12 }}>Total Cost:</Text>
                  <Text style={{ color: '#76b33a', fontSize: 12, fontWeight: 'bold' }}>{currencySymbol}{localCost.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currencyCode}</Text>
                </View>
                {isOutOfRangeActual && (
                  <Text style={{ color: '#EF4444', fontSize: 10, fontWeight: 'bold', marginTop: 10, textAlign: 'center', textTransform: 'uppercase' }}>
                    Amount must be between {sellingMin} and {merchantInventory} A-Credits
                  </Text>
                )}
              </View>

              <TouchableOpacity 
                disabled={!inputValue || parseFloat(inputValue) === 0 || isOutOfRangeActual}
                onPress={() => setStep('payment')}
                style={{ backgroundColor: (!inputValue || parseFloat(inputValue) === 0 || isOutOfRangeActual) ? 'rgba(148, 163, 184, 0.1)' : '#76b33a', paddingVertical: 22, borderRadius: 24, alignItems: 'center', justifyContent: 'center', shadowColor: '#76b33a', shadowOffset: { width: 0, height: 10 }, shadowOpacity: (!inputValue || isOutOfRangeActual) ? 0 : 0.2, shadowRadius: 20 }}
              >
                <Text style={{ color: (!inputValue || parseFloat(inputValue) === 0 || isOutOfRangeActual) ? '#64748B' : '#0A192F', fontWeight: 'bold', fontSize: 18 }}>Continue to Payment</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View>
            <Text style={{ color: '#F8FAFC', fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>Merchant Payout</Text>
            <Text style={{ color: '#94A3B8', fontSize: 14, marginBottom: 24, lineHeight: 20 }}>Please send the local currency equivalent to the merchant's verified account details below.</Text>

            <View style={{ backgroundColor: '#1E293B', padding: 24, borderRadius: 32, borderSize: 1, borderColor: 'rgba(118, 179, 58, 0.3)', marginBottom: 30 }}>
              <View style={{ alignItems: 'center', marginBottom: 24 }}>
                <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 5 }}>SEND EXACTLY</Text>
                <Text style={{ color: '#F8FAFC', fontSize: 32, fontWeight: 'bold' }}>{currencySymbol}{localCost.toLocaleString()} {currencyCode}</Text>
              </View>
              
              <View style={{ height: 1, backgroundColor: '#334155', marginBottom: 24 }} />

              {merchant.paymentDetails?.type === 'bank' ? (
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                    <Landmark color="#76b33a" size={24} />
                    <Text style={{ color: '#F8FAFC', fontWeight: 'bold', fontSize: 18, marginLeft: 12 }}>Bank Transfer</Text>
                  </View>
                  <View style={{ marginBottom: 15 }}><Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>Bank Name</Text><Text style={{ color: '#F8FAFC', fontWeight: 'bold', fontSize: 16 }}>{merchant.paymentDetails.bankName}</Text></View>
                  <View style={{ marginBottom: 15 }}><Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>Account Number</Text><Text style={{ color: '#76b33a', fontWeight: 'bold', fontSize: 20, letterSpacing: 1 }}>{merchant.paymentDetails.accountNo}</Text></View>
                  <View><Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>Account Name</Text><Text style={{ color: '#F8FAFC', fontWeight: 'bold', fontSize: 16 }}>{merchant.paymentDetails.accountName}</Text></View>
                </View>
              ) : (
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                    <Smartphone color="#76b33a" size={24} />
                    <Text style={{ color: '#F8FAFC', fontWeight: 'bold', fontSize: 18, marginLeft: 12 }}>Mobile Money</Text>
                  </View>
                  <View style={{ marginBottom: 15 }}><Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>Provider</Text><Text style={{ color: '#F8FAFC', fontWeight: 'bold', fontSize: 16 }}>{merchant.paymentDetails?.momoProvider || 'N/A'}</Text></View>
                  <View style={{ marginBottom: 15 }}><Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>Mobile Number</Text><Text style={{ color: '#76b33a', fontWeight: 'bold', fontSize: 20, letterSpacing: 1 }}>{merchant.paymentDetails?.momoNumber || 'N/A'}</Text></View>
                  <View><Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>Registered Name</Text><Text style={{ color: '#F8FAFC', fontWeight: 'bold', fontSize: 16 }}>{merchant.paymentDetails?.momoName || 'N/A'}</Text></View>
                </View>
              )}
            </View>

            <TouchableOpacity 
              onPress={handleIHavePaid}
              disabled={loading}
              style={{ backgroundColor: loading ? '#334155' : '#76b33a', paddingVertical: 20, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <CheckCircle2 color="#FFFFFF" size={20} />
                  <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 18, marginLeft: 10 }}>Confirm I Have Paid</Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setStep('amount')} style={{ marginTop: 20, marginBottom: 50, paddingVertical: 10 }}>
              <Text style={{ color: '#94A3B8', textAlign: 'center', fontWeight: 'bold' }}>Go Back & Edit</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default DepositAmount;
