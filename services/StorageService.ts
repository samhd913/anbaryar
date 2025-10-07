import AsyncStorage from '@react-native-async-storage/async-storage';
import { Drug } from '../models/Drug';
import { InventoryState } from '../models/InventoryState';

/**
 * Storage service for persisting inventory data
 * Handles local storage operations with AsyncStorage
 */
export class StorageService {
  private static readonly KEYS = {
    DRUGS: 'anbaryad_drugs',
    INVENTORY_STATE: 'anbaryad_inventory_state',
    LAST_IMPORT: 'anbaryad_last_import',
    SETTINGS: 'anbaryad_settings',
  } as const;

  /**
   * Save drugs array to storage
   */
  static async saveDrugs(drugs: Drug[]): Promise<void> {
    try {
      // Remove duplicates before saving
      const uniqueDrugs = drugs.filter((drug, index, self) => 
        index === self.findIndex(d => d.id === drug.id)
      );
      
      const jsonData = JSON.stringify(uniqueDrugs);
      await AsyncStorage.setItem(this.KEYS.DRUGS, jsonData);
      console.log('StorageService: Drugs saved successfully');
    } catch (error) {
      console.error('Error saving drugs:', error);
      throw new Error('خطا در ذخیره اطلاعات داروها');
    }
  }

  /**
   * Load drugs array from storage
   */
  static async loadDrugs(): Promise<Drug[]> {
    try {
      console.log('StorageService: Loading drugs from storage');
      const jsonData = await AsyncStorage.getItem(this.KEYS.DRUGS);
      if (!jsonData) {
        console.log('StorageService: No drugs found in storage');
        return [];
      }
      
      const drugs = JSON.parse(jsonData) as Drug[];
      
      // Remove duplicates before returning
      const uniqueDrugs = drugs.filter((drug, index, self) => 
        index === self.findIndex(d => d.id === drug.id)
      );
      
      return uniqueDrugs;
    } catch (error) {
      console.error('Error loading drugs:', error);
      return [];
    }
  }

  /**
   * Save inventory state to storage
   */
  static async saveInventoryState(state: Partial<InventoryState>): Promise<void> {
    try {
      const jsonData = JSON.stringify(state);
      await AsyncStorage.setItem(this.KEYS.INVENTORY_STATE, jsonData);
    } catch (error) {
      console.error('Error saving inventory state:', error);
      throw new Error('خطا در ذخیره وضعیت انبار');
    }
  }

  /**
   * Load inventory state from storage
   */
  static async loadInventoryState(): Promise<Partial<InventoryState>> {
    try {
      const jsonData = await AsyncStorage.getItem(this.KEYS.INVENTORY_STATE);
      if (!jsonData) return {};
      
      return JSON.parse(jsonData);
    } catch (error) {
      console.error('Error loading inventory state:', error);
      return {};
    }
  }

  /**
   * Save last import date
   */
  static async saveLastImportDate(date: Date): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.LAST_IMPORT, date.toISOString());
    } catch (error) {
      console.error('Error saving last import date:', error);
    }
  }

  /**
   * Load last import date
   */
  static async loadLastImportDate(): Promise<Date | null> {
    try {
      const dateString = await AsyncStorage.getItem(this.KEYS.LAST_IMPORT);
      if (!dateString) return null;
      
      return new Date(dateString);
    } catch (error) {
      console.error('Error loading last import date:', error);
      return null;
    }
  }

  /**
   * Clear all inventory data
   */
  static async clearAllData(): Promise<void> {
    try {
      // Clear each key individually to ensure all are cleared
      await AsyncStorage.removeItem(this.KEYS.DRUGS);
      await AsyncStorage.removeItem(this.KEYS.INVENTORY_STATE);
      await AsyncStorage.removeItem(this.KEYS.LAST_IMPORT);
      await AsyncStorage.removeItem(this.KEYS.SETTINGS);
    } catch (error) {
      console.error('Error clearing data:', error);
      // Don't throw error, just log it
    }
  }

  /**
   * Get storage usage info
   */
  static async getStorageInfo(): Promise<{
    drugsCount: number;
    lastImport: Date | null;
    totalSize: number;
  }> {
    try {
      const drugs = await this.loadDrugs();
      const lastImport = await this.loadLastImportDate();
      
      // Estimate storage size (rough calculation)
      const totalSize = JSON.stringify(drugs).length;
      
      return {
        drugsCount: drugs.length,
        lastImport,
        totalSize,
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {
        drugsCount: 0,
        lastImport: null,
        totalSize: 0,
      };
    }
  }
}
