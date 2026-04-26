import React, { useEffect } from 'react';
import { useWalletStore } from '../store/useWalletStore';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';

export const RootNavigator = () => {
  const isAuthenticated = useWalletStore(state => state.isAuthenticated);
  const initializeAuth = useWalletStore(state => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, []);

  return isAuthenticated ? <MainTabs /> : <AuthStack />;
};
