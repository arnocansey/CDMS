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
import { PrayerRequest } from '../../types';

export default function PrayerRequestsScreen({ navigation }: any) {
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPrayerRequests();
  }, []);

  const fetchPrayerRequests = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/prayer-requests');
      setPrayerRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch prayer requests:', error);
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
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PrayerRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState({
    title: '',
    description: '',
    anonymous: false,
    status: 'PENDING',
    prayedBy: '',
  });

  const handleAddRequest = () => {
    triggerHaptic();
    setIsEditing(false);
    setSelectedRequest(null);
    setFormValues({
      title: '',
      description: '',
      anonymous: false,
      status: 'PENDING',
      prayedBy: '',
    });
    setIsFormVisible(true);
  };

  const handleEditRequest = (request: PrayerRequest) => {
    triggerHaptic();
    setIsEditing(true);
    setSelectedRequest(request);
    setFormValues({
      title: request.title || '',
      description: request.description || '',
      anonymous: request.anonymous ?? false,
      status: request.status || 'PENDING',
      prayedBy: request.prayedBy || '',
    });
    setIsFormVisible(true);
  };

  const handleFormSubmit = async () => {
    triggerHaptic();
    if (!formValues.title.trim() || !formValues.description.trim()) {
      Alert.alert('Error', 'Title and Description are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: any = {
        title: formValues.title.trim(),
        description: formValues.description.trim(),
        anonymous: formValues.anonymous,
        status: formValues.status,
        prayedBy: formValues.prayedBy.trim() || null,
      };

      if (isEditing && selectedRequest) {
        await api.put(`/prayer-requests/${selectedRequest.id}`, payload);
        Alert.alert('Success', 'Prayer request updated successfully!');
      } else {
        await api.post('/prayer-requests', payload);
        Alert.alert('Success', 'Prayer request submitted successfully!');
      }
      setIsFormVisible(false);
      fetchPrayerRequests();
    } catch (error: any) {
      console.error('Failed to save prayer request:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to save prayer request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRequest = (id: number) => {
    triggerHaptic();
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this prayer request?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await api.delete(`/prayer-requests/${id}`);
              Alert.alert('Success', 'Prayer request deleted successfully.');
              fetchPrayerRequests();
            } catch (error: any) {
              console.error('Failed to delete prayer request:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete prayer request.');
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { bg: '#fffbeb', text: '#d97706', label: 'Pending' };
      case 'IN_PROGRESS':
        return { bg: '#eff6ff', text: '#2563eb', label: 'In Progress' };
      case 'ANSWERED':
        return { bg: '#ecfdf5', text: '#059669', label: 'Answered' };
      default:
        return { bg: '#f1f5f9', text: '#475569', label: 'Closed' };
    }
  };

  const renderPrayerRequest = ({ item }: { item: PrayerRequest }) => {
    const status = getStatusDetails(item.status);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <Ionicons name="heart" size={20} color="#ef4444" />
          </View>
          <View style={styles.headerTextCol}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Text style={[styles.statusText, { color: status.text }]}>
                {status.label}
              </Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.cardContent}>{item.description}</Text>
        
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Ionicons name="person-outline" size={14} color="#64748b" />
            <Text style={styles.footerText}>
              {item.anonymous ? 'Anonymous' : `By: ${item.memberName || 'Unknown'}`}
            </Text>
          </View>
          {item.prayedBy ? (
            <View style={styles.footerRow}>
              <Ionicons name="heart-dislike-outline" size={14} color="#64748b" />
              <Text style={styles.footerText}>Prayed by: {item.prayedBy}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.cardActionBtn, styles.editActionBtn]}
            onPress={() => handleEditRequest(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={14} color="#ffffff" />
            <Text style={styles.cardActionBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cardActionBtn, styles.deleteActionBtn]}
            onPress={() => handleDeleteRequest(item.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={14} color="#ffffff" />
            <Text style={styles.cardActionBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
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
          <TouchableOpacity onPress={handleBack} style={styles.headerBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Prayer Requests</Text>
          <TouchableOpacity onPress={handleAddRequest} style={styles.headerBtn} activeOpacity={0.7}>
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
          data={prayerRequests}
          renderItem={renderPrayerRequest}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="heart-outline" size={32} color="#94a3b8" />
              </View>
              <Text style={styles.emptyText}>No prayer requests</Text>
              <Text style={styles.emptySubtext}>Submit your prayer requests or view others to support them</Text>
            </View>
          }
        />
      )}

      {/* Create / Edit Prayer Request Modal */}
      <Modal
        visible={isFormVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsFormVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {isEditing ? 'Edit Prayer Request' : 'Add Prayer Request'}
            </Text>
            <ScrollView style={styles.modalFormScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Title *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formValues.title}
                  onChangeText={(txt) => setFormValues(prev => ({ ...prev, title: txt }))}
                  placeholder="Enter request title..."
                  placeholderTextColor="#cbd5e1"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description *</Text>
                <TextInput
                  style={[styles.formInput, { height: 100, textAlignVertical: 'top' }]}
                  value={formValues.description}
                  onChangeText={(txt) => setFormValues(prev => ({ ...prev, description: txt }))}
                  placeholder="Enter details/needs..."
                  placeholderTextColor="#cbd5e1"
                  multiline={true}
                  numberOfLines={4}
                />
              </View>

              {isEditing && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Status</Text>
                  <View style={styles.genderRow}>
                    {['PENDING', 'IN_PROGRESS', 'ANSWERED', 'CLOSED'].map((st) => (
                      <TouchableOpacity
                        key={st}
                        style={[styles.genderOption, formValues.status === st && styles.genderOptionActive]}
                        onPress={() => setFormValues(prev => ({ ...prev, status: st }))}
                      >
                        <Text style={[styles.genderOptionText, formValues.status === st && styles.genderOptionTextActive]}>
                          {st === 'IN_PROGRESS' ? 'In Progress' : st.charAt(0) + st.slice(1).toLowerCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {isEditing && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Prayed By</Text>
                  <TextInput
                    style={styles.formInput}
                    value={formValues.prayedBy}
                    onChangeText={(txt) => setFormValues(prev => ({ ...prev, prayedBy: txt }))}
                    placeholder="E.g., Pastor John, Intercessory Group..."
                    placeholderTextColor="#cbd5e1"
                  />
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Anonymous Submission</Text>
                <TouchableOpacity
                  style={[styles.toggleContainer, formValues.anonymous ? styles.toggleContainerActive : null]}
                  onPress={() => setFormValues(prev => ({ ...prev, anonymous: !prev.anonymous }))}
                >
                  <Text style={[styles.toggleText, formValues.anonymous ? styles.toggleTextActive : null]}>
                    {formValues.anonymous ? 'Yes, Submit Anonymously' : 'No, Show My Name'}
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
    marginBottom: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextCol: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    paddingRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardContent: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
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
  genderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  genderOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
  },
  genderOptionActive: {
    borderColor: '#1e40af',
    backgroundColor: '#eff6ff',
  },
  genderOptionText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  genderOptionTextActive: {
    color: '#1e40af',
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
