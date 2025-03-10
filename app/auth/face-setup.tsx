// app/auth/face-setup.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Components
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import FaceScanner from '../../components/auth/FaceScanner';

// Auth Context
import { useAuth } from '../context/AuthContext';

// Constants
import { Colors } from '../../constants/Colors';

export default function FaceSetupScreen() {
  const { setupFaceId, user } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [showFaceScanner, setShowFaceScanner] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  
  const handleStartFaceSetup = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowFaceScanner(true);
  };
  
  const handleFaceDetected = async (faceData: any) => {
    setIsProcessing(true);
    setShowFaceScanner(false);
    
    try {
      const success = await setupFaceId(faceData);
      
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setSetupComplete(true);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      console.error('Face setup error:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleFaceScannerCancel = () => {
    setShowFaceScanner(false);
  };
  
  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/(tabs)');
  };
  
  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/(tabs)');
  };
  
  if (showFaceScanner) {
    return <FaceScanner onFaceDetected={handleFaceDetected} onCancel={handleFaceScannerCancel} />;
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Face ID Setup',
          headerBackVisible: false,
        }} 
      />
      
      <View style={[styles.content, { paddingBottom: insets.bottom }]}>
        {setupComplete ? (
          <View style={styles.successContainer}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={80} color={Colors.light.success} />
            </View>
            
            <ThemedText type="title" style={styles.successTitle}>
              Face ID Set Up Successfully
            </ThemedText>
            
            <ThemedText lightColor="secondary" style={styles.successText}>
              You can now use Face ID for quick and secure login to MalariaDetect.
            </ThemedText>
            
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
            >
              <ThemedText style={styles.continueButtonText}>Continue to Dashboard</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.headerContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="scan-outline" size={40} color={Colors.light.primary} />
              </View>
              
              <ThemedText type="title" style={styles.title}>
                Set Up Face ID
              </ThemedText>
              
              <ThemedText lightColor="secondary" style={styles.description}>
                Use Face ID for quick and secure access to the app. This is optional but highly recommended for healthcare professionals.
              </ThemedText>
            </View>
            
            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="time-outline" size={24} color={Colors.light.primary} />
                </View>
                <View style={styles.infoTextContainer}>
                  <ThemedText type="defaultSemiBold" style={styles.infoTitle}>
                    Save Time
                  </ThemedText>
                  <ThemedText lightColor="secondary" style={styles.infoText}>
                    Skip password entry for faster access
                  </ThemedText>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="lock-closed-outline" size={24} color={Colors.light.primary} />
                </View>
                <View style={styles.infoTextContainer}>
                  <ThemedText type="defaultSemiBold" style={styles.infoTitle}>
                    Enhanced Security
                  </ThemedText>
                  <ThemedText lightColor="secondary" style={styles.infoText}>
                    Biometric security protects sensitive data
                  </ThemedText>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="people-outline" size={24} color={Colors.light.primary} />
                </View>
                <View style={styles.infoTextContainer}>
                  <ThemedText type="defaultSemiBold" style={styles.infoTitle}>
                    User Verification
                  </ThemedText>
                  <ThemedText lightColor="secondary" style={styles.infoText}>
                    Ensures the right person is accessing patient data
                  </ThemedText>
                </View>
              </View>
            </View>
            
            <View style={styles.buttonContainer}>
              {isProcessing ? (
                <View style={styles.processingContainer}>
                  <ActivityIndicator size="large" color={Colors.light.primary} />
                  <ThemedText style={styles.processingText}>Setting up Face ID...</ThemedText>
                </View>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.setupButton}
                    onPress={handleStartFaceSetup}
                  >
                    <Ionicons name="scan" size={22} color="#fff" style={styles.setupButtonIcon} />
                    <ThemedText style={styles.setupButtonText}>Set Up Face ID</ThemedText>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.skipButton}
                    onPress={handleSkip}
                  >
                    <ThemedText style={styles.skipButtonText}>Skip for Now</ThemedText>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    textAlign: 'center',
    marginBottom: 30,
  },
  infoContainer: {
    flex: 1,
    marginVertical: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  infoIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    marginBottom: 4,
  },
  infoText: {
    
  },
  buttonContainer: {
    marginTop: 20,
  },
  setupButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  setupButtonIcon: {
    marginRight: 8,
  },
  setupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    color: Colors.light.secondary,
    fontSize: 16,
  },
  processingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  processingText: {
    marginTop: 16,
    color: Colors.light.secondary,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  successText: {
    textAlign: 'center',
    marginBottom: 30,
  },
  continueButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    height: 56,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});