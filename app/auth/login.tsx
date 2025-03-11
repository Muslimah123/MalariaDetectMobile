// app/auth/login.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  Dimensions
} from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

// Components
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';

// Auth Context
import { useAuth } from '../context/AuthContext';

// Constants
import { Colors } from '../../constants/Colors';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const { login, loginWithFace, isLoading } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isFaceLoginEnabled, setIsFaceLoginEnabled] = useState(false);
  const [isLoggingInWithFace, setIsLoggingInWithFace] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Animation values
  const logoAnimation = useRef(new Animated.Value(0)).current;
  const formAnimation = useRef(new Animated.Value(0)).current;
  const faceLoginAnimation = useRef(new Animated.Value(0)).current;
  const formElementsAnimation = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(50)).current;
  
  // Background animation
  const gradientPosition = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );
    
    // Check if face login is available (this would normally check the device capabilities)
    setIsFaceLoginEnabled(true);
    
    // Start entrance animations
    Animated.sequence([
      Animated.timing(logoAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(formAnimation, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(formElementsAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(faceLoginAnimation, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Animate input fields up from the bottom
    Animated.timing(slideUp, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    // Animate moving gradient
    Animated.loop(
      Animated.timing(gradientPosition, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: false,
      })
    ).start();
    
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };
  
  const validatePassword = (password: string) => {
    if (!password.trim()) {
      setPasswordError('Password is required');
      return false;
    } else {
      setPasswordError('');
      return true;
    }
  };
  
  const handleLogin = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const success = await login(email, password);
    
    if (success) {
      router.replace('/(tabs)');
    }
  };
  
  const handleFaceLogin = async () => {
    setIsLoggingInWithFace(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // This would normally use FaceScanner component to get face data
      const faceData = { detected: true }; // Placeholder
      
      // Navigate to the face scanner
      router.push('/auth/face-login');
    } catch (error) {
      console.error('Face login error:', error);
      setIsLoggingInWithFace(false);
    }
  };
  
  const navigateToRegister = () => {
    router.push('/auth/register');
  };
  
  // Background gradient position interpolation
  const gradientTranslate = gradientPosition.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '25%']
  });

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: false 
        }} 
      />
      
      {/* Animated background */}
      <Animated.View style={[
        styles.gradientBackground,
        {
          transform: [{ translateY: gradientTranslate }]
        }
      ]}>
        <LinearGradient
          colors={['#1a3a8f', '#1e40af', '#3b82f6', '#60a5fa']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fullGradient}
        />
      </Animated.View>
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={10}
      >
        <Animated.View style={[
          styles.logoContainer,
          {
            opacity: logoAnimation,
            transform: [
              { translateY: logoAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0]
              })}
            ]
          }
        ]}>
          <View style={styles.logoInner}>
            <MaterialCommunityIcons name="microscope" size={60} color="#fff" />
            <ThemedText type="title" style={styles.logoText}>
              MalariaDetect
            </ThemedText>
          </View>
          <ThemedText style={styles.tagline}>
            Automated Diagnosis System
          </ThemedText>
        </Animated.View>
        
        <Animated.View style={[
          styles.formContainer,
          {
            opacity: formAnimation,
            transform: [
              { translateY: formAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0]
              })}
            ]
          }
        ]}>
          <BlurView intensity={35} tint="light" style={styles.formCard}>
            <ThemedText type="title" style={styles.formTitle}>
              Login
            </ThemedText>
            
            <Animated.View style={{
              opacity: formElementsAnimation,
              transform: [{ translateY: slideUp }]
            }}>
              <View style={styles.inputGroup}>
                <View style={[
                  styles.inputContainer,
                  emailError ? styles.inputError : {}
                ]}>
                  <Ionicons name="mail-outline" size={20} color={Colors.light.secondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Email Address"
                    placeholderTextColor={Colors.light.placeholder}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (emailError) validateEmail(text);
                    }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                  {email.length > 0 && (
                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={() => setEmail('')}
                    >
                      <Ionicons name="close-circle" size={20} color={Colors.light.secondary} />
                    </TouchableOpacity>
                  )}
                </View>
                {emailError ? (
                  <ThemedText style={styles.errorText}>{emailError}</ThemedText>
                ) : null}
              </View>
              
              <View style={styles.inputGroup}>
                <View style={[
                  styles.inputContainer,
                  passwordError ? styles.inputError : {}
                ]}>
                  <Ionicons name="lock-closed-outline" size={20} color={Colors.light.secondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Password"
                    placeholderTextColor={Colors.light.placeholder}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (passwordError) validatePassword(text);
                    }}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color={Colors.light.secondary} 
                    />
                  </TouchableOpacity>
                </View>
                {passwordError ? (
                  <ThemedText style={styles.errorText}>{passwordError}</ThemedText>
                ) : null}
              </View>
              
              <TouchableOpacity style={styles.forgotPassword}>
                <ThemedText type="default" lightColor={Colors.light.primary} style={styles.forgotPasswordText}>
                  Forgot Password?
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.loginButton, 
                  (!email || !password) && styles.loginButtonDisabled
                ]}
                onPress={handleLogin}
                disabled={isLoading || !email || !password}
              >
                {isLoading && !isLoggingInWithFace ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <ThemedText style={styles.loginButtonText}>Login</ThemedText>
                    <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 4 }} />
                  </>
                )}
              </TouchableOpacity>
              
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <ThemedText style={styles.dividerText}>OR</ThemedText>
                <View style={styles.dividerLine} />
              </View>
              
              {isFaceLoginEnabled && (
                <Animated.View
                  style={{
                    opacity: faceLoginAnimation,
                    transform: [
                      { translateY: faceLoginAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0]
                      })}
                    ]
                  }}
                >
                  <Stack.Screen 
  options={{ 
    headerShown: true,
    headerTransparent: true,
    headerTitle: '',
    headerLeft: () => (
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace('/')}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
    )
  }} 
/>
                  <TouchableOpacity
                    style={styles.faceLoginButton}
                    onPress={handleFaceLogin}
                    disabled={isLoading}
                  >
                    {isLoggingInWithFace ? (
                      <ActivityIndicator size="small" color={Colors.light.primary} />
                    ) : (
                      <>
                        <Ionicons name="scan-outline" size={20} color={Colors.light.primary} style={styles.faceLoginIcon} />
                        <ThemedText type="default" lightColor={Colors.light.primary} style={styles.faceLoginText}>
                          Log in with Face ID
                        </ThemedText>
                      </>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              )}
            </Animated.View>
          </BlurView>
          
          <View style={styles.signupContainer}>
            <ThemedText style={styles.signupText}>
              Don't have an account?
            </ThemedText>
            <TouchableOpacity onPress={navigateToRegister}>
              <ThemedText type="default" lightColor={Colors.light.primary} style={styles.signupLink}>
                Register
              </ThemedText>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -height * 0.3,
    height: height * 1.5,
  },
  fullGradient: {
    width: '100%',
    height: '100%',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  // Add this style to the StyleSheet
backButton: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  justifyContent: 'center',
  alignItems: 'center',
  marginLeft: 10,
},
  logoInner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 28,
  },
  tagline: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  formCard: {
    borderRadius: 20,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  formTitle: {
    marginBottom: 24,
    fontSize: 24,
    color: '#fff',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
  },
  inputError: {
    borderColor: Colors.light.error,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: 50,
    color: '#fff',
    fontSize: 16,
  },
  passwordToggle: {
    padding: 10,
  },
  clearButton: {
    padding: 10,
  },
  errorText: {
    color: Colors.light.error,
    marginTop: 4,
    marginLeft: 4,
    fontSize: 12,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  loginButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: Colors.light.primaryDark,
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  faceLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  faceLoginIcon: {
    marginRight: 8,
  },
  faceLoginText: {
    fontWeight: '500',
    color: '#fff',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    paddingBottom: 20,
  },
  signupText: {
    marginRight: 4,
    color: '#fff',
  },
  signupLink: {
    fontWeight: '600',
    color: '#fff',
  },
});