// المرحلة الأولى: إدارة الحسابات والعمليات المالية

import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Save, X, ListChecks, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SessionData, JournalEntry, ValidationResult, Account } from '@/types/accounting';
import { formatCurrency, generateTransactions } from '@/utils/dataGenerator';
import { getPublishedTransactions } from '@/utils/transactionImport';
import { AccountManagement } from '@/components/AccountManagement';
import { TransactionEntry } from '@/components/TransactionEntry';
import { TransactionEditDialog } from '@/components/TransactionEditDialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { formatDateGregorian } from '@/lib/utils';

interface Stage1Props {
  sessionData: SessionData;
  onComplete: (answers: any) => void;
  onNext: () => void;
  onSessionUpdate: (sessionData: SessionData) => void;
}

interface TransactionEditProps {
  transaction: JournalEntry;
  accounts: Account[];
  onSave: (transaction: JournalEntry) => void;
  onCancel: () => void;
}

interface TransactionAnalysis {
  transactionId: string;
  affectedAccountTypes: string[];
  effects: { account: string; effect: '+' | '-' }[];
  isCorrect?: boolean;
  feedback?: string;
}

export function Stage1TransactionIdentification({ sessionData, onComplete, onNext, onSessionUpdate }: Stage1Props) {
  const [activeTab, setActiveTab] = useState('review');
  const [accounts, setAccounts] = useState<Account[]>(sessionData.chartOfAccounts);
  const [transactions, setTransactions] = useState<JournalEntry[]>(sessionData.transactions);
  const [editingTransaction, setEditingTransaction] = useState<JournalEntry | null>(null);
  const [currentTransactionIndex, setCurrentTransactionIndex] = useState(0);
  const [userAnalyses, setUserAnalyses] = useState<{ [key: string]: TransactionAnalysis }>({});
  const [showSolution, setShowSolution] = useState(false);
  const [validationResults, setValidationResults] = useState<{ [key: string]: ValidationResult }>({});
  // إخفاء الربع الأول
  const [hiddenQuarters, setHiddenQuarters] = useState<{ q1: boolean }>(
    () => sessionData.userAnswers?.hiddenQuarters ?? { q1: false }
  );

  useEffect(() => {
    if (sessionData.userAnswers?.hiddenQuarters) {
      setHiddenQuarters(sessionData.userAnswers.hiddenQuarters);
    }
  }, [sessionData.userAnswers]);

  const handleToggleQuarter = (quarter: 'q1', value: boolean) => {
    const updated = { ...hiddenQuarters, [quarter]: value };
    setHiddenQuarters(updated);
    const updatedSession = {
      ...sessionData,
      userAnswers: {
        ...sessionData.userAnswers,
        hiddenQuarters: updated,
      },
    };
    onSessionUpdate(updatedSession);
  };

  const getVisibleTransactions = () => {
    return transactions.filter((_, idx) => {
      return !hiddenQuarters.q1; // جميع العمليات في الربع الأول فقط (40 عملية)
    });
  };

  // تحديد العمليات المالية الجديدة وجلب العمليات المرفوعة
  useEffect(() => {
    const loadTransactions = async () => {
      if (transactions.length === 0) {
        console.log('🔄 بدء تحميل العمليات المالية...');
        console.log('🏢 معرف الشركة:', sessionData.companyId);
        console.log('🏢 اسم الشركة:', sessionData.company?.name);
        console.log('📊 الجلسة الحالية:', {
          sessionId: sessionData.sessionId,
          companyId: sessionData.companyId,
          currentStage: sessionData.currentStage
        });
        
        try {
          // التحقق من صحة معرف الشركة
          if (!sessionData.companyId) {
            console.error('❌ معرف الشركة غير موجود!');
            throw new Error('معرف الشركة غير موجود');
          }
          
          // جلب العمليات المرفوعة من قاعدة البيانات (جميع الحالات)
          console.log('📤 جلب العمليات المرفوعة...');
          const uploadedTransactions = await getPublishedTransactions(sessionData.companyId, true);
          
          // توليد العمليات الافتراضية
          console.log('🔧 توليد العمليات الافتراضية...');
          const generatedTransactions = generateTransactions(sessionData.company);
          
          console.log(`✅ تم تحميل ${uploadedTransactions.length} عملية مرفوعة و ${generatedTransactions.length} عملية مولدة`);
          
          // عرض تفاصيل العمليات المرفوعة
          if (uploadedTransactions.length > 0) {
            console.log('📋 العمليات المرفوعة:', uploadedTransactions.map(t => ({
              id: t.id,
              description: t.description,
              source: t.source,
              status: t.status,
              hasErrors: t.hasErrors,
              entriesCount: t.entries?.length
            })));
          } else {
            console.log('⚠️ لم يتم العثور على عمليات مرفوعة للشركة:', sessionData.companyId);
          }
          
          // دمج العمليات
          const allTransactions = [...uploadedTransactions, ...generatedTransactions];
          console.log(`📊 إجمالي العمليات بعد الدمج: ${allTransactions.length}`);
          
          // تحديث العمليات
          setTransactions(allTransactions);
          
          // تحديث الجلسة مع العمليات الجديدة
          const updatedSession = {
            ...sessionData,
            transactions: allTransactions,
          };
          onSessionUpdate(updatedSession);
          
          console.log('✅ تم تحديث الجلسة بنجاح');
          
        } catch (error) {
          console.error('❌ خطأ في تحميل العمليات:', error);
          console.error('🔍 تفاصيل الخطأ:', {
            message: error.message,
            companyId: sessionData.companyId,
            stack: error.stack
          });
          
          // في حالة الخطأ، استخدم العمليات المولدة فقط
          console.log('🔄 استخدام العمليات المولدة فقط كبديل...');
          const generatedTransactions = generateTransactions(sessionData.company);
          setTransactions(generatedTransactions);
          
          const fallbackSession = {
            ...sessionData,
            transactions: generatedTransactions,
          };
          onSessionUpdate(fallbackSession);
          
          // إشعار المستخدم بالخطأ
          alert(`خطأ في تحميل العمليات المرفوعة: ${error.message}\nسيتم استخدام العمليات المولدة فقط.`);
        }
      } else {
        console.log('📊 العمليات محملة مسبقاً:', transactions.length);
      }
    };

    loadTransactions();
  }, [sessionData.companyId]);

  const currentTransaction = transactions[currentTransactionIndex];

  // تحليل صحيح للمعاملة الحالية
  const getCorrectAnalysis = (transaction: JournalEntry): TransactionAnalysis => {
    const affectedTypes: string[] = [];
    const effects: { account: string; effect: '+' | '-' }[] = [];

    transaction.lines.forEach(line => {
      const account = sessionData.chartOfAccounts.find(acc => acc.name === line.accountName);
      if (account) {
        if (!affectedTypes.includes(account.type)) {
          affectedTypes.push(account.type);
        }

        const effect = line.debit > 0 ? '+' : '-';
        effects.push({
          account: line.accountName,
          effect: account.normalBalance === 'Debit' 
            ? (line.debit > 0 ? '+' : '-') 
            : (line.credit > 0 ? '+' : '-')
        });
      }
    });

    return {
      transactionId: transaction.entryId,
      affectedAccountTypes: affectedTypes,
      effects,
      isCorrect: true
    };
  };

  const handleAccountTypeSelect = (accountType: string) => {
    const currentAnalysis = userAnalyses[currentTransaction.entryId] || {
      transactionId: currentTransaction.entryId,
      affectedAccountTypes: [],
      effects: []
    };

    const newTypes = currentAnalysis.affectedAccountTypes.includes(accountType)
      ? currentAnalysis.affectedAccountTypes.filter(type => type !== accountType)
      : [...currentAnalysis.affectedAccountTypes, accountType];

    setUserAnalyses({
      ...userAnalyses,
      [currentTransaction.entryId]: {
        ...currentAnalysis,
        affectedAccountTypes: newTypes
      }
    });
  };

  const validateCurrentTransaction = () => {
    const userAnalysis = userAnalyses[currentTransaction.entryId];
    const correctAnalysis = getCorrectAnalysis(currentTransaction);

    if (!userAnalysis) {
      setValidationResults({
        ...validationResults,
        [currentTransaction.entryId]: {
          isValid: false,
          errors: ['يرجى تحديد أنواع الحسابات المتأثرة'],
          suggestions: []
        }
      });
      return;
    }

    const isCorrect = JSON.stringify(userAnalysis.affectedAccountTypes.sort()) === 
                     JSON.stringify(correctAnalysis.affectedAccountTypes.sort());

    setValidationResults({
      ...validationResults,
      [currentTransaction.entryId]: {
        isValid: isCorrect,
        errors: isCorrect ? [] : ['الأنواع المحددة غير صحيحة'],
        suggestions: isCorrect ? ['ممتاز! التحليل صحيح'] : [`الأنواع الصحيحة: ${correctAnalysis.affectedAccountTypes.join('، ')}`]
      }
    });
  };

  const goToNext = () => {
    if (currentTransactionIndex < transactions.length - 1) {
      setCurrentTransactionIndex(currentTransactionIndex + 1);
      setShowSolution(false);
    }
  };

  const goToPrevious = () => {
    if (currentTransactionIndex > 0) {
      setCurrentTransactionIndex(currentTransactionIndex - 1);
      setShowSolution(false);
    }
  };

  const showSolutionForCurrent = () => {
    setShowSolution(true);
    const correctAnalysis = getCorrectAnalysis(currentTransaction);
    setUserAnalyses({
      ...userAnalyses,
      [currentTransaction.entryId]: correctAnalysis
    });
  };

  const isStageComplete = () => {
    return transactions.every(transaction => 
      validationResults[transaction.entryId]?.isValid === true
    );
  };

  const handleAccountsChange = (newAccounts: Account[]) => {
    setAccounts(newAccounts);
    const updatedSessionData = {
      ...sessionData,
      chartOfAccounts: newAccounts
    };
    onSessionUpdate(updatedSessionData);
  };

  const handleTransactionAdd = (newTransaction: JournalEntry) => {
    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    const updatedSessionData = {
      ...sessionData,
      transactions: updatedTransactions,
      chartOfAccounts: accounts
    };
    onSessionUpdate(updatedSessionData);
  };

  const handleTransactionEdit = (editedTransaction: JournalEntry) => {
    const updatedTransactions = transactions.map(t => 
      t.entryId === editedTransaction.entryId ? editedTransaction : t
    );
    setTransactions(updatedTransactions);
    const updatedSessionData = {
      ...sessionData,
      transactions: updatedTransactions,
      chartOfAccounts: accounts
    };
    onSessionUpdate(updatedSessionData);
  };

  const handleTransactionDelete = (entryId: string) => {
    const updatedTransactions = transactions.filter(t => t.entryId !== entryId);
    setTransactions(updatedTransactions);
    const updatedSessionData = {
      ...sessionData,
      transactions: updatedTransactions,
      chartOfAccounts: accounts
    };
    onSessionUpdate(updatedSessionData);
  };

  const handleCompleteStage = () => {
    if (transactions.length > 0 && accounts.length > 0) {
      const filteredTransactions = getVisibleTransactions();
      const updatedSessionData = {
        ...sessionData,
        transactions: filteredTransactions,
        userAnswers: {
          ...sessionData.userAnswers,
          hiddenQuarters,
        },
      };
      onSessionUpdate(updatedSessionData);

      onComplete({
        accounts,
        transactions: filteredTransactions,
        userAnalyses
      });
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      {/* Stage Header */}
      <Card className="accounting-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-6 w-6 text-primary" />
            إدارة الحسابات والعمليات المالية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            تم تحميل العمليات المالية لشركة التقدم التقنية ({transactions.length} عملية مالية).
            تغطي هذه العمليات الفترة من يناير إلى يونيو 2025. يمكنك مراجعة العمليات والانتقال للمرحلة التالية لبدء إدخال قيود اليومية.
          </p>
        </CardContent>
      </Card>

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="accounts">دليل الحسابات</TabsTrigger>
          <TabsTrigger value="review">العمليات المالية ({transactions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-6">
          <AccountManagement 
            accounts={accounts}
            onAccountsChange={handleAccountsChange}
          />
        </TabsContent>

        <TabsContent value="review" className="space-y-6">

          {/* Review Section */}
          <Card className="accounting-card">
            <CardHeader>
              <CardTitle>العمليات المالية - شركة التقدم التقنية ({getVisibleTransactions().length} عملية)</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>جاري تحميل العمليات المالية...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* الربع الأول */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold">الربع الأول</h3>
                      <p className="text-sm text-muted-foreground">
                        عدد العمليات: {hiddenQuarters.q1 ? 0 : Math.min(40, transactions.length)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="toggle-q1">إخفاء هذا الربع</Label>
                      <Switch id="toggle-q1" checked={hiddenQuarters.q1} onCheckedChange={(v) => handleToggleQuarter('q1', v)} />
                    </div>
                  </div>

                  {hiddenQuarters.q1 ? (
                    <div className="text-sm text-muted-foreground rounded-md border p-4">
                      تم إخفاء عمليات هذا الربع ولن تظهر أو تؤثر على المراحل التالية.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {transactions.slice(0, 40).map((transaction, idx) => (
                        <div key={transaction.entryId} className="border rounded-lg p-6 hover:bg-muted/30 transition-colors">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <Badge variant="outline" className="font-mono text-sm">
                                  {transaction.reference}
                                </Badge>
                                <Badge variant="secondary">
                                  # {idx + 1}
                                </Badge>
                                 {transaction.amount && (
                                   <Badge variant="default" className="bg-primary text-primary-foreground">
                                     {new Intl.NumberFormat('ar-SA', {
                                       style: 'currency',
                                       currency: 'SAR',
                                       minimumFractionDigits: 0
                                     }).format(transaction.amount)}
                                   </Badge>
                                 )}
                                 {/* مؤشر للعمليات المرفوعة */}
                                 {transaction.source === 'uploaded' && (
                                   <Badge variant={transaction.hasErrors ? "destructive" : "secondary"} className="text-xs">
                                     {transaction.hasErrors ? 'مرفوعة - تحتاج تصحيح' : 'مرفوعة'}
                                   </Badge>
                                 )}
                              </div>

                              <h4 className="font-semibold text-base mb-2">
                                {transaction.description}
                              </h4>

                              {transaction.details && (
                                <p className="text-sm text-muted-foreground mb-3">
                                  {transaction.details}
                                </p>
                              )}

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-muted-foreground">نوع العملية:</span>
                                  <span>{transaction.transactionType}</span>
                                </div>

                                {transaction.clientSupplier && (
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-muted-foreground">العميل/المورد:</span>
                                    <span>{transaction.clientSupplier}</span>
                                  </div>
                                )}

                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-muted-foreground">التاريخ:</span>
                                  <span>{formatDateGregorian(transaction.date)}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-muted-foreground">رقم المستند:</span>
                                  <span className="font-mono">{transaction.reference}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingTransaction(transaction)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleTransactionDelete(transaction.entryId)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <TransactionEditDialog
        transaction={editingTransaction}
        accounts={accounts}
        onSave={(transaction) => {
          handleTransactionEdit(transaction);
          setEditingTransaction(null);
        }}
        onCancel={() => setEditingTransaction(null)}
      />

      {/* Controls */}
      <Card className="accounting-card">
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              دليل الحسابات: {accounts.length} حساب | العمليات المالية: {transactions.length}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCompleteStage} className="accounting-button-primary">
                الانتقال للمرحلة التالية - بدء إدخال قيود اليومية
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Stage1TransactionIdentification;