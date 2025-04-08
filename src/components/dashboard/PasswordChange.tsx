
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const PasswordChange = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic form validation
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all password fields.",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation don't match.",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "New password must be at least 8 characters long.",
        variant: "destructive"
      });
      return;
    }
    
    // Here you would connect to your Node.js backend API
    setIsLoading(true);
    
    try {
      // Simulating API call to the Node.js backend
      // In real implementation, this would be:
      // await fetch('/api/users/password', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     currentPassword: formData.currentPassword,
      //     newPassword: formData.newPassword
      //   })
      // });
      
      // Simulated delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed.",
      });
      
      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was an error updating your password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">Change Password</h3>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input 
            id="currentPassword" 
            type="password" 
            placeholder="Enter your current password"
            className="bg-lafftale-dark/70 border-lafftale-gold/20 focus:border-lafftale-gold" 
            value={formData.currentPassword}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input 
            id="newPassword" 
            type="password" 
            placeholder="Enter your new password"
            className="bg-lafftale-dark/70 border-lafftale-gold/20 focus:border-lafftale-gold" 
            value={formData.newPassword}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input 
            id="confirmPassword" 
            type="password" 
            placeholder="Confirm your new password"
            className="bg-lafftale-dark/70 border-lafftale-gold/20 focus:border-lafftale-gold" 
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        <Button 
          className="btn-primary"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </div>
  );
};

export default PasswordChange;
