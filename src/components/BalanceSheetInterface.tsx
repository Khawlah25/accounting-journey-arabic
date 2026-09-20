import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Printer, Download } from 'lucide-react';

interface BalanceSheetInterfaceProps {
  onBack: () => void;
}

const BalanceSheetInterface: React.FC<BalanceSheetInterfaceProps> = ({ onBack }) => {
  // State for all form values
  const [balanceSheetDate, setBalanceSheetDate] = useState('');
  const [accountValues, setAccountValues] = useState<Record<string, string>>({});
  const [studentName, setStudentName] = useState('');
  const [studentSignature, setStudentSignature] = useState('');
  const [studentDate, setStudentDate] = useState('');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [reviewerSignature, setReviewerSignature] = useState('');

  // Handle account value changes
  const handleAccountChange = (accountIndex: string, value: string) => {
    setAccountValues(prev => ({
      ...prev,
      [accountIndex]: value
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a downloadable version - for now just print
    window.print();
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Controls */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة للقائمة الرئيسية
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              طباعة
            </Button>
            <Button
              variant="outline"
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              تحميل
            </Button>
          </div>
        </div>

        {/* Balance Sheet Form */}
        <Card className="print:shadow-none print:border-0">
          <CardContent className="p-8">
            {/* Title and Date */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-4">
                قائمة المركز المالي
              </h1>
              <div className="flex items-center justify-center gap-2 text-lg">
                <span>كما في تاريخ:</span>
                <Input
                  type="date"
                  value={balanceSheetDate}
                  onChange={(e) => setBalanceSheetDate(e.target.value)}
                  className="w-48 border-0 border-b border-foreground/30 rounded-none bg-transparent text-center"
                />
              </div>
            </div>

            {/* Balance Sheet Table */}
            <div className="space-y-8">
              
              {/* Assets Section */}
              <div>
                <h2 className="text-xl font-bold text-center bg-muted p-3 mb-4 rounded">
                  الأصول
                </h2>
                
                {/* Current Assets */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-primary">
                    الأصول المتداولة:
                  </h3>
                  <table className="w-full border-collapse">
                    <tbody>
                      {[
                        'النقدية في الصندوق',
                        'النقدية في البنك',
                        'العملاء',
                        'أوراق القبض',
                        'المخزون',
                        'المصروفات المدفوعة مقدماً',
                        'الاستثمارات قصيرة الأجل'
                      ].map((account, index) => (
                        <tr key={index} className="border-b border-border">
                          <td className="py-2 pr-4 text-right">{account}</td>
                          <td className="py-2 pl-4 w-32">
                            <Input
                              type="number"
                              value={accountValues[`current-assets-${index}`] || ''}
                              onChange={(e) => handleAccountChange(`current-assets-${index}`, e.target.value)}
                              className="border-0 border-b border-foreground/30 rounded-none bg-transparent text-left h-8 px-1"
                              placeholder="0"
                            />
                          </td>
                        </tr>
                      ))}
                      <tr className="border-b-2 border-foreground font-semibold">
                        <td className="py-3 pr-4 text-right">إجمالي الأصول المتداولة</td>
                        <td className="py-3 pl-4 w-32">
                          <Input
                            type="number"
                            value={accountValues['total-current-assets'] || ''}
                            onChange={(e) => handleAccountChange('total-current-assets', e.target.value)}
                            className="border-0 border-b-2 border-foreground rounded-none bg-transparent text-left h-8 px-1 font-semibold"
                            placeholder="0"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Non-Current Assets */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-primary">
                    الأصول غير المتداولة:
                  </h3>
                  <table className="w-full border-collapse">
                    <tbody>
                      {[
                        'الأراضي',
                        'المباني',
                        'مجمع إهلاك المباني',
                        'المعدات والآلات',
                        'مجمع إهلاك المعدات',
                        'الأثاث والتجهيزات',
                        'مجمع إهلاك الأثاث',
                        'الاستثمارات طويلة الأجل',
                        'براءات الاختراع',
                        'الشهرة'
                      ].map((account, index) => (
                        <tr key={index} className="border-b border-border">
                          <td className="py-2 pr-4 text-right">{account}</td>
                          <td className="py-2 pl-4 w-32">
                            <Input
                              type="number"
                              value={accountValues[`non-current-assets-${index}`] || ''}
                              onChange={(e) => handleAccountChange(`non-current-assets-${index}`, e.target.value)}
                              className="border-0 border-b border-foreground/30 rounded-none bg-transparent text-left h-8 px-1"
                              placeholder="0"
                            />
                          </td>
                        </tr>
                      ))}
                      <tr className="border-b-2 border-foreground font-semibold">
                        <td className="py-3 pr-4 text-right">إجمالي الأصول غير المتداولة</td>
                        <td className="py-3 pl-4 w-32">
                          <Input
                            type="number"
                            value={accountValues['total-non-current-assets'] || ''}
                            onChange={(e) => handleAccountChange('total-non-current-assets', e.target.value)}
                            className="border-0 border-b-2 border-foreground rounded-none bg-transparent text-left h-8 px-1 font-semibold"
                            placeholder="0"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="border-t-4 border-double border-foreground pt-2">
                  <table className="w-full">
                    <tbody>
                      <tr className="text-xl font-bold">
                        <td className="py-3 pr-4 text-right">إجمالي الأصول</td>
                        <td className="py-3 pl-4 w-32">
                          <Input
                            type="number"
                            value={accountValues['total-assets'] || ''}
                            onChange={(e) => handleAccountChange('total-assets', e.target.value)}
                            className="border-0 border-b-4 border-double border-foreground rounded-none bg-transparent text-left h-10 px-1 text-xl font-bold"
                            placeholder="0"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Liabilities and Equity Section */}
              <div>
                <h2 className="text-xl font-bold text-center bg-muted p-3 mb-4 rounded">
                  الالتزامات وحقوق الملكية
                </h2>
                
                {/* Current Liabilities */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-primary">
                    الالتزامات قصيرة الأجل:
                  </h3>
                  <table className="w-full border-collapse">
                    <tbody>
                      {[
                        'الموردين',
                        'أوراق الدفع',
                        'الأجور المستحقة',
                        'المصروفات المستحقة',
                        'الإيرادات المقبوضة مقدماً',
                        'القروض قصيرة الأجل',
                        'الضرائب المستحقة'
                      ].map((account, index) => (
                        <tr key={index} className="border-b border-border">
                          <td className="py-2 pr-4 text-right">{account}</td>
                          <td className="py-2 pl-4 w-32">
                            <Input
                              type="number"
                              value={accountValues[`current-liabilities-${index}`] || ''}
                              onChange={(e) => handleAccountChange(`current-liabilities-${index}`, e.target.value)}
                              className="border-0 border-b border-foreground/30 rounded-none bg-transparent text-left h-8 px-1"
                              placeholder="0"
                            />
                          </td>
                        </tr>
                      ))}
                      <tr className="border-b-2 border-foreground font-semibold">
                        <td className="py-3 pr-4 text-right">إجمالي الالتزامات قصيرة الأجل</td>
                        <td className="py-3 pl-4 w-32">
                          <Input
                            type="number"
                            value={accountValues['total-current-liabilities'] || ''}
                            onChange={(e) => handleAccountChange('total-current-liabilities', e.target.value)}
                            className="border-0 border-b-2 border-foreground rounded-none bg-transparent text-left h-8 px-1 font-semibold"
                            placeholder="0"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Long-term Liabilities */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-primary">
                    الالتزامات طويلة الأجل:
                  </h3>
                  <table className="w-full border-collapse">
                    <tbody>
                      {[
                        'القروض طويلة الأجل',
                        'السندات',
                        'القروض من الشركاء',
                        'مخصص نهاية الخدمة'
                      ].map((account, index) => (
                        <tr key={index} className="border-b border-border">
                          <td className="py-2 pr-4 text-right">{account}</td>
                          <td className="py-2 pl-4 w-32">
                            <Input
                              type="number"
                              value={accountValues[`long-term-liabilities-${index}`] || ''}
                              onChange={(e) => handleAccountChange(`long-term-liabilities-${index}`, e.target.value)}
                              className="border-0 border-b border-foreground/30 rounded-none bg-transparent text-left h-8 px-1"
                              placeholder="0"
                            />
                          </td>
                        </tr>
                      ))}
                      <tr className="border-b-2 border-foreground font-semibold">
                        <td className="py-3 pr-4 text-right">إجمالي الالتزامات طويلة الأجل</td>
                        <td className="py-3 pl-4 w-32">
                          <Input
                            type="number"
                            value={accountValues['total-long-term-liabilities'] || ''}
                            onChange={(e) => handleAccountChange('total-long-term-liabilities', e.target.value)}
                            className="border-0 border-b-2 border-foreground rounded-none bg-transparent text-left h-8 px-1 font-semibold"
                            placeholder="0"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="border-b-2 border-foreground pb-2 mb-6">
                  <table className="w-full">
                    <tbody>
                      <tr className="text-lg font-bold">
                        <td className="py-2 pr-4 text-right">إجمالي الالتزامات</td>
                        <td className="py-2 pl-4 w-32">
                          <Input
                            type="number"
                            value={accountValues['total-liabilities'] || ''}
                            onChange={(e) => handleAccountChange('total-liabilities', e.target.value)}
                            className="border-0 border-b-2 border-foreground rounded-none bg-transparent text-left h-8 px-1 text-lg font-bold"
                            placeholder="0"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Equity */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-primary">
                    حقوق الملكية:
                  </h3>
                  <table className="w-full border-collapse">
                    <tbody>
                      {[
                        'رأس المال',
                        'الاحتياطي القانوني',
                        'الاحتياطي الاختياري',
                        'الأرباح المحتجزة',
                        'أرباح السنة الحالية'
                      ].map((account, index) => (
                        <tr key={index} className="border-b border-border">
                          <td className="py-2 pr-4 text-right">{account}</td>
                          <td className="py-2 pl-4 w-32">
                            <Input
                              type="number"
                              value={accountValues[`equity-${index}`] || ''}
                              onChange={(e) => handleAccountChange(`equity-${index}`, e.target.value)}
                              className="border-0 border-b border-foreground/30 rounded-none bg-transparent text-left h-8 px-1"
                              placeholder="0"
                            />
                          </td>
                        </tr>
                      ))}
                      <tr className="border-b-2 border-foreground font-semibold">
                        <td className="py-3 pr-4 text-right">إجمالي حقوق الملكية</td>
                        <td className="py-3 pl-4 w-32">
                          <Input
                            type="number"
                            value={accountValues['total-equity'] || ''}
                            onChange={(e) => handleAccountChange('total-equity', e.target.value)}
                            className="border-0 border-b-2 border-foreground rounded-none bg-transparent text-left h-8 px-1 font-semibold"
                            placeholder="0"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="border-t-4 border-double border-foreground pt-2">
                  <table className="w-full">
                    <tbody>
                      <tr className="text-xl font-bold">
                        <td className="py-3 pr-4 text-right">إجمالي الالتزامات وحقوق الملكية</td>
                        <td className="py-3 pl-4 w-32">
                          <Input
                            type="number"
                            value={accountValues['total-liabilities-equity'] || ''}
                            onChange={(e) => handleAccountChange('total-liabilities-equity', e.target.value)}
                            className="border-0 border-b-4 border-double border-foreground rounded-none bg-transparent text-left h-10 px-1 text-xl font-bold"
                            placeholder="0"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Signature Section */}
            <div className="mt-12 pt-8 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-4">توقيع الطالب:</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-2">الاسم:</label>
                      <Input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="border-0 border-b border-foreground/30 rounded-none bg-transparent h-8"
                        placeholder="اسم الطالب"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2">التوقيع:</label>
                      <Input
                        type="text"
                        value={studentSignature}
                        onChange={(e) => setStudentSignature(e.target.value)}
                        className="border-0 border-b border-foreground/30 rounded-none bg-transparent h-8"
                        placeholder="توقيع الطالب"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2">التاريخ:</label>
                      <Input
                        type="date"
                        value={studentDate}
                        onChange={(e) => setStudentDate(e.target.value)}
                        className="border-0 border-b border-foreground/30 rounded-none bg-transparent h-8"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">ملاحظات المراجع:</h4>
                  <Textarea
                    value={reviewerNotes}
                    onChange={(e) => setReviewerNotes(e.target.value)}
                    className="border-0 border-b border-foreground/30 rounded-none bg-transparent resize-none min-h-[120px]"
                    placeholder="ملاحظات وتوجيهات المراجع..."
                  />
                  <div className="mt-4">
                    <label className="block text-sm mb-2">توقيع المراجع:</label>
                    <Input
                      type="text"
                      value={reviewerSignature}
                      onChange={(e) => setReviewerSignature(e.target.value)}
                      className="border-0 border-b border-foreground/30 rounded-none bg-transparent h-8"
                      placeholder="توقيع المراجع"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BalanceSheetInterface;