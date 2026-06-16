import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Member } from '../../types';

export default function MembersScreen({ navigation }: any) {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await api.get('/members');
      setMembers(response.data.content);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchMembers = async () => {
    if (!searchQuery.trim()) {
      fetchMembers();
      return;
    }
    try {
      const response = await api.get(`/members/search?search=${searchQuery}`);
      setMembers(response.data.content);
    } catch (error) {
      console.error('Failed to search members:', error);
    }
  };

  const renderMember = ({ item }: { item: Member }) => (
    <TouchableOpacity
      style={styles.memberCard}
      onPress={() => navigation.navigate('MemberDetail', { memberId: item.id })}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.firstName[0]}
          {item.lastName[0]}
        </Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={styles.memberEmail}>{item.email}</Text>
        <Text style={styles.memberPhone}>{item.phone}</Text>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Members</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search members..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchMembers}
          returnKeyType="search"
        />
      </View>

      <FlatList
        data={members}
        renderItem={renderMember}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>
              {isLoading ? 'Loading...' : 'No members found'}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
  },
  memberCard: {
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  memberEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  memberPhone: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  statusContainer: {
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
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
