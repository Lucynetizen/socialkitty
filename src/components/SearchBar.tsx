"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

interface SearchBarProps {
  mobile?: boolean;
  className?: string;
}

const SearchBar = ({ mobile = false, className = '' }: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input when expanded in mobile view
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  // Handle clicks outside to collapse on mobile
  useEffect(() => {
    if (!mobile) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (isExpanded && inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, mobile]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      if (mobile) {
        setIsExpanded(false);
      }
    }
  };

  // Collapsed search icon for mobile
  if (mobile && !isExpanded) {
    return (
      <button 
        onClick={() => setIsExpanded(true)}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Open search"
      >
        <Search size={20} className="text-gray-500 dark:text-gray-400" />
      </button>
    );
  }

  return (
    <form 
      onSubmit={handleSearch} 
      className={`relative flex items-center ${mobile ? 'w-full' : 'w-64'} ${className}`}
    >
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search size={18} className="text-gray-500 dark:text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="search"
          className="w-full py-2 pl-10 pr-4 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {mobile && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => setIsExpanded(false)}
          >
            <span className="text-gray-500 dark:text-gray-400 text-sm">Cancel</span>
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;