import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { CustomHeader } from '../../components/ui/CustomHeader';
import { DrugCard } from '../../components/ui/DrugCard';
import { Colors } from '../../constants/colors';
import { Drug } from '../../models/Drug';
import { useInventory } from '../../viewmodels/InventoryViewModel';

export default function ReportsScreen() {
  const { drugs, getStats } = useInventory();
  const [countedDrugs, setCountedDrugs] = useState<Drug[]>([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    countedItems: 0,
    shortageItems: 0,
    surplusItems: 0,
    totalDifference: 0,
  });

  useEffect(() => {
    // Filter drugs that have been physically counted
    const counted = drugs.filter(drug => drug.physicalQty > 0);
    setCountedDrugs(counted);
    
    // Update stats
    const currentStats = getStats();
    setStats(currentStats);
  }, [drugs, getStats]);

  const renderDrugCard = ({ item }: { item: Drug }) => (
    <DrugCard
      drug={item}
      onPress={() => {}}
    />
  );

  return (
    <View style={styles.container}>
      <CustomHeader 
        title="گزارشات" 
        subtitle={`${stats.countedItems} دارو شمارش شده`}
      />
      
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>آمار شمارش</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalItems}</Text>
            <Text style={styles.statLabel}>کل اقلام</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>
              {stats.countedItems}
            </Text>
            <Text style={styles.statLabel}>شمارش شده</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.error }]}>
              {stats.shortageItems}
            </Text>
            <Text style={styles.statLabel}>کمبود</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.success }]}>
              {stats.surplusItems}
            </Text>
            <Text style={styles.statLabel}>مازاد</Text>
          </View>
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>
          داروهای شمارش شده ({countedDrugs.length})
        </Text>
      </View>

      <FlatList
        data={countedDrugs}
        renderItem={renderDrugCard}
        keyExtractor={(item, index) => `${item.id}_${index}`}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              هنوز هیچ دارویی شمارش نشده است
            </Text>
            <Text style={styles.emptySubtext}>
              برای شروع شمارش، به تب &quot;شمارش انبار&quot; بروید
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
    backgroundColor: Colors.background,
  },
  statsContainer: {
    margin: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
