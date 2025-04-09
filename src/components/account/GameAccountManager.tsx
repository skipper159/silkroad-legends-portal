
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface GameAccount {
  id: number;
  username: string;
  created: string;
  lastLogin: string;
  characters: any[];
}

interface GameAccountManagerProps {
  gameAccounts: GameAccount[];
}

const GameAccountManager = ({ gameAccounts }: GameAccountManagerProps) => {
  const [selectedAccount, setSelectedAccount] = useState<GameAccount | null>(
    gameAccounts.length > 0 ? gameAccounts[0] : null
  );
  const [newGameUsername, setNewGameUsername] = useState("");
  const [newGamePassword, setNewGamePassword] = useState("");
  const [confirmGamePassword, setConfirmGamePassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();

  const handleCreateGameAccount = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newGamePassword !== confirmGamePassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (newGamePassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      });
      return;
    }

    // Mock API call - will be replaced with actual API call later
    toast({
      title: "Game Account Created",
      description: `Game account "${newGameUsername}" has been successfully created`,
    });
    
    setNewGameUsername("");
    setNewGamePassword("");
    setConfirmGamePassword("");
  };

  const handleChangeGamePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAccount) {
      toast({
        title: "No Account Selected",
        description: "Please select a game account",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "New password must be at least 8 characters long",
        variant: "destructive"
      });
      return;
    }

    // Mock API call - will be replaced with actual API call later
    toast({
      title: "Game Password Updated",
      description: `Password for "${selectedAccount.username}" has been changed`,
    });
    
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleDeleteGameAccount = () => {
    if (!selectedAccount) return;
    
    // Mock API call - will be replaced with actual API call later
    toast({
      title: "Game Account Deleted",
      description: `Game account "${selectedAccount.username}" has been deleted`,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold font-cinzel text-lafftale-gold mb-6">Game Account Management</h2>
        
        <Card className="bg-lafftale-darkgray border-lafftale-gold/30">
          <CardHeader>
            <CardTitle className="text-lafftale-gold">Create New Game Account</CardTitle>
            <CardDescription>Add a new game account to your web account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateGameAccount} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="game-username">Game Account Username</Label>
                <Input
                  id="game-username"
                  value={newGameUsername}
                  onChange={(e) => setNewGameUsername(e.target.value)}
                  className="bg-lafftale-dark/70 border-lafftale-gold/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="game-password">Game Account Password</Label>
                <Input
                  id="game-password"
                  type="password"
                  value={newGamePassword}
                  onChange={(e) => setNewGamePassword(e.target.value)}
                  className="bg-lafftale-dark/70 border-lafftale-gold/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-game-password">Confirm Game Account Password</Label>
                <Input
                  id="confirm-game-password"
                  type="password"
                  value={confirmGamePassword}
                  onChange={(e) => setConfirmGamePassword(e.target.value)}
                  className="bg-lafftale-dark/70 border-lafftale-gold/20"
                  required
                />
              </div>
              <Button 
                type="submit"
                className="bg-lafftale-gold hover:bg-amber-500 text-lafftale-dark"
              >
                Create Game Account
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {gameAccounts.length > 0 && (
        <Card className="bg-lafftale-darkgray border-lafftale-gold/30">
          <CardHeader>
            <CardTitle className="text-lafftale-gold">Manage Game Accounts</CardTitle>
            <CardDescription>Manage your existing game accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="select-account">Select Game Account</Label>
                <Select
                  value={selectedAccount ? String(selectedAccount.id) : ""}
                  onValueChange={(value) => {
                    const account = gameAccounts.find(acc => acc.id === parseInt(value));
                    setSelectedAccount(account || null);
                  }}
                >
                  <SelectTrigger className="bg-lafftale-dark/70 border-lafftale-gold/20">
                    <SelectValue placeholder="Select a game account" />
                  </SelectTrigger>
                  <SelectContent className="bg-lafftale-darkgray border-lafftale-gold/20">
                    {gameAccounts.map(account => (
                      <SelectItem key={account.id} value={String(account.id)}>
                        {account.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedAccount && (
                <div className="p-4 bg-lafftale-dark/50 rounded-lg border border-lafftale-gold/20">
                  <h4 className="font-bold text-lafftale-gold mb-2">{selectedAccount.username}</h4>
                  <p className="text-sm text-gray-400">Created: {selectedAccount.created}</p>
                  <p className="text-sm text-gray-400">Last Login: {selectedAccount.lastLogin}</p>
                  <p className="text-sm text-gray-400 mt-2">Characters: {selectedAccount.characters.length}</p>
                  
                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="border-lafftale-gold/30 text-lafftale-gold hover:bg-lafftale-gold/20">
                          Change Password
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-lafftale-darkgray border-lafftale-gold">
                        <DialogHeader>
                          <DialogTitle className="text-lafftale-gold">Change Game Account Password</DialogTitle>
                          <DialogDescription>
                            Update the password for game account "{selectedAccount.username}"
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleChangeGamePassword} className="space-y-4 mt-2">
                          <div className="space-y-2">
                            <Label htmlFor="current-game-password">Current Password</Label>
                            <Input
                              id="current-game-password"
                              type="password"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="bg-lafftale-dark/70 border-lafftale-gold/20"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-game-password">New Password</Label>
                            <Input
                              id="new-game-password"
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="bg-lafftale-dark/70 border-lafftale-gold/20"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm-new-game-password">Confirm New Password</Label>
                            <Input
                              id="confirm-new-game-password"
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="bg-lafftale-dark/70 border-lafftale-gold/20"
                              required
                            />
                          </div>
                          <DialogFooter>
                            <Button 
                              type="submit"
                              className="bg-lafftale-gold hover:bg-amber-500 text-lafftale-dark"
                            >
                              Update Password
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                    
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
                            Are you sure you want to delete the game account "{selectedAccount.username}"?
                            All characters and items will be permanently lost.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-lafftale-darkgray border-lafftale-gold text-lafftale-gold hover:bg-lafftale-darkgray/50">
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
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GameAccountManager;
