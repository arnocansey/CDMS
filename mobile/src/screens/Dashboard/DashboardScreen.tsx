import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { DashboardData } from '../../types';

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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.firstName}!</Text>
          <Text style={styles.subtitle}>Welcome to CDMS</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.primaryCard]}>
          <Ionicons name="people" size={24} color="#fff" />
          <Text style={styles.statValue}>{dashboardData?.totalMembers || 0}</Text>
          <Text style={styles.statLabel}>Total Members</Text>
        </View>

        <View style={[styles.statCard, styles.successCard]}>
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
          <Text style={styles.statValue}>{dashboardData?.attendanceToday || 0}</Text>
          <Text style={styles.statLabel}>Attendance Today</Text>
        </View>

        <View style={[styles.statCard, styles.warningCard]}>
          <Ionicons name="cash" size={24} color="#fff" />
          <Text style={styles.statValue}>
            ${(dashboardData?.totalDonations || 0).toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Total Income</Text>
        </View>

        <View style={[styles.statCard, styles.dangerCard]}>
          <Ionicons name="heart" size={24} color="#fff" />
          <Text style={styles.statValue}>{dashboardData?.pendingPrayerRequests || 0}</Text>
          <Text style={styles.statLabel}>Prayer Requests</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Members')}
          >
            <Ionicons name="people-outline" size={32} color="#1e40af" />
            <Text style={styles.actionText}>Members</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Finance')}
          >
            <Ionicons name="cash-outline" size={32} color="#10b981" />
            <Text style={styles.actionText}>Finance</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Events')}
          >
            <Ionicons name="calendar-outline" size={32} color="#f59e0b" />
            <Text style={styles.actionText}>Events</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('More')}
          >
            <Ionicons name="menu-outline" size={32} color="#6b7280" />
            <Text style={styles.actionText}>More</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#1e40af',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#bfdbfe',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: '47%',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  primaryCard: {
    backgroundColor: '#1e40af',
  },
  successCard: {
    backgroundColor: '#10b981',
  },
  warningCard: {
    backgroundColor: '#f59e0b',
  },
  dangerCard: {
    backgroundColor: '#ef4444',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '47%',
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
});
