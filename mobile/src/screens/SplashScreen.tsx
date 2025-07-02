/**
 * Splash Screen for OmnisecAI Mobile
 * Shown during app initialization
 */
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, TYPOGRAPHY, ANIMATIONS } from '@/constants';
import { initializeAuthStore } from '@/store/authStore';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Initialize app
    initializeApp();

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIMATIONS.SLOW,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize stores and services
      await initializeAuthStore();
      
      // Add any other initialization logic here
      console.log('📱 App initialization complete');
    } catch (error) {
      console.error('❌ App initialization failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primary[600]}
        translucent={false}
      />
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Icon
            name="shield-check"
            size={80}
            color="white"
            style={styles.logoIcon}
          />
          <Text style={styles.logoText}>OmnisecAI</Text>
          <Text style={styles.tagline}>AI Cybersecurity Platform</Text>
        </View>

        {/* Loading indicator */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBar}>
            <Animated.View 
              style={[
                styles.loadingProgress,
                {
                  opacity: fadeAnim,
                }
              ]} 
            />
          </View>
          <Text style={styles.loadingText}>Initializing security systems...</Text>
        </View>
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Securing AI Infrastructure
        </Text>
        <Text style={styles.versionText}>
          Version 1.0.0
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  logoIcon: {
    marginBottom: 16,
  },
  logoText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XXXL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MD,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.NORMAL as any,
    color: COLORS.primary[100],
    textAlign: 'center',
    opacity: 0.9,
  },
  loadingContainer: {
    width: '100%',
    alignItems: 'center',
  },
  loadingBar: {
    width: 200,
    height: 4,
    backgroundColor: COLORS.primary[400],
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  loadingProgress: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.primary[100],
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.primary[200],
    textAlign: 'center',
    marginBottom: 4,
  },
  versionText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.NORMAL as any,
    color: COLORS.primary[300],
    textAlign: 'center',
  },
});