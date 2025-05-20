import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  placeholder?: string;
}

const SearchBar = ({ searchTerm, setSearchTerm, placeholder = "Search by username..." }: SearchBarProps) => {
  return (
    <div className="relative mb-4">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="w-4 h-4 text-lafftale-gold" />
      </div>
      <Input
        type="text"
        className="pl-10 bg-lafftale-dark text-gray-300 border-lafftale-gold/30 focus:border-lafftale-gold focus:ring-lafftale-gold/30 focus-visible:ring-0 focus-visible:ring-offset-0"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
