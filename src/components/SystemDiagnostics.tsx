import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SystemInfo {
  localStorage: boolean;
  localStorageQuota: string;
  sessionStorage: boolean;
  browserSupport: boolean;
  jsEnabled: boolean;
  userAgent: string;
  currentURL: string;
  timestamp: string;
  storageUsage: number;
  accountingSessionExists: boolean;
  accountingSessionSize: string;
  accountingSessionData: any;
}

export function SystemDiagnostics() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const checkSystemInfo = (): SystemInfo => {
    console.log('🔍 SystemDiagnostics: بدء فحص النظام...');
    
    // فحص localStorage
    let localStorageWorks = false;
    let localStorageQuota = 'غير متاح';
    try {
      const testKey = '__test_localStorage__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      localStorageWorks = true;
      
      // تقدير حجم التخزين المتاح
      if (navigator.storage && navigator.storage.estimate) {
        navigator.storage.estimate().then(estimate => {
          const quota = estimate.quota || 0;
          const usage = estimate.usage || 0;
          console.log('💾 localStorage quota:', quota, 'usage:', usage);
        });
      }
    } catch (e) {
      console.error('❌ localStorage لا يعمل:', e);
      localStorageQuota = 'خطأ: ' + (e as Error).message;
    }

    // فحص sessionStorage
    let sessionStorageWorks = false;
    try {
      const testKey = '__test_sessionStorage__';
      sessionStorage.setItem(testKey, 'test');
      sessionStorage.removeItem(testKey);
      sessionStorageWorks = true;
    } catch (e) {
      console.error('❌ sessionStorage لا يعمل:', e);
    }

    // فحص بيانات الجلسة المحاسبية
    let accountingSessionExists = false;
    let accountingSessionSize = '0 بايت';
    let accountingSessionData = null;
    try {
      const sessionData = localStorage.getItem('accounting-session');
      if (sessionData) {
        accountingSessionExists = true;
        accountingSessionSize = new Blob([sessionData]).size + ' بايت';
        accountingSessionData = JSON.parse(sessionData);
        console.log('📊 بيانات الجلسة المحاسبية موجودة:', accountingSessionData);
      } else {
        console.log('📊 لا توجد بيانات جلسة محاسبية محفوظة');
      }
    } catch (e) {
      console.error('❌ خطأ في قراءة بيانات الجلسة:', e);
    }

    // فحص استخدام التخزين
    let storageUsage = 0;
    try {
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
      storageUsage = total;
    } catch (e) {
      console.error('❌ خطأ في حساب استخدام التخزين:', e);
    }

    const info: SystemInfo = {
      localStorage: localStorageWorks,
      localStorageQuota,
      sessionStorage: sessionStorageWorks,
      browserSupport: typeof Storage !== 'undefined',
      jsEnabled: true,
      userAgent: navigator.userAgent,
      currentURL: window.location.href,
      timestamp: new Date().toISOString(),
      storageUsage,
      accountingSessionExists,
      accountingSessionSize,
      accountingSessionData
    };

    console.log('🔍 تشخيص النظام مكتمل:', info);
    return info;
  };

  useEffect(() => {
    if (isVisible) {
      const info = checkSystemInfo();
      setSystemInfo(info);
    }
  }, [isVisible]);

  const copyToClipboard = () => {
    if (systemInfo) {
      const diagnosticsText = JSON.stringify(systemInfo, null, 2);
      navigator.clipboard?.writeText(diagnosticsText).then(() => {
        alert('تم نسخ معلومات التشخيص!');
      }).catch(() => {
        alert('فشل في نسخ البيانات');
      });
    }
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
      >
        🔧 تشخيص النظام
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>تشخيص النظام</CardTitle>
            <Button onClick={() => setIsVisible(false)} variant="outline" size="sm">
              إغلاق
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {systemInfo && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium">حالة التخزين المحلي</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>localStorage:</span>
                      <Badge variant={systemInfo.localStorage ? "default" : "destructive"}>
                        {systemInfo.localStorage ? "يعمل" : "لا يعمل"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>sessionStorage:</span>
                      <Badge variant={systemInfo.sessionStorage ? "default" : "destructive"}>
                        {systemInfo.sessionStorage ? "يعمل" : "لا يعمل"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>دعم المتصفح:</span>
                      <Badge variant={systemInfo.browserSupport ? "default" : "destructive"}>
                        {systemInfo.browserSupport ? "مدعوم" : "غير مدعوم"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">بيانات الجلسة المحاسبية</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>الجلسة موجودة:</span>
                      <Badge variant={systemInfo.accountingSessionExists ? "default" : "secondary"}>
                        {systemInfo.accountingSessionExists ? "نعم" : "لا"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>حجم البيانات:</span>
                      <span className="text-sm">{systemInfo.accountingSessionSize}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">معلومات النظام</h3>
                <div className="text-sm space-y-1">
                  <div><strong>الرابط الحالي:</strong> {systemInfo.currentURL}</div>
                  <div><strong>وقت الفحص:</strong> {new Date(systemInfo.timestamp).toLocaleString('ar-EG')}</div>
                  <div><strong>استخدام التخزين:</strong> {systemInfo.storageUsage} حرف</div>
                  <div><strong>متصفح:</strong> {systemInfo.userAgent.substring(0, 100)}...</div>
                </div>
              </div>

              {systemInfo.accountingSessionData && (
                <div className="space-y-2">
                  <h3 className="font-medium">تفاصيل بيانات الجلسة</h3>
                  <div className="bg-muted rounded-lg p-4 text-sm">
                    <div><strong>معرف الجلسة:</strong> {systemInfo.accountingSessionData.sessionId}</div>
                    <div><strong>المرحلة الحالية:</strong> {systemInfo.accountingSessionData.currentStage}</div>
                    <div><strong>عدد العمليات:</strong> {systemInfo.accountingSessionData.transactions?.length || 0}</div>
                    <div><strong>عدد الحسابات:</strong> {systemInfo.accountingSessionData.chartOfAccounts?.length || 0}</div>
                    <div><strong>اسم الشركة:</strong> {systemInfo.accountingSessionData.company?.name || 'غير محدد'}</div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline">
                  نسخ التشخيص
                </Button>
                <Button 
                  onClick={() => {
                    localStorage.clear();
                    alert('تم مسح جميع البيانات! سيتم إعادة تحميل الصفحة.');
                    window.location.reload();
                  }}
                  variant="destructive"
                >
                  مسح جميع البيانات
                </Button>
                <Button 
                  onClick={() => {
                    const info = checkSystemInfo();
                    setSystemInfo(info);
                  }}
                  variant="secondary"
                >
                  إعادة الفحص
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default SystemDiagnostics;
