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
            title: "Ungültiger oder abgelaufener Link",
            description: "Dieser Passwort-Reset-Link ist ungültig oder abgelaufen.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Token validation error:", error);
        setIsValidToken(false);
        toast({
          title: "Fehler bei der Validierung",
          description: "Der Passwort-Reset-Link konnte nicht validiert werden.",
          variant: "destructive",
        });
      }
    };

    validateToken();
  }, [token, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Passwörter stimmen nicht überein",
        description: "Bitte stellen Sie sicher, dass die Passwörter übereinstimmen.",
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
        setIsSubmitted(true);
        toast({
          title: "Passwort zurückgesetzt",
          description: "Ihr Passwort wurde erfolgreich zurückgesetzt.",
        });
        setTimeout(() => navigate("/login"), 3000);
      } else {
        const data = await response.json();
        toast({
          title: "Fehler beim Zurücksetzen",
          description: data?.message || "Ihr Passwort konnte nicht zurückgesetzt werden.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast({
        title: "Netzwerkfehler",
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
              <div className="card backdrop-blur-sm border-silkroad-gold/30">
                <div className="text-center p-6">
                  <h1 className="text-3xl font-bold text-destructive">Ungültiger Link</h1>
                  <p className="text-gray-400 mt-4 mb-6">
                    Dieser Passwort-Reset-Link ist ungültig oder abgelaufen.
                  </p>
                  <Link to="/forgot-password">
                    <Button className="btn-primary">Neuen Reset-Link anfordern</Button>
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
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">Passwort zurücksetzen</h1>
                <p className="text-gray-400 mt-2">
                  {isSubmitted 
                    ? "Passwort erfolgreich zurückgesetzt" 
                    : "Geben Sie Ihr neues Passwort ein"}
                </p>
              </div>

              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="password">Neues Passwort</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Geben Sie ein neues Passwort ein"
                      required
                      className="bg-silkroad-dark/70 border-silkroad-gold/20 focus:border-silkroad-gold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Bestätigen Sie Ihr neues Passwort"
                      required
                      className="bg-silkroad-dark/70 border-silkroad-gold/20 focus:border-silkroad-gold"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="btn-primary w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Wird zurückgesetzt..." : "Passwort zurücksetzen"}
                  </Button>
                </form>
              ) : (
                <div className="text-center">
                  <p className="mb-6 text-gray-300">
                    Ihr Passwort wurde erfolgreich zurückgesetzt. Sie werden in Kürze zur Login-Seite weitergeleitet.
                  </p>
                  <Link to="/login">
                    <Button className="btn-primary w-full">Zum Login</Button>
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
