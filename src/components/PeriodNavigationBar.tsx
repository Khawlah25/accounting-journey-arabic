import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, TrendingUp, BarChart3, PieChart, Target } from 'lucide-react';
import { AccountingPeriod } from '@/types/accounting';

interface PeriodNavigationBarProps {
  currentPeriod: AccountingPeriod;
  onPeriodChange: (period: AccountingPeriod) => void;
}

const periodConfig = {
  q1: {
    label: 'الربع الأول',
    icon: Calendar,
    description: 'يناير - مارس',
    isActive: true
  },
  q2: {
    label: 'الربع الثاني',
    icon: TrendingUp,
    description: 'أبريل - يونيو',
    isActive: false
  },
  q3: {
    label: 'الربع الثالث',
    icon: BarChart3,
    description: 'يوليو - سبتمبر',
    isActive: false
  },
  q4: {
    label: 'الربع الرابع',
    icon: PieChart,
    description: 'أكتوبر - ديسمبر',
    isActive: false
  },
  'full-year': {
    label: 'السنة المالية الكاملة',
    icon: Target,
    description: 'جميع الأرباع',
    isActive: false
  }
};

export function PeriodNavigationBar({ currentPeriod, onPeriodChange }: PeriodNavigationBarProps) {
  return (
    <Card className="mb-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-foreground">الفترة المحاسبية</h3>
          <div className="text-sm text-muted-foreground">
            اختر الفترة لعرض البيانات المخصصة لها
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {Object.entries(periodConfig).map(([key, config]) => {
            const Icon = config.icon;
            const isSelected = currentPeriod === key;
            const isAvailable = config.isActive;
            
            return (
              <Button
                key={key}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onPeriodChange(key as AccountingPeriod)}
                disabled={!isAvailable && key !== currentPeriod}
                className={`
                  flex items-center gap-2 transition-all duration-200
                  ${isSelected ? 'ring-2 ring-primary/20' : ''}
                  ${!isAvailable && !isSelected ? 'opacity-60' : ''}
                `}
              >
                <Icon className="h-4 w-4" />
                <div className="text-right">
                  <div className="font-medium">{config.label}</div>
                  <div className="text-xs opacity-80">{config.description}</div>
                </div>
                {!isAvailable && key !== 'q1' && (
                  <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-1 py-0.5 rounded">
                    قريباً
                  </span>
                )}
              </Button>
            );
          })}
        </div>
        
        {currentPeriod !== 'q1' && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
              <Target className="h-5 w-5" />
              <span className="font-medium">هذا القسم قيد التطوير، وسيتم تفعيله لاحقاً.</span>
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
              حالياً، تتوفر البيانات للربع الأول فقط. سيتم إضافة المزيد من الفترات المحاسبية قريباً.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}