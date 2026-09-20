import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Plus, Trash2 } from 'lucide-react';
import { SessionData, AdjustingEntry } from '@/types/accounting';
import { AccountCombobox } from '@/components/ui/account-combobox';
import { v4 as uuidv4 } from 'uuid';

interface Stage7Props {
  sessionData: SessionData;
  onStageComplete: () => void;
  onUpdateSessionData: (data: SessionData) => void;
}

interface PostAdjustmentTrialBalanceEntry {
  id: string;
  accountCode: string;
  accountName: string;
  debitBalance: number;
  creditBalance: number;
}

interface LedgerSummary {
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  balance: number;
  balanceSide: 'debit' | 'credit';
}

export function Stage7PostAdjustmentTrialBalance({ sessionData, onStageComplete, onUpdateSessionData }: Stage7Props) {
  const [trialBalanceEntries, setTrialBalanceEntries] = useState<PostAdjustmentTrialBalanceEntry[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [manualDebit, setManualDebit] = useState<string>('');
  const [manualCredit, setManualCredit] = useState<string>('');

  // حساب الأرصدة المعدلة من قيود التسوية
  const calculateAdjustedBalances = () => {
    const baseTrialBalance = sessionData.userAnswers['stage4-trial-balance'] || [];
    const adjustingJournalEntries = sessionData.transactions?.filter(t => t.isAdjusting) || [];
    
    // إنشاء خريطة للأرصدة الأساسية
    const balanceMap = new Map<string, { debit: number; credit: number; name: string }>();
    
    // إضافة الأرصدة الأساسية من المرحلة الرابعة
    baseTrialBalance.forEach((entry: any) => {
      balanceMap.set(entry.accountCode, {
        debit: entry.debitBalance || 0,
        credit: entry.creditBalance || 0,
        name: entry.accountName
      });
    });

    // تطبيق تأثيرات قيود التسوية
    adjustingJournalEntries.forEach((adjustingEntry) => {
      adjustingEntry.lines.forEach((line) => {
        if (!balanceMap.has(line.accountCode)) {
          balanceMap.set(line.accountCode, {
            debit: 0,
            credit: 0,
            name: line.accountName
          });
        }
        
        const currentBalance = balanceMap.get(line.accountCode)!;
        currentBalance.debit += line.debit;
        currentBalance.credit += line.credit;
      });
    });

    return balanceMap;
  };

  useEffect(() => {
    // حساب الأرصدة المعدلة وتطبيقها
    const adjustedBalances = calculateAdjustedBalances();
    
    const allAccountsEntries: PostAdjustmentTrialBalanceEntry[] = sessionData.chartOfAccounts.map(account => {
      const adjustedBalance = adjustedBalances.get(account.code);
      return {
        id: uuidv4(),
        accountCode: account.code,
        accountName: account.name,
        debitBalance: adjustedBalance?.debit || 0,
        creditBalance: adjustedBalance?.credit || 0
      };
    });
    
    setTrialBalanceEntries(allAccountsEntries);
  }, [sessionData]);

  const addManualEntry = () => {
    if (!selectedAccount) return;

    const account = sessionData.chartOfAccounts.find(acc => acc.code === selectedAccount);
    if (!account) return;

    const debitAmount = parseFloat(manualDebit) || 0;
    const creditAmount = parseFloat(manualCredit) || 0;

    const newEntry: PostAdjustmentTrialBalanceEntry = {
      id: uuidv4(),
      accountCode: account.code,
      accountName: account.name,
      debitBalance: debitAmount,
      creditBalance: creditAmount
    };

    const updatedEntries = [...trialBalanceEntries, newEntry];
    setTrialBalanceEntries(updatedEntries);
    saveTrialBalance(updatedEntries);

    // إعادة تعيين الحقول
    setSelectedAccount('');
    setManualDebit('');
    setManualCredit('');
  };

  const removeEntry = (entryId: string) => {
    const updatedEntries = trialBalanceEntries.filter(entry => entry.id !== entryId);
    setTrialBalanceEntries(updatedEntries);
    saveTrialBalance(updatedEntries);
  };

  const updateEntry = (entryId: string, field: 'debitBalance' | 'creditBalance', value: string) => {
    const numericValue = parseFloat(value) || 0;
    const updatedEntries = trialBalanceEntries.map(entry =>
      entry.id === entryId
        ? { ...entry, [field]: numericValue }
        : entry
    );
    setTrialBalanceEntries(updatedEntries);
    saveTrialBalance(updatedEntries);
  };

  const saveTrialBalance = (entries: PostAdjustmentTrialBalanceEntry[]) => {
    const updatedSession = {
      ...sessionData,
      userAnswers: {
        ...sessionData.userAnswers,
        'stage7-post-adjustment-trial-balance': entries
      }
    };
    onUpdateSessionData(updatedSession);
  };

  // دالة الملء التلقائي من المرجع
  const fillFromReference = () => {
    // احصل على البيانات من ميزان المراجعة الأساسي (المرحلة الرابعة)
    const baseTrialBalance = sessionData.userAnswers['stage4-trial-balance'] || [];
    
    if (baseTrialBalance.length === 0) {
      // إذا لم توجد بيانات من المرحلة الرابعة، احسب من دفتر الأستاذ
      const adjustedBalances = calculateAdjustedBalances();
      const updatedEntries = trialBalanceEntries.map(entry => {
        const adjustedBalance = adjustedBalances.get(entry.accountCode);
        return {
          ...entry,
          debitBalance: adjustedBalance?.debit || 0,
          creditBalance: adjustedBalance?.credit || 0
        };
      });
      setTrialBalanceEntries(updatedEntries);
      saveTrialBalance(updatedEntries);
      return;
    }

    // استخدم البيانات من المرحلة الرابعة وطبق عليها قيود التسوية
    const adjustedBalances = calculateAdjustedBalances();
    
    const updatedEntries = trialBalanceEntries.map(entry => {
      const adjustedBalance = adjustedBalances.get(entry.accountCode);
      if (adjustedBalance && (adjustedBalance.debit > 0 || adjustedBalance.credit > 0)) {
        return {
          ...entry,
          debitBalance: adjustedBalance.debit,
          creditBalance: adjustedBalance.credit
        };
      }
      return entry;
    });

    setTrialBalanceEntries(updatedEntries);
    saveTrialBalance(updatedEntries);

    // عدد الحسابات التي تم تحديثها
    const updatedCount = updatedEntries.filter(entry => 
      entry.debitBalance > 0 || entry.creditBalance > 0
    ).length;

    // يمكنك إضافة toast notification هنا إذا كان متوفراً
    console.log(`تم تحديث ${updatedCount} حساب من المرجع`);
  };

  const getTotals = () => {
    return trialBalanceEntries.reduce(
      (totals, entry) => ({
        totalDebits: totals.totalDebits + (entry.debitBalance || 0),
        totalCredits: totals.totalCredits + (entry.creditBalance || 0)
      }),
      { totalDebits: 0, totalCredits: 0 }
    );
  };

  const { totalDebits, totalCredits } = getTotals();
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  const getAdjustingEntriesList = () => {
    return sessionData.transactions?.filter(t => t.isAdjusting) || [];
  };

  const getAdjustingEntryTypeLabel = (type: string) => {
    const types = {
      'accrued-expense': 'مصروف مستحق',
      'accrued-revenue': 'إيراد مستحق',
      'deferred-expense': 'مصروف مقدم',
      'deferred-revenue': 'إيراد مقدم',
      'depreciation': 'إهلاك'
    };
    return types[type as keyof typeof types] || type;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">ميزان المراجعة بعد التسويات</CardTitle>
        <p className="text-muted-foreground mt-2">
          مراجعة وتعديل الأرصدة بعد تطبيق قيود التسوية
        </p>
      </CardHeader>

      <CardContent className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Sidebar - قيود التسوية المُعدة */}
        <div className="w-full lg:w-1/3 lg:max-w-sm">
          <Card className="h-fit lg:h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">قيود التسوية المُعدة</CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 lg:max-h-full overflow-y-auto">
              {getAdjustingEntriesList().length > 0 ? (
                <div className="space-y-4">
                  {getAdjustingEntriesList().map((entry, index) => (
                    <Card key={entry.entryId} className="p-3 bg-muted/50 border-r-4 border-r-primary">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            قيد #{index + 1}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {entry.date}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{entry.description}</p>
                        <div className="space-y-1">
                          {entry.lines.map((line, lineIndex) => (
                            <div key={lineIndex} className="flex justify-between text-xs bg-background p-2 rounded">
                              <span>{line.accountName}</span>
                              <span className="font-medium">
                                {line.debit > 0 ? `${line.debit.toLocaleString()} (مدين)` : `${line.credit.toLocaleString()} (دائن)`}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          المبلغ: {entry.lines.reduce((sum, line) => sum + line.debit + line.credit, 0) / 2} ر.س
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">لا توجد قيود تسوية مُعدة</p>
                  <p className="text-xs mt-2">
                    يرجى العودة إلى المرحلة السادسة لإضافة قيود التسوية
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content - ميزان المراجعة */}
        <div className="flex-1 space-y-6">
          {/* جدول ميزان المراجعة */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">اسم الحساب</TableHead>
                  <TableHead className="text-right">مدين</TableHead>
                  <TableHead className="text-right">دائن</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trialBalanceEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.accountName}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={entry.debitBalance || ''}
                        onChange={(e) => updateEntry(entry.id, 'debitBalance', e.target.value)}
                        className="text-right"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={entry.creditBalance || ''}
                        onChange={(e) => updateEntry(entry.id, 'creditBalance', e.target.value)}
                        className="text-right"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* أزرار الملء التلقائي */}
          <Card className="p-4 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">الملء التلقائي من البيانات المحفوظة</h3>
                <p className="text-sm text-muted-foreground">
                  تطبيق الأرصدة من المرحلة الرابعة مع قيود التسوية
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={fillFromReference}
                  variant="outline"
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  ملء تلقائي من المرجع
                </Button>
                <Button 
                  onClick={() => {
                    const adjustedBalances = calculateAdjustedBalances();
                    const updatedEntries = trialBalanceEntries.map(entry => {
                      const adjustedBalance = adjustedBalances.get(entry.accountCode);
                      return {
                        ...entry,
                        debitBalance: adjustedBalance?.debit || 0,
                        creditBalance: adjustedBalance?.credit || 0
                      };
                    });
                    setTrialBalanceEntries(updatedEntries);
                    saveTrialBalance(updatedEntries);
                  }}
                  variant="outline"
                >
                  تطبيق الأرصدة المحدثة
                </Button>
              </div>
            </div>
          </Card>

          {/* المجاميع والتحقق من التوازن */}
          <Card className="p-4">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="flex gap-8">
                  <span>إجمالي المدين: {totalDebits.toLocaleString()} ر.س</span>
                  <span>إجمالي الدائن: {totalCredits.toLocaleString()} ر.س</span>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className={isBalanced ? 'text-green-600' : 'text-red-600'}>
                    {isBalanced ? '✓ الميزان متوازن' : '✗ الميزان غير متوازن'}
                  </span>
                  {!isBalanced && (
                    <span className="text-amber-600">
                      الفرق: {Math.abs(totalDebits - totalCredits).toLocaleString()} ر.س
                    </span>
                  )}
                </div>
              </div>
              <Button 
                onClick={onStageComplete}
                disabled={!isBalanced}
                size="lg"
              >
                التالي: إعداد القوائم المالية
              </Button>
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}