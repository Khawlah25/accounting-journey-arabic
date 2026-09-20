import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const FinancialManagementLevel2 = () => {
  const levelContent = [
    {
      id: 1,
      title: 'تحليل تكلفة رأس المال',
      description: 'حساب تكلفة التمويل من القروض والملكية، احتساب WACC، ودراسة أثر تغيير هيكل التمويل على قيمة الشركة.',
      colorClass: 'border-primary bg-primary/5'
    },
    {
      id: 2,
      title: 'مصادر التمويل',
      description: 'تصنيف مصادر التمويل ، مقارنة الخيارات المتاحة، وفهم الخصائص الأساسية لأدوات التمويل التقليدية والإسلامية.',
      colorClass: 'border-secondary bg-secondary/5'
    },
    {
      id: 3,
      title: 'تخطيط التمويل والتدفقات',
      description: 'إعداد خطة تمويل طويلة الأجل، بناء نموذج بسيط للتدفقات النقدية المستقبلية، وتحليل الفجوات بين الإيرادات والمصروفات.',
      colorClass: 'border-accent bg-accent/5'
    },
    {
      id: 4,
      title: 'تحليل العائد والأداء',
      description: 'حساب العائد على الاستثمار (ROI) والعائد على حقوق الملكية (ROE)، وقياس تأثير الرافعة المالية على ربحية السهم.',
      colorClass: 'border-destructive bg-destructive/5'
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            المستوى الثاني - الإدارة المالية المتقدمة
          </h1>
          <p className="text-lg text-muted-foreground">
            تعمق في مفاهيم التمويل المتقدمة وتحليل الأداء المالي
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {levelContent.map((item) => (
            <Card 
              key={item.id} 
              className={`${item.colorClass} transition-all duration-300 hover:shadow-lg hover:scale-105`}
            >
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-primary leading-relaxed">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80 leading-relaxed text-base">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinancialManagementLevel2;