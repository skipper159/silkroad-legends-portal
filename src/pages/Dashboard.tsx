
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Dashboard components
import Sidebar from "@/components/dashboard/Sidebar";
import AccountInfo from "@/components/dashboard/AccountInfo";
import CharactersList from "@/components/dashboard/CharactersList";
import PasswordChange from "@/components/dashboard/PasswordChange";
import DownloadLinks from "@/components/dashboard/DownloadLinks";
import SupportTickets from "@/components/dashboard/SupportTickets";
import AdminTeaser from "@/components/AdminTeaser";

// Mock user data
const userData = {
  username: "Drachenmeister",
  email: "player@example.com",
  registrationDate: "January 15, 2025",
  lastLogin: "April 7, 2025",
  silkBalance: 2500,
  isAdmin: true, // Mock admin status for testing
  characters: [
    { id: 1, name: "ShadowBlade", level: 92, guild: "Dragon Dynasty", online: true, class: "Blade", lastActive: "Now" },
    { id: 2, name: "StormMage", level: 75, guild: "Mystic Order", online: false, class: "Wizard", lastActive: "2 days ago" },
    { id: 3, name: "SilkGuardian", level: 110, guild: "Royal Guards", online: false, class: "Spear", lastActive: "5 hours ago" }
  ],
  tickets: [
    { id: 101, subject: "Missing item after trade", status: "Open", date: "April 5, 2025" },
    { id: 102, subject: "Bug in Hunter's Valley", status: "Closed", date: "March 28, 2025" }
  ]
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("account");
  const { toast } = useToast();
  
  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    // In a real app, would redirect to home
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-lafftale-dark">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Account Dashboard</h1>
              <p className="text-gray-400">
                Welcome back, <span className="text-lafftale-gold">{userData.username}</span>
              </p>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline" 
              className="mt-4 md:mt-0 flex items-center gap-2 btn-outline"
            >
              <LogOut size={16} /> Logout
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <Sidebar 
              userData={userData} 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              handleLogout={handleLogout} 
            />
            
            {/* Main content */}
            <div className="col-span-1 lg:col-span-3">
              <div className="card min-h-[500px]">
                <Tabs value={activeTab} className="w-full">
                  <TabsContent value="account" className="mt-0">
                    <AccountInfo userData={userData} />
                  </TabsContent>
                  
                  <TabsContent value="characters" className="mt-0">
                    <CharactersList characters={userData.characters} />
                  </TabsContent>
                  
                  <TabsContent value="password" className="mt-0">
                    <PasswordChange />
                  </TabsContent>
                  
                  <TabsContent value="download" className="mt-0">
                    <DownloadLinks />
                  </TabsContent>
                  
                  <TabsContent value="support" className="mt-0">
                    <SupportTickets tickets={userData.tickets} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
          
          {/* AdminTeaser only shown for admin users */}
          {userData.isAdmin && (
            <div className="mt-12">
              <AdminTeaser />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
