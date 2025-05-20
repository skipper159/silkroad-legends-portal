import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WebAccountsList from "@/components/admin/WebAccountsList";
import GameAccountsList from "@/components/admin/GameAccountsList";
import TicketSystem from "@/components/admin/TicketSystem";
import { Users, Database, TicketCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("webaccounts");
  const { token } = useAuth();

  // Mock admin check - in a real app, we'd check the decoded token for role
  // For now, we're assuming the user is an admin if they have a token
  // This would be replaced with proper role check in a real implementation
  const isAdmin = !!token;

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="py-20 bg-header2-bg bg-cover bg-top">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-4xl font-bold mb-6">
              Dashboard <span className="text-lafftale-bronze font-cinzel text-6xl font-bold">Admin</span>
            </h1>
          </div>
        </div>
        <hr></hr>
        <div className="container mx-auto py-10">
          

          <Tabs defaultValue="webaccounts" value={activeTab} onValueChange={setActiveTab}>
            <Card className="bg-lafftale-darkgray border-lafftale-gold/30 mb-6">
              <TabsList className="flex justify-center p-2 bg-transparent border-b border-lafftale-gold/20">
                <TabsTrigger 
                  value="webaccounts" 
                  className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark"                >                  <Users size={18} />
                  <span>Web Accounts</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="gameaccounts" 
                  className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark"
                >
                  <Database size={18} />
                  <span>Game Accounts</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="tickets" 
                  className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark"
                >
                  <TicketCheck size={18} />
                  <span>Ticket System</span>
                </TabsTrigger>
              </TabsList>            </Card>

            <Card className="bg-lafftale-darkgray border-lafftale-gold/30 p-6">
              <TabsContent value="webaccounts" className="mt-0">
                <WebAccountsList />
              </TabsContent>
              
              <TabsContent value="gameaccounts" className="mt-0">
                <GameAccountsList />
              </TabsContent>

              <TabsContent value="tickets" className="mt-0">
                <TicketSystem />
              </TabsContent>
            </Card>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
