import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { 
  ArrowLeft, 
  Search, 
  Users, 
  ShoppingBag, 
  CreditCard,
  ChevronRight,
  ShieldCheck,
  Home,
  FileText
} from 'lucide-react-native';
import { useWalletStore } from '../../store/useWalletStore';

/**
 * ULTRA-SAFE VERSION
 * No NativeWind, no Animations.
 * Just standard View and style props to prevent blank screens.
 */
const AdminDetailList = ({ route, navigation }: any) => {
  const { type } = route.params;
  const { fetchAllUsers, fetchAllTransactions } = useWalletStore();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const users = await fetchAllUsers();
      
      if (type === 'users') {
        setData(users.map(u => ({ ...u, _itemType: 'user' })));
      } else if (type === 'merchants') {
        setData(users.filter((u: any) => u.merchantStatus === 'approved').map(u => ({ ...u, _itemType: 'user' })));
      } else if (type === 'circulation') {
        const transactions = await fetchAllTransactions();
        
        // Enhance transactions with user AID and Email for better searching
        const transactionsWithUser = transactions.map(t => {
          const user = users.find(u => u.id === t.userId);
          return {
            ...t,
            _itemType: 'transaction',
            userAid: user?.aid || 'N/A',
            userEmail: user?.email || 'N/A'
          };
        });

        const combined = [
          ...users.map(u => ({ ...u, _itemType: 'user' })),
          ...transactionsWithUser
        ];
        // Sort users by balance by default
        setData(combined.sort((a: any, b: any) => (b.balance || 0) - (a.balance || 0)));
      }
    } catch (err) {
      console.error('Data Load Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(item => {
    const s = search.toLowerCase();
    if (item._itemType === 'user') {
      return (item.name || '').toLowerCase().includes(s) || 
             (item.email || '').toLowerCase().includes(s) ||
             (item.aid || '').includes(search);
    } else {
      // Transaction search: ID, Name, Status, Type, AID, Email
      return (item.id || '').toLowerCase().includes(s) ||
             (item.userName || '').toLowerCase().includes(s) ||
             (item.userEmail || '').toLowerCase().includes(s) ||
             (item.userAid || '').includes(search) ||
             (item.status || '').toLowerCase().includes(s) ||
             (item.type || '').toLowerCase().includes(s) ||
             (item.userPhone || '').includes(search);
    }
  });

  const renderHeader = () => {
    const titles: any = {
      users: 'User Directory',
      merchants: 'Merchant Network',
      circulation: 'Asset Circulation'
    };

    return (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
              <ArrowLeft color="#F8FAFC" size={24} />
            </TouchableOpacity>
            <View style={{ marginLeft: 15 }}>
              <Text style={styles.headerTitle}>{titles[type] || 'Platform Data'}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={styles.iconBtn}>
            <Home color="#eab308" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Search color="#94A3B8" size={20} />
          <TextInput 
            style={styles.searchInput}
            placeholder={type === 'circulation' ? "Search ID, Name, Email or AID..." : `Search ${type}...`}
            placeholderTextColor="#475569"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    if (item._itemType === 'transaction') {
      return (
        <TouchableOpacity 
          onPress={() => navigation.navigate('Receipt', { transaction: item })}
          style={styles.listItem}
        >
          <View style={[styles.avatar, { backgroundColor: '#eab30822' }]}>
            <FileText color="#eab308" size={18} />
          </View>
          
          <View style={{ flex: 1 }}>
            <Text style={styles.userName} numberOfLines={1}>{item.id}</Text>
            <Text style={styles.userAid}>{item.userName || 'System Transaction'}</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: '#eab308' }]}>A {item.amount?.toLocaleString() || 0}</Text>
            <Text style={styles.statLabel}>{item.type || 'Transfer'}</Text>
          </View>

          <View style={[styles.statBox, { marginLeft: 10, width: 80 }]}>
            <Text style={[styles.statVal, { fontSize: 10, color: item.status === 'completed' ? '#76b33a' : '#94A3B8' }]}>
              {item.status?.toUpperCase() || 'PENDING'}
            </Text>
            <Text style={styles.statLabel}>Status</Text>
          </View>

          <ChevronRight color="#475569" size={16} style={{ marginLeft: 10 }} />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity 
        onPress={() => navigation.navigate('AdminUserDetails', { userId: item.id })}
        style={styles.listItem}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name?.charAt(0) || 'U'}</Text>
        </View>
        
        <View style={{ flex: 1 }}>
          <Text style={styles.userName} numberOfLines={1}>{item.name || 'Unnamed'}</Text>
          <Text style={styles.userAid}>{item.aid || '---'}</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statVal}>A {item.balance?.toLocaleString() || 0}</Text>
          <Text style={styles.statLabel}>Wallet</Text>
        </View>

        <View style={[styles.statBox, { marginLeft: 10 }]}>
          <Text style={[styles.statVal, { color: '#76b33a' }]}>A {item.merchantInventory?.toLocaleString() || 0}</Text>
          <Text style={styles.statLabel}>Inv</Text>
        </View>

        <ChevronRight color="#475569" size={16} style={{ marginLeft: 10 }} />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#76b33a" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <View style={styles.tableHead}>
        <Text style={[styles.headText, { flex: 1, marginLeft: 60 }]}>USER / AID</Text>
        <Text style={[styles.headText, { width: 70, textAlign: 'right' }]}>WALLET</Text>
        <Text style={[styles.headText, { width: 70, textAlign: 'right', marginLeft: 10 }]}>INV</Text>
        <View style={{ width: 26 }} />
      </View>
      <FlatList 
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={{ padding: 50, alignItems: 'center' }}>
            <Text style={{ color: '#64748B' }}>No matching records found.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A192F',
  },
  header: {
    paddingTop: 50,
    backgroundColor: '#112240',
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: 'bold',
  },
  iconBtn: {
    padding: 8,
    backgroundColor: '#1E293B',
    borderRadius: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A192F',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#F8FAFC',
  },
  tableHead: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headText: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: 'bold',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#112240',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#F8FAFC',
    fontWeight: 'bold',
  },
  userName: {
    color: '#F8FAFC',
    fontWeight: 'bold',
    fontSize: 14,
  },
  userAid: {
    color: '#94A3B8',
    fontSize: 10,
  },
  statBox: {
    width: 70,
    alignItems: 'flex-end',
  },
  statVal: {
    color: '#F8FAFC',
    fontWeight: 'bold',
    fontSize: 13,
  },
  statLabel: {
    color: '#64748B',
    fontSize: 8,
    textTransform: 'uppercase',
  }
});

export default AdminDetailList;
