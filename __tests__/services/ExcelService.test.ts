/**
 * Unit tests for ExcelService
 * Tests the Excel file processing functionality
 */

import * as XLSX from 'xlsx';
import { Drug } from '../../models/Drug';
import { ExcelService } from '../../services/ExcelService';

// Mock xlsx library
jest.mock('xlsx', () => ({
  readFile: jest.fn(),
  utils: {
    sheet_to_json: jest.fn(),
    json_to_sheet: jest.fn(),
  },
  writeFile: jest.fn(),
}));

describe('ExcelService', () => {
  const mockWorkbook = {
    SheetNames: ['Sheet1'],
    Sheets: {
      Sheet1: {},
    },
  };

  const mockSheetData = [
    ['ردیف', 'کد کالا', 'نام دارو', 'موجودی کل'],
    [1, 'ABC123', 'استامینوفن', 100],
    [2, 'DEF456', 'آسپرین', 50],
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parseFile', () => {
    it('should parse Excel file successfully', async () => {
      (XLSX.readFile as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockSheetData);

      const result = await ExcelService.parseFile('test.xlsx');

      expect(result.success).toBe(true);
      expect(result.importedCount).toBe(2);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle file with English headers', async () => {
      const englishSheetData = [
        ['Row', 'Item Code', 'Drug Name', 'System Quantity'],
        [1, 'ABC123', 'Acetaminophen', 100],
        [2, 'DEF456', 'Aspirin', 50],
      ];

      (XLSX.readFile as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(englishSheetData);

      const result = await ExcelService.parseFile('test.xlsx');

      expect(result.success).toBe(true);
      expect(result.importedCount).toBe(2);
    });

    it('should handle file with mixed headers', async () => {
      const mixedSheetData = [
        ['ردیف', 'Item Code', 'نام دارو', 'System Quantity'],
        [1, 'ABC123', 'استامینوفن', 100],
        [2, 'DEF456', 'آسپرین', 50],
      ];

      (XLSX.readFile as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mixedSheetData);

      const result = await ExcelService.parseFile('test.xlsx');

      expect(result.success).toBe(true);
      expect(result.importedCount).toBe(2);
    });

    it('should handle file with no header row', async () => {
      const noHeaderData = [
        [1, 'ABC123', 'استامینوفن', 100],
        [2, 'DEF456', 'آسپرین', 50],
      ];

      (XLSX.readFile as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(noHeaderData);

      const result = await ExcelService.parseFile('test.xlsx');

      expect(result.success).toBe(false);
      expect(result.errors).toContain('هدر فایل یافت نشد');
    });

    it('should handle file with invalid data', async () => {
      const invalidData = [
        ['ردیف', 'کد کالا', 'نام دارو', 'موجودی کل'],
        [1, '', 'استامینوفن', 100], // Missing code
        [2, 'DEF456', '', 50], // Missing name
        [3, 'GHI789', 'ویتامین C', -10], // Negative quantity
      ];

      (XLSX.readFile as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(invalidData);

      const result = await ExcelService.parseFile('test.xlsx');

      expect(result.success).toBe(true);
      expect(result.importedCount).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle file reading errors', async () => {
      (XLSX.readFile as jest.Mock).mockImplementation(() => {
        throw new Error('File read error');
      });

      const result = await ExcelService.parseFile('invalid.xlsx');

      expect(result.success).toBe(false);
      expect(result.errors).toContain('خطا در پردازش فایل: File read error');
    });

    it('should handle empty file', async () => {
      (XLSX.readFile as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue([]);

      const result = await ExcelService.parseFile('empty.xlsx');

      expect(result.success).toBe(false);
      expect(result.errors).toContain('هدر فایل یافت نشد');
    });
  });

  describe('exportToExcel', () => {
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

    it('should export drugs to Excel successfully', async () => {
      (XLSX.utils.json_to_sheet as jest.Mock).mockReturnValue({});
      (XLSX.writeFile as jest.Mock).mockImplementation(() => {});

      const result = await ExcelService.exportToExcel(mockDrugs, 'test');

      expect(XLSX.utils.json_to_sheet).toHaveBeenCalled();
      expect(XLSX.writeFile).toHaveBeenCalled();
      expect(result).toContain('test_');
    });

    it('should export with default filename', async () => {
      (XLSX.utils.json_to_sheet as jest.Mock).mockReturnValue({});
      (XLSX.writeFile as jest.Mock).mockImplementation(() => {});

      const result = await ExcelService.exportToExcel(mockDrugs);

      expect(result).toContain('inventory_export_');
    });

    it('should handle export errors', async () => {
      (XLSX.utils.json_to_sheet as jest.Mock).mockImplementation(() => {
        throw new Error('Export error');
      });

      await expect(ExcelService.exportToExcel(mockDrugs)).rejects.toThrow('خطا در ایجاد فایل اکسل: Export error');
    });

    it('should include all required columns in export', async () => {
      (XLSX.utils.json_to_sheet as jest.Mock).mockReturnValue({});
      (XLSX.writeFile as jest.Mock).mockImplementation(() => {});

      await ExcelService.exportToExcel(mockDrugs);

      const expectedData = mockDrugs.map((drug, index) => ({
        'ردیف': index + 1,
        'کد کالا': drug.code,
        'نام دارو': drug.name,
        'موجودی سیستم': drug.systemQty,
        'تعداد شمارش فیزیکی': drug.physicalQty,
        'تفاوت': drug.difference,
        'وضعیت': drug.difference === 0 ? 'مطابق' : 
                 drug.difference > 0 ? `مازاد ${drug.difference}` : 
                 `کمبود ${Math.abs(drug.difference)}`,
      }));

      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith(expectedData);
    });
  });
});
