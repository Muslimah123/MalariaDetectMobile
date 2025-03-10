// import React, { useState, useEffect, useRef } from 'react';
// import {
//   StyleSheet,
//   View,
//   TouchableOpacity,
//   Animated,
//   Dimensions,
//   Platform,
//   ActivityIndicator,
//   Image
// } from 'react-native';
// import { useLocalSearchParams, router, Stack } from 'expo-router';
// import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';
// import * as Haptics from 'expo-haptics';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { LinearGradient } from 'expo-linear-gradient';
// import { BlurView } from 'expo-blur';
// import { Camera, CameraType,CameraView } from 'expo-camera';
// import * as ImagePicker from 'expo-image-picker';

// // Components
// import {ThemedView} from '../../components/ThemedView';
// import {ThemedText} from '../../components/ThemedText';
// import {Collapsible} from '../../components/Collapsible';

// // Constants
// import {Colors} from '../../constants/Colors';
// import { mockSampleDetails } from '../../constants/MockData';

// const { width, height } = Dimensions.get('window');

// const GRID_COLOR = 'rgba(255, 255, 255, 0.35)';
// const CAMERA_RATIO = 4/3;

// interface MicroscopeControl {
//   name: string;
//   icon: string;
//   value: string | number;
//   options?: string[] | number[];
//   type: 'switch' | 'slider' | 'preset';
// }

// interface SampleInfo {
//   id: string;
//   patientName: string;
//   patientId: string;
//   sampleType: string;
// }

// export default function CaptureScreen() {
//   const params = useLocalSearchParams<{ id: string }>();
//   const id = params.id;
//   const insets = useSafeAreaInsets();
//   const cameraRef = useRef<CameraView | null>(null);
  
//   const [hasPermission, setHasPermission] = useState<boolean | null>(null);
//   const [sampleInfo, setSampleInfo] = useState<SampleInfo | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [capturedImage, setCapturedImage] = useState<string | null>(null);
//   const [isFocused, setIsFocused] = useState(false);
//   const [focusLevel, setFocusLevel] = useState(90);
//   const [lightLevel, setLightLevel] = useState(70);
//   const [zoomLevel, setZoomLevel] = useState(1);
//   const [showGrid, setShowGrid] = useState(true);
//   const [showControls, setShowControls] = useState(false);
//   const [isMicroscopeConnected, setIsMicroscopeConnected] = useState(true);
//   const [autoFocus, setAutoFocus] = useState(true);
//   const [isCapturing, setIsCapturing] = useState(false);
  

  
//   // Animation values
//   const controlsHeight = useRef(new Animated.Value(0)).current;
//   const gridOpacity = useRef(new Animated.Value(showGrid ? 1 : 0)).current;
//   const shutterScale = useRef(new Animated.Value(1)).current;
//   const flashOpacity = useRef(new Animated.Value(0)).current;
  
//   // Mock microscope controls
//   const microscopeControls: MicroscopeControl[] = [
//     { name: 'Light', icon: 'lightbulb-outline', value: lightLevel, type: 'slider' },
//     { name: 'Focus', icon: 'eye-outline', value: focusLevel, type: 'slider' },
//     { name: 'Zoom', icon: 'search', value: zoomLevel, type: 'slider' },
//     { name: 'Auto-Focus', icon: 'options', value: autoFocus ? 'On' : 'Off', type: 'switch' },
//     { name: 'Field', icon: 'grid', value: showGrid ? 'Grid On' : 'Grid Off', type: 'switch' }
//   ];

//   useEffect(() => {
//     // Request camera permissions
//     (async () => {
//       const { status } = await Camera.requestCameraPermissionsAsync();
//       setHasPermission(status === 'granted');
//     })();
    
//     // Get sample info
//     const sample = mockSampleDetails.samples.find(s => s.id === id);
//     if (sample) {
//       setSampleInfo({
//         id: sample.id,
//         patientName: sample.patientName,
//         patientId: sample.patientId,
//         sampleType: sample.sampleType
//       });
//     }
    
//     // Simulate loading microscope connection
//     setTimeout(() => {
//       setIsLoading(false);
      
//       // Start focus animation
//       startFocusAnimation();
//     }, 1500);
    
//     // Show grid animation
//     Animated.timing(gridOpacity, {
//       toValue: showGrid ? 1 : 0,
//       duration: 300,
//       useNativeDriver: true
//     }).start();
    
//     return () => {
//       // Clean up any resources
//     };
//   }, [id]);
  
//   // Watch for grid changes
//   useEffect(() => {
//     Animated.timing(gridOpacity, {
//       toValue: showGrid ? 1 : 0,
//       duration: 300,
//       useNativeDriver: true
//     }).start();
//   }, [showGrid]);
  
//   const startFocusAnimation = () => {
//     // Simulate auto-focus process
//     if (autoFocus) {
//       setIsFocused(false);
      
//       const randomFocusInterval = Math.floor(Math.random() * 1000) + 500;
      
//       setTimeout(() => {
//         setIsFocused(true);
//         Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
//       }, randomFocusInterval);
//     }
//   };

//   const toggleControls = () => {
//     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
//     Animated.timing(controlsHeight, {
//       toValue: showControls ? 0 : 1,
//       duration: 300,
//       useNativeDriver: false
//     }).start();
    
//     setShowControls(!showControls);
//   };
  
//   const toggleGrid = () => {
//     setShowGrid(!showGrid);
//   };
  
//   const toggleAutoFocus = () => {
//     setAutoFocus(!autoFocus);
//   };
  
//   const adjustLightLevel = (value: number) => {
//     setLightLevel(value);
//   };
  
//   const adjustFocusLevel = (value: number) => {
//     setFocusLevel(value);
    
//     // Simulate focus effect
//     if (value > 85) {
//       setIsFocused(true);
//     } else {
//       setIsFocused(false);
//     }
//   };
  
//   const adjustZoomLevel = (value: number) => {
//     setZoomLevel(parseFloat(value.toFixed(1)));
//   };
  
//   const captureImage = async () => {
//     if (cameraRef.current && !isCapturing) {
//       // Shutter animation
//       Animated.sequence([
//         Animated.timing(shutterScale, {
//           toValue: 0.9,
//           duration: 100,
//           useNativeDriver: true
//         }),
//         Animated.timing(shutterScale, {
//           toValue: 1,
//           duration: 100,
//           useNativeDriver: true
//         }),
//         Animated.timing(flashOpacity, {
//           toValue: 0.7,
//           duration: 100,
//           useNativeDriver: true
//         }),
//         Animated.timing(flashOpacity, {
//           toValue: 0,
//           duration: 200,
//           useNativeDriver: true
//         })
//       ]).start();
      
//       setIsCapturing(true);
      
//       try {
//         Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
//         // In a real app, this would actually take a photo
//         // For this prototype, we'll simulate it with a delay
//         setTimeout(() => {
//           // Use a mock image for demonstration
//           setCapturedImage('https://via.placeholder.com/400x300');
//           setIsCapturing(false);
//         }, 800);
        
//         // In a real implementation:
//         // const photo = await cameraRef.current.takePictureAsync();
//         // setCapturedImage(photo.uri);
//       } catch (error) {
//         console.error('Failed to take picture:', error);
//         setIsCapturing(false);
//       }
//     }
//   };
  
//   const selectFromGallery = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [4, 3],
//       quality: 1,
//     });

//     if (!result.canceled) {
//       setCapturedImage(result.assets[0].uri);
//     }
//   };
  
//   const retakePhoto = () => {
//     setCapturedImage(null);
//     startFocusAnimation();
//   };
  
//   const proceedToAnalysis = () => {
//     if (capturedImage) {
//       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
//       // Navigate to analysis screen with the image
//       router.push(`/analysis/${id}?imageUri=${encodeURIComponent(capturedImage)}`);
//     }
//   };
  
//   const renderCameraView = () => {
//     if (hasPermission === null) {
//       return (
//         <View style={styles.permissionContainer}>
//           <ActivityIndicator size="large" color={Colors.light.primary} />
//           <ThemedText style={styles.permissionText}>Requesting camera permissions...</ThemedText>
//         </View>
//       );
//     }
    
//     if (hasPermission === false) {
//       return (
//         <View style={styles.permissionContainer}>
//           <MaterialCommunityIcons name="camera-off" size={60} color={Colors.light.error} />
//           <ThemedText type="defaultSemiBold" style={styles.permissionText}>
//             No access to camera
//           </ThemedText>
//           <ThemedText style={styles.permissionSubtext}>
//             Please enable camera permissions in your device settings to use this feature.
//           </ThemedText>
//           <TouchableOpacity
//             style={styles.permissionButton}
//             onPress={() => router.back()}
//           >
//             <ThemedText style={styles.permissionButtonText}>Go Back</ThemedText>
//           </TouchableOpacity>
//         </View>
//       );
//     }
    
//     return (
//       <View style={styles.cameraContainer}>
//         {!isMicroscopeConnected ? (
//           <View style={styles.microscopeDisconnected}>
//             <MaterialCommunityIcons name="microscope" size={60} color={Colors.light.error} />
//             <ThemedText type="defaultSemiBold" style={[styles.microscopeErrorText, { fontSize: 18 }]}>
//               Microscope Disconnected
//             </ThemedText>
//             <ThemedText style={styles.microscopeErrorSubtext}>
//               Please check your microscope connection and try again.
//             </ThemedText>
//             <TouchableOpacity
//               style={styles.connectButton}
//               onPress={() => setIsMicroscopeConnected(true)}
//             >
//               <Ionicons name="refresh" size={18} color="#fff" style={styles.connectButtonIcon} />
//               <ThemedText style={styles.connectButtonText}>Reconnect</ThemedText>
//             </TouchableOpacity>
//           </View>
//         ) : capturedImage ? (
//           <View style={styles.capturedImageContainer}>
//             <Image
//               source={{ uri: capturedImage }}
//               style={styles.capturedImage}
//               resizeMode="contain"
//             />
            
//             <LinearGradient
//               colors={['rgba(0,0,0,0.7)', 'transparent']}
//               style={styles.capturedImageOverlay}
//               start={[0, 0]}
//               end={[0, 1]}
//             >
//               <ThemedText type="defaultSemiBold" style={styles.capturedImageText}>
//                 Captured Image Preview
//               </ThemedText>
//             </LinearGradient>
            
//             <View style={styles.capturedImageActions}>
//               <TouchableOpacity
//                 style={styles.capturedImageButton}
//                 onPress={retakePhoto}
//               >
//                 <Ionicons name="refresh" size={22} color="#fff" />
//                 <ThemedText style={styles.capturedImageButtonText}>Retake</ThemedText>
//               </TouchableOpacity>
              
//               <TouchableOpacity
//                 style={[styles.capturedImageButton, styles.proceedButton]}
//                 onPress={proceedToAnalysis}
//               >
//                 <Ionicons name="checkmark" size={22} color="#fff" />
//                 <ThemedText style={styles.capturedImageButtonText}>
//                   Proceed to Analysis
//                 </ThemedText>
//               </TouchableOpacity>
//             </View>
//           </View>
//         ) : (
//           <>
//             <View style={styles.container}>
//               <CameraView
//                 ref={(ref) => (cameraRef.current = ref)}
//                 style={styles.camera}
//                 facing="back"
//                 ratio="4:3"
//               />
//               <Animated.View
//                 style={[
//                   styles.cameraOverlay,
//                   { opacity: gridOpacity }
//                 ]}
//               >
//                 <View style={styles.gridLinesH}>
//                   <View style={[styles.gridLine, { top: '25%', left: 0, right: 0 }]} />
//                   <View style={[styles.gridLine, { top: '50%', left: 0, right: 0 }]} />
//                   <View style={[styles.gridLine, { top: '75%', left: 0, right: 0 }]} />
//                 </View>
//                 <View style={styles.gridLinesV}>
//                   <View style={[styles.gridLine, { left: '25%', top: 0, bottom: 0 }]} />
//                   <View style={[styles.gridLine, { left: '50%', top: 0, bottom: 0 }]} />
//                   <View style={[styles.gridLine, { left: '75%', top: 0, bottom: 0 }]} />
//                 </View>
                
//                 <View
//                   style={[
//                     styles.focusArea,
//                     isFocused ? styles.focusAreaActive : {}
//                   ]}
//                 >
//                   <View style={styles.focusCorner1} />
//                   <View style={styles.focusCorner2} />
//                   <View style={styles.focusCorner3} />
//                   <View style={styles.focusCorner4} />
//                 </View>
//               </Animated.View>
              
//               <Animated.View
//                 style={[
//                   styles.flashOverlay,
//                   { opacity: flashOpacity }
//                 ]}
//               />
//             </View>
            
//             <View style={styles.cameraControls}>
//               <TouchableOpacity style={styles.controlButton} onPress={toggleGrid}>
//                 <Ionicons
//                   name={showGrid ? "grid" : "grid-outline"}
//                   size={24}
//                   color="#fff"
//                 />
//               </TouchableOpacity>
              
//               <Animated.View
//                 style={[
//                   styles.shutterContainer,
//                   { transform: [{ scale: shutterScale }] }
//                 ]}
//               >
//                 <TouchableOpacity
//                   style={styles.shutterButton}
//                   onPress={captureImage}
//                   disabled={isCapturing}
//                 >
//                   {isCapturing ? (
//                     <ActivityIndicator color="#fff" size="large" />
//                   ) : (
//                     <View style={styles.shutterInner} />
//                   )}
//                 </TouchableOpacity>
//               </Animated.View>
              
//               <TouchableOpacity style={styles.controlButton} onPress={toggleControls}>
//                 <Ionicons
//                   name="options"
//                   size={24}
//                   color="#fff"
//                 />
//               </TouchableOpacity>
//             </View>
            
//             <View style={styles.focusIndicator}>
//               <View 
//                 style={[
//                   styles.focusIndicatorDot,
//                   isFocused ? styles.focusIndicatorActive : {}
//                 ]} 
//               />
//               <ThemedText 
//                 style={[
//                   styles.focusIndicatorText,
//                   isFocused ? styles.focusIndicatorTextActive : {},
//                   { fontSize: 12 }
//                 ]}
//               >
//                 {isFocused ? 'In Focus' : 'Focusing...'}
//               </ThemedText>
//             </View>
            
//             <Animated.View
//               style={[
//                 styles.microscopeControls,
//                 {
//                   height: controlsHeight.interpolate({
//                     inputRange: [0, 1],
//                     outputRange: [0, 250]
//                   })
//                 }
//               ]}
//             >
//               <BlurView
//                 intensity={80}
//                 tint="dark"
//                 style={styles.controlsBlur}
//               >
//                 <View style={styles.controlsHeader}>
//                   <ThemedText type="defaultSemiBold" style={styles.controlsTitle}>
//                     Microscope Controls
//                   </ThemedText>
//                   <TouchableOpacity onPress={toggleControls}>
//                     <Ionicons name="close" size={24} color="#fff" />
//                   </TouchableOpacity>
//                 </View>
                
//                 <View style={styles.controlsList}>
//                   {microscopeControls.map((control, index) => (
//                     <View key={index} style={styles.controlItem}>
//                       <View style={styles.controlItemHeader}>
//                         <Ionicons name={control.icon as any} size={20} color="#fff" style={styles.controlIcon} />
//                         <ThemedText style={styles.controlName}>{control.name}</ThemedText>
//                         {control.type === 'switch' && (
//                           <TouchableOpacity
//                             style={styles.switchControl}
//                             onPress={() => {
//                               if (control.name === 'Field') {
//                                 toggleGrid();
//                               } else if (control.name === 'Auto-Focus') {
//                                 toggleAutoFocus();
//                               }
//                               Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//                             }}
//                           >
//                             <View 
//                               style={[
//                                 styles.switchTrack,
//                                 (
//                                   (control.name === 'Field' && showGrid) ||
//                                   (control.name === 'Auto-Focus' && autoFocus)
//                                 ) ? styles.switchTrackActive : {}
//                               ]} 
//                             >
//                               <View 
//                                 style={[
//                                   styles.switchThumb,
//                                   (
//                                     (control.name === 'Field' && showGrid) ||
//                                     (control.name === 'Auto-Focus' && autoFocus)
//                                   ) ? styles.switchThumbActive : {}
//                                 ]} 
//                               />
//                             </View>
//                           </TouchableOpacity>
//                         )}
//                       </View>
                      
//                       {control.type === 'slider' && (
//                         <View style={styles.sliderContainer}>
//                           <Animated.View
//                             style={[
//                               styles.sliderTrack,
//                               {
//                                 width: `${
//                                   control.name === 'Light' ? lightLevel : 
//                                   control.name === 'Focus' ? focusLevel : 
//                                   (zoomLevel / 2) * 100
//                                 }%`
//                               }
//                             ]}
//                           />
//                           <TouchableOpacity
//                             style={[
//                               styles.sliderThumb,
//                               {
//                                 left: `${
//                                   control.name === 'Light' ? lightLevel : 
//                                   control.name === 'Focus' ? focusLevel : 
//                                   (zoomLevel / 2) * 100
//                                 }%`
//                               }
//                             ]}
//                             onPress={() => {}}
//                           />
                          
//                           <View style={styles.sliderTicks}>
//                             <TouchableOpacity 
//                               style={styles.sliderTick}
//                               onPress={() => {
//                                 if (control.name === 'Light') {
//                                   adjustLightLevel(25);
//                                 } else if (control.name === 'Focus') {
//                                   adjustFocusLevel(25);
//                                 } else {
//                                   adjustZoomLevel(0.5);
//                                 }
//                                 Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//                               }}
//                             />
//                             <TouchableOpacity 
//                               style={styles.sliderTick} 
//                               onPress={() => {
//                                 if (control.name === 'Light') {
//                                   adjustLightLevel(50);
//                                 } else if (control.name === 'Focus') {
//                                   adjustFocusLevel(50);
//                                 } else {
//                                   adjustZoomLevel(1);
//                                 }
//                                 Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//                               }}
//                             />
//                             <TouchableOpacity 
//                               style={styles.sliderTick}
//                               onPress={() => {
//                                 if (control.name === 'Light') {
//                                   adjustLightLevel(75);
//                                 } else if (control.name === 'Focus') {
//                                   adjustFocusLevel(75);
//                                 } else {
//                                   adjustZoomLevel(1.5);
//                                 }
//                                 Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//                               }}
//                             />
//                             <TouchableOpacity 
//                               style={styles.sliderTick}
//                               onPress={() => {
//                                 if (control.name === 'Light') {
//                                   adjustLightLevel(100);
//                                 } else if (control.name === 'Focus') {
//                                   adjustFocusLevel(100);
//                                 } else {
//                                   adjustZoomLevel(2);
//                                 }
//                                 Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//                               }}
//                             />
//                           </View>
                          
//                           <ThemedText type="default" style={styles.sliderValue}>
//                             {control.name === 'Zoom' ? zoomLevel + 'x' : control.value + '%'}
//                           </ThemedText>
//                         </View>
//                       )}
//                     </View>
//                   ))}
//                 </View>
//               </BlurView>
//             </Animated.View>
//           </>
//         )}
//       </View>
//     );
//   };

//   return (
//     <ThemedView style={styles.container}>
//       <Stack.Screen 
//         options={{
//           headerTitle: sampleInfo ? `Capture: ${sampleInfo.id}` : 'Image Capture',
//           headerTransparent: true,
//           headerTintColor: '#ffffff', 
//           headerBackVisible: true,
//           headerBackTitle: 'Back',
//           headerStyle: {
//             backgroundColor: 'transparent'
//           },
//           headerBackground: () => (
//             <BlurView intensity={80} tint="dark" style={styles.headerBlur} />
//           ),
//         }} 
//       />
      
//       {isLoading ? (
//         <View style={styles.loadingContainer}>
//           <MaterialCommunityIcons name="microscope" size={60} color={Colors.light.primary} style={{ marginBottom: 20 }} />
//           <ActivityIndicator size="large" color={Colors.light.primary} />
//           <ThemedText style={styles.loadingText}>Connecting to microscope...</ThemedText>
//         </View>
//       ) : (
//         <>
//           {renderCameraView()}
          
//           {/* Sample information display */}
//           {sampleInfo && !capturedImage && (
//             <BlurView
//               intensity={70}
//               tint="dark"
//               style={[styles.sampleInfoContainer, { top: insets.top + 60 }]}
//             >
//               <View style={styles.sampleInfoContent}>
//                 <View style={styles.sampleBadge}>
//                   <MaterialCommunityIcons name="test-tube" size={14} color="#fff" style={{ marginRight: 4 }} />
//                   <ThemedText style={styles.sampleBadgeText}>{sampleInfo.id}</ThemedText>
//                 </View>
//                 <ThemedText style={styles.sampleInfoText}>
//                   {sampleInfo.patientName} ({sampleInfo.sampleType})
//                 </ThemedText>
//               </View>
//             </BlurView>
//           )}
//         </>
//       )}
//     </ThemedView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   headerBlur: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#121212',
//   },
//   loadingText: {
//     marginTop: 16,
//     color: '#fff',
//   },
//   permissionContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 32,
//     backgroundColor: '#121212',
//   },
//   permissionText: {
//     marginTop: 16,
//     color: '#fff',
//     textAlign: 'center',
//   },
//   permissionSubtext: {
//     marginTop: 8,
//     color: 'rgba(255, 255, 255, 0.7)',
//     textAlign: 'center',
//     marginBottom: 24,
//   },
//   permissionButton: {
//     backgroundColor: Colors.light.primary,
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 12,
//   },
//   permissionButtonText: {
//     color: '#fff',
//     fontWeight: '500',
//   },
//   cameraContainer: {
//     flex: 1,
//     overflow: 'hidden',
//   },
//   camera: {
//     flex: 1,
//     justifyContent: 'flex-end',
//     alignItems: 'center',
//   },
//   cameraOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   gridLinesH: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   gridLinesV: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   gridLine: {
//     position: 'absolute',
//     backgroundColor: GRID_COLOR,
//     height: 1,
//     width: 1,
//   },
//   focusArea: {
//     width: 200,
//     height: 200,
//     borderRadius: 4,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   focusAreaActive: {
//     borderColor: 'rgba(46, 204, 113, 0.8)',
//   },
//   focusCorner1: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     width: 20,
//     height: 20,
//     borderTopWidth: 2,
//     borderLeftWidth: 2,
//     borderColor: 'rgba(255, 255, 255, 0.8)',
//   },
//   focusCorner2: {
//     position: 'absolute',
//     top: 0,
//     right: 0,
//     width: 20,
//     height: 20,
//     borderTopWidth: 2,
//     borderRightWidth: 2,
//     borderColor: 'rgba(255, 255, 255, 0.8)',
//   },
//   focusCorner3: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     width: 20,
//     height: 20,
//     borderBottomWidth: 2,
//     borderLeftWidth: 2,
//     borderColor: 'rgba(255, 255, 255, 0.8)',
//   },
//   focusCorner4: {
//     position: 'absolute',
//     bottom: 0,
//     right: 0,
//     width: 20,
//     height: 20,
//     borderBottomWidth: 2,
//     borderRightWidth: 2,
//     borderColor: 'rgba(255, 255, 255, 0.8)',
//   },
//   flashOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: '#fff',
//   },
//   cameraControls: {
//     position: 'absolute',
//     bottom: 30,
//     left: 0,
//     right: 0,
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//     paddingHorizontal: 30,
//   },
//   controlButton: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   shutterContainer: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: 'rgba(255, 255, 255, 0.3)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   shutterButton: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   shutterInner: {
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     borderWidth: 2,
//     borderColor: '#000',
//   },
//   capturedImageContainer: {
//     flex: 1,
//     backgroundColor: '#000',
//     justifyContent: 'center',
//     position: 'relative',
//   },
//   capturedImage: {
//     width: '100%',
//     height: '100%',
//     resizeMode: 'contain',
//   },
//   capturedImageOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     height: 80,
//     paddingTop: 20,
//     alignItems: 'center',
//   },
//   capturedImageText: {
//     color: '#fff',
//     fontSize: 16,
//   },
//   capturedImageActions: {
//     position: 'absolute',
//     bottom: 30,
//     left: 0,
//     right: 0,
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     paddingHorizontal: 20,
//   },
//   capturedImageButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.7)',
//     borderRadius: 12,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.2)',
//   },
//   proceedButton: {
//     backgroundColor: Colors.light.primary,
//     borderColor: Colors.light.primary,
//   },
//   capturedImageButtonText: {
//     color: '#fff',
//     marginLeft: 8,
//     fontWeight: '500',
//   },
//   focusIndicator: {
//     position: 'absolute',
//     top: 100,
//     right: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.6)',
//     paddingVertical: 6,
//     paddingHorizontal: 10,
//     borderRadius: 20,
//   },
//   focusIndicatorDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: '#f39c12',
//     marginRight: 6,
//   },
//   focusIndicatorActive: {
//     backgroundColor: '#2ecc71',
//   },
//   focusIndicatorText: {
//     color: '#fff',
//     fontSize: 12,
//   },
//   focusIndicatorTextActive: {
//     color: '#2ecc71',
//   },
//   microscopeControls: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     overflow: 'hidden',
//   },
//   controlsBlur: {
//     flex: 1,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     overflow: 'hidden',
//     borderTopWidth: 1,
//     borderTopColor: 'rgba(255, 255, 255, 0.1)',
//   },
//   controlsHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: 'rgba(255, 255, 255, 0.1)',
//   },
//   controlsTitle: {
//     color: '#fff',
//     fontSize: 16,
//   },
//   controlsList: {
//     padding: 16,
//   },
//   controlItem: {
//     marginBottom: 16,
//   },
//   controlItemHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   controlIcon: {
//     marginRight: 8,
//   },
//   controlName: {
//     color: '#fff',
//     flex: 1,
//   },
//   switchControl: {
//     padding: 4,
//   },
//   switchTrack: {
//     width: 40,
//     height: 22,
//     borderRadius: 11,
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     justifyContent: 'center',
//     paddingHorizontal: 2,
//   },
//   switchTrackActive: {
//     backgroundColor: Colors.light.primary,
//   },
//   switchThumb: {
//     width: 18,
//     height: 18,
//     borderRadius: 9,
//     backgroundColor: '#fff',
//   },
//   switchThumbActive: {
//     transform: [{ translateX: 18 }],
//   },
//   sliderContainer: {
//     height: 30,
//     justifyContent: 'center',
//     paddingHorizontal: 4,
//     position: 'relative',
//   },
//   sliderTrack: {
//     height: 4,
//     backgroundColor: Colors.light.primary,
//     borderRadius: 2,
//   },
//   sliderThumb: {
//     position: 'absolute',
//     width: 18,
//     height: 18,
//     borderRadius: 9,
//     backgroundColor: '#fff',
//     top: 6,
//     marginLeft: -9,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   sliderTicks: {
//     position: 'absolute',
//     left: 4,
//     right: 4,
//     height: 30,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 10,
//   },
//   sliderTick: {
//     width: 2,
//     height: 8,
//     backgroundColor: 'rgba(255, 255, 255, 0.3)',
//   },
//   sliderValue: {
//     position: 'absolute',
//     right: 4,
//     top: -16,
//     color: '#fff',
//   },
//   microscopeDisconnected: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#121212',
//     padding: 32,
//   },
//   microscopeErrorText: {
//     color: '#fff',
//     marginTop: 16,
//     textAlign: 'center',
//   },
//   microscopeErrorSubtext: {
//     color: 'rgba(255, 255, 255, 0.7)',
//     marginTop: 8,
//     textAlign: 'center',
//     marginBottom: 24,
//   },
//   connectButton: {
//     backgroundColor: Colors.light.primary,
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 12,
//   },
//   connectButtonIcon: {
//     marginRight: 8,
//   },
//   connectButtonText: {
//     color: '#fff',
//     fontWeight: '500',
//   },
//   sampleInfoContainer: {
//     position: 'absolute',
//     left: 16,
//     borderRadius: 16,
//     overflow: 'hidden',
//   },
//   sampleInfoContent: {
//     padding: 8,
//     alignItems: 'flex-start',
//   },
//   sampleBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: Colors.light.primary,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 4,
//     marginBottom: 4,
//   },
//   sampleBadgeText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   sampleInfoText: {
//     color: '#fff',
//   },
// });

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  ActivityIndicator,
  Image
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Camera, CameraType, CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

// Components
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { Collapsible } from '../../components/Collapsible';
import UploadManager from '../capture/UploadManager';
import BatchProcessor from '../capture/BatchProcessor'; 

// Constants
import { Colors } from '../../constants/Colors';
import { mockSampleDetails } from '../../constants/MockData';

// Auth Context
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

const GRID_COLOR = 'rgba(255, 255, 255, 0.35)';
const CAMERA_RATIO = 4/3;

interface MicroscopeControl {
  name: string;
  icon: string;
  value: string | number;
  options?: string[] | number[];
  type: 'switch' | 'slider' | 'preset';
}

interface SampleInfo {
  id: string;
  patientName: string;
  patientId: string;
  sampleType: string;
}

interface LocalCollapsibleProps {
  children: React.ReactNode;
  collapsed: boolean;
}

enum CaptureMode {
  CAMERA = 'camera',
  UPLOAD = 'upload'
}

const LocalCollapsible: React.FC<LocalCollapsibleProps> = ({ children, collapsed }) => {
  return (
    <View style={[collapsibleStyles.container, collapsed && collapsibleStyles.collapsed]}>
      {children}
    </View>
  );
};

const collapsibleStyles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  collapsed: {
    height: 0,
  },
});

export default function CaptureScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id;
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const cameraRef = useRef<CameraView | null>(null);
  
  // Capture mode state
  const [captureMode, setCaptureMode] = useState<CaptureMode>(CaptureMode.CAMERA);
  
  // Camera state
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [sampleInfo, setSampleInfo] = useState<SampleInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [focusLevel, setFocusLevel] = useState(90);
  const [lightLevel, setLightLevel] = useState(70);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [isMicroscopeConnected, setIsMicroscopeConnected] = useState(true);
  const [autoFocus, setAutoFocus] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showObjectiveOptions, setShowObjectiveOptions] = useState(false);
  const [showMicroscopeOptions, setShowMicroscopeOptions] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Upload state
  const [showUploadManager, setShowUploadManager] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showBatchProcessor, setShowBatchProcessor] = useState(false);
  const [processingResults, setProcessingResults] = useState<any[]>([]);
  
  // Animation values
  const controlsHeight = useRef(new Animated.Value(0)).current;
  const gridOpacity = useRef(new Animated.Value(showGrid ? 1 : 0)).current;
  const shutterScale = useRef(new Animated.Value(1)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const tabIndicatorPos = useRef(new Animated.Value(0)).current;
  
  // Mock microscope controls
  const microscopeControls: MicroscopeControl[] = [
    { name: 'Light', icon: 'lightbulb-outline', value: lightLevel, type: 'slider' },
    { name: 'Focus', icon: 'eye-outline', value: focusLevel, type: 'slider' },
    { name: 'Zoom', icon: 'search', value: zoomLevel, type: 'slider' },
    { name: 'Auto-Focus', icon: 'options', value: autoFocus ? 'On' : 'Off', type: 'switch' },
    { name: 'Field', icon: 'grid', value: showGrid ? 'Grid On' : 'Grid Off', type: 'switch' }
  ];

  useEffect(() => {
    // Request camera permissions
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    
    // Get sample info
    const sample = mockSampleDetails.samples.find(s => s.id === id);
    if (sample) {
      setSampleInfo({
        id: sample.id,
        patientName: sample.patientName,
        patientId: sample.patientId,
        sampleType: sample.sampleType
      });
    }
    
    // Simulate loading microscope connection
    setTimeout(() => {
      setIsLoading(false);
      
      // Start focus animation
      startFocusAnimation();
    }, 1500);
    
    // Show grid animation
    Animated.timing(gridOpacity, {
      toValue: showGrid ? 1 : 0,
      duration: 300,
      useNativeDriver: true
    }).start();
    
    return () => {
      // Clean up any resources
    };
  }, [id]);
  
  // Watch for grid changes
  useEffect(() => {
    Animated.timing(gridOpacity, {
      toValue: showGrid ? 1 : 0,
      duration: 300,
      useNativeDriver: true
    }).start();
  }, [showGrid]);
  
  // Update tab indicator position when capture mode changes
  useEffect(() => {
    Animated.spring(tabIndicatorPos, {
      toValue: captureMode === CaptureMode.CAMERA ? 0 : 1,
      friction: 8,
      useNativeDriver: false
    }).start();
  }, [captureMode]);
  
  const startFocusAnimation = () => {
    // Simulate auto-focus process
    if (autoFocus) {
      setIsFocused(false);
      
      const randomFocusInterval = Math.floor(Math.random() * 1000) + 500;
      
      setTimeout(() => {
        setIsFocused(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, randomFocusInterval);
    }
  };

  const toggleControls = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.timing(controlsHeight, {
      toValue: showControls ? 0 : 1,
      duration: 300,
      useNativeDriver: false
    }).start();
    
    setShowControls(!showControls);
  };
  
  const toggleGrid = () => {
    setShowGrid(!showGrid);
  };
  
  const toggleAutoFocus = () => {
    setAutoFocus(!autoFocus);
  };
  
  const adjustLightLevel = (value: number) => {
    setLightLevel(value);
  };
  
  const adjustFocusLevel = (value: number) => {
    setFocusLevel(value);
    
    // Simulate focus effect
    if (value > 85) {
      setIsFocused(true);
    } else {
      setIsFocused(false);
    }
  };
  
  const adjustZoomLevel = (value: number) => {
    setZoomLevel(parseFloat(value.toFixed(1)));
  };
  
  const captureImage = async () => {
    if (cameraRef.current && !isCapturing) {
      // Shutter animation
      Animated.sequence([
        Animated.timing(shutterScale, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(shutterScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(flashOpacity, {
          toValue: 0.7,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(flashOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
      
      setIsCapturing(true);
      
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        // In a real app, this would actually take a photo
        // For this prototype, we'll simulate it with a delay
        setTimeout(() => {
          // Use a mock image for demonstration
          setCapturedImage('https://via.placeholder.com/400x300');
          setIsCapturing(false);
        }, 800);
        
        // In a real implementation:
        // const photo = await cameraRef.current.takePictureAsync();
        // setCapturedImage(photo.uri);
      } catch (error) {
        console.error('Failed to take picture:', error);
        setIsCapturing(false);
      }
    }
  };
  
  const handleModeChange = (mode: CaptureMode) => {
    if (mode !== captureMode) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCaptureMode(mode);
      
      if (mode === CaptureMode.UPLOAD) {
        setShowUploadManager(true);
      } else {
        setShowUploadManager(false);
        setShowBatchProcessor(false);
      }
    }
  };
  
  const handleUploadImages = (imageUris: string[]) => {
    setSelectedImages(imageUris);
    setShowUploadManager(false);
    setShowBatchProcessor(true);
  };
  
  const handleBatchProcessingComplete = (results: any[]) => {
    setProcessingResults(results);
    setShowBatchProcessor(false);
    
    // Navigate to analysis with the first image result
    if (results.length > 0) {
      router.push(`/analysis/${id}?imageUri=${encodeURIComponent(results[0].imageUri)}`);
    }
  };
  
  const selectFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setCapturedImage(result.assets[0].uri);
    }
  };
  
  const retakePhoto = () => {
    setCapturedImage(null);
    startFocusAnimation();
  };
  
  const proceedToAnalysis = () => {
    if (capturedImage) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Navigate to analysis screen with the image
      router.push(`/analysis/${id}?imageUri=${encodeURIComponent(capturedImage)}`);
    }
  };

  // Render tab selector for camera/upload
  const renderTabSelector = () => {
    return (
      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => handleModeChange(CaptureMode.CAMERA)}
        >
          <Ionicons 
            name="camera-outline" 
            size={22} 
            color={captureMode === CaptureMode.CAMERA ? Colors.light.primary : Colors.light.secondary} 
          />
          <ThemedText 
            style={[
              styles.tabButtonText,
              captureMode === CaptureMode.CAMERA && { color: Colors.light.primary }
            ]}
          >
            Capture
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => handleModeChange(CaptureMode.UPLOAD)}
        >
          <Ionicons 
            name="cloud-upload-outline" 
            size={22} 
            color={captureMode === CaptureMode.UPLOAD ? Colors.light.primary : Colors.light.secondary} 
          />
          <ThemedText 
            style={[
              styles.tabButtonText,
              captureMode === CaptureMode.UPLOAD && { color: Colors.light.primary }
            ]}
          >
            Upload
          </ThemedText>
        </TouchableOpacity>
        
        <Animated.View 
          style={[
            styles.tabIndicator,
            {
              left: tabIndicatorPos.interpolate({
                inputRange: [0, 1],
                outputRange: ['5%', '55%']
              })
            }
          ]}
        />
      </View>
    );
  };
  
  const renderCameraView = () => {
    if (hasPermission === null) {
      return (
        <View style={styles.permissionContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <ThemedText style={styles.permissionText}>Requesting camera permissions...</ThemedText>
        </View>
      );
    }
    
    if (hasPermission === false) {
      return (
        <View style={styles.permissionContainer}>
          <MaterialCommunityIcons name="camera-off" size={60} color={Colors.light.error} />
          <ThemedText type="defaultSemiBold" style={styles.permissionText}>
            No access to camera
          </ThemedText>
          <ThemedText style={styles.permissionSubtext}>
            Please enable camera permissions in your device settings to use this feature.
          </ThemedText>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.permissionButtonText}>Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View style={styles.cameraContainer}>
        {!isMicroscopeConnected ? (
          <View style={styles.microscopeDisconnected}>
            <MaterialCommunityIcons name="microscope" size={60} color={Colors.light.error} />
            <ThemedText type="defaultSemiBold" style={[styles.microscopeErrorText, { fontSize: 18 }]}>
              Microscope Disconnected
            </ThemedText>
            <ThemedText style={styles.microscopeErrorSubtext}>
              Please check your microscope connection and try again.
            </ThemedText>
            <TouchableOpacity
              style={styles.connectButton}
              onPress={() => setIsMicroscopeConnected(true)}
            >
              <Ionicons name="refresh" size={18} color="#fff" style={styles.connectButtonIcon} />
              <ThemedText style={styles.connectButtonText}>Reconnect</ThemedText>
            </TouchableOpacity>
          </View>
        ) : capturedImage ? (
          <View style={styles.capturedImageContainer}>
            <Image
              source={{ uri: capturedImage }}
              style={styles.capturedImage}
              resizeMode="contain"
            />
            
            <LinearGradient
              colors={['rgba(0,0,0,0.7)', 'transparent']}
              style={styles.capturedImageOverlay}
              start={[0, 0]}
              end={[0, 1]}
            >
              <ThemedText type="defaultSemiBold" style={styles.capturedImageText}>
                Captured Image Preview
              </ThemedText>
            </LinearGradient>
            
            <View style={styles.capturedImageActions}>
              <TouchableOpacity
                style={styles.capturedImageButton}
                onPress={retakePhoto}
              >
                <Ionicons name="refresh" size={22} color="#fff" />
                <ThemedText style={styles.capturedImageButtonText}>Retake</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.capturedImageButton, styles.proceedButton]}
                onPress={proceedToAnalysis}
              >
                <Ionicons name="checkmark" size={22} color="#fff" />
                <ThemedText style={styles.capturedImageButtonText}>
                  Proceed to Analysis
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.container}>
              <CameraView
                ref={(ref) => (cameraRef.current = ref)}
                style={styles.camera}
                facing="back"
                ratio="4:3"
              />
              <Animated.View
                style={[
                  styles.cameraOverlay,
                  { opacity: gridOpacity }
                ]}
              >
                <View style={styles.gridLinesH}>
                  <View style={[styles.gridLine, { top: '25%', left: 0, right: 0 }]} />
                  <View style={[styles.gridLine, { top: '50%', left: 0, right: 0 }]} />
                  <View style={[styles.gridLine, { top: '75%', left: 0, right: 0 }]} />
                </View>
                <View style={styles.gridLinesV}>
                  <View style={[styles.gridLine, { left: '25%', top: 0, bottom: 0 }]} />
                  <View style={[styles.gridLine, { left: '50%', top: 0, bottom: 0 }]} />
                  <View style={[styles.gridLine, { left: '75%', top: 0, bottom: 0 }]} />
                </View>
                
                <View
                  style={[
                    styles.focusArea,
                    isFocused ? styles.focusAreaActive : {}
                  ]}
                >
                  <View style={styles.focusCorner1} />
                  <View style={styles.focusCorner2} />
                  <View style={styles.focusCorner3} />
                  <View style={styles.focusCorner4} />
                </View>
              </Animated.View>
              
              <Animated.View
                style={[
                  styles.flashOverlay,
                  { opacity: flashOpacity }
                ]}
              />
            </View>
            
            <View style={styles.cameraControls}>
              <TouchableOpacity style={styles.controlButton} onPress={toggleGrid}>
                <Ionicons
                  name={showGrid ? "grid" : "grid-outline"}
                  size={24}
                  color="#fff"
                />
              </TouchableOpacity>
              
              <Animated.View
                style={[
                  styles.shutterContainer,
                  { transform: [{ scale: shutterScale }] }
                ]}
              >
                <TouchableOpacity
                  style={styles.shutterButton}
                  onPress={captureImage}
                  disabled={isCapturing}
                >
                  {isCapturing ? (
                    <ActivityIndicator color="#fff" size="large" />
                  ) : (
                    <View style={styles.shutterInner} />
                  )}
                </TouchableOpacity>
              </Animated.View>
              
              <TouchableOpacity style={styles.controlButton} onPress={toggleControls}>
                <Ionicons
                  name="options"
                  size={24}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.focusIndicator}>
              <View 
                style={[
                  styles.focusIndicatorDot,
                  isFocused ? styles.focusIndicatorActive : {}
                ]} 
              />
              <ThemedText 
                style={[
                  styles.focusIndicatorText,
                  isFocused ? styles.focusIndicatorTextActive : {},
                  { fontSize: 12 }
                ]}
              >
                {isFocused ? 'In Focus' : 'Focusing...'}
              </ThemedText>
            </View>
            
            <Animated.View
              style={[
                styles.microscopeControls,
                {
                  height: controlsHeight.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 250]
                  })
                }
              ]}
            >
              <BlurView
                intensity={80}
                tint="dark"
                style={styles.controlsBlur}
              >
                <View style={styles.controlsHeader}>
                  <ThemedText type="defaultSemiBold" style={styles.controlsTitle}>
                    Microscope Controls
                  </ThemedText>
                  <TouchableOpacity onPress={toggleControls}>
                    <Ionicons name="close" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.controlsList}>
                  {microscopeControls.map((control, index) => (
                    <View key={index} style={styles.controlItem}>
                      <View style={styles.controlItemHeader}>
                        <Ionicons name={control.icon as any} size={20} color="#fff" style={styles.controlIcon} />
                        <ThemedText style={styles.controlName}>{control.name}</ThemedText>
                        {control.type === 'switch' && (
                          <TouchableOpacity
                            style={styles.switchControl}
                            onPress={() => {
                              if (control.name === 'Field') {
                                toggleGrid();
                              } else if (control.name === 'Auto-Focus') {
                                toggleAutoFocus();
                              }
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }}
                          >
                            <View 
                              style={[
                                styles.switchTrack,
                                (
                                  (control.name === 'Field' && showGrid) ||
                                  (control.name === 'Auto-Focus' && autoFocus)
                                ) ? styles.switchTrackActive : {}
                              ]} 
                            >
                              <View 
                                style={[
                                  styles.switchThumb,
                                  (
                                    (control.name === 'Field' && showGrid) ||
                                    (control.name === 'Auto-Focus' && autoFocus)
                                  ) ? styles.switchThumbActive : {}
                                ]} 
                              />
                            </View>
                          </TouchableOpacity>
                        )}
                      </View>
                      
                      {control.type === 'slider' && (
                        <View style={styles.sliderContainer}>
                          <Animated.View
                            style={[
                              styles.sliderTrack,
                              {
                                width: `${
                                  control.name === 'Light' ? lightLevel : 
                                  control.name === 'Focus' ? focusLevel : 
                                  (zoomLevel / 2) * 100
                                }%`
                              }
                            ]}
                          />
                          <TouchableOpacity
                            style={[
                              styles.sliderThumb,
                              {
                                left: `${
                                  control.name === 'Light' ? lightLevel : 
                                  control.name === 'Focus' ? focusLevel : 
                                  (zoomLevel / 2) * 100
                                }%`
                              }
                            ]}
                            onPress={() => {}}
                          />
                          
                          <View style={styles.sliderTicks}>
                            <TouchableOpacity 
                              style={styles.sliderTick}
                              onPress={() => {
                                if (control.name === 'Light') {
                                  adjustLightLevel(25);
                                } else if (control.name === 'Focus') {
                                  adjustFocusLevel(25);
                                } else {
                                  adjustZoomLevel(0.5);
                                }
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              }}
                            />
                            <TouchableOpacity 
                              style={styles.sliderTick} 
                              onPress={() => {
                                if (control.name === 'Light') {
                                  adjustLightLevel(50);
                                } else if (control.name === 'Focus') {
                                  adjustFocusLevel(50);
                                } else {
                                  adjustZoomLevel(1);
                                }
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              }}
                            />
                            <TouchableOpacity 
                              style={styles.sliderTick}
                              onPress={() => {
                                if (control.name === 'Light') {
                                  adjustLightLevel(75);
                                } else if (control.name === 'Focus') {
                                  adjustFocusLevel(75);
                                } else {
                                  adjustZoomLevel(1.5);
                                }
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              }}
                            />
                            <TouchableOpacity 
                              style={styles.sliderTick}
                              onPress={() => {
                                if (control.name === 'Light') {
                                  adjustLightLevel(100);
                                } else if (control.name === 'Focus') {
                                  adjustFocusLevel(100);
                                } else {
                                  adjustZoomLevel(2);
                                }
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              }}
                            />
                          </View>
                          
                          <ThemedText type="default" style={styles.sliderValue}>
                            {control.name === 'Zoom' ? zoomLevel + 'x' : control.value + '%'}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </BlurView>
            </Animated.View>
          </>
        )}
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{
          headerTitle: `${captureMode === CaptureMode.CAMERA ? 'Capture' : 'Upload'}: ${id}`,
          headerTransparent: true,
          headerTintColor: '#ffffff', 
          headerBackVisible: true,
          headerBackTitle: 'Back',
          headerStyle: {
            backgroundColor: 'transparent'
          },
          headerBackground: () => (
            <BlurView intensity={80} tint="dark" style={styles.headerBlur} />
          ),
        }} 
      />
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="microscope" size={60} color={Colors.light.primary} style={{ marginBottom: 20 }} />
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <ThemedText style={styles.loadingText}>Connecting to microscope...</ThemedText>
        </View>
      ) : (
        <>
          {/* Tab selector for camera/upload */}
          {renderTabSelector()}
          
          {/* Show camera view or upload manager based on mode */}
          {captureMode === CaptureMode.CAMERA ? (
            renderCameraView()
          ) : (
            <>
              {showUploadManager && (
                <UploadManager 
                  onImagesSelected={handleUploadImages}
                  onCancel={() => {
                    setShowUploadManager(false);
                    setCaptureMode(CaptureMode.CAMERA);
                  }}
                  sampleType={sampleInfo?.sampleType as any || 'Thick blood smear'}
                />
              )}
              
              {showBatchProcessor && (
                <BatchProcessor 
                  imageUris={selectedImages}
                  onComplete={handleBatchProcessingComplete}
                  onCancel={() => {
                    setShowBatchProcessor(false);
                    setShowUploadManager(true);
                  }}
                  sampleType={sampleInfo?.sampleType as any || 'Thick blood smear'}
                />
              )}
              
              {!showUploadManager && !showBatchProcessor && (
                <View style={styles.uploadPromptContainer}>
                  <MaterialCommunityIcons 
                    name="cloud-upload" 
                    size={80} 
                    color={Colors.light.primary} 
                    style={styles.uploadPromptIcon}
                  />
                  <ThemedText type="title" style={styles.uploadPromptTitle}>
                    Upload Blood Smear Images
                  </ThemedText>
                  <ThemedText lightColor="secondary" style={styles.uploadPromptText}>
                    You can upload multiple images for batch analysis.
                  </ThemedText>
                  <TouchableOpacity
                    style={styles.startUploadButton}
                    onPress={() => setShowUploadManager(true)}
                  >
                    <Ionicons name="cloud-upload-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <ThemedText style={styles.startUploadButtonText}>
                      Start Upload
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
          
          {/* Sample information display */}
          {sampleInfo && !capturedImage && captureMode === CaptureMode.CAMERA && !showControls && (
            <BlurView
              intensity={70}
              tint="dark"
              style={[styles.sampleInfoContainer, { top: insets.top + 60 }]}
            >
              <View style={styles.sampleInfoContent}>
                <View style={styles.sampleBadge}>
                  <MaterialCommunityIcons name="test-tube" size={14} color="#fff" style={{ marginRight: 4 }} />
                  <ThemedText style={styles.sampleBadgeText}>{sampleInfo.id}</ThemedText>
                </View>
                <ThemedText style={styles.sampleInfoText}>
                  {sampleInfo.patientName} ({sampleInfo.sampleType})
                </ThemedText>
              </View>
            </BlurView>
          )}
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    marginTop: 16,
    color: '#fff',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#121212',
  },
  permissionText: {
    marginTop: 16,
    color: '#fff',
    textAlign: 'center',
  },
  permissionSubtext: {
    marginTop: 8,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridLinesH: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLinesV: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: GRID_COLOR,
    height: 1,
    width: 1,
  },
  focusArea: {
    width: 200,
    height: 200,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusAreaActive: {
    borderColor: 'rgba(46, 204, 113, 0.8)',
  },
  focusCorner1: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 20,
    height: 20,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  focusCorner2: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  focusCorner3: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 20,
    height: 20,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  focusCorner4: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
  },
  cameraControls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#000',
  },
  capturedImageContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    position: 'relative',
  },
  capturedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  capturedImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    paddingTop: 20,
    alignItems: 'center',
  },
  capturedImageText: {
    color: '#fff',
    fontSize: 16,
  },
  capturedImageActions: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  capturedImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  proceedButton: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  capturedImageButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
  },
  focusIndicator: {
    position: 'absolute',
    top: 100,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  focusIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f39c12',
    marginRight: 6,
  },
  focusIndicatorActive: {
    backgroundColor: '#2ecc71',
  },
  focusIndicatorText: {
    color: '#fff',
    fontSize: 12,
  },
  focusIndicatorTextActive: {
    color: '#2ecc71',
  },
  microscopeControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  controlsBlur: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  controlsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  controlsTitle: {
    color: '#fff',
    fontSize: 16,
  },
  controlsList: {
    padding: 16,
  },
  controlItem: {
    marginBottom: 16,
  },
  controlItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  controlIcon: {
    marginRight: 8,
  },
  controlName: {
    color: '#fff',
    flex: 1,
  },
  switchControl: {
    padding: 4,
  },
  switchTrack: {
    width: 40,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchTrackActive: {
    backgroundColor: Colors.light.primary,
  },
  switchThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
  },
  switchThumbActive: {
    transform: [{ translateX: 18 }],
  },
  sliderContainer: {
    height: 30,
    justifyContent: 'center',
    paddingHorizontal: 4,
    position: 'relative',
  },
  sliderTrack: {
    height: 4,
    backgroundColor: Colors.light.primary,
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
    top: 6,
    marginLeft: -9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  sliderTicks: {
    position: 'absolute',
    left: 4,
    right: 4,
    height: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  sliderTick: {
    width: 2,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  sliderValue: {
    position: 'absolute',
    right: 4,
    top: -16,
    color: '#fff',
  },
  microscopeDisconnected: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 32,
  },
  microscopeErrorText: {
    color: '#fff',
    marginTop: 16,
    textAlign: 'center',
  },
  microscopeErrorSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 24,
  },
  connectButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  connectButtonIcon: {
    marginRight: 8,
  },
  connectButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  sampleInfoContainer: {
    position: 'absolute',
    left: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sampleInfoContent: {
    padding: 8,
    alignItems: 'flex-start',
  },
  sampleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  sampleBadgeText: {
    color: '#fff',
    fontWeight: '600',
  },
  sampleInfoText: {
    color: '#fff',
  },
  
  // New styles for tab selector and upload mode
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    padding: 4,
    margin: 16,
    marginTop: 70,
    position: 'relative',
    zIndex: 10,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
  },
  tabButtonText: {
    color: Colors.light.secondary,
    marginLeft: 8,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 4,
    width: '40%',
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 25,
    zIndex: -1,
  },
  uploadPromptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  uploadPromptIcon: {
    marginBottom: 24,
  },
  uploadPromptTitle: {
    marginBottom: 12,
    textAlign: 'center',
  },
  uploadPromptText: {
    textAlign: 'center',
    marginBottom: 32,
  },
  startUploadButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  startUploadButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});