import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Input } from './input';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionProgressSliderProps {
  totalTransactions: number;
  currentTransaction: number;
  completedTransactions: number[];
  onTransactionSelect: (transactionIndex: number) => void;
  className?: string;
}

export function TransactionProgressSlider({
  totalTransactions,
  currentTransaction,
  completedTransactions,
  onTransactionSelect,
  className
}: TransactionProgressSliderProps) {
  const [searchValue, setSearchValue] = useState('');
  const numbersPerGroup = 5;
  const totalGroups = Math.ceil(totalTransactions / numbersPerGroup);
  
  // تحديد المجموعة الحالية بناءً على العملية النشطة
  const getCurrentGroup = (transactionNumber: number) => {
    return Math.floor((transactionNumber - 1) / numbersPerGroup);
  };
  
  const [currentGroup, setCurrentGroup] = useState(getCurrentGroup(currentTransaction));

  // تحديث المجموعة عند تغيير العملية الحالية
  useEffect(() => {
    setCurrentGroup(getCurrentGroup(currentTransaction));
  }, [currentTransaction]);

  // حساب الأرقام في المجموعة الحالية
  const getGroupNumbers = (groupIndex: number) => {
    const start = groupIndex * numbersPerGroup + 1;
    const end = Math.min(start + numbersPerGroup - 1, totalTransactions);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const currentGroupNumbers = getGroupNumbers(currentGroup);

  // التنقل بين المجموعات
  const goToPreviousGroup = () => {
    if (currentGroup > 0) {
      setCurrentGroup(currentGroup - 1);
    }
  };

  const goToNextGroup = () => {
    if (currentGroup < totalGroups - 1) {
      setCurrentGroup(currentGroup + 1);
    }
  };

  // البحث والانتقال لرقم معين
  const handleSearch = (value: string) => {
    setSearchValue(value);
    const transactionNumber = parseInt(value);
    
    if (transactionNumber >= 1 && transactionNumber <= totalTransactions) {
      const targetGroup = getCurrentGroup(transactionNumber);
      setCurrentGroup(targetGroup);
      onTransactionSelect(transactionNumber - 1); // تحويل إلى index
    }
  };

  // التنقل بلوحة المفاتيح
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && searchValue) {
      const transactionNumber = parseInt(searchValue);
      if (transactionNumber >= 1 && transactionNumber <= totalTransactions) {
        onTransactionSelect(transactionNumber - 1);
        setSearchValue('');
      }
    }
  };

  return (
    <div className={cn("flex items-center gap-4 p-4 bg-card rounded-lg border", className)} dir="rtl">
      {/* مربع البحث */}
      <div className="flex-shrink-0">
        <Input
          type="number"
          min="1"
          max={totalTransactions}
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="رقم العملية"
          className="w-24 text-center font-medium"
        />
      </div>

      {/* زر التنقل اليسار */}
      <Button
        variant="outline"
        size="sm"
        onClick={goToPreviousGroup}
        disabled={currentGroup === 0}
        className="flex-shrink-0 w-8 h-8 p-0"
        aria-label="المجموعة السابقة"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {/* أرقام العمليات */}
      <div className="flex items-center gap-2 flex-1 justify-center">
        {currentGroupNumbers.map((transactionNumber) => {
          const transactionIndex = transactionNumber - 1;
          const isActive = transactionNumber === currentTransaction;
          const isCompleted = completedTransactions.includes(transactionIndex);
          
          return (
            <Button
              key={transactionNumber}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onTransactionSelect(transactionIndex)}
              className={cn(
                "w-10 h-10 rounded-full font-medium transition-all duration-200 hover:scale-105",
                isActive && "bg-primary text-primary-foreground",
                !isActive && isCompleted && "border-success text-success bg-success/10",
                !isActive && !isCompleted && "bg-muted text-muted-foreground"
              )}
              aria-label={`العملية رقم ${transactionNumber}`}
            >
              {transactionNumber}
            </Button>
          );
        })}
      </div>

      {/* زر التنقل اليمين */}
      <Button
        variant="outline"
        size="sm"
        onClick={goToNextGroup}
        disabled={currentGroup === totalGroups - 1}
        className="flex-shrink-0 w-8 h-8 p-0"
        aria-label="المجموعة التالية"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      {/* مؤشر المجموعة */}
      <div className="flex-shrink-0 text-sm text-muted-foreground font-medium">
        {currentGroup + 1} / {totalGroups}
      </div>
    </div>
  );
}