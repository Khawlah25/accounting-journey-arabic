// مولد البيانات للمحاكاة المحاسبية

import { Company, Account, JournalEntry, AdjustingEntry } from '@/types/accounting';

// بيانات الشركات المتاحة
const companyProfiles = {
  'al-taqaddum': {
    companyId: 'al-taqaddum',
    name: 'شركة التقدم التقنية المحدودة',
    activity: 'تطوير البرمجيات والحلول التقنية',
    capitalSAR: 150000,
    employees: 8,
    fiscalMonth: 'ديسمبر',
    establishedDate: '2025-01-01'
  },
  'al-fajr': {
    companyId: 'al-fajr',
    name: 'شركة الفجر للتطوير العقاري المحدودة',
    activity: 'التطوير العقاري والمقاولات',
    capitalSAR: 2500000,
    employees: 25,
    fiscalMonth: 'ديسمبر',
    establishedDate: '2025-01-01'
  },
  'al-raida-trading': {
    companyId: 'al-raida-trading',
    name: 'شركة الرائدة للتجارة المحدودة',
    activity: 'تجارة الجملة والتجزئة للسلع الاستهلاكية',
    capitalSAR: 500000,
    employees: 15,
    fiscalMonth: 'ديسمبر',
    establishedDate: '2025-01-01'
  },
  'al-sinaaat-advanced': {
    companyId: 'al-sinaaat-advanced',
    name: 'شركة الصناعات المتقدمة المحدودة',
    activity: 'تصنيع وإنتاج المواد البلاستيكية والتعبئة',
    capitalSAR: 1200000,
    employees: 35,
    fiscalMonth: 'ديسمبر',
    establishedDate: '2025-01-01'
  }
};

// دليل الحسابات الموحد
const chartOfAccounts: Account[] = [
  // الأصول المتداولة
  { code: '1110', name: 'النقدية في الصندوق', type: 'Asset', normalBalance: 'Debit' },
  { code: '1120', name: 'النقدية في البنك', type: 'Asset', normalBalance: 'Debit' },
  { code: '1210', name: 'العملاء والمدينون', type: 'Asset', normalBalance: 'Debit' },
  { code: '1220', name: 'أوراق القبض', type: 'Asset', normalBalance: 'Debit' },
  { code: '1219', name: 'مخصص الديون المشكوك فيها', type: 'Asset', normalBalance: 'Credit' },
  { code: '1310', name: 'إيرادات مستحقة', type: 'Asset', normalBalance: 'Debit' },
  { code: '1320', name: 'المخزون السلعي', type: 'Asset', normalBalance: 'Debit' },
  { code: '1330', name: 'مخزون المواد الخام', type: 'Asset', normalBalance: 'Debit' },
  { code: '1410', name: 'مصروفات مدفوعة مقدماً', type: 'Asset', normalBalance: 'Debit' },
  { code: '1420', name: 'الإيجار المدفوع مقدماً', type: 'Asset', normalBalance: 'Debit' },
  
  // الأصول الثابتة
  { code: '1510', name: 'الأراضي', type: 'Asset', normalBalance: 'Debit' },
  { code: '1520', name: 'المباني', type: 'Asset', normalBalance: 'Debit' },
  { code: '1521', name: 'مجمع إهلاك المباني', type: 'Asset', normalBalance: 'Credit' },
  { code: '1530', name: 'الأثاث والتجهيزات', type: 'Asset', normalBalance: 'Debit' },
  { code: '1531', name: 'مجمع إهلاك الأثاث', type: 'Asset', normalBalance: 'Credit' },
  { code: '1540', name: 'أجهزة الحاسب الآلي', type: 'Asset', normalBalance: 'Debit' },
  { code: '1541', name: 'مجمع إهلاك أجهزة الحاسب', type: 'Asset', normalBalance: 'Credit' },
  { code: '1550', name: 'وسائل النقل', type: 'Asset', normalBalance: 'Debit' },
  { code: '1551', name: 'مجمع إهلاك وسائل النقل', type: 'Asset', normalBalance: 'Credit' },
  
  // أصول عقارية خاصة
  { code: '1610', name: 'مشاريع تحت التنفيذ', type: 'Asset', normalBalance: 'Debit' },
  { code: '1620', name: 'أراضي للتطوير', type: 'Asset', normalBalance: 'Debit' },
  { code: '1630', name: 'وحدات سكنية جاهزة للبيع', type: 'Asset', normalBalance: 'Debit' },
  
  // حسابات المخزون للقطاع التجاري
  { code: '1340', name: 'مخزون البضائع الجاهزة للبيع', type: 'Asset', normalBalance: 'Debit' },
  { code: '1350', name: 'مردودات ومسموحات المشتريات', type: 'Asset', normalBalance: 'Debit' },
  
  // حسابات المخزون للقطاع الصناعي
  { code: '1341', name: 'مخزون الإنتاج تحت التشغيل', type: 'Asset', normalBalance: 'Debit' },
  { code: '1342', name: 'مخزون المنتجات التامة الصنع', type: 'Asset', normalBalance: 'Debit' },
  
  // آلات ومعدات الإنتاج
  { code: '1560', name: 'آلات ومعدات الإنتاج', type: 'Asset', normalBalance: 'Debit' },
  { code: '1561', name: 'مجمع إهلاك آلات الإنتاج', type: 'Asset', normalBalance: 'Credit' },
  
  // الخصوم المتداولة
  { code: '2110', name: 'الموردون والدائنون', type: 'Liability', normalBalance: 'Credit' },
  { code: '2120', name: 'أوراق الدفع', type: 'Liability', normalBalance: 'Credit' },
  { code: '2140', name: 'مقدمات من العملاء', type: 'Liability', normalBalance: 'Credit' },
  { code: '2150', name: 'مستحقات المقاولين', type: 'Liability', normalBalance: 'Credit' },
  { code: '2210', name: 'الرواتب والأجور المستحقة', type: 'Liability', normalBalance: 'Credit' },
  { code: '2220', name: 'المصروفات المستحقة', type: 'Liability', normalBalance: 'Credit' },
  { code: '2230', name: 'ضريبة القيمة المضافة', type: 'Liability', normalBalance: 'Credit' },
  { code: '2240', name: 'ضريبة الدخل المستحقة', type: 'Liability', normalBalance: 'Credit' },
  { code: '2310', name: 'إيرادات مقدمة', type: 'Liability', normalBalance: 'Credit' },
  { code: '2410', name: 'مصروفات مستحقة', type: 'Liability', normalBalance: 'Credit' },
  
  // الخصوم طويلة الأجل
  { code: '2510', name: 'القروض طويلة الأجل', type: 'Liability', normalBalance: 'Credit' },
  { code: '2520', name: 'قروض البنوك', type: 'Liability', normalBalance: 'Credit' },
  { code: '2530', name: 'قروض التطوير العقاري', type: 'Liability', normalBalance: 'Credit' },
  
  // حقوق الملكية
  { code: '3110', name: 'رأس المال', type: 'Equity', normalBalance: 'Credit' },
  { code: '3120', name: 'الاحتياطي القانوني', type: 'Equity', normalBalance: 'Credit' },
  { code: '3130', name: 'الأرباح المحتجزة', type: 'Equity', normalBalance: 'Credit' },
  { code: '3140', name: 'أرباح السنة الحالية', type: 'Equity', normalBalance: 'Credit' },
  
  // الإيرادات
  { code: '4110', name: 'إيرادات المبيعات', type: 'Revenue', normalBalance: 'Credit' },
  { code: '4120', name: 'إيرادات الخدمات', type: 'Revenue', normalBalance: 'Credit' },
  { code: '4130', name: 'إيرادات الاستشارات', type: 'Revenue', normalBalance: 'Credit' },
  { code: '4140', name: 'إيرادات أخرى', type: 'Revenue', normalBalance: 'Credit' },
  { code: '4150', name: 'إيرادات فوائد', type: 'Revenue', normalBalance: 'Credit' },
  { code: '4210', name: 'إيرادات بيع العقارات', type: 'Revenue', normalBalance: 'Credit' },
  
  // إيرادات ومردودات التجارة
  { code: '4160', name: 'مردودات ومسموحات المبيعات', type: 'Revenue', normalBalance: 'Debit' },
  { code: '4170', name: 'خصم المبيعات', type: 'Revenue', normalBalance: 'Debit' },
  
  // المصروفات
  { code: '5110', name: 'تكلفة البضاعة المباعة', type: 'Expense', normalBalance: 'Debit' },
  { code: '5115', name: 'المشتريات', type: 'Expense', normalBalance: 'Debit' },
  { code: '5116', name: 'خصم المشتريات', type: 'Expense', normalBalance: 'Credit' },
  { code: '5117', name: 'مصروفات النقل والشحن', type: 'Expense', normalBalance: 'Debit' },
  
  // تكاليف الإنتاج للقطاع الصناعي
  { code: '5120', name: 'تكلفة المواد المباشرة', type: 'Expense', normalBalance: 'Debit' },
  { code: '5130', name: 'تكلفة العمالة المباشرة', type: 'Expense', normalBalance: 'Debit' },
  { code: '5140', name: 'التكاليف الصناعية غير المباشرة', type: 'Expense', normalBalance: 'Debit' },
  { code: '5210', name: 'رواتب وأجور الموظفين', type: 'Expense', normalBalance: 'Debit' },
  { code: '5220', name: 'بدلات الموظفين', type: 'Expense', normalBalance: 'Debit' },
  { code: '5230', name: 'التأمين الاجتماعي', type: 'Expense', normalBalance: 'Debit' },
  { code: '5310', name: 'إيجار المكاتب', type: 'Expense', normalBalance: 'Debit' },
  { code: '5320', name: 'خدمات الكهرباء والماء', type: 'Expense', normalBalance: 'Debit' },
  { code: '5330', name: 'خدمات الاتصالات', type: 'Expense', normalBalance: 'Debit' },
  { code: '5340', name: 'خدمات التنظيف', type: 'Expense', normalBalance: 'Debit' },
  { code: '5410', name: 'مصروف الإيجار', type: 'Expense', normalBalance: 'Debit' },
  { code: '5420', name: 'مصروف التأمين', type: 'Expense', normalBalance: 'Debit' },
  { code: '5510', name: 'مصروف الإهلاك', type: 'Expense', normalBalance: 'Debit' },
  { code: '5520', name: 'مصروفات الصيانة', type: 'Expense', normalBalance: 'Debit' },
  { code: '5530', name: 'مصروف الديون المعدومة', type: 'Expense', normalBalance: 'Debit' },
  { code: '5540', name: 'مصروفات بنكية', type: 'Expense', normalBalance: 'Debit' },
  { code: '5610', name: 'مصروفات أخرى', type: 'Expense', normalBalance: 'Debit' },
  { code: '5710', name: 'مصروفات التسويق والإعلان', type: 'Expense', normalBalance: 'Debit' },
  { code: '5720', name: 'مصروفات السفر والانتقال', type: 'Expense', normalBalance: 'Debit' },
  { code: '5730', name: 'مصروفات الضيافة', type: 'Expense', normalBalance: 'Debit' },
  { code: '5740', name: 'مصروفات القرطاسية', type: 'Expense', normalBalance: 'Debit' },
  { code: '5810', name: 'تكلفة المشاريع المباعة', type: 'Expense', normalBalance: 'Debit' },
  { code: '5820', name: 'أتعاب المهندسين والاستشاريين', type: 'Expense', normalBalance: 'Debit' },
  { code: '5830', name: 'مصروفات التراخيص والموافقات', type: 'Expense', normalBalance: 'Debit' }
];

// الحصول على قائمة الشركات المتاحة
export function getAvailableCompanies(): Company[] {
  return Object.values(companyProfiles);
}

// تعيين بيانات الشركة حسب المعرف
export function generateCompany(companyId: string = 'al-taqaddum'): Company {
  const profile = companyProfiles[companyId as keyof typeof companyProfiles];
  if (!profile) {
    throw new Error(`معرف الشركة غير صحيح: ${companyId}`);
  }
  return { ...profile };
}

// الحصول على دليل الحسابات
export function getChartOfAccounts(): Account[] {
  return [...chartOfAccounts];
}

// تصدير دليل الحسابات كذلك للتوافق العكسي
export { chartOfAccounts };

// توليد العمليات المالية حسب الشركة
export function generateTransactions(company: Company): JournalEntry[] {
  switch (company.companyId) {
    case 'al-fajr':
      return generateAlFajrTransactions(company);
    case 'al-raida-trading':
      return generateAlRaidaTradingTransactions(company);
    case 'al-sinaaat-advanced':
      return generateAlSinaaatAdvancedTransactions(company);
    case 'al-taqaddum':
    default:
      return generateAlTaqaddumTransactions(company);
  }
}

// العمليات المالية لشركة التقدم التقنية (الشركة الأصلية)
function generateAlTaqaddumTransactions(company: Company): JournalEntry[] {
  const transactions: JournalEntry[] = [
    // يناير - 14 عملية
    {
      entryId: 'D001',
      date: '2025-01-01',
      description: 'إيداع رأس المال في الحساب البنكي',
      reference: 'D001',
      amount: 105000,
      transactionType: 'إيداع رأس المال',
      clientSupplier: 'البنك الأهلي السعودي',
      details: 'إيداع رأس المال في الحساب البنكي للشركة',
      lines: [
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 105000,
          credit: 0,
          description: 'إيداع رأس المال في البنك'
        },
        {
          accountCode: '3110',
          accountName: 'رأس المال',
          debit: 0,
          credit: 105000,
          description: 'رأس المال المدفوع'
        }
      ]
    },
    {
      entryId: 'D002',
      date: '2025-01-01',
      description: 'إيداع رأس المال نقداً في الصندوق',
      reference: 'D002',
      amount: 45000,
      transactionType: 'إيداع رأس المال',
      clientSupplier: 'النقدية',
      details: 'إيداع رأس المال نقداً في صندوق الشركة',
      lines: [
        {
          accountCode: '1110',
          accountName: 'النقدية في الصندوق',
          debit: 45000,
          credit: 0,
          description: 'إيداع رأس المال نقداً'
        },
        {
          accountCode: '3110',
          accountName: 'رأس المال',
          debit: 0,
          credit: 45000,
          description: 'رأس المال المدفوع'
        }
      ]
    },
    {
      entryId: 'F001',
      date: '2025-01-02',
      description: 'سداد إيجار المكتب عن يناير',
      reference: 'F001',
      amount: 20000,
      transactionType: 'سداد إيجار',
      clientSupplier: 'شركة العقارات المتقدمة',
      details: 'سداد إيجار مكتب الشركة لشهر يناير 2025',
      lines: [
        {
          accountCode: '5310',
          accountName: 'إيجار المكاتب',
          debit: 20000,
          credit: 0,
          description: 'إيجار شهر يناير'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 20000,
          description: 'سداد الإيجار'
        }
      ]
    },
    {
      entryId: 'F002',
      date: '2025-01-03',
      description: 'شراء أثاث مكتبي',
      reference: 'F002',
      amount: 15000,
      transactionType: 'شراء أصول',
      clientSupplier: 'مؤسسة الأثاث الحديث',
      details: 'شراء مكاتب وكراسي ومعدات مكتبية',
      lines: [
        {
          accountCode: '1530',
          accountName: 'الأثاث والتجهيزات',
          debit: 15000,
          credit: 0,
          description: 'أثاث مكتبي'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 15000,
          description: 'دفع ثمن الأثاث'
        }
      ]
    },
    {
      entryId: 'F003',
      date: '2025-01-03',
      description: 'شراء أجهزة حاسب ومعدات تقنية',
      reference: 'F003',
      amount: 25000,
      transactionType: 'شراء أصول',
      clientSupplier: 'شركة جرير للتقنية',
      details: 'شراء أجهزة حاسب آلي وطابعات وسيرفر',
      lines: [
        {
          accountCode: '1540',
          accountName: 'أجهزة الحاسب الآلي',
          debit: 25000,
          credit: 0,
          description: 'أجهزة حاسب آلي'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 25000,
          description: 'دفع ثمن الأجهزة'
        }
      ]
    },
    {
      entryId: 'F004',
      date: '2025-01-05',
      description: 'شراء اشتراك برنامج Zoho One',
      reference: 'F004',
      amount: 3000,
      transactionType: 'شراء برمجيات',
      clientSupplier: 'Zoho Corporation',
      details: 'اشتراك سنوي في منصة إدارة الأعمال Zoho One',
      lines: [
        {
          accountCode: '1410',
          accountName: 'المصروفات المدفوعة مقدماً',
          debit: 3000,
          credit: 0,
          description: 'اشتراك سنوي'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 3000,
          description: 'دفع الاشتراك'
        }
      ]
    },
    {
      entryId: 'I001',
      date: '2025-01-05',
      description: 'فاتورة بيع خدمات تطوير موقع إلكتروني',
      reference: 'I001',
      amount: 45000,
      transactionType: 'مبيعات خدمات',
      clientSupplier: 'شركة المستقبل للتجارة',
      details: 'تطوير موقع إلكتروني متكامل مع نظام إدارة المحتوى',
      lines: [
        {
          accountCode: '1210',
          accountName: 'العملاء والمدينون',
          debit: 45000,
          credit: 0,
          description: 'فاتورة العميل'
        },
        {
          accountCode: '4120',
          accountName: 'إيرادات الخدمات',
          debit: 0,
          credit: 45000,
          description: 'إيراد خدمات تطوير'
        }
      ]
    },
    {
      entryId: 'R001',
      date: '2025-01-10',
      description: 'تحصيل مبلغ من العميل نقداً',
      reference: 'R001',
      amount: 20000,
      transactionType: 'تحصيل مبيعات',
      clientSupplier: 'شركة المستقبل للتجارة',
      details: 'تحصيل جزء من قيمة فاتورة I001',
      lines: [
        {
          accountCode: '1110',
          accountName: 'النقدية في الصندوق',
          debit: 20000,
          credit: 0,
          description: 'تحصيل نقدي'
        },
        {
          accountCode: '1210',
          accountName: 'العملاء والمدينون',
          debit: 0,
          credit: 20000,
          description: 'تحصيل من العميل'
        }
      ]
    },
    {
      entryId: 'F005',
      date: '2025-01-12',
      description: 'سداد راتب مطور البرمجيات',
      reference: 'F005',
      amount: 12000,
      transactionType: 'سداد رواتب',
      clientSupplier: 'أحمد محمد العلي',
      details: 'راتب شهر يناير للمطور الرئيسي',
      lines: [
        {
          accountCode: '5210',
          accountName: 'رواتب وأجور الموظفين',
          debit: 12000,
          credit: 0,
          description: 'راتب المطور'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 12000,
          description: 'سداد الراتب'
        }
      ]
    },
    {
      entryId: 'F006',
      date: '2025-01-12',
      description: 'سداد راتب مصمم الجرافيك',
      reference: 'F006',
      amount: 8000,
      transactionType: 'سداد رواتب',
      clientSupplier: 'سارة عبدالله القحطاني',
      details: 'راتب شهر يناير لمصممة الجرافيك',
      lines: [
        {
          accountCode: '5210',
          accountName: 'رواتب وأجور الموظفين',
          debit: 8000,
          credit: 0,
          description: 'راتب المصممة'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 8000,
          description: 'سداد الراتب'
        }
      ]
    },
    {
      entryId: 'F007',
      date: '2025-01-15',
      description: 'دفع فاتورة كهرباء وماء',
      reference: 'F007',
      amount: 800,
      transactionType: 'دفع خدمات',
      clientSupplier: 'الشركة السعودية للكهرباء',
      details: 'فاتورة استهلاك الكهرباء والماء لشهر ديسمبر',
      lines: [
        {
          accountCode: '5320',
          accountName: 'خدمات الكهرباء والماء',
          debit: 800,
          credit: 0,
          description: 'فاتورة الكهرباء والماء'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 800,
          description: 'سداد الفاتورة'
        }
      ]
    },
    {
      entryId: 'F008',
      date: '2025-01-20',
      description: 'شراء مواد تسويقية وإعلانية',
      reference: 'F008',
      amount: 2500,
      transactionType: 'مصروفات تسويق',
      clientSupplier: 'مطبعة الإبداع',
      details: 'طباعة بروشورات وكروت أعمال ولافتات',
      lines: [
        {
          accountCode: '5410',
          accountName: 'مصروفات التسويق والإعلان',
          debit: 2500,
          credit: 0,
          description: 'مواد تسويقية'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 2500,
          description: 'دفع تكلفة المواد'
        }
      ]
    },
    {
      entryId: 'I002',
      date: '2025-01-25',
      description: 'فاتورة بيع استشارات تقنية',
      reference: 'I002',
      amount: 18000,
      transactionType: 'مبيعات خدمات',
      clientSupplier: 'مؤسسة الابتكار التجاري',
      details: 'استشارات تقنية لتطوير نظام إدارة المخزون',
      lines: [
        {
          accountCode: '1210',
          accountName: 'العملاء والمدينون',
          debit: 18000,
          credit: 0,
          description: 'فاتورة استشارات'
        },
        {
          accountCode: '4130',
          accountName: 'إيرادات الاستشارات',
          debit: 0,
          credit: 18000,
          description: 'إيراد استشارات تقنية'
        }
      ]
    },
    {
      entryId: 'L001',
      date: '2025-01-28',
      description: 'قرض من بنك الراجحي',
      reference: 'L001',
      amount: 150000,
      transactionType: 'قرض بنكي',
      clientSupplier: 'بنك الراجحي',
      details: 'قرض تشغيلي من بنك الراجحي تم إيداعه في الحساب البنكي',
      lines: [
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 150000,
          credit: 0,
          description: 'إيداع قرض بنك الراجحي'
        },
        {
          accountCode: '2510',
          accountName: 'القروض طويلة الأجل',
          debit: 0,
          credit: 150000,
          description: 'قرض من بنك الراجحي'
        }
      ]
    },
    {
      entryId: 'A001',
      date: '2025-01-31',
      description: 'تسجيل إهلاك شهري للأصول',
      reference: 'A001',
      amount: 1500,
      transactionType: 'قيد إهلاك',
      clientSupplier: '',
      details: 'إهلاك شهري للأثاث والمعدات وأجهزة الحاسب',
      lines: [
        {
          accountCode: '5510',
          accountName: 'مصروف الإهلاك',
          debit: 1500,
          credit: 0,
          description: 'إهلاك الأصول'
        },
        {
          accountCode: '1531',
          accountName: 'مجمع إهلاك الأثاث',
          debit: 0,
          credit: 750,
          description: 'إهلاك الأثاث'
        },
        {
          accountCode: '1541',
          accountName: 'مجمع إهلاك أجهزة الحاسب',
          debit: 0,
          credit: 750,
          description: 'إهلاك أجهزة الحاسب'
        }
      ]
    },

    // فبراير - 14 عملية
    {
      entryId: 'F009',
      date: '2025-02-01',
      description: 'سداد إيجار المكتب عن فبراير',
      reference: 'F009',
      amount: 20000,
      transactionType: 'سداد إيجار',
      clientSupplier: 'شركة العقارات المتقدمة',
      details: 'سداد إيجار مكتب الشركة لشهر فبراير 2025',
      lines: [
        {
          accountCode: '5310',
          accountName: 'إيجار المكاتب',
          debit: 20000,
          credit: 0,
          description: 'إيجار شهر فبراير'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 20000,
          description: 'سداد الإيجار'
        }
      ]
    },
    {
      entryId: 'R002',
      date: '2025-02-05',
      description: 'تحصيل باقي مبلغ من العميل',
      reference: 'R002',
      amount: 25000,
      transactionType: 'تحصيل مبيعات',
      clientSupplier: 'شركة المستقبل للتجارة',
      details: 'تحصيل باقي قيمة فاتورة I001',
      lines: [
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 25000,
          credit: 0,
          description: 'تحصيل من العميل'
        },
        {
          accountCode: '1210',
          accountName: 'العملاء والمدينون',
          debit: 0,
          credit: 25000,
          description: 'تحصيل حساب العميل'
        }
      ]
    },
    {
      entryId: 'F010',
      date: '2025-02-08',
      description: 'شراء تأمين شامل للمكتب',
      reference: 'F010',
      amount: 4500,
      transactionType: 'شراء تأمين',
      clientSupplier: 'شركة الأهلي للتأمين',
      details: 'بوليصة تأمين شاملة للمكتب والمعدات لمدة سنة',
      lines: [
        {
          accountCode: '1410',
          accountName: 'المصروفات المدفوعة مقدماً',
          debit: 4500,
          credit: 0,
          description: 'تأمين مدفوع مقدماً'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 4500,
          description: 'دفع التأمين'
        }
      ]
    },
    {
      entryId: 'I003',
      date: '2025-02-10',
      description: 'فاتورة بيع تطبيق جوال',
      reference: 'I003',
      amount: 35000,
      transactionType: 'مبيعات خدمات',
      clientSupplier: 'شركة الرياض للخدمات',
      details: 'تطوير تطبيق جوال لخدمة العملاء',
      lines: [
        {
          accountCode: '1210',
          accountName: 'العملاء والمدينون',
          debit: 35000,
          credit: 0,
          description: 'فاتورة تطبيق جوال'
        },
        {
          accountCode: '4120',
          accountName: 'إيرادات الخدمات',
          debit: 0,
          credit: 35000,
          description: 'إيراد تطوير تطبيق'
        }
      ]
    },
    {
      entryId: 'F011',
      date: '2025-02-12',
      description: 'سداد رواتب الموظفين لشهر فبراير',
      reference: 'F011',
      amount: 20000,
      transactionType: 'سداد رواتب',
      clientSupplier: 'موظفو الشركة',
      details: 'رواتب جميع الموظفين لشهر فبراير',
      lines: [
        {
          accountCode: '5210',
          accountName: 'رواتب وأجور الموظفين',
          debit: 20000,
          credit: 0,
          description: 'رواتب فبراير'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 20000,
          description: 'سداد الرواتب'
        }
      ]
    },
    {
      entryId: 'F012',
      date: '2025-02-15',
      description: 'دفع فاتورة الإنترنت والاتصالات',
      reference: 'F012',
      amount: 1200,
      transactionType: 'دفع خدمات',
      clientSupplier: 'شركة الاتصالات السعودية',
      details: 'فاتورة خدمات الإنترنت والهاتف لشهر يناير',
      lines: [
        {
          accountCode: '5330',
          accountName: 'خدمات الاتصالات',
          debit: 1200,
          credit: 0,
          description: 'فاتورة الاتصالات'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 1200,
          description: 'سداد الفاتورة'
        }
      ]
    },
    {
      entryId: 'R003',
      date: '2025-02-18',
      description: 'تحصيل مبلغ من استشارات تقنية',
      reference: 'R003',
      amount: 18000,
      transactionType: 'تحصيل مبيعات',
      clientSupplier: 'مؤسسة الابتكار التجاري',
      details: 'تحصيل قيمة فاتورة الاستشارات I002',
      lines: [
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 18000,
          credit: 0,
          description: 'تحصيل استشارات'
        },
        {
          accountCode: '1210',
          accountName: 'العملاء والمدينون',
          debit: 0,
          credit: 18000,
          description: 'تحصيل من العميل'
        }
      ]
    },
    {
      entryId: 'F013',
      date: '2025-02-20',
      description: 'صرف مصروفات سفر لاجتماع عميل',
      reference: 'F013',
      amount: 1800,
      transactionType: 'مصروفات سفر',
      clientSupplier: 'شركة طيران ناس',
      details: 'تذاكر طيران وإقامة لاجتماع مع عميل في جدة',
      lines: [
        {
          accountCode: '5720',
          accountName: 'مصروفات السفر والانتقال',
          debit: 1800,
          credit: 0,
          description: 'مصروفات سفر'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 1800,
          description: 'دفع مصروفات السفر'
        }
      ]
    },
    {
      entryId: 'I004',
      date: '2025-02-25',
      description: 'فاتورة بيع نظام إدارة مخزون',
      reference: 'I004',
      amount: 28000,
      transactionType: 'مبيعات خدمات',
      clientSupplier: 'مجموعة النخبة التجارية',
      details: 'تطوير نظام إدارة مخزون متكامل',
      lines: [
        {
          accountCode: '1210',
          accountName: 'العملاء والمدينون',
          debit: 28000,
          credit: 0,
          description: 'فاتورة نظام مخزون'
        },
        {
          accountCode: '4120',
          accountName: 'إيرادات الخدمات',
          debit: 0,
          credit: 28000,
          description: 'إيراد نظام مخزون'
        }
      ]
    },
    {
      entryId: 'F014',
      date: '2025-02-28',
      description: 'شراء ترخيص برنامج Adobe Creative Suite',
      reference: 'F014',
      amount: 2200,
      transactionType: 'شراء برمجيات',
      clientSupplier: 'Adobe Systems',
      details: 'ترخيص سنوي لبرامج التصميم والإبداع',
      lines: [
        {
          accountCode: '1410',
          accountName: 'المصروفات المدفوعة مقدماً',
          debit: 2200,
          credit: 0,
          description: 'ترخيص Adobe'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 2200,
          description: 'دفع الترخيص'
        }
      ]
    },
    {
      entryId: 'F015',
      date: '2025-02-28',
      description: 'شراء لوازم مكتبية',
      reference: 'F015',
      amount: 1500,
      transactionType: 'شراء لوازم',
      clientSupplier: 'مكتبة الخليج',
      details: 'ورق وأقلام ومجلدات وأدوات مكتبية',
      lines: [
        {
          accountCode: '5740',
          accountName: 'مصروفات القرطاسية',
          debit: 1500,
          credit: 0,
          description: 'لوازم مكتبية'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 1500,
          description: 'شراء اللوازم'
        }
      ]
    },
    {
      entryId: 'F016',
      date: '2025-02-28',
      description: 'دفع رسوم خدمات بنكية',
      reference: 'F016',
      amount: 300,
      transactionType: 'رسوم بنكية',
      clientSupplier: 'البنك الأهلي السعودي',
      details: 'رسوم تحويلات وخدمات مصرفية متنوعة',
      lines: [
        {
          accountCode: '5540',
          accountName: 'مصروفات بنكية',
          debit: 300,
          credit: 0,
          description: 'رسوم بنكية'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 300,
          description: 'دفع الرسوم'
        }
      ]
    },
    {
      entryId: 'A002',
      date: '2025-02-28',
      description: 'تسجيل إهلاك شهري للأصول',
      reference: 'A002',
      amount: 1500,
      transactionType: 'قيد إهلاك',
      clientSupplier: '',
      details: 'إهلاك شهري للأثاث والمعدات وأجهزة الحاسب',
      lines: [
        {
          accountCode: '5510',
          accountName: 'مصروف الإهلاك',
          debit: 1500,
          credit: 0,
          description: 'إهلاك الأصول'
        },
        {
          accountCode: '1531',
          accountName: 'مجمع إهلاك الأثاث',
          debit: 0,
          credit: 750,
          description: 'إهلاك الأثاث'
        },
        {
          accountCode: '1541',
          accountName: 'مجمع إهلاك أجهزة الحاسب',
          debit: 0,
          credit: 750,
          description: 'إهلاك أجهزة الحاسب'
        }
      ]
    },

    // مارس - 14 عملية
    {
      entryId: 'F017',
      date: '2025-03-01',
      description: 'سداد إيجار المكتب عن مارس',
      reference: 'F017',
      amount: 20000,
      transactionType: 'سداد إيجار',
      clientSupplier: 'شركة العقارات المتقدمة',
      details: 'سداد إيجار مكتب الشركة لشهر مارس 2025',
      lines: [
        {
          accountCode: '5310',
          accountName: 'إيجار المكاتب',
          debit: 20000,
          credit: 0,
          description: 'إيجار شهر مارس'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 20000,
          description: 'سداد الإيجار'
        }
      ]
    },
    {
      entryId: 'R004',
      date: '2025-03-05',
      description: 'تحصيل دفعة أولى من تطبيق الجوال',
      reference: 'R004',
      amount: 15000,
      transactionType: 'تحصيل مبيعات',
      clientSupplier: 'شركة الرياض للخدمات',
      details: 'دفعة أولى من قيمة فاتورة I003',
      lines: [
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 15000,
          credit: 0,
          description: 'تحصيل دفعة أولى'
        },
        {
          accountCode: '1210',
          accountName: 'العملاء والمدينون',
          debit: 0,
          credit: 15000,
          description: 'تحصيل من العميل'
        }
      ]
    },
    {
      entryId: 'F018',
      date: '2025-03-08',
      description: 'شراء أجهزة لاب توب للموظفين',
      reference: 'F018',
      amount: 18000,
      transactionType: 'شراء أصول',
      clientSupplier: 'شركة إكسترا للإلكترونيات',
      details: 'شراء 3 أجهزة لاب توب للموظفين الجدد',
      lines: [
        {
          accountCode: '1540',
          accountName: 'أجهزة الحاسب الآلي',
          debit: 18000,
          credit: 0,
          description: 'أجهزة لاب توب'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 18000,
          description: 'شراء الأجهزة'
        }
      ]
    },
    {
      entryId: 'I005',
      date: '2025-03-10',
      description: 'فاتورة بيع خدمات صيانة مواقع',
      reference: 'I005',
      amount: 12000,
      transactionType: 'مبيعات خدمات',
      clientSupplier: 'شركة التطوير الرقمي',
      details: 'خدمات صيانة وتحديث مواقع إلكترونية',
      lines: [
        {
          accountCode: '1210',
          accountName: 'العملاء والمدينون',
          debit: 12000,
          credit: 0,
          description: 'فاتورة صيانة'
        },
        {
          accountCode: '4120',
          accountName: 'إيرادات الخدمات',
          debit: 0,
          credit: 12000,
          description: 'إيراد صيانة مواقع'
        }
      ]
    },
    {
      entryId: 'F019',
      date: '2025-03-12',
      description: 'سداد رواتب الموظفين لشهر مارس',
      reference: 'F019',
      amount: 22000,
      transactionType: 'سداد رواتب',
      clientSupplier: 'موظفو الشركة',
      details: 'رواتب جميع الموظفين لشهر مارس مع زيادة',
      lines: [
        {
          accountCode: '5210',
          accountName: 'رواتب وأجور الموظفين',
          debit: 22000,
          credit: 0,
          description: 'رواتب مارس'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 22000,
          description: 'سداد الرواتب'
        }
      ]
    },
    {
      entryId: 'F020',
      date: '2025-03-15',
      description: 'دفع فاتورة كهرباء وماء',
      reference: 'F020',
      amount: 950,
      transactionType: 'دفع خدمات',
      clientSupplier: 'الشركة السعودية للكهرباء',
      details: 'فاتورة استهلاك الكهرباء والماء لشهر فبراير',
      lines: [
        {
          accountCode: '5320',
          accountName: 'خدمات الكهرباء والماء',
          debit: 950,
          credit: 0,
          description: 'فاتورة الكهرباء والماء'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 950,
          description: 'سداد الفاتورة'
        }
      ]
    },
    {
      entryId: 'R005',
      date: '2025-03-18',
      description: 'تحصيل مبلغ من نظام المخزون',
      reference: 'R005',
      amount: 28000,
      transactionType: 'تحصيل مبيعات',
      clientSupplier: 'مجموعة النخبة التجارية',
      details: 'تحصيل قيمة فاتورة نظام المخزون I004',
      lines: [
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 28000,
          credit: 0,
          description: 'تحصيل نظام مخزون'
        },
        {
          accountCode: '1210',
          accountName: 'العملاء والمدينون',
          debit: 0,
          credit: 28000,
          description: 'تحصيل من العميل'
        }
      ]
    },
    {
      entryId: 'F021',
      date: '2025-03-20',
      description: 'شراء وسيلة نقل للشركة',
      reference: 'F021',
      amount: 45000,
      transactionType: 'شراء أصول',
      clientSupplier: 'معرض الجزيرة للسيارات',
      details: 'شراء سيارة للشركة لاستخدام الموظفين',
      lines: [
        {
          accountCode: '1550',
          accountName: 'وسائل النقل',
          debit: 45000,
          credit: 0,
          description: 'سيارة الشركة'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 45000,
          description: 'شراء السيارة'
        }
      ]
    },
    {
      entryId: 'I006',
      date: '2025-03-22',
      description: 'فاتورة بيع استشارات أمن سيبراني',
      reference: 'I006',
      amount: 25000,
      transactionType: 'مبيعات خدمات',
      clientSupplier: 'شركة الحماية الرقمية',
      details: 'استشارات وتقييم أمن المعلومات',
      lines: [
        {
          accountCode: '1210',
          accountName: 'العملاء والمدينون',
          debit: 25000,
          credit: 0,
          description: 'فاتورة أمن سيبراني'
        },
        {
          accountCode: '4130',
          accountName: 'إيرادات الاستشارات',
          debit: 0,
          credit: 25000,
          description: 'استشارات أمن سيبراني'
        }
      ]
    },
    {
      entryId: 'F022',
      date: '2025-03-25',
      description: 'دفع اشتراك في مؤتمر تقني',
      reference: 'F022',
      amount: 3500,
      transactionType: 'مصروفات تدريب',
      clientSupplier: 'معهد التقنية المتقدمة',
      details: 'اشتراك الموظفين في مؤتمر التكنولوجيا السنوي',
      lines: [
        {
          accountCode: '5220',
          accountName: 'بدلات الموظفين',
          debit: 3500,
          credit: 0,
          description: 'بدل تدريب'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 3500,
          description: 'دفع الاشتراك'
        }
      ]
    },
    {
      entryId: 'R006',
      date: '2025-03-28',
      description: 'تحصيل باقي مبلغ تطبيق الجوال',
      reference: 'R006',
      amount: 20000,
      transactionType: 'تحصيل مبيعات',
      clientSupplier: 'شركة الرياض للخدمات',
      details: 'تحصيل باقي قيمة فاتورة تطبيق الجوال I003',
      lines: [
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 20000,
          credit: 0,
          description: 'تحصيل باقي المبلغ'
        },
        {
          accountCode: '1210',
          accountName: 'العملاء والمدينون',
          debit: 0,
          credit: 20000,
          description: 'تحصيل من العميل'
        }
      ]
    },
    {
      entryId: 'F023',
      date: '2025-03-30',
      description: 'دفع مصروفات ضيافة للعملاء',
      reference: 'F023',
      amount: 800,
      transactionType: 'مصروفات ضيافة',
      clientSupplier: 'مطعم الأصالة',
      details: 'وجبات عمل مع العملاء واجتماعات',
      lines: [
        {
          accountCode: '5730',
          accountName: 'مصروفات الضيافة',
          debit: 800,
          credit: 0,
          description: 'ضيافة العملاء'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 800,
          description: 'دفع مصروفات الضيافة'
        }
      ]
    },
    {
      entryId: 'A003',
      date: '2025-03-31',
      description: 'تسجيل إهلاك شهري للأصول',
      reference: 'A003',
      amount: 2250,
      transactionType: 'قيد إهلاك',
      clientSupplier: '',
      details: 'إهلاك شهري للأثاث والمعدات وأجهزة الحاسب ووسائل النقل',
      lines: [
        {
          accountCode: '5510',
          accountName: 'مصروف الإهلاك',
          debit: 2250,
          credit: 0,
          description: 'إهلاك الأصول'
        },
        {
          accountCode: '1531',
          accountName: 'مجمع إهلاك الأثاث',
          debit: 0,
          credit: 750,
          description: 'إهلاك الأثاث'
        },
        {
          accountCode: '1541',
          accountName: 'مجمع إهلاك أجهزة الحاسب',
          debit: 0,
          credit: 750,
          description: 'إهلاك أجهزة الحاسب'
        },
        {
          accountCode: '1551',
          accountName: 'مجمع إهلاك وسائل النقل',
          debit: 0,
          credit: 750,
          description: 'إهلاك وسائل النقل'
        }
      ]
    }
  ];

  return transactions;
}

// العمليات المالية لشركة الفجر للتطوير العقاري (40 عملية)
function generateAlFajrTransactions(company: Company): JournalEntry[] {
  const transactions: JournalEntry[] = [
    // يناير - 15 عملية
    {
      entryId: 'FJ001',
      date: '2025-01-01',
      description: 'إيداع رأس المال في الحساب البنكي',
      reference: 'FJ001',
      amount: 1800000,
      transactionType: 'إيداع رأس المال',
      clientSupplier: 'البنك الأهلي السعودي',
      details: 'إيداع جزء من رأس المال في الحساب البنكي',
      lines: [
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 1800000,
          credit: 0,
          description: 'إيداع رأس المال'
        },
        {
          accountCode: '3110',
          accountName: 'رأس المال',
          debit: 0,
          credit: 1800000,
          description: 'رأس المال المدفوع'
        }
      ]
    },
    {
      entryId: 'FJ002',
      date: '2025-01-01',
      description: 'إيداع رأس المال نقداً في الصندوق',
      reference: 'FJ002',
      amount: 700000,
      transactionType: 'إيداع رأس المال',
      clientSupplier: 'النقدية',
      details: 'إيداع باقي رأس المال نقداً',
      lines: [
        {
          accountCode: '1110',
          accountName: 'النقدية في الصندوق',
          debit: 700000,
          credit: 0,
          description: 'إيداع رأس المال نقداً'
        },
        {
          accountCode: '3110',
          accountName: 'رأس المال',
          debit: 0,
          credit: 700000,
          description: 'رأس المال المدفوع'
        }
      ]
    },
    {
      entryId: 'FJ003',
      date: '2025-01-02',
      description: 'شراء أرض للتطوير العقاري',
      reference: 'FJ003',
      amount: 800000,
      transactionType: 'شراء أراضي',
      clientSupplier: 'مكتب العقارات الذهبية',
      details: 'شراء قطعة أرض في حي النخيل مساحة 2000 متر مربع',
      lines: [
        {
          accountCode: '1620',
          accountName: 'أراضي للتطوير',
          debit: 800000,
          credit: 0,
          description: 'أرض حي النخيل'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 800000,
          description: 'دفع ثمن الأرض'
        }
      ]
    },
    {
      entryId: 'FJ004',
      date: '2025-01-03',
      description: 'عقد مقاولة للبناء',
      reference: 'FJ004',
      amount: 300000,
      transactionType: 'عقود مقاولات',
      clientSupplier: 'شركة البناء المتقدمة',
      details: 'دفعة أولى لعقد إنشاء مجمع سكني',
      lines: [
        {
          accountCode: '1610',
          accountName: 'مشاريع تحت التنفيذ',
          debit: 300000,
          credit: 0,
          description: 'دفعة أولى للمقاول'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 300000,
          description: 'دفع للمقاول'
        }
      ]
    },
    {
      entryId: 'FJ005',
      date: '2025-01-05',
      description: 'رسوم التراخيص والموافقات',
      reference: 'FJ005',
      amount: 25000,
      transactionType: 'رسوم حكومية',
      clientSupplier: 'أمانة المدينة',
      details: 'رسوم ترخيص البناء والموافقات البلدية',
      lines: [
        {
          accountCode: '5830',
          accountName: 'مصروفات التراخيص والموافقات',
          debit: 25000,
          credit: 0,
          description: 'رسوم التراخيص'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 25000,
          description: 'دفع الرسوم'
        }
      ]
    },
    {
      entryId: 'FJ006',
      date: '2025-01-07',
      description: 'أتعاب المهندس المعماري',
      reference: 'FJ006',
      amount: 50000,
      transactionType: 'أتعاب استشارية',
      clientSupplier: 'مكتب الهندسة الحديثة',
      details: 'أتعاب تصميم المخططات المعمارية',
      lines: [
        {
          accountCode: '5820',
          accountName: 'أتعاب المهندسين والاستشاريين',
          debit: 50000,
          credit: 0,
          description: 'أتعاب المهندس المعماري'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 50000,
          description: 'دفع الأتعاب'
        }
      ]
    },
    {
      entryId: 'FJ007',
      date: '2025-01-10',
      description: 'شراء معدات البناء',
      reference: 'FJ007',
      amount: 120000,
      transactionType: 'شراء معدات',
      clientSupplier: 'شركة المعدات الثقيلة',
      details: 'شراء خلاطة خرسانة وأوناش صغيرة',
      lines: [
        {
          accountCode: '1530',
          accountName: 'الأثاث والتجهيزات',
          debit: 120000,
          credit: 0,
          description: 'معدات البناء'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 120000,
          description: 'دفع ثمن المعدات'
        }
      ]
    },
    {
      entryId: 'FJ008',
      date: '2025-01-12',
      description: 'رواتب شهر يناير للموظفين',
      reference: 'FJ008',
      amount: 85000,
      transactionType: 'سداد رواتب',
      clientSupplier: 'موظفو الشركة',
      details: 'رواتب 25 موظف لشهر يناير',
      lines: [
        {
          accountCode: '5210',
          accountName: 'رواتب وأجور الموظفين',
          debit: 85000,
          credit: 0,
          description: 'رواتب يناير'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 85000,
          description: 'دفع الرواتب'
        }
      ]
    },
    {
      entryId: 'FJ009',
      date: '2025-01-15',
      description: 'إيجار المكاتب الإدارية',
      reference: 'FJ009',
      amount: 35000,
      transactionType: 'دفع إيجار',
      clientSupplier: 'شركة العقارات التجارية',
      details: 'إيجار المكاتب الإدارية لشهر يناير',
      lines: [
        {
          accountCode: '5310',
          accountName: 'إيجار المكاتب',
          debit: 35000,
          credit: 0,
          description: 'إيجار يناير'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 35000,
          description: 'دفع الإيجار'
        }
      ]
    },
    {
      entryId: 'FJ010',
      date: '2025-01-18',
      description: 'مقدمات من العملاء',
      reference: 'FJ010',
      amount: 450000,
      transactionType: 'مقدمات عملاء',
      clientSupplier: 'عملاء المشروع السكني',
      details: 'مقدمات من العملاء لحجز الوحدات السكنية',
      lines: [
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 450000,
          credit: 0,
          description: 'تحصيل مقدمات'
        },
        {
          accountCode: '2140',
          accountName: 'مقدمات من العملاء',
          debit: 0,
          credit: 450000,
          description: 'مقدمات العملاء'
        }
      ]
    },
    {
      entryId: 'FJ011',
      date: '2025-01-20',
      description: 'فواتير الكهرباء والماء',
      reference: 'FJ011',
      amount: 8000,
      transactionType: 'دفع خدمات',
      clientSupplier: 'الشركة السعودية للكهرباء',
      details: 'فاتورة الكهرباء والماء للمكاتب وموقع البناء',
      lines: [
        {
          accountCode: '5320',
          accountName: 'خدمات الكهرباء والماء',
          debit: 8000,
          credit: 0,
          description: 'فاتورة الكهرباء والماء'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 8000,
          description: 'دفع الفاتورة'
        }
      ]
    },
    {
      entryId: 'FJ012',
      date: '2025-01-22',
      description: 'شراء مواد بناء',
      reference: 'FJ012',
      amount: 180000,
      transactionType: 'شراء مواد',
      clientSupplier: 'مؤسسة مواد البناء',
      details: 'شراء أسمنت وحديد ورمل وطوب',
      lines: [
        {
          accountCode: '1610',
          accountName: 'مشاريع تحت التنفيذ',
          debit: 180000,
          credit: 0,
          description: 'مواد البناء'
        },
        {
          accountCode: '2110',
          accountName: 'الموردون والدائنون',
          debit: 0,
          credit: 180000,
          description: 'مستحق للموردين'
        }
      ]
    },
    {
      entryId: 'FJ013',
      date: '2025-01-25',
      description: 'مصروفات تسويقية',
      reference: 'FJ013',
      amount: 15000,
      transactionType: 'مصروفات تسويق',
      clientSupplier: 'وكالة الإعلان الرقمي',
      details: 'حملة إعلانية للمشروع السكني',
      lines: [
        {
          accountCode: '5710',
          accountName: 'مصروفات التسويق والإعلان',
          debit: 15000,
          credit: 0,
          description: 'حملة إعلانية'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 15000,
          description: 'دفع تكلفة الإعلان'
        }
      ]
    },
    {
      entryId: 'FJ014',
      date: '2025-01-28',
      description: 'أتعاب الاستشاري القانوني',
      reference: 'FJ014',
      amount: 20000,
      transactionType: 'أتعاب قانونية',
      clientSupplier: 'مكتب المحاماة المتخصص',
      details: 'أتعاب إعداد العقود والوثائق القانونية',
      lines: [
        {
          accountCode: '5820',
          accountName: 'أتعاب المهندسين والاستشاريين',
          debit: 20000,
          credit: 0,
          description: 'أتعاب قانونية'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 20000,
          description: 'دفع الأتعاب'
        }
      ]
    },
    {
      entryId: 'FJ015',
      date: '2025-01-30',
      description: 'سداد جزء من مستحقات الموردين',
      reference: 'FJ015',
      amount: 100000,
      transactionType: 'سداد موردين',
      clientSupplier: 'مؤسسة مواد البناء',
      details: 'سداد جزء من قيمة مواد البناء المشتراة',
      lines: [
        {
          accountCode: '2110',
          accountName: 'الموردون والدائنون',
          debit: 100000,
          credit: 0,
          description: 'سداد للموردين'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 100000,
          description: 'دفع نقدي'
        }
      ]
    },

    // فبراير - 13 عملية
    {
      entryId: 'FJ016',
      date: '2025-02-02',
      description: 'دفعة ثانية للمقاول',
      reference: 'FJ016',
      amount: 250000,
      transactionType: 'دفع مقاولين',
      clientSupplier: 'شركة البناء المتقدمة',
      details: 'دفعة ثانية حسب تقدم العمل في المشروع',
      lines: [
        {
          accountCode: '1610',
          accountName: 'مشاريع تحت التنفيذ',
          debit: 250000,
          credit: 0,
          description: 'دفعة للمقاول'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 250000,
          description: 'دفع للمقاول'
        }
      ]
    },
    {
      entryId: 'FJ017',
      date: '2025-02-05',
      description: 'شراء أرض إضافية',
      reference: 'FJ017',
      amount: 600000,
      transactionType: 'شراء أراضي',
      clientSupplier: 'مكتب العقارات الشاملة',
      details: 'شراء قطعة أرض مجاورة للتوسع',
      lines: [
        {
          accountCode: '1620',
          accountName: 'أراضي للتطوير',
          debit: 600000,
          credit: 0,
          description: 'أرض إضافية'
        },
        {
          accountCode: '2530',
          accountName: 'قروض التطوير العقاري',
          debit: 0,
          credit: 600000,
          description: 'قرض شراء الأرض'
        }
      ]
    },
    {
      entryId: 'FJ018',
      date: '2025-02-08',
      description: 'رواتب شهر فبراير',
      reference: 'FJ018',
      amount: 85000,
      transactionType: 'سداد رواتب',
      clientSupplier: 'موظفو الشركة',
      details: 'رواتب شهر فبراير للموظفين',
      lines: [
        {
          accountCode: '5210',
          accountName: 'رواتب وأجور الموظفين',
          debit: 85000,
          credit: 0,
          description: 'رواتب فبراير'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 85000,
          description: 'دفع الرواتب'
        }
      ]
    },
    {
      entryId: 'FJ019',
      date: '2025-02-10',
      description: 'أتعاب المهندس الإنشائي',
      reference: 'FJ019',
      amount: 40000,
      transactionType: 'أتعاب استشارية',
      clientSupplier: 'مكتب الهندسة الإنشائية',
      details: 'أتعاب إعداد المخططات الإنشائية',
      lines: [
        {
          accountCode: '5820',
          accountName: 'أتعاب المهندسين والاستشاريين',
          debit: 40000,
          credit: 0,
          description: 'أتعاب إنشائية'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 40000,
          description: 'دفع الأتعاب'
        }
      ]
    },
    {
      entryId: 'FJ020',
      date: '2025-02-12',
      description: 'تأمين على المشروع',
      reference: 'FJ020',
      amount: 30000,
      transactionType: 'تأمينات',
      clientSupplier: 'شركة التأمين الشاملة',
      details: 'بوليصة تأمين شاملة على المشروع',
      lines: [
        {
          accountCode: '5420',
          accountName: 'مصروف التأمين',
          debit: 30000,
          credit: 0,
          description: 'تأمين المشروع'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 30000,
          description: 'دفع التأمين'
        }
      ]
    },
    {
      entryId: 'FJ021',
      date: '2025-02-15',
      description: 'إيجار المكاتب لشهر فبراير',
      reference: 'FJ021',
      amount: 35000,
      transactionType: 'دفع إيجار',
      clientSupplier: 'شركة العقارات التجارية',
      details: 'إيجار المكاتب الإدارية لشهر فبراير',
      lines: [
        {
          accountCode: '5310',
          accountName: 'إيجار المكاتب',
          debit: 35000,
          credit: 0,
          description: 'إيجار فبراير'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 35000,
          description: 'دفع الإيجار'
        }
      ]
    },
    {
      entryId: 'FJ022',
      date: '2025-02-18',
      description: 'شراء مواد إضافية للبناء',
      reference: 'FJ022',
      amount: 220000,
      transactionType: 'شراء مواد',
      clientSupplier: 'مؤسسة مواد البناء الحديثة',
      details: 'شراء بلاط وأدوات صحية ودهانات',
      lines: [
        {
          accountCode: '1610',
          accountName: 'مشاريع تحت التنفيذ',
          debit: 220000,
          credit: 0,
          description: 'مواد تشطيب'
        },
        {
          accountCode: '2110',
          accountName: 'الموردون والدائنون',
          debit: 0,
          credit: 220000,
          description: 'مستحق للموردين'
        }
      ]
    },
    {
      entryId: 'FJ023',
      date: '2025-02-20',
      description: 'مقدمات إضافية من العملاء',
      reference: 'FJ023',
      amount: 350000,
      transactionType: 'مقدمات عملاء',
      clientSupplier: 'عملاء جدد',
      details: 'مقدمات من عملاء جدد لحجز وحدات إضافية',
      lines: [
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 350000,
          credit: 0,
          description: 'تحصيل مقدمات'
        },
        {
          accountCode: '2140',
          accountName: 'مقدمات من العملاء',
          debit: 0,
          credit: 350000,
          description: 'مقدمات إضافية'
        }
      ]
    },
    {
      entryId: 'FJ024',
      date: '2025-02-22',
      description: 'مصروفات الوقود والمواصلات',
      reference: 'FJ024',
      amount: 12000,
      transactionType: 'مصروفات نقل',
      clientSupplier: 'محطات الوقود المختلفة',
      details: 'وقود السيارات والمعدات ونقل المواد',
      lines: [
        {
          accountCode: '5720',
          accountName: 'مصروفات السفر والانتقال',
          debit: 12000,
          credit: 0,
          description: 'وقود ومواصلات'
        },
        {
          accountCode: '1110',
          accountName: 'النقدية في الصندوق',
          debit: 0,
          credit: 12000,
          description: 'دفع نقدي'
        }
      ]
    },
    {
      entryId: 'FJ025',
      date: '2025-02-25',
      description: 'فواتير الكهرباء والماء لفبراير',
      reference: 'FJ025',
      amount: 9500,
      transactionType: 'دفع خدمات',
      clientSupplier: 'الشركة السعودية للكهرباء',
      details: 'فاتورة فبراير للكهرباء والماء',
      lines: [
        {
          accountCode: '5320',
          accountName: 'خدمات الكهرباء والماء',
          debit: 9500,
          credit: 0,
          description: 'فاتورة فبراير'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 9500,
          description: 'دفع الفاتورة'
        }
      ]
    },
    {
      entryId: 'FJ026',
      date: '2025-02-26',
      description: 'سداد باقي مستحقات الموردين',
      reference: 'FJ026',
      amount: 80000,
      transactionType: 'سداد موردين',
      clientSupplier: 'مؤسسة مواد البناء',
      details: 'سداد باقي قيمة المواد المشتراة في يناير',
      lines: [
        {
          accountCode: '2110',
          accountName: 'الموردون والدائنون',
          debit: 80000,
          credit: 0,
          description: 'سداد نهائي'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 80000,
          description: 'دفع نقدي'
        }
      ]
    },
    {
      entryId: 'FJ027',
      date: '2025-02-27',
      description: 'أجور العمالة اليومية',
      reference: 'FJ027',
      amount: 45000,
      transactionType: 'أجور عمالة',
      clientSupplier: 'عمالة المشروع',
      details: 'أجور العمالة اليومية للمشروع في فبراير',
      lines: [
        {
          accountCode: '1610',
          accountName: 'مشاريع تحت التنفيذ',
          debit: 45000,
          credit: 0,
          description: 'أجور العمالة'
        },
        {
          accountCode: '1110',
          accountName: 'النقدية في الصندوق',
          debit: 0,
          credit: 45000,
          description: 'دفع أجور نقداً'
        }
      ]
    },
    {
      entryId: 'FJ028',
      date: '2025-02-28',
      description: 'مصروفات أدوات مكتبية وقرطاسية',
      reference: 'FJ028',
      amount: 3500,
      transactionType: 'مصروفات إدارية',
      clientSupplier: 'مكتبة الرياض',
      details: 'شراء أدوات مكتبية وقرطاسية للمكاتب',
      lines: [
        {
          accountCode: '5740',
          accountName: 'مصروفات القرطاسية',
          debit: 3500,
          credit: 0,
          description: 'قرطاسية ومستلزمات'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 3500,
          description: 'دفع الفاتورة'
        }
      ]
    },

    // مارس - 12 عملية
    {
      entryId: 'FJ029',
      date: '2025-03-03',
      description: 'رواتب شهر مارس',
      reference: 'FJ029',
      amount: 85000,
      transactionType: 'سداد رواتب',
      clientSupplier: 'موظفو الشركة',
      details: 'رواتب شهر مارس للموظفين',
      lines: [
        {
          accountCode: '5210',
          accountName: 'رواتب وأجور الموظفين',
          debit: 85000,
          credit: 0,
          description: 'رواتب مارس'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 85000,
          description: 'دفع الرواتب'
        }
      ]
    },
    {
      entryId: 'FJ030',
      date: '2025-03-05',
      description: 'دفعة نهائية للمقاول',
      reference: 'FJ030',
      amount: 300000,
      transactionType: 'دفع مقاولين',
      clientSupplier: 'شركة البناء المتقدمة',
      details: 'الدفعة النهائية بعد اكتمال المرحلة الأولى',
      lines: [
        {
          accountCode: '1610',
          accountName: 'مشاريع تحت التنفيذ',
          debit: 300000,
          credit: 0,
          description: 'دفعة نهائية'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 300000,
          description: 'دفع للمقاول'
        }
      ]
    },
    {
      entryId: 'FJ031',
      date: '2025-03-08',
      description: 'تحويل وحدات جاهزة للبيع',
      reference: 'FJ031',
      amount: 1200000,
      transactionType: 'تحويل أصول',
      clientSupplier: 'داخلي',
      details: 'تحويل المشروع المكتمل إلى وحدات جاهزة للبيع',
      lines: [
        {
          accountCode: '1630',
          accountName: 'وحدات سكنية جاهزة للبيع',
          debit: 1200000,
          credit: 0,
          description: 'وحدات مكتملة'
        },
        {
          accountCode: '1610',
          accountName: 'مشاريع تحت التنفيذ',
          debit: 0,
          credit: 1200000,
          description: 'تحويل المشروع'
        }
      ]
    },
    {
      entryId: 'FJ032',
      date: '2025-03-10',
      description: 'بيع أول وحدة سكنية',
      reference: 'FJ032',
      amount: 400000,
      transactionType: 'مبيعات عقارية',
      clientSupplier: 'العميل أحمد السعدي',
      details: 'بيع وحدة سكنية 3 غرف نوم',
      lines: [
        {
          accountCode: '1210',
          accountName: 'العملاء والمدينون',
          debit: 400000,
          credit: 0,
          description: 'فاتورة العميل'
        },
        {
          accountCode: '4210',
          accountName: 'إيرادات بيع العقارات',
          debit: 0,
          credit: 400000,
          description: 'إيراد البيع'
        }
      ]
    },
    {
      entryId: 'FJ033',
      date: '2025-03-10',
      description: 'تكلفة الوحدة المباعة',
      reference: 'FJ033',
      amount: 250000,
      transactionType: 'تكلفة مبيعات',
      clientSupplier: 'داخلي',
      details: 'تكلفة الوحدة السكنية المباعة',
      lines: [
        {
          accountCode: '5810',
          accountName: 'تكلفة المشاريع المباعة',
          debit: 250000,
          credit: 0,
          description: 'تكلفة الوحدة'
        },
        {
          accountCode: '1630',
          accountName: 'وحدات سكنية جاهزة للبيع',
          debit: 0,
          credit: 250000,
          description: 'خروج الوحدة'
        }
      ]
    },
    {
      entryId: 'FJ034',
      date: '2025-03-12',
      description: 'تحصيل من العميل',
      reference: 'FJ034',
      amount: 150000,
      transactionType: 'تحصيل مبيعات',
      clientSupplier: 'العميل أحمد السعدي',
      details: 'تحصيل جزء من قيمة الوحدة المباعة',
      lines: [
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 150000,
          credit: 0,
          description: 'تحصيل من العميل'
        },
        {
          accountCode: '1210',
          accountName: 'العملاء والمدينون',
          debit: 0,
          credit: 150000,
          description: 'تحصيل جزئي'
        }
      ]
    },
    {
      entryId: 'FJ035',
      date: '2025-03-15',
      description: 'إيجار المكاتب لشهر مارس',
      reference: 'FJ035',
      amount: 35000,
      transactionType: 'دفع إيجار',
      clientSupplier: 'شركة العقارات التجارية',
      details: 'إيجار المكاتب الإدارية لشهر مارس',
      lines: [
        {
          accountCode: '5310',
          accountName: 'إيجار المكاتب',
          debit: 35000,
          credit: 0,
          description: 'إيجار مارس'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 35000,
          description: 'دفع الإيجار'
        }
      ]
    },
    {
      entryId: 'FJ036',
      date: '2025-03-18',
      description: 'بيع ثاني وحدة سكنية',
      reference: 'FJ036',
      amount: 420000,
      transactionType: 'مبيعات عقارية',
      clientSupplier: 'العميلة فاطمة القحطاني',
      details: 'بيع وحدة سكنية 4 غرف نوم',
      lines: [
        {
          accountCode: '1210',
          accountName: 'العملاء والمدينون',
          debit: 420000,
          credit: 0,
          description: 'فاتورة العميلة'
        },
        {
          accountCode: '4210',
          accountName: 'إيرادات بيع العقارات',
          debit: 0,
          credit: 420000,
          description: 'إيراد البيع'
        }
      ]
    },
    {
      entryId: 'FJ037',
      date: '2025-03-18',
      description: 'تكلفة الوحدة الثانية المباعة',
      reference: 'FJ037',
      amount: 270000,
      transactionType: 'تكلفة مبيعات',
      clientSupplier: 'داخلي',
      details: 'تكلفة الوحدة السكنية الثانية المباعة',
      lines: [
        {
          accountCode: '5810',
          accountName: 'تكلفة المشاريع المباعة',
          debit: 270000,
          credit: 0,
          description: 'تكلفة الوحدة الثانية'
        },
        {
          accountCode: '1630',
          accountName: 'وحدات سكنية جاهزة للبيع',
          debit: 0,
          credit: 270000,
          description: 'خروج الوحدة الثانية'
        }
      ]
    },
    {
      entryId: 'FJ038',
      date: '2025-03-22',
      description: 'سداد مستحقات موردين جدد',
      reference: 'FJ038',
      amount: 220000,
      transactionType: 'سداد موردين',
      clientSupplier: 'مؤسسة مواد البناء الحديثة',
      details: 'سداد قيمة مواد التشطيب المشتراة في فبراير',
      lines: [
        {
          accountCode: '2110',
          accountName: 'الموردون والدائنون',
          debit: 220000,
          credit: 0,
          description: 'سداد للموردين'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 220000,
          description: 'دفع نقدي'
        }
      ]
    },
    {
      entryId: 'FJ039',
      date: '2025-03-25',
      description: 'فواتير الكهرباء والماء لمارس',
      reference: 'FJ039',
      amount: 11000,
      transactionType: 'دفع خدمات',
      clientSupplier: 'الشركة السعودية للكهرباء',
      details: 'فاتورة مارس للكهرباء والماء',
      lines: [
        {
          accountCode: '5320',
          accountName: 'خدمات الكهرباء والماء',
          debit: 11000,
          credit: 0,
          description: 'فاتورة مارس'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 11000,
          description: 'دفع الفاتورة'
        }
      ]
    },
    {
      entryId: 'FJ040',
      date: '2025-03-30',
      description: 'عمولة مبيعات للسماسرة',
      reference: 'FJ040',
      amount: 25000,
      transactionType: 'عمولات مبيعات',
      clientSupplier: 'مكتب الوساطة العقارية',
      details: 'عمولة بيع الوحدتين للسماسرة',
      lines: [
        {
          accountCode: '5710',
          accountName: 'مصروفات التسويق والإعلان',
          debit: 25000,
          credit: 0,
          description: 'عمولة السماسرة'
        },
        {
          accountCode: '1120',
          accountName: 'النقدية في البنك',
          debit: 0,
          credit: 25000,
          description: 'دفع العمولة'
        }
      ]
    }
  ];

  return transactions;
}

// توليد قيود التسوية حسب الشركة
export function generateAdjustingEntries(company: Company, transactions: JournalEntry[]): AdjustingEntry[] {
  switch (company.companyId) {
    case 'al-fajr':
      return generateAlFajrAdjustingEntries(company, transactions);
    case 'al-raida-trading':
      return generateAlRaidaTradingAdjustingEntries(company, transactions);
    case 'al-sinaaat-advanced':
      return generateAlSinaaatAdvancedAdjustingEntries(company, transactions);
    case 'al-taqaddum':
    default:
      return generateAlTaqaddumAdjustingEntries(company, transactions);
  }
}

// قيود التسوية لشركة التقدم التقنية
function generateAlTaqaddumAdjustingEntries(company: Company, transactions: JournalEntry[]): AdjustingEntry[] {
  return [
    {
      id: 'ADJ001',
      type: 'depreciation',
      description: 'إهلاك الأثاث والتجهيزات',
      amount: 1250,
      affectedAccounts: {
        debit: '5510',
        credit: '1531'
      },
      explanation: 'إهلاك الأثاث بمعدل 10% سنوياً (15,000 × 10% ÷ 12 = 1,250 شهرياً × 3 أشهر)'
    },
    {
      id: 'ADJ002',
      type: 'depreciation',
      description: 'إهلاك أجهزة الحاسب الآلي',
      amount: 2083,
      affectedAccounts: {
        debit: '5510',
        credit: '1541'
      },
      explanation: 'إهلاك أجهزة الحاسب بمعدل 33.33% سنوياً (25,000 × 33.33% ÷ 12 = 2,083 شهرياً × 3 أشهر)'
    }
  ];
}

// قيود التسوية لشركة الفجر للتطوير
function generateAlFajrAdjustingEntries(company: Company, transactions: JournalEntry[]): AdjustingEntry[] {
  return [
    {
      id: 'FADJ001',
      type: 'depreciation',
      description: 'إهلاك معدات البناء',
      amount: 3000,
      affectedAccounts: {
        debit: '5510',
        credit: '1531'
      },
      explanation: 'إهلاك معدات البناء بمعدل 20% سنوياً (120,000 × 20% ÷ 12 = 2,000 شهرياً × 3 أشهر)'
    },
    {
      id: 'FADJ002',
      type: 'accrued-expense',
      description: 'أجور مستحقة للعمالة',
      amount: 15000,
      affectedAccounts: {
        debit: '1610',
        credit: '2210'
      },
      explanation: 'أجور مستحقة للعمالة عن آخر أسبوع من مارس'
    },
    {
      id: 'FADJ003',
      type: 'deferred-revenue',
      description: 'تحويل جزء من مقدمات العملاء إلى إيرادات',
      amount: 200000,
      affectedAccounts: {
        debit: '2140',
        credit: '4210'
      },
      explanation: 'تحويل جزء من المقدمات إلى إيرادات مقابل الوحدات المباعة'
    }
  ];
}

// دوال للتوافق العكسي - تستخدم الشركة الافتراضية
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// العمليات المالية لشركة الرائدة للتجارة (بدون عمليات)
function generateAlRaidaTradingTransactions(company: Company): JournalEntry[] {
  return [];
}

// العمليات المالية لشركة الصناعات المتقدمة (بدون عمليات)
function generateAlSinaaatAdvancedTransactions(company: Company): JournalEntry[] {
  return [];
}

// قيود التسوية لشركة الرائدة للتجارة (بدون قيود)
function generateAlRaidaTradingAdjustingEntries(company: Company, transactions: JournalEntry[]): AdjustingEntry[] {
  return [];
}

// قيود التسوية لشركة الصناعات المتقدمة (بدون قيود)
function generateAlSinaaatAdvancedAdjustingEntries(company: Company, transactions: JournalEntry[]): AdjustingEntry[] {
  return [];
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}
