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
import { Announcement } from '../../types';
import { formatDate } from '../../utils/format';

export default function AnnouncementsScreen({ navigation }: any) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get('/announcements/active');
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderAnnouncement = ({ item }: { item: Announcement }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="megaphone" size={20} color="#1e40af" />
        <Text style={styles.cardTitle}>{item.title}</Text>
      </View>
      <Text style={styles.cardContent}>{item.content}</Text>
      {item.publishDate && (
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={14} color="#6b7280" />
          <Text style={styles.dateText}>{formatDate(item.publishDate)}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Announcements</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={announcements}
        renderItem={renderAnnouncement}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="megaphone-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>
              {isLoading ? 'Loading...' : 'No announcements'}
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
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  cardContent: { fontSize: 14, color: '#4b5563', lineHeight: 22 },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 4,
  },
  dateText: { fontSize: 12, color: '#6b7280' },
  emptyContainer: { alignItems: 'center', padding: 48 },
  emptyText: { fontSize: 16, color: '#6b7280', marginTop: 16 },
});
