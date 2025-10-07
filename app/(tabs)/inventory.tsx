import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AdvancedFilter, FilterOptions } from '../../components/ui/AdvancedFilter';
import { CustomHeader } from '../../components/ui/CustomHeader';
import { DrugCard } from '../../components/ui/DrugCard';
import { SearchBar } from '../../components/ui/SearchBar';
import { Colors } from '../../constants/colors';
import { Drug } from '../../models/Drug';
import { useInventory } from '../../viewmodels/InventoryViewModel';

export default function InventoryScreen() {
  const router = useRouter();
  const {
    drugs,
    searchQuery,
    setSearchQuery,
    setSelectedDrug,
    loadData,
    getFilteredDrugs,
    removeDuplicates,
  } = useInventory();

  const [filteredDrugs, setFilteredDrugs] = useState<Drug[]>([]);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    sortBy: 'name',
  });

  useEffect(() => {
    // Load data when component mounts
    loadData();
  }, [loadData]);

  useEffect(() => {
    // Remove duplicates first
    removeDuplicates();
    
    // Apply advanced filtering
    let filtered = drugs;
    
    // Apply search filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(drug => 
        drug.name.toLowerCase().includes(query) || 
        drug.code.toLowerCase().includes(query)
      );
    }
    
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'code':
          comparison = a.code.localeCompare(b.code);
          break;
        case 'stock':
          comparison = (a.stock || 0) - (b.stock || 0);
          break;
        case 'recent':
          comparison = new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          break;
      }
      
      return comparison;
    });
    
    setFilteredDrugs(filtered);
  }, [drugs, filters, removeDuplicates]);

  const handleDrugPress = (drug: Drug) => {
    setSelectedDrug(drug);
    router.push(`/drug-detail/${drug.id}`);
  };

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const getFilterSummary = () => {
    const activeFilters = [];
    if (filters.searchQuery) {
      activeFilters.push('جستجو');
    }
    if (filters.sortBy !== 'name') {
      const sortLabels = {
        code: 'کد کالا',
        stock: 'موجودی',
        recent: 'جدیدترین'
      };
      activeFilters.push(`مرتب‌سازی: ${sortLabels[filters.sortBy]}`);
    }
    return activeFilters.length > 0 ? `فیلتر: ${activeFilters.join('، ')}` : '';
  };



  const renderDrugCard = ({ item }: { item: Drug }) => (
    <DrugCard
      drug={item}
      onPress={handleDrugPress}
    />
  );

  return (
    <View style={styles.container}>
      <CustomHeader 
        title="شمارش انبار" 
        subtitle={`${filteredDrugs.length} از ${drugs.length} دارو`}
      />
      
      {/* Search and Filter Row */}
      <View style={styles.searchFilterRow}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowAdvancedFilter(true)}
        >
          <Text style={styles.filterIcon}>🔍</Text>
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <SearchBar
            value={filters.searchQuery}
            onChangeText={(text) => setFilters({ ...filters, searchQuery: text })}
            placeholder="جستجو در نام دارو یا کد کالا..."
            onClear={() => setFilters({ ...filters, searchQuery: '' })}
          />
        </View>
      </View>

      {/* Filter Summary */}
      {getFilterSummary() && (
        <View style={styles.filterSummary}>
          <Text style={styles.filterSummaryText}>{getFilterSummary()}</Text>
        </View>
      )}

      <FlatList
        data={filteredDrugs}
        renderItem={renderDrugCard}
        keyExtractor={(item, index) => `${item.id}_${index}`}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <AdvancedFilter
        isVisible={showAdvancedFilter}
        onClose={() => setShowAdvancedFilter(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    fontSize: 20,
  },
  searchContainer: {
    flex: 1,
  },
  filterSummary: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterSummaryText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
});
