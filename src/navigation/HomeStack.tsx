import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardWrapper from '../screens/Home/DashboardWrapper';
import SelectCountry from '../screens/Home/SelectCountry';
import AMerchants from '../screens/Home/AMerchants';
import WithdrawOptions from '../screens/Home/WithdrawOptions';
import InternalTransfer from '../screens/Home/InternalTransfer';
import QuickTransferAmount from '../screens/Home/QuickTransferAmount';
import IdentityVerification from '../screens/Profile/IdentityVerification';
import MerchantRestock from '../screens/Merchant/Restock';
import MerchantOnboarding from '../screens/Merchant/MerchantOnboarding';
import AdminDashboard from '../screens/Admin/AdminDashboard';
import AdminDetailList from '../screens/Admin/AdminDetailList';
import AdminUserDetails from '../screens/Admin/AdminUserDetails';
import AdminMerchantRequests from '../screens/Admin/AdminMerchantRequests';
import RequestFunds from '../screens/Home/RequestFunds';
import DepositAmount from '../screens/Home/DepositAmount';
import WithdrawAmount from '../screens/Home/WithdrawAmount';
import MerchantPaymentSettings from '../screens/Merchant/PaymentSettings';
import MerchantOngoingTransactions from '../screens/Merchant/OngoingTransactions';
import TransactionStatus from '../screens/Home/TransactionStatus';
import Notifications from '../screens/Home/Notifications';
import Receipt from '../screens/Transactions/Receipt';
import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0A192F',
        },
        headerTintColor: '#F8FAFC',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="Dashboard" 
        component={DashboardWrapper} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="WithdrawOptions" 
        component={WithdrawOptions} 
        options={{ title: 'Withdraw Options' }}
      />
      <Stack.Screen 
        name="InternalTransfer" 
        component={InternalTransfer} 
        options={{ title: 'Send to AT Account' }}
      />
      <Stack.Screen 
        name="SelectCountry" 
        component={SelectCountry} 
        options={{ title: 'Select Withdraw Country' }}
      />
      <Stack.Screen 
        name="AMerchants" 
        component={AMerchants} 
        options={({ route }: any) => ({ title: `Merchants in ${route.params?.country || 'Region'}` })}
      />
      <Stack.Screen 
        name="QuickTransferAmount" 
        component={QuickTransferAmount} 
        options={{ title: 'Transfer Amount' }}
      />
      <Stack.Screen 
        name="IdentityVerification" 
        component={IdentityVerification} 
        options={{ title: 'Identity Verification' }}
      />
      <Stack.Screen 
        name="MerchantRestock" 
        component={MerchantRestock} 
        options={{ title: 'Inventory Restock' }}
      />
      <Stack.Screen 
        name="MerchantOnboarding" 
        component={MerchantOnboarding} 
        options={{ title: 'Merchant Onboarding', headerShown: false }}
      />
      <Stack.Screen 
        name="AdminDashboard" 
        component={AdminDashboard} 
        options={{ title: 'Super Panel', headerShown: false }}
      />
      <Stack.Screen 
        name="AdminDetailList" 
        component={AdminDetailList} 
        options={{ title: 'Platform Data', headerShown: false }}
      />
      <Stack.Screen 
        name="AdminUserDetails" 
        component={AdminUserDetails} 
        options={{ title: 'User Profile', headerShown: false }}
      />
      <Stack.Screen 
        name="AdminMerchantRequests" 
        component={AdminMerchantRequests} 
        options={{ title: 'Merchant Applications', headerShown: false }}
      />
      <Stack.Screen 
        name="RequestFunds" 
        component={RequestFunds} 
        options={{ title: 'Request Credits' }}
      />
      <Stack.Screen 
        name="DepositAmount" 
        component={DepositAmount} 
        options={{ title: 'Buy A-Credits' }}
      />
      <Stack.Screen 
        name="WithdrawAmount" 
        component={WithdrawAmount} 
        options={{ title: 'Sell A-Credits' }}
      />
      <Stack.Screen 
        name="MerchantPaymentSettings" 
        component={MerchantPaymentSettings} 
        options={{ title: 'Payment Details' }}
      />
      <Stack.Screen 
        name="MerchantOngoingTransactions" 
        component={MerchantOngoingTransactions} 
        options={{ title: 'Ongoing Transactions' }}
      />
      <Stack.Screen 
        name="TransactionStatus" 
        component={TransactionStatus} 
        options={{ title: 'Transaction Progress' }}
      />
      <Stack.Screen 
        name="Receipt" 
        component={Receipt} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={Notifications} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;
