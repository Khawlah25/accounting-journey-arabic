import React, { useState } from 'react';
import { Download, Building2, Code, Home, ShoppingCart, Factory } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { generateTransactionsTemplate, getTemplateFilename } from '@/lib/templates/transactionsTemplate';
import { saveAs } from 'file-saver';

interface Company {
  id: string;
  name: string;
  activity: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const companies: Company[] = [
  {
    id: 'al-taqaddum',
    name: 'شركة التقدم التقنية',
    activity: 'تطوير البرمجيات والحلول التقنية',
    icon: Code,
    color: 'border-blue-200 hover:border-blue-400 bg-blue-50/50'
  },
  {
    id: 'al-fajr',
    name: 'شركة الفجر العقارية',
    activity: 'التطوير العقاري والمقاولات',
    icon: Home,
    color: 'border-green-200 hover:border-green-400 bg-green-50/50'
  },
  {
    id: 'al-raida-trading',
    name: 'شركة الرائدة للتجارة',
    activity: 'تجارة الجملة والتجزئة',
    icon: ShoppingCart,
    color: 'border-orange-200 hover:border-orange-400 bg-orange-50/50'
  },
  {
    id: 'al-sinaaat-advanced',
    name: 'شركة الصناعات المتقدمة',
    activity: 'تصنيع المواد البلاستيكية',
    icon: Factory,
    color: 'border-purple-200 hover:border-purple-400 bg-purple-50/50'
  }
];

interface CompanyTemplateSelectorProps {
  onCompanySelect?: (companyId: string | null) => void;
}

const CompanyTemplateSelector = ({ onCompanySelect }: CompanyTemplateSelectorProps) => {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  const handleCompanySelect = (companyId: string) => {
    const newCompanyId = selectedCompany === companyId ? null : companyId;
    setSelectedCompany(newCompanyId);
    onCompanySelect?.(newCompanyId);
  };

  const handleDownloadTemplate = (companyId: string) => {
    const csvContent = generateTransactionsTemplate(companyId);
    const filename = getTemplateFilename(companyId);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, filename);
  };

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        اختر الشركة لتحميل قالب مخصص يحتوي على أمثلة مناسبة لنشاطها:
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {companies.map((company) => {
          const IconComponent = company.icon;
          const isSelected = selectedCompany === company.id;
          
          return (
            <Card 
              key={company.id}
              className={`cursor-pointer transition-all duration-200 ${company.color} ${
                isSelected ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-sm'
              }`}
              onClick={() => handleCompanySelect(company.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <IconComponent className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm leading-tight truncate">
                        {company.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {company.activity}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadTemplate(company.id);
                    }}
                    className="flex-shrink-0"
                  >
                    <Download className="h-3 w-3 ml-1" />
                    تحميل
                  </Button>
                </div>
                
                {isSelected && (
                  <div className="mt-3 text-xs text-primary font-medium text-center">
                    مختارة - انقر "تحميل" للحصول على القالب المخصص
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
        <strong>ملاحظة:</strong> كل قالب يحتوي على أمثلة واقعية مناسبة لنشاط الشركة المختارة لمساعدتك في فهم نوع العمليات المطلوبة.
      </div>
    </div>
  );
};

export default CompanyTemplateSelector;