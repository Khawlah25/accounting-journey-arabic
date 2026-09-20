import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const FinancialManagementLevel1 = () => {
  const levelContent = [
    {
      id: 1,
      title: 'فهم القيمة الزمنية للنقود',
      description: 'حساب القيمة الحالية والمستقبلية، الفائدة البسيطة والمركبة، الخصم والرسملة باستخدام الجداول.',
      colorClass: 'border-primary bg-primary/5'
    },
    {
      id: 2,
      title: 'التحليل المالي الأساسي',
      description: 'السيولة، الربحية، الكفاءة، المديونية.',
      colorClass: 'border-secondary bg-secondary/5'
    },
    {
      id: 3,
      title: 'أدوات التحليل التشغيلي',
      description: 'حساب نقطة التعادل، تحليل هامش المساهمة، الرفع التشغيلي والمالي.',
      colorClass: 'border-accent bg-accent/5'
    },
    {
      id: 4,
      title: 'إعداد القوائم المالية التقديرية',
      description: 'إعداد قائمة الدخل، المركز المالي، والتدفقات النقدية التقديرية.',
      colorClass: 'border-destructive bg-destructive/5'
    },
    {
      id: 5,
      title: 'إدارة رأس المال العامل',
      description: 'تحليل الحسابات المدينة والذمم الدائنة، تحديد مستوى المخزون الأمثل، سياسات رأس المال العامل.',
      colorClass: 'border-primary bg-primary/10'
    },
    {
      id: 6,
      title: 'تقييم المشاريع والمخاطر',
      description: 'حساب NPV وIRR وفترة الاسترداد، تحليل الحساسية والسيناريوهات.',
      colorClass: 'border-secondary bg-secondary/10'
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            المستوى الأول - الإدارة المالية
          </h1>
          <p className="text-lg text-muted-foreground">
            تعلم أساسيات الإدارة المالية والتحليل المالي
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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

export default FinancialManagementLevel1;