import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Company } from '@/types/accounting';
import { getAvailableCompanies } from '@/utils/dataGenerator';
import { Building2, Users, Calendar, DollarSign } from 'lucide-react';

interface CompanySelectorProps {
  selectedCompanyId?: string;
  onSelectCompany: (companyId: string) => void;
}

const CompanySelector: React.FC<CompanySelectorProps> = ({ 
  selectedCompanyId, 
  onSelectCompany 
}) => {
  const companies = getAvailableCompanies();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">اختر الشركة للمحاكاة</h2>
        <p className="text-muted-foreground">
          اختر إحدى الشركات المتاحة لبدء المحاكاة المحاسبية
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {companies.map((company) => (
          <Card 
            key={company.companyId} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedCompanyId === company.companyId 
                ? 'ring-2 ring-primary border-primary' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => onSelectCompany(company.companyId)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    {company.name}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {company.activity}
                  </CardDescription>
                </div>
                {selectedCompanyId === company.companyId && (
                  <Badge variant="default" className="bg-primary">
                    مختارة
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">رأس المال</p>
                    <p className="font-semibold">{formatCurrency(company.capitalSAR)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">عدد الموظفين</p>
                    <p className="font-semibold">{company.employees} موظف</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">السنة المالية تنتهي في</p>
                  <p className="font-semibold">{company.fiscalMonth}</p>
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  className="w-full" 
                  variant={selectedCompanyId === company.companyId ? "default" : "outline"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCompany(company.companyId);
                  }}
                >
                  {selectedCompanyId === company.companyId ? 'الشركة المختارة' : 'اختر هذه الشركة'}
                </Button>
              </div>

              {/* معلومات إضافية عن نوع العمليات */}
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  {company.companyId === 'al-fajr' 
                    ? '40 عملية عقارية متنوعة (مشاريع، مقاولات، مبيعات عقارية)'
                    : '41 عملية تقنية متنوعة (تطوير برمجيات، خدمات تقنية)'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CompanySelector;