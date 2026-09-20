import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { Plus, BookOpen, Save, FileText, Archive, Eye, Calculator, ArrowRight, Move, Copy, BarChart3, Search, CheckCircle, Building2, CreditCard, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { SessionData, JournalEntry, SavedLedgerAccount, SavedLedgerEntry } from '@/types/accounting';
import { SmartAccountCombobox } from '@/components/ui/smart-account-combobox';
import { getChartOfAccounts } from '@/utils/dataGenerator';
import { useToast } from '@/hooks/use-toast';
import { calculatePostingCompletion } from '@/utils/ledgerCalculations';
import Stage3LedgerReview from './Stage3LedgerReview';

interface Stage3Props {
  sessionData: SessionData;
  onStageComplete: () => void;
  onUpdateSessionData: (data: SessionData) => void;
}

interface LedgerEntry {
  id: string;
  date: string;
  entryNumber: string;
  description: string;
  amount: number;
  side: 'debit' | 'credit';
}

interface LedgerAccount {
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  entries: LedgerEntry[];
}

interface BalanceInfo {
  debitTotal: number;
  creditTotal: number;
  carriedBalance: number;
  transferredBalance: number;
  carriedBalanceSide: 'debit' | 'credit';
  transferredBalanceSide: 'debit' | 'credit';
}

// واجهات للقسم الجديد
interface AccountTypeData {
  type: 'Assets' | 'Liabilities_Equity' | 'Revenue' | 'Expense';
  label: string;
  icon: any;
  color: string;
  accounts: any[];
  count: number;
}

interface EnhancedLedgerEntry {
  date: string;
  entryNumber: string;
  description: string;
  amount: number;
}

interface EnhancedLedgerData {
  accountCode: string;
  accountName: string;
  debitEntries: EnhancedLedgerEntry[];
  creditEntries: EnhancedLedgerEntry[];
  carriedForwardBalance: number;
  carriedForwardSide: 'debit' | 'credit';
  totalDebits: number;
  totalCredits: number;
  balanceCarriedForward: number;
  finalBalanceSide: 'debit' | 'credit';
}

// Single Account Navigator Component
const SingleAccountNavigator = ({ 
  accounts, 
  currentIndex, 
  onNavigate, 
  accountType 
}: {
  accounts: any[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  accountType: string;
}) => {
  if (accounts.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <Card className="p-6 text-center opacity-50">
          <p className="text-muted-foreground">لا توجد حسابات متاحة</p>
        </Card>
      </div>
    );
  }

  const currentAccount = accounts[currentIndex];
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < accounts.length - 1;

  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onNavigate(currentIndex - 1)}
        disabled={!canGoPrev}
        className="h-10 w-10 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Card className="flex-1 max-w-md mx-auto">
        <CardContent className="p-4 text-center">
          <h3 className="font-medium text-lg mb-2">
            {currentAccount.name}
          </h3>
          <Badge variant="secondary" className="mb-2">
            {currentAccount.code}
          </Badge>
          <p className="text-sm text-muted-foreground">
            {currentIndex + 1} من {accounts.length}
          </p>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onNavigate(currentIndex + 1)}
        disabled={!canGoNext}
        className="h-10 w-10 p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Dropzone Enhanced Ledger Table Component
const DropzoneLedgerTable = ({ 
  account, 
  ledgerData, 
  onDrop, 
  dragOverStates 
}: {
  account: any;
  ledgerData: EnhancedLedgerData;
  onDrop: (e: React.DragEvent, accountCode: string, side: 'debit' | 'credit') => void;
  dragOverStates: { [key: string]: { debit: boolean; credit: boolean } };
}) => {
  const handleDragOver = (e: React.DragEvent, side: 'debit' | 'credit') => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent, side: 'debit' | 'credit') => {
    e.preventDefault();
    e.stopPropagation();
    onDrop(e, account.code, side);
  };

  const isDebitDragOver = dragOverStates[account.code]?.debit || false;
  const isCreditDragOver = dragOverStates[account.code]?.credit || false;

  return (
    <div className="mb-8">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-center text-lg">
            دفتر الأستاذ - {account.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {/* Debit Side */}
            <div 
              className={`border-2 border-dashed rounded-lg p-2 transition-all duration-200 ${
                isDebitDragOver ? 'border-green-500 bg-green-50' : 'border-border'
              }`}
              onDragOver={(e) => handleDragOver(e, 'debit')}
              onDrop={(e) => handleDrop(e, 'debit')}
            >
              <h3 className="text-center font-medium mb-2 text-red-600">المدين</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground border-b pb-1">
                  <span>المبلغ</span>
                  <span>البيان</span>
                  <span>رقم القيد</span>
                  <span>التاريخ</span>
                </div>
                
                {/* Carried Forward Balance */}
                {ledgerData.carriedForwardBalance > 0 && (
                  <div className="grid grid-cols-4 gap-2 text-xs bg-blue-50 p-2 rounded">
                    <span className="font-medium">{ledgerData.carriedForwardBalance.toLocaleString()}</span>
                    <span className="text-blue-600">رصيد مرحل</span>
                    <span>-</span>
                    <span>-</span>
                  </div>
                )}
                
                {/* Debit Entries */}
                {ledgerData.debitEntries.map((entry, index) => (
                  <div key={`debit-${index}`} className="grid grid-cols-4 gap-2 text-xs p-2 border rounded hover:bg-muted/30">
                    <span className="font-medium">{entry.amount.toLocaleString()}</span>
                    <span className="truncate" title={entry.description}>{entry.description}</span>
                    <span>{entry.entryNumber}</span>
                    <span>{entry.date}</span>
                  </div>
                ))}
                
                {/* Empty state */}
                {ledgerData.debitEntries.length === 0 && ledgerData.carriedForwardBalance === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {isDebitDragOver ? 'أفلت القيد هنا للجانب المدين' : 'لا توجد قيود مدينة'}
                  </div>
                )}
                
                {/* Total Row */}
                <div className="grid grid-cols-4 gap-2 text-xs bg-muted p-2 rounded font-bold">
                  <span>{ledgerData.totalDebits.toLocaleString()}</span>
                  <span>المجموع</span>
                  <span>-</span>
                  <span>-</span>
                </div>
                
                {/* Balance Carried Forward */}
                {ledgerData.balanceCarriedForward > 0 && ledgerData.finalBalanceSide === 'credit' && (
                  <div className="grid grid-cols-4 gap-2 text-xs bg-green-50 p-2 rounded font-medium text-green-600">
                    <span>{ledgerData.balanceCarriedForward.toLocaleString()}</span>
                    <span>رصيد منقول</span>
                    <span>-</span>
                    <span>-</span>
                  </div>
                )}
              </div>
            </div>

            {/* Credit Side */}
            <div 
              className={`border-2 border-dashed rounded-lg p-2 transition-all duration-200 ${
                isCreditDragOver ? 'border-green-500 bg-green-50' : 'border-border'
              }`}
              onDragOver={(e) => handleDragOver(e, 'credit')}
              onDrop={(e) => handleDrop(e, 'credit')}
            >
              <h3 className="text-center font-medium mb-2 text-green-600">الدائن</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground border-b pb-1">
                  <span>التاريخ</span>
                  <span>رقم القيد</span>
                  <span>البيان</span>
                  <span>المبلغ</span>
                </div>
                
                {/* Carried Forward Balance */}
                {ledgerData.carriedForwardBalance > 0 && (
                  <div className="grid grid-cols-4 gap-2 text-xs bg-blue-50 p-2 rounded">
                    <span>-</span>
                    <span>-</span>
                    <span className="text-blue-600">رصيد مرحل</span>
                    <span className="font-medium">{ledgerData.carriedForwardBalance.toLocaleString()}</span>
                  </div>
                )}
                
                {/* Credit Entries */}
                {ledgerData.creditEntries.map((entry, index) => (
                  <div key={`credit-${index}`} className="grid grid-cols-4 gap-2 text-xs p-2 border rounded hover:bg-muted/30">
                    <span>{entry.date}</span>
                    <span>{entry.entryNumber}</span>
                    <span className="truncate" title={entry.description}>{entry.description}</span>
                    <span className="font-medium">{entry.amount.toLocaleString()}</span>
                  </div>
                ))}
                
                {/* Empty state */}
                {ledgerData.creditEntries.length === 0 && ledgerData.carriedForwardBalance === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {isCreditDragOver ? 'أفلت القيد هنا للجانب الدائن' : 'لا توجد قيود دائنة'}
                  </div>
                )}
                
                {/* Total Row */}
                <div className="grid grid-cols-4 gap-2 text-xs bg-muted p-2 rounded font-bold">
                  <span>-</span>
                  <span>-</span>
                  <span>المجموع</span>
                  <span>{ledgerData.totalCredits.toLocaleString()}</span>
                </div>
                
                {/* Balance Carried Forward */}
                {ledgerData.balanceCarriedForward > 0 && ledgerData.finalBalanceSide === 'debit' && (
                  <div className="grid grid-cols-4 gap-2 text-xs bg-green-50 p-2 rounded font-medium text-green-600">
                    <span>-</span>
                    <span>-</span>
                    <span>رصيد منقول</span>
                    <span>{ledgerData.balanceCarriedForward.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Account Type Section Component
const AccountTypeSection = ({ 
  typeData, 
  accounts, 
  currentIndex, 
  onNavigate, 
  ledgerData, 
  onDrop, 
  dragOverStates,
  setDragOverStates,
  addAccountToLedger
}: {
  typeData: { type: string; label: string; icon: any; color: string };
  accounts: any[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  ledgerData: EnhancedLedgerData | null;
  onDrop: (e: React.DragEvent, accountCode: string, side: 'debit' | 'credit') => void;
  dragOverStates: { [key: string]: { debit: boolean; credit: boolean } };
  setDragOverStates: React.Dispatch<React.SetStateAction<Record<string, { debit: boolean; credit: boolean }>>>;
  addAccountToLedger: (accountCode: string) => void;
}) => {
  if (accounts.length === 0) {
    return (
      <div className="mb-8">
        <Card className="p-6 text-center opacity-50">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${typeData.color} text-white text-xl mb-2`}>
            <typeData.icon className="w-6 h-6" />
          </div>
          <h3 className="font-medium text-lg mb-2">{typeData.label}</h3>
          <p className="text-muted-foreground">لا توجد حسابات متاحة</p>
        </Card>
      </div>
    );
  }

  const currentAccount = accounts[currentIndex];

  const handleDragOver = (e: React.DragEvent, side: 'debit' | 'credit') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStates(prev => ({
      ...prev,
      [currentAccount.code]: { ...prev[currentAccount.code], [side]: true }
    }));
  };

  const handleDragLeave = (e: React.DragEvent, side: 'debit' | 'credit') => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverStates(prev => ({
        ...prev,
        [currentAccount.code]: { ...prev[currentAccount.code], [side]: false }
      }));
    }
  };

  const handleDrop = (e: React.DragEvent, side: 'debit' | 'credit') => {
    e.preventDefault();
    addAccountToLedger(currentAccount.code);
    onDrop(e, currentAccount.code, side);
    setDragOverStates(prev => ({
      ...prev,
      [currentAccount.code]: { debit: false, credit: false }
    }));
  };

  return (
    <div className="mb-8 space-y-4">
      {/* Type Header Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-4 text-center">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${typeData.color} text-white text-xl mb-2`}>
            <typeData.icon className="w-6 h-6" />
          </div>
          <h3 className="font-medium text-lg">{typeData.label}</h3>
          <Badge variant="secondary" className="text-xs">
            {accounts.length} حساب
          </Badge>
        </CardContent>
      </Card>

      {/* Single Account Navigator */}
      <SingleAccountNavigator
        accounts={accounts}
        currentIndex={currentIndex}
        onNavigate={onNavigate}
        accountType={typeData.type}
      />

      {/* Enhanced Ledger Table with Drop Zones */}
      {ledgerData && (
        <DropzoneLedgerTable
          account={currentAccount}
          ledgerData={ledgerData}
          onDrop={onDrop}
          dragOverStates={dragOverStates}
        />
      )}
    </div>
  );
};

// مكون بطاقة الحساب مع جدول القيود المدمج
const AccountDropCard: React.FC<{
  accountName: string;
  accountCode: string;
  onDrop: (e: React.DragEvent, accountCode: string, side: 'debit' | 'credit') => void;
  dragOverStates: Record<string, { debit: boolean; credit: boolean }>;
  setDragOverStates: React.Dispatch<React.SetStateAction<Record<string, { debit: boolean; credit: boolean }>>>;
  addAccountToLedger: (accountCode: string) => void;
  entries: LedgerEntry[];
  accountBalance: BalanceInfo;
}> = ({ accountName, accountCode, onDrop, dragOverStates, setDragOverStates, addAccountToLedger, entries, accountBalance }) => {
  const cardDragState = dragOverStates[accountCode] || { debit: false, credit: false };
  
  const debitEntries = entries.filter(e => e.side === 'debit');
  const creditEntries = entries.filter(e => e.side === 'credit');

  const handleDragOver = (e: React.DragEvent, side: 'debit' | 'credit') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStates(prev => ({
      ...prev,
      [accountCode]: { ...prev[accountCode], [side]: true }
    }));
  };

  const handleDragLeave = (e: React.DragEvent, side: 'debit' | 'credit') => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverStates(prev => ({
        ...prev,
        [accountCode]: { ...prev[accountCode], [side]: false }
      }));
    }
  };

  const handleDrop = (e: React.DragEvent, side: 'debit' | 'credit') => {
    e.preventDefault();
    addAccountToLedger(accountCode);
    onDrop(e, accountCode, side);
    setDragOverStates(prev => ({
      ...prev,
      [accountCode]: { debit: false, credit: false }
    }));
  };

  // إضافة نص الرصيد المرحل بجانب اسم الحساب (يظهر دائماً)
  const balanceText = ` (رصيد: ${accountBalance.carriedBalance.toLocaleString()} ${accountBalance.carriedBalanceSide === 'debit' ? 'مدين' : 'دائن'})`;

  return (
    <Card className="p-3 transition-all duration-200 hover:shadow-md">
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-center">
          {accountName}
          <span className="text-xs text-muted-foreground font-normal">{balanceText}</span>
        </h4>
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-xs table-fixed" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th 
                  style={{ width: '50%' }}
                  className={`px-2 py-2 font-medium border-l border-border transition-all duration-200 cursor-pointer overflow-hidden ${
                    cardDragState.debit 
                      ? 'bg-blue-500 text-white shadow-lg' 
                      : 'bg-blue-50 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300'
                  }`}
                  onDragOver={(e) => handleDragOver(e, 'debit')}
                  onDragLeave={(e) => handleDragLeave(e, 'debit')}
                  onDrop={(e) => handleDrop(e, 'debit')}
                >
                  {cardDragState.debit ? 'أفلت هنا' : 'مدين'}
                </th>
                <th 
                  style={{ width: '50%' }}
                  className={`px-2 py-2 font-medium transition-all duration-200 cursor-pointer overflow-hidden ${
                    cardDragState.credit 
                      ? 'bg-green-500 text-white shadow-lg' 
                      : 'bg-green-50 text-green-800 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300'
                  }`}
                  onDragOver={(e) => handleDragOver(e, 'credit')}
                  onDragLeave={(e) => handleDragLeave(e, 'credit')}
                  onDrop={(e) => handleDrop(e, 'credit')}
                >
                  {cardDragState.credit ? 'أفلت هنا' : 'دائن'}
                </th>
              </tr>
            </thead>
            <tbody>
              {/* عرض القيود */}
              {Math.max(debitEntries.length, creditEntries.length, 3) > 0 && 
                Array.from({ length: Math.max(debitEntries.length, creditEntries.length, 3) }).map((_, index) => (
                  <tr key={index} className="border-t border-border/50" style={{ height: '56px' }}>
                    <td className="px-2 py-1 border-l border-border/50 text-center overflow-hidden" style={{ width: '50%' }}>
                      {debitEntries[index] ? (
                        <div className="space-y-1 h-full flex flex-col justify-center">
                          <div className="text-xs text-muted-foreground truncate">{debitEntries[index].entryNumber}</div>
                          <div className="font-medium truncate">{debitEntries[index].amount.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground truncate" title={debitEntries[index].description}>
                            {debitEntries[index].description}
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground/30">-</div>
                      )}
                    </td>
                    <td className="px-2 py-1 text-center overflow-hidden" style={{ width: '50%' }}>
                      {creditEntries[index] ? (
                        <div className="space-y-1 h-full flex flex-col justify-center">
                          <div className="text-xs text-muted-foreground truncate">{creditEntries[index].entryNumber}</div>
                          <div className="font-medium truncate">{creditEntries[index].amount.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground truncate" title={creditEntries[index].description}>
                            {creditEntries[index].description}
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground/30">-</div>
                      )}
                    </td>
                  </tr>
                ))
              }
              {/* إجمالي الأرصدة */}
              <tr className="border-t-2 border-foreground/20 bg-muted/20">
                <td className="px-2 py-2 border-l border-border font-bold text-center">
                  {accountBalance.debitTotal.toLocaleString()}
                </td>
                <td className="px-2 py-2 font-bold text-center">
                  {accountBalance.creditTotal.toLocaleString()}
                </td>
              </tr>
              {/* الرصيد النهائي */}
              {(
                <tr className="bg-primary/10">
                  <td 
                    className={`px-2 py-1 border-l border-border text-center text-xs font-medium ${
                      accountBalance.carriedBalanceSide === 'debit' ? 'bg-blue-100 dark:bg-blue-900/30' : ''
                    }`}
                  >
                    {accountBalance.carriedBalanceSide === 'debit' ? accountBalance.carriedBalance.toLocaleString() : '-'}
                  </td>
                  <td 
                    className={`px-2 py-1 text-center text-xs font-medium ${
                      accountBalance.carriedBalanceSide === 'credit' ? 'bg-green-100 dark:bg-green-900/30' : ''
                    }`}
                  >
                    {accountBalance.carriedBalanceSide === 'credit' ? accountBalance.carriedBalance.toLocaleString() : '-'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};

// مكون بطاقة القيد اليومي للسحب والإفلات (نص مبسط)
const JournalEntryCard: React.FC<{
  transaction: JournalEntry;
  index: number;
  onDragStart: (e: React.DragEvent, data: any) => void;
  postingProgress: number;
  maxPostings: number;
}> = ({ transaction, index, onDragStart, postingProgress, maxPostings }) => {
  // إنشاء النص المبسط للقيد
  const getSimplifiedText = () => {
    const fromAccount = transaction.lines.find(line => line.debit > 0)?.accountName || 'حساب مجهول';
    const toAccount = transaction.lines.find(line => line.credit > 0)?.accountName || 'حساب مجهول';
    const amount = transaction.lines.find(line => line.debit > 0)?.debit || 0;
    
    return `مبلغ ${amount.toLocaleString()} من حساب ${fromAccount} إلى حساب ${toAccount}`;
  };

  // إنشاء المحتوى المصغر للسحب
  const handleDragStart = (e: React.DragEvent) => {
    const entryCode = `D${String(index + 1).padStart(3, '0')}`;
    const amount = transaction.lines.find(line => line.debit > 0)?.debit || 0;
    
    // إنشاء عنصر مصغر للسحب
    const dragElement = document.createElement('div');
    dragElement.className = 'bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium shadow-lg border-2 border-primary-foreground/20';
    dragElement.innerHTML = `[${entryCode}] - ${amount.toLocaleString()}`;
    dragElement.style.position = 'absolute';
    dragElement.style.top = '-1000px';
    dragElement.style.left = '-1000px';
    dragElement.style.pointerEvents = 'none';
    dragElement.style.transform = 'scale(0.8)';
    dragElement.style.opacity = '0.9';
    document.body.appendChild(dragElement);
    
    e.dataTransfer.setDragImage(dragElement, 60, 15);
    
    // إزالة العنصر بعد فترة قصيرة
    setTimeout(() => document.body.removeChild(dragElement), 0);
    
    onDragStart(e, { transaction, index });
  };

  // تحديد لون ونص العداد
  const getProgressBadge = () => {
    if (postingProgress === 0) {
      return { color: 'bg-gray-500 text-white', text: `${postingProgress}/${maxPostings}` };
    } else if (postingProgress < maxPostings) {
      return { color: 'bg-yellow-500 text-white', text: `${postingProgress}/${maxPostings}` };
    } else {
      return { color: 'bg-green-500 text-white', text: `${postingProgress}/${maxPostings} ✓` };
    }
  };

  const badge = getProgressBadge();

  return (
    <div 
      className="p-3 border border-border rounded-lg hover:shadow-md transition-all duration-200 cursor-move hover:border-primary/50 hover:bg-muted/30 text-sm leading-relaxed relative"
      draggable
      onDragStart={handleDragStart}
    >
      {/* عداد الترحيل */}
      <div className={`absolute -top-2 -left-2 px-2 py-1 rounded-full text-xs font-medium ${badge.color} shadow-sm z-10`}>
        {badge.text}
      </div>
      
      <div className="flex items-center gap-2">
        <Move className="h-4 w-4 opacity-50 flex-shrink-0" />
        <span className="text-foreground">{getSimplifiedText()}</span>
      </div>
    </div>
  );
};

// مكون جدول دفتر الأستاذ
const LedgerTable: React.FC<{
  account: LedgerAccount;
  balance: BalanceInfo;
  onEntryUpdate: (entryId: string, field: string, value: string) => void;
  onAddEmptyEntry: (side: 'debit' | 'credit') => void;
  onDrop: (e: React.DragEvent, side: 'debit' | 'credit') => void;
  isDragOver: { debit: boolean; credit: boolean };
}> = ({ account, balance, onEntryUpdate, onAddEmptyEntry, onDrop, isDragOver }) => {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const debitEntries = account.entries.filter(e => e.side === 'debit');
  const creditEntries = account.entries.filter(e => e.side === 'credit');

  const startEdit = (cellId: string, currentValue: string) => {
    setEditingCell(cellId);
    setEditValue(currentValue);
  };

  const saveEdit = (entryId: string, field: string) => {
    onEntryUpdate(entryId, field, editValue);
    setEditingCell(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const renderEditableCell = (entryId: string, field: string, value: string | number) => {
    const cellId = `${entryId}-${field}`;
    const isEditing = editingCell === cellId;

    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <Input
            type={field === 'amount' ? 'number' : 'text'}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-8 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit(entryId, field);
              if (e.key === 'Escape') cancelEdit();
            }}
          />
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => saveEdit(entryId, field)}
          >
            <Save className="h-3 w-3" />
          </Button>
        </div>
      );
    }

    return (
      <div
        className="group cursor-pointer hover:bg-muted/50 p-1 rounded flex items-center justify-between min-h-[24px]"
        onClick={() => startEdit(cellId, value.toString())}
      >
        <span className="text-sm">
          {field === 'amount' && typeof value === 'number' 
            ? value.toLocaleString() 
            : value || '-'}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* حساب الفرق - مدمج في أعلى الجدول */}
      <div className="bg-gradient-to-r from-blue-50/50 to-green-50/50 dark:from-blue-900/10 dark:to-green-900/10 p-3 rounded-lg border border-border/50">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
          <Calculator className="h-4 w-4" />
          <span>حساب الفرق بين الرصيدين</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-base font-mono">
          <span className="px-2 py-1 bg-blue-100/80 dark:bg-blue-900/30 rounded text-sm">
            {Math.max(balance.debitTotal, balance.creditTotal).toLocaleString()}
          </span>
          <span>-</span>
          <span className="px-2 py-1 bg-green-100/80 dark:bg-green-900/30 rounded text-sm">
            {Math.min(balance.debitTotal, balance.creditTotal).toLocaleString()}
          </span>
          <span>=</span>
          <span className="px-2 py-1 bg-primary/20 rounded font-bold text-sm">
            {balance.carriedBalance.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
          <ArrowRight className="h-3 w-3" />
          <span>هذا الرصيد سيُرحل إلى ميزان المراجعة</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* جانب المدين */}
        <div 
          className={`border border-border rounded transition-all duration-200 ${
            isDragOver.debit ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-lg scale-105' : ''
          }`}
          onDragOver={(e) => { e.preventDefault(); }}
          onDrop={(e) => onDrop(e, 'debit')}
        >
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 text-center font-medium border-b border-blue-200 dark:border-blue-800">
            الجانب المدين
            {isDragOver.debit && (
              <div className="text-xs mt-1 text-blue-600 dark:text-blue-400">
                أفلت هنا لإضافة القيد
              </div>
            )}
          </div>
          <div className="p-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-1">التاريخ</th>
                  <th className="text-right p-1">رقم القيد</th>
                  <th className="text-right p-1">البيان</th>
                  <th className="text-right p-1">المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {debitEntries.map((entry) => (
                  <tr key={entry.id} className="border-b border-border/30">
                    <td className="p-1">
                      {renderEditableCell(entry.id, 'date', entry.date)}
                    </td>
                    <td className="p-1">
                      {renderEditableCell(entry.id, 'entryNumber', entry.entryNumber)}
                    </td>
                    <td className="p-1">
                      {renderEditableCell(entry.id, 'description', entry.description)}
                    </td>
                    <td className="p-1">
                      {renderEditableCell(entry.id, 'amount', entry.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 border-t pt-3 space-y-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onAddEmptyEntry('debit')}
                className="text-xs w-full"
              >
                <Plus className="h-3 w-3 mr-1" />
                إضافة قيد مدين
              </Button>
              
              <div className="bg-muted/30 p-2 rounded">
                <div className="text-sm font-medium text-center mb-2">
                  إجمالي المدين
                </div>
                <div className="text-lg font-bold text-center border-b-2 border-foreground pb-1">
                  {balance.debitTotal.toLocaleString()}
                </div>
              </div>
              
              {balance.carriedBalanceSide === 'debit' && balance.carriedBalance > 0 && (
                <div className="bg-primary/10 p-2 rounded">
                  <div className="text-xs text-center text-muted-foreground mb-1">
                    الرصيد المرحل
                  </div>
                  <div className="text-sm font-medium text-center">
                    {balance.carriedBalance.toLocaleString()}
                  </div>
                </div>
              )}
              
              {balance.transferredBalanceSide === 'debit' && balance.transferredBalance > 0 && (
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
                  <div className="text-xs text-center text-muted-foreground mb-1">
                    الرصيد المنقول
                  </div>
                  <div className="text-sm font-medium text-center">
                    {balance.transferredBalance.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* جانب الدائن */}
        <div 
          className={`border border-border rounded transition-all duration-200 ${
            isDragOver.credit ? 'border-green-500 bg-green-50/50 dark:bg-green-900/20 shadow-lg scale-105' : ''
          }`}
          onDragOver={(e) => { e.preventDefault(); }}
          onDrop={(e) => onDrop(e, 'credit')}
        >
          <div className="bg-green-50 dark:bg-green-900/20 p-3 text-center font-medium border-b border-green-200 dark:border-green-800">
            الجانب الدائن
            {isDragOver.credit && (
              <div className="text-xs mt-1 text-green-600 dark:text-green-400">
                أفلت هنا لإضافة القيد
              </div>
            )}
          </div>
          <div className="p-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-1">التاريخ</th>
                  <th className="text-right p-1">رقم القيد</th>
                  <th className="text-right p-1">البيان</th>
                  <th className="text-right p-1">المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {creditEntries.map((entry) => (
                  <tr key={entry.id} className="border-b border-border/30">
                    <td className="p-1">
                      {renderEditableCell(entry.id, 'date', entry.date)}
                    </td>
                    <td className="p-1">
                      {renderEditableCell(entry.id, 'entryNumber', entry.entryNumber)}
                    </td>
                    <td className="p-1">
                      {renderEditableCell(entry.id, 'description', entry.description)}
                    </td>
                    <td className="p-1">
                      {renderEditableCell(entry.id, 'amount', entry.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 border-t pt-3 space-y-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onAddEmptyEntry('credit')}
                className="text-xs w-full"
              >
                <Plus className="h-3 w-3 mr-1" />
                إضافة قيد دائن
              </Button>
              
              <div className="bg-muted/30 p-2 rounded">
                <div className="text-sm font-medium text-center mb-2">
                  إجمالي الدائن
                </div>
                <div className="text-lg font-bold text-center border-b-2 border-foreground pb-1">
                  {balance.creditTotal.toLocaleString()}
                </div>
              </div>
              
              {balance.carriedBalanceSide === 'credit' && balance.carriedBalance > 0 && (
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded">
                  <div className="text-xs text-center text-muted-foreground mb-1">
                    الرصيد المرحل
                  </div>
                  <div className="text-sm font-medium text-center">
                    {balance.carriedBalance.toLocaleString()}
                  </div>
                </div>
              )}
              
              {balance.transferredBalanceSide === 'credit' && balance.transferredBalance > 0 && (
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded">
                  <div className="text-xs text-center text-muted-foreground mb-1">
                    الرصيد المنقول
                  </div>
                  <div className="text-sm font-medium text-center">
                    {balance.transferredBalance.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Stage3PostToLedger: React.FC<Stage3Props> = ({
  sessionData,
  onStageComplete,
  onUpdateSessionData
}) => {
  const { toast } = useToast();
  const isAdminMode = sessionData.userAnswers?.simulationMode === 'admin';
  const [selectedAccounts, setSelectedAccounts] = useState<LedgerAccount[]>([]);
  const [draggedData, setDraggedData] = useState<any>(null);
  const [dragOverStates, setDragOverStates] = useState<Record<string, { debit: boolean; credit: boolean }>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [postingProgress, setPostingProgress] = useState<Map<string, Set<string>>>(new Map());
  const [showDetailedView, setShowDetailedView] = useState(false);
  
  // State management for enhanced view
  const [accountIndices, setAccountIndices] = useState<Record<string, number>>({
    assets: 0,
    liabilities_equity: 0,
    revenue: 0,
    expense: 0
  });
  
  // حساب نسبة اكتمال الترحيل
  const postingCompletion = calculatePostingCompletion(postingProgress, sessionData.transactions);
  const isPostingComplete = postingCompletion === 100;
  
  const chartOfAccounts = getChartOfAccounts();

  // ترتيب الحسابات حسب التصنيف
  const sortedAccounts = chartOfAccounts.sort((a, b) => {
    const typeOrder = { 'Asset': 1, 'Liability': 2, 'Equity': 3, 'Revenue': 4, 'Expense': 5 };
    return typeOrder[a.type] - typeOrder[b.type] || a.code.localeCompare(b.code);
  });

  // Group accounts by type for enhanced view - only accounts with entries
  const accountsByType = React.useMemo(() => {
    const filterAccountsWithEntries = (accounts: any[]) => 
      accounts.filter((account: any) => 
        sessionData.transactions.some(transaction => 
          transaction.lines.some((line: any) => line.accountCode === account.code)
        )
      );

    const assets = filterAccountsWithEntries(chartOfAccounts.filter(acc => acc.type === 'Asset'));
    const liabilitiesEquity = filterAccountsWithEntries(chartOfAccounts.filter(acc => acc.type === 'Liability' || acc.type === 'Equity'));
    const revenue = filterAccountsWithEntries(chartOfAccounts.filter(acc => acc.type === 'Revenue'));
    const expense = filterAccountsWithEntries(chartOfAccounts.filter(acc => acc.type === 'Expense'));

    return {
      assets,
      liabilities_equity: liabilitiesEquity,
      revenue,
      expense
    };
  }, [chartOfAccounts, sessionData.transactions]);

  // Generate enhanced ledger data for current accounts
  const getCurrentLedgerData = (accountType: string) => {
    const accounts = accountsByType[accountType as keyof typeof accountsByType];
    if (accounts.length === 0) return null;
    
    const currentIndex = accountIndices[accountType];
    const currentAccount = accounts[currentIndex];
    if (!currentAccount) return null;
    
    return generateEnhancedLedgerData(currentAccount.code);
  };

  // إنشاء بيانات دفتر الأستاذ المطور
  const generateEnhancedLedgerData = (accountCode: string): EnhancedLedgerData | null => {
    const account = chartOfAccounts.find(acc => acc.code === accountCode);
    if (!account) return null;

    const ledgerAccount = selectedAccounts.find(acc => acc.code === accountCode);
    const entries = ledgerAccount?.entries || [];

    const debitEntries: EnhancedLedgerEntry[] = entries
      .filter(e => e.side === 'debit')
      .map(e => ({
        date: e.date,
        entryNumber: e.entryNumber,
        description: e.description,
        amount: e.amount
      }));

    const creditEntries: EnhancedLedgerEntry[] = entries
      .filter(e => e.side === 'credit')
      .map(e => ({
        date: e.date,
        entryNumber: e.entryNumber,
        description: e.description,
        amount: e.amount
      }));

    const debitTotal = debitEntries.reduce((sum, e) => sum + e.amount, 0);
    const creditTotal = creditEntries.reduce((sum, e) => sum + e.amount, 0);

    const carriedForward = 0; // يمكن حسابه من بيانات الفترة السابقة
    const carriedForwardSide: 'debit' | 'credit' = debitTotal >= creditTotal ? 'debit' : 'credit';
    
    const transferredBalance = Math.abs(debitTotal - creditTotal);
    const transferredBalanceSide: 'debit' | 'credit' = debitTotal >= creditTotal ? 'debit' : 'credit';

    return {
      accountCode: account.code,
      accountName: account.name,
      debitEntries,
      creditEntries,
      carriedForwardBalance: carriedForward,
      carriedForwardSide,
      totalDebits: debitTotal,
      totalCredits: creditTotal,
      balanceCarriedForward: transferredBalance,
      finalBalanceSide: transferredBalanceSide
    };
  };


  const addAccountToLedger = (accountCode: string) => {
    if (selectedAccounts.find(acc => acc.code === accountCode)) return;

    const account = chartOfAccounts.find(acc => acc.code === accountCode);
    if (!account) return;

    const newAccount: LedgerAccount = {
      code: account.code,
      name: account.name,
      type: account.type,
      entries: [] // صفحة فارغة تماماً
    };

    setSelectedAccounts(prev => [...prev, newAccount]);
    setDragOverStates(prev => ({ ...prev, [accountCode]: { debit: false, credit: false } }));
  };

  const addEmptyEntry = (accountCode: string, side: 'debit' | 'credit') => {
    setSelectedAccounts(prev => prev.map(account => {
      if (account.code === accountCode) {
        const newEntry: LedgerEntry = {
          id: `manual-${Date.now()}-${side}`,
          date: '',
          entryNumber: '',
          description: '',
          amount: 0,
          side
        };
        return {
          ...account,
          entries: [...account.entries, newEntry]
        };
      }
      return account;
    }));
  };

  const updateEntry = (accountCode: string, entryId: string, field: string, value: string) => {
    setSelectedAccounts(prev => prev.map(account => {
      if (account.code === accountCode) {
        return {
          ...account,
          entries: account.entries.map(entry => {
            if (entry.id === entryId) {
              return {
                ...entry,
                [field]: field === 'amount' ? parseFloat(value) || 0 : value
              };
            }
            return entry;
          })
        };
      }
      return account;
    }));
  };

  const calculateBalance = (account: LedgerAccount): BalanceInfo => {
    const debitTotal = account.entries
      .filter(e => e.side === 'debit')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const creditTotal = account.entries
      .filter(e => e.side === 'credit')
      .reduce((sum, e) => sum + e.amount, 0);

    const difference = Math.abs(debitTotal - creditTotal);
    
    // تحديد الرصيد المرحل والمنقول بناءً على طبيعة الحساب
    let carriedBalanceSide: 'debit' | 'credit';
    let transferredBalanceSide: 'debit' | 'credit';

    if (account.type === 'Asset' || account.type === 'Expense') {
      // الأصول والمصروفات: طبيعة مدينة
      carriedBalanceSide = debitTotal >= creditTotal ? 'debit' : 'credit';
      transferredBalanceSide = 'debit';
    } else {
      // الخصوم والإيرادات ورأس المال: طبيعة دائنة
      carriedBalanceSide = creditTotal >= debitTotal ? 'credit' : 'debit';
      transferredBalanceSide = 'credit';
    }
    
    return {
      debitTotal,
      creditTotal,
      carriedBalance: difference,
      transferredBalance: difference,
      carriedBalanceSide,
      transferredBalanceSide
    };
  };

  const handleDragStart = (e: React.DragEvent, data: any) => {
    setDraggedData(data);
    e.dataTransfer.setData('text/plain', JSON.stringify(data));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, accountCode: string, side: 'debit' | 'credit') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStates(prev => ({
      ...prev,
      [accountCode]: { ...prev[accountCode], [side]: true }
    }));
  };

  const handleDragLeave = (e: React.DragEvent, accountCode: string, side: 'debit' | 'credit') => {
    setDragOverStates(prev => ({
      ...prev,
      [accountCode]: { ...prev[accountCode], [side]: false }
    }));
  };

  const handleDrop = (e: React.DragEvent, targetAccountCode: string, targetSide: 'debit' | 'credit') => {
    e.preventDefault();
    
    // إعادة تعيين حالة السحب
    setDragOverStates(prev => ({
      ...prev,
      [targetAccountCode]: { debit: false, credit: false }
    }));
    
    if (!draggedData) return;

    const { transaction, index } = draggedData;
    
    // البحث عن الخط المطابق للحساب المستهدف في القيد
    const relevantLine = transaction.lines.find((line: any) => line.accountCode === targetAccountCode);
    
    if (!relevantLine) {
      toast({
        title: "خطأ في السحب والإفلات",
        description: "هذا القيد لا يحتوي على الحساب المستهدف",
        variant: "destructive"
      });
      return;
    }

    const correctSide = relevantLine.debit > 0 ? 'debit' : 'credit';
    if (correctSide !== targetSide) {
      toast({
        title: "خطأ في الجانب",
        description: `هذا القيد يجب أن يكون في الجانب ${correctSide === 'debit' ? 'المدين' : 'الدائن'}`,
        variant: "destructive"
      });
      return;
    }

    const newEntry: LedgerEntry = {
      id: `journal-${transaction.entryId}-${Date.now()}`,
      date: transaction.date,
      entryNumber: (index + 1).toString(),
      description: relevantLine.description || transaction.description,
      amount: relevantLine.debit > 0 ? relevantLine.debit : relevantLine.credit,
      side: targetSide
    };

    // تحديث عداد الترحيل
    setPostingProgress(prev => {
      const newProgress = new Map(prev);
      const entrySet = newProgress.get(transaction.entryId) || new Set();
      entrySet.add(targetAccountCode);
      newProgress.set(transaction.entryId, entrySet);
      return newProgress;
    });

    setSelectedAccounts(prev => prev.map(account => {
      if (account.code === targetAccountCode) {
        return {
          ...account,
          entries: [...account.entries, newEntry]
        };
      }
      return account;
    }));

    setDraggedData(null);
    
    toast({
      title: "تم الإضافة بنجاح",
      description: `تم إضافة القيد إلى حساب ${targetAccountCode}`,
    });
  };

  const copyAllJournalEntries = async () => {
    try {
      let formattedEntries = `قائمة جميع القيود اليومية (${sessionData.transactions.length} قيد)\n`;
      formattedEntries += `=====================================\n\n`;

      sessionData.transactions.forEach((transaction, index) => {
        formattedEntries += `القيد رقم: ${index + 1}\n`;
        formattedEntries += `التاريخ: ${transaction.date}\n`;
        formattedEntries += `رقم المرجع: ${transaction.entryId.slice(-8)}\n`;
        formattedEntries += `البيان: ${transaction.description}\n`;
        formattedEntries += `-------------------------------------\n`;
        
        transaction.lines.forEach((line) => {
          formattedEntries += `${line.accountName} (${line.accountCode})\n`;
          if (line.debit > 0) {
            formattedEntries += `  مدين: ${line.debit.toLocaleString()}\n`;
          }
          if (line.credit > 0) {
            formattedEntries += `  دائن: ${line.credit.toLocaleString()}\n`;
          }
        });
        
        formattedEntries += `=====================================\n\n`;
      });

      await navigator.clipboard.writeText(formattedEntries);
      
      toast({
        title: "تم النسخ بنجاح",
        description: `تم نسخ جميع القيود (${sessionData.transactions.length} قيد) إلى الحافظة`,
      });
    } catch (error) {
      toast({
        title: "خطأ في النسخ",
        description: "حدث خطأ أثناء نسخ القيود",
        variant: "destructive"
      });
    }
  };

  // حساب أرصدة الحسابات النهائية من جميع القيود
  const calculateFinalAccountBalances = () => {
    const accountSummary = new Map();
    
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

  const copyFinalBalances = async () => {
    try {
      const balances = calculateFinalAccountBalances();
      const totalDebit = balances.reduce((sum, acc) => sum + acc.debitTotal, 0);
      const totalCredit = balances.reduce((sum, acc) => sum + acc.creditTotal, 0);
      
      let report = `أرصدة الحسابات النهائية\n`;
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
      report += `إجمالي جميع المبالغ المدينة: ${totalDebit.toLocaleString()}\n`;
      report += `إجمالي جميع المبالغ الدائنة: ${totalCredit.toLocaleString()}\n`;
      report += `الفرق: ${Math.abs(totalDebit - totalCredit).toLocaleString()}\n`;
      report += `التوازن: ${totalDebit === totalCredit ? 'متوازن ✓' : 'غير متوازن ✗'}\n`;
      
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

  const saveAccountProgress = (accountCode: string) => {
    const account = selectedAccounts.find(acc => acc.code === accountCode);
    if (!account) return;

    const balance = calculateBalance(account);
    
    const savedAccount: SavedLedgerAccount = {
      code: account.code,
      name: account.name,
      type: account.type,
      entries: account.entries.map(entry => ({
        id: entry.id,
        date: entry.date,
        entryNumber: entry.entryNumber,
        description: entry.description,
        amount: entry.amount,
        side: entry.side
      })),
      finalBalance: balance.transferredBalance,
      finalBalanceSide: balance.transferredBalanceSide
    };

    const updatedSession = {
      ...sessionData,
      ledgerData: {
        ...sessionData.ledgerData,
        [accountCode]: savedAccount
      }
    };

    onUpdateSessionData(updatedSession);
    
    toast({
      title: "تم الحفظ بنجاح",
      description: `تم حفظ بيانات حساب ${account.name}`,
    });
  };

  // تصفية القيود حسب البحث
  const filteredTransactions = sessionData.transactions.filter(transaction => 
    searchQuery === '' || 
    transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.entryId.includes(searchQuery) ||
    transaction.date.includes(searchQuery) ||
    transaction.lines.some(line => 
      line.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      line.accountCode.includes(searchQuery)
    )
  );

  // إذا كان المستخدم في العرض التفصيلي، اعرض مكون المراجعة
  if (showDetailedView) {
    return (
      <Stage3LedgerReview
        sessionData={sessionData}
        onBackToPosting={() => setShowDetailedView(false)}
        onStageComplete={onStageComplete}
        postingProgress={postingProgress}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-border rounded-lg p-6 -m-6 mb-4">
            <CardTitle className="flex items-center gap-2 text-3xl font-bold mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
              ترحيل القيود إلى دفتر الأستاذ
            </CardTitle>
            
            {/* Stage Connection Info */}
            <div className="bg-white/80 dark:bg-card/80 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                    مصدر البيانات
                  </span>
                  <span>تم استقبال {sessionData.transactions.length} قيد يومي من المرحلة السابقة</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                قم بسحب كل قيد يومي وإفلاته في الجانب المناسب (مدين أو دائن) لكل حساب في دفتر الأستاذ.
                سيتم حساب الرصيد المرحل تلقائياً بطرح القيمة الأقل من القيمة الأعلى.
              </p>
            </div>

            {/* Balance Calculation Explanation */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                 <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                   طريقة حساب الرصيد
                 </span>
               </div>
               <p className="text-xs text-muted-foreground">
                 الرصيد المرحل = |إجمالي المدين - إجمالي الدائن| + جهة الرصيد (مدين أو دائن)
               </p>
             </div>

             {/* Progress Indicator */}
             <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
               <div className="flex items-center gap-2 mb-3">
                 <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                   تقدم الترحيل
                 </span>
                 <span className="text-sm font-medium">{postingCompletion.toFixed(1)}%</span>
                 {isPostingComplete && (
                   <CheckCircle className="h-4 w-4 text-green-500" />
                 )}
               </div>
               <Progress value={postingCompletion} className="mb-2" />
               <p className="text-xs text-muted-foreground">
                 {isPostingComplete 
                   ? 'تم إكمال ترحيل جميع القيود! يمكنك الآن مراجعة دفتر الأستاذ النهائي'
                   : 'قم بترحيل جميع القيود لإكمال هذه المرحلة'
                 }
               </p>
             </div>

            {/* Next Stage Preview */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  المرحلة التالية
                </span>
                <span className="text-sm font-medium">إعداد ميزان المراجعة</span>
              </div>
              <p className="text-xs text-muted-foreground">
                الأرصدة المحسوبة هنا ستظهر تلقائياً في ميزان المراجعة للمرحلة التالية
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Split View Layout with Sticky Left Panel */}
          <div className="flex min-h-[600px] rounded-lg border">
            {/* Left Panel - Journal Entries (Sticky) */}
            <div className="w-[400px] sticky top-0 h-screen overflow-y-auto border-r border-border bg-background">
              <div className="h-full flex flex-col p-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    القيود اليومية
                  </h3>
                  
                  {/* Search Bar */}
                  <div className="relative mb-4">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="البحث في القيود (البيان، رقم القيد، التاريخ، اسم الحساب...)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    عدد القيود: {filteredTransactions.length} من أصل {sessionData.transactions.length}
                  </div>
                </div>
                
                {/* Journal Entries List */}
                <div className="flex-1 space-y-2 overflow-y-auto scrollbar-thin scrollbar-track-muted scrollbar-thumb-muted-foreground">
                  {filteredTransactions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchQuery ? 'لا توجد نتائج للبحث' : 'لا توجد قيود مسجلة بعد'}
                    </div>
                  ) : (
                     filteredTransactions.map((transaction, index) => {
                       const postedAccounts = postingProgress.get(transaction.entryId) || new Set();
                       const uniqueAccounts = new Set(transaction.lines.map((line: any) => line.accountCode));
                       const maxPostings = uniqueAccounts.size;
                       const currentPostings = postedAccounts.size;
                       
                       return (
                         <JournalEntryCard
                           key={transaction.entryId}
                           transaction={transaction}
                           index={sessionData.transactions.findIndex(t => t.entryId === transaction.entryId)}
                           onDragStart={handleDragStart}
                           postingProgress={currentPostings}
                           maxPostings={maxPostings}
                         />
                       );
                     })
                  )}
                </div>
                
                {/* Adjusting Entries Section */}
                <div className="mt-6 pt-4 border-t border-border">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    قيود التسوية
                  </h3>
                  
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">سيتم إضافة قيود التسوية هنا لاحقاً</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Panel - Accounts and Ledger Tables */}
            <div className="flex-1 overflow-y-auto">
              <div className="h-full flex flex-col p-4">
                {/* Account Selection and Actions */}
                <div className="mb-6 flex gap-4 flex-wrap">
                  <SmartAccountCombobox
                    accounts={sortedAccounts}
                    value=""
                    onValueChange={addAccountToLedger}
                    placeholder="اختر حساب لإضافته إلى دفتر الأستاذ"
                    className="w-80"
                  />
                  
                  {isAdminMode && (
                    <Button 
                      variant="outline" 
                      className="gap-2"
                      onClick={copyAllJournalEntries}
                    >
                      <Copy className="h-4 w-4" />
                      نسخ جميع القيود
                    </Button>
                  )}

                   {isAdminMode && (
                     <Button 
                       variant="outline" 
                       className="gap-2"
                       onClick={copyFinalBalances}
                     >
                       <BarChart3 className="h-4 w-4" />
                       نسخ أرصدة الحسابات
                     </Button>
                   )}

                    <Button 
                      variant="default" 
                      className="gap-2"
                      onClick={() => setShowDetailedView(true)}
                    >
                      <BookOpen className="h-4 w-4" />
                      مراجعة دفتر الأستاذ النهائي
                    </Button>
                </div>


                {/* القسم الجديد المطور - دفتر الأستاذ التفاعلي */}
                <div className="mb-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">عرض دفتر الأستاذ المطور</h2>
                  </div>
                  
                  {/* Assets Section */}
                  <AccountTypeSection
                    typeData={{ type: 'assets', label: 'الأصول', icon: Building2, color: 'bg-blue-500' }}
                    accounts={accountsByType.assets}
                    currentIndex={accountIndices.assets}
                    onNavigate={(index) => setAccountIndices(prev => ({ ...prev, assets: index }))}
                    ledgerData={getCurrentLedgerData('assets')}
                    onDrop={handleDrop}
                    dragOverStates={dragOverStates}
                    setDragOverStates={setDragOverStates}
                    addAccountToLedger={addAccountToLedger}
                  />
                  
                  {/* Liabilities & Equity Section */}
                  <AccountTypeSection
                    typeData={{ type: 'liabilities_equity', label: 'الخصوم وحقوق الملكية', icon: CreditCard, color: 'bg-red-500' }}
                    accounts={accountsByType.liabilities_equity}
                    currentIndex={accountIndices.liabilities_equity}
                    onNavigate={(index) => setAccountIndices(prev => ({ ...prev, liabilities_equity: index }))}
                    ledgerData={getCurrentLedgerData('liabilities_equity')}
                    onDrop={handleDrop}
                    dragOverStates={dragOverStates}
                    setDragOverStates={setDragOverStates}
                    addAccountToLedger={addAccountToLedger}
                  />
                  
                  {/* Revenue Section */}
                  <AccountTypeSection
                    typeData={{ type: 'revenue', label: 'الإيرادات', icon: TrendingUp, color: 'bg-green-500' }}
                    accounts={accountsByType.revenue}
                    currentIndex={accountIndices.revenue}
                    onNavigate={(index) => setAccountIndices(prev => ({ ...prev, revenue: index }))}
                    ledgerData={getCurrentLedgerData('revenue')}
                    onDrop={handleDrop}
                    dragOverStates={dragOverStates}
                    setDragOverStates={setDragOverStates}
                    addAccountToLedger={addAccountToLedger}
                  />
                  
                  {/* Expense Section */}
                  <AccountTypeSection
                    typeData={{ type: 'expense', label: 'المصروفات', icon: TrendingDown, color: 'bg-orange-500' }}
                    accounts={accountsByType.expense}
                    currentIndex={accountIndices.expense}
                    onNavigate={(index) => setAccountIndices(prev => ({ ...prev, expense: index }))}
                    ledgerData={getCurrentLedgerData('expense')}
                    onDrop={handleDrop}
                    dragOverStates={dragOverStates}
                    setDragOverStates={setDragOverStates}
                    addAccountToLedger={addAccountToLedger}
                  />
                </div>

                {/* منطقة البطاقات - تعرض دائماً */}
                <div className="flex-1 overflow-y-auto">
                  {/* البطاقات - تظهر دائماً */}
                  <div className="space-y-6">
                    <div className="text-center py-4 text-muted-foreground">
                      {selectedAccounts.length === 0 
                        ? "ابدأ بإضافة الحسابات إلى دفتر الأستاذ من القائمة أعلاه" 
                        : "اسحب القيود إلى الحسابات أدناه أو قم بتصفح جداول دفتر الأستاذ في الأسفل"}
                    </div>
                    
                    {/* الحسابات المستخدمة مقسمة حسب النوع */}
                    <div className="space-y-6">
                      {(() => {
                        // الحصول على الحسابات المستخدمة فقط
                        const usedAccountCodes = new Set<string>();
                        sessionData.transactions.forEach(transaction => {
                          transaction.lines.forEach(line => {
                            usedAccountCodes.add(line.accountCode);
                          });
                        });
                        
                        const usedAccounts = chartOfAccounts.filter(account => 
                          usedAccountCodes.has(account.code)
                        );

                        // تجميع الحسابات حسب النوع
                        const assetAccounts = usedAccounts.filter(acc => acc.type === 'Asset');
                        const liabilityEquityAccounts = usedAccounts.filter(acc => 
                          acc.type === 'Liability' || acc.type === 'Equity'
                        );
                        const revenueAccounts = usedAccounts.filter(acc => acc.type === 'Revenue');
                        const expenseAccounts = usedAccounts.filter(acc => acc.type === 'Expense');

                        return (
                          <>
                            {/* Assets Section */}
                            {assetAccounts.length > 0 && (
                              <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                                  الأصول 
                                  <span className="text-sm bg-primary/10 px-2 py-1 rounded-full">
                                    {assetAccounts.length}
                                  </span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {assetAccounts
                                    .sort((a, b) => a.name.localeCompare(b.name, 'ar'))
                                    .map((account) => {
                                      const accountEntries = selectedAccounts.find(acc => acc.code === account.code)?.entries || [];
                                      const accountBalance = calculateBalance({ code: account.code, name: account.name, type: account.type, entries: accountEntries });
                                      return (
                                        <AccountDropCard
                                          key={account.code}
                                          accountName={account.name}
                                          accountCode={account.code}
                                          onDrop={handleDrop}
                                          dragOverStates={dragOverStates}
                                          setDragOverStates={setDragOverStates}
                                          addAccountToLedger={addAccountToLedger}
                                          entries={accountEntries}
                                          accountBalance={accountBalance}
                                        />
                                      );
                                    })
                                  }
                                </div>
                              </div>
                            )}

                            {/* Liabilities & Equity Section */}
                            {liabilityEquityAccounts.length > 0 && (
                              <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                                  الخصوم وحقوق الملكية 
                                  <span className="text-sm bg-primary/10 px-2 py-1 rounded-full">
                                    {liabilityEquityAccounts.length}
                                  </span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {liabilityEquityAccounts
                                    .sort((a, b) => a.name.localeCompare(b.name, 'ar'))
                                    .map((account) => {
                                      const accountEntries = selectedAccounts.find(acc => acc.code === account.code)?.entries || [];
                                      const accountBalance = calculateBalance({ code: account.code, name: account.name, type: account.type, entries: accountEntries });
                                      return (
                                        <AccountDropCard
                                          key={account.code}
                                          accountName={account.name}
                                          accountCode={account.code}
                                          onDrop={handleDrop}
                                          dragOverStates={dragOverStates}
                                          setDragOverStates={setDragOverStates}
                                          addAccountToLedger={addAccountToLedger}
                                          entries={accountEntries}
                                          accountBalance={accountBalance}
                                        />
                                      );
                                    })
                                  }
                                </div>
                              </div>
                            )}

                            {/* Revenues Section */}
                            {revenueAccounts.length > 0 && (
                              <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                                  الإيرادات 
                                  <span className="text-sm bg-primary/10 px-2 py-1 rounded-full">
                                    {revenueAccounts.length}
                                  </span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {revenueAccounts
                                    .sort((a, b) => a.name.localeCompare(b.name, 'ar'))
                                    .map((account) => {
                                      const accountEntries = selectedAccounts.find(acc => acc.code === account.code)?.entries || [];
                                      const accountBalance = calculateBalance({ code: account.code, name: account.name, type: account.type, entries: accountEntries });
                                      return (
                                        <AccountDropCard
                                          key={account.code}
                                          accountName={account.name}
                                          accountCode={account.code}
                                          onDrop={handleDrop}
                                          dragOverStates={dragOverStates}
                                          setDragOverStates={setDragOverStates}
                                          addAccountToLedger={addAccountToLedger}
                                          entries={accountEntries}
                                          accountBalance={accountBalance}
                                        />
                                      );
                                    })
                                  }
                                </div>
                              </div>
                            )}

                            {/* Expenses Section */}
                            {expenseAccounts.length > 0 && (
                              <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                                  المصروفات 
                                  <span className="text-sm bg-primary/10 px-2 py-1 rounded-full">
                                    {expenseAccounts.length}
                                  </span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {expenseAccounts
                                    .sort((a, b) => a.name.localeCompare(b.name, 'ar'))
                                    .map((account) => {
                                      const accountEntries = selectedAccounts.find(acc => acc.code === account.code)?.entries || [];
                                      const accountBalance = calculateBalance({ code: account.code, name: account.name, type: account.type, entries: accountEntries });
                                      return (
                                        <AccountDropCard
                                          key={account.code}
                                          accountName={account.name}
                                          accountCode={account.code}
                                          onDrop={handleDrop}
                                          dragOverStates={dragOverStates}
                                          setDragOverStates={setDragOverStates}
                                          addAccountToLedger={addAccountToLedger}
                                          entries={accountEntries}
                                          accountBalance={accountBalance}
                                        />
                                      );
                                    })
                                  }
                                </div>
                              </div>
                            )}

                            {/* رسالة في حالة عدم وجود حسابات مستخدمة */}
                            {usedAccounts.length === 0 && (
                              <div className="text-center py-8 text-muted-foreground">
                                <div className="mb-2">لا توجد حسابات مستخدمة في القيود بعد</div>
                                <div className="text-sm">ابدأ بإنشاء القيود في المراحل السابقة</div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* زر إكمال المرحلة */}
                  <div className="flex justify-center pt-8 border-t border-border">
                    <Button onClick={onStageComplete} size="lg" className="px-8">
                      إكمال المرحلة
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Stage3PostToLedger;
