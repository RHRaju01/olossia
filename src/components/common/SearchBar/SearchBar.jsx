import { useState, useCallback } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Search } from 'lucide-react';
import { useNavigateWithScroll } from '../../../utils/navigation';

export const SearchBar = React.memo(
  ({
    placeholder = 'Search 50,000+ products from 500+ brands...',
    className = '',
    onSearch,
    showButton = true,
  }) => {
    const navigate = useNavigateWithScroll();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = useCallback(
      e => {
        e.preventDefault();
        if (searchQuery.trim()) {
          if (onSearch) {
            onSearch(searchQuery.trim());
          } else {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
          }
        }
      },
      [searchQuery, onSearch, navigate]
    );

    const handleInputChange = useCallback(e => {
      setSearchQuery(e.target.value);
    }, []);

    const handleKeyDown = useCallback(
      e => {
        if (e.key === 'Enter') {
          handleSearch(e);
        }
      },
      [handleSearch]
    );

    return (
      <form onSubmit={handleSearch} className={`relative ${className}`}>
        <Search className='pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400' />
        <Input
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className='w-full rounded-full border-gray-200 py-3 pl-12 pr-4 transition-all duration-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
        />
        {showButton && (
          <Button
            type='submit'
            className='absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 transform rounded-full bg-gradient-to-r from-purple-600 to-pink-600 p-0 text-white hover:from-purple-700 hover:to-pink-700'
          >
            <Search className='h-4 w-4' />
          </Button>
        )}
      </form>
    );
  }
);

SearchBar.displayName = 'SearchBar';
