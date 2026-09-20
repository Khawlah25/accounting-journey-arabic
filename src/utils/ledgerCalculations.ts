import { JournalEntry, JournalLine, Account } from '@/types/accounting';

export interface DetailedLedgerEntry {
  id: string;
  date: string;
  entryNumber: string;
  contraAccount: string;
  description: string;
  amount: number;
  side: 'debit' | 'credit';
  cumulativeBalance: number;
  balanceSide: 'debit' | 'credit';
}

export interface DetailedLedgerAccount {
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  normalBalance: 'Debit' | 'Credit';
  entries: DetailedLedgerEntry[];
  finalBalance: number;
  finalBalanceSide: 'debit' | 'credit';
  debitTotal: number;
  creditTotal: number;
}

/**
 * حساب الطرف المقابل لحساب معين في قيد معين
 */
export function getContraAccount(journalEntry: JournalEntry, targetAccountCode: string, accounts?: Account[]): string {
  const otherLines = journalEntry.lines.filter(line => line.accountCode !== targetAccountCode);
  
  if (otherLines.length === 0) return '-';
  
  if (otherLines.length === 1) {
    const contraAccount = accounts?.find(acc => acc.code === otherLines[0].accountCode);
    return contraAccount ? contraAccount.name : otherLines[0].accountName || otherLines[0].accountCode;
  }
  
  // إذا كان هناك أكثر من حساب مقابل
  return 'قيود متعددة';
}

/**
 * حساب الرصيد التراكمي لحساب معين
 */
export function calculateCumulativeBalance(
  entries: DetailedLedgerEntry[],
  normalBalance: 'Debit' | 'Credit'
): DetailedLedgerEntry[] {
  let runningBalance = 0;
  
  return entries.map(entry => {
    if (entry.side === 'debit') {
      runningBalance += entry.amount;
    } else {
      runningBalance -= entry.amount;
    }
    
    // تحديد جهة الرصيد بناءً على الطبيعة العادية للحساب
    let balanceSide: 'debit' | 'credit';
    let displayBalance = Math.abs(runningBalance);
    
    if (normalBalance === 'Debit') {
      balanceSide = runningBalance >= 0 ? 'debit' : 'credit';
    } else {
      balanceSide = runningBalance <= 0 ? 'credit' : 'debit';
    }
    
    return {
      ...entry,
      cumulativeBalance: displayBalance,
      balanceSide
    };
  });
}

/**
 * تحويل البيانات إلى صيغة دفتر الأستاذ التفصيلي
 */
export function generateDetailedLedger(
  journalEntries: JournalEntry[],
  accounts: Account[],
  accountsWithEntries: string[]
): DetailedLedgerAccount[] {
  const detailedLedgerAccounts: DetailedLedgerAccount[] = [];
  
  accountsWithEntries.forEach(accountCode => {
    const account = accounts.find(acc => acc.code === accountCode);
    if (!account) return;
    
    const accountEntries: DetailedLedgerEntry[] = [];
    let debitTotal = 0;
    let creditTotal = 0;
    
    // جمع جميع القيود المتعلقة بهذا الحساب
    journalEntries.forEach(journalEntry => {
      const relevantLines = journalEntry.lines.filter(line => line.accountCode === accountCode);
      
      relevantLines.forEach(line => {
        const amount = line.debit || line.credit;
        const side: 'debit' | 'credit' = line.debit > 0 ? 'debit' : 'credit';
        
        if (side === 'debit') {
          debitTotal += amount;
        } else {
          creditTotal += amount;
        }
        
        const contraAccount = getContraAccount(journalEntry, accountCode, accounts);
        
        accountEntries.push({
          id: `${journalEntry.entryId}-${line.accountCode}`,
          date: journalEntry.date,
          entryNumber: journalEntry.entryId,
          contraAccount,
          description: line.description || journalEntry.description,
          amount,
          side,
          cumulativeBalance: 0, // سيتم حسابه لاحقاً
          balanceSide: 'debit' // سيتم تحديده لاحقاً
        });
      });
    });
    
    // ترتيب القيود حسب التاريخ ورقم القيد
    accountEntries.sort((a, b) => {
      const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateComparison !== 0) return dateComparison;
      return a.entryNumber.localeCompare(b.entryNumber);
    });
    
    // حساب الرصيد التراكمي
    const entriesWithBalance = calculateCumulativeBalance(accountEntries, account.normalBalance);
    
    // حساب الرصيد النهائي
    const finalBalanceAmount = Math.abs(debitTotal - creditTotal);
    let finalBalanceSide: 'debit' | 'credit';
    
    if (account.normalBalance === 'Debit') {
      finalBalanceSide = debitTotal >= creditTotal ? 'debit' : 'credit';
    } else {
      finalBalanceSide = creditTotal >= debitTotal ? 'credit' : 'debit';
    }
    
    detailedLedgerAccounts.push({
      code: account.code,
      name: account.name,
      type: account.type,
      normalBalance: account.normalBalance,
      entries: entriesWithBalance,
      finalBalance: finalBalanceAmount,
      finalBalanceSide,
      debitTotal,
      creditTotal
    });
  });
  
  return detailedLedgerAccounts;
}

/**
 * حساب نسبة اكتمال الترحيل
 */
export function calculatePostingCompletion(
  postingProgress: Map<string, Set<string>>,
  journalEntries: JournalEntry[]
): number {
  if (journalEntries.length === 0) return 0;
  
  let totalRequiredPostings = 0;
  let completedPostings = 0;
  
  journalEntries.forEach(entry => {
    const uniqueAccounts = new Set(entry.lines.map(line => line.accountCode));
    totalRequiredPostings += uniqueAccounts.size;
    
    const postedAccounts = postingProgress.get(entry.entryId) || new Set();
    completedPostings += postedAccounts.size;
  });
  
  return totalRequiredPostings > 0 ? (completedPostings / totalRequiredPostings) * 100 : 0;
}