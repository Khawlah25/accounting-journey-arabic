import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Page3: React.FC = () => {
  const title = 'المستوى الثالث الشامل لإعداد التقارير المالية';

  useEffect(() => {
    document.title = `${title} | نظام المحاكاة المحاسبية`;
    const desc = 'شريط مرحلتين قابل للنقر: ميزان المراجعة والقوائم المالية ضمن المستوى الثالث.';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);
    // Canonical tag
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);
  }, []);

  return (
    <main className="container mx-auto px-6 py-12">
      <section className="max-w-3xl mx-auto space-y-3">
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground">اختر المرحلة مباشرة — يمكن النقر الحر دون ترتيب.</p>
      </section>

      <nav aria-label="مراحل المستوى الثالث" className="mt-6">
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <li>
            <Link
              to="/trial-balance"
              className="block rounded-lg p-5 border border-border shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring transition"
              aria-label="فتح ميزان المراجعة"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-lg">ميزان المراجعة</span>
              </div>
              <p className="mt-2 text-primary-foreground/90 text-sm">جدول بثلاثة أعمدة: الحساب، مدين، دائن</p>
            </Link>
          </li>
          <li>
            <Link
              to="/financial-statements"
              className="block rounded-lg p-5 border border-border shadow-sm bg-success text-success-foreground hover:bg-success/90 focus:outline-none focus:ring-2 focus:ring-ring transition"
              aria-label="فتح القوائم المالية"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-lg">القوائم المالية</span>
              </div>
              <p className="mt-2 text-success-foreground/90 text-sm">خمس بطاقات — كل بطاقة تفتح صفحة مخصصة</p>
            </Link>
          </li>
        </ul>
      </nav>
    </main>
  );
};

export default Page3;
