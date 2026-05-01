import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, History, User as UserIcon } from 'lucide-react-native';
import HomeStack from './HomeStack';
import HistoryScreen from '../screens/Transactions/History';
import ProfileScreen from '../screens/Profile/Profile';

const Tab = createBottomTabNavigator();

export const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0A192F', // primary color
          borderTopColor: '#1E293B', // surface/slate
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
          elevation: 0,
          shadowOpacity: 0,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#D4AF37', // luxury/gold
        tabBarInactiveTintColor: '#94A3B8', // textSecondary
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen 
        name="HomeStack" 
        component={HomeStack} 
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen} 
        options={{
          tabBarLabel: 'Activity',
          tabBarIcon: ({ color, size }) => <History color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <UserIcon color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};
