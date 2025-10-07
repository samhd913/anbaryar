import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, StatusColors } from '../../constants/colors';
import { Drug } from '../../models/Drug';

interface DrugCardProps {
  drug: Drug;
  onPress: (drug: Drug) => void;
  isSelected?: boolean;
}

export const DrugCard: React.FC<DrugCardProps> = ({ 
  drug, 
  onPress, 
  isSelected = false 
}) => {
  const getStatusColor = () => {
    if ((drug.physicalQty || 0) === 0) return StatusColors.uncounted;
    if ((drug.difference || 0) === 0) return StatusColors.exact;
    if ((drug.difference || 0) > 0) return StatusColors.surplus;
    return StatusColors.shortage;
  };

  const getStatusText = () => {
    if ((drug.physicalQty || 0) === 0) return 'شمارش نشده';
    if ((drug.difference || 0) === 0) return 'مطابق';
    if ((drug.difference || 0) > 0) return `مازاد ${drug.difference || 0}`;
    return `کمبود ${Math.abs(drug.difference || 0)}`;
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && styles.selectedCard
      ]}
      onPress={() => onPress(drug)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={2}>
          {drug.name}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>
      
      <Text style={styles.code}>کد کالا: {drug.code}</Text>
      
      <View style={styles.quantityRow}>
        <View style={styles.quantityItem}>
          <Text style={styles.quantityLabel}>موجودی سیستم:</Text>
          <Text style={styles.quantityValue}>{drug.systemQty}</Text>
        </View>
        
        {(drug.physicalQty || 0) > 0 && (
          <View style={styles.quantityItem}>
            <Text style={styles.quantityLabel}>شمارش فیزیکی:</Text>
            <Text style={styles.quantityValue}>{drug.physicalQty}</Text>
          </View>
        )}
      </View>
      
      {drug.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>توضیحات:</Text>
          <Text style={styles.notesText}>{drug.notes}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCard: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  code: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
    lineHeight: 22,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quantityItem: {
    flex: 1,
  },
  quantityLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  quantityValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  notesContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: Colors.background,
    borderRadius: 6,
  },
  notesLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  notesText: {
    fontSize: 12,
    color: Colors.text,
    lineHeight: 16,
  },
});
