import * as XLSX from 'xlsx';

export interface ParsedPrediction {
  date: string;
  predicted: number;
}

export interface ParsedFileData {
  predictions: ParsedPrediction[];
  fileName: string;
}

export const parseFile = async (file: File): Promise<ParsedFileData> => {
  const fileName = file.name;
  const extension = fileName.split('.').pop()?.toLowerCase();

  if (extension === 'csv') {
    return parseCSV(file, fileName);
  } else if (extension === 'xlsx' || extension === 'xls') {
    return parseExcel(file, fileName);
  }

  throw new Error('Unsupported file format. Please upload CSV or XLSX files.');
};

const parseCSV = (file: File, fileName: string): Promise<ParsedFileData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const predictions = parseCSVContent(text);
        resolve({ predictions, fileName });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

const parseExcel = (file: File, fileName: string): Promise<ParsedFileData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        const predictions = parseJsonRows(jsonData);
        resolve({ predictions, fileName });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

const parseCSVContent = (text: string): ParsedPrediction[] => {
  const lines = text.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header row and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const dateIndex = findColumnIndex(headers, ['date', 'fecha', 'data', 'day']);
  const predictedIndex = findColumnIndex(headers, ['predicted', 'prediction', 'harvest', 'yield', 'value', 'kg']);

  if (dateIndex === -1 || predictedIndex === -1) {
    throw new Error('CSV must contain date and predicted/harvest columns');
  }

  const predictions: ParsedPrediction[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length > Math.max(dateIndex, predictedIndex)) {
      const date = parseDate(values[dateIndex]);
      const predicted = parseFloat(values[predictedIndex]);
      if (date && !isNaN(predicted)) {
        predictions.push({ date, predicted });
      }
    }
  }

  return predictions;
};

const parseJsonRows = (rows: any[]): ParsedPrediction[] => {
  const predictions: ParsedPrediction[] = [];

  for (const row of rows) {
    const keys = Object.keys(row).map(k => k.toLowerCase());
    const dateKey = Object.keys(row).find(k => 
      ['date', 'fecha', 'data', 'day'].includes(k.toLowerCase())
    );
    const predictedKey = Object.keys(row).find(k => 
      ['predicted', 'prediction', 'harvest', 'yield', 'value', 'kg'].includes(k.toLowerCase())
    );

    if (dateKey && predictedKey) {
      const date = parseDate(String(row[dateKey]));
      const predicted = parseFloat(row[predictedKey]);
      if (date && !isNaN(predicted)) {
        predictions.push({ date, predicted });
      }
    }
  }

  return predictions;
};

const findColumnIndex = (headers: string[], possibleNames: string[]): number => {
  return headers.findIndex(h => possibleNames.some(name => h.includes(name)));
};

const parseDate = (value: string): string | null => {
  // Handle Excel serial dates
  const numValue = parseFloat(value);
  if (!isNaN(numValue) && numValue > 40000 && numValue < 50000) {
    const date = new Date((numValue - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
  }

  // Try parsing as date string
  const date = new Date(value);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }

  // Try DD/MM/YYYY or DD-MM-YYYY format
  const parts = value.split(/[\/\-]/);
  if (parts.length === 3) {
    const [day, month, year] = parts;
    const parsed = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
  }

  return null;
};
