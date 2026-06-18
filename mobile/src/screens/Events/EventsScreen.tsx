import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  TextInput,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import api from '../../services/api';
import { Event } from '../../types';
export default function EventsScreen({ navigation }: any) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  };

  const handleBack = () => {
    triggerHaptic();
    navigation.goBack();
  };

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState({
    title: '',
    description: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    location: '',
    recurring: false,
  });

  const handleAddEvent = () => {
    triggerHaptic();
    setFormValues({
      title: '',
      description: '',
      eventDate: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: '',
      location: '',
      recurring: false,
    });
    setIsFormVisible(true);
  };

  const handleFormSubmit = async () => {
    triggerHaptic();
    if (!formValues.title.trim() || !formValues.eventDate.trim()) {
      Alert.alert('Error', 'Title and Event Date are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: any = {
        title: formValues.title.trim(),
        description: formValues.description.trim(),
        eventDate: formValues.eventDate.trim(),
        location: formValues.location.trim(),
        recurring: formValues.recurring,
      };
      
      // Let's format the date/time to ISO-like if needed or send directly.
      // If startTime/endTime are provided, let's merge them with the eventDate.
      if (formValues.startTime.trim()) {
        payload.startTime = `${formValues.eventDate}T${formValues.startTime}:00`;
      }
      if (formValues.endTime.trim()) {
        payload.endTime = `${formValues.eventDate}T${formValues.endTime}:00`;
      }

      await api.post('/events', payload);
      Alert.alert('Success', 'Event created successfully!');
      setIsFormVisible(false);
      fetchEvents();
    } catch (error: any) {
      console.error('Failed to create event:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEventPress = (eventId: number) => {
    triggerHaptic();
    navigation.navigate('EventDetail', { eventId });
  };

  const renderEvent = ({ item }: { item: Event }) => {
    const eventDate = new Date(item.eventDate);
    const day = eventDate.getDate();
    const month = eventDate.toLocaleString('default', { month: 'short' });

    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => handleEventPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.eventDate}>
          <Text style={styles.eventDay}>{day}</Text>
          <Text style={styles.eventMonth}>{month}</Text>
        </View>
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventDescription} numberOfLines={2}>
            {item.description || 'No description'}
          </Text>
          {item.location && (
            <View style={styles.eventLocation}>
              <Ionicons name="location-outline" size={14} color="#64748b" />
              <Text style={styles.locationText}>{item.location}</Text>
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e3a8a', '#1e40af']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Events</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddEvent} activeOpacity={0.7}>
            <Ionicons name="add-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#1e40af" />
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="calendar-outline" size={32} color="#94a3b8" />
              </View>
              <Text style={styles.emptyText}>No events found</Text>
              <Text style={styles.emptySubtext}>Try checking back later or create a new event</Text>
            </View>
          }
        />
      )}

      {/* Create Event Modal */}
      <Modal
        visible={isFormVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsFormVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add New Event</Text>
            <ScrollView style={styles.modalFormScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Title *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formValues.title}
                  onChangeText={(txt) => setFormValues(prev => ({ ...prev, title: txt }))}
                  placeholder="Enter event title..."
                  placeholderTextColor="#cbd5e1"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]}
                  value={formValues.description}
                  onChangeText={(txt) => setFormValues(prev => ({ ...prev, description: txt }))}
                  placeholder="Enter description..."
                  placeholderTextColor="#cbd5e1"
                  multiline={true}
                  numberOfLines={3}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Event Date * (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.formInput}
                  value={formValues.eventDate}
                  onChangeText={(txt) => setFormValues(prev => ({ ...prev, eventDate: txt }))}
                  placeholder="e.g. 2026-07-20"
                  placeholderTextColor="#cbd5e1"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Start Time (HH:MM)</Text>
                <TextInput
                  style={styles.formInput}
                  value={formValues.startTime}
                  onChangeText={(txt) => setFormValues(prev => ({ ...prev, startTime: txt }))}
                  placeholder="e.g. 09:00"
                  placeholderTextColor="#cbd5e1"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>End Time (HH:MM)</Text>
                <TextInput
                  style={styles.formInput}
                  value={formValues.endTime}
                  onChangeText={(txt) => setFormValues(prev => ({ ...prev, endTime: txt }))}
                  placeholder="e.g. 11:30"
                  placeholderTextColor="#cbd5e1"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Location</Text>
                <TextInput
                  style={styles.formInput}
                  value={formValues.location}
                  onChangeText={(txt) => setFormValues(prev => ({ ...prev, location: txt }))}
                  placeholder="Enter location..."
                  placeholderTextColor="#cbd5e1"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Recurring Event</Text>
                <TouchableOpacity
                  style={[styles.toggleContainer, formValues.recurring ? styles.toggleContainerActive : null]}
                  onPress={() => setFormValues(prev => ({ ...prev, recurring: !prev.recurring }))}
                >
                  <Text style={[styles.toggleText, formValues.recurring ? styles.toggleTextActive : null]}>
                    {formValues.recurring ? 'Yes, Recurring' : 'No, One-time'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            <View style={styles.modalBtns}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setIsFormVisible(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.modalBtnTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnSubmit]}
                onPress={handleFormSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.modalBtnTextSubmit}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 64 : 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  eventDate: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  eventDay: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e40af',
  },
  eventMonth: {
    fontSize: 11,
    color: '#1e40af',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginTop: 2,
  },
  eventInfo: {
    flex: 1,
    paddingRight: 8,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  eventDescription: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 18,
  },
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
    fontWeight: '500',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
  },
  modalFormScroll: {
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 14,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 14,
    color: '#1e293b',
  },
  toggleContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  toggleContainerActive: {
    backgroundColor: '#d1fae5',
    borderColor: '#6ee7b7',
  },
  toggleText: {
    color: '#b91c1c',
    fontWeight: '700',
  },
  toggleTextActive: {
    color: '#047857',
  },
  modalBtns: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 16,
  },
  modalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 90,
    alignItems: 'center',
  },
  modalBtnCancel: {
    backgroundColor: '#f1f5f9',
  },
  modalBtnSubmit: {
    backgroundColor: '#1e40af',
  },
  modalBtnTextCancel: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 14,
  },
  modalBtnTextSubmit: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});
