import { create } from 'zustand';
import { Drug } from '../models/Drug';
import { ImportResult, InventoryFilters, InventoryState } from '../models/InventoryState';
import { ExcelService } from '../services/ExcelService';
import { ExcelServiceUTF8 } from '../services/ExcelServiceUTF8';
import { StorageService } from '../services/StorageService';

/**
 * Inventory ViewModel using Zustand for state management
 * Implements MVVM pattern with reactive state
 */
interface InventoryStore extends InventoryState {
  // Actions
  setLoading: (loading: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSelectedDrug: (drug: Drug | null) => void;
  setError: (error: string | null) => void;
  
  // Drug operations
  addDrug: (drug: Drug) => void;
  addDrugs: (drugs: Drug[]) => void;
  updateDrug: (id: string, updates: Partial<Drug>) => Promise<void>;
  removeDrug: (id: string) => Promise<void>;
  clearDrugs: () => void;
  removeDuplicates: () => void;
  
  // File operations
  importFile: (fileUri: string) => Promise<ImportResult>;
  exportToExcel: () => Promise<string>;
  
  // Data persistence
  loadData: () => Promise<void>;
  saveData: () => Promise<void>;
  
  // Filtering and search
  getFilteredDrugs: (filters?: InventoryFilters) => Drug[];
  searchDrugs: (query: string) => Drug[];
  
  // Statistics
  getStats: () => {
    totalItems: number;
    countedItems: number;
    matchedItems: number;
    shortageItems: number;
    surplusItems: number;
    totalDifference: number;
  };
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  // Initial state
  drugs: [],
  isLoading: false,
  searchQuery: '',
  selectedDrug: null,
  lastImportDate: null,
  error: null,

  // Actions
  setLoading: (loading) => set({ isLoading: loading }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedDrug: (drug) => set({ selectedDrug: drug }),
  setError: (error) => set({ error }),

  // Drug operations
  addDrug: (drug) => set((state) => {
    // Check if drug with same ID already exists
    const existingIds = new Set(state.drugs.map(d => d.id));
    
    if (existingIds.has(drug.id)) {
      console.log('InventoryViewModel: Drug with ID already exists:', drug.id, 'Name:', drug.name);
      return state; // Don't add duplicate
    }
    
    return { 
      drugs: [...state.drugs, drug] 
    };
  }),

  addDrugs: (drugs) => set((state) => {
    // Get existing IDs to prevent duplicates
    const existingIds = new Set(state.drugs.map(d => d.id));
    
    // Filter out drugs that already exist (by ID)
    const uniqueNewDrugs = drugs.filter(drug => {
      if (existingIds.has(drug.id)) {
        console.log('InventoryViewModel: Skipping duplicate drug with ID:', drug.id, 'Name:', drug.name);
        return false;
      }
      return true;
    });
    
    // Generate unique IDs for new drugs
    const newDrugs = uniqueNewDrugs.map(drug => ({
      ...drug,
      id: `drug_${drug.code}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }));
    
    console.log('InventoryViewModel: Adding', newDrugs.length, 'new drugs (filtered from', drugs.length, ')');
    
    return { 
      drugs: [...state.drugs, ...newDrugs]
    };
  }),

  updateDrug: async (id, updates) => {
    set((state) => {
      const updatedDrugs = state.drugs.map(drug => 
        drug.id === id 
          ? { 
              ...drug, 
              ...updates,
              difference: updates.physicalQty !== undefined && updates.systemQty !== undefined
                ? updates.physicalQty - updates.systemQty
                : updates.physicalQty !== undefined
                ? updates.physicalQty - drug.systemQty
                : updates.systemQty !== undefined
                ? drug.physicalQty - updates.systemQty
                : drug.difference
            }
          : drug
      );
      
      // Save to storage immediately
      StorageService.saveDrugs(updatedDrugs).catch(error => {
        console.error('Error saving updated drugs:', error);
      });
      
      return { drugs: updatedDrugs };
    });
  },

  removeDrug: async (id) => {
    set((state) => {
      const updatedDrugs = state.drugs.filter(drug => drug.id !== id);
      
      // Save to storage immediately
      StorageService.saveDrugs(updatedDrugs).catch(error => {
        console.error('Error saving after drug removal:', error);
      });
      
      return { drugs: updatedDrugs };
    });
  },

  clearDrugs: async () => {
    try {
      // Clear from storage first
      await StorageService.clearAllData();
      
      // Then clear from state
      set({ 
        drugs: [],
        lastImportDate: null,
        error: null
      });
    } catch (error) {
      console.error('Error clearing storage:', error);
      // Even if storage fails, clear the state
      set({ 
        drugs: [],
        lastImportDate: null,
        error: null
      });
    }
  },

  // File operations
  importFile: async (fileUri) => {
    set({ isLoading: true, error: null });
    
    try {
      
      // Parse the file and get drugs directly
      const drugs = await ExcelServiceUTF8.parseFileToDrugs(fileUri);
      
      if (drugs.length > 0) {
        // Get current drugs
        const currentDrugs = get().drugs;
        
        // Get existing codes to prevent duplicates
        const existingCodes = new Set(currentDrugs.map(d => d.code));
        
        // Filter out drugs that already exist (by code)
        const newDrugs = drugs.filter(drug => {
          if (existingCodes.has(drug.code)) {
            return false;
          }
          return true;
        });
        
        if (newDrugs.length === 0) {
          return {
            success: false,
            importedCount: 0,
            errors: ['همه داروهای فایل قبلاً موجود هستند'],
            warnings: [],
          };
        }
        
        // Check if there are duplicates
        const duplicateCount = drugs.length - newDrugs.length;
        
        // Add only new drugs
        const allDrugs = [...currentDrugs, ...newDrugs];
        
        // Create success message with details
        let successMessage = `${newDrugs.length} دارو با موفقیت اضافه شد`;
        if (duplicateCount > 0) {
          successMessage += ` (${duplicateCount} داروی تکراری نادیده گرفته شد)`;
        }
        
        // Update state
        set({ 
          drugs: allDrugs,
          lastImportDate: new Date()
        });
        
        // Save to storage
        await StorageService.saveDrugs(allDrugs);
        await StorageService.saveLastImportDate(new Date());
        
        return {
          success: true,
          importedCount: newDrugs.length,
          errors: [],
          warnings: duplicateCount > 0 ? [`${duplicateCount} داروی تکراری نادیده گرفته شد`] : [],
        };
      } else {
        return {
          success: false,
          importedCount: 0,
          errors: ['هیچ دارویی در فایل یافت نشد'],
          warnings: [],
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطای نامشخص';
      set({ error: errorMessage });
      return {
        success: false,
        importedCount: 0,
        errors: [errorMessage],
        warnings: [],
      };
    } finally {
      set({ isLoading: false });
    }
  },

  exportToExcel: async () => {
    const { drugs } = get();
    const filename = `anbaryad_export_${new Date().toISOString().split('T')[0]}`;
    
    try {
      const filePath = await ExcelService.exportToExcelWithSummary(drugs, filename);
      
      // Show success message with file path
      console.log('Excel export successful!');
      console.log('File saved to:', filePath);
      
      return filePath;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطای نامشخص';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },


  // Helper function to remove duplicates
  removeDuplicates: () => set((state) => {
    const uniqueDrugs = state.drugs.filter((drug, index, self) => 
      index === self.findIndex(d => d.id === drug.id)
    );
    
    if (uniqueDrugs.length !== state.drugs.length) {
      return { drugs: uniqueDrugs };
    }
    
    return state; // No duplicates found
  }),

  // Data persistence
  loadData: async () => {
    set({ isLoading: true });
    
    try {
      console.log('InventoryViewModel: Loading data from storage');
      const [drugs, lastImport] = await Promise.all([
        StorageService.loadDrugs(),
        StorageService.loadLastImportDate(),
      ]);
      
      // Check for duplicates before updating state
      const uniqueDrugs = drugs.filter((drug, index, self) => 
        index === self.findIndex(d => d.id === drug.id)
      );
      
      // Only update if we have drugs to load
      if (uniqueDrugs.length > 0) {
        set({ 
          drugs: uniqueDrugs, 
          lastImportDate: lastImport,
          isLoading: false 
        });
        console.log('InventoryViewModel: State updated with loaded drugs');
      } else {
        set({ 
          lastImportDate: lastImport,
          isLoading: false 
        });
        console.log('InventoryViewModel: No drugs to load');
      }
    } catch (error) {
      console.error('InventoryViewModel: Error loading data:', error);
      const errorMessage = error instanceof Error ? error.message : 'خطای نامشخص';
      set({ error: errorMessage, isLoading: false });
    }
  },

  saveData: async () => {
    const { drugs } = get();
    
    try {
      await StorageService.saveDrugs(drugs);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطای نامشخص';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  // Filtering and search
  getFilteredDrugs: (filters) => {
    const { drugs, searchQuery } = get();
    console.log('InventoryViewModel: getFilteredDrugs called with drugs count:', drugs.length);
    console.log('InventoryViewModel: getFilteredDrugs drugs:', drugs.map(d => ({ id: d.id, name: d.name, code: d.code })));
    
    // Check for duplicates and remove them
    const uniqueDrugs = drugs.filter((drug, index, self) => 
      index === self.findIndex(d => d.id === drug.id)
    );
    
    if (uniqueDrugs.length !== drugs.length) {
      console.log('InventoryViewModel: DUPLICATES FOUND in getFilteredDrugs! Original:', drugs.length, 'Unique:', uniqueDrugs.length);
      // Update state with unique drugs
      set({ drugs: uniqueDrugs });
      return uniqueDrugs;
    }
    
    let filtered = uniqueDrugs;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(drug => 
        drug.name.toLowerCase().includes(query) ||
        drug.code.toLowerCase().includes(query)
      );
    }

    // Apply additional filters
    if (filters) {
      if (filters.showOnlyShortage) {
        filtered = filtered.filter(drug => drug.difference < 0);
      }
      if (filters.showOnlySurplus) {
        filtered = filtered.filter(drug => drug.difference > 0);
      }
      if (filters.showOnlyCounted) {
        filtered = filtered.filter(drug => drug.physicalQty > 0);
      }
      if (filters.showOnlyUncounted) {
        filtered = filtered.filter(drug => drug.physicalQty === 0);
      }
    }

    console.log('InventoryViewModel: getFilteredDrugs returning filtered count:', filtered.length);
    console.log('InventoryViewModel: getFilteredDrugs returning filtered drugs:', filtered.map(d => ({ id: d.id, name: d.name, code: d.code })));
    return filtered;
  },

  searchDrugs: (query) => {
    const { drugs } = get();
    if (!query.trim()) return drugs;
    
    const searchQuery = query.toLowerCase();
    return drugs.filter(drug => 
      drug.name.toLowerCase().includes(searchQuery) ||
      drug.code.toLowerCase().includes(searchQuery)
    );
  },

  // Statistics
  getStats: () => {
    const { drugs } = get();
    
    const totalItems = drugs.length;
    const countedItems = drugs.filter(drug => drug.physicalQty > 0).length;
    const matchedItems = drugs.filter(drug => drug.difference === 0 && drug.physicalQty > 0).length;
    const shortageItems = drugs.filter(drug => drug.difference < 0).length;
    const surplusItems = drugs.filter(drug => drug.difference > 0).length;
    const totalDifference = drugs.reduce((sum, drug) => sum + drug.difference, 0);

    return {
      totalItems,
      countedItems,
      matchedItems,
      shortageItems,
      surplusItems,
      totalDifference,
    };
  },
}));

/**
 * Custom hooks for easier component usage
 */
export const useInventory = () => {
  const store = useInventoryStore();
  
  // Add removeDuplicates to the returned object
  return {
    ...store,
    removeDuplicates: store.removeDuplicates,
  };
};
