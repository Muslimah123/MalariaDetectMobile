// // components/auth/FaceScanner.tsx
// import React, { useState, useEffect, useRef } from 'react';
// import {
//   StyleSheet,
//   View,
//   TouchableOpacity,
//   Animated,
//   ActivityIndicator
// } from 'react-native';
// import {  CameraView, CameraType } from 'expo-camera';
// import { useCameraPermissions } from 'expo-camera';
// import * as FaceDetector from 'expo-face-detector';
// import { Ionicons } from '@expo/vector-icons';
// import * as Haptics from 'expo-haptics';
// import {
//     Camera,
//     useCameraDevice,
//     useFrameProcessor
//   } from 'react-native-vision-camera';





// // Components
// import { ThemedText } from '../../components/ThemedText';

// // Constants
// import { Colors } from '../../constants/Colors';

// interface FaceScannerProps {
//   onFaceDetected: (faceData: any) => void;
//   onCancel: () => void;
// }

// export default function FaceScanner({ onFaceDetected, onCancel }: FaceScannerProps) {
//   const [hasPermission, setHasPermission] = useState<boolean | null>(null);
//   const [faces, setFaces] = useState<any[]>([]);
//   const [isScanning, setIsScanning] = useState(true);
//   const [scanComplete, setScanComplete] = useState(false);
  
//   // Animation values
//   const faceBorderAnimation = useRef(new Animated.Value(0)).current;
//   const successAnimation = useRef(new Animated.Value(0)).current;
//   const cameraRef = useRef<CameraView | null>(null);
  
//   useEffect(() => {
//     (async () => {
//       const status = await Camera.requestCameraPermission();
//       setHasPermission(status === 'granted');
//     })();
    
//     // Start face border animation
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(faceBorderAnimation, {
//           toValue: 1,
//           duration: 1500,
//           useNativeDriver: false,
//         }),
//         Animated.timing(faceBorderAnimation, {
//           toValue: 0,
//           duration: 1500,
//           useNativeDriver: false,
//         })
//       ])
//     ).start();
//   }, []);
  
//   useEffect(() => {
//     // When a face is detected properly
//     if (faces.length > 0 && isScanning) {
//       const face = faces[0];
      
//       // Check if face is well-positioned (center, right size, etc.)
//       if (
//         face.bounds.size.width > 150 &&
//         face.bounds.size.height > 150 &&
//         !face.faceID
//       ) {
//         setIsScanning(false);
//         setScanComplete(true);
//         Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
//         // Animate success
//         Animated.timing(successAnimation, {
//           toValue: 1,
//           duration: 500,
//           useNativeDriver: true,
//         }).start(() => {
//           // Delay to show success animation
//           setTimeout(() => {
//             onFaceDetected(face);
//           }, 1000);
//         });
//       }
//     }
//   }, [faces, isScanning]);
  
//   const handleFacesDetected = ({ faces }: { faces: any[] }) => {
//     if (isScanning) {
//       setFaces(faces);
//     }
//   };
  
//   // Render guidance instructions
//   const renderGuidance = () => {
//     if (!isScanning && scanComplete) {
//       return (
//         <Animated.View 
//           style={[
//             styles.guidanceContainer,
//             { opacity: successAnimation }
//           ]}
//         >
//           <Ionicons name="checkmark-circle" size={60} color={Colors.light.success} />
//           <ThemedText style={styles.guidanceText}>Face Recognized!</ThemedText>
//         </Animated.View>
//       );
//     }
    
//     return (
//       <View style={styles.guidanceContainer}>
//         <ThemedText style={styles.guidanceTitle}>Position Your Face</ThemedText>
//         <ThemedText style={styles.guidanceText}>
//           Center your face in the frame and look directly at the camera
//         </ThemedText>
//       </View>
//     );
//   };

//   if (hasPermission === null) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={Colors.light.primary} />
//         <ThemedText style={styles.loadingText}>Requesting camera permission...</ThemedText>
//       </View>
//     );
//   }
  
//   if (hasPermission === false) {
//     return (
//       <View style={styles.errorContainer}>
//         <Ionicons name="close-circle" size={60} color={Colors.light.error} />
//         <ThemedText style={styles.errorText}>Camera permission denied</ThemedText>
//         <ThemedText style={styles.errorSubtext}>
//           We need camera access to use face recognition
//         </ThemedText>
//         <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
//           <ThemedText style={styles.cancelButtonText}>Back</ThemedText>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <CameraView
//         style={styles.camera}
//         ref={cameraRef}
//         facing="front"
//         // ref={(ref) => (cameraRef.current = ref)}
//         ratio="4:3"
//         >
//         <FaceDetector
//         onFacesDetected={handleFacesDetected}
//         faceDetectorSettings={{
//           mode: FaceDetector.FaceDetectorMode.fast,
//           detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
//           runClassifications: FaceDetector.FaceDetectorClassifications.none,
//           minDetectionInterval: 100,
//           tracking: true,
//         }}
//       />
//         <View style={styles.overlay}>
//           {/* Face scanner overlay */}
//           <Animated.View 
//             style={[
//               styles.faceBox,
//               {
//                 borderColor: faceBorderAnimation.interpolate({
//                   inputRange: [0, 1],
//                   outputRange: ['rgba(37, 99, 235, 0.3)', 'rgba(37, 99, 235, 0.8)']
//                 }),
//                 transform: [
//                   {
//                     scale: successAnimation.interpolate({
//                       inputRange: [0, 1],
//                       outputRange: [1, 0.9]
//                     })
//                   }
//                 ]
//               }
//             ]}
//           />

//           {/* Guidance text */}
//           {renderGuidance()}

//           {/* Cancel button */}
//           <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
//             <Ionicons name="close" size={24} color="#fff" />
//           </TouchableOpacity>
//         </View>
//       </CameraView>
//     </View>
//   );

// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   camera: {
//     flex: 1,
//   },
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   faceBox: {
//     width: 250,
//     height: 300,
//     borderWidth: 2,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   guidanceContainer: {
//     position: 'absolute',
//     bottom: 100,
//     left: 20,
//     right: 20,
//     alignItems: 'center',
//     padding: 16,
//     backgroundColor: 'rgba(0, 0, 0, 0.7)',
//     borderRadius: 12,
//   },
//   guidanceTitle: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: '600',
//     marginBottom: 8,
//   },
//   guidanceText: {
//     color: '#fff',
//     textAlign: 'center',
//   },
//   cancelButton: {
//     position: 'absolute',
//     top: 50,
//     right: 20,
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   cancelButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#000',
//   },
//   loadingText: {
//     color: '#fff',
//     marginTop: 16,
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#000',
//     padding: 20,
//   },
//   errorText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: '600',
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   errorSubtext: {
//     color: '#fff',
//     textAlign: 'center',
//     marginBottom: 24,
//   },
// });
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  ActivityIndicator
} from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import { scanFaces } from 'vision-camera-face-detector';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  Camera,
  useCameraDevice,
  useFrameProcessor
} from 'react-native-vision-camera';
import { ThemedText } from '../../components/ThemedText';
import { Colors } from '../../constants/Colors';
import 'react-native-reanimated';

interface FaceScannerProps {
  onFaceDetected: (faceData: any) => void;
  onCancel: () => void;
}

export default function FaceScanner({ onFaceDetected, onCancel }: FaceScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [faces, setFaces] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(true);
  const [scanComplete, setScanComplete] = useState(false);
  
  // Animation values
  const faceBorderAnimation = useRef(new Animated.Value(0)).current;
  const successAnimation = useRef(new Animated.Value(0)).current;
  const cameraRef = useRef<Camera | null>(null);
  const device = useCameraDevice('front');

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    })();

    // Face border animation
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
  }, []);

  const frameProcessor = useFrameProcessor((frame) => {
    const detectedFaces = scanFaces(frame);
    
    if (isScanning && detectedFaces.length > 0) {
      const face = detectedFaces[0];
      
      // Check face size (adjust these values based on your requirements)
      if (face.bounds.width > 150 && face.bounds.height > 150) {
        setIsScanning(false);
        setScanComplete(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Trigger success animation
        Animated.timing(successAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setTimeout(() => {
            onFaceDetected(face);
          }, 1000);
        });
      }
    }
  }, []);

  // Keep your existing permission handling and UI components
  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <ThemedText style={styles.loadingText}>Requesting camera permission...</ThemedText>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="close-circle" size={60} color={Colors.light.error} />
        <ThemedText style={styles.errorText}>Camera permission denied</ThemedText>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <ThemedText style={styles.cancelButtonText}>Back</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {device && (
        <Camera
          style={styles.camera}
          device={device}
          isActive={true}
          ref={cameraRef}
          frameProcessor={frameProcessor}
          pixelFormat="yuv"
        />
      )}

      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.faceBox,
            {
              borderColor: faceBorderAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ['rgba(37, 99, 235, 0.3)', 'rgba(37, 99, 235, 0.8)']
              }),
              transform: [
                {
                  scale: successAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.9]
                  })
                }
              ]
            }
          ]}
        />

        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Keep your existing styles unchanged
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceBox: {
    width: 250,
    height: 300,
    borderWidth: 2,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
});