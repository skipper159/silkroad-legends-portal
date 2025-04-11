import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  token: string | null;
  login: (token: string, isAdmin: boolean) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedIsAdmin = localStorage.getItem("isAdmin") === "true";
    
    if (savedToken) {
      setToken(savedToken);
      setIsAdmin(savedIsAdmin);
    }
  }, []);

  const login = (newToken: string, adminStatus: boolean) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("isAdmin", adminStatus ? "true" : "false");
    setToken(newToken);
    setIsAdmin(adminStatus);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    setToken(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ 
      token, 
      login, 
      logout, 
      isAuthenticated: !!token,
      isAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
