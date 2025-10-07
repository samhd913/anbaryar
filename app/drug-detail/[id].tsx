import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { PhysicalCountInput } from '@/components/forms/PhysicalCountInput';
import { CustomAlert } from '@/components/ui/CustomAlert';
import { Colors } from '@/constants/colors';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import { Drug } from '@/models/Drug';
import { useInventory } from '@/viewmodels/InventoryViewModel';

export default function DrugDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const inventory = useInventory();
  const alert = useCustomAlert();
  
  const [drug, setDrug] = useState<Drug | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      alert.showErrorAlert('شناسه دارو مشخص نیست');
      setTimeout(() => router.back(), 2000);
      return;
    }

    if (!inventory || !inventory.drugs) {
      alert.showErrorAlert('خطا در بارگذاری داده‌ها');
      setTimeout(() => router.back(), 2000);
      return;
    }

    const foundDrug = inventory.drugs.find(d => d.id === id);
    if (foundDrug) {
      setDrug(foundDrug);
    } else {
      alert.showErrorAlert('دارو یافت نشد');
      setTimeout(() => router.back(), 2000);
    }
    
    setIsLoading(false);
  }, [id, inventory?.drugs, router, alert]);

  const handleSave = async (drugId: string, name: string, code: string, physicalQty: number, systemQty: number, notes?: string) => {
    try {
      if (!inventory?.updateDrug || !inventory?.saveData) {
        alert.showErrorAlert('خطا در دسترسی به توابع ذخیره‌سازی');
        return;
      }

      await inventory.updateDrug(drugId, { 
        name, 
        code, 
        physicalQty, 
        systemQty, 
        notes 
      });
      await inventory.saveData();
      
      alert.showSuccessAlert('اطلاعات دارو به‌روزرسانی شد');
      setTimeout(() => router.back(), 2000);
    } catch (error) {
      console.error('Error saving drug data:', error);
      alert.showErrorAlert('خطا در ذخیره اطلاعات');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </ScrollView>
    );
  }

  if (!drug) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>دارو یافت نشد</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <PhysicalCountInput
        drug={drug}
        onSave={handleSave}
        onCancel={handleCancel}
      />
      
      <CustomAlert
        visible={alert.alertState.visible}
        title={alert.alertState.title}
        message={alert.alertState.message}
        buttons={alert.alertState.buttons}
        onClose={alert.hideAlert}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
  },
});
