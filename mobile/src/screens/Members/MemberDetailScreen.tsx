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

  useEffect(() => {
    fetchMember();
  }, [memberId]);

  const fetchMember = async () => {
    try {
      const response = await api.get(`/members/${memberId}`);
      setMember(response.data);
    } catch (error) {
      console.error('Failed to fetch member:', error);
    }
  };

  if (!member) {
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
        <Text style={styles.headerTitle}>Member Details</Text>
        <TouchableOpacity>
          <Ionicons name="create-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {member.firstName[0]}
            {member.lastName[0]}
          </Text>
        </View>
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
          onPress={() => Linking.openURL(`mailto:${member.email}`)}
        >
          <Ionicons name="mail-outline" size={20} color="#6b7280" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{member.email}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.infoRow}
          onPress={() => Linking.openURL(`tel:${member.phone}`)}
        >
          <Ionicons name="call-outline" size={20} color="#6b7280" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{member.phone}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
        </TouchableOpacity>

        {member.address && (
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>
                {member.address}, {member.city}, {member.state} {member.zipCode}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Personal Information</Text>

        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={20} color="#6b7280" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Gender</Text>
            <Text style={styles.infoValue}>{member.gender}</Text>
          </View>
        </View>

        {member.dateOfBirth && (
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date of Birth</Text>
              <Text style={styles.infoValue}>
                {formatDate(member.dateOfBirth)}
              </Text>
            </View>
          </View>
        )}

        {member.membershipDate && (
          <View style={styles.infoRow}>
            <Ionicons name="ribbon-outline" size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Membership Date</Text>
              <Text style={styles.infoValue}>
                {formatDate(member.membershipDate)}
              </Text>
            </View>
          </View>
        )}

        {member.departmentName && (
          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Department</Text>
              <Text style={styles.infoValue}>{member.departmentName}</Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#1e40af',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  profileSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 16,
    color: '#1f2937',
    marginTop: 2,
  },
});
