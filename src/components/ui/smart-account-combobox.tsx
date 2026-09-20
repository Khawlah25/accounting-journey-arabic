import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Check, Plus, Search, X } from 'lucide-react';
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
import {
  smartAccountSearch,
  getDisplayAccountName,
  getAccountNameWithContext
} from '@/utils/accountMappings';

interface SmartAccountComboboxProps {
  accounts: Account[];
  value?: string;
  onValueChange: (value: string) => void;
  onAccountAdd?: (account: Account) => void;
  placeholder?: string;
  className?: string;
  showGrouped?: boolean;
}

export function SmartAccountCombobox({
  accounts,
  value,
  onValueChange,
  onAccountAdd,
  placeholder = "ابحث أو اختر الحساب...",
  className,
  showGrouped = false
}: SmartAccountComboboxProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [newAccount, setNewAccount] = useState({
    code: '',
    name: '',
    type: 'Asset' as Account['type'],
    normalBalance: 'Debit' as Account['normalBalance']
  });

  const selectedAccount = accounts.find((account) => account.code === value);

  // تحديث النص المعروض عند تغيير القيمة المختارة
  useEffect(() => {
    if (selectedAccount) {
      setInputValue(getDisplayAccountName(selectedAccount));
    } else {
      setInputValue("");
    }
  }, [selectedAccount]);

  // البحث الذكي مع تصحيح الأخطاء - يظهر النتائج فقط عند الكتابة
  const filteredAccounts = useMemo(() => {
    if (!searchValue || searchValue.length < 2) {
      return [];
    }
    return smartAccountSearch(accounts, searchValue);
  }, [accounts, searchValue]);

  // debounced search
  const debouncedSetSearchValue = useCallback((value: string) => {
    const timeoutId = setTimeout(() => {
      setSearchValue(value);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const cleanup = debouncedSetSearchValue(inputValue);
    return cleanup;
  }, [inputValue, debouncedSetSearchValue]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // فتح القائمة عند الكتابة
    if (newValue.length >= 2 && !open) {
      setOpen(true);
    }
  };

  const handleSelectAccount = (accountCode: string) => {
    const account = accounts.find(acc => acc.code === accountCode);
    if (account) {
      onValueChange(accountCode);
      setInputValue(getDisplayAccountName(account));
      setSearchValue("");
      setOpen(false);
    }
  };

  const clearSelection = () => {
    onValueChange("");
    setInputValue("");
    setSearchValue("");
    inputRef.current?.focus();
  };

  const renderAccountItem = (account: Account) => (
    <CommandItem
      key={account.code}
      value={account.code}
      onSelect={() => handleSelectAccount(account.code)}
      className="flex items-start gap-3 py-3 px-4 cursor-pointer hover:bg-accent transition-colors"
    >
      <Check
        className={cn(
          "h-4 w-4 mt-0.5 shrink-0",
          value === account.code ? "opacity-100" : "opacity-0"
        )}
      />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm leading-tight mb-1">
          {getDisplayAccountName(account)}
        </div>
        <div className="text-xs text-muted-foreground leading-tight">
          {account.name}
        </div>
      </div>
    </CommandItem>
  );

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              placeholder={placeholder}
              className={cn("w-full pr-8", className)}
              onFocus={() => {
                if (inputValue.length >= 2) {
                  setOpen(true);
                }
              }}
            />
            {selectedAccount && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                onClick={clearSelection}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command shouldFilter={false}>
            {inputValue.length < 2 ? (
              <div className="p-4 text-center">
                <Search className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  ابدأ بكتابة حرفين على الأقل للبحث
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  مثال: بنك، صندوق، مبيعات، مخزون
                </p>
              </div>
            ) : (
              <CommandList className="max-h-[300px]">
                {filteredAccounts.length === 0 ? (
                  <CommandEmpty>
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground mb-3">
                        لم يتم العثور على حسابات مطابقة لـ "{searchValue}"
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        جرب كلمات أخرى أو تحقق من الإملاء
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
                ) : (
                  <CommandGroup>
                    {filteredAccounts.map(renderAccountItem)}
                    <div className="border-t mt-2 pt-2">
                      <CommandItem
                        onSelect={() => {
                          setShowAddDialog(true);
                          setOpen(false);
                        }}
                        className="flex items-center gap-2 py-2 px-4 cursor-pointer hover:bg-accent transition-colors text-muted-foreground"
                      >
                        <Plus className="h-4 w-4" />
                        <span className="text-sm">إضافة حساب جديد</span>
                      </CommandItem>
                    </div>
                  </CommandGroup>
                )}
              </CommandList>
            )}
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