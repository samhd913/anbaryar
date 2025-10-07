import * as XLSX from 'xlsx';
import { Drug, ExcelRowData } from '../models/Drug';
import '../utils/polyfills';

/**
 * Excel service with UTF-8 encoding fix for Persian text
 * This service specifically handles UTF-8 encoded Excel files
 */
export class ExcelServiceUTF8 {
  /**
   * Parse file and return drugs array with UTF-8 fix
   */
  static async parseFileToDrugs(fileUri: string): Promise<Drug[]> {
    try {
      
      // Validate file URI
      if (!fileUri || typeof fileUri !== 'string') {
        throw new Error('آدرس فایل نامعتبر است');
      }
      
      let workbook: any;
      
      if (fileUri.toLowerCase().endsWith('.csv')) {
        // For CSV files, read as text with UTF-8
        try {
          const response = await fetch(fileUri);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const fileContent = await response.text();
          
          // Parse CSV manually with UTF-8 support
          const lines = fileContent.split('\n').filter(line => line.trim());
          const csvData = lines.map(line => {
            const cells = this.parseCSVLine(line);
            return cells;
          });
          
          workbook = XLSX.utils.book_new();
          const worksheet = XLSX.utils.aoa_to_sheet(csvData);
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        } catch (error) {
          console.error('ExcelServiceUTF8: CSV reading failed:', error);
          throw new Error('خطا در خواندن فایل CSV');
        }
      } else {
        // For Excel files, read as binary and apply UTF-8 fix
        try {
          const response = await fetch(fileUri);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const arrayBuffer = await response.arrayBuffer();
          
          // Convert ArrayBuffer to Uint8Array
          const bytes = new Uint8Array(arrayBuffer);
          
          // Read Excel with specific options for UTF-8
          workbook = XLSX.read(bytes, { 
            type: 'array',
            cellText: false,
            cellHTML: false,
            cellDates: false,
            cellNF: false,
            cellStyles: false,
            sheetStubs: false,
            bookProps: false,
            bookSheets: false,
            bookVBA: false,
            password: '',
            WTF: false,
            raw: false // This is important for UTF-8
          });
        } catch (error) {
          console.error('ExcelServiceUTF8: Excel reading failed:', error);
          throw new Error('خطا در خواندن فایل Excel');
        }
      }
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Get data with UTF-8 fix
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false }) as any[][];
      
      
      // Apply UTF-8 fix to all data
      const fixedData = this.fixUTF8Encoding(jsonData);
      
      const headerRow = this.findHeaderRow(fixedData);
      
      const columnMap = this.mapColumns(fixedData[headerRow] as string[]);
      
      const drugs: Drug[] = [];
      
      for (let i = headerRow + 1; i < fixedData.length; i++) {
        const row = fixedData[i] as any[];
        if (!row || row.length === 0) continue;

        try {
          const drugData = this.parseRowData(row, columnMap, i + 1);
          if (drugData) {
            const drug = this.createDrugFromData(drugData);
            drugs.push(drug);
          }
        } catch (error) {
          continue;
        }
      }

      return drugs;
    } catch (error) {
      console.error('ExcelServiceUTF8 parseFileToDrugs error:', error);
      throw new Error(`خطا در پردازش فایل: ${error instanceof Error ? error.message : 'خطای نامشخص'}`);
    }
  }

  /**
   * Fix UTF-8 encoding issues in data
   */
  private static fixUTF8Encoding(data: any[][]): any[][] {
    return data.map(row => 
      row.map(cell => {
        if (typeof cell === 'string') {
          return this.fixUTF8String(cell);
        }
        return cell;
      })
    );
  }

  /**
   * Fix UTF-8 string encoding
   */
  private static fixUTF8String(text: string): string {
    if (!text) return '';
    
    // Check if text has UTF-8 encoding issues
    const hasUTF8Issues = /[\u00C0-\u00FF]/.test(text) || 
                         Array.from(text).some(char => {
                           const code = char.charCodeAt(0);
                           return code >= 216 && code <= 219;
                         });
    
    if (!hasUTF8Issues) {
      return text;
    }
    
    console.log('ExcelServiceUTF8: Fixing UTF-8 string:', text);
    
    try {
      // Method 1: Try to decode as UTF-8 bytes
      const bytes = new Uint8Array(text.length);
      for (let i = 0; i < text.length; i++) {
        bytes[i] = text.charCodeAt(i);
      }
      
      const decoder = new TextDecoder('utf-8');
      const decoded = decoder.decode(bytes);
      
      if (decoded !== text) {
        console.log('ExcelServiceUTF8: UTF-8 fix applied:', decoded);
        return decoded;
      }
    } catch (error) {
      console.log('ExcelServiceUTF8: UTF-8 fix failed:', error);
    }
    
    // Method 2: Manual character mapping for common Persian characters
    const persianMappings: Record<string, string> = {
      // Common UTF-8 Persian character mappings
      'Ø±': 'ر', 'Ø¯': 'د', 'Ù': 'ی', 'Ù': 'ی',
      'Ú©': 'ک', 'Ø¯': 'د', 'Ú©Ø§Ù': 'کالا',
      'ÙØ§Ù': 'نام', 'Ø¯Ø§Ø±Ù': 'دارو',
      'ÙÙØ¬ÙØ¯Û': 'موجودی', 'Ø³ÛØ³ØªÙ': 'سیستم',
      'Ø§Ø³ØªØ§ÙÛÙÙÙÙ': 'استامینوفن',
      'Ø¢Ø³Ù¾Ø±ÛÙ': 'آسپرین',
      'Ø§Ù': 'ان', 'ÙÙ': 'ون', 'ÙÙ': 'ین',
      'Ø§': 'ا', 'Ø¨': 'ب', 'Øª': 'ت', 'Ø«': 'ث',
      'Ø¬': 'ج', 'Ø': 'ح', 'Ø®': 'خ', 'Ø¯': 'د',
      'Ø°': 'ذ', 'Ø±': 'ر', 'Ø²': 'ز', 'Ø³': 'س',
      'Ø´': 'ش', 'Øµ': 'ص', 'Ø¶': 'ض', 'Ø·': 'ط',
      'Ø¸': 'ظ', 'Ø¹': 'ع', 'Øº': 'غ', 'Ù': 'ف',
      'Ù': 'ق', 'Ù': 'ک', 'Ù': 'ل', 'Ù': 'م',
      'Ù': 'ن', 'Ù': 'ه', 'Ù': 'و', 'Ù': 'ی'
    };
    
    let fixed = text;
    Object.entries(persianMappings).forEach(([corrupted, correct]) => {
      fixed = fixed.replace(new RegExp(corrupted, 'g'), correct);
    });
    
    console.log('ExcelServiceUTF8: Character mapping applied:', fixed);
    return fixed;
  }

  /**
   * Parse CSV line with UTF-8 support
   */
  private static parseCSVLine(line: string): string[] {
    const cells = [];
    let currentCell = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cells.push(this.fixUTF8String(currentCell));
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    
    cells.push(this.fixUTF8String(currentCell));
    return cells;
  }

  /**
   * Find header row in the data
   */
  private static findHeaderRow(data: any[][]): number {
    const headerKeywords = [
      'کد کالا', 'کد', 'code', 'itemcode', 'item_code',
      'نام دارو', 'نام', 'name', 'drug_name',
      'موجودی', 'quantity', 'qty', 'systemqty', 'system_qty',
      'ردیف', 'row'
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

    return 0;
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

    // Clean up text
    let cleanCode = this.cleanText(code);
    let cleanName = this.cleanText(name);

    if (!cleanCode || !cleanName) {
      return null; // Skip invalid rows
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
   * Clean text from unwanted characters
   */
  private static cleanText(text: string): string {
    if (!text) return '';
    
    return text
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
      .replace(/[\u00A0]/g, ' ') // Replace non-breaking space with regular space
      .replace(/[\u2000-\u200A\u200E-\u200F\u2028-\u2029]/g, ' ') // Replace various spaces
      .replace(/[\u202A-\u202E]/g, '') // Remove directional formatting
      .replace(/[\u2060-\u2064]/g, '') // Remove invisible characters
      .replace(/[\u2066-\u2069]/g, '') // Remove directional formatting
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[""]/g, '"') // Normalize quotes
      .replace(/['']/g, "'") // Normalize apostrophes
      .replace(/[–—]/g, '-') // Normalize dashes
      .trim();
  }
}
