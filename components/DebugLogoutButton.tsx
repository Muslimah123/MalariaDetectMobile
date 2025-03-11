// components/DebugLogoutButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useAuth } from '../app/context/AuthContext';
import { router } from 'expo-router';

// Use this component temporarily for debugging
export const DebugLogoutButton = () => {
  const { logout } = useAuth();
  
  const handleForceLogout = () => {
    console.log("Force logout triggered");
    logout();
  };
  
  const handleForceRedirect = () => {
    console.log("Force redirect to welcome screen");
    router.replace('/');
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button}
        onPress={handleForceLogout}
      >
        <Text style={styles.buttonText}>Debug: Force Logout</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.redirectButton]}
        onPress={handleForceRedirect}
      >
        <Text style={styles.buttonText}>Debug: Go to Welcome</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  redirectButton: {
    backgroundColor: 'blue',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});