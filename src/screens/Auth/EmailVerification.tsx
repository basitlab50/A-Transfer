import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Linking, Image, Platform } from 'react-native';
import { Mail, ArrowRight, ExternalLink } from 'lucide-react-native';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { AppButton } from '../../components/ui/AppButton';
import { useWalletStore } from '../../store/useWalletStore';

interface Props {
  navigation: any;
  route: any;
}

const EmailVerification = ({ navigation, route }: Props) => {
  const { email } = route.params;
  const { userProfile } = useWalletStore();

  const openEmailApp = () => {
    // Attempt to open email app
    if (Platform.OS === 'ios') {
      Linking.openURL('message://');
    } else {
      Linking.openURL('mailto:');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-1 px-8 items-center justify-center">
        
        <Animated.View entering={FadeInUp} className="items-center mb-10">
          <View className="w-24 h-24 rounded-full bg-accent/10 items-center justify-center mb-8">
            <Mail color="#76b33a" size={48} />
          </View>
          <Text className="text-textPrimary text-3xl font-bold text-center tracking-tight">Verify Email</Text>
          <Text className="text-textSecondary text-center text-base mt-4 px-4">
            We've sent a verification link to <Text className="text-textPrimary font-semibold">{email}</Text>. Please click it to activate your account.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(300)} className="w-full space-y-4">
          <AppButton 
            title="Open Email App" 
            variant="accent" 
            onPress={openEmailApp}
            icon={<ExternalLink color="#76b33a" size={20} />}
          />
          
          <TouchableOpacity 
            onPress={() => navigation.replace('MainApp')}
            className="w-full py-5 items-center"
          >
            <Text className="text-textSecondary font-semibold">I'll do this later</Text>
          </TouchableOpacity>
        </Animated.View>

        <View className="mt-12 p-6 bg-surface rounded-3xl border border-slate-800 w-full">
          <Text className="text-textSecondary text-sm text-center">
            Once you've verified your email, you'll have full access to P2P transfers and high-limit transactions.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default EmailVerification;
