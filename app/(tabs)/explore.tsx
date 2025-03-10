import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  FlatList
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

// Components
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';

// Constants
import {Colors} from '../../constants/Colors';

const { width, height } = Dimensions.get('window');

// Educational categories
const CATEGORIES = [
  {
    id: 'species',
    title: 'Malaria Species',
    icon: 'bacteria',
    color: '#e74c3c',
    description: 'Learn about the different species of malaria parasites and their characteristics'
  },
  {
    id: 'lifecycle',
    title: 'Parasite Lifecycle',
    icon: 'repeat',
    color: '#3498db',
    description: 'Understand the lifecycle stages of malaria parasites in human hosts'
  },
  {
    id: 'diagnosis',
    title: 'Diagnostic Methods',
    icon: 'microscope',
    color: '#2ecc71',
    description: 'Explore different techniques for malaria diagnosis and detection'
  },
  {
    id: 'treatment',
    title: 'Treatment Protocols',
    icon: 'pill',
    color: '#9b59b6',
    description: 'Current guidelines and protocols for treating malaria infections'
  }
];

// Reference library items
const REFERENCE_ITEMS = [
  {
    id: 'pf',
    title: 'P. falciparum',
    image: 'https://via.placeholder.com/150',
    type: 'species'
  },
  {
    id: 'pv',
    title: 'P. vivax',
    image: 'https://via.placeholder.com/150',
    type: 'species'
  },
  {
    id: 'pm',
    title: 'P. malariae',
    image: 'https://via.placeholder.com/150',
    type: 'species'
  },
  {
    id: 'po',
    title: 'P. ovale',
    image: 'https://via.placeholder.com/150',
    type: 'species'
  },
  {
    id: 'ring',
    title: 'Ring Stage',
    image: 'https://via.placeholder.com/150',
    type: 'lifecycle'
  },
  {
    id: 'trophozoite',
    title: 'Trophozoite',
    image: 'https://via.placeholder.com/150',
    type: 'lifecycle'
  },
  {
    id: 'schizont',
    title: 'Schizont',
    image: 'https://via.placeholder.com/150',
    type: 'lifecycle'
  },
  {
    id: 'gametocyte',
    title: 'Gametocyte',
    image: 'https://via.placeholder.com/150',
    type: 'lifecycle'
  }
];

// Latest research articles
const RESEARCH_ARTICLES = [
  {
    id: '1',
    title: 'Advances in Automated Malaria Detection using AI',
    journal: 'Journal of Medical Diagnostics',
    date: 'March 2025',
    snippet: 'Recent developments in deep learning have improved detection accuracy to over 95% in field conditions.'
  },
  {
    id: '2',
    title: 'Comparison of Detection Methods for Low-Parasitemia Infections',
    journal: 'Tropical Medicine International',
    date: 'February 2025',
    snippet: 'Study finds automated detection systems outperform manual methods for detecting early-stage infections.'
  },
  {
    id: '3',
    title: 'Field Validation of Portable Detection Systems',
    journal: 'Global Health Technology',
    date: 'January 2025',
    snippet: 'Mobile detection systems show promise in resource-limited settings across sub-Saharan Africa.'
  }
];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState('species');
  const [filteredReferenceItems, setFilteredReferenceItems] = useState(
    REFERENCE_ITEMS.filter(item => item.type === 'species')
  );
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = useRef(new Animated.Value(180)).current;
  
  useEffect(() => {
    // Filter reference items based on active category
    setFilteredReferenceItems(
      REFERENCE_ITEMS.filter(item => item.type === activeCategory)
    );
  }, [activeCategory]);
  
  // Handle scrolling animations
  useEffect(() => {
    const listenerId = scrollY.addListener(({ value }) => {
      const newHeight = Math.max(100, 180 - value);
      headerHeight.setValue(newHeight);
    });
    
    return () => {
      scrollY.removeListener(listenerId);
    };
  }, []);
  
  // Handle category selection
  const handleCategoryPress = (categoryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveCategory(categoryId);
  };
  
  // Handle reference item press
  const handleReferenceItemPress = (item: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/reference/${item.id}` as any);
  };
  
  // Handle article press
  const handleArticlePress = (article: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/article/${article.id}` as any);
  };
  
  // Render header with search and categories
  const renderHeader = () => {
    return (
      <Animated.View 
        style={[
          styles.headerContainer,
          { height: headerHeight }
        ]}
      >
        <View style={styles.searchContainer}>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => router.push('/search' as any)}
          >
            <Ionicons name="search" size={20} color={Colors.light.secondary} />
            <ThemedText lightColor="secondary" darkColor="secondary" style={styles.searchPlaceholder}>
              Search reference library...
            </ThemedText>
          </TouchableOpacity>
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                activeCategory === category.id && styles.activeCategoryButton
              ]}
              onPress={() => handleCategoryPress(category.id)}
            >
              <MaterialCommunityIcons 
                name={category.icon as any} 
                size={22} 
                color={activeCategory === category.id ? '#fff' : category.color} 
                style={styles.categoryIcon}
              />
              <ThemedText 
                style={[
                  styles.categoryText,
                  activeCategory === category.id && styles.activeCategoryText
                ]}
              >
                {category.title}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    );
  };
  
  // Render reference library
  const renderReferenceLibrary = () => {
    const selectedCategory = CATEGORIES.find(c => c.id === activeCategory);
    
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <ThemedText type="title" style={styles.sectionTitle}>
            Reference Library
          </ThemedText>
          <TouchableOpacity onPress={() => router.push('/library' as any)}>
            <ThemedText type="default" lightColor="primary" darkColor="primary">View All</ThemedText>
          </TouchableOpacity>
        </View>
        
        <ThemedText lightColor="secondary" darkColor="secondary" style={styles.categoryDescription}>
          {selectedCategory?.description}
        </ThemedText>
        
        <View style={styles.referenceGrid}>
          {filteredReferenceItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.referenceItem}
              onPress={() => handleReferenceItemPress(item)}
            >
              <Image
                source={{ uri: item.image }}
                style={styles.referenceImage}
                resizeMode="cover"
              />
              <View style={styles.referenceItemOverlay}>
                <BlurView intensity={60} tint="dark" style={styles.referenceItemBlur}>
                  <ThemedText type="defaultSemiBold" style={styles.referenceItemTitle}>
                    {item.title}
                  </ThemedText>
                </BlurView>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };
  
  // Render interactive tools
  const renderInteractiveTools = () => {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <ThemedText type="title" style={styles.sectionTitle}>
            Interactive Tools
          </ThemedText>
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.toolsContainer}
        >
          <TouchableOpacity 
            style={styles.toolCard}
            onPress={() => router.push('/tools/compare' as any)}
          >
            <LinearGradient
              colors={['#3498db', '#2980b9']}
              style={styles.toolGradient}
            >
              <Ionicons name="git-compare" size={32} color="#fff" style={styles.toolIcon} />
              <ThemedText style={[styles.toolTitle, { fontWeight: '600' }]}>
                Species Comparison
              </ThemedText>
              <ThemedText type="subtitle" style={styles.toolDescription}>
                Compare different malaria species side by side
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.toolCard}
            onPress={() => router.push('/tools/lifecycle' as any)}
          >
            <LinearGradient
              colors={['#2ecc71', '#27ae60']}
              style={styles.toolGradient}
            >
              <Ionicons name="sync" size={32} color="#fff" style={styles.toolIcon} />
              <ThemedText type="defaultSemiBold" style={styles.toolTitle}>
                Lifecycle Viewer
              </ThemedText>
              <ThemedText type="subtitle" style={styles.toolDescription}>
                Explore the parasite lifecycle stages in detail
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.toolCard}
            onPress={() => router.push('/tools/identification' as any)}
          >
            <LinearGradient
              colors={['#e74c3c', '#c0392b']}
              style={styles.toolGradient}
            >
              <MaterialCommunityIcons name="microscope" size={32} color="#fff" style={styles.toolIcon} />
              <ThemedText type="defaultSemiBold" style={styles.toolTitle}>
                Identification Guide
              </ThemedText>
              <ThemedText type="subtitle" style={styles.toolDescription}>
                Learn to identify different parasite forms
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };
  
  // Render latest research
  const renderLatestResearch = () => {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <ThemedText type="title" style={styles.sectionTitle}>
            Latest Research
          </ThemedText>
          <TouchableOpacity onPress={() => router.push('/research' as any)}>
            <ThemedText type="default" lightColor="primary" darkColor="primary">View All</ThemedText>
          </TouchableOpacity>
        </View>
        
        <View style={styles.articleList}>
          {RESEARCH_ARTICLES.map((article) => (
            <TouchableOpacity
              key={article.id}
              style={styles.articleCard}
              onPress={() => handleArticlePress(article)}
            >
              <View style={styles.articleContent}>
                <ThemedText type="defaultSemiBold" style={styles.articleTitle}>
                  {article.title}
                </ThemedText>
                <View style={styles.articleMeta}>
                  <ThemedText type="subtitle" lightColor="secondary" darkColor="secondary" style={styles.articleJournal}>
                    {article.journal}
                  </ThemedText>
                  <ThemedText type="subtitle" lightColor="secondary" darkColor="secondary" style={styles.articleDate}>
                    {article.date}
                  </ThemedText>
                </View>
                <ThemedText type="subtitle" lightColor="secondary" darkColor="secondary" style={styles.articleSnippet}>
                  {article.snippet}
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.light.secondary} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Animated header */}
      {renderHeader()}
      
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: 190 } // To account for absolute positioned header
        ]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* Reference library */}
        {renderReferenceLibrary()}
        
        {/* Interactive tools */}
        {renderInteractiveTools()}
        
        {/* Latest research */}
        {renderLatestResearch()}
        
        {/* Extra space at bottom */}
        <View style={{ height: insets.bottom + 20 }} />
      </Animated.ScrollView>
    </ThemedView>
  );
}

// Add the LinearGradient component
const LinearGradient = ({ colors, style, children }: any) => (
  <View style={[style, { backgroundColor: colors[0] }]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    zIndex: 1000,
    paddingHorizontal: 16,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  searchContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.secondaryLight,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchPlaceholder: {
    marginLeft: 8,
  },
  categoriesContainer: {
    paddingBottom: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.secondaryLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  activeCategoryButton: {
    backgroundColor: Colors.light.primary,
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
  },
  activeCategoryText: {
    color: '#fff',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    
  },
  categoryDescription: {
    marginBottom: 16,
  },
  referenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  referenceItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
    height: 140,
    position: 'relative',
  },
  referenceImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  referenceItemOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    right: 8,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
  },
  referenceItemBlur: {
    padding: 8,
  },
  referenceItemTitle: {
    color: '#fff',
    textAlign: 'center',
  },
  toolsContainer: {
    paddingVertical: 8,
  },
  toolCard: {
    width: 160,
    height: 180,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  toolGradient: {
    width: '100%',
    height: '100%',
    padding: 16,
    justifyContent: 'space-between',
  },
  toolIcon: {
    marginBottom: 8,
  },
  toolTitle: {
    color: '#fff',
    marginBottom: 4,
  },
  toolDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  articleList: {
    
  },
  articleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  articleContent: {
    flex: 1,
    marginRight: 8,
  },
  articleTitle: {
    marginBottom: 6,
  },
  articleMeta: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  articleJournal: {
    flex: 1,
    marginRight: 8,
  },
  articleDate: {
    
  },
  articleSnippet: {
    
  },
});