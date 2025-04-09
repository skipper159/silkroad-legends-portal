
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AccountWebSettings from "@/components/account/AccountWebSettings";
import GameAccountManager from "@/components/account/GameAccountManager";
import CharacterOverview from "@/components/account/CharacterOverview";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Shield, User, Settings } from "lucide-react";

const Account = () => {
  const [activeTab, setActiveTab] = useState("web-account");
  
  // Mock data - will be replaced with API data later
  const mockUserData = {
    username: "Drachenmeister",
    email: "player@example.com",
    registeredAt: "January 15, 2025",
    lastLogin: "April 7, 2025"
  };
  
  const mockGameAccounts = [
    {
      id: 1,
      username: "LaffHero1",
      created: "February 10, 2025",
      lastLogin: "April 9, 2025",
      characters: [
        {
          id: 101,
          name: "ShadowBlade",
          level: 92,
          job: "Blade",
          statPoints: 24,
          equipment: {
            helmet: {
              name: "Phoenix Crown",
              level: 9,
              rarity: "unique",
              bonuses: ["+15 STR", "+5% Critical Hit"]
            },
            armor: {
              name: "Dragon Scale Vest",
              level: 9,
              rarity: "legendary",
              bonuses: ["+450 PhyDef", "+250 MagDef", "+10% HP"]
            },
            weapon: {
              name: "Abyssal Edge",
              level: 9,
              rarity: "unique",
              bonuses: ["+85 PhyAtk", "+12% Attack Speed"]
            },
            shield: {
              name: "Reflector Shield",
              level: 8,
              rarity: "rare",
              bonuses: ["+250 PhyDef", "5% Damage Reflection"]
            }
          }
        },
        {
          id: 102,
          name: "StormMage",
          level: 75,
          job: "Wizard",
          statPoints: 15,
          equipment: {
            helmet: {
              name: "Wisdom Circlet",
              level: 7,
              rarity: "rare",
              bonuses: ["+12 INT", "+8% MP"]
            },
            armor: {
              name: "Archmage Robe",
              level: 7,
              rarity: "rare",
              bonuses: ["+180 MagDef", "+150 PhyDef", "+15% MP"]
            },
            weapon: {
              name: "Staff of Storms",
              level: 8,
              rarity: "unique",
              bonuses: ["+95 MagAtk", "+15% Lightning Damage"]
            }
          }
        },
        {
          id: 103,
          name: "SilkGuardian",
          level: 110,
          job: "Spear",
          statPoints: 35,
          equipment: {
            helmet: {
              name: "Commander's Helm",
              level: 10,
              rarity: "legendary",
              bonuses: ["+20 STR", "+15% Critical Damage"]
            },
            armor: {
              name: "Imperial Guard Plate",
              level: 10,
              rarity: "legendary",
              bonuses: ["+650 PhyDef", "+350 MagDef", "+15% Damage Reduction"]
            },
            weapon: {
              name: "Divine Trident",
              level: 10,
              rarity: "legendary",
              bonuses: ["+120 PhyAtk", "+20% Area Damage"]
            },
            shield: {
              name: "Aegis Tower Shield",
              level: 9,
              rarity: "unique",
              bonuses: ["+450 PhyDef", "+15% Block Rate"]
            }
          }
        }
      ]
    },
    {
      id: 2,
      username: "LaffMerchant",
      created: "March 5, 2025",
      lastLogin: "April 3, 2025",
      characters: [
        {
          id: 201,
          name: "GoldHunter",
          level: 65,
          job: "Thief",
          statPoints: 8,
          equipment: {
            helmet: {
              name: "Shadow Cap",
              level: 6,
              rarity: "rare",
              bonuses: ["+10 DEX", "+5% Evasion"]
            },
            armor: {
              name: "Night Prowler Suit",
              level: 6,
              rarity: "rare",
              bonuses: ["+220 PhyDef", "+180 MagDef", "+8% Movement Speed"]
            },
            weapon: {
              name: "Twin Fangs",
              level: 7,
              rarity: "rare",
              bonuses: ["+75 PhyAtk", "+15% Attack Speed"]
            }
          }
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-lafftale-dark">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold font-cinzel text-lafftale-gold text-center mb-8">
            Account Management
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-3">
              <div className="card">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-lafftale-darkgray border-2 border-lafftale-gold flex items-center justify-center mb-3">
                    <User size={40} className="text-lafftale-gold" />
                  </div>
                  <h2 className="text-xl font-bold">{mockUserData.username}</h2>
                  <span className="text-gray-400 text-sm">{mockUserData.email}</span>
                </div>
                
                <TabsList className="grid grid-cols-1 h-auto gap-2">
                  <TabsTrigger 
                    value="web-account" 
                    onClick={() => setActiveTab("web-account")}
                    className={`flex justify-start gap-3 items-center ${activeTab === "web-account" ? "bg-lafftale-gold/20" : ""}`}
                  >
                    <Settings size={18} /> Web Account Settings
                  </TabsTrigger>
                  <TabsTrigger 
                    value="game-accounts" 
                    onClick={() => setActiveTab("game-accounts")}
                    className={`flex justify-start gap-3 items-center ${activeTab === "game-accounts" ? "bg-lafftale-gold/20" : ""}`}
                  >
                    <Shield size={18} /> Game Accounts
                  </TabsTrigger>
                  <TabsTrigger 
                    value="characters" 
                    onClick={() => setActiveTab("characters")}
                    className={`flex justify-start gap-3 items-center ${activeTab === "characters" ? "bg-lafftale-gold/20" : ""}`}
                  >
                    <User size={18} /> Character Overview
                  </TabsTrigger>
                </TabsList>
                
                <div className="mt-6 pt-6 border-t border-lafftale-gold/20">
                  <p className="text-sm text-gray-400 mb-2">Last login: {mockUserData.lastLogin}</p>
                  <p className="text-sm text-gray-400">Member since: {mockUserData.registeredAt}</p>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full mt-6 text-red-500 border-red-500 hover:bg-red-500/20">
                        Delete Web Account
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
              </div>
            </div>
            
            <div className="lg:col-span-9">
              <div className="card min-h-[600px]">
                <Tabs value={activeTab} className="w-full">
                  <TabsContent value="web-account" className="mt-0">
                    <AccountWebSettings userData={mockUserData} />
                  </TabsContent>
                  
                  <TabsContent value="game-accounts" className="mt-0">
                    <GameAccountManager gameAccounts={mockGameAccounts} />
                  </TabsContent>
                  
                  <TabsContent value="characters" className="mt-0">
                    <CharacterOverview gameAccounts={mockGameAccounts} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Account;
