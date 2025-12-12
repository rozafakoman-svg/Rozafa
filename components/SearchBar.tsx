import React, { useState } from 'react';
import { Search, Loader2 } from './Icons';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-12">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-6 w-6 text-albanian-red animate-spin" />
          ) : (
            <Search className="h-6 w-6 text-gray-400 group-focus-within:text-albanian-red transition-colors" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="block w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent shadow-lg rounded-2xl text-lg sm:text-xl placeholder-gray-400 focus:outline-none focus:border-albanian-red/30 focus:ring-4 focus:ring-albanian-red/10 transition-all duration-300"
          placeholder="Search for a word (Geg, Standard, or English)..."
          disabled={isLoading}
        />
        <button 
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute inset-y-2 right-2 px-6 bg-albanian-red text-white rounded-xl font-medium hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Search
        </button>
      </form>
      <div className="mt-3 flex gap-2 justify-center text-sm text-gray-500">
        <span>Try:</span>
        <button onClick={() => onSearch("bujrum")} className="hover:text-albanian-red underline decoration-dotted">bujrum</button>
        <button onClick={() => onSearch("shpi")} className="hover:text-albanian-red underline decoration-dotted">shpi</button>
        <button onClick={() => onSearch("njeri")} className="hover:text-albanian-red underline decoration-dotted">njeri</button>
      </div>
    </div>
  );
};

export default SearchBar;