
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const PasswordChange = () => {
  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">Change Password</h3>
      <form className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input 
            id="currentPassword" 
            type="password" 
            placeholder="Enter your current password"
            className="bg-lafftale-dark/70 border-lafftale-gold/20 focus:border-lafftale-gold" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input 
            id="newPassword" 
            type="password" 
            placeholder="Enter your new password"
            className="bg-lafftale-dark/70 border-lafftale-gold/20 focus:border-lafftale-gold" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input 
            id="confirmPassword" 
            type="password" 
            placeholder="Confirm your new password"
            className="bg-lafftale-dark/70 border-lafftale-gold/20 focus:border-lafftale-gold" 
          />
        </div>
        <Button className="btn-primary">Update Password</Button>
      </form>
    </div>
  );
};

export default PasswordChange;
