import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Landmark, Banknote, FileText, ScrollText } from 'lucide-react';

const FinancialStatementsPage: React.FC = () => {
  const title = 'القوائم المالية';
  const description = 'اختر إحدى القوائم المالية للاطلاع عليها: الدخل، المركز المالي، التدفقات النقدية، حقوق الملكية، الإيضاحات.';

  useEffect(() => {
    document.title = `${title} | نظام المحاكاة المحاسبية`;
    const desc = `${description}`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);
  }, []);

  const cards = [
    { to: '/financial-statements/income', title: 'قائمة الدخل', icon: BarChart3 },
    { to: '/financial-statements/balance-sheet', title: 'قائمة المركز المالي', icon: Landmark },
    { to: '/financial-statements/cash-flow', title: 'قائمة التدفقات النقدية', icon: Banknote },
    { to: '/financial-statements/equity-changes', title: 'قائمة التغيرات في حقوق الملكية', icon: FileText },
    { to: '/financial-statements/notes', title: 'قائمة الإيضاحات المتممة للقوائم المالية', icon: ScrollText },
  ];

  return (
    <main className="container mx-auto px-6 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </header>

      <section aria-label="بطاقات القوائم المالية">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(({ to, title, icon: Icon }) => (
            <Link key={to} to={to} className="group focus:outline-none focus:ring-2 focus:ring-ring rounded-lg">
              <Card className="h-full transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon size={22} />
                    </span>
                    <CardTitle className="text-lg">{title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">اضغط للانتقال إلى {title}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
};

export default FinancialStatementsPage;
