
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import Rankings from "./pages/Rankings";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/rankings" element={<Rankings />} />
          
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
