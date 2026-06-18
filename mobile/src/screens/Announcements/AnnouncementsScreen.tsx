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
import { Announcement } from '../../types';
import { formatDate } from '../../utils/format';

export default function AnnouncementsScreen({ navigation }: any) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/announcements');
      setAnnouncements(response.data.content || response.data);
    } catch (error) {
      console.log('Failed to fetch all announcements, trying active ones:', error);
      try {
        const response = await api.get('/announcements/active');
        setAnnouncements(response.data);
      } catch (err) {
        console.error('Failed to fetch announcements:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState({
    title: '',
    content: '',
    publishDate: '',
    expiryDate: '',
    published: true,
  });

  const handleAddAnnouncement = () => {
    triggerHaptic();
    setIsEditing(false);
    setSelectedAnnouncement(null);
    setFormValues({
      title: '',
      content: '',
      publishDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      published: true,
    });
    setIsFormVisible(true);
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    triggerHaptic();
    setIsEditing(true);
    setSelectedAnnouncement(announcement);
    setFormValues({
      title: announcement.title || '',
      content: announcement.content || '',
      publishDate: announcement.publishDate ? announcement.publishDate.split('T')[0] : '',
      expiryDate: announcement.expiryDate ? announcement.expiryDate.split('T')[0] : '',
      published: announcement.published ?? true,
    });
    setIsFormVisible(true);
  };

  const handleFormSubmit = async () => {
    triggerHaptic();
    if (!formValues.title.trim() || !formValues.content.trim()) {
      Alert.alert('Error', 'Title and Content are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: any = {
        title: formValues.title.trim(),
        content: formValues.content.trim(),
        published: formValues.published,
      };
      if (formValues.publishDate.trim()) payload.publishDate = formValues.publishDate.trim();
      if (formValues.expiryDate.trim()) payload.expiryDate = formValues.expiryDate.trim();

      if (isEditing && selectedAnnouncement) {
        await api.put(`/announcements/${selectedAnnouncement.id}`, payload);
        Alert.alert('Success', 'Announcement updated successfully!');
      } else {
        await api.post('/announcements', payload);
        Alert.alert('Success', 'Announcement created successfully!');
      }
      setIsFormVisible(false);
      fetchAnnouncements();
    } catch (error: any) {
      console.error('Failed to save announcement:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to save announcement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = (id: number) => {
    triggerHaptic();
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this announcement?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await api.delete(`/announcements/${id}`);
              Alert.alert('Success', 'Announcement deleted successfully.');
              fetchAnnouncements();
            } catch (error: any) {
              console.error('Failed to delete announcement:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete announcement.');
              setIsLoading(false);
            }
          }
        }
      ]
    );
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

  const renderAnnouncement = ({ item }: { item: Announcement }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBadge}>
          <Ionicons name="megaphone" size={20} color="#2563eb" />
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
      </View>
      <Text style={styles.cardContent}>{item.content}</Text>
      {item.publishDate ? (
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={14} color="#64748b" />
          <Text style={styles.dateText}>Published: {formatDate(item.publishDate)}</Text>
        </View>
      ) : null}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.cardActionBtn, styles.editActionBtn]}
          onPress={() => handleEditAnnouncement(item)}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={14} color="#ffffff" />
          <Text style={styles.cardActionBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.cardActionBtn, styles.deleteActionBtn]}
          onPress={() => handleDeleteAnnouncement(item.id)}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={14} color="#ffffff" />
          <Text style={styles.cardActionBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
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
          <Text style={styles.headerTitle}>Announcements</Text>
          <TouchableOpacity onPress={handleAddAnnouncement} style={styles.headerBtn} activeOpacity={0.7}>
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
          data={announcements}
          renderItem={renderAnnouncement}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="megaphone-outline" size={32} color="#94a3b8" />
              </View>
              <Text style={styles.emptyText}>No announcements</Text>
              <Text style={styles.emptySubtext}>Check back later for updates and news from the church</Text>
            </View>
          }
        />
      )}

      {/* Create / Edit Announcement Modal */}
      <Modal
        visible={isFormVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsFormVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {isEditing ? 'Edit Announcement' : 'Add New Announcement'}
            </Text>
            <ScrollView style={styles.modalFormScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Title *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formValues.title}
                  onChangeText={(txt) => setFormValues(prev => ({ ...prev, title: txt }))}
                  placeholder="Enter title..."
                  placeholderTextColor="#cbd5e1"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Content *</Text>
                <TextInput
                  style={[styles.formInput, { height: 100, textAlignVertical: 'top' }]}
                  value={formValues.content}
                  onChangeText={(txt) => setFormValues(prev => ({ ...prev, content: txt }))}
                  placeholder="Enter content details..."
                  placeholderTextColor="#cbd5e1"
                  multiline={true}
                  numberOfLines={4}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Publish Date (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.formInput}
                  value={formValues.publishDate}
                  onChangeText={(txt) => setFormValues(prev => ({ ...prev, publishDate: txt }))}
                  placeholder="e.g. 2026-06-18"
                  placeholderTextColor="#cbd5e1"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Expiry Date (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.formInput}
                  value={formValues.expiryDate}
                  onChangeText={(txt) => setFormValues(prev => ({ ...prev, expiryDate: txt }))}
                  placeholder="e.g. 2026-07-18"
                  placeholderTextColor="#cbd5e1"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Status</Text>
                <TouchableOpacity
                  style={[styles.toggleContainer, formValues.published ? styles.toggleContainerActive : null]}
                  onPress={() => setFormValues(prev => ({ ...prev, published: !prev.published }))}
                >
                  <Text style={[styles.toggleText, formValues.published ? styles.toggleTextActive : null]}>
                    {formValues.published ? 'Published' : 'Draft / Unpublished'}
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
  listContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  cardContent: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    fontWeight: '500',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  dateText: {
    fontSize: 12,
    color: '#64748b',
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
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  cardActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editActionBtn: {
    backgroundColor: '#3b82f6',
  },
  deleteActionBtn: {
    backgroundColor: '#ef4444',
  },
  cardActionBtnText: {
    color: '#ffffff',
    fontSize: 11,
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
