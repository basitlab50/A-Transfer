import React, { useState, useRef, useEffect } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { ChevronLeft, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { AppButton } from '../../components/ui/AppButton';
import { verificationService } from '../../services/verificationService';
import { useWalletStore } from '../../store/useWalletStore';

interface Props {
  navigation: any;
  route: any;
}

const VerifyOtp = ({ navigation, route }: Props) => {
  const { userData } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const inputs = useRef<TextInput[]>([]);
  
  const { signUp } = useWalletStore();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const enteredCode = otp.join('');
    if (enteredCode.length !== 6) return;

    setIsLoading(true);
    const isValid = verificationService.verifySmsOtp(enteredCode);

    if (isValid) {
      try {
        // Phone verified! Now create account and trigger email verification
        await signUp(
          userData.name,
          userData.email,
          userData.password,
          userData.phone,
          userData.country
        );
        
        const { setOtpVerified } = useWalletStore.getState();
        setOtpVerified(true);
        
        // Navigate to Email Verification Screen
        navigation.replace('EmailVerification', { email: userData.email });
      } catch (err: any) {
        Alert.alert('Registration Error', err.message);
        setIsLoading(false);
      }
    } else {
      Alert.alert('Invalid Code', 'The OTP you entered is incorrect. Please try again.');
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    if (timer > 0) return;
    setTimer(60);
    await verificationService.sendSmsOtp(userData.phone);
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-8 pt-6">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="w-12 h-12 rounded-2xl bg-surface border border-slate-800 items-center justify-center mb-10"
          >
            <ChevronLeft color="#94A3B8" size={24} />
          </TouchableOpacity>

          <Animated.View entering={FadeInUp} className="mb-10">
            <View className="w-16 h-16 rounded-3xl bg-accent/10 items-center justify-center mb-6">
              <ShieldCheck color="#76b33a" size={32} />
            </View>
            <Text className="text-textPrimary text-3xl font-bold tracking-tight">Verify Phone</Text>
            <Text className="text-textSecondary text-base mt-2">
              We've sent a 6-digit code to <Text className="text-accent font-bold">{userData.phone}</Text>
            </Text>
          </Animated.View>

          <Animated.View entering={FadeIn.delay(200)} className="flex-row justify-between mb-10">
            {otp.map((digit, index) => (
              <View key={index} className="w-12 h-16 bg-surface border border-slate-800 rounded-2xl items-center justify-center">
                <TextInput
                  ref={(ref) => (inputs.current[index] = ref as TextInput)}
                  className="text-textPrimary text-2xl font-bold text-center w-full h-full"
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(text) => handleChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                />
              </View>
            ))}
          </Animated.View>

          <AppButton 
            title="Verify & Continue" 
            variant="accent" 
            size="large"
            isLoading={isLoading}
            onPress={handleVerify}
            icon={<ArrowRight color="#76b33a" size={20} />}
          />

          <View className="flex-row justify-center mt-10">
            <Text className="text-textSecondary">Didn't receive a code? </Text>
            <TouchableOpacity onPress={resendOtp}>
              <Text className={`${timer > 0 ? 'text-textSecondary' : 'text-accent'} font-bold`}>
                {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default VerifyOtp;
