
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-lafftale-dark/90 backdrop-blur-sm border-b border-lafftale-gold/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-lafftale-gold font-cinzel text-2xl font-bold">
                Silkroad <span className="text-lafftale-bronze">Lafftale</span>
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`font-medium transition-colors duration-300 hover:text-lafftale-gold ${isActive('/') ? 'text-lafftale-gold' : 'text-gray-300'}`}>
              Home
            </Link>
            <Link to="/news" className={`font-medium transition-colors duration-300 hover:text-lafftale-gold ${isActive('/news') ? 'text-lafftale-gold' : 'text-gray-300'}`}>
              News
            </Link>
            <Link to="/download" className={`font-medium transition-colors duration-300 hover:text-lafftale-gold ${isActive('/download') ? 'text-lafftale-gold' : 'text-gray-300'}`}>
              Download
            </Link>
            <Link to="/register" className={`font-medium transition-colors duration-300 hover:text-lafftale-gold ${isActive('/register') ? 'text-lafftale-gold' : 'text-gray-300'}`}>
              Register
            </Link>
            <Button asChild className="btn-primary">
              <Link to="/login">Login</Link>
            </Button>
          </div>
          
          <div className="flex md:hidden">
            <Button 
              variant="ghost" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:text-lafftale-gold"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-lafftale-darkgray border-b border-lafftale-gold/20">
            <Link 
              to="/" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/') ? 'bg-lafftale-gold/20 text-lafftale-gold' : 'text-gray-300 hover:bg-lafftale-gold/10 hover:text-lafftale-gold'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/news" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/news') ? 'bg-lafftale-gold/20 text-lafftale-gold' : 'text-gray-300 hover:bg-lafftale-gold/10 hover:text-lafftale-gold'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              News
            </Link>
            <Link 
              to="/download" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/download') ? 'bg-lafftale-gold/20 text-lafftale-gold' : 'text-gray-300 hover:bg-lafftale-gold/10 hover:text-lafftale-gold'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Download
            </Link>
            <Link 
              to="/register" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/register') ? 'bg-lafftale-gold/20 text-lafftale-gold' : 'text-gray-300 hover:bg-lafftale-gold/10 hover:text-lafftale-gold'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Register
            </Link>
            <Link 
              to="/login" 
              className="block w-full text-center px-3 py-2 rounded-md text-base font-medium bg-lafftale-gold text-lafftale-dark hover:bg-amber-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
