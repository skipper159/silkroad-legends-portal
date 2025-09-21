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
  value: number;
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
  value: number;
  max_uses: number;
  expires_at: string | null;
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
    value: 0,
    max_uses: 1,
    expires_at: null,
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
        title: 'Fehler',
        description: 'Voucher konnten nicht geladen werden',
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
    if (!newVoucher.code || !newVoucher.value) {
      toast({
        title: 'Fehler',
        description: 'Bitte fülle alle Pflichtfelder aus',
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
          title: 'Erfolgreich!',
          description: 'Voucher wurde erstellt',
        });
        setShowCreateForm(false);
        setNewVoucher({
          code: '',
          type: 'silk',
          value: 0,
          max_uses: 1,
          expires_at: null,
        });
        fetchVouchers();
      } else {
        const data = await response.json();
        toast({
          title: 'Fehler',
          description: data.message || 'Voucher konnte nicht erstellt werden',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Voucher konnte nicht erstellt werden',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteVoucher = async (voucherId: number) => {
    if (!confirm('Möchtest du diesen Voucher wirklich löschen?')) {
      return;
    }

    try {
      const response = await fetchWithAuth(`${weburl}/api/admin/vouchers/${voucherId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Erfolgreich!',
          description: 'Voucher wurde gelöscht',
        });
        fetchVouchers();
      } else {
        toast({
          title: 'Fehler',
          description: 'Voucher konnte nicht gelöscht werden',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Voucher konnte nicht gelöscht werden',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Kopiert!',
      description: 'Voucher-Code wurde kopiert',
    });
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
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
    const matchesSearch = voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voucher.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && voucher.is_active) ||
                         (statusFilter === 'inactive' && !voucher.is_active) ||
                         (statusFilter === 'expired' && voucher.expires_at && new Date(voucher.expires_at) < new Date());
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Gift className='h-8 w-8 text-blue-600' />
          <div>
            <h2 className='text-2xl font-bold text-gray-900'>Voucher Verwaltung</h2>
            <p className='text-gray-600'>Erstelle und verwalte Voucher-Codes</p>
          </div>
        </div>
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Neuer Voucher
        </Button>
      </div>

      {/* Filter und Suche */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Nach Code oder Typ suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">Alle Status</option>
                <option value="active">Aktiv</option>
                <option value="inactive">Inaktiv</option>
                <option value="expired">Abgelaufen</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voucher erstellen */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Neuen Voucher erstellen</CardTitle>
            <CardDescription>Erstelle einen neuen Voucher-Code</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="voucher-code">Voucher Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="voucher-code"
                    value={newVoucher.code}
                    onChange={(e) => setNewVoucher({ ...newVoucher, code: e.target.value.toUpperCase() })}
                    placeholder="VOUCHER123"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={generateVoucherCode}
                  >
                    Generieren
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="voucher-type">Typ</Label>
                <select
                  id="voucher-type"
                  value={newVoucher.type}
                  onChange={(e) => setNewVoucher({ ...newVoucher, type: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="silk">Silk</option>
                  <option value="gold">Gold</option>
                  <option value="experience">Experience</option>
                  <option value="item">Item</option>
                </select>
              </div>
              <div>
                <Label htmlFor="voucher-value">Wert</Label>
                <Input
                  id="voucher-value"
                  type="number"
                  value={newVoucher.value}
                  onChange={(e) => setNewVoucher({ ...newVoucher, value: parseInt(e.target.value) || 0 })}
                  placeholder="1000"
                />
              </div>
              <div>
                <Label htmlFor="voucher-uses">Maximale Verwendungen</Label>
                <Input
                  id="voucher-uses"
                  type="number"
                  value={newVoucher.max_uses}
                  onChange={(e) => setNewVoucher({ ...newVoucher, max_uses: parseInt(e.target.value) || 1 })}
                  placeholder="1"
                />
              </div>
              <div>
                <Label htmlFor="voucher-expires">Ablaufdatum (optional)</Label>
                <Input
                  id="voucher-expires"
                  type="datetime-local"
                  value={newVoucher.expires_at || ''}
                  onChange={(e) => setNewVoucher({ ...newVoucher, expires_at: e.target.value || null })}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleCreateVoucher}>
                Voucher erstellen
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Abbrechen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Voucher Liste */}
      <Card>
        <CardHeader>
          <CardTitle>Voucher Übersicht</CardTitle>
          <CardDescription>
            {filteredVouchers.length} von {vouchers.length} Vouchers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Lade Vouchers...</div>
            </div>
          ) : filteredVouchers.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Keine Vouchers gefunden</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredVouchers.map((voucher) => (
                <div
                  key={voucher.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">{voucher.code}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(voucher.code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getTypeColor(voucher.type)}>
                          {voucher.type}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {voucher.used_count}/{voucher.max_uses} verwendet
                        </span>
                        {voucher.expires_at && (
                          <span className="text-sm text-gray-500">
                            Läuft ab: {new Date(voucher.expires_at).toLocaleDateString('de-DE')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-bold text-lg">+{voucher.value}</div>
                      <div className="text-sm text-gray-500">
                        {voucher.is_active ? 'Aktiv' : 'Inaktiv'}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteVoucher(voucher.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
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