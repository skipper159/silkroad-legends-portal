import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { RankingTabs } from '@/components/Rankings';

const Rankings: React.FC = () => {
  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900'>
      <Navbar />
      <main className='container mx-auto px-4 py-8'>
        <RankingTabs />
      </main>
      <Footer />
    </div>
  );
};

export default Rankings;
