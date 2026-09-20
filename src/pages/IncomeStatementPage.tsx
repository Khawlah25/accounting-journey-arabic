import React, { useEffect } from 'react';
import IncomeStatementInterface from '@/components/IncomeStatementInterface';

const IncomeStatementPage: React.FC = () => {
  const title = 'قائمة الدخل';
  const description = 'إعداد وعرض قائمة الدخل مع إدخال المبالغ للحسابات المختلفة';

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

  return (
    <main className="container mx-auto px-6 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      
      <IncomeStatementInterface />
    </main>
  );
};

export default IncomeStatementPage;
