// شريط التقدم للمراحل السبعة

import React from 'react';
import { Check, Circle } from 'lucide-react';
import { Stage } from '@/types/accounting';

interface ProgressBarProps {
  stages: Stage[];
  currentStage: number;
  className?: string;
  onStageClick?: (stageId: number) => void;
}

export function ProgressBar({ stages, currentStage, className = '', onStageClick }: ProgressBarProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-4">
        {stages.map((stage, index) => (
          <React.Fragment key={stage.id}>
            <div className="flex flex-col items-center">
              <button
                onClick={() => onStageClick?.(stage.id)}
                disabled={!onStageClick}
                className={`progress-step ${
                  stage.id < currentStage
                    ? 'completed'
                    : stage.id === currentStage
                    ? 'active'
                    : 'inactive'
                } ${onStageClick ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
              >
                {stage.id < currentStage ? (
                  <Check size={20} />
                ) : (
                  <Circle size={20} />
                )}
              </button>
              <div className="mt-2 text-center">
                <div className={`text-xs font-medium ${
                  stage.id <= currentStage ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {stage.title}
                </div>
              </div>
            </div>
            
            {index < stages.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  stage.id < currentStage
                    ? 'bg-success'
                    : 'bg-border'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      
      <div className="text-center">
        <div className="text-sm text-muted-foreground">
          {stages.find(s => s.id === currentStage)?.title}
        </div>
      </div>
    </div>
  );
}

export default ProgressBar;