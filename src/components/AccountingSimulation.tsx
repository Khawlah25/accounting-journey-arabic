// المكون الرئيسي لنظام المحاكاة المحاسبية

import React, { useState, useEffect } from 'react';
import HomePage from '@/components/HomePage';
import SimulationLayout from '@/components/SimulationLayout';
import Stage1TransactionIdentification from '@/components/stages/Stage1TransactionIdentification';
import Stage2JournalEntries from '@/components/stages/Stage2JournalEntries';
import Stage3JournalAnalysis from '@/components/stages/Stage3JournalAnalysis';
import Stage3PostToLedger from '@/components/stages/Stage3PostToLedger';

import Stage4TrialBalance from '@/components/stages/Stage4TrialBalance';

import { Stage6AdjustingEntries1 } from '@/components/stages/Stage6AdjustingEntries1';
import { Stage7PostAdjustmentTrialBalance } from '@/components/stages/Stage7PostAdjustmentTrialBalance';
import { Stage8FinancialStatements } from '@/components/stages/Stage8FinancialStatements';
import { SessionData, AccountingPeriod } from '@/types/accounting';
import { 
  getCurrentOrCreateSession, 
  updateSessionProgress, 
  resetSessionToStage,
  saveSession 
} from '@/utils/sessionManager';

type ViewMode = 'home' | 'simulation';

export function AccountingSimulation() {
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState('بدء التحميل...');

  useEffect(() => {
    loadSessionData();
  }, []);

  const loadSessionData = async () => {
    try {
      console.log('🔄 AccountingSimulation: بدء تحميل بيانات الجلسة...');
      setIsLoading(true);
      setError(null);
      setLoadingStep('فحص النظام والمتطلبات...');

      // فحص أساسي للنظام
      if (typeof Storage === "undefined") {
        throw new Error('المتصفح لا يدعم localStorage - يرجى استخدام متصفح حديث');
      }

      setLoadingStep('فحص التخزين المحلي...');
      try {
        localStorage.setItem('__test__', 'test');
        localStorage.removeItem('__test__');
        console.log('✅ localStorage يعمل بشكل صحيح');
      } catch (storageError) {
        throw new Error('فشل في الوصول للتخزين المحلي: ' + (storageError as Error).message);
      }

      setLoadingStep('فحص البيانات المحفوظة...');
      const savedSession = localStorage.getItem('accounting-session');
      console.log('💾 البيانات المحفوظة:', savedSession ? `موجودة (${savedSession.length} حرف)` : 'غير موجودة');
      
      if (savedSession) {
        try {
          const parsedSession = JSON.parse(savedSession);
          console.log('📊 تفاصيل الجلسة المحفوظة:', {
            sessionId: parsedSession.sessionId,
            currentStage: parsedSession.currentStage,
            transactionsCount: parsedSession.transactions?.length || 0,
            accountsCount: parsedSession.chartOfAccounts?.length || 0,
            companyName: parsedSession.company?.name
          });
        } catch (parseError) {
          console.error('❌ خطأ في تحليل البيانات المحفوظة:', parseError);
          localStorage.removeItem('accounting-session');
        }
      }
      
      setLoadingStep('جاري إنشاء أو استرداد الجلسة...');
      const session = getCurrentOrCreateSession();
      
      if (!session) {
        throw new Error('فشل في إنشاء جلسة جديدة');
      }

      // التحقق من اكتمال البيانات
      if (!session.sessionId || !session.company || !session.chartOfAccounts || !session.transactions) {
        throw new Error('بيانات الجلسة غير مكتملة');
      }

      if (session.transactions.length < 65) {
        console.warn(`⚠️ عدد العمليات أقل من المتوقع: ${session.transactions.length}/65`);
      }

      console.log('✅ تم تحميل الجلسة بنجاح:', {
        sessionId: session.sessionId,
        currentStage: session.currentStage,
        transactionsCount: session.transactions?.length || 0,
        accountsCount: session.chartOfAccounts?.length || 0,
        companyName: session.company?.name
      });

      setLoadingStep('جاري تطبيق البيانات...');
      setSessionData(session);
      
      // تأخير بسيط للتأكد من تطبيق البيانات
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setIsLoading(false);
      console.log('🎉 تم تحميل النظام بنجاح!');
      
    } catch (err) {
      console.error('❌ خطأ في تحميل بيانات الجلسة:', err);
      setError(err instanceof Error ? err.message : 'خطأ غير معروف في تحميل البيانات');
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    loadSessionData();
  };

  const handleClearData = () => {
    console.log('🗑️ مسح البيانات المحفوظة...');
    localStorage.removeItem('accounting-session');
    loadSessionData();
  };

  const handleStartSimulation = (sessionData: SessionData, companyId?: string) => {
    console.log('🚀 handleStartSimulation: بدء المحاكاة للشركة:', sessionData.company.name);
    setSessionData(sessionData);
    setViewMode('simulation');
  };

  const handleGoHome = () => {
    setViewMode('home');
  };

  const handleStageComplete = (stageId: number, answers: any) => {
    if (!sessionData) return;

    const updatedSession = updateSessionProgress(sessionData, stageId, true);
    setSessionData(updatedSession);
  };

  const handleNextStage = () => {
    if (!sessionData) return;

    // تخطي المرحلة 6 المحذوفة
    let nextStage = sessionData.currentStage + 1;
    if (nextStage === 6) nextStage = 7;
    nextStage = Math.min(nextStage, 9);
    
    const updatedSession = {
      ...sessionData,
      currentStage: nextStage
    };
    
    saveSession(updatedSession);
    setSessionData(updatedSession);
  };

  const handleResetToStage = (stageId: number) => {
    if (!sessionData) return;

    const updatedSession = resetSessionToStage(sessionData, stageId);
    setSessionData(updatedSession);
  };

  const handleStageNavigation = (stageId: number) => {
    if (!sessionData) return;

    const updatedSession = {
      ...sessionData,
      currentStage: stageId
    };
    
    saveSession(updatedSession);
    setSessionData(updatedSession);
  };

  const handlePeriodChange = (period: AccountingPeriod) => {
    if (!sessionData) return;
    
    console.log('📅 تغيير الفترة المحاسبية:', period);
    
    const updatedSessionData = {
      ...sessionData,
      currentPeriod: period
    };
    
    setSessionData(updatedSessionData);
    saveSession(updatedSessionData);
  };

  const renderCurrentStage = () => {
    if (!sessionData) return null;

    switch (sessionData.currentStage) {
      case 1:
        return (
          <Stage1TransactionIdentification
            sessionData={sessionData}
            onComplete={(answers) => handleStageComplete(1, answers)}
            onNext={handleNextStage}
            onSessionUpdate={setSessionData}
          />
        );
      
      case 2:
        return (
          <Stage2JournalEntries
            sessionData={sessionData}
            onComplete={(answers) => handleStageComplete(2, answers)}
            onNext={handleNextStage}
          />
        );
      
      case 3:
        return (
          <Stage3JournalAnalysis
            sessionData={sessionData}
            onStageComplete={handleNextStage}
            onUpdateSessionData={setSessionData}
          />
        );
      
      case 4:
        return (
          <Stage3PostToLedger
            sessionData={sessionData}
            onStageComplete={handleNextStage}
            onUpdateSessionData={setSessionData}
          />
        );
      
      
      case 5:
        return (
          <Stage4TrialBalance
            sessionData={sessionData}
            onStageComplete={handleNextStage}
            onUpdateSessionData={setSessionData}
          />
        );
      
      case 6:
        // المرحلة 6 محذوفة - الانتقال مباشرة للمرحلة 7
        return (
          <Stage6AdjustingEntries1
            sessionData={sessionData}
            onStageComplete={handleNextStage}
            onUpdateSessionData={setSessionData}
            onStageNavigation={handleStageNavigation}
          />
        );
      
      case 7:
        return (
          <Stage6AdjustingEntries1
            sessionData={sessionData}
            onStageComplete={handleNextStage}
            onUpdateSessionData={setSessionData}
            onStageNavigation={handleStageNavigation}
          />
        );
      
      case 8:
        return (
          <Stage7PostAdjustmentTrialBalance
            sessionData={sessionData}
            onStageComplete={handleNextStage}
            onUpdateSessionData={setSessionData}
          />
        );
      
      case 9:
        return (
          <Stage8FinancialStatements
            sessionData={sessionData}
            onStageComplete={handleStageComplete}
            onNext={handleNextStage}
          />
        );
      
      default:
        return (
          <div className="text-center py-12">
            <p className="text-muted-foreground">مرحلة غير معروفة</p>
          </div>
        );
    }
  };

  // عرض شاشة الخطأ
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <div className="text-destructive text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-foreground mb-4">خطأ في تحميل النظام</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              إعادة المحاولة
            </button>
            <button
              onClick={handleClearData}
              className="w-full bg-destructive text-destructive-foreground px-4 py-2 rounded-md hover:bg-destructive/90 transition-colors"
            >
              مسح البيانات وإعادة البدء
            </button>
          </div>
        </div>
      </div>
    );
  }

  // عرض شاشة التحميل
  if (isLoading || !sessionData) {
    const loadingTime = Date.now();
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg mb-2">جاري تحميل النظام...</p>
          <p className="text-muted-foreground text-sm mb-4">{loadingStep}</p>
          
          {/* معلومات تشخيصية إضافية */}
          <div className="bg-muted/50 rounded-lg p-4 text-xs text-muted-foreground space-y-1">
            <div>الوقت: {new Date().toLocaleTimeString('ar-EG')}</div>
            <div>الرابط: {window.location.pathname}</div>
            <div>localStorage: {typeof Storage !== "undefined" ? "مدعوم" : "غير مدعوم"}</div>
            <div>البيانات المحفوظة: {localStorage.getItem('accounting-session') ? "موجودة" : "غير موجودة"}</div>
          </div>
          
          {/* إذا استغرق التحميل وقتاً طويلاً */}
          <div className="mt-4">
            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer hover:text-foreground mb-2">
                إذا استغرق التحميل وقتاً طويلاً؟
              </summary>
              <div className="text-right space-y-2">
                <p>• تأكد من أن المتصفح يدعم localStorage</p>
                <p>• جرب إعادة تحميل الصفحة</p>
                <p>• تأكد من اتصال الإنترنت</p>
                <p>• امسح بيانات المتصفح إذا لزم الأمر</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'home') {
    return <HomePage onStartSimulation={handleStartSimulation} />;
  }

  const shouldShowPeriodBar = sessionData.currentStage >= 1; // عرض شريط الفترات من المرحلة الأولى فما فوق

  return (
    <SimulationLayout
      sessionData={sessionData}
      onGoHome={handleGoHome}
      onResetToStage={handleResetToStage}
      onStageNavigation={handleStageNavigation}
    >
      {renderCurrentStage()}
    </SimulationLayout>
  );
}

export default AccountingSimulation;