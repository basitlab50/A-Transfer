import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { NativeWindStyleSheet } from "nativewind";
import { Platform, StyleSheet } from "react-native";
import * as Notifications from 'expo-notifications';
import { usePushNotifications } from './src/hooks/usePushNotifications';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

// Polyfill for NativeWind v2 on newer react-native-web versions
if (typeof StyleSheet.setStyleAttributePreprocessor !== "function") {
  StyleSheet.setStyleAttributePreprocessor = () => {};
}

NativeWindStyleSheet.setOutput({
  default: "native",
});

export default function App() {
  usePushNotifications();

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
