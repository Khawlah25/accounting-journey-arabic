-- Add public read access for published transaction import files
CREATE POLICY "Public can view published import files" 
ON public.transaction_import_files 
FOR SELECT 
USING (status = 'published');

-- Add public read access for transaction lines from published files
CREATE POLICY "Public can view lines from published import files" 
ON public.transaction_import_lines 
FOR SELECT 
USING (import_file_id IN (
  SELECT id FROM public.transaction_import_files 
  WHERE status = 'published'
));