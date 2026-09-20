import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, Building2, Coins, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { getChartOfAccounts } from '@/utils/dataGenerator';
import { getCurrentOrCreateSession } from '@/utils/sessionManager';
import { Account } from '@/types/accounting';

interface AccountWithBalance extends Account {
  balance?: number;
  balanceSide?: 'debit' | 'credit';
}

const AccountNamesSidebar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // الحصول على بيانات الحسابات مع الأرصدة من المرحلة الثالثة
  const accountsWithBalances = useMemo(() => {
    try {
      const session = getCurrentOrCreateSession();
      const allAccounts = getChartOfAccounts();
      
      // إذا كانت بيانات المرحلة الثالثة متوفرة
      if (session.stage3AccountSummary && Object.keys(session.stage3AccountSummary).length > 0) {
        return Object.entries(session.stage3AccountSummary)
          .filter(([_, accountData]) => accountData.finalBalance > 0) // فقط الحسابات التي لها أرصدة
          .map(([accountCode, accountData]) => {
            const accountInfo = allAccounts.find(acc => acc.code === accountCode);
            return {
              code: accountCode,
              name: accountData.accountName,
              type: accountInfo?.type || 'Asset',
              normalBalance: accountInfo?.normalBalance || 'Debit',
              balance: accountData.finalBalance,
              balanceSide: accountData.balanceSide
            } as AccountWithBalance;
          });
      }
      
      // إذا كانت بيانات دفتر الأستاذ متوفرة
      if (session.ledgerData && Object.keys(session.ledgerData).length > 0) {
        return Object.values(session.ledgerData)
          .filter(account => account.finalBalance > 0)
          .map(account => ({
            code: account.code,
            name: account.name,
            type: account.type,
            normalBalance: account.type === 'Asset' || account.type === 'Expense' ? 'Debit' : 'Credit',
            balance: account.finalBalance,
            balanceSide: account.finalBalanceSide
          } as AccountWithBalance));
      }
      
      // fallback: استخدام جميع الحسابات بدون أرصدة
      return allAccounts.map(account => ({
        ...account,
        balance: 0,
        balanceSide: 'debit' as const
      }));
    } catch (error) {
      console.error('خطأ في تحميل بيانات الحسابات:', error);
      return getChartOfAccounts().map(account => ({
        ...account,
        balance: 0,
        balanceSide: 'debit' as const
      }));
    }
  }, []);

  // تجميع الحسابات حسب النوع مع البحث
  const groupedAccounts = useMemo(() => {
    const filtered = accountsWithBalances.filter(account =>
      account.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return {
      assets: filtered.filter(acc => acc.type === 'Asset'),
      liabilities: filtered.filter(acc => acc.type === 'Liability'),
      equity: filtered.filter(acc => acc.type === 'Equity'),
      revenue: filtered.filter(acc => acc.type === 'Revenue'),
      expenses: filtered.filter(acc => acc.type === 'Expense'),
    };
  }, [accountsWithBalances, searchQuery]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Asset': return <Coins className="h-4 w-4 text-green-600" />;
      case 'Liability': return <Building2 className="h-4 w-4 text-red-600" />;
      case 'Equity': return <Users className="h-4 w-4 text-blue-600" />;
      case 'Revenue': return <TrendingUp className="h-4 w-4 text-emerald-600" />;
      case 'Expense': return <TrendingDown className="h-4 w-4 text-orange-600" />;
      default: return null;
    }
  };

  const getTypeTitle = (type: string) => {
    switch (type) {
      case 'Asset': return 'الأصول';
      case 'Liability': return 'الخصوم';
      case 'Equity': return 'حقوق الملكية';
      case 'Revenue': return 'الإيرادات';
      case 'Expense': return 'المصروفات';
      default: return type;
    }
  };

  // دالة لتنسيق عرض الرصيد
  const formatBalance = (balance: number | undefined, balanceSide: 'debit' | 'credit' | undefined) => {
    if (!balance || balance === 0) return ' (رصيد: 0)';
    const formattedAmount = balance.toLocaleString('ar-EG');
    const sideText = balanceSide === 'debit' ? 'مدين' : 'دائن';
    return ` (رصيد: ${formattedAmount} ${sideText})`;
  };

  const AccountGroup = ({ title, accounts, type }: { title: string; accounts: AccountWithBalance[]; type: string }) => {
    if (accounts.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2 text-sm font-medium text-muted-foreground">
          {getTypeIcon(type)}
          <span>{title}</span>
          <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
            {accounts.length}
          </span>
        </div>
        <div className="space-y-1 mr-4">
          {accounts.map((account) => (
            <div
              key={account.code}
              className="text-sm py-1 px-2 rounded hover:bg-muted/50 cursor-pointer transition-colors"
              title={`كود الحساب: ${account.code}`}
            >
              <span className="font-medium">{account.name}</span>
              <span className={`text-xs ${account.balance && account.balance > 0 ? 
                account.balanceSide === 'debit' ? 'text-green-600' : 'text-blue-600' 
                : 'text-muted-foreground'}`}>
                {formatBalance(account.balance, account.balanceSide)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">دليل الحسابات</CardTitle>
        <div className="relative">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="البحث في أسماء الحسابات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="p-4 space-y-4">
            <AccountGroup 
              title={getTypeTitle('Asset')} 
              accounts={groupedAccounts.assets} 
              type="Asset"
            />
            <AccountGroup 
              title={getTypeTitle('Liability')} 
              accounts={groupedAccounts.liabilities} 
              type="Liability"
            />
            <AccountGroup 
              title={getTypeTitle('Equity')} 
              accounts={groupedAccounts.equity} 
              type="Equity"
            />
            <AccountGroup 
              title={getTypeTitle('Revenue')} 
              accounts={groupedAccounts.revenue} 
              type="Revenue"
            />
            <AccountGroup 
              title={getTypeTitle('Expense')} 
              accounts={groupedAccounts.expenses} 
              type="Expense"
            />
            
            {Object.values(groupedAccounts).every(group => group.length === 0) && (
              <div className="text-center text-muted-foreground py-8">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>لا توجد حسابات تطابق البحث</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AccountNamesSidebar;