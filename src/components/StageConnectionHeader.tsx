import React from 'react';
import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StageConnectionHeaderProps {
  title: string;
  stageNumber: number;
  icon: LucideIcon;
  previousStageInfo?: {
    description: string;
    count?: number;
  };
  currentStageInfo: {
    description: string;
  };
  nextStageInfo?: {
    title: string;
    description: string;
  };
  balanceCalculationInfo?: {
    formula: string;
    explanation: string;
  };
  gradientColors: {
    from: string;
    to: string;
  };
}

export function StageConnectionHeader({
  title,
  stageNumber,
  icon: Icon,
  previousStageInfo,
  currentStageInfo,
  nextStageInfo,
  balanceCalculationInfo,
  gradientColors
}: StageConnectionHeaderProps) {
  return (
    <div className={`bg-gradient-to-r ${gradientColors.from} ${gradientColors.to} border border-border rounded-lg p-6 mb-6`}>
      <div className="flex items-center gap-2 text-3xl font-bold mb-4">
        <Icon className="h-8 w-8 text-primary" />
        <h2>{title}</h2>
      </div>
      
      {/* Stage Connection Info */}
      <div className="bg-white/80 dark:bg-card/80 rounded-lg p-4 mb-4">
        {previousStageInfo && (
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                مصدر البيانات
              </span>
              <span>
                {previousStageInfo.description}
                {previousStageInfo.count && ` (${previousStageInfo.count})`}
              </span>
            </div>
          </div>
        )}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {currentStageInfo.description}
        </p>
      </div>

      {/* Balance Calculation Explanation */}
      {balanceCalculationInfo && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              طريقة حساب الرصيد
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {balanceCalculationInfo.formula}
          </p>
          {balanceCalculationInfo.explanation && (
            <p className="text-xs text-muted-foreground mt-1">
              {balanceCalculationInfo.explanation}
            </p>
          )}
        </div>
      )}

      {/* Next Stage Preview */}
      {nextStageInfo && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              المرحلة التالية
            </span>
            <span className="text-sm font-medium">{nextStageInfo.title}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {nextStageInfo.description}
          </p>
        </div>
      )}
    </div>
  );
}

export default StageConnectionHeader;