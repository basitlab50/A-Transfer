import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { User, ShieldCheck, ArrowRight, CornerDownRight, CheckCircle2, Home, Wallet } from 'lucide-react-native';
import { useWalletStore } from '../../store/useWalletStore';

const InternalTransfer = ({ navigation }: any) => {
  const { balance, userProfile } = useWalletStore();
  const [step, setStep] = useState<'aid' | 'amount' | 'success'>('aid');
  const [aid, setAid] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinueToAmount = () => {
    if (aid.length < 8) {
      Alert.alert('Invalid AID', 'Please enter a valid A-Transfer Account ID.');
      return;
    }
    setStep('amount');
  };

  const handleFinalTransfer = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return Alert.alert('Error', 'Enter a valid amount');
    if (amt > balance) return Alert.alert('Error', 'Insufficient Balance');

    setLoading(true);
    // Mock processing
    setTimeout(() => {
      setLoading(false);
      setStep('success');
    }, 1500);
  };

  if (step === 'success') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0A192F', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <View style={{ backgroundColor: 'rgba(118, 179, 58, 0.1)', padding: 40, borderRadius: 60, marginBottom: 30 }}>
          <CheckCircle2 color="#76b33a" size={80} />
        </View>
        <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 }}>Transfer Sent!</Text>
        <Text style={{ color: '#94A3B8', textAlign: 'center', marginBottom: 40, lineHeight: 22 }}>
          Your transfer of A {parseFloat(amount).toLocaleString()} to account #{aid} has been successfully processed.
        </Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Dashboard')}
          style={{ backgroundColor: '#76b33a', width: '100%', padding: 20, borderRadius: 24, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
        >
          <Home color="#fff" size={20} />
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, marginLeft: 10 }}>Back to Homepage</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A192F' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1, paddingHorizontal: 25, paddingTop: 20 }}>
          
          <View style={{ alignItems: 'center', marginVertical: 30 }}>
            <View style={{ backgroundColor: 'rgba(118, 179, 58, 0.1)', padding: 20, borderRadius: 30, marginBottom: 15 }}>
              <User color="#76b33a" size={40} />
            </View>
            <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>Internal Transfer</Text>
            <Text style={{ color: '#94A3B8', fontSize: 14 }}>Send A-Credits to another AID</Text>
          </View>

          {step === 'aid' ? (
            <View>
              <View style={{ backgroundColor: '#1E293B', padding: 30, borderRadius: 32, marginBottom: 30 }}>
                <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: 'bold', marginBottom: 15, letterSpacing: 1 }}>RECIPIENT AID</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A192F', padding: 18, borderRadius: 16, borderWidth: 1, borderColor: '#334155' }}>
                  <ShieldCheck color="#76b33a" size={20} />
                  <TextInput
                    style={{ flex: 1, marginLeft: 15, color: '#fff', fontSize: 18, fontWeight: 'bold' }}
                    placeholder="Enter 8-digit AID"
                    placeholderTextColor="#334155"
                    keyboardType="numeric"
                    maxLength={8}
                    value={aid}
                    onChangeText={(t) => setAid(t.replace(/[^0-9]/g, ''))}
                    autoFocus
                  />
                </View>
              </View>

              <TouchableOpacity 
                onPress={handleContinueToAmount}
                style={{ backgroundColor: '#76b33a', padding: 20, borderRadius: 24, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Continue</Text>
                <ArrowRight color="#fff" size={20} style={{ marginLeft: 10 }} />
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <View style={{ backgroundColor: '#1E293B', padding: 35, borderRadius: 40, alignItems: 'center', marginBottom: 30 }}>
                <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: 'bold', marginBottom: 20 }}>AMOUNT TO SEND</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ color: '#76b33a', fontSize: 32, fontWeight: 'bold', marginRight: 10 }}>A</Text>
                  <TextInput
                    style={{ color: '#fff', fontSize: 56, fontWeight: 'bold', minWidth: 120, textAlign: 'center' }}
                    placeholder="0.00"
                    placeholderTextColor="#334155"
                    keyboardType="decimal-pad"
                    value={amount}
                    onChangeText={(text) => {
                      const filtered = text.replace(/[^0-9.]/g, '');
                      const parts = filtered.split('.');
                      if (parts.length > 2) return;
                      setAmount(filtered);
                    }}
                    autoFocus
                  />
                </View>
                <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 20 }}>Available: A {balance.toLocaleString()}</Text>
              </View>

              <TouchableOpacity 
                onPress={handleFinalTransfer}
                disabled={loading}
                style={{ backgroundColor: loading ? '#334155' : '#76b33a', padding: 20, borderRadius: 24, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
              >
                {loading ? <ActivityIndicator color="#fff" /> : (
                  <>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Send Credits Now</Text>
                    <ArrowRight color="#fff" size={20} style={{ marginLeft: 10 }} />
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setStep('aid')} style={{ marginTop: 20 }}>
                <Text style={{ color: '#94A3B8', textAlign: 'center' }}>Change Recipient</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default InternalTransfer;
