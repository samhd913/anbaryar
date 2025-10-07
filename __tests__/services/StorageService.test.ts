/**
 * Unit tests for StorageService
 * Tests the data persistence functionality
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Drug } from '../../models/Drug';
import { StorageService } from '../../services/StorageService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

describe('StorageService', () => {
  const mockDrugs: Drug[] = [
    {
      id: '1',
      code: 'ABC123',
      name: 'استامینوفن',
      systemQty: 100,
      physicalQty: 80,
      difference: -20,
    },
    {
      id: '2',
      code: 'DEF456',
      name: 'آسپرین',
      systemQty: 50,
      physicalQty: 70,
      difference: 20,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveDrugs', () => {
    it('should save drugs to storage', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await StorageService.saveDrugs(mockDrugs);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'anbaryad_drugs',
        JSON.stringify(mockDrugs)
      );
    });

    it('should handle storage errors', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      await expect(StorageService.saveDrugs(mockDrugs)).rejects.toThrow('خطا در ذخیره اطلاعات داروها');
    });
  });

  describe('loadDrugs', () => {
    it('should load drugs from storage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockDrugs));

      const result = await StorageService.loadDrugs();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('anbaryad_drugs');
      expect(result).toEqual(mockDrugs);
    });

    it('should return empty array when no data exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await StorageService.loadDrugs();

      expect(result).toEqual([]);
    });

    it('should handle storage errors', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await StorageService.loadDrugs();

      expect(result).toEqual([]);
    });
  });

  describe('saveInventoryState', () => {
    it('should save inventory state to storage', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      const state = { searchQuery: 'test', isLoading: true };

      await StorageService.saveInventoryState(state);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'anbaryad_inventory_state',
        JSON.stringify(state)
      );
    });

    it('should handle storage errors', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      await expect(StorageService.saveInventoryState({})).rejects.toThrow('خطا در ذخیره وضعیت انبار');
    });
  });

  describe('loadInventoryState', () => {
    it('should load inventory state from storage', async () => {
      const state = { searchQuery: 'test', isLoading: true };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(state));

      const result = await StorageService.loadInventoryState();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('anbaryad_inventory_state');
      expect(result).toEqual(state);
    });

    it('should return empty object when no data exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await StorageService.loadInventoryState();

      expect(result).toEqual({});
    });

    it('should handle storage errors', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await StorageService.loadInventoryState();

      expect(result).toEqual({});
    });
  });

  describe('saveLastImportDate', () => {
    it('should save last import date to storage', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      const date = new Date('2024-01-01T00:00:00Z');

      await StorageService.saveLastImportDate(date);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'anbaryad_last_import',
        date.toISOString()
      );
    });

    it('should handle storage errors silently', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      await expect(StorageService.saveLastImportDate(new Date())).resolves.toBeUndefined();
    });
  });

  describe('loadLastImportDate', () => {
    it('should load last import date from storage', async () => {
      const date = new Date('2024-01-01T00:00:00Z');
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(date.toISOString());

      const result = await StorageService.loadLastImportDate();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('anbaryad_last_import');
      expect(result).toEqual(date);
    });

    it('should return null when no data exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await StorageService.loadLastImportDate();

      expect(result).toBeNull();
    });

    it('should handle storage errors', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await StorageService.loadLastImportDate();

      expect(result).toBeNull();
    });
  });

  describe('clearAllData', () => {
    it('should clear all data from storage', async () => {
      (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);

      await StorageService.clearAllData();

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        'anbaryad_drugs',
        'anbaryad_inventory_state',
        'anbaryad_last_import',
      ]);
    });

    it('should handle storage errors', async () => {
      (AsyncStorage.multiRemove as jest.Mock).mockRejectedValue(new Error('Storage error'));

      await expect(StorageService.clearAllData()).rejects.toThrow('خطا در پاک‌سازی داده‌ها');
    });
  });

  describe('getStorageInfo', () => {
    it('should return storage information', async () => {
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(mockDrugs))
        .mockResolvedValueOnce('2024-01-01T00:00:00Z');

      const result = await StorageService.getStorageInfo();

      expect(result).toEqual({
        drugsCount: 2,
        lastImport: new Date('2024-01-01T00:00:00Z'),
        totalSize: expect.any(Number),
      });
    });

    it('should handle storage errors', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await StorageService.getStorageInfo();

      expect(result).toEqual({
        drugsCount: 0,
        lastImport: null,
        totalSize: 0,
      });
    });
  });
});
