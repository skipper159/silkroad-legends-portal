import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { useToast } from '../ui/use-toast';
import { Gift, Plus, Edit, Trash2, Search, Filter, Copy } from 'lucide-react';
import { fetchWithAuth, weburl } from '@/lib/api';

interface Voucher {
  id: number;
  code: string;
  type: string;
  amount: number;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  created_by_username?: string;
}

interface CreateVoucherData {
  code: string;
  type: string;
  amount: number;
  max_uses: number;
  expires_at: string | null;
  is_active: boolean;
}

const VoucherManager: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newVoucher, setNewVoucher] = useState<CreateVoucherData>({
    code: '',
    type: 'silk',
    amount: 0,
    max_uses: 1,
    expires_at: null,
    is_active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${weburl}/api/admin/vouchers`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        setVouchers(data || []);
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      toast({
        title: 'Error',
        description: 'Vouchers could not be loaded',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateVoucherCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewVoucher({ ...newVoucher, code: result });
  };

  const handleCreateVoucher = async () => {
    if (!newVoucher.code || !newVoucher.amount) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetchWithAuth(`${weburl}/api/admin/vouchers`, {
        method: 'POST',
        body: JSON.stringify(newVoucher),
      });

      if (response.ok) {
        toast({
          title: 'Success!',
          description: 'Voucher was created',
        });
        setShowCreateForm(false);
        setNewVoucher({
          code: '',
          type: 'silk',
          amount: 0,
          max_uses: 1,
          expires_at: null,
          is_active: true,
        });
        fetchVouchers();
      } else {
        const data = await response.json();
        toast({
          title: 'Error',
          description: data.message || 'Voucher could not be created',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Voucher could not be created',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteVoucher = async (voucherId: number) => {
    if (!confirm('Do you really want to delete this voucher?')) {
      return;
    }

    try {
      const response = await fetchWithAuth(`${weburl}/api/admin/vouchers/${voucherId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success!',
          description: 'Voucher was deleted',
        });
        fetchVouchers();
      } else {
        toast({
          title: 'Error',
          description: 'Voucher could not be deleted',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Voucher could not be deleted',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Voucher code was copied',
    });
  };

  const getTypeString = (type: number | string): string => {
    // Convert numeric type to string
    if (typeof type === 'number') {
      switch (type) {
        case 1:
          return 'silk';
        case 2:
          return 'gold';
        case 3:
          return 'experience';
        case 4:
          return 'item';
        default:
          return 'unknown';
      }
    }
    return typeof type === 'string' ? type : 'unknown';
  };

  const getTypeColor = (type: number | string) => {
    const typeString = getTypeString(type);
    switch (typeString.toLowerCase()) {
      case 'silk':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'gold':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'experience':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'item':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const filteredVouchers = vouchers.filter((voucher) => {
    const typeString = getTypeString(voucher.type);
    const matchesSearch =
      voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      typeString.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && voucher.is_active) ||
      (statusFilter === 'inactive' && !voucher.is_active) ||
      (statusFilter === 'expired' && voucher.expires_at && new Date(voucher.expires_at) < new Date());

    return matchesSearch && matchesStatus;
  });

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Gift className='h-8 w-8 text-lafftale-gold' />
          <div>
            <h2 className='text-2xl font-bold text-lafftale-gold'>Voucher Management</h2>
            <p className='text-gray-400'>Create and manage voucher codes</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} className='btn-primary'>
          <Plus className='h-4 w-4 mr-2' />
          New Voucher
        </Button>
      </div>

      {/* Filter und Suche */}
      <Card className='bg-lafftale-dark border-lafftale-gold/30'>
        <CardContent className='pt-6'>
          <div className='flex gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                <Input
                  placeholder='Search by code or type...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
            <div className='w-48'>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className='w-full h-10 px-3 rounded-md border border-input bg-background text-sm'
              >
                <option value='all'>All Status</option>
                <option value='active'>Active</option>
                <option value='inactive'>Inactive</option>
                <option value='expired'>Expired</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voucher erstellen */}
      {showCreateForm && (
        <Card className='bg-lafftale-dark border-lafftale-gold/30'>
          <CardHeader>
            <CardTitle className='text-white'>Create New Voucher</CardTitle>
            <CardDescription className='text-gray-400'>Create a new voucher code</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='voucher-code'>Voucher Code</Label>
                <div className='flex gap-2'>
                  <Input
                    id='voucher-code'
                    value={newVoucher.code}
                    onChange={(e) => setNewVoucher({ ...newVoucher, code: e.target.value.toUpperCase() })}
                    placeholder='VOUCHER123'
                  />
                  <Button type='button' variant='outline' onClick={generateVoucherCode}>
                    Generate
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor='voucher-type'>Type</Label>
                <select
                  id='voucher-type'
                  value={newVoucher.type}
                  onChange={(e) => setNewVoucher({ ...newVoucher, type: e.target.value })}
                  className='w-full h-10 px-3 rounded-md border border-input bg-background text-sm'
                >
                  <option value='silk'>Silk</option>
                  <option value='gold'>Gold</option>
                  <option value='experience'>Experience</option>
                  <option value='item'>Item</option>
                </select>
              </div>
              <div>
                <Label htmlFor='voucher-value'>Value</Label>
                <Input
                  id='voucher-value'
                  type='number'
                  value={newVoucher.amount}
                  onChange={(e) => setNewVoucher({ ...newVoucher, amount: parseInt(e.target.value) || 0 })}
                  placeholder='1000'
                />
              </div>
              <div>
                <Label htmlFor='voucher-uses'>Maximum Uses</Label>
                <Input
                  id='voucher-uses'
                  type='number'
                  value={newVoucher.max_uses}
                  onChange={(e) => setNewVoucher({ ...newVoucher, max_uses: parseInt(e.target.value) || 1 })}
                  placeholder='1'
                />
              </div>
              <div>
                <Label htmlFor='voucher-expires'>Expiration Date (optional)</Label>
                <Input
                  id='voucher-expires'
                  type='datetime-local'
                  value={newVoucher.expires_at || ''}
                  onChange={(e) => setNewVoucher({ ...newVoucher, expires_at: e.target.value || null })}
                />
              </div>
              <div className='flex items-center gap-2'>
                <input
                  id='voucher-active'
                  type='checkbox'
                  checked={newVoucher.is_active}
                  onChange={(e) => setNewVoucher({ ...newVoucher, is_active: e.target.checked })}
                  className='h-4 w-4 text-lafftale-gold focus:ring-lafftale-gold border-gray-300 rounded'
                />
                <Label htmlFor='voucher-active'>Active (voucher can be redeemed immediately)</Label>
              </div>
            </div>
            <div className='flex gap-2 mt-4'>
              <Button onClick={handleCreateVoucher} className='btn-primary'>
                Create Voucher
              </Button>
              <Button variant='outline' onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Voucher Liste */}
      <Card className='bg-lafftale-dark border-lafftale-gold/30'>
        <CardHeader>
          <CardTitle className='text-white'>Voucher Overview</CardTitle>
          <CardDescription className='text-gray-400'>
            {filteredVouchers.length} von {vouchers.length} Vouchers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='text-center py-8'>
              <div className='text-gray-500'>Loading Vouchers...</div>
            </div>
          ) : filteredVouchers.length === 0 ? (
            <div className='text-center py-8'>
              <Gift className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-500'>No vouchers found</p>
            </div>
          ) : (
            <div className='space-y-3'>
              {filteredVouchers.map((voucher) => (
                <div
                  key={voucher.id}
                  className='flex items-center justify-between p-4 border border-lafftale-gold/20 rounded-lg bg-lafftale-gold/5 hover:bg-lafftale-gold/10 transition-colors'
                >
                  <div className='flex items-center gap-4'>
                    <div>
                      <div className='flex items-center gap-2'>
                        <span className='font-mono font-bold text-white'>{voucher.code}</span>
                        <Button
                          size='sm'
                          variant='ghost'
                          onClick={() => copyToClipboard(voucher.code)}
                          className='text-gray-400 hover:text-white'
                        >
                          <Copy className='h-3 w-3' />
                        </Button>
                      </div>
                      <div className='flex items-center gap-2 mt-1'>
                        <Badge className={getTypeColor(voucher.type)}>{getTypeString(voucher.type)}</Badge>
                        <span className='text-sm text-gray-500'>
                          {voucher.used_count}/{voucher.max_uses} used
                        </span>
                        {voucher.expires_at && (
                          <span className='text-sm text-gray-500'>
                            Expires: {new Date(voucher.expires_at).toLocaleDateString('de-DE')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='text-right'>
                      <div className='font-bold text-lg text-lafftale-gold'>+{voucher.amount}</div>
                      <div className='text-sm text-gray-500'>{voucher.is_active ? 'Active' : 'Inactive'}</div>
                    </div>
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={() => handleDeleteVoucher(voucher.id)}
                      className='text-red-500 hover:text-red-400 hover:bg-red-950/50'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VoucherManager;
