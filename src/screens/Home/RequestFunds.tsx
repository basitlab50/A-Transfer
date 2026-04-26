import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { User, ShieldCheck, ArrowRight, CornerDownRight, Landmark, BadgePercent } from 'lucide-react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { useWalletStore } from '../../store/useWalletStore';
import { AppButton } from '../../components/ui/AppButton';
import { AppAlert } from '../../components/ui/AppAlert';
import { RequestFundsNavigationProp } from '../../types/navigation';

interface Props {
  navigation: RequestFundsNavigationProp;
}

const RequestFunds = ({ navigation }: Props) => {
  const [aid, setAid] = useState('');
  const [amount, setAmount] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  
  const { userCountry, availableCountries, createRequest, userProfile } = useWalletStore();
  const currentCountry = availableCountries.find(c => c.name === userCountry);
  const rate = currentCountry?.rate || 1;
  const currencySymbol = currentCountry?.currencySymbol || '$';

  const handleRequest = () => {
    const numAmount = parseFloat(amount);
    if (!aid || isNaN(numAmount) || numAmount <= 0) {
      return;
    }
    
    createRequest(aid, numAmount);
    setAlertVisible(true);
  };

  const localEquivalent = (parseFloat(amount) || 0) * rate;

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <AppAlert 
        visible={alertVisible}
        type="success"
        title="Request Sent"
        message={`Your request for A ${amount} has been sent to AID: ${aid}. You'll be notified once they accept.`}
        onConfirm={() => {
          setAlertVisible(false);
          navigation.navigate('Dashboard');
        }}
        confirmText="Back to Dashboard"
      />
      
      <KeyboardAvoidingView 
        behavior={undefined}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6 pt-10" showsVerticalScrollIndicator={false}>
          <View className="items-center mb-10">
            <View className="bg-accent/10 p-6 rounded-[40px] mb-6">
              <Landmark color="#76b33a" size={48} />
            </View>
            <Text className="text-textPrimary text-3xl font-bold tracking-tight text-center">Request Credits</Text>
            <Text className="text-textSecondary text-sm mt-2 text-center text-wrap px-4">
              Send a payment request to any AID. Credits are held in escrow for your security.
            </Text>
          </View>

          <View className="bg-surface/50 p-8 rounded-[40px] border border-card-border/30 mb-8">
            <Text className="text-textSecondary text-[10px] uppercase font-bold tracking-[2px] mb-6">RECIPIENT & AMOUNT</Text>
            
            <View className="flex-row items-center bg-primary p-4 rounded-3xl border border-slate-700 mb-6">
              <User color="#94A3B8" size={20} />
              <TextInput
                className="flex-1 ml-4 text-textPrimary font-bold text-lg"
                placeholder="Recipient AID #"
                placeholderTextColor="#475569"
                value={aid}
                onChangeText={setAid}
                autoFocus
                autoCapitalize="characters"
              />
            </View>

            <View className="flex-row items-center bg-primary p-4 rounded-3xl border border-slate-700 mb-6">
              <Text className="text-accent font-bold text-2xl mr-4">A</Text>
              <TextInput
                className="flex-1 text-textPrimary font-bold text-3xl"
                placeholder="0"
                placeholderTextColor="#1E293B"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            <View className="flex-row items-center justify-between pt-2 border-t border-slate-800">
              <View className="flex-row items-center">
                <CornerDownRight color="#64748B" size={16} />
                <Text className="text-textSecondary text-xs ml-2">Value in {userCountry}:</Text>
              </View>
              <Text className="text-textPrimary font-bold">{currencySymbol}{localEquivalent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
            </View>
          </View>

          <View className="bg-orange/10 p-5 rounded-3xl border border-orange/20 mb-10 flex-row items-start">
            <BadgePercent color="#df7c27" size={20} className="mt-1" />
            <View className="flex-1 ml-4">
              <Text className="text-orange font-bold text-sm">Escrow Protection Active</Text>
              <Text className="text-textSecondary text-[11px] leading-4 mt-1">
                A small service fee (0.5%) applies to the recipient once the request is accepted. 
                Your security is guaranteed by our decentralized merchant network.
              </Text>
            </View>
          </View>

          <AppButton 
            title="Send Request" 
            variant="accent" 
            size="large"
            icon={<ArrowRight color="#76b33a" size={20} />}
            onPress={handleRequest}
            className="py-5 shadow-2xl shadow-accent/20 mb-10"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RequestFunds;
