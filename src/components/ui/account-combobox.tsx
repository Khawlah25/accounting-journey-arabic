import React, { useState } from 'react';
import { Check, ChevronsUpDown, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Account } from '@/types/accounting';
import { useToast } from '@/hooks/use-toast';

interface AccountComboboxProps {
  accounts: Account[];
  value?: string;
  onValueChange: (value: string) => void;
  onAccountAdd?: (account: Account) => void;
  placeholder?: string;
  className?: string;
}

export function AccountCombobox({
  accounts,
  value,
  onValueChange,
  onAccountAdd,
  placeholder = "اختر الحساب...",
  className
}: AccountComboboxProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newAccount, setNewAccount] = useState({
    code: '',
    name: '',
    type: 'Asset' as Account['type'],
    normalBalance: 'Debit' as Account['normalBalance']
  });

  const selectedAccount = accounts.find((account) => account.code === value);

  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    account.code.includes(searchValue)
  );

  const handleAddAccount = () => {
    if (!newAccount.code.trim() || !newAccount.name.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رمز واسم الحساب",
        variant: "destructive"
      });
      return;
    }

    // Check if account code already exists
    if (accounts.some(acc => acc.code === newAccount.code)) {
      toast({
        title: "خطأ",
        description: "رمز الحساب موجود مسبقاً",
        variant: "destructive"
      });
      return;
    }

    const account: Account = {
      code: newAccount.code,
      name: newAccount.name,
      type: newAccount.type,
      normalBalance: newAccount.normalBalance
    };

    onAccountAdd?.(account);
    onValueChange(account.code);
    
    // Reset form
    setNewAccount({
      code: '',
      name: '',
      type: 'Asset',
      normalBalance: 'Debit'
    });
    setShowAddDialog(false);
    setOpen(false);

    toast({
      title: "تم إضافة الحساب",
      description: `تم إضافة الحساب ${account.name} بنجاح`
    });
  };

  const getAccountTypeLabel = (type: Account['type']) => {
    const typeLabels = {
      'Asset': 'أصول',
      'Liability': 'خصوم',
      'Equity': 'حقوق ملكية',
      'Revenue': 'إيرادات',
      'Expense': 'مصروفات'
    };
    return typeLabels[type];
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", className)}
          >
            {selectedAccount ? (
              <span className="truncate">
                {selectedAccount.code} - {selectedAccount.name}
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput 
                placeholder="البحث في الحسابات..." 
                value={searchValue}
                onValueChange={setSearchValue}
                className="border-0 focus:ring-0"
              />
            </div>
            <CommandList>
              <CommandEmpty>
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-3">
                    لم يتم العثور على حسابات مطابقة
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowAddDialog(true);
                      setOpen(false);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    إضافة حساب جديد
                  </Button>
                </div>
              </CommandEmpty>
              <CommandGroup>
                {filteredAccounts.map((account) => (
                  <CommandItem
                    key={account.code}
                    value={account.code}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center">
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === account.code ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div>
                        <div className="font-medium">
                          {account.code} - {account.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getAccountTypeLabel(account.type)} | {account.normalBalance === 'Debit' ? 'مدين' : 'دائن'}
                        </div>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              {filteredAccounts.length > 0 && (
                <div className="border-t p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      setShowAddDialog(true);
                      setOpen(false);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    إضافة حساب جديد
                  </Button>
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Dialog لإضافة حساب جديد */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>إضافة حساب جديد</DialogTitle>
            <DialogDescription>
              أدخل تفاصيل الحساب الجديد الذي تريد إضافته
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account-code" className="text-right">
                رمز الحساب
              </Label>
              <Input
                id="account-code"
                value={newAccount.code}
                onChange={(e) => setNewAccount(prev => ({ ...prev, code: e.target.value }))}
                className="col-span-3"
                placeholder="مثال: 1101"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account-name" className="text-right">
                اسم الحساب
              </Label>
              <Input
                id="account-name"
                value={newAccount.name}
                onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
                placeholder="مثال: النقدية"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account-type" className="text-right">
                نوع الحساب
              </Label>
              <Select
                value={newAccount.type}
                onValueChange={(value: Account['type']) => setNewAccount(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asset">أصول</SelectItem>
                  <SelectItem value="Liability">خصوم</SelectItem>
                  <SelectItem value="Equity">حقوق ملكية</SelectItem>
                  <SelectItem value="Revenue">إيرادات</SelectItem>
                  <SelectItem value="Expense">مصروفات</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="normal-balance" className="text-right">
                الرصيد الطبيعي
              </Label>
              <Select
                value={newAccount.normalBalance}
                onValueChange={(value: Account['normalBalance']) => setNewAccount(prev => ({ ...prev, normalBalance: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Debit">مدين</SelectItem>
                  <SelectItem value="Credit">دائن</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddAccount}>
              إضافة الحساب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}