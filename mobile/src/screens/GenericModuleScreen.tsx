import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';

interface SchemaField {
  key: string;
  label: string;
  isTitle?: boolean;
  isDate?: boolean;
  isCurrency?: boolean;
  isBadge?: boolean;
}

interface Props {
  route: {
    params: {
      title: string;
      endpoint: string;
      schema: SchemaField[];
    };
  };
  navigation: any;
}

export default function GenericModuleScreen({ route, navigation }: Props) {
  const { title, endpoint, schema } = route.params;
  const [items, setItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal & form states for CRUD operations
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Approval rejection states
  const [isRejectVisible, setIsRejectVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectItemId, setRejectItemId] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(endpoint);
      const resData = response.data;
      
      let parsedItems = [];
      if (Array.isArray(resData)) {
        parsedItems = resData;
      } else if (resData && Array.isArray(resData.content)) {
        parsedItems = resData.content;
      } else if (resData && typeof resData === 'object') {
        parsedItems = [resData];
      }
      setItems(parsedItems);
    } catch (error) {
      console.error(`Failed to fetch data for ${title}:`, error);
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

  const getFieldValue = (item: any, field: SchemaField) => {
    const value = item[field.key];
    if (value === undefined || value === null) return 'N/A';
    
    if (field.isCurrency) {
      return formatCurrency(Number(value));
    }
    if (field.isDate) {
      return formatDate(String(value));
    }
    return String(value);
  };

  const getBadgeStyle = (value: string) => {
    const val = value.toUpperCase();
    if (val.includes('ACTIVE') || val.includes('APPROVED') || val.includes('ANSWERED') || val.includes('SUCCESS')) {
      return { bg: '#ecfdf5', text: '#059669' };
    }
    if (val.includes('INACTIVE') || val.includes('REJECTED') || val.includes('ABSENT') || val.includes('FAILED') || val.includes('ERROR')) {
      return { bg: '#fee2e2', text: '#dc2626' };
    }
    if (val.includes('PENDING') || val.includes('PROGRESS') || val.includes('WARNING')) {
      return { bg: '#fffbeb', text: '#d97706' };
    }
    return { bg: '#f1f5f9', text: '#475569' };
  };

  const filteredItems = items.filter(item => {
    if (!searchQuery.trim()) return true;
    return Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const titleField = schema.find(f => f.isTitle) || schema[0];
  const detailFields = schema.filter(f => !f.isTitle);

  // CRUD Actions
  const openCreateModal = () => {
    triggerHaptic();
    setIsEditing(false);
    setSelectedItem(null);
    const initialForm: Record<string, string> = {};
    schema.forEach(field => {
      initialForm[field.key] = '';
    });
    setFormValues(initialForm);
    setIsFormVisible(true);
  };

  const openEditModal = (item: any) => {
    triggerHaptic();
    setIsEditing(true);
    setSelectedItem(item);
    const initialForm: Record<string, string> = {};
    schema.forEach(field => {
      initialForm[field.key] = item[field.key] !== undefined && item[field.key] !== null ? String(item[field.key]) : '';
    });
    setFormValues(initialForm);
    setIsFormVisible(true);
  };

  const handleFormSubmit = async () => {
    triggerHaptic();
    setIsActionLoading(true);
    try {
      const body: any = isEditing ? { ...selectedItem } : {};
      schema.forEach(field => {
        const val = formValues[field.key];
        if (val !== undefined && val !== '') {
          if (field.isCurrency) {
            body[field.key] = parseFloat(val);
          } else {
            body[field.key] = val;
          }
        }
      });

      if (isEditing) {
        let putUrl = `${endpoint}/${selectedItem.id}`;
        if (endpoint === '/white-label' || endpoint === '/church-settings') {
          putUrl = endpoint; // Settings update directly at endpoint
        }
        await api.put(putUrl, body);
        Alert.alert('Success', 'Record updated successfully!');
      } else {
        await api.post(endpoint, body);
        Alert.alert('Success', 'Record created successfully!');
      }
      setIsFormVisible(false);
      setFormValues({});
      setSelectedItem(null);
      fetchData();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Action failed');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async (item: any) => {
    triggerHaptic();
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this record?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              let deleteUrl = `${endpoint}/${item.id}`;
              await api.delete(deleteUrl);
              Alert.alert('Deleted', 'Record deleted successfully');
              fetchData();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete record');
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  // Approval Actions
  const handleApprove = async (item: any) => {
    triggerHaptic();
    Alert.alert(
      'Confirm Approval',
      'Are you sure you want to approve this request?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Approve',
          onPress: async () => {
            setIsLoading(true);
            try {
              let approveUrl = '';
              if (endpoint === '/expenses/pending') {
                approveUrl = `/expenses/${item.id}/approve`;
              } else if (endpoint === '/approvals/pending-users') {
                approveUrl = `/approvals/users/${item.id}/approve`;
              } else if (endpoint === '/approvals/church-requests') {
                approveUrl = `/approvals/church-requests/${item.id}/approve`;
              } else if (endpoint === '/church-transfers') {
                approveUrl = `/church-transfers/${item.id}/approve`;
              }
              
              await api.post(approveUrl);
              Alert.alert('Approved', 'Request has been approved.');
              fetchData();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to approve request');
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleRejectPrompt = (item: any) => {
    triggerHaptic();
    setRejectItemId(item.id);
    setRejectReason('');
    setIsRejectVisible(true);
  };

  const handleRejectSubmit = async () => {
    triggerHaptic();
    if (!rejectReason.trim()) {
      Alert.alert('Error', 'Please enter a rejection reason.');
      return;
    }
    setIsActionLoading(true);
    try {
      let rejectUrl = '';
      if (endpoint === '/expenses/pending') {
        rejectUrl = `/expenses/${rejectItemId}/reject`;
      } else if (endpoint === '/approvals/pending-users') {
        rejectUrl = `/approvals/users/${rejectItemId}/reject`;
      } else if (endpoint === '/approvals/church-requests') {
        rejectUrl = `/approvals/church-requests/${rejectItemId}/reject`;
      } else if (endpoint === '/church-transfers') {
        rejectUrl = `/church-transfers/${rejectItemId}/reject`;
      }
      
      await api.post(rejectUrl, { reason: rejectReason.trim() });
      Alert.alert('Rejected', 'Request has been rejected.');
      setIsRejectVisible(false);
      setRejectItemId(null);
      setRejectReason('');
      fetchData();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to reject request');
    } finally {
      setIsActionLoading(false);
    }
  };

  const isApprovalEndpoint = 
    endpoint === '/expenses/pending' || 
    endpoint === '/approvals/pending-users' || 
    endpoint === '/approvals/church-requests' ||
    endpoint === '/church-transfers';

  const isReadOnlyEndpoint = 
    endpoint === '/audit-logs' || 
    endpoint === '/import/history' || 
    endpoint === '/notifications';

  const renderItem = ({ item }: { item: any }) => {
    const cardTitleValue = item[titleField.key] !== undefined && item[titleField.key] !== null
      ? String(item[titleField.key])
      : 'Untitled';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{cardTitleValue}</Text>
        </View>
        <View style={styles.cardBody}>
          {detailFields.map((field) => {
            const displayVal = getFieldValue(item, field);

            if (field.isBadge) {
              const badgeColors = getBadgeStyle(displayVal);
              return (
                <View key={field.key} style={styles.row}>
                  <Text style={styles.label}>{field.label}</Text>
                  <View style={[styles.badge, { backgroundColor: badgeColors.bg }]}>
                    <Text style={[styles.badgeText, { color: badgeColors.text }]}>
                      {displayVal}
                    </Text>
                  </View>
                </View>
              );
            }

            return (
              <View key={field.key} style={styles.row}>
                <Text style={styles.label}>{field.label}</Text>
                <Text style={styles.value} numberOfLines={2}>
                  {displayVal}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Action buttons (Approve/Reject or Edit/Delete) */}
        {!isReadOnlyEndpoint && (
          <View style={styles.actionContainer}>
            {isApprovalEndpoint ? (
              <>
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.rejectBtn]}
                  onPress={() => handleRejectPrompt(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle-outline" size={14} color="#ffffff" />
                  <Text style={styles.actionBtnText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.approveBtn]}
                  onPress={() => handleApprove(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="checkmark-circle-outline" size={14} color="#ffffff" />
                  <Text style={styles.actionBtnText}>Approve</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.editBtn]}
                  onPress={() => openEditModal(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="create-outline" size={14} color="#ffffff" />
                  <Text style={styles.actionBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDelete(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={14} color="#ffffff" />
                  <Text style={styles.actionBtnText}>Delete</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
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
          <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
          
          <View style={styles.headerRightBtns}>
            {!isReadOnlyEndpoint && !isApprovalEndpoint && (
              <TouchableOpacity onPress={openCreateModal} style={[styles.headerBtn, { marginRight: 8 }]} activeOpacity={0.7}>
                <Ionicons name="add-outline" size={22} color="#ffffff" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={fetchData} style={styles.headerBtn} activeOpacity={0.7}>
              <Ionicons name="refresh-outline" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${title.toLowerCase()}...`}
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearIcon}>
              <Ionicons name="close-circle" size={18} color="#cbd5e1" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#1e40af" />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item, index) => (item.id || index).toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="file-tray-full-outline" size={32} color="#94a3b8" />
              </View>
              <Text style={styles.emptyText}>No data available</Text>
              <Text style={styles.emptySubtext}>There are currently no records in this category</Text>
            </View>
          }
        />
      )}

      {/* CREATE & EDIT FORM MODAL */}
      <Modal
        visible={isFormVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsFormVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {isEditing ? `Edit ${title.substring(0, title.length - 1)}` : `Add New ${title.substring(0, title.length - 1)}`}
            </Text>
            <ScrollView style={styles.modalFormScroll} showsVerticalScrollIndicator={false}>
              {schema.map((field) => {
                // Settings IDs are auto-supplied or immutable
                if (field.key === 'id') return null;
                
                return (
                  <View key={field.key} style={styles.formGroup}>
                    <Text style={styles.formLabel}>{field.label}</Text>
                    <TextInput
                      style={styles.formInput}
                      value={formValues[field.key] || ''}
                      onChangeText={(txt) => setFormValues(prev => ({ ...prev, [field.key]: txt }))}
                      placeholder={`Enter ${field.label.toLowerCase()}...`}
                      placeholderTextColor="#cbd5e1"
                      keyboardType={field.isCurrency ? 'numeric' : 'default'}
                    />
                  </View>
                );
              })}
            </ScrollView>
            <View style={styles.modalBtns}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setIsFormVisible(false)}
                disabled={isActionLoading}
              >
                <Text style={styles.modalBtnTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnSubmit]}
                onPress={handleFormSubmit}
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.modalBtnTextSubmit}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* REJECTION REASON PROMPT MODAL */}
      <Modal
        visible={isRejectVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsRejectVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reject Request</Text>
            <Text style={styles.modalSubtitle}>Please enter a reason for rejecting this request:</Text>
            <TextInput
              style={[styles.formInput, { height: 80, textAlignVertical: 'top', padding: 12 }]}
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="E.g., Missing supporting documentation, budget limit exceeded..."
              placeholderTextColor="#cbd5e1"
              multiline={true}
              numberOfLines={4}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setIsRejectVisible(false)}
                disabled={isActionLoading}
              >
                <Text style={styles.modalBtnTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnSubmit, { backgroundColor: '#ef4444' }]}
                onPress={handleRejectSubmit}
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.modalBtnTextSubmit}>Reject</Text>
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
  headerRightBtns: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginTop: -16,
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 15,
    color: '#1e293b',
  },
  clearIcon: {
    padding: 4,
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
  },
  card: {
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
  cardHeader: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  cardBody: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 14,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    elevation: 1,
  },
  approveBtn: {
    backgroundColor: '#10b981',
  },
  rejectBtn: {
    backgroundColor: '#ef4444',
  },
  editBtn: {
    backgroundColor: '#3b82f6',
  },
  deleteBtn: {
    backgroundColor: '#ef4444',
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
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
  modalSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
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
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 14,
    color: '#1e293b',
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnCancel: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalBtnSubmit: {
    backgroundColor: '#2563eb',
  },
  modalBtnTextCancel: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  modalBtnTextSubmit: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
