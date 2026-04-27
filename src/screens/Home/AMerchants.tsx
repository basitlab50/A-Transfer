import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { MapPin, CreditCard, ShieldCheck, Globe, ShoppingBag, AlertCircle } from 'lucide-react-native';
import { useWalletStore } from '../../store/useWalletStore';
import { AppCard } from '../../components/ui/AppCard';
import { AppButton } from '../../components/ui/AppButton';
import { AMerchantsNavigationProp, AMerchantsScreenRouteProp } from '../../types/navigation';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface Props {
  route: AMerchantsScreenRouteProp;
  navigation: AMerchantsNavigationProp;
}

const AMerchants = ({ route, navigation }: Props) => {
  const { country: selectedCountryName, mode } = route.params || {};
  const { fetchApprovedMerchants, availableCountries } = useWalletStore();
  
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);

  const countryData = availableCountries.find(c => c.name === selectedCountryName);
  const currencySymbol = countryData?.currencySymbol || '$';
  const currencyCode = countryData?.currencyCode || 'USD';
  const rate = countryData?.rate || 1;

  useEffect(() => {
    loadMerchants();
  }, [selectedCountryName]);

  const loadMerchants = async () => {
    setLoading(true);
    setPermissionError(false);
    try {
      console.log('Fetching Approved Merchants for:', selectedCountryName);
      let approvedMerchants = await fetchApprovedMerchants(selectedCountryName);
      
      // Filter based on mode and merchant availability
      if (mode === 'deposit') {
        approvedMerchants = approvedMerchants.filter(m => m.isAcceptingBuy !== false);
      } else if (mode === 'withdraw') {
        approvedMerchants = approvedMerchants.filter(m => m.isAcceptingSell !== false);
      }
      
      setMerchants(approvedMerchants);
    } catch (err: any) {
      console.error('AMerchants: Fetch Error', err);
      if (err.message?.includes('permission')) {
        setPermissionError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: mode === 'deposit' ? 'Select Merchant (Buy)' : mode === 'withdraw' ? 'Select Merchant (Sell)' : `Merchants in ${selectedCountryName || 'Region'}`,
      headerRight: () => (
        <TouchableOpacity 
          onPress={() => navigation.navigate('SelectCountry')}
          className="flex-row items-center bg-surface px-3 py-1.5 rounded-full border border-slate-800"
        >
          <Globe color="#76b33a" size={14} />
          <Text className="text-accent text-[10px] font-bold ml-1.5 uppercase tracking-wider">Change</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, selectedCountryName]);

  const renderMerchant = ({ item, index }: { item: any, index: number }) => {
    const inventory = item.merchantInventory || 0;
    const localVal = inventory * rate;

    return (
      <Animated.View entering={FadeInUp.delay(index * 100)}>
        <AppCard className="mb-4">
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <Text className="text-textPrimary text-lg font-bold mr-2">{item.merchantApplication?.businessName || item.name}</Text>
                <ShieldCheck color="#76b33a" size={16} />
              </View>
              <View className="flex-row items-center">
                <MapPin color="#94A3B8" size={14} />
                <Text className="text-textSecondary text-xs ml-1">{item.country}</Text>
              </View>
            </View>
            <View className="items-end">
              <View className="flex-row items-center mb-2">
                {(!mode || mode === 'deposit') && (
                  <View className="bg-accent/10 px-2 py-0.5 rounded-md border border-accent/20 mr-1">
                    <Text className="text-accent text-[8px] font-bold">DEPOSIT: ${item.sellingRate?.toFixed(2) || '1.50'}</Text>
                  </View>
                )}
                {(!mode || mode === 'withdraw') && (
                  <View className="bg-orange/10 px-2 py-0.5 rounded-md border border-orange/20">
                    <Text className="text-orange text-[8px] font-bold">WITHDRAW: ${item.buyingRate?.toFixed(2) || '0.90'}</Text>
                  </View>
                )}
              </View>
              <View className="bg-surface px-3 py-1 rounded-full border border-slate-800">
                <Text className="text-textSecondary text-[10px] font-bold">VERIFIED</Text>
              </View>
              {mode === 'withdraw' && (
                <View className="mt-2 bg-orange/5 px-2 py-1 rounded-md border border-orange/10">
                  <Text className="text-orange text-[8px] font-bold">LIMIT: {item.buyingMin || 10} - {item.buyingMax || 1000} A</Text>
                </View>
              )}
            </View>
          </View>

          <View className="p-4 bg-primary rounded-2xl mb-4 border border-slate-800">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-textSecondary text-[10px] uppercase font-bold tracking-widest">Merchant Inventory</Text>
              <Text className="text-accent font-bold text-lg">A {inventory.toLocaleString()}</Text>
            </View>
            <View className="flex-row justify-end">
              <Text className="text-textSecondary text-[11px] font-medium italic">
                ≈ {currencySymbol}{localVal.toLocaleString()} {currencyCode}
              </Text>
            </View>
          </View>

          <View className="flex-row">
            {(!mode || mode === 'deposit') && (
              <AppButton 
                title="Deposit / Buy" 
                variant="accent" 
                size="small"
                className="flex-1 mr-2"
                icon={<CreditCard color="#76b33a" size={14} />}
                onPress={() => {
                  navigation.navigate('DepositAmount' as any, { merchant: item });
                }}
              />
            )}
            {(!mode || mode === 'withdraw') && (
              <AppButton 
                title="Withdraw / Sell" 
                variant="outline" 
                size="small"
                className="flex-1 ml-2 border-slate-800"
                onPress={() => {
                  navigation.navigate('WithdrawAmount' as any, { merchant: item });
                }}
              />
            )}
          </View>
        </AppCard>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-primary items-center justify-center">
        <ActivityIndicator size="large" color="#76b33a" />
        <Text className="text-textSecondary mt-4 font-bold uppercase tracking-widest text-[10px]">Scanning Platform...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="px-6 py-4 flex-1">
        {merchants.length > 0 ? (
          <FlatList
            data={merchants}
            keyExtractor={(item) => item.id}
            renderItem={renderMerchant}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        ) : (
          <View className="flex-1 items-center justify-center px-10">
            <View className="w-20 h-20 bg-surface rounded-full items-center justify-center mb-6 border border-slate-800">
              {permissionError ? <AlertCircle color="#ef4444" size={40} /> : <ShoppingBag color="#334155" size={40} />}
            </View>
            <Text className="text-textPrimary text-xl font-bold text-center">
              {permissionError ? 'Access Restricted' : 'No Available Merchants'}
            </Text>
            <Text className="text-textSecondary text-center mt-2 leading-5">
              {permissionError 
                ? 'Check your Firestore Security Rules to allow listing approved merchants.' 
                : `There are no available merchants in this region yet. We are working on expanding to ${selectedCountryName} soon!`}
            </Text>
            <AppButton 
              title={permissionError ? "Try Again" : "Change Region"} 
              variant="outline" 
              className="mt-8 border-slate-800 w-full"
              onPress={() => permissionError ? loadMerchants() : navigation.navigate('SelectCountry')}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default AMerchants;
