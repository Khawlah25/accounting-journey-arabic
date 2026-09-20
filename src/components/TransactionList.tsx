import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { JournalEntry } from '@/types/accounting';
import { formatDateGregorian } from '@/lib/utils';

interface TransactionListProps {
  transactions: JournalEntry[];
  title: string;
  source?: 'generated' | 'uploaded';
  onEdit?: (transaction: JournalEntry) => void;
  onDelete?: (transactionId: string) => void;
}

const TransactionList = ({ transactions, title, source, onEdit, onDelete }: TransactionListProps) => {
  if (transactions.length === 0) {
    return (
      <Card className="accounting-card">
        <CardContent className="p-6 text-center text-muted-foreground">
          لا توجد عمليات مالية من هذا النوع
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Badge 
          variant={source === 'uploaded' ? 'default' : 'secondary'}
          className={source === 'uploaded' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
        >
          {transactions.length} عملية
        </Badge>
      </div>

      {transactions.map((transaction, index) => (
        <Card key={transaction.entryId || `transaction-${index}`} className="accounting-card hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3 space-x-reverse">
                <h4 className="font-medium text-base">
                  {transaction.description}
                </h4>
                <Badge variant="outline" className="font-mono text-sm">
                  {transaction.reference || transaction.entryId || `T${index + 1}`}
                </Badge>
                {source && (
                  <Badge 
                    variant={source === 'uploaded' ? 'default' : 'secondary'}
                    className={source === 'uploaded' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                  >
                    {source === 'uploaded' ? 'مرفوعة' : 'مولدة'}
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-muted-foreground">التاريخ:</span>
                <span>{formatDateGregorian(transaction.date)}</span>
              </div>
              
              {transaction.amount && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-muted-foreground">المبلغ:</span>
                  <span className="font-mono">
                    {new Intl.NumberFormat('ar-SA', {
                      style: 'currency',
                      currency: 'SAR',
                      minimumFractionDigits: 0
                    }).format(transaction.amount)}
                  </span>
                </div>
              )}

              {transaction.transactionType && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-muted-foreground">نوع العملية:</span>
                  <span>{transaction.transactionType}</span>
                </div>
              )}

              {transaction.clientSupplier && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-muted-foreground">العميل/المورد:</span>
                  <span>{transaction.clientSupplier}</span>
                </div>
              )}
            </div>

            {transaction.details && (
              <p className="text-sm text-muted-foreground mt-2">
                {transaction.details}
              </p>
            )}

            {/* عرض بنود القيد */}
            {transaction.lines && transaction.lines.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <h5 className="text-sm font-medium mb-2">بنود القيد:</h5>
                <div className="space-y-1 text-xs">
                  {transaction.lines.map((line: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span>{line.accountName}</span>
                      <div className="flex space-x-2 space-x-reverse">
                        {line.debit > 0 && (
                          <span className="text-blue-600 font-mono">{line.debit.toLocaleString()} مدين</span>
                        )}
                        {line.credit > 0 && (
                          <span className="text-green-600 font-mono">{line.credit.toLocaleString()} دائن</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TransactionList;