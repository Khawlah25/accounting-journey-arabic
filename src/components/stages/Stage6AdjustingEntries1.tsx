import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TransactionProgressSlider } from '@/components/ui/transaction-progress-slider';
import { SmartAccountCombobox } from '@/components/ui/smart-account-combobox';
import { SessionData, Account } from '@/types/accounting';
import { Plus, CheckCircle, BookOpen } from 'lucide-react';

interface JournalEntryLine {
  accountCode: string;
  accountName: string;
  debit: string;
  credit: string;
}

interface JournalEntryForm {
  lines: JournalEntryLine[];
}

// دالة لتنسيق العملة
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
  }).format(amount);
};

interface Stage6AdjustingEntries1Props {
  sessionData: SessionData;
  onStageComplete: () => void;
  onUpdateSessionData: (data: SessionData) => void;
  onStageNavigation?: (stageId: number) => void;
}

export function Stage6AdjustingEntries1({ 
  sessionData, 
  onStageComplete, 
  onUpdateSessionData,
  onStageNavigation
}: Stage6AdjustingEntries1Props) {
  const navigate = useNavigate();
  const totalEntries = 5; // عدد العمليات الافتراضي
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
  const [completedEntries, setCompletedEntries] = useState<number[]>([]);
  
  // حالة نموذج القيود المحاسبية
  const [journalEntry, setJournalEntry] = useState<JournalEntryForm>({
    lines: [
      { accountCode: '', accountName: '', debit: '', credit: '' },
      { accountCode: '', accountName: '', debit: '', credit: '' }
    ]
  });

  // الحسابات الافتراضية
  const accounts: Account[] = [
    { code: '1100', name: 'النقدية', type: 'Asset', normalBalance: 'Debit' },
    { code: '1200', name: 'البنك', type: 'Asset', normalBalance: 'Debit' },
    { code: '1300', name: 'العملاء', type: 'Asset', normalBalance: 'Debit' },
    { code: '2100', name: 'الموردين', type: 'Liability', normalBalance: 'Credit' },
    { code: '3100', name: 'رأس المال', type: 'Equity', normalBalance: 'Credit' },
    { code: '4100', name: 'المبيعات', type: 'Revenue', normalBalance: 'Credit' },
    { code: '5100', name: 'تكلفة المبيعات', type: 'Expense', normalBalance: 'Debit' },
    { code: '5200', name: 'مصاريف البرمجيات والاشتراكات', type: 'Expense', normalBalance: 'Debit' }
  ];

  // دوال إدارة القيود المحاسبية
  const addLine = (type: 'debit' | 'credit') => {
    const newLine: JournalEntryLine = { 
      accountCode: '', 
      accountName: '', 
      debit: type === 'debit' ? '0' : '', 
      credit: type === 'credit' ? '0' : '' 
    };
    setJournalEntry(prev => ({
      ...prev,
      lines: [...prev.lines, newLine]
    }));
  };

  const updateLine = (index: number, field: keyof JournalEntryLine, value: string) => {
    setJournalEntry(prev => ({
      ...prev,
      lines: prev.lines.map((line, i) => {
        if (i === index) {
          const updatedLine = { ...line, [field]: value };
          
          // إذا تم تغيير كود الحساب، ابحث عن اسم الحساب
          if (field === 'accountCode') {
            const account = accounts.find(acc => acc.code === value);
            updatedLine.accountName = account?.name || '';
          }
          
          return updatedLine;
        }
        return line;
      })
    }));
  };

  const calculateTotals = () => {
    return journalEntry.lines.reduce(
      (totals, line) => ({
        totalDebit: totals.totalDebit + (parseFloat(line.debit) || 0),
        totalCredit: totals.totalCredit + (parseFloat(line.credit) || 0)
      }),
      { totalDebit: 0, totalCredit: 0 }
    );
  };

  const isBalanced = () => {
    const { totalDebit, totalCredit } = calculateTotals();
    return totalDebit === totalCredit && totalDebit > 0;
  };

  const handleEntrySelect = (entryIndex: number) => {
    setCurrentEntryIndex(entryIndex);
  };

  const handleMarkComplete = () => {
    if (!completedEntries.includes(currentEntryIndex)) {
      setCompletedEntries([...completedEntries, currentEntryIndex]);
    }
  };

  const handleComplete = () => {
    const updatedSessionData = {
      ...sessionData,
      progress: {
        ...sessionData.progress,
        7: true
      }
    };
    onUpdateSessionData(updatedSessionData);
    onStageComplete();
  };

  const handleNavigateToLedger = () => {
    if (onStageNavigation) {
      onStageNavigation(4); // المرحلة الرابعة: ترحيل القيود إلى دفتر الأستاذ
    } else {
      navigate('/page4');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <h1 className="text-3xl font-bold">قيود التسوية ١</h1>
          <Button
            onClick={handleNavigateToLedger}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground"
            title="ترحيل القيود إلى دفتر الأستاذ"
          >
            <BookOpen className="h-4 w-4" />
            ترحيل القيود إلى دفتر الأستاذ
          </Button>
        </div>
        <p className="text-muted-foreground">
          مرحلة إضافية لقيود التسوية
        </p>
      </div>

      {/* شريط التقدم */}
      <TransactionProgressSlider 
        totalTransactions={totalEntries}
        currentTransaction={currentEntryIndex + 1}
        completedTransactions={completedEntries}
        onTransactionSelect={handleEntrySelect}
        className="mb-6"
      />

      <Card>
        <CardHeader>
          <CardTitle>قيود التسوية ١</CardTitle>
          <CardDescription>
            العملية {currentEntryIndex + 1} من {totalEntries}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentEntryIndex === 0 ? (
            // العملية الأولى: اشتراك Zoho One
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">💼</div>
                <h3 className="text-xl font-semibold mb-2">اشتراك منصة Zoho One</h3>
              </div>
              
              <Card className="bg-muted/50">
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">تاريخ العملية</p>
                      <p className="text-lg font-semibold">5 يناير 2025</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">نوع العملية</p>
                      <p className="text-lg font-semibold">اشتراك سنوي</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">المبلغ الإجمالي</p>
                      <p className="text-lg font-semibold text-primary">3,000 ريال سعودي</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">مدة التغطية</p>
                      <p className="text-lg font-semibold">12 شهرًا</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">التكلفة الشهرية:</span>
                      <span className="text-sm font-semibold">250 ريال</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">مصروف الربع الأول:</span>
                      <span className="text-sm font-semibold text-destructive">750 ريال</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              
              {/* نموذج إدخال القيود المحاسبية */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">سجل قيد العملية التالية:</h3>
                
                {/* الجدول */}
                <div className="overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right p-3 font-medium">Account</th>
                        <th className="text-center p-3 font-medium w-32">Debit</th>
                        <th className="text-center p-3 font-medium w-32">Credit</th>
                        <th className="text-center p-3 font-medium w-16">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {journalEntry.lines.map((line, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-3">
                            <SmartAccountCombobox
                              value={line.accountCode}
                              onValueChange={(value) => updateLine(index, 'accountCode', value)}
                              accounts={accounts}
                              placeholder="اختر الحساب..."
                              className="w-full border-0 shadow-none"
                            />
                            {line.accountName && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {line.accountName}
                              </p>
                            )}
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={line.debit}
                              onChange={(e) => updateLine(index, 'debit', e.target.value)}
                              className="text-center border-0 shadow-none"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={line.credit}
                              onChange={(e) => updateLine(index, 'credit', e.target.value)}
                              className="text-center border-0 shadow-none"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addLine('debit')}
                              className="h-6 w-6 p-0 hover:bg-transparent"
                            >
                              +
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* منطقة الإجماليات */}
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm">المجموع:</span>
                    <span className="font-medium">0 ر.س.</span>
                    {isBalanced() && (
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                {/* الأزرار السفلية */}
                <div className="flex items-center justify-between pt-6">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">تلميح</span>
                    <span className="text-sm text-muted-foreground">شرح</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button variant="secondary" size="sm" className="bg-muted text-muted-foreground">
                      📺
                    </Button>
                    <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                      التالي
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={handleMarkComplete} 
                  variant="outline"
                  disabled={completedEntries.includes(currentEntryIndex)}
                >
                  {completedEntries.includes(currentEntryIndex) ? "تم الإنجاز" : "تم"}
                </Button>
                
                {completedEntries.length === totalEntries && (
                  <Button onClick={handleComplete} size="lg">
                    الانتقال للمرحلة التالية
                  </Button>
                )}
              </div>
            </div>
          ) : (
            // العمليات الأخرى: محتوى مؤقت
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">العملية رقم {currentEntryIndex + 1}</h3>
              <p className="text-muted-foreground mb-6">
                محتوى هذه العملية سيتم إضافته لاحقاً
              </p>
              
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={handleMarkComplete} 
                  variant="outline"
                  disabled={completedEntries.includes(currentEntryIndex)}
                >
                  {completedEntries.includes(currentEntryIndex) ? "تم الإنجاز" : "تم"}
                </Button>
                
                {completedEntries.length === totalEntries && (
                  <Button onClick={handleComplete} size="lg">
                    الانتقال للمرحلة التالية
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}