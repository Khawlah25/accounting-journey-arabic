import React, { useEffect } from 'react';

const NotesDisclosurePage: React.FC = () => {
  const title = 'قائمة الإيضاحات المتممة للقوائم المالية';
  const description = 'عرض قائمة الإيضاحات المتممة — صفحة مبدئية وسيضاف المحتوى لاحقًا.';

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
      <h1 className="text-3xl font-bold text-foreground">{title}</h1>
      <p className="text-muted-foreground mt-2">{description}</p>
    </main>
  );
};

export default NotesDisclosurePage;
