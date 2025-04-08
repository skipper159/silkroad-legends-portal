
import { Coins, Download, Key, LogOut, Shield, Ticket, User } from "lucide-react";
import { TabsTrigger, TabsList } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  userData: {
    username: string;
    email: string;
    silkBalance: number;
  };
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleLogout: () => void;
}

const Sidebar = ({ userData, activeTab, setActiveTab, handleLogout }: SidebarProps) => {
  return (
    <div className="col-span-1">
      <div className="card">
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-lafftale-darkgray border-2 border-lafftale-gold flex items-center justify-center mb-3">
            <User size={40} className="text-lafftale-gold" />
          </div>
          <h2 className="text-xl font-bold">{userData.username}</h2>
          <span className="text-gray-400 text-sm">{userData.email}</span>
        </div>
        
        <div className="bg-lafftale-gold/10 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Silk Balance</span>
            <span className="font-bold text-lafftale-gold flex items-center">
              <Coins size={16} className="mr-1" /> {userData.silkBalance}
            </span>
          </div>
          <Button variant="outline" size="sm" className="w-full mt-2 btn-outline">
            Add Silk
          </Button>
        </div>
        
        <TabsList className="grid grid-cols-1 h-auto gap-2">
          <TabsTrigger 
            value="account" 
            onClick={() => setActiveTab("account")}
            className={`flex justify-start gap-3 items-center ${activeTab === "account" ? "bg-lafftale-gold/20" : ""}`}
          >
            <User size={18} /> Account Info
          </TabsTrigger>
          <TabsTrigger 
            value="characters" 
            onClick={() => setActiveTab("characters")}
            className={`flex justify-start gap-3 items-center ${activeTab === "characters" ? "bg-lafftale-gold/20" : ""}`}
          >
            <Shield size={18} /> Characters
          </TabsTrigger>
          <TabsTrigger 
            value="password" 
            onClick={() => setActiveTab("password")}
            className={`flex justify-start gap-3 items-center ${activeTab === "password" ? "bg-lafftale-gold/20" : ""}`}
          >
            <Key size={18} /> Change Password
          </TabsTrigger>
          <TabsTrigger 
            value="download" 
            onClick={() => setActiveTab("download")}
            className={`flex justify-start gap-3 items-center ${activeTab === "download" ? "bg-lafftale-gold/20" : ""}`}
          >
            <Download size={18} /> Download
          </TabsTrigger>
          <TabsTrigger 
            value="support" 
            onClick={() => setActiveTab("support")}
            className={`flex justify-start gap-3 items-center ${activeTab === "support" ? "bg-lafftale-gold/20" : ""}`}
          >
            <Ticket size={18} /> Support Tickets
          </TabsTrigger>
        </TabsList>
        
        <Button 
          onClick={handleLogout}
          variant="outline" 
          className="mt-6 w-full flex items-center gap-2 btn-outline"
        >
          <LogOut size={16} /> Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
