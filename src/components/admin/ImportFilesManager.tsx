import React, { useState, useEffect } from 'react';
import { Check, X, Eye, FileText, Calendar, User, AlertCircle, CheckCircle, LogIn, RefreshCw, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getImportFiles, validateImportFile, publishImportFile } from '@/utils/transactionImport';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ImportFile {
  id: string;
  company_id: string;
  original_filename: string;
  status: 'staged' | 'validated' | 'published' | 'rejected' | 'failed';
  total_rows: number;
  total_entries: number;
  balanced_entries: number;
  error_count: number;
  created_at: string;
  updated_at: string;
}

const ImportFilesManager = () => {
  const [files, setFiles] = useState<ImportFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingFile, setProcessingFile] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading) {
      setAuthChecking(false);
      if (user) {
        loadFiles();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  // إعادة تحميل الملفات عند تغيير حالة المصادقة
  useEffect(() => {
    if (user && !authLoading) {
      loadFiles();
    }
  }, [user]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const data = await getImportFiles();
      setFiles(data);
    } catch (error) {
      console.error('خطأ في تحميل الملفات:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل قائمة الملفات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (fileId: string) => {
    setProcessingFile(fileId);
    try {
      const result = await validateImportFile(fileId);
      
      if (result.success) {
        toast({
          title: "نجح التحقق",
          description: result.message,
          variant: "default"
        });
        await loadFiles(); // إعادة تحميل القائمة
      } else {
        toast({
          title: "فشل التحقق",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('خطأ في التحقق:', error);
      toast({
        title: "خطأ في التحقق",
        description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
        variant: "destructive"
      });
    } finally {
      setProcessingFile(null);
    }
  };

  const handlePublish = async (fileId: string) => {
    setProcessingFile(fileId);
    try {
      const result = await publishImportFile(fileId);
      
      if (result.success) {
        toast({
          title: "نجح النشر",
          description: result.message,
          variant: "default"
        });
        await loadFiles(); // إعادة تحميل القائمة
      } else {
        toast({
          title: "فشل النشر",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('خطأ في النشر:', error);
      toast({
        title: "خطأ في النشر",
        description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
        variant: "destructive"
      });
    } finally {
      setProcessingFile(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      staged: { label: 'في الانتظار', variant: 'secondary' as const, icon: AlertCircle },
      validated: { label: 'محقق', variant: 'default' as const, icon: CheckCircle },
      published: { label: 'منشور', variant: 'default' as const, icon: CheckCircle },
      rejected: { label: 'مرفوض', variant: 'destructive' as const, icon: X },
      failed: { label: 'فاشل', variant: 'destructive' as const, icon: X }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.staged;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const canValidate = (file: ImportFile) => {
    return file.status === 'staged' && file.error_count === 0;
  };

  const canPublish = (file: ImportFile) => {
    return file.status === 'validated';
  };

  // عرض حالة التحقق من المصادقة
  if (authChecking || authLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="mr-2">جاري التحقق من صحة تسجيل الدخول...</span>
        </CardContent>
      </Card>
    );
  }

  // عرض رسالة تسجيل الدخول إذا لم يكن المستخدم مسجل الدخول
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <FileText className="h-5 w-5" />
            <span>إدارة الملفات المرفوعة</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <LogIn className="h-4 w-4" />
            <AlertDescription>
              يجب تسجيل الدخول أولاً لعرض الملفات المرفوعة
            </AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <Button onClick={() => navigate('/auth')} className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              تسجيل الدخول
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // عرض حالة التحميل
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="mr-2">جاري تحميل الملفات...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2 space-x-reverse">
            <FileText className="h-5 w-5" />
            <span>إدارة الملفات المرفوعة</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadFiles}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                لا توجد ملفات مرفوعة حتى الآن. تأكد من رفع الملفات من خلال قسم "قالب العمليات المالية" أعلاه.
                <br />
                <strong>ملاحظة:</strong> يمكنك عرض العمليات في المحاكاة حتى لو كانت في حالة "فاشل" أو "في الانتظار" لمراجعتها وتصحيحها.
              </AlertDescription>
            </Alert>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم الملف</TableHead>
                  <TableHead>الشركة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>العمليات</TableHead>
                  <TableHead>الأخطاء</TableHead>
                  <TableHead>تاريخ الرفع</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">
                      {file.original_filename}
                    </TableCell>
                    <TableCell>{file.company_id}</TableCell>
                    <TableCell>
                      {getStatusBadge(file.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>المجموع: {file.total_entries}</div>
                        <div>المتوازن: {file.balanced_entries}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {file.error_count > 0 ? (
                        <Badge variant="destructive">{file.error_count}</Badge>
                      ) : (
                        <Badge variant="secondary">0</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(file.created_at).toLocaleString('ar-EG')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        {canValidate(file) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleValidate(file.id)}
                            disabled={processingFile === file.id}
                          >
                            {processingFile === file.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                            تحقق
                          </Button>
                        )}
                        
                        {canPublish(file) && (
                          <Button
                            size="sm"
                            onClick={() => handlePublish(file.id)}
                            disabled={processingFile === file.id}
                            className="bg-success text-success-foreground hover:bg-success/90"
                          >
                            {processingFile === file.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            ) : (
                              <CheckCircle className="h-3 w-3" />
                            )}
                            نشر
                          </Button>
                        )}
                        
                        {/* زر عرض في المحاكاة للملفات الفاشلة والمراحل الأخرى */}
                        {(file.status === 'failed' || file.status === 'staged' || file.status === 'validated') && (
                          <Button
                            onClick={() => navigate('/')}
                            variant="secondary"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Play className="h-3 w-3" />
                            عرض في المحاكاة
                          </Button>
                        )}
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <Eye className="h-3 w-3" />
                              عرض
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>تفاصيل الملف: {file.original_filename}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">معرف الملف:</label>
                                  <p className="text-sm text-muted-foreground">{file.id}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">الشركة:</label>
                                  <p className="text-sm text-muted-foreground">{file.company_id}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">إجمالي الصفوف:</label>
                                  <p className="text-sm text-muted-foreground">{file.total_rows}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">إجمالي العمليات:</label>
                                  <p className="text-sm text-muted-foreground">{file.total_entries}</p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImportFilesManager;