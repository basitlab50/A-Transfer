import React, { useState } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Mail, Lock, ArrowRight, ChevronLeft, ShieldCheck } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LoginNavigationProp } from '../../types/navigation';
import { useWalletStore } from '../../store/useWalletStore';
import { AppButton } from '../../components/ui/AppButton';
import { AppAlert } from '../../components/ui/AppAlert';

interface Props {
  navigation: LoginNavigationProp;
}

const Login = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<{ title: string, message: string } | null>(null);
  const signIn = useWalletStore(state => state.signIn);

  const handleLogin = async () => {
    if (email && password) {
      try {
        await signIn(email, password);
      } catch (err: any) {
        setError({ 
          title: 'Login Failed', 
          message: err.message || 'An unexpected error occurred. Please check your credentials and try again.' 
        });
      }
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
            <View>
              <Text className="text-textSecondary text-xs font-bold uppercase tracking-widest mb-3 ml-1">Email Address</Text>
              <View className="flex-row items-center bg-surface p-5 rounded-[24px] border border-slate-800">
                <Mail color="#76b33a" size={20} />
                <TextInput 
                  className="flex-1 ml-4 text-textPrimary font-semibold"
                  placeholder="name@example.com"
                  placeholderTextColor="#475569"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
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
              onPress={handleLogin}
              icon={<ArrowRight color="#76b33a" size={20} />}
            />
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
