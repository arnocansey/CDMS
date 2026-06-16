import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { PrayerRequest } from '../../types';

export default function PrayerRequestsScreen({ navigation }: any) {
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPrayerRequests();
  }, []);

  const fetchPrayerRequests = async () => {
    try {
      const response = await api.get('/prayer-requests');
      setPrayerRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch prayer requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return { bg: '#fef3c7', text: '#92400e' };
      case 'IN_PROGRESS': return { bg: '#dbeafe', text: '#1e40af' };
      case 'ANSWERED': return { bg: '#d1fae5', text: '#065f46' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const renderPrayerRequest = ({ item }: { item: PrayerRequest }) => {
    const statusColor = getStatusColor(item.status);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="heart" size={20} color="#ef4444" />
          <Text style={styles.cardTitle}>{item.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
            <Text style={[styles.statusText, { color: statusColor.text }]}>
              {item.status.replace('_', ' ')}
            </Text>
          </View>
        </View>
        <Text style={styles.cardContent}>{item.description}</Text>
        <View style={styles.footer}>
          {item.anonymous ? (
            <Text style={styles.footerText}>Anonymous</Text>
          ) : (
            <Text style={styles.footerText}>By: {item.memberName || 'Unknown'}</Text>
          )}
          {item.prayedBy && (
            <Text style={styles.footerText}>Prayed by: {item.prayedBy}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prayer Requests</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={prayerRequests}
        renderItem={renderPrayerRequest}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>
              {isLoading ? 'Loading...' : 'No prayer requests'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#1e40af',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#fff' },
  addButton: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 8 },
  listContent: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase' },
  cardContent: { fontSize: 14, color: '#4b5563', lineHeight: 22 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  footerText: { fontSize: 12, color: '#6b7280' },
  emptyContainer: { alignItems: 'center', padding: 48 },
  emptyText: { fontSize: 16, color: '#6b7280', marginTop: 16 },
});
