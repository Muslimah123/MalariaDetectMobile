import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { LineChart } from 'recharts';

// Components
import {ThemedView} from '../../components/ThemedView';
import {ThemedText} from '../../components/ThemedText';
import { Collapsible } from '../../components/Collapsible';

// Constants
import { Colors } from '../../constants/Colors';
import { mockSampleDetails, mockAnalysisHistory } from '../../constants/MockData';

const { width, height } = Dimensions.get('window');

// Types
interface AnalysisResult {
  id: string;
  sampleId: string;
  timestamp: string;
  type: string;
  result: {
    confidenceScore: number;
    parasitesDetected: boolean;
    parasiteCount?: number;
    parasiteDensity?: string;
    parasiteType?: string;
    stage?: string;
    severityScore?: string;
  };
  imageUri: string;
}

export default function ComparisonScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const { id } = params;
  const insets = useSafeAreaInsets();
  
  const [isLoading, setIsLoading] = useState(true);
  const [sampleInfo, setSampleInfo] = useState<any>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);
  const [activeAnalyses, setActiveAnalyses] = useState<string[]>([]);
  const [comparisonMode, setComparisonMode] = useState<'image' | 'metrics'>('image');
  const [showParasiteGraph, setShowParasiteGraph] = useState(true);
  
  // Animation values
  const cardScale = useRef(new Animated.Value(0.95)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Get sample info
    const sample = mockSampleDetails.samples.find(s => s.id === id);
    if (sample) {
      setSampleInfo(sample);
    }
    
    // Get analysis history
    const history = mockAnalysisHistory.filter(a => a.sampleId === id);
    setAnalysisHistory(history);
    
    // Set initial active analyses
    // By default, select the most recent first-pass and full analyses
    const firstPass = history.find(a => a.type === 'first-pass');
    const full = history.find(a => a.type === 'full');
    
    if (firstPass && full) {
      setActiveAnalyses([firstPass.id, full.id]);
    } else if (history.length >= 2) {
      setActiveAnalyses([history[0].id, history[1].id]);
    } else if (history.length === 1) {
      setActiveAnalyses([history[0].id]);
    }
    
    // Animate in
    setTimeout(() => {
      setIsLoading(false);
      
      Animated.parallel([
        Animated.spring(cardScale, {
          toValue: 1,
          useNativeDriver: true,
          friction: 7,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, 500);
    
    return () => {
      // Clean up
    };
  }, [id]);
  
  // Toggle analysis selection
  const toggleAnalysis = (analysisId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setActiveAnalyses(prev => {
      // If already selected, remove it
      if (prev.includes(analysisId)) {
        return prev.filter(id => id !== analysisId);
      } 
      
      // If we already have 2 selected, replace the oldest one
      if (prev.length >= 2) {
        return [prev[1], analysisId];
      }
      
      // Otherwise, add it
      return [...prev, analysisId];
    });
  };
  
  // Toggle comparison mode
  const toggleComparisonMode = (mode: 'image' | 'metrics') => {
    if (mode !== comparisonMode) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setComparisonMode(mode);
    }
  };
  
  // Toggle parasite graph
  const toggleParasiteGraph = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowParasiteGraph(!showParasiteGraph);
  };
  
  // Generate comparison data for the charts
  const getComparisonData = () => {
    const activeResults = analysisHistory.filter(a => activeAnalyses.includes(a.id));
    
    return {
      confidenceScores: activeResults.map(a => ({
        id: a.id,
        type: a.type,
        value: a.result.confidenceScore,
        timestamp: a.timestamp,
        label: a.type === 'first-pass' ? 'First Analysis' : 'Full Analysis'
      })),
      parasiteCounts: activeResults
        .filter(a => a.result.parasiteCount !== undefined)
        .map(a => ({
          id: a.id,
          type: a.type,
          value: a.result.parasiteCount!,
          timestamp: a.timestamp,
          label: a.type === 'first-pass' ? 'First Analysis' : 'Full Analysis'
        })),
    };
  };
  
  // Render analysis selection cards
  const renderAnalysisCards = () => {
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.analysisCardsContainer}
      >
        {analysisHistory.map((analysis) => (
          <TouchableOpacity
            key={analysis.id}
            style={[
              styles.analysisCard,
              activeAnalyses.includes(analysis.id) && styles.activeAnalysisCard
            ]}
            onPress={() => toggleAnalysis(analysis.id)}
          >
            <View style={styles.analysisCardHeader}>
              <View style={[
                styles.analysisTypeBadge,
                { backgroundColor: analysis.type === 'first-pass' ? Colors.light.primary : Colors.light.secondary }
              ]}>
                <ThemedText style={[
                  styles.analysisTypeText,
                  { color: analysis.type === 'first-pass' ? Colors.light.info : Colors.light.primary }
                ]}>
                  {analysis.type === 'first-pass' ? 'First Pass' : 'Full Analysis'}
                </ThemedText>
              </View>
              
              {activeAnalyses.includes(analysis.id) && (
                <View style={styles.checkmarkBadge}>
                  <Ionicons name="checkmark" size={12} color="#fff" />
                </View>
              )}
            </View>
            
            <View style={styles.analysisCardThumbnail}>
              <Image
                source={{ uri: analysis.imageUri }}
                style={styles.thumbnailImage}
                resizeMode="cover"
              />
              
              {analysis.result.parasitesDetected && (
                <View style={styles.parasiteCountBadge}>
                  <MaterialCommunityIcons name="bacteria-outline" size={10} color="#fff" />
                  <ThemedText style={styles.parasiteCountText}>
                    {analysis.result.parasiteCount}
                  </ThemedText>
                </View>
              )}
            </View>
            
            <View style={styles.analysisCardFooter}>
              <ThemedText type="default" lightColor="secondary" darkColor="secondary" style={styles.analysisTimestamp}>
                {analysis.timestamp}
              </ThemedText>
              <View style={[
                styles.confidencePill,
                { backgroundColor: getConfidenceColor(analysis.result.confidenceScore, 0.2) }
              ]}>
                <ThemedText type="default" style={{ fontSize: 12, color: getConfidenceColor(analysis.result.confidenceScore) }}>
                  {analysis.result.confidenceScore}%
                </ThemedText>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };
  
  // Render image comparison
  const renderImageComparison = () => {
    const activeResults = analysisHistory.filter(a => activeAnalyses.includes(a.id));
    
    if (activeResults.length === 0) {
      return (
        <View style={styles.emptyComparisonContainer}>
          <Ionicons name="images-outline" size={50} color={Colors.light.secondary} />
          <ThemedText style={styles.emptyComparisonText}>
            Select analyses to compare
          </ThemedText>
          <ThemedText type="subtitle" lightColor="secondary" darkColor="secondary" style={styles.emptyComparisonSubtext}>
            Choose at least one analysis from the options above
          </ThemedText>
        </View>
      );
    }
    
    return (
      <View style={styles.imageComparisonContainer}>
        {activeResults.map((analysis, index) => (
          <View 
            key={analysis.id} 
            style={[
              styles.comparisonImageWrapper,
              activeResults.length === 1 ? styles.singleImageWrapper : {}
            ]}
          >
            <View style={styles.comparisonImageHeader}>
              <ThemedText type="default" style={styles.comparisonImageTitle}>
                {analysis.type === 'first-pass' ? 'First-Pass Analysis' : 'Full Analysis'}
              </ThemedText>
              <ThemedText type="subtitle" lightColor="secondary" darkColor="secondary">
                {analysis.timestamp}
              </ThemedText>
            </View>
            
            <View style={styles.comparisonImage}>
              <Image
                source={{ uri: analysis.imageUri }}
                style={styles.fullImage}
                resizeMode="contain"
              />
              
              {/* Parasite markers would go here in a real implementation */}
              {analysis.result.parasitesDetected && (
                <View style={styles.parasiteIndicator}>
                  <MaterialCommunityIcons name="bacteria-outline" size={16} color={Colors.light.error} />
                  <ThemedText type="default" style={styles.parasiteIndicatorText}>
                    {analysis.result.parasiteCount} parasites detected
                  </ThemedText>
                </View>
              )}
            </View>
            
            <View style={styles.comparisonImageFooter}>
              <View style={styles.comparisonMetric}>
                <ThemedText type="subtitle" lightColor="secondary" darkColor="secondary">Confidence</ThemedText>
                <ThemedText type="defaultSemiBold" style={{ color: getConfidenceColor(analysis.result.confidenceScore) }}>
                  {analysis.result.confidenceScore}%
                </ThemedText>
              </View>
              
              {analysis.result.parasiteType && (
                <View style={styles.comparisonMetric}>
                  <ThemedText type="subtitle" lightColor="secondary" darkColor="secondary">Type</ThemedText>
                  <ThemedText type="defaultSemiBold">{analysis.result.parasiteType}</ThemedText>
                </View>
              )}
              
              {analysis.result.stage && (
                <View style={styles.comparisonMetric}>
                  <ThemedText type="subtitle" lightColor="secondary" darkColor="secondary">Stage</ThemedText>
                  <ThemedText type="defaultSemiBold">{analysis.result.stage}</ThemedText>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };
  
  // Render metrics comparison
  const renderMetricsComparison = () => {
    const comparisonData = getComparisonData();
    const activeResults = analysisHistory.filter(a => activeAnalyses.includes(a.id));
    
    if (activeResults.length === 0) {
      return (
        <View style={styles.emptyComparisonContainer}>
          <Ionicons name="bar-chart-outline" size={50} color={Colors.light.secondary} />
          <ThemedText style={styles.emptyComparisonText}>
            Select analyses to compare
          </ThemedText>
          <ThemedText type="subtitle" lightColor="secondary" darkColor="secondary" style={styles.emptyComparisonSubtext}>
            Choose at least one analysis from the options above
          </ThemedText>
        </View>
      );
    }
    
    return (
      <View style={styles.metricsComparisonContainer}>
        {/* Confidence Score Chart */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <ThemedText type="defaultSemiBold" style={styles.chartTitle}>
              Confidence Score Comparison
            </ThemedText>
            <ThemedText type="subtitle" lightColor="secondary" darkColor="secondary" style={styles.chartSubtitle}>
              Higher is better
            </ThemedText>
          </View>
          
          <View style={styles.chart}>
            {comparisonData.confidenceScores.map((item, index) => (
              <View key={item.id} style={styles.barChartItem}>
                <View style={styles.barLabel}>
                  <ThemedText type="default" lightColor="secondary" darkColor="secondary">{item.label}</ThemedText>
                  <ThemedText type="default" lightColor="secondary" darkColor="secondary">{item.timestamp.split(' ')[1]}</ThemedText>
                </View>
                <View style={styles.barContainer}>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        width: `${item.value}%`,
                        backgroundColor: getConfidenceColor(item.value)
                      }
                    ]}
                  />
                  <ThemedText style={styles.barValue}>
                    {item.value}%
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        </View>
        
        {/* Parasite Count Chart */}
        {showParasiteGraph && comparisonData.parasiteCounts.length > 0 && (
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <ThemedText type="defaultSemiBold" style={styles.chartTitle}>
                Parasite Count Comparison
              </ThemedText>
              <TouchableOpacity onPress={toggleParasiteGraph}>
                <Ionicons name="close-outline" size={20} color={Colors.light.secondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.chart}>
              {comparisonData.parasiteCounts.map((item, index) => (
                <View key={item.id} style={styles.barChartItem}>
                  <View style={styles.barLabel}>
                    <ThemedText type="default" lightColor="secondary" darkColor="secondary">{item.label}</ThemedText>
                    <ThemedText type="default" lightColor="secondary" darkColor="secondary">{item.timestamp.split(' ')[1]}</ThemedText>
                  </View>
                  <View style={styles.barContainer}>
                    <View 
                      style={[
                        styles.bar, 
                        { 
                          width: `${Math.min((item.value / 50) * 100, 100)}%`,
                          backgroundColor: Colors.light.error
                        }
                      ]}
                    />
                    <ThemedText style={styles.barValue}>
                      {item.value}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Detailed Metrics Table */}
        <View style={styles.metricsTableContainer}>
          <ThemedText type="defaultSemiBold" style={styles.metricsTableTitle}>
            Detailed Comparison
          </ThemedText>
          
          <View style={styles.metricsTable}>
            <View style={styles.metricsTableHeader}>
              <ThemedText style={styles.metricsTableHeaderCell} />
              {activeResults.map((result) => (
                <ThemedText 
                  key={result.id} 
                  type="defaultSemiBold"
                  style={[styles.metricsTableHeaderCell, { fontSize: 12 }]}
                >
                  {result.type === 'first-pass' ? 'First Pass' : 'Full Analysis'}
                </ThemedText>
              ))}
            </View>
            
            <View style={styles.metricsTableRow}>
              <ThemedText type="subtitle" lightColor="secondary" style={styles.metricsTableCell}>
                Time
              </ThemedText>
              {activeResults.map((result) => (
                <ThemedText key={result.id} type="subtitle" style={styles.metricsTableCell}>
                  {result.timestamp.split(' ')[1]}
                </ThemedText>
              ))}
            </View>
            
            <View style={styles.metricsTableRow}>
              <ThemedText type="subtitle" lightColor="secondary" style={styles.metricsTableCell}>
                Confidence
              </ThemedText>
              {activeResults.map((result) => (
                <ThemedText
                  key={result.id}
                  type="defaultSemiBold"
                  style={[
                    styles.metricsTableCell,
                    { color: getConfidenceColor(result.result.confidenceScore), fontSize: 12 }
                  ]}
                >
                  {result.result.confidenceScore}%
                </ThemedText>
              ))}
            </View>
            
            <View style={styles.metricsTableRow}>
              <ThemedText type="subtitle" lightColor="secondary" style={styles.metricsTableCell}>
                Parasites
              </ThemedText>
              {activeResults.map((result) => (
                <ThemedText key={result.id} type="subtitle" style={styles.metricsTableCell}>
                  {result.result.parasiteCount || 'N/A'}
                </ThemedText>
              ))}
            </View>
            
            <View style={styles.metricsTableRow}>
              <ThemedText type="subtitle" lightColor="secondary" style={styles.metricsTableCell}>
                Type
              </ThemedText>
              {activeResults.map((result) => (
                <ThemedText key={result.id} type="subtitle" style={styles.metricsTableCell}>
                  {result.result.parasiteType || 'N/A'}
                </ThemedText>
              ))}
            </View>
            
            <View style={styles.metricsTableRow}>
              <ThemedText type="subtitle" lightColor="secondary" style={styles.metricsTableCell}>
                Stage
              </ThemedText>
              {activeResults.map((result) => (
                <ThemedText key={result.id} type="subtitle" style={styles.metricsTableCell}>
                  {result.result.stage || 'N/A'}
                </ThemedText>
              ))}
            </View>
            
            <View style={styles.metricsTableRow}>
              <ThemedText type="subtitle" lightColor="secondary" style={styles.metricsTableCell}>
                Severity
              </ThemedText>
              {activeResults.map((result) => (
                <ThemedText key={result.id} type="subtitle" style={styles.metricsTableCell}>
                  {result.result.severityScore || 'N/A'}
                </ThemedText>
              ))}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{
          headerTitle: 'Analysis Comparison',
          headerTransparent: true,
          headerTintColor: Colors.light.text, 
          headerBackVisible: true,
          headerStyle: {
            backgroundColor: 'transparent'
          }
        }} 
      />
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <ThemedText style={styles.loadingText}>Loading comparison data...</ThemedText>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 60 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Sample Information */}
          {sampleInfo && (
            <Animated.View 
              style={[
                styles.sampleInfoCard,
                { transform: [{ scale: cardScale }] }
              ]}
            >
              <View style={styles.sampleInfoContent}>
                <View>
                  <ThemedText type="defaultSemiBold">
                    Sample {sampleInfo.id}
                  </ThemedText>
                  <ThemedText lightColor="secondary" darkColor="secondary">
                    {sampleInfo.patientName} ({sampleInfo.patientId})
                  </ThemedText>
                </View>
                
                <View style={[
                  styles.sampleTypeBadge,
                  { backgroundColor: Colors.light.secondaryLight }
                ]}>
                  <ThemedText lightColor="secondary" darkColor="secondary" style={[styles.sampleTypeText, {fontSize: 12}]}>
                    {sampleInfo.sampleType}
                  </ThemedText>
                </View>
              </View>
            </Animated.View>
          )}
          
          {/* Analysis Selection */}
          <Animated.View style={{ opacity: contentOpacity }}>
            <View style={styles.sectionHeader}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                Select Analyses to Compare
              </ThemedText>
              <ThemedText lightColor="secondary" style={[styles.sectionSubtitle, { fontSize: 12 }]}>
                Choose up to 2 analyses
              </ThemedText>
            </View>
            
            {renderAnalysisCards()}
            
            {/* Comparison Mode Toggle */}
            <View style={styles.comparisonModeToggle}>
              <TouchableOpacity
                style={[
                  styles.modeToggleButton,
                  comparisonMode === 'image' && styles.activeToggleButton
                ]}
                onPress={() => toggleComparisonMode('image')}
              >
                <Ionicons 
                  name="images-outline" 
                  size={18} 
                  color={comparisonMode === 'image' ? Colors.light.primary : Colors.light.secondary} 
                />
                <ThemedText 
                  style={[
                    styles.modeToggleText,
                    {fontSize: 14},
                    comparisonMode === 'image' && styles.activeToggleText
                  ]}
                >
                  Image Comparison
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modeToggleButton,
                  comparisonMode === 'metrics' && styles.activeToggleButton
                ]}
                onPress={() => toggleComparisonMode('metrics')}
              >
                <Ionicons 
                  name="bar-chart-outline" 
                  size={18} 
                  color={comparisonMode === 'metrics' ? Colors.light.primary : Colors.light.secondary} 
                />
                <ThemedText 
                  style={[
                    styles.modeToggleText,
                    {fontSize: 14},
                    comparisonMode === 'metrics' && styles.activeToggleText
                  ]}
                >
                  Metrics Comparison
                </ThemedText>
              </TouchableOpacity>
            </View>
            
            {/* Comparison Content */}
            {comparisonMode === 'image' ? renderImageComparison() : renderMetricsComparison()}
            
            {/* Report Generation Button */}
            {activeAnalyses.length > 0 && (
              <TouchableOpacity
                style={styles.generateReportButton}
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  alert('Report generated and saved to patient record');
                }}
              >
                <Ionicons name="document-text-outline" size={18} color="#fff" style={styles.generateReportIcon} />
                <ThemedText style={styles.generateReportText}>
                  Generate Comparison Report
                </ThemedText>
              </TouchableOpacity>
            )}
          </Animated.View>
        </ScrollView>
      )}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: Colors.light.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  sampleInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sampleInfoContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sampleTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sampleTypeText: {
    
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    marginBottom: 2,
  },
  sectionSubtitle: {
    
  },
  analysisCardsContainer: {
    paddingBottom: 8,
    paddingLeft: 2,
  },
  analysisCard: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeAnalysisCard: {
    borderColor: Colors.light.primary,
  },
  analysisCardHeader: {
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  analysisTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  analysisTypeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  checkmarkBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analysisCardThumbnail: {
    height: 80,
    width: '100%',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  parasiteCountBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(231, 76, 60, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  parasiteCountText: {
    color: '#fff',
    marginLeft: 3,
    fontSize: 10,
  },
  analysisCardFooter: {
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  analysisTimestamp: {
    fontSize: 10,
  },
  confidencePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  comparisonModeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.light.secondaryLight,
    borderRadius: 12,
    padding: 4,
    marginVertical: 16,
  },
  modeToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeToggleButton: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  modeToggleText: {
    marginLeft: 6,
    color: Colors.light.secondary,
  },
  activeToggleText: {
    color: Colors.light.primary,
    fontWeight: '500',
  },
  emptyComparisonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
  },
  emptyComparisonText: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyComparisonSubtext: {
    textAlign: 'center',
  },
  imageComparisonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  comparisonImageWrapper: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  singleImageWrapper: {
    width: '100%',
  },
  comparisonImageHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  comparisonImageTitle: {
    marginBottom: 2,
  },
  comparisonImage: {
    height: 200,
    width: '100%',
    backgroundColor: '#000',
    position: 'relative',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  parasiteIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  parasiteIndicatorText: {
    color: '#fff',
    marginLeft: 4,
  },
  comparisonImageFooter: {
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  comparisonMetric: {
    marginRight: 16,
    marginBottom: 8,
  },
  metricsComparisonContainer: {
    marginBottom: 20,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    
  },
  chartSubtitle: {
    
  },
  chart: {
    
  },
  barChartItem: {
    marginBottom: 16,
  },
  barLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  barContainer: {
    height: 24,
    backgroundColor: Colors.light.secondaryLight,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  bar: {
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    borderRadius: 4,
  },
  barValue: {
    position: 'absolute',
    right: 8,
    top: 4,
    color: '#fff',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  metricsTableContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  metricsTableTitle: {
    marginBottom: 16,
  },
  metricsTable: {
    
  },
  metricsTableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    paddingBottom: 8,
    marginBottom: 8,
  },
  metricsTableHeaderCell: {
    flex: 1,
    textAlign: 'center',
  },
  metricsTableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  metricsTableCell: {
    flex: 1,
    textAlign: 'center',
  },
  generateReportButton: {
    backgroundColor: Colors.light.tint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  generateReportIcon: {
    marginRight: 8,
  },
  generateReportText: {
    color: '#fff',
    fontWeight: '500',
  },
});