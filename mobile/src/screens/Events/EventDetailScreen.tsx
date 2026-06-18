import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/events/${eventId}`);
      setEvent(response.data);
    } catch (error) {
      console.error('Failed to fetch event:', error);
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

  const handleEdit = () => {
    triggerHaptic();
    if (event) {
      let startHHMM = '';
      if (event.startTime) {
        const parts = event.startTime.split('T');
        if (parts.length > 1) {
          startHHMM = parts[1].substring(0, 5);
        }
      }
      let endHHMM = '';
      if (event.endTime) {
        const parts = event.endTime.split('T');
        if (parts.length > 1) {
          endHHMM = parts[1].substring(0, 5);
        }
      }

      setFormValues({
        title: event.title || '',
        description: event.description || '',
        eventDate: event.eventDate ? event.eventDate.split('T')[0] : '',
        startTime: startHHMM,
        endTime: endHHMM,
        location: event.location || '',
        recurring: event.recurring,
      });
      setIsFormVisible(true);
    }
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

      if (formValues.startTime.trim()) {
        payload.startTime = `${formValues.eventDate}T${formValues.startTime}:00`;
      } else {
        payload.startTime = null;
      }
      if (formValues.endTime.trim()) {
        payload.endTime = `${formValues.eventDate}T${formValues.endTime}:00`;
      } else {
        payload.endTime = null;
      }

      await api.put(`/events/${eventId}`, payload);
      Alert.alert('Success', 'Event details updated successfully!');
      setIsFormVisible(false);
      fetchEvent();
    } catch (error: any) {
      console.error('Failed to update event:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    triggerHaptic();
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await api.delete(`/events/${eventId}`);
              Alert.alert('Success', 'Event deleted successfully.');
              navigation.goBack();
            } catch (error: any) {
              console.error('Failed to delete event:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete event.');
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e40af" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Event details not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const eventDate = new Date(event.eventDate);
  const day = eventDate.getDate();
  const month = eventDate.toLocaleString('default', { month: 'short' });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#1e3a8a', '#1e40af']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.headerBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Event Details</Text>
          <TouchableOpacity onPress={handleEdit} style={styles.headerBtn} activeOpacity={0.7}>
            <Ionicons name="create-outline" size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.dateHeader}>
        <View style={styles.dateBadge}>
          <Text style={styles.dateDay}>{day}</Text>
          <Text style={styles.dateMonth}>{month}</Text>
        </View>
        <View style={styles.dateInfo}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDateText}>{formatDate(event.eventDate)}</Text>
        </View>
      </View>

      <View style={styles.contentCard}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {event.description || 'No description provided'}
        </Text>
      </View>

      {event.location ? (
        <View style={styles.contentCard}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.infoRow}>
            <View style={[styles.iconCircle, { backgroundColor: '#eff6ff' }]}>
              <Ionicons name="location" size={20} color="#2563eb" />
            </View>
            <Text style={styles.infoText}>{event.location}</Text>
          </View>
        </View>
      ) : null}

      <View style={[styles.contentCard, { marginBottom: 30 }]}>
        <Text style={styles.sectionTitle}>Time & Schedule</Text>
        <View style={styles.infoRow}>
          <View style={[styles.iconCircle, { backgroundColor: '#f1f5f9' }]}>
            <Ionicons name="time-outline" size={20} color="#475569" />
          </View>
          <Text style={styles.infoText}>
            {event.startTime
              ? new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Time not specified'}
          </Text>
        </View>
        {event.recurring ? (
          <View style={[styles.infoRow, { marginTop: 12 }]}>
            <View style={[styles.iconCircle, { backgroundColor: '#fffbeb' }]}>
              <Ionicons name="repeat" size={20} color="#f59e0b" />
            </View>
            <Text style={styles.infoText}>Recurring Event</Text>
          </View>
        ) : null}
      </View>

      <TouchableOpacity
        style={styles.deleteEventBtn}
        onPress={handleDelete}
        activeOpacity={0.7}
      >
        <Ionicons name="trash-outline" size={20} color="#ffffff" />
        <Text style={styles.deleteEventBtnText}>Delete Event</Text>
      </TouchableOpacity>

      {/* Edit Event Modal */}
      <Modal
        visible={isFormVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsFormVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Event Details</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#1e40af',
    borderRadius: 12,
  },
  backBtnText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 64 : 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
  },
  dateBadge: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dateDay: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e40af',
  },
  dateMonth: {
    fontSize: 11,
    color: '#1e40af',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginTop: 2,
  },
  dateInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  eventDateText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  contentCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    marginTop: 16,
    marginBottom: 0,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 14,
  },
  description: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  infoText: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '500',
    flex: 1,
  },
  deleteEventBtn: {
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    margin: 20,
    marginTop: 24,
    marginBottom: 40,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  deleteEventBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
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
