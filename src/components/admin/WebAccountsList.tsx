import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { weburl } from "@/lib/api";

interface WebAccount {
  Id: number;
  Username: string;
  Email: string;
  RegisteredAt: string;
  LastLogin: string;
}

const WebAccountsList = () => {
  const [accounts, setAccounts] = useState<WebAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch(`${weburl}/api/admin/webaccounts`);
        if (!res.ok) throw new Error("Failed to fetch accounts");
        const data = await res.json();
        setAccounts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-10 text-lafftale-gold"><Loader2 className="animate-spin mr-2" />Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">Error: {error}</div>;
  }

  return (
    <Card className="overflow-x-auto">
      <table className="min-w-full text-left text-sm text-gray-300">
        <thead className="bg-lafftale-darkgray text-lafftale-gold uppercase">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">Username</th>
            <th className="p-3">Email</th>
            <th className="p-3">Registered</th>
            <th className="p-3">Last Login</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((acc) => (
            <tr key={acc.Id} className="border-b border-lafftale-gold/10 hover:bg-lafftale-dark/20">
              <td className="p-3">{acc.Id}</td>
              <td className="p-3">{acc.Username}</td>
              <td className="p-3">{acc.Email}</td>
              <td className="p-3">{new Date(acc.RegisteredAt).toLocaleString()}</td>
              <td className="p-3">{new Date(acc.LastLogin).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};

export default WebAccountsList;
