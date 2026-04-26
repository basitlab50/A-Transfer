import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Share, Image } from 'react-native';
import { ArrowLeft, Download, Share2, CheckCircle2, Landmark, Smartphone, Clock, ShieldCheck, User } from 'lucide-react-native';
import { AppButton } from '../../components/ui/AppButton';
import { AppCard } from '../../components/ui/AppCard';

const ReceiptScreen = ({ route, navigation }: any) => {
  const { transaction } = route.params || {};

  if (!transaction) {
    return (
      <SafeAreaView className="flex-1 bg-primary items-center justify-center">
        <Text className="text-textSecondary">No transaction data found.</Text>
      </SafeAreaView>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `A-Transfer Receipt\nID: ${transaction.id}\nAmount: A ${transaction.amount}\nStatus: ${transaction.status}`,
      });
    } catch (error) {}
  };

  const isDeposit = transaction.type === 'deposit';
  const isWithdraw = transaction.type === 'withdraw';
  const isTransfer = transaction.type === 'transfer';

  return (
    <SafeAreaView className="flex-1 bg-primary">
      {/* Background Watermark Logo - Centered and Visible */}
      <View 
        pointerEvents="none"
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          alignItems: 'center', 
          justifyContent: 'center',
          opacity: 0.07,
          zIndex: -1
        }}
      >
        <Image 
          source={require('../../../assets/logo.png')} 
          style={{ width: 450, height: 450, resizeMode: 'contain', transform: [{ rotate: '-10deg' }] }} 
        />
      </View>

      <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 rounded-full bg-surface items-center justify-center">
          <ArrowLeft color="#F8FAFC" size={20} />
        </TouchableOpacity>
        <Text className="text-textPrimary font-bold text-lg">Transaction Receipt</Text>
        <TouchableOpacity onPress={handleShare} className="w-10 h-10 rounded-full bg-surface items-center justify-center">
          <Share2 color="#76b33a" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6">
        <View className="items-center mt-6 mb-8">
          <View className="w-12 h-12 rounded-full bg-accent/20 items-center justify-center mb-4">
            <CheckCircle2 color="#76b33a" size={24} />
          </View>
          <Text className="text-accent font-bold text-sm tracking-widest uppercase">Payment Successful</Text>
          <View className="flex-row items-baseline mt-2">
            <Text className="text-textPrimary text-4xl font-bold">A {transaction.amount.toLocaleString()}</Text>
          </View>
        </View>

        <AppCard variant="secondary" className="mb-6 p-6">
          <View className="flex-row justify-between items-start mb-6">
            <View className="flex-1">
              <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-widest mb-1">Transaction ID</Text>
              <Text className="text-textPrimary font-mono text-xs mb-4">{transaction.id}</Text>
              
              <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-widest mb-1">Date & Time</Text>
              <Text className="text-textPrimary text-xs">{new Date(transaction.timestamp).toLocaleString()}</Text>
            </View>
            <Image 
              source={require('../../../assets/logo.png')} 
              style={{ width: 60, height: 60, resizeMode: 'contain' }} 
            />
          </View>

          <View className="h-[1px] bg-slate-800/50 mb-6" />

          <View className="mb-6">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 rounded-full bg-surface items-center justify-center mr-3">
                <User color="#94A3B8" size={16} />
              </View>
              <View>
                <Text className="text-textSecondary text-[10px] font-bold uppercase">From (Sender)</Text>
                <Text className="text-textPrimary font-bold">{transaction.userName || 'User'}</Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-surface items-center justify-center mr-3">
                <ShieldCheck color="#76b33a" size={16} />
              </View>
              <View>
                <Text className="text-textSecondary text-[10px] font-bold uppercase">To (Recipient/Merchant)</Text>
                <Text className="text-textPrimary font-bold">{transaction.merchantId ? 'Authorized Merchant' : (transaction.recipientName || 'Recipient')}</Text>
              </View>
            </View>
          </View>

          <View className="h-[1px] bg-slate-800/50 mb-6" />

          <View className="space-y-4">
            <View className="flex-row justify-between">
              <Text className="text-textSecondary text-xs">Payment Method</Text>
              <Text className="text-textPrimary text-xs font-bold">{transaction.payoutDetails?.type === 'bank' ? 'Bank Transfer' : 'Mobile Money'}</Text>
            </View>
            <View className="flex-row justify-between mt-2">
              <Text className="text-textSecondary text-xs">Service Type</Text>
              <Text className="text-textPrimary text-xs font-bold uppercase">{transaction.type}</Text>
            </View>
            <View className="flex-row justify-between mt-2">
              <Text className="text-textSecondary text-xs">Destination Country</Text>
              <Text className="text-textPrimary text-xs font-bold">
                {transaction.destinationCountry === 'A-Wallet' ? transaction.senderCountry : (transaction.destinationCountry || transaction.senderCountry || 'N/A')}
              </Text>
            </View>

            <View className="h-[1px] bg-slate-800/30 my-2" />

            <View className="mb-2">
              <Text className="text-textSecondary text-[10px] font-bold uppercase mb-2">Paid To Details</Text>
              <View className="bg-primary/30 p-4 rounded-2xl border border-slate-800/50">
                {isDeposit ? (
                  <View>
                    <Text className="text-textSecondary text-[10px] mb-1">MERCHANT PAYMENT INFO</Text>
                    <Text className="text-textPrimary font-bold">{transaction.merchantDetails?.momoProvider || transaction.merchantDetails?.bankName || 'Authorized Merchant'}</Text>
                    <Text className="text-accent font-bold text-base">{transaction.merchantDetails?.momoNumber || transaction.merchantDetails?.accountNo || 'Processing...'}</Text>
                    <Text className="text-textSecondary text-[10px] mt-1">{transaction.merchantDetails?.momoName || transaction.merchantDetails?.accountName || ''}</Text>
                  </View>
                ) : (
                  <View>
                    <Text className="text-textSecondary text-[10px] mb-1">{transaction.payoutDetails?.type === 'bank' ? 'BANK ACCOUNT' : 'MOBILE MONEY'}</Text>
                    <Text className="text-textPrimary font-bold">{transaction.payoutDetails?.momoProvider || transaction.payoutDetails?.bankName || 'N/A'}</Text>
                    <Text className="text-accent font-bold text-base">{transaction.payoutDetails?.momoNumber || transaction.payoutDetails?.accountNo || 'N/A'}</Text>
                    <Text className="text-textSecondary text-[10px] mt-1">{transaction.payoutDetails?.momoName || transaction.payoutDetails?.accountName || 'N/A'}</Text>
                  </View>
                )}
              </View>
            </View>

            <View className="h-[1px] bg-slate-800/30 my-2" />

            <View className="flex-row justify-between mt-2">
              <Text className="text-textSecondary text-xs">Total Charged</Text>
              <Text className="text-textPrimary text-xs font-bold">{transaction.senderCurrency || ''} {transaction.totalAmount?.toLocaleString() || transaction.localAmount?.toLocaleString() || 'N/A'}</Text>
            </View>
            <View className="flex-row justify-between mt-2">
              <Text className="text-textSecondary text-xs">Credits Transferred</Text>
              <Text className="text-textPrimary text-xs font-bold">A {transaction.amount?.toLocaleString()}</Text>
            </View>
            <View className="flex-row justify-between mt-2">
              <Text className="text-accent text-xs font-bold uppercase tracking-tighter">Amount Paid to Recipient</Text>
              <Text className="text-accent text-lg font-bold">{transaction.recipientCurrency || transaction.currencyCode || ''} {transaction.finalAmount?.toLocaleString() || transaction.localAmount?.toLocaleString() || 'N/A'}</Text>
            </View>
          </View>
        </AppCard>

        <View className="bg-surface/50 border border-card-border p-6 rounded-3xl items-center mb-10">
          <View className="bg-white p-2 rounded-xl mb-4">
            {/* Simple placeholder for QR */}
            <View style={{ width: 120, height: 120, backgroundColor: '#000', borderRadius: 4 }} />
          </View>
          <Text className="text-textSecondary text-[10px] text-center px-6">
            This receipt is officially generated by A-Transfer. Scan the QR code to verify this transaction on the blockchain network.
          </Text>
        </View>

        <AppButton 
          title="Download PDF" 
          variant="outline" 
          onPress={() => Alert.alert('Coming Soon', 'PDF Generation will be available in the production version.')} 
          icon={<Download color="#94A3B8" size={20} />}
          className="mb-4"
        />
        
        <AppButton 
          title="Done" 
          variant="accent" 
          onPress={() => navigation.popToTop()} 
          className="mb-20"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReceiptScreen;
