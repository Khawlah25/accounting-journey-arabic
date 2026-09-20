import React, { useState } from 'react';
import { Grid3X3, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Company } from '@/types/accounting';
import { getAvailableCompanies } from '@/utils/dataGenerator';
import { CompanyCardSmall } from './CompanyCardSmall';
import { CompanyCard } from './CompanyCard';

interface CompanySelectionManagerProps {
  selectedCompanyId: string;
  onSelectCompany: (companyId: string) => void;
  transactionCount?: number;
}

export function CompanySelectionManager({ 
  selectedCompanyId, 
  onSelectCompany, 
  transactionCount = 0 
}: CompanySelectionManagerProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'single'>(selectedCompanyId ? 'single' : 'grid');
  const companies = getAvailableCompanies();
  const selectedCompany = companies.find(c => c.companyId === selectedCompanyId);

  const handleCompanySelect = (companyId: string) => {
    onSelectCompany(companyId);
    setViewMode('single');
  };

  const handleChangeCompany = () => {
    setViewMode('grid');
  };

  if (viewMode === 'grid') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">اختر الشركة للمحاكاة</h2>
          <p className="text-sm text-muted-foreground">
            اختر إحدى الشركات المتاحة لبدء المحاكاة المحاسبية
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {companies.map((company) => (
            <CompanyCardSmall
              key={company.companyId}
              company={company}
              isSelected={company.companyId === selectedCompanyId}
              onClick={() => handleCompanySelect(company.companyId)}
            />
          ))}
        </div>
        
        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={() => setViewMode('single')}
            className="text-sm"
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            العودة إلى الشركة المختارة
          </Button>
        </div>
      </div>
    );
  }

  if (!selectedCompany) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">لم يتم العثور على الشركة المختارة</p>
        <Button onClick={handleChangeCompany} variant="outline">
          اختيار شركة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          بيانات الشركة
        </h2>
        <Button
          onClick={handleChangeCompany}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Grid3X3 className="h-4 w-4" />
          تغيير الشركة
        </Button>
      </div>
      
      <div className="transform scale-90 origin-top">
        <CompanyCard 
          company={selectedCompany} 
          transactionCount={transactionCount}
        />
      </div>
    </div>
  );
}

export default CompanySelectionManager;