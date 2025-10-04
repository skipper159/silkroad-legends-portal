import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { fetchWithAuth, weburl } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Gamepad2 } from 'lucide-react';

interface GameAccount {
  jid: number;
  portalJid: number;
  username: string;
  displayName: string;
  regDate: string;
  isActive: boolean;
}

interface GameAccountSelectorProps {
  selectedAccountJid: number | null;
  onAccountChange: (jid: number, account: GameAccount) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

const GameAccountSelector: React.FC<GameAccountSelectorProps> = ({
  selectedAccountJid,
  onAccountChange,
  label = 'Select Game Account',
  placeholder = 'Choose account for rewards...',
  required = true,
  disabled = false,
}) => {
  const [accounts, setAccounts] = useState<GameAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchGameAccounts();
  }, []);

  const fetchGameAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${weburl}/api/gameaccount/all`);

      if (response.ok) {
        const data = await response.json();
        setAccounts(data);

        // Auto-select first account if none selected and only one exists
        if (!selectedAccountJid && data.length === 1) {
          onAccountChange(data[0].jid, data[0]);
        }
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load game accounts',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching game accounts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load game accounts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccountChange = (jidString: string) => {
    const jid = parseInt(jidString);
    const account = accounts.find((acc) => acc.jid === jid);
    if (account) {
      onAccountChange(jid, account);
    }
  };

  if (loading) {
    return (
      <div className='space-y-2'>
        <Label className='text-sm font-medium'>{label}</Label>
        <div className='h-10 bg-gray-200 animate-pulse rounded-md'></div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className='space-y-2'>
        <Label className='text-sm font-medium'>{label}</Label>
        <div className='p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800'>
          No game accounts found. Please create a game account first.
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      <Label className='text-sm font-medium'>
        <Gamepad2 className='inline h-4 w-4 mr-1' />
        {label}
        {required && <span className='text-red-500 ml-1'>*</span>}
      </Label>
      <Select value={selectedAccountJid?.toString() || ''} onValueChange={handleAccountChange} disabled={disabled}>
        <SelectTrigger className='w-full'>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {accounts.map((account) => (
            <SelectItem key={account.jid} value={account.jid.toString()}>
              <div className='flex items-center gap-2'>
                <span className='font-medium'>{account.username}</span>
                <span className='text-sm text-gray-500'>(JID: {account.jid})</span>
                {!account.isActive && <span className='text-xs text-red-500 bg-red-100 px-1 rounded'>Inactive</span>}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {accounts.length > 1 && (
        <p className='text-xs text-gray-500'>
          You have {accounts.length} game accounts. Select which one should receive the rewards.
        </p>
      )}
    </div>
  );
};

export default GameAccountSelector;
