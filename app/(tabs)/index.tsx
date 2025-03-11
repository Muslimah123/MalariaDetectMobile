import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  FlatList,
  Image
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// Components
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import ParallaxScrollView from '../../components/ParallaxScrollView';

// Constants
import { Colors } from '../../constants/Colors';
import { mockSamples, mockAnalysisHistory } from '../../constants/MockData';

const { width, height } = Dimensions.get('window');

// Dashboard metrics
const DASHBOARD_METRICS = [
  {
    id: 'samples',
    label: 'Total Samples',
    value: 56,
    change: '+12%',
    icon: 'test-tube',
    iconColor: Colors.light.primary,
    positive: true
  },
  {
    id: 'positive',
    label: 'Positive Cases',
    value: 14,
    change: '-5%',
    icon: 'bacteria',
    iconColor: Colors.light.error,
    positive: false
  },
  {
    id: 'pending',
    label: 'Pending Analysis',
    value: 8,
    change: '+2',
    icon: 'clock',
    iconColor: Colors.light.warning,
    positive: null
  },
  {
    id: 'accuracy',
    label: 'Avg. Accuracy',
    value: '94.2%',
    change: '+1.5%',
    icon: 'check-circle',
    iconColor: Colors.light.success,
    positive: true
  }
];

// Quick action buttons
const QUICK_ACTIONS = [
  {
    id: 'newSample',
    label: 'Register Sample',
    icon: 'test-tube',
    route: '/new-sample',
    color: Colors.light.primary
  },
  {
    id: 'camera',
    label: 'Capture Image',
    icon: 'camera',
    route: '/capture/new',
    color: '#8e44ad'
  },
  {
    id: 'samples',
    label: 'View Samples',
    icon: 'list',
    route: '/samples',
    color: Colors.light.info
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: 'bar-chart',
    route: '/reports',
    color: Colors.light.success
  }
];

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const [recentSamples, setRecentSamples] = useState(mockSamples.slice(0, 5));
  const [urgentSamples, setUrgentSamples] = useState(
    mockSamples.filter(s => s.priority === 'Urgent').slice(0, 3)
  );
  const [detectionRate, setDetectionRate] = useState([65, 58, 62, 71, 68, 74, 76]);
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const metricsScaleY = useRef(new Animated.Value(0.9)).current;
  const metricsOpacity = useRef(new Animated.Value(0)).current;
  const chartProgress = useRef(new Animated.Value(0)).current;
  
  // Handle entrance animations
  useEffect(() => {
    // Animate header
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    // Animate metrics
    Animated.parallel([
      Animated.timing(metricsScaleY, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(metricsOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Animate chart
    Animated.timing(chartProgress, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, []);
  
  // Navigation
  const navigateToScreen = (route: `/samples?${string}` | `/sample/${string}`) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(route);
    };
    
    // Handle action button press
    const handleActionPress = (route: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push(route as any);
    };
  
  // Render dashboard header
  const renderHeader = () => {
    return (
      <Animated.View style={[styles.headerContainer, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={['#2563eb', '#1d4ed8']}
          style={styles.headerGradient}
        >
          <View style={[styles.headerContent, { paddingTop: insets.top + 20 }]}>
            <View style={styles.welcomeContainer}>
              <View>
                <ThemedText type="defaultSemiBold" style={styles.welcomeText}>
                  MalariaDetect
                </ThemedText>
                <ThemedText style={styles.welcomeSubtext}>
                  Automated Diagnosis System
                </ThemedText>
              </View>
              
              <TouchableOpacity style={styles.notificationButton}>
                <Ionicons name="notifications-outline" size={24} color="#fff" />
                <View style={styles.notificationBadge}>
                  <ThemedText style={styles.notificationBadgeText}>3</ThemedText>
                </View>
              </TouchableOpacity>
            </View>
            
            <View style={styles.headerStatsContainer}>
              <View style={styles.headerStat}>
                <ThemedText type="title" style={styles.headerStatValue}>
                  86%
                </ThemedText>
                <ThemedText style={[styles.headerStatLabel, { fontSize: 12 }]}>
                  Detection Rate
                </ThemedText>
              </View>
              
              <View style={styles.headerDivider} />
              
              <View style={styles.headerStat}>
                <ThemedText type="title" style={styles.headerStatValue}>
                  94%
                </ThemedText>
                <ThemedText style={[styles.headerStatLabel, { fontSize: 12 }]}>
                  Accuracy
                </ThemedText>
              </View>
              
              <View style={styles.headerDivider} />
              
              <View style={styles.headerStat}>
                <ThemedText type="title" style={styles.headerStatValue}>
                  92s
                </ThemedText>
                <ThemedText style={[styles.headerStatLabel, { fontSize: 12 }]}>
                  Avg. Time
                </ThemedText>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };
  
  // Render metric card
  const renderMetricCard = (metric: any, index: number) => {
    return (
      <Animated.View 
        style={[
          styles.metricCard,
          {
            opacity: metricsOpacity,
            transform: [{ scaleY: metricsScaleY }],
          }
        ]}
        key={metric.id}
      >
        <View style={styles.metricIcon}>
          <MaterialCommunityIcons name={metric.icon as any} size={24} color={metric.iconColor} />
        </View>
        
        <View style={styles.metricContent}>
          <ThemedText lightColor={Colors.light.secondary} style={[styles.metricLabel, { fontSize: 12 }]}>
            {metric.label}
          </ThemedText>
          <ThemedText type="title" style={[styles.metricValue, { fontSize: 24 }]}>
            {metric.value}
          </ThemedText>
          
          {metric.change && (
            <View style={styles.metricChange}>
              <ThemedText 
                style={[
                  styles.metricChangeText,
                  { fontSize: 12 },
                  {
                    color: metric.positive === true
                      ? Colors.light.success
                      : metric.positive === false
                        ? Colors.light.error
                        : Colors.light.secondary
                  }
                ]}
              >
                {metric.change}
              </ThemedText>
              {metric.positive !== null && (
                <Ionicons 
                  name={metric.positive ? "arrow-up" : "arrow-down"} 
                  size={12} 
                  color={metric.positive ? Colors.light.success : Colors.light.error} 
                  style={styles.metricChangeIcon}
                />
              )}
            </View>
          )}
          
        </View>
      </Animated.View>
    );
  };
  
  // Render chart
  const renderChart = () => {
    const maxValue = Math.max(...detectionRate);
    
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <View>
            <ThemedText type="defaultSemiBold" style={styles.chartTitle}>
              Detection Rate
            </ThemedText>
            <ThemedText type="subtitle" lightColor={Colors.light.secondary}>
              Last 7 days
            </ThemedText>
          </View>
          
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.light.primary }]} />
              <ThemedText style={{ fontSize: 12 }} lightColor={Colors.light.secondary}>
                Rate (%)
              </ThemedText>
            </View>
          </View>
        </View>
        
        <View style={styles.chartContent}>
          <View style={styles.yAxis}>
            <ThemedText style={{ fontSize: 12 }} lightColor={Colors.light.secondary}>100%</ThemedText>
            <ThemedText style={{ fontSize: 12 }} lightColor={Colors.light.secondary}>75%</ThemedText>
            <ThemedText style={{ fontSize: 12 }} lightColor={Colors.light.secondary}>50%</ThemedText>
            <ThemedText style={{ fontSize: 12 }} lightColor={Colors.light.secondary}>25%</ThemedText>
            <ThemedText style={{ fontSize: 12 }} lightColor={Colors.light.secondary}>0%</ThemedText>
          </View>
          
          <View style={styles.chartBars}>
            {detectionRate.map((value, index) => {
              const barHeight = (value / 100) * 120; // Max height of 120
              
              return (
                <View style={styles.barContainer} key={index}>
                  <Animated.View 
                    style={[
                      styles.bar,
                      {
                        height: chartProgress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, barHeight]
                        })
                      }
                    ]}
                  />
                  <ThemedText lightColor={Colors.light.secondary} style={[styles.barLabel, { fontSize: 12 }]}>
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                  </ThemedText>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };
  
  // Render quick action buttons
  const renderQuickActions = () => {
    return (
      <View style={styles.actionsContainer}>
        <View style={styles.sectionHeader}>
          <ThemedText type="defaultSemiBold">Quick Actions</ThemedText>
        </View>
        
        <View style={styles.actionButtons}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionButton}
              onPress={() => handleActionPress(action.route)}
            >
              <View 
                style={[
                  styles.actionIcon,
                  { backgroundColor: `${action.color}20` }
                ]}
              >
                <Feather name={action.icon as any} size={20} color={action.color} />
              </View>
              <ThemedText style={[styles.actionLabel, { fontSize: 12 }]}>
                {action.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };
  
  // Render urgent samples
  const renderUrgentSamples = () => {
    if (urgentSamples.length === 0) return null;
    
    return (
      <View style={styles.urgentContainer}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <FontAwesome5 name="exclamation-circle" size={16} color={Colors.light.error} style={styles.sectionIcon} />
            <ThemedText type="defaultSemiBold" style={{ fontSize: 16 }}>Urgent Samples</ThemedText>
          </View>
          <TouchableOpacity onPress={() => navigateToScreen('/samples?filter=urgent')}>
            <ThemedText style={{ fontSize: 14 }} type="link">View All</ThemedText>
          </TouchableOpacity>
        </View>
        
        <View style={styles.urgentList}>
          {urgentSamples.map((sample) => (
            <TouchableOpacity
              key={sample.id}
              style={styles.urgentItem}
              onPress={() => navigateToScreen(`/sample/${sample.id}`)}
            >
              <View style={styles.urgentBadge}>
                <MaterialCommunityIcons name="test-tube" size={16} color="#fff" />
              </View>
              
              <View style={styles.urgentInfo}>
                <ThemedText type="defaultSemiBold">{sample.id}</ThemedText>
                <ThemedText style={{ fontSize: 12 }} lightColor={Colors.light.secondary}>{sample.patientName}</ThemedText>
                <View style={styles.urgentStatus}>
                  <View style={styles.statusDot} />
                  <ThemedText style={{ fontSize: 12 }} lightColor={Colors.light.secondary}>{sample.status}</ThemedText>
                </View>
              </View>
              
              <Ionicons name="chevron-forward" size={20} color={Colors.light.secondary} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };
  
  // Render recent samples
  const renderRecentSamples = () => {
    return (
      <View style={styles.recentContainer}>
        <View style={styles.sectionHeader}>
          <ThemedText type="defaultSemiBold">Recent Samples</ThemedText>
          <TouchableOpacity onPress={() => navigateToScreen('/samples?view=all')}>
            <ThemedText type="link" style={{ fontSize: 14 }} lightColor={Colors.light.primary}>View All</ThemedText>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={recentSamples}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recentList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.recentItem}
              onPress={() => navigateToScreen(`/sample/${item.id}`)}
            >
              <View style={styles.recentHeader}>
                <View 
                  style={[
                    styles.sampleTypeBadge,
                    { backgroundColor: item.sampleType.includes('Thick') ? '#e1f5fe' : '#e8f5e9' }
                  ]}
                >
                  <ThemedText 
                    style={{
                      fontSize: 12,
                      color: item.sampleType.includes('Thick') ? '#0288d1' : '#388e3c'
                    }}
                  >
                    {item.sampleType.split(' ')[0]}
                  </ThemedText>
                </View>
                
                {item.priority === 'Urgent' && (
                  <View style={styles.urgentFlag}>
                    <FontAwesome5 name="exclamation" size={8} color="#fff" />
                  </View>
                )}
              </View>
              
              <ThemedText type="defaultSemiBold" style={styles.recentId}>
                {item.id}
              </ThemedText>
              
              <ThemedText lightColor={Colors.light.secondary} numberOfLines={1} style={[styles.recentPatient, { fontSize: 12 }]}>
                {item.patientName}
              </ThemedText>
              
              <View style={styles.recentFooter}>
                <View 
                  style={[
                    styles.statusIndicator,
                    {
                      backgroundColor: item.status === 'Ready for analysis'
                        ? Colors.light.infoLight
                        : item.status === 'Completed'
                          ? Colors.light.successLight
                          : Colors.light.warningLight
                    }
                  ]}
                >
                  <View 
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor: item.status === 'Ready for analysis'
                          ? Colors.light.info
                          : item.status === 'Completed'
                            ? Colors.light.success
                            : Colors.light.warning
                      }
                    ]}
                  />
                    <ThemedText 
                    type="default" 
                    style={{
                      fontSize: 12,
                      color: item.status === 'Ready for analysis'
                      ? Colors.light.info
                      : item.status === 'Completed'
                        ? Colors.light.success
                        : Colors.light.warning
                    }}
                    >
                    {item.status === 'Ready for analysis' ? 'Ready' : item.status}
                    </ThemedText>
                </View>
                
                <ThemedText type="default" lightColor={Colors.light.secondary} darkColor={Colors.dark.secondary} style={styles.recentTime}>
                  {item.collectionTime.split(' ')[1]}
                </ThemedText>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ParallaxScrollView
        headerImage={renderHeader()}
        headerBackgroundColor={{ dark: '#000', light: '#fff' }}
      >
        <View style={[styles.content, { paddingTop: 20 }]}>
          {/* Metrics Grid */}
          <View style={styles.metricsGrid}>
            {DASHBOARD_METRICS.map((metric, index) => renderMetricCard(metric, index))}
          </View>
          
          {/* Quick Actions */}
          {renderQuickActions()}
          
          {/* Urgent Samples */}
          {renderUrgentSamples()}
          
          {/* Chart */}
          {renderChart()}
          
          {/* Recent Samples */}
          {renderRecentSamples()}
          
          {/* Bottom Padding */}
          <View style={{ height: 20 }} />
        </View>
      </ParallaxScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerContainer: {
    height: 220,
    width: '100%',
    overflow: 'hidden',
  },
  headerGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 24,
  },
  welcomeSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.light.error,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1d4ed8',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
  },
  headerStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
  },
  headerStat: {
    flex: 1,
    alignItems: 'center',
  },
  headerStatValue: {
    color: '#fff',
    marginBottom: 4,
  },
  headerStatLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  headerDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 20,
  },
  metricCard: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  metricContent: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  metricIcon: {
    position: 'absolute',
    top: 14,
    right: 22,
    zIndex: 1,
  },
  metricLabel: {
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    marginBottom: 4,
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricChangeText: {
    
  },
  metricChangeIcon: {
    marginLeft: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: 6,
  },
  actionsContainer: {
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    width: '23%',
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    textAlign: 'center',
  },
  urgentContainer: {
    marginBottom: 20,
  },
  urgentList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  urgentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  urgentBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  urgentInfo: {
    flex: 1,
  },
  urgentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.warning,
    marginRight: 4,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  chartTitle: {
    marginBottom: 2,
  },
  chartLegend: {
    flexDirection: 'row',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  chartContent: {
    flexDirection: 'row',
    height: 160,
  },
  yAxis: {
    width: 40,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
    paddingVertical: 10,
  },
  chartBars: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: 10,
  },
  barContainer: {
    alignItems: 'center',
    width: 30,
  },
  bar: {
    width: 16,
    backgroundColor: Colors.light.primary,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: {
    marginTop: 6,
  },
  recentContainer: {
    marginBottom: 20,
  },
  recentList: {
    paddingLeft: 4,
    paddingRight: 16,
  },
  recentItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    width: 160,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sampleTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  urgentFlag: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.light.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentId: {
    marginBottom: 4,
  },
  recentPatient: {
    marginBottom: 8,
  },
  recentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  recentTime: {
    
  },
});