import React, { useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import FileUploadComponent from './FileUploadComponent';
import TransactionPreview from './TransactionPreview';
import ImportFilesManager from './ImportFilesManager';
import CompanyTemplateSelector from './CompanyTemplateSelector';

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

const TransactionsAdmin = () => {
  const [uploadedTransactions, setUploadedTransactions] = useState<UploadedTransaction[]>([]);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  const handleFileProcessed = (transactions: UploadedTransaction[], validation: ValidationResult) => {
    setUploadedTransactions(transactions);
    setValidationResult(validation);
  };

  const handleFileSaved = (fileId: string) => {
    // يمكن إضافة منطق إضافي هنا مثل تحديث قائمة الملفات
    console.log('تم حفظ الملف بمعرف:', fileId);
    // إغلاق الحوار بعد الحفظ الناجح
    setIsUploadDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <Download className="h-5 w-5" />
            <span>قالب العمليات المالية</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <CompanyTemplateSelector onCompanySelect={setSelectedCompanyId} />
          
          <div className="border-t pt-4">
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="w-full" 
                  disabled={!selectedCompanyId}
                >
                  <Upload className="h-4 w-4 ml-2" />
                  {selectedCompanyId ? 'رفع ملف العمليات' : 'اختر الشركة أولاً'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>رفع ومعاينة العمليات المالية</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {selectedCompanyId && (
                    <FileUploadComponent 
                      companyId={selectedCompanyId}
                      onFileProcessed={handleFileProcessed}
                      onFileSaved={handleFileSaved}
                    />
                  )}
                  {validationResult && (
                    <TransactionPreview 
                      transactions={uploadedTransactions} 
                      validation={validationResult} 
                    />
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">ملاحظات هامة:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• dc محصورة في D (مدين) أو C (دائن)</li>
              <li>• amount يجب أن يكون رقماً موجباً</li>
              <li>• period_code من: Q1, Q2, Q3, Q4, FY (اختياري)</li>
              <li>• line_no رقم ترتيبي للبند داخل القيد</li>
              <li>• كل entry_external_id يجب أن يكون متوازناً (مجموع المدين = مجموع الدائن)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* إدارة الملفات المرفوعة */}
      <ImportFilesManager />
    </div>
  );
};

export default TransactionsAdmin;