import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { DashboardData } from '../../types';
import { Skeleton } from '../../components/Skeleton';

export default function DashboardScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  };

  const handleLogout = () => {
    triggerHaptic();
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    triggerHaptic();
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleQuickAction = (screen: string) => {
    triggerHaptic();
    navigation.navigate(screen);
  };

  const userInitials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'U';

  const isLoading = !dashboardData && !refreshing;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1e40af" />
      }
    >
      <LinearGradient
        colors={['#1e3a8a', '#1e40af', '#2563eb']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.userInfoRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userInitials}</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.greeting}>Hello, {user?.firstName}!</Text>
              <Text style={styles.subtitle}>Grace Community Church</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.membersBorder]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconBadge, styles.membersIconBadge]}>
                <Ionicons name="people" size={20} color="#3b82f6" />
              </View>
              {isLoading ? (
                <Skeleton width={50} height={24} borderRadius={6} />
              ) : (
                <Text style={styles.statValue}>{dashboardData?.totalMembers || 0}</Text>
              )}
            </View>
            <Text style={styles.statLabel}>Total Members</Text>
          </View>

          <View style={[styles.statCard, styles.attendanceBorder]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconBadge, styles.attendanceIconBadge]}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              </View>
              {isLoading ? (
                <Skeleton width={50} height={24} borderRadius={6} />
              ) : (
                <Text style={styles.statValue}>{dashboardData?.attendanceToday || 0}</Text>
              )}
            </View>
            <Text style={styles.statLabel}>Attendance Today</Text>
          </View>

          <View style={[styles.statCard, styles.incomeBorder]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconBadge, styles.incomeIconBadge]}>
                <Ionicons name="cash" size={20} color="#f59e0b" />
              </View>
              {isLoading ? (
                <Skeleton width={70} height={24} borderRadius={6} />
              ) : (
                <Text style={styles.statValue} numberOfLines={1}>
                  ${(dashboardData?.totalDonations || 0).toLocaleString()}
                </Text>
              )}
            </View>
            <Text style={styles.statLabel}>Total Income</Text>
          </View>

          <View style={[styles.statCard, styles.prayerBorder]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconBadge, styles.prayerIconBadge]}>
                <Ionicons name="heart" size={20} color="#ef4444" />
              </View>
              {isLoading ? (
                <Skeleton width={40} height={24} borderRadius={6} />
              ) : (
                <Text style={styles.statValue}>{dashboardData?.pendingPrayerRequests || 0}</Text>
              )}
            </View>
            <Text style={styles.statLabel}>Prayer Requests</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleQuickAction('Members')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#eff6ff' }]}>
              <Ionicons name="people-outline" size={24} color="#1e40af" />
            </View>
            <Text style={styles.actionText}>Members</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleQuickAction('Finance')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#ecfdf5' }]}>
              <Ionicons name="cash-outline" size={24} color="#10b981" />
            </View>
            <Text style={styles.actionText}>Finance</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleQuickAction('Events')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#fffbeb' }]}>
              <Ionicons name="calendar-outline" size={24} color="#f59e0b" />
            </View>
            <Text style={styles.actionText}>Events</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleQuickAction('More')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#f1f5f9' }]}>
              <Ionicons name="grid-outline" size={24} color="#475569" />
            </View>
            <Text style={styles.actionText}>More Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerGradient: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingTop: Platform.OS === 'ios' ? 64 : 50,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  textContainer: {
    marginLeft: 12,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
    marginTop: 2,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  membersBorder: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  attendanceBorder: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  incomeBorder: {
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  prayerBorder: {
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  membersIconBadge: {
    backgroundColor: '#eff6ff',
  },
  attendanceIconBadge: {
    backgroundColor: '#ecfdf5',
  },
  incomeIconBadge: {
    backgroundColor: '#fffbeb',
  },
  prayerIconBadge: {
    backgroundColor: '#fee2e2',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    flexShrink: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
});
