import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AccountWebSettings from "@/components/account/AccountWebSettings";
import GameAccountManager from "@/components/account/GameAccountManager";
import CharacterOverview from "@/components/account/CharacterOverview";
import SupportTickets from "@/components/account/SupportTickets";
import DonateSilkMall from "@/components/account/DonateSilkMall";
import VotingSystem from "@/components/account/VotingSystem";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Shield, User, Settings, TicketCheck, Coins, Vote, Gift, Loader2 } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { weburl } from "@/lib/api";

interface UserData {
  username: string;
  email: string;
  registeredAt: string;
  lastLogin: string;
  logTime: string;
}

interface GameAccount {
  JID: number;
  StrUserID: string;
  silk_own: number;
  silk_gift?: number;
  silk_point?: number;
  total_silk?: number;
  regtime?: string;
}

const Account = () => {
  const [activeTab, setActiveTab] = useState("web-account");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [gameAccounts, setGameAccounts] = useState<GameAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetchWithAuth(`${weburl}/api/users/me`);
        
        if (!response.ok) {
          throw new Error("Fail to load user data");
        }
        
        const data = await response.json();
        console.log("Received user data:", data);
        
        setUserData({
          username: data.username,
          email: data.email,
          registeredAt: new Date(data.registeredAt).toLocaleDateString('de-DE'),
          lastLogin: new Date(data.lastLogin).toLocaleDateString('de-DE'),
          logTime: data.logTime || ''
        });
      } catch (err) {
        console.error("fail to load user data:", err);
        setError("User Data could not loaded, please check if ur login is correct.");
      } finally {
        setLoading(false);
      }
    };

    const fetchGameAccounts = async () => {
      try {
        const response = await fetchWithAuth(`${weburl}/api/gameaccount/my`);
          if (!response.ok) {
          throw new Error("Error loading game accounts");
        }
        
        const data = await response.json();
        setGameAccounts(data);      } catch (err) {
        console.error("Fail to load Game-Accounts:", err);
        // We don't set an error here as it's not critical
      }
    };

    fetchUserData();
    fetchGameAccounts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow bg-lafftale-dark flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 size={40} className="text-lafftale-gold animate-spin mb-4" />
            <p className="text-lafftale-gold">Lade Kontodaten...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow bg-lafftale-dark flex items-center justify-center">          <div className="card p-8 text-center">
            <h2 className="text-2xl text-red-500 mb-4">Error</h2>
            <p className="text-gray-300 mb-4">{error || "User data could not be loaded"}</p>
            <Button onClick={() => window.location.reload()} className="bg-lafftale-gold text-lafftale-dark">
              Try again
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Formatierung der Login-Zeit mit Datum und Uhrzeit
  const formattedLastLogin = userData.logTime 
    ? `${userData.lastLogin} at ${userData.logTime.substring(0, 5)} o clock` 
    : userData.lastLogin;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="py-12 bg-header-bg bg-cover bg-center">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-4xl font-bold mb-6">
              Dashboard <span className="text-lafftale-bronze font-cinzel text-6xl font-bold">Account</span>
            </h1>
          </div>
        </div>
        <hr></hr>

        <div className="container mx-auto py-10">

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-3">
                <div className="card">
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-lafftale-darkgray border-2 border-lafftale-gold flex items-center justify-center mb-3">
                      <User size={40} className="text-lafftale-gold" />
                    </div>
                    <h2 className="text-xl font-bold">{userData.username}</h2>
                    <span className="text-gray-400 text-sm">{userData.email}</span>
                  </div>

                  {/* Game Accounts mit Silk-Guthaben */}
                  {gameAccounts.length > 0 && (
                    <div className="mb-6 px-2 py-4 bg-lafftale-darkgray border border-lafftale-gold/30 rounded-lg">
                      <h3 className="text-md font-bold text-lafftale-gold mb-3 text-center">Silk Currency</h3>
                      <div className="space-y-2">
                        {gameAccounts.map((account) => (
                          <div 
                            key={account.JID}
                            className="p-2 bg-lafftale-dark/50 rounded-lg border border-lafftale-gold/20 flex justify-between items-center"
                          >
                            <span className="text-lafftale-gold font-cinzel font-medium">{account.StrUserID}</span>
                            <div className="flex items-center gap-1 text-lafftale-gold">
                              <span>{account.silk_own}</span>
                              <Coins size={14} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <TabsList className="grid grid-cols-1 h-auto gap-2">
                    <TabsTrigger value="web-account" className="flex justify-start gap-3 items-center">
                      <Settings size={18} /> Account Settings
                    </TabsTrigger>
                    <TabsTrigger value="game-accounts" className="flex justify-start gap-3 items-center">
                      <Shield size={18} /> Game Accounts
                    </TabsTrigger>
                    <TabsTrigger value="characters" className="flex justify-start gap-3 items-center">
                      <User size={18} /> Character Overview
                      </TabsTrigger>
                    <TabsTrigger value="donate" className="flex justify-start gap-3 items-center">
                      <Gift size={18} /> Donate / SilkMall
                    </TabsTrigger>
                    <TabsTrigger value="voting" className="flex justify-start gap-3 items-center">
                      <Vote size={18} /> Voting
                    </TabsTrigger>
                    <TabsTrigger value="tickets" className="flex justify-start gap-3 items-center">
                      <TicketCheck size={18} /> Support Tickets
                    </TabsTrigger>
                  </TabsList>

                  <div className="mt-6 pt-6 border-t border-lafftale-gold/20">
                    <p className="text-sm text-gray-400 mb-2">Last Login: {formattedLastLogin}</p>
                    <p className="text-sm text-gray-400">Member since: {userData.registeredAt}</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-9">
                <div className="card min-h-[600px]">
                  <TabsContent value="web-account" className="mt-0">
                    <AccountWebSettings userData={userData} />

                    <div className="mt-10 flex justify-end">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="text-red-500 border-red-500 hover:bg-red-500/20">
                            Delete Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-lafftale-darkgray border-lafftale-gold">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-lafftale-gold">Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your
                              account and all associated game accounts and characters.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-lafftale-darkgray border-lafftale-gold text-lafftale-gold hover:bg-lafftale-darkgray/50">Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600 hover:bg-red-700">Delete Account</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TabsContent>

                  <TabsContent value="game-accounts" className="mt-0">
                    <GameAccountManager />
                  </TabsContent>

                  <TabsContent value="characters" className="mt-0">
                    <CharacterOverview />
                  </TabsContent>
                                    
                  <TabsContent value="donate" className="mt-0">
                    <DonateSilkMall />
                  </TabsContent>
                  
                  <TabsContent value="voting" className="mt-0">
                    <VotingSystem />
                  </TabsContent>
                  <TabsContent value="tickets" className="mt-0">
                    <SupportTickets />
                  </TabsContent>
                </div>
              </div>
            </div>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Account;
