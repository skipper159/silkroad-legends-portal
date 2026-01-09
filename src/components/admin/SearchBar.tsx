import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSearch?: () => void;
  placeholder?: string;
}

const SearchBar = ({ searchTerm, setSearchTerm, onSearch, placeholder = 'Search by username...' }: SearchBarProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  return (
    <div className='flex gap-2 mb-4'>
      <div className='relative flex-1'>
        <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
          <Search className='w-4 h-4 text-theme-primary' />
        </div>
        <Input
          type='text'
          className='pl-10 bg-theme-background text-theme-text border-theme-border focus:border-theme-primary focus:ring-theme-primary/30 focus-visible:ring-0 focus-visible:ring-offset-0'
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      {onSearch && (
        <button
          onClick={onSearch}
          className='px-4 py-2 bg-theme-primary text-theme-text-on-primary font-medium rounded-md hover:bg-theme-primary/90 transition-colors flex items-center gap-2'
        >
          <Search className='w-4 h-4' />
          Search
        </button>
      )}
    </div>
  );
};

export default SearchBar;
