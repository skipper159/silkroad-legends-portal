import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

interface User {
  Id: number;
  Username: string;
  Email: string;
  RegisteredAt?: string;
  LastLogin?: string;
}

const Account = () => {
  const { token, logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch user data");

        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) return <div className="p-4">Loading account data...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user?.Username}</h1>
      <div className="space-y-2">
        <p><strong>Email:</strong> {user?.Email}</p>
        <p><strong>Account ID:</strong> {user?.Id}</p>
        {user?.RegisteredAt && <p><strong>Registered:</strong> {user.RegisteredAt}</p>}
        {user?.LastLogin && <p><strong>Last Login:</strong> {user.LastLogin}</p>}
      </div>
      <button onClick={handleLogout} className="mt-6 bg-red-600 text-white px-4 py-2 rounded">
        Logout
      </button>
    </div>
  );
};

export default Account;
