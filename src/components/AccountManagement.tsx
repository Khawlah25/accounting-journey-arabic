import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Account } from '@/types/accounting';

interface AccountManagementProps {
  accounts: Account[];
  onAccountsChange: (accounts: Account[]) => void;
}

interface NewAccount {
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  normalBalance: 'Debit' | 'Credit';
}

export function AccountManagement({ accounts, onAccountsChange }: AccountManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAccount, setNewAccount] = useState<NewAccount>({
    code: '',
    name: '',
    type: 'Asset',
    normalBalance: 'Debit'
  });

  const accountTypeNames = {
    'Asset': 'أصول',
    'Liability': 'خصوم',
    'Equity': 'حقوق ملكية',
    'Revenue': 'إيرادات',
    'Expense': 'مصروفات'
  };

  const handleAddAccount = () => {
    if (!newAccount.code || !newAccount.name) {
      return;
    }

    // تحديد الرصيد الطبيعي تلقائياً حسب نوع الحساب
    const normalBalance = ['Asset', 'Expense'].includes(newAccount.type) ? 'Debit' : 'Credit';

    const account: Account = {
      ...newAccount,
      normalBalance: normalBalance as 'Debit' | 'Credit'
    };

    onAccountsChange([...accounts, account]);
    setNewAccount({ code: '', name: '', type: 'Asset', normalBalance: 'Debit' });
    setIsDialogOpen(false);
  };

  const handleDeleteAccount = (code: string) => {
    onAccountsChange(accounts.filter(acc => acc.code !== code));
  };

  const generateNextCode = (type: string) => {
    const typeCodes = {
      'Asset': '1',
      'Liability': '2', 
      'Equity': '3',
      'Revenue': '4',
      'Expense': '5'
    };

    const prefix = typeCodes[type as keyof typeof typeCodes];
    const existingCodes = accounts
      .filter(acc => acc.code.startsWith(prefix))
      .map(acc => parseInt(acc.code))
      .filter(code => !isNaN(code));

    const maxCode = existingCodes.length > 0 ? Math.max(...existingCodes) : parseInt(prefix + '00');
    return (maxCode + 1).toString();
  };

  const handleTypeChange = (type: string) => {
    const typedType = type as 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
    setNewAccount({
      ...newAccount,
      type: typedType,
      code: generateNextCode(type),
      normalBalance: ['Asset', 'Expense'].includes(type) ? 'Debit' : 'Credit'
    });
  };

  return (
    <Card className="accounting-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>دليل الحسابات</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="accounting-button-primary">
                <Plus className="h-4 w-4 ml-2" />
                إضافة حساب جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة حساب جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="account-type">نوع الحساب</Label>
                  <Select value={newAccount.type} onValueChange={handleTypeChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(accountTypeNames).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="account-code">رقم الحساب</Label>
                  <Input
                    id="account-code"
                    value={newAccount.code}
                    onChange={(e) => setNewAccount({ ...newAccount, code: e.target.value })}
                    placeholder="مثال: 101"
                    dir="ltr"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="account-name">اسم الحساب</Label>
                  <Input
                    id="account-name"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                    placeholder="مثال: الصندوق"
                  />
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>الرصيد الطبيعي:</span>
                  <Badge variant="outline">
                    {newAccount.normalBalance === 'Debit' ? 'مدين' : 'دائن'}
                  </Badge>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleAddAccount} disabled={!newAccount.code || !newAccount.name}>
                  إضافة
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {accounts.map((account) => (
            <div key={account.code} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="font-mono text-xs">
                  {account.code}
                </Badge>
                <span className="font-medium">{account.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {accountTypeNames[account.type]}
                </Badge>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteAccount(account.code)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}