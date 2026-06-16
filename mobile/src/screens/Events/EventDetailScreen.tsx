import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Event } from '../../types';
import { formatDate } from '../../utils/format';

interface Props {
  route: { params: { eventId: number } };
  navigation: any;
}

export default function EventDetailScreen({ route, navigation }: Props) {
  const { eventId } = route.params;
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/${eventId}`);
      setEvent(response.data);
    } catch (error) {
      console.error('Failed to fetch event:', error);
    }
  };

  if (!event) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Details</Text>
        <TouchableOpacity>
          <Ionicons name="create-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.dateHeader}>
        <View style={styles.dateBadge}>
          <Text style={styles.dateDay}>
            {new Date(event.eventDate).getDate()}
          </Text>
          <Text style={styles.dateMonth}>
            {new Date(event.eventDate).toLocaleString('default', { month: 'short' })}
          </Text>
        </View>
        <View style={styles.dateInfo}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDate}>{formatDate(event.eventDate)}</Text>
        </View>
      </View>

      <View style={styles.contentCard}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {event.description || 'No description provided'}
        </Text>
      </View>

      {event.location && (
        <View style={styles.contentCard}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#6b7280" />
            <Text style={styles.infoText}>{event.location}</Text>
          </View>
        </View>
      )}

      <View style={styles.contentCard}>
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={20} color="#6b7280" />
          <Text style={styles.infoText}>
            {event.startTime
              ? new Date(event.startTime).toLocaleTimeString()
              : 'Not specified'}
          </Text>
        </View>
        {event.recurring && (
          <View style={styles.infoRow}>
            <Ionicons name="repeat-outline" size={20} color="#6b7280" />
            <Text style={styles.infoText}>Recurring Event</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#1e40af',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#fff' },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  dateBadge: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dateDay: { fontSize: 24, fontWeight: 'bold', color: '#1e40af' },
  dateMonth: { fontSize: 12, color: '#1e40af', textTransform: 'uppercase' },
  dateInfo: { flex: 1 },
  eventTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  eventDate: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  contentCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
  description: { fontSize: 16, color: '#4b5563', lineHeight: 24 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoText: { fontSize: 16, color: '#4b5563', marginLeft: 12 },
});
