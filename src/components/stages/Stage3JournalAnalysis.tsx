import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, CheckCircle, AlertTriangle, XCircle, Search, TrendingUp, BarChart3, Receipt } from 'lucide-react';
import { SessionData, AuditResult, AuditSummary } from '@/types/accounting';
import { performFinancialAudit } from '@/utils/auditEngine';

interface Stage3Props {
  sessionData: SessionData;
  onStageComplete: () => void;
  onUpdateSessionData: (sessionData: SessionData) => void;
}

export default function Stage3JournalAnalysis({ 
  sessionData, 
  onStageComplete, 
  onUpdateSessionData 
}: Stage3Props) {
  const [showJournalEntries, setShowJournalEntries] = useState(false);
  const [showAuditResults, setShowAuditResults] = useState(false);
  const [showAccountAnalysis, setShowAccountAnalysis] = useState(false);

  // تشغيل التدقيق التلقائي
  const { auditResults, auditSummary } = useMemo(() => {
    if (sessionData.transactions.length === 0) {
      return { 
        auditResults: [], 
        auditSummary: {
          totalEntries: 0,
          validEntries: 0,
          entriesWithWarnings: 0,
          entriesWithErrors: 0,
          overallScore: 100,
          criticalIssues: []
        }
      };
    }
    
    return performFinancialAudit(sessionData);
  }, [sessionData.transactions, sessionData.chartOfAccounts]);

  // Generate account summary for the new system
  const generateAccountSummary = useMemo(() => {
    if (!sessionData.transactions || sessionData.transactions.length === 0) {
      return {};
    }

    const accountSummary: Record<string, {
      accountName: string;
      totalDebits: number;
      totalCredits: number;
      finalBalance: number;
      debitCount: number;
      creditCount: number;
    }> = {};

    sessionData.transactions.forEach(transaction => {
      transaction.lines.forEach(line => {
        if (!accountSummary[line.accountCode]) {
          accountSummary[line.accountCode] = {
            accountName: line.accountName,
            totalDebits: 0,
            totalCredits: 0,
            finalBalance: 0,
            debitCount: 0,
            creditCount: 0
          };
        }
        
        if (line.debit > 0) {
          accountSummary[line.accountCode].totalDebits += line.debit;
          accountSummary[line.accountCode].debitCount++;
        }
        
        if (line.credit > 0) {
          accountSummary[line.accountCode].totalCredits += line.credit;
          accountSummary[line.accountCode].creditCount++;
        }
      });
    });

    // Calculate final balance = |larger total - smaller total|
    Object.keys(accountSummary).forEach(accountCode => {
      const account = accountSummary[accountCode];
      account.finalBalance = Math.abs(account.totalDebits - account.totalCredits);
    });

    return accountSummary;
  }, [sessionData.transactions]);

  // حفظ نتائج التدقيق في sessionData
  useEffect(() => {
    if (auditResults.length > 0 && Object.keys(generateAccountSummary).length > 0) {
      // تحويل generateAccountSummary إلى الصيغة المطلوبة لـ stage3AccountSummary
      const stage3AccountSummary: {[accountCode: string]: {
        accountCode: string;
        accountName: string;
        totalDebits: number;
        totalCredits: number;
        finalBalance: number;
        balanceSide: 'debit' | 'credit';
      }} = {};

      Object.entries(generateAccountSummary).forEach(([accountCode, data]) => {
        // تحديد الجانب بناءً على أي منهما أكبر
        const balanceSide = data.totalDebits >= data.totalCredits ? 'debit' : 'credit';
        
        stage3AccountSummary[accountCode] = {
          accountCode,
          accountName: data.accountName,
          totalDebits: data.totalDebits,
          totalCredits: data.totalCredits,
          finalBalance: data.finalBalance,
          balanceSide
        };
      });

      const updatedSessionData = {
        ...sessionData,
        auditResults,
        auditSummary,
        stage3AccountSummary
      };
      onUpdateSessionData(updatedSessionData);
    }
  }, [auditResults, auditSummary, generateAccountSummary]);

  const handleComplete = () => {
    onStageComplete();
  };

  // الحصول على لون حالة التدقيق
  const getAuditStatusColor = (result: AuditResult) => {
    if (result.errors.length > 0) return 'destructive';
    if (result.warnings.length > 0) return 'warning';
    return 'success';
  };

  // الحصول على أيقونة حالة التدقيق
  const getAuditStatusIcon = (result: AuditResult) => {
    if (result.errors.length > 0) return <XCircle className="h-4 w-4" />;
    if (result.warnings.length > 0) return <AlertTriangle className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };


  // دالة الحصول على الحسابات المستخدمة مع طبيعة الرصيد
  const getUsedAccountsWithBalances = () => {
    const accountSummary = generateAccountSummary;
    const usedAccounts = Object.keys(accountSummary).map(accountCode => {
      const account = accountSummary[accountCode];
      
      // البحث عن معلومات الحساب من دليل الحسابات
      const accountInfo = sessionData.chartOfAccounts.find(acc => acc.code === accountCode);
      const normalBalance = accountInfo?.normalBalance || 'Debit';
      
      // تحديد طبيعة الرصيد النهائي بناءً على الطبيعة الأساسية للحساب
      let finalBalanceNature: 'مدين' | 'دائن';
      let isNormalBalance = true;
      
      if (normalBalance === 'Debit') {
        // الأصول والمصروفات - طبيعتها مدينة
        if (account.totalDebits >= account.totalCredits) {
          finalBalanceNature = 'مدين';
          isNormalBalance = true;
        } else {
          finalBalanceNature = 'دائن';
          isNormalBalance = false; // رصيد غير طبيعي
        }
      } else {
        // الالتزامات وحقوق الملكية والإيرادات - طبيعتها دائنة
        if (account.totalCredits >= account.totalDebits) {
          finalBalanceNature = 'دائن';
          isNormalBalance = true;
        } else {
          finalBalanceNature = 'مدين';
          isNormalBalance = false; // رصيد غير طبيعي
        }
      }
      
      // ترجمة نوع الحساب
      const getAccountTypeInArabic = (type?: string) => {
        const types = {
          'Asset': 'أصل',
          'Liability': 'التزام', 
          'Equity': 'حقوق ملكية',
          'Revenue': 'إيراد',
          'Expense': 'مصروف'
        };
        return types[type as keyof typeof types] || 'غير محدد';
      };
      
      return {
        accountCode,
        accountName: account.accountName,
        accountType: getAccountTypeInArabic(accountInfo?.type),
        normalBalance: normalBalance === 'Debit' ? 'مدين' : 'دائن',
        finalBalance: account.finalBalance,
        finalBalanceNature,
        isNormalBalance,
        totalDebits: account.totalDebits,
        totalCredits: account.totalCredits
      };
    });
    
    return usedAccounts.sort((a, b) => a.accountCode.localeCompare(b.accountCode));
  };

  const usedAccounts = getUsedAccountsWithBalances();
  const normalBalanceAccounts = usedAccounts.filter(acc => acc.isNormalBalance);
  const abnormalBalanceAccounts = usedAccounts.filter(acc => !acc.isNormalBalance);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            تحليل القيود
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* قسم الحسابات المستخدمة وأرصدتها النهائية */}
          {sessionData.transactions.length > 0 && (
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  الحسابات المستخدمة وأرصدتها النهائية
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* ملخص الحسابات */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="p-4 bg-green-50 border-green-200">
                    <div className="text-center">
                      <p className="text-sm text-green-700">إجمالي الحسابات</p>
                      <p className="text-2xl font-bold text-green-800">{usedAccounts.length}</p>
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <div className="text-center">
                      <p className="text-sm text-blue-700">أرصدة طبيعية</p>
                      <p className="text-2xl font-bold text-blue-800">{normalBalanceAccounts.length}</p>
                    </div>
                  </Card>
                  
                  {abnormalBalanceAccounts.length > 0 && (
                    <Card className="p-4 bg-red-50 border-red-200">
                      <div className="text-center">
                        <p className="text-sm text-red-700">أرصدة غير طبيعية</p>
                        <p className="text-2xl font-bold text-red-800">{abnormalBalanceAccounts.length}</p>
                      </div>
                    </Card>
                  )}
                </div>

                {/* جدول الحسابات */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">رقم الحساب</TableHead>
                        <TableHead className="text-right">اسم الحساب</TableHead>
                        <TableHead className="text-center">نوع الحساب</TableHead>
                        <TableHead className="text-center">الطبيعة الأساسية</TableHead>
                        <TableHead className="text-center">طبيعة الرصيد النهائي</TableHead>
                        <TableHead className="text-center">الرصيد النهائي</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usedAccounts.map((account) => (
                        <TableRow key={account.accountCode} className={account.isNormalBalance ? "" : "bg-red-50"}>
                          <TableCell className="font-mono text-right">{account.accountCode}</TableCell>
                          <TableCell className="font-medium text-right">{account.accountName}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="text-xs">
                              {account.accountType}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={account.normalBalance === 'مدين' ? 'default' : 'secondary'} className="text-xs">
                              {account.normalBalance}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Badge 
                                variant={account.isNormalBalance ? 'default' : 'destructive'} 
                                className={`text-xs ${account.finalBalanceNature === 'مدين' ? 'bg-blue-600' : 'bg-red-600'}`}
                              >
                                {account.finalBalanceNature}
                              </Badge>
                              {!account.isNormalBalance && (
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`font-bold ${account.isNormalBalance ? 'text-green-600' : 'text-red-600'}`}>
                              {account.finalBalance.toLocaleString('ar-EG')} ر.س
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* الأرصدة النهائية */}
                <Card className="mt-6">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Receipt className="h-5 w-5 text-primary" />
                      الأرصدة النهائية
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {usedAccounts.map((account) => (
                        <Card key={account.accountCode} className={`p-4 transition-all hover:shadow-md ${!account.isNormalBalance ? 'border-destructive bg-destructive/5' : ''}`}>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-mono text-muted-foreground">{account.accountCode}</span>
                              {!account.isNormalBalance && (
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                              )}
                            </div>
                            <h4 className="font-medium text-sm leading-tight">{account.accountName}</h4>
                            <div className="flex items-center justify-between">
                              <Badge 
                                variant={account.normalBalance === 'مدين' ? 'default' : 'secondary'} 
                                className="text-xs"
                              >
                                {account.normalBalance}
                              </Badge>
                              <Badge 
                                variant={account.finalBalanceNature === 'مدين' ? 'default' : 'secondary'}
                                className={`text-xs ${account.finalBalanceNature === 'مدين' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
                              >
                                {account.finalBalanceNature}
                              </Badge>
                            </div>
                            <div className="text-center pt-2 border-t">
                              <span className={`text-lg font-bold ${account.isNormalBalance ? 'text-success' : 'text-destructive'}`}>
                                {account.finalBalance.toLocaleString('ar-EG')} ر.س
                              </span>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* تنبيه للأرصدة غير الطبيعية */}
                {abnormalBalanceAccounts.length > 0 && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-medium">تنبيه: يوجد {abnormalBalanceAccounts.length} حساب بأرصدة غير طبيعية</p>
                      <p className="text-sm mt-1">الأرصدة غير الطبيعية قد تشير إلى أخطاء في القيود أو حالات محاسبية خاصة تحتاج مراجعة.</p>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
          {/* ملخص التدقيق */}
          {sessionData.transactions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">إجمالي القيود</p>
                    <p className="text-2xl font-bold">{auditSummary.totalEntries}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <div>
                    <p className="text-sm text-muted-foreground">قيود صحيحة</p>
                    <p className="text-2xl font-bold text-success">{auditSummary.validEntries}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <div>
                    <p className="text-sm text-muted-foreground">تحذيرات</p>
                    <p className="text-2xl font-bold text-warning">{auditSummary.entriesWithWarnings}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">نقاط الجودة</p>
                    <p className="text-2xl font-bold">{auditSummary.overallScore}%</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* التحذيرات المهمة */}
          {auditSummary.criticalIssues.length > 0 && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">مشاكل حرجة تحتاج لمراجعة:</p>
                  {auditSummary.criticalIssues.map((issue, index) => (
                    <p key={index} className="text-sm">• {issue}</p>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="text-center py-8">
            <p className="text-muted-foreground text-lg mb-6">
              راجع وحلل القيود المحاسبية المدخلة في المرحلة السابقة
            </p>
            <p className="text-muted-foreground mb-8">
              تأكد من صحة القيود قبل الانتقال لمرحلة الترحيل
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Sheet open={showJournalEntries} onOpenChange={setShowJournalEntries}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    عرض القيود اليومية
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[90vw] sm:w-[600px] sm:max-w-[600px]">
                  <SheetHeader>
                    <SheetTitle>القيود اليومية</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4 max-h-[80vh] overflow-y-auto">
                    {sessionData.transactions && sessionData.transactions.length > 0 ? (
                      sessionData.transactions.map((entry, index) => (
                        <Card key={entry.entryId} className="p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <h4 className="font-semibold">قيد رقم {index + 1}</h4>
                              <span className="text-sm text-muted-foreground">{entry.date}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{entry.description}</p>
                            <div className="space-y-2">
                              {entry.lines.map((line, lineIndex) => (
                                <div key={lineIndex} className="flex justify-between items-center text-sm border-b pb-2">
                                  <span className="font-medium">{line.accountName}</span>
                                  <div className="flex gap-4">
                                    {line.debit > 0 && (
                                      <span className="text-success">مدين: {line.debit.toLocaleString()}</span>
                                    )}
                                    {line.credit > 0 && (
                                      <span className="text-destructive">دائن: {line.credit.toLocaleString()}</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">لا توجد قيود محاسبية مدخلة بعد</p>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>

              {sessionData.transactions.length > 0 && (
                <Sheet open={showAccountAnalysis} onOpenChange={setShowAccountAnalysis}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      تحليل الحسابات
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[95vw] sm:w-[900px] sm:max-w-[900px]">
                    <SheetHeader>
                      <SheetTitle>تحليل الحسابات</SheetTitle>
                      <SheetDescription>
                        عرض تجميعي لجميع الحسابات مع أرصدتها النهائية
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 max-h-[80vh] overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">اسم الحساب</TableHead>
                            <TableHead className="text-center text-blue-600">العمليات المدينة</TableHead>
                            <TableHead className="text-center text-blue-600">إجمالي المدين</TableHead>
                            <TableHead className="text-center text-red-600">العمليات الدائنة</TableHead>
                            <TableHead className="text-center text-red-600">إجمالي الدائن</TableHead>
                            <TableHead className="text-center text-green-600">الرصيد النهائي</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(generateAccountSummary).map(([accountCode, account]) => (
                            <TableRow key={accountCode}>
                              <TableCell className="font-medium text-right">
                                <div>
                                  <div className="font-semibold">{account.accountName}</div>
                                  <div className="text-sm text-muted-foreground">{accountCode}</div>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="text-blue-600">
                                  <div className="font-medium">{account.debitCount} عملية</div>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="text-blue-600 font-semibold">
                                  {account.totalDebits.toLocaleString('ar-EG')}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="text-red-600">
                                  <div className="font-medium">{account.creditCount} عملية</div>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="text-red-600 font-semibold">
                                  {account.totalCredits.toLocaleString('ar-EG')}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="text-green-600 font-bold text-lg">
                                  {account.finalBalance.toLocaleString('ar-EG')}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {Object.keys(generateAccountSummary).length > 0 && (
                            <TableRow className="border-t-2 border-primary/20 bg-muted/50">
                              <TableCell className="font-bold text-right">الإجمالي العام</TableCell>
                              <TableCell className="text-center">
                                <div className="text-blue-600 font-bold">
                                  {Object.values(generateAccountSummary).reduce((sum, acc) => sum + acc.debitCount, 0)} عملية
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="text-blue-600 font-bold text-lg">
                                  {Object.values(generateAccountSummary).reduce((sum, acc) => sum + acc.totalDebits, 0).toLocaleString('ar-EG')}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="text-red-600 font-bold">
                                  {Object.values(generateAccountSummary).reduce((sum, acc) => sum + acc.creditCount, 0)} عملية
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="text-red-600 font-bold text-lg">
                                  {Object.values(generateAccountSummary).reduce((sum, acc) => sum + acc.totalCredits, 0).toLocaleString('ar-EG')}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="text-green-600 font-bold text-xl">
                                  {Object.values(generateAccountSummary).reduce((sum, acc) => sum + acc.finalBalance, 0).toLocaleString('ar-EG')}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                      {Object.keys(generateAccountSummary).length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">لا توجد بيانات للعرض</p>
                        </div>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              )}

              {sessionData.transactions.length > 0 && (
                <Sheet open={showAuditResults} onOpenChange={setShowAuditResults}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      تقرير التدقيق التفصيلي
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[95vw] sm:w-[800px] sm:max-w-[800px]">
                    <SheetHeader>
                      <SheetTitle>تقرير التدقيق التفصيلي</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 max-h-[80vh] overflow-y-auto">
                      <Tabs defaultValue="summary" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="summary">الملخص</TabsTrigger>
                          <TabsTrigger value="details">التفاصيل</TabsTrigger>
                          <TabsTrigger value="impacts">تأثير الأرصدة</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="summary" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <Card className="p-4">
                              <h4 className="font-semibold mb-2">إحصائيات التدقيق</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>إجمالي القيود:</span>
                                  <span className="font-medium">{auditSummary.totalEntries}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>قيود صحيحة:</span>
                                  <span className="font-medium text-success">{auditSummary.validEntries}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>قيود بتحذيرات:</span>
                                  <span className="font-medium text-warning">{auditSummary.entriesWithWarnings}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>قيود بأخطاء:</span>
                                  <span className="font-medium text-destructive">{auditSummary.entriesWithErrors}</span>
                                </div>
                              </div>
                            </Card>
                            
                            <Card className="p-4">
                              <h4 className="font-semibold mb-2">نقاط الجودة الإجمالية</h4>
                              <div className="text-center">
                                <div className="text-3xl font-bold text-primary mb-2">
                                  {auditSummary.overallScore}%
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${auditSummary.overallScore}%` }}
                                  />
                                </div>
                              </div>
                            </Card>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="details" className="space-y-4">
                          {auditResults.map((result, index) => (
                            <Card key={result.entryId} className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold">قيد رقم {result.entryNumber}</h4>
                                    <Badge variant={getAuditStatusColor(result) as any} className="flex items-center gap-1">
                                      {getAuditStatusIcon(result)}
                                      {result.isValid ? 'صحيح' : 'يحتاج مراجعة'}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{result.description}</p>
                                </div>
                                <span className="text-sm text-muted-foreground">{result.date}</span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                                <div>
                                  <span className="text-muted-foreground">إجمالي المدين: </span>
                                  <span className="font-medium text-success">{result.totalDebit.toLocaleString()}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">إجمالي الدائن: </span>
                                  <span className="font-medium text-destructive">{result.totalCredit.toLocaleString()}</span>
                                </div>
                              </div>

                              {result.errors.length > 0 && (
                                <div className="mb-3">
                                  <h5 className="font-medium text-destructive mb-2">أخطاء:</h5>
                                  {result.errors.map((error, errorIndex) => (
                                    <Alert key={errorIndex} variant="destructive" className="mb-2">
                                      <AlertDescription className="text-sm">
                                        <p className="font-medium">{error.message}</p>
                                        <p className="mt-1">الحل المقترح: {error.correction}</p>
                                      </AlertDescription>
                                    </Alert>
                                  ))}
                                </div>
                              )}

                              {result.warnings.length > 0 && (
                                <div className="mb-3">
                                  <h5 className="font-medium text-warning mb-2">تحذيرات:</h5>
                                  {result.warnings.map((warning, warningIndex) => (
                                    <Alert key={warningIndex} className="mb-2">
                                      <AlertTriangle className="h-4 w-4" />
                                      <AlertDescription className="text-sm">
                                        <p className="font-medium">{warning.message}</p>
                                        <p className="mt-1">اقتراح: {warning.suggestion}</p>
                                      </AlertDescription>
                                    </Alert>
                                  ))}
                                </div>
                              )}
                            </Card>
                          ))}
                        </TabsContent>
                        
                        <TabsContent value="impacts" className="space-y-4">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>الحساب</TableHead>
                                <TableHead>الرصيد السابق</TableHead>
                                <TableHead>العملية</TableHead>
                                <TableHead>الرصيد الجديد</TableHead>
                                <TableHead>الحالة</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {auditResults.flatMap(result => 
                                result.accountImpacts.map((impact, index) => (
                                  <TableRow key={`${result.entryId}-${index}`}>
                                    <TableCell className="font-medium">{impact.accountName}</TableCell>
                                    <TableCell>{impact.previousBalance.toLocaleString()}</TableCell>
                                    <TableCell>
                                      <Badge variant={impact.entrySide === 'Debit' ? 'default' : 'secondary'}>
                                        {impact.entrySide === 'Debit' ? 'مدين' : 'دائن'}: {impact.entryAmount.toLocaleString()}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className={impact.changeType === 'increase' ? 'text-success' : 'text-destructive'}>
                                      {impact.newBalance.toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                      {impact.isLogical ? (
                                        <Badge variant="default" className="bg-success text-success-foreground">
                                          <CheckCircle className="h-3 w-3 mr-1" />
                                          منطقي
                                        </Badge>
                                      ) : (
                                        <Badge variant="destructive">
                                          <XCircle className="h-3 w-3 mr-1" />
                                          غير منطقي
                                        </Badge>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </SheetContent>
                </Sheet>
              )}

              <Button 
                onClick={handleComplete}
                className="px-8 py-2"
                disabled={auditSummary.entriesWithErrors > 0}
              >
                الانتقال للمرحلة التالية
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}