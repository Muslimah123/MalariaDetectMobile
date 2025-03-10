import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

// Components
import {ThemedView} from '../components/ThemedView';
import {ThemedText} from '../components/ThemedText';

// Constants
import {Colors} from '../constants/Colors';

const { width, height } = Dimensions.get('window');

const REPORT_TYPES = [
  {
    id: 'daily',
    title: 'Daily Report',
    description: 'Analysis results from the past 24 hours',
    icon: 'today-outline',
  },
  {
    id: 'weekly',
    title: 'Weekly Summary',
    description: 'Performance metrics for the past week',
    icon: 'calendar-outline',
  },
  {
    id: 'monthly',
    title: 'Monthly Statistics',
    description: 'Comprehensive monthly analytics',
    icon: 'bar-chart-outline',
  },
  {
    id: 'species',
    title: 'Species Distribution',
    description: 'Breakdown of malaria species detected',
    icon: 'analytics-outline',
  },
];

const METRIC_CARDS = [
  {
    title: 'Total Analyses',
    value: '543',
    change: '+12%',
    isPositive: true,
    subtitle: 'vs. previous period',
    color: Colors.light.primary,
  },
  {
    title: 'Positive Cases',
    value: '127',
    change: '-5%',
    isPositive: true,
    subtitle: 'vs. previous period',
    color: Colors.light.error,
  },
  {
    title: 'Avg. Accuracy',
    value: '94.2%',
    change: '+1.5%',
    isPositive: true,
    subtitle: 'vs. previous period',
    color: Colors.light.success,
  },
  {
    title: 'Avg. Process Time',
    value: '92s',
    change: '-10s',
    isPositive: true,
    subtitle: 'vs. previous period',
    color: Colors.light.info,
  },
];

// Data for doughnut chart
const SPECIES_DATA = [
  { name: 'P. falciparum', value: 76, color: '#e74c3c' },
  { name: 'P. vivax', value: 18, color: '#3498db' },
  { name: 'P. malariae', value: 4, color: '#2ecc71' },
  { name: 'P. ovale', value: 2, color: '#f39c12' },
];

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const [activeReport, setActiveReport] = useState('daily');
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('Mar 4 - Mar 10, 2025');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  
  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setIsLoading(false);
      
      // Start animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1000);
  }, []);
  
  // Change report type
  const handleReportChange = (reportId: string) => {
    if (reportId !== activeReport) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setActiveReport(reportId);
      
      // Simulate loading when switching reports
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    }
  };
  
  // Generate and share report
  const handleGenerateReport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Simulate generating report
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert(`${REPORT_TYPES.find(r => r.id === activeReport)?.title} has been generated and saved.`);
    }, 1500);
  };
  
  // Render report type selector
  const renderReportSelector = () => {
    return (
      <View style={styles.reportTypesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.reportTypesScrollContent}
        >
          {REPORT_TYPES.map((report) => (
            <TouchableOpacity
              key={report.id}
              style={[
                styles.reportTypeCard,
                activeReport === report.id && styles.activeReportCard
              ]}
              onPress={() => handleReportChange(report.id)}
            >
              <View style={[
                styles.reportIconContainer,
                activeReport === report.id && styles.activeReportIcon
              ]}>
                <Ionicons 
                  name={report.icon as any} 
                  size={22} 
                  color={activeReport === report.id ? '#fff' : Colors.light.primary} 
                />
              </View>
              <View style={styles.reportTypeContent}>
                <ThemedText 
                  type="defaultSemiBold" 
                  style={activeReport === report.id ? styles.activeReportText : {}}
                >
                  {report.title}
                </ThemedText>
                <ThemedText type="default" lightColor="secondary" darkColor="secondary" numberOfLines={2} style={styles.reportTypeDescription}>
                  {report.description}
                </ThemedText>
              </View>
              {activeReport === report.id && (
                <View style={styles.activeIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };
  
  // Render metric cards
  const renderMetricCards = () => {
    return (
      <View style={styles.metricsContainer}>
        <View style={styles.metricsHeader}>
          <ThemedText type="defaultSemiBold" style={styles.metricsTitle}>
            Key Metrics
          </ThemedText>
          <ThemedText type="default" lightColor="secondary" darkColor="secondary">
            {dateRange}
          </ThemedText>
        </View>
        
        <View style={styles.metricCardsGrid}>
          {METRIC_CARDS.map((metric, index) => (
            <Animated.View 
              key={index} 
              style={[
                styles.metricCard,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY }]
                }
              ]}
            >
              <View style={styles.metricCardHeader}>
                <ThemedText type="default" lightColor="secondary" darkColor="secondary">
                  {metric.title}
                </ThemedText>
                <View 
                  style={[
                    styles.metricIcon,
                    { backgroundColor: `${metric.color}20` }
                  ]}
                >
                  <MaterialCommunityIcons 
                    name={
                      index === 0 ? 'test-tube' : 
                      index === 1 ? 'virus' : 
                      index === 2 ? 'check-circle' : 'clock-outline'
                    } 
                    size={14} 
                    color={metric.color} 
                  />
                </View>
              </View>
              
              <ThemedText type="title" style={styles.metricValue}>
                {metric.value}
              </ThemedText>
              
              <View style={styles.metricFooter}>
                <View style={styles.metricChange}>
                  <Ionicons 
                    name={metric.isPositive ? "arrow-up" : "arrow-down"} 
                    size={12} 
                    color={
                      metric.isPositive ? 
                        index === 1 ? Colors.light.error : Colors.light.success : 
                        Colors.light.error
                    } 
                    style={styles.changeIcon}
                  />
                  <ThemedText 
                    type="default" 
                    style={{
                      color: metric.isPositive ? 
                        index === 1 ? Colors.light.error : Colors.light.success : 
                        Colors.light.error
                    }}
                  >
                    {metric.change}
                  </ThemedText>
                </View>
                <ThemedText type="default" lightColor="secondary" darkColor="secondary">
                  {metric.subtitle}
                </ThemedText>
              </View>
            </Animated.View>
          ))}
        </View>
      </View>
    );
  };
  
  // Render species distribution chart
  const renderSpeciesChart = () => {
    // Calculate total for percentages
    const total = SPECIES_DATA.reduce((sum, item) => sum + item.value, 0);
    
    return (
      <Animated.View 
        style={[
          styles.chartContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY }]
          }
        ]}
      >
        <View style={styles.chartHeader}>
          <ThemedText type="defaultSemiBold">
            Species Distribution
          </ThemedText>
        </View>
        
        <View style={styles.chartContent}>
          <View style={styles.doughnutContainer}>
            <View style={styles.doughnutChart}>
              {/* Create doughnut segments */}
              {SPECIES_DATA.map((item, index) => {
                const angle = (item.value / total) * 360;
                const previousAngles = SPECIES_DATA
                  .slice(0, index)
                  .reduce((sum, prevItem) => sum + (prevItem.value / total) * 360, 0);
                
                return (
                  <View 
                    key={item.name}
                    style={[
                      styles.doughnutSegment,
                      {
                        backgroundColor: item.color,
                        transform: [
                          { rotate: `${previousAngles}deg` }
                        ],
                        width: '100%',
                        height: '100%',
                        borderTopRightRadius: angle >= 90 ? 0 : 75,
                        borderBottomRightRadius: angle >= 180 ? 0 : 75,
                        borderTopLeftRadius: angle >= 270 ? 0 : 75,
                        borderBottomLeftRadius: angle >= 0 ? 0 : 75,
                        clip: 'antialiased',
                      }
                    ]}
                  />
                );
              })}
              <View style={styles.doughnutInner}>
                <ThemedText type="title">
                  {total}
                </ThemedText>
                <ThemedText type="default" lightColor="secondary" darkColor="secondary">
                  Total Cases
                </ThemedText>
              </View>
            </View>
          </View>
          
          <View style={styles.chartLegend}>
            {SPECIES_DATA.map((item) => (
              <View key={item.name} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <ThemedText type="default">{item.name}</ThemedText>
                <ThemedText type="default" lightColor="secondary" darkColor="secondary" style={styles.legendValue}>
                  {item.value} ({Math.round((item.value / total) * 100)}%)
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>
    );
  };
  
  // Render detection rate chart
  const renderDetectionRateChart = () => {
    // Detection rate data (simulated)
    const detectionData = [68, 72, 65, 78, 82, 75, 80];
    const maxValue = Math.max(...detectionData);
    
    return (
      <Animated.View 
        style={[
          styles.chartContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY }]
          }
        ]}
      >
        <View style={styles.chartHeader}>
          <ThemedText type="defaultSemiBold">
            Detection Rate
          </ThemedText>
          <ThemedText type="default" lightColor="secondary" darkColor="secondary">
            7-Day History
          </ThemedText>
        </View>
        
        <View style={styles.barChartContainer}>
          <View style={styles.barChartYAxis}>
            <ThemedText type="default" lightColor="secondary">100%</ThemedText>
            <ThemedText type="default" lightColor="secondary" darkColor="secondary">75%</ThemedText>
            <ThemedText type="default" lightColor="secondary" darkColor="secondary">50%</ThemedText>
            <ThemedText type="default" lightColor="secondary" darkColor="secondary">25%</ThemedText>
            <ThemedText type="default" lightColor="secondary" darkColor="secondary">0%</ThemedText>
          </View>
          
          <View style={styles.barChartContent}>
            {detectionData.map((value, index) => {
              const heightPercentage = (value / 100) * 150; // 150px is the max height
              return (
                <View key={index} style={styles.barColumn}>
                  <ThemedText type="default" lightColor="secondary" darkColor="secondary" style={styles.barValue}>
                    {value}%
                  </ThemedText>
                  <View style={styles.barWrapper}>
                    <Animated.View 
                      style={[
                        styles.bar, 
                        { 
                          height: heightPercentage,
                          backgroundColor: 
                            value < 70 ? Colors.light.warning :
                            value < 80 ? Colors.light.info :
                            Colors.light.success
                        }
                      ]}
                    />
                  </View>
                  <ThemedText type="default" lightColor="secondary" darkColor="secondary">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                  </ThemedText>
                </View>
              );
            })}
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Reports & Analytics',
          headerBackTitle: 'Back',
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Report Type Selector */}
        {renderReportSelector()}
        
        {/* Report Content */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <ThemedText style={styles.loadingText}>Loading report data...</ThemedText>
          </View>
        ) : (
          <>
            {/* Metric Cards */}
            {renderMetricCards()}
            
            {/* Detection Rate Chart */}
            {renderDetectionRateChart()}
            
            {/* Species Distribution Chart */}
            {renderSpeciesChart()}
            
            {/* Export Report Button */}
            <TouchableOpacity
              style={styles.exportButton}
              onPress={handleGenerateReport}
            >
              <Ionicons name="download-outline" size={20} color="#fff" style={styles.exportIcon} />
              <ThemedText style={styles.exportText}>
                Generate {REPORT_TYPES.find(r => r.id === activeReport)?.title} PDF
              </ThemedText>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  reportTypesContainer: {
    paddingVertical: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  reportTypesScrollContent: {
    paddingHorizontal: 16,
  },
  reportTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 280,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    position: 'relative',
  },
  activeReportCard: {
    borderColor: Colors.light.primary,
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
  },
  reportIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activeReportIcon: {
    backgroundColor: Colors.light.primary,
  },
  reportTypeContent: {
    flex: 1,
  },
  activeReportText: {
    color: Colors.light.primary,
  },
  reportTypeDescription: {
    marginTop: 2,
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightWidth: 30,
    borderTopWidth: 30,
    borderRightColor: 'transparent',
    borderTopColor: Colors.light.primary,
    borderTopRightRadius: 12,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: Colors.light.secondary,
  },
  metricsContainer: {
    padding: 16,
    marginBottom: 16,
  },
  metricsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricsTitle: {
    
  },
  metricCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  metricCard: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  metricCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricValue: {
    marginBottom: 4,
  },
  metricFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeIcon: {
    marginRight: 2,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartContent: {
    alignItems: 'center',
  },
  doughnutContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  doughnutChart: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  doughnutSegment: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 75,
    height: 75,
    borderRadius: 75,
  },
  doughnutInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  chartLegend: {
    alignSelf: 'stretch',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendValue: {
    marginLeft: 'auto',
  },
  barChartContainer: {
    flexDirection: 'row',
    height: 200,
    paddingBottom: 20,
  },
  barChartYAxis: {
    width: 40,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
    paddingVertical: 10,
  },
  barChartContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: 10,
  },
  barColumn: {
    alignItems: 'center',
  },
  barValue: {
    marginBottom: 4,
  },
  barWrapper: {
    height: 150,
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  bar: {
    width: 16,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  exportButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
  },
  exportIcon: {
    marginRight: 8,
  },
  exportText: {
    color: '#fff',
    fontWeight: '500',
  },
});