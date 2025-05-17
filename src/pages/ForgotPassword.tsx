import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { weburl } from "@/lib/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${weburl}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        toast({
          title: "E-Mail gesendet",
          description: "Eine E-Mail mit Anweisungen zum Zurücksetzen Ihres Passworts wurde gesendet.",
        });
      } else {
        const data = await response.json();
        toast({
          title: "Fehler",
          description: data?.message || "Beim Versenden der E-Mail ist ein Fehler aufgetreten.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Forgot password error:", error);
      toast({
        title: "Netzwerkfehler",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-login-bg bg-cover bg-center">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-md mx-auto">
            <div className="card backdrop-blur-sm border-silkroad-gold/30">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">Passwort vergessen</h1>
                <p className="text-gray-400 mt-2">
                  {isSubmitted 
                    ? "Überprüfen Sie Ihre E-Mail für den Passwort-Reset-Link" 
                    : "Geben Sie Ihre E-Mail-Adresse ein, um das Passwort zurückzusetzen"}
                </p>
              </div>

              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-Mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Geben Sie Ihre registrierte E-Mail-Adresse ein"
                      required
                      className="bg-silkroad-dark/70 border-silkroad-gold/20 focus:border-silkroad-gold"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="btn-primary w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Senden..." : "Passwort zurücksetzen"}
                  </Button>
                </form>
              ) : (
                <div className="text-center">
                  <p className="mb-6 text-gray-300">
                    Wir haben Ihnen eine E-Mail mit einem Link zum Zurücksetzen Ihres Passworts gesendet. 
                    Bitte überprüfen Sie Ihren Posteingang und Spam-Ordner.
                  </p>
                  <Button
                    className="btn-primary w-full"
                    onClick={() => setIsSubmitted(false)}
                  >
                    Erneut senden
                  </Button>
                </div>
              )}

              <div className="mt-6 text-center">
                <p className="text-gray-400">
                  <Link to="/login" className="text-silkroad-gold hover:underline">
                    Zurück zum Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
