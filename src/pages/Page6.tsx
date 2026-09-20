import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const Page6: React.FC = () => {
  const title = 'المستوى السادس المحاسبة للقوائم المالية الموحدة';
  const items = [
    'تحليل اندماج الأعمال وقيود الاستحواذ',
    'المعالجة المحاسبية للشهرة الموجبة والسالبة',
    'المعالجة المحاسبية للاستثمار باستخدام طريقة حقوق الملكية',
    'التغيرات في الحصص داخل الشركات التابعة',
    'توحيد القوائم المالية – السيطرة الكاملة',
    'إلغاء المعاملات البينية (مخزون، أصول، إيرادات)',
    'توزيعات الأرباح داخل المجموعة',
    'ضرائب الدخل المؤجلة في التوحيد',
    'توحيد العملات الأجنبية',
    'ربحية السهم الموحدة (أساسية ومخففة)',
    'إعداد التقارير المالية الموحدة',
    'تقديم الإفصاحات المالية الموحدة',
    'التقارير القطاعية',
    'المشتقات والتحوط في البيئة الموحدة',
    'إعداد التقارير الختامية للمجموعة',
  ] as const;
  const [activeIndex, setActiveIndex] = useState<number>(0);

  useEffect(() => {
    document.title = `${title} | نظام المحاكاة المحاسبية`;
    const desc = `${title} — صفحة مؤقتة للتطوير لاحقًا.`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);
    // canonical
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', `${window.location.origin}/page6`);
  }, []);

  return (
    <main className="container mx-auto px-6 py-12">
      <section className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <div className="mt-6 flex items-start gap-6">
          <section aria-label="منطقة المحتوى" className="flex-1">
            <article
              aria-live="polite"
              className="min-h-[60vh] rounded-lg border border-border bg-background shadow-sm"
            />
          </section>

          <aside aria-label="القائمة الجانبية" className="w-64 shrink-0">
            <nav className="sticky top-20">
              <ul className="space-y-2">
                {items.map((label, idx) => (
                  <li key={label}>
                    <Button
                      variant={activeIndex === idx ? "secondary" : "ghost"}
                      className="w-full justify-start text-right"
                      onClick={() => setActiveIndex(idx)}
                      aria-current={activeIndex === idx ? "true" : undefined}
                    >
                      {label}
                    </Button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default Page6;
