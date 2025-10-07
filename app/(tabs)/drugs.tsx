import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { CustomAlert } from '../../components/ui/CustomAlert';
import { CustomHeader } from '../../components/ui/CustomHeader';
import { DrugCard } from '../../components/ui/DrugCard';
import { Colors } from '../../constants/colors';
import { useCustomAlert } from '../../hooks/useCustomAlert';
import { Drug } from '../../models/Drug';
import { useInventory } from '../../viewmodels/InventoryViewModel';

type DrugCategory = 'all' | 'shortage' | 'surplus' | 'matched' | 'uncounted';

export default function DrugsScreen() {
  const router = useRouter();
  const { drugs } = useInventory();
  const { alertState, hideAlert } = useCustomAlert();
  const [selectedCategory, setSelectedCategory] = useState<DrugCategory>('all');
  const [filteredDrugs, setFilteredDrugs] = useState<Drug[]>([]);

  useEffect(() => {
    let filtered: Drug[] = [];

    switch (selectedCategory) {
      case 'shortage':
        filtered = drugs.filter(drug => (drug.difference || 0) < 0);
        break;
      case 'surplus':
        filtered = drugs.filter(drug => (drug.difference || 0) > 0);
        break;
      case 'matched':
        filtered = drugs.filter(drug => (drug.difference || 0) === 0 && (drug.physicalQty || 0) > 0);
        break;
      case 'uncounted':
        filtered = drugs.filter(drug => (drug.physicalQty || 0) === 0);
        break;
      default:
        filtered = drugs;
    }

    setFilteredDrugs(filtered);
  }, [drugs, selectedCategory]);

  const categories = [
    { key: 'all', label: 'همه', count: drugs.length, color: '#6c757d', icon: '📋' },
    { key: 'shortage', label: 'کمبود', count: drugs.filter(d => (d.difference || 0) < 0).length, color: '#dc3545', icon: '📉' },
    { key: 'surplus', label: 'مازاد', count: drugs.filter(d => (d.difference || 0) > 0).length, color: '#ffc107', icon: '📈' },
    { key: 'matched', label: 'مطابق', count: drugs.filter(d => (d.difference || 0) === 0 && (d.physicalQty || 0) > 0).length, color: '#28a745', icon: '✅' },
    { key: 'uncounted', label: 'شمارش نشده', count: drugs.filter(d => (d.physicalQty || 0) === 0).length, color: '#17a2b8', icon: '⏳' },
  ];

  const renderCategoryButton = (category: typeof categories[0]) => (
    <TouchableOpacity
      key={category.key}
      style={[
        styles.categoryButton,
        selectedCategory === category.key && styles.categoryButtonActive,
        { borderLeftColor: category.color }
      ]}
      onPress={() => setSelectedCategory(category.key as DrugCategory)}
    >
      <Text style={styles.categoryIcon}>{category.icon}</Text>
      <Text style={[
        styles.categoryLabel,
        selectedCategory === category.key && styles.categoryLabelActive
      ]}>
        {category.label}
      </Text>
      <Text style={[
        styles.categoryCount,
        selectedCategory === category.key && styles.categoryCountActive
      ]}>
        {category.count}
      </Text>
    </TouchableOpacity>
  );

  const handleDrugPress = (drug: Drug) => {
    router.push(`/drug-detail/${drug.id}`);
  };

  const renderDrugCard = ({ item }: { item: Drug }) => (
    <DrugCard
      drug={item}
      onPress={() => handleDrugPress(item)}
    />
  );

  const getCategoryTitle = () => {
    const category = categories.find(c => c.key === selectedCategory);
    return category ? `${category.icon} ${category.label} (${category.count})` : 'همه داروها';
  };

  return (
    <View style={styles.container}>
      <CustomHeader 
        title="داروها" 
        subtitle={`${drugs.length} دارو`}
      />
      
      {/* Category Filter Buttons */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={({ item }) => renderCategoryButton(item)}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Category Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>{getCategoryTitle()}</Text>
      </View>

      {/* Drugs List */}
      <FlatList
        data={filteredDrugs}
        renderItem={renderDrugCard}
        keyExtractor={(item, index) => `${item.id}_${index}`}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {selectedCategory === 'all' ? 'هیچ دارویی یافت نشد' : `هیچ دارویی در دسته "${categories.find(c => c.key === selectedCategory)?.label}" یافت نشد`}
            </Text>
          </View>
        }
      />
      
      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        onClose={hideAlert}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  categoriesContainer: {
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
    minWidth: 100,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginRight: 4,
  },
  categoryLabelActive: {
    color: Colors.surface,
  },
  categoryCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    backgroundColor: Colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoryCountActive: {
    color: Colors.primary,
    backgroundColor: Colors.surface,
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
