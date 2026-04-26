import React, { useState } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { User, Mail, Lock, ArrowRight, ChevronLeft, CheckCircle2, Phone, Globe } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { RegisterNavigationProp } from '../../types/navigation';
import { useWalletStore } from '../../store/useWalletStore';
import { AppButton } from '../../components/ui/AppButton';
import { AppAlert } from '../../components/ui/AppAlert';

interface Props {
  navigation: RegisterNavigationProp;
}

const Register = ({ navigation }: Props) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('GH');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<{ title: string, message: string } | null>(null);
  
  const { signUp, availableCountries } = useWalletStore();
  const selectedCountry = availableCountries.find(c => c.code === selectedCountryCode) || availableCountries[0];

  const handleRegister = async () => {
    if (name && email && password && phone && selectedCountry) {
      try {
        const fullPhone = `${selectedCountry.phoneCode}${phone}`;
        await signUp(name, email, password, fullPhone, selectedCountry.name);
      } catch (err: any) {
        setError({ 
          title: 'Registration Failed', 
          message: err.message || 'Could not create account. Please try again.' 
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
        <ScrollView className="flex-1 px-8 pt-6" showsVerticalScrollIndicator={false}>
          
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="w-12 h-12 rounded-2xl bg-surface border border-slate-800 items-center justify-center mb-10"
          >
            <ChevronLeft color="#94A3B8" size={24} />
          </TouchableOpacity>

          <View className="mb-10">
            <Text className="text-textPrimary text-4xl font-bold tracking-tight">Create Account</Text>
            <Text className="text-textSecondary text-base mt-2">Join the future of borderless African payments.</Text>
          </View>

          <Animated.View entering={FadeIn.delay(200)} className="space-y-6">
            <View>
              <Text className="text-textSecondary text-xs font-bold uppercase tracking-widest mb-3 ml-1">Full Name</Text>
              <View className="flex-row items-center bg-surface p-5 rounded-[24px] border border-slate-800">
                <User color="#76b33a" size={20} />
                <TextInput 
                  className="flex-1 ml-4 text-textPrimary font-semibold"
                  placeholder="John Doe"
                  placeholderTextColor="#475569"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View className="mt-6">
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

            <View className="mt-6">
              <Text className="text-textSecondary text-xs font-bold uppercase tracking-widest mb-3 ml-1">Country</Text>
              <TouchableOpacity 
                onPress={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                activeOpacity={0.7}
                className="flex-row items-center justify-between bg-surface p-5 rounded-[24px] border border-slate-800"
              >
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-3">{selectedCountry.flag}</Text>
                  <Text className="text-textPrimary font-semibold text-lg">{selectedCountry.name}</Text>
                </View>
                <ChevronLeft 
                  color="#76b33a" 
                  size={20} 
                  style={{ transform: [{ rotate: isCountryDropdownOpen ? '90deg' : '270deg' }] }} 
                />
              </TouchableOpacity>

              {isCountryDropdownOpen && (
                <View 
                  className="mt-3 bg-surface border border-slate-800 rounded-[24px] overflow-hidden"
                  style={{ elevation: 5 }}
                >
                  {availableCountries.map((c, index) => (
                    <TouchableOpacity 
                      key={c.code}
                      onPress={() => {
                        setSelectedCountryCode(c.code);
                        setIsCountryDropdownOpen(false);
                      }}
                      activeOpacity={0.6}
                      className={`flex-row items-center p-5 ${selectedCountryCode === c.code ? 'bg-accent/10' : ''} ${index !== availableCountries.length - 1 ? 'border-b border-slate-800/50' : ''}`}
                    >
                      <View className="w-10 h-10 rounded-full bg-primary items-center justify-center mr-4">
                        <Text className="text-xl">{c.flag}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className={`font-bold text-base ${selectedCountryCode === c.code ? 'text-accent' : 'text-textPrimary'}`}>{c.name}</Text>
                        <Text className="text-textSecondary text-[10px] uppercase font-bold tracking-widest mt-0.5">{c.code}</Text>
                      </View>
                      <Text className="text-accent font-bold text-sm">{c.phoneCode}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View className="mt-6">
              <Text className="text-textSecondary text-xs font-bold uppercase tracking-widest mb-3 ml-1">Phone Number</Text>
              <View className="flex-row items-center bg-surface p-5 rounded-[24px] border border-slate-800">
                <View className="flex-row items-center pr-4 border-r border-slate-800">
                  <Text className="text-accent font-bold text-base">{selectedCountry.phoneCode}</Text>
                </View>
                <TextInput 
                  className="flex-1 ml-4 text-textPrimary font-semibold text-lg"
                  placeholder="50 123 4567"
                  placeholderTextColor="#475569"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>

            <View className="mt-6 mb-10">
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
            </View>

            <View className="flex-row items-center mb-8 px-2">
              <View className="bg-accent/10 p-1 rounded-full">
                <CheckCircle2 color="#76b33a" size={14} />
              </View>
              <Text className="text-textSecondary text-[11px] ml-2 font-medium">
                I agree to the <Text className="text-accent underline">Terms of Service</Text> and Privacy Policy.
              </Text>
            </View>

            <AppButton 
              title="Create Account" 
              variant="accent" 
              size="large"
              onPress={handleRegister}
              icon={<ArrowRight color="#76b33a" size={20} />}
            />
          </Animated.View>

          <View className="flex-row justify-center mt-12 mb-10">
            <Text className="text-textSecondary">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-accent font-bold">Sign In</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Register;
