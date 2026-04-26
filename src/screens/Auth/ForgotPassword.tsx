import React, { useState } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Mail, ArrowRight, ChevronLeft, ShieldQuestion } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { AppButton } from '../../components/ui/AppButton';
import { AppAlert } from '../../components/ui/AppAlert';

const ForgotPassword = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);

  const handleSendLink = () => {
    if (!email.includes('@')) {
      // For simplicity in this demo, we'll just show the alert for success.
      return;
    }
    setAlertVisible(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <AppAlert 
        visible={alertVisible}
        type="success"
        title="Reset Link Sent"
        message="If an account exists for this email, you will receive a reset link shortly."
        onConfirm={() => {
          setAlertVisible(false);
          navigation.navigate('ResetPassword', { email });
        }}
        confirmText="Proceed to Reset"
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
            <View className="bg-accent/10 w-16 h-16 rounded-3xl items-center justify-center mb-6">
              <ShieldQuestion color="#76b33a" size={32} />
            </View>
            <Text className="text-textPrimary text-4xl font-bold tracking-tight">Forgot Password?</Text>
            <Text className="text-textSecondary text-base mt-2">Enter your email and we'll send you instructions to reset your password.</Text>
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
                  autoFocus
                />
              </View>
            </View>

            <AppButton 
              title="Send Reset Link" 
              variant="accent" 
              size="large"
              onPress={handleSendLink}
              icon={<ArrowRight color="#76b33a" size={20} />}
              className="mt-4"
            />
          </Animated.View>

          <View className="flex-row justify-center mt-12 mb-10">
            <Text className="text-textSecondary">Remember password? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-accent font-bold">Sign In</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPassword;
