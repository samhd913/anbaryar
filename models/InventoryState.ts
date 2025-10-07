import { Drug } from './Drug';

/**
 * Main inventory state interface
 */
export interface InventoryState {
  drugs: Drug[];
  isLoading: boolean;
  searchQuery: string;
  selectedDrug: Drug | null;
  lastImportDate: Date | null;
  error: string | null;
}

/**
 * Filter options for inventory
 */
export interface InventoryFilters {
  showOnlyShortage: boolean;
  showOnlySurplus: boolean;
  showOnlyCounted: boolean;
  showOnlyUncounted: boolean;
}

/**
 * Import result from file processing
 */
export interface ImportResult {
  success: boolean;
  importedCount: number;
  errors: string[];
  warnings: string[];
}

/**
 * Export options for data
 */
export interface ExportOptions {
  includeSystemQty: boolean;
  includePhysicalQty: boolean;
  includeDifference: boolean;
  includeStats: boolean;
  format: 'excel' | 'csv';
}
