import React from 'react';
import { Building2, DollarSign } from 'lucide-react';
import { Company } from '@/types/accounting';
import { formatCurrency } from '@/utils/dataGenerator';
import { Card, CardContent } from '@/components/ui/card';

interface CompanyCardSmallProps {
  company: Company;
  isSelected?: boolean;
  onClick: () => void;
}

export function CompanyCardSmall({ company, isSelected = false, onClick }: CompanyCardSmallProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
        isSelected 
          ? 'ring-2 ring-primary border-primary bg-primary/5' 
          : 'hover:border-primary/50'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary flex-shrink-0" />
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">
            {company.name}
          </h3>
        </div>
        
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {company.activity}
          </p>
          
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-success" />
            <span className="text-xs font-medium">
              {formatCurrency(company.capitalSAR)}
            </span>
          </div>
        </div>
        
        {isSelected && (
          <div className="text-xs text-primary font-medium text-center">
            مختارة
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CompanyCardSmall;