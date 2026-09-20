import React, { useState, useEffect } from 'react';
import { Plus, X, FileText, Calculator, TrendingUp, Building2, ClipboardList, Scale } from 'lucide-react';
import IncomeStatementInterface from '@/components/IncomeStatementInterface';
import BalanceSheetInterface from '@/components/BalanceSheetInterface';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  SessionData, 
  ManualFinancialStatements, 
  ManualIncomeStatement, 
  ManualBalanceSheet,
  ManualIncomeStatementItem,
  ManualBalanceSheetItem,
  TrialBalance 
} from '@/types/accounting';
import { saveSession } from '@/utils/sessionManager';
import { v4 as uuidv4 } from 'uuid';

interface Stage8FinancialStatementsProps {
  sessionData: SessionData;
  onStageComplete: (stageId: number, answers: any) => void;
  onNext: () => void;
}

export function Stage8FinancialStatements({ 
  sessionData, 
  onStageComplete, 
  onNext 
}: Stage8FinancialStatementsProps) {
  const [financialStatements, setFinancialStatements] = useState<ManualFinancialStatements>(
    sessionData.manualFinancialStatements || {}
  );
  const [activeStatement, setActiveStatement] = useState<string>('');
  const [showSidebar, setShowSidebar] = useState(true);

  // Get trial balance data from Stage 7
  const getTrialBalanceData = (): TrialBalance[] => {
    if (!sessionData.userAnswers?.stage7_adjusted_trial_balance) {
      return [];
    }
    return sessionData.userAnswers.stage7_adjusted_trial_balance;
  };

  const trialBalanceData = getTrialBalanceData();

  useEffect(() => {
    const updatedSessionData = {
      ...sessionData,
      manualFinancialStatements: financialStatements
    };
    saveSession(updatedSessionData);
  }, [financialStatements, sessionData]);

  // Income Statement Functions
  const createIncomeStatement = () => {
    const newIncomeStatement: ManualIncomeStatement = {
      revenues: [],
      expenses: [],
      totalRevenues: 0,
      totalExpenses: 0,
      netIncome: 0
    };
    setFinancialStatements(prev => ({
      ...prev,
      incomeStatement: newIncomeStatement
    }));
    setActiveStatement('income');
  };

  const addRevenueItem = () => {
    if (!financialStatements.incomeStatement) return;
    
    const newItem: ManualIncomeStatementItem = {
      id: uuidv4(),
      name: '',
      amount: 0
    };
    
    setFinancialStatements(prev => ({
      ...prev,
      incomeStatement: {
        ...prev.incomeStatement!,
        revenues: [...prev.incomeStatement!.revenues, newItem]
      }
    }));
  };

  const addExpenseItem = () => {
    if (!financialStatements.incomeStatement) return;
    
    const newItem: ManualIncomeStatementItem = {
      id: uuidv4(),
      name: '',
      amount: 0
    };
    
    setFinancialStatements(prev => ({
      ...prev,
      incomeStatement: {
        ...prev.incomeStatement!,
        expenses: [...prev.incomeStatement!.expenses, newItem]
      }
    }));
  };

  const updateRevenueItem = (id: string, field: 'name' | 'amount', value: string | number) => {
    if (!financialStatements.incomeStatement) return;
    
    setFinancialStatements(prev => ({
      ...prev,
      incomeStatement: {
        ...prev.incomeStatement!,
        revenues: prev.incomeStatement!.revenues.map(item =>
          item.id === id ? { ...item, [field]: value } : item
        )
      }
    }));
  };

  const updateExpenseItem = (id: string, field: 'name' | 'amount', value: string | number) => {
    if (!financialStatements.incomeStatement) return;
    
    setFinancialStatements(prev => ({
      ...prev,
      incomeStatement: {
        ...prev.incomeStatement!,
        expenses: prev.incomeStatement!.expenses.map(item =>
          item.id === id ? { ...item, [field]: value } : item
        )
      }
    }));
  };

  const removeRevenueItem = (id: string) => {
    if (!financialStatements.incomeStatement) return;
    
    setFinancialStatements(prev => ({
      ...prev,
      incomeStatement: {
        ...prev.incomeStatement!,
        revenues: prev.incomeStatement!.revenues.filter(item => item.id !== id)
      }
    }));
  };

  const removeExpenseItem = (id: string) => {
    if (!financialStatements.incomeStatement) return;
    
    setFinancialStatements(prev => ({
      ...prev,
      incomeStatement: {
        ...prev.incomeStatement!,
        expenses: prev.incomeStatement!.expenses.filter(item => item.id !== id)
      }
    }));
  };

  // Balance Sheet Functions
  const createBalanceSheet = () => {
    const newBalanceSheet: ManualBalanceSheet = {
      assets: [],
      liabilities: [],
      equity: [],
      totalAssets: 0,
      totalLiabilities: 0,
      totalEquity: 0,
      totalLiabilitiesAndEquity: 0,
      isBalanced: true
    };
    setFinancialStatements(prev => ({
      ...prev,
      balanceSheet: newBalanceSheet
    }));
    setActiveStatement('balance');
  };

  const addBalanceSheetItem = (section: 'assets' | 'liabilities' | 'equity') => {
    if (!financialStatements.balanceSheet) return;
    
    const newItem: ManualBalanceSheetItem = {
      id: uuidv4(),
      name: '',
      amount: 0
    };
    
    setFinancialStatements(prev => ({
      ...prev,
      balanceSheet: {
        ...prev.balanceSheet!,
        [section]: [...prev.balanceSheet![section], newItem]
      }
    }));
  };

  const updateBalanceSheetItem = (
    section: 'assets' | 'liabilities' | 'equity',
    id: string,
    field: 'name' | 'amount',
    value: string | number
  ) => {
    if (!financialStatements.balanceSheet) return;
    
    setFinancialStatements(prev => ({
      ...prev,
      balanceSheet: {
        ...prev.balanceSheet!,
        [section]: prev.balanceSheet![section].map(item =>
          item.id === id ? { ...item, [field]: value } : item
        )
      }
    }));
  };

  const removeBalanceSheetItem = (section: 'assets' | 'liabilities' | 'equity', id: string) => {
    if (!financialStatements.balanceSheet) return;
    
    setFinancialStatements(prev => ({
      ...prev,
      balanceSheet: {
        ...prev.balanceSheet!,
        [section]: prev.balanceSheet![section].filter(item => item.id !== id)
      }
    }));
  };

  // Calculations
  useEffect(() => {
    if (financialStatements.incomeStatement) {
      const totalRevenues = financialStatements.incomeStatement.revenues.reduce(
        (sum, item) => sum + (Number(item.amount) || 0), 0
      );
      const totalExpenses = financialStatements.incomeStatement.expenses.reduce(
        (sum, item) => sum + (Number(item.amount) || 0), 0
      );
      const netIncome = totalRevenues - totalExpenses;

      setFinancialStatements(prev => ({
        ...prev,
        incomeStatement: {
          ...prev.incomeStatement!,
          totalRevenues,
          totalExpenses,
          netIncome
        }
      }));
    }
  }, [financialStatements.incomeStatement?.revenues, financialStatements.incomeStatement?.expenses]);

  useEffect(() => {
    if (financialStatements.balanceSheet) {
      const totalAssets = financialStatements.balanceSheet.assets.reduce(
        (sum, item) => sum + (Number(item.amount) || 0), 0
      );
      const totalLiabilities = financialStatements.balanceSheet.liabilities.reduce(
        (sum, item) => sum + (Number(item.amount) || 0), 0
      );
      const totalEquity = financialStatements.balanceSheet.equity.reduce(
        (sum, item) => sum + (Number(item.amount) || 0), 0
      );
      const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
      const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01;

      setFinancialStatements(prev => ({
        ...prev,
        balanceSheet: {
          ...prev.balanceSheet!,
          totalAssets,
          totalLiabilities,
          totalEquity,
          totalLiabilitiesAndEquity,
          isBalanced
        }
      }));
    }
  }, [
    financialStatements.balanceSheet?.assets,
    financialStatements.balanceSheet?.liabilities,
    financialStatements.balanceSheet?.equity
  ]);

  const handleComplete = () => {
    onStageComplete(8, { manualFinancialStatements: financialStatements });
    onNext();
  };

  const renderTrialBalanceSidebar = () => (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">ميزان المراجعة بعد التسويات</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-2">
            {trialBalanceData.map((account, index) => (
              <div key={index} className="flex justify-between text-xs border-b pb-1">
                <span className="font-medium">{account.accountName}</span>
                <div className="text-right">
                  {account.debitBalance > 0 && (
                    <div>مدين: {account.debitBalance.toLocaleString()}</div>
                  )}
                  {account.creditBalance > 0 && (
                    <div>دائن: {account.creditBalance.toLocaleString()}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  if (!activeStatement) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">إعداد القوائم المالية</h2>
          <p className="text-muted-foreground mb-6">
            قم بإنشاء القوائم المالية يدوياً باستخدام بيانات ميزان المراجعة بعد التسويات
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveStatement('income-template')}>
            <CardHeader className="text-center">
              <ClipboardList className="w-12 h-12 mx-auto mb-2 text-primary" />
              <CardTitle>واجهة قائمة الدخل</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                استخدام الواجهة المنظمة لإدخال بيانات قائمة الدخل
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveStatement('balance-template')}>
            <CardHeader className="text-center">
              <Scale className="w-12 h-12 mx-auto mb-2 text-primary" />
              <CardTitle>واجهة قائمة المركز المالي</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                واجهة تدريبية لإعداد قائمة المركز المالي يدوياً
              </p>
            </CardContent>
          </Card>

        </div>


        {(financialStatements.incomeStatement || financialStatements.balanceSheet || activeStatement === 'income-template') && (
          <div className="text-center pt-6">
            <Button onClick={handleComplete} className="px-8">
              اكتمال المرحلة
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Main Content */}
      <div className={showSidebar ? "col-span-8" : "col-span-12"}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setActiveStatement('')}
              className="flex items-center gap-2"
            >
              ← العودة للقائمة الرئيسية
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowSidebar(!showSidebar)}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              {showSidebar ? 'إخفاء' : 'عرض'} ميزان المراجعة
            </Button>
          </div>

          {activeStatement === 'income' && financialStatements.incomeStatement && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  قائمة الدخل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Revenue Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">الإيرادات</h3>
                    <Button onClick={addRevenueItem} size="sm" className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      إضافة بند
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {financialStatements.incomeStatement.revenues.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <Input
                          placeholder="اسم البند"
                          value={item.name}
                          onChange={(e) => updateRevenueItem(item.id, 'name', e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          placeholder="المبلغ"
                          value={item.amount || ''}
                          onChange={(e) => updateRevenueItem(item.id, 'amount', Number(e.target.value))}
                          className="w-32"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeRevenueItem(item.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-center font-semibold">
                      <span>إجمالي الإيرادات:</span>
                      <span>{financialStatements.incomeStatement.totalRevenues.toLocaleString()} ر.س</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Expenses Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">المصروفات</h3>
                    <Button onClick={addExpenseItem} size="sm" className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      إضافة بند
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {financialStatements.incomeStatement.expenses.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <Input
                          placeholder="اسم البند"
                          value={item.name}
                          onChange={(e) => updateExpenseItem(item.id, 'name', e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          placeholder="المبلغ"
                          value={item.amount || ''}
                          onChange={(e) => updateExpenseItem(item.id, 'amount', Number(e.target.value))}
                          className="w-32"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeExpenseItem(item.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-center font-semibold">
                      <span>إجمالي المصروفات:</span>
                      <span>{financialStatements.incomeStatement.totalExpenses.toLocaleString()} ر.س</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Net Income */}
                <div className="p-4 bg-primary/5 rounded-lg border">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>صافي {financialStatements.incomeStatement.netIncome >= 0 ? 'الربح' : 'الخسارة'}:</span>
                    <span className={financialStatements.incomeStatement.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {Math.abs(financialStatements.incomeStatement.netIncome).toLocaleString()} ر.س
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    = إجمالي الإيرادات ({financialStatements.incomeStatement.totalRevenues.toLocaleString()}) 
                    - إجمالي المصروفات ({financialStatements.incomeStatement.totalExpenses.toLocaleString()})
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeStatement === 'balance' && financialStatements.balanceSheet && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  قائمة المركز المالي (الميزانية العمومية)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!financialStatements.balanceSheet.isBalanced && (
                  <Alert>
                    <AlertDescription>
                      تحذير: الميزانية غير متوازنة. إجمالي الأصول ({financialStatements.balanceSheet.totalAssets.toLocaleString()}) 
                      لا يساوي إجمالي الخصوم وحقوق الملكية ({financialStatements.balanceSheet.totalLiabilitiesAndEquity.toLocaleString()})
                    </AlertDescription>
                  </Alert>
                )}

                {/* Assets Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">الأصول</h3>
                    <Button onClick={() => addBalanceSheetItem('assets')} size="sm" className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      إضافة أصل
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {financialStatements.balanceSheet.assets.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <Input
                          placeholder="اسم الأصل"
                          value={item.name}
                          onChange={(e) => updateBalanceSheetItem('assets', item.id, 'name', e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          placeholder="المبلغ"
                          value={item.amount || ''}
                          onChange={(e) => updateBalanceSheetItem('assets', item.id, 'amount', Number(e.target.value))}
                          className="w-32"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeBalanceSheetItem('assets', item.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-center font-semibold">
                      <span>إجمالي الأصول:</span>
                      <span>{financialStatements.balanceSheet.totalAssets.toLocaleString()} ر.س</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Liabilities Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">الخصوم</h3>
                    <Button onClick={() => addBalanceSheetItem('liabilities')} size="sm" className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      إضافة خصم
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {financialStatements.balanceSheet.liabilities.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <Input
                          placeholder="اسم الخصم"
                          value={item.name}
                          onChange={(e) => updateBalanceSheetItem('liabilities', item.id, 'name', e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          placeholder="المبلغ"
                          value={item.amount || ''}
                          onChange={(e) => updateBalanceSheetItem('liabilities', item.id, 'amount', Number(e.target.value))}
                          className="w-32"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeBalanceSheetItem('liabilities', item.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-center font-semibold">
                      <span>إجمالي الخصوم:</span>
                      <span>{financialStatements.balanceSheet.totalLiabilities.toLocaleString()} ر.س</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Equity Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">حقوق الملكية</h3>
                    <Button onClick={() => addBalanceSheetItem('equity')} size="sm" className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      إضافة حق ملكية
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {financialStatements.balanceSheet.equity.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <Input
                          placeholder="اسم حق الملكية"
                          value={item.name}
                          onChange={(e) => updateBalanceSheetItem('equity', item.id, 'name', e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          placeholder="المبلغ"
                          value={item.amount || ''}
                          onChange={(e) => updateBalanceSheetItem('equity', item.id, 'amount', Number(e.target.value))}
                          className="w-32"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeBalanceSheetItem('equity', item.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-center font-semibold">
                      <span>إجمالي حقوق الملكية:</span>
                      <span>{financialStatements.balanceSheet.totalEquity.toLocaleString()} ر.س</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Balance Check */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">إجمالي الأصول</p>
                      <p className="text-lg font-bold">{financialStatements.balanceSheet.totalAssets.toLocaleString()} ر.س</p>
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">إجمالي الخصوم وحقوق الملكية</p>
                      <p className="text-lg font-bold">{financialStatements.balanceSheet.totalLiabilitiesAndEquity.toLocaleString()} ر.س</p>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border text-center ${
                  financialStatements.balanceSheet.isBalanced 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  <p className="font-semibold">
                    {financialStatements.balanceSheet.isBalanced ? '✓ الميزانية متوازنة' : '⚠ الميزانية غير متوازنة'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeStatement === 'income-template' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5" />
                    واجهة قائمة الدخل المنظمة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <IncomeStatementInterface />
                </CardContent>
              </Card>
            </div>
          )}

          {activeStatement === 'balance-template' && (
            <BalanceSheetInterface onBack={() => setActiveStatement('')} />
          )}
        </div>
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <div className="col-span-4">
          {renderTrialBalanceSidebar()}
        </div>
      )}
    </div>
  );
}