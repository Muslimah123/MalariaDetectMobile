import React, { useEffect, useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  Animated, 
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Platform,
  ImageBackground,
  Dimensions
} from 'react-native';
import { router } from 'expo-router';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// Components
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import ParallaxScrollView from '../../components/ParallaxScrollView';
import { HapticTab } from '../../components/HapticTab';

// Constants
import { Colors } from '../../constants/Colors';
import { mockSamples } from '../../constants/MockData';

const { width } = Dimensions.get('window');

// Sample type definition
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

const SampleCard = ({ sample, onPress }: { sample: Sample, onPress: () => void }) => {
  const translateY = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const urgentBorderStyle = sample.priority === 'Urgent' 
    ? { borderLeftWidth: 4, borderLeftColor: Colors.light.error } 
    : {};
    
  const statusColor = 
    sample.status === 'Ready for analysis' ? Colors.light.primary : 
    sample.status === 'Completed' ? Colors.light.success : 
    Colors.light.warning;

  return (
    <Animated.View style={{ transform: [{ translateY }], opacity }}>
      <TouchableOpacity 
        style={[styles.sampleCard, urgentBorderStyle]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        activeOpacity={0.7}
      >
        {sample.priority === 'Urgent' && (
          <View style={styles.priorityTag}>
            <FontAwesome5 name="exclamation" size={10} color="#fff" />
          </View>
        )}
        
        <View style={styles.cardHeader}>
          <View style={styles.idContainer}>
            <MaterialCommunityIcons name="test-tube" size={16} color={Colors.light.primary} style={styles.idIcon} />
            <ThemedText type="defaultSemiBold">{sample.id}</ThemedText>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <ThemedText type="defaultSemiBold" style={{ color: statusColor, fontWeight: '600' }}>
              {sample.status}
            </ThemedText>
          </View>
        </View>

        <View style={styles.patientInfo}>
          <ThemedText type="defaultSemiBold">{sample.patientName}</ThemedText>
          <ThemedText type="default" lightColor={Colors.light.secondary}>ID: {sample.patientId}</ThemedText>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="blood-bag" size={14} color={Colors.light.secondary} />
            <ThemedText type="default" lightColor={Colors.light.secondary} style={styles.detailText}>
              {sample.sampleType}
            </ThemedText>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color={Colors.light.secondary} />
            <ThemedText type="default" lightColor={Colors.light.secondary} style={styles.detailText}>
              {sample.collectionTime.split(' ')[1]}
            </ThemedText>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <ThemedText type="default" lightColor={Colors.light.secondary}>{sample.labTechnician}</ThemedText>
          <Ionicons name="chevron-forward" size={16} color={Colors.light.secondary} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const FilterChip = ({ title, active, onPress }: { title: string, active: boolean, onPress: () => void }) => (
  <TouchableOpacity
    style={[
      styles.filterChip,
      active && styles.activeFilterChip
    ]}
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }}
    activeOpacity={0.7}
  >
    <ThemedText 
      type="default"
      style={[
        styles.filterChipText,
        active && styles.activeFilterChipText
      ]}
    >
      {title}
    </ThemedText>
    {active && (
      <View style={styles.activeFilterDot} />
    )}
  </TouchableOpacity>
);

interface Props {
  headerImage: React.ReactElement;
  headerBackgroundColor: {
    dark: string;
    light: string;
  };
  children: React.ReactNode;
  style?: any;
  refreshControl?: React.ReactElement;
  onScroll?: (event: any) => void;
  scrollEventThrottle?: number;
}

export default function SamplesScreen() {
  const insets = useSafeAreaInsets();
  const [samples, setSamples] = useState<Sample[]>(mockSamples);
  const [filteredSamples, setFilteredSamples] = useState<Sample[]>(mockSamples);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const searchInputRef = useRef<TextInput>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 160],
    outputRange: [220, 120],
    extrapolate: 'clamp',
  });
  
  const searchOpacity = scrollY.interpolate({
    inputRange: [0, 160],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  
  const titleScale = scrollY.interpolate({
    inputRange: [0, 160],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });
  
  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, 160],
    outputRange: [0, -20],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    filterSamples();
  }, [searchQuery, activeFilter]);

  const filterSamples = () => {
    let filtered = [...samples];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(sample => 
        sample.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sample.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sample.patientId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply tab filter
    if (activeFilter !== 'All') {
      if (activeFilter === 'Urgent') {
        filtered = filtered.filter(sample => sample.priority === 'Urgent');
      } else if (activeFilter === 'Ready') {
        filtered = filtered.filter(sample => sample.status === 'Ready for analysis');
      } else if (activeFilter === 'Completed') {
        filtered = filtered.filter(sample => sample.status === 'Completed');
      }
    }
    
    setFilteredSamples(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setSamples(mockSamples);
      setFilteredSamples(mockSamples);
      setRefreshing(false);
      
      // Display success animation or feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1500);
  };

  const handleSampleSelect = (sample: Sample) => {
    router.push(`/sample/${sample.id}`);
  };

  const handleAddSample = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/new-sample' as any);
  };

  const renderHeader = () => (
    <Animated.View style={[styles.headerContainer, { height: headerHeight }]}>
      <LinearGradient
        colors={['rgba(37, 99, 235, 0.8)', 'rgba(30, 64, 175, 0.95)']}
        style={styles.headerGradient}
      />
      
      <View style={[styles.headerContent, { paddingTop: insets.top + 10 }]}>
        <Animated.View style={[
          styles.titleContainer,
          { 
            transform: [
              { scale: titleScale },
              { translateY: titleTranslateY }
            ]
          }
        ]}>
          <ThemedText type="title" style={styles.headerTitle}>
            Blood Samples
          </ThemedText>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddSample}
          >
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.View style={[styles.searchContainer, { opacity: searchOpacity }]}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={18} color={Colors.light.secondary} style={styles.searchIcon} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search sample ID or patient"
              placeholderTextColor={Colors.light.placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={18} color={Colors.light.secondary} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
      
      <View style={styles.filterContainer}>
        <BlurView intensity={80} tint="light" style={styles.filterBlur}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.filtersScrollContent}
          >
            <FilterChip 
              title="All" 
              active={activeFilter === 'All'} 
              onPress={() => setActiveFilter('All')} 
            />
            <FilterChip 
              title="Urgent" 
              active={activeFilter === 'Urgent'} 
              onPress={() => setActiveFilter('Urgent')} 
            />
            <FilterChip 
              title="Ready" 
              active={activeFilter === 'Ready'} 
              onPress={() => setActiveFilter('Ready')} 
            />
            <FilterChip 
              title="In Progress" 
              active={activeFilter === 'In Progress'} 
              onPress={() => setActiveFilter('In Progress')} 
            />
            <FilterChip 
              title="Completed" 
              active={activeFilter === 'Completed'} 
              onPress={() => setActiveFilter('Completed')} 
            />
          </ScrollView>
        </BlurView>
      </View>
    </Animated.View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="test-tube-empty" size={60} color={Colors.light.secondary} />
      <ThemedText type="defaultSemiBold" style={styles.emptyText}>
        No samples found
      </ThemedText>
      <ThemedText lightColor="secondary" style={styles.emptySubtext}>
        {searchQuery 
          ? "Try adjusting your search criteria" 
          : "Samples you register will appear here"}
      </ThemedText>
      {searchQuery ? (
        <TouchableOpacity 
          style={styles.clearSearchButton}
          onPress={() => setSearchQuery('')}
        >
          <ThemedText style={styles.clearSearchText}>Clear Search</ThemedText>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={styles.addSampleButton}
          onPress={handleAddSample}
        >
          <Ionicons name="add" size={16} color="#fff" style={{ marginRight: 8 }} />
          <ThemedText style={styles.addSampleText}>Add New Sample</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
  
  const renderCountBadge = () => {
    if (filteredSamples.length === 0 || filteredSamples.length === samples.length) {
      return null;
    }
    
    return (
      <View style={styles.countBadgeContainer}>
        <ThemedText type="default" style={styles.countBadgeText}>
          Showing {filteredSamples.length} of {samples.length} samples
        </ThemedText>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ffffff"
            colors={[Colors.light.primary]}
          />
        }
        style={styles.scrollView}
      >
        <ParallaxScrollView
          headerImage={renderHeader()}
          headerBackgroundColor={{ dark: Colors.light.primary, light: Colors.light.primary }}
        >
          {renderCountBadge()}
  
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
              <ThemedText style={styles.loadingText}>Loading samples...</ThemedText>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {filteredSamples.length > 0 ? (
                filteredSamples.map((item) => (
                  <SampleCard 
                    key={item.id} 
                    sample={item} 
                    onPress={() => handleSampleSelect(item)} 
                  />
                ))
              ) : (
                renderEmpty()
              )}
            </View>
          )}
        </ParallaxScrollView>
  </ScrollView>
  
  <TouchableOpacity 
        style={[styles.fab, { bottom: insets.bottom + 16 }]}
        onPress={handleAddSample}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[Colors.light.primary, Colors.light.primaryDark]}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={26} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
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
  headerContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  headerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  headerContent: {
    paddingHorizontal: 20,
    flex: 1,
    justifyContent: 'space-between',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 28,
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    marginTop: 20,
    marginBottom: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: Colors.light.text,
  },
  clearButton: {
    padding: 6,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: -20,
    zIndex: 100,
  },
  filterBlur: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  filtersScrollContent: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 8,
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeFilterChip: {
    backgroundColor: Colors.light.primary,
  },
  filterChipText: {
    color: Colors.light.secondary,
  },
  activeFilterChipText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  activeFilterDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffffff',
    marginLeft: 6,
  },
  countBadgeContainer: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginHorizontal: 16,
    marginTop: 30,
    marginBottom: 6,
  },
  countBadgeText: {
    color: Colors.light.primary,
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 88,
  },
  sampleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  priorityTag: {
    position: 'absolute',
    top: 0,
    right: 20,
    width: 20,
    height: 20,
    backgroundColor: Colors.light.error,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  idIcon: {
    marginRight: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  patientInfo: {
    marginBottom: 12,
  },
  detailsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.8)',
    paddingTop: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 300,
  },
  loadingText: {
    marginTop: 12,
    color: Colors.light.secondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 60,
    marginBottom: 16,
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    textAlign: 'center',
    marginBottom: 24,
  },
  clearSearchButton: {
    backgroundColor: 'rgba(226, 232, 240, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearSearchText: {
    color: Colors.light.primary,
    fontWeight: '500',
  },
  addSampleButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addSampleText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 16,
    width: 58,
    height: 58,
    borderRadius: 29,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
  },
});