import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
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
import { Member } from '../../types';
import { formatDate } from '../../utils/format';

interface Props {
  route: {
    params: {
      memberId: number;
    };
  };
  navigation: any;
}

export default function MemberDetailScreen({ route, navigation }: Props) {
  const { memberId } = route.params;
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMember();
  }, [memberId]);

  const fetchMember = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/members/${memberId}`);
      setMember(response.data);
    } catch (error) {
      console.error('Failed to fetch member:', error);
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

  const handleEdit = () => {
    triggerHaptic();
    if (member) {
      setFormValues({
        firstName: member.firstName || '',
        lastName: member.lastName || '',
        email: member.email || '',
        phone: member.phone || '',
        gender: member.gender || 'MALE',
        dateOfBirth: member.dateOfBirth || '',
        address: member.address || '',
        city: member.city || '',
        state: member.state || '',
        zipCode: member.zipCode || '',
        membershipDate: member.membershipDate || '',
        baptismDate: member.baptismDate || '',
        active: member.active,
      });
      setIsFormVisible(true);
    }
  };

  const handleFormSubmit = async () => {
    triggerHaptic();
    if (!formValues.firstName.trim() || !formValues.lastName.trim() || !formValues.email.trim()) {
      Alert.alert('Error', 'First Name, Last Name and Email are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.put(`/members/${memberId}`, {
        ...formValues,
        firstName: formValues.firstName.trim(),
        lastName: formValues.lastName.trim(),
        email: formValues.email.trim(),
      });
      Alert.alert('Success', 'Member details updated successfully!');
      setIsFormVisible(false);
      fetchMember();
    } catch (error: any) {
      console.error('Failed to update member:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    triggerHaptic();
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this member profile?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await api.delete(`/members/${memberId}`);
              Alert.alert('Success', 'Member profile deleted successfully.');
              navigation.goBack();
            } catch (error: any) {
              console.error('Failed to delete member:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete member.');
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleContactPress = (type: 'email' | 'phone', value: string) => {
    triggerHaptic();
    if (type === 'email') {
      Linking.openURL(`mailto:${value}`).catch(() => {});
    } else {
      Linking.openURL(`tel:${value}`).catch(() => {});
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e40af" />
      </View>
    );
  }

  if (!member) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Member details not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initials = `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`.toUpperCase();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#1e3a8a', '#1e40af']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={22} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Member Profile</Text>
          <TouchableOpacity onPress={handleEdit} style={styles.headerBtn}>
            <Ionicons name="create-outline" size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.profileSection}>
        <LinearGradient
          colors={['#eff6ff', '#dbeafe']}
          style={styles.avatar}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.avatarText}>{initials}</Text>
        </LinearGradient>
        <Text style={styles.name}>
          {member.firstName} {member.lastName}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: member.active ? '#d1fae5' : '#fee2e2' },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: member.active ? '#065f46' : '#991b1b' },
            ]}
          >
            {member.active ? 'Active Member' : 'Inactive'}
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Contact Information</Text>

        <TouchableOpacity
          style={styles.infoRow}
          onPress={() => handleContactPress('email', member.email)}
          activeOpacity={0.6}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="mail-outline" size={20} color="#1e40af" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{member.email}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
        </TouchableOpacity>

        {member.phone ? (
          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => handleContactPress('phone', member.phone)}
            activeOpacity={0.6}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="call-outline" size={20} color="#10b981" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{member.phone}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
          </TouchableOpacity>
        ) : null}

        {member.address ? (
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <View style={styles.iconCircle}>
              <Ionicons name="location-outline" size={20} color="#f59e0b" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>
                {member.address}{member.city ? `, ${member.city}` : ''}{member.state ? `, ${member.state}` : ''}{member.zipCode ? ` ${member.zipCode}` : ''}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      <View style={[styles.infoCard, { marginBottom: 30 }]}>
        <Text style={styles.cardTitle}>Personal Details</Text>

        <View style={styles.infoRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="person-outline" size={20} color="#475569" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Gender</Text>
            <Text style={styles.infoValue}>{member.gender || 'Not specified'}</Text>
          </View>
        </View>

        {member.dateOfBirth ? (
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="calendar-outline" size={20} color="#6366f1" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date of Birth</Text>
              <Text style={styles.infoValue}>
                {formatDate(member.dateOfBirth)}
              </Text>
            </View>
          </View>
        ) : null}

        {member.membershipDate ? (
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="ribbon-outline" size={20} color="#ec4899" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Membership Date</Text>
              <Text style={styles.infoValue}>
                {formatDate(member.membershipDate)}
              </Text>
            </View>
          </View>
        ) : null}

        {member.departmentName ? (
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <View style={styles.iconCircle}>
              <Ionicons name="business-outline" size={20} color="#06b6d4" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Department</Text>
              <Text style={styles.infoValue}>{member.departmentName}</Text>
            </View>
          </View>
        ) : null}
      </View>

      <TouchableOpacity
        style={styles.deleteProfileBtn}
        onPress={handleDelete}
        activeOpacity={0.7}
      >
        <Ionicons name="trash-outline" size={20} color="#ffffff" />
        <Text style={styles.deleteProfileBtnText}>Delete Member Profile</Text>
      </TouchableOpacity>

      {/* Edit Member Modal */}
      <Modal
        visible={isFormVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsFormVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Member Details</Text>
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
  profileSection: {
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
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  avatarText: {
    fontSize: 30,
    fontWeight: '700',
    color: '#1e40af',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    color: '#334155',
    marginTop: 2,
    fontWeight: '500',
  },
  deleteProfileBtn: {
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
  deleteProfileBtnText: {
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
