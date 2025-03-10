import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Animated,
  Dimensions,
  Keyboard,
  Platform
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// Components
import {ThemedView} from '../../components/ThemedView';
import {ThemedText} from '../../components/ThemedText';
import {Collapsible} from '../../components/Collapsible';

// Constants
import {Colors} from '../../constants/Colors';
import { mockSampleDetails } from '../../constants/MockData';

const { width } = Dimensions.get('window');

// Types
interface SampleDetail {
  sampleId: string;
  stainType: string;
  stainTime: string;
  microscope: string;
  objective: string;
  fieldCount: string;
  qualityCheck: 'Passed' | 'Failed' | 'Needs review';
  notes: string;
  slidePreparedBy: string;
  prepTime: string;
}

interface Sample {
  id: string;
  patientId: string;
  patientName: string;
  collectionTime: string;
  sampleType: string;
  labTechnician: string;
  status: string;
  priority: 'Routine' | 'Urgent';
}

interface LocalCollapsibleProps {
  children: React.ReactNode;
  collapsed: boolean;
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

const QualityOptions = ['Passed', 'Failed', 'Needs review'];
const ObjectiveOptions = ['10x', '40x', '100x oil immersion'];
const MicroscopeOptions = ['Olympus CX43', 'Zeiss Primo Star', 'Leica DM750'];

const SectionHeader = ({ title, icon }: { title: string, icon: string }) => (
  <View style={styles.sectionHeader}>
    <MaterialCommunityIcons name={icon as any} size={20} color={Colors.light.icon} />
    <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>{title}</ThemedText>
  </View>
);

const InfoRow = ({ label, value }: { label: string, value: string }) => (
  <View style={styles.infoRow}>
    <ThemedText style={styles.infoLabel}>{label}</ThemedText>
    <ThemedText style={styles.infoValue}>{value}</ThemedText>
  </View>
);

const StatusBadge = ({ status }: { status: string }) => {
  let badgeColor, textColor, icon;
  
  switch(status) {
    case 'Ready for analysis':
      badgeColor = Colors.light.infoLight;
      textColor = Colors.light.info;
      icon = 'flask-outline';
      break;
    case 'In progress':
      badgeColor = Colors.light.warningLight;
      textColor = Colors.light.warning;
      icon = 'hourglass-outline';
      break;
    case 'Completed':
      badgeColor = Colors.light.successLight;
      textColor = Colors.light.success;
      icon = 'checkmark-circle-outline';
      break;
    default:
      badgeColor = Colors.light.secondaryLight;
      textColor = Colors.light.secondary;
      icon = 'ellipse-outline';
  }
  
  return (
    <View style={[styles.statusBadge, { backgroundColor: badgeColor }]}>
      <Ionicons name={icon as any} size={16} color={textColor} style={{ marginRight: 6 }} />
      <ThemedText style={{ color: textColor, fontWeight: '500' }}>{status}</ThemedText>
    </View>
  );
};

export default function SampleDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id;
  const insets = useSafeAreaInsets();
  
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [sample, setSample] = useState<Sample | null>(null);
  const [sampleDetails, setSampleDetails] = useState<SampleDetail | null>(null);
  const [selectedQuality, setSelectedQuality] = useState('');
  const [selectedObjective, setSelectedObjective] = useState('');
  const [showObjectiveOptions, setShowObjectiveOptions] = useState(false);
  const [showMicroscopeOptions, setShowMicroscopeOptions] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // Animation values
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(30)).current;
  const editButtonScale = useRef(new Animated.Value(1)).current;
  const formTranslateX = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    // Simulate API call
    setTimeout(() => {
      const foundSample = mockSampleDetails.samples.find(s => s.id === id);
      const details = mockSampleDetails.details.find(d => d.sampleId === id);
      
      if (foundSample) setSample({ ...foundSample, priority: foundSample.priority as 'Routine' | 'Urgent' });
      if (details) {
        setSampleDetails({
          ...details,
          qualityCheck: details.qualityCheck as 'Passed' | 'Failed' | 'Needs review'
        });
        setSelectedQuality(details.qualityCheck);
        setSelectedObjective(details.objective);
      }
      
      setIsLoading(false);
      
      // Start entrance animations
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(300),
          Animated.parallel([
            Animated.timing(contentOpacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(contentTranslateY, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        ])
      ]).start();
    }, 700);

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [id]);

  const toggleEditMode = () => {
    // Edit button animation
    Animated.sequence([
      Animated.timing(editButtonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(editButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Form slide animation
    Animated.parallel([
      Animated.timing(formOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(formTranslateX, {
        toValue: editMode ? 0 : -20,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (editMode) {
        // Save changes
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setEditMode(!editMode);
      
      // Animate form back in with new state
      Animated.parallel([
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(formTranslateX, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleProceedToCapture = () => {
    if (sampleDetails?.qualityCheck !== 'Passed') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      
      // Animate the button shake
      Animated.sequence([
        Animated.timing(formTranslateX, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(formTranslateX, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(formTranslateX, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(formTranslateX, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
      
      alert('Sample quality check must pass before proceeding to image capture');
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/capture/${id}`);
  };

  const updateQualityCheck = (quality: string) => {
    if (!sampleDetails) return;
    setSelectedQuality(quality as 'Passed' | 'Failed' | 'Needs review');
    setSampleDetails({
      ...sampleDetails,
      qualityCheck: quality as 'Passed' | 'Failed' | 'Needs review'
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const updateObjective = (objective: string) => {
    if (!sampleDetails) return;
    setSelectedObjective(objective);
    setSampleDetails({
      ...sampleDetails,
      objective
    });
    setShowObjectiveOptions(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const updateMicroscope = (microscope: string) => {
    if (!sampleDetails) return;
    setSampleDetails({
      ...sampleDetails,
      microscope
    });
    setShowMicroscopeOptions(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const updateField = (field: keyof SampleDetail, value: string) => {
    if (!sampleDetails) return;
    setSampleDetails({
      ...sampleDetails,
      [field]: value
    });
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <ThemedText style={styles.loadingText}>Loading sample details...</ThemedText>
      </ThemedView>
    );
  }

  if (!sample || !sampleDetails) {
    return (
      <ThemedView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color={Colors.light.error} />
        <ThemedText type="defaultSemiBold" style={styles.errorText}>Sample not found</ThemedText>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{
          headerTitle: `Sample ${sample.id}`,
          headerTransparent: true,
          headerTintColor: Colors.light.primary, 
          headerBackVisible: true,
          headerStyle: {
            backgroundColor: 'transparent'
          },
          headerRight: () => (
            <Animated.View style={{ transform: [{ scale: editButtonScale }] }}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={toggleEditMode}
              >
                <Ionicons 
                  name={editMode ? "checkmark-circle" : "create-outline"} 
                  size={24} 
                  color={Colors.light.primary} 
                />
              </TouchableOpacity>
            </Animated.View>
          ),
        }} 
      />
      
      <Animated.View 
        style={[
          styles.headerBackground,
          { 
            paddingTop: insets.top + 60,
            opacity: headerOpacity
          }
        ]}
      >
        <LinearGradient
          colors={['rgba(37, 99, 235, 0.1)', 'rgba(37, 99, 235, 0)', 'rgba(37, 99, 235, 0)']}
          style={styles.headerGradient}
        />
      </Animated.View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 80 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.headerCard, 
            { 
              transform: [{ translateY: contentTranslateY }],
              opacity: contentOpacity
            }
          ]}
        >
          {/* Sample priority indicator */}
          {sample.priority === 'Urgent' && (
            <LinearGradient
              colors={[Colors.light.error, Colors.light.error + 'CC']}
              start={[0, 0]}
              end={[1, 0]}
              style={styles.priorityBanner}
            >
              <FontAwesome5 name="exclamation-circle" size={12} color="#fff" />
              <ThemedText type="default" style={styles.priorityText}>URGENT</ThemedText>
            </LinearGradient>
          )}
          
          <View style={styles.headerTop}>
            <View>
              <ThemedText type="title" style={styles.sampleIdText}>
                {sample.id}
              </ThemedText>
              <StatusBadge status={sample.status} />
            </View>
            <View style={styles.patientPhoto}>
              <ThemedText style={styles.patientInitials}>
                {sample.patientName.split(' ').map(name => name[0]).join('')}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.patientSection}>
            <InfoRow label="Patient" value={`${sample.patientName} (${sample.patientId})`} />
            <InfoRow label="Sample Type" value={sample.sampleType} />
            <InfoRow label="Collection Time" value={sample.collectionTime} />
            <InfoRow label="Lab Technician" value={sample.labTechnician} />
          </View>
        </Animated.View>
        
        {/* Sample preparation details */}
        <Animated.View 
          style={[
            styles.detailsCard, 
            { 
              transform: [{ translateY: contentTranslateY }],
              opacity: contentOpacity
            }
          ]}
        >
          <View style={styles.cardHeader}>
            <SectionHeader title="Sample Preparation Details" icon="test-tube" />
          </View>
          
          <Animated.View 
            style={[
              styles.formContainer,
              {
                opacity: formOpacity,
                transform: [{ translateX: formTranslateX }]
              }
            ]}
          >
            {/* Stain Information */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Stain Type</ThemedText>
              {editMode ? (
                <View style={styles.textInputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={sampleDetails.stainType}
                    onChangeText={(text) => updateField('stainType', text)}
                    placeholder="Enter stain type"
                    placeholderTextColor={Colors.light.placeholder}
                  />
                </View>
              ) : (
                <ThemedText>{sampleDetails.stainType}</ThemedText>
              )}
            </View>
            
            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Stain Time</ThemedText>
              {editMode ? (
                <View style={styles.textInputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={sampleDetails.stainTime}
                    onChangeText={(text) => updateField('stainTime', text)}
                    placeholder="Enter stain time"
                    placeholderTextColor={Colors.light.placeholder}
                  />
                </View>
              ) : (
                <ThemedText>{sampleDetails.stainTime}</ThemedText>
              )}
            </View>
            
            {/* Microscope Settings */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Microscope</ThemedText>
              {editMode ? (
                <View>
                  <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => {
                      setShowMicroscopeOptions(!showMicroscopeOptions);
                      if (showObjectiveOptions) setShowObjectiveOptions(false);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <ThemedText>{sampleDetails.microscope}</ThemedText>
                    <Ionicons name={showMicroscopeOptions ? "chevron-up" : "chevron-down"} size={16} color={Colors.light.secondary} />
                  </TouchableOpacity>
                  
                  <LocalCollapsible collapsed={!showMicroscopeOptions}>
                    <View style={styles.optionsContainer}>
                      {MicroscopeOptions.map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={styles.optionItem}
                          onPress={() => updateMicroscope(option)}
                        >
                          <ThemedText style={option === sampleDetails.microscope ? styles.selectedOption : {}}>
                            {option}
                          </ThemedText>
                          {option === sampleDetails.microscope && (
                            <Ionicons name="checkmark" size={16} color={Colors.light.primary} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </LocalCollapsible>
                </View>
              ) : (
                <ThemedText>{sampleDetails.microscope}</ThemedText>
              )}
            </View>
            
            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Objective</ThemedText>
              {editMode ? (
                <View>
                  <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => {
                      setShowObjectiveOptions(!showObjectiveOptions);
                      if (showMicroscopeOptions) setShowMicroscopeOptions(false);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <ThemedText>{selectedObjective}</ThemedText>
                    <Ionicons name={showObjectiveOptions ? "chevron-up" : "chevron-down"} size={16} color={Colors.light.secondary} />
                  </TouchableOpacity>
                  
                  <LocalCollapsible collapsed={!showObjectiveOptions}>
                    <View style={styles.optionsContainer}>
                      {ObjectiveOptions.map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={styles.optionItem}
                          onPress={() => updateObjective(option)}
                        >
                          <ThemedText style={option === selectedObjective ? styles.selectedOption : {}}>
                            {option}
                          </ThemedText>
                          {option === selectedObjective && (
                            <Ionicons name="checkmark" size={16} color={Colors.light.primary} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </LocalCollapsible>
                </View>
              ) : (
                <ThemedText>{sampleDetails.objective}</ThemedText>
              )}
            </View>
            
            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Field Count</ThemedText>
              {editMode ? (
                <View style={styles.textInputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={sampleDetails.fieldCount}
                    onChangeText={(text) => updateField('fieldCount', text)}
                    placeholder="Enter field count"
                    placeholderTextColor={Colors.light.placeholder}
                    keyboardType="number-pad"
                  />
                </View>
              ) : (
                <ThemedText>{sampleDetails.fieldCount}</ThemedText>
              )}
            </View>
            
            {/* Quality Check */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Quality Check</ThemedText>
              {editMode ? (
                <View style={styles.qualityOptions}>
                  {QualityOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.qualityOption,
                        option === selectedQuality && styles.selectedQualityOption,
                        option === 'Passed' && styles.passedOption,
                        option === 'Failed' && styles.failedOption,
                        option === 'Needs review' && styles.reviewOption,
                      ]}
                      onPress={() => updateQualityCheck(option)}
                    >
                      <ThemedText 
                        style={[
                          option === selectedQuality ? styles.selectedQualityText : styles.qualityText,
                          option === 'Passed' && styles.passedText,
                          option === 'Failed' && styles.failedText,
                          option === 'Needs review' && styles.reviewText,
                        ]}
                      >
                        {option}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={[
                  styles.qualityDisplay,
                  sampleDetails.qualityCheck === 'Passed' && styles.passedDisplay,
                  sampleDetails.qualityCheck === 'Failed' && styles.failedDisplay,
                  sampleDetails.qualityCheck === 'Needs review' && styles.reviewDisplay,
                ]}>
                  <Ionicons 
                    name={
                      sampleDetails.qualityCheck === 'Passed' ? 'checkmark-circle' : 
                      sampleDetails.qualityCheck === 'Failed' ? 'close-circle' : 'help-circle'
                    } 
                    size={16} 
                    color={
                      sampleDetails.qualityCheck === 'Passed' ? Colors.light.success : 
                      sampleDetails.qualityCheck === 'Failed' ? Colors.light.error : Colors.light.warning
                    } 
                    style={{ marginRight: 6 }}
                  />
                  <ThemedText 
                    style={{
                      color: sampleDetails.qualityCheck === 'Passed' ? Colors.light.success : 
                      sampleDetails.qualityCheck === 'Failed' ? Colors.light.error : Colors.light.warning
                    }}
                  >
                    {sampleDetails.qualityCheck}
                  </ThemedText>
                </View>
              )}
            </View>
            
            {/* Notes */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Notes</ThemedText>
              {editMode ? (
                <View style={[styles.textInputContainer, styles.textAreaContainer]}>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={sampleDetails.notes}
                    onChangeText={(text) => updateField('notes', text)}
                    placeholder="Enter any additional notes about the sample"
                    placeholderTextColor={Colors.light.placeholder}
                    multiline={true}
                    numberOfLines={4}
                  />
                </View>
              ) : (
                <ThemedText style={styles.notesText}>
                  {sampleDetails.notes || "No notes provided"}
                </ThemedText>
              )}
            </View>
          </Animated.View>
        </Animated.View>
        
        {/* Additional spacing to account for bottom button */}
        <View style={{ height: 100 }} />
      </ScrollView>
      
      {/* Bottom action button */}
      {!keyboardVisible && (
        <BlurView 
          intensity={80} 
          tint="light" 
          style={[
            styles.bottomBar, 
            { paddingBottom: insets.bottom || 16 }
          ]}
        >
          <TouchableOpacity 
            style={[
              styles.actionButton,
              sampleDetails.qualityCheck !== 'Passed' && styles.disabledButton
            ]}
            onPress={handleProceedToCapture}
            disabled={sampleDetails.qualityCheck !== 'Passed'}
          >
            <LinearGradient
              colors={
                sampleDetails.qualityCheck === 'Passed' 
                  ? [Colors.light.primary, Colors.light.primaryDark] 
                  : ['#94a3b8', '#64748b']
              }
              style={styles.actionButtonGradient}
            >
              <Ionicons name="camera" size={20} color="#fff" style={{ marginRight: 8 }} />
              <ThemedText style={styles.actionButtonText}>
                Proceed to Image Capture
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 200,
    zIndex: -1,
  },
  headerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  priorityBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  priorityText: {
    color: '#ffffff',
    fontWeight: '700',
    marginLeft: 6,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    marginTop: 16,
  },
  sampleIdText: {
    marginBottom: 8,
  },
  patientPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientInitials: {
    color: Colors.light.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(226, 232, 240, 0.8)',
    marginVertical: 12,
  },
  patientSection: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    flex: 1,
  },
  infoValue: {
    flex: 2,
    textAlign: 'right',
  },
  detailsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    marginLeft: 8,
  },
  formContainer: {
    gap: 16,
  },
  formGroup: {
    gap: 6,
  },
  formLabel: {
    marginBottom: 4,
    fontSize: 14,
  },
  textInputContainer: {
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 1)',
    borderRadius: 10,
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  textInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.light.text,
  },
  textAreaContainer: {
    minHeight: 100,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  qualityOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  qualityOption: {
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  qualityText: {
    color: Colors.light.text,
  },
  selectedQualityOption: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary,
  },
  selectedQualityText: {
    color: Colors.light.primary,
    fontWeight: '500',
  },
  passedOption: {
    borderColor: Colors.light.success,
    backgroundColor: Colors.light.successLight,
  },
  passedText: {
    color: Colors.light.success,
  },
  failedOption: {
    borderColor: Colors.light.error,
    backgroundColor: Colors.light.errorLight,
  },
  failedText: {
    color: Colors.light.error,
  },
  reviewOption: {
    borderColor: Colors.light.warning,
    backgroundColor: Colors.light.warningLight,
  },
  reviewText: {
    color: Colors.light.warning,
  },
  qualityDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: Colors.light.secondaryLight,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  passedDisplay: {
    backgroundColor: Colors.light.successLight,
  },
  failedDisplay: {
    backgroundColor: Colors.light.errorLight,
  },
  reviewDisplay: {
    backgroundColor: Colors.light.warningLight,
  },
  notesText: {
    lineHeight: 20,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
  },
  optionsContainer: {
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 1)',
    borderRadius: 10,
    marginTop: 4,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.6)',
  },
  selectedOption: {
    color: Colors.light.primary,
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.8)',
    overflow: 'hidden',
  },
  actionButton: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  actionButtonText: {
    color: '#ffffff',
  },
  disabledButton: {
    opacity: 0.8,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#ffffff',
    fontWeight: '500',
  },
});