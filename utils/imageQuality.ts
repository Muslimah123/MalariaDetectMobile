// utils/imageQuality.ts
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

// Interface for image quality assessment result
export interface ImageQualityResult {
  score: number;
  issues: string[];
}

/**
 * Assesses the quality of a blood smear image
 * @param uri URI of the image to assess
 * @returns Quality assessment result with score and issues
 */
export const assessImageQuality = async (uri: string): Promise<ImageQualityResult> => {
  try {
    const issues: string[] = [];
    let qualityScore = 100; // Start with perfect score and subtract for issues
    
    // Check image file size
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (fileInfo.exists && fileInfo.size) {
      const fileSizeMB = fileInfo.size / (1024 * 1024);
      if (fileSizeMB < 0.2) {
        issues.push('Low resolution image');
        qualityScore -= 30;
      }
    }
    
    // Resize image for faster processing
    const resizedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 600 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    // Convert to base64 for analysis
    const base64 = await FileSystem.readAsStringAsync(resizedImage.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Check brightness
    const brightnessScore = await assessBrightness(base64);
    if (brightnessScore < 0.3) {
      issues.push('Image too dark');
      qualityScore -= 20;
    } else if (brightnessScore > 0.8) {
      issues.push('Image too bright');
      qualityScore -= 20;
    }
    
    // Check for blur (this is a simplified implementation)
    const blurScore = assessBlur(base64);
    if (blurScore < 0.4) {
      issues.push('Image appears blurry');
      qualityScore -= 30;
    }
    
    // Check for good microscope field view
    // In a real implementation, you would use more sophisticated techniques
    // to detect if the field view is appropriate for analysis
    
    // Ensure score is within 0-100 range
    qualityScore = Math.max(0, Math.min(100, qualityScore));
    
    return {
      score: qualityScore,
      issues
    };
  } catch (error) {
    console.error('Error assessing image quality:', error);
    return {
      score: 50, // Default medium score when assessment fails
      issues: ['Error assessing image quality']
    };
  }
};

// Simplified brightness assessment (would be more sophisticated in real implementation)
const assessBrightness = async (base64Image: string): Promise<number> => {
  // In a real implementation, this would analyze pixel brightness distribution
  // Here we just return a fixed value for demonstration
  return 0.6; // Medium brightness
};

// Simplified blur assessment (would be more sophisticated in real implementation)
const assessBlur = (base64Image: string): number => {
  // In a real implementation, this would analyze image edge sharpness
  // For example, using Laplacian variance or other methods
  // Here we just return a fixed value for demonstration
  return 0.7; // Relatively sharp
};