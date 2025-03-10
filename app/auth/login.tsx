// app/auth/login.tsx
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Components
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';

// Auth Context
import { useAuth } from '../context/AuthContext';

// Constants
import { Colors } from '../../constants/Colors';

export default function LoginScreen() {
  const { login, loginWithFace, isLoading } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isFaceLoginEnabled, setIsFaceLoginEnabled] = useState(false);
  const [isLoggingInWithFace, setIsLoggingInWithFace] = useState(false);
  
  // Animation values
  const logoAnimation = new Animated.Value(0);
  const formAnimation = new Animated.Value(0);
  const faceLoginAnimation = new Animated.Value(0);
  
  useEffect(() => {
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
      Animated.timing(faceLoginAnimation, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  const handleLogin = async () => {
    if (!email || !password) {
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
      
      const success = await loginWithFace(faceData);
      if (success) {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Face login error:', error);
    } finally {
      setIsLoggingInWithFace(false);
    }
  };
  
  const navigateToRegister = () => {
    router.push('/auth/register' as any);
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: false 
        }} 
      />
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={10}
      >
        <LinearGradient
          colors={[Colors.light.primary, Colors.light.primaryDark]}
          style={[styles.headerGradient, { paddingTop: insets.top }]}
        >
          <Animated.View 
            style={[
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
            ]}
          >
            <MaterialCommunityIcons name="microscope" size={60} color="#fff" />
            <ThemedText type="title" style={styles.logoText}>
              MalariaDetect
            </ThemedText>
            <ThemedText style={styles.tagline}>
              Automated Diagnosis System
            </ThemedText>
          </Animated.View>
        </LinearGradient>
        
        <View style={styles.formContainer}>
          <Animated.View 
            style={[
              styles.formCard,
              {
                opacity: formAnimation,
                transform: [
                  { translateY: formAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0]
                  })}
                ]
              }
            ]}
          >
            <ThemedText type="title" style={styles.formTitle}>
              Login
            </ThemedText>
            
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={Colors.light.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Email Address"
                placeholderTextColor={Colors.light.placeholder}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.light.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Password"
                placeholderTextColor={Colors.light.placeholder}
                value={password}
                onChangeText={setPassword}
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
            
            <TouchableOpacity style={styles.forgotPassword}>
              <ThemedText type="default" lightColor={Colors.light.primary} style={styles.forgotPasswordText}>
                Forgot Password?
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.loginButton, (!email || !password) && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading || !email || !password}
            >
              {isLoading && !isLoggingInWithFace ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <ThemedText style={styles.loginButtonText}>Login</ThemedText>
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
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  headerGradient: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 28,
  },
  tagline: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  formTitle: {
    marginBottom: 24,
    fontSize: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: 50,
    color: Colors.light.text,
    fontSize: 16,
  },
  passwordToggle: {
    padding: 10,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    height: 50,
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
    backgroundColor: Colors.light.border,
  },
  dividerText: {
    paddingHorizontal: 16,
    color: Colors.light.secondary,
  },
  faceLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
  },
  faceLoginIcon: {
    marginRight: 8,
  },
  faceLoginText: {
    fontWeight: '500',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    paddingBottom: 20,
  },
  signupText: {
    marginRight: 4,
  },
  signupLink: {
    fontWeight: '600',
  },
});