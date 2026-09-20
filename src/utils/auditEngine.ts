import { JournalEntry, Account, SessionData } from '@/types/accounting';

// أنواع البيانات لنظام التدقيق
export interface AuditResult {
  entryId: string;
  entryNumber: number;
  date: string;
  description: string;
  isValid: boolean;
  warnings: AuditWarning[];
  errors: AuditError[];
  accountImpacts: AccountImpact[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
}

export interface AccountImpact {
  accountCode: string;
  accountName: string;
  accountType: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  normalBalance: 'Debit' | 'Credit';
  previousBalance: number;
  entryAmount: number;
  entrySide: 'Debit' | 'Credit';
  newBalance: number;
  changeType: 'increase' | 'decrease';
  isLogical: boolean;
  reasoningNote: string;
}

export interface AuditWarning {
  type: 'balance_warning' | 'amount_warning' | 'logic_warning';
  message: string;
  accountCode?: string;
  suggestion: string;
}

export interface AuditError {
  type: 'negative_balance' | 'unbalanced_entry' | 'invalid_account';
  message: string;
  accountCode?: string;
  correction: string;
}

export interface AuditSummary {
  totalEntries: number;
  validEntries: number;
  entriesWithWarnings: number;
  entriesWithErrors: number;
  overallScore: number;
  criticalIssues: string[];
}

// قاموس الحسابات المحظورة من الأرصدة السالبة
const ACCOUNTS_NO_NEGATIVE_BALANCE = [
  'النقد والصندوق',
  'البنك',
  'المخزون',
  'المدينون',
  'الأصول',
  'الأصول الثابتة',
  'أصول',
  'صندوق',
  'بنك',
  'مخزون',
  'مدينون'
];

// محرك التدقيق الذكي
export class FinancialAuditEngine {
  private chartOfAccounts: Account[];
  private accountBalances: Map<string, number> = new Map();

  constructor(sessionData: SessionData) {
    this.chartOfAccounts = sessionData.chartOfAccounts;
    this.initializeAccountBalances();
  }

  // تهيئة أرصدة الحسابات
  private initializeAccountBalances() {
    this.chartOfAccounts.forEach(account => {
      this.accountBalances.set(account.code, 0);
    });
  }

  // الحصول على معلومات الحساب
  private getAccountInfo(accountCode: string): Account | undefined {
    return this.chartOfAccounts.find(acc => acc.code === accountCode);
  }

  // حساب تأثير القيد على الحساب
  private calculateAccountImpact(
    accountCode: string,
    accountName: string,
    debitAmount: number,
    creditAmount: number
  ): AccountImpact {
    const account = this.getAccountInfo(accountCode);
    const previousBalance = this.accountBalances.get(accountCode) || 0;
    
    if (!account) {
      return {
        accountCode,
        accountName,
        accountType: 'Asset',
        normalBalance: 'Debit',
        previousBalance,
        entryAmount: debitAmount || creditAmount,
        entrySide: debitAmount > 0 ? 'Debit' : 'Credit',
        newBalance: previousBalance,
        changeType: 'increase',
        isLogical: false,
        reasoningNote: 'حساب غير موجود في دليل الحسابات'
      };
    }

    let newBalance = previousBalance;
    let changeType: 'increase' | 'decrease' = 'increase';
    let entryAmount = 0;
    let entrySide: 'Debit' | 'Credit' = 'Debit';

    // تطبيق قواعد المحاسبة
    if (debitAmount > 0) {
      entryAmount = debitAmount;
      entrySide = 'Debit';
      
      if (account.normalBalance === 'Debit') {
        // زيادة في حساب طبيعته مدينة
        newBalance = previousBalance + debitAmount;
        changeType = 'increase';
      } else {
        // نقصان في حساب طبيعته دائنة
        newBalance = previousBalance - debitAmount;
        changeType = 'decrease';
      }
    } else if (creditAmount > 0) {
      entryAmount = creditAmount;
      entrySide = 'Credit';
      
      if (account.normalBalance === 'Credit') {
        // زيادة في حساب طبيعته دائنة
        newBalance = previousBalance + creditAmount;
        changeType = 'increase';
      } else {
        // نقصان في حساب طبيعته مدينة
        newBalance = previousBalance - creditAmount;
        changeType = 'decrease';
      }
    }

    // تحديث رصيد الحساب
    this.accountBalances.set(accountCode, newBalance);

    // فحص منطقية التغيير
    const isLogical = this.validateAccountLogic(account, newBalance, changeType, entryAmount);
    const reasoningNote = this.generateReasoningNote(account, previousBalance, newBalance, changeType, isLogical);

    return {
      accountCode,
      accountName,
      accountType: account.type,
      normalBalance: account.normalBalance,
      previousBalance,
      entryAmount,
      entrySide,
      newBalance,
      changeType,
      isLogical,
      reasoningNote
    };
  }

  // فحص منطقية الحساب
  private validateAccountLogic(
    account: Account,
    newBalance: number,
    changeType: 'increase' | 'decrease',
    amount: number
  ): boolean {
    // فحص الرصيد السالب للحسابات المحظورة
    if (newBalance < 0) {
      const isProhibited = ACCOUNTS_NO_NEGATIVE_BALANCE.some(prohibitedName => 
        account.name.includes(prohibitedName) || prohibitedName.includes(account.name)
      );
      
      if (isProhibited) {
        return false;
      }
    }

    // فحص التغيرات الكبيرة نسبياً
    const previousBalance = newBalance - (changeType === 'increase' ? amount : -amount);
    if (previousBalance !== 0) {
      const changePercentage = Math.abs(amount / previousBalance) * 100;
      if (changePercentage > 1000) { // تغيير أكثر من 1000%
        return false;
      }
    }

    return true;
  }

  // إنشاء ملاحظة التفسير
  private generateReasoningNote(
    account: Account,
    previousBalance: number,
    newBalance: number,
    changeType: 'increase' | 'decrease',
    isLogical: boolean
  ): string {
    if (!isLogical) {
      if (newBalance < 0 && account.type === 'Asset') {
        return `تحذير: رصيد سالب في حساب ${account.name} وهو حساب أصول`;
      }
      return 'تغيير غير منطقي في رصيد الحساب';
    }

    const balanceDirection = account.normalBalance === 'Debit' ? 'مدين' : 'دائن';
    const changeDirection = changeType === 'increase' ? 'زيادة' : 'نقصان';
    
    return `${changeDirection} في حساب ${account.name} (طبيعته ${balanceDirection}) من ${previousBalance.toLocaleString()} إلى ${newBalance.toLocaleString()}`;
  }

  // تدقيق قيد محاسبي واحد
  public auditJournalEntry(entry: JournalEntry, entryNumber: number): AuditResult {
    const warnings: AuditWarning[] = [];
    const errors: AuditError[] = [];
    const accountImpacts: AccountImpact[] = [];

    let totalDebit = 0;
    let totalCredit = 0;

    // تحليل كل سطر في القيد
    entry.lines.forEach(line => {
      totalDebit += line.debit;
      totalCredit += line.credit;

      // حساب تأثير على الحساب
      const impact = this.calculateAccountImpact(
        line.accountCode,
        line.accountName,
        line.debit,
        line.credit
      );

      accountImpacts.push(impact);

      // فحص الأخطاء والتحذيرات
      if (!impact.isLogical) {
        if (impact.newBalance < 0 && impact.accountType === 'Asset') {
          errors.push({
            type: 'negative_balance',
            message: `رصيد سالب في حساب الأصول: ${impact.accountName}`,
            accountCode: impact.accountCode,
            correction: 'راجع مبلغ القيد أو اختر الحساب الصحيح'
          });
        } else {
          warnings.push({
            type: 'logic_warning',
            message: `تغيير غير عادي في حساب: ${impact.accountName}`,
            accountCode: impact.accountCode,
            suggestion: 'تحقق من صحة المبلغ ونوع العملية'
          });
        }
      }

      // فحص الحساب غير الموجود
      if (!this.getAccountInfo(impact.accountCode)) {
        errors.push({
          type: 'invalid_account',
          message: `حساب غير موجود: ${impact.accountName}`,
          accountCode: impact.accountCode,
          correction: 'أضف الحساب لدليل الحسابات أو اختر حساب موجود'
        });
      }
    });

    // فحص توازن القيد
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
    if (!isBalanced) {
      errors.push({
        type: 'unbalanced_entry',
        message: `القيد غير متوازن: مدين ${totalDebit.toLocaleString()} - دائن ${totalCredit.toLocaleString()}`,
        correction: 'تأكد من تساوي إجمالي المدين مع إجمالي الدائن'
      });
    }

    // فحص مبالغ كبيرة غير عادية
    const maxAmount = Math.max(totalDebit, totalCredit);
    if (maxAmount > 1000000) { // أكثر من مليون
      warnings.push({
        type: 'amount_warning',
        message: `مبلغ كبير في القيد: ${maxAmount.toLocaleString()}`,
        suggestion: 'تحقق من صحة المبلغ'
      });
    }

    return {
      entryId: entry.entryId,
      entryNumber,
      date: entry.date,
      description: entry.description,
      isValid: errors.length === 0,
      warnings,
      errors,
      accountImpacts,
      totalDebit,
      totalCredit,
      isBalanced
    };
  }

  // تدقيق جميع القيود
  public auditAllEntries(transactions: JournalEntry[]): AuditResult[] {
    // إعادة تهيئة الأرصدة
    this.initializeAccountBalances();
    
    return transactions.map((entry, index) => 
      this.auditJournalEntry(entry, index + 1)
    );
  }

  // إنشاء ملخص التدقيق
  public generateAuditSummary(auditResults: AuditResult[]): AuditSummary {
    const totalEntries = auditResults.length;
    const validEntries = auditResults.filter(result => result.isValid).length;
    const entriesWithWarnings = auditResults.filter(result => result.warnings.length > 0).length;
    const entriesWithErrors = auditResults.filter(result => result.errors.length > 0).length;

    const overallScore = totalEntries > 0 ? (validEntries / totalEntries) * 100 : 100;

    const criticalIssues: string[] = [];
    auditResults.forEach(result => {
      result.errors.forEach(error => {
        if (error.type === 'negative_balance' || error.type === 'unbalanced_entry') {
          criticalIssues.push(`قيد ${result.entryNumber}: ${error.message}`);
        }
      });
    });

    return {
      totalEntries,
      validEntries,
      entriesWithWarnings,
      entriesWithErrors,
      overallScore: Math.round(overallScore),
      criticalIssues: criticalIssues.slice(0, 5) // أهم 5 مشاكل
    };
  }
}

// وظيفة مساعدة لتشغيل التدقيق
export function performFinancialAudit(sessionData: SessionData): {
  auditResults: AuditResult[];
  auditSummary: AuditSummary;
} {
  const auditEngine = new FinancialAuditEngine(sessionData);
  const auditResults = auditEngine.auditAllEntries(sessionData.transactions);
  const auditSummary = auditEngine.generateAuditSummary(auditResults);

  return { auditResults, auditSummary };
}