import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Mail, Lock, ArrowRight, ChevronLeft, ShieldCheck, User } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LoginNavigationProp } from '../../types/navigation';
import { useWalletStore } from '../../store/useWalletStore';
import { AppButton } from '../../components/ui/AppButton';
import { AppAlert } from '../../components/ui/AppAlert';
import { verificationService } from '../../services/verificationService';

interface Props {
  navigation: LoginNavigationProp;
}
const Login = ({ navigation }: Props) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [showMethodSelection, setShowMethodSelection] = useState(false);
  const [otpMethod, setOtpMethod] = useState<'email' | 'phone'>('email');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [timer, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ title: string, message: string } | null>(null);

  useEffect(() => {
    let interval: any;
    if (showOtp && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showOtp, timer]);

  const signIn = useWalletStore(state => state.signIn);
  const { userProfile } = useWalletStore();

  const handleLogin = async () => {
    if (identifier && password) {
      setIsLoading(true);
      try {
        // Step 1: Verify credentials (log in)
        const user = await signIn(identifier, password);
        
        // Fetch user profile to get phone number
        // Note: The store's initializeAuth usually loads the profile,
        // but we need the phone now.
        const { db } = await import('../../config/firebase');
        const { doc, getDoc } = await import('firebase/firestore');
        const profileSnap = await getDoc(doc(db, 'users', user.uid));
        
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          setUserPhone(data.phone);
          setUserEmail(data.email);
        } else {
          setUserEmail(user.email);
        }

        setShowMethodSelection(true);
        setIsLoading(false);
      } catch (err: any) {
        setIsLoading(false);
        setError({ 
          title: 'Login Failed', 
          message: err.message || 'An unexpected error occurred. Please check your credentials.' 
        });
      }
    }
  };

  const selectMethod = async (method: 'email' | 'phone') => {
    setOtpMethod(method);
    setIsLoading(true);
    
    let success = false;
    if (method === 'email') {
      success = await verificationService.sendEmailOtp(userEmail);
    } else {
      success = await verificationService.sendSmsOtp(userPhone);
    }

    if (success) {
      setShowMethodSelection(false);
      setShowOtp(true);
      setTimer(60);
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    const isValid = otpMethod === 'email' 
      ? verificationService.verifyEmailOtp(enteredOtp)
      : verificationService.verifySmsOtp(enteredOtp);
    
    if (isValid) {
      const { setOtpVerified } = useWalletStore.getState();
      setOtpVerified(true);
    } else {
      setIsLoading(false);
      Alert.alert('Invalid Code', 'The OTP you entered is incorrect.');
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setTimer(60);
    if (otpMethod === 'email') {
      await verificationService.sendEmailOtp(userEmail);
    } else {
      await verificationService.sendSmsOtp(userPhone);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <AppAlert 
        visible={!!error}
        type="error"
        title={error?.title || ''}
        message={error?.message || ''}
        onConfirm={() => setError(null)}
      />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-8 pt-6">
          
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="w-12 h-12 rounded-2xl bg-surface border border-slate-800 items-center justify-center mb-10"
          >
            <ChevronLeft color="#94A3B8" size={24} />
          </TouchableOpacity>

          <View className="mb-12">
            <Text className="text-textPrimary text-4xl font-bold tracking-tight">Welcome Back</Text>
            <Text className="text-textSecondary text-base mt-2">Sign in to continue your secure transfers.</Text>
          </View>

          <Animated.View entering={FadeIn.delay(200)} className="space-y-6">
            {!showOtp && !showMethodSelection ? (
              <>
                <View>
                  <Text className="text-textSecondary text-xs font-bold uppercase tracking-widest mb-3 ml-1">Email, Phone or AID</Text>
                  <View className="flex-row items-center bg-surface p-5 rounded-[24px] border border-slate-800">
                    <User color="#76b33a" size={20} />
                    <TextInput 
                      className="flex-1 ml-4 text-textPrimary font-semibold"
                      placeholder="Email, +234..., or AID"
                      placeholderTextColor="#475569"
                      autoCapitalize="none"
                      value={identifier}
                      onChangeText={setIdentifier}
                    />
                  </View>
                </View>

                <View className="mt-8 mb-12">
                  <Text className="text-textSecondary text-xs font-bold uppercase tracking-widest mb-3 ml-1">Password</Text>
                  <View className="flex-row items-center bg-surface p-5 rounded-[24px] border border-slate-800">
                    <Lock color="#76b33a" size={20} />
                    <TextInput 
                      className="flex-1 ml-4 text-textPrimary font-semibold"
                      placeholder="••••••••"
                      placeholderTextColor="#475569"
                      secureTextEntry
                      value={password}
                      onChangeText={setPassword}
                    />
                  </View>
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('ForgotPassword')}
                    className="mt-4 self-end"
                  >
                    <Text className="text-accent text-sm font-bold">Forgot Password?</Text>
                  </TouchableOpacity>
                </View>

                <AppButton 
                  title="Sign In" 
                  variant="accent" 
                  size="large"
                  isLoading={isLoading}
                  onPress={handleLogin}
                  icon={<ArrowRight color="#76b33a" size={20} />}
                />
              </>
            ) : showMethodSelection ? (
              <Animated.View entering={FadeIn} className="space-y-6">
                <View className="items-center mb-6">
                  <View className="w-16 h-16 rounded-2xl bg-accent/10 items-center justify-center mb-4">
                    <ShieldCheck color="#76b33a" size={32} />
                  </View>
                  <Text className="text-textPrimary text-2xl font-bold">Verification Method</Text>
                  <Text className="text-textSecondary text-center mt-2 px-6">
                    Choose how you would like to receive your security code.
                  </Text>
                </View>

                <TouchableOpacity 
                  onPress={() => selectMethod('email')}
                  className="bg-surface p-6 rounded-[24px] border border-slate-800 flex-row items-center"
                >
                  <View className="w-12 h-12 rounded-xl bg-accent/10 items-center justify-center mr-4">
                    <Mail color="#76b33a" size={24} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-textPrimary font-bold text-lg">Send to Email</Text>
                    <Text className="text-textSecondary text-sm">{userEmail.replace(/(.{3})(.*)(?=@)/, "$1***")}</Text>
                  </View>
                  <ArrowRight color="#475569" size={20} />
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => selectMethod('phone')}
                  className="bg-surface p-6 rounded-[24px] border border-slate-800 flex-row items-center"
                >
                  <View className="w-12 h-12 rounded-xl bg-accent/10 items-center justify-center mr-4">
                    <User color="#76b33a" size={24} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-textPrimary font-bold text-lg">Send to Phone</Text>
                    <Text className="text-textSecondary text-sm">+{userPhone.replace(/(.{4})(.*)(.{3})/, "$1******$3")}</Text>
                  </View>
                  <ArrowRight color="#475569" size={20} />
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => setShowMethodSelection(false)}
                  className="py-4 items-center"
                >
                  <Text className="text-textSecondary font-semibold">Cancel</Text>
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <Animated.View entering={FadeIn} className="space-y-8">
                <View className="items-center mb-4">
                  <View className="w-16 h-16 rounded-2xl bg-accent/10 items-center justify-center mb-4">
                    <ShieldCheck color="#76b33a" size={32} />
                  </View>
                  <Text className="text-textPrimary text-2xl font-bold">Confirm Identity</Text>
                  <Text className="text-textSecondary text-center mt-2 px-6">
                    Enter the code we sent to your <Text className="text-accent font-bold">{otpMethod}</Text>.
                  </Text>
                </View>

                <View className="bg-surface p-6 rounded-[24px] border border-slate-800">
                  <TextInput 
                    className="text-textPrimary text-3xl font-bold text-center tracking-[10px]"
                    placeholder="000000"
                    placeholderTextColor="#1e293b"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={enteredOtp}
                    onChangeText={setEnteredOtp}
                    autoFocus
                  />
                </View>

                <AppButton 
                  title="Verify OTP" 
                  variant="accent" 
                  size="large"
                  isLoading={isLoading}
                  onPress={handleVerifyOtp}
                  icon={<ArrowRight color="#76b33a" size={20} />}
                />

                <View className="flex-row justify-center">
                  <Text className="text-textSecondary">Didn't receive a code? </Text>
                  <TouchableOpacity onPress={handleResendOtp}>
                    <Text className={`${timer > 0 ? 'text-textSecondary' : 'text-accent'} font-bold`}>
                      {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  onPress={() => {
                    setShowOtp(false);
                    setShowMethodSelection(true);
                  }}
                  className="py-2 items-center"
                >
                  <Text className="text-textSecondary font-semibold">Change Method</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </Animated.View>

          <View className="flex-row justify-center mt-12 mb-10">
            <Text className="text-textSecondary">Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text className="text-accent font-bold">Create Account</Text>
            </TouchableOpacity>
          </View>

          <View className="items-center opacity-40">
            <ShieldCheck color="#94A3B8" size={16} />
            <Text className="text-[10px] text-textSecondary uppercase mt-2 font-bold tracking-widest">Secure End-to-End SSL</Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;
