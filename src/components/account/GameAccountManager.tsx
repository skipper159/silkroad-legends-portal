import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth, weburl } from "@/lib/api";

interface GameAccount {
  JID: number;
  StrUserID: string;
  regtime: string;
  reg_ip: string;
  AccPlayTime: number;
}

const GameAccountManager = () => {
  const [gameAccounts, setGameAccounts] = useState<GameAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<GameAccount | null>(null);
  const [newGameUsername, setNewGameUsername] = useState("");
  const [newGamePassword, setNewGamePassword] = useState("");
  const [confirmGamePassword, setConfirmGamePassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();

  const fetchAccounts = async () => {
    try {
      const res = await fetchWithAuth(`${weburl}/api/gameaccount/my`);
      if (!res.ok) throw new Error("Failed to fetch game accounts");
      const data = await res.json();
      setGameAccounts(data);
      setSelectedAccount(data[0] || null);
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load game accounts", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCreateGameAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newGamePassword !== confirmGamePassword) {
      toast({ title: "Mismatch", description: "Passwords do not match", variant: "destructive" });
      return;
    }

    try {
      const res = await fetchWithAuth(`${weburl}/api/gameaccount/create`, {
        method: "POST",
        body: JSON.stringify({ username: newGameUsername, password: newGamePassword })
      });

      if (res.ok) {
        toast({ title: "Created", description: `Account ${newGameUsername} created` });
        setNewGameUsername("");
        setNewGamePassword("");
        setConfirmGamePassword("");
        fetchAccounts();
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data?.error || "Failed to create", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Network Error", description: err.message, variant: "destructive" });
    }
  };

  const handleChangeGamePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAccount) return;

    if (newPassword !== confirmPassword) {
      toast({ title: "Mismatch", description: "Passwords do not match", variant: "destructive" });
      return;
    }

    try {
      const res = await fetchWithAuth(`${weburl}/api/gameaccount/${selectedAccount.JID}/password`, {
        method: "PUT",
        body: JSON.stringify({ oldPassword: currentPassword, newPassword })
      });

      if (res.ok) {
        toast({ title: "Password Changed", description: `Password for ${selectedAccount.StrUserID} updated` });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data?.error || "Update failed", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Network Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteGameAccount = async () => {
    if (!selectedAccount) return;

    try {
      const res = await fetchWithAuth(`${weburl}/api/gameaccount/${selectedAccount.JID}`, {
        method: "DELETE"
      });

      if (res.ok) {
        toast({
          title: "Game Account Deleted",
          description: `Game account \"${selectedAccount.StrUserID}\" has been deleted.`,
        });
        fetchAccounts();
        setSelectedAccount(null);
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data?.error || "Failed to delete account", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Network Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold font-cinzel text-lafftale-gold mb-6">Game Account Management</h2>

      <Card className="bg-lafftale-darkgray border-lafftale-gold/30">
        <CardHeader>
          <CardTitle className="text-lafftale-gold">Create New Game Account</CardTitle>
          <CardDescription>Create a new in-game login</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateGameAccount} className="space-y-4">
            <Label>Username</Label>
            <Input 
                className="bg-lafftale-dark border border-lafftale-gold/20 focus:ring-2 focus:ring-lafftale-gold focus:outline-none"
                value={newGameUsername} 
                onChange={(e) => setNewGameUsername(e.target.value)} 
            />
            <Label>Password</Label>
            <Input 
                className="bg-lafftale-dark border border-lafftale-gold/20 focus:ring-2 focus:ring-lafftale-gold focus:outline-none"
                type="password" 
                value={newGamePassword} 
                onChange={(e) => setNewGamePassword(e.target.value)} 
            />
            <Label>Confirm Password</Label>
            <Input 
                className="bg-lafftale-dark border border-lafftale-gold/20 focus:ring-2 focus:ring-lafftale-gold focus:outline-none"
                type="password" 
                value={confirmGamePassword} 
                onChange={(e) => setConfirmGamePassword(e.target.value)} 
            />
            <Button type="submit" className="bg-lafftale-gold text-lafftale-dark">Create</Button>
          </form>
        </CardContent>
      </Card>

      {gameAccounts.length > 0 && (
        <Card className="bg-lafftale-darkgray border-lafftale-gold/30">
          <CardHeader>
            <CardTitle className="text-lafftale-gold">Manage Existing Accounts</CardTitle>
            <CardDescription>Change password or delete a game account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Label>Select Account</Label>
            <Select value={selectedAccount?.JID.toString()} onValueChange={(jid) => {
              const acc = gameAccounts.find(a => a.JID === parseInt(jid));
              setSelectedAccount(acc || null);
            }}>
              <SelectTrigger className="bg-lafftale-dark border-lafftale-gold/20">
                <SelectValue placeholder="Choose Account" />
              </SelectTrigger>
              <SelectContent className="bg-lafftale-darkgray">
                {gameAccounts.map((acc) => (
                  <SelectItem key={acc.JID} value={acc.JID.toString()}>{acc.StrUserID}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedAccount && (
              <>
                <div className="mt-4 flex flex-col sm:flex-row sm:justify-between gap-3">
               <form onSubmit={handleChangeGamePassword} className="space-y-4 sm:w-1/2">
               <Label>Current Password</Label>
                <Input 
                    className="bg-lafftale-dark border border-lafftale-gold/20 focus:ring-2 focus:ring-lafftale-gold focus:outline-none"
                    type="password" 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)} 
                />
                <Label>New Password</Label>
                <Input 
                    className="bg-lafftale-dark border border-lafftale-gold/20 focus:ring-2 focus:ring-lafftale-gold focus:outline-none"
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                />
                <Label>Confirm New Password</Label>
                <Input 
                    className="bg-lafftale-dark border border-lafftale-gold/20 focus:ring-2 focus:ring-lafftale-gold focus:outline-none"
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                />
                <Button type="submit" className="bg-lafftale-gold text-lafftale-dark">Change Password</Button>
                </form>

                <div className="flex items-end sm:w-1/2 sm:justify-end">
                  <AlertDialog>
                      <AlertDialogTrigger asChild>
                       <Button variant="outline" className="border-red-500/30 text-red-500 hover:bg-red-500/20">
                          Delete Account
                       </Button>
                     </AlertDialogTrigger>
                    <AlertDialogContent className="bg-lafftale-darkgray border-lafftale-gold">
                 <AlertDialogHeader>
            <AlertDialogTitle className="text-lafftale-gold">Delete Game Account</AlertDialogTitle>
              <AlertDialogDescription>
               Are you sure you want to delete the game account "{selectedAccount?.StrUserID}"?
               All characters and progress will be permanently lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
         <AlertDialogFooter>
            <AlertDialogCancel className="bg-lafftale-darkgray text-lafftale-gold border border-lafftale-gold hover:bg-lafftale-darkgray/50">
              Cancel
             </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteGameAccount}
            >
               Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GameAccountManager;
