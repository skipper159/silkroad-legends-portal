import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { fetchWithAuth, weburl } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface GameAccount {
  id: number;
  username: string;
}

interface SimpleGameAccountSelectorProps {
  selectedAccountJid: number | null;
  onAccountChange: (jid: number | null, account: GameAccount | null) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export const SimpleGameAccountSelector: React.FC<SimpleGameAccountSelectorProps> = ({
  selectedAccountJid,
  onAccountChange,
  label = 'Game Account',
  placeholder = 'Select game account...',
  className = '',
}) => {
  const [accounts, setAccounts] = useState<GameAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        // Use existing API that follows the established pattern
        const response = await fetchWithAuth(`${weburl}/api/characters/gameaccounts/my`);
        if (!response.ok) {
          throw new Error('Failed to load game accounts');
        }
        const data = await response.json();
        setAccounts(data);

        // Auto-select first account if none selected and accounts available
        if (!selectedAccountJid && data.length > 0) {
          onAccountChange(data[0].id, data[0]);
        }
      } catch (error) {
        console.error('Error loading game accounts:', error);
        toast({
          title: 'Error',
          description: 'Failed to load game accounts',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAccounts();
  }, []);

  const handleAccountChange = (value: string) => {
    const jid = parseInt(value);
    const account = accounts.find((acc) => acc.id === jid);
    onAccountChange(jid, account || null);
  };

  if (isLoading) {
    return (
      <div className={className}>
        <Label>{label}</Label>
        <div className='flex items-center justify-center h-10 bg-lafftale-dark border border-lafftale-gold/30 rounded-md'>
          <div className='w-4 h-4 border-2 border-lafftale-gold border-t-transparent rounded-full animate-spin'></div>
        </div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className={className}>
        <Label>{label}</Label>
        <div className='p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800'>
          No game accounts found. Please create a game account first.
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Label>{label}</Label>
      <Select value={selectedAccountJid?.toString() || ''} onValueChange={handleAccountChange}>
        <SelectTrigger className='bg-lafftale-dark border-lafftale-gold/30'>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className='bg-lafftale-darkgray border-lafftale-gold/30'>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id.toString()}>
              {account.username}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
