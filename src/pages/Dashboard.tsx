
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { User, Shield, Key, Download, Ticket, Coins, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock user data
const userData = {
  username: "Drachenmeister",
  email: "player@example.com",
  registrationDate: "January 15, 2025",
  lastLogin: "April 7, 2025",
  silkBalance: 2500,
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
      <main className="flex-grow bg-silkroad-dark">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Account Dashboard</h1>
              <p className="text-gray-400">
                Welcome back, <span className="text-silkroad-gold">{userData.username}</span>
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
            <div className="col-span-1">
              <div className="card">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-silkroad-darkgray border-2 border-silkroad-gold flex items-center justify-center mb-3">
                    <User size={40} className="text-silkroad-gold" />
                  </div>
                  <h2 className="text-xl font-bold">{userData.username}</h2>
                  <span className="text-gray-400 text-sm">{userData.email}</span>
                </div>
                
                <div className="bg-silkroad-gold/10 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Silk Balance</span>
                    <span className="font-bold text-silkroad-gold flex items-center">
                      <Coins size={16} className="mr-1" /> {userData.silkBalance}
                    </span>
                  </div>
                </div>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-1 h-auto gap-2">
                    <TabsTrigger value="account" className="flex justify-start gap-3 items-center">
                      <User size={18} /> Account Info
                    </TabsTrigger>
                    <TabsTrigger value="characters" className="flex justify-start gap-3 items-center">
                      <Shield size={18} /> Characters
                    </TabsTrigger>
                    <TabsTrigger value="password" className="flex justify-start gap-3 items-center">
                      <Key size={18} /> Change Password
                    </TabsTrigger>
                    <TabsTrigger value="download" className="flex justify-start gap-3 items-center">
                      <Download size={18} /> Download
                    </TabsTrigger>
                    <TabsTrigger value="support" className="flex justify-start gap-3 items-center">
                      <Ticket size={18} /> Support Tickets
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            
            {/* Main content */}
            <div className="col-span-1 lg:col-span-3">
              <div className="card min-h-[500px]">
                <TabsContent value="account" className="mt-0">
                  <h3 className="text-2xl font-bold mb-6">Account Information</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-400">Username</p>
                        <p className="font-medium">{userData.username}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Email</p>
                        <p className="font-medium">{userData.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Registration Date</p>
                        <p className="font-medium">{userData.registrationDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Last Login</p>
                        <p className="font-medium">{userData.lastLogin}</p>
                      </div>
                    </div>
                    
                    <Separator className="my-6 bg-silkroad-gold/20" />
                    
                    <div>
                      <h4 className="text-xl font-bold mb-4">Account Settings</h4>
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                          <div>
                            <p className="font-medium">Change Email Address</p>
                            <p className="text-sm text-gray-400">Update your account email</p>
                          </div>
                          <Button variant="outline" className="btn-outline">
                            Change Email
                          </Button>
                        </div>
                        <Separator className="bg-silkroad-gold/10" />
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                          <div>
                            <p className="font-medium">Two-Factor Authentication</p>
                            <p className="text-sm text-gray-400">Add an extra layer of security</p>
                          </div>
                          <Button variant="outline" className="btn-outline">
                            Enable 2FA
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="characters" className="mt-0">
                  <h3 className="text-2xl font-bold mb-6">My Characters</h3>
                  <div className="space-y-4">
                    {userData.characters.map((character) => (
                      <div 
                        key={character.id} 
                        className="p-4 rounded-lg border border-silkroad-gold/20 bg-silkroad-darkgray/50 flex flex-col sm:flex-row justify-between"
                      >
                        <div className="flex items-center gap-4 mb-4 sm:mb-0">
                          <div className="w-12 h-12 rounded-full bg-silkroad-dark flex items-center justify-center">
                            <span className="text-lg font-bold text-silkroad-gold">
                              {character.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-lg">{character.name}</h4>
                              <Badge variant={character.online ? "default" : "outline"}>
                                {character.online ? "Online" : "Offline"}
                              </Badge>
                            </div>
                            <div className="flex gap-3 text-sm text-gray-400">
                              <span>Level {character.level}</span>
                              <span>•</span>
                              <span>{character.class}</span>
                              <span>•</span>
                              <span>{character.guild}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button size="sm" variant="outline" className="btn-outline">
                            Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="password" className="mt-0">
                  <h3 className="text-2xl font-bold mb-6">Change Password</h3>
                  <form className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input 
                        id="currentPassword" 
                        type="password" 
                        placeholder="Enter your current password"
                        className="bg-silkroad-dark/70 border-silkroad-gold/20 focus:border-silkroad-gold" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input 
                        id="newPassword" 
                        type="password" 
                        placeholder="Enter your new password"
                        className="bg-silkroad-dark/70 border-silkroad-gold/20 focus:border-silkroad-gold" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input 
                        id="confirmPassword" 
                        type="password" 
                        placeholder="Confirm your new password"
                        className="bg-silkroad-dark/70 border-silkroad-gold/20 focus:border-silkroad-gold" 
                      />
                    </div>
                    <Button className="btn-primary">Update Password</Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="download" className="mt-0">
                  <h3 className="text-2xl font-bold mb-6">Download</h3>
                  <div className="space-y-6">
                    <div className="p-4 rounded-lg border border-silkroad-gold/20 bg-silkroad-darkgray/50">
                      <h4 className="font-bold text-lg mb-2">Game Launcher</h4>
                      <p className="text-gray-400 mb-4">
                        Our recommended way to play. The launcher keeps your game updated automatically.
                      </p>
                      <Button className="btn-primary flex items-center gap-2">
                        <Download size={16} /> Download Launcher (450 MB)
                      </Button>
                    </div>
                    
                    <div className="p-4 rounded-lg border border-silkroad-gold/20 bg-silkroad-darkgray/50">
                      <h4 className="font-bold text-lg mb-2">Full Client</h4>
                      <p className="text-gray-400 mb-4">
                        Complete game installation package. Manual updates required.
                      </p>
                      <Button variant="secondary" className="flex items-center gap-2">
                        <Download size={16} /> Download Full Client (4.2 GB)
                      </Button>
                    </div>
                    
                    <div className="p-4 rounded-lg border border-silkroad-gold/20 bg-silkroad-darkgray/50">
                      <h4 className="font-bold text-lg mb-2">Patch Notes</h4>
                      <p className="text-gray-400 mb-4">
                        Latest game updates and changes.
                      </p>
                      <Button variant="outline" className="btn-outline">
                        View Patch Notes
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="support" className="mt-0">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">Support Tickets</h3>
                    <Button className="btn-primary">New Ticket</Button>
                  </div>
                  
                  {userData.tickets.length > 0 ? (
                    <div className="space-y-4">
                      {userData.tickets.map((ticket) => (
                        <div 
                          key={ticket.id} 
                          className="p-4 rounded-lg border border-silkroad-gold/20 bg-silkroad-darkgray/50 flex flex-col sm:flex-row justify-between"
                        >
                          <div>
                            <h4 className="font-bold">#{ticket.id}: {ticket.subject}</h4>
                            <p className="text-sm text-gray-400">Created on {ticket.date}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-2 sm:mt-0">
                            <Badge variant={ticket.status === "Open" ? "default" : "outline"}>
                              {ticket.status}
                            </Badge>
                            <Button size="sm" variant="outline" className="btn-outline">
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-gray-400 mb-4">You don't have any support tickets yet.</p>
                      <Button className="btn-primary">Create Your First Ticket</Button>
                    </div>
                  )}
                </TabsContent>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
