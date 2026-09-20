import { supabase } from '@/integrations/supabase/client';

interface UploadedTransaction {
  entry_external_id: string;
  date: string;
  description: string;
  account_code: string;
  dc: string;
  amount: number;
  reference?: string;
  memo?: string;
  payment_method?: string;
  attachment_url?: string;
  period_code?: string;
  line_no?: number;
}

interface ValidationResult {
  isValid: boolean;
  totalRows: number;
  totalEntries: number;
  balancedEntries: number;
  errors: string[];
}

interface ImportResult {
  success: boolean;
  fileId?: string;
  message: string;
  errors?: string[];
}

// حساب hash للملف
export const calculateFileHash = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const hash = await window.crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hash));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// رفع الملف إلى Storage
export const uploadFileToStorage = async (file: File, fileName: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from('transaction-imports')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(`خطأ في رفع الملف: ${error.message}`);
  }

  return data.path;
};

// إنشاء تقرير أخطاء
export const generateErrorReport = (validation: ValidationResult): string => {
  if (validation.errors.length === 0) {
    return '';
  }

  const report = [
    '=== تقرير أخطاء العمليات المالية ===',
    `تاريخ المعالجة: ${new Date().toLocaleString('ar-EG')}`,
    `إجمالي الأخطاء: ${validation.errors.length}`,
    '',
    '=== تفاصيل الأخطاء ===',
    ...validation.errors.map((error, index) => `${index + 1}. ${error}`),
    '',
    '=== ملاحظات ===',
    '• تأكد من تطابق أكواد الحسابات مع دليل الحسابات المعتمد',
    '• تحقق من توازن كل قيد (مجموع المدين = مجموع الدائن)',
    '• تأكد من صحة تنسيق التواريخ (YYYY-MM-DD)',
    '• تحقق من أن قيم dc محدودة بـ D أو C فقط',
    '• تأكد من أن جميع المبالغ أرقام موجبة'
  ].join('\n');

  return report;
};

// رفع تقرير الأخطاء إلى Storage
export const uploadErrorReport = async (errorReport: string, fileName: string): Promise<string> => {
  if (!errorReport) return '';

  const blob = new Blob([errorReport], { type: 'text/plain;charset=utf-8' });
  const file = new File([blob], fileName, { type: 'text/plain' });

  return await uploadFileToStorage(file, `error-reports/${fileName}`);
};

// حفظ بيانات الملف المستورد
export const saveImportFile = async (
  file: File,
  companyId: string,
  validation: ValidationResult,
  storagePath: string,
  fileHash: string,
  errorReportPath?: string
): Promise<string> => {
  const { data, error } = await supabase
    .from('transaction_import_files')
    .insert({
      company_id: companyId,
      uploaded_by: (await supabase.auth.getUser()).data.user?.id,
      original_filename: file.name,
      storage_path: storagePath,
      file_hash: fileHash,
      status: 'staged',
      total_rows: validation.totalRows,
      total_entries: validation.totalEntries,
      balanced_entries: validation.balancedEntries,
      error_count: validation.errors.length,
      error_report_path: errorReportPath || null
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`خطأ في حفظ بيانات الملف: ${error.message}`);
  }

  return data.id;
};

// حفظ بنود العمليات
export const saveImportLines = async (
  fileId: string,
  companyId: string,
  transactions: UploadedTransaction[]
): Promise<void> => {
  const lines = transactions.map((transaction, index) => ({
    import_file_id: fileId,
    company_id: companyId,
    period_code: transaction.period_code || null,
    entry_external_id: transaction.entry_external_id,
    line_no: transaction.line_no || index + 1,
    date: transaction.date,
    description: transaction.description,
    account_code: transaction.account_code,
    dc: transaction.dc,
    amount: transaction.amount,
    reference: transaction.reference || null,
    memo: transaction.memo || null,
    payment_method: transaction.payment_method || null,
    attachment_url: transaction.attachment_url || null,
    entry_hash: `${transaction.entry_external_id}_${companyId}_${transaction.date}`
  }));

  const { error } = await supabase
    .from('transaction_import_lines')
    .insert(lines);

  if (error) {
    throw new Error(`خطأ في حفظ بنود العمليات: ${error.message}`);
  }
};

// الدالة الرئيسية لحفظ الاستيراد
export const saveTransactionImport = async (
  file: File,
  transactions: UploadedTransaction[],
  validation: ValidationResult,
  companyId: string = 'al-taqaddum' // قيمة افتراضية
): Promise<ImportResult> => {
  try {
    // التحقق من المصادقة
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        message: 'يجب تسجيل الدخول أولاً'
      };
    }

    // حساب hash الملف
    const fileHash = await calculateFileHash(file);
    
    // التحقق من عدم وجود نفس الملف مسبقاً
    const { data: existingFile } = await supabase
      .from('transaction_import_files')
      .select('id')
      .eq('company_id', companyId)
      .eq('file_hash', fileHash)
      .maybeSingle();

    if (existingFile) {
      return {
        success: false,
        message: 'هذا الملف تم رفعه مسبقاً'
      };
    }

    // إنشاء اسم ملف فريد
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${companyId}/${timestamp}_${file.name}`;

    // رفع الملف إلى Storage
    const storagePath = await uploadFileToStorage(file, fileName);

    // إنشاء تقرير أخطاء إذا لزم الأمر
    let errorReportPath = '';
    if (validation.errors.length > 0) {
      const errorReport = generateErrorReport(validation);
      const errorFileName = `${timestamp}_errors.txt`;
      errorReportPath = await uploadErrorReport(errorReport, errorFileName);
    }

    // حفظ بيانات الملف
    const fileId = await saveImportFile(
      file,
      companyId,
      validation,
      storagePath,
      fileHash,
      errorReportPath
    );

    // حفظ بنود العمليات
    await saveImportLines(fileId, companyId, transactions);

    return {
      success: true,
      fileId,
      message: `تم حفظ الملف بنجاح. معرف الملف: ${fileId}`,
      errors: validation.errors.length > 0 ? validation.errors : undefined
    };

  } catch (error) {
    console.error('خطأ في حفظ الاستيراد:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
      errors: [error instanceof Error ? error.message : 'خطأ غير معروف']
    };
  }
};

// جلب قائمة الملفات المرفوعة
export const getImportFiles = async (companyId?: string) => {
  let query = supabase
    .from('transaction_import_files')
    .select(`
      *,
      transaction_import_lines(count)
    `)
    .order('created_at', { ascending: false });

  if (companyId) {
    query = query.eq('company_id', companyId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`خطأ في جلب قائمة الملفات: ${error.message}`);
  }

  return data;
};

// جلب تفاصيل ملف معين
export const getImportFileDetails = async (fileId: string) => {
  const { data, error } = await supabase
    .from('transaction_import_files')
    .select(`
      *,
      transaction_import_lines(*)
    `)
    .eq('id', fileId)
    .single();

  if (error) {
    throw new Error(`خطأ في جلب تفاصيل الملف: ${error.message}`);
  }

  return data;
};

// التحقق من صحة ملف مستورد
export const validateImportFile = async (fileId: string): Promise<ImportResult> => {
  try {
    // جلب بيانات الملف والبنود
    const { data: fileData, error: fileError } = await supabase
      .from('transaction_import_files')
      .select(`
        *,
        transaction_import_lines(*)
      `)
      .eq('id', fileId)
      .single();

    if (fileError || !fileData) {
      return {
        success: false,
        message: 'الملف غير موجود'
      };
    }

    if (fileData.status !== 'staged') {
      return {
        success: false,
        message: `لا يمكن التحقق من الملف في الحالة: ${fileData.status}`
      };
    }

    const lines = fileData.transaction_import_lines;
    let validationErrors: string[] = [];

    // فحص توازن القيود
    const entriesMap = new Map<string, any[]>();
    lines.forEach((line: any) => {
      const entryId = line.entry_external_id;
      if (!entriesMap.has(entryId)) {
        entriesMap.set(entryId, []);
      }
      entriesMap.get(entryId)!.push(line);
    });

    let balancedCount = 0;
    entriesMap.forEach((entryLines, entryId) => {
      const debitTotal = entryLines.filter(l => l.dc === 'D').reduce((sum, l) => sum + Number(l.amount), 0);
      const creditTotal = entryLines.filter(l => l.dc === 'C').reduce((sum, l) => sum + Number(l.amount), 0);
      
      if (Math.abs(debitTotal - creditTotal) > 0.01) {
        validationErrors.push(`القيد ${entryId}: غير متوازن (مدين: ${debitTotal}, دائن: ${creditTotal})`);
      } else {
        balancedCount++;
      }
    });

    // فحص أكواد الحسابات (يمكن تطويره لاحقاً للتحقق من دليل الحسابات)
    const invalidAccountCodes = lines.filter((line: any) => 
      !line.account_code || line.account_code.length < 4
    );

    if (invalidAccountCodes.length > 0) {
      validationErrors.push(`${invalidAccountCodes.length} من أكواد الحسابات غير صحيحة`);
    }

    // تحديث حالة الملف
    const newStatus = validationErrors.length === 0 ? 'validated' : 'failed';
    
    const { error: updateError } = await supabase
      .from('transaction_import_files')
      .update({
        status: newStatus,
        balanced_entries: balancedCount,
        error_count: validationErrors.length,
        updated_at: new Date().toISOString()
      })
      .eq('id', fileId);

    if (updateError) {
      return {
        success: false,
        message: `خطأ في تحديث حالة الملف: ${updateError.message}`
      };
    }

    // إنشاء تقرير أخطاء جديد إذا لزم الأمر
    if (validationErrors.length > 0) {
      const errorReport = generateErrorReport({
        isValid: false,
        totalRows: lines.length,
        totalEntries: entriesMap.size,
        balancedEntries: balancedCount,
        errors: validationErrors
      });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const errorFileName = `${timestamp}_validation_errors.txt`;
      await uploadErrorReport(errorReport, errorFileName);
    }

    return {
      success: true,
      message: newStatus === 'validated' 
        ? 'تم التحقق من الملف بنجاح' 
        : `فشل التحقق: ${validationErrors.length} أخطاء`,
      errors: validationErrors.length > 0 ? validationErrors : undefined
    };

  } catch (error) {
    console.error('خطأ في التحقق:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'حدث خطأ غير متوقع في التحقق'
    };
  }
};

// نشر ملف مستورد للطلاب
export const publishImportFile = async (fileId: string): Promise<ImportResult> => {
  try {
    // جلب بيانات الملف والتحقق من حالته
    const { data: fileData, error: fileError } = await supabase
      .from('transaction_import_files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (fileError || !fileData) {
      return {
        success: false,
        message: 'الملف غير موجود'
      };
    }

    if (fileData.status !== 'validated') {
      return {
        success: false,
        message: `لا يمكن نشر الملف في الحالة: ${fileData.status}. يجب التحقق أولاً`
      };
    }

    // تحديث حالة الملف إلى منشور
    const { error: updateError } = await supabase
      .from('transaction_import_files')
      .update({
        status: 'published',
        updated_at: new Date().toISOString()
      })
      .eq('id', fileId);

    if (updateError) {
      return {
        success: false,
        message: `خطأ في نشر الملف: ${updateError.message}`
      };
    }

    return {
      success: true,
      message: 'تم نشر الملف بنجاح. أصبح متاحاً للطلاب'
    };

  } catch (error) {
    console.error('خطأ في النشر:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'حدث خطأ غير متوقع في النشر'
    };
  }
};

// جلب العمليات المنشورة لشركة معينة - يعمل لجميع المستخدمين (حتى بدون تسجيل دخول)
export const getPublishedTransactions = async (companyId: string, includeAllStatuses: boolean = false): Promise<any[]> => {
  console.log(`🔍 getPublishedTransactions: البحث عن العمليات للشركة: ${companyId}, includeAllStatuses: ${includeAllStatuses}`);
  
  try {
    let query = supabase
      .from('transaction_import_lines')
      .select(`
        *,
        transaction_import_files!inner(
          status,
          company_id
        )
      `)
      .eq('company_id', companyId)
      .order('date', { ascending: true });

    // للمستخدمين غير المسجلين أو عندما لا نريد جميع الحالات، فقط العمليات المنشورة
    if (!includeAllStatuses) {
      console.log('🔍 تصفية العمليات للحالة: published فقط');
      query = query.eq('transaction_import_files.status', 'published');
    } else {
      console.log('🔍 جلب جميع العمليات (جميع الحالات)');
    }

    const { data, error } = await query;
    
    console.log(`📊 نتيجة الاستعلام: ${data ? data.length : 0} سطر، خطأ: ${error ? error.message : 'لا يوجد'}`);
    if (data && data.length > 0) {
      console.log('📄 أول سطر:', data[0]);
      const statuses = [...new Set(data.map(line => line.transaction_import_files?.status))];
      console.log('📈 الحالات الموجودة:', statuses);
    }

    if (error) {
      console.warn('⚠️ خطأ في جلب العمليات المنشورة:', error.message);
      // إرجاع مصفوفة فارغة بدلاً من رمي خطأ للمستخدمين غير المسجلين
      return [];
    }

    // تحويل البيانات إلى تنسيق JournalEntry
    const entriesMap = new Map();
    
    data.forEach((line: any) => {
      const entryId = line.entry_external_id;
      if (!entriesMap.has(entryId)) {
        entriesMap.set(entryId, {
          id: entryId,
          date: line.date,
          description: line.description,
          reference: line.reference || '',
          entries: [],
          source: 'uploaded' // وسم المصدر
        });
      }

      entriesMap.get(entryId).entries.push({
        accountCode: line.account_code,
        accountName: line.account_code, // يمكن ربطه بدليل الحسابات لاحقاً
        debit: line.dc === 'D' ? line.amount : 0,
        credit: line.dc === 'C' ? line.amount : 0
      });
      
      // إضافة معلومات الحالة للعملية
      const entry = entriesMap.get(entryId);
      if (!entry.status) {
        entry.status = line.transaction_import_files.status;
        entry.hasErrors = line.transaction_import_files.status === 'failed';
      }
    });

    const transactions = Array.from(entriesMap.values());
    console.log(`✅ تم تحويل ${transactions.length} عملية مالية`);
    
    if (transactions.length > 0) {
      console.log('📝 أول عملية محولة:', transactions[0]);
    }
    
    return transactions;

  } catch (error) {
    console.error('❌ خطأ في جلب العمليات المنشورة:', error);
    console.error('🔍 تفاصيل الخطأ:', {
      companyId,
      includeAllStatuses,
      error: error.message
    });
    // إرجاع مصفوفة فارغة بدلاً من رمي خطأ للمستخدمين غير المسجلين
    return [];
  }
};