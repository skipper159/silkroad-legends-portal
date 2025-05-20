import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { weburl } from "@/lib/api";

const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Validierung des Tokens beim Laden der Seite
  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await fetch(`${weburl}/api/auth/verify-reset-token/${token}`, {
          method: "GET",
        });

        if (!response.ok) {
          setIsValidToken(false);
          toast({
            title: "Invalid or expired link",
            description: "This password reset link is invalid or expired.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Token validation error:", error);
        setIsValidToken(false);
        toast({
          title: "Validation Error",
          description: "The password reset link could not be validated.",
          variant: "destructive",
        });
      }
    };

    validateToken();
  }, [token, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {      toast({
        title: "Passwords do not match",
        description: "Please make sure the passwords match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${weburl}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (response.ok) {
        setIsSubmitted(true);        toast({
          title: "Password reset",
          description: "Your password has been successfully reset.",
        });
        setTimeout(() => navigate("/login"), 3000);
      } else {
        const data = await response.json();        toast({
          title: "Reset error",
          description: data?.message || "Your password could not be reset.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Reset password error:", error);      toast({
        title: "Network error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow bg-login-bg bg-cover bg-center">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-md mx-auto">
              <div className="card backdrop-blur-sm border-silkroad-gold/30">                <div className="text-center p-6">
                  <h1 className="text-3xl font-bold text-destructive">Invalid Link</h1>
                  <p className="text-gray-400 mt-4 mb-6">
                    This password reset link is invalid or expired.
                  </p>
                  <Link to="/forgot-password">
                    <Button className="btn-primary">Request New Reset Link</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-login-bg bg-cover bg-center">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-md mx-auto">
            <div className="card backdrop-blur-sm border-silkroad-gold/30">
              <div className="text-center mb-8">                <h1 className="text-3xl font-bold">Reset Password</h1>
                <p className="text-gray-400 mt-2">
                  {isSubmitted 
                    ? "Password successfully reset" 
                    : "Enter your new password"}
                </p>
              </div>

              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">                    <Label htmlFor="password">New Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter a new password"
                      required
                      className="bg-silkroad-dark/70 border-silkroad-gold/20 focus:border-silkroad-gold"
                    />
                  </div>

                  <div className="space-y-2">                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      required
                      className="bg-silkroad-dark/70 border-silkroad-gold/20 focus:border-silkroad-gold"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="btn-primary w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Resetting..." : "Reset Password"}
                  </Button>
                </form>
              ) : (
                <div className="text-center">                  <p className="mb-6 text-gray-300">
                    Your password has been successfully reset. You will be redirected to the login page shortly.
                  </p>
                  <Link to="/login">
                    <Button className="btn-primary w-full">Go to Login</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;
