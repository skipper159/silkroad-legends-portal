import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { RankingTabs } from '@/components/Rankings';

const Rankings: React.FC = () => {
  return (
    <div className='min-h-screen flex flex-col'>
      <Navbar />
      <div className='py-12 bg-header-bg bg-cover bg-center'>
        <div className='container mx-auto px-4 text-center'>
          <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold mb-6'>
            Player <span className='text-lafftale-bronze font-cinzel text-4xl font-bold'>Rankings</span>
          </h1>
          <p className='text-lg max-w-2xl mx-auto mb-10 text-gray-300'>
            Discover the top players, guilds, and achievements in the Silkroad world. See who dominates the
            leaderboards.
          </p>
        </div>
      </div>
      <hr />
      <main className='flex-1 bg-silkroad-darkgray/60'>
        <RankingTabs />
      </main>
      <Footer />
    </div>
  );
};

export default Rankings;
