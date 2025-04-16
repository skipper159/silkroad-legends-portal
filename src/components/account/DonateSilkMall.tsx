import { useState, useEffect } from "react";
import { fetchWithAuth, weburl } from "@/lib/api";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bitcoin, CreditCard, DollarSign, Coins } from "lucide-react";

const silkPackages = [
  { id: 1, price: 5, amount: 300, bonus: 0, description: "Basic Pack" },
  { id: 2, price: 10, amount: 600, bonus: 0, description: "Standard Pack" },
  { id: 3, price: 15, amount: 900, bonus: 150, description: "Value Pack" },
  { id: 4, price: 25, amount: 1500, bonus: 250, description: "Premium Pack" },
  { id: 5, price: 50, amount: 3000, bonus: 600, description: "Ultimate Pack" },
];

const DonateSilkMall = () => {
  const [selectedPackage, setSelectedPackage] = useState<string>("1");
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [selectedGameAccount, setSelectedGameAccount] = useState<string | null>(null);
  const [gameAccounts, setGameAccounts] = useState<{ id: number; username: string }[]>([]);

  useEffect(() => {
    const fetchGameAccounts = async () => {
      try {
        const response = await fetchWithAuth(`${weburl}/api/gameaccount/my`);
        if (!response.ok) {
          throw new Error("Failed to fetch game accounts");
        }
        const data = await response.json();
        setGameAccounts(data.map((account: any) => ({ id: account.JID, username: account.StrUserID })));
      } catch (error) {
        console.error("Error fetching game accounts:", error);
      }
    };

    fetchGameAccounts();
  }, []);

  const handlePackageChange = (value: string) => {
    setSelectedPackage(value);
  };

  const selectPaymentMethod = (method: string) => {
    setPaymentMethod(method);
  };

  const handleGameAccountChange = (value: string) => {
    setSelectedGameAccount(value);
  };

  const selectedPack = silkPackages.find(pack => pack.id.toString() === selectedPackage);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold font-cinzel text-lafftale-gold">Silk Mall</h3>
        <div className="flex items-center gap-2">
          <Coins size={20} className="text-lafftale-gold" />
          <span className="text-gray-300">Get premium currency for special items and features</span>
        </div>
      </div>

      <div className="mb-6">
        <Card className="bg-lafftale-darkgray border border-lafftale-gold/30">
          <CardHeader>
            <CardTitle className="text-lafftale-gold font-cinzel text-xl">Select Game Account</CardTitle>
            <CardDescription>Choose the game account to credit Silk</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedGameAccount} onValueChange={handleGameAccountChange}>
              <SelectTrigger className="w-full bg-lafftale-dark border-lafftale-gold/30">
                <SelectValue placeholder="Select a game account" />
              </SelectTrigger>
              <SelectContent className="bg-lafftale-darkgray border-lafftale-gold/30">
                {gameAccounts.map(account => (
                  <SelectItem key={account.id} value={account.id.toString()}>
                    {account.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Package Selection */}
        <div>
          <Card className="bg-lafftale-darkgray border border-lafftale-gold/30">
            <CardHeader>
              <CardTitle className="text-lafftale-gold font-cinzel text-xl">Select Silk Package</CardTitle>
              <CardDescription>Choose the amount of Silk you wish to purchase</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedPackage} onValueChange={handlePackageChange}>
                <SelectTrigger className="w-full bg-lafftale-dark border-lafftale-gold/30">
                  <SelectValue placeholder="Select a package" />
                </SelectTrigger>
                <SelectContent className="bg-lafftale-darkgray border-lafftale-gold/30">
                  {silkPackages.map(pack => (
                    <SelectItem key={pack.id} value={pack.id.toString()}>
                      ${pack.price} - {pack.amount} Silk {pack.bonus > 0 ? `+ ${pack.bonus} Bonus` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="mt-6 p-4 bg-lafftale-gold/10 rounded-lg border border-lafftale-gold/30">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Price:</span>
                  <span className="text-white font-bold">${selectedPack?.price}.00</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Silk Amount:</span>
                  <span className="text-lafftale-gold font-bold">{selectedPack?.amount}</span>
                </div>
                {selectedPack?.bonus ? (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Bonus Silk:</span>
                    <span className="text-green-400 font-bold">+{selectedPack?.bonus}</span>
                  </div>
                ) : null}
                
                {selectedPack?.bonus ? (
                  <div className="mt-3 pt-3 border-t border-lafftale-gold/20 flex justify-between items-center">
                    <span className="text-gray-300">Total:</span>
                    <span className="text-white font-bold">{selectedPack?.amount + selectedPack?.bonus} Silk</span>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Payment Methods */}
        <div>
          <Card className="bg-lafftale-darkgray border border-lafftale-gold/30">
            <CardHeader>
              <CardTitle className="text-lafftale-gold font-cinzel text-xl">Payment Method</CardTitle>
              <CardDescription>Select your preferred payment option</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <Button 
                  variant="outline" 
                  className={`flex justify-between items-center h-16 ${paymentMethod === 'paypal' ? 'bg-lafftale-gold/20 border-lafftale-gold' : 'bg-lafftale-dark border-lafftale-gold/30'}`} 
                  onClick={() => selectPaymentMethod('paypal')}
                >
                  <span className="text-white font-semibold">PayPal</span>
                  <div className="w-8 h-8 rounded-full bg-[#003087] flex items-center justify-center">
                    <span className="text-white font-bold text-sm">P</span>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className={`flex justify-between items-center h-16 ${paymentMethod === 'paysafecard' ? 'bg-lafftale-gold/20 border-lafftale-gold' : 'bg-lafftale-dark border-lafftale-gold/30'}`}
                  onClick={() => selectPaymentMethod('paysafecard')}
                >
                  <span className="text-white font-semibold">Paysafecard</span>
                  <div className="w-8 h-8 rounded-full bg-[#d8ae00] flex items-center justify-center">
                    <CreditCard size={16} className="text-white" />
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className={`flex justify-between items-center h-16 ${paymentMethod === 'crypto' ? 'bg-lafftale-gold/20 border-lafftale-gold' : 'bg-lafftale-dark border-lafftale-gold/30'}`}
                  onClick={() => selectPaymentMethod('crypto')}
                >
                  <span className="text-white font-semibold">Cryptocurrency (BTC/ETH)</span>
                  <Bitcoin size={20} className="text-white" />
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-3">
              <Button className="btn-primary w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700">
                <Coins className="mr-2" size={20} /> Purchase Silk
              </Button>
              <p className="text-center text-xs text-gray-400">Silk will be credited to your account immediately after successful payment.</p>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-lafftale-darkgray/50 border border-lafftale-gold/20 rounded-md text-center">
        <p className="text-sm text-amber-300">
          <DollarSign className="inline-block mr-1" size={14} />
          All transactions are secure and processed instantly. For any issues, please contact support.
        </p>
      </div>
    </div>
  );
};

export default DonateSilkMall;