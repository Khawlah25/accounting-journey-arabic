import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, FileText, File, Save, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { saveTransactionImport } from '@/utils/transactionImport';
import { useToast } from '@/hooks/use-toast';

interface UploadedTransaction {
  entry_external_id: string;
  date: string;
  description: string;
  account_code: string;
  dc: string;
  amount: number;
  reference?: string;
  memo?: string;
  payment_method?: string;
  attachment_url?: string;
  period_code?: string;
  line_no?: number;
}

interface ValidationResult {
  isValid: boolean;
  totalRows: number;
  totalEntries: number;
  balancedEntries: number;
  errors: string[];
}

interface FileUploadComponentProps {
  companyId: string;
  onFileProcessed: (data: UploadedTransaction[], validation: ValidationResult) => void;
  onFileSaved?: (fileId: string) => void;
}

const FileUploadComponent = ({ companyId, onFileProcessed, onFileSaved }: FileUploadComponentProps) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [currentTransactions, setCurrentTransactions] = useState<UploadedTransaction[]>([]);
  const [currentValidation, setCurrentValidation] = useState<ValidationResult | null>(null);
  const [savedFileId, setSavedFileId] = useState<string | null>(null);
  const { toast } = useToast();

  const validateTransactions = (transactions: UploadedTransaction[]): ValidationResult => {
    const errors: string[] = [];
    let totalRows = transactions.length;
    
    // التحقق من الأعمدة الإلزامية
    const requiredColumns = ['entry_external_id', 'date', 'description', 'account_code', 'dc', 'amount'];
    
    if (totalRows === 0) {
      errors.push('الملف فارغ أو لا يحتوي على بيانات صحيحة');
      return { isValid: false, totalRows: 0, totalEntries: 0, balancedEntries: 0, errors };
    }

    // فحص الأعمدة الإلزامية في الصف الأول
    const firstRow = transactions[0];
    for (const col of requiredColumns) {
      if (!(col in firstRow) || firstRow[col as keyof UploadedTransaction] === undefined || firstRow[col as keyof UploadedTransaction] === '') {
        errors.push(`العمود الإلزامي "${col}" مفقود أو فارغ`);
      }
    }

    // تجميع البيانات حسب entry_external_id
    const entriesMap = new Map<string, UploadedTransaction[]>();
    
    transactions.forEach((transaction, index) => {
      const rowNum = index + 1;
      
      // التحقق من dc
      if (!['D', 'C'].includes(transaction.dc)) {
        errors.push(`الصف ${rowNum}: قيمة dc يجب أن تكون D أو C`);
      }
      
      // التحقق من amount
      if (!transaction.amount || transaction.amount <= 0) {
        errors.push(`الصف ${rowNum}: المبلغ يجب أن يكون رقماً موجباً`);
      }
      
      // تجميع حسب entry_external_id
      const entryId = transaction.entry_external_id;
      if (!entriesMap.has(entryId)) {
        entriesMap.set(entryId, []);
      }
      entriesMap.get(entryId)!.push(transaction);
    });

    let totalEntries = entriesMap.size;
    let balancedEntries = 0;

    // فحص توازن كل قيد
    entriesMap.forEach((lines, entryId) => {
      if (lines.length < 2) {
        errors.push(`القيد ${entryId}: يجب أن يحتوي على سطرين على الأقل`);
        return;
      }

      let debitTotal = 0;
      let creditTotal = 0;

      lines.forEach(line => {
        if (line.dc === 'D') {
          debitTotal += line.amount;
        } else if (line.dc === 'C') {
          creditTotal += line.amount;
        }
      });

      if (Math.abs(debitTotal - creditTotal) > 0.01) { // للتعامل مع دقة الأرقام العشرية
        errors.push(`القيد ${entryId}: غير متوازن (مدين: ${debitTotal}, دائن: ${creditTotal})`);
      } else {
        balancedEntries++;
      }
    });

    return {
      isValid: errors.length === 0,
      totalRows,
      totalEntries,
      balancedEntries,
      errors
    };
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      let transactions: UploadedTransaction[] = [];

      if (fileExtension === 'csv') {
        // معالجة CSV
        const text = await file.text();
        const result = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          transform: (value, field) => {
            if (field === 'amount' || field === 'line_no') {
              return parseFloat(value) || 0;
            }
            return value;
          }
        });
        transactions = result.data as UploadedTransaction[];
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        // معالجة Excel
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length > 1) {
          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1) as any[][];
          
          transactions = rows.map(row => {
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = row[index];
            });
            
            // تحويل الأرقام
            if (obj.amount) obj.amount = parseFloat(obj.amount) || 0;
            if (obj.line_no) obj.line_no = parseFloat(obj.line_no) || 0;
            
            return obj;
          });
        }
      } else if (fileExtension === 'json') {
        // معالجة JSON
        const text = await file.text();
        transactions = JSON.parse(text);
      } else {
        throw new Error('نوع الملف غير مدعوم. الأنواع المدعومة: CSV, Excel (.xlsx, .xls), JSON');
      }

      const validation = validateTransactions(transactions);
      
      // حفظ البيانات المحلية
      setCurrentFile(file);
      setCurrentTransactions(transactions);
      setCurrentValidation(validation);
      
      onFileProcessed(transactions, validation);
      
    } catch (error) {
      console.error('خطأ في معالجة الملف:', error);
      const errorValidation = {
        isValid: false,
        totalRows: 0,
        totalEntries: 0,
        balancedEntries: 0,
        errors: [error instanceof Error ? error.message : 'خطأ غير معروف في معالجة الملف']
      };
      
      setCurrentValidation(errorValidation);
      onFileProcessed([], errorValidation);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveImport = async () => {
    if (!currentFile || !currentTransactions || !currentValidation) {
      toast({
        title: "خطأ",
        description: "لا توجد بيانات للحفظ",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const result = await saveTransactionImport(
        currentFile,
        currentTransactions,
        currentValidation,
        companyId
      );

      if (result.success) {
        setSavedFileId(result.fileId || null);
        toast({
          title: "نجح الحفظ",
          description: result.message,
          variant: "default"
        });
        
        if (result.fileId && onFileSaved) {
          onFileSaved(result.fileId);
        }
      } else {
        toast({
          title: "فشل الحفظ",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('خطأ في حفظ الاستيراد:', error);
      toast({
        title: "خطأ في الحفظ",
        description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        processFile(acceptedFiles[0]);
      }
    },
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/json': ['.json']
    },
    multiple: false
  });

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'csv':
        return <FileText className="h-8 w-8 text-blue-500" />;
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
      case 'json':
        return <File className="h-8 w-8 text-orange-500" />;
      default:
        return <File className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const getCompanyName = (companyId: string) => {
    const companyNames: { [key: string]: string } = {
      'al-taqaddum': 'شركة التقدم التقنية',
      'al-fajr': 'شركة الفجر العقارية',
      'al-raida-trading': 'شركة الرائدة للتجارة',
      'al-sinaaat-advanced': 'شركة الصناعات المتقدمة'
    };
    return companyNames[companyId] || companyId;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse">
          <Upload className="h-5 w-5" />
          <span>رفع ملف العمليات المالية</span>
        </CardTitle>
        {companyId && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">الشركة المختارة:</span> {getCompanyName(companyId)}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary hover:bg-primary/5'
          }`}
        >
          <input {...getInputProps()} />
          
          {isProcessing ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">جاري معالجة الملف...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <p className="text-lg font-medium">اسحب وأسقط الملف هنا</p>
                <p className="text-muted-foreground">أو اضغط لاختيار ملف</p>
              </div>
              <div className="flex justify-center space-x-4 space-x-reverse">
                {getFileIcon('file.csv')}
                {getFileIcon('file.xlsx')}
                {getFileIcon('file.json')}
              </div>
              <p className="text-sm text-muted-foreground">
                الأنواع المدعومة: CSV, Excel (.xlsx, .xls), JSON
              </p>
            </div>
          )}
        </div>
        
        {/* حالة الحفظ الناجح */}
        {savedFileId && (
          <Alert className="mt-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              تم حفظ الملف بنجاح! معرف الملف: {savedFileId}
            </AlertDescription>
          </Alert>
        )}
        
        {/* أزرار الإجراءات */}
        {currentValidation && !savedFileId && (
          <div className="mt-4 flex justify-end space-x-2 space-x-reverse">
            {currentValidation.isValid ? (
              <Button 
                onClick={handleSaveImport}
                disabled={isSaving}
                className="bg-success text-success-foreground hover:bg-success/90"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    حفظ العمليات
                  </>
                )}
              </Button>
            ) : (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  لا يمكن حفظ الملف بسبب وجود أخطاء. يرجى تصحيح الأخطاء أولاً.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
        
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">تنسيق الملف المطلوب:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• الأعمدة الإلزامية: entry_external_id, date, description, account_code, dc, amount</li>
            <li>• dc: D (مدين) أو C (دائن)</li>
            <li>• amount: رقم موجب</li>
            <li>• كل entry_external_id يجب أن يحتوي على سطرين فأكثر ومتوازن</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploadComponent;