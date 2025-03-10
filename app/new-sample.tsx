import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Components
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';

// Constants
import { Colors } from '../constants/Colors';

interface FormField {
  value: string;
  error: string;
  required: boolean;
}

export default function NewSampleScreen() {
  const insets = useSafeAreaInsets();
  
  // Form state
  const [form, setForm] = useState({
    patientId: { value: '', error: '', required: true },
    patientName: { value: '', error: '', required: true },
    sampleType: { value: 'Thick blood smear', error: '', required: true },
    labTechnician: { value: '', error: '', required: true },
    priority: { value: 'Routine', error: '', required: true },
    notes: { value: '', error: '', required: false },
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Update form field
  const handleFieldChange = (field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: {
        ...prev[field as keyof typeof prev],
        value,
        error: '',
      }
    }));
  };
  
  // Toggle priority
  const togglePriority = () => {
    const newPriority = form.priority.value === 'Routine' ? 'Urgent' : 'Routine';
    handleFieldChange('priority', newPriority);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  
  // Validate form
  const validateForm = (): boolean => {
    let isValid = true;
    const newForm = { ...form };
    
    // Check required fields
    Object.keys(form).forEach(key => {
      const field = form[key as keyof typeof form];
      if (field.required && !field.value.trim()) {
        newForm[key as keyof typeof form] = {
          ...field,
          error: 'This field is required',
        };
        isValid = false;
      }
    });
    
    setForm(newForm);
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      
      // Generate a unique ID for the new sample
      const newSampleId = `SM${new Date().getTime().toString().slice(-8)}`;
      
      // Success notification
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Navigate to the new sample's detail page
      router.push(`/sample/${newSampleId}`);
    }, 1500);
  };
  
  // Cancel and go back
  const handleCancel = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Register New Sample',
          headerBackTitle: 'Cancel',
        }} 
      />
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <MaterialCommunityIcons name="test-tube" size={22} color={Colors.light.primary} />
              <ThemedText type="title" style={styles.formTitle}>
                Sample Information
              </ThemedText>
            </View>
            
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Patient ID</ThemedText>
              <TextInput
                style={[styles.input, form.patientId.error ? styles.inputError : {}]}
                value={form.patientId.value}
                onChangeText={(text) => handleFieldChange('patientId', text)}
                placeholder="Enter patient ID"
                placeholderTextColor={Colors.light.placeholder}
              />
              {form.patientId.error ? (
                <ThemedText style={styles.errorText}>
                  {form.patientId.error}
                </ThemedText>
              ) : null}
            </View>
            
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Patient Name</ThemedText>
              <TextInput
                style={[styles.input, form.patientName.error ? styles.inputError : {}]}
                value={form.patientName.value}
                onChangeText={(text) => handleFieldChange('patientName', text)}
                placeholder="Enter patient name"
                placeholderTextColor={Colors.light.placeholder}
              />
              {form.patientName.error ? (
                <ThemedText style={styles.errorText}>
                  {form.patientName.error}
                </ThemedText>
              ) : null}
            </View>
            
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Sample Type</ThemedText>
              <View style={styles.segmentedControl}>
                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    form.sampleType.value === 'Thick blood smear' && styles.activeSegment
                  ]}
                  onPress={() => handleFieldChange('sampleType', 'Thick blood smear')}
                >
                  <ThemedText 
                    style={[
                      styles.segmentText,
                      form.sampleType.value === 'Thick blood smear' && styles.activeSegmentText
                    ]}
                  >
                    Thick Smear
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    form.sampleType.value === 'Thin blood smear' && styles.activeSegment
                  ]}
                  onPress={() => handleFieldChange('sampleType', 'Thin blood smear')}
                >
                  <ThemedText 
                    style={[
                      styles.segmentText,
                      form.sampleType.value === 'Thin blood smear' && styles.activeSegmentText
                    ]}
                  >
                    Thin Smear
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Lab Technician</ThemedText>
              <TextInput
                style={[styles.input, form.labTechnician.error ? styles.inputError : {}]}
                value={form.labTechnician.value}
                onChangeText={(text) => handleFieldChange('labTechnician', text)}
                placeholder="Enter lab technician name"
                placeholderTextColor={Colors.light.placeholder}
              />
              {form.labTechnician.error ? (
                <ThemedText style={styles.errorText}>
                  {form.labTechnician.error}
                </ThemedText>
              ) : null}
            </View>
            
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Priority</ThemedText>
              <TouchableOpacity 
                style={styles.priorityToggle}
                onPress={togglePriority}
              >
                <View style={[
                  styles.priorityTrack,
                  form.priority.value === 'Urgent' && styles.urgentTrack
                ]}>
                  <View style={[
                    styles.priorityThumb,
                    form.priority.value === 'Urgent' && styles.urgentThumb
                  ]} />
                </View>
                <ThemedText style={styles.priorityLabel}>
                  {form.priority.value}
                </ThemedText>
                {form.priority.value === 'Urgent' && (
                  <View style={styles.urgentBadge}>
                    <Ionicons name="alert" size={12} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Notes (Optional)</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.notes.value}
                onChangeText={(text) => handleFieldChange('notes', text)}
                placeholder="Enter any additional notes"
                placeholderTextColor={Colors.light.placeholder}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>
        
        <View style={[styles.buttonContainer, { paddingBottom: insets.bottom || 16 }]}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <ThemedText style={styles.submitButtonText}>Register Sample</ThemedText>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  formTitle: {
    marginLeft: 8,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    color: Colors.light.text,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.light.text,
    backgroundColor: Colors.light.background,
  },
  inputError: {
    borderColor: Colors.light.error,
  },
  errorText: {
    color: Colors.light.error,
    marginTop: 4,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 8,
    backgroundColor: Colors.light.secondaryLight,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeSegment: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  segmentText: {
    color: Colors.light.secondary,
  },
  activeSegmentText: {
    color: Colors.light.primary,
    fontWeight: '500',
  },
  priorityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityTrack: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.secondaryLight,
    padding: 3,
  },
  urgentTrack: {
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
  },
  priorityThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.light.secondary,
  },
  urgentThumb: {
    backgroundColor: Colors.light.error,
    transform: [{ translateX: 22 }],
  },
  priorityLabel: {
    marginLeft: 12,
    fontSize: 15,
  },
  urgentBadge: {
    marginLeft: 8,
    backgroundColor: Colors.light.error,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: Colors.light.text,
  },
  submitButton: {
    flex: 2,
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});