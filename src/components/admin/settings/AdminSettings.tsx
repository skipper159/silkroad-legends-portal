import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Users, Clock, FileText, Globe, ChevronRight } from 'lucide-react';
import CronJobSettings from './CronJobSettings';
import WebSettingsManager from './WebSettingsManager';
import FooterLinksManager from '../FooterLinksManager';

type SettingsTab = 'cron-jobs' | 'footer-links' | 'web-settings';

const AdminSettings = () => {
  const [activeSubTab, setActiveSubTab] = useState<SettingsTab>('web-settings');

  const subTabs = [
    {
      id: 'web-settings' as const,
      label: 'Web Settings',
      icon: Globe,
      description: 'Configure modals and frontend behavior',
    },
    {
      id: 'footer-links' as const,
      label: 'Footer Links',
      icon: FileText,
      description: 'Manage footer navigation and pages',
    },
    {
      id: 'cron-jobs' as const,
      label: 'Cron Jobs',
      icon: Clock,
      description: 'Configure automated tasks',
    },
  ];

  const renderContent = () => {
    switch (activeSubTab) {
      case 'web-settings':
        return <WebSettingsManager />;
      case 'footer-links':
        return <FooterLinksManager />;
      case 'cron-jobs':
        return <CronJobSettings />;
      default:
        return <WebSettingsManager />;
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-3 mb-6'>
        <div className='p-2 bg-theme-primary/20 rounded-lg'>
          <Settings className='h-6 w-6 text-theme-primary' />
        </div>
        <div>
          <h1 className='text-2xl font-bold text-theme-primary'>System Settings</h1>
          <p className='text-theme-text-muted'>Configure website, users, and automation</p>
        </div>
      </div>

      {/* Sub-Navigation */}
      <Card className='bg-theme-surface border-theme-border'>
        <CardContent className='p-0'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0'>
            {subTabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              const isLast = index === subTabs.length - 1;

              return (
                <Button
                  key={tab.id}
                  variant='ghost'
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`
                    h-auto p-4 lg:p-6 rounded-none justify-start text-left
                    ${
                      isActive
                        ? 'bg-theme-primary/10 border-b-4 lg:border-b-0 lg:border-r-4 border-theme-primary text-theme-primary'
                        : 'hover:bg-theme-surface/80 text-theme-text-muted hover:text-theme-text'
                    }
                    ${!isLast ? 'border-b lg:border-b-0 lg:border-r border-theme-border' : ''}
                  `}
                >
                  <div className='flex items-center gap-3 w-full'>
                    <div
                      className={`
                      p-2 rounded-lg
                      ${
                        isActive
                          ? 'bg-theme-primary/20 text-theme-primary'
                          : 'bg-theme-surface/50 text-theme-text-muted'
                      }
                    `}
                    >
                      <Icon className='h-5 w-5' />
                    </div>

                    <div className='flex-1 min-w-0'>
                      <h3 className='font-semibold text-sm lg:text-base truncate'>{tab.label}</h3>
                      <p className='text-xs opacity-70 truncate hidden lg:block'>{tab.description}</p>
                    </div>

                    <ChevronRight
                      className={`
                      h-4 w-4 transition-transform hidden lg:block
                      ${isActive ? 'rotate-90 text-theme-primary' : 'text-theme-text-muted'}
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

      {/* Breadcrumb */}
      <div className='flex items-center gap-2 text-sm text-theme-text-muted border-t border-theme-border pt-4'>
        <Settings className='h-4 w-4' />
        <span>Settings</span>
        <ChevronRight className='h-3 w-3' />
        <span className='text-theme-primary'>{subTabs.find((tab) => tab.id === activeSubTab)?.label}</span>
      </div>
    </div>
  );
};

export default AdminSettings;
