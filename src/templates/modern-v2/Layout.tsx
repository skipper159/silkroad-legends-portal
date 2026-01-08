import { ReactNode } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className='min-h-screen bg-theme-background text-theme-text font-sans flex'>
      {/* Sidebar - Desktop Only for now (Hidden on mobile) */}
      <Sidebar className='hidden md:flex w-64 flex-col fixed inset-y-0 z-50' />

      {/* Main Content Wrapper */}
      <div className='flex-1 flex flex-col md:pl-64 transition-all duration-300'>
        <Header />

        <main className='flex-1 p-0 relative'>{children}</main>

        <Footer />
      </div>
    </div>
  );
};

export default Layout;
