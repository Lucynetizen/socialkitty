"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { searchContent } from '@/actions/search.action';

type SearchResult = {
  id: string;
  type: 'post' | 'user' | 'comment';
  content?: string;
  username?: string;
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await searchContent(query);
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          {query ? `Search results for "${query}"` : 'Search'}
        </h1>

        {isLoading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-6">
            {results.map((result) => (
              <div 
                key={result.id}
                className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
              >
                {result.type === 'user' ? (
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                      {result.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{result.username}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">User</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-600 dark:text-gray-300">{result.content}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No results found for "{query}"
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Try different keywords or check your spelling
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Enter a search term to find users or posts
            </p>
          </div>
        )}
      </main>
    </div>
  );
}