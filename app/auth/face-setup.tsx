// // app/auth/face-setup.tsx
// import React, { useState, useEffect, useRef } from 'react';
// import {
//   StyleSheet,
//   View,
//   TouchableOpacity,
//   ActivityIndicator,
//   Animated,
//   Dimensions
// } from 'react-native';
// import { Stack, router } from 'expo-router';
// import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// import * as Haptics from 'expo-haptics';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { LinearGradient } from 'expo-linear-gradient';
// import { BlurView } from 'expo-blur';

// // Components
// import { ThemedView } from '../../components/ThemedView';
// import { ThemedText } from '../../components/ThemedText';

// // Auth Context
// import { useAuth } from '../context/AuthContext';

// // Constants
// import { Colors } from '../../constants/Colors';

// const { width, height } = Dimensions.get('window');

// export default function FaceSetupScreen() {
//   const { setupFaceId, user } = useAuth();
//   const insets = useSafeAreaInsets();
  
//   const [showFaceScanner, setShowFaceScanner] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [setupComplete, setSetupComplete] = useState(false);
//   const [setupStage, setSetupStage] = useState(0);
  
//   // Animation values
//   const cardAnimation = useRef(new Animated.Value(0)).current;
//   const contentAnimation = useRef(new Animated.Value(0)).current;
//   const successAnimation = useRef(new Animated.Value(0)).current;
//   const indicatorAnimation = useRef(new Animated.Value(0)).current;
//   const stageAnimations = Array(4).fill(0).map(() => useRef(new Animated.Value(0)).current);
  
//   useEffect(() => {
//     // Start entrance animations
//     Animated.sequence([
//       Animated.timing(cardAnimation, {
//         toValue: 1,
//         duration: 600,
//         useNativeDriver: true,
//       }),
//       Animated.timing(contentAnimation, {
//         toValue: 1,
//         duration: 500,
//         useNativeDriver: true,
//       })
//     ]).start();
    
//     // Animate indicator
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(indicatorAnimation, {
//           toValue: 1,
//           duration: 1000,
//           useNativeDriver: true,
//         }),
//         Animated.timing(indicatorAnimation, {
//           toValue: 0,
//           duration: 1000,
//           useNativeDriver: true,
//         })
//       ])
//     ).start();
//   }, []);
  
//   // Animate stage changes
//   useEffect(() => {
//     stageAnimations.forEach((anim, index) => {
//       if (index === setupStage) {
//         Animated.timing(anim, {
//           toValue: 1,
//           duration: 400,
//           useNativeDriver: true,
//         }).start();
//       } else {
//         Animated.timing(anim, {
//           toValue: 0,
//           duration: 200,
//           useNativeDriver: true,
//         }).start();
//       }
//     });
//   }, [setupStage]);
  
//   const progressSetup = () => {
//     if (setupStage < 3) {
//       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//       setSetupStage(prev => prev + 1);
//     } else {
//       handleStartFaceSetup();
//     }
//   };
  
//   const handleStartFaceSetup = () => {
//     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
//     setShowFaceScanner(true);
    
//     // Simulate face detection completion after delay (for demo)
//     setTimeout(() => {
//       handleFaceDetected({ detected: true });
//     }, 3000);
//   };
  
//   const handleFaceDetected = async (faceData: any) => {
//     setIsProcessing(true);
//     setShowFaceScanner(false);
    
//     try {
//       // Simulate brief processing delay
//       await new Promise(resolve => setTimeout(resolve, 1500));
      
//       const success = await setupFaceId(faceData);
      
//       if (success) {
//         Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
//         setSetupComplete(true);
        
//         // Show success animation
//         Animated.timing(successAnimation, {
//           toValue: 1,
//           duration: 800,
//           useNativeDriver: true,
//         }).start();
//       } else {
//         Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
//       }
//     } catch (error) {
//       console.error('Face setup error:', error);
//     } finally {
//       setIsProcessing(false);
//     }
//   };
  
//   const handleFaceScannerCancel = () => {
//     setShowFaceScanner(false);
//   };
  
//   const handleSkip = () => {
//     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//     router.replace('/(tabs)');
//   };
  
//   const handleContinue = () => {
//     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
//     router.replace('/(tabs)');
//   };
  
//   // Render face scanner component (simulated in this demo)
//   const renderFaceScanner = () => {
//     return (
//       <View style={styles.faceScannerContainer}>
//         <LinearGradient
//           colors={['#1a3a8f', '#1e40af', '#3b82f6']}
//           style={styles.faceScannerGradient}
//         >
//           <View style={styles.faceScannerHeader}>
//             <TouchableOpacity
//               style={styles.faceScannerCloseButton}
//               onPress={handleFaceScannerCancel}
//             >
//               <Ionicons name="close" size={24} color="#fff" />
//             </TouchableOpacity>
//             <ThemedText style={styles.faceScannerTitle}>
//               Face ID Setup
//             </ThemedText>
//             <View style={{ width: 40 }} />
//           </View>
          
//           <View style={styles.faceOutlineContainer}>
//             <View style={styles.faceOutline}>
//               <Animated.View 
//                 style={[
//                   styles.scanLine,
//                   {
//                     opacity: indicatorAnimation,
//                     transform: [
//                       { translateY: indicatorAnimation.interpolate({
//                         inputRange: [0, 1],
//                         outputRange: [0, 200]
//                       })}
//                     ]
//                   }
//                 ]}
//               />
//             </View>
            
//             <ThemedText style={styles.faceScannerInstructions}>
//               Position your face within the frame
//             </ThemedText>
//           </View>
//         </LinearGradient>
//       </View>
//     );
//   };

//   if (showFaceScanner) {
//     return renderFaceScanner();
//   }

//   return (
//     <ThemedView style={styles.container}>
//       <Stack.Screen 
//         options={{ 
//           title: 'Face ID Setup',
//           headerBackVisible: false,
//         }} 
//       />
      
//       <LinearGradient
//         colors={['#f9fafb', '#f3f4f6', '#e5e7eb']}
//         style={styles.gradient}
//       >
//         <Animated.View 
//           style={[
//             styles.card,
//             { 
//               opacity: cardAnimation,
//               transform: [
//                 { scale: cardAnimation.interpolate({
//                   inputRange: [0, 1],
//                   outputRange: [0.9, 1]
//                 })}
//               ]
//             }
//           ]}
//         >
//           {setupComplete ? (
//             <Animated.View 
//               style={[
//                 styles.successContainer,
//                 {
//                   opacity: successAnimation,
//                   transform: [
//                     { scale: successAnimation.interpolate({
//                       inputRange: [0, 1],
//                       outputRange: [0.8, 1]
//                     })}
//                   ]
//                 }
//               ]}
//             >
//               <View style={styles.successIconContainer}>
//                 <Ionicons name="checkmark-circle" size={80} color={Colors.light.success} />
//               </View>
              
//               <ThemedText type="title" style={styles.successTitle}>
//                 Face ID Set Up Successfully
//               </ThemedText>
              
//               <ThemedText lightColor="secondary" style={styles.successText}>
//                 You can now use Face ID for quick and secure login to MalariaDetect.
//               </ThemedText>
              
//               <TouchableOpacity
//                 style={styles.continueButton}
//                 onPress={handleContinue}
//               >
//                 <ThemedText style={styles.continueButtonText}>Continue to Dashboard</ThemedText>
//                 <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
//               </TouchableOpacity>
//             </Animated.View>
//           ) : (
//             <Animated.View style={{ opacity: contentAnimation }}>
//               <View style={styles.cardHeader}>
//                 <ThemedText type="title" style={styles.cardTitle}>
//                   Set Up Face ID
//                 </ThemedText>
//                 <ThemedText type="default" lightColor="secondary" style={styles.cardDescription}>
//                   Use Face ID for quick and secure access to the app
//                 </ThemedText>
//               </View>
              
//               {/* Stage Navigation */}
//               <View style={styles.stageIndicators}>
//                 {[0, 1, 2, 3].map((stage) => (
//                   <TouchableOpacity
//                     key={stage}
//                     style={[
//                       styles.stageIndicator,
//                       setupStage === stage && styles.activeStageIndicator
//                     ]}
//                     onPress={() => setSetupStage(stage)}
//                   />
//                 ))}
//               </View>
              
//               {/* Stage Content */}
//               <View style={styles.stageContainer}>
//                 <Animated.View 
//                   style={[
//                     styles.stageContent,
//                     {
//                       opacity: stageAnimations[0],
//                       transform: [
//                         { 
//                           translateX: stageAnimations[0].interpolate({
//                             inputRange: [0, 1],
//                             outputRange: [-20, 0]
//                           })
//                         }
//                       ],
//                       position: 'absolute',
//                       display: setupStage === 0 ? 'flex' : 'none'
//                     }
//                   ]}
//                 >
//                   <View style={styles.stageIconContainer}>
//                     <Ionicons name="shield-checkmark" size={50} color={Colors.light.primary} />
//                   </View>
//                   <ThemedText type="defaultSemiBold" style={styles.stageTitle}>
//                     Enhanced Security
//                   </ThemedText>
//                   <ThemedText lightColor="secondary" style={styles.stageText}>
//                     Face ID provides an additional layer of protection for your account and patient data.
//                   </ThemedText>
//                 </Animated.View>
                
//                 <Animated.View 
//                   style={[
//                     styles.stageContent,
//                     {
//                       opacity: stageAnimations[1],
//                       transform: [
//                         { 
//                           translateX: stageAnimations[1].interpolate({
//                             inputRange: [0, 1],
//                             outputRange: [-20, 0]
//                           })
//                         }
//                       ],
//                       position: 'absolute',
//                       display: setupStage === 1 ? 'flex' : 'none'
//                     }
//                   ]}
//                 >
//                   <View style={styles.stageIconContainer}>
//                     <Ionicons name="time" size={50} color={Colors.light.primary} />
//                   </View>
//                   <ThemedText type="defaultSemiBold" style={styles.stageTitle}>
//                     Fast Access
//                   </ThemedText>
//                   <ThemedText lightColor="secondary" style={styles.stageText}>
//                     Skip typing passwords and access the app instantly with just a glance.
//                   </ThemedText>
//                 </Animated.View>
                
//                 <Animated.View 
//                   style={[
//                     styles.stageContent,
//                     {
//                       opacity: stageAnimations[2],
//                       transform: [
//                         { 
//                           translateX: stageAnimations[2].interpolate({
//                             inputRange: [0, 1],
//                             outputRange: [-20, 0]
//                           })
//                         }
//                       ],
//                       position: 'absolute',
//                       display: setupStage === 2 ? 'flex' : 'none'
//                     }
//                   ]}
//                 >
//                   <View style={styles.stageIconContainer}>
//                     <MaterialCommunityIcons name="face-recognition" size={50} color={Colors.light.primary} />
//                   </View>
//                   <ThemedText type="defaultSemiBold" style={styles.stageTitle}>
//                     Secure Authentication
//                   </ThemedText>
//                   <ThemedText lightColor="secondary" style={styles.stageText}>
//                     Face recognition ensures only you can access your account and sensitive information.
//                   </ThemedText>
//                 </Animated.View>
                
//                 <Animated.View 
//                   style={[
//                     styles.stageContent,
//                     {
//                       opacity: stageAnimations[3],
//                       transform: [
//                         { 
//                           translateX: stageAnimations[3].interpolate({
//                             inputRange: [0, 1],
//                             outputRange: [-20, 0]
//                           })
//                         }
//                       ],
//                       position: 'absolute',
//                       display: setupStage === 3 ? 'flex' : 'none'
//                     }
//                   ]}
//                 >
//                   <View style={styles.stageIconContainer}>
//                     <Ionicons name="scan" size={50} color={Colors.light.primary} />
//                   </View>
//                   <ThemedText type="defaultSemiBold" style={styles.stageTitle}>
//                     Ready to Scan
//                   </ThemedText>
//                   <ThemedText lightColor="secondary" style={styles.stageText}>
//                     Position your face in good lighting and look directly at the camera to set up Face ID.
//                   </ThemedText>
//                 </Animated.View>
//               </View>
              
//               <View style={styles.actionButtons}>
//                 <TouchableOpacity
//                   style={styles.skipButton}
//                   onPress={handleSkip}
//                 >
//                   <ThemedText lightColor="secondary" style={styles.skipButtonText}>Skip for now</ThemedText>
//                 </TouchableOpacity>
                
//                 <TouchableOpacity
//                   style={styles.nextButton}
//                   onPress={progressSetup}
//                 >
//                   <ThemedText style={styles.nextButtonText}>
//                     {setupStage === 3 ? 'Set Up Face ID' : 'Next'}
//                   </ThemedText>
//                   <Ionicons 
//                     name={setupStage === 3 ? "scan" : "arrow-forward"} 
//                     size={18} 
//                     color="#fff" 
//                     style={{ marginLeft: 6 }} 
//                   />
//                 </TouchableOpacity>
//               </View>
//             </Animated.View>
//           )}
//         </Animated.View>
        
//         {isProcessing && (
//           <View style={styles.processingOverlay}>
//             <BlurView intensity={15} tint="light" style={styles.processingBlur}>
//               <ActivityIndicator size="large" color={Colors.light.primary} />
//               <ThemedText style={styles.processingText}>Setting up Face ID...</ThemedText>
//             </BlurView>
//           </View>
//         )}
//       </LinearGradient>
//     </ThemedView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f3f4f6',
//   },
//   gradient: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     width: '100%',
//     maxWidth: 450,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 5,
//     overflow: 'hidden',
//   },
//   cardHeader: {
//     padding: 24,
//     alignItems: 'center',
//     borderBottomWidth: 1,
//     borderBottomColor: '#f3f4f6',
//   },
//   cardTitle: {
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   cardDescription: {
//     textAlign: 'center',
//   },
//   stageIndicators: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     paddingVertical: 16,
//   },
//   stageIndicator: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: '#e5e7eb',
//     marginHorizontal: 4,
//   },
//   activeStageIndicator: {
//     backgroundColor: Colors.light.primary,
//     width: 20,
//   },
//   stageContainer: {
//     height: 280,
//     padding: 24,
//     position: 'relative',
//   },
//   stageContent: {
//     alignItems: 'center',
//     width: '100%',
//   },
//   stageIconContainer: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: 'rgba(37, 99, 235, 0.1)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   stageTitle: {
//     fontSize: 18,
//     marginBottom: 12,
//     textAlign: 'center',
//   },
//   stageText: {
//     textAlign: 'center',
//     lineHeight: 22,
//   },
//   actionButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 24,
//     borderTopWidth: 1,
//     borderTopColor: '#f3f4f6',
//   },
//   skipButton: {
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//   },
//   skipButtonText: {
//     fontWeight: '500',
//   },
//   nextButton: {
//     backgroundColor: Colors.light.primary,
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 12,
//   },
//   nextButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   processingOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   processingBlur: {
//     padding: 30,
//     borderRadius: 20,
//     alignItems: 'center',
//   },
//   processingText: {
//     marginTop: 16,
//     color: Colors.light.primary,
//     fontWeight: '500',
//   },
//   successContainer: {
//     padding: 30,
//     alignItems: 'center',
//   },
//   successIconContainer: {
//     marginBottom: 24,
//   },
//   successTitle: {
//     textAlign: 'center',
//     marginBottom: 16,
//   },
//   successText: {
//     textAlign: 'center',
//     marginBottom: 30,
//     lineHeight: 22,
//   },
//   continueButton: {
//     backgroundColor: Colors.light.primary,
//     borderRadius: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     height: 56,
//     width: '100%',
//   },
//   continueButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   faceScannerContainer: {
//     flex: 1,
//     backgroundColor: Colors.light.primary,
//   },
//   faceScannerGradient: {
//     flex: 1,
//     paddingTop: 50,
//   },
//   faceScannerHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     marginBottom: 40,
//   },
//   faceScannerCloseButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'rgba(0, 0, 0, 0.2)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   faceScannerTitle: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   faceOutlineContainer: {
//     flex: 1,
//     alignItems: 'center',
//     paddingTop: 40,
//   },
//   faceOutline: {
//     width: 250,
//     height: 300,
//     borderRadius: 20,
//     borderWidth: 2,
//     borderColor: 'rgba(255, 255, 255, 0.6)',
//     marginBottom: 30,
//     overflow: 'hidden',
//   },
//   scanLine: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     height: 2,
//     backgroundColor: Colors.light.primary,
//     shadowColor: Colors.light.primary,
//     shadowOffset: { width: 0, height: 0 },
//     shadowOpacity: 1,
//     shadowRadius: 10,
//     elevation: 5,
//   },
//   faceScannerInstructions: {
//     color: '#fff',
//     fontSize: 16,
//     textAlign: 'center',
//   }
// });
// app/auth/face-setup.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
  Alert
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// Components
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';

// Auth Context
import { useAuth } from '../context/AuthContext';

// Constants
import { Colors } from '../../constants/Colors';

const { width, height } = Dimensions.get('window');

export default function FaceSetupScreen() {
  const { setupFaceId, user } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [showFaceScanner, setShowFaceScanner] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [setupStage, setSetupStage] = useState(0);
  
  // Animation values
  const cardAnimation = useRef(new Animated.Value(0)).current;
  const contentAnimation = useRef(new Animated.Value(0)).current;
  const successAnimation = useRef(new Animated.Value(0)).current;
  const indicatorAnimation = useRef(new Animated.Value(0)).current;
  const stageAnimations = Array(4).fill(0).map(() => useRef(new Animated.Value(0)).current);
  
  useEffect(() => {
    // Start entrance animations
    Animated.sequence([
      Animated.timing(cardAnimation, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(contentAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
    
    // Animate indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(indicatorAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(indicatorAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);
  
  // Animate stage changes
  useEffect(() => {
    stageAnimations.forEach((anim, index) => {
      if (index === setupStage) {
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(anim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    });
  }, [setupStage]);
  
  const progressSetup = () => {
    if (setupStage < 3) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSetupStage(prev => prev + 1);
    } else {
      handleStartFaceSetup();
    }
  };
  
  const handleStartFaceSetup = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowFaceScanner(true);
    
    // Simulate face detection completion after delay (for demo)
    setTimeout(() => {
      handleFaceDetected({ detected: true });
    }, 3000);
  };
  
  const handleFaceDetected = async (faceData: any) => {
    setIsProcessing(true);
    setShowFaceScanner(false);
    
    try {
      // Simulate brief processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const success = await setupFaceId(faceData);
      
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setSetupComplete(true);
        
        // Show success animation
        Animated.timing(successAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
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
    // Navigate directly to login
    router.replace('/auth/login');
  };
  
  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate directly to login
    router.replace('/auth/login');
  };
  
  // Show prompt to login after face setup
  const showLoginPrompt = () => {
    Alert.alert(
      'Face ID Setup Complete',
      'Please log in with your credentials to access your account.',
      [
        {
          text: 'OK',
          onPress: () => {
            // Clear authentication and go to login
            router.replace('/auth/login');
          }
        }
      ]
    );
  };
  
  // Render face scanner component (simulated in this demo)
  const renderFaceScanner = () => {
    return (
      <View style={styles.faceScannerContainer}>
        <LinearGradient
          colors={['#1a3a8f', '#1e40af', '#3b82f6']}
          style={styles.faceScannerGradient}
        >
          <View style={styles.faceScannerHeader}>
            <TouchableOpacity
              style={styles.faceScannerCloseButton}
              onPress={handleFaceScannerCancel}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <ThemedText style={styles.faceScannerTitle}>
              Face ID Setup
            </ThemedText>
            <View style={{ width: 40 }} />
          </View>
          
          <View style={styles.faceOutlineContainer}>
            <View style={styles.faceOutline}>
              <Animated.View 
                style={[
                  styles.scanLine,
                  {
                    opacity: indicatorAnimation,
                    transform: [
                      { translateY: indicatorAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 200]
                      })}
                    ]
                  }
                ]}
              />
            </View>
            
            <ThemedText style={styles.faceScannerInstructions}>
              Position your face within the frame
            </ThemedText>
          </View>
        </LinearGradient>
      </View>
    );
  };

  if (showFaceScanner) {
    return renderFaceScanner();
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Face ID Setup',
          headerBackVisible: false,
        }} 
      />
      
      <LinearGradient
        colors={['#f9fafb', '#f3f4f6', '#e5e7eb']}
        style={styles.gradient}
      >
        <Animated.View 
          style={[
            styles.card,
            { 
              opacity: cardAnimation,
              transform: [
                { scale: cardAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1]
                })}
              ]
            }
          ]}
        >
          {setupComplete ? (
            <Animated.View 
              style={[
                styles.successContainer,
                {
                  opacity: successAnimation,
                  transform: [
                    { scale: successAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1]
                    })}
                  ]
                }
              ]}
            >
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
                <ThemedText style={styles.continueButtonText}>Continue to Login</ThemedText>
                <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <Animated.View style={{ opacity: contentAnimation }}>
              <View style={styles.cardHeader}>
                <ThemedText type="title" style={styles.cardTitle}>
                  Set Up Face ID
                </ThemedText>
                <ThemedText type="default" lightColor="secondary" style={styles.cardDescription}>
                  Use Face ID for quick and secure access to the app
                </ThemedText>
              </View>
              
              {/* Stage Navigation */}
              <View style={styles.stageIndicators}>
                {[0, 1, 2, 3].map((stage) => (
                  <TouchableOpacity
                    key={stage}
                    style={[
                      styles.stageIndicator,
                      setupStage === stage && styles.activeStageIndicator
                    ]}
                    onPress={() => setSetupStage(stage)}
                  />
                ))}
              </View>
              
              {/* Stage Content */}
              <View style={styles.stageContainer}>
                <Animated.View 
                  style={[
                    styles.stageContent,
                    {
                      opacity: stageAnimations[0],
                      transform: [
                        { 
                          translateX: stageAnimations[0].interpolate({
                            inputRange: [0, 1],
                            outputRange: [-20, 0]
                          })
                        }
                      ],
                      position: 'absolute',
                      display: setupStage === 0 ? 'flex' : 'none'
                    }
                  ]}
                >
                  <View style={styles.stageIconContainer}>
                    <Ionicons name="shield-checkmark" size={50} color={Colors.light.primary} />
                  </View>
                  <ThemedText type="defaultSemiBold" style={styles.stageTitle}>
                    Enhanced Security
                  </ThemedText>
                  <ThemedText lightColor="secondary" style={styles.stageText}>
                    Face ID provides an additional layer of protection for your account and patient data.
                  </ThemedText>
                </Animated.View>
                
                <Animated.View 
                  style={[
                    styles.stageContent,
                    {
                      opacity: stageAnimations[1],
                      transform: [
                        { 
                          translateX: stageAnimations[1].interpolate({
                            inputRange: [0, 1],
                            outputRange: [-20, 0]
                          })
                        }
                      ],
                      position: 'absolute',
                      display: setupStage === 1 ? 'flex' : 'none'
                    }
                  ]}
                >
                  <View style={styles.stageIconContainer}>
                    <Ionicons name="time" size={50} color={Colors.light.primary} />
                  </View>
                  <ThemedText type="defaultSemiBold" style={styles.stageTitle}>
                    Fast Access
                  </ThemedText>
                  <ThemedText lightColor="secondary" style={styles.stageText}>
                    Skip typing passwords and access the app instantly with just a glance.
                  </ThemedText>
                </Animated.View>
                
                <Animated.View 
                  style={[
                    styles.stageContent,
                    {
                      opacity: stageAnimations[2],
                      transform: [
                        { 
                          translateX: stageAnimations[2].interpolate({
                            inputRange: [0, 1],
                            outputRange: [-20, 0]
                          })
                        }
                      ],
                      position: 'absolute',
                      display: setupStage === 2 ? 'flex' : 'none'
                    }
                  ]}
                >
                  <View style={styles.stageIconContainer}>
                    <MaterialCommunityIcons name="face-recognition" size={50} color={Colors.light.primary} />
                  </View>
                  <ThemedText type="defaultSemiBold" style={styles.stageTitle}>
                    Secure Authentication
                  </ThemedText>
                  <ThemedText lightColor="secondary" style={styles.stageText}>
                    Face recognition ensures only you can access your account and sensitive information.
                  </ThemedText>
                </Animated.View>
                
                <Animated.View 
                  style={[
                    styles.stageContent,
                    {
                      opacity: stageAnimations[3],
                      transform: [
                        { 
                          translateX: stageAnimations[3].interpolate({
                            inputRange: [0, 1],
                            outputRange: [-20, 0]
                          })
                        }
                      ],
                      position: 'absolute',
                      display: setupStage === 3 ? 'flex' : 'none'
                    }
                  ]}
                >
                  <View style={styles.stageIconContainer}>
                    <Ionicons name="scan" size={50} color={Colors.light.primary} />
                  </View>
                  <ThemedText type="defaultSemiBold" style={styles.stageTitle}>
                    Ready to Scan
                  </ThemedText>
                  <ThemedText lightColor="secondary" style={styles.stageText}>
                    Position your face in good lighting and look directly at the camera to set up Face ID.
                  </ThemedText>
                </Animated.View>
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={handleSkip}
                >
                  <ThemedText lightColor="secondary" style={styles.skipButtonText}>Skip for now</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={progressSetup}
                >
                  <ThemedText style={styles.nextButtonText}>
                    {setupStage === 3 ? 'Set Up Face ID' : 'Next'}
                  </ThemedText>
                  <Ionicons 
                    name={setupStage === 3 ? "scan" : "arrow-forward"} 
                    size={18} 
                    color="#fff" 
                    style={{ marginLeft: 6 }} 
                  />
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </Animated.View>
        
        {isProcessing && (
          <View style={styles.processingOverlay}>
            <BlurView intensity={15} tint="light" style={styles.processingBlur}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
              <ThemedText style={styles.processingText}>Setting up Face ID...</ThemedText>
            </BlurView>
          </View>
        )}
      </LinearGradient>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 450,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  cardTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDescription: {
    textAlign: 'center',
  },
  stageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  stageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 4,
  },
  activeStageIndicator: {
    backgroundColor: Colors.light.primary,
    width: 20,
  },
  stageContainer: {
    height: 280,
    padding: 24,
    position: 'relative',
  },
  stageContent: {
    alignItems: 'center',
    width: '100%',
  },
  stageIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  stageTitle: {
    fontSize: 18,
    marginBottom: 12,
    textAlign: 'center',
  },
  stageText: {
    textAlign: 'center',
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  skipButtonText: {
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingBlur: {
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
  },
  processingText: {
    marginTop: 16,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  successContainer: {
    padding: 30,
    alignItems: 'center',
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
    lineHeight: 22,
  },
  continueButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    width: '100%',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  faceScannerContainer: {
    flex: 1,
    backgroundColor: Colors.light.primary,
  },
  faceScannerGradient: {
    flex: 1,
    paddingTop: 50,
  },
  faceScannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  faceScannerCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceScannerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  faceOutlineContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  faceOutline: {
    width: 250,
    height: 300,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 30,
    overflow: 'hidden',
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
  faceScannerInstructions: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  }
});