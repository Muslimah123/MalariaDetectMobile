// components/capture/UploadManager.tsx
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Components
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';

// Constants
import { Colors } from '../../constants/Colors';

// Utils
import { assessImageQuality } from '../../utils/imageQuality';

interface UploadManagerProps {
  onImagesSelected: (imageUris: string[]) => void;
  onCancel: () => void;
  sampleType: 'Thick blood smear' | 'Thin blood smear';
}

export default function UploadManager({ onImagesSelected, onCancel, sampleType }: UploadManagerProps) {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageQualities, setImageQualities] = useState<{[key: string]: {score: number, issues: string[]}}>({}); 

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
        aspect: [4, 3],
      });
      
      if (!result.canceled && result.assets.length > 0) {
        const newImages = result.assets.map(asset => asset.uri);
        setSelectedImages([...selectedImages, ...newImages]);
        
        // Assess quality of new images
        setIsProcessing(true);
        await Promise.all(newImages.map(async (uri) => {
          try {
            const quality = await assessImageQuality(uri);
            setImageQualities(prev => ({
              ...prev,
              [uri]: quality
            }));
          } catch (error) {
            console.error('Error assessing image quality:', error);
          }
        }));
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to load images from gallery');
    }
  };

  const removeImage = (uri: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedImages(selectedImages.filter(img => img !== uri));
    
    // Remove quality assessment for this image
    const updatedQualities = { ...imageQualities };
    delete updatedQualities[uri];
    setImageQualities(updatedQualities);
  };

  const handleContinue = () => {
    if (selectedImages.length === 0) {
      Alert.alert('No Images', 'Please select at least one image to continue');
      return;
    }
    
    // Check if there are any poor quality images
    const poorQualityImages = selectedImages.filter(uri => 
      imageQualities[uri] && imageQualities[uri].score < 60
    );
    
    if (poorQualityImages.length > 0) {
      Alert.alert(
        'Poor Quality Images',
        `${poorQualityImages.length} image(s) appear to be of low quality. This may affect analysis accuracy. Would you like to continue anyway?`,
        [
          {
            text: 'Review Images',
            style: 'cancel',
          },
          {
            text: 'Continue Anyway',
            onPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onImagesSelected(selectedImages);
            },
          },
        ]
      );
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onImagesSelected(selectedImages);
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return Colors.light.success;
    if (score >= 60) return Colors.light.warning;
    return Colors.light.error;
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Upload Blood Smear Images
        </ThemedText>
        <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={Colors.light.secondary} />
        </TouchableOpacity>
      </View>
      
      <ThemedText lightColor="secondary" style={styles.description}>
        Select high-quality {sampleType.toLowerCase()} images for analysis. Multiple images can be analyzed in a batch.
      </ThemedText>
      
      <View style={styles.uploadContainer}>
        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={pickImages}
        >
          <Ionicons name="cloud-upload-outline" size={36} color={Colors.light.primary} />
          <ThemedText type="defaultSemiBold" lightColor="primary" style={styles.uploadButtonText}>
            Select Images from Gallery
          </ThemedText>
          <ThemedText lightColor="secondary" style={styles.uploadHint}>
            Tap to select one or more images
          </ThemedText>
        </TouchableOpacity>
      </View>
      
      {isProcessing && (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <ThemedText style={styles.processingText}>
            Analyzing image quality...
          </ThemedText>
        </View>
      )}
      
      {selectedImages.length > 0 && !isProcessing && (
        <>
          <View style={styles.selectedImagesHeader}>
            <ThemedText type="defaultSemiBold">
              Selected Images ({selectedImages.length})
            </ThemedText>
            {selectedImages.length > 1 && (
              <TouchableOpacity
                onPress={() => setSelectedImages([])}
              >
                <ThemedText type="default" lightColor="error">
                  Clear All
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
          
          <FlatList
            data={selectedImages}
            keyExtractor={(item) => item}
            horizontal={false}
            numColumns={2}
            renderItem={({ item }) => (
              <View style={styles.imageContainer}>
                <Image source={{ uri: item }} style={styles.image} />
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removeImage(item)}
                >
                  <Ionicons name="close-circle" size={24} color={Colors.light.error} />
                </TouchableOpacity>
                
                {imageQualities[item] && (
                  <View style={[
                    styles.qualityBadge,
                    { backgroundColor: getQualityColor(imageQualities[item].score) + '20' }
                  ]}>
                    <ThemedText style={[
                      styles.qualityText,
                      { color: getQualityColor(imageQualities[item].score) }
                    ]}>
                      {imageQualities[item].score}% Quality
                    </ThemedText>
                  </View>
                )}
              </View>
            )}
            contentContainerStyle={styles.imageList}
          />
        </>
      )}
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
        >
          <ThemedText style={styles.cancelButtonText}>
            Cancel
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.continueButton,
            (selectedImages.length === 0 || isProcessing) && styles.disabledButton
          ]}
          onPress={handleContinue}
          disabled={selectedImages.length === 0 || isProcessing}
        >
          <ThemedText style={styles.continueButtonText}>
            Proceed to Analysis
          </ThemedText>
        </TouchableOpacity>
      </View>
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
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
  },
  closeButton: {
    padding: 4,
  },
  description: {
    marginBottom: 24,
  },
  uploadContainer: {
    marginBottom: 24,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: Colors.light.primary + '50',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary + '10',
  },
  uploadButtonText: {
    marginTop: 12,
    marginBottom: 4,
  },
  uploadHint: {
    fontSize: 14,
  },
  selectedImagesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  imageList: {
    paddingBottom: 12,
  },
  imageContainer: {
    width: '48%',
    marginBottom: 12,
    marginHorizontal: '1%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#fff',
    borderRadius: 15,
  },
  qualityBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  qualityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  processingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  processingText: {
    marginTop: 12,
    color: Colors.light.secondary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: 20,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    marginRight: 8,
  },
  cancelButtonText: {
    fontWeight: '500',
  },
  continueButton: {
    flex: 2,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  continueButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: Colors.light.primaryDark,
    opacity: 0.7,
  },
});