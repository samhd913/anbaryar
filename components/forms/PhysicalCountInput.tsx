import React, { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Drug } from '../../models/Drug';

interface PhysicalCountInputProps {
  drug: Drug;
  onSave: (drugId: string, name: string, code: string, physicalQty: number, systemQty: number, notes?: string) => void;
  onCancel: () => void;
}

export const PhysicalCountInput: React.FC<PhysicalCountInputProps> = ({
  drug,
  onSave,
  onCancel,
}) => {
  const [drugName, setDrugName] = useState(drug.name || '');
  const [drugCode, setDrugCode] = useState(drug.code || '');
  const [physicalQty, setPhysicalQty] = useState(drug.physicalQty?.toString() || '');
  const [systemQty, setSystemQty] = useState(drug.systemQty?.toString() || '');
  const [notes, setNotes] = useState(drug.notes || '');

  const handleSave = () => {
    const physical = parseFloat(physicalQty) || 0;
    const system = parseFloat(systemQty) || 0;

    if (physical < 0 || system < 0) {
      Alert.alert('خطا', 'مقادیر نمی‌توانند منفی باشند');
      return;
    }

    if (!drugName.trim() || !drugCode.trim()) {
      Alert.alert('خطا', 'نام دارو و کد کالا الزامی است');
      return;
    }

    onSave(drug.id, drugName.trim(), drugCode.trim(), physical, system, notes.trim() || undefined);
  };

  const difference = parseFloat(physicalQty) - parseFloat(systemQty);
  const differenceText = isNaN(difference) ? '0' : difference.toString();
  const differenceColor = difference > 0 ? Colors.success : difference < 0 ? Colors.error : Colors.textSecondary;
  
  const getDifferenceLabel = () => {
    if (isNaN(difference) || difference === 0) {
      return 'مطابق با سیستم';
    } else if (difference > 0) {
      return `مازاد: ${differenceText}`;
    } else {
      return `کمبود: ${Math.abs(difference)}`;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>شمارش فیزیکی</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>نام دارو:</Text>
        <TextInput
          style={styles.textInput}
          value={drugName}
          onChangeText={setDrugName}
          placeholder="نام دارو"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>کد کالا:</Text>
        <TextInput
          style={styles.textInput}
          value={drugCode}
          onChangeText={setDrugCode}
          placeholder="کد کالا"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>مقدار فیزیکی:</Text>
        <TextInput
          style={styles.textInput}
          value={physicalQty}
          onChangeText={setPhysicalQty}
          placeholder="مقدار شمارش شده"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>مقدار سیستم:</Text>
        <TextInput
          style={styles.textInput}
          value={systemQty}
          onChangeText={setSystemQty}
          placeholder="مقدار سیستم"
          keyboardType="numeric"
        />
      </View>

      <View style={[styles.differenceCard, { 
        backgroundColor: differenceColor === Colors.success ? '#E8F5E8' : differenceColor === Colors.error ? '#FFE8E8' : Colors.secondary,
        borderColor: differenceColor === Colors.success ? '#4CAF50' : differenceColor === Colors.error ? '#F44336' : Colors.border
      }]}>
        <Text style={[styles.differenceLabel, { color: differenceColor }]}>
          {getDifferenceLabel()}
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>یادداشت:</Text>
        <TextInput
          style={[styles.textInput, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder="یادداشت..."
          multiline
          numberOfLines={2}
        />
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>انصراف</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>ذخیره</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.text,
  },
  drugName: {
    fontSize: 18,
    marginBottom: 10,
    color: Colors.text,
  },
  drugCode: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: Colors.text,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  notesInput: {
    height: 60,
    textAlignVertical: 'top',
  },
  differenceCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  differenceLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.surface,
  },
});