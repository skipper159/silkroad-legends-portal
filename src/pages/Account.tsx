
import { useState } from "react";
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
import { Shield, User, Settings, TicketCheck, Coins, Vote, Gift } from "lucide-react";

const Account = () => {
  const [activeTab, setActiveTab] = useState("web-account");

  const mockUserData = {
    username: "Drachenmeister",
    email: "player@example.com",
    registeredAt: "January 15, 2025",
    lastLogin: "April 7, 2025",
    silkBalance: 1250
  };

  const mockGameAccounts = [
    // ... deine Daten hier
  ];

  const mockTickets = [
    { id: 101, subject: "Missing item after trade", status: "Open", date: "April 5, 2025" },
    { id: 102, subject: "Bug in Hunter's Valley", status: "Closed", date: "March 28, 2025" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-lafftale-dark">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold font-cinzel text-lafftale-gold text-center mb-8">
            Account Management
          </h1>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-3">
                <div className="card">
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-lafftale-darkgray border-2 border-lafftale-gold flex items-center justify-center mb-3">
                      <User size={40} className="text-lafftale-gold" />
                    </div>
                    <h2 className="text-xl font-bold">{mockUserData.username}</h2>
                    <span className="text-gray-400 text-sm">{mockUserData.email}</span>
                    
                    {/* Silk Wallet Display */}
                    <div className="mt-4 bg-lafftale-darkgray/70 border border-lafftale-gold/50 rounded-lg p-3 flex items-center gap-2 shadow-lg w-full">
                      <div className="p-2 rounded-full bg-lafftale-gold/20 flex items-center justify-center">
                        <Coins size={20} className="text-lafftale-gold animate-pulse" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Wallet Balance</p>
                        <p className="text-lafftale-gold font-semibold">{mockUserData.silkBalance} Silk</p>
                      </div>
                    </div>
                  </div>

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
                    <p className="text-sm text-gray-400 mb-2">Last login: {mockUserData.lastLogin}</p>
                    <p className="text-sm text-gray-400">Member since: {mockUserData.registeredAt}</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-9">
                <div className="card min-h-[600px]">
                  <TabsContent value="web-account" className="mt-0">
                    <AccountWebSettings userData={mockUserData} />

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
                    <GameAccountManager gameAccounts={mockGameAccounts} />
                  </TabsContent>

                  <TabsContent value="characters" className="mt-0">
                    <CharacterOverview gameAccounts={mockGameAccounts} />
                  </TabsContent>
                                    
                  <TabsContent value="donate" className="mt-0">
                    <DonateSilkMall />
                  </TabsContent>
                  
                  <TabsContent value="voting" className="mt-0">
                    <VotingSystem />
                  </TabsContent>
                  <TabsContent value="tickets" className="mt-0">
                    <SupportTickets tickets={mockTickets} />
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
