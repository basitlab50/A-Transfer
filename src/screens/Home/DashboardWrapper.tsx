import React from 'react';
import { useWalletStore } from '../../store/useWalletStore';
import Dashboard from './Dashboard';
import MerchantDashboard from '../Merchant/Dashboard';
import { DashboardNavigationProp } from '../../types/navigation';

interface Props {
  navigation: DashboardNavigationProp;
}

/**
 * A wrapper component that switches between the Personal Dashboard and 
 * the Merchant Hub based on the current mode in the wallet store.
 * 
 * Using this wrapper keeps the navigation stack stable during mode switches.
 */
const DashboardWrapper = ({ navigation }: Props) => {
  const isMerchantMode = useWalletStore((state) => state.isMerchantMode);

  if (isMerchantMode) {
    return <MerchantDashboard navigation={navigation} />;
  }

  return <Dashboard navigation={navigation} />;
};

export default DashboardWrapper;
