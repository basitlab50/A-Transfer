import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { 
  ArrowLeft, 
  Search, 
  ShoppingBag, 
  ChevronRight,
  ShieldCheck,
  Clock,
  Home
} from 'lucide-react-native';
import { useWalletStore } from '../../store/useWalletStore';

/**
 * ULTRA-SAFE VERSION
 * No NativeWind, no Animations.
 * Just standard View and style props to prevent blank screens.
 */
const AdminMerchantRequests = ({ route, navigation }: any) => {
  const countryParam = route.params?.country;
  const { fetchAllUsers, availableCountries } = useWalletStore();
  
  const [data, setData] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadRequests();
  }, [countryParam]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const users = await fetchAllUsers();
      setAllUsers(users);
      
      if (countryParam) {
        // Filter by country and anyone who has an application
        const requests = users.filter((u: any) => 
          u.country === countryParam && u.merchantApplication
        );
        setData(requests);
      } else {
        setData([]); // Reset if no country
      }
    } catch (err) {
      console.error('Load Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(item => 
    (item.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (item.aid || '').includes(search)
  );

  const renderCountrySelection = () => {
    // Group pending applications by country
    const pendingByCountry = allUsers.reduce((acc: any, user: any) => {
      if (user.merchantStatus === 'pending') {
        const c = user.country || 'Unknown';
        acc[c] = (acc[c] || 0) + 1;
      }
      return acc;
    }, {});

    const pendingCountries = Object.keys(pendingByCountry);

    return (
      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
        {pendingCountries.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={styles.sectionTitle}>URGENT: PENDING APPLICATIONS</Text>
            {pendingCountries.map(countryName => {
              const countryInfo = availableCountries.find(c => c.name === countryName);
              return (
                <TouchableOpacity 
                  key={countryName}
                  onPress={() => navigation.navigate('AdminMerchantRequests', { country: countryName })}
                  style={styles.alertBanner}
                >
                  <View style={styles.alertIcon}>
                    <Clock color="#eab308" size={16} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.alertText}>
                      New application from <Text style={{ fontWeight: 'bold' }}>{countryName}</Text>
                    </Text>
                    <Text style={{ color: '#94A3B8', fontSize: 9 }}>{pendingByCountry[countryName]} pending review</Text>
                  </View>
                  <Text style={{ color: '#eab308', fontSize: 18 }}>{countryInfo?.flag}</Text>
                  <ChevronRight color="#eab308" size={16} style={{ marginLeft: 10 }} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <Text style={styles.sectionTitle}>SELECT REGION TO REVIEW</Text>
        <View style={styles.grid}>
          {availableCountries.map((country) => (
            <TouchableOpacity 
              key={country.name}
              onPress={() => navigation.navigate('AdminMerchantRequests', { country: country.name })}
              style={styles.countryCard}
            >
              <Text style={{ fontSize: 40, marginBottom: 10 }}>{country.flag}</Text>
              <Text style={styles.countryName}>{country.name}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>VIEW APPS</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <ArrowLeft color="#F8FAFC" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {countryParam ? countryParam : 'Merchant Portal'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={styles.iconBtn}>
          <Home color="#eab308" size={24} />
        </TouchableOpacity>
      </View>

      {countryParam && (
        <View style={styles.searchBar}>
          <Search color="#94A3B8" size={20} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search applications..."
            placeholderTextColor="#475569"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      )}
    </View>
  );

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('AdminUserDetails', { userId: item.id })}
      style={styles.requestCard}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name?.charAt(0) || 'U'}</Text>
      </View>
      
      <View style={{ flex: 1 }}>
        <Text style={styles.userName}>{item.name || 'Unnamed'}</Text>
        <Text style={styles.userAid}>AID: {item.aid || '---'}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          <Clock color="#94A3B8" size={10} />
          <Text style={styles.dateText}>
            Applied: {item.merchantApplication?.submittedAt?.split('T')[0] || 'N/A'}
          </Text>
        </View>
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <View style={[styles.statusBadge, { 
          backgroundColor: item.merchantStatus === 'approved' ? '#76b33a22' : 
                          item.merchantStatus === 'declined' ? '#ef444422' : '#eab30822'
        }]}>
          <Text style={[styles.statusText, { 
            color: item.merchantStatus === 'approved' ? '#76b33a' : 
                   item.merchantStatus === 'declined' ? '#ef4444' : '#eab308'
          }]}>
            {item.merchantStatus || 'Pending'}
          </Text>
        </View>
        <ChevronRight color="#475569" size={16} style={{ marginTop: 8 }} />
      </View>
    </TouchableOpacity>
  );

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
      {!countryParam ? renderCountrySelection() : (
        <FlatList 
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ShoppingBag color="#1e293b" size={60} />
              <Text style={styles.emptyText}>No applications found for this region.</Text>
            </View>
          }
        />
      )}
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
    marginBottom: 15,
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: '#1E293B',
    borderRadius: 12,
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 20,
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  countryCard: {
    width: '48%',
    backgroundColor: '#112240',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  countryName: {
    color: '#F8FAFC',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  badge: {
    marginTop: 12,
    backgroundColor: '#0A192F',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#eab308',
    fontSize: 9,
    fontWeight: 'bold',
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
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#112240',
    marginHorizontal: 20,
    marginTop: 15,
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#F8FAFC',
    fontWeight: 'bold',
    fontSize: 18,
  },
  userName: {
    color: '#F8FAFC',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userAid: {
    color: '#94A3B8',
    fontSize: 10,
  },
  dateText: {
    color: '#94A3B8',
    fontSize: 9,
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  emptyContainer: {
    paddingTop: 100,
    alignItems: 'center',
    paddingHorizontal: 50,
  },
  emptyText: {
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 20,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eab30811',
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eab30833',
    marginBottom: 10,
  },
  alertIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#eab30822',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertText: {
    color: '#F8FAFC',
    fontSize: 13,
  }
});

export default AdminMerchantRequests;
