// app/auth/face-login.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

// Components
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';

// Auth Context
import { useAuth } from '../context/AuthContext';

// Constants
import { Colors } from '../../constants/Colors';

const { width, height } = Dimensions.get('window');

export default function FaceLoginScreen() {
  const { loginWithFace } = useAuth();
  
  const [isScanning, setIsScanning] = useState(true);
  const [faceDetected, setFaceDetected] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Animation values
  const scanAnimation = useRef(new Animated.Value(0)).current;
  const faceBorderAnimation = useRef(new Animated.Value(0)).current;
  const successAnimation = useRef(new Animated.Value(0)).current;
  const errorAnimation = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Start scanning animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false
        }),
        Animated.timing(scanAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false
        })
      ])
    ).start();
    
    // Start face border animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(faceBorderAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(faceBorderAnimation, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        })
      ])
    ).start();
    
    // Simulate face detection after a delay
    const detectionTimer = setTimeout(() => {
      handleFaceDetected();
    }, 3000);
    
    return () => {
      clearTimeout(detectionTimer);
    };
  }, []);
  
  const handleFaceDetected = () => {
    setFaceDetected(true);
    setIsScanning(false);
    
    // Provide haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Animate success
    Animated.timing(successAnimation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true
    }).start();
    
    // Simulate authentication
    simulateAuthentication();
  };
  
  const simulateAuthentication = () => {
    // Simulate authentication delay
    setTimeout(async () => {
      // Generate random success/failure (80% success rate for demo)
      const isSuccessful = Math.random() > 0.2;
      
      if (isSuccessful) {
        setScanComplete(true);
        
        // Give a brief pause before navigating
        setTimeout(() => {
          // Call the loginWithFace method
          loginWithFace({ detected: true });
          
          // Navigate to main app
          router.replace('/(tabs)');
        }, 1000);
      } else {
        // Show error
        setErrorMessage('Authentication failed. Please try again or use email login.');
        
        // Animate error message
        Animated.timing(errorAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }).start();
        
        // Haptic error feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }, 1500);
  };
  
  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: false 
        }} 
      />
      
      <LinearGradient
        colors={['#1a3a8f', '#1e40af', '#3b82f6']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleCancel}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          
          <ThemedText style={styles.headerTitle}>
            Face Recognition
          </ThemedText>
          
          <View style={{ width: 40 }} />
        </View>
        
        <View style={styles.faceContainer}>
          {/* Face overlay with scanning effect */}
          <View style={styles.faceOutline}>
            <Animated.View 
              style={[
                styles.scanLine,
                {
                  top: scanAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 250]
                  }),
                  opacity: isScanning ? 0.7 : 0
                }
              ]}
            />
            
            {/* Face detection border */}
            <Animated.View 
              style={[
                styles.faceBorder,
                {
                  borderColor: faceDetected 
                    ? Colors.light.success 
                    : faceBorderAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.8)']
                      }),
                  borderWidth: faceDetected ? 3 : 2,
                }
              ]}
              
            >
              {/* Corner accents */}
              <View style={[styles.cornerAccent, styles.topLeft]} />
              <View style={[styles.cornerAccent, styles.topRight]} />
              <View style={[styles.cornerAccent, styles.bottomLeft]} />
              <View style={[styles.cornerAccent, styles.bottomRight]} />
            </Animated.View>
          </View>
        </View>
        
        <View style={styles.statusContainer}>
          {isScanning ? (
            <ThemedText style={styles.statusText}>
              Position your face within the frame
            </ThemedText>
          ) : faceDetected && !errorMessage ? (
            <Animated.View 
              style={[
                styles.successContainer,
                { opacity: successAnimation }
              ]}
            >
              <Ionicons name="checkmark-circle" size={40} color={Colors.light.success} />
              <ThemedText style={styles.successText}>
                Face Recognized
              </ThemedText>
              <ThemedText style={styles.verifyingText}>
                {scanComplete ? 'Authentication successful!' : 'Verifying identity...'}
              </ThemedText>
            </Animated.View>
          ) : (
            <Animated.View 
              style={[
                styles.errorContainer,
                { opacity: errorAnimation }
              ]}
            >
              <Ionicons name="alert-circle" size={40} color={Colors.light.error} />
              <ThemedText style={styles.errorText}>
                {errorMessage}
              </ThemedText>
              
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  setErrorMessage('');
                  setIsScanning(true);
                  setFaceDetected(false);
                  
                  // Restart scanning after a short delay
                  setTimeout(() => {
                    handleFaceDetected();
                  }, 2000);
                }}
              >
                <ThemedText style={styles.retryButtonText}>
                  Try Again
                </ThemedText>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
        
        <View style={styles.instructionsContainer}>
          <ThemedText style={styles.instructionsTitle}>
            For best results:
          </ThemedText>
          
          <View style={styles.instructionItem}>
            <Ionicons name="sunny-outline" size={20} color="rgba(255, 255, 255, 0.8)" style={styles.instructionIcon} />
            <ThemedText style={styles.instructionText}>
              Ensure good lighting on your face
            </ThemedText>
          </View>
          
          <View style={styles.instructionItem}>
            <Ionicons name="eye-outline" size={20} color="rgba(255, 255, 255, 0.8)" style={styles.instructionIcon} />
            <ThemedText style={styles.instructionText}>
              Look directly at the camera
            </ThemedText>
          </View>
          
          <View style={styles.instructionItem}>
            <Ionicons name="glasses-outline" size={20} color="rgba(255, 255, 255, 0.8)" style={styles.instructionIcon} />
            <ThemedText style={styles.instructionText}>
              Remove glasses or obstructions
            </ThemedText>
          </View>
        </View>
      </LinearGradient>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e40af',
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  faceContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  faceOutline: {
    width: 250,
    height: 300,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  faceBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 2,
  },
  cornerAccent: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: Colors.light.success,
    borderWidth: 3,
  },
  topLeft: {
    top: -3,
    left: -3,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 10,
  },
  topRight: {
    top: -3,
    right: -3,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 10,
  },
  bottomLeft: {
    bottom: -3,
    left: -3,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 10,
  },
  bottomRight: {
    bottom: -3,
    right: -3,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 10,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.light.primary,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  statusContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  successContainer: {
    alignItems: 'center',
  },
  successText: {
    color: Colors.light.success,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
  },
  verifyingText: {
    color: '#fff',
    marginTop: 8,
  },
  errorContainer: {
    alignItems: 'center',
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  instructionsContainer: {
    paddingHorizontal: 30,
  },
  instructionsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  instructionIcon: {
    marginRight: 10,
  },
  instructionText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
});