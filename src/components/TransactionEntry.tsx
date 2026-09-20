import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Account, JournalEntry, JournalLine } from '@/types/accounting';
import { formatCurrency } from '@/utils/dataGenerator';

interface TransactionEntryProps {
  accounts: Account[];
  onTransactionAdd: (transaction: JournalEntry) => void;
}

interface JournalEntryForm {
  debitAccount: string;
  debitAmount: string;
  creditAccount: string;
  creditAmount: string;
}

export function TransactionEntry({ accounts, onTransactionAdd }: TransactionEntryProps) {
  const [journalEntry, setJournalEntry] = useState<JournalEntryForm>({
    debitAccount: '',
    debitAmount: '',
    creditAccount: '',
    creditAmount: ''
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateTransaction = (): string[] => {
    const errors: string[] = [];

    if (!journalEntry.debitAccount) {
      errors.push('يجب اختيار الحساب المدين');
    }

    if (!journalEntry.creditAccount) {
      errors.push('يجب اختيار الحساب الدائن');
    }

    if (!journalEntry.debitAmount || parseFloat(journalEntry.debitAmount) <= 0) {
      errors.push('يجب إدخال مبلغ المدين');
    }

    if (!journalEntry.creditAmount || parseFloat(journalEntry.creditAmount) <= 0) {
      errors.push('يجب إدخال مبلغ الدائن');
    }

    if (journalEntry.debitAmount && journalEntry.creditAmount) {
      const debitAmount = parseFloat(journalEntry.debitAmount);
      const creditAmount = parseFloat(journalEntry.creditAmount);
      
      if (Math.abs(debitAmount - creditAmount) > 0.01) {
        errors.push('يجب أن يكون مبلغ المدين مساوياً لمبلغ الدائن');
      }
    }

    if (journalEntry.debitAccount === journalEntry.creditAccount) {
      errors.push('لا يمكن أن يكون الحساب المدين والدائن نفس الحساب');
    }

    return errors;
  };

  const handleSubmit = () => {
    const errors = validateTransaction();
    setValidationErrors(errors);
    
    if (errors.length > 0) {
      return;
    }

    const debitAccount = accounts.find(acc => acc.code === journalEntry.debitAccount);
    const creditAccount = accounts.find(acc => acc.code === journalEntry.creditAccount);

    const transaction: JournalEntry = {
      entryId: `E-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      description: `عملية ${debitAccount?.name || 'غير محدد'}`,
      lines: [
        {
          accountCode: journalEntry.debitAccount,
          accountName: debitAccount?.name || '',
          debit: parseFloat(journalEntry.debitAmount),
          credit: 0
        },
        {
          accountCode: journalEntry.creditAccount,
          accountName: creditAccount?.name || '',
          debit: 0,
          credit: parseFloat(journalEntry.creditAmount)
        }
      ]
    };

    onTransactionAdd(transaction);
    
    // إعادة تعيين النموذج
    setJournalEntry({
      debitAccount: '',
      debitAmount: '',
      creditAccount: '',
      creditAmount: ''
    });
    setValidationErrors([]);
  };

  return (
    <Card className="accounting-card">
      <CardHeader>
        <CardTitle>إضافة عملية مالية جديدة</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* النموذج الجديد */}
        <div className="space-y-6">
          <h4 className="text-lg font-semibold">تفاصيل القيد</h4>

          {/* السطر المدين */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">الطرف المدين</label>
              <Select
                value={journalEntry.debitAccount}
                onValueChange={(value) => setJournalEntry(prev => ({ ...prev, debitAccount: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحساب المدين" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.code} value={account.code}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">
                          {account.code}
                        </span>
                        <span>{account.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">مبلغ المدين</label>
              <Input
                type="number"
                step="0.01"
                value={journalEntry.debitAmount}
                onChange={(e) => setJournalEntry(prev => ({ ...prev, debitAmount: e.target.value }))}
                placeholder="0.00"
                dir="ltr"
              />
            </div>
          </div>

          {/* السطر الدائن */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">الطرف الدائن</label>
              <Select
                value={journalEntry.creditAccount}
                onValueChange={(value) => setJournalEntry(prev => ({ ...prev, creditAccount: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحساب الدائن" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.code} value={account.code}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">
                          {account.code}
                        </span>
                        <span>{account.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">مبلغ الدائن</label>
              <Input
                type="number"
                step="0.01"
                value={journalEntry.creditAmount}
                onChange={(e) => setJournalEntry(prev => ({ ...prev, creditAmount: e.target.value }))}
                placeholder="0.00"
                dir="ltr"
              />
            </div>
          </div>

          {/* التحقق من التوازن */}
          {journalEntry.debitAmount && journalEntry.creditAmount && (
            <div className="flex items-center justify-center p-3 rounded-lg bg-muted">
              {Math.abs(parseFloat(journalEntry.debitAmount) - parseFloat(journalEntry.creditAmount)) < 0.01 ? (
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">القيد متوازن</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">القيد غير متوازن</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* رسائل التحقق */}
        {validationErrors.length > 0 && (
          <div className="bg-destructive-light p-4 rounded-lg">
            <h5 className="font-medium text-destructive-foreground mb-2">أخطاء في القيد:</h5>
            <ul className="list-disc list-inside space-y-1 text-sm text-destructive-foreground">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* الأزرار */}
        <div className="flex gap-2 justify-end">
          <Button 
            onClick={handleSubmit}
            className="accounting-button-primary"
          >
            إضافة العملية
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}