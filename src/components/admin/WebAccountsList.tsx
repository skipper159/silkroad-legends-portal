
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";

// Mock data for web accounts with admin role (RoleId = 3)
const mockWebAccounts = [
  { id: 1, username: "AdminUser", email: "admin@example.com", registeredAt: "2024-12-15T10:30:00" },
  { id: 2, username: "ModeratorPrime", email: "mod@example.com", registeredAt: "2025-01-05T14:22:00" },
  { id: 3, username: "GameMaster42", email: "gm@example.com", registeredAt: "2025-02-20T09:15:00" },
  { id: 4, username: "SupportTeam", email: "support@example.com", registeredAt: "2025-03-10T16:45:00" }
];

const WebAccountsList = () => {
  const [webAccounts] = useState(mockWebAccounts);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${formatDistanceToNow(date, { addSuffix: true })} (${date.toLocaleDateString()})`;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold font-cinzel text-lafftale-gold mb-6">Admin Web Accounts</h2>

      {webAccounts.length > 0 ? (
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="bg-lafftale-dark">
              <TableRow className="border-b border-lafftale-gold/20">
                <TableHead className="text-lafftale-gold">Username</TableHead>
                <TableHead className="text-lafftale-gold">Email</TableHead>
                <TableHead className="text-lafftale-gold">Registration Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webAccounts.map((account) => (
                <TableRow key={account.id} className="border-b border-lafftale-gold/20 hover:bg-lafftale-dark/40">
                  <TableCell className="font-medium">{account.username}</TableCell>
                  <TableCell>{account.email}</TableCell>
                  <TableCell>{formatDate(account.registeredAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center p-8 text-gray-400">
          <p>No admin accounts found.</p>
        </div>
      )}
    </div>
  );
};

export default WebAccountsList;
