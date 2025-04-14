import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Ban, TimerReset, Info } from "lucide-react";
import { weburl } from "@/lib/api";

interface GameAccount {
  GameAccountId: number;
  Username: string;
  CharName16: string;
  CharID: number;
  GuildID: number;
  JobType: number;
  JobName: string;
  REG_IP: string;
  RegTime: string;
  AccPlayTime: string;
  IsBanned: boolean;
  TimeoutUntil: string | null;
}

const GameAccountsList = () => {
  const [accounts, setAccounts] = useState<GameAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      const res = await fetch(`${weburl}/api/admin/gameaccounts`);
      if (!res.ok) throw new Error("Failed to fetch game accounts");
      const data = await res.json();
      setAccounts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const banAccount = async (id: number) => {
    await fetch(`${weburl}/api/admin/gameaccounts/${id}/ban`, { method: "PUT" });
    fetchAccounts();
  };

  const timeoutAccount = async (id: number) => {
    await fetch(`${weburl}/api/admin/gameaccounts/${id}/timeout`, { method: "PUT" });
    fetchAccounts();
  };

  useEffect(() => {
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
        <th className="p-3">Char</th>
        <th className="p-3">Guild</th>
        <th className="p-3">Job</th>
        <th className="p-3">REG IP</th>
        <th className="p-3">Reg Time</th>
        <th className="p-3">Play Time</th>
        <th className="p-3">Banned</th>
        <th className="p-3">Timeout</th>
        <th className="p-3 text-center">Aktionen</th>
        </tr>
      </thead>
      <tbody>
        {accounts.map((acc) => (
        <tr key={acc.GameAccountId} className="border-b border-lafftale-gold/10 hover:bg-lafftale-dark/20">
          <td className="p-3">{acc.GameAccountId}</td>
          <td className="p-3">{acc.Username}</td>
          <td className="p-3">{acc.CharName16 || "—"}</td>
          <td className="p-3">{acc.GuildID ?? "—"}</td>
          <td className="p-3">{acc.JobName || acc.JobType}</td>
          <td className="p-3">{acc.REG_IP}</td>
          <td className="p-3">{new Date(acc.RegTime).toLocaleString()}</td>
          <td className="p-3">{acc.AccPlayTime || "—"}</td>
          <td className="p-3">{acc.IsBanned ? "✅" : "❌"}</td>
          <td className="p-3">{acc.TimeoutUntil ? new Date(acc.TimeoutUntil).toLocaleString() : "—"}</td>
          <td className="p-3 flex gap-2 justify-center">
          <Button size="sm" variant="destructive" onClick={() => banAccount(acc.GameAccountId)}>
            <Ban size={16} />
          </Button>
          <Button size="sm" variant="secondary" onClick={() => timeoutAccount(acc.GameAccountId)}>
            <TimerReset size={16} />
          </Button>
          <Button size="sm" variant="outline">
            <Info size={16} />
          </Button>
          </td>
        </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};

export default GameAccountsList;
