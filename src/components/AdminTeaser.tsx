
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminTeaser = () => {
  return (
    <section className="py-16 bg-lafftale-dark relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-lafftale-gold mb-4">
            Powerful Backend Management
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Silkroad Lafftale features a robust administration system built with Node.js, 
            Express, and SQL Server for efficient game management.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* User Management */}
          <div className="bg-gradient-to-br from-lafftale-dark/80 to-lafftale-dark border border-lafftale-gold/20 rounded-lg p-6 transform transition-all hover:scale-105">
            <div className="h-12 w-12 bg-lafftale-gold/20 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-lafftale-gold">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-lafftale-gold mb-2">User Management</h3>
            <p className="text-gray-400 mb-4">Comprehensive user account management system with secure registration and authentication.</p>
          </div>

          {/* Support System */}
          <div className="bg-gradient-to-br from-lafftale-dark/80 to-lafftale-dark border border-lafftale-gold/20 rounded-lg p-6 transform transition-all hover:scale-105">
            <div className="h-12 w-12 bg-lafftale-gold/20 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-lafftale-gold">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-lafftale-gold mb-2">Support Tickets</h3>
            <p className="text-gray-400 mb-4">Streamlined ticket system for player support with message history and admin controls.</p>
          </div>

          {/* Admin Panel */}
          <div className="bg-gradient-to-br from-lafftale-dark/80 to-lafftale-dark border border-lafftale-gold/20 rounded-lg p-6 transform transition-all hover:scale-105">
            <div className="h-12 w-12 bg-lafftale-gold/20 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-lafftale-gold">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-lafftale-gold mb-2">Admin Tools</h3>
            <p className="text-gray-400 mb-4">Powerful administration features for GMs to manage tickets and user accounts efficiently.</p>
          </div>

          {/* API */}
          <div className="bg-gradient-to-br from-lafftale-dark/80 to-lafftale-dark border border-lafftale-gold/20 rounded-lg p-6 transform transition-all hover:scale-105">
            <div className="h-12 w-12 bg-lafftale-gold/20 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-lafftale-gold">
                <path d="M18 10h-4V6"></path>
                <path d="M14 10l7-7"></path>
                <path d="M6 14H2"></path>
                <path d="M6 14l7 7"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-lafftale-gold mb-2">RESTful API</h3>
            <p className="text-gray-400 mb-4">Well-structured API endpoints organized by resource for seamless integration.</p>
          </div>
        </div>

        {/* Preview Image */}
        <div className="relative max-w-4xl mx-auto border-4 border-lafftale-gold/30 rounded-lg overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-b from-lafftale-dark to-black p-3">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <div className="ml-4 text-xs text-lafftale-gold/70">lafftale-admin-panel</div>
            </div>
          </div>
          <div className="h-64 sm:h-80 md:h-96 bg-lafftale-dark/80 p-4 flex">
            {/* Sidebar mockup */}
            <div className="w-48 hidden sm:block border-r border-lafftale-gold/20 pr-3">
              <div className="text-lafftale-gold font-semibold mb-4">Admin Dashboard</div>
              <ul className="space-y-2">
                <li className="text-sm text-white bg-lafftale-gold/20 px-3 py-2 rounded">Overview</li>
                <li className="text-sm text-gray-400 px-3 py-2">Users</li>
                <li className="text-sm text-gray-400 px-3 py-2">Tickets</li>
                <li className="text-sm text-gray-400 px-3 py-2">Settings</li>
              </ul>
            </div>
            {/* Content mockup */}
            <div className="flex-1 pl-0 sm:pl-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lafftale-gold font-bold">Open Support Tickets</h3>
                <div className="bg-lafftale-gold/20 text-xs text-white px-3 py-1 rounded-full">12 Active</div>
              </div>
              <div className="space-y-3">
                <div className="border border-lafftale-gold/20 rounded p-3 bg-lafftale-dark/40">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Ticket #2845</span>
                    <span>2 hours ago</span>
                  </div>
                  <div className="text-sm text-white mb-2">Item disappeared from inventory after server reset</div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-lafftale-gold">DragonSlayer92</span>
                    <span className="bg-yellow-700/30 text-yellow-300 text-xs px-2 py-0.5 rounded">Pending</span>
                  </div>
                </div>
                <div className="border border-lafftale-gold/20 rounded p-3 bg-lafftale-dark/40">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Ticket #2844</span>
                    <span>3 hours ago</span>
                  </div>
                  <div className="text-sm text-white mb-2">Unable to complete Hotan quest chain</div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-lafftale-gold">SilkMaster</span>
                    <span className="bg-green-700/30 text-green-300 text-xs px-2 py-0.5 rounded">In Progress</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <Button className="bg-lafftale-gold hover:bg-lafftale-gold/80 text-lafftale-dark font-medium flex items-center gap-2">
            Learn More About Our Admin System <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AdminTeaser;
