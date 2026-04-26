import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { ShieldCheck, User, Camera, FileText, ChevronRight, CheckCircle2, ShieldAlert } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing,
  interpolate,
  FadeIn
} from 'react-native-reanimated';
import { useWalletStore } from '../../store/useWalletStore';
import { AppButton } from '../../components/ui/AppButton';

const { width } = Dimensions.get('window');

const IdentityVerification = ({ navigation }: any) => {
  const [step, setStep] = useState(1); // 1: Info, 2: Scan, 3: Success
  const [isScanning, setIsScanning] = useState(false);
  const completeKYC = useWalletStore(state => state.completeKYC);

  // Animation values
  const scanLinePos = useSharedValue(0);
  const scanScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    if (isScanning) {
      scanLinePos.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      scanScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1
      );
      glowOpacity.value = withRepeat(
        withTiming(0.8, { duration: 1500 }),
        -1,
        true
      );

      // Simulate scan completion
      const timer = setTimeout(() => {
        setIsScanning(false);
        setStep(3);
        completeKYC();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isScanning]);

  const scanLineStyle = useAnimatedStyle(() => ({
    top: `${scanLinePos.value * 100}%`,
  }));

  const scanCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scanScale.value }],
    borderColor: isScanning ? '#76b33a' : '#1e293b',
    borderWidth: isScanning ? 4 : 2,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="px-6 flex-1 pt-10">
        
        {/* Stepper Header */}
        <View className="flex-row items-center justify-between mb-12 px-4">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <View 
                className={`w-10 h-10 rounded-full items-center justify-center border-2 ${
                  step >= s ? 'border-accent bg-accent/10' : 'border-slate-800 bg-surface'
                }`}
              >
                {step > s ? (
                  <CheckCircle2 color="#76b33a" size={20} />
                ) : (
                  <Text className={`font-bold ${step >= s ? 'text-accent' : 'text-textSecondary'}`}>
                    {s}
                  </Text>
                )}
              </View>
              {s < 3 && (
                <View className={`h-0.5 flex-1 mx-2 ${step > s ? 'bg-accent' : 'bg-slate-800'}`} />
              )}
            </React.Fragment>
          ))}
        </View>

        {step === 1 && (
          <Animated.View entering={FadeIn} className="flex-1">
            <Text className="text-textPrimary text-3xl font-bold mb-4">Identity Check</Text>
            <Text className="text-textSecondary text-base mb-10 leading-6">
              To comply with regional financial regulations and protect your escrow transfers, we need to verify your identity using SmileID biometric services.
            </Text>

            <View className="space-y-6">
              <View className="flex-row items-start bg-surface/50 p-5 rounded-3xl border border-card-border/30">
                <View className="bg-accent/10 p-3 rounded-xl mr-4">
                  <FileText color="#76b33a" size={20} />
                </View>
                <View className="flex-1">
                  <Text className="text-textPrimary font-bold mb-1">Government ID</Text>
                  <Text className="text-textSecondary text-xs">Passport, National ID, or Driver's License</Text>
                </View>
              </View>

              <View className="flex-row items-start bg-surface/50 p-5 rounded-3xl border border-card-border/30">
                <View className="bg-orange/10 p-3 rounded-xl mr-4">
                  <Camera color="#df7c27" size={20} />
                </View>
                <View className="flex-1">
                  <Text className="text-textPrimary font-bold mb-1">Biometric Selfie</Text>
                  <Text className="text-textSecondary text-xs">Verify your face matches your document</Text>
                </View>
              </View>

              <View className="flex-row items-start bg-blue-500/10 p-5 rounded-3xl border border-blue-500/20">
                <View className="bg-blue-500/10 p-3 rounded-xl mr-4">
                  <ShieldCheck color="#3b82f6" size={20} />
                </View>
                <View className="flex-1">
                  <Text className="text-textPrimary font-bold mb-1">Encrypted Data</Text>
                  <Text className="text-textSecondary text-xs">Your data is encrypted and never stored on our servers.</Text>
                </View>
              </View>
            </View>

            <View className="flex-1 justify-end pb-10">
              <AppButton 
                title="Start Verification" 
                variant="accent" 
                size="large"
                onPress={() => setStep(2)}
                icon={<ChevronRight color="#76b33a" size={20} />}
              />
            </View>
          </Animated.View>
        )}

        {step === 2 && (
          <Animated.View entering={FadeIn} className="flex-1 items-center">
            <Text className="text-textPrimary text-2xl font-bold mb-2">Biometric Scan</Text>
            <Text className="text-textSecondary text-center mb-12">
              {isScanning ? 'Verifying facial features...' : 'Position your face within the frame'}
            </Text>

            <View className="relative items-center justify-center">
              <Animated.View 
                style={[scanCircleStyle]}
                className="w-72 h-72 rounded-full overflow-hidden bg-surface border-slate-800 items-center justify-center"
              >
                {!isScanning ? (
                  <User color="#1e293b" size={160} strokeWidth={1} />
                ) : (
                  <View className="w-full h-full bg-accent/5 items-center justify-center">
                    <Animated.View 
                      style={[glowStyle]}
                      className="absolute inset-0 bg-accent/10" 
                    />
                    <Animated.View 
                      style={[scanLineStyle]}
                      className="absolute left-0 right-0 h-1 bg-accent shadow-[0_0_15px_#76b33a]" 
                    />
                    <User color="#76b33a" size={160} strokeWidth={1.5} opacity={0.6} />
                  </View>
                )}
              </Animated.View>
              
              {/* Decorative Scanning Brackets */}
              <View className="absolute -inset-4 border-2 border-accent/20 rounded-[60px]" />
            </View>

            <View className="flex-1 justify-end pb-10 w-full">
              {!isScanning ? (
                <AppButton 
                  title="Capture & Verify" 
                  variant="accent" 
                  size="large"
                  onPress={() => setIsScanning(true)}
                />
              ) : (
                <View className="items-center">
                  <Text className="text-accent font-bold animate-pulse">PROCESSING DATA...</Text>
                </View>
              )}
            </View>
          </Animated.View>
        )}

        {step === 3 && (
          <Animated.View entering={FadeIn} className="flex-1 items-center justify-center">
            <View className="bg-accent/10 p-10 rounded-[60px] mb-8">
              <ShieldCheck color="#76b33a" size={80} />
            </View>
            <Text className="text-textPrimary text-3xl font-bold mb-4 text-center">Verified Success!</Text>
            <Text className="text-textSecondary text-base text-center mb-12 leading-6 px-6">
              Identity confirmed. Your account is now fully active with premium escrow protection and merchant privileges enabled.
            </Text>

            <AppButton 
              title="Return to Profile" 
              variant="accent" 
              className="w-full py-5"
              onPress={() => navigation.navigate('Profile')}
            />
          </Animated.View>
        )}

      </View>
    </SafeAreaView>
  );
};

export default IdentityVerification;
