import * as FileSystem from 'expo-file-system/legacy';
// @ts-ignore
import * as XLSX from 'xlsx';
import { Drug, ExcelRowData } from '../models/Drug';
import { ImportResult } from '../models/InventoryState';
import '../utils/polyfills';

/**
 * Excel service for handling Excel/CSV file operations
 * Supports import and export functionality
 */
export class ExcelService {
  /**
   * Parse Excel/CSV file and extract drug data
   */
  static async parseFile(fileUri: string): Promise<ImportResult> {
    try {
      console.log('ExcelService: Starting to parse file:', fileUri);
      let workbook: any;
      
      // Check if it's a CSV file
      if (fileUri.toLowerCase().endsWith('.csv')) {
        // Read CSV as text with proper encoding
        let fileContent = '';
        try {
          fileContent = await FileSystem.readAsStringAsync(fileUri, {
            encoding: 'utf8' as any,
          });
        } catch (error) {
          console.log('ExcelService: UTF-8 failed, trying without encoding:', error);
          // If UTF-8 fails, try without encoding specification
          fileContent = await FileSystem.readAsStringAsync(fileUri);
        }
        
        console.log('ExcelService: File content length:', fileContent.length);
        console.log('ExcelService: First 200 chars:', fileContent.substring(0, 200));
        
        // Parse CSV content with better handling
        const lines = fileContent.split('\n').filter(line => line.trim());
        
        const csvData = lines.map((line) => {
          // Simple CSV parsing - split by comma
          const cells = line.split(',').map(cell => cell.trim());
          return cells;
        });
        
        workbook = (XLSX.utils as any).book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(csvData);
        (XLSX.utils as any).book_append_sheet(workbook, worksheet, 'Sheet1');
      } else {
        // For Excel files, we need to read as binary
        // First try to read as binary
        try {
          const binaryContent = await FileSystem.readAsStringAsync(fileUri, {
            encoding: 'base64' as any,
          });
          
          // Convert base64 to Uint8Array (React Native compatible)
          const binaryString = atob(binaryContent);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          workbook = XLSX.read(bytes, { 
            type: 'array'
          });
        } catch (binaryError) {
          console.log('ExcelService: Binary reading failed, trying as text:', binaryError);
          // If binary fails, try as text (for CSV files with .xlsx extension)
          let textContent = '';
          try {
            textContent = await FileSystem.readAsStringAsync(fileUri, {
              encoding: 'utf8' as any,
            });
          } catch (error) {
            console.log('ExcelService: UTF-8 failed, trying without encoding:', error);
            // If UTF-8 fails, try without encoding specification
            textContent = await FileSystem.readAsStringAsync(fileUri);
          }
          
          console.log('ExcelService: Text content length:', textContent.length);
          console.log('ExcelService: First 200 chars:', textContent.substring(0, 200));
          
          // Parse as CSV with proper quote handling
          const lines = textContent.split('\n').filter(line => line.trim());
          const csvData = lines.map(line => {
            const cells = [];
            let currentCell = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                cells.push(currentCell.trim());
                currentCell = '';
              } else {
                currentCell += char;
              }
            }
            
            cells.push(currentCell.trim());
            return cells;
          });
          
          workbook = (XLSX.utils as any).book_new();
          const worksheet = XLSX.utils.aoa_to_sheet(csvData);
          (XLSX.utils as any).book_append_sheet(workbook, worksheet, 'Sheet1');
        }
      }
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      // Find header row and map columns
      const headerRow = this.findHeaderRow(jsonData);
      if (headerRow === -1) {
        return {
          success: false,
          importedCount: 0,
          errors: ['هدر فایل یافت نشد'],
          warnings: [],
        };
      }

      const columnMap = this.mapColumns(jsonData[headerRow] as string[]);
      const drugs: Drug[] = [];
      const errors: string[] = [];
      const warnings: string[] = [];

      // Process data rows
      for (let i = headerRow + 1; i < jsonData.length; i++) {
        const row = jsonData[i] as any[];
        if (!row || row.length === 0) continue;

        try {
          const drugData = this.parseRowData(row, columnMap, i + 1);
          if (drugData) {
            const drug = this.createDrugFromData(drugData);
            drugs.push(drug);
          }
        } catch (error) {
          errors.push(`خط ${i + 1}: ${error instanceof Error ? error.message : 'خطای نامشخص'}`);
        }
      }

      return {
        success: true,
        importedCount: drugs.length,
        errors,
        warnings,
      };
    } catch (error) {
      console.error('ExcelService parseFile error:', error);
      console.error('ExcelService error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        fileUri: fileUri
      });
      return {
        success: false,
        importedCount: 0,
        errors: [`خطا در پردازش فایل: ${error instanceof Error ? error.message : 'خطای نامشخص'}`],
        warnings: [],
      };
    }
  }

  /**
   * Clean Persian text from unwanted characters
   */
  private static cleanPersianText(text: string): string {
    if (!text) return '';
    
    return text
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
      .replace(/[\u00A0]/g, ' ') // Replace non-breaking space with regular space
      .replace(/[\u2000-\u200A\u200E-\u200F\u2028-\u2029]/g, ' ') // Replace various spaces
      .replace(/[\u202A-\u202E]/g, '') // Remove directional formatting
      .replace(/[\u2060-\u2064]/g, '') // Remove invisible characters
      .replace(/[\u2066-\u2069]/g, '') // Remove directional formatting
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  }

  /**
   * Fix Persian text encoding issues
   */
  private static fixPersianEncoding(text: string): string {
    if (!text) return '';
    
    // Clean up Persian text encoding issues
    try {
      // Remove BOM if present
      if (text.charCodeAt(0) === 0xFEFF) {
        text = text.slice(1);
      }
      
      // If text contains garbled Persian characters, try to fix them
      if (text.includes('Ø') || text.includes('Ù') || text.includes('Û') || text.includes('Ã')) {
        // This is likely Latin-1 encoded Persian text
        const bytes = new Uint8Array(text.length);
        for (let i = 0; i < text.length; i++) {
          bytes[i] = text.charCodeAt(i);
        }
        const decoder = new TextDecoder('utf-8');
        return decoder.decode(bytes);
      }
    } catch (error) {
      // If conversion fails, return original text
    }
    
    return text;
  }

  /**
   * Parse file and return drugs array directly
   */
  static async parseFileToDrugs(fileUri: string): Promise<Drug[]> {
    try {
      console.log('ExcelService parseFileToDrugs: Starting to parse file:', fileUri);
      
      // Validate file URI
      if (!fileUri || typeof fileUri !== 'string') {
        throw new Error('آدرس فایل نامعتبر است');
      }
      
      // Read file content and parse drugs directly
      let workbook: any;
      
      if (fileUri.toLowerCase().endsWith('.csv')) {
        // Try different encodings for Persian files
        let fileContent = '';
        try {
          fileContent = await FileSystem.readAsStringAsync(fileUri, {
            encoding: 'utf8' as any,
          });
        } catch (error) {
          console.log('ExcelService: UTF-8 failed, trying without encoding:', error);
          // If UTF-8 fails, try without encoding specification
          try {
            fileContent = await FileSystem.readAsStringAsync(fileUri);
          } catch (error2) {
            console.error('ExcelService: All encoding attempts failed:', error2);
            throw new Error('خطا در خواندن فایل - مشکل encoding');
          }
        }
        
        const lines = fileContent.split('\n').filter(line => line.trim());
        const csvData = lines.map(line => {
          // Handle CSV with quotes and commas properly
          const cells = [];
          let currentCell = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              cells.push(currentCell.trim());
              currentCell = '';
            } else {
              currentCell += char;
            }
          }
          
          cells.push(currentCell.trim());
          return cells;
        });
        
        workbook = (XLSX.utils as any).book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(csvData);
        (XLSX.utils as any).book_append_sheet(workbook, worksheet, 'Sheet1');
      } else {
        try {
          const binaryContent = await FileSystem.readAsStringAsync(fileUri, {
            encoding: 'base64' as any,
          });
          
          const binaryString = atob(binaryContent);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          workbook = XLSX.read(bytes, { 
            type: 'array'
          });
        } catch (binaryError) {
          let textContent = '';
          try {
            textContent = await FileSystem.readAsStringAsync(fileUri, {
              encoding: 'utf8' as any,
            });
          } catch (error) {
            // If UTF-8 fails, try without encoding specification
            textContent = await FileSystem.readAsStringAsync(fileUri);
          }
          
          const lines = textContent.split('\n').filter(line => line.trim());
          const csvData = lines.map(line => line.split(',').map(cell => cell.trim()));
          
          workbook = (XLSX.utils as any).book_new();
          const worksheet = XLSX.utils.aoa_to_sheet(csvData);
          (XLSX.utils as any).book_append_sheet(workbook, worksheet, 'Sheet1');
        }
      }
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      const headerRow = this.findHeaderRow(jsonData);
      const columnMap = this.mapColumns(jsonData[headerRow] as string[]);
      
      const drugs: Drug[] = [];
      
      for (let i = headerRow + 1; i < jsonData.length; i++) {
        const row = jsonData[i] as any[];
        if (!row || row.length === 0) continue;

        try {
          const drugData = this.parseRowData(row, columnMap, i + 1);
          if (drugData) {
            const drug = this.createDrugFromData(drugData);
            drugs.push(drug);
          }
        } catch (error) {
          // Skip invalid rows
          continue;
        }
      }

      return drugs;
    } catch (error) {
      console.error('ExcelService parseFileToDrugs error:', error);
      console.error('ExcelService parseFileToDrugs error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        fileUri: fileUri
      });
      throw new Error(`خطا در پردازش فایل: ${error instanceof Error ? error.message : 'خطای نامشخص'}`);
    }
  }

  /**
   * Export drugs data to Excel file with improved formatting
   */
  static async exportToExcel(drugs: Drug[], filename: string = 'inventory_export'): Promise<string> {
    try {
      // Create a more organized Excel structure
      const worksheet = XLSX.utils.aoa_to_sheet([
        // Header row with proper formatting
        ['ردیف', 'کد کالا', 'نام دارو', 'موجودی سیستم', 'شمارش فیزیکی', 'تفاوت', 'وضعیت', 'توضیحات'],
        // Data rows
        ...drugs.map((drug, index) => [
          index + 1,
          drug.code,
          drug.name,
          drug.systemQty,
          drug.physicalQty || 0,
          drug.difference || 0,
          this.getStatusText(drug.difference || 0),
          drug.notes || ''
        ])
      ]);

      // Set column widths for better formatting
      const colWidths = [
        { wch: 8 },   // ردیف
        { wch: 15 },  // کد کالا
        { wch: 30 },  // نام دارو
        { wch: 15 },  // موجودی سیستم
        { wch: 15 },  // شمارش فیزیکی
        { wch: 12 },  // تفاوت
        { wch: 15 },  // وضعیت
        { wch: 25 }   // توضیحات
      ];
      
      worksheet['!cols'] = colWidths;

      const workbook = (XLSX.utils as any).book_new();
      (XLSX.utils as any).book_append_sheet(workbook, worksheet, 'شمارش انبار');

      // Generate file path in documents directory
      const fileName = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
      const documentDir = (FileSystem as any).documentDirectory || '';
      const filePath = `${documentDir}AnbarYar/${fileName}`;
      
      // Create directory if it doesn't exist
      try {
        await FileSystem.makeDirectoryAsync(`${documentDir}AnbarYar/`, { intermediates: true });
      } catch (error) {
        // Directory might already exist, ignore error
      }
      
      // Convert workbook to binary
      const wbout = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'buffer'
      });
      
      // Convert to base64 (React Native compatible)
      const base64 = btoa(String.fromCharCode.apply(null, wbout));
      
      // Write file using expo-file-system
      await FileSystem.writeAsStringAsync(filePath, base64, {
        encoding: 'base64' as any,
      });
      
      // Log the file path for debugging
      console.log('Excel file saved to:', filePath);
      console.log('File name:', fileName);
      
      return filePath;
    } catch (error) {
      console.error('ExcelService exportToExcel error:', error);
      throw new Error(`خطا در ایجاد فایل اکسل: ${error instanceof Error ? error.message : 'خطای نامشخص'}`);
    }
  }

  /**
   * Find header row in the data
   */
  private static findHeaderRow(data: any[][]): number {
    const headerKeywords = [
      'کد کالا', 'کد', 'code', 'itemcode', 'item_code',
      'نام دارو', 'نام', 'name', 'drug_name',
      'موجودی', 'quantity', 'qty', 'systemqty', 'system_qty',
      'ردیف', 'row', 'ردیف'
    ];

    for (let i = 0; i < Math.min(5, data.length); i++) {
      const row = data[i];
      if (!row) continue;

      const rowText = row.join(' ').toLowerCase();
      
      const matchCount = headerKeywords.filter(keyword => 
        rowText.includes(keyword.toLowerCase())
      ).length;

      if (matchCount >= 1) {
        return i;
      }
    }

    return 0; // Return 0 instead of -1
  }

  /**
   * Map column indices to field names
   */
  private static mapColumns(headers: string[]): Record<string, number> {
    const columnMap: Record<string, number> = {};

    headers.forEach((header, index) => {
      const headerLower = header.toLowerCase().trim();
      
      if (headerLower.includes('کد') || headerLower.includes('code')) {
        columnMap.code = index;
      } else if (headerLower.includes('نام') || headerLower.includes('name')) {
        columnMap.name = index;
      } else if (headerLower.includes('موجودی') || headerLower.includes('quantity') || headerLower.includes('qty') || headerLower.includes('سیستم')) {
        columnMap.systemQty = index;
      }
    });

    // If no specific mapping found, use default order
    if (Object.keys(columnMap).length === 0) {
      columnMap.code = 1;
      columnMap.name = 2;
      columnMap.systemQty = 3;
    }

    return columnMap;
  }

  /**
   * Parse row data into structured format
   */
  private static parseRowData(row: any[], columnMap: Record<string, number>, rowNumber: number): ExcelRowData | null {
    const code = row[columnMap.code]?.toString();
    const name = row[columnMap.name]?.toString();
    const systemQty = parseFloat(row[columnMap.systemQty]?.toString() || '0');

    // Clean up Persian text
    let cleanCode = this.cleanPersianText(code);
    let cleanName = this.cleanPersianText(name);
    
    // Fix Persian encoding issues
    cleanCode = this.fixPersianEncoding(cleanCode);
    cleanName = this.fixPersianEncoding(cleanName);

    if (!cleanCode || !cleanName) {
      return null; // Skip invalid rows instead of throwing error
    }

    if (isNaN(systemQty) || systemQty < 0) {
      return null; // Skip invalid quantities
    }

    return {
      row: rowNumber,
      code: cleanCode,
      name: cleanName,
      systemQty,
    };
  }

  /**
   * Create Drug object from parsed data
   */
  private static createDrugFromData(data: ExcelRowData): Drug {
    // Generate unique ID with timestamp and random string
    const uniqueId = `drug_${data.code}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: uniqueId,
      code: data.code,
      name: data.name,
      systemQty: data.systemQty,
      physicalQty: 0, // Will be set during counting
      difference: 0,  // Will be calculated
    };
  }

  /**
   * Get status text for difference value
   */
  private static getStatusText(difference: number): string {
    if (difference === 0) return 'مطابق';
    if (difference > 0) return `مازاد ${Math.abs(difference)}`;
    return `کمبود ${Math.abs(difference)}`;
  }

  /**
   * Export drugs data to Excel with summary statistics
   */
  static async exportToExcelWithSummary(drugs: Drug[], filename: string = 'inventory_export'): Promise<string> {
    try {
      // Calculate statistics
      const totalItems = drugs.length;
      const countedItems = drugs.filter(drug => (drug.physicalQty || 0) > 0).length;
      const shortageItems = drugs.filter(drug => (drug.difference || 0) < 0).length;
      const surplusItems = drugs.filter(drug => (drug.difference || 0) > 0).length;
      const matchedItems = drugs.filter(drug => (drug.difference || 0) === 0).length;
      const totalDifference = drugs.reduce((sum, drug) => sum + (drug.difference || 0), 0);

      // Create summary sheet
      const summaryData = [
        ['گزارش شمارش انبار', ''],
        ['تاریخ گزارش', new Date().toLocaleDateString('fa-IR')],
        [''],
        ['آمار کلی', ''],
        ['کل اقلام', totalItems],
        ['شمارش شده', countedItems],
        ['مطابق', matchedItems],
        ['کمبود', shortageItems],
        ['مازاد', surplusItems],
        ['مجموع تفاوت', totalDifference],
        [''],
        ['جزئیات اقلام', '']
      ];

      // Create main data sheet
      const mainData = [
        ['ردیف', 'کد کالا', 'نام دارو', 'موجودی سیستم', 'شمارش فیزیکی', 'تفاوت', 'وضعیت', 'توضیحات'],
        ...drugs.map((drug, index) => [
          index + 1,
          drug.code,
          drug.name,
          drug.systemQty,
          drug.physicalQty || 0,
          drug.difference || 0,
          this.getStatusText(drug.difference || 0),
          drug.notes || ''
        ])
      ];

      // Create workbook with multiple sheets
      const workbook = (XLSX.utils as any).book_new();
      
      // Add summary sheet
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      summarySheet['!cols'] = [{ wch: 20 }, { wch: 15 }];
      (XLSX.utils as any).book_append_sheet(workbook, summarySheet, 'خلاصه گزارش');

      // Add main data sheet
      const mainSheet = XLSX.utils.aoa_to_sheet(mainData);
      mainSheet['!cols'] = [
        { wch: 8 },   // ردیف
        { wch: 15 },  // کد کالا
        { wch: 30 },  // نام دارو
        { wch: 15 },  // موجودی سیستم
        { wch: 15 },  // شمارش فیزیکی
        { wch: 12 },  // تفاوت
        { wch: 15 },  // وضعیت
        { wch: 25 }   // توضیحات
      ];
      (XLSX.utils as any).book_append_sheet(workbook, mainSheet, 'جزئیات اقلام');

      // Generate file path
      const fileName = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
      const documentDir = (FileSystem as any).documentDirectory || '';
      const filePath = `${documentDir}AnbarYar/${fileName}`;
      
      // Create directory if it doesn't exist
      try {
        await FileSystem.makeDirectoryAsync(`${documentDir}AnbarYar/`, { intermediates: true });
      } catch (error) {
        // Directory might already exist, ignore error
      }
      
      // Convert and save
      const wbout = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'buffer'
      });
      
      const base64 = btoa(String.fromCharCode.apply(null, wbout));
      
      await FileSystem.writeAsStringAsync(filePath, base64, {
        encoding: 'base64' as any,
      });
      
      // Log the file path for debugging
      console.log('Excel file saved to:', filePath);
      console.log('File name:', fileName);
      
      return filePath;
    } catch (error) {
      console.error('ExcelService exportToExcelWithSummary error:', error);
      throw new Error(`خطا در ایجاد فایل اکسل: ${error instanceof Error ? error.message : 'خطای نامشخص'}`);
    }
  }
}
