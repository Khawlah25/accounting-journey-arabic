// تعريف أنواع البيانات للنظام المحاسبي

export interface Company {
  companyId: string;
  name: string;
  activity: string;
  capitalSAR: number;
  employees: number;
  fiscalMonth: string;
  establishedDate: string;
}

export interface Account {
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  parentCode?: string;
  normalBalance: 'Debit' | 'Credit';
}

export interface JournalEntry {
  entryId: string;
  date: string;
  description: string;
  reference?: string;
  lines: JournalLine[];
  isAdjusting?: boolean;
  amount?: number;
  transactionType?: string;
  clientSupplier?: string;
  details?: string;
  source?: 'generated' | 'uploaded'; // مصدر العملية
  status?: string; // حالة العملية للعمليات المرفوعة
  hasErrors?: boolean; // هل تحتوي على أخطاء
}

export interface JournalLine {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface LedgerAccount {
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  entries: LedgerEntry[];
  balance: number;
  normalBalance: 'Debit' | 'Credit';
}

export interface LedgerEntry {
  date: string;
  description: string;
  entryId: string;
  debit: number;
  credit: number;
  balance: number;
}

// إضافة واجهات جديدة للعرض التفصيلي لدفتر الأستاذ
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

export interface TrialBalance {
  accountCode: string;
  accountName: string;
  debitBalance: number;
  creditBalance: number;
}

export interface FinancialStatement {
  incomeStatement: IncomeStatementItem[];
  balanceSheet: BalanceSheetItem[];
  netIncome: number;
  totalAssets: number;
  totalLiabilitiesAndEquity: number;
}

export interface IncomeStatementItem {
  accountName: string;
  amount: number;
  type: 'Revenue' | 'Expense';
}

export interface BalanceSheetItem {
  accountName: string;
  amount: number;
  type: 'Asset' | 'Liability' | 'Equity';
}

// Manual Financial Statements Data
export interface ManualIncomeStatementItem {
  id: string;
  name: string;
  amount: number;
}

export interface ManualBalanceSheetItem {
  id: string;
  name: string;
  amount: number;
}

export interface ManualIncomeStatement {
  revenues: ManualIncomeStatementItem[];
  expenses: ManualIncomeStatementItem[];
  totalRevenues: number;
  totalExpenses: number;
  netIncome: number;
}

export interface ManualBalanceSheet {
  assets: ManualBalanceSheetItem[];
  liabilities: ManualBalanceSheetItem[];
  equity: ManualBalanceSheetItem[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
}

export type AccountingPeriod = 'q1' | 'q2' | 'q3' | 'q4' | 'full-year';

export interface ManualFinancialStatements {
  incomeStatement?: ManualIncomeStatement;
  balanceSheet?: ManualBalanceSheet;
}

export interface SessionData {
  sessionId: string;
  companyId: string;
  company: Company;
  chartOfAccounts: Account[];
  transactions: JournalEntry[];
  currentStage: number;
  progress: {
    [key: number]: boolean;
  };
  userAnswers: {
    [key: string]: any;
  };
  ledgerData?: {
    [accountCode: string]: SavedLedgerAccount;
  };
  adjustingEntries?: {
    [entryId: string]: AdjustingEntry[];
  };
  manualFinancialStatements?: ManualFinancialStatements;
  auditResults?: AuditResult[];
  auditSummary?: AuditSummary;
  stage3AccountSummary?: {
    [accountCode: string]: {
      accountCode: string;
      accountName: string;
      totalDebits: number;
      totalCredits: number;
      finalBalance: number;
      balanceSide: 'debit' | 'credit';
    };
  };
  createdAt: string;
  lastUpdated: string;
  currentPeriod: AccountingPeriod;
}

export interface SavedLedgerAccount {
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  entries: SavedLedgerEntry[];
  finalBalance: number;
  finalBalanceSide: 'debit' | 'credit';
}

export interface SavedLedgerEntry {
  id: string;
  date: string;
  entryNumber: string;
  description: string;
  amount: number;
  side: 'debit' | 'credit';
}

export type StageType = 
  | 'identify-transactions'
  | 'journal-entries' 
  | 'journal-analysis'
  | 'post-to-ledger'
  | 'trial-balance'
  | 'worksheet'
  | 'adjusting-entries'
  | 'adjusting-entries-1'
  | 'post-adjustment-trial-balance'
  | 'financial-statements';

export interface Stage {
  id: number;
  type: StageType;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  suggestions: string[];
  score?: number;
}

export interface AdjustingEntry {
  id: string;
  type: 'accrued-expense' | 'accrued-revenue' | 'deferred-expense' | 'deferred-revenue' | 'depreciation';
  description: string;
  amount: number;
  affectedAccounts: {
    debit: string;
    credit: string;
  };
  explanation: string;
}

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