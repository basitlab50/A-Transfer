import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Welcome from '../screens/Auth/Welcome';
import Login from '../screens/Auth/Login';
import Register from '../screens/Auth/Register';
import ForgotPassword from '../screens/Auth/ForgotPassword';
import ResetPassword from '../screens/Auth/ResetPassword';
import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AuthStack = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
    </Stack.Navigator>
  );
};
