import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface IncomeStatementAccount {
  code: string;
  name: string;
  type: 'revenue' | 'expense';
}

const incomeStatementAccounts: IncomeStatementAccount[] = [
  // الإيرادات
  { code: '401', name: 'إيرادات المبيعات', type: 'revenue' },
  { code: '402', name: 'إيرادات الخدمات', type: 'revenue' },
  { code: '403', name: 'إيرادات أخرى', type: 'revenue' },
  
  // المصروفات
  { code: '501', name: 'تكلفة البضاعة المباعة', type: 'expense' },
  { code: '502', name: 'مصروفات البيع', type: 'expense' },
  { code: '503', name: 'مصروفات إدارية', type: 'expense' },
  { code: '504', name: 'مصروفات التشغيل', type: 'expense' },
  { code: '505', name: 'مصروفات أخرى', type: 'expense' },
];

const IncomeStatementInterface: React.FC = () => {
  const revenueAccounts = incomeStatementAccounts.filter(account => account.type === 'revenue');
  const expenseAccounts = incomeStatementAccounts.filter(account => account.type === 'expense');

  const AccountSection = ({ title, accounts, icon }: { 
    title: string; 
    accounts: IncomeStatementAccount[]; 
    icon: React.ReactNode;
  }) => (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
      <div className="space-y-2">
        {accounts.map((account) => (
          <div key={account.code} className="grid grid-cols-2 gap-4 p-2 rounded-md bg-secondary/50 hover:bg-secondary/70 transition-colors">
            <div className="flex items-center">
              <span className="text-sm text-muted-foreground mr-2">{account.code}</span>
              <span className="text-foreground">{account.name}</span>
            </div>
            <div>
              <Input 
                type="number" 
                placeholder="0.00" 
                className="text-left" 
                dir="ltr"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-primary/5 border-b">
        <CardTitle className="text-xl text-center text-foreground">
          قائمة الدخل
        </CardTitle>
        <p className="text-sm text-muted-foreground text-center">
          أدخل المبالغ المطلوبة لكل حساب
        </p>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground border-b pb-2">المبلغ</h2>
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground border-b pb-2">اسم الحساب</h2>
          </div>
        </div>

        <AccountSection 
          title="الإيرادات" 
          accounts={revenueAccounts}
          icon={<TrendingUp className="w-5 h-5 text-success" />}
        />

        <div className="border-t my-6 pt-6">
          <AccountSection 
            title="المصروفات" 
            accounts={expenseAccounts}
            icon={<TrendingDown className="w-5 h-5 text-destructive" />}
          />
        </div>

        <div className="mt-8 pt-4 border-t-2 border-primary/20">
          <div className="grid grid-cols-2 gap-4 p-4 bg-primary/5 rounded-lg">
            <div className="text-center">
              <span className="text-lg font-bold text-foreground">صافي الدخل</span>
            </div>
            <div>
              <Input 
                type="number" 
                placeholder="0.00" 
                className="text-left font-bold text-lg" 
                dir="ltr"
                readOnly
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IncomeStatementInterface;