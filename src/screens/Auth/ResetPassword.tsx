import React, { useState } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Lock, ArrowRight, ChevronLeft, CheckCircle2 } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { AppButton } from '../../components/ui/AppButton';
import { AppAlert } from '../../components/ui/AppAlert';

const ResetPassword = ({ route, navigation }: any) => {
  const { email } = route.params || { email: 'your email' };
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);

  const handleReset = () => {
    if (password.length < 6 || password !== confirmPassword) {
      return;
    }
    setAlertVisible(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <AppAlert 
        visible={alertVisible}
        type="success"
        title="Password Updated"
        message="Your password has been successfully reset. You can now sign in with your new credentials."
        onConfirm={() => {
          setAlertVisible(false);
          navigation.navigate('Login');
        }}
        confirmText="Sign In Now"
      />
      <KeyboardAvoidingView 
        behavior={undefined}
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
            <Text className="text-textPrimary text-4xl font-bold tracking-tight">Set New Password</Text>
            <Text className="text-textSecondary text-base mt-2">Create a secure password for <Text className="text-accent font-bold">{email}</Text></Text>
          </View>

          <Animated.View entering={FadeIn.delay(200)} className="space-y-6">
            <View>
              <Text className="text-textSecondary text-xs font-bold uppercase tracking-widest mb-3 ml-1">New Password</Text>
              <View className="flex-row items-center bg-surface p-5 rounded-[24px] border border-slate-800">
                <Lock color="#76b33a" size={20} />
                <TextInput 
                  className="flex-1 ml-4 text-textPrimary font-semibold"
                  placeholder="••••••••"
                  placeholderTextColor="#475569"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  autoFocus
                />
              </View>
            </View>

            <View className="mt-6 mb-10">
              <Text className="text-textSecondary text-xs font-bold uppercase tracking-widest mb-3 ml-1">Confirm New Password</Text>
              <View className="flex-row items-center bg-surface p-5 rounded-[24px] border border-slate-800">
                <Lock color="#76b33a" size={20} />
                <TextInput 
                  className="flex-1 ml-4 text-textPrimary font-semibold"
                  placeholder="••••••••"
                  placeholderTextColor="#475569"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
            </View>

            <AppButton 
              title="Reset Password" 
              variant="accent" 
              size="large"
              onPress={handleReset}
              icon={<ArrowRight color="#76b33a" size={20} />}
            />
          </Animated.View>

          <View className="items-center mt-12 opacity-50 flex-row justify-center">
            <CheckCircle2 color="#76b33a" size={16} />
            <Text className="text-[10px] text-textSecondary uppercase ml-2 font-bold tracking-widest">End-to-End Encryption Active</Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ResetPassword;
