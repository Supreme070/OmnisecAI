/**
 * Main Navigator for OmnisecAI Mobile
 * Handles main app navigation with bottom tabs
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SCREENS, COLORS, LAYOUT } from '@/constants';
import { MainTabParamList } from '@/types';

// Screen imports
import DashboardScreen from '@/screens/main/DashboardScreen';
import ThreatNavigator from './ThreatNavigator';
import ModelNavigator from './ModelNavigator';
import ScanNavigator from './ScanNavigator';
import NotificationsScreen from '@/screens/main/NotificationsScreen';
import ProfileScreen from '@/screens/main/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator();

// Tab Bar Icons
const getTabBarIcon = (routeName: string, focused: boolean, size: number) => {
  let iconName: string;
  const color = focused ? COLORS.primary[600] : COLORS.gray[400];

  switch (routeName) {
    case SCREENS.DASHBOARD:
      iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
      break;
    case SCREENS.THREATS:
      iconName = focused ? 'shield-alert' : 'shield-alert-outline';
      break;
    case SCREENS.MODELS:
      iconName = focused ? 'brain' : 'brain';
      break;
    case SCREENS.SCANS:
      iconName = focused ? 'radar' : 'radar';
      break;
    case SCREENS.NOTIFICATIONS:
      iconName = focused ? 'bell' : 'bell-outline';
      break;
    case SCREENS.PROFILE:
      iconName = focused ? 'account' : 'account-outline';
      break;
    default:
      iconName = 'help-circle-outline';
  }

  return <Icon name={iconName} size={size} color={color} />;
};

function MainTabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName={SCREENS.DASHBOARD}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, size }) => 
          getTabBarIcon(route.name, focused, size),
        tabBarActiveTintColor: COLORS.primary[600],
        tabBarInactiveTintColor: COLORS.gray[400],
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarStyle: [
          styles.tabBar,
          {
            paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
            height: LAYOUT.TAB_BAR_HEIGHT + (Platform.OS === 'ios' ? insets.bottom : 0),
          }
        ],
        headerShown: false,
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen 
        name={SCREENS.DASHBOARD} 
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarBadge: undefined, // Can be updated based on data
        }}
      />
      
      <Tab.Screen 
        name={SCREENS.THREATS} 
        component={ThreatNavigator}
        options={{
          title: 'Threats',
          tabBarBadge: undefined, // Can show active threat count
        }}
      />
      
      <Tab.Screen 
        name={SCREENS.MODELS} 
        component={ModelNavigator}
        options={{
          title: 'Models',
        }}
      />
      
      <Tab.Screen 
        name={SCREENS.SCANS} 
        component={ScanNavigator}
        options={{
          title: 'Scans',
          tabBarBadge: undefined, // Can show running scan count
        }}
      />
      
      <Tab.Screen 
        name={SCREENS.NOTIFICATIONS} 
        component={NotificationsScreen}
        options={{
          title: 'Alerts',
          tabBarBadge: undefined, // Will show unread count
        }}
      />
      
      <Tab.Screen 
        name={SCREENS.PROFILE} 
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabNavigator} 
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    paddingTop: 8,
    paddingHorizontal: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
});