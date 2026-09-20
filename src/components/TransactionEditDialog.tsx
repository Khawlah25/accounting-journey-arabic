import React, { useState } from 'react';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Account, JournalEntry, JournalLine } from '@/types/accounting';

interface TransactionEditDialogProps {
  transaction: JournalEntry | null;
  accounts: Account[];
  onSave: (transaction: JournalEntry) => void;
  onCancel: () => void;
}

interface EditLine {
  accountCode: string;
  accountName: string;
  debit: string;
  credit: string;
}

export function TransactionEditDialog({ transaction, accounts, onSave, onCancel }: TransactionEditDialogProps) {
  const [lines, setLines] = useState<EditLine[]>(
    transaction?.lines.map(line => ({
      accountCode: line.accountCode,
      accountName: line.accountName,
      debit: line.debit.toString(),
      credit: line.credit.toString()
    })) || []
  );

  const addLine = () => {
    setLines([...lines, { accountCode: '', accountName: '', debit: '', credit: '' }]);
  };

  const removeLine = (index: number) => {
    if (lines.length > 1) {
      setLines(lines.filter((_, i) => i !== index));
    }
  };

  const updateLine = (index: number, field: keyof EditLine, value: string) => {
    const newLines = [...lines];
    
    if (field === 'accountCode') {
      const selectedAccount = accounts.find(acc => acc.code === value);
      newLines[index] = {
        ...newLines[index],
        accountCode: value,
        accountName: selectedAccount?.name || ''
      };
    } else {
      newLines[index] = { ...newLines[index], [field]: value };
    }
    
    setLines(newLines);
  };

  const handleSave = () => {
    if (!transaction) return;

    const validLines: JournalLine[] = lines
      .filter(line => line.accountCode && (parseFloat(line.debit) > 0 || parseFloat(line.credit) > 0))
      .map(line => ({
        accountCode: line.accountCode,
        accountName: line.accountName,
        debit: parseFloat(line.debit) || 0,
        credit: parseFloat(line.credit) || 0
      }));

    if (validLines.length === 0) return;

    const updatedTransaction: JournalEntry = {
      ...transaction,
      lines: validLines
    };

    onSave(updatedTransaction);
  };

  if (!transaction) return null;

  return (
    <Dialog open={!!transaction} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>تعديل العملية: {transaction.description}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold">تفاصيل القيد</h4>
            <Button size="sm" variant="outline" onClick={addLine}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة سطر
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 gap-0 bg-muted p-3 font-semibold text-sm">
              <div className="col-span-4">اسم الحساب</div>
              <div className="col-span-3 text-center">مدين (المبلغ)</div>
              <div className="col-span-3 text-center">دائن (المبلغ)</div>
              <div className="col-span-2 text-center">الإجراءات</div>
            </div>

            {lines.map((line, index) => (
              <div key={index} className="grid grid-cols-12 gap-0 p-3 border-t items-center">
                <div className="col-span-4">
                  <Select
                    value={line.accountCode}
                    onValueChange={(value) => updateLine(index, 'accountCode', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="اختر الحساب" />
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
                
                <div className="col-span-3 px-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={line.debit}
                    onChange={(e) => updateLine(index, 'debit', e.target.value)}
                    placeholder="0.00"
                    dir="ltr"
                    className="text-center"
                  />
                </div>
                
                <div className="col-span-3 px-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={line.credit}
                    onChange={(e) => updateLine(index, 'credit', e.target.value)}
                    placeholder="0.00"
                    dir="ltr"
                    className="text-center"
                  />
                </div>
                
                <div className="col-span-2 text-center">
                  {lines.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeLine(index)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 ml-2" />
            إلغاء
          </Button>
          <Button onClick={handleSave} className="accounting-button-primary">
            <Save className="h-4 w-4 ml-2" />
            حفظ التغييرات
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}