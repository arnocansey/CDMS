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
import api from '../../services/api';
import { Member } from '../../types';
import { Skeleton } from '../../components/Skeleton';

export default function MembersScreen({ navigation }: any) {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/members');
      setMembers(response.data.content);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  };

  const searchMembers = async () => {
    triggerHaptic();
    if (!searchQuery.trim()) {
      fetchMembers();
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.get(`/members/search?search=${searchQuery}`);
      setMembers(response.data.content);
    } catch (error) {
      console.error('Failed to search members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'MALE',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    membershipDate: '',
    baptismDate: '',
    active: true,
  });

  const handleAddMember = () => {
    triggerHaptic();
    setFormValues({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      gender: 'MALE',
      dateOfBirth: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      membershipDate: '',
      baptismDate: '',
      active: true,
    });
    setIsFormVisible(true);
  };

  const handleFormSubmit = async () => {
    triggerHaptic();
    if (!formValues.firstName.trim() || !formValues.lastName.trim() || !formValues.email.trim()) {
      Alert.alert('Error', 'First Name, Last Name and Email are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/members', {
        ...formValues,
        firstName: formValues.firstName.trim(),
        lastName: formValues.lastName.trim(),
        email: formValues.email.trim(),
      });
      Alert.alert('Success', 'Member added successfully!');
      setIsFormVisible(false);
      fetchMembers();
    } catch (error: any) {
      console.error('Failed to create member:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to add member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMemberPress = (memberId: number) => {
    triggerHaptic();
    navigation.navigate('MemberDetail', { memberId });
  };

  const renderMember = ({ item }: { item: Member }) => {
    const initials = `${item.firstName?.[0] || ''}${item.lastName?.[0] || ''}`.toUpperCase();
    
    return (
      <TouchableOpacity
        style={styles.memberCard}
        onPress={() => handleMemberPress(item.id)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['#eff6ff', '#dbeafe']}
          style={styles.avatar}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.avatarText}>{initials}</Text>
        </LinearGradient>
        
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={styles.memberEmail} numberOfLines={1}>{item.email}</Text>
          {item.phone ? (
            <Text style={styles.memberPhone}>{item.phone}</Text>
          ) : null}
        </View>

        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: item.active ? '#d1fae5' : '#fee2e2' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: item.active ? '#065f46' : '#991b1b' },
              ]}
            >
              {item.active ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
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
          <Text style={styles.title}>Members</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddMember} activeOpacity={0.7}>
            <Ionicons name="add-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={searchMembers}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => { setSearchQuery(''); fetchMembers(); }} style={styles.clearIcon}>
              <Ionicons name="close-circle" size={18} color="#cbd5e1" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {isLoading ? (
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <View key={idx} style={styles.memberCard}>
              <Skeleton width={52} height={52} borderRadius={16} style={{ marginRight: 14 }} />
              <View style={styles.memberInfo}>
                <Skeleton width={120} height={16} borderRadius={4} style={{ marginBottom: 6 }} />
                <Skeleton width={160} height={12} borderRadius={4} style={{ marginBottom: 4 }} />
                <Skeleton width={90} height={10} borderRadius={4} />
              </View>
              <View style={styles.statusContainer}>
                <Skeleton width={55} height={20} borderRadius={10} />
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <FlatList
          data={members}
          renderItem={renderMember}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="people-outline" size={32} color="#94a3b8" />
              </View>
              <Text style={styles.emptyText}>No members found</Text>
              <Text style={styles.emptySubtext}>Try searching with different terms or add a new member</Text>
            </View>
          }
        />
      )}

      {/* Create Member Modal */}
      <Modal
        visible={isFormVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsFormVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add New Member</Text>
            <ScrollView style={styles.modalFormScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>First Name *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formValues.firstName}
                  onChangeText={(txt) => setFormValues(prev => ({ ...prev, firstName: txt }))}
                  placeholder="Enter first name..."
                  placeholderTextColor="#cbd5e1"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Last Name *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formValues.lastName}
                  onChangeText={(txt) => setFormValues(prev => ({ ...prev, lastName: txt }))}
                  placeholder="Enter last name..."
                  placeholderTextColor="#cbd5e1"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formValues.email}
                  onChangeText={(txt) => setFormValues(prev => ({ ...prev, email: txt }))}
                  placeholder="Enter email address..."
                  placeholderTextColor="#cbd5e1"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Phone</Text>
                <TextInput
                  style={styles.formInput}
                  value={formValues.phone}
                  onChangeText={(txt) => setFormValues(prev => ({ ...prev, phone: txt }))}
                  placeholder="Enter phone number..."
                  placeholderTextColor="#cbd5e1"
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Gender</Text>
                <View style={styles.genderRow}>
                  {['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'].map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.genderOption, formValues.gender === g && styles.genderOptionActive]}
                      onPress={() => setFormValues(prev => ({ ...prev, gender: g }))}
                    >
                      <Text style={[styles.genderOptionText, formValues.gender === g && styles.genderOptionTextActive]}>
                        {g === 'PREFER_NOT_TO_SAY' ? 'Prefer Not to Say' : g.charAt(0) + g.slice(1).toLowerCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Date of Birth (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.formInput}
                  value={formValues.dateOfBirth}
                  onChangeText={(txt) => setFormValues(prev => ({ ...prev, dateOfBirth: txt }))}
                  placeholder="e.g. 1990-05-15"
                  placeholderTextColor="#cbd5e1"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Address</Text>
                <TextInput
                  style={styles.formInput}
                  value={formValues.address}
                  onChangeText={(txt) => setFormValues(prev => ({ ...prev, address: txt }))}
                  placeholder="Enter street address..."
                  placeholderTextColor="#cbd5e1"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>City</Text>
                <TextInput
                  style={styles.formInput}
                  value={formValues.city}
                  onChangeText={(txt) => setFormValues(prev => ({ ...prev, city: txt }))}
                  placeholder="Enter city..."
                  placeholderTextColor="#cbd5e1"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>State</Text>
                <TextInput
                  style={styles.formInput}
                  value={formValues.state}
                  onChangeText={(txt) => setFormValues(prev => ({ ...prev, state: txt }))}
                  placeholder="Enter state..."
                  placeholderTextColor="#cbd5e1"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Zip Code</Text>
                <TextInput
                  style={styles.formInput}
                  value={formValues.zipCode}
                  onChangeText={(txt) => setFormValues(prev => ({ ...prev, zipCode: txt }))}
                  placeholder="Enter zip code..."
                  placeholderTextColor="#cbd5e1"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Membership Date (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.formInput}
                  value={formValues.membershipDate}
                  onChangeText={(txt) => setFormValues(prev => ({ ...prev, membershipDate: txt }))}
                  placeholder="e.g. 2023-01-01"
                  placeholderTextColor="#cbd5e1"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Baptism Date (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.formInput}
                  value={formValues.baptismDate}
                  onChangeText={(txt) => setFormValues(prev => ({ ...prev, baptismDate: txt }))}
                  placeholder="e.g. 2023-03-15"
                  placeholderTextColor="#cbd5e1"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Status</Text>
                <TouchableOpacity
                  style={[styles.toggleContainer, formValues.active ? styles.toggleContainerActive : null]}
                  onPress={() => setFormValues(prev => ({ ...prev, active: !prev.active }))}
                >
                  <Text style={[styles.toggleText, formValues.active ? styles.toggleTextActive : null]}>
                    {formValues.active ? 'Active' : 'Inactive'}
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
  memberCard: {
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
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e40af',
  },
  memberInfo: {
    flex: 1,
    paddingRight: 8,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  memberEmail: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  memberPhone: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  statusContainer: {
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
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
