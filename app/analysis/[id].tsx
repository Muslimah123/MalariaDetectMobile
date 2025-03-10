import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  ActivityIndicator,
  Platform,
  Share
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// Components
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { Collapsible } from '../../components/Collapsible';

// Constants
import { Colors } from '../../constants/Colors';
import { mockSampleDetails, mockAnalysisResults } from '../../constants/MockData';

const { width, height } = Dimensions.get('window');

// Mock parasite detection data
const MOCK_PARASITES = [
  { id: 1, x: 35, y: 45, size: 20, type: 'trophozoite', confidence: 92 },
  { id: 2, x: 65, y: 32, size: 22, type: 'trophozoite', confidence: 88 },
  { id: 3, x: 78, y: 68, size: 18, type: 'trophozoite', confidence: 94 },
  { id: 4, x: 25, y: 72, size: 19, type: 'trophozoite', confidence: 91 },
];

interface AnalysisStage {
  id: string;
  name: string;
  description: string;
  duration: number;
  completed: boolean;
}

interface ParasiteMarker {
  id: number;
  x: number; // percentage position
  y: number; // percentage position
  size: number;
  type: string;
  confidence: number;
}

interface AnalysisResult {
  confidence: number;
  parasitesDetected: boolean;
  parasiteCount: number;
  parasiteDensity?: string;
  parasiteType?: string;
  stage?: string;
  severity?: string;
}

// Patient Report Dialog Component
const PatientReportDialog = ({ 
  visible, 
  onClose, 
  patientName, 
  patientId, 
  sampleId, 
  analysisResult,
  onGenerate
}: { 
  visible: boolean, 
  onClose: () => void, 
  patientName: string,
  patientId: string,
  sampleId: string,
  analysisResult: any,
  onGenerate: () => void
}) => {
  const [includeImages, setIncludeImages] = useState(true);
  const [includeMetrics, setIncludeMetrics] = useState(true);
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const reportOpacity = useRef(new Animated.Value(0)).current;
  const reportScale = useRef(new Animated.Value(0.9)).current;
  
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(reportOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.spring(reportScale, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true
        })
      ]).start();
    } else {
      Animated.timing(reportOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start();
    }
  }, [visible]);
  
  const handleGenerateReport = () => {
    setIsGenerating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      onGenerate();
      onClose();
    }, 1500);
  };

  if (!visible) return null;
  
  return (
    <View style={styles.dialogOverlay}>
      <TouchableOpacity 
        style={styles.dialogBackdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      
      <Animated.View 
        style={[
          styles.dialogContainer,
          {
            opacity: reportOpacity,
            transform: [{ scale: reportScale }]
          }
        ]}
      >
        <View style={styles.dialogHeader}>
          <ThemedText type="defaultSemiBold" style={[styles.dialogTitle, { fontSize: 18 }]}>
            Generate Patient Report
          </ThemedText>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.light.secondary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.dialogContent}>
          <View style={styles.patientInfoBox}>
            <ThemedText type="defaultSemiBold">{patientName}</ThemedText>
            <ThemedText type="subtitle" lightColor="secondary">Patient ID: {patientId}</ThemedText>
            <ThemedText type="subtitle" lightColor="secondary">Sample: {sampleId}</ThemedText>
            <ThemedText type="subtitle" lightColor="secondary">
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </ThemedText>
          </View>
          
          <View style={styles.reportOptionsContainer}>
            <ThemedText type="defaultSemiBold" style={styles.optionsTitle}>
              Report Contents
            </ThemedText>
            
            <TouchableOpacity 
              style={styles.optionRow}
              onPress={() => setIncludeImages(!includeImages)}
            >
              <View style={[
                styles.checkbox,
                includeImages && styles.checkboxChecked
              ]}>
                {includeImages && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
              <ThemedText>Include Sample Images</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.optionRow}
              onPress={() => setIncludeMetrics(!includeMetrics)}
            >
              <View style={[
                styles.checkbox,
                includeMetrics && styles.checkboxChecked
              ]}>
                {includeMetrics && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
              <ThemedText>Include Detailed Metrics</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.optionRow}
              onPress={() => setIncludeRecommendations(!includeRecommendations)}
            >
              <View style={[
                styles.checkbox,
                includeRecommendations && styles.checkboxChecked
              ]}>
                {includeRecommendations && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
              <ThemedText>Include Treatment Recommendations</ThemedText>
            </TouchableOpacity>
          </View>
          
          <View style={styles.reportTypeSelector}>
            <ThemedText type="defaultSemiBold" style={styles.optionsTitle}>
              Report Format
            </ThemedText>
            
            <View style={styles.reportFormatOptions}>
              <TouchableOpacity style={[
                styles.formatOption,
                styles.formatOptionActive
              ]}>
                <MaterialCommunityIcons name="file-pdf-box" size={22} color={Colors.light.primary} style={styles.formatIcon} />
                <ThemedText style={styles.formatOptionText}>PDF</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.formatOption}>
                <MaterialCommunityIcons name="microsoft-excel" size={22} color={Colors.light.secondary} style={styles.formatIcon} />
                <ThemedText lightColor="secondary" darkColor="secondary" style={styles.formatOptionText}>Excel</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.formatOption}>
                <Ionicons name="print-outline" size={22} color={Colors.light.secondary} style={styles.formatIcon} />
                <ThemedText lightColor="secondary" darkColor="secondary" style={styles.formatOptionText}>Print</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <View style={styles.dialogFooter}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
          >
            <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGenerateReport}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="document-text-outline" size={18} color="#fff" style={styles.generateButtonIcon} />
                <ThemedText style={styles.generateButtonText}>Generate</ThemedText>
              </>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

export default function AnalysisScreen() {
  const params = useLocalSearchParams<{ id: string, imageUri: string }>();
  const { id, imageUri } = params;
  const insets = useSafeAreaInsets();
  
  const [sampleInfo, setSampleInfo] = useState<any>(null);
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [analysisStages, setAnalysisStages] = useState<AnalysisStage[]>([
    { id: 'preprocessing', name: 'Preprocessing Image', description: 'Enhancing image quality', duration: 2000, completed: false },
    { id: 'detection', name: 'Detecting Cells', description: 'Identifying blood cells', duration: 3000, completed: false },
    { id: 'parasite', name: 'Locating Parasites', description: 'Searching for malaria parasites', duration: 4000, completed: false },
    { id: 'classification', name: 'Classification', description: 'Determining parasite type and stage', duration: 2000, completed: false },
    { id: 'validation', name: 'Validating Results', description: 'Computing confidence scores', duration: 1500, completed: false },
  ]);
  const [analysisCompleted, setAnalysisCompleted] = useState<boolean>(false);
  const [firstPassResult, setFirstPassResult] = useState<AnalysisResult | null>(null);
  const [fullAnalysisResult, setFullAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showFullAnalysis, setShowFullAnalysis] = useState<boolean>(false);
  const [parasiteMarkers, setParasiteMarkers] = useState<ParasiteMarker[]>([]);
  const [selectedParasite, setSelectedParasite] = useState<ParasiteMarker | null>(null);
  const [comparisonMode, setComparisonMode] = useState<boolean>(false);
  const [processingFullAnalysis, setProcessingFullAnalysis] = useState<boolean>(false);
  
  // Add these state variables for the patient report
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  
  // Animation values
  const progressWidth = useRef(new Animated.Value(0)).current;
  const stageOpacity = useRef(new Animated.Value(1)).current;
  const resultOpacity = useRef(new Animated.Value(0)).current;
  const imageScale = useRef(new Animated.Value(1)).current;
  const markersOpacity = useRef(new Animated.Value(0)).current;
  const fullAnalysisOpacity = useRef(new Animated.Value(0)).current;
  const comparisonTranslateX = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Get sample info
    const sample = mockSampleDetails.samples.find(s => s.id === id);
    if (sample) {
      setSampleInfo(sample);
    }
    
    // Start analysis process animation
    startAnalysisProcess();
    
    return () => {
      // Clean up any resources
    };
  }, [id]);
  
  // Analysis process animation
  const startAnalysisProcess = () => {
    // Update progress for each stage sequentially
    const totalDuration = analysisStages.reduce((acc, stage) => acc + stage.duration, 0);
    let elapsedDuration = 0;
    
    analysisStages.forEach((stage, index) => {
      const stageDuration = stage.duration;
      const startDelay = elapsedDuration;
      elapsedDuration += stageDuration;
      
      // Calculate progress percentage for this stage
      const startProgress = startDelay / totalDuration;
      const endProgress = elapsedDuration / totalDuration;
      
      // Animate progress bar
      setTimeout(() => {
        setCurrentStage(index);
        
        Animated.timing(progressWidth, {
          toValue: endProgress,
          duration: stageDuration,
          useNativeDriver: false,
        }).start();
        
        // Stage name fade transition
        Animated.sequence([
          Animated.timing(stageOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(stageOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }, startDelay);
      
      // Mark stage as completed
      setTimeout(() => {
        setAnalysisStages(prev => {
          const updated = [...prev];
          updated[index].completed = true;
          return updated;
        });
        
        // When all stages complete
        if (index === analysisStages.length - 1) {
          completeAnalysis();
        }
      }, startDelay + stageDuration);
    });
  };
  
  // Complete analysis and show results
  const completeAnalysis = () => {
    // Add a small delay before showing results
    setTimeout(() => {
      setAnalysisCompleted(true);
      setFirstPassResult(mockAnalysisResults.firstPass);
      setParasiteMarkers(MOCK_PARASITES);
      
      // Animate result appearance
      Animated.parallel([
        Animated.timing(resultOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(markersOpacity, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Provide haptic feedback
      Haptics.notificationAsync(
        firstPassResult?.parasitesDetected
          ? Haptics.NotificationFeedbackType.Warning
          : Haptics.NotificationFeedbackType.Success
      );
    }, 500);
  };
  
  // Request full analysis
  const requestFullAnalysis = () => {
    setProcessingFullAnalysis(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Simulate API call for full analysis
    setTimeout(() => {
      setFullAnalysisResult(mockAnalysisResults.fullAnalysis);
      setShowFullAnalysis(true);
      setProcessingFullAnalysis(false);
      
      // Animate transition to full analysis
      Animated.timing(fullAnalysisOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
      
      // Provide haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 3000);
  };
  
  // Toggle comparison mode
  const toggleComparisonMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (!comparisonMode) {
      // Animate into comparison mode
      Animated.spring(comparisonTranslateX, {
        toValue: -width / 2,
        useNativeDriver: true,
      }).start();
    } else {
      // Animate back from comparison mode
      Animated.spring(comparisonTranslateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
    
    setComparisonMode(!comparisonMode);
  };
  
  // Handle parasite marker tap
  const handleParasiteTap = (parasite: ParasiteMarker) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedParasite(parasite);
    
    // Zoom animation to focus on selected parasite
    Animated.sequence([
      Animated.timing(imageScale, {
        toValue: 1.5,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(imageScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  // Close parasite details
  const closeParasiteDetails = () => {
    setSelectedParasite(null);
  };
  
  // Save and share results
  const saveAndShareResults = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // In a real app, this would save to the database and share with relevant parties
    alert('Results saved to patient record and shared with physician');
  };
  
  // Patient report functions
  const handleGeneratePatientReport = () => {
    setShowReportDialog(true);
  };
  
  const handleReportGenerated = () => {
    setReportGenerated(true);
    
    // Simulate sharing the report
    setTimeout(() => {
      Share.share({
        title: `Malaria Analysis Report - ${sampleInfo?.patientName}`,
        message: `Malaria analysis report for ${sampleInfo?.patientName} (Sample ID: ${id}) is ready. ${fullAnalysisResult?.parasitesDetected ? 'Malaria detected: ' + fullAnalysisResult?.parasiteType + ' with ' + fullAnalysisResult?.parasiteDensity + ' parasitemia.' : 'No malaria parasites detected.'}`,
        url: 'https://example.com/reports/12345.pdf'
      });
    }, 500);
  };
  
  // Render patient report button
  const renderPatientReportButton = () => {
    if (!analysisCompleted) return null;
    
    return (
      <TouchableOpacity
        style={styles.patientReportButton}
        onPress={handleGeneratePatientReport}
      >
        <Ionicons name="document-text-outline" size={20} color={Colors.light.primary} style={styles.reportButtonIcon} />
        <View style={styles.reportButtonContent}>
          <ThemedText type="defaultSemiBold" lightColor="primary" darkColor="primary" style={styles.reportButtonText}>
            Generate Patient Report
          </ThemedText>
          <ThemedText lightColor="secondary" darkColor="secondary">
            For physician review & patient records
          </ThemedText>
        </View>
        {reportGenerated && (
          <View style={styles.reportGeneratedBadge}>
            <Ionicons name="checkmark" size={12} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  // Render progress indicator during analysis
  const renderProgressIndicator = () => {
    const currentStageName = analysisStages[currentStage]?.name || '';
    const currentStageDescription = analysisStages[currentStage]?.description || '';
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <MaterialCommunityIcons name="microscope" size={24} color={Colors.light.primary} />
          <ThemedText type="defaultSemiBold" style={[styles.progressTitle, { fontSize: 18 }]}>
            Analyzing Sample
          </ThemedText>
        </View>
        
        <Animated.View style={styles.stageContainer}>
          <Animated.Text style={[styles.stageName, { opacity: stageOpacity }]}>
            {currentStageName}
          </Animated.Text>
          <Animated.Text style={[styles.stageDescription, { opacity: stageOpacity }]}>
            {currentStageDescription}
          </Animated.Text>
        </Animated.View>
        
        <View style={styles.progressBarContainer}>
          <Animated.View 
            style={[
              styles.progressBar,
              { width: progressWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%']
              })}
            ]}
          />
        </View>
        
        <View style={styles.stagesStatus}>
          {analysisStages.map((stage, index) => (
            <View key={stage.id} style={styles.stageStatus}>
              <View style={[
                styles.stageIndicator,
                index < currentStage ? styles.completedStage : 
                index === currentStage ? styles.activeStage :
                styles.pendingStage
              ]}>
                {index < currentStage && (
                  <Ionicons name="checkmark" size={12} color="#fff" />
                )}
              </View>
              <ThemedText style={[
                styles.stageLabel,
                index === currentStage && styles.activeStageLabel
              ]}>
                {stage.name}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>
    );
  };
  
  // Render first-pass analysis results
  const renderFirstPassResults = () => {
    if (!firstPassResult) return null;
    
    return (
      <Animated.View style={[styles.resultsContainer, { opacity: resultOpacity }]}>
        <View style={styles.resultHeader}>
          <View>
            <ThemedText type="defaultSemiBold" style={[styles.resultTitle, { fontSize: 18 }]}>
              Analysis Results
            </ThemedText>
            <ThemedText lightColor="secondary" style={styles.resultSubtitle}>
              First-pass analysis
            </ThemedText>
          </View>
          
          <View style={[
            styles.confidenceBadge,
            { backgroundColor: getConfidenceColor(firstPassResult.confidence, 0.2) }
          ]}>
            <ThemedText style={[
              styles.confidenceText,
              { color: getConfidenceColor(firstPassResult.confidence) }
            ]}>
              {firstPassResult.confidence}% Confidence
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.resultContent}>
          <View style={[
            styles.diagnosisBadge,
            {
              backgroundColor: firstPassResult.parasitesDetected 
                ? Colors.light.errorLight 
                : Colors.light.successLight
            }
          ]}>
            <MaterialCommunityIcons 
              name={firstPassResult.parasitesDetected ? "virus" : "check-circle"} 
              size={18} 
              color={firstPassResult.parasitesDetected ? Colors.light.error : Colors.light.success} 
              style={styles.diagnosisIcon}
            />
            <ThemedText 
              type="defaultSemiBold"
              style={[
                styles.diagnosisText,
                { 
                  color: firstPassResult.parasitesDetected 
                    ? Colors.light.error 
                    : Colors.light.success
                }
              ]}
            >
              {firstPassResult.parasitesDetected 
                ? 'Malaria Parasites Detected' 
                : 'No Parasites Detected'}
            </ThemedText>
          </View>
          
          {firstPassResult.parasitesDetected && (
            <View style={styles.metricsContainer}>
              <View style={styles.metricItem}>
                <ThemedText type="subtitle" lightColor="secondary" style={styles.metricLabel}>
                  Estimated Count
                </ThemedText>
                <ThemedText type="defaultSemiBold" style={[styles.metricValue, { fontSize: 20 }]}>
                  {firstPassResult.parasiteCount}
                </ThemedText>
                <ThemedText type="subtitle" lightColor="secondary" style={styles.metricUnit}>
                  parasites detected
                </ThemedText>
              </View>
              
              {firstPassResult.stage && (
                <View style={styles.metricItem}>
                  <ThemedText type="subtitle" lightColor="secondary" style={styles.metricLabel}>
                    Life Cycle Stage
                  </ThemedText>
                  <ThemedText type="defaultSemiBold" style={[styles.metricValue, { fontSize: 20 }]}>
                    {firstPassResult.stage}
                  </ThemedText>
                  <ThemedText type="subtitle" lightColor="secondary" style={styles.metricUnit}>
                    predominant form
                  </ThemedText>
                </View>
              )}
            </View>
          )}
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={toggleComparisonMode}
            >
              <Ionicons name="grid-outline" size={18} color={Colors.light.primary} style={styles.actionButtonIcon} />
              <ThemedText style={styles.secondaryButtonText}>
                {comparisonMode ? 'Exit Comparison' : 'Side-by-Side View'}
              </ThemedText>
            </TouchableOpacity>
            
            {firstPassResult.parasitesDetected && !showFullAnalysis && (
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={requestFullAnalysis}
                disabled={processingFullAnalysis}
              >
                {processingFullAnalysis ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="microscope" size={18} color="#fff" style={styles.actionButtonIcon} />
                    <ThemedText style={styles.primaryButtonText}>
                      Request Full Analysis
                    </ThemedText>
                  </>
                )}
              </TouchableOpacity>
            )}
            
            {showFullAnalysis && (
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={saveAndShareResults}
              >
                <Ionicons name="save-outline" size={18} color="#fff" style={styles.actionButtonIcon} />
                <ThemedText style={styles.primaryButtonText}>
                  Save & Share Results
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Animated.View>
    );
  };
  
  // Render full analysis results
  const renderFullAnalysisResults = () => {
    if (!fullAnalysisResult || !showFullAnalysis) return null;
    
    return (
      <Animated.View style={[styles.fullAnalysisContainer, { opacity: fullAnalysisOpacity }]}>
        <View style={styles.resultHeader}>
          <View>
            <ThemedText type="defaultSemiBold" style={[styles.resultTitle, { fontSize: 18 }]}>
              Full Analysis Results
            </ThemedText>
            <ThemedText lightColor="secondary" style={styles.resultSubtitle}>
              Comprehensive evaluation
            </ThemedText>
          </View>
          
          <View style={[
            styles.confidenceBadge,
            { backgroundColor: getConfidenceColor(fullAnalysisResult.confidence, 0.2) }
          ]}>
            <ThemedText style={[
              styles.confidenceText,
              { color: getConfidenceColor(fullAnalysisResult.confidence) }
            ]}>
              {fullAnalysisResult.confidence}% Confidence
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.fullAnalysisContent}>
          <View style={styles.diagnosticRow}>
            <View style={styles.diagItemLeft}>
              <ThemedText lightColor="secondary" style={styles.diagLabel}>
                Parasite Species
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.diagValue}>
                {fullAnalysisResult.parasiteType}
              </ThemedText>
            </View>
            
            <View style={styles.diagItemRight}>
              <ThemedText lightColor="secondary" style={styles.diagLabel}>
                Parasite Density
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.diagValue}>
                {fullAnalysisResult.parasiteDensity}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.diagnosticRow}>
            <View style={styles.diagItemLeft}>
              <ThemedText lightColor="secondary" style={styles.diagLabel}>
                Life Cycle Stage
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.diagValue}>
                {fullAnalysisResult.stage}
              </ThemedText>
            </View>
            
            <View style={styles.diagItemRight}>
              <ThemedText lightColor="secondary" style={styles.diagLabel}>
                Severity
              </ThemedText>
              <View style={[
                styles.severityBadge,
                { backgroundColor: getSeverityColor(fullAnalysisResult.severity || '', 0.2) }
              ]}>
                <ThemedText type="defaultSemiBold" style={[
                  styles.severityText,
                  { color: getSeverityColor(fullAnalysisResult.severity || '') }
                ]}>
                  {fullAnalysisResult.severity}
                </ThemedText>
              </View>
            </View>
          </View>
          
          <View style={styles.countContainer}>
            <View style={styles.countBadge}>
              <ThemedText type="subtitle" lightColor="secondary">Parasite Count</ThemedText>
              <ThemedText type="defaultSemiBold" style={{ fontSize: 24 }}>
                {fullAnalysisResult.parasiteCount}
              </ThemedText>
              <ThemedText type="subtitle" lightColor="secondary">detected parasites</ThemedText>
            </View>
            
            <ThemedText type="subtitle" lightColor="secondary" style={styles.additionalInfo}>
              Full analysis confirms the presence of {fullAnalysisResult.parasiteType} with 
              {fullAnalysisResult.parasiteDensity} parasitemia. Treatment is recommended 
              according to local guidelines for {fullAnalysisResult.severity?.toLowerCase()} 
              malaria.
            </ThemedText>
          </View>
        </View>
      </Animated.View>
    );
  };
  
  // Render the image with parasite markers
  const renderAnalysisImage = () => {
    return (
      <View style={styles.imageContainer}>
        <Animated.View style={[
          styles.imageWrapper,
          {
            transform: [
              { scale: imageScale },
              { translateX: comparisonTranslateX }
            ]
          }
        ]}>
          <Image
            source={{ uri: imageUri || 'https://via.placeholder.com/400x300' }}
            style={styles.analysisImage}
            resizeMode="contain"
          />
          
          {/* Parasite markers */}
          {analysisCompleted && (
            <Animated.View style={[styles.markersLayer, { opacity: markersOpacity }]}>
              {parasiteMarkers.map((marker) => (
                <TouchableOpacity
                  key={marker.id}
                  style={[
                    styles.markerDot,
                    {
                      left: `${marker.x}%`,
                      top: `${marker.y}%`,
                      width: marker.size,
                      height: marker.size,
                      borderRadius: marker.size / 2,
                      borderColor: selectedParasite?.id === marker.id ? Colors.light.primary : 'rgba(255, 255, 255, 0.8)',
                      borderWidth: selectedParasite?.id === marker.id ? 2 : 1,
                    }
                  ]}
                  onPress={() => handleParasiteTap(marker)}
                >
                  <View style={[
                    styles.markerInner,
                    { 
                      backgroundColor: getConfidenceColor(marker.confidence),
                      width: marker.size - 4,
                      height: marker.size - 4,
                      borderRadius: (marker.size - 4) / 2,
                    }
                  ]} />
                </TouchableOpacity>
              ))}
            </Animated.View>
          )}
        </Animated.View>
        
        {/* Comparison mode - Enhanced view */}
        {comparisonMode && (
          <Animated.View style={[
            styles.imageWrapper,
            styles.enhancedImageWrapper,
            {
              transform: [
                { scale: imageScale },
                { translateX: comparisonTranslateX.interpolate({
                  inputRange: [-width / 2, 0],
                  outputRange: [width / 2, 0],
                  extrapolate: 'clamp'
                }) }
              ]
            }
          ]}>
            <Image
              source={{ uri: imageUri || 'https://via.placeholder.com/400x300' }}
              style={[styles.analysisImage, styles.enhancedImage]}
              resizeMode="contain"
            />
            
            {/* Enhanced view markers */}
            {analysisCompleted && (
              <View style={styles.markersLayer}>
                {parasiteMarkers.map((marker) => (
                  <View
                    key={`enhanced-${marker.id}`}
                    style={[
                      styles.enhancedMarker,
                      {
                        left: `${marker.x}%`,
                        top: `${marker.y}%`,
                      }
                    ]}
                  >
                    <View style={styles.enhancedMarkerOutline} />
                    <View style={styles.enhancedMarkerInner} />
                    <View style={styles.enhancedMarkerLabel}>
                      <ThemedText style={[styles.enhancedMarkerText, { fontSize: 10 }]}>
                        {marker.type}
                      </ThemedText>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>
        )}
        
        {/* Comparison mode overlay */}
        {comparisonMode && (
          <View style={styles.comparisonOverlay}>
            <View style={styles.comparisonLabel}>
              <ThemedText style={[styles.comparisonLabelText, { fontSize: 12 }]}>Original</ThemedText>
            </View>
            <View style={styles.comparisonDivider} />
            <View style={styles.comparisonLabel}>
              <ThemedText style={[styles.comparisonLabelText, { fontSize: 12 }]}>Enhanced</ThemedText>
            </View>
          </View>
        )}
        
        {/* Selected parasite details */}
        {selectedParasite && (
          <BlurView intensity={80} tint="dark" style={styles.parasiteDetails}>
            <View style={styles.parasiteDetailsHeader}>
              <ThemedText type="defaultSemiBold" style={styles.parasiteDetailsTitle}>
                Parasite #{selectedParasite.id}
              </ThemedText>
              <TouchableOpacity onPress={closeParasiteDetails}>
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.parasiteDetailsContent}>
              <View style={styles.parasiteDetailItem}>
                <ThemedText style={[styles.parasiteDetailLabel, { fontSize: 14 }]}>Type</ThemedText>
                <ThemedText style={styles.parasiteDetailValue}>{selectedParasite.type}</ThemedText>
              </View>
              
              <View style={styles.parasiteDetailItem}>
                <ThemedText style={[styles.parasiteDetailLabel, { fontSize: 14 }]}>Confidence</ThemedText>
                <ThemedText style={styles.parasiteDetailValue}>{selectedParasite.confidence}%</ThemedText>
              </View>
              
              <View style={styles.parasiteDetailItem}>
                <ThemedText style={[styles.parasiteDetailLabel, { fontSize: 12 }]}>Position</ThemedText>
                <ThemedText style={styles.parasiteDetailValue}>
                  X: {selectedParasite.x}%, Y: {selectedParasite.y}%
                </ThemedText>
              </View>
            </View>
          </BlurView>
        )}
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{
          headerTitle: `Analysis: ${id}`,
          headerTransparent: true,
          headerTintColor: Colors.light.text, 
          headerBackVisible: true,
          headerStyle: {
            backgroundColor: 'transparent'
          }
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 60 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Sample information */}
        {sampleInfo && (
          <View style={styles.sampleContainer}>
            <ThemedText type="default" style={[styles.sampleTitle, { fontSize: 16 }]}>
              Sample {sampleInfo.id}
            </ThemedText>
            <ThemedText type="subtitle" lightColor="secondary">
              {sampleInfo.patientName} | {sampleInfo.sampleType}
            </ThemedText>
          </View>
        )}
        
        {/* Analysis image with markers */}
        {renderAnalysisImage()}
        
        {/* Analysis progress or results */}
        {!analysisCompleted ? (
          renderProgressIndicator()
        ) : (
          <>
            {renderFirstPassResults()}
            {renderFullAnalysisResults()}
            {renderPatientReportButton()}
          </>
        )}
      </ScrollView>
      
      {/* Patient Report Dialog */}
      <PatientReportDialog
        visible={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        patientName={sampleInfo?.patientName || ''}
        patientId={sampleInfo?.patientId || ''}
        sampleId={id || ''}
        analysisResult={fullAnalysisResult || firstPassResult}
        onGenerate={handleReportGenerated}
      />
    </ThemedView>
  );
}

// Helper function to get color based on confidence score
const getConfidenceColor = (score: number, alpha: number = 1) => {
  if (score >= 90) {
    return alpha < 1 ? `rgba(46, 204, 113, ${alpha})` : '#2ecc71'; // green
  } else if (score >= 70) {
    return alpha < 1 ? `rgba(52, 152, 219, ${alpha})` : '#3498db'; // blue
  } else if (score >= 50) {
    return alpha < 1 ? `rgba(243, 156, 18, ${alpha})` : '#f39c12'; // orange
  } else {
    return alpha < 1 ? `rgba(231, 76, 60, ${alpha})` : '#e74c3c'; // red
  }
};

// Helper function to get color based on severity
const getSeverityColor = (severity: string, alpha: number = 1) => {
  switch(severity.toLowerCase()) {
    case 'mild':
      return alpha < 1 ? `rgba(46, 204, 113, ${alpha})` : '#2ecc71'; // green
    case 'moderate':
      return alpha < 1 ? `rgba(243, 156, 18, ${alpha})` : '#f39c12'; // orange
    case 'severe':
      return alpha < 1 ? `rgba(231, 76, 60, ${alpha})` : '#e74c3c'; // red
    default:
      return alpha < 1 ? `rgba(52, 152, 219, ${alpha})` : '#3498db'; // blue
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  sampleContainer: {
    marginBottom: 16,
  },
  sampleTitle: {
    marginBottom: 4,
  },
  imageContainer: {
    height: 280,
    backgroundColor: '#000',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  imageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  enhancedImageWrapper: {
    left: '100%',
  },
  analysisImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  enhancedImage: {
    // Apply filter or processing effect here
    tintColor: 'rgba(52, 152, 219, 0.2)'
  },
  markersLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  markerDot: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  markerInner: {
    borderRadius: 10,
  },
  enhancedMarker: {
    position: 'absolute',
    width: 30,
    height: 30,
    marginLeft: -15,
    marginTop: -15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  enhancedMarkerOutline: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(46, 204, 113, 0.8)',
    borderStyle: 'dashed',
  },
  enhancedMarkerInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(46, 204, 113, 1)',
  },
  enhancedMarkerLabel: {
    position: 'absolute',
    top: 35,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  enhancedMarkerText: {
    color: '#fff',
    fontSize: 10,
  },
  comparisonOverlay: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  comparisonLabel: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonLabelText: {
    color: '#fff',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  comparisonDivider: {
    height: 20,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  parasiteDetails: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  parasiteDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  parasiteDetailsTitle: {
    color: '#fff',
    fontSize: 16,
  },
  parasiteDetailsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  parasiteDetailItem: {
    flex: 1,
  },
  parasiteDetailLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  parasiteDetailValue: {
    color: '#fff',
    fontWeight: '500',
  },
  progressContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    marginLeft: 8,
  },
  stageContainer: {
    marginBottom: 16,
    height: 48,
  },
  stageName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  stageDescription: {
    fontSize: 14,
    color: Colors.light.secondary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(226, 232, 240, 0.8)',
    borderRadius: 4,
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 4,
  },
  stagesStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stageStatus: {
    alignItems: 'center',
    width: 60,
  },
  stageIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  completedStage: {
    backgroundColor: Colors.light.primary,
  },
  activeStage: {
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  pendingStage: {
    backgroundColor: 'rgba(226, 232, 240, 0.8)',
  },
  stageLabel: {
    fontSize: 10,
    color: Colors.light.secondary,
    textAlign: 'center',
  },
  activeStageLabel: {
    color: Colors.light.primary,
    fontWeight: '500',
  },
  resultsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  resultTitle: {
    marginBottom: 2,
  },
  resultSubtitle: {
    fontSize: 12,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontWeight: '600',
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(226, 232, 240, 0.8)',
    marginVertical: 12,
  },
  resultContent: {
    
  },
  diagnosisBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  diagnosisIcon: {
    marginRight: 8,
  },
  diagnosisText: {
    fontSize: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    marginBottom: 4,
  },
  metricValue: {
    marginBottom: 2,
  },
  metricUnit: {
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
  },
  actionButtonIcon: {
    marginRight: 6,
  },
  primaryButton: {
    backgroundColor: Colors.light.primary,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  secondaryButton: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
  },
  secondaryButtonText: {
    color: Colors.light.primary,
    fontWeight: '500',
  },
  fullAnalysisContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  fullAnalysisContent: {
    
  },
  diagnosticRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  diagItemLeft: {
    flex: 1,
    paddingRight: 8,
  },
  diagItemRight: {
    flex: 1,
    paddingLeft: 8,
  },
  diagLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  diagValue: {
    fontSize: 16,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  severityText: {
    
  },
  countContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  countBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(226, 232, 240, 0.5)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  additionalInfo: {
    textAlign: 'center',
    lineHeight: 20,
  },
  // Patient report styles
  patientReportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reportButtonIcon: {
    marginRight: 12,
  },
  reportButtonContent: {
    flex: 1,
  },
  reportButtonText: {
    marginBottom: 2,
  },
  reportGeneratedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.light.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  dialogBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dialogContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dialogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    padding: 16,
  },
  dialogTitle: {
    
  },
  dialogContent: {
    padding: 16,
  },
  patientInfoBox: {
    backgroundColor: Colors.light.secondaryLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  reportOptionsContainer: {
    marginBottom: 16,
  },
  optionsTitle: {
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.light.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  reportTypeSelector: {
    
  },
  reportFormatOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  formatOption: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginHorizontal: 4,
  },
  formatOptionActive: {
    borderColor: Colors.light.primary,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
  },
  formatIcon: {
    marginBottom: 4,
  },
  formatOptionText: {
    fontSize: 12,
  },
  dialogFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cancelButtonText: {
    color: Colors.light.text,
  },
  generateButton: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    padding: 12,
    borderRadius: 8,
  },
  generateButtonIcon: {
    marginRight: 8,
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});