/**
 * Main App Navigator for OmnisecAI Mobile
 * Handles routing between authenticated and unauthenticated flows
 */
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, Platform } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { SCREENS, COLORS } from '@/constants';
import { RootStackParamList } from '@/types';

// Screen imports
import SplashScreen from '@/screens/SplashScreen';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const [isInitializing, setIsInitializing] = React.useState(true);

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Show splash screen during initialization
  if (isInitializing) {
    return (
      <NavigationContainer>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.primary[600]}
          translucent={Platform.OS === 'android'}
        />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name={SCREENS.SPLASH} component={SplashScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar
        barStyle={isAuthenticated ? "dark-content" : "light-content"}
        backgroundColor={isAuthenticated ? COLORS.gray[50] : COLORS.primary[600]}
        translucent={Platform.OS === 'android'}
      />
      
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {isAuthenticated && user ? (
          <Stack.Screen 
            name={SCREENS.MAIN} 
            component={MainNavigator}
            options={{
              animationTypeForReplace: 'push',
            }}
          />
        ) : (
          <Stack.Screen 
            name={SCREENS.AUTH} 
            component={AuthNavigator}
            options={{
              animationTypeForReplace: 'pop',
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}