import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Modal } from 'react-native';
import { db, auth } from '../../config/firebase';
import { doc, onSnapshot, runTransaction, increment, getDoc, updateDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { CheckCircle2, Clock, ArrowLeft, Wallet, XCircle, Info, RefreshCw, Home, ArrowUpCircle, ArrowDownCircle, PlaneTakeoff, Landmark, Smartphone, AlertCircle } from 'lucide-react-native';
import { CommonActions } from '@react-navigation/native';
import { useWalletStore } from '../../store/useWalletStore';

const TransactionStatus = ({ route, navigation }: any) => {
  const { transactionId } = route.params || {};
  const [tx, setTx] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [bridging, setBridging] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const requestCancellation = useWalletStore(state => state.requestCancellation);

  const fetchTx = async () => {
    if (!transactionId) return;
    try {
      const snap = await getDoc(doc(db, 'ongoing_transactions', transactionId));
      if (snap.exists()) setTx({ id: snap.id, ...snap.data() });
    } catch (e) {} finally { setLoading(false); }
  };

  useEffect(() => {
    fetchTx();
    if (!transactionId) return;
    const unsub = onSnapshot(doc(db, 'ongoing_transactions', transactionId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setTx({ id: snap.id, ...data });
        
        // 1. AUTO-ASSIGN LOGIC: If no merchant assigned yet
        if (data.merchantId === 'SYSTEM_AUTO_ASSIGN' && !processing) {
          handleAutoAssignMerchant(snap.id, data);
        }

        // 2. AUTO-BRIDGE LOGIC: If local deposit completed and it's a bridge request
        if (data.status === 'completed' && data.isChained && !bridging) {
          handleAutoBridge(snap.id, data);
        }
      } else {
        setTx(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [transactionId, bridging, processing]);

  const handleAutoAssignMerchant = async (tid: string, data: any) => {
    setProcessing(true);
    try {
      const targetCountry = data.type === 'deposit' ? data.senderCountry : data.destinationCountry;
      if (!targetCountry) throw new Error('Target country missing for auto-assignment');

      const q = query(
        collection(db, 'users'), 
        where('merchantStatus', '==', 'approved'), 
        where('country', '==', targetCountry)
      );
      const snap = await getDocs(q);
      const merchants = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      console.log(`Found ${merchants.length} approved merchants in ${targetCountry}`);

      if (merchants.length === 0) {
        Alert.alert('No Merchants Found', `We couldn't find any approved merchants in ${targetCountry} to handle this transfer.`);
        throw new Error(`No merchants available in ${targetCountry}`);
      }

      const chosen = merchants[Math.floor(Math.random() * merchants.length)];
      
      await updateDoc(doc(db, 'ongoing_transactions', tid), {
        merchantId: chosen.id,
        merchantDetails: (chosen as any).paymentDetails || {}
      });
    } catch (e: any) {
      console.error('Auto-Assign Error:', e.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleAutoBridge = async (oldId: string, data: any) => {
    setBridging(true);
    
    try {
      // 1. Mark the bridge as 'bridging' so it doesn't trigger twice
      await updateDoc(doc(db, 'ongoing_transactions', oldId), { isChained: false, status: 'archived' });

      // 2. Find merchant in destination country
      const destCountry = data.bridgeData.destinationCountry;
      const q = query(
        collection(db, 'users'), 
        where('merchantStatus', '==', 'approved'), 
        where('country', '==', destCountry)
      );
      const snap = await getDocs(q);
      const merchants = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      if (merchants.length === 0) throw new Error(`No merchants available in ${destCountry} right now.`);

      const destMerchant = merchants[Math.floor(Math.random() * merchants.length)];

      // 3. Create the Withdrawal Request in destination country
      const newTxId = 'WD_BRIDGE_' + Date.now();
      await setDoc(doc(db, 'ongoing_transactions', newTxId), {
        userId: auth.currentUser?.uid,
        userName: data.userName,
        userPhone: data.userPhone,
        merchantId: destMerchant.id,
        amount: data.bridgeData.totalAmount,
        type: 'withdraw',
        status: 'awaiting_merchant_payment',
        timestamp: new Date().toISOString(),
        destinationCountry: destCountry,
        payoutDetails: data.bridgeData.payoutDetails,
        isBridgePayout: true
      });

      // 4. Switch the current tracker to the new transaction
      navigation.replace('TransactionStatus', { transactionId: newTxId });
    } catch (e: any) {
      Alert.alert('Bridge Error', e.message);
      setBridging(false);
    }
  };

  const confirmWithdrawalReceived = async () => {
    if (processing || tx?.status === 'completed') return;
    setProcessing(true);
    try {
      await runTransaction(db, async (t) => {
        const tRef = doc(db, 'ongoing_transactions', tx.id);
        const mRef = doc(db, 'users', tx.merchantId);
        const snap = await t.get(tRef);
        if (snap.data().status === 'completed') throw new Error('Already completed');
        
        // Note: Balance was already deducted from user at initiation (Escrow)
        // Now we just credit the merchant
        t.update(mRef, { merchantInventory: increment(tx.amount) });
        t.update(tRef, { status: 'completed', completedAt: new Date().toISOString(), inEscrow: false });
      });
    } catch (e: any) { 
      Alert.alert('Error', e.message); 
      setProcessing(false);
    }
  };

  const handleCancelOrder = () => {
    if (!tx || !tx.id) return;
    
    // For immediate cancellation (searching)
    if (!tx.merchantId || tx.merchantId === 'SYSTEM_AUTO_ASSIGN') {
      Alert.alert(
        "Cancel Order?",
        "Are you sure you want to cancel this transfer?",
        [
          { text: "No", style: "cancel" },
          { 
            text: "Yes, Cancel", 
            style: "destructive",
            onPress: async () => {
              try {
                await updateDoc(doc(db, 'ongoing_transactions', tx.id), { 
                  status: 'cancelled', 
                  cancelledAt: new Date().toISOString() 
                });
                handleFinish();
              } catch (e: any) {
                Alert.alert("Error", e.message);
              }
            }
          }
        ]
      );
      return;
    }

    // For Request for Cancellation (merchant assigned)
    Alert.alert(
      "Request Cancellation?",
      "The merchant has been assigned. We need their approval to ensure funds haven't already been sent. Request now?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Request for Cancellation", 
          onPress: async () => {
            try {
              await requestCancellation(tx.id);
              Alert.alert("Request Sent", "Cancellation request sent, wait for merchant to confirm.");
            } catch (e: any) {
              Alert.alert("Error", "Failed to send request: " + e.message);
            }
          }
        }
      ]
    );
  };

  const handleFinish = () => {
    if (tx) {
      updateDoc(doc(db, 'ongoing_transactions', tx.id), { status: 'archived' }).catch(() => {});
    }
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Dashboard' }] }));
  };

  if (loading || bridging) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A192F', alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color="#76b33a" size="large" />
      {bridging && <Text style={{ color: '#fff', marginTop: 20, fontWeight: 'bold' }}>Connecting International Merchant...</Text>}
    </SafeAreaView>
  );

  if (!tx || tx.status === 'archived') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0A192F', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
         <CheckCircle2 color="#76b33a" size={60} />
         <TouchableOpacity onPress={handleFinish} style={{ marginTop: 30, backgroundColor: '#76b33a', padding: 20, borderRadius: 15, width: '100%', alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Return to Home</Text>
         </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isDeposit = tx.type === 'deposit';
  const isCompleted = tx.status === 'completed';
  const isCancelled = tx.status === 'cancelled';
  const isPaid = tx.status === 'merchant_paid' || tx.status === 'awaiting_merchant_payment';
  const isAssigning = tx.merchantId === 'SYSTEM_AUTO_ASSIGN';
  const canRequestCancel = !isDeposit && !isCompleted && !isCancelled;

  if (isCompleted || isCancelled) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0A192F', padding: 30 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {isCompleted ? <CheckCircle2 color="#76b33a" size={90} /> : <XCircle color="#ef4444" size={90} />}
          <Text style={{ color: '#fff', fontSize: 32, fontWeight: 'bold', marginTop: 30 }}>{isCompleted ? 'Success!' : 'Cancelled'}</Text>
          <Text style={{ color: isCompleted ? '#76b33a' : '#ef4444', fontSize: 18, fontWeight: 'bold' }}>{isCompleted ? 'Transaction Completed' : 'Order Cancelled Successfully'}</Text>
          <TouchableOpacity onPress={handleFinish} style={{ backgroundColor: isCompleted ? '#76b33a' : '#334155', width: '100%', padding: 22, borderRadius: 24, marginTop: 50, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Return to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A192F' }}>
      <View style={{ paddingHorizontal: 25, paddingVertical: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={() => navigation.goBack()}><ArrowLeft color="#fff" size={20} /></TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Transfer Status</Text>
        {canRequestCancel && (
          <TouchableOpacity 
            onPress={() => setShowCancelModal(true)}
            style={{ backgroundColor: '#ef4444', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <XCircle color="#fff" size={14} />
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold', marginLeft: 4 }}>
              {(!tx.merchantId || tx.merchantId === 'SYSTEM_AUTO_ASSIGN') ? 'CANCEL' : 'REQUEST CANCEL'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* CUSTOM CANCELLATION MODAL */}
      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 30 }}>
          <View style={{ backgroundColor: '#1E293B', width: '100%', borderRadius: 40, padding: 35, alignItems: 'center', borderWidth: 1, borderColor: '#334155' }}>
            <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 20, borderRadius: 30, marginBottom: 20 }}>
              <XCircle color="#ef4444" size={40} />
            </View>
            
            <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 }}>
              {(!tx?.merchantId || tx?.merchantId === 'SYSTEM_AUTO_ASSIGN') ? "Cancel Order?" : "Request Cancellation?"}
            </Text>
            
            <Text style={{ color: '#94A3B8', textAlign: 'center', marginBottom: 30, lineHeight: 22, fontSize: 16 }}>
              {(!tx?.merchantId || tx?.merchantId === 'SYSTEM_AUTO_ASSIGN') 
                ? "Are you sure you want to cancel this transfer? This action cannot be undone." 
                : "The merchant has been assigned. We need their approval to ensure funds haven't already been sent. Send request now?"}
            </Text>

            <TouchableOpacity 
              onPress={async () => {
                setShowCancelModal(false);
                try {
                  if (!tx.merchantId || tx.merchantId === 'SYSTEM_AUTO_ASSIGN') {
                    await runTransaction(db, async (transaction) => {
                      const tRef = doc(db, 'ongoing_transactions', tx.id);
                      const uRef = doc(db, 'users', tx.userId);
                      if (tx.type === 'withdraw' && tx.inEscrow) {
                        transaction.update(uRef, { balance: increment(tx.amount) });
                      }
                      transaction.update(tRef, { status: 'cancelled', cancelledAt: new Date().toISOString(), inEscrow: false });
                    });
                    handleFinish();
                  } else {
                    await requestCancellation(tx.id);
                    Alert.alert("Success", "Cancellation request sent to merchant.");
                  }
                } catch (e: any) {
                  Alert.alert("Error", e.message);
                }
              }}
              style={{ backgroundColor: '#ef4444', width: '100%', padding: 20, borderRadius: 24, alignItems: 'center', marginBottom: 15 }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Confirm Action</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setShowCancelModal(false)}
              style={{ width: '100%', padding: 20, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: '#334155' }}
            >
              <Text style={{ color: '#94A3B8', fontWeight: 'bold', fontSize: 18 }}>Nevermind</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Progress Header */}
        <View style={{ marginHorizontal: 25, backgroundColor: '#1E293B', padding: 30, borderRadius: 40, alignItems: 'center', marginBottom: 30 }}>
           <View style={{ backgroundColor: '#0A192F', padding: 15, borderRadius: 20, marginBottom: 15 }}>
              {tx.isChained ? <ArrowDownCircle color="#76b33a" size={32} /> : <PlaneTakeoff color="#df7c27" size={32} />}
           </View>
           <Text style={{ color: '#fff', fontSize: 36, fontWeight: 'bold' }}>A {tx.amount}</Text>
           <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 5, fontWeight: 'bold' }}>
              {tx.status === 'cancellation_requested' ? 'CANCELLATION PENDING' : (tx.isChained ? (tx.status === 'awaiting_confirmation' ? 'PHASE 1: LOCAL DEPOSIT' : 'PHASE 2: INT\'L PAYOUT') : 'QUICK TRANSFER ACTIVE')}
           </Text>
        </View>
        
        {/* ESCROW INFO BLOCK */}
        {tx.type === 'withdraw' && tx.inEscrow && (
          <View style={{ marginHorizontal: 25, backgroundColor: 'rgba(118, 179, 58, 0.05)', padding: 25, borderRadius: 32, borderWidth: 1, borderStyle: 'dashed', borderColor: '#76b33a44', marginBottom: 30, alignItems: 'center' }}>
            <View style={{ backgroundColor: 'rgba(118, 179, 58, 0.1)', padding: 12, borderRadius: 20, marginBottom: 12 }}>
              <Wallet color="#76b33a" size={20} />
            </View>
            <Text style={{ color: '#76b33a', fontSize: 20, fontWeight: 'bold' }}>A {tx.amount} In Escrow</Text>
            <Text style={{ color: '#94A3B8', textAlign: 'center', fontSize: 13, marginTop: 8, lineHeight: 18 }}>
              This amount has been deducted from your balance. It is currently locked and inaccessible to both you and the merchant.
            </Text>
          </View>
        )}

        {/* Cancellation Alert */}
        {tx.status === 'cancellation_requested' && (
          <View style={{ marginHorizontal: 25, backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 25, borderRadius: 32, borderWidth: 1, borderColor: '#ef444433', marginBottom: 30 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <AlertCircle color="#ef4444" size={18} />
              <Text style={{ color: '#ef4444', fontSize: 16, fontWeight: 'bold', marginLeft: 8 }}>Cancellation Requested</Text>
            </View>
            <Text style={{ color: '#94A3B8', lineHeight: 20 }}>
              You have requested to cancel this order. We are waiting for the merchant to approve the cancellation to ensure no funds are lost.
            </Text>
          </View>
        )}

        {/* Cancellation Denied Alert */}
        {tx.cancellationDeniedAt && (
          <View style={{ marginHorizontal: 25, backgroundColor: 'rgba(234, 179, 8, 0.1)', padding: 25, borderRadius: 32, borderWidth: 1, borderColor: '#eab30833', marginBottom: 30 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <AlertCircle color="#eab308" size={18} />
              <Text style={{ color: '#eab308', fontSize: 16, fontWeight: 'bold', marginLeft: 8 }}>Cancellation Denied</Text>
            </View>
            <Text style={{ color: '#94A3B8', lineHeight: 20, marginBottom: 15 }}>
              The merchant did not allow cancellation as they have already paid or are in the process of paying your local currency.
            </Text>
            <TouchableOpacity 
              onPress={() => updateDoc(doc(db, 'ongoing_transactions', tx.id), { cancellationDeniedAt: null })}
              style={{ backgroundColor: 'rgba(234, 179, 8, 0.2)', paddingVertical: 10, borderRadius: 12, alignItems: 'center' }}
            >
              <Text style={{ color: '#eab308', fontWeight: 'bold', fontSize: 12 }}>I Understand</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action Required */}
        {tx.status === 'awaiting_confirmation' && (
           <View style={{ marginHorizontal: 25, backgroundColor: 'rgba(223, 124, 39, 0.1)', padding: 25, borderRadius: 32, borderWidth: 1, borderColor: '#df7c2733', marginBottom: 30 }}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Action Required</Text>
              <Text style={{ color: '#94A3B8', lineHeight: 22, marginBottom: 20 }}>
                {isAssigning 
                  ? 'Searching for a local merchant to handle your deposit...' 
                  : `Please pay the local merchant so we can bridge your funds to ${tx.destinationCountry}.`}
              </Text>
              
              <View style={{ backgroundColor: '#0A192F', padding: 15, borderRadius: 16 }}>
                 <Text style={{ color: '#94A3B8', fontSize: 10 }}>PAYMENT DETAILS</Text>
                 {isAssigning ? (
                   <View className="flex-row items-center mt-2">
                     <ActivityIndicator size="small" color="#df7c27" />
                     <Text className="text-orange font-bold ml-2">Finding Merchant...</Text>
                   </View>
                 ) : (
                   <>
                     <Text style={{ color: '#fff', fontWeight: 'bold', marginTop: 5 }}>{tx.merchantDetails?.momoProvider || tx.merchantDetails?.bankName || 'Merchant Details'}</Text>
                     <Text style={{ color: '#76b33a', fontSize: 18, fontWeight: 'bold' }}>{tx.merchantDetails?.momoNumber || tx.merchantDetails?.accountNo || 'N/A'}</Text>
                   </>
                 )}
              </View>
           </View>
        )}

        {tx.status === 'awaiting_merchant_payment' && (
          <View style={{ marginHorizontal: 25, backgroundColor: 'rgba(118, 179, 58, 0.1)', padding: 25, borderRadius: 32, marginBottom: 30 }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Processing Payout</Text>
            <Text style={{ color: '#94A3B8', lineHeight: 22, marginBottom: 20 }}>
              {isAssigning 
                ? 'Assigning an international merchant to fulfill your payout...' 
                : `We've assigned a merchant in ${tx.destinationCountry} to send funds to your recipient.`}
            </Text>
            <View style={{ backgroundColor: '#0A192F', padding: 20, borderRadius: 16 }}>
              {isAssigning ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="#76b33a" />
                  <Text className="text-accent font-bold ml-2">Connecting Merchant...</Text>
                </View>
              ) : (
                <View className="flex-row items-center">
                  <Clock color="#76b33a" size={20} />
                  <Text className="text-textPrimary font-bold ml-3">Merchant is Processing</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {tx.status === 'merchant_paid' && (
          <View style={{ marginHorizontal: 25, backgroundColor: 'rgba(118, 179, 58, 0.1)', padding: 25, borderRadius: 32, marginBottom: 30 }}>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 }}>Payout Confirmed?</Text>
            <Text style={{ color: '#94A3B8', textAlign: 'center', marginBottom: 25 }}>The merchant has confirmed the payout. Once you confirm receipt, the A-Credits will be automatically sent to the merchant.</Text>
            <TouchableOpacity onPress={confirmWithdrawalReceived} disabled={processing} style={{ backgroundColor: '#76b33a', padding: 20, borderRadius: 20, alignItems: 'center' }}>
               {processing ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>Yes, Release A-Credit</Text>}
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => Alert.alert("Still Waiting?", "Local bank transfers can sometimes take 15-30 minutes to reflect. If you still haven't received your funds after 30 minutes, please contact our support team immediately.")}
              style={{ marginTop: 20, alignItems: 'center' }}
            >
              <Text style={{ color: '#94A3B8', fontSize: 14, fontWeight: 'medium', textDecorationLine: 'underline' }}>Funds not received yet.</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Timeline */}
        <View style={{ marginHorizontal: 40 }}>
           <View style={{ flexDirection: 'row', marginBottom: 30 }}>
              <CheckCircle2 color="#76b33a" size={18} />
              <Text style={{ color: '#fff', marginLeft: 15 }}>Transfer Initiated</Text>
           </View>
           <View style={{ flexDirection: 'row', marginBottom: 30 }}>
              <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: (tx.status === 'completed' || tx.status === 'merchant_paid' || (!tx.isChained && tx.merchantId !== 'SYSTEM_AUTO_ASSIGN')) ? '#76b33a' : '#334155', alignItems: 'center', justifyContent: 'center' }}>
                {(tx.status === 'completed' || (!tx.isChained && tx.merchantId !== 'SYSTEM_AUTO_ASSIGN')) && <CheckCircle2 color="#fff" size={12} />}
              </View>
              <Text style={{ color: (!tx.isChained && tx.merchantId !== 'SYSTEM_AUTO_ASSIGN') ? '#fff' : '#334155', marginLeft: 15 }}>Merchant Assigned</Text>
           </View>
           <View style={{ flexDirection: 'row' }}>
              <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: tx.status === 'merchant_paid' ? '#76b33a' : '#334155', alignItems: 'center', justifyContent: 'center' }}>
                {tx.status === 'merchant_paid' && <CheckCircle2 color="#fff" size={12} />}
              </View>
              <Text style={{ color: tx.status === 'merchant_paid' ? '#fff' : '#334155', marginLeft: 15 }}>Payout Confirmed</Text>
           </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default TransactionStatus;
