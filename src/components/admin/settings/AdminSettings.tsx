import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Users, Clock, Shield, ChevronRight } from 'lucide-react';
import CronJobSettings from './CronJobSettings';
import UserRolesManager from '../UserRolesManager';

type SettingsTab = 'user-roles' | 'cron-jobs';

const AdminSettings = () => {
  const [activeSubTab, setActiveSubTab] = useState<SettingsTab>('user-roles');

  const subTabs = [
    {
      id: 'user-roles' as const,
      label: 'User Roles',
      icon: Users,
      description: 'Benutzer-Rollen und Berechtigungen verwalten',
    },
    {
      id: 'cron-jobs' as const,
      label: 'Cron Jobs',
      icon: Clock,
      description: 'Automatisierte Aufgaben konfigurieren',
    },
  ];

  const renderContent = () => {
    switch (activeSubTab) {
      case 'user-roles':
        return <UserRolesManager />;
      case 'cron-jobs':
        return <CronJobSettings />;
      default:
        return <UserRolesManager />;
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-3 mb-6'>
        <div className='p-2 bg-lafftale-gold/20 rounded-lg'>
          <Settings className='h-6 w-6 text-lafftale-gold' />
        </div>
        <div>
          <h1 className='text-2xl font-bold text-white'>System-Einstellungen</h1>
          <p className='text-gray-400'>Benutzer-Verwaltung und Automatisierung</p>
        </div>
      </div>

      {/* Sub-Navigation */}
      <Card className='bg-lafftale-darkgray border-gray-700'>
        <CardContent className='p-0'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-0'>
            {subTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;

              return (
                <Button
                  key={tab.id}
                  variant='ghost'
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`
                    h-auto p-6 rounded-none justify-start text-left
                    ${
                      isActive
                        ? 'bg-lafftale-gold/10 border-r-4 border-lafftale-gold text-white'
                        : 'hover:bg-gray-800/50 text-gray-300 hover:text-white'
                    }
                    ${tab.id === 'user-roles' ? 'md:border-r border-gray-700' : ''}
                  `}
                >
                  <div className='flex items-center gap-4 w-full'>
                    <div
                      className={`
                      p-3 rounded-lg
                      ${isActive ? 'bg-lafftale-gold/20 text-lafftale-gold' : 'bg-gray-700 text-gray-400'}
                    `}
                    >
                      <Icon className='h-6 w-6' />
                    </div>

                    <div className='flex-1'>
                      <h3 className='font-semibold text-lg mb-1'>{tab.label}</h3>
                      <p className='text-sm opacity-70'>{tab.description}</p>
                    </div>

                    <ChevronRight
                      className={`
                      h-5 w-5 transition-transform
                      ${isActive ? 'rotate-90 text-lafftale-gold' : 'text-gray-500'}
                    `}
                    />
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Content Area */}
      <div className='min-h-[600px]'>{renderContent()}</div>

      {/* Breadcrumb für aktuelle Auswahl */}
      <div className='flex items-center gap-2 text-sm text-gray-400 border-t border-gray-700 pt-4'>
        <Settings className='h-4 w-4' />
        <span>Settings</span>
        <ChevronRight className='h-3 w-3' />
        <span className='text-lafftale-gold'>{subTabs.find((tab) => tab.id === activeSubTab)?.label}</span>
      </div>
    </div>
  );
};

export default AdminSettings;
