import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, Platform, Dimensions } from 'react-native';
import { SafeAreaView as AppSafeArea } from 'react-native-safe-area-context';
import { ArrowLeft, Camera, FileText, CheckCircle2, ShieldCheck, ChevronRight, User as UserIcon, Image as ImageIcon } from 'lucide-react-native';
import { useWalletStore } from '../../store/useWalletStore';
import { AppButton } from '../../components/ui/AppButton';
import { pickImage, uploadKYCDocument } from '../../utils/kyc';
import Animated, { FadeIn } from 'react-native-reanimated';

const IdentityVerification = ({ navigation }: any) => {
  const [step, setStep] = useState(1);
  const [idImage, setIdImage] = useState<string | null>(null);
  const [idType, setIdType] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const completeKYC = useWalletStore(state => state.completeKYC);

  const handlePickId = async (useCamera: boolean) => {
    const uri = await pickImage(useCamera);
    if (uri) setIdImage(uri);
  };

  const showSourceSelection = (typeLabel: string, typeId: string) => {
    Alert.alert(
      'Select Source',
      `How would you like to provide your ${typeLabel}?`,
      [
        { text: 'Take a Picture', onPress: () => handlePickId(true) },
        { text: 'Upload from Gallery', onPress: () => handlePickId(false) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleIDTap = () => {
    Alert.alert(
      'Select ID Type',
      'Which document are you uploading?',
      [
        { text: 'Government Issued ID', onPress: () => { setIdType('gov_id'); showSourceSelection('Government ID', 'gov_id'); } },
        { text: 'Driver\'s License', onPress: () => { setIdType('license'); showSourceSelection('Driver\'s License', 'license'); } },
        { text: 'Passport', onPress: () => { setIdType('passport'); showSourceSelection('Passport', 'passport'); } },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handlePickSelfie = async () => {
    const uri = await pickImage(true);
    if (uri) setSelfieImage(uri);
  };

  const handleSubmit = async () => {
    if (!idImage || !selfieImage) {
      Alert.alert('Incomplete', 'Please upload both your ID and Live Selfie.');
      return;
    }

    setIsUploading(true);
    try {
      const idUrl = await uploadKYCDocument(idImage, 'user_kyc', `id_${idType || 'document'}.jpg`);
      const selfieUrl = await uploadKYCDocument(selfieImage, 'user_kyc', 'selfie.jpg');
      
      await completeKYC({ idUrl, selfieUrl, idType: idType || 'unknown' });
      setStep(3);
    } catch (error: any) {
      Alert.alert('Upload Failed', error.message || 'Something went wrong.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AppSafeArea style={{ flex: 1, backgroundColor: '#0A192F' }}>
      <View style={{ flex: 1, paddingHorizontal: 25, paddingTop: 20 }}>
        
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 }}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#112240', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1E293B' }}
          >
            <ArrowLeft color="#94A3B8" size={22} />
          </TouchableOpacity>
          <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: 'bold' }}>Verification</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Stepper */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, paddingHorizontal: 10 }}>
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <View 
                style={{ 
                  width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', 
                  borderWidth: 2, 
                  borderColor: step >= s ? '#76b33a' : '#1E293B',
                  backgroundColor: step > s ? '#76b33a' : '#0A192F'
                }}
              >
                {step > s ? (
                  <CheckCircle2 color="#0A192F" size={20} />
                ) : (
                  <Text style={{ fontWeight: 'bold', color: step >= s ? '#76b33a' : '#475569' }}>{s}</Text>
                )}
              </View>
              {s < 3 && (
                <View style={{ height: 2, flex: 1, marginHorizontal: 10, backgroundColor: step > s ? '#76b33a' : '#1E293B' }} />
              )}
            </React.Fragment>
          ))}
        </View>

        <View style={{ flex: 1 }}>
          {step === 1 && (
            <Animated.View entering={FadeIn}>
              <View style={{ height: '100%' }}>
              <Text style={{ color: '#F8FAFC', fontSize: 28, fontWeight: 'bold', marginBottom: 15 }}>Verify Identity</Text>
              <Text style={{ color: '#94A3B8', fontSize: 16, lineHeight: 24, marginBottom: 35 }}>
                Secure your account by verifying your details. This enables full limits and merchant services.
              </Text>

              <View style={{ marginBottom: 40 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#112240', padding: 20, borderRadius: 24, marginBottom: 15, borderWidth: 1, borderColor: '#1E293B' }}>
                  <View style={{ backgroundColor: '#76b33a22', padding: 12, borderRadius: 16, marginRight: 15 }}>
                    <ShieldCheck color="#76b33a" size={24} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#F8FAFC', fontWeight: 'bold', fontSize: 16 }}>Secure Data</Text>
                    <Text style={{ color: '#64748B', fontSize: 12 }}>AES-256 Encrypted Storage</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#112240', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#1E293B' }}>
                  <View style={{ backgroundColor: '#eab30822', padding: 12, borderRadius: 16, marginRight: 15 }}>
                    <Camera color="#eab308" size={24} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#F8FAFC', fontWeight: 'bold', fontSize: 16 }}>Live Verification</Text>
                    <Text style={{ color: '#64748B', fontSize: 12 }}>Biometric Liveness Check</Text>
                  </View>
                </View>
              </View>

              <View style={{ flex: 1, justifyContent: 'flex-end', marginBottom: 20 }}>
                <AppButton 
                  title="Continue" 
                  variant="white" 
                  size="large"
                  onPress={() => setStep(2)}
                  icon={<ChevronRight color="#000" size={20} />}
                />
              </View>
              </View>
            </Animated.View>
          )}

          {step === 2 && (
            <Animated.View entering={FadeIn}>
              <View style={{ height: '100%' }}>
              <Text style={{ color: '#F8FAFC', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>Scan Documents</Text>
              <Text style={{ color: '#94A3B8', textAlign: 'center', marginBottom: 25 }}>Pick your ID type and source</Text>

              <View style={{ marginBottom: 25 }}>
                <AppButton 
                  title={isUploading ? "Uploading..." : "Submit"} 
                  variant="accent" 
                  size="large"
                  onPress={handleSubmit}
                  loading={isUploading}
                  disabled={isUploading}
                  icon={!isUploading && <ShieldCheck color="#FFF" size={20} />}
                />
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* ID Box */}
                <TouchableOpacity 
                  onPress={handleIDTap}
                  style={{ 
                    height: 180, borderRadius: 32, borderWidth: 2, borderStyle: 'dashed', 
                    borderColor: idImage ? '#76b33a' : '#1E293B',
                    backgroundColor: idImage ? '#76b33a05' : '#112240',
                    alignItems: 'center', justifyContent: 'center', marginBottom: 20, overflow: 'hidden'
                  }}
                >
                  {idImage ? (
                    <Image source={{ uri: idImage }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  ) : (
                    <>
                      <FileText color="#475569" size={44} strokeWidth={1} />
                      <Text style={{ color: '#F8FAFC', fontWeight: 'bold', marginTop: 12 }}>
                        {idType === 'gov_id' ? 'Government ID' : (idType === 'license' ? "Driver's License" : (idType === 'passport' ? 'Passport' : 'Upload ID Document'))}
                      </Text>
                      <Text style={{ color: '#64748B', fontSize: 11, marginTop: 4 }}>Tap to start scanning</Text>
                    </>
                  )}
                  {idImage && (
                    <View style={{ position: 'absolute', top: 15, right: 15, backgroundColor: '#76b33a', padding: 4, borderRadius: 12 }}>
                      <CheckCircle2 color="#0A192F" size={16} />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Selfie Box */}
                <TouchableOpacity 
                  onPress={handlePickSelfie}
                  style={{ 
                    height: 180, borderRadius: 32, borderWidth: 2, borderStyle: 'dashed', 
                    borderColor: selfieImage ? '#76b33a' : '#1E293B',
                    backgroundColor: selfieImage ? '#76b33a05' : '#112240',
                    alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                  }}
                >
                  {selfieImage ? (
                    <Image source={{ uri: selfieImage }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  ) : (
                    <>
                      <UserIcon color="#475569" size={44} strokeWidth={1} />
                      <Text style={{ color: '#F8FAFC', fontWeight: 'bold', marginTop: 12 }}>Biometric Selfie</Text>
                      <Text style={{ color: '#64748B', fontSize: 11, marginTop: 4 }}>Take a live clear photo</Text>
                    </>
                  )}
                  {selfieImage && (
                    <View style={{ position: 'absolute', top: 15, right: 15, backgroundColor: '#76b33a', padding: 4, borderRadius: 12 }}>
                      <CheckCircle2 color="#0A192F" size={16} />
                    </View>
                  )}
                </TouchableOpacity>
              </ScrollView>
              </View>
            </Animated.View>
          )}

          {step === 3 && (
            <Animated.View entering={FadeIn}>
              <View style={{ height: '100%', alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ backgroundColor: '#76b33a11', padding: 35, borderRadius: 50, marginBottom: 30 }}>
                <ShieldCheck color="#76b33a" size={70} />
              </View>
              <Text style={{ color: '#F8FAFC', fontSize: 26, fontWeight: 'bold', marginBottom: 15 }}>Under Review</Text>
              <Text style={{ color: '#94A3B8', textAlign: 'center', fontSize: 15, lineHeight: 22, paddingHorizontal: 30, marginBottom: 40 }}>
                Your application has been received. We will notify you once our team completes the verification.
              </Text>
              <AppButton 
                title="Return Home" 
                variant="accent" 
                className="w-full"
                onPress={() => navigation.navigate('Dashboard')}
                icon={<ArrowLeft color="#FFF" size={20} />}
              />
              </View>
            </Animated.View>
          )}
        </View>

      </View>
    </AppSafeArea>
  );
};

export default IdentityVerification;
