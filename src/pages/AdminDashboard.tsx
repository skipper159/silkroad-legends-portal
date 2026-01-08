import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WebAccountsList from '@/components/admin/WebAccountsList';
import GameAccountsList from '@/components/admin/GameAccountsList';
import TicketSystem from '@/components/admin/TicketSystem';
import DownloadsManager from '@/components/admin/DownloadsManager';
import VoucherManager from '@/components/admin/VoucherManager';
import VotesManager from '@/components/admin/VotesManager';
import ReferralManager from '@/components/admin/ReferralManager';
import SilkAdminPanel from '@/components/admin/SilkAdminPanel';
import SilkDashboardWidget from '@/components/admin/SilkDashboardWidget';
import AdminSettings from '@/components/admin/settings/AdminSettings';
import NewsManager from '@/components/admin/NewsManager';
import { useTheme } from '@/context/ThemeContext';
import { Users, Database, TicketCheck, Download, Gift, Vote, UserPlus, Coins, Settings, Newspaper } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';

const AdminDashboard = () => {
  const { currentTemplate } = useTheme();
  const { Layout } = currentTemplate.components;
  const [activeTab, setActiveTab] = useState('webaccounts');
  const { token, isAdmin } = useAuth();

  // Check if user is authenticated AND is an admin
  if (!token || !isAdmin) {
    return <Navigate to='/login' replace />;
  }

  return (
    <Layout>
      <main className='flex-grow'>
        <div
          className='py-20 bg-cover bg-top'
          style={{
            backgroundImage: `url('${currentTemplate.assets.pageHeaderBackground}')`,
          }}
        >
          <div className='container mx-auto px-4 text-center'>
            <h1 className='text-3xl md:text-4xl lg:text-4xl font-bold mb-6'>
              Dashboard <span className='text-theme-accent font-cinzel text-6xl font-bold'>Admin</span>
            </h1>
          </div>
        </div>
        <hr></hr>
        <div className='container mx-auto py-10'>
          {/* Silk Dashboard Widget */}
          <div className='mb-8'>
            <SilkDashboardWidget compact={true} />
          </div>

          <Tabs defaultValue='webaccounts' value={activeTab} onValueChange={setActiveTab}>
            <Card className='bg-theme-surface border-theme-primary/30 mb-6'>
              <TabsList className='grid grid-cols-2 lg:grid-cols-5 xl:grid-cols-11 gap-2 p-2 bg-transparent border-b border-theme-primary/20 h-auto'>
                <TabsTrigger
                  value='webaccounts'
                  className='flex items-center gap-2 px-3 py-2 data-[state=active]:bg-theme-primary data-[state=active]:text-white text-xs'
                >
                  <Users size={16} />
                  <span className='hidden sm:inline'>Web Accounts</span>
                  <span className='sm:hidden'>Web</span>
                </TabsTrigger>
                <TabsTrigger
                  value='gameaccounts'
                  className='flex items-center gap-2 px-3 py-2 data-[state=active]:bg-theme-primary data-[state=active]:text-white text-xs'
                >
                  <Database size={16} />
                  <span className='hidden sm:inline'>Game Accounts</span>
                  <span className='sm:hidden'>Game</span>
                </TabsTrigger>
                <TabsTrigger
                  value='silk'
                  className='flex items-center gap-2 px-3 py-2 data-[state=active]:bg-theme-primary data-[state=active]:text-white text-xs'
                >
                  <Coins size={16} />
                  <span className='hidden sm:inline'>Silk Admin</span>
                  <span className='sm:hidden'>Silk</span>
                </TabsTrigger>
                <TabsTrigger
                  value='news'
                  className='flex items-center gap-2 px-3 py-2 data-[state=active]:bg-theme-primary data-[state=active]:text-white text-xs'
                >
                  <Newspaper size={16} />
                  <span className='hidden sm:inline'>News</span>
                  <span className='sm:hidden'>News</span>
                </TabsTrigger>
                <TabsTrigger
                  value='tickets'
                  className='flex items-center gap-2 px-3 py-2 data-[state=active]:bg-theme-primary data-[state=active]:text-white text-xs'
                >
                  <TicketCheck size={16} />
                  <span className='hidden sm:inline'>Ticket System</span>
                  <span className='sm:hidden'>Tickets</span>
                </TabsTrigger>
                <TabsTrigger
                  value='downloads'
                  className='flex items-center gap-2 px-3 py-2 data-[state=active]:bg-theme-primary data-[state=active]:text-white text-xs'
                >
                  <Download size={16} />
                  <span className='hidden sm:inline'>Downloads</span>
                  <span className='sm:hidden'>DL</span>
                </TabsTrigger>
                <TabsTrigger
                  value='vouchers'
                  className='flex items-center gap-2 px-3 py-2 data-[state=active]:bg-theme-primary data-[state=active]:text-white text-xs'
                >
                  <Gift size={16} />
                  <span className='hidden sm:inline'>Vouchers</span>
                  <span className='sm:hidden'>Gift</span>
                </TabsTrigger>
                <TabsTrigger
                  value='votes'
                  className='flex items-center gap-2 px-3 py-2 data-[state=active]:bg-theme-primary data-[state=active]:text-white text-xs'
                >
                  <Vote size={16} />
                  <span className='hidden sm:inline'>Vote System</span>
                  <span className='sm:hidden'>Vote</span>
                </TabsTrigger>
                <TabsTrigger
                  value='referrals'
                  className='flex items-center gap-2 px-3 py-2 data-[state=active]:bg-theme-primary data-[state=active]:text-white text-xs'
                >
                  <UserPlus size={16} />
                  <span className='hidden sm:inline'>Referrals</span>
                  <span className='sm:hidden'>Ref</span>
                </TabsTrigger>
                <TabsTrigger
                  value='settings'
                  className='flex items-center gap-2 px-3 py-2 data-[state=active]:bg-theme-primary data-[state=active]:text-white text-xs'
                >
                  <Settings size={16} />
                  <span className='hidden sm:inline'>Settings</span>
                  <span className='sm:hidden'>Set</span>
                </TabsTrigger>
              </TabsList>
            </Card>

            <Card className='bg-theme-surface border-theme-primary/30 p-6'>
              <TabsContent value='webaccounts' className='mt-0'>
                <WebAccountsList />
              </TabsContent>

              <TabsContent value='gameaccounts' className='mt-0'>
                <GameAccountsList />
              </TabsContent>

              <TabsContent value='silk' className='mt-0'>
                <SilkAdminPanel />
              </TabsContent>

              <TabsContent value='news' className='mt-0'>
                <NewsManager />
              </TabsContent>

              <TabsContent value='tickets' className='mt-0'>
                <TicketSystem />
              </TabsContent>

              <TabsContent value='downloads' className='mt-0'>
                <DownloadsManager />
              </TabsContent>

              <TabsContent value='vouchers' className='mt-0'>
                <VoucherManager />
              </TabsContent>

              <TabsContent value='votes' className='mt-0'>
                <VotesManager />
              </TabsContent>

              <TabsContent value='referrals' className='mt-0'>
                <ReferralManager />
              </TabsContent>

              <TabsContent value='settings' className='mt-0'>
                <AdminSettings />
              </TabsContent>
            </Card>
          </Tabs>
        </div>
      </main>
    </Layout>
  );
};

export default AdminDashboard;
