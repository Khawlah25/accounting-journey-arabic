import React from 'react';
import { CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

interface TransactionPreviewProps {
  transactions: UploadedTransaction[];
  validation: ValidationResult;
}

const TransactionPreview = ({ transactions, validation }: TransactionPreviewProps) => {
  // تجميع العمليات حسب entry_external_id للعرض
  const groupedTransactions = React.useMemo(() => {
    const groups = new Map<string, UploadedTransaction[]>();
    
    transactions.forEach(transaction => {
      const entryId = transaction.entry_external_id;
      if (!groups.has(entryId)) {
        groups.set(entryId, []);
      }
      groups.get(entryId)!.push(transaction);
    });
    
    return Array.from(groups.entries()).map(([entryId, lines]) => {
      const debitTotal = lines.filter(l => l.dc === 'D').reduce((sum, l) => sum + l.amount, 0);
      const creditTotal = lines.filter(l => l.dc === 'C').reduce((sum, l) => sum + l.amount, 0);
      const isBalanced = Math.abs(debitTotal - creditTotal) <= 0.01;
      
      return {
        entryId,
        lines,
        debitTotal,
        creditTotal,
        isBalanced
      };
    });
  }, [transactions]);

  if (transactions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* ملخص الإحصائيات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <FileText className="h-5 w-5" />
            <span>ملخص المعاينة</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{validation.totalRows}</div>
              <p className="text-sm text-muted-foreground">إجمالي السطور</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{validation.totalEntries}</div>
              <p className="text-sm text-muted-foreground">عدد القيود</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{validation.balancedEntries}</div>
              <p className="text-sm text-muted-foreground">القيود المتوازنة</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{validation.errors.length}</div>
              <p className="text-sm text-muted-foreground">عدد الأخطاء</p>
            </div>
          </div>
          
          <div className="mt-4 flex justify-center">
            {validation.isValid ? (
              <Badge variant="default" className="bg-success text-success-foreground">
                <CheckCircle className="h-4 w-4 ml-1" />
                جاهز للحفظ
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="h-4 w-4 ml-1" />
                يحتاج إلى تصحيح
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* قائمة الأخطاء */}
      {validation.errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 space-x-reverse text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>الأخطاء المكتشفة ({validation.errors.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {validation.errors.map((error, index) => (
                <Alert key={index} variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* معاينة القيود */}
      <Card>
        <CardHeader>
          <CardTitle>معاينة القيود</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 max-h-96 overflow-y-auto">
            {groupedTransactions.map(({ entryId, lines, debitTotal, creditTotal, isBalanced }) => (
              <div key={entryId} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">القيد: {entryId}</h4>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    {isBalanced ? (
                      <Badge variant="default" className="bg-success text-success-foreground">
                        <CheckCircle className="h-3 w-3 ml-1" />
                        متوازن
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 ml-1" />
                        غير متوازن
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>الوصف</TableHead>
                      <TableHead>رمز الحساب</TableHead>
                      <TableHead>مدين/دائن</TableHead>
                      <TableHead>المبلغ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((line, index) => (
                      <TableRow key={index}>
                        <TableCell>{line.date}</TableCell>
                        <TableCell>{line.description}</TableCell>
                        <TableCell>{line.account_code}</TableCell>
                        <TableCell>
                          <Badge variant={line.dc === 'D' ? 'secondary' : 'outline'}>
                            {line.dc === 'D' ? 'مدين' : 'دائن'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono">{line.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="mt-3 pt-3 border-t flex justify-between text-sm">
                  <span>إجمالي المدين: <span className="font-mono font-medium">{debitTotal.toLocaleString()}</span></span>
                  <span>إجمالي الدائن: <span className="font-mono font-medium">{creditTotal.toLocaleString()}</span></span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionPreview;