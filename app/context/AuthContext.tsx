// app/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

export type UserRole = 'lab_technician' | 'doctor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  hasFaceId: boolean;
  lastLogin: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithFace: (faceData: any) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  setupFaceId: (faceData: any) => Promise<boolean>;
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Enhanced mock user data
const mockUsers = [
  {
    id: '1',
    name: 'Lab Tech',
    email: 'lab@example.com',
    password: 'password123',
    role: 'lab_technician' as UserRole,
    hasFaceId: false,
    faceData: null,
    lastLogin: ''
  },
  {
    id: '2',
    name: 'Doctor',
    email: 'doctor@example.com',
    password: 'password123',
    role: 'doctor' as UserRole,
    hasFaceId: false,
    faceData: null,
    lastLogin: ''
  },
  {
    id: '3',
    name: 'Admin',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin' as UserRole,
    hasFaceId: false,
    faceData: null,
    lastLogin: ''
  }
];

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session and onboarding status on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if onboarding was completed
        const onboardingStatus = await SecureStore.getItemAsync('onboardingCompleted');
        setHasCompletedOnboarding(onboardingStatus === 'true');
        
        // Check for existing user session
        const userJson = await SecureStore.getItemAsync('user');
        if (userJson) {
          const parsedUser = JSON.parse(userJson);
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to load authentication state', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const completeOnboarding = async () => {
    await SecureStore.setItemAsync('onboardingCompleted', 'true');
    setHasCompletedOnboarding(true);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const foundUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (foundUser) {
        const userData: User = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role,
          hasFaceId: foundUser.hasFaceId,
          lastLogin: new Date().toISOString()
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        await SecureStore.setItemAsync('user', JSON.stringify(userData));
        
        // Update mock data with last login (in a real app, this would be a server API call)
        const index = mockUsers.findIndex(u => u.id === foundUser.id);
        if (index !== -1) {
          mockUsers[index].lastLogin = new Date().toISOString();
        }
        
        return true;
      } else {
        Alert.alert('Login Failed', 'Invalid email or password');
        return false;
      }
    } catch (error) {
      console.error('Login error', error);
      Alert.alert('Login Error', 'An error occurred during login');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithFace = async (faceData: any): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate face recognition verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // This would be replaced with actual face recognition comparison
      const foundUser = mockUsers.find(u => u.hasFaceId && u.faceData);
      
      if (foundUser) {
        const userData: User = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role,
          hasFaceId: true,
          lastLogin: new Date().toISOString()
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        await SecureStore.setItemAsync('user', JSON.stringify(userData));
        
        // Update mock user's last login
        const index = mockUsers.findIndex(u => u.id === foundUser.id);
        if (index !== -1) {
          mockUsers[index].lastLogin = new Date().toISOString();
        }
        
        return true;
      } else {
        Alert.alert('Face ID Failed', 'Could not recognize face');
        return false;
      }
    } catch (error) {
      console.error('Face login error', error);
      Alert.alert('Face ID Error', 'An error occurred during face recognition');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      if (mockUsers.some(u => u.email === email)) {
        Alert.alert('Registration Failed', 'Email already in use');
        return false;
      }
      
      // Create new user (in a real app, this would be an API call)
      const newUser = {
        id: String(mockUsers.length + 1),
        name,
        email,
        password,
        role,
        hasFaceId: false,
        faceData: null,
        lastLogin: new Date().toISOString()
      };
      
      // In a real app, this would be stored in the backend
      mockUsers.push(newUser);
      
      // Store email and password temporarily for face setup
      await SecureStore.setItemAsync('tempUserEmail', email);
      await SecureStore.setItemAsync('tempUserPassword', password);
      
      return true;
    } catch (error) {
      console.error('Registration error', error);
      Alert.alert('Registration Error', 'An error occurred during registration');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const setupFaceId = async (faceData: any): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Get the email from temporary storage
      const email = await SecureStore.getItemAsync('tempUserEmail');
      
      if (!email) {
        Alert.alert('Error', 'No user information found');
        return false;
      }
      
      // Find the user by email
      const userIndex = mockUsers.findIndex(u => u.email === email);
      
      if (userIndex !== -1) {
        mockUsers[userIndex].hasFaceId = true;
        mockUsers[userIndex].faceData = faceData;
        
        // Clear temporary storage
        await SecureStore.deleteItemAsync('tempUserEmail');
        await SecureStore.deleteItemAsync('tempUserPassword');
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Face setup error', error);
      Alert.alert('Face ID Setup Error', 'An error occurred while setting up Face ID');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetOnboarding = async () => {
    setHasCompletedOnboarding(false);
    await SecureStore.deleteItemAsync('onboardingCompleted');
    console.log("Onboarding status reset");
  };

  const logout = async () => {
    // Clear user data
    setUser(null);
    setIsAuthenticated(false);
    
    // Reset onboarding status to show welcome screen again
    setHasCompletedOnboarding(false);
    
    // Clear secure storage
    await SecureStore.deleteItemAsync('user');
    await SecureStore.deleteItemAsync('onboardingCompleted');
    
    // Route to welcome screen (index)
    router.replace('/');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      login,
      loginWithFace,
      register,
      logout,
      setupFaceId,
      hasCompletedOnboarding,
      completeOnboarding,
      resetOnboarding
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Add a default export - this is what's missing
export default { AuthProvider, useAuth };