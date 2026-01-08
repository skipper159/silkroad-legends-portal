import { ReactNode } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';

interface LayoutProps {
  children: ReactNode;
  className?: string; // Allow passing extra classes to the main wrapper
}

const Layout = ({ children, className }: LayoutProps) => {
  return (
    <div className='min-h-screen flex flex-col font-sans text-gray-100 bg-lafftale-dark'>
      <Header />
      <main className={`flex-grow ${className || ''}`}>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
