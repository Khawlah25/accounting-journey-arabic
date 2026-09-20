import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SmartAccountCombobox } from '@/components/ui/smart-account-combobox';
import { Trash2, Plus, Save, AlertCircle, RefreshCw } from 'lucide-react';
import { SessionData, AdjustingEntry, Account } from '@/types/accounting';
import { useToast } from '@/hooks/use-toast';
import { saveSession } from '@/utils/sessionManager';
import { cn } from '@/lib/utils';

interface Stage6Props {
  sessionData: SessionData;
  onStageComplete: () => void;
  onUpdateSessionData: (data: SessionData) => void;
}

interface AdjustingEntryLine {
  id: string;
  accountCode: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
}

interface NewAdjustingEntry {
  originalEntryId: string;
  description: string;
  lines: AdjustingEntryLine[];
  type: AdjustingEntry['type'];
}

export default function Stage6AdjustingEntries({ 
  sessionData, 
  onStageComplete, 
  onUpdateSessionData 
}: Stage6Props) {
  const { toast } = useToast();
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [newAdjustingEntry, setNewAdjustingEntry] = useState<NewAdjustingEntry>({
    originalEntryId: '',
    description: '',
    lines: [],
    type: 'accrued-expense'
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Get journal entries from Stage 2
  const journalEntries = sessionData.transactions || [];
  const adjustingEntries = sessionData.adjustingEntries || {};
  const [chartOfAccounts, setChartOfAccounts] = React.useState(sessionData.chartOfAccounts || []);

  const addAdjustingLine = () => {
    const newLine: AdjustingEntryLine = {
      id: `line-${Date.now()}`,
      accountCode: '',
      accountName: '',
      debitAmount: 0,
      creditAmount: 0
    };
    setNewAdjustingEntry(prev => ({
      ...prev,
      lines: [...prev.lines, newLine]
    }));
  };

  const removeAdjustingLine = (lineId: string) => {
    setNewAdjustingEntry(prev => ({
      ...prev,
      lines: prev.lines.filter(line => line.id !== lineId)
    }));
  };

  const updateAdjustingLine = (lineId: string, field: keyof AdjustingEntryLine, value: any) => {
    setNewAdjustingEntry(prev => ({
      ...prev,
      lines: prev.lines.map(line => {
        if (line.id === lineId) {
          const updatedLine = { ...line, [field]: value };
          
          // If account is selected, update the account name
          if (field === 'accountCode') {
            const account = chartOfAccounts.find(acc => acc.code === value);
            updatedLine.accountName = account?.name || '';
          }
          
          return updatedLine;
        }
        return line;
      })
    }));
  };

  const validateAdjustingEntry = (): boolean => {
    const errors: string[] = [];

    if (!newAdjustingEntry.description.trim()) {
      errors.push('وصف قيد التسوية مطلوب');
    }

    if (newAdjustingEntry.lines.length < 2) {
      errors.push('يجب إضافة سطرين على الأقل');
    }

    let totalDebit = 0;
    let totalCredit = 0;

    newAdjustingEntry.lines.forEach((line, index) => {
      if (!line.accountCode) {
        errors.push(`الحساب مطلوب في السطر ${index + 1}`);
      }
      
      if (line.debitAmount === 0 && line.creditAmount === 0) {
        errors.push(`يجب إدخال مبلغ في السطر ${index + 1}`);
      }
      
      if (line.debitAmount > 0 && line.creditAmount > 0) {
        errors.push(`لا يمكن أن يحتوي السطر ${index + 1} على مبلغ مدين ودائن معاً`);
      }

      totalDebit += line.debitAmount;
      totalCredit += line.creditAmount;
    });

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      errors.push('يجب أن يكون مجموع المدين مساوياً لمجموع الدائن');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const saveAdjustingEntry = () => {
    if (!validateAdjustingEntry()) {
      toast({
        title: "خطأ في التحقق",
        description: "يرجى تصحيح الأخطاء قبل الحفظ",
        variant: "destructive"
      });
      return;
    }

    const adjustingEntry: AdjustingEntry = {
      id: `adj-${Date.now()}`,
      type: newAdjustingEntry.type,
      description: newAdjustingEntry.description,
      amount: newAdjustingEntry.lines.reduce((sum, line) => sum + Math.max(line.debitAmount, line.creditAmount), 0),
      affectedAccounts: {
        debit: newAdjustingEntry.lines.find(line => line.debitAmount > 0)?.accountCode || '',
        credit: newAdjustingEntry.lines.find(line => line.creditAmount > 0)?.accountCode || ''
      },
      explanation: newAdjustingEntry.description
    };

    const updatedAdjustingEntries = {
      ...adjustingEntries,
      [selectedEntryId!]: [
        ...(adjustingEntries[selectedEntryId!] || []),
        adjustingEntry
      ]
    };

    const updatedSessionData = {
      ...sessionData,
      adjustingEntries: updatedAdjustingEntries,
      chartOfAccounts: chartOfAccounts, // Update chart of accounts in session
      lastUpdated: new Date().toISOString()
    };

    saveSession(updatedSessionData);
    onUpdateSessionData(updatedSessionData);

    // Reset form
    setNewAdjustingEntry({
      originalEntryId: '',
      description: '',
      lines: [],
      type: 'accrued-expense'
    });
    setSelectedEntryId(null);
    setValidationErrors([]);

    toast({
      title: "تم الحفظ بنجاح",
      description: "تم حفظ قيد التسوية بنجاح"
    });
  };

  const deleteAdjustingEntry = (entryId: string, adjustingId: string) => {
    const updatedAdjustingEntries = {
      ...adjustingEntries,
      [entryId]: adjustingEntries[entryId]?.filter(adj => adj.id !== adjustingId) || []
    };

    const updatedSessionData = {
      ...sessionData,
      adjustingEntries: updatedAdjustingEntries,
      chartOfAccounts: chartOfAccounts,
      lastUpdated: new Date().toISOString()
    };

    saveSession(updatedSessionData);
    onUpdateSessionData(updatedSessionData);

    toast({
      title: "تم الحذف",
      description: "تم حذف قيد التسوية"
    });
  };

  // دالة الملء التلقائي من المرجع
  const fillFromReference = () => {
    if (!selectedEntryId) {
      toast({
        title: "لم يتم اختيار قيد",
        description: "يرجى اختيار قيد يومي أولاً",
        variant: "destructive"
      });
      return;
    }

    const selectedEntry = journalEntries.find(entry => entry.entryId === selectedEntryId);
    if (!selectedEntry) return;

    // استخراج الحسابات من القيد المختار
    const adjustingLines: AdjustingEntryLine[] = selectedEntry.lines.map((line, index) => ({
      id: `line-${Date.now()}-${index}`,
      accountCode: line.accountCode,
      accountName: line.accountName,
      debitAmount: line.debit,
      creditAmount: line.credit
    }));

    setNewAdjustingEntry(prev => ({
      ...prev,
      lines: adjustingLines,
      description: `قيد تسوية مرتبط بـ: ${selectedEntry.description}`
    }));

    toast({
      title: "تم الملء التلقائي",
      description: `تم ملء ${adjustingLines.length} سطر من القيد المرجعي`,
    });
  };

  const handleAccountAdd = (newAccount: Account) => {
    const updatedAccounts = [...chartOfAccounts, newAccount];
    setChartOfAccounts(updatedAccounts);
    
    // Update session data immediately
    const updatedSessionData = {
      ...sessionData,
      chartOfAccounts: updatedAccounts,
      lastUpdated: new Date().toISOString()
    };
    saveSession(updatedSessionData);
    onUpdateSessionData(updatedSessionData);
  };

  const calculateTotals = () => {
    const totalDebit = newAdjustingEntry.lines.reduce((sum, line) => sum + line.debitAmount, 0);
    const totalCredit = newAdjustingEntry.lines.reduce((sum, line) => sum + line.creditAmount, 0);
    return { totalDebit, totalCredit };
  };

  const { totalDebit, totalCredit } = calculateTotals();
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">قيود التسوية</h1>
        <p className="text-muted-foreground">إضافة قيود التسوية للقيود اليومية</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* الشريط الجانبي للقيود اليومية */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                القيود اليومية
                <span className="text-sm text-muted-foreground">({journalEntries.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto space-y-3">
              {journalEntries.map((entry) => (
                <div key={entry.entryId} className="space-y-2">
                  <div
                    className={cn(
                      "p-3 border rounded-lg cursor-pointer transition-colors",
                      selectedEntryId === entry.entryId 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => {
                      setSelectedEntryId(entry.entryId);
                      setNewAdjustingEntry(prev => ({
                        ...prev,
                        originalEntryId: entry.entryId,
                        lines: []
                      }));
                    }}
                  >
                    <div className="font-medium text-sm">{entry.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {entry.date} | {entry.amount?.toLocaleString()} ر.س
                    </div>
                  </div>
                  
                  {/* عرض قيود التسوية المرتبطة */}
                  {adjustingEntries[entry.entryId]?.length > 0 && (
                    <div className="mr-4 space-y-1">
                      {adjustingEntries[entry.entryId].map((adj) => (
                        <div key={adj.id} className="flex items-center justify-between p-2 bg-muted rounded text-xs">
                          <span>{adj.description}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteAdjustingEntry(entry.entryId, adj.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* منطقة إنشاء قيد التسوية */}
        <div className="lg:col-span-2">
          {selectedEntryId ? (
            <Card>
              <CardHeader>
                <CardTitle>إنشاء قيد تسوية جديد</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* نوع ووصف قيد التسوية */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="adjusting-type">نوع قيد التسوية</Label>
                    <Select
                      value={newAdjustingEntry.type}
                      onValueChange={(value) => setNewAdjustingEntry(prev => ({ ...prev, type: value as AdjustingEntry['type'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="accrued-expense">مصروفات مستحقة</SelectItem>
                        <SelectItem value="accrued-revenue">إيرادات مستحقة</SelectItem>
                        <SelectItem value="deferred-expense">مصروفات مؤجلة</SelectItem>
                        <SelectItem value="deferred-revenue">إيرادات مؤجلة</SelectItem>
                        <SelectItem value="depreciation">إهلاك</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">وصف قيد التسوية</Label>
                    <Textarea
                      id="description"
                      value={newAdjustingEntry.description}
                      onChange={(e) => setNewAdjustingEntry(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="اكتب وصف قيد التسوية..."
                      className="min-h-[80px]"
                    />
                  </div>
                </div>

                {/* سطور قيد التسوية */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-medium">سطور قيد التسوية</Label>
                    <div className="flex gap-2">
                      <Button onClick={fillFromReference} variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        ملء تلقائي من المرجع
                      </Button>
                      <Button onClick={addAdjustingLine} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        إضافة سطر
                      </Button>
                    </div>
                  </div>

                  {/* Adjusting Entry Table */}
                  <div className="border rounded-lg overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-muted grid grid-cols-12 gap-2 p-4 font-medium text-sm">
                      <div className="col-span-5 text-center">الحساب</div>
                      <div className="col-span-2 text-center">مدين</div>
                      <div className="col-span-2 text-center">دائن</div>
                      <div className="col-span-3 text-center">إجراء</div>
                    </div>

                    {/* Table Rows */}
                    <div className="divide-y">
                      {newAdjustingEntry.lines.map((line) => (
                        <div key={line.id} className="grid grid-cols-12 gap-2 p-4 items-center">
                          {/* Account Column */}
                          <div className="col-span-5">
                            <SmartAccountCombobox
                              accounts={chartOfAccounts}
                              value={line.accountCode}
                              onValueChange={(value) => updateAdjustingLine(line.id, 'accountCode', value)}
                              onAccountAdd={handleAccountAdd}
                              placeholder="اختر الحساب أو ابحث..."
                              className="w-full"
                            />
                          </div>

                          {/* Debit Column */}
                          <div className="col-span-2">
                            <Input
                              type="number"
                              step="0.01"
                              value={line.debitAmount || ''}
                              onChange={(e) => updateAdjustingLine(line.id, 'debitAmount', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className="text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              dir="ltr"
                            />
                          </div>

                          {/* Credit Column */}
                          <div className="col-span-2">
                            <Input
                              type="number"
                              step="0.01"
                              value={line.creditAmount || ''}
                              onChange={(e) => updateAdjustingLine(line.id, 'creditAmount', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className="text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              dir="ltr"
                            />
                          </div>

                          {/* Action Column */}
                          <div className="col-span-3 text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeAdjustingLine(line.id)}
                              disabled={newAdjustingEntry.lines.length <= 1}
                              title="حذف السطر"
                              className="hover:bg-accent"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      {newAdjustingEntry.lines.length === 0 && (
                        <div className="col-span-12 text-center py-8 text-muted-foreground">
                          لم يتم إضافة أي سطور بعد. اضغط "إضافة سطر" لبدء إنشاء قيد التسوية.
                        </div>
                      )}
                    </div>

                    {/* Totals Row */}
                    {newAdjustingEntry.lines.length > 0 && (
                      <div className="bg-secondary/50 border-t-2 border-primary grid grid-cols-12 gap-2 p-4 font-bold text-sm">
                        <div className="col-span-5 text-center">الإجمالي</div>
                        <div className="col-span-2 text-center text-primary">
                          {totalDebit.toLocaleString()} ر.س
                        </div>
                        <div className="col-span-2 text-center text-primary">
                          {totalCredit.toLocaleString()} ر.س
                        </div>
                        <div className="col-span-3 text-center">
                          <div className={cn(
                            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                            isBalanced 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          )}>
                            {isBalanced ? "متوازن" : "غير متوازن"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* أخطاء التحقق */}
                {validationErrors.length > 0 && (
                  <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
                    <div className="flex items-center gap-2 text-destructive font-medium mb-2">
                      <AlertCircle className="h-4 w-4" />
                      أخطاء التحقق:
                    </div>
                    <ul className="list-disc list-inside text-sm text-destructive space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* أزرار الحفظ */}
                <div className="flex gap-4">
                  <Button onClick={saveAdjustingEntry} disabled={!isBalanced || newAdjustingEntry.lines.length === 0}>
                    <Save className="h-4 w-4 mr-2" />
                    حفظ قيد التسوية
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedEntryId(null);
                      setNewAdjustingEntry({
                        originalEntryId: '',
                        description: '',
                        lines: [],
                        type: 'accrued-expense'
                      });
                      setValidationErrors([]);
                    }}
                  >
                    إلغاء
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-muted-foreground">
                  <div className="text-lg mb-2">اختر قيداً يومياً من الشريط الجانبي</div>
                  <div className="text-sm">لإنشاء قيد تسوية مرتبط به</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* زر الانتقال للمرحلة التالية */}
      <div className="text-center pt-8">
        <Button onClick={onStageComplete} size="lg">
          الانتقال للمرحلة السابعة: إعداد القوائم المالية
        </Button>
      </div>
    </div>
  );
}