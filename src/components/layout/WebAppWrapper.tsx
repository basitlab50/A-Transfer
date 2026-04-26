import React from 'react';
import { View, Platform, useWindowDimensions } from 'react-native';

interface WebAppWrapperProps {
  children: React.ReactNode;
}

/**
 * A responsive wrapper that provides a "Mobile Frame" (iPhone Shell) 
 * when the app is viewed on a desktop browser.
 */
export const WebAppWrapper: React.FC<WebAppWrapperProps> = ({ children }) => {
  const { width } = useWindowDimensions();
  
  // Only apply the frame on Web and only if the screen is wide enough (Laptop/Desktop)
  const showFrame = Platform.OS === 'web' && width > 600;

  if (!showFrame) {
    return <View style={{ flex: 1 }}>{children}</View>;
  }

  return (
    <View className="device-container">
      <View className="device-shell">
        <View className="device-notch" />
        <View className="device-screen">
          {children}
        </View>
      </View>
    </View>
  );
};
