import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { weburl } from "@/lib/api";
import SearchBar from "./SearchBar";

interface WebAccount {
    Id: number;
    Username: string;
    Email: string;
    RegisteredAt: string;
    LastLogin: string;
}

const WebAccountsList = () => {
    const [accounts, setAccounts] = useState<WebAccount[]>([]);
    const [filteredAccounts, setFilteredAccounts] = useState<WebAccount[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const res = await fetch(`${weburl}/api/admin/webaccounts`);
                if (!res.ok) throw new Error("Failed to fetch accounts");
                const data = await res.json();
                setAccounts(data);
                setFilteredAccounts(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAccounts();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            const lowercaseSearch = searchTerm.toLowerCase();
            setFilteredAccounts(
                accounts.filter(
                    (account) =>
                        account.Username.toLowerCase().includes(
                            lowercaseSearch
                        ) ||
                        account.Email.toLowerCase().includes(lowercaseSearch)
                )
            );
        } else {
            setFilteredAccounts(accounts);
        }
    }, [searchTerm, accounts]);
    if (loading) {
        return (
            <div className="flex justify-center py-10 text-lafftale-gold">
                <Loader2 className="animate-spin mr-2" />
                Loading...
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 text-center py-4">Error: {error}</div>
        );
    }

    return (
        <>
            <SearchBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                placeholder="Search by username or email..."
            />
            <Card className="overflow-x-auto border-lafftale-gold/30">
                <table className="min-w-full text-left text-sm text-gray-300">
                    {" "}
                    <thead className="bg-lafftale-darkgray text-lafftale-gold uppercase">
                        <tr>
                            {" "}
                            <th className="p-3">ID</th>
                            <th className="p-3">Username</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Registered</th>
                            <th className="p-3">Last Login</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAccounts.length > 0 ? (
                            filteredAccounts.map((acc) => (
                                <tr
                                    key={acc.Id}
                                    className="border-b border-lafftale-gold/30 hover:bg-lafftale-dark/20"
                                >
                                    <td className="p-3">{acc.Id}</td>
                                    <td className="p-3">{acc.Username}</td>
                                    <td className="p-3">{acc.Email}</td>
                                    <td className="p-3">
                                        {new Date(
                                            acc.RegisteredAt
                                        ).toLocaleString()}
                                    </td>
                                    <td className="p-3">
                                        {new Date(
                                            acc.LastLogin
                                        ).toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="p-4 text-center text-gray-400"
                                >
                                    No results found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>
        </>
    );
};

export default WebAccountsList;
