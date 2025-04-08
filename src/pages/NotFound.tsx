
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-login-bg bg-cover bg-center flex items-center justify-center">
        <div className="text-center px-4">
          <div className="card backdrop-blur-sm border-silkroad-gold/30 max-w-md mx-auto">
            <h1 className="text-6xl font-bold mb-4 text-silkroad-crimson">404</h1>
            <p className="text-xl text-gray-300 mb-6">
              This realm does not exist in the Silkroad Legends universe
            </p>
            <Button asChild className="btn-primary">
              <Link to="/">Return to the Known World</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
