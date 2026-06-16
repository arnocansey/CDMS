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
import { Event } from '../../types';
import { formatDate } from '../../utils/format';

export default function EventsScreen({ navigation }: any) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderEvent = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
    >
      <View style={styles.eventDate}>
        <Text style={styles.eventDay}>
          {new Date(item.eventDate).getDate()}
        </Text>
        <Text style={styles.eventMonth}>
          {new Date(item.eventDate).toLocaleString('default', { month: 'short' })}
        </Text>
      </View>
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventDescription} numberOfLines={2}>
          {item.description || 'No description'}
        </Text>
        {item.location && (
          <View style={styles.eventLocation}>
            <Ionicons name="location-outline" size={14} color="#6b7280" />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Events</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>
              {isLoading ? 'Loading...' : 'No events found'}
            </Text>
          </View>
        }
      />
    </View>
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
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#1e40af',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 8,
  },
  listContent: {
    padding: 16,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventDate: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventDay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  eventMonth: {
    fontSize: 12,
    color: '#1e40af',
    textTransform: 'uppercase',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  eventDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
});
