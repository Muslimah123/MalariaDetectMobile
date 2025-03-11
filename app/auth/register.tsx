// app/auth/register.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Animated,
  Dimensions
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

// Components
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';

// Auth Context
import { useAuth, UserRole } from '../context/AuthContext';

// Constants
import { Colors } from '../../constants/Colors';

const { width, height } = Dimensions.get('window');

interface FormField {
  value: string;
  error: string;
  touched: boolean;
}

export default function RegisterScreen() {
  const { register, isLoading } = useAuth();
  const insets = useSafeAreaInsets();
  
  // Form state
  const [form, setForm] = useState({
    name: { value: '', error: '', touched: false },
    email: { value: '', error: '', touched: false },
    password: { value: '', error: '', touched: false },
    confirmPassword: { value: '', error: '', touched: false },
  });
  const [role, setRole] = useState<UserRole>('lab_technician');
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  // Animation values
  const formAnimation = useRef(new Animated.Value(0)).current;
  const formElements = useRef(Array(4).fill(0).map(() => new Animated.Value(0))).current;
  const gradientPosition = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Start entrance animations
    Animated.timing(formAnimation, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    
    // Animate form elements sequentially
    formElements.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: 200 + (index * 100),
        useNativeDriver: true,
      }).start();
    });
    
    // Animate moving gradient
    Animated.loop(
      Animated.timing(gradientPosition, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: false,
      })
    ).start();
  }, []);
  
  // Calculate password strength
  useEffect(() => {
    const password = form.password.value;
    let strength = 0;
    
    if (password.length > 0) {
      // Add strength for length
      if (password.length >= 8) strength += 25;
      else if (password.length >= 6) strength += 15;
      else strength += 5;
      
      // Add strength for character types
      if (/[A-Z]/.test(password)) strength += 25; // Uppercase
      if (/[0-9]/.test(password)) strength += 25; // Numbers
      if (/[^A-Za-z0-9]/.test(password)) strength += 25; // Special chars
    }
    
    setPasswordStrength(strength);
  }, [form.password.value]);
  
  // Update form field
  const handleFieldChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        value,
        error: '',
        touched: true
      }
    }));
    
    // Validate on change if the field has been touched
    if (form[field].touched) {
      validateField(field, value);
    }
  };
  
  // Validate individual field
  const validateField = (field: keyof typeof form, value: string = form[field].value): boolean => {
    let error = '';
    let isValid = true;
    
    switch (field) {
      case 'name':
        if (!value.trim()) {
          error = 'Name is required';
          isValid = false;
        } else if (value.trim().length < 3) {
          error = 'Name must be at least 3 characters';
          isValid = false;
        }
        break;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          error = 'Email is required';
          isValid = false;
        } else if (!emailRegex.test(value)) {
          error = 'Please enter a valid email address';
          isValid = false;
        }
        break;
        
      case 'password':
        if (!value) {
          error = 'Password is required';
          isValid = false;
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters';
          isValid = false;
        }
        
        // Also validate confirm password if it has been touched
        if (form.confirmPassword.touched) {
          validateField('confirmPassword');
        }
        break;
        
      case 'confirmPassword':
        if (value !== form.password.value) {
          error = 'Passwords do not match';
          isValid = false;
        }
        break;
    }
    
    setForm(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        error
      }
    }));
    
    return isValid;
  };
  
  // Validate entire form
  const validateForm = (): boolean => {
    const fields = Object.keys(form) as Array<keyof typeof form>;
    let isValid = true;
    
    fields.forEach(field => {
      const fieldValid = validateField(field);
      if (!fieldValid) isValid = false;
    });
    
    return isValid;
  };
  
  // Handle form submission
  const handleRegister = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const success = await register(
      form.name.value,
      form.email.value,
      form.password.value,
      role
    );
    
    if (success) {
      // Navigate to face setup or dashboard
      router.replace('/auth/face-setup');
    }
  };
  
  // Navigate back to login
  const navigateToLogin = () => {
    router.back();
  };
  
  // Get color based on password strength
  const getPasswordStrengthColor = () => {
    if (passwordStrength >= 75) return Colors.light.success;
    if (passwordStrength >= 50) return Colors.light.info;
    if (passwordStrength >= 25) return Colors.light.warning;
    return Colors.light.error;
  };
  
  // Get label for password strength
  const getPasswordStrengthLabel = () => {
    if (passwordStrength >= 75) return 'Strong';
    if (passwordStrength >= 50) return 'Good';
    if (passwordStrength >= 25) return 'Weak';
    return 'Very Weak';
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
          title: 'Create Account',
          headerBackTitle: 'Login',
          headerTransparent: true,
          headerTintColor: '#fff',
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
          <View style={styles.headerContainer}>
            <ThemedText type="title" style={styles.headerTitle}>
              Create Account
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Join MalariaDetect to access all features
            </ThemedText>
          </View>
          
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
            <BlurView intensity={35} tint="light" style={styles.formCardBlur}>
              {/* Name Field */}
              <Animated.View style={[
                styles.formGroup,
                {
                  opacity: formElements[0],
                  transform: [
                    { translateX: formElements[0].interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0]
                    })}
                  ]
                }
              ]}>
                <ThemedText style={styles.formLabel}>Full Name</ThemedText>
                <View style={[
                  styles.inputContainer,
                  form.name.error ? styles.inputError : {}
                ]}>
                  <Ionicons name="person-outline" size={20} color={'#fff'} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your full name"
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                    value={form.name.value}
                    onChangeText={(text) => handleFieldChange('name', text)}
                    onBlur={() => validateField('name')}
                  />
                </View>
                {form.name.error ? (
                  <ThemedText style={styles.errorText}>{form.name.error}</ThemedText>
                ) : null}
              </Animated.View>
              
              {/* Email Field */}
              <Animated.View style={[
                styles.formGroup,
                {
                  opacity: formElements[1],
                  transform: [
                    { translateX: formElements[1].interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0]
                    })}
                  ]
                }
              ]}>
                <ThemedText style={styles.formLabel}>Email Address</ThemedText>
                <View style={[
                  styles.inputContainer,
                  form.email.error ? styles.inputError : {}
                ]}>
                  <Ionicons name="mail-outline" size={20} color={'#fff'} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                    value={form.email.value}
                    onChangeText={(text) => handleFieldChange('email', text)}
                    onBlur={() => validateField('email')}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
                {form.email.error ? (
                  <ThemedText style={styles.errorText}>{form.email.error}</ThemedText>
                ) : null}
              </Animated.View>
              
              {/* Role Selector */}
              <Animated.View style={[
                styles.formGroup,
                {
                  opacity: formElements[2],
                  transform: [
                    { translateX: formElements[2].interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0]
                    })}
                  ]
                }
              ]}>
                <ThemedText style={styles.formLabel}>Role</ThemedText>
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
                      color={'#fff'} 
                      style={styles.inputIcon} 
                    />
                    <ThemedText style={styles.roleSelectorText}>
                      {role === 'lab_technician' ? "Lab Technician" : 
                       role === 'doctor' ? "Doctor" : 
                       "Administrator"}
                    </ThemedText>
                  </View>
                  <Ionicons 
                    name={showRoleSelector ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={'#fff'} 
                  />
                </TouchableOpacity>
                
                {showRoleSelector && (
                  <View style={styles.optionsContainer}>
                    <TouchableOpacity
                      style={[
                        styles.optionItem,
                        role === 'lab_technician' && styles.selectedOption
                      ]}
                      onPress={() => {
                        setRole('lab_technician');
                        setShowRoleSelector(false);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                    >
                      <MaterialCommunityIcons name="test-tube" size={20} color={'#fff'} style={styles.optionIcon} />
                      <ThemedText style={styles.optionText}>Lab Technician</ThemedText>
                      {role === 'lab_technician' && (
                        <Ionicons name="checkmark" size={20} color={'#fff'} />
                      )}
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.optionItem,
                        role === 'doctor' && styles.selectedOption
                      ]}
                      onPress={() => {
                        setRole('doctor');
                        setShowRoleSelector(false);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                    >
                      <Ionicons name="medical" size={20} color={'#fff'} style={styles.optionIcon} />
                      <ThemedText style={styles.optionText}>Doctor</ThemedText>
                      {role === 'doctor' && (
                        <Ionicons name="checkmark" size={20} color={'#fff'} />
                      )}
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.optionItem,
                        role === 'admin' && styles.selectedOption
                      ]}
                      onPress={() => {
                        setRole('admin');
                        setShowRoleSelector(false);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                    >
                      <Ionicons name="settings-sharp" size={20} color={'#fff'} style={styles.optionIcon} />
                      <ThemedText style={styles.optionText}>Administrator</ThemedText>
                      {role === 'admin' && (
                        <Ionicons name="checkmark" size={20} color={'#fff'} />
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </Animated.View>
              
              {/* Password Field */}
              <Animated.View style={[
                styles.formGroup,
                {
                  opacity: formElements[3],
                  transform: [
                    { translateX: formElements[3].interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0]
                    })}
                  ]
                }
              ]}>
                <ThemedText style={styles.formLabel}>Password</ThemedText>
                <View style={[
                  styles.inputContainer,
                  form.password.error ? styles.inputError : {}
                ]}>
                  <Ionicons name="lock-closed-outline" size={20} color={'#fff'} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Create password"
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                    value={form.password.value}
                    onChangeText={(text) => handleFieldChange('password', text)}
                    onBlur={() => validateField('password')}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color={'#fff'} 
                    />
                  </TouchableOpacity>
                </View>
                
                {form.password.value.length > 0 && (
                  <View style={styles.passwordStrengthContainer}>
                    <View style={styles.strengthBarContainer}>
                      <View 
                        style={[
                          styles.strengthBar,
                          { 
                            width: `${passwordStrength}%`,
                            backgroundColor: getPasswordStrengthColor()
                          }
                        ]}
                      />
                    </View>
                    <ThemedText style={[
                      styles.strengthText,
                      { color: getPasswordStrengthColor() }
                    ]}>
                      {getPasswordStrengthLabel()}
                    </ThemedText>
                  </View>
                )}
                
                {form.password.error ? (
                  <ThemedText style={styles.errorText}>{form.password.error}</ThemedText>
                ) : null}
              </Animated.View>
              
              {/* Confirm Password Field */}
              <Animated.View style={[
                styles.formGroup,
                {
                  opacity: formElements[3],
                  transform: [
                    { translateX: formElements[3].interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0]
                    })}
                  ]
                }
              ]}>
                <ThemedText style={styles.formLabel}>Confirm Password</ThemedText>
                <View style={[
                  styles.inputContainer,
                  form.confirmPassword.error ? styles.inputError : {}
                ]}>
                  <Ionicons name="lock-closed-outline" size={20} color={'#fff'} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Confirm password"
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                    value={form.confirmPassword.value}
                    onChangeText={(text) => handleFieldChange('confirmPassword', text)}
                    onBlur={() => validateField('confirmPassword')}
                    secureTextEntry={!showPassword}
                  />
                </View>
                {form.confirmPassword.error ? (
                  <ThemedText style={styles.errorText}>{form.confirmPassword.error}</ThemedText>
                ) : null}
              </Animated.View>
              
              <TouchableOpacity
                style={styles.registerButton}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <ThemedText style={styles.registerButtonText}>Register</ThemedText>
                    <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 4 }} />
                  </>
                )}
              </TouchableOpacity>
            </BlurView>
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 100,
  },
  headerContainer: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  formCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  formCardBlur: {
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
  errorText: {
    color: Colors.light.error,
    marginTop: 4,
    marginLeft: 4,
    fontSize: 12,
  },
  roleSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  roleSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleSelectorText: {
    color: '#fff',
  },
  optionsContainer: {
    backgroundColor: 'rgba(30, 64, 175, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedOption: {
    backgroundColor: 'rgba(37, 99, 235, 0.5)',
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    flex: 1,
    color: '#fff',
  },
  passwordStrengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  strengthBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginRight: 8,
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    height: 50,
    flexDirection: 'row',
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
    color: '#fff',
  },
  loginLink: {
    fontWeight: '600',
    color: '#fff',
  },
});