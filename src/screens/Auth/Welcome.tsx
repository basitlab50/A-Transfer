import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { ShieldCheck, Globe, Zap, ArrowRight, User as UserIcon } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { WelcomeNavigationProp } from '../../types/navigation';
import { AppButton } from '../../components/ui/AppButton';

const { height } = Dimensions.get('window');

interface Props {
  navigation: WelcomeNavigationProp;
}

const Welcome = ({ navigation }: Props) => {
  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-1 px-8 justify-between pb-12">
        
        {/* Top: Branding & Hero */}
        <View className="items-center mt-20">
          <Animated.View 
            entering={FadeInUp.duration(1000).springify()}
            className="w-20 h-20 bg-accent/10 rounded-[32px] items-center justify-center mb-10 border border-accent/20"
          >
            <ShieldCheck color="#76b33a" size={48} />
          </Animated.View>
          
          <Animated.Text 
            entering={FadeInUp.delay(200).duration(1000)}
            className="text-textPrimary text-5xl font-bold tracking-tighter text-center"
          >
            A-Transfer
          </Animated.Text>
          <Animated.Text 
            entering={FadeInUp.delay(400).duration(1000)}
            className="text-textSecondary text-lg text-center mt-4 px-6 leading-6"
          >
            The future of decentralized escrow payments across Africa.
          </Animated.Text>
        </View>

        {/* Middle: Key Features */}
        <View className="space-y-8 mt-10">
          <Animated.View entering={FadeInDown.delay(600)} className="flex-row items-center">
            <View className="bg-surface p-4 rounded-2xl mr-5 border border-slate-800">
              <Globe color="#76b33a" size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-textPrimary font-bold text-lg">Borderless</Text>
              <Text className="text-textSecondary text-xs leading-5">Transfer credits across countries without bank delays.</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(800)} className="flex-row items-center">
            <View className="bg-surface p-4 rounded-2xl mr-5 border border-slate-800">
              <Zap color="#df7c27" size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-textPrimary font-bold text-lg">Escrow Protection</Text>
              <Text className="text-textSecondary text-xs leading-5">Funds are released only when both parties are satisfied.</Text>
            </View>
          </Animated.View>
        </View>

        {/* Bottom: Actions */}
        <View className="space-y-4">
          <Animated.View entering={FadeInDown.delay(1000)}>
            <AppButton 
              title="Sign In to Account" 
              variant="accent" 
              size="large"
              onPress={() => navigation.navigate('Login')}
              icon={<ArrowRight color="#76b33a" size={20} />}
            />
          </Animated.View>
          
          <Animated.View entering={FadeInDown.delay(1200)}>
            <AppButton 
              title="Create New Account" 
              variant="outline" 
              size="large"
              onPress={() => navigation.navigate('Register')}
              icon={<UserIcon color="#94A3B8" size={20} />}
              className="mt-2 border-slate-700"
            />
          </Animated.View>
        </View>

      </View>
    </SafeAreaView>
  );
};

export default Welcome;
