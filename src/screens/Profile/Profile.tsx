import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native';
import { User as UserIcon, Settings, Bell, Shield, CreditCard, LogOut, ChevronRight, Globe, ShieldCheck, Copy } from 'lucide-react-native';
import { useWalletStore } from '../../store/useWalletStore';
import * as Clipboard from 'expo-clipboard';
import { useNavigation } from '@react-navigation/native';
import { AppCard } from '../../components/ui/AppCard';
import { AppAlert } from '../../components/ui/AppAlert';

const ProfileItem = ({ icon, label, sublabel, onPress }: { icon: React.ReactNode, label: string, sublabel?: string, onPress?: () => void }) => (
  <TouchableOpacity className="flex-row items-center p-4 mb-2" onPress={onPress}>
    <View className="w-10 h-10 rounded-xl bg-primary items-center justify-center mr-4 border border-slate-800">
      {icon}
    </View>
    <View className="flex-1">
      <Text className="text-textPrimary font-semibold">{label}</Text>
      {sublabel && <Text className="text-textSecondary text-xs">{sublabel}</Text>}
    </View>
    <ChevronRight color="#475569" size={20} />
  </TouchableOpacity>
);

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { userCountry, availableCountries, isKYCVerified, kycStatus, signOut, userProfile } = useWalletStore();
  const [logoutVisible, setLogoutVisible] = useState(false);
  
  const handleLogout = () => {
    setLogoutVisible(true);
  };
  
  const currentCountry = availableCountries.find(c => c.name === userCountry);

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <AppAlert 
        visible={logoutVisible}
        type="warning"
        title="Log Out"
        message="Are you sure you want to log out of your A-Transfer account?"
        confirmText="Yes, Log Out"
        cancelText="Stay Logged In"
        onConfirm={() => {
          setLogoutVisible(false);
          signOut();
        }}
        onCancel={() => setLogoutVisible(false)}
      />
      <StatusBar barStyle="light-content" />
      <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
        
        {/* Profile Header */}
        <View className="items-center mt-4 mb-8">
          <View className="w-24 h-24 rounded-full bg-surface border-2 border-luxury p-1 items-center justify-center mb-4">
            <View className="w-full h-full rounded-full bg-primary items-center justify-center">
              <UserIcon color="#D4AF37" size={48} />
            </View>
          </View>
          <View className="flex-row items-center">
            <Text className="text-textPrimary text-2xl font-bold">{userProfile?.name || 'User'}</Text>
            {isKYCVerified && (
              <View className="ml-2 bg-accent/20 p-1 rounded-full">
                <ShieldCheck color="#76b33a" size={14} />
              </View>
            )}
          </View>
          <View className="flex-row items-center justify-center mt-1">
            <Text className="text-textSecondary text-sm mr-2">AID: {userProfile?.aid || '...'}</Text>
            <TouchableOpacity onPress={async () => {
              await Clipboard.setStringAsync(userProfile?.aid || '');
              Alert.alert('Copied!', 'Your A-Transfer Account ID has been copied.');
            }}>
              <Copy color="#94A3B8" size={14} />
            </TouchableOpacity>
          </View>
          {userProfile?.phone && <Text className="text-textSecondary text-xs mt-1">{userProfile.phone}</Text>}
        </View>

        {/* Account Sections */}
        <Text className="text-textSecondary text-xs font-bold uppercase tracking-widest mb-4 ml-2">Account Settings</Text>
        <AppCard className="p-0 mb-6 border-slate-800">
          <ProfileItem 
            icon={<Globe color="#76b33a" size={20} />} 
            label="Country & Regional" 
            sublabel={`${userCountry} (${currentCountry?.flag || ''})`} 
            onPress={() => navigation.navigate('SelectCountry' as any, { mode: 'profile' })}
          />
          <ProfileItem 
            icon={<Shield color={isKYCVerified ? "#76b33a" : (kycStatus === 'rejected' ? "#EF4444" : "#94A3B8")} size={20} />} 
            label="Identity Verification" 
            sublabel={
              isKYCVerified ? "Verified Account" : 
              (kycStatus === 'pending' ? "Verification in Progress" : 
              (kycStatus === 'rejected' ? "Verification Failed - Re-upload" : "Action Required"))
            } 
            onPress={() => {
              if (kycStatus === 'pending') {
                Alert.alert("Verification in Progress", "Your documents are currently being reviewed. We will notify you once the process is complete.");
                return;
              }
              if (isKYCVerified) {
                Alert.alert("Account Verified", "Your identity has already been successfully verified.");
                return;
              }
              navigation.navigate('IdentityVerification' as any);
            }}
          />
          <View className="h-[1px] bg-slate-800 mx-4" />
          <ProfileItem icon={<Settings color="#94A3B8" size={20} />} label="Personal Information" sublabel="Update name, email, and phone" />
          <View className="h-[1px] bg-slate-800 mx-4" />
          <ProfileItem icon={<Bell color="#94A3B8" size={20} />} label="Notifications" sublabel="Stay updated with your transfers" />
          <View className="h-[1px] bg-slate-800 mx-4" />
          <ProfileItem icon={<Shield color="#94A3B8" size={20} />} label="Security & Privacy" sublabel="2FA, Biometrics, and Password" />
        </AppCard>

        <Text className="text-textSecondary text-xs font-bold uppercase tracking-widest mb-4 ml-2">Payments</Text>
        <AppCard className="p-0 mb-8 border-slate-800">
          <ProfileItem 
            icon={<CreditCard color="#94A3B8" size={20} />} 
            label="Payout Details" 
            sublabel="Manage your Bank & Momo details" 
            onPress={() => navigation.navigate('HomeStack' as any, { screen: 'MerchantPaymentSettings' })}
          />
        </AppCard>

        <TouchableOpacity 
          onPress={handleLogout}
          className="flex-row items-center justify-center py-4 rounded-2xl bg-red-500/10 border border-red-500/20 mb-10"
        >
          <LogOut color="#EF4444" size={20} />
          <Text className="text-red-500 font-bold ml-2">Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
