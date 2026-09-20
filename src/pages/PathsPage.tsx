import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, BookOpen, Calculator, TrendingUp, BarChart3, Users, FileText, PieChart, Target, Building, DollarSign, Banknote, Book } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AccountingReference from '@/components/AccountingReference';

const advancedLevels = [
  { id: 2, title: 'المستوى الثاني - الدورة المحاسبية', icon: BookOpen, action: 'startStudent' },
  { id: 3, title: 'المستوى الثالث - التقارير المالية', icon: FileText, page: '/page3' },
  { id: 4, title: 'المستوى الرابع - ميزان المراجعة', icon: Calculator, page: '/page4' },
  { id: 5, title: 'المستوى الخامس - الضرائب والتسويات', icon: TrendingUp, page: '/page5' },
  { id: 6, title: 'المستوى السادس - القوائم الموحدة', icon: Building, page: '/page6' },
  { id: 7, title: 'المستوى السابع - التصحيحات المحاسبية', icon: Target, page: '/page7' },
  { id: 8, title: 'المستوى الثامن - القوائم المنفصلة', icon: PieChart, page: '/page8' },
  { id: 9, title: 'المستوى التاسع - تحليل الفروقات', icon: BarChart3, page: '/page9' },
];

const financialManagementLevels = [
  { id: 1, title: 'المستوى الأول', icon: DollarSign, page: '/financial-management-level-1' },
  { id: 2, title: 'المستوى الثاني', icon: Banknote, page: '/financial-management-level-2' },
];

const PathsPage = () => {
  const navigate = useNavigate();

  const commonClasses =
    'rounded-md border px-4 py-3 text-sm font-medium text-center transition-colors duration-200 select-none w-full';

  const handleAdvancedLevelClick = (level: typeof advancedLevels[0]) => {
    if (level.action === 'startStudent') {
      // Navigate back to home to start student mode
      navigate('/', { state: { startStudent: true } });
    } else if (level.page) {
      navigate(level.page);
    }
  };

  const handleFinancialManagementLevelClick = (level: typeof financialManagementLevels[0]) => {
    if (level.page) {
      navigate(level.page);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8">المسارات التعليمية</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* المرجع المحاسبي */}
          <div className="lg:w-1/3">
            <h2 className="text-xl font-semibold mb-4 text-center">المرجع المحاسبي</h2>
            <div className="flex justify-center">
              <AccountingReference />
            </div>
          </div>
          
          {/* المسارات التعليمية */}
          <div className="lg:w-2/3">
            <nav aria-label="المسارات التعليمية" className="w-full">
          <div className="flex flex-col gap-3 w-full">
            {/* المستوى التمهيدي */}
            <div
              className={
                commonClasses +
                ' border-transparent bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90'
              }
              onClick={() => navigate('/')}
              title="المستوى التمهيدي"
            >
              المستوى التمهيدي
            </div>

            {/* المستوى المتقدم للمحاسبة - Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={
                    commonClasses +
                    ' border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground flex items-center justify-center gap-2'
                  }
                  title="المستوى المتقدم للمحاسبة"
                >
                  المستوى المتقدم للمحاسبة
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 bg-card border-border" align="center">
                {advancedLevels.map((level) => {
                  const IconComponent = level.icon;
                  return (
                    <DropdownMenuItem
                      key={level.id}
                      onClick={() => handleAdvancedLevelClick(level)}
                      className="flex items-center gap-3 py-3 px-4 cursor-pointer hover:bg-accent hover:text-accent-foreground text-right"
                    >
                      <IconComponent className="w-4 h-4 shrink-0" />
                      <span className="text-sm">{level.title}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* المستوى المتقدم للإدارة المالية - Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={
                    commonClasses +
                    ' border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground flex items-center justify-center gap-2'
                  }
                  title="المستوى المتقدم للإدارة المالية"
                >
                  المستوى المتقدم للإدارة المالية
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 bg-card border-border" align="center">
                {financialManagementLevels.map((level) => {
                  const IconComponent = level.icon;
                  return (
                    <DropdownMenuItem
                      key={level.id}
                      onClick={() => handleFinancialManagementLevelClick(level)}
                      className="flex items-center gap-3 py-3 px-4 cursor-pointer hover:bg-accent hover:text-accent-foreground text-right"
                    >
                      <IconComponent className="w-4 h-4 shrink-0" />
                      <span className="text-sm">{level.title}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* زر المكتبة */}
            <div
              className={
                commonClasses +
                ' border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center justify-center gap-2'
              }
              onClick={() => window.location.href = '/library'}
              title="مكتبة الموارد التعليمية"
            >
              <Book className="w-4 h-4" />
              مكتبة
            </div>
            </div>
          </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathsPage;