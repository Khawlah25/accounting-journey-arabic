// الصفحة الرئيسية لنظام المحاكاة المحاسبية

import React, { useState, useEffect } from 'react';
import { Play, RefreshCw, Target, Trophy, LogIn, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LevelProgressBar from '@/components/LevelProgressBar';
import CompanySelectionManager from '@/components/CompanySelectionManager';
import { PeriodNavigationBar } from '@/components/PeriodNavigationBar';
import UserMenu from '@/components/UserMenu';
import CompanySelector from '@/components/CompanySelector';
import { SessionData, AccountingPeriod } from '@/types/accounting';
import { getCurrentOrCreateSession, createNewSession, getCompletionPercentage, saveSession } from '@/utils/sessionManager';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HomePageProps {
  onStartSimulation: (sessionData: SessionData) => void;
}

export function HomePage({ onStartSimulation }: HomePageProps) {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [showCompanySelector, setShowCompanySelector] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState<AccountingPeriod>('q1');
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadSession = () => {
      if (!selectedCompanyId) {
        setIsLoading(false);
        return;
      }
      
      try {
        const session = getCurrentOrCreateSession(selectedCompanyId);
        setSessionData(session);
      } catch (error) {
        console.error('خطأ في تحميل الجلسة:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [selectedCompanyId]);

  const handleGenerateNewCompany = () => {
    setShowCompanySelector(true);
  };

  const handleSelectCompany = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setShowCompanySelector(false);
  };

  const handleStartAdmin = () => {
    if (sessionData) {
      const updated = {
        ...sessionData,
        userAnswers: {
          ...sessionData.userAnswers,
          simulationMode: 'admin'
        }
      };
      saveSession(updated);
      onStartSimulation(updated);
    }
  };

  const handleStartStudent = () => {
    if (sessionData) {
      const updated = {
        ...sessionData,
        currentStage: 2,
        userAnswers: {
          ...sessionData.userAnswers,
          simulationMode: 'student',
          currentPeriod
        }
      };
      saveSession(updated);
      onStartSimulation(updated);
    }
  };

  const handlePeriodChange = (period: AccountingPeriod) => {
    setCurrentPeriod(period);
    if (sessionData) {
      const updated = {
        ...sessionData,
        userAnswers: {
          ...sessionData.userAnswers,
          currentPeriod: period
        }
      };
      setSessionData(updated);
      saveSession(updated);
    }
  };
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (showCompanySelector) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <CompanySelector
              selectedCompanyId={selectedCompanyId}
              onSelectCompany={handleSelectCompany}
            />
            <div className="mt-6 text-center">
              <Button variant="ghost" onClick={() => setShowCompanySelector(false)}>
                العودة إلى الصفحة الرئيسية
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!sessionData && selectedCompanyId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">حدث خطأ في تحميل البيانات</p>
          <Button onClick={handleGenerateNewCompany} variant="outline">
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  const completionPercentage = sessionData ? getCompletionPercentage(sessionData.progress) : 0;
  const hasProgress = completionPercentage > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-6 py-8">
          {/* Navigation Bar */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => navigate('/paths')}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 cursor-pointer transition-colors flex items-center gap-2"
            >
              <Route className="h-4 w-4" />
              المسارات
            </button>
            
            <div className="flex items-center gap-3">
              {user ? (
                <UserMenu />
              ) : (
                <Button 
                  onClick={() => navigate('/auth')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  تسجيل الدخول
                </Button>
              )}
            </div>
          </div>

          {/* Main Title Section */}
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                نظام المحاكاة التعليمي
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-primary to-primary/60 mx-auto rounded-full"></div>
              <h2 className="text-2xl md:text-3xl font-semibold text-primary">
                للدورة المحاسبية
              </h2>
            </div>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              قم بإدارة شركتك الافتراضية وسجّل عملياتك المالية بدقة وفقًا للمعايير المحاسبية الدولية
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto flex flex-col lg:flex-row-reverse gap-8">
          <aside className="w-full lg:w-64 lg:shrink-0 space-y-6">
            <LevelProgressBar onStartStudent={handleStartStudent} className="w-full" />
          </aside>

          <div className="flex-1 space-y-8">
            {/* Company Selection */}
            <section className="space-y-4">
              <CompanySelectionManager
                selectedCompanyId={selectedCompanyId}
                onSelectCompany={handleSelectCompany}
                transactionCount={sessionData?.transactions.length || 0}
              />
              
              {/* Period Selection - Show only when company is selected */}
              {selectedCompanyId && (
                <PeriodNavigationBar
                  currentPeriod={currentPeriod}
                  onPeriodChange={handlePeriodChange}
                />
              )}
            </section>

            {/* Progress Section */}
            {hasProgress && (
              <section>
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-success" />
                  التقدم الحالي
                </h2>
                <Card className="accounting-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-medium">نسبة الإنجاز</span>
                      <span className="text-2xl font-bold text-success">
                        {completionPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className="bg-success h-3 rounded-full transition-all duration-500"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      المرحلة الحالية: {sessionData?.currentStage || 1} من 8
                    </p>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Features Overview */}
            <section>
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Target className="h-6 w-6 text-accent" />
                ما ستتعلمه بالمستوى الأول
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    title: 'تحديد العمليات المالية',
                    description: 'تعلم كيفية تحليل وتصنيف العمليات المالية المختلفة'
                  },
                  {
                    title: 'إعداد قيود اليومية',
                    description: 'إتقان تسجيل القيود المحاسبية بطريقة صحيحة'
                  },
                  {
                    title: 'دفتر الأستاذ',
                    description: 'ترحيل القيود وإعداد حسابات دفتر الأستاذ'
                  },
                  {
                    title: 'ميزان المراجعة',
                    description: 'استخراج وتحليل ميزان المراجعة'
                  },
                  {
                    title: 'قيود التسوية',
                    description: 'إعداد قيود التسوية في نهاية الفترة'
                  },
                  {
                    title: 'القوائم المالية',
                    description: 'إنشاء قائمة الدخل والميزانية العمومية'
                  }
                ].map((feature, index) => (
                  <Card key={index} className="accounting-card hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-xs">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Action Buttons */}
            {selectedCompanyId && sessionData && (
              <section className="text-center space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 justify-center">
                  <div className="flex flex-col items-stretch">
                    <Button 
                      onClick={handleStartAdmin}
                      className="accounting-button-primary text-lg px-8 py-6"
                      size="lg"
                    >
                      <Play className="mr-2 h-5 w-5" />
                      بدء المحاكاة – أدمن
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      الوصول إلى جميع مراحل المحاكاة، بما في ذلك توليد العمليات المالية
                    </p>
                  </div>

                  <div className="flex flex-col items-stretch">
                    <Button 
                      onClick={handleStartStudent}
                      className="text-lg px-8 py-6 rounded-lg bg-success text-success-foreground hover:bg-success/90 transition-colors"
                      size="lg"
                    >
                      <Play className="mr-2 h-5 w-5" />
                      بدء المحاكاة – طالب
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      بدء المحاكاة من مرحلة إعداد قيود اليومية بدون توليد العمليات المالية
                    </p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button 
                    onClick={handleGenerateNewCompany}
                    variant="outline"
                    className="accounting-button-secondary text-lg px-8 py-4"
                    size="lg"
                  >
                    <RefreshCw className="mr-2 h-5 w-5" />
                    اختيار شركة أخرى
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  * سيتم حفظ تقدمك تلقائياً لمدة 7 أيام
                </p>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default HomePage;
