// import { Tabs } from 'expo-router';
// import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// import { Colors } from '../../constants/Colors';
// import { LogoutButton } from '../../components/LogoutButton';
// import React from 'react';


// export default function TabLayout() {
//   return (
//     <Tabs
//       screenOptions={{
//         tabBarActiveTintColor: Colors.light.primary,
//         headerRight: () => (
//           <LogoutButton 
//             type="icon" 
//             color={Colors.light.primary} 
//             size={24} 
//           />
//         ),
//       }}
//     >
//     // <Tabs
//     //   screenOptions={{
//     //     tabBarActiveTintColor: Colors.light.primary,
//     //     tabBarInactiveTintColor: Colors.light.secondary,
//     //     headerShown: true,
//     //   }}
//     // >
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: 'Dashboard',
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="home-outline" color={color} size={size} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="samples"
//         options={{
//           title: 'Samples',
//           tabBarIcon: ({ color, size }) => (
//             <MaterialCommunityIcons name="test-tube-empty" color={color} size={size} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="explore"
//         options={{
//           title: 'Explore',
//           tabBarIcon: ({ color, size }) => (
//             <Ionicons name="search" color={color} size={size} />
//           ),
//         }}
//       />
//     </Tabs>
//   );
// }
// app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { LogoutButton } from '../../components/LogoutButton';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.secondary,
        headerShown: true,
        headerRight: () => (
          <LogoutButton 
            type="icon" 
            color={Colors.light.primary} 
            size={24} 
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="samples"
        options={{
          title: 'Samples',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="test-tube-empty" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}