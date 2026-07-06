import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
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
import GenericModuleScreen from '../screens/GenericModuleScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const triggerHaptic = () => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }
};

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
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={focused ? size + 2 : size} color={color} />;
        },
        tabBarActiveTintColor: '#1e40af',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ headerShown: false }}
        listeners={{
          tabPress: triggerHaptic,
        }}
      />
      <Tab.Screen 
        name="Members" 
        component={MembersScreen} 
        options={{ headerShown: false }}
        listeners={{
          tabPress: triggerHaptic,
        }}
      />
      <Tab.Screen 
        name="Finance" 
        component={FinanceScreen} 
        options={{ headerShown: false }}
        listeners={{
          tabPress: triggerHaptic,
        }}
      />
      <Tab.Screen 
        name="Events" 
        component={EventsScreen} 
        options={{ headerShown: false }}
        listeners={{
          tabPress: triggerHaptic,
        }}
      />
      <Tab.Screen 
        name="More" 
        component={MoreScreen} 
        options={{ headerShown: false }}
        listeners={{
          tabPress: triggerHaptic,
        }}
      />
    </Tab.Navigator>
  );
}

function MoreScreen() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1e40af',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="MoreMenu" 
        component={MoreMenuScreen} 
        options={{ title: 'All Modules' }} 
      />
      <Stack.Screen 
        name="Attendance" 
        component={AttendanceScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Announcements" 
        component={AnnouncementsScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="PrayerRequests" 
        component={PrayerRequestsScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="GenericModule" 
        component={GenericModuleScreen as any} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
}

function MoreMenuScreen({ navigation }: any) {
  // Navigation categories representing website pages
  const categories = [
    {
      title: 'Administrative Tools',
      items: [
        {
          name: 'Attendance',
          action: () => navigation.navigate('Attendance'),
          icon: 'checkmark-circle-outline' as const,
          color: '#10b981',
          bgColor: '#d1fae5',
          desc: 'Track and view daily service attendance',
        },
        {
          name: 'Announcements',
          action: () => navigation.navigate('Announcements'),
          icon: 'megaphone-outline' as const,
          color: '#3b82f6',
          bgColor: '#dbeafe',
          desc: 'Check latest updates and news',
        },
        {
          name: 'Prayer Requests',
          action: () => navigation.navigate('PrayerRequests'),
          icon: 'heart-outline' as const,
          color: '#ef4444',
          bgColor: '#fee2e2',
          desc: 'Submit and view church prayer requests',
        },
        {
          name: 'Notifications',
          action: () => navigation.navigate('GenericModule', {
            title: 'Notifications',
            endpoint: '/notifications',
            schema: [
              { key: 'title', label: 'Title', isTitle: true },
              { key: 'message', label: 'Message' },
              { key: 'createdAt', label: 'Sent Date', isDate: true }
            ]
          }),
          icon: 'notifications-outline' as const,
          color: '#f59e0b',
          bgColor: '#fffbeb',
          desc: 'System notifications and alerts',
        },
      ],
    },
    {
      title: 'Church Operations',
      items: [
        {
          name: 'Departments',
          action: () => navigation.navigate('GenericModule', {
            title: 'Departments',
            endpoint: '/departments',
            schema: [
              { key: 'name', label: 'Name', isTitle: true },
              { key: 'description', label: 'Description' }
            ]
          }),
          icon: 'business-outline' as const,
          color: '#06b6d4',
          bgColor: '#ecfeff',
          desc: 'Ministries and department registries',
        },
        {
          name: 'Visitors',
          action: () => navigation.navigate('GenericModule', {
            title: 'Visitors',
            endpoint: '/visitors',
            schema: [
              { key: 'name', label: 'Visitor Name', isTitle: true },
              { key: 'visitDate', label: 'Visit Date', isDate: true },
              { key: 'status', label: 'Follow Up', isBadge: true },
              { key: 'phone', label: 'Phone' },
              { key: 'notes', label: 'Notes' }
            ]
          }),
          icon: 'walk-outline' as const,
          color: '#a855f7',
          bgColor: '#faf5ff',
          desc: 'Track and follow up with first-time visitors',
        },
        {
          name: 'Church Transfers',
          action: () => navigation.navigate('GenericModule', {
            title: 'Church Transfers',
            endpoint: '/church-transfers',
            schema: [
              { key: 'reason', label: 'Reason', isTitle: true },
              { key: 'transferDate', label: 'Transfer Date', isDate: true },
              { key: 'status', label: 'Status', isBadge: true }
            ]
          }),
          icon: 'swap-horizontal-outline' as const,
          color: '#3b82f6',
          bgColor: '#eff6ff',
          desc: 'Track member moves between churches',
        },
      ],
    },
    {
      title: 'Financial Ledger',
      items: [
        {
          name: 'Pledges',
          action: () => navigation.navigate('GenericModule', {
            title: 'Pledges',
            endpoint: '/pledges',
            schema: [
              { key: 'memberName', label: 'Member Name', isTitle: true },
              { key: 'amount', label: 'Pledge Amount', isCurrency: true },
              { key: 'status', label: 'Status', isBadge: true }
            ]
          }),
          icon: 'ribbon-outline' as const,
          color: '#ec4899',
          bgColor: '#fdf2f8',
          desc: 'Track members commitments and vows',
        },
        {
          name: 'Funds',
          action: () => navigation.navigate('GenericModule', {
            title: 'Church Funds',
            endpoint: '/funds',
            schema: [
              { key: 'name', label: 'Fund Name', isTitle: true },
              { key: 'description', label: 'Description' }
            ]
          }),
          icon: 'server-outline' as const,
          color: '#2563eb',
          bgColor: '#eff6ff',
          desc: 'View specific allocated project funds',
        },
        {
          name: 'Receipts',
          action: () => navigation.navigate('GenericModule', {
            title: 'Receipts',
            endpoint: '/receipts',
            schema: [
              { key: 'category', label: 'Category', isTitle: true },
              { key: 'amount', label: 'Total', isCurrency: true },
              { key: 'date', label: 'Receipt Date', isDate: true }
            ]
          }),
          icon: 'receipt-outline' as const,
          color: '#10b981',
          bgColor: '#d1fae5',
          desc: 'Digital receipts and transactions',
        },
        {
          name: 'Recurring Donations',
          action: () => navigation.navigate('GenericModule', {
            title: 'Recurring Donations',
            endpoint: '/recurring-donations',
            schema: [
              { key: 'category', label: 'Category', isTitle: true },
              { key: 'amount', label: 'Amount', isCurrency: true },
              { key: 'frequency', label: 'Frequency' },
              { key: 'nextDueDate', label: 'Next Due Date', isDate: true }
            ]
          }),
          icon: 'refresh-circle-outline' as const,
          color: '#059669',
          bgColor: '#ecfdf5',
          desc: 'Manage ongoing pledge payments and tithes',
        },
        {
          name: 'Recurring Expenses',
          action: () => navigation.navigate('GenericModule', {
            title: 'Recurring Expenses',
            endpoint: '/recurring-expenses',
            schema: [
              { key: 'category', label: 'Category', isTitle: true },
              { key: 'amount', label: 'Amount', isCurrency: true },
              { key: 'frequency', label: 'Frequency' },
              { key: 'nextDueDate', label: 'Next Due Date', isDate: true }
            ]
          }),
          icon: 'repeat-outline' as const,
          color: '#ef4444',
          bgColor: '#fee2e2',
          desc: 'Ongoing bills and service subscriptions',
        },
        {
          name: 'Budgets',
          action: () => navigation.navigate('GenericModule', {
            title: 'Budgets',
            endpoint: '/budgets',
            schema: [
              { key: 'category', label: 'Category', isTitle: true },
              { key: 'amount', label: 'Budget Limit', isCurrency: true },
              { key: 'period', label: 'Period' }
            ]
          }),
          icon: 'pie-chart-outline' as const,
          color: '#8b5cf6',
          bgColor: '#f5f3ff',
          desc: 'Allocated budget ceilings',
        },
        {
          name: 'Financial Goals',
          action: () => navigation.navigate('GenericModule', {
            title: 'Financial Goals',
            endpoint: '/financial-goals',
            schema: [
              { key: 'name', label: 'Goal Name', isTitle: true },
              { key: 'targetAmount', label: 'Target Amount', isCurrency: true },
              { key: 'amountRaised', label: 'Amount Raised', isCurrency: true },
              { key: 'status', label: 'Status', isBadge: true }
            ]
          }),
          icon: 'trophy-outline' as const,
          color: '#f59e0b',
          bgColor: '#fffbeb',
          desc: 'Target savings and fundraising goals',
        },
        {
          name: 'Bank Reconciliation',
          action: () => navigation.navigate('GenericModule', {
            title: 'Bank Reconciliation',
            endpoint: '/bank-reconciliation',
            schema: [
              { key: 'bankStatementDate', label: 'Statement Date', isTitle: true, isDate: true },
              { key: 'bankBalance', label: 'Bank Balance', isCurrency: true },
              { key: 'bookBalance', label: 'Book Balance', isCurrency: true },
              { key: 'status', label: 'Status', isBadge: true }
            ]
          }),
          icon: 'calculator-outline' as const,
          color: '#14b8a6',
          bgColor: '#f0fdfa',
          desc: 'Balance bank statement vs ledger books',
        },
      ],
    },
    {
      title: 'Expense Approvals & Admin',
      items: [
        {
          name: 'Expense Approvals',
          action: () => navigation.navigate('GenericModule', {
            title: 'Expense Approvals',
            endpoint: '/expenses/pending',
            schema: [
              { key: 'description', label: 'Description', isTitle: true },
              { key: 'amount', label: 'Request Amount', isCurrency: true },
              { key: 'category', label: 'Category' }
            ]
          }),
          icon: 'shield-checkmark-outline' as const,
          color: '#f59e0b',
          bgColor: '#fffbeb',
          desc: 'Audit pending and signed outlays',
        },
        {
          name: 'User Approvals',
          action: () => navigation.navigate('GenericModule', {
            title: 'Pending User Approvals',
            endpoint: '/approvals/pending-users',
            schema: [
              { key: 'email', label: 'Email / Username', isTitle: true },
              { key: 'firstName', label: 'First Name' },
              { key: 'lastName', label: 'Last Name' },
              { key: 'roles', label: 'Roles' }
            ]
          }),
          icon: 'people-circle-outline' as const,
          color: '#4f46e5',
          bgColor: '#e0e7ff',
          desc: 'Approve new user accounts registration',
        },
        {
          name: 'Church Requests',
          action: () => navigation.navigate('GenericModule', {
            title: 'Church Requests',
            endpoint: '/approvals/church-requests',
            schema: [
              { key: 'churchName', label: 'Church Name', isTitle: true },
              { key: 'adminEmail', label: 'Admin Email' },
              { key: 'status', label: 'Status', isBadge: true }
            ]
          }),
          icon: 'git-pull-request-outline' as const,
          color: '#9333ea',
          bgColor: '#f3e8ff',
          desc: 'Approve multi-tenant church requests',
        },
        {
          name: 'System Users',
          action: () => navigation.navigate('GenericModule', {
            title: 'System Users',
            endpoint: '/users',
            schema: [
              { key: 'email', label: 'Email / Username', isTitle: true },
              { key: 'firstName', label: 'First Name' },
              { key: 'lastName', label: 'Last Name' },
              { key: 'roles', label: 'Roles' }
            ]
          }),
          icon: 'person-circle-outline' as const,
          color: '#475569',
          bgColor: '#f1f5f9',
          desc: 'Manage administrative console logins',
        },
      ],
    },
    {
      title: 'Analytics & Forecasts',
      items: [
        {
          name: 'Financial Health',
          action: () => navigation.navigate('GenericModule', {
            title: 'Financial Health',
            endpoint: '/financial-health',
            schema: [
              { key: 'status', label: 'Health Status', isTitle: true, isBadge: true },
              { key: 'score', label: 'Health Score' },
              { key: 'incomeGrowthRate', label: 'Income Growth Rate' },
              { key: 'expenseControlRate', label: 'Expense Control Rate' }
            ]
          }),
          icon: 'pulse-outline' as const,
          color: '#ec4899',
          bgColor: '#fdf2f8',
          desc: 'Track income growth and expense metrics',
        },
        {
          name: 'Budget Forecasting',
          action: () => navigation.navigate('GenericModule', {
            title: 'Budget Forecasting',
            endpoint: '/forecasts',
            schema: [
              { key: 'forecastName', label: 'Forecast Name', isTitle: true },
              { key: 'forecastType', label: 'Forecast Type' },
              { key: 'predictedIncome', label: 'Predicted Income', isCurrency: true },
              { key: 'predictedExpenses', label: 'Predicted Expenses', isCurrency: true }
            ]
          }),
          icon: 'trending-up-outline' as const,
          color: '#10b981',
          bgColor: '#d1fae5',
          desc: 'Predictive analytics on cash flow and targets',
        },
        {
          name: 'Import History',
          action: () => navigation.navigate('GenericModule', {
            title: 'Import History',
            endpoint: '/import/history',
            schema: [
              { key: 'filename', label: 'Filename', isTitle: true },
              { key: 'importType', label: 'Import Type' },
              { key: 'status', label: 'Status', isBadge: true },
              { key: 'totalRows', label: 'Total Rows' }
            ]
          }),
          icon: 'cloud-upload-outline' as const,
          color: '#a855f7',
          bgColor: '#faf5ff',
          desc: 'History of CSV member/donation imports',
        },
        {
          name: 'Cash Flow Entries',
          action: () => navigation.navigate('GenericModule', {
            title: 'Cash Flow Entries',
            endpoint: '/cash-flow',
            schema: [
              { key: 'category', label: 'Category', isTitle: true },
              { key: 'entryType', label: 'Type', isBadge: true },
              { key: 'amount', label: 'Amount', isCurrency: true },
              { key: 'entryDate', label: 'Date', isDate: true }
            ]
          }),
          icon: 'swap-vertical-outline' as const,
          color: '#0ea5e9',
          bgColor: '#e0f2fe',
          desc: 'Reconcile net inflows and outflows',
        },
      ],
    },
    {
      title: 'Security & Core Settings',
      items: [
        {
          name: 'Audit Logs',
          action: () => navigation.navigate('GenericModule', {
            title: 'Audit Logs',
            endpoint: '/audit-logs',
            schema: [
              { key: 'action', label: 'Action Performed', isTitle: true },
              { key: 'username', label: 'Operator' },
              { key: 'timestamp', label: 'Timestamp', isDate: true }
            ]
          }),
          icon: 'shield-outline' as const,
          color: '#64748b',
          bgColor: '#f1f5f9',
          desc: 'Real-time database activity log',
        },
        {
          name: 'API Keys',
          action: () => navigation.navigate('GenericModule', {
            title: 'Developer API Keys',
            endpoint: '/api-keys',
            schema: [
              { key: 'name', label: 'API Key Description', isTitle: true },
              { key: 'createdDate', label: 'Created', isDate: true },
              { key: 'status', label: 'Status', isBadge: true }
            ]
          }),
          icon: 'key-outline' as const,
          color: '#e11d48',
          bgColor: '#fff1f2',
          desc: 'Manage keys for external developer access',
        },
        {
          name: 'System Permissions',
          action: () => navigation.navigate('GenericModule', {
            title: 'System Permissions',
            endpoint: '/permissions',
            schema: [
              { key: 'role', label: 'Role Name', isTitle: true },
              { key: 'resource', label: 'Resource' },
              { key: 'action', label: 'Action' }
            ]
          }),
          icon: 'lock-open-outline' as const,
          color: '#1e293b',
          bgColor: '#f8fafc',
          desc: 'Manage role based page authorizations',
        },
        {
          name: 'White-Label Branding',
          action: () => navigation.navigate('GenericModule', {
            title: 'Branding Settings',
            endpoint: '/white-label',
            schema: [
              { key: 'customDomain', label: 'Custom Domain', isTitle: true },
              { key: 'primaryColor', label: 'Primary Color' },
              { key: 'secondaryColor', label: 'Secondary Color' }
            ]
          }),
          icon: 'color-palette-outline' as const,
          color: '#db2777',
          bgColor: '#fce7f3',
          desc: 'Custom colors and domain aliases logo',
        },
        {
          name: 'Church Settings',
          action: () => navigation.navigate('GenericModule', {
            title: 'Church Settings',
            endpoint: '/church-settings',
            schema: [
              { key: 'name', label: 'Church Name', isTitle: true },
              { key: 'email', label: 'Contact Email' },
              { key: 'phone', label: 'Phone Number' },
              { key: 'address', label: 'Address' }
            ]
          }),
          icon: 'settings-outline' as const,
          color: '#0f766e',
          bgColor: '#ccfbf1',
          desc: 'Manage church address, locale and tax info',
        },
      ],
    },
  ];

  const handlePress = (action: () => void) => {
    triggerHaptic();
    action();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.menuSubtitle}>Access all system modules from one panel</Text>

      {categories.map((category) => (
        <View key={category.title} style={styles.categorySection}>
          <Text style={styles.categoryTitle}>{category.title}</Text>
          <View style={styles.gridContainer}>
            {category.items.map((item) => (
              <TouchableOpacity
                key={item.name}
                style={styles.menuCard}
                onPress={() => handlePress(item.action)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: item.bgColor }]}>
                  <Ionicons name={item.icon} size={24} color={item.color} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.menuText}>{item.name}</Text>
                  <Text style={styles.menuDesc}>{item.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
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
          <Stack.Screen name="MemberDetail" component={MemberDetailScreen as any} />
          <Stack.Screen name="EventDetail" component={EventDetailScreen as any} />
        </Stack.Navigator>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
    paddingTop: 10,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 12,
  },
  gridContainer: {
    gap: 12,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  menuDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 3,
  },
});

export default AppNavigator;
