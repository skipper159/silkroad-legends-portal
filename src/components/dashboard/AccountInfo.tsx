
import { User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface AccountInfoProps {
  userData: {
    username: string;
    email: string;
    registrationDate: string;
    lastLogin: string;
  }
}

const AccountInfo = ({ userData }: AccountInfoProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold mb-6">Account Information</h3>
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
      
      <Separator className="my-6 bg-lafftale-gold/20" />
      
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
          <Separator className="bg-lafftale-gold/10" />
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
  );
};

export default AccountInfo;
