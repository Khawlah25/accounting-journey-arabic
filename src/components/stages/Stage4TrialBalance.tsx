import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Scale, BookOpen, Settings, RefreshCw, BarChart3, GripVertical, Download, Plus, Trash2, Search, Building2, Coins, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { getChartOfAccounts } from '@/utils/dataGenerator';
import { SessionData } from '@/types/accounting';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Stage4Props {
  sessionData: SessionData;
  onStageComplete: () => void;
  onUpdateSessionData: (data: SessionData) => void;
}

interface TrialBalanceEntry {
  id: string;
  accountCode: string;
  accountName: string;
  debitBalance: number;
  creditBalance: number;
  isFromReference?: boolean;
}

interface LedgerSummary {
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  debitTotal: number;
  creditTotal: number;
  finalBalance: number;
  balanceType: 'debit' | 'credit';
}

const Stage4TrialBalance: React.FC<Stage4Props> = ({
  sessionData,
  onStageComplete,
  onUpdateSessionData
}) => {
  const { toast } = useToast();
  const isAdminMode = sessionData.userAnswers?.simulationMode === 'admin';
  const [trialBalanceEntries, setTrialBalanceEntries] = useState<TrialBalanceEntry[]>([]);
  const [draggedAccount, setDraggedAccount] = useState<any>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);
  const [selectedNewAccount, setSelectedNewAccount] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // إعداد قائمة أسماء الحسابات مع البحث
  const accounts = getChartOfAccounts();

  const groupedAccounts = useMemo(() => {
    const filtered = accounts.filter(account =>
      account.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return {
      assets: filtered.filter(acc => acc.type === 'Asset'),
      liabilities: filtered.filter(acc => acc.type === 'Liability'),
      equity: filtered.filter(acc => acc.type === 'Equity'),
      revenue: filtered.filter(acc => acc.type === 'Revenue'),
      expenses: filtered.filter(acc => acc.type === 'Expense'),
    };
  }, [accounts, searchQuery]);

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

  // تحميل بيانات دليل الحسابات وإنشاء إدخالات ميزان المراجعة
  useEffect(() => {
    // استخدام الأرصدة النهائية من المرحلة الثالثة كمصدر أساسي
    if (sessionData.stage3AccountSummary && Object.keys(sessionData.stage3AccountSummary).length > 0) {
      const entriesFromReference = Object.values(sessionData.stage3AccountSummary).map((account) => {
        const existingEntry = sessionData.userAnswers?.stage4_trial_balance?.find(
          (entry: any) => entry.accountCode === account.accountCode
        );

        // استخدام البيانات المحفوظة أو القيم من المرجع
        let debitBalance = 0;
        let creditBalance = 0;

        if (existingEntry) {
          debitBalance = existingEntry.debitBalance;
          creditBalance = existingEntry.creditBalance;
        }

        return {
          id: `account-${account.accountCode}`,
          accountCode: account.accountCode,
          accountName: account.accountName,
          debitBalance,
          creditBalance,
          isFromReference: true
        };
      });

      // إضافة الحسابات المضافة يدوياً (التي ليست في المرجع)
      const manuallyAddedEntries = sessionData.userAnswers?.stage4_trial_balance?.filter(
        (entry: any) => !sessionData.stage3AccountSummary?.hasOwnProperty(entry.accountCode)
      ).map((entry: any) => ({
        id: `account-${entry.accountCode}`,
        accountCode: entry.accountCode,
        accountName: entry.accountName,
        debitBalance: entry.debitBalance,
        creditBalance: entry.creditBalance,
        isFromReference: false
      })) || [];

      setTrialBalanceEntries([...entriesFromReference, ...manuallyAddedEntries]);
    } else {
      // إذا لم تكن الأرصدة النهائية متاحة، استخدم الطريقة القديمة
      const chartOfAccounts = getChartOfAccounts();
      
      const usedAccounts = new Set(
        sessionData.transactions.flatMap(t => 
          t.lines.map(line => line.accountCode)
        )
      );

      const allEntries = chartOfAccounts
        .filter(account => usedAccounts.has(account.code))
        .map((account) => {
          const existingEntry = sessionData.userAnswers?.stage4_trial_balance?.find(
            (entry: any) => entry.accountCode === account.code
          );

          let debitBalance = 0;
          let creditBalance = 0;

          if (existingEntry) {
            debitBalance = existingEntry.debitBalance;
            creditBalance = existingEntry.creditBalance;
          }

          return {
            id: `account-${account.code}`,
            accountCode: account.code,
            accountName: account.name,
            debitBalance,
            creditBalance,
            isFromReference: false
          };
        });

      setTrialBalanceEntries(allEntries);
    }
  }, [sessionData]);

  // حساب ملخص دفتر الأستاذ من البيانات الموجودة
  const getLedgerSummary = (): LedgerSummary[] => {
    // استخدام البيانات المحفوظة من المرحلة الثالثة أولاً
    if (sessionData.ledgerData && Object.keys(sessionData.ledgerData).length > 0) {
      return Object.values(sessionData.ledgerData).map(savedAccount => ({
        code: savedAccount.code,
        name: savedAccount.name,
        type: savedAccount.type,
        debitTotal: savedAccount.entries
          .filter(e => e.side === 'debit')
          .reduce((sum, e) => sum + e.amount, 0),
        creditTotal: savedAccount.entries
          .filter(e => e.side === 'credit')
          .reduce((sum, e) => sum + e.amount, 0),
        finalBalance: savedAccount.finalBalance,
        balanceType: savedAccount.finalBalanceSide
      }));
    }

    // إذا لم توجد بيانات محفوظة، استخدم البيانات من المعاملات (الطريقة القديمة)
    const accountsMap = new Map<string, LedgerSummary>();

    sessionData.transactions.forEach((transaction) => {
      transaction.lines.forEach((line) => {
        if (!accountsMap.has(line.accountCode)) {
          accountsMap.set(line.accountCode, {
            code: line.accountCode,
            name: line.accountName,
            type: getAccountType(line.accountCode),
            debitTotal: 0,
            creditTotal: 0,
            finalBalance: 0,
            balanceType: 'debit'
          });
        }

        const account = accountsMap.get(line.accountCode)!;
        account.debitTotal += line.debit;
        account.creditTotal += line.credit;
      });
    });

    // حساب الرصيد النهائي ونوعه (الإجمالي الأكبر كما هو مطلوب)
    accountsMap.forEach((account) => {
      const finalBalance = Math.max(account.debitTotal, account.creditTotal);
      account.finalBalance = finalBalance;
      account.balanceType = account.debitTotal >= account.creditTotal ? 'debit' : 'credit';
    });

    return Array.from(accountsMap.values());
  };

  const getAccountType = (accountCode: string): 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense' => {
    const code = accountCode.substring(0, 2);
    switch (code) {
      case '11': return 'Asset';
      case '21': return 'Liability';
      case '31': return 'Equity';
      case '41': return 'Revenue';
      case '51': return 'Expense';
      default: return 'Asset';
    }
  };

  // دالة لتحديث البيانات من دفتر الأستاذ
  const updateFromLedger = () => {
    setTrialBalanceEntries(prev => 
      prev.map(entry => {
        if (sessionData.ledgerData && sessionData.ledgerData[entry.accountCode]) {
          const savedAccount = sessionData.ledgerData[entry.accountCode];
          return {
            ...entry,
            debitBalance: savedAccount.finalBalanceSide === 'debit' ? savedAccount.finalBalance : 0,
            creditBalance: savedAccount.finalBalanceSide === 'credit' ? savedAccount.finalBalance : 0
          };
        }
        return entry;
      })
    );
  };

  const updateEntry = (entryId: string, field: 'debitBalance' | 'creditBalance', value: string) => {
    const numValue = parseFloat(value) || 0;
    setTrialBalanceEntries(prev => prev.map(entry => {
      if (entry.id === entryId) {
        return {
          ...entry,
          [field]: numValue,
          // إذا تم تحديث أحد الجانبين، يجب إفراغ الآخر
          [field === 'debitBalance' ? 'creditBalance' : 'debitBalance']: numValue > 0 ? 0 : entry[field === 'debitBalance' ? 'creditBalance' : 'debitBalance']
        };
      }
      return entry;
    }));
  };

  const getTotals = () => {
    const totalDebit = trialBalanceEntries.reduce((sum, entry) => sum + entry.debitBalance, 0);
    const totalCredit = trialBalanceEntries.reduce((sum, entry) => sum + entry.creditBalance, 0);
    return { totalDebit, totalCredit };
  };

  const { totalDebit, totalCredit } = getTotals();
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  // حساب أرصدة الحسابات النهائية من القيود كمرجع
  const calculateFinalAccountBalances = () => {
    const accountSummary = new Map();
    const chartOfAccounts = getChartOfAccounts();
    
    // استخراج جميع الحسابات الفريدة وتجميع البيانات
    sessionData.transactions.forEach((transaction) => {
      transaction.lines.forEach((line) => {
        const accountCode = line.accountCode;
        const accountName = line.accountName;
        
        // البحث عن نوع الحساب من دليل الحسابات
        const accountInfo = chartOfAccounts.find(acc => acc.code === accountCode);
        const accountType = accountInfo?.type || 'Asset';
        
        if (!accountSummary.has(accountCode)) {
          accountSummary.set(accountCode, {
            code: accountCode,
            name: accountName,
            type: accountType,
            debitCount: 0,
            creditCount: 0,
            debitTotal: 0,
            creditTotal: 0
          });
        }
        
        const account = accountSummary.get(accountCode);
        
        if (line.debit > 0) {
          account.debitCount++;
          account.debitTotal += line.debit;
        }
        
        if (line.credit > 0) {
          account.creditCount++;
          account.creditTotal += line.credit;
        }
      });
    });
    
    // حساب الأرصدة النهائية وترتيب النتائج هجائياً
    return Array.from(accountSummary.values())
      .map(account => {
        let finalBalance: number;
        let balanceSide: 'debit' | 'credit';
        let accountNature: 'debit' | 'credit';
        
        // تحديد طبيعة الحساب المحاسبية
        if (account.type === 'Asset' || account.type === 'Expense') {
          accountNature = 'debit';
          finalBalance = account.debitTotal - account.creditTotal;
          balanceSide = finalBalance >= 0 ? 'debit' : 'credit';
        } else {
          accountNature = 'credit';
          finalBalance = account.creditTotal - account.debitTotal;
          balanceSide = finalBalance >= 0 ? 'credit' : 'debit';
        }
        
        return {
          ...account,
          accountNature,
          finalBalance: Math.abs(finalBalance),
          balanceSide
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  };

  // دوال السحب والإفلات
  const handleDragStart = (e: React.DragEvent, account: any) => {
    setDraggedAccount(account);
    e.dataTransfer.setData('text/plain', JSON.stringify(account));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = () => {
    setDraggedAccount(null);
    setDragOverTarget(null);
  };

  const handleDragOver = (e: React.DragEvent, targetType: 'debit' | 'credit', accountCode: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOverTarget(`${targetType}-${accountCode}`);
  };

  const handleDragLeave = () => {
    setDragOverTarget(null);
  };

  const handleDrop = (e: React.DragEvent, targetType: 'debit' | 'credit', accountCode: string) => {
    e.preventDefault();
    setDragOverTarget(null);
    
    try {
      const accountData = JSON.parse(e.dataTransfer.getData('text/plain'));
      
      // البحث عن الحساب في ميزان المراجعة
      const targetEntry = trialBalanceEntries.find(entry => entry.accountCode === accountCode);
      if (!targetEntry) {
        toast({
          title: "خطأ في الإفلات",
          description: "لم يتم العثور على الحساب في ميزان المراجعة",
          variant: "destructive"
        });
        return;
      }

      // تحديد المبلغ والجهة المناسبة
      const amount = accountData.finalBalance;
      const shouldUseDebit = targetType === 'debit';
      const shouldUseCredit = targetType === 'credit';

      // التحقق من أن الجهة المناسبة للحساب
      const isCorrectSide = (targetType === 'debit' && accountData.balanceSide === 'debit') ||
                           (targetType === 'credit' && accountData.balanceSide === 'credit');

      if (!isCorrectSide) {
        toast({
          title: "تحذير",
          description: `هذا الحساب له رصيد ${accountData.balanceSide === 'debit' ? 'مدين' : 'دائن'} بقيمة ${amount.toLocaleString()}. هل تريد المتابعة؟`,
          variant: "destructive"
        });
      }

      // تطبيق التحديث
      setTrialBalanceEntries(prev => prev.map(entry => {
        if (entry.accountCode === accountCode) {
          return {
            ...entry,
            debitBalance: shouldUseDebit ? amount : 0,
            creditBalance: shouldUseCredit ? amount : 0
          };
        }
        return entry;
      }));

      toast({
        title: "تم الإفلات بنجاح",
        description: `تم إضافة ${amount.toLocaleString()} إلى ${targetType === 'debit' ? 'المدين' : 'الدائن'} للحساب: ${targetEntry.accountName}`,
      });

    } catch (error) {
      toast({
        title: "خطأ في الإفلات",
        description: "حدث خطأ أثناء معالجة البيانات",
        variant: "destructive"
      });
    }
  };

  // ملء تلقائي من الأرصدة النهائية (مرحلة تحليل القيود)
  const fillFromFinalBalances = () => {
    // التحقق من وجود الأرصدة النهائية من مرحلة تحليل القيود
    if (!sessionData.stage3AccountSummary || Object.keys(sessionData.stage3AccountSummary).length === 0) {
      toast({
        title: "لا توجد بيانات أرصدة نهائية",
        description: "يرجى العودة إلى مرحلة تحليل القيود وإكمالها أولاً للحصول على الأرصدة النهائية",
        variant: "destructive"
      });
      return;
    }

    const finalBalances = Object.values(sessionData.stage3AccountSummary);
    const activeAccounts = finalBalances.filter(account => account.finalBalance > 0);
    
    setTrialBalanceEntries(prev => prev.map(entry => {
      const finalBalanceAccount = finalBalances.find(account => account.accountCode === entry.accountCode);
      if (finalBalanceAccount && finalBalanceAccount.finalBalance > 0) {
        return {
          ...entry,
          debitBalance: finalBalanceAccount.balanceSide === 'debit' ? finalBalanceAccount.finalBalance : 0,
          creditBalance: finalBalanceAccount.balanceSide === 'credit' ? finalBalanceAccount.finalBalance : 0
        };
      }
      return {
        ...entry,
        debitBalance: 0,
        creditBalance: 0
      };
    }));

    toast({
      title: "تم الملء من الأرصدة النهائية",
      description: `تم تحديث ${activeAccounts.length} حساب من الأرصدة النهائية - مرحلة تحليل القيود`,
    });
  };

  // إضافة حساب جديد
  const addNewAccount = () => {
    if (!selectedNewAccount) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار حساب لإضافته",
        variant: "destructive"
      });
      return;
    }

    // التحقق من أن الحساب غير موجود بالفعل
    const accountExists = trialBalanceEntries.some(entry => entry.accountCode === selectedNewAccount);
    if (accountExists) {
      toast({
        title: "خطأ",
        description: "هذا الحساب موجود بالفعل في ميزان المراجعة",
        variant: "destructive"
      });
      return;
    }

    const chartOfAccounts = getChartOfAccounts();
    const accountInfo = chartOfAccounts.find(acc => acc.code === selectedNewAccount);
    
    if (!accountInfo) {
      toast({
        title: "خطأ",
        description: "لم يتم العثور على معلومات الحساب",
        variant: "destructive"
      });
      return;
    }

    const newEntry: TrialBalanceEntry = {
      id: `account-${accountInfo.code}`,
      accountCode: accountInfo.code,
      accountName: accountInfo.name,
      debitBalance: 0,
      creditBalance: 0,
      isFromReference: false
    };

    setTrialBalanceEntries(prev => [...prev, newEntry]);
    setSelectedNewAccount('');
    
    toast({
      title: "تم إضافة الحساب",
      description: `تم إضافة حساب: ${accountInfo.name}`,
    });
  };

  // حذف حساب
  const deleteAccount = (accountCode: string) => {
    const entry = trialBalanceEntries.find(e => e.accountCode === accountCode);
    
    if (!entry) return;

    // منع حذف الحسابات من المرجع
    if (entry.isFromReference) {
      toast({
        title: "لا يمكن الحذف",
        description: "لا يمكن حذف الحسابات الموجودة في الأرصدة النهائية",
        variant: "destructive"
      });
      return;
    }

    // منع حذف الحسابات التي لها أرصدة
    if (entry.debitBalance > 0 || entry.creditBalance > 0) {
      toast({
        title: "لا يمكن الحذف",
        description: "لا يمكن حذف حساب له رصيد. قم بإفراغ الرصيد أولاً",
        variant: "destructive"
      });
      return;
    }

    setTrialBalanceEntries(prev => prev.filter(e => e.accountCode !== accountCode));
    
    toast({
      title: "تم حذف الحساب",
      description: `تم حذف حساب: ${entry.accountName}`,
    });
  };

  // الحصول على الحسابات المتاحة للإضافة
  const getAvailableAccounts = () => {
    const chartOfAccounts = getChartOfAccounts();
    const usedAccountCodes = new Set(trialBalanceEntries.map(entry => entry.accountCode));
    
    return chartOfAccounts.filter(account => !usedAccountCodes.has(account.code));
  };

  const copyFinalBalances = async () => {
    try {
      const balances = calculateFinalAccountBalances();
      const totalDebitSum = balances.reduce((sum, acc) => sum + acc.debitTotal, 0);
      const totalCreditSum = balances.reduce((sum, acc) => sum + acc.creditTotal, 0);
      
      let report = `أرصدة الحسابات النهائية - مرجع ميزان المراجعة\n`;
      report += `تحليل شامل لجميع الحسابات من ${sessionData.transactions.length} قيد محاسبي\n`;
      report += `================================================================\n\n`;
      
      balances.forEach((account, index) => {
        report += `${index + 1}. ${account.name} (${account.code})\n`;
        report += `   الطبيعة المحاسبية: ${account.accountNature === 'debit' ? 'مدين' : 'دائن'}\n`;
        report += `   عدد مرات الظهور كمدين: ${account.debitCount}\n`;
        report += `   عدد مرات الظهور كدائن: ${account.creditCount}\n`;
        report += `   إجمالي المدين: ${account.debitTotal.toLocaleString()}\n`;
        report += `   إجمالي الدائن: ${account.creditTotal.toLocaleString()}\n`;
        report += `   الرصيد النهائي: ${account.finalBalance.toLocaleString()}\n`;
        report += `   جهة الرصيد: ${account.balanceSide === 'debit' ? 'مدين' : 'دائن'}\n`;
        report += `----------------------------------------------------------------\n`;
      });
      
      report += `\nالإجماليات العامة:\n`;
      report += `إجمالي جميع المبالغ المدينة: ${totalDebitSum.toLocaleString()}\n`;
      report += `إجمالي جميع المبالغ الدائنة: ${totalCreditSum.toLocaleString()}\n`;
      report += `الفرق: ${Math.abs(totalDebitSum - totalCreditSum).toLocaleString()}\n`;
      report += `التوازن: ${totalDebitSum === totalCreditSum ? 'متوازن ✓' : 'غير متوازن ✗'}\n`;
      
      await navigator.clipboard.writeText(report);
      
      toast({
        title: "تم النسخ بنجاح",
        description: `تم نسخ تقرير أرصدة الحسابات (${balances.length} حساب) إلى الحافظة`,
      });
    } catch (error) {
      toast({
        title: "خطأ في النسخ",
        description: "حدث خطأ أثناء نسخ التقرير",
        variant: "destructive"
      });
    }
  };

  // مكون قائمة الحسابات
  const AccountGroup = ({ title, accounts, type }: { title: string; accounts: any[]; type: string }) => {
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
              {account.name}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex gap-4">
      {/* قائمة أسماء الحسابات (يسار) */}
      <div className="w-80">
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
      </div>

      {/* الجدول الرئيسي (وسط) */}
      <div className="flex-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-6 w-6" />
              ميزان المراجعة
            </CardTitle>
            <CardDescription>
              تم تحميل جميع الحسابات من الدليل المحاسبي تلقائياً
            </CardDescription>
            
            {/* إضافة حساب جديد */}
            <div className="mt-4 flex gap-2 items-end">
              <div className="flex-1">
                <Label htmlFor="newAccount" className="text-sm">إضافة حساب جديد</Label>
                <Select value={selectedNewAccount} onValueChange={setSelectedNewAccount}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="اختر حساب لإضافته..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableAccounts().map((account) => (
                      <SelectItem key={account.code} value={account.code}>
                        {account.name} ({account.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={addNewAccount}
                variant="outline" 
                className="gap-2"
                disabled={!selectedNewAccount}
              >
                <Plus className="h-4 w-4" />
                إضافة
              </Button>
            </div>

            {/* أزرار المرجع والملء التلقائي */}
            {isAdminMode && (
              <div className="mt-4 flex gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <BarChart3 className="h-4 w-4" />
                      أرصدة الحسابات النهائية (مرجع)
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[900px] sm:w-[1000px]">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        أرصدة الحسابات النهائية - مرجع ميزان المراجعة
                      </SheetTitle>
                      <SheetDescription>
                        مرجع أساسي لإعداد ميزان المراجعة من تحليل {sessionData.transactions.length} قيد محاسبي
                      </SheetDescription>
                    </SheetHeader>
                    
                    <div className="mt-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          {sessionData.stage3AccountSummary && Object.keys(sessionData.stage3AccountSummary).length > 0 
                            ? `الأرصدة النهائية من مرحلة تحليل القيود: ${Object.values(sessionData.stage3AccountSummary).filter(a => a.finalBalance > 0).length} حساب` 
                            : `حساب مباشر من القيود: ${calculateFinalAccountBalances().length} حساب`}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={copyFinalBalances}
                            className="gap-2"
                          >
                            <BookOpen className="h-4 w-4" />
                            نسخ التقرير
                          </Button>
                        </div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">كيفية استخدام السحب والإفلات:</h4>
                        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                          <li>• اسحب أي حساب من الجدول أدناه إلى خانة المدين أو الدائن في ميزان المراجعة</li>
                          <li>• سيتم ملء المبلغ تلقائياً حسب جهة الرصيد الصحيحة</li>
                          <li>• إذا سحبت إلى الجهة الخاطئة، ستظهر رسالة تحذير</li>
                        </ul>
                      </div>

                      <div className="max-h-[calc(100vh-180px)] overflow-y-auto">
                        <div className="overflow-x-auto">
                          <table className="w-full border border-border rounded-lg">
                            <thead>
                              <tr className="bg-muted/50 border-b">
                                <th className="text-right p-3 border-r border-border font-medium">#</th>
                                <th className="text-right p-3 border-r border-border font-medium">اسم الحساب</th>
                                <th className="text-right p-3 border-r border-border font-medium">طبيعة الحساب</th>
                                <th className="text-right p-3 border-r border-border font-medium">عدد المدين</th>
                                <th className="text-right p-3 border-r border-border font-medium">عدد الدائن</th>
                                <th className="text-right p-3 border-r border-border font-medium">إجمالي المدين</th>
                                <th className="text-right p-3 border-r border-border font-medium">إجمالي الدائن</th>
                                <th className="text-right p-3 border-r border-border font-medium">الرصيد النهائي</th>
                                <th className="text-right p-3 font-medium">جهة الرصيد</th>
                              </tr>
                            </thead>
                            <tbody>
                              {calculateFinalAccountBalances().map((account, index) => (
                                <tr 
                                  key={account.accountName}
                                  className="border-b hover:bg-muted/50 transition-colors cursor-grab active:cursor-grabbing"
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, account)}
                                  onDragEnd={handleDragEnd}
                                >
                                  <td className="p-3 border-r border-border/30 text-sm text-center font-medium">{index + 1}</td>
                                  <td className="p-3 border-r border-border/30 text-sm font-medium text-primary">
                                    {account.accountName}
                                  </td>
                                  <td className="p-3 border-r border-border/30 text-sm text-center">
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                      account.accountNature === 'debit' 
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
                                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                    }`}>
                                      {account.accountNature === 'debit' ? 'مدين' : 'دائن'}
                                    </span>
                                  </td>
                                  <td className="p-3 border-r border-border/30 text-sm text-center">{account.debitCount}</td>
                                  <td className="p-3 border-r border-border/30 text-sm text-center">{account.creditCount}</td>
                                  <td className="p-3 border-r border-border/30 text-sm font-mono text-blue-600 dark:text-blue-400">
                                    {account.debitTotal.toLocaleString()}
                                  </td>
                                  <td className="p-3 border-r border-border/30 text-sm font-mono text-green-600 dark:text-green-400">
                                    {account.creditTotal.toLocaleString()}
                                  </td>
                                  <td className="p-3 border-r border-border/30 text-sm font-mono font-bold">
                                    {account.finalBalance.toLocaleString()}
                                  </td>
                                  <td className="p-3 text-sm">
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                      account.balanceSide === 'debit' 
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
                                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                    }`}>
                                      {account.balanceSide === 'debit' ? 'مدين' : 'دائن'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="bg-muted/80 border-t-2 border-primary/20">
                              <tr>
                                <td colSpan={6} className="p-3 text-right font-bold border-r border-border">الإجماليات:</td>
                                <td className="p-3 border-r border-border font-bold text-blue-600 dark:text-blue-400 font-mono">
                                  {calculateFinalAccountBalances().reduce((sum, acc) => sum + acc.debitTotal, 0).toLocaleString()}
                                </td>
                                <td className="p-3 border-r border-border font-bold text-green-600 dark:text-green-400 font-mono">
                                  {calculateFinalAccountBalances().reduce((sum, acc) => sum + acc.creditTotal, 0).toLocaleString()}
                                </td>
                                <td colSpan={2} className="p-3 text-center">
                                  {(() => {
                                    const totalDebitSum = calculateFinalAccountBalances().reduce((sum, acc) => sum + acc.debitTotal, 0);
                                    const totalCreditSum = calculateFinalAccountBalances().reduce((sum, acc) => sum + acc.creditTotal, 0);
                                    const isBalanced = totalDebitSum === totalCreditSum;
                                    return (
                                      <span className={`inline-block px-3 py-1 rounded font-medium text-sm ${
                                        isBalanced 
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                      }`}>
                                        {isBalanced ? 'متوازن ✓' : `غير متوازن (فرق: ${Math.abs(totalDebitSum - totalCreditSum).toLocaleString()})`}
                                      </span>
                                    );
                                  })()}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
                
                {/* Auto-fill Button with Reference Indicator */}
                <div className="flex items-center gap-2">
                  <Button 
                    variant="default" 
                    onClick={fillFromFinalBalances}
                    className="gap-2"
                    disabled={!sessionData.stage3AccountSummary || Object.keys(sessionData.stage3AccountSummary).length === 0}
                  >
                    <RefreshCw className="h-4 w-4" />
                    الملء التلقائي من دفتر الأستاذ
                  </Button>
                  {sessionData.stage3AccountSummary && Object.keys(sessionData.stage3AccountSummary).length > 0 && (
                    <span className="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                      متصل بالمرحلة السابقة ({Object.values(sessionData.stage3AccountSummary).filter(a => a.finalBalance > 0).length} حساب)
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {/* معلومات الإجماليات في الأعلى */}
            <div className="mb-6 p-4 bg-muted/30 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{getTotals().totalDebit.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">إجمالي المدين</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{getTotals().totalCredit.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">إجمالي الدائن</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                    {isBalanced ? '✓ متوازن' : '✗ غير متوازن'}
                  </div>
                  <div className="text-sm text-muted-foreground">حالة الميزان</div>
                </div>
              </div>
            </div>

            {/* جدول ميزان المراجعة - 3 أعمدة فقط */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-muted p-4">
                <h3 className="font-bold text-lg text-center">ميزان المراجعة</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                   <thead>
                     <tr className="border-b border-border bg-muted/30">
                       <th className="text-right p-4 font-medium w-2/5">اسم الحساب</th>
                       <th className="text-right p-4 font-medium w-1/5">المدين</th>
                       <th className="text-right p-4 font-medium w-1/5">الدائن</th>
                     </tr>
                   </thead>
                  <tbody>
                     {trialBalanceEntries.map((entry) => (
                       <tr key={entry.id} className="border-b border-border/30 hover:bg-muted/20">
                         <td className="p-4">
                           <div className="flex items-center justify-between">
                             <div>
                               <div className="font-medium flex items-center gap-2">
                                 {entry.accountName}
                                 {entry.isFromReference && (
                                   <span className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded">
                                     من المرجع
                                   </span>
                                 )}
                               </div>
                               <div className="text-xs text-muted-foreground">{entry.accountCode}</div>
                             </div>
                             {!entry.isFromReference && entry.debitBalance === 0 && entry.creditBalance === 0 && (
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => deleteAccount(entry.accountCode)}
                                 className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                               >
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                             )}
                           </div>
                         </td>
                        <td 
                          className={`p-4 transition-colors ${
                            dragOverTarget === `debit-${entry.accountCode}` 
                              ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-600 rounded-lg' 
                              : ''
                          }`}
                          onDragOver={(e) => handleDragOver(e, 'debit', entry.accountCode)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, 'debit', entry.accountCode)}
                        >
                          <Input
                            type="number"
                            value={entry.debitBalance || ''}
                            onChange={(e) => updateEntry(entry.id, 'debitBalance', e.target.value)}
                            className="text-right"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                          />
                        </td>
                        <td 
                          className={`p-4 transition-colors ${
                            dragOverTarget === `credit-${entry.accountCode}` 
                              ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-600 rounded-lg' 
                              : ''
                          }`}
                          onDragOver={(e) => handleDragOver(e, 'credit', entry.accountCode)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, 'credit', entry.accountCode)}
                        >
                          <Input
                            type="number"
                            value={entry.creditBalance || ''}
                            onChange={(e) => updateEntry(entry.id, 'creditBalance', e.target.value)}
                            className="text-right"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  
                  {/* صف الإجماليات */}
                  <tfoot>
                    <tr className="border-t-2 border-border bg-muted/30">
                      <td className="p-4 font-bold text-right">الإجمالي:</td>
                      <td className="p-4 font-bold text-lg text-right">{getTotals().totalDebit.toLocaleString()}</td>
                      <td className="p-4 font-bold text-lg text-right">{getTotals().totalCredit.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* زر إكمال المرحلة */}
            <div className="mt-6 text-center">
              <Button 
                onClick={() => {
                  // حفظ البيانات قبل إكمال المرحلة
                  const updatedSessionData = {
                    ...sessionData,
                    userAnswers: {
                      ...sessionData.userAnswers,
                      stage4_trial_balance: trialBalanceEntries.map(entry => ({
                        accountCode: entry.accountCode,
                        accountName: entry.accountName,
                        debitBalance: entry.debitBalance,
                        creditBalance: entry.creditBalance
                      }))
                    }
                  };
                  onUpdateSessionData(updatedSessionData);
                  onStageComplete();
                }} 
                disabled={!isBalanced}
                size="lg"
                className="gap-2"
              >
                <Scale className="h-5 w-5" />
                {isBalanced ? 'إكمال المرحلة' : 'يجب موازنة الجدول أولاً'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* الشريط الجانبي للإجراءات (يمين) */}
      {isAdminMode && (
        <div className="w-80">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full gap-2">
                <Settings className="h-4 w-4" />
                إجراءات وأدوات
              </Button>
            </SheetTrigger>
          <SheetContent side="left" className="w-96">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                أدوات ميزان المراجعة
              </SheetTitle>
              <SheetDescription>
                استخدم هذه الأدوات لإدارة ميزان المراجعة
              </SheetDescription>
            </SheetHeader>
            
            <div className="mt-6 space-y-6">
              {/* تحديث من دفتر الأستاذ */}
              <div className="space-y-3">
                <h4 className="font-medium">تحديث الأرصدة</h4>
                <Button 
                  onClick={updateFromLedger}
                  variant="outline" 
                  className="w-full gap-2"
                  disabled={!sessionData.ledgerData || Object.keys(sessionData.ledgerData).length === 0}
                >
                  <RefreshCw className="h-4 w-4" />
                  تحديث من دفتر الأستاذ
                </Button>
                <p className="text-xs text-muted-foreground">
                  يحدث الأرصدة من دفتر الأستاذ المحفوظ في المرحلة الثالثة
                </p>
              </div>

              {/* معلومات دفتر الأستاذ */}
              <div className="space-y-3">
                <h4 className="font-medium">معلومات دفتر الأستاذ</h4>
                <div className="space-y-2">
                  {getLedgerSummary().length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      لا توجد حسابات في دفتر الأستاذ
                    </div>
                  ) : (
                    getLedgerSummary().map((account) => (
                      <div key={account.code} className="p-3 border border-border rounded-lg text-sm">
                        <div className="font-medium">{account.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">{account.code}</div>
                        <div className="flex justify-between mt-2">
                          <span className="text-xs">مدين: {account.debitTotal.toLocaleString()}</span>
                          <span className="text-xs">دائن: {account.creditTotal.toLocaleString()}</span>
                        </div>
                        <div className="mt-1 text-xs font-medium">
                          رصيد {account.balanceType === 'debit' ? 'مدين' : 'دائن'}: {account.finalBalance.toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* إحصائيات الجدول */}
              <div className="space-y-3">
                <h4 className="font-medium">إحصائيات الميزان</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>عدد الحسابات:</span>
                    <span className="font-medium">{trialBalanceEntries.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الحسابات بأرصدة:</span>
                    <span className="font-medium">
                      {trialBalanceEntries.filter(e => e.debitBalance > 0 || e.creditBalance > 0).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>الفرق:</span>
                    <span className={`font-medium ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(getTotals().totalDebit - getTotals().totalCredit).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      )}
    </div>
  );
};

export default Stage4TrialBalance;