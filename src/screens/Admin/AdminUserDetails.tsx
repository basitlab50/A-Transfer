import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
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
  Home
} from 'lucide-react-native';
import { useWalletStore } from '../../store/useWalletStore';
import { db } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * ULTRA-SAFE VERSION
 * No SafeAreaView, no NativeWind, no Animations.
 * Just standard View and style props.
 */
const AdminUserDetails = ({ route, navigation }: any) => {
  const userId = route?.params?.userId;
  const { fetchAllUsers, updateUserStatus, fetchUserTransactions } = useWalletStore();
  
  const [user, setUser] = useState<any>(null);
  const [userTxs, setUserTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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

          {/* Merchant Application Card */}
          {user.merchantApplication && (
            <View style={{ backgroundColor: '#1E293B', padding: 25, borderRadius: 24, marginBottom: 20, borderWidth: 1, borderColor: '#eab30833' }}>
              <Text style={{ color: '#eab308', fontSize: 12, fontWeight: 'bold', marginBottom: 20 }}>BUSINESS APPLICATION</Text>
              
              <View style={{ marginBottom: 15 }}>
                <Text style={{ color: '#94A3B8', fontSize: 10 }}>BUSINESS NAME</Text>
                <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: 'bold' }}>{user.merchantApplication.businessName}</Text>
              </View>

              <View style={{ marginBottom: 15 }}>
                <Text style={{ color: '#94A3B8', fontSize: 10 }}>BUSINESS GMAIL</Text>
                <Text style={{ color: '#F8FAFC', fontSize: 16 }}>{user.merchantApplication.email}</Text>
              </View>

              <View>
                <Text style={{ color: '#94A3B8', fontSize: 10 }}>OPERATIONAL COUNTRY</Text>
                <Text style={{ color: '#F8FAFC', fontSize: 16 }}>{user.merchantApplication.country}</Text>
              </View>
            </View>
          )}

          {/* Transaction History Section */}
          <View style={{ marginBottom: 20 }}>
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

          {/* Actions */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 50 }}>
            <TouchableOpacity 
              onPress={() => updateUserStatus(user.id, { merchantStatus: 'approved' }).then(() => navigation.goBack())}
              style={{ flex: 1, marginRight: 10, backgroundColor: '#76b33a22', padding: 20, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#76b33a' }}
            >
              <CheckCircle2 color="#76b33a" size={24} />
              <Text style={{ color: '#76b33a', fontWeight: 'bold', marginTop: 8 }}>Approve</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => updateUserStatus(user.id, { merchantStatus: 'declined' }).then(() => navigation.goBack())}
              style={{ flex: 1, marginLeft: 10, backgroundColor: '#ef444422', padding: 20, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#ef4444' }}
            >
              <XCircle color="#ef4444" size={24} />
              <Text style={{ color: '#ef4444', fontWeight: 'bold', marginTop: 8 }}>Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminUserDetails;
