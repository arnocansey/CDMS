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
import { formatCurrency, formatDate } from '../../utils/format';

export default function FinanceScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'donations' | 'tithes' | 'offerings' | 'expenses'>('donations');
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    donations: [],
    tithes: [],
    offerings: [],
    expenses: [],
  });

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    setIsLoading(true);
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    const endDate = new Date();

    try {
      const [donationsRes, tithesRes, offeringsRes, expensesRes] = await Promise.all([
        api.get(`/finance/donations?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`),
        api.get(`/finance/tithes?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`),
        api.get(`/finance/offerings?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`),
        api.get(`/finance/expenses?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`),
      ]);

      setData({
        donations: donationsRes.data,
        tithes: tithesRes.data,
        offerings: offeringsRes.data,
        expenses: expensesRes.data,
      });
    } catch (error) {
      console.error('Failed to fetch financial data:', error);
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

  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<'donations' | 'tithes' | 'offerings' | 'expenses'>('donations');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [donationForm, setDonationForm] = useState({
    amount: '',
    category: 'GENERAL',
    donationDate: '',
    memberId: '',
    description: '',
    paymentMethod: 'CASH',
  });
  const [titheForm, setTitheForm] = useState({
    memberId: '',
    amount: '',
    titheDate: '',
    paymentMethod: 'CASH',
  });
  const [offeringForm, setOfferingForm] = useState({
    serviceDate: '',
    serviceType: 'SUNDAY',
    amount: '',
    offeringType: 'GENERAL',
    description: '',
  });
  const [expenseForm, setExpenseForm] = useState({
    category: 'UTILITIES',
    amount: '',
    expenseDate: '',
    description: '',
    paymentMethod: 'CASH',
  });

  const handleAddTransaction = () => {
    triggerHaptic();
    setIsPickerVisible(true);
  };

  const handleSelectType = (type: 'donations' | 'tithes' | 'offerings' | 'expenses') => {
    triggerHaptic();
    setIsPickerVisible(false);
    setSelectedType(type);
    setIsEditing(false);
    setSelectedId(null);

    const todayStr = new Date().toISOString().split('T')[0];
    if (type === 'donations') {
      setDonationForm({ amount: '', category: 'GENERAL', donationDate: todayStr, memberId: '', description: '', paymentMethod: 'CASH' });
    } else if (type === 'tithes') {
      setTitheForm({ memberId: '', amount: '', titheDate: todayStr, paymentMethod: 'CASH' });
    } else if (type === 'offerings') {
      setOfferingForm({ serviceDate: todayStr, serviceType: 'SUNDAY', amount: '', offeringType: 'GENERAL', description: '' });
    } else if (type === 'expenses') {
      setExpenseForm({ category: 'UTILITIES', amount: '', expenseDate: todayStr, description: '', paymentMethod: 'CASH' });
    }
    setIsFormVisible(true);
  };

  const handleEditTransaction = (type: 'donations' | 'tithes' | 'offerings' | 'expenses', item: any) => {
    triggerHaptic();
    setSelectedType(type);
    setIsEditing(true);
    setSelectedId(item.id);

    if (type === 'donations') {
      setDonationForm({
        amount: String(item.amount || ''),
        category: item.category || 'GENERAL',
        donationDate: item.donationDate ? item.donationDate.split('T')[0] : '',
        memberId: item.memberId ? String(item.memberId) : '',
        description: item.description || '',
        paymentMethod: item.paymentMethod || 'CASH',
      });
    } else if (type === 'tithes') {
      setTitheForm({
        memberId: item.memberId ? String(item.memberId) : '',
        amount: String(item.amount || ''),
        titheDate: item.titheDate ? item.titheDate.split('T')[0] : '',
        paymentMethod: item.paymentMethod || 'CASH',
      });
    } else if (type === 'offerings') {
      setOfferingForm({
        serviceDate: item.serviceDate ? item.serviceDate.split('T')[0] : '',
        serviceType: item.serviceType || 'SUNDAY',
        amount: String(item.amount || ''),
        offeringType: item.offeringType || 'GENERAL',
        description: item.description || '',
      });
    } else if (type === 'expenses') {
      setExpenseForm({
        category: item.category || 'UTILITIES',
        amount: String(item.amount || ''),
        expenseDate: item.expenseDate ? item.expenseDate.split('T')[0] : '',
        description: item.description || '',
        paymentMethod: item.paymentMethod || 'CASH',
      });
    }
    setIsFormVisible(true);
  };

  const handleFormSubmit = async () => {
    triggerHaptic();
    setIsSubmitting(true);
    try {
      if (selectedType === 'donations') {
        if (!donationForm.amount.trim() || !donationForm.donationDate.trim()) {
          Alert.alert('Error', 'Amount and Donation Date are required.');
          setIsSubmitting(false);
          return;
        }
        const payload: any = {
          amount: parseFloat(donationForm.amount),
          category: donationForm.category,
          donationDate: donationForm.donationDate,
          description: donationForm.description.trim() || null,
          paymentMethod: donationForm.paymentMethod,
        };
        if (donationForm.memberId.trim()) payload.memberId = parseInt(donationForm.memberId);

        if (isEditing && selectedId) {
          await api.put(`/finance/donations/${selectedId}`, payload);
          Alert.alert('Success', 'Donation updated successfully!');
        } else {
          await api.post('/finance/donations', payload);
          Alert.alert('Success', 'Donation recorded successfully!');
        }
      } else if (selectedType === 'tithes') {
        if (!titheForm.amount.trim() || !titheForm.titheDate.trim() || !titheForm.memberId.trim()) {
          Alert.alert('Error', 'Member ID, Amount and Date are required.');
          setIsSubmitting(false);
          return;
        }
        const payload = {
          memberId: parseInt(titheForm.memberId),
          amount: parseFloat(titheForm.amount),
          titheDate: titheForm.titheDate,
          paymentMethod: titheForm.paymentMethod,
        };
        if (isEditing && selectedId) {
          await api.put(`/finance/tithes/${selectedId}`, payload);
          Alert.alert('Success', 'Tithe updated successfully!');
        } else {
          await api.post('/finance/tithes', payload);
          Alert.alert('Success', 'Tithe recorded successfully!');
        }
      } else if (selectedType === 'offerings') {
        if (!offeringForm.amount.trim() || !offeringForm.serviceDate.trim()) {
          Alert.alert('Error', 'Amount and Service Date are required.');
          setIsSubmitting(false);
          return;
        }
        const payload = {
          serviceDate: offeringForm.serviceDate,
          serviceType: offeringForm.serviceType,
          amount: parseFloat(offeringForm.amount),
          offeringType: offeringForm.offeringType,
          description: offeringForm.description.trim() || null,
        };
        if (isEditing && selectedId) {
          await api.put(`/finance/offerings/${selectedId}`, payload);
          Alert.alert('Success', 'Offering updated successfully!');
        } else {
          await api.post('/finance/offerings', payload);
          Alert.alert('Success', 'Offering recorded successfully!');
        }
      } else if (selectedType === 'expenses') {
        if (!expenseForm.amount.trim() || !expenseForm.expenseDate.trim()) {
          Alert.alert('Error', 'Amount and Expense Date are required.');
          setIsSubmitting(false);
          return;
        }
        const payload = {
          category: expenseForm.category,
          amount: parseFloat(expenseForm.amount),
          description: expenseForm.description.trim() || null,
          expenseDate: expenseForm.expenseDate,
          paymentMethod: expenseForm.paymentMethod,
        };
        if (isEditing && selectedId) {
          await api.put(`/finance/expenses/${selectedId}`, payload);
          Alert.alert('Success', 'Expense updated successfully!');
        } else {
          await api.post('/finance/expenses', payload);
          Alert.alert('Success', 'Expense recorded successfully!');
        }
      }
      setIsFormVisible(false);
      fetchFinancialData();
    } catch (error: any) {
      console.error('Failed to save transaction:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to save transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTransaction = (type: 'donations' | 'tithes' | 'offerings' | 'expenses', id: number) => {
    triggerHaptic();
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this transaction record?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await api.delete(`/finance/${type}/${id}`);
              Alert.alert('Success', 'Transaction deleted successfully.');
              setIsFormVisible(false);
              fetchFinancialData();
            } catch (error: any) {
              console.error('Failed to delete transaction:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete transaction.');
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleTabPress = (tab: 'donations' | 'tithes' | 'offerings' | 'expenses') => {
    triggerHaptic();
    setActiveTab(tab);
  };

  const totalIncome = [
    ...data.donations.map((d: any) => d.amount),
    ...data.tithes.map((t: any) => t.amount),
    ...data.offerings.map((o: any) => o.amount),
  ].reduce((a: number, b: number) => a + b, 0);

  const totalExpenses = data.expenses.reduce((a: number, e: any) => a + e.amount, 0);

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
          <Text style={styles.headerTitle}>Finance</Text>
          <TouchableOpacity onPress={handleAddTransaction} style={styles.headerBtn} activeOpacity={0.7}>
            <Ionicons name="add-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.summaryCards}>
        <View style={[styles.summaryCard, styles.incomeCard]}>
          <View style={[styles.iconCircle, { backgroundColor: '#ecfdf5' }]}>
            <Ionicons name="trending-up" size={18} color="#10b981" />
          </View>
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={[styles.summaryValue, { color: '#059669' }]}>
            {formatCurrency(totalIncome)}
          </Text>
        </View>

        <View style={[styles.summaryCard, styles.expenseCard]}>
          <View style={[styles.iconCircle, { backgroundColor: '#fee2e2' }]}>
            <Ionicons name="trending-down" size={18} color="#ef4444" />
          </View>
          <Text style={styles.summaryLabel}>Expenses</Text>
          <Text style={[styles.summaryValue, { color: '#dc2626' }]}>
            {formatCurrency(totalExpenses)}
          </Text>
        </View>

        <View style={[styles.summaryCard, styles.balanceCard]}>
          <View style={[styles.iconCircle, { backgroundColor: '#eff6ff' }]}>
            <Ionicons name="wallet-outline" size={18} color="#2563eb" />
          </View>
          <Text style={styles.summaryLabel}>Balance</Text>
          <Text style={[styles.summaryValue, { color: '#1e40af' }]}>
            {formatCurrency(totalIncome - totalExpenses)}
          </Text>
        </View>
      </View>

      <View style={styles.tabSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {(['donations', 'tithes', 'offerings', 'expenses'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => handleTabPress(tab)}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.tabText, activeTab === tab && styles.activeTabText]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#1e40af" style={{ marginTop: 40 }} />
        </View>
      ) : (
        <View style={styles.dataList}>
          {activeTab === 'donations' && data.donations.length === 0 && (
            <Text style={styles.noDataText}>No donations recorded</Text>
          )}
          {activeTab === 'donations' &&
            data.donations.map((item: any) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.dataItem}
                onPress={() => handleEditTransaction('donations', item)}
                activeOpacity={0.7}
              >
                <View style={[styles.itemIconBadge, { backgroundColor: '#ecfdf5' }]}>
                  <Ionicons name="arrow-down-outline" size={20} color="#10b981" />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{item.category}</Text>
                  <Text style={styles.itemSubtitle}>
                    {item.memberName || 'Anonymous'} • {formatDate(item.donationDate)}
                  </Text>
                </View>
                <Text style={[styles.itemAmount, { color: '#059669' }]}>
                  +{formatCurrency(item.amount)}
                </Text>
              </TouchableOpacity>
            ))}

          {activeTab === 'tithes' && data.tithes.length === 0 && (
            <Text style={styles.noDataText}>No tithes recorded</Text>
          )}
          {activeTab === 'tithes' &&
            data.tithes.map((item: any) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.dataItem}
                onPress={() => handleEditTransaction('tithes', item)}
                activeOpacity={0.7}
              >
                <View style={[styles.itemIconBadge, { backgroundColor: '#ecfdf5' }]}>
                  <Ionicons name="arrow-down-outline" size={20} color="#10b981" />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>Tithe</Text>
                  <Text style={styles.itemSubtitle}>
                    {item.memberName} • {formatDate(item.titheDate)}
                  </Text>
                </View>
                <Text style={[styles.itemAmount, { color: '#059669' }]}>
                  +{formatCurrency(item.amount)}
                </Text>
              </TouchableOpacity>
            ))}

          {activeTab === 'offerings' && data.offerings.length === 0 && (
            <Text style={styles.noDataText}>No offerings recorded</Text>
          )}
          {activeTab === 'offerings' &&
            data.offerings.map((item: any) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.dataItem}
                onPress={() => handleEditTransaction('offerings', item)}
                activeOpacity={0.7}
              >
                <View style={[styles.itemIconBadge, { backgroundColor: '#ecfdf5' }]}>
                  <Ionicons name="arrow-down-outline" size={20} color="#10b981" />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{item.serviceType}</Text>
                  <Text style={styles.itemSubtitle}>
                    {formatDate(item.serviceDate)}
                  </Text>
                </View>
                <Text style={[styles.itemAmount, { color: '#059669' }]}>
                  +{formatCurrency(item.amount)}
                </Text>
              </TouchableOpacity>
            ))}

          {activeTab === 'expenses' && data.expenses.length === 0 && (
            <Text style={styles.noDataText}>No expenses recorded</Text>
          )}
          {activeTab === 'expenses' &&
            data.expenses.map((item: any) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.dataItem}
                onPress={() => handleEditTransaction('expenses', item)}
                activeOpacity={0.7}
              >
                <View style={[styles.itemIconBadge, { backgroundColor: '#fee2e2' }]}>
                  <Ionicons name="arrow-up-outline" size={20} color="#ef4444" />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{item.category}</Text>
                  <Text style={styles.itemSubtitle}>
                    {formatDate(item.expenseDate)}
                  </Text>
                </View>
                <Text style={[styles.itemAmount, { color: '#dc2626' }]}>
                  -{formatCurrency(item.amount)}
                </Text>
              </TouchableOpacity>
            ))}
        </View>
      )}

      {/* Transaction Type Picker Modal */}
      <Modal
        visible={isPickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsPickerVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Transaction Type</Text>
            <View style={styles.pickerOptions}>
              {[
                { type: 'donations' as const, label: 'Donation', icon: 'arrow-down-circle', color: '#10b981' },
                { type: 'tithes' as const, label: 'Tithe', icon: 'logo-usd', color: '#2563eb' },
                { type: 'offerings' as const, label: 'Offering', icon: 'gift', color: '#8b5cf6' },
                { type: 'expenses' as const, label: 'Expense', icon: 'arrow-up-circle', color: '#ef4444' },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.type}
                  style={styles.pickerOption}
                  onPress={() => handleSelectType(opt.type)}
                >
                  <Ionicons name={opt.icon as any} size={24} color={opt.color} />
                  <Text style={styles.pickerOptionLabel}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity 
              style={[styles.modalBtn, styles.modalBtnCancel, { marginTop: 16 }]}
              onPress={() => setIsPickerVisible(false)}
            >
              <Text style={styles.modalBtnTextCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Transaction Form Modal */}
      <Modal
        visible={isFormVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsFormVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {isEditing ? 'Edit' : 'Add'} {selectedType.charAt(0).toUpperCase() + selectedType.slice(1, -1)}
            </Text>
            <ScrollView style={styles.modalFormScroll} showsVerticalScrollIndicator={false}>
              
              {/* DONATION FORM */}
              {selectedType === 'donations' && (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Amount *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={donationForm.amount}
                      onChangeText={(txt) => setDonationForm(prev => ({ ...prev, amount: txt }))}
                      placeholder="e.g. 100.00"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Category *</Text>
                    <View style={styles.genderRow}>
                      {['GENERAL', 'BUILDING_FUND', 'WELFARE', 'SPECIAL'].map((cat) => (
                        <TouchableOpacity
                          key={cat}
                          style={[styles.genderOption, donationForm.category === cat && styles.genderOptionActive]}
                          onPress={() => setDonationForm(prev => ({ ...prev, category: cat }))}
                        >
                          <Text style={[styles.genderOptionText, donationForm.category === cat && styles.genderOptionTextActive]}>
                            {cat.replace('_', ' ')}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Donation Date * (YYYY-MM-DD)</Text>
                    <TextInput
                      style={styles.formInput}
                      value={donationForm.donationDate}
                      onChangeText={(txt) => setDonationForm(prev => ({ ...prev, donationDate: txt }))}
                      placeholder="e.g. 2026-06-18"
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Member ID (Optional)</Text>
                    <TextInput
                      style={styles.formInput}
                      value={donationForm.memberId}
                      onChangeText={(txt) => setDonationForm(prev => ({ ...prev, memberId: txt }))}
                      placeholder="Enter Member ID if registered..."
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Description</Text>
                    <TextInput
                      style={styles.formInput}
                      value={donationForm.description}
                      onChangeText={(txt) => setDonationForm(prev => ({ ...prev, description: txt }))}
                      placeholder="Enter description/notes..."
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Payment Method</Text>
                    <View style={styles.genderRow}>
                      {['CASH', 'CHECK', 'BANK_TRANSFER', 'CARD', 'MOBILE'].map((pm) => (
                        <TouchableOpacity
                          key={pm}
                          style={[styles.genderOption, donationForm.paymentMethod === pm && styles.genderOptionActive]}
                          onPress={() => setDonationForm(prev => ({ ...prev, paymentMethod: pm }))}
                        >
                          <Text style={[styles.genderOptionText, donationForm.paymentMethod === pm && styles.genderOptionTextActive]}>
                            {pm.replace('_', ' ')}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </>
              )}

              {/* TITHE FORM */}
              {selectedType === 'tithes' && (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Member ID *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={titheForm.memberId}
                      onChangeText={(txt) => setTitheForm(prev => ({ ...prev, memberId: txt }))}
                      placeholder="Enter registered Member ID..."
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Amount *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={titheForm.amount}
                      onChangeText={(txt) => setTitheForm(prev => ({ ...prev, amount: txt }))}
                      placeholder="e.g. 250.00"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Tithe Date * (YYYY-MM-DD)</Text>
                    <TextInput
                      style={styles.formInput}
                      value={titheForm.titheDate}
                      onChangeText={(txt) => setTitheForm(prev => ({ ...prev, titheDate: txt }))}
                      placeholder="e.g. 2026-06-18"
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Payment Method</Text>
                    <View style={styles.genderRow}>
                      {['CASH', 'CHECK', 'BANK_TRANSFER', 'CARD', 'MOBILE'].map((pm) => (
                        <TouchableOpacity
                          key={pm}
                          style={[styles.genderOption, titheForm.paymentMethod === pm && styles.genderOptionActive]}
                          onPress={() => setTitheForm(prev => ({ ...prev, paymentMethod: pm }))}
                        >
                          <Text style={[styles.genderOptionText, titheForm.paymentMethod === pm && styles.genderOptionTextActive]}>
                            {pm.replace('_', ' ')}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </>
              )}

              {/* OFFERING FORM */}
              {selectedType === 'offerings' && (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Amount *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={offeringForm.amount}
                      onChangeText={(txt) => setOfferingForm(prev => ({ ...prev, amount: txt }))}
                      placeholder="e.g. 500.00"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Service Type *</Text>
                    <View style={styles.genderRow}>
                      {['SUNDAY', 'WEDNESDAY', 'FRIDAY', 'SPECIAL', 'OTHER'].map((st) => (
                        <TouchableOpacity
                          key={st}
                          style={[styles.genderOption, offeringForm.serviceType === st && styles.genderOptionActive]}
                          onPress={() => setOfferingForm(prev => ({ ...prev, serviceType: st }))}
                        >
                          <Text style={[styles.genderOptionText, offeringForm.serviceType === st && styles.genderOptionTextActive]}>
                            {st}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Service Date * (YYYY-MM-DD)</Text>
                    <TextInput
                      style={styles.formInput}
                      value={offeringForm.serviceDate}
                      onChangeText={(txt) => setOfferingForm(prev => ({ ...prev, serviceDate: txt }))}
                      placeholder="e.g. 2026-06-18"
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Offering Type</Text>
                    <View style={styles.genderRow}>
                      {['GENERAL', 'THANKSGIVING', 'SEED', 'MISCELLANEOUS'].map((ot) => (
                        <TouchableOpacity
                          key={ot}
                          style={[styles.genderOption, offeringForm.offeringType === ot && styles.genderOptionActive]}
                          onPress={() => setOfferingForm(prev => ({ ...prev, offeringType: ot }))}
                        >
                          <Text style={[styles.genderOptionText, offeringForm.offeringType === ot && styles.genderOptionTextActive]}>
                            {ot}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Description</Text>
                    <TextInput
                      style={styles.formInput}
                      value={offeringForm.description}
                      onChangeText={(txt) => setOfferingForm(prev => ({ ...prev, description: txt }))}
                      placeholder="Enter details..."
                    />
                  </View>
                </>
              )}

              {/* EXPENSE FORM */}
              {selectedType === 'expenses' && (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Amount *</Text>
                    <TextInput
                      style={styles.formInput}
                      value={expenseForm.amount}
                      onChangeText={(txt) => setExpenseForm(prev => ({ ...prev, amount: txt }))}
                      placeholder="e.g. 80.00"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Category *</Text>
                    <View style={styles.genderRow}>
                      {[
                        'UTILITIES', 'SALARIES', 'EVANGELISM', 'MAINTENANCE',
                        'EQUIPMENT', 'TRANSPORTATION', 'WELFARE', 'MISCELLANEOUS'
                      ].map((cat) => (
                        <TouchableOpacity
                          key={cat}
                          style={[styles.genderOption, expenseForm.category === cat && styles.genderOptionActive]}
                          onPress={() => setExpenseForm(prev => ({ ...prev, category: cat }))}
                        >
                          <Text style={[styles.genderOptionText, expenseForm.category === cat && styles.genderOptionTextActive]}>
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Expense Date * (YYYY-MM-DD)</Text>
                    <TextInput
                      style={styles.formInput}
                      value={expenseForm.expenseDate}
                      onChangeText={(txt) => setExpenseForm(prev => ({ ...prev, expenseDate: txt }))}
                      placeholder="e.g. 2026-06-18"
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Description</Text>
                    <TextInput
                      style={styles.formInput}
                      value={expenseForm.description}
                      onChangeText={(txt) => setExpenseForm(prev => ({ ...prev, description: txt }))}
                      placeholder="Enter description details..."
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Payment Method</Text>
                    <View style={styles.genderRow}>
                      {['CASH', 'CHECK', 'BANK_TRANSFER', 'CARD', 'MOBILE'].map((pm) => (
                        <TouchableOpacity
                          key={pm}
                          style={[styles.genderOption, expenseForm.paymentMethod === pm && styles.genderOptionActive]}
                          onPress={() => setExpenseForm(prev => ({ ...prev, paymentMethod: pm }))}
                        >
                          <Text style={[styles.genderOptionText, expenseForm.paymentMethod === pm && styles.genderOptionTextActive]}>
                            {pm.replace('_', ' ')}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </>
              )}

            </ScrollView>
            <View style={styles.modalBtns}>
              {isEditing && (
                <TouchableOpacity 
                  style={[styles.modalBtn, { backgroundColor: '#ef4444', marginRight: 'auto' }]}
                  onPress={() => selectedId && handleDeleteTransaction(selectedType, selectedId)}
                  disabled={isSubmitting}
                >
                  <Text style={{ color: '#ffffff', fontWeight: '600' }}>Delete</Text>
                </TouchableOpacity>
              )}
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
  summaryCards: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  incomeCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
  },
  expenseCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  balanceCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  tabSection: {
    paddingHorizontal: 20,
  },
  tabsScroll: {
    gap: 8,
    paddingRight: 20,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeTab: {
    backgroundColor: '#1e40af',
    borderColor: '#1e40af',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#ffffff',
  },
  dataList: {
    padding: 20,
  },
  dataItem: {
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
  itemIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  itemInfo: {
    flex: 1,
    paddingRight: 8,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 3,
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 40,
    fontSize: 14,
  },
  pickerOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
    justifyContent: 'center',
  },
  pickerOption: {
    width: '45%',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  pickerOptionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
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
    textAlign: 'center',
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
