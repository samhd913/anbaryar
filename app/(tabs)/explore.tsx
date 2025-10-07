import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FilePicker } from '../../components/FilePicker';
import { CustomAlert } from '../../components/ui/CustomAlert';
import { CustomHeader } from '../../components/ui/CustomHeader';
import { Colors } from '../../constants/colors';
import { useCustomAlert } from '../../hooks/useCustomAlert';
import { useInventory } from '../../viewmodels/InventoryViewModel';

export default function SettingsScreen() {
  const {
    drugs,
    exportToExcel,
    clearDrugs,
    getStats,
    loadData,
    importFile,
  } = useInventory();

  const { alertState, showSuccessAlert, showErrorAlert, showConfirmAlert, hideAlert } = useCustomAlert();

  const [stats, setStats] = useState({
    totalItems: 0,
    countedItems: 0,
    matchedItems: 0,
    shortageItems: 0,
    surplusItems: 0,
    totalDifference: 0,
  });

  useEffect(() => {
    const currentStats = getStats();
    setStats(currentStats);
  }, [drugs, getStats]);

  const handleExportExcel = async () => {
    try {
      if (drugs.length === 0) {
        showErrorAlert('هیچ داده‌ای برای خروجی وجود ندارد');
        return;
      }

      const filePath = await exportToExcel();
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: 'خروجی اکسل - انبار یار',
        });
        showSuccessAlert('فایل اکسل با موفقیت ایجاد و آماده اشتراک‌گذاری شد');
      } else {
        showSuccessAlert('فایل اکسل با موفقیت ایجاد شد');
      }
    } catch {
      showErrorAlert('خطا در ایجاد فایل اکسل');
    }
  };


  const handleFileSelected = async (fileUri: string) => {
    try {
      console.log('File selected:', fileUri);
      
      // Validate file URI
      if (!fileUri) {
        showErrorAlert('فایل انتخاب نشده است');
        return;
      }
      
      const result = await importFile(fileUri);
      console.log('Import result:', result);
      
      if (result.success) {
        showSuccessAlert(`${result.importedCount} دارو با موفقیت اضافه شد`);
        // No need to call loadData() - importFile already updates the state
      } else {
        const errorMessage = result.errors.length > 0 
          ? result.errors.join('\n') 
          : 'خطا در وارد کردن فایل';
        showErrorAlert(errorMessage);
      }
    } catch (error) {
      console.error('File import error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'خطا در پردازش فایل';
      showErrorAlert(errorMessage);
    }
  };

  const handleClearData = () => {
    showConfirmAlert(
      '🗑️ پاک‌سازی داده‌ها',
      'آیا مطمئن هستید که می‌خواهید تمام داده‌ها را پاک کنید؟\nاین عمل قابل بازگشت نیست.',
      async () => {
        try {
          await clearDrugs();
          // Reload data to refresh the UI
          await loadData();
          showSuccessAlert('تمام داده‌ها با موفقیت پاک شد');
        } catch {
          showErrorAlert('خطا در پاک‌سازی داده‌ها');
        }
      },
      'پاک کن',
      'لغو'
    );
  };

  return (
    <ScrollView style={styles.container}>
      <CustomHeader 
        title="تنظیمات" 
        subtitle={`${drugs.length} دارو`}
      />
      
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>آمار کلی</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalItems}</Text>
            <Text style={styles.statLabel}>کل اقلام</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.countedItems}</Text>
            <Text style={styles.statLabel}>شمارش شده</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.success }]}>
              {stats.matchedItems}
            </Text>
            <Text style={styles.statLabel}>مطابق</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.error }]}>
              {stats.shortageItems}
            </Text>
            <Text style={styles.statLabel}>کمبود</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.warning }]}>
              {stats.surplusItems}
            </Text>
            <Text style={styles.statLabel}>مازاد</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <FilePicker onFileSelected={handleFileSelected} />

        <TouchableOpacity
          style={[styles.actionButton, styles.exportButton]}
          onPress={handleExportExcel}
        >
          <Text style={styles.actionButtonText}>📤 خروجی اکسل از داده‌های فعلی</Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={[styles.actionButton, styles.clearButton]}
          onPress={handleClearData}
        >
          <Text style={styles.actionButtonText}>🧹 پاک‌سازی داده‌ها</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>درباره انبار یار</Text>
        <Text style={styles.infoText}>
          اپلیکیشن شمارش انبار برای داروخانه‌ها
        </Text>
        <Text style={styles.infoText}>
          طراح و برنامه‌نویس: سجاد حیدری
        </Text>
        <Text style={styles.infoText}>
          نسخه 1.0.0
        </Text>
      </View>

      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        onClose={hideAlert}
      />
    </ScrollView>
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
  },
  actionsContainer: {
    margin: 16,
    gap: 12,
  },
  actionButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  exportButton: {
    backgroundColor: Colors.primary,
  },
  clearButton: {
    backgroundColor: Colors.error,
  },
  actionButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
});
