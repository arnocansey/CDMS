import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';

import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import MembersScreen from '../screens/Members/MembersScreen';
import MemberDetailScreen from '../screens/Members/MemberDetailScreen';
import AttendanceScreen from '../screens/Attendance/AttendanceScreen';
import FinanceScreen from '../screens/Finance/FinanceScreen';
import EventsScreen from '../screens/Events/EventsScreen';
import EventDetailScreen from '../screens/Events/EventDetailScreen';
import AnnouncementsScreen from '../screens/Announcements/AnnouncementsScreen';
import PrayerRequestsScreen from '../screens/PrayerRequests/PrayerRequestsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Members':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Finance':
              iconName = focused ? 'cash' : 'cash-outline';
              break;
            case 'Events':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'More':
              iconName = focused ? 'menu' : 'menu-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1e40af',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Members" component={MembersScreen} />
      <Tab.Screen name="Finance" component={FinanceScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}

function MoreScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MoreMenu" component={MoreMenuScreen} />
      <Stack.Screen name="Attendance" component={AttendanceScreen} />
      <Stack.Screen name="Announcements" component={AnnouncementsScreen} />
      <Stack.Screen name="PrayerRequests" component={PrayerRequestsScreen} />
    </Stack.Navigator>
  );
}

function MoreMenuScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('Attendance')}>
        <Text>Attendance</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Announcements')}>
        <Text>Announcements</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('PrayerRequests')}>
        <Text>Prayer Requests</Text>
      </TouchableOpacity>
    </View>
  );
}

function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen name="MemberDetail" component={MemberDetailScreen} />
          <Stack.Screen name="EventDetail" component={EventDetailScreen} />
        </Stack.Navigator>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  menuItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuText: {
    fontSize: 16,
  },
});

export default AppNavigator;
