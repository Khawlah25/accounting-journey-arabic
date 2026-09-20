import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SmartAccountCombobox } from '@/components/ui/smart-account-combobox';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, Plus, List, FileText, Lightbulb, BookOpen } from 'lucide-react';
import { SessionData, JournalEntry, JournalLine, Account } from '@/types/accounting';
import { formatCurrency } from '@/utils/dataGenerator';
import { toast } from 'sonner';
import { TransactionProgressSlider } from '@/components/ui/transaction-progress-slider';
import { formatDateGregorian } from '@/lib/utils';
interface Stage2Props {
  sessionData: SessionData;
  onComplete: (answers: any) => void;
  onNext: () => void;
}
interface JournalEntryLine {
  id: string;
  accountCode: string;
  accountName: string;
  amount: string;
  type: 'debit' | 'credit';
}
interface JournalEntryForm {
  lines: JournalEntryLine[];
}
export function Stage2JournalEntries({
  sessionData,
  onComplete,
  onNext
}: Stage2Props) {
  const [currentTransactionIndex, setCurrentTransactionIndex] = useState(0);
  const [journalEntry, setJournalEntry] = useState<JournalEntryForm>({
    lines: [{
      id: '1',
      accountCode: '',
      accountName: '',
      amount: '',
      type: 'debit'
    }, {
      id: '2',
      accountCode: '',
      accountName: '',
      amount: '',
      type: 'credit'
    }]
  });
  
  const [completedEntries, setCompletedEntries] = useState<JournalEntry[]>([]);

  // استخدام العمليات المحددة من المرحلة الأولى
  const identifiedTransactions = sessionData.transactions || [];
  const currentTransaction = identifiedTransactions[currentTransactionIndex];

  // استخدام المبلغ المرجعي من العملية (يجب أن يكون ثابت)
  const transactionAmount = currentTransaction?.amount || 0;
  const addLine = (afterIndex: number, type: 'debit' | 'credit') => {
    const newLine: JournalEntryLine = {
      id: Date.now().toString(),
      accountCode: '',
      accountName: '',
      amount: '',
      type
    };
    setJournalEntry(prev => ({
      lines: [
        ...prev.lines.slice(0, afterIndex + 1),
        newLine,
        ...prev.lines.slice(afterIndex + 1)
      ]
    }));
  };
  const updateLine = (lineId: string, field: keyof JournalEntryLine, value: string) => {
    setJournalEntry(prev => ({
      lines: prev.lines.map(line => {
        if (line.id === lineId) {
          const updatedLine = {
            ...line,
            [field]: value
          };

          // إذا تم تغيير الحساب، احصل على اسم الحساب
          if (field === 'accountCode') {
            const account = sessionData.chartOfAccounts.find(acc => acc.code === value);
            updatedLine.accountName = account?.name || '';
          }

          return updatedLine;
        }
        return line;
      })
    }));
  };
  const calculateTotals = () => {
    const debitTotal = journalEntry.lines
      .filter(line => line.type === 'debit')
      .reduce((sum, line) => sum + (line.amount ? parseFloat(line.amount) : 0), 0);
    
    const creditTotal = journalEntry.lines
      .filter(line => line.type === 'credit')
      .reduce((sum, line) => sum + (line.amount ? parseFloat(line.amount) : 0), 0);
    
    return { debitTotal, creditTotal };
  };
  const isBalanced = () => {
    const { debitTotal, creditTotal } = calculateTotals();
    return Math.abs(debitTotal - creditTotal) < 0.01;
  };
  const saveEntry = () => {
    if (isBalanced()) {
      const journalLines: JournalLine[] = journalEntry.lines
        .filter(line => line.amount && parseFloat(line.amount) > 0)
        .map(line => ({
          accountCode: line.accountCode,
          accountName: line.accountName,
          debit: line.type === 'debit' ? parseFloat(line.amount) : 0,
          credit: line.type === 'credit' ? parseFloat(line.amount) : 0
        }));
      
      const newJournalEntry: JournalEntry = {
        entryId: `JE-${Date.now()}`,
        date: currentTransaction.date,
        description: currentTransaction.description,
        lines: journalLines
      };
      
      const updatedEntries = [...completedEntries, newJournalEntry];
      setCompletedEntries(updatedEntries);

      // الانتقال للعملية التالية أو إكمال المرحلة
      if (currentTransactionIndex < identifiedTransactions.length - 1) {
        setCurrentTransactionIndex(currentTransactionIndex + 1);
        setJournalEntry({
          lines: [{
            id: '1',
            accountCode: '',
            accountName: '',
            amount: '',
            type: 'debit'
          }, {
            id: '2',
            accountCode: '',
            accountName: '',
            amount: '',
            type: 'credit'
          }]
        });
      } else {
        onComplete({
          journalEntries: updatedEntries,
          stage2Completed: true
        });
      }
    }
  };
  const handleNext = () => {
    if (isBalanced()) {
      saveEntry();
    } else if (completedEntries.length === identifiedTransactions.length) {
      onNext();
    }
  };
  const handleNavigateToEntry = (index: number) => {
    if (currentTransactionIndex < completedEntries.length) {
      setCurrentTransactionIndex(index);
    } else {
      if (index <= completedEntries.length) {
        setCurrentTransactionIndex(index);
        setJournalEntry({
          lines: [{
            id: '1',
            accountCode: '',
            accountName: '',
            amount: '',
            type: 'debit'
          }, {
            id: '2',
            accountCode: '',
            accountName: '',
            amount: '',
            type: 'credit'
          }]
        });
      }
    }
  };

  // التحقق من وجود عمليات مالية
  if (!identifiedTransactions || identifiedTransactions.length === 0) {
    return <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">لا توجد عمليات مالية</h2>
        <p className="text-muted-foreground">يرجى العودة للمرحلة الأولى لتوليد العمليات المالية</p>
      </div>;
  }
  return <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border border-border rounded-lg p-6 mb-6">
        <h2 className="text-3xl font-bold mb-4 text-center">تسجيل قيود اليومية</h2>
        
        {/* Stage Connection Info */}
        <div className="bg-white/80 dark:bg-card/80 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                المرحلة السابقة
              </span>
              <span>تم تحديد {identifiedTransactions.length} عملية مالية</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            في هذه المرحلة، ستقوم بتسجيل كل عملية مالية في شكل قيد محاسبي مزدوج. 
            كل قيد يجب أن يتضمن جانب مدين وجانب دائن متساويين في القيمة.
          </p>
        </div>

        {/* Next Stage Preview */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              المرحلة التالية
            </span>
            <span className="text-sm font-medium">ترحيل القيود إلى دفتر الأستاذ</span>
          </div>
          <p className="text-xs text-muted-foreground">
            جميع القيود المسجلة هنا ستنتقل تلقائياً إلى المرحلة التالية لترحيلها في دفتر الأستاذ
          </p>
        </div>
      </div>

      {/* Transaction Progress Slider */}
      <TransactionProgressSlider totalTransactions={identifiedTransactions.length} currentTransaction={currentTransactionIndex + 1} completedTransactions={completedEntries.map((_, index) => index)} onTransactionSelect={index => handleNavigateToEntry(index)} className="mb-6" />

      {/* Summary Button */}
      {completedEntries.length > 0 && <div className="text-center mb-6">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                ملخص القيود ({completedEntries.length})
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" dir="rtl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  ملخص جميع القيود المسجلة
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {completedEntries.map((entry, index) => <Card key={entry.entryId} className="border border-muted">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>قيد رقم {index + 1}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDateGregorian(entry.date)}
                        </span>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{entry.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-muted grid grid-cols-4 gap-2 p-3 font-medium text-sm">
                          <div className="text-center">الحساب</div>
                          <div className="text-center">اسم الحساب</div>
                          <div className="text-center">مدين</div>
                          <div className="text-center">دائن</div>
                        </div>
                        <div className="divide-y">
                          {entry.lines.map((line, lineIndex) => <div key={lineIndex} className="grid grid-cols-4 gap-2 p-3 text-sm">
                              <div className="text-center font-mono">{line.accountCode}</div>
                              <div className="text-center">{line.accountName}</div>
                              <div className="text-center">
                                {line.debit > 0 ? formatCurrency(line.debit) : '-'}
                              </div>
                              <div className="text-center">
                                {line.credit > 0 ? formatCurrency(line.credit) : '-'}
                              </div>
                            </div>)}
                        </div>
                        <div className="bg-secondary/50 border-t-2 border-primary grid grid-cols-4 gap-2 p-3 font-bold text-sm">
                          <div className="text-center">الإجمالي</div>
                          <div></div>
                          <div className="text-center text-primary">
                            {formatCurrency(entry.lines.reduce((sum, line) => sum + line.debit, 0))}
                          </div>
                          <div className="text-center text-primary">
                            {formatCurrency(entry.lines.reduce((sum, line) => sum + line.credit, 0))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>)}
              </div>
            </DialogContent>
          </Dialog>
        </div>}

      {/* Progress */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
          
          {completedEntries.length > 0 && <span className="text-xs text-green-600">
              ({completedEntries.length} مكتمل)
            </span>}
        </div>
      </div>

      {/* Transaction Details - Single Line Format */}
      <Card className="accounting-card">
        <CardContent className="p-6 text-3xl text-right text-blue-500">
           {currentTransaction ? <div className="text-center space-y-3">
              <div className="text-lg leading-relaxed">
                في <span className="font-bold text-primary">{formatDateGregorian(currentTransaction.date)}</span>، {currentTransaction.description}
                {transactionAmount > 0 && <span> بمبلغ <span className="font-bold text-primary">{formatCurrency(transactionAmount)}</span></span>}.
              </div>
              
              
            </div> : <div className="text-center py-8 text-muted-foreground">
              لا توجد عمليات مالية متاحة
            </div>}
        </CardContent>
      </Card>

      {/* Journal Entry Form */}
      <Card className="accounting-card">
        <CardHeader className="text-right">
          <h3 className="text-lg font-semibold">سجّل قيد العملية التالية:</h3>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Journal Entry Table */}
          <div className="border rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="bg-muted grid grid-cols-12 gap-2 p-4 font-medium text-sm">
              <div className="col-span-6 text-center">الحساب</div>
              <div className="col-span-2 text-center">مدين</div>
              <div className="col-span-2 text-center">دائن</div>
              <div className="col-span-2 text-center">إجراء</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y">
              {journalEntry.lines.map((line, index) => (
                <div key={line.id} className="grid grid-cols-12 gap-2 p-4 items-center">
                  {/* Account Column */}
                  <div className="col-span-6">
                    <SmartAccountCombobox
                      accounts={sessionData.chartOfAccounts}
                      value={line.accountCode}
                      onValueChange={(value) => updateLine(line.id, 'accountCode', value)}
                      placeholder="اختر الحساب..."
                      className="w-full"
                    />
                  </div>

                  {/* Debit Column */}
                  <div className="col-span-2">
                    {line.type === 'debit' ? (
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="" 
                        value={line.amount} 
                        onChange={e => updateLine(line.id, 'amount', e.target.value)} 
                        className="text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                        dir="ltr" 
                      />
                    ) : null}
                  </div>

                  {/* Credit Column */}
                  <div className="col-span-2">
                    {line.type === 'credit' ? (
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="" 
                        value={line.amount} 
                        onChange={e => updateLine(line.id, 'amount', e.target.value)} 
                        className="text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                        dir="ltr" 
                      />
                    ) : null}
                  </div>

                  {/* Action Column */}
                  <div className="col-span-2 text-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addLine(index, line.type)}
                      title={`إضافة صف ${line.type === 'debit' ? 'مدين' : 'دائن'} جديد`}
                      className="hover:bg-accent"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals Row */}
            <div className="bg-secondary/50 border-t-2 border-primary grid grid-cols-12 gap-2 p-4 font-bold text-sm">
              <div className="col-span-6"></div>
              <div className="col-span-2 text-center text-primary">
                {formatCurrency(calculateTotals().debitTotal)}
              </div>
              <div className="col-span-2 text-center text-primary">
                {formatCurrency(calculateTotals().creditTotal)}
              </div>
              <div className="col-span-2 text-center">
                {isBalanced() && (
                  <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            {/* Hint and Explanation Icons */}
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => e.preventDefault()}
                title="تلميح"
                className="text-muted-foreground hover:text-foreground"
              >
                تلميح
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => e.preventDefault()}
                title="شرح"
                className="text-muted-foreground hover:text-foreground"
              >
                شرح
              </Button>
            </div>

            {/* Next Button */}
            <Button 
              onClick={handleNext} 
              disabled={!isBalanced()}
              className="accounting-button-primary"
            >
              التالي
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Completed Entries Summary */}
      {completedEntries.length > 0 && <Card className="accounting-card">
          <CardHeader>
            <CardTitle>القيود المكتملة ({completedEntries.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {completedEntries.map((entry, index) => <div key={entry.entryId} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium">قيد رقم {index + 1}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(entry.lines.reduce((sum, line) => sum + line.debit, 0))}
                  </span>
                </div>)}
            </div>
          </CardContent>
        </Card>}
    </div>;
}
export default Stage2JournalEntries;