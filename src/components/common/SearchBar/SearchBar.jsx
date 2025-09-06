import React, { useState, useCallback } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Search } from 'lucide-react';
import { useNavigateWithScroll } from '../../../utils/navigation';

export const SearchBar = React.memo(({ 
  placeholder = "Search 50,000+ products from 500+ brands...",
  className = "",
  onSearch,
  showButton = true
}) => {
  const navigate = useNavigateWithScroll();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery.trim());
      } else {
        navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  }, [searchQuery, onSearch, navigate]);

  const handleInputChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  }, [handleSearch]);

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
      <Input
        value={searchQuery}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="pl-12 pr-4 py-3 w-full border-gray-200 rounded-full focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all duration-200"
      />
      {showButton && (
        <Button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full w-8 h-8 p-0"
        >
          <Search className="w-4 h-4" />
        </Button>
      )}
    </form>
  );
});

SearchBar.displayName = 'SearchBar';