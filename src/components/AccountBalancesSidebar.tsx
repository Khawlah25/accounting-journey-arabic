import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface AccountBalance {
  code: string;
  name: string;
  balance: number;
}

interface AccountBalancesSidebarProps {
  accountBalances: AccountBalance[];
}

export const AccountBalancesSidebar: React.FC<AccountBalancesSidebarProps> = ({
  accountBalances
}) => {
  const formatNumber = (num: number) => Math.abs(num).toLocaleString('ar-EG');

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-center">
          أرصدة الحسابات المرحلة من دفتر الأستاذ
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="p-4 space-y-2">
            {accountBalances.length > 0 ? (
              accountBalances.map((account) => (
                <div
                  key={account.code}
                  className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {account.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {account.code}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-primary tabular-nums">
                    {formatNumber(account.balance)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <p>لا توجد أرصدة متاحة</p>
                <p className="text-xs mt-1">قم بإكمال مرحلة دفتر الأستاذ أولاً</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};