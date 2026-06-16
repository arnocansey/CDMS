import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/hooks/useAuth';
import AppNavigator from './src/navigation/AppNavigator';
import { registerForPushNotifications } from './src/services/notifications';

export default function App() {
  useEffect(() => {
    registerForPushNotifications();
  }, []);

  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </AuthProvider>
  );
}
