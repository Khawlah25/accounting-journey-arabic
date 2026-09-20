import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, BookOpen, Calculator, TrendingUp, BarChart3, Users, FileText, PieChart, Target, Building, DollarSign, Banknote } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LevelProgressBarProps {
  onStartStudent: () => void;
  className?: string;
}

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

const LevelProgressBar: React.FC<LevelProgressBarProps> = ({ onStartStudent, className }) => {
  const navigate = useNavigate();

  const commonClasses =
    'rounded-md border px-4 py-3 text-sm font-medium text-center transition-colors duration-200 select-none w-full';

  const handleAdvancedLevelClick = (level: typeof advancedLevels[0]) => {
    if (level.action === 'startStudent') {
      onStartStudent();
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
    <nav aria-label="شريط تقدم المستويات" className={className}>
      <div className="hidden">
        {/* تم نقل المحتوى إلى صفحة المسارات */}
      </div>
    </nav>
  );
};

export default LevelProgressBar;
