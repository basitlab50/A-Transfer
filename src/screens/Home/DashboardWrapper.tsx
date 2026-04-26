import React from 'react';
import { useWalletStore } from '../../store/useWalletStore';
import Dashboard from './Dashboard';
import MerchantDashboard from '../Merchant/Dashboard';
import AdminDashboard from '../Admin/AdminDashboard';
import { DashboardNavigationProp } from '../../types/navigation';

interface Props {
  navigation: DashboardNavigationProp;
}

/**
 * A wrapper component that switches between the Personal Dashboard,
 * the Merchant Hub, and the Super Admin Panel based on the current mode.
 * 
 * Using this wrapper keeps the navigation stack stable during mode switches.
 */
const DashboardWrapper = ({ navigation }: Props) => {
  const isMerchantMode = useWalletStore((state) => state.isMerchantMode);
  const isAdminMode = useWalletStore((state) => state.isAdminMode);

  if (isAdminMode) {
    return <AdminDashboard navigation={navigation} />;
  }

  if (isMerchantMode) {
    return <MerchantDashboard navigation={navigation} />;
  }

  return <Dashboard navigation={navigation} />;
};

export default DashboardWrapper;
