import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import Rankings from "./pages/Rankings";
import Download from "./pages/Download";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import ServerInfo from "./pages/ServerInfo";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import ProtectedRoute from "./routes/ProtectedRoute";
import NewsSection from "./components/NewsSection";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/rankings" element={<Rankings />} />
          <Route path="/download" element={<Download />} />
          <Route path="/News" element={<NewsSection />} />
          <Route path="/server-info" element={<ServerInfo />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/account" element={<Account />} />
            <Route path="/AdminDashboard" element={<AdminDashboard />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
