// components/capture/BatchProcessor.tsx
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Animated
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Components
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';

// Constants
import { Colors } from '../../constants/Colors';

interface BatchProcessorProps {
  imageUris: string[];
  onComplete: (results: any) => void;
  onCancel: () => void;
  sampleType: 'Thick blood smear' | 'Thin blood smear';
}

export default function BatchProcessor({ imageUris, onComplete, onCancel, sampleType }: BatchProcessorProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingComplete, setProcessingComplete] = useState(false);
  
  // Animation values
  const progressAnimation = new Animated.Value(0);
  const cardAnimation = new Animated.Value(0);
  
  useEffect(() => {
    // Start processing the first image
    if (imageUris.length > 0) {
      processCurrentImage();
    }
    
    // Animate card entrance
    Animated.timing(cardAnimation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);
  
  // Update progress animation when currentImageIndex changes
  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: (currentImageIndex + 1) / imageUris.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentImageIndex]);
  
  const processCurrentImage = async () => {
    if (currentImageIndex >= imageUris.length) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Simulate image processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate results
      // In a real implementation, this would call your AI model API
      const mockResult = {
        imageUri: imageUris[currentImageIndex],
        confidence: Math.floor(70 + Math.random() * 25),
        parasitesDetected: Math.random() > 0.3,
        parasiteCount: Math.floor(Math.random() * 20),
        rbcCount: Math.floor(100 + Math.random() * 200),
        timestamp: new Date().toISOString()
      };
      
      // Add result to results array
      setResults(prev => [...prev, mockResult]);
      
      // Move to next image or complete
      if (currentImageIndex < imageUris.length - 1) {
        setCurrentImageIndex(currentImageIndex + 1);
        // Process next image
        setTimeout(() => processCurrentImage(), 500);
      } else {
        setProcessingComplete(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getCurrentImageUri = () => {
    if (currentImageIndex < imageUris.length) {
      return imageUris[currentImageIndex];
    }
    return imageUris[imageUris.length - 1];
  };

  const renderResultItem = ({ item, index }: { item: any, index: number }) => (
    <View style={styles.resultItem}>
      <Image source={{ uri: item.imageUri }} style={styles.resultImage} />
      <View style={styles.resultInfo}>
        <ThemedText type="defaultSemiBold">Image {index + 1}</ThemedText>
        <View style={[
          styles.resultBadge,
          { 
            backgroundColor: item.parasitesDetected 
              ? Colors.light.errorLight 
              : Colors.light.successLight 
          }
        ]}>
          <ThemedText style={[
            styles.resultBadgeText,
            { 
              color: item.parasitesDetected 
                ? Colors.light.error 
                : Colors.light.success 
            }
          ]}>
            {item.parasitesDetected 
              ? `${item.parasiteCount} Parasites` 
              : 'No Parasites'}
          </ThemedText>
        </View>
        <ThemedText lightColor="secondary">Confidence: {item.confidence}%</ThemedText>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          {processingComplete 
            ? 'Analysis Complete' 
            : 'Processing Images'}
        </ThemedText>
        {!processingComplete && (
          <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.light.secondary} />
          </TouchableOpacity>
        )}
      </View>
      
      {!processingComplete ? (
        <Animated.View 
          style={[
            styles.processingCard,
            {
              opacity: cardAnimation,
              transform: [
                { translateY: cardAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0]
                })}
              ]
            }
          ]}
        >
          <View style={styles.progressHeader}>
            <ThemedText type="defaultSemiBold">
              {`Processing Image ${currentImageIndex + 1} of ${imageUris.length}`}
            </ThemedText>
            <ThemedText lightColor="secondary">
              {sampleType}
            </ThemedText>
          </View>
          
          <View style={styles.progressBarContainer}>
            <Animated.View 
              style={[
                styles.progressBar,
                { width: progressAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                })}
              ]}
            />
          </View>
          
          <View style={styles.currentImageContainer}>
            <Image
              source={{ uri: getCurrentImageUri() }}
              style={styles.currentImage}
              resizeMode="contain"
            />
            
            {isProcessing && (
              <View style={styles.imageOverlay}>
                <ActivityIndicator size="large" color="#fff" />
                <ThemedText style={styles.processingText}>
                  Analyzing...
                </ThemedText>
              </View>
            )}
          </View>
          
          <View style={styles.stepIndicator}>
            <View style={[styles.step, styles.activeStep]}>
              <MaterialCommunityIcons name="image-filter-center-focus" size={20} color="#fff" />
            </View>
            <View style={styles.stepConnector} />
            <View style={[styles.step, isProcessing && styles.activeStep]}>
              <MaterialCommunityIcons name="bacteria-outline" size={20} color={isProcessing ? "#fff" : Colors.light.secondary} />
            </View>
            <View style={styles.stepConnector} />
            <View style={styles.step}>
              <MaterialCommunityIcons name="check-circle-outline" size={20} color={Colors.light.secondary} />
            </View>
          </View>
          
          <ThemedText lightColor="secondary" style={styles.processingHint}>
            Please wait while we analyze your images. This may take a few moments.
          </ThemedText>
        </Animated.View>
      ) : (
        <View style={styles.resultsContainer}>
          <View style={styles.resultsSummary}>
            <ThemedText type="defaultSemiBold" style={styles.summaryTitle}>
              Summary
            </ThemedText>
            <ThemedText>Total Images: {imageUris.length}</ThemedText>
            <ThemedText>
              Parasites Detected: {results.filter(r => r.parasitesDetected).length} images
            </ThemedText>
            <ThemedText>
              Total Parasites: {results.reduce((sum, r) => sum + (r.parasitesDetected ? r.parasiteCount : 0), 0)}
            </ThemedText>
            <View style={styles.divider} />
          </View>
          
          <ThemedText type="defaultSemiBold" style={styles.resultsTitle}>
            Individual Results
          </ThemedText>
          
          <FlatList
            data={results}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderResultItem}
            contentContainerStyle={styles.resultsList}
          />
          
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onComplete(results);
            }}
          >
            <ThemedText style={styles.completeButtonText}>
              View Detailed Analysis
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
  },
  closeButton: {
    padding: 4,
  },
  processingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressHeader: {
    marginBottom: 16,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.light.secondaryLight,
    borderRadius: 4,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 4,
  },
  currentImageContainer: {
    height: 200,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  currentImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#fff',
    marginTop: 8,
    fontWeight: '500',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  step: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStep: {
    backgroundColor: Colors.light.primary,
  },
  stepConnector: {
    height: 2,
    width: 30,
    backgroundColor: Colors.light.secondaryLight,
  },
  processingHint: {
    textAlign: 'center',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsSummary: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: 8,
  },
  resultsTitle: {
    marginBottom: 12,
  },
  resultsList: {
    paddingBottom: 20,
  },
  resultItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  resultImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  resultBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginVertical: 4,
  },
  resultBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  completeButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});