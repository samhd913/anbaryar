/**
 * Unit tests for InventoryViewModel
 * Tests the core business logic of the inventory management system
 */

import { Drug } from '../models/Drug';
import { useInventoryStore } from '../viewmodels/InventoryViewModel';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock ExcelService
jest.mock('../services/ExcelService', () => ({
  ExcelService: {
    parseFile: jest.fn(),
    exportToExcel: jest.fn(),
  },
}));

describe('InventoryViewModel', () => {
  beforeEach(() => {
    // Reset store state before each test
    useInventoryStore.setState({
      drugs: [],
      isLoading: false,
      searchQuery: '',
      selectedDrug: null,
      lastImportDate: null,
      error: null,
    });
  });

  describe('Drug Management', () => {
    it('should add a new drug', () => {
      const { addDrug } = useInventoryStore.getState();
      const newDrug: Drug = {
        id: 'test-1',
        code: 'ABC123',
        name: 'Test Drug',
        systemQty: 100,
        physicalQty: 0,
        difference: 0,
      };

      addDrug(newDrug);

      const { drugs } = useInventoryStore.getState();
      expect(drugs).toHaveLength(1);
      expect(drugs[0]).toEqual(newDrug);
    });

    it('should update drug physical quantity and calculate difference', () => {
      const { addDrug, updateDrug } = useInventoryStore.getState();
      const drug: Drug = {
        id: 'test-1',
        code: 'ABC123',
        name: 'Test Drug',
        systemQty: 100,
        physicalQty: 0,
        difference: 0,
      };

      addDrug(drug);
      updateDrug('test-1', { physicalQty: 120 });

      const { drugs } = useInventoryStore.getState();
      const updatedDrug = drugs[0];
      expect(updatedDrug.physicalQty).toBe(120);
      expect(updatedDrug.difference).toBe(20); // 120 - 100
    });

    it('should remove a drug', () => {
      const { addDrug, removeDrug } = useInventoryStore.getState();
      const drug: Drug = {
        id: 'test-1',
        code: 'ABC123',
        name: 'Test Drug',
        systemQty: 100,
        physicalQty: 0,
        difference: 0,
      };

      addDrug(drug);
      removeDrug('test-1');

      const { drugs } = useInventoryStore.getState();
      expect(drugs).toHaveLength(0);
    });

    it('should clear all drugs', () => {
      const { addDrug, clearDrugs } = useInventoryStore.getState();
      
      // Add multiple drugs
      for (let i = 0; i < 3; i++) {
        addDrug({
          id: `test-${i}`,
          code: `ABC${i}`,
          name: `Test Drug ${i}`,
          systemQty: 100,
          physicalQty: 0,
          difference: 0,
        });
      }

      clearDrugs();

      const { drugs } = useInventoryStore.getState();
      expect(drugs).toHaveLength(0);
    });
  });

  describe('Search and Filtering', () => {
    beforeEach(() => {
      const { addDrug } = useInventoryStore.getState();
      
      // Add test drugs
      addDrug({
        id: '1',
        code: 'ABC123',
        name: 'استامینوفن',
        systemQty: 100,
        physicalQty: 0,
        difference: 0,
      });
      
      addDrug({
        id: '2',
        code: 'DEF456',
        name: 'آسپرین',
        systemQty: 50,
        physicalQty: 0,
        difference: 0,
      });
    });

    it('should search drugs by code', () => {
      const { searchDrugs } = useInventoryStore.getState();
      const results = searchDrugs('ABC');
      
      expect(results).toHaveLength(1);
      expect(results[0].code).toBe('ABC123');
    });

    it('should search drugs by name', () => {
      const { searchDrugs } = useInventoryStore.getState();
      const results = searchDrugs('استامینوفن');
      
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('استامینوفن');
    });

    it('should return empty array for no matches', () => {
      const { searchDrugs } = useInventoryStore.getState();
      const results = searchDrugs('XYZ');
      
      expect(results).toHaveLength(0);
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      const { addDrug } = useInventoryStore.getState();
      
      // Add test drugs with different statuses
      addDrug({
        id: '1',
        code: 'ABC123',
        name: 'Test Drug 1',
        systemQty: 100,
        physicalQty: 80, // Shortage
        difference: -20,
      });
      
      addDrug({
        id: '2',
        code: 'DEF456',
        name: 'Test Drug 2',
        systemQty: 50,
        physicalQty: 70, // Surplus
        difference: 20,
      });
      
      addDrug({
        id: '3',
        code: 'GHI789',
        name: 'Test Drug 3',
        systemQty: 200,
        physicalQty: 0, // Uncounted
        difference: 0,
      });
    });

    it('should calculate correct statistics', () => {
      const { getStats } = useInventoryStore.getState();
      const stats = getStats();
      
      expect(stats.totalItems).toBe(3);
      expect(stats.countedItems).toBe(2);
      expect(stats.shortageItems).toBe(1);
      expect(stats.surplusItems).toBe(1);
      expect(stats.totalDifference).toBe(0); // -20 + 20 + 0
    });
  });

  describe('State Management', () => {
    it('should set loading state', () => {
      const { setLoading } = useInventoryStore.getState();
      
      setLoading(true);
      expect(useInventoryStore.getState().isLoading).toBe(true);
      
      setLoading(false);
      expect(useInventoryStore.getState().isLoading).toBe(false);
    });

    it('should set search query', () => {
      const { setSearchQuery } = useInventoryStore.getState();
      
      setSearchQuery('test query');
      expect(useInventoryStore.getState().searchQuery).toBe('test query');
    });

    it('should set selected drug', () => {
      const { setSelectedDrug } = useInventoryStore.getState();
      const drug: Drug = {
        id: 'test-1',
        code: 'ABC123',
        name: 'Test Drug',
        systemQty: 100,
        physicalQty: 0,
        difference: 0,
      };
      
      setSelectedDrug(drug);
      expect(useInventoryStore.getState().selectedDrug).toEqual(drug);
      
      setSelectedDrug(null);
      expect(useInventoryStore.getState().selectedDrug).toBeNull();
    });

    it('should set error state', () => {
      const { setError } = useInventoryStore.getState();
      
      setError('Test error');
      expect(useInventoryStore.getState().error).toBe('Test error');
      
      setError(null);
      expect(useInventoryStore.getState().error).toBeNull();
    });
  });
});
