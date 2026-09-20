// نظام التسميات المختصرة للحسابات المحاسبية
import { Account } from '@/types/accounting';

// خريطة التسميات المختصرة
export const accountShortNames: Record<string, string> = {
  // الأصول المتداولة
  '1110': 'الصندوق',
  '1120': 'البنك',
  '1210': 'العملاء',
  '1220': 'أوراق القبض',
  '1219': 'مخصص الديون المشكوك فيها',
  '1310': 'إيرادات مستحقة',
  '1320': 'المخزون',
  '1330': 'مخزون المواد الخام',
  '1410': 'مصروفات مدفوعة مقدماً',
  '1420': 'إيجار مدفوع مقدماً',

  // الأصول الثابتة
  '1510': 'الأراضي',
  '1520': 'المباني',
  '1521': 'مجمع إهلاك المباني',
  '1530': 'الأثاث والتجهيزات',
  '1531': 'مجمع إهلاك الأثاث',
  '1540': 'أجهزة الحاسب',
  '1541': 'مجمع إهلاك أجهزة الحاسب',
  '1550': 'وسائل النقل',
  '1551': 'مجمع إهلاك وسائل النقل',

  // الخصوم المتداولة
  '2110': 'الموردون',
  '2120': 'أوراق الدفع',
  '2210': 'رواتب مستحقة',
  '2220': 'مصروفات مستحقة',
  '2230': 'ضريبة القيمة المضافة',
  '2240': 'ضريبة الدخل',
  '2310': 'إيرادات مقدمة',
  '2410': 'مصروفات مستحقة',

  // الخصوم طويلة الأجل
  '2510': 'قروض طويلة الأجل',
  '2520': 'قروض البنوك',

  // حقوق الملكية
  '3110': 'رأس المال',
  '3120': 'الاحتياطي القانوني',
  '3130': 'الأرباح المحتجزة',
  '3140': 'أرباح السنة الحالية',

  // الإيرادات
  '4110': 'المبيعات',
  '4120': 'الخدمات',
  '4130': 'الاستشارات',
  '4140': 'إيرادات أخرى',
  '4150': 'إيرادات فوائد',

  // المصروفات
  '5110': 'تكلفة المبيعات',
  '5210': 'الرواتب',
  '5220': 'بدلات الموظفين',
  '5230': 'التأمين الاجتماعي',
  '5310': 'الإيجار',
  '5320': 'الكهرباء والماء',
  '5330': 'الاتصالات',
  '5340': 'التنظيف',
  '5710': 'التسويق والإعلان',
  '5720': 'السفر والانتقال',
  '5730': 'الضيافة',
  '5740': 'القرطاسية',
  '5410': 'مصروف الإيجار',
  '5420': 'مصروف التأمين',
  '5510': 'الإهلاك',
  '5520': 'الصيانة',
  '5530': 'الديون المعدومة',
  '5540': 'مصروفات بنكية',
  '5610': 'مصروفات أخرى'
};

// الكلمات المفتاحية الإضافية للبحث
export const searchKeywords: Record<string, string[]> = {
  '1110': ['نقد', 'كاش', 'صندوق', 'نقدية'],
  '1120': ['بنك', 'حساب بنكي', 'نقدية بنك'],
  '1210': ['عملاء', 'مدينون', 'عميل', 'مدين'],
  '1320': ['مخزون', 'بضاعة', 'سلع', 'مخزن'],
  '2110': ['موردون', 'دائنون', 'مورد', 'دائن'],
  '4110': ['مبيعات', 'ايرادات مبيعات', 'دخل المبيعات'],
  '5110': ['تكلفة', 'تكلفة بضاعة', 'كلفة'],
  '5210': ['رواتب', 'اجور', 'راتب', 'اجر', 'موظفين'],
  '5310': ['ايجار', 'اجار', 'إيجار المكاتب'],
  '5410': ['مصروف ايجار', 'مصروف اجار']
};

// دالة لحساب المسافة النصية (Levenshtein Distance) المبسطة
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

// دالة تطبيع النص العربي للبحث
function normalizeArabicText(text: string): string {
  return text
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ىي]/g, 'ي')
    .replace(/[ؤ]/g, 'و')
    .replace(/[ئ]/g, 'ء')
    .replace(/[ة]/g, 'ه')
    .replace(/[\u064B-\u065F]/g, '') // إزالة التشكيل
    .toLowerCase()
    .trim();
}

// دالة للحصول على الاسم المختصر
export function getShortAccountName(accountCode: string): string {
  return accountShortNames[accountCode] || accountCode;
}

// دالة للحصول على الاسم الكامل مع المختصر
export function getDisplayAccountName(account: Account): string {
  const shortName = getShortAccountName(account.code);
  return shortName;
}

// دالة للحصول على الاسم مع السياق
export function getAccountNameWithContext(account: Account): string {
  const shortName = getShortAccountName(account.code);
  return `${shortName} (${account.name})`;
}

// دالة البحث الذكي مع تصحيح الأخطاء
export function smartAccountSearch(accounts: Account[], searchTerm: string): Account[] {
  if (!searchTerm.trim()) return accounts;

  const normalizedSearch = normalizeArabicText(searchTerm);
  const results: Array<{ account: Account; score: number }> = [];

  accounts.forEach(account => {
    const shortName = getShortAccountName(account.code);
    const normalizedShortName = normalizeArabicText(shortName);
    const normalizedFullName = normalizeArabicText(account.name);
    const keywords = searchKeywords[account.code] || [];
    
    let score = 0;

    // البحث في الاسم المختصر - أولوية عالية
    if (normalizedShortName.includes(normalizedSearch)) {
      score += 100;
    } else if (normalizedShortName.startsWith(normalizedSearch)) {
      score += 80;
    } else {
      // حساب المسافة النصية للاسم المختصر
      const distance = levenshteinDistance(normalizedSearch, normalizedShortName);
      if (distance <= 2 && normalizedSearch.length > 2) {
        score += 60 - (distance * 10);
      }
    }

    // البحث في الاسم الكامل - أولوية متوسطة
    if (normalizedFullName.includes(normalizedSearch)) {
      score += 50;
    } else if (normalizedFullName.startsWith(normalizedSearch)) {
      score += 40;
    }

    // البحث في الكلمات المفتاحية - أولوية متوسطة
    keywords.forEach(keyword => {
      const normalizedKeyword = normalizeArabicText(keyword);
      if (normalizedKeyword.includes(normalizedSearch)) {
        score += 30;
      } else if (normalizedKeyword.startsWith(normalizedSearch)) {
        score += 25;
      }
    });

    // البحث في رمز الحساب - أولوية منخفضة (للمطورين فقط)
    if (account.code.includes(searchTerm)) {
      score += 20;
    }

    if (score > 0) {
      results.push({ account, score });
    }
  });

  // ترتيب النتائج حسب النقاط
  return results
    .sort((a, b) => b.score - a.score)
    .map(result => result.account);
}

// دالة للحصول على أيقونة نوع الحساب
export function getAccountTypeIcon(type: Account['type']): string {
  const icons = {
    'Asset': '🏢',
    'Liability': '📋',
    'Equity': '💰',
    'Revenue': '📈',
    'Expense': '📉'
  };
  return icons[type] || '📄';
}

// دالة للحصول على لون نوع الحساب
export function getAccountTypeColor(type: Account['type']): string {
  const colors = {
    'Asset': 'text-blue-600',
    'Liability': 'text-red-600',
    'Equity': 'text-green-600',
    'Revenue': 'text-emerald-600',
    'Expense': 'text-orange-600'
  };
  return colors[type] || 'text-gray-600';
}

// دالة لتجميع الحسابات حسب النوع
export function groupAccountsByType(accounts: Account[]): Record<string, Account[]> {
  return accounts.reduce((groups, account) => {
    const type = account.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(account);
    return groups;
  }, {} as Record<string, Account[]>);
}

// دالة للحصول على تسمية نوع الحساب
export function getAccountTypeLabel(type: Account['type']): string {
  const typeLabels = {
    'Asset': 'أصول',
    'Liability': 'خصوم',
    'Equity': 'حقوق ملكية',
    'Revenue': 'إيرادات',
    'Expense': 'مصروفات'
  };
  return typeLabels[type];
}