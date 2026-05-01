import React, { useState } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image } from 'react-native';
import { 
  Briefcase, 
  User as UserIcon, 
  ChevronRight, 
  ArrowRight, 
  Mail, 
  Phone, 
  Globe, 
  FileText, 
  CheckCircle2,
  Camera,
  ArrowLeft
} from 'lucide-react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useWalletStore } from '../../store/useWalletStore';
import { AppButton } from '../../components/ui/AppButton';
import { AppAlert } from '../../components/ui/AppAlert';
import { pickImage, uploadKYCDocument } from '../../utils/kyc';

const MerchantOnboarding = ({ navigation }: any) => {
  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneCode, setPhoneCode] = useState('+233');
  const [showPhoneCodeDropdown, setShowPhoneCodeDropdown] = useState(false);
  const [country, setCountry] = useState('');
  
  // Document State
  const [idImage, setIdImage] = useState<string | null>(null);
  const [certImage, setCertImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);

  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<{ title: string, message: string } | null>(null);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
   
  const { applyForMerchant, availableCountries } = useWalletStore();

  const handlePickId = async () => {
    const uri = await pickImage(true);
    if (uri) setIdImage(uri);
  };

  const handlePickCert = async () => {
    const uri = await pickImage(false); // Can be gallery for certificates
    if (uri) setCertImage(uri);
  };

  const handlePickSelfie = async () => {
    const uri = await pickImage(true);
    if (uri) setSelfieImage(uri);
  };

  const isFormValid = firstName.trim() && lastName.trim() && businessName.trim() && email.trim() && phone.trim() && country && idImage && certImage && selfieImage;

  const handleSubmit = async () => {
    setAttemptedSubmit(true);
    if (!isFormValid) {
      Alert.alert('Required Fields', 'Please complete all sections and upload the required documents before submitting.');
      return;
    }

    setIsVerifying(true);
    try {
      // Upload all documents
      const idUrl = await uploadKYCDocument(idImage!, 'merchant_kyc', 'gov_id.jpg');
      const certUrl = await uploadKYCDocument(certImage!, 'merchant_kyc', 'business_cert.jpg');
      const selfieUrl = await uploadKYCDocument(selfieImage!, 'merchant_kyc', 'selfie.jpg');

      await applyForMerchant({ 
        businessName, 
        ownerName: `${firstName} ${lastName}`, 
        firstName,
        lastName,
        phone: `${phoneCode}${phone}`, 
        email,
        country,
        documents: {
          idUrl,
          certUrl,
          selfieUrl
        }
      });
      
      setShowSuccess(true);
    } catch (err: any) {
      setError({ title: 'Submission Failed', message: err.message });
    } finally {
      setIsVerifying(false);
    }
  };

  if (showSuccess) {
    return (
      <SafeAreaView className="flex-1 bg-primary">
        <View className="flex-1 items-center justify-center px-10">
          <Animated.View entering={FadeInUp} className="items-center">
            <View className="w-24 h-24 rounded-full bg-accent/20 items-center justify-center mb-8">
              <CheckCircle2 color="#76b33a" size={48} />
            </View>
            <Text className="text-textPrimary text-3xl font-bold text-center mb-4">Under Review</Text>
            <Text className="text-textSecondary text-center leading-6 mb-12">
              Your application to become an A-Merchant has been received! Our compliance team will review your documents. You'll receive a notification on your dashboard once approved.
            </Text>
            <AppButton 
              title="Return to Homepage" 
              variant="accent" 
              size="large" 
              className="w-full"
              onPress={() => navigation.navigate('Dashboard')}
              icon={<ArrowLeft color="#76b33a" size={20} />}
            />
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <AppAlert 
        visible={!!error}
        type="error"
        title={error?.title || ''}
        message={error?.message || ''}
        onConfirm={() => setError(null)}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1 px-8 pt-6" showsVerticalScrollIndicator={false}>
          
          <View className="flex-row items-center justify-between mb-8">
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              className="w-12 h-12 rounded-2xl bg-surface border border-slate-800 items-center justify-center"
            >
              <ArrowLeft color="#94A3B8" size={24} />
            </TouchableOpacity>
            <Text className="text-textPrimary text-xl font-bold">Merchant Portal</Text>
            <View className="w-12" />
          </View>

          <Animated.View entering={FadeIn} className="space-y-6 pb-20">
            <View className="mb-4">
              <Text className="text-textPrimary text-3xl font-bold">Apply to Sell</Text>
              <Text className="text-textSecondary text-base mt-2">Submit your business credentials for verification.</Text>
            </View>

            {/* Personal Details */}
            <View className="flex-row justify-between">
              <View className="w-[48%]">
                <Text className={`text-[10px] font-bold uppercase tracking-widest mb-2 ml-1 ${attemptedSubmit && !firstName ? 'text-red-500' : 'text-textSecondary'}`}>First Name</Text>
                <View className={`bg-surface p-4 rounded-2xl border ${attemptedSubmit && !firstName ? 'border-red-500' : 'border-slate-800'}`}>
                  <TextInput 
                    className="text-textPrimary font-semibold"
                    placeholder="John"
                    placeholderTextColor="#475569"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>
              </View>
              <View className="w-[48%]">
                <Text className={`text-[10px] font-bold uppercase tracking-widest mb-2 ml-1 ${attemptedSubmit && !lastName ? 'text-red-500' : 'text-textSecondary'}`}>Last Name</Text>
                <View className={`bg-surface p-4 rounded-2xl border ${attemptedSubmit && !lastName ? 'border-red-500' : 'border-slate-800'}`}>
                  <TextInput 
                    className="text-textPrimary font-semibold"
                    placeholder="Doe"
                    placeholderTextColor="#475569"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
              </View>
            </View>

            <View>
              <Text className={`text-[10px] font-bold uppercase tracking-widest mb-2 ml-1 ${attemptedSubmit && !email ? 'text-red-500' : 'text-textSecondary'}`}>Gmail Address</Text>
              <View className={`flex-row items-center bg-surface p-4 rounded-2xl border ${attemptedSubmit && !email ? 'border-red-500' : 'border-slate-800'}`}>
                <Mail color={attemptedSubmit && !email ? "#EF4444" : "#76b33a"} size={18} />
                <TextInput 
                  className="flex-1 ml-3 text-textPrimary font-semibold"
                  placeholder="yourname@gmail.com"
                  placeholderTextColor="#475569"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View>
              <Text className={`text-[10px] font-bold uppercase tracking-widest mb-2 ml-1 ${attemptedSubmit && !phone ? 'text-red-500' : 'text-textSecondary'}`}>Phone Number</Text>
              <View className="flex-row">
                {/* Phone Code Picker */}
                <TouchableOpacity 
                  onPress={() => setShowPhoneCodeDropdown(!showPhoneCodeDropdown)}
                  className={`flex-row items-center bg-surface px-4 rounded-2xl border mr-2 ${attemptedSubmit && !phone ? 'border-red-500' : 'border-slate-800'}`}
                  style={{ minWidth: 100 }}
                >
                  <Text className="text-textPrimary font-bold text-sm">
                    {availableCountries.find(c => c.phoneCode === phoneCode)?.code} {phoneCode}
                  </Text>
                  <ChevronRight color="#94A3B8" size={14} style={{ marginLeft: 8, transform: [{ rotate: showPhoneCodeDropdown ? '90deg' : '0deg' }] }} />
                </TouchableOpacity>

                <View className={`flex-1 flex-row items-center bg-surface p-4 rounded-2xl border ${attemptedSubmit && !phone ? 'border-red-500' : 'border-slate-800'}`}>
                  <Phone color={attemptedSubmit && !phone ? "#EF4444" : "#76b33a"} size={18} />
                  <TextInput 
                    className="flex-1 ml-3 text-textPrimary font-semibold"
                    placeholder="540 000 000"
                    placeholderTextColor="#475569"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))}
                  />
                </View>
              </View>

              {showPhoneCodeDropdown && (
                <View className="mt-2 bg-surface border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                  <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled={true}>
                    {availableCountries.map(c => (
                      <TouchableOpacity 
                        key={c.code}
                        onPress={() => {
                          setPhoneCode(c.phoneCode);
                          setShowPhoneCodeDropdown(false);
                        }}
                        className={`p-4 border-b border-slate-800/50 flex-row items-center justify-between ${phoneCode === c.phoneCode ? 'bg-accent/10' : ''}`}
                      >
                        <Text className="text-textPrimary font-bold">
                          {c.flag} {c.name} ({c.code})
                        </Text>
                        <Text className="text-accent font-bold">{c.phoneCode}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Business Details */}
            <View>
              <Text className={`text-[10px] font-bold uppercase tracking-widest mb-2 ml-1 ${attemptedSubmit && !businessName ? 'text-red-500' : 'text-textSecondary'}`}>Business Name</Text>
              <View className={`flex-row items-center bg-surface p-4 rounded-2xl border ${attemptedSubmit && !businessName ? 'border-red-500' : 'border-slate-800'}`}>
                <Briefcase color={attemptedSubmit && !businessName ? "#EF4444" : "#76b33a"} size={18} />
                <TextInput 
                  className="flex-1 ml-3 text-textPrimary font-semibold"
                  placeholder="e.g. A-Transfer Ghana LTD"
                  placeholderTextColor="#475569"
                  value={businessName}
                  onChangeText={setBusinessName}
                />
              </View>
            </View>

            <View>
              <Text className={`text-[10px] font-bold uppercase tracking-widest mb-2 ml-1 ${attemptedSubmit && !country ? 'text-red-500' : 'text-textSecondary'}`}>Operational Country</Text>
              <TouchableOpacity 
                onPress={() => setShowCountryDropdown(!showCountryDropdown)}
                className={`flex-row items-center justify-between bg-surface p-4 rounded-2xl border ${attemptedSubmit && !country ? 'border-red-500' : 'border-slate-800'}`}
              >
                <View className="flex-row items-center">
                  <Globe color={attemptedSubmit && !country ? "#EF4444" : "#76b33a"} size={18} />
                  <Text className={`ml-3 font-semibold ${country ? 'text-textPrimary' : 'text-slate-600'}`}>
                    {country ? (availableCountries.find(c => c.name === country)?.flag + ' ' + country) : "Select a Country"}
                  </Text>
                </View>
                <ChevronRight color={attemptedSubmit && !country ? "#EF4444" : "#94A3B8"} size={18} style={{ transform: [{ rotate: showCountryDropdown ? '90deg' : '0deg' }] }} />
              </TouchableOpacity>

              {showCountryDropdown && (
                <View className="mt-2 bg-surface border border-slate-800 rounded-2xl overflow-hidden">
                  <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled={true}>
                    {availableCountries.map(c => (
                      <TouchableOpacity 
                        key={c.name}
                        onPress={() => {
                          setCountry(c.name);
                          setShowCountryDropdown(false);
                        }}
                        className={`p-4 border-b border-slate-800/50 flex-row items-center justify-between ${country === c.name ? 'bg-accent/10' : ''}`}
                      >
                        <Text className={`font-bold ${country === c.name ? 'text-accent' : 'text-textPrimary'}`}>
                          {c.flag} {c.name}
                        </Text>
                        {country === c.name && <CheckCircle2 color="#76b33a" size={16} />}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Document Upload */}
            <View>
              <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-widest mb-4 ml-1">Required Documents</Text>
              
              <TouchableOpacity 
                onPress={handlePickId}
                className={`flex-row items-center p-5 rounded-3xl border mb-3 ${idImage ? 'bg-accent/10 border-accent/30' : (attemptedSubmit ? 'bg-red-500/5 border-red-500' : 'bg-surface border-slate-800')}`}
              >
                <View className="bg-primary/50 p-3 rounded-xl mr-4 overflow-hidden w-12 h-12 items-center justify-center">
                  {idImage ? <Image source={{ uri: idImage }} className="w-12 h-12" /> : <Camera color={attemptedSubmit ? "#EF4444" : "#94A3B8"} size={20} />}
                </View>
                <View className="flex-1">
                  <Text className={`font-bold ${attemptedSubmit && !idImage ? 'text-red-500' : 'text-textPrimary'}`}>Government ID</Text>
                  <Text className="text-textSecondary text-[10px]">National ID or Passport</Text>
                </View>
                {idImage && <CheckCircle2 color="#76b33a" size={20} />}
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handlePickCert}
                className={`flex-row items-center p-5 rounded-3xl border mb-3 ${certImage ? 'bg-accent/10 border-accent/30' : (attemptedSubmit ? 'bg-red-500/5 border-red-500' : 'bg-surface border-slate-800')}`}
              >
                <View className="bg-primary/50 p-3 rounded-xl mr-4 overflow-hidden w-12 h-12 items-center justify-center">
                  {certImage ? <Image source={{ uri: certImage }} className="w-12 h-12" /> : <FileText color={attemptedSubmit ? "#EF4444" : "#94A3B8"} size={20} />}
                </View>
                <View className="flex-1">
                  <Text className={`font-bold ${attemptedSubmit && !certImage ? 'text-red-500' : 'text-textPrimary'}`}>Business Certificate</Text>
                  <Text className="text-textSecondary text-[10px]">Registration Docs</Text>
                </View>
                {certImage && <CheckCircle2 color="#76b33a" size={20} />}
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handlePickSelfie}
                className={`flex-row items-center p-5 rounded-3xl border ${selfieImage ? 'bg-accent/10 border-accent/30' : (attemptedSubmit ? 'bg-red-500/5 border-red-500' : 'bg-surface border-slate-800')}`}
              >
                <View className="bg-primary/50 p-3 rounded-xl mr-4 overflow-hidden w-12 h-12 items-center justify-center">
                  {selfieImage ? <Image source={{ uri: selfieImage }} className="w-12 h-12" /> : <UserIcon color={attemptedSubmit ? "#EF4444" : "#94A3B8"} size={20} />}
                </View>
                <View className="flex-1">
                  <Text className={`font-bold ${attemptedSubmit && !selfieImage ? 'text-red-500' : 'text-textPrimary'}`}>Biometric Selfie</Text>
                  <Text className="text-textSecondary text-[10px]">Verify your identity</Text>
                </View>
                {selfieImage && <CheckCircle2 color="#76b33a" size={20} />}
              </TouchableOpacity>
            </View>

            <AppButton 
              title={isVerifying ? "Submitting Application..." : "Submit Application"} 
              variant={isFormValid ? "accent" : "outline"} 
              size="large"
              className={`mt-6 ${!isFormValid ? 'opacity-50' : ''}`}
              onPress={handleSubmit}
              loading={isVerifying}
              icon={<ArrowRight color={isFormValid ? "#76b33a" : "#94A3B8"} size={20} />}
            />
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MerchantOnboarding;

