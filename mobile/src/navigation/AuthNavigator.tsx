/**
 * Authentication Navigator for OmnisecAI Mobile
 * Handles auth-related screens (login, register, etc.)
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SCREENS, COLORS } from '@/constants';

// Screen imports
import LoginScreen from '@/screens/auth/LoginScreen';
import RegisterScreen from '@/screens/auth/RegisterScreen';
import ForgotPasswordScreen from '@/screens/auth/ForgotPasswordScreen';
import MFASetupScreen from '@/screens/auth/MFASetupScreen';
import BiometricSetupScreen from '@/screens/auth/BiometricSetupScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={SCREENS.LOGIN}
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: COLORS.primary[600],
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name={SCREENS.LOGIN} 
        component={LoginScreen}
        options={{
          title: 'Sign In',
        }}
      />
      
      <Stack.Screen 
        name={SCREENS.REGISTER} 
        component={RegisterScreen}
        options={{
          title: 'Create Account',
        }}
      />
      
      <Stack.Screen 
        name={SCREENS.FORGOT_PASSWORD} 
        component={ForgotPasswordScreen}
        options={{
          title: 'Reset Password',
        }}
      />
      
      <Stack.Screen 
        name={SCREENS.MFA_SETUP} 
        component={MFASetupScreen}
        options={{
          title: 'Setup Two-Factor Authentication',
        }}
      />
      
      <Stack.Screen 
        name={SCREENS.BIOMETRIC_SETUP} 
        component={BiometricSetupScreen}
        options={{
          title: 'Setup Biometric Authentication',
        }}
      />
    </Stack.Navigator>
  );
}