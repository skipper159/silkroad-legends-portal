import React from 'react';
import { RankingTabs } from '@/components/Rankings';
import ActiveTemplate from '@/config/theme-config';

const { Layout } = ActiveTemplate.components;

const Rankings: React.FC = () => {
  return (
    <Layout>
      <div
        className='py-12 bg-cover bg-center'
        style={{
          backgroundImage: `url('${ActiveTemplate.assets.pageHeaderBackground}')`,
        }}
      >
        <div className='container mx-auto px-4 text-center'>
          <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold mb-6'>
            Player <span className='text-theme-accent font-cinzel text-4xl font-bold'>Rankings</span>
          </h1>
          <p className='text-lg max-w-2xl mx-auto mb-10 text-theme-text-muted'>
            Discover the top players, guilds, and achievements in the Silkroad world. See who dominates the
            leaderboards.
          </p>
        </div>
      </div>
      <hr />
      <main className='flex-1 bg-theme-surface/60'>
        <RankingTabs />
      </main>
    </Layout>
  );
};

export default Rankings;
