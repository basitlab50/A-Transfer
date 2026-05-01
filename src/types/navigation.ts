import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Dashboard: undefined;
  MerchantDashboard: undefined;
  AMerchants: { country: string };
  SelectCountry: { mode?: 'withdraw' | 'transfer' | 'profile' | 'settings' };
  WithdrawOptions: undefined;
  InternalTransfer: undefined;
  QuickTransferAmount: { country: string };
  IdentityVerification: undefined;
  MerchantRestock: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string };
  RequestFunds: undefined;
  MerchantOnboarding: undefined;
  AdminDashboard: undefined;
  AdminDetailList: { type: 'users' | 'merchants' | 'circulation' };
  AdminUserDetails: { userId: string };
  AdminMerchantRequests: { country?: string };
  AdminUserRequests: { country?: string };
  DepositAmount: { merchant: any };
  WithdrawAmount: { merchant: any };
  MerchantPaymentSettings: undefined;
  MerchantOngoingTransactions: undefined;
  TransactionStatus: { transactionId?: string };
  TransactionChat: { transactionId: string; otherPartyName: string; otherPartyId: string };
  Receipt: { transaction: any };
  Notifications: undefined;
};

export type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

export type AMerchantsScreenRouteProp = RouteProp<RootStackParamList, 'AMerchants'>;
export type AMerchantsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AMerchants'>;

export type SelectCountryNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SelectCountry'>;
export type WelcomeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;
export type LoginNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;
export type RegisterNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;
export type RequestFundsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RequestFunds'>;

export type WithdrawOptionsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WithdrawOptions'>;
export type InternalTransferNavigationProp = NativeStackNavigationProp<RootStackParamList, 'InternalTransfer'>;
