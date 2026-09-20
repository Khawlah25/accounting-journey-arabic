import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Book } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LibraryPage = () => {
  const navigate = useNavigate();

  // بيانات الرفوف والكتب
  const shelves = [
    {
      id: 1,
      books: [
        { id: 1, title: 'المعايير', color: 'bg-blue-600' },
        { id: 2, title: 'الإطار المفاهيمي للتقارير', color: 'bg-green-600' },
        { id: 3, title: 'الخصائص النوعية', color: 'bg-purple-600' }
      ]
    },
    {
      id: 2,
      books: [
        { id: 4, title: 'عناصر القوائم المالية والاعتراف', color: 'bg-red-600' },
        { id: 5, title: 'أسس القياس', color: 'bg-yellow-600' },
        { id: 6, title: 'السياسات', color: 'bg-indigo-600' }
      ]
    },
    {
      id: 3,
      books: [
        { id: 7, title: 'الدورة المحاسبية', color: 'bg-pink-600' },
        { id: 8, title: 'العرض والإفصاح', color: 'bg-teal-600' },
        { id: 9, title: 'التدفقات النقدية', color: 'bg-orange-600' }
      ]
    },
    {
      id: 4,
      books: [
        { id: 10, title: 'القوائم المجمعة', color: 'bg-emerald-600' },
        { id: 11, title: 'التقارير القطاعية والمرحلية', color: 'bg-violet-600' }
      ]
    }
  ];

  const handleBookClick = (bookTitle: string) => {
    console.log(`تم النقر على كتاب: ${bookTitle}`);
    // لا يحدث شيء كما طلب المستخدم
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
      {/* شريط علوي للعودة */}
      <div className="bg-card/50 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              العودة
            </Button>
            <h1 className="text-2xl font-bold text-foreground">المكتبة الرقمية</h1>
          </div>
        </div>
      </div>

      {/* المكتبة */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          
          {/* الرفوف */}
          <div className="space-y-10">
            {shelves.map((shelf, shelfIndex) => (
              <div key={shelf.id} className="relative">
                
                {/* خلفية الرف */}
                <div className="relative">
                  {/* الرف الخشبي */}
                  <div className="h-8 bg-gradient-to-r from-amber-700 to-amber-600 rounded-lg shadow-lg border-2 border-amber-800/30 relative overflow-hidden">
                    {/* ملمس الخشب */}
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-600/50 to-transparent"></div>
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)]"></div>
                  </div>
                  
                  {/* ظل الرف */}
                  <div className="absolute top-full left-0 right-0 h-2 bg-gradient-to-b from-black/20 to-transparent rounded-b-lg"></div>
                </div>

                {/* الكتب */}
                <div className="absolute -top-52 left-8 right-8 flex gap-[30px] justify-start">
                  {shelf.books.map((book) => (
                    <div
                      key={book.id}
                      onClick={() => handleBookClick(book.title)}
                      className="group cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-2xl"
                    >
                      {/* الكتاب */}
                      <div className="relative">
                        {/* جسم الكتاب */}
                        <div className={`
                          w-[150px] h-[200px] ${book.color} rounded-r-md shadow-lg
                          relative overflow-hidden
                          border-l-4 border-black/20
                          transition-all duration-300
                          group-hover:shadow-2xl
                        `}>
                          {/* النص على الكتاب */}
                          <div className="absolute inset-0 p-4 flex flex-col justify-between">
                            <div className="text-white text-sm font-bold leading-tight text-center">
                              {book.title}
                            </div>
                            <div className="flex justify-center">
                              <Book className="w-6 h-6 text-white/80" />
                            </div>
                          </div>
                          
                          {/* تأثير لامع */}
                          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/20 to-transparent"></div>
                          
                          {/* خطوط جانبية */}
                          <div className="absolute left-0 top-2 bottom-2 w-1 bg-black/30"></div>
                          <div className="absolute left-1 top-2 bottom-2 w-0.5 bg-white/30"></div>
                        </div>
                        
                        {/* ظل الكتاب */}
                        <div className="absolute top-full left-2 right-0 h-1 bg-gradient-to-r from-black/30 to-transparent rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>

          {/* نص إرشادي */}
          <div className="text-center mt-16 p-8 bg-card/30 rounded-lg border border-border/50">
            <Book className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">مرحباً بك في المكتبة الرقمية</h3>
            <p className="text-muted-foreground">
              اختر أي كتاب من الرفوف للتصفح والتعلم
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LibraryPage;