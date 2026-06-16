import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/format';

export default function FinanceScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'donations' | 'tithes' | 'offerings' | 'expenses'>('donations');
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
    }
  };

  const totalIncome = [
    ...data.donations.map((d: any) => d.amount),
    ...data.tithes.map((t: any) => t.amount),
    ...data.offerings.map((o: any) => o.amount),
  ].reduce((a: number, b: number) => a + b, 0);

  const totalExpenses = data.expenses.reduce((a: number, e: any) => a + e.amount, 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Finance</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCards}>
        <View style={[styles.summaryCard, styles.incomeCard]}>
          <Ionicons name="trending-up" size={24} color="#10b981" />
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={[styles.summaryValue, { color: '#10b981' }]}>
            {formatCurrency(totalIncome)}
          </Text>
        </View>

        <View style={[styles.summaryCard, styles.expenseCard]}>
          <Ionicons name="trending-down" size={24} color="#ef4444" />
          <Text style={styles.summaryLabel}>Expenses</Text>
          <Text style={[styles.summaryValue, { color: '#ef4444' }]}>
            {formatCurrency(totalExpenses)}
          </Text>
        </View>

        <View style={[styles.summaryCard, styles.balanceCard]}>
          <Ionicons name="wallet" size={24} color="#1e40af" />
          <Text style={styles.summaryLabel}>Balance</Text>
          <Text style={[styles.summaryValue, { color: '#1e40af' }]}>
            {formatCurrency(totalIncome - totalExpenses)}
          </Text>
        </View>
      </View>

      <View style={styles.tabs}>
        {(['donations', 'tithes', 'offerings', 'expenses'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[styles.tabText, activeTab === tab && styles.activeTabText]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.dataList}>
        {activeTab === 'donations' &&
          data.donations.map((item: any) => (
            <View key={item.id} style={styles.dataItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.category}</Text>
                <Text style={styles.itemSubtitle}>
                  {item.memberName || 'Anonymous'} • {formatDate(item.donationDate)}
                </Text>
              </View>
              <Text style={[styles.itemAmount, { color: '#10b981' }]}>
                +{formatCurrency(item.amount)}
              </Text>
            </View>
          ))}

        {activeTab === 'tithes' &&
          data.tithes.map((item: any) => (
            <View key={item.id} style={styles.dataItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>Tithe</Text>
                <Text style={styles.itemSubtitle}>
                  {item.memberName} • {formatDate(item.titheDate)}
                </Text>
              </View>
              <Text style={[styles.itemAmount, { color: '#10b981' }]}>
                +{formatCurrency(item.amount)}
              </Text>
            </View>
          ))}

        {activeTab === 'offerings' &&
          data.offerings.map((item: any) => (
            <View key={item.id} style={styles.dataItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.serviceType}</Text>
                <Text style={styles.itemSubtitle}>
                  {formatDate(item.serviceDate)}
                </Text>
              </View>
              <Text style={[styles.itemAmount, { color: '#10b981' }]}>
                +{formatCurrency(item.amount)}
              </Text>
            </View>
          ))}

        {activeTab === 'expenses' &&
          data.expenses.map((item: any) => (
            <View key={item.id} style={styles.dataItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.category}</Text>
                <Text style={styles.itemSubtitle}>
                  {formatDate(item.expenseDate)}
                </Text>
              </View>
              <Text style={[styles.itemAmount, { color: '#ef4444' }]}>
                -{formatCurrency(item.amount)}
              </Text>
            </View>
          ))}
      </View>
    </ScrollView>
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
  summaryCards: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
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
    borderLeftColor: '#1e40af',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabs: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#1e40af',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#fff',
  },
  dataList: {
    padding: 16,
  },
  dataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
});
