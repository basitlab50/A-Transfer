import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Package, Smartphone, Landmark, CornerDownRight, CheckCircle2, ArrowRight } from 'lucide-react-native';
import { useWalletStore } from '../../store/useWalletStore';
import { AppButton } from '../../components/ui/AppButton';
import { AppCard } from '../../components/ui/AppCard';
import { Paystack } from 'react-native-paystack-webview';
import { sendLocalNotificationSafe } from '../../utils/notifications';

const Restock = ({ navigation }: any) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { userCountry, availableCountries, increaseInventory, userProfile, systemSettings } = useWalletStore();
  const currentCountry = availableCountries.find(c => c.name === userCountry);
  const rate = currentCountry?.rate || 1;
  const currencySymbol = currentCountry?.currencySymbol || '$';
  const currencyCode = currentCountry?.currencyCode || 'GHS';

  const [showPaystack, setShowPaystack] = useState(false);

  const handleRestock = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount of A-Credits.');
      return;
    }
    if (!paymentMethod) {
      Alert.alert('Select Method', 'Please select a payment method.');
      return;
    }

    setShowPaystack(true);
  };

  const onPaymentSuccess = (res: any) => {
    const numAmount = parseFloat(amount);
    increaseInventory(numAmount);
    setIsSuccess(true);
    setShowPaystack(false);
    
    // Trigger the physical ring and popup!
    sendLocalNotificationSafe(
      'Restock Complete ✅', 
      `Your merchant inventory has been credited with A ${numAmount}.`
    );
  };

  const mBuyRate = systemSettings?.merchantBuyRate || 1.0;
  const localCost = (parseFloat(amount) || 0) * mBuyRate * rate;

  if (isSuccess) {
    return (
      <SafeAreaView className="flex-1 bg-primary">
        <View className="flex-1 items-center justify-center px-6">
          <View className="bg-accent/10 p-10 rounded-[60px] mb-8">
            <CheckCircle2 color="#76b33a" size={80} />
          </View>
          <Text className="text-textPrimary text-3xl font-bold mb-4 text-center">Liquidity Increased!</Text>
          <Text className="text-textSecondary text-base text-center mb-12 leading-6">
            Your inventory has been updated. You're now ready to handle more peer requests in {userCountry}.
          </Text>
          <AppButton 
            title="Return to Hub" 
            variant="accent" 
            className="w-full py-5"
            onPress={() => navigation.navigate('Dashboard')}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6 pt-10" showsVerticalScrollIndicator={false}>
          <View className="items-center mb-8">
            <View className="bg-accent/10 p-4 rounded-3xl mb-4">
              <Package color="#76b33a" size={32} />
            </View>
            <Text className="text-textPrimary text-2xl font-bold">Buy Liquidity</Text>
            <Text className="text-textSecondary text-sm text-center px-6 mt-1">
              Increase your merchant inventory to earn more from peer-to-peer withdrawal fees.
            </Text>
          </View>

          <View className="bg-surface/50 p-6 rounded-[32px] border border-card-border/30 mb-8">
            <Text className="text-textSecondary text-[10px] uppercase font-bold tracking-widest mb-4">RESTOCK AMOUNT</Text>
            <View className="flex-row items-baseline mb-2">
              <Text className="text-accent text-3xl font-bold mr-2">A</Text>
              <TextInput
                className="flex-1 text-textPrimary text-4xl font-bold"
                placeholder="0"
                placeholderTextColor="#1E293B"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                autoFocus
              />
            </View>
            <View className="items-center border-t border-card-border/20 pt-4">
              <View className="flex-row items-center mb-1">
                <CornerDownRight color="#64748B" size={16} />
                <Text className="text-textSecondary text-sm ml-2">
                  Total: <Text className="text-textPrimary font-bold">{currencySymbol}{localCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                </Text>
              </View>
              <Text className="text-[9px] text-textSecondary italic">Platform Rate: 1 A = ${mBuyRate.toFixed(2)}</Text>
            </View>
          </View>

          <Text className="text-textSecondary text-xs font-bold uppercase tracking-widest mb-4 ml-2">Select Payment Method</Text>
          
          <TouchableOpacity 
            onPress={() => setPaymentMethod('Mobile Money')}
            className={`flex-row items-center p-5 rounded-3xl border mb-3 ${paymentMethod === 'Mobile Money' ? 'bg-accent/5 border-accent' : 'bg-surface border-card-border/30'}`}
          >
            <View className="bg-orange/10 p-3 rounded-xl mr-4">
              <Smartphone color="#df7c27" size={20} />
            </View>
            <View className="flex-1">
              <Text className="text-textPrimary font-bold">Mobile Money</Text>
              <Text className="text-textSecondary text-xs">MTN, Orange, or G-Money</Text>
            </View>
            {paymentMethod === 'Mobile Money' && <CheckCircle2 color="#76b33a" size={20} />}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setPaymentMethod('Debit/Credit Card')}
            className={`flex-row items-center p-5 rounded-3xl border mb-10 ${paymentMethod === 'Debit/Credit Card' ? 'bg-accent/5 border-accent' : 'bg-surface border-card-border/30'}`}
          >
            <View className="bg-blue-500/10 p-3 rounded-xl mr-4">
              <Landmark color="#3b82f6" size={20} />
            </View>
            <View className="flex-1">
              <Text className="text-textPrimary font-bold">Debit / Credit Card</Text>
              <Text className="text-textSecondary text-xs">Visa, Mastercard, Verve</Text>
            </View>
            {paymentMethod === 'Debit/Credit Card' && <CheckCircle2 color="#76b33a" size={20} />}
          </TouchableOpacity>

          <AppButton 
            title="Confirm Purchase" 
            variant="accent" 
            size="large"
            icon={<ArrowRight color="#76b33a" size={20} />}
            onPress={handleRestock}
            className="mb-10"
          />

          {showPaystack && Platform.OS !== 'web' && (
            <Paystack  
              paystackKey="pk_test_6e29eb50662592ed6fb7b98beb8ccfc82127f105"
              amount={parseFloat(localCost.toFixed(2))}
              billingEmail={userProfile?.email || "customer@example.com"}
              billingName={userProfile?.name || "Customer"}
              currency={currencyCode}
              channels={paymentMethod === 'Mobile Money' ? ['mobile_money'] : ['card']}
              onCancel={(e) => {
                setShowPaystack(false);
                Alert.alert('Payment Cancelled', 'The transaction was cancelled.');
              }}
              onSuccess={(res) => {
                onPaymentSuccess(res);
              }}
              autoStart={true}
            />
          )}

          {showPaystack && Platform.OS === 'web' && (
            <View className="bg-surface p-6 rounded-3xl border border-accent mb-10">
              <Text className="text-textPrimary font-bold text-center mb-4">Paystack Web Simulation</Text>
              <Text className="text-textSecondary text-xs text-center mb-6">
                The Paystack native modal is optimized for mobile. On web, we've simulated the connection to: {currencyCode} {localCost.toLocaleString()}
              </Text>
              <AppButton 
                title="Simulate Successful Payment" 
                variant="accent" 
                onPress={() => onPaymentSuccess({ status: 'success' })} 
              />
              <TouchableOpacity onPress={() => setShowPaystack(false)} className="mt-4">
                <Text className="text-textSecondary text-center text-xs">Cancel Simulation</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Restock;
