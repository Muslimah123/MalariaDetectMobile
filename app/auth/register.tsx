// app/auth/register.tsx
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Components
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';

// Auth Context
import { useAuth, UserRole } from '../context/AuthContext';

// Constants
import { Colors } from '../../constants/Colors';

export default function RegisterScreen() {
  const { register, isLoading } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('lab_technician');
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  
  // Form validation
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  // Animation values
  const formAnimation = new Animated.Value(0);
  
  useEffect(() => {
    // Start entrance animations
    Animated.timing(formAnimation, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const validateForm = () => {
    let isValid = true;
    
    // Validate name
    if (!name.trim()) {
      setNameError('Name is required');
      isValid = false;
    } else {
      setNameError('');
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
    }
    
    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    // Validate confirm password
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }
    
    return isValid;
  };
  
  const handleRegister = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const success = await register(name, email, password, role);
    
    if (success) {
      // Navigate to face setup or dashboard
      router.replace('/(auth)/face-setup' as any);
    }
  };
  
  const navigateToLogin = () => {
    router.back();
  };
  
  const renderRoleSelector = () => {
    if (!showRoleSelector) return null;
    
    return (
      <View style={styles.roleSelectorContainer}>
        <TouchableOpacity 
          style={[styles.roleOption, role === 'lab_technician' && styles.selectedRoleOption]}
          onPress={() => {
            setRole('lab_technician');
            setShowRoleSelector(false);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <MaterialCommunityIcons 
            name="test-tube" 
            size={20} 
            color={role === 'lab_technician' ? Colors.light.primary : Colors.light.secondary} 
          />
          <ThemedText 
            style={[
              styles.roleOptionText, 
              role === 'lab_technician' && { color: Colors.light.primary }
            ]}
          >
            Lab Technician
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.roleOption, role === 'doctor' && styles.selectedRoleOption]}
          onPress={() => {
            setRole('doctor');
            setShowRoleSelector(false);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <Ionicons 
            name="medical" 
            size={20} 
            color={role === 'doctor' ? Colors.light.primary : Colors.light.secondary} 
          />
          <ThemedText 
            style={[
              styles.roleOptionText, 
              role === 'doctor' && { color: Colors.light.primary }
            ]}
          >
            Doctor
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.roleOption, role === 'admin' && styles.selectedRoleOption]}
          onPress={() => {
            setRole('admin');
            setShowRoleSelector(false);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <Ionicons 
            name="settings-sharp" 
            size={20} 
            color={role === 'admin' ? Colors.light.primary : Colors.light.secondary} 
          />
          <ThemedText 
            style={[
              styles.roleOptionText, 
              role === 'admin' && { color: Colors.light.primary }
            ]}
          >
            Administrator
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Create Account',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: Colors.light.primary,
          },
          headerTintColor: '#fff',
        }} 
      />
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 30}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 20 }
          ]}
          showsVerticalScrollIndicator={false}
        >
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
              Create Your Account
            </ThemedText>
            
            <ThemedText lightColor="secondary" style={styles.formSubtitle}>
              Please fill in the details below to register
            </ThemedText>
            
            {/* Name Field */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Full Name</ThemedText>
              <View style={[styles.inputContainer, nameError ? styles.inputError : {}]}>
                <Ionicons name="person-outline" size={20} color={Colors.light.secondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your full name"
                  placeholderTextColor={Colors.light.placeholder}
                  value={name}
                  onChangeText={setName}
                />
              </View>
              {nameError ? (
                <ThemedText style={styles.errorText}>{nameError}</ThemedText>
              ) : null}
            </View>
            
            {/* Email Field */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Email Address</ThemedText>
              <View style={[styles.inputContainer, emailError ? styles.inputError : {}]}>
                <Ionicons name="mail-outline" size={20} color={Colors.light.secondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.light.placeholder}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              {emailError ? (
                <ThemedText style={styles.errorText}>{emailError}</ThemedText>
              ) : null}
            </View>
            
            {/* Role Selector */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Role</ThemedText>
              <TouchableOpacity
                style={styles.roleSelector}
                onPress={() => {
                  setShowRoleSelector(!showRoleSelector);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <View style={styles.roleSelectorContent}>
                  <MaterialCommunityIcons 
                    name={
                      role === 'lab_technician' ? "test-tube" : 
                      role === 'doctor' ? "medical-bag" : 
                      "shield-account"
                    } 
                    size={20} 
                    color={Colors.light.primary} 
                    style={styles.inputIcon} 
                  />
                  <ThemedText type="default">
                    {role === 'lab_technician' ? "Lab Technician" : 
                     role === 'doctor' ? "Doctor" : 
                     "Administrator"}
                  </ThemedText>
                </View>
                <Ionicons name={showRoleSelector ? "chevron-up" : "chevron-down"} size={20} color={Colors.light.secondary} />
              </TouchableOpacity>
              
              {renderRoleSelector()}
            </View>
            
            {/* Password Field */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Password</ThemedText>
              <View style={[styles.inputContainer, passwordError ? styles.inputError : {}]}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.light.secondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Create password"
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
              {passwordError ? (
                <ThemedText style={styles.errorText}>{passwordError}</ThemedText>
              ) : null}
            </View>
            
            {/* Confirm Password Field */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Confirm Password</ThemedText>
              <View style={[styles.inputContainer, confirmPasswordError ? styles.inputError : {}]}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.light.secondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Confirm password"
                  placeholderTextColor={Colors.light.placeholder}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
              </View>
              {confirmPasswordError ? (
                <ThemedText style={styles.errorText}>{confirmPasswordError}</ThemedText>
              ) : null}
            </View>
            
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <ThemedText style={styles.registerButtonText}>Register</ThemedText>
              )}
            </TouchableOpacity>
          </Animated.View>
          
          <View style={styles.loginContainer}>
            <ThemedText style={styles.loginText}>
              Already have an account?
            </ThemedText>
            <TouchableOpacity onPress={navigateToLogin}>
              <ThemedText type="default" lightColor={Colors.light.primary} style={styles.loginLink}>
                Login
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.primary,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  scrollContent: {
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
    marginBottom: 8,
    fontSize: 24,
  },
  formSubtitle: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
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
    color: Colors.light.text,
    fontSize: 16,
  },
  passwordToggle: {
    padding: 10,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  roleSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  roleSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleSelectorContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  selectedRoleOption: {
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
  },
  roleOptionText: {
    marginLeft: 10,
  },
  registerButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    paddingBottom: 20,
  },
  loginText: {
    marginRight: 4,
  },
  loginLink: {
    fontWeight: '600',
  },
});