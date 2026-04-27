import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { db, auth } from '../../config/firebase';
import { collection, query, where, onSnapshot, doc, increment, updateDoc, runTransaction, setDoc } from 'firebase/firestore';
import { CheckCircle2, XCircle, Clock, User, ArrowLeft, RefreshCcw, Landmark, Smartphone, ArrowDownCircle, ArrowUpCircle, Home, ShoppingBag, AlertCircle } from 'lucide-react-native';
import { useWalletStore } from '../../store/useWalletStore';

const MerchantOngoingTransactions = ({ navigation }: any) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [lastTx, setLastTx] = useState<any>(null);
  const { handleCancellationResponse } = useWalletStore();
  
  // Success Screen State
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successSubtext, setSuccessSubtext] = useState('');

  useEffect(() => {
    if (!auth.currentUser) return;
    
    // Listen for all transactions for this merchant
    const q = query(
      collection(db, 'ongoing_transactions'),
      where('merchantId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as any))
        .filter(t => ['awaiting_confirmation', 'awaiting_merchant_payment', 'cancellation_requested'].includes(t.status));
      setTransactions(txs);
      setLoading(false);
    }, (error) => {
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (showSuccess) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0A192F', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <View style={{ backgroundColor: 'rgba(118, 179, 58, 0.1)', padding: 40, borderRadius: 60, marginBottom: 30 }}>
          <CheckCircle2 color="#76b33a" size={80} />
        </View>
        <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 }}>{successMessage}</Text>
        <Text style={{ color: '#94A3B8', textAlign: 'center', marginBottom: 40, lineHeight: 22 }}>
          {successSubtext}
        </Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Dashboard')}
          style={{ backgroundColor: '#76b33a', width: '100%', padding: 20, borderRadius: 24, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginBottom: 15 }}
        >
          <ShoppingBag color="#fff" size={20} />
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, marginLeft: 10 }}>Return to Merchant Hub</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('Receipt', { transaction: lastTx })}
          style={{ width: '100%', padding: 20, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: '#334155' }}
        >
          <Text style={{ color: '#94A3B8', fontWeight: 'bold', fontSize: 18 }}>View Receipt</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A192F' }}>
      <View style={{ padding: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 45, height: 45, backgroundColor: '#1E293B', borderRadius: 15, alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft color="#fff" size={20} />
          </TouchableOpacity>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginLeft: 15 }}>Pending Actions</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {transactions.length === 0 && !loading && (
          <View style={{ padding: 80, alignItems: 'center' }}>
            <RefreshCcw color="#334155" size={60} />
            <Text style={{ color: '#94A3B8', marginTop: 20, textAlign: 'center' }}>All caught up! No pending transactions.</Text>
          </View>
        )}

        {transactions.map((item) => {
          const isDeposit = item.type === 'deposit';
          
          return (
            <View key={item.id} style={{ backgroundColor: '#1E293B', marginHorizontal: 25, marginBottom: 20, padding: 25, borderRadius: 32, borderBottomWidth: 4, borderBottomColor: '#161e2b' }}>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <View style={{ backgroundColor: isDeposit ? 'rgba(118, 179, 58, 0.1)' : 'rgba(223, 124, 39, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100 }}>
                  <Text style={{ color: isDeposit ? '#76b33a' : '#df7c27', fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase' }}>
                    {isDeposit ? 'Deposit' : 'Withdrawal'}
                  </Text>
                </View>
                <Text style={{ color: '#334155', fontSize: 8, fontFamily: 'monospace' }}>#{item.id}</Text>
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: 'bold' }}>CUSTOMER</Text>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>{item.userName}</Text>
                {isDeposit && item.userPhone && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Smartphone color="#76b33a" size={12} />
                    <Text style={{ color: '#76b33a', fontSize: 12, fontWeight: 'bold', marginLeft: 5 }}>{item.userPhone}</Text>
                  </View>
                )}
              </View>

              <View style={{ backgroundColor: '#0A192F', padding: 20, borderRadius: 24, marginBottom: 25 }}>
                <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: 'bold', marginBottom: 5 }}>AMOUNT TO FULFILL</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Text style={{ color: isDeposit ? '#76b33a' : '#df7c27', fontSize: 18, fontWeight: 'bold', marginRight: 5 }}>A</Text>
                  <Text style={{ color: '#fff', fontSize: 32, fontWeight: 'bold' }}>{item.amount.toLocaleString()}</Text>
                </View>
                
                {!isDeposit && item.payoutDetails && (
                  <View style={{ marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#1E293B' }}>
                    <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: 'bold', marginBottom: 10 }}>PAYOUT DETAILS:</Text>
                    {item.payoutDetails.type === 'bank' ? (
                      <View>
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>{item.payoutDetails.bankName}</Text>
                        <Text style={{ color: '#76b33a', fontSize: 18, fontWeight: 'bold', marginVertical: 4 }}>{item.payoutDetails.accountNo}</Text>
                        <Text style={{ color: '#94A3B8', fontSize: 12 }}>{item.payoutDetails.accountName}</Text>
                      </View>
                    ) : (
                      <View>
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>{item.payoutDetails.momoProvider}</Text>
                        <Text style={{ color: '#76b33a', fontSize: 18, fontWeight: 'bold', marginVertical: 4 }}>{item.payoutDetails.momoNumber}</Text>
                        <Text style={{ color: '#94A3B8', fontSize: 12 }}>{item.payoutDetails.momoName}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>

              {item.status === 'cancelled' ? (
                <View className="bg-slate-800/50 p-5 rounded-[24px] border border-slate-700 items-center">
                  <XCircle color="#94A3B8" size={32} />
                  <Text className="text-white font-bold mt-2">ORDER CANCELLED</Text>
                  <Text className="text-textSecondary text-[10px] text-center mt-1 mb-4">This withdrawal was successfully cancelled and the credits have been released.</Text>
                  <TouchableOpacity 
                    className="w-full bg-slate-700 py-3 rounded-xl items-center"
                    onPress={() => updateDoc(doc(db, 'ongoing_transactions', item.id), { status: 'archived' })}
                  >
                    <Text className="text-white font-bold text-xs">Dismiss Order</Text>
                  </TouchableOpacity>
                </View>
              ) : item.status === 'cancellation_requested' ? (
                <View className="bg-red-500/10 p-5 rounded-[24px] border border-red-500/20">
                  <View className="flex-row items-center mb-3">
                    <AlertCircle color="#EF4444" size={20} />
                    <Text className="text-red-500 font-bold ml-2">User Requested Cancellation</Text>
                  </View>
                  <Text className="text-textSecondary text-xs mb-5">
                    The user wants to cancel this order. If you haven't made payment yet, you should allow it. If you have already paid, you can deny the request.
                  </Text>
                  <View className="flex-row">
                    <TouchableOpacity 
                      className="flex-1 bg-red-500 py-3 rounded-xl items-center mr-2"
                      onPress={() => handleCancellationResponse(item.id, true)}
                    >
                      <Text className="text-white font-bold text-xs">Allow Cancellation</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      className="flex-1 bg-slate-700 py-3 rounded-xl items-center"
                      onPress={() => handleCancellationResponse(item.id, false)}
                    >
                      <Text className="text-white font-bold text-xs">Do Not Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity 
                  disabled={processingId === item.id}
                  style={{ backgroundColor: isDeposit ? '#76b33a' : '#df7c27', padding: 20, borderRadius: 20, alignItems: 'center', shadowColor: isDeposit ? '#76b33a' : '#df7c27', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 8 }}
                  onPress={async () => {
                    setProcessingId(item.id);
                    try {
                      const txRef = doc(db, 'ongoing_transactions', item.id);
                      
                      if (isDeposit) {
                        await runTransaction(db, async (transaction) => {
                          const mRef = doc(db, 'users', item.merchantId);
                          const uRef = doc(db, 'users', item.userId);
                          const mSnap = await transaction.get(mRef);
                          const inv = Number(mSnap.data().merchantInventory || 0);
                          const amt = Number(item.amount);
                          if (inv < amt) throw new Error('Insufficient Inventory');
                          transaction.update(mRef, { merchantInventory: increment(-amt) });
                          transaction.update(uRef, { balance: increment(amt) });
                          transaction.update(txRef, { status: 'completed', completedAt: new Date().toISOString() });
                        });
                        setLastTx({ ...item, status: 'completed' });
                        setSuccessMessage('Credits Delivered!');
                        setSuccessSubtext(`You have successfully transferred A ${item.amount} to ${item.userName}.`);
                        setShowSuccess(true);
                      } else {
                        await setDoc(txRef, { status: 'merchant_paid', merchantPaidAt: new Date().toISOString() }, { merge: true });
                        setLastTx({ ...item, status: 'merchant_paid' });
                        setSuccessMessage('Payout Confirmed!');
                        setSuccessSubtext(`We have notified ${item.userName} that you have paid. Waiting for their confirmation.`);
                        setShowSuccess(true);
                      }
                    } catch (e: any) {
                      Alert.alert('DATABASE ERROR', e.message);
                    } finally {
                      setProcessingId(null);
                    }
                  }}
                >
                  {processingId === item.id ? <ActivityIndicator color="#fff" /> : (
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                      {isDeposit ? 'CONFIRM RECEIVED' : 'I HAVE PAID USER'}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          );
        })}
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default MerchantOngoingTransactions;
