import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { weburl } from "@/lib/api";

const VerifyEmail = () => {
  const { token } = useParams<{ token: string }>();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(`${weburl}/api/auth/verify-email/${token}`, {
          method: "GET",
        });

        if (response.ok) {
          setIsVerified(true);
          toast({
            title: "E-Mail bestätigt",
            description: "Ihre E-Mail-Adresse wurde erfolgreich bestätigt.",
          });
          // Optional: Nach erfolgreicher Bestätigung zur Login-Seite weiterleiten
          setTimeout(() => navigate("/login"), 3000);
        } else {
          toast({
            title: "Fehler bei der Bestätigung",
            description: "Der Bestätigungslink ist ungültig oder abgelaufen.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Email verification error:", error);
        toast({
          title: "Netzwerkfehler",
          description: "Bei der Bestätigung Ihrer E-Mail-Adresse ist ein Fehler aufgetreten.",
          variant: "destructive",
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [token, toast, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-login-bg bg-cover bg-center">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-md mx-auto">
            <div className="card backdrop-blur-sm border-silkroad-gold/30">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">E-Mail-Bestätigung</h1>
                {isVerifying ? (
                  <p className="text-gray-400 mt-2">
                    Ihre E-Mail-Adresse wird überprüft...
                  </p>
                ) : isVerified ? (
                  <p className="text-gray-400 mt-2">
                    Ihre E-Mail-Adresse wurde erfolgreich bestätigt.
                  </p>
                ) : (
                  <p className="text-gray-400 mt-2">
                    Der Bestätigungslink ist ungültig oder abgelaufen.
                  </p>
                )}
              </div>

              <div className="text-center">
                {isVerifying ? (
                  <div className="loader"></div>
                ) : isVerified ? (
                  <div>
                    <p className="mb-6 text-gray-300">
                      Vielen Dank für die Bestätigung Ihrer E-Mail-Adresse. Sie können sich jetzt anmelden.
                    </p>
                    <Link to="/login">
                      <Button className="btn-primary w-full">Zum Login</Button>
                    </Link>
                  </div>
                ) : (
                  <div>
                    <p className="mb-6 text-gray-300">
                      Dieser Bestätigungslink ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen Link an.
                    </p>
                    <Link to="/resend-verification">
                      <Button className="btn-primary w-full">Neuen Link anfordern</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VerifyEmail;
