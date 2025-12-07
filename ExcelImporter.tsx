import { useState, useRef } from 'react';
import * as XLSX from 'xlsx'; // Vous devrez peut-être installer ce paquet : npm install xlsx
import { Upload, FileSpreadsheet, X, Check, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

type ProData = {
  name: string;
  email: string;
  phone: string;
  category: string;
  location: string;
};

interface ExcelImporterProps {
  onImport: (data: ProData[]) => void;
}

export function ExcelImporter({ onImport }: ExcelImporterProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewData, setPreviewData] = useState<ProData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);
    
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('אנא העלה קובץ Excel בלבד (.xlsx או .xls)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet) as any[];

        // Normalize keys to match ProData structure
        const normalizedData: ProData[] = jsonData.map((row) => ({
          name: row['שם'] || row['name'] || row['Name'] || '',
          email: row['אימייל'] || row['email'] || row['Email'] || '',
          phone: row['טלפון'] || row['phone'] || row['Phone'] || '',
          category: row['קטגוריה'] || row['category'] || row['Category'] || 'כללי',
          location: row['אזור'] || row['location'] || row['Location'] || ''
        })).filter(item => item.name && item.phone); // Basic validation

        if (normalizedData.length === 0) {
          setError('לא נמצאו נתונים תקינים בקובץ');
        } else {
          setPreviewData(normalizedData);
        }
      } catch (err) {
        setError('שגיאה בקריאת הקובץ. וודא שהפורמט תקין.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    onImport(previewData);
    setPreviewData([]);
  };

  return (
    <div className="w-full">
      {previewData.length === 0 ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">ייבוא אנשי מקצוע מקובץ Excel</h3>
              <p className="text-sm text-gray-500 mt-1">
                גרור קובץ לכאן או לחץ כדי לבחור
              </p>
              <p className="text-xs text-gray-400 mt-2">
                עמודות נדרשות: שם, טלפון, אימייל, קטגוריה, אזור
              </p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".xlsx,.xls"
              onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              variant="outline" 
              className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
            >
              <Upload className="w-4 h-4 ml-2" />
              בחר קובץ
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-green-50">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="font-bold text-green-800">נמצאו {previewData.length} רשומות לייבוא</span>
            </div>
            <button 
              onClick={() => setPreviewData([])}
              className="text-gray-400 hover:text-red-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="p-3 font-medium text-gray-500">שם</th>
                  <th className="p-3 font-medium text-gray-500">טלפון</th>
                  <th className="p-3 font-medium text-gray-500">קטגוריה</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {previewData.map((row, i) => (
                  <tr key={i}>
                    <td className="p-3 text-gray-900">{row.name}</td>
                    <td className="p-3 text-gray-600">{row.phone}</td>
                    <td className="p-3">
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                        {row.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setPreviewData([])}>ביטול</Button>
            <Button onClick={handleConfirmImport} className="bg-green-600 hover:bg-green-700 text-white">
              אשר וייבא נתונים
            </Button>
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4 bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>שגיאה</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
