
import React, { useState } from 'react';
import { Book, ArrowRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Section {
  id: number;
  title: string;
  description: string;
  color: string;
}

const sections: Section[] = [
  {
    id: 1,
    title: "التعاريف",
    description: "المصطلحات والمفاهيم الأساسية المستخدمة في المحاسبة والتي تشكل الأساس لفهم العلوم المحاسبية.",
    color: "hsl(var(--primary) / 0.15)",
  },
  {
    id: 2,
    title: "الفروض",
    description: "الافتراضات الأساسية التي تقوم عليها الممارسة المحاسبية مثل الوحدة المحاسبية والاستمرارية والفترة المحاسبية.",
    color: "hsl(var(--primary) / 0.1)",
  },
  {
    id: 3,
    title: "المبادئ",
    description: "القواعد الأساسية التي تحكم عملية التسجيل والقياس المحاسبي وإعداد القوائم المالية.",
    color: "hsl(var(--primary) / 0.15)",
  },
  {
    id: 4,
    title: "المفاهيم",
    description: "المفاهيم التي توجه عملية اتخاذ القرارات المحاسبية وتساعد في تطبيق المعايير بطريقة صحيحة.",
    color: "hsl(var(--primary) / 0.1)",
  },
  {
    id: 5,
    title: "الأسس",
    description: "القواعد التي تحدد متى وكيف يتم الاعتراف بالعناصر المحاسبية وتسجيلها في الدفاتر المحاسبية.",
    color: "hsl(var(--primary) / 0.15)",
  },
  {
    id: 6,
    title: "السياسات",
    description: "الطرق والأساليب المحددة التي تختارها المنشأة لتطبيق المعايير المحاسبية في إعداد قوائمها المالية.",
    color: "hsl(var(--primary) / 0.1)",
  }
];

export default function AccountingReference() {
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleSectionClick = (section: Section) => {
    setSelectedSection(section);
    setIsOpen(true);
  };

  const createSectionPath = (index: number, total: number) => {
    const angle = (360 / total) * index;
    const nextAngle = (360 / total) * (index + 1);
    
    const radius = 220;
    const centerX = 300;
    const centerY = 300;
    
    const startAngle = (angle - 90) * (Math.PI / 180);
    const endAngle = (nextAngle - 90) * (Math.PI / 180);
    
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    
    const largeArcFlag = nextAngle - angle > 180 ? 1 : 0;
    
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  const getSectionTextPosition = (index: number, total: number) => {
    const angle = (360 / total) * index + (360 / total) / 2;
    const radius = 150;
    const centerX = 300;
    const centerY = 300;
    
    const angleRad = (angle - 90) * (Math.PI / 180);
    const x = centerX + radius * Math.cos(angleRad);
    const y = centerY + radius * Math.sin(angleRad);
    
    return { x, y };
  };

  return (
      <Card className="p-8 md:p-12 border shadow-sm">
        <div className="flex justify-center">
          <svg viewBox="0 0 600 600" className="w-full max-w-[600px] h-auto drop-shadow-sm" role="img" aria-label="مرجع المحاسبة">
        {/* خلفية الدائرة حسب الثيم */}
        <circle
          cx="300"
          cy="300"
          r="240"
          fill="hsl(var(--card))"
          stroke="hsl(var(--border))"
          strokeWidth="3"
        />
        
        {/* الأقسام الستة */}
        {sections.map((section, index) => (
          <g key={section.id}>
            <Popover open={isOpen && selectedSection?.id === section.id} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <path
                  d={createSectionPath(index, sections.length)}
                  fill={section.color}
                  stroke="hsl(var(--background))"
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-300 hover:opacity-90 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  style={{ transformOrigin: '300px 300px' }}
                  onClick={() => handleSectionClick(section)}
                  tabIndex={0}
                  role="button"
                  aria-label={section.title}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSectionClick(section);
                    }
                  }}
                />
              </PopoverTrigger>
              <PopoverContent 
                className="w-[420px] max-w-[90vw] p-5 rounded-xl border shadow-lg" 
                side="bottom"
                align="center"
                sideOffset={15}
              >
                <div className="flex items-start space-x-4 space-x-reverse">
                  <div className="flex-shrink-0">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: section.color }}
                    >
                      <Book className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <h3 className="font-bold text-xl text-foreground leading-tight">
                      {section.title}
                    </h3>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      {section.description}
                    </p>
                    <Button variant="ghost" size="sm" className="mt-2">
                      انقر للدخول إلى الصفحة التفصيلية
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            {/* نص القسم مع تحسين التخطيط */}
            <text
              x={getSectionTextPosition(index, sections.length).x}
              y={getSectionTextPosition(index, sections.length).y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-bold text-sm pointer-events-none"
              style={{ fontSize: '16px', fontFamily: 'system-ui, -apple-system, sans-serif', fill: 'hsl(var(--primary-foreground))' }}
            >
              {section.title.split(' ').length <= 2 ? (
                <tspan x={getSectionTextPosition(index, sections.length).x}>
                  {section.title}
                </tspan>
              ) : (
                <>
                  <tspan x={getSectionTextPosition(index, sections.length).x} dy="-8">
                    {section.title.split(' ').slice(0, 2).join(' ')}
                  </tspan>
                  <tspan x={getSectionTextPosition(index, sections.length).x} dy="16">
                    {section.title.split(' ').slice(2).join(' ')}
                  </tspan>
                </>
              )}
            </text>

            {/* مؤشر النقر */}
            <circle
              cx={getSectionTextPosition(index, sections.length).x + 40}
              cy={getSectionTextPosition(index, sections.length).y - 30}
              r="12"
              fill="hsl(var(--card))"
              stroke={section.color}
              strokeWidth="3"
              className="pointer-events-none"
            />
            <text
              x={getSectionTextPosition(index, sections.length).x + 40}
              y={getSectionTextPosition(index, sections.length).y - 24}
              textAnchor="middle"
              dominantBaseline="middle"
              className="pointer-events-none"
              style={{ fontSize: '14px', fill: section.color, fontWeight: 'bold' }}
            >
              ⓘ
            </text>
          </g>
        ))}
        
        </svg>
      </div>
      </Card>
  );
}
