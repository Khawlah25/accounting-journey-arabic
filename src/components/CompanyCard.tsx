// بطاقة عرض بيانات الشركة

import React from 'react';
import { Building2, Users, Banknote, Calendar, Activity } from 'lucide-react';
import { Company } from '@/types/accounting';
import { formatCurrency, formatNumber } from '@/utils/dataGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateGregorian } from '@/lib/utils';
interface CompanyCardProps {
  company: Company;
  transactionCount?: number;
  className?: string;
}
export function CompanyCard({
  company,
  transactionCount = 0,
  className = ''
}: CompanyCardProps) {
  return <Card className={`accounting-card ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Building2 className="h-6 w-6 text-primary" />
          {company.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-accent" />
            <div>
              <div className="text-sm text-muted-foreground">نوع النشاط</div>
              <div className="font-medium">{company.activity}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Banknote className="h-5 w-5 text-success" />
            <div>
              <div className="text-sm text-muted-foreground">رأس المال</div>
              <div className="font-medium tabular-nums">
                {formatCurrency(company.capitalSAR)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <div className="text-sm text-muted-foreground">عدد الموظفين</div>
              <div className="font-medium">{formatNumber(company.employees)} موظف</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-accent" />
            <div>
              <div className="text-sm text-muted-foreground">تاريخ التأسيس</div>
              <div className="font-medium">
                {formatDateGregorian(company.establishedDate)}
              </div>
            </div>
          </div>
        </div>
        
        {transactionCount > 0 && <div className="mt-4 p-3 bg-primary-light rounded-lg">
            
          </div>}
      </CardContent>
    </Card>;
}
export default CompanyCard;