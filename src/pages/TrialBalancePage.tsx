import React, { useEffect, useMemo } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { AccountBalancesSidebar } from '@/components/AccountBalancesSidebar';
import AccountNamesSidebar from '@/components/AccountNamesSidebar';
import { getCurrentOrCreateSession } from '@/utils/sessionManager';
import { getChartOfAccounts } from '@/utils/dataGenerator';

const TrialBalancePage: React.FC = () => {
  const title = 'ميزان المراجعة';
  const description = 'عرض ميزان المراجعة: الحساب، مدين، دائن — الجدول يدعم التمرير.';

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

  const rows = [
    { account: 'الصندوق', debit: 15000, credit: 0 },
    { account: 'البنك', debit: 25000, credit: 0 },
    { account: 'رأس المال', debit: 0, credit: 40000 },
    { account: 'الموردون', debit: 0, credit: 5000 },
    { account: 'العملاء', debit: 3000, credit: 0 },
    { account: 'مصروفات عمومية', debit: 1200, credit: 0 },
  ];

  const format = (n: number) => n.toLocaleString('ar-EG');

  // حساب أرصدة الحسابات من دفتر الأستاذ
  const accountBalances = useMemo(() => {
    try {
      const session = getCurrentOrCreateSession();
      
      // استخدام البيانات من المرحلة الثالثة إذا كانت متوفرة
      if (session.stage3AccountSummary && Object.keys(session.stage3AccountSummary).length > 0) {
        return Object.entries(session.stage3AccountSummary)
          .filter(([_, account]) => Math.abs(account.finalBalance || 0) > 0) // فقط الحسابات التي لها أرصدة
          .map(([accountCode, accountData]) => {
            const account = session.chartOfAccounts.find(acc => acc.code === accountCode);
            return {
              code: accountCode,
              name: account?.name || `حساب ${accountCode}`,
              balance: accountData.finalBalance || 0
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name, 'ar')); // ترتيب أبجدي
      }
      
      // أو حساب الأرصدة من العمليات المالية مباشرة
      const calculateAccountBalances = () => {
        const accountSummary = new Map();
        const chartOfAccounts = getChartOfAccounts();
        
        // استخراج جميع الحسابات وتجميع البيانات
        session.transactions.forEach((transaction) => {
          transaction.lines.forEach((line) => {
            const accountCode = line.accountCode;
            const accountName = line.accountName;
            
            // البحث عن نوع الحساب من دليل الحسابات
            const accountInfo = chartOfAccounts.find(acc => acc.code === accountCode);
            const accountType = accountInfo?.type || 'Asset';
            
            if (!accountSummary.has(accountCode)) {
              accountSummary.set(accountCode, {
                code: accountCode,
                name: accountName,
                type: accountType,
                debitTotal: 0,
                creditTotal: 0
              });
            }
            
            const account = accountSummary.get(accountCode);
            account.debitTotal += line.debit;
            account.creditTotal += line.credit;
          });
        });
        
        // حساب الأرصدة النهائية
        return Array.from(accountSummary.values())
          .map(account => {
            let finalBalance: number;
            
            // تحديد طبيعة الحساب المحاسبية
            if (account.type === 'Asset' || account.type === 'Expense') {
              finalBalance = account.debitTotal - account.creditTotal;
            } else {
              finalBalance = account.creditTotal - account.debitTotal;
            }
            
            return {
              code: account.code,
              name: account.name,
              balance: Math.abs(finalBalance)
            };
          })
          .filter(account => account.balance > 0)
          .sort((a, b) => a.name.localeCompare(b.name, 'ar'));
      };
      
      return calculateAccountBalances();
    } catch (error) {
      console.error('خطأ في حساب أرصدة الحسابات:', error);
      return [];
    }
  }, []);

  return (
    <main className="container mx-auto px-6 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </header>

      <ResizablePanelGroup direction="horizontal" className="min-h-[70vh] rounded-lg border">
        <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
          <AccountNamesSidebar />
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={45} minSize={35}>
          <section aria-label="جدول ميزان المراجعة" className="h-full">
            <div className="max-h-[70vh] overflow-y-auto overflow-x-auto">
              <table className="accounting-table min-w-full">
                <thead className="sticky top-0">
                  <tr>
                    <th className="w-1/2">الحساب</th>
                    <th className="w-1/4">مدين</th>
                    <th className="w-1/4">دائن</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => (
                    <tr key={idx}>
                      <td>{r.account}</td>
                      <td className="debit tabular-nums">{r.debit ? format(r.debit) : '-'}</td>
                      <td className="credit tabular-nums">{r.credit ? format(r.credit) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
          <AccountBalancesSidebar accountBalances={accountBalances} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
};

export default TrialBalancePage;
