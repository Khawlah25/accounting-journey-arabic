-- إنشاء enum لحالات الملفات المرفوعة
CREATE TYPE public.import_file_status AS ENUM (
  'staged',
  'validated', 
  'published',
  'rejected',
  'failed'
);

-- إنشاء جدول ملفات العمليات المرفوعة
CREATE TABLE public.transaction_import_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_hash TEXT NOT NULL,
  status public.import_file_status NOT NULL DEFAULT 'staged',
  total_rows INTEGER DEFAULT 0,
  total_entries INTEGER DEFAULT 0,
  balanced_entries INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  error_report_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- فهرس فريد على company_id + file_hash لمنع رفع نفس الملف مرتين
  CONSTRAINT unique_company_file_hash UNIQUE (company_id, file_hash)
);

-- إنشاء جدول بنود العمليات المرفوعة
CREATE TABLE public.transaction_import_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  import_file_id UUID NOT NULL REFERENCES public.transaction_import_files(id) ON DELETE CASCADE,
  company_id TEXT NOT NULL,
  period_code TEXT,
  entry_external_id TEXT NOT NULL,
  line_no INTEGER,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  account_code TEXT NOT NULL,
  dc CHAR(1) NOT NULL CHECK (dc IN ('D', 'C')),
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  reference TEXT,
  memo TEXT,
  payment_method TEXT,
  attachment_url TEXT,
  entry_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- فهرس فريد على المزيج الأساسي لمنع التكرار
  CONSTRAINT unique_import_line UNIQUE (company_id, period_code, entry_external_id, line_no)
);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX idx_transaction_import_files_company_status ON public.transaction_import_files(company_id, status);
CREATE INDEX idx_transaction_import_files_uploaded_by ON public.transaction_import_files(uploaded_by);
CREATE INDEX idx_transaction_import_lines_import_file ON public.transaction_import_lines(import_file_id);
CREATE INDEX idx_transaction_import_lines_entry ON public.transaction_import_lines(company_id, entry_external_id);

-- تفعيل RLS على الجداول
ALTER TABLE public.transaction_import_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_import_lines ENABLE ROW LEVEL SECURITY;

-- سياسات RLS لجدول transaction_import_files
-- المدراء يمكنهم رؤية وإدارة جميع الملفات
CREATE POLICY "Admins can manage all import files"
  ON public.transaction_import_files
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- المستخدمون يمكنهم رؤية ملفاتهم فقط
CREATE POLICY "Users can view their own import files"
  ON public.transaction_import_files
  FOR SELECT
  TO authenticated
  USING (uploaded_by = auth.uid());

-- المستخدمون يمكنهم إنشاء ملفات جديدة
CREATE POLICY "Users can create import files"
  ON public.transaction_import_files
  FOR INSERT
  TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

-- سياسات RLS لجدول transaction_import_lines
-- المدراء يمكنهم رؤية وإدارة جميع البنود
CREATE POLICY "Admins can manage all import lines"
  ON public.transaction_import_lines
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- المستخدمون يمكنهم رؤية بنود ملفاتهم فقط
CREATE POLICY "Users can view their own import lines"
  ON public.transaction_import_lines
  FOR SELECT
  TO authenticated
  USING (
    import_file_id IN (
      SELECT id FROM public.transaction_import_files 
      WHERE uploaded_by = auth.uid()
    )
  );

-- المستخدمون يمكنهم إنشاء بنود لملفاتهم
CREATE POLICY "Users can create import lines for their files"
  ON public.transaction_import_lines
  FOR INSERT
  TO authenticated
  WITH CHECK (
    import_file_id IN (
      SELECT id FROM public.transaction_import_files 
      WHERE uploaded_by = auth.uid()
    )
  );

-- إنشاء trigger لتحديث updated_at تلقائياً
CREATE TRIGGER update_transaction_import_files_updated_at
  BEFORE UPDATE ON public.transaction_import_files
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- إنشاء Storage bucket للملفات المرفوعة
INSERT INTO storage.buckets (id, name, public) 
VALUES ('transaction-imports', 'transaction-imports', false);

-- سياسات Storage للمدراء فقط
CREATE POLICY "Admins can upload transaction files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'transaction-imports' AND is_admin());

CREATE POLICY "Admins can view transaction files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'transaction-imports' AND is_admin());

CREATE POLICY "Admins can update transaction files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'transaction-imports' AND is_admin());

CREATE POLICY "Admins can delete transaction files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'transaction-imports' AND is_admin());