import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Image, Dimensions } from 'react-native';
import { 
  ArrowLeft, 
  CheckCircle2,
  XCircle,
  FileText,
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  ShoppingBag,
  Clock,
  Home,
  User as UserIcon,
  Camera,
  ExternalLink
} from 'lucide-react-native';
import { useWalletStore } from '../../store/useWalletStore';
import { db } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

const { width } = Dimensions.get('window');

/**
 * ULTRA-SAFE VERSION
 * No SafeAreaView, no NativeWind, no Animations.
 * Just standard View and style props.
 */
const AdminUserDetails = ({ route, navigation }: any) => {
  const userId = route?.params?.userId;
  const fetchAllUsers = useWalletStore(state => state.fetchAllUsers);
  const updateUserStatus = useWalletStore(state => state.updateUserStatus);
  const fetchUserTransactions = useWalletStore(state => state.fetchUserTransactions);
  const allocateCredits = useWalletStore(state => state.allocateCredits);
  const handleKYCResponse = useWalletStore(state => state.handleKYCResponse);
  
  const [user, setUser] = useState<any>(null);
  const [userTxs, setUserTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allocationAmount, setAllocationAmount] = useState('1000');
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [showRejectOptions, setShowRejectOptions] = useState(false);
  const [customReason, setCustomReason] = useState('');
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  
  // Use ShieldCheck for admin home navigation
  const AdminHomeIcon = () => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('Dashboard')}
      style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' }}
    >
      <Home color="#eab308" size={20} />
    </TouchableOpacity>
  );

  useEffect(() => {
    console.log('Mounting AdminUserDetails for ID:', userId);
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userRef = doc(db, 'users', userId);
      const [userSnap, txs] = await Promise.all([
        getDoc(userRef),
        fetchUserTransactions(userId)
      ]);

      if (userSnap.exists()) {
        const userData = { id: userSnap.id, ...userSnap.data() };
        console.log('--- ADMIN LOADED USER DATA ---', userData);
        setUser(userData);
        setUserTxs(txs);
      } else {
        setError(`User document [${userId}] does not exist in Firestore.`);
      }
    } catch (err: any) {
      console.error('Admin Load Error:', err);
      setError(`Fetch Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderDocImage = (url: string, label: string) => (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ color: '#94A3B8', fontSize: 10, marginBottom: 8 }}>{label.toUpperCase()}</Text>
      <TouchableOpacity 
        onPress={() => setActiveImage(url)}
        style={{ width: '100%', height: 200, backgroundColor: '#112240', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#334155' }}
      >
        <Image source={{ uri: url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        <View style={{ position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.5)', padding: 5, borderRadius: 5 }}>
          <ExternalLink color="#fff" size={14} />
        </View>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A192F', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#76b33a" />
        <Text style={{ color: '#94A3B8', marginTop: 10 }}>Loading Profile...</Text>
      </View>
    );
  }

  if (error || !user) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A192F', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <Text style={{ color: '#ef4444', fontSize: 24, fontWeight: 'bold' }}>Error</Text>
        <Text style={{ color: '#F8FAFC', marginTop: 20, textAlign: 'center', fontSize: 16 }}>{error || 'User not found'}</Text>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={{ marginTop: 30, paddingVertical: 15, paddingHorizontal: 40, backgroundColor: '#1E293B', borderRadius: 12 }}
        >
          <Text style={{ color: '#F8FAFC', fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0A192F' }}>
      {/* Full Screen Image Modal Overlay */}
      {activeImage && (
        <TouchableOpacity 
          activeOpacity={1}
          onPress={() => setActiveImage(null)}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 999, alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <Image source={{ uri: activeImage }} style={{ width: '100%', height: '80%' }} resizeMode="contain" />
          <TouchableOpacity 
            onPress={() => setActiveImage(null)}
            style={{ position: 'absolute', top: 50, right: 30, padding: 10 }}
          >
            <XCircle color="#fff" size={40} />
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* Custom Header */}
      <View style={{ height: 100, paddingTop: 40, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#112240' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 10 }}>
            <ArrowLeft color="#F8FAFC" size={24} />
          </TouchableOpacity>
          <Text style={{ color: '#F8FAFC', fontSize: 20, fontWeight: 'bold', marginLeft: 15 }}>Admin Review</Text>
        </View>
        <AdminHomeIcon />
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 25 }}>
          {/* User Info Card */}
          <View style={{ backgroundColor: '#1E293B', padding: 25, borderRadius: 24, marginBottom: 20 }}>
            <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: 'bold', marginBottom: 20 }}>PERSONAL INFORMATION</Text>
            
            <View style={{ marginBottom: 15 }}>
              <Text style={{ color: '#94A3B8', fontSize: 10 }}>FULL NAME</Text>
              <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: 'bold' }}>{user.name}</Text>
            </View>

            <View style={{ marginBottom: 15 }}>
              <Text style={{ color: '#94A3B8', fontSize: 10 }}>EMAIL ADDRESS</Text>
              <Text style={{ color: '#F8FAFC', fontSize: 16 }}>{user.email}</Text>
            </View>

            <View style={{ marginBottom: 15 }}>
              <Text style={{ color: '#94A3B8', fontSize: 10 }}>PHONE NUMBER</Text>
              <Text style={{ color: '#F8FAFC', fontSize: 16 }}>{user.phone || 'Not Provided'}</Text>
            </View>

            <View>
              <Text style={{ color: '#94A3B8', fontSize: 10 }}>ACCOUNT ID (AID)</Text>
              <Text style={{ color: '#76b33a', fontSize: 16, fontWeight: 'bold' }}>{user.aid}</Text>
            </View>
          </View>

          {/* KYC Status Section (Always visible if docs exist) */}
          {user.kycDocuments && (
            <View style={{ backgroundColor: '#1E293B', padding: 25, borderRadius: 24, marginBottom: 20, borderWidth: 1, borderColor: user.kycStatus === 'approved' ? '#76b33a' : (user.kycStatus === 'rejected' ? '#ef4444' : '#76b33a33') }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ color: '#76b33a', fontSize: 12, fontWeight: 'bold' }}>IDENTITY VERIFICATION (KYC)</Text>
                <View style={{ backgroundColor: user.kycStatus === 'approved' ? '#76b33a22' : (user.kycStatus === 'rejected' ? '#ef444422' : '#eab30822'), paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                  <Text style={{ color: user.kycStatus === 'approved' ? '#76b33a' : (user.kycStatus === 'rejected' ? '#ef4444' : '#eab308'), fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>
                    {user.kycStatus || 'Submitted'}
                  </Text>
                </View>
              </View>
              
              {user.kycDocuments.idUrl && renderDocImage(user.kycDocuments.idUrl, 'Government ID')}
              {user.kycDocuments.selfieUrl && renderDocImage(user.kycDocuments.selfieUrl, 'Biometric Selfie')}
              
              <View style={{ marginTop: 10 }}>
                <Text style={{ color: '#94A3B8', fontSize: 10 }}>SUBMISSION DATE</Text>
                <Text style={{ color: '#F8FAFC', fontSize: 14 }}>{user.kycDocuments.submittedAt ? new Date(user.kycDocuments.submittedAt).toLocaleString() : 'Unknown'}</Text>
              </View>
            </View>
          )}

          {/* Merchant Application Card */}
          {user.merchantApplication && (
            <View style={{ backgroundColor: '#1E293B', padding: 25, borderRadius: 24, marginBottom: 20, borderWidth: 1, borderColor: user.merchantStatus === 'approved' ? '#76b33a' : (user.merchantStatus === 'declined' ? '#ef4444' : '#eab30833') }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ color: '#eab308', fontSize: 12, fontWeight: 'bold' }}>BUSINESS APPLICATION</Text>
                <View style={{ backgroundColor: user.merchantStatus === 'approved' ? '#76b33a22' : (user.merchantStatus === 'declined' ? '#ef444422' : '#eab30822'), paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                  <Text style={{ color: user.merchantStatus === 'approved' ? '#76b33a' : (user.merchantStatus === 'declined' ? '#ef4444' : '#eab308'), fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>
                    {user.merchantStatus || 'Pending'}
                  </Text>
                </View>
              </View>
              
              <View style={{ marginBottom: 15 }}>
                <Text style={{ color: '#94A3B8', fontSize: 10 }}>BUSINESS NAME</Text>
                <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: 'bold' }}>{user.merchantApplication.businessName}</Text>
              </View>

              <View style={{ marginBottom: 15 }}>
                <Text style={{ color: '#94A3B8', fontSize: 10 }}>BUSINESS GMAIL</Text>
                <Text style={{ color: '#F8FAFC', fontSize: 16 }}>{user.merchantApplication.email}</Text>
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: '#94A3B8', fontSize: 10 }}>OPERATIONAL COUNTRY</Text>
                <Text style={{ color: '#F8FAFC', fontSize: 16 }}>{user.merchantApplication.country}</Text>
              </View>

              {user.merchantApplication.documents?.idUrl && renderDocImage(user.merchantApplication.documents.idUrl, 'Merchant Gov ID')}
              {user.merchantApplication.documents?.certUrl && renderDocImage(user.merchantApplication.documents.certUrl, 'Business Certificate')}
              {user.merchantApplication.documents?.selfieUrl && renderDocImage(user.merchantApplication.documents.selfieUrl, 'Owner Biometric Selfie')}
            </View>
          )}

          {/* Pending Review Actions (Moved up) */}
          {(user.kycStatus === 'pending' || user.merchantStatus === 'pending') && !showRejectOptions && (
            <View style={{ marginBottom: 30 }}>
              <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: 'bold', marginBottom: 15 }}>
                {user.kycStatus === 'pending' ? 'ACTION REQUIRED: KYC REVIEW' : 'ACTION REQUIRED: MERCHANT REVIEW'}
              </Text>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity 
                  onPress={async () => {
                    if (user.kycStatus === 'pending') {
                      await handleKYCResponse(user.id, true);
                    } else {
                      await updateUserStatus(user.id, { merchantStatus: 'approved' });
                    }
                    loadUser(); 
                  }}
                  style={{ flex: 1, marginRight: 10, backgroundColor: '#76b33a22', padding: 20, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#76b33a' }}
                >
                  <CheckCircle2 color="#76b33a" size={24} />
                  <Text style={{ color: '#76b33a', fontWeight: 'bold', marginTop: 8 }}>Approve</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => setShowRejectOptions(true)}
                  style={{ flex: 1, marginLeft: 10, backgroundColor: '#ef444422', padding: 20, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#ef4444' }}
                >
                  <XCircle color="#ef4444" size={24} />
                  <Text style={{ color: '#ef4444', fontWeight: 'bold', marginTop: 8 }}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Rejection Options Section */}
          {showRejectOptions && (
            <View style={{ backgroundColor: '#1E293B', padding: 25, borderRadius: 24, marginBottom: 30, borderWidth: 1, borderColor: '#ef4444' }}>
              <Text style={{ color: '#ef4444', fontSize: 14, fontWeight: 'bold', marginBottom: 20 }}>REJECTION REASON</Text>
              
              {[
                'Image Mismatch (Selfie and ID do not match)',
                'Image Not Clear (Blurry or unreadable)',
                'Other'
              ].map((reason) => (
                <TouchableOpacity 
                  key={reason}
                  onPress={() => setSelectedReason(reason)}
                  style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    paddingVertical: 12, 
                    paddingHorizontal: 15, 
                    backgroundColor: selectedReason === reason ? '#ef444422' : '#112240',
                    borderRadius: 12,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: selectedReason === reason ? '#ef4444' : '#334155'
                  }}
                >
                  <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: selectedReason === reason ? '#ef4444' : '#64748B', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    {selectedReason === reason && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444' }} />}
                  </View>
                  <Text style={{ color: selectedReason === reason ? '#fff' : '#94A3B8', fontSize: 14 }}>{reason}</Text>
                </TouchableOpacity>
              ))}

              {selectedReason === 'Other' && (
                <TextInput 
                  style={{ backgroundColor: '#112240', color: '#F8FAFC', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#ef4444', marginTop: 10, fontSize: 14 }}
                  placeholder="Type specific reason..."
                  placeholderTextColor="#64748B"
                  value={customReason}
                  onChangeText={setCustomReason}
                  multiline
                />
              )}

              <View style={{ flexDirection: 'row', marginTop: 20 }}>
                <TouchableOpacity 
                  onPress={() => {
                    setShowRejectOptions(false);
                    setSelectedReason(null);
                    setCustomReason('');
                  }}
                  style={{ flex: 1, padding: 15, alignItems: 'center' }}
                >
                  <Text style={{ color: '#94A3B8', fontWeight: 'bold' }}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={async () => {
                    if (!selectedReason) return Alert.alert('Error', 'Please select a reason');
                    const finalReason = selectedReason === 'Other' ? customReason : selectedReason;
                    if (!finalReason.trim()) return Alert.alert('Error', 'Please enter a reason');

                    if (user.kycStatus === 'pending') {
                      await handleKYCResponse(user.id, false, finalReason);
                    } else {
                      await updateUserStatus(user.id, { merchantStatus: 'declined', merchantRejectionReason: finalReason });
                    }
                    setShowRejectOptions(false);
                    loadUser();
                  }}
                  style={{ flex: 2, backgroundColor: '#ef4444', padding: 15, borderRadius: 12, alignItems: 'center' }}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Confirm Rejection</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Wallet Operations Card */}
          <View style={{ backgroundColor: '#1E293B', padding: 25, borderRadius: 24, marginBottom: 20 }}>
            <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: 'bold', marginBottom: 20 }}>WALLET OPERATIONS</Text>
            
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: '#94A3B8', fontSize: 10, marginBottom: 8 }}>ALLOCATION AMOUNT (A-CREDIT)</Text>
              <TextInput 
                value={allocationAmount}
                onChangeText={setAllocationAmount}
                keyboardType="numeric"
                placeholder="Enter amount"
                placeholderTextColor="#64748B"
                style={{ backgroundColor: '#112240', color: '#F8FAFC', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#334155', fontSize: 16 }}
              />
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
              <View>
                <Text style={{ color: '#94A3B8', fontSize: 10 }}>A-CREDIT BALANCE</Text>
                <Text style={{ color: '#F8FAFC', fontSize: 24, fontWeight: 'bold' }}>A {(user.balance || 0).toLocaleString()}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity 
                  onPress={() => {
                    const amt = Number(allocationAmount);
                    if (!amt || isNaN(amt) || amt <= 0) return Alert.alert('Invalid', 'Enter a valid amount');
                    allocateCredits(user.id, amt, 'balance').then(() => loadUser());
                  }}
                  style={{ backgroundColor: '#76b33a22', paddingHorizontal: 15, borderRadius: 10, marginLeft: 10, height: 40, justifyContent: 'center' }}>
                  <Text style={{ color: '#76b33a', fontWeight: 'bold' }}>ADD</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => {
                    const amt = Number(allocationAmount);
                    if (!amt || isNaN(amt) || amt <= 0) return Alert.alert('Invalid', 'Enter a valid amount');
                    allocateCredits(user.id, -amt, 'balance').then(() => loadUser());
                  }}
                  style={{ backgroundColor: '#ef444422', paddingHorizontal: 15, borderRadius: 10, marginLeft: 10, height: 40, justifyContent: 'center' }}>
                  <Text style={{ color: '#ef4444', fontWeight: 'bold' }}>DEDUCT</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ color: '#94A3B8', fontSize: 10 }}>MERCHANT INVENTORY</Text>
                <Text style={{ color: '#F8FAFC', fontSize: 24, fontWeight: 'bold' }}>A {(user.merchantInventory || 0).toLocaleString()}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity 
                  onPress={() => {
                    const amt = Number(allocationAmount);
                    if (!amt || isNaN(amt) || amt <= 0) return Alert.alert('Invalid', 'Enter a valid amount');
                    allocateCredits(user.id, amt, 'merchantInventory').then(() => loadUser());
                  }}
                  style={{ backgroundColor: '#76b33a22', paddingHorizontal: 15, borderRadius: 10, marginLeft: 10, height: 40, justifyContent: 'center' }}>
                  <Text style={{ color: '#76b33a', fontWeight: 'bold' }}>ADD</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => {
                    const amt = Number(allocationAmount);
                    if (!amt || isNaN(amt) || amt <= 0) return Alert.alert('Invalid', 'Enter a valid amount');
                    allocateCredits(user.id, -amt, 'merchantInventory').then(() => loadUser());
                  }}
                  style={{ backgroundColor: '#ef444422', paddingHorizontal: 15, borderRadius: 10, marginLeft: 10, height: 40, justifyContent: 'center' }}>
                  <Text style={{ color: '#ef4444', fontWeight: 'bold' }}>DEDUCT</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Transaction History Section */}
          <View style={{ marginBottom: 50 }}>
            <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: 'bold', marginBottom: 15 }}>TRANSACTION HISTORY</Text>
            
            {userTxs.length === 0 ? (
              <View style={{ backgroundColor: '#1E293B', padding: 25, borderRadius: 24, alignItems: 'center' }}>
                <Text style={{ color: '#64748B', fontSize: 12 }}>No transactions found for this account.</Text>
              </View>
            ) : (
              userTxs.map((tx) => {
                const isOutbound = ['withdraw', 'transfer', 'outbound'].includes(tx.type);
                return (
                  <TouchableOpacity 
                    key={tx.id}
                    onPress={() => navigation.navigate('Receipt', { transaction: tx })}
                    style={{ backgroundColor: '#112240', padding: 20, borderRadius: 20, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 3, borderLeftColor: isOutbound ? '#ef4444' : '#76b33a' }}
                  >
                    <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: isOutbound ? 'rgba(239, 68, 68, 0.1)' : 'rgba(118, 179, 58, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 15 }}>
                      {isOutbound ? 
                        <ArrowUpRight color="#ef4444" size={18} /> : 
                        <ArrowDownLeft color="#76b33a" size={18} />
                      }
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#fff', fontWeight: 'bold' }}>{tx.type === 'deposit' ? 'Deposit' : (tx.type === 'withdraw' ? 'Withdrawal' : 'Transfer')}</Text>
                      <Text style={{ color: '#94A3B8', fontSize: 10 }}>{new Date(tx.timestamp).toLocaleDateString()}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', marginRight: 15 }}>
                      <Text style={{ color: '#fff', fontWeight: 'bold' }}>{typeof tx.amount === 'number' ? `A ${tx.amount.toLocaleString()}` : tx.amount}</Text>
                      <Text style={{ color: tx.status === 'completed' ? '#76b33a' : '#eab308', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>{tx.status}</Text>
                    </View>
                    <ArrowRight color="#334155" size={16} />
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminUserDetails;

