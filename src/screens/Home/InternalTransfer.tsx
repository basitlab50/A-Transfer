import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { User, ShieldCheck, ArrowRight, CheckCircle2, Home } from 'lucide-react-native';
import { useWalletStore } from '../../store/useWalletStore';
import { db, auth } from '../../config/firebase';
import { collection, query, where, getDocs, doc, increment, writeBatch, getDoc } from 'firebase/firestore';

const InternalTransfer = ({ navigation }: any) => {
  const { balance, userProfile } = useWalletStore();
  const [step, setStep] = useState<'aid' | 'amount' | 'success'>('aid');
  const [aid, setAid] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipientName, setRecipientName] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [recipientDocId, setRecipientDocId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipient = async () => {
      if (aid.length < 6) {
        setRecipientName(null);
        setRecipientDocId(null);
        return;
      }
      setIsSearching(true);
      try {
        const q = query(collection(db, 'users'), where('aid', '==', aid));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const docRef = snapshot.docs[0];
          if (docRef.id === userProfile?.id) {
            setRecipientName("You cannot transfer to yourself.");
            setRecipientDocId(null);
          } else {
            setRecipientName(docRef.data().name);
            setRecipientDocId(docRef.id);
          }
        } else {
          setRecipientName(null);
          setRecipientDocId(null);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(fetchRecipient, 500);
    return () => clearTimeout(debounce);
  }, [aid]);

  const handleContinueToAmount = () => {
    if (!recipientDocId || !recipientName || recipientName === "You cannot transfer to yourself.") {
      Alert.alert('Invalid Recipient', 'Please ensure you have a valid recipient before continuing.');
      return;
    }
    setStep('amount');
  };

  const handleFinalTransfer = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return Alert.alert('Error', 'Enter a valid amount');
    if (amt > balance) return Alert.alert('Error', 'Insufficient Balance');
    if (!recipientDocId) return Alert.alert('Error', 'Recipient not found');

    setLoading(true);
    try {
      const senderRef = doc(db, 'users', auth.currentUser!.uid);
      const recipientRef = doc(db, 'users', recipientDocId);

      // Verify balance first
      const senderSnap = await getDoc(senderRef);
      if (!senderSnap.exists()) throw new Error("Sender not found");
      if ((senderSnap.data().balance || 0) < amt) throw new Error("Insufficient Balance");

      const batch = writeBatch(db);

      // Balance updates
      batch.update(senderRef, { balance: increment(-amt) });
      batch.update(recipientRef, { balance: increment(amt) });

      // Transaction history
      const txRef = doc(collection(db, 'transactions'));
      const txData = {
        id: txRef.id,
        type: 'internal_transfer',
        senderId: auth.currentUser!.uid,
        userName: userProfile!.name || 'User',
        recipientId: recipientDocId,
        recipientName: recipientName,
        amount: amt,
        status: 'Completed',
        timestamp: new Date().toISOString()
      };
      batch.set(txRef, txData);

      // Notify recipient
      const notifRef = doc(collection(db, 'users', recipientDocId, 'notifications'));
      batch.set(notifRef, {
        id: notifRef.id,
        title: 'A-Credit Received',
        message: `You have received A ${amt.toLocaleString()} from ${userProfile!.name || 'User'} (AID: ${userProfile!.aid || 'Unknown'}).`,
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'success'
      });

      await batch.commit();
      
      navigation.navigate('Receipt', { transaction: txData });
    } catch (e: any) {
      console.error("Transfer Error Details:", e);
      Alert.alert('Transfer Failed', e.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };


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
                    placeholder="Enter AID"
                    placeholderTextColor="#334155"
                    value={aid}
                    onChangeText={(t) => setAid(t)}
                    autoCapitalize="characters"
                    autoFocus
                  />
                </View>
                
                <View style={{ marginTop: 20, minHeight: 40, justifyContent: 'center' }}>
                  {isSearching ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <ActivityIndicator size="small" color="#76b33a" />
                      <Text style={{ color: '#94A3B8', marginLeft: 10 }}>Searching...</Text>
                    </View>
                  ) : recipientName ? (
                    recipientName === "You cannot transfer to yourself." ? (
                      <Text style={{ color: '#EF4444', fontSize: 14 }}>{recipientName}</Text>
                    ) : (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ backgroundColor: 'rgba(118, 179, 58, 0.2)', padding: 8, borderRadius: 10, marginRight: 10 }}>
                          <User color="#76b33a" size={16} />
                        </View>
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>{recipientName}</Text>
                      </View>
                    )
                  ) : aid.length >= 6 ? (
                    <Text style={{ color: '#EF4444', fontSize: 14 }}>User not found. Please check the AID.</Text>
                  ) : null}
                </View>
              </View>

              <TouchableOpacity 
                onPress={handleContinueToAmount}
                disabled={!recipientDocId}
                style={{ backgroundColor: !recipientDocId ? '#334155' : '#76b33a', padding: 20, borderRadius: 24, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Continue</Text>
                <ArrowRight color="#fff" size={20} style={{ marginLeft: 10 }} />
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <View style={{ backgroundColor: '#1E293B', padding: 35, borderRadius: 40, alignItems: 'center', marginBottom: 30 }}>
                <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: 'bold', marginBottom: 20 }}>AMOUNT TO SEND TO {recipientName?.toUpperCase()}</Text>
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
