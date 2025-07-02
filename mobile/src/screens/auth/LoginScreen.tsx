/**
 * Login Screen for OmnisecAI Mobile
 * Handles user authentication with email/password and biometric options
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { COLORS, TYPOGRAPHY, LAYOUT, VALIDATION, SCREENS } from '@/constants';
import { BaseScreenProps } from '@/types';

interface LoginScreenProps extends BaseScreenProps {}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const { 
    login, 
    isLoading, 
    error, 
    clearError,
    biometricEnabled,
    authenticateWithBiometric 
  } = useAuthStore();

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate screen entrance
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Clear errors when component mounts
    clearError();
  }, []);

  const validateEmail = (email: string): boolean => {
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!VALIDATION.EMAIL_REGEX.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
      setPasswordError(`Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`);
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLogin = async () => {
    clearError();
    
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    try {
      await login(email.toLowerCase().trim(), password);
      console.log('✅ Login successful, navigating to main app');
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      Alert.alert(
        'Login Failed',
        error.message || 'Unable to sign in. Please check your credentials and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const success = await authenticateWithBiometric();
      if (success) {
        console.log('✅ Biometric authentication successful');
        // In a real implementation, this would retrieve stored credentials
        // For now, we'll show a message
        Alert.alert(
          'Biometric Authentication',
          'Biometric authentication successful! This feature will auto-login in a future update.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Biometric authentication failed:', error);
      Alert.alert(
        'Authentication Failed',
        'Biometric authentication failed. Please try again or use your password.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate(SCREENS.FORGOT_PASSWORD);
  };

  const handleSignUp = () => {
    navigation.navigate(SCREENS.REGISTER);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            {/* Header */}
            <View style={styles.header}>
              <Icon
                name="shield-check"
                size={60}
                color="white"
                style={styles.headerIcon}
              />
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Sign in to your OmnisecAI account
              </Text>
            </View>

            {/* Login Form */}
            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <View style={[styles.inputWrapper, emailError ? styles.inputError : null]}>
                  <Icon name="email-outline" size={20} color={COLORS.gray[400]} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email address"
                    placeholderTextColor={COLORS.gray[400]}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (emailError) validateEmail(text);
                    }}
                    onBlur={() => validateEmail(email)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="emailAddress"
                  />
                </View>
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <View style={[styles.inputWrapper, passwordError ? styles.inputError : null]}>
                  <Icon name="lock-outline" size={20} color={COLORS.gray[400]} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={COLORS.gray[400]}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (passwordError) validatePassword(text);
                    }}
                    onBlur={() => validatePassword(password)}
                    secureTextEntry={!showPassword}
                    textContentType="password"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Icon
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={COLORS.gray[400]}
                    />
                  </TouchableOpacity>
                </View>
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
              </View>

              {/* Options */}
              <View style={styles.options}>
                <TouchableOpacity
                  style={styles.rememberMe}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <Icon
                    name={rememberMe ? 'checkbox-marked' : 'checkbox-blank-outline'}
                    size={20}
                    color={rememberMe ? COLORS.primary[600] : COLORS.gray[400]}
                  />
                  <Text style={styles.rememberMeText}>Remember me</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgotPassword}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              {/* Error Message */}
              {error ? (
                <View style={styles.errorContainer}>
                  <Icon name="alert-circle" size={16} color={COLORS.red[500]} />
                  <Text style={styles.errorMessage}>{error}</Text>
                </View>
              ) : null}

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loginButtonText}>Signing in...</Text>
                  </View>
                ) : (
                  <Text style={styles.loginButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              {/* Biometric Login */}
              {biometricEnabled && (
                <TouchableOpacity
                  style={styles.biometricButton}
                  onPress={handleBiometricLogin}
                >
                  <Icon name="fingerprint" size={24} color={COLORS.primary[600]} />
                  <Text style={styles.biometricText}>Use Biometric</Text>
                </TouchableOpacity>
              )}

              {/* Sign Up Link */}
              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Don't have an account? </Text>
                <TouchableOpacity onPress={handleSignUp}>
                  <Text style={styles.signUpLink}>Sign up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary[600],
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: LAYOUT.PADDING.LG,
    paddingVertical: LAYOUT.PADDING.XL,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headerIcon: {
    marginBottom: 16,
  },
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XXL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD as any,
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MD,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.NORMAL as any,
    color: COLORS.primary[100],
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: LAYOUT.BORDER_RADIUS.LG,
    padding: LAYOUT.PADDING.LG,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    marginBottom: LAYOUT.PADDING.MD,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: LAYOUT.BORDER_RADIUS.MD,
    paddingHorizontal: LAYOUT.PADDING.MD,
    height: 48,
    backgroundColor: COLORS.gray[50],
  },
  inputError: {
    borderColor: COLORS.red[500],
    backgroundColor: COLORS.red[50],
  },
  inputIcon: {
    marginRight: LAYOUT.PADDING.SM,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.FONT_SIZES.MD,
    color: COLORS.gray[900],
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.red[500],
    marginTop: 4,
    marginLeft: 4,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LAYOUT.PADDING.MD,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberMeText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.gray[600],
    marginLeft: 8,
  },
  forgotPassword: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.primary[600],
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.red[50],
    borderRadius: LAYOUT.BORDER_RADIUS.SM,
    padding: LAYOUT.PADDING.SM,
    marginBottom: LAYOUT.PADDING.MD,
  },
  errorMessage: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.red[700],
    marginLeft: 8,
    flex: 1,
  },
  loginButton: {
    backgroundColor: COLORS.primary[600],
    borderRadius: LAYOUT.BORDER_RADIUS.MD,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: LAYOUT.PADDING.MD,
  },
  loginButtonDisabled: {
    backgroundColor: COLORS.gray[400],
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MD,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: 'white',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary[600],
    borderRadius: LAYOUT.BORDER_RADIUS.MD,
    height: 48,
    marginBottom: LAYOUT.PADDING.MD,
  },
  biometricText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MD,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.primary[600],
    marginLeft: 8,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.gray[600],
  },
  signUpLink: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SM,
    color: COLORS.primary[600],
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
  },
});