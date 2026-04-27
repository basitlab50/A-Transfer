import React from 'react';
import { View, Text, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useWalletStore } from '../../store/useWalletStore';

import { SelectCountryNavigationProp, SelectCountryScreenRouteProp } from '../../types/navigation';

interface Props {
  route: SelectCountryScreenRouteProp;
  navigation: SelectCountryNavigationProp;
}

const SelectCountry = ({ route, navigation }: Props) => {
  const { mode = 'withdraw' } = route.params || {};
  const { availableCountries, setUserCountry } = useWalletStore();

  const handleCountrySelect = (countryName: string) => {
    if (mode === 'transfer') {
      navigation.navigate('QuickTransferAmount', { country: countryName });
    } else if (mode === 'profile') {
      setUserCountry(countryName);
      navigation.goBack();
    } else {
      navigation.navigate('AMerchants', { country: countryName, mode });
    }
  };

  const renderCountry = ({ item }: { item: any }) => (
    <TouchableOpacity 
      className="flex-row items-center bg-surface p-5 rounded-3xl mb-4 border border-slate-800"
      onPress={() => handleCountrySelect(item.name)}
    >
      <Text className="text-3xl mr-4">{item.flag}</Text>
      <View className="flex-1">
        <Text className="text-textPrimary text-lg font-bold">{item.name}</Text>
        <Text className="text-textSecondary text-xs">Supported Region</Text>
      </View>
      <ChevronRight color="#94A3B8" size={20} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="px-6 py-6">
        <Text className="text-textSecondary text-sm mb-6">
          {mode === 'transfer' 
            ? 'Choose a destination country to initiate a regional transfer pulse.'
            : mode === 'profile'
            ? 'Select your primary country to update your local currency and regional settings.'
            : mode === 'deposit'
            ? 'Choose the country where you want to buy A-Credits from a local merchant.'
            : 'Choose the country where you want to receive your local currency payout.'
          }
        </Text>
        
        <FlatList
          data={availableCountries}
          keyExtractor={(item) => item.code}
          renderItem={renderCountry}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      </View>
    </SafeAreaView>
  );
};

export default SelectCountry;
