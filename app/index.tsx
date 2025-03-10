import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Platform
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

// Constants
import {Colors} from '../constants/Colors';

const { width, height } = Dimensions.get('window');

// SVG component for the circular paths
const CirclePath = ({ 
  size, 
  strokeWidth, 
  color, 
  rotation, 
  progress 
}: { 
  size: number, 
  strokeWidth: number, 
  color: string, 
  rotation: number,
  progress: Animated.Value 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });
  
  return (
    <View style={{ 
      width: size, 
      height: size, 
      transform: [{ rotate: `${rotation}deg` }] 
    }}>
      <Animated.View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: 'transparent',
          borderTopColor: color,
          transform: [
            { rotateZ: progress.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'],
            }) }
          ]
        }}
      />
    </View>
  );
};

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  
  // Animation values
  const fadeIn = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const dotScale = useRef(new Animated.Value(0)).current;
  const dotOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.9)).current;
  const circleProgress = useRef(new Animated.Value(0)).current;
  
  // Cell animation values
  const cells = Array(5).fill(0).map(() => ({
    opacity: useRef(new Animated.Value(0)).current,
    scale: useRef(new Animated.Value(0)).current,
    translateX: useRef(new Animated.Value(0)).current,
    translateY: useRef(new Animated.Value(0)).current,
  }));
  
  useEffect(() => {
    // Start the animation sequence
    Animated.sequence([
      // Fade in background
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      
      // Show logo with slight bounce
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
      
      // Show central dot
      Animated.parallel([
        Animated.timing(dotOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(dotScale, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
      
      // Start circle animation
      Animated.timing(circleProgress, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      
      // Show cells floating around
      Animated.stagger(200, cells.map((cell, index) => 
        Animated.parallel([
          Animated.timing(cell.opacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.spring(cell.scale, {
            toValue: 1,
            friction: 6,
            useNativeDriver: true,
          }),
          Animated.spring(cell.translateX, {
            toValue: randomBetween(-80, 80),
            friction: 6,
            useNativeDriver: true,
          }),
          Animated.spring(cell.translateY, {
            toValue: randomBetween(-80, 80),
            friction: 6,
            useNativeDriver: true,
          }),
        ])
      )),
      
      // Show title
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(titleTranslateY, {
          toValue: 0,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
      
      // Show subtitle
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      
      // Show button
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(buttonScale, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    
    // Start cell floating animation
    cells.forEach((cell, index) => {
      startFloatingAnimation(cell.translateX, cell.translateY, 3000 + index * 500);
    });
  }, []);
  
  // Function to create floating animation for cells
  const startFloatingAnimation = (
    translateX: Animated.Value, 
    translateY: Animated.Value, 
    duration: number
  ) => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: randomBetween(-100, 100),
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: randomBetween(-100, 100),
            duration: duration,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: randomBetween(-100, 100),
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: randomBetween(-100, 100),
            duration: duration,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  };
  
  // Helper function to generate random numbers
  const randomBetween = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
  };
  
  // Handle getting started button press
  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Animate button press
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Navigate to dashboard
    setTimeout(() => {
      router.replace('/(tabs)');
    }, 200);
  };

  return (
    <Animated.View style={[
      styles.container,
      { opacity: fadeIn, transform: [{ scale }] }
    ]}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1a3a8f', '#1e40af', '#3b82f6']}
        style={styles.gradient}
      >
        {/* Floating cells */}
        {cells.map((cell, index) => (
          <Animated.View 
            key={index}
            style={[
              styles.floatingCell,
              {
                opacity: cell.opacity,
                transform: [
                  { scale: cell.scale },
                  { translateX: cell.translateX },
                  { translateY: cell.translateY },
                ]
              }
            ]}
          >
            <View style={[styles.cell, { backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)' }]} />
          </Animated.View>
        ))}
        
        {/* Logo and circles */}
        <View style={styles.logoContainer}>
          {/* Circular paths */}
          <View style={styles.circleContainer}>
            <CirclePath 
              size={240} 
              strokeWidth={2} 
              color="rgba(255, 255, 255, 0.2)" 
              rotation={0}
              progress={circleProgress} 
            />
            <CirclePath 
              size={200} 
              strokeWidth={3} 
              color="rgba(255, 255, 255, 0.3)" 
              rotation={45}
              progress={circleProgress} 
            />
            <CirclePath 
              size={160} 
              strokeWidth={4} 
              color="rgba(255, 255, 255, 0.4)" 
              rotation={90}
              progress={circleProgress} 
            />
          </View>
          
          {/* Main logo icon */}
          <Animated.View style={[
            styles.logo,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }]
            }
          ]}>
            <MaterialCommunityIcons name="microscope" size={80} color="#fff" />
          </Animated.View>
          
          {/* Center dot */}
          <Animated.View style={[
            styles.centerDot,
            {
              opacity: dotOpacity,
              transform: [{ scale: dotScale }]
            }
          ]} />
        </View>
        
        {/* App title */}
        <Animated.Text style={[
          styles.title,
          {
            opacity: titleOpacity,
            transform: [{ translateY: titleTranslateY }],
            marginTop: insets.top + 60
          }
        ]}>
          MalariaDetect
        </Animated.Text>
        
        {/* Subtitle */}
        <Animated.Text style={[
          styles.subtitle,
          { opacity: subtitleOpacity }
        ]}>
        Automating Malaria Diagnosis
        </Animated.Text>
        
        {/* Get started button */}
        <Animated.View style={[
          styles.buttonContainer,
          {
            opacity: buttonOpacity,
            transform: [{ scale: buttonScale }],
            marginBottom: insets.bottom > 0 ? insets.bottom : 20
          }
        ]}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
  },
  logoContainer: {
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  circleContainer: {
    position: 'absolute',
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  centerDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  floatingCell: {
    position: 'absolute',
    width: 20,
    height: 20,
  },
  cell: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 60,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '85%',
    maxWidth: 300,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 8,
  },
});