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
import { Attendance } from '../../types';
import { formatDateTime } from '../../utils/format';

export default function AttendanceScreen({ navigation }: any) {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    try {
      const response = await api.get(`/attendance?date=${selectedDate}`);
      setAttendance(response.data);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const presentCount = attendance.filter((a) => a.present).length;
  const absentCount = attendance.filter((a) => !a.present).length;

  const renderAttendance = ({ item }: { item: Attendance }) => (
    <View style={styles.attendanceCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.memberName.split(' ').map((n) => n[0]).join('')}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.memberName}</Text>
        <Text style={styles.serviceType}>{item.serviceType}</Text>
      </View>
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: item.present ? '#d1fae5' : '#fee2e2' },
        ]}
      >
        <Text
          style={[
            styles.statusText,
            { color: item.present ? '#065f46' : '#991b1b' },
          ]}
        >
          {item.present ? 'Present' : 'Absent'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: '#dbeafe' }]}>
          <Text style={[styles.summaryValue, { color: '#1e40af' }]}>
            {attendance.length}
          </Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#d1fae5' }]}>
          <Text style={[styles.summaryValue, { color: '#065f46' }]}>
            {presentCount}
          </Text>
          <Text style={styles.summaryLabel}>Present</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#fee2e2' }]}>
          <Text style={[styles.summaryValue, { color: '#991b1b' }]}>
            {absentCount}
          </Text>
          <Text style={styles.summaryLabel}>Absent</Text>
        </View>
      </View>

      <FlatList
        data={attendance}
        renderItem={renderAttendance}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="clipboard-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>
              {isLoading ? 'Loading...' : 'No attendance records'}
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
  summaryRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  summaryValue: { fontSize: 24, fontWeight: 'bold' },
  summaryLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  listContent: { padding: 16 },
  attendanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 14, fontWeight: '600', color: '#1e40af' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '500', color: '#1f2937' },
  serviceType: { fontSize: 12, color: '#6b7280' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '500' },
  emptyContainer: { alignItems: 'center', padding: 48 },
  emptyText: { fontSize: 16, color: '#6b7280', marginTop: 16 },
});
