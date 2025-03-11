// components/LogoutButton.tsx
import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Components
import { ThemedText } from './ThemedText';
import { LogoutModal } from './LogoutModal';

// Constants
import { Colors } from '../constants/Colors';

interface LogoutButtonProps {
  type?: 'icon' | 'text' | 'full';
  color?: string;
  size?: number;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  type = 'icon', 
  color = '#fff',
  size = 24 
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalVisible(true);
  };

  if (type === 'icon') {
    return (
      <>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handlePress}
        >
          <Ionicons name="log-out-outline" size={size} color={color} />
        </TouchableOpacity>
        
        <LogoutModal 
          visible={modalVisible} 
          onClose={() => setModalVisible(false)} 
        />
      </>
    );
  }
  
  if (type === 'text') {
    return (
      <>
        <TouchableOpacity
          style={styles.textButton}
          onPress={handlePress}
        >
          <ThemedText style={{ color: color }}>Logout</ThemedText>
        </TouchableOpacity>
        
        <LogoutModal 
          visible={modalVisible} 
          onClose={() => setModalVisible(false)} 
        />
      </>
    );
  }
  
  // Full button with text and icon
  return (
    <>
      <TouchableOpacity
        style={styles.fullButton}
        onPress={handlePress}
      >
        <Ionicons name="log-out-outline" size={size} color={color} style={styles.buttonIcon} />
        <ThemedText style={{ color: color }}>Logout</ThemedText>
      </TouchableOpacity>
      
      <LogoutModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
      />
    </>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    padding: 8,
  },
  textButton: {
    padding: 8,
  },
  fullButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
});