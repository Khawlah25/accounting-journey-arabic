// تخطيط واجهة المحاكاة الرئيسية

import React from 'react';
import { ArrowRight, Home, RotateCcw, Route } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ProgressBar from '@/components/ProgressBar';
import { SessionData } from '@/types/accounting';
import { getActiveStages } from '@/utils/sessionManager';

interface SimulationLayoutProps {
  sessionData: SessionData;
  children: React.ReactNode;
  onGoHome: () => void;
  onResetToStage?: (stageId: number) => void;
  onStageNavigation?: (stageId: number) => void;
  currentStageComponent?: React.ReactNode;
}

export function SimulationLayout({ 
  sessionData, 
  children, 
  onGoHome,
  onResetToStage,
  onStageNavigation,
  currentStageComponent
}: SimulationLayoutProps) {
  const navigate = useNavigate();
  const allStages = getActiveStages(sessionData.currentStage);
  const isStudentMode = sessionData.userAnswers?.simulationMode === 'student';
  const stages = isStudentMode 
    ? allStages.filter(stage => stage.id !== 1 && stage.type !== 'identify-transactions' && stage.type !== 'journal-analysis')
    : allStages;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onGoHome}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                الرئيسية
              </Button>
              <div className="text-sm text-muted-foreground">
                {sessionData.company.name}
              </div>
            </div>
            
            <div className="text-center">
              <h1 className="text-xl font-semibold">
                المحاكاة التعليمية للدورة المحاسبية
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/paths')}
                className="flex items-center gap-2"
              >
                <Route className="h-4 w-4" />
                المسارات
              </Button>
              {onResetToStage && sessionData.currentStage > 1 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onResetToStage(1)}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  إعادة تشغيل
                </Button>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <ProgressBar 
              stages={stages} 
              currentStage={sessionData.currentStage}
              onStageClick={onStageNavigation}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export default SimulationLayout;