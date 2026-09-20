import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, BookOpen, Calculator, TrendingUp } from 'lucide-react';
import { SessionData } from '@/types/accounting';
import { getChartOfAccounts } from '@/utils/dataGenerator';
import { generateDetailedLedger, DetailedLedgerAccount } from '@/utils/ledgerCalculations';

interface Stage3LedgerReviewProps {
  sessionData: SessionData;
  onBackToPosting: () => void;
  onStageComplete: () => void;
  postingProgress: Map<string, Set<string>>;
}

export default function Stage3LedgerReview({ 
  sessionData, 
  onBackToPosting, 
  onStageComplete,
  postingProgress 
}: Stage3LedgerReviewProps) {
  const chartOfAccounts = getChartOfAccounts();
  
  // الحصول على الحسابات التي تم ترحيل قيود إليها
  const accountsWithEntries = Array.from(
    new Set(
      sessionData.transactions.flatMap(transaction => 
        transaction.lines.map(line => line.accountCode)
      )
    )
  ).filter(accountCode => {
    // التأكد من أن الحساب تم ترحيل قيود إليه فعلياً
    return sessionData.transactions.some(transaction => {
      const postedAccounts = postingProgress.get(transaction.entryId) || new Set();
      return transaction.lines.some(line => 
        line.accountCode === accountCode && postedAccounts.has(accountCode)
      );
    });
  });
  
  const detailedLedgerAccounts = generateDetailedLedger(
    sessionData.transactions,
    chartOfAccounts,
    accountsWithEntries
  );
  
  // تجميع الحسابات حسب النوع
  const accountsByType = detailedLedgerAccounts.reduce((acc, account) => {
    if (!acc[account.type]) {
      acc[account.type] = [];
    }
    acc[account.type].push(account);
    return acc;
  }, {} as Record<string, DetailedLedgerAccount[]>);
  
  const typeNames = {
    Asset: 'الأصول',
    Liability: 'الخصوم',
    Equity: 'حقوق الملكية',
    Revenue: 'الإيرادات',
    Expense: 'المصروفات'
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={onBackToPosting}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              دفتر الأستاذ النهائي
            </h1>
            <p className="text-muted-foreground">
              مراجعة تفصيلية لجميع الحسابات وحركاتها المالية
            </p>
          </div>
        </div>
        
        <Button onClick={onStageComplete} size="lg">
          <TrendingUp className="h-4 w-4 ml-2" />
          الانتقال لميزان المراجعة
        </Button>
      </div>
      
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{detailedLedgerAccounts.length}</p>
                <p className="text-xs text-muted-foreground">عدد الحسابات المستخدمة</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {detailedLedgerAccounts.reduce((sum, acc) => sum + acc.entries.length, 0)}
                </p>
                <p className="text-xs text-muted-foreground">إجمالي القيود المرحلة</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {detailedLedgerAccounts.reduce((sum, acc) => sum + acc.finalBalance, 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">مجموع الأرصدة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Detailed Ledger Accounts */}
      <div className="space-y-8">
        {Object.entries(accountsByType).map(([type, accounts]) => (
          <div key={type} className="space-y-4">
            <h2 className="text-xl font-semibold text-center py-3 bg-primary/10 rounded-lg">
              {typeNames[type as keyof typeof typeNames]}
            </h2>
            
            {accounts.map(account => (
              <Card key={account.code} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{account.name} ({account.code})</span>
                    <div className="text-sm font-normal">
                      <span className="bg-primary/20 px-3 py-1 rounded-full">
                        الرصيد المرحل: {account.finalBalance.toLocaleString()} 
                        <span className="mr-1">
                          {account.finalBalanceSide === 'debit' ? 'مدين' : 'دائن'}
                        </span>
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* الجانب المدين */}
                    <div>
                      <h4 className="font-semibold text-center bg-red-50 dark:bg-red-900/20 py-2 rounded-t-lg border">
                        الجانب المدين
                      </h4>
                      <div className="border border-t-0 rounded-b-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                              <tr>
                                <th className="text-right p-2 border-l">التاريخ</th>
                                <th className="text-right p-2 border-l">رقم القيد</th>
                                <th className="text-right p-2 border-l">الطرف المقابل</th>
                                <th className="text-right p-2 border-l">البيان</th>
                                <th className="text-right p-2">المبلغ</th>
                              </tr>
                            </thead>
                            <tbody>
                              {account.entries.filter(entry => entry.side === 'debit').map((entry, index) => (
                                <tr key={`${entry.id}-debit`} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                                  <td className="p-2 border-l text-xs">{new Date(entry.date).toLocaleDateString('ar-EG')}</td>
                                  <td className="p-2 border-l text-xs font-mono">{entry.entryNumber}</td>
                                  <td className="p-2 border-l text-xs">{entry.contraAccount}</td>
                                  <td className="p-2 border-l text-xs">{entry.description}</td>
                                  <td className="p-2 text-xs font-mono text-right">{entry.amount.toLocaleString()}</td>
                                </tr>
                              ))}
                              <tr className="bg-red-100 dark:bg-red-900/30 font-semibold">
                                <td colSpan={4} className="p-2 text-center border-l">إجمالي المدين</td>
                                <td className="p-2 text-right font-mono">{account.debitTotal.toLocaleString()}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                    
                    {/* الجانب الدائن */}
                    <div>
                      <h4 className="font-semibold text-center bg-blue-50 dark:bg-blue-900/20 py-2 rounded-t-lg border">
                        الجانب الدائن
                      </h4>
                      <div className="border border-t-0 rounded-b-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                              <tr>
                                <th className="text-right p-2 border-l">التاريخ</th>
                                <th className="text-right p-2 border-l">رقم القيد</th>
                                <th className="text-right p-2 border-l">الطرف المقابل</th>
                                <th className="text-right p-2 border-l">البيان</th>
                                <th className="text-right p-2">المبلغ</th>
                              </tr>
                            </thead>
                            <tbody>
                              {account.entries.filter(entry => entry.side === 'credit').map((entry, index) => (
                                <tr key={`${entry.id}-credit`} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                                  <td className="p-2 border-l text-xs">{new Date(entry.date).toLocaleDateString('ar-EG')}</td>
                                  <td className="p-2 border-l text-xs font-mono">{entry.entryNumber}</td>
                                  <td className="p-2 border-l text-xs">{entry.contraAccount}</td>
                                  <td className="p-2 border-l text-xs">{entry.description}</td>
                                  <td className="p-2 text-xs font-mono text-right">{entry.amount.toLocaleString()}</td>
                                </tr>
                              ))}
                              <tr className="bg-blue-100 dark:bg-blue-900/30 font-semibold">
                                <td colSpan={4} className="p-2 text-center border-l">إجمالي الدائن</td>
                                <td className="p-2 text-right font-mono">{account.creditTotal.toLocaleString()}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* الرصيد المرحل */}
                  <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border">
                    <div className="text-center">
                      <h5 className="font-semibold mb-2">الرصيد المرحل</h5>
                      <div className="text-lg font-bold">
                        {account.finalBalance.toLocaleString()} ريال سعودي 
                        <span className="mr-2 text-sm font-normal">
                          ({account.finalBalanceSide === 'debit' ? 'مدين' : 'دائن'})
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        هذا الرصيد سيستخدم في ميزان المراجعة والقوائم المالية
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ))}
      </div>
      
      {detailedLedgerAccounts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد حسابات للعرض</h3>
            <p className="text-muted-foreground">
              لم يتم ترحيل أي قيود بعد. ارجع إلى صفحة الترحيل لإكمال العملية.
            </p>
            <Button onClick={onBackToPosting} className="mt-4">
              العودة إلى الترحيل
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}