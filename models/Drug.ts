/**
 * Drug model representing a medicine in the inventory
 */
export interface Drug {
  id: string;
  code: string;
  name: string;
  systemQty?: number;
  physicalQty?: number;
  difference?: number;
  stock?: number;
  category?: string;
  unit?: string;
  notes?: string;
  createdAt?: string;
}

/**
 * Drug creation data (without calculated fields)
 */
export interface DrugCreateData {
  code: string;
  name: string;
  systemQty: number;
}

/**
 * Drug update data for physical counting
 */
export interface DrugUpdateData {
  physicalQty?: number;
  systemQty?: number;
  stock?: number;
  category?: string;
  unit?: string;
  notes?: string;
}

/**
 * Excel/CSV row data structure
 */
export interface ExcelRowData {
  row: number;
  code: string;
  name: string;
  systemQty: number;
}

/**
 * Drug statistics for reporting
 */
export interface DrugStats {
  totalItems: number;
  countedItems: number;
  shortageItems: number;
  surplusItems: number;
  totalDifference: number;
}
