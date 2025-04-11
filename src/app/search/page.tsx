"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Users, FileText, Group } from 'lucide-react';
import { searchContent } from '@/actions/search.action';
import Link from 'next/link';

type SearchResult = {
  id: string;
  type: 'post' | 'user' | 'group';
  content?: string;
  username?: string;
  authorUsername?: string;
  authorImage?: string;
  name?: string;
  image?: string;
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
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

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'user') {
      router.push(`/profile/${result.username}`);
    } else if (result.type === 'post') {
      router.push(`/post/${result.id}`);
    } else if (result.type === 'group') {
      router.push(`/groups/${result.id}`);
    }
  };

  const renderResultIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'post':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'group':
        return <Group className="h-5 w-5 text-purple-500" />;
      default:
        return <Search className="h-5 w-5 text-gray-500" />;
    }
  };

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
          <div className="space-y-4">
            {results.map((result) => (
              <div 
                key={result.id}
                className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleResultClick(result)}
              >
                {result.type === 'user' && (
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full mr-3 overflow-hidden bg-gray-200 flex items-center justify-center">
                      {result.image ? (
                        <img src={result.image} alt={result.username} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-medium">{result.username?.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{result.username}</h3>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {renderResultIcon(result.type)}
                        <span className="ml-1">User</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {result.type === 'post' && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-300 line-clamp-2">{result.content}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {renderResultIcon(result.type)}
                      <span className="ml-1">Post by {result.authorUsername}</span>
                    </div>
                  </div>
                )}
                
                {result.type === 'group' && (
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full mr-3 overflow-hidden bg-purple-100 flex items-center justify-center">
                      {result.image ? (
                        <img src={result.image} alt={result.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-medium">{result.name?.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{result.name}</h3>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {renderResultIcon(result.type)}
                        <span className="ml-1">Group</span>
                      </div>
                    </div>
                  </div>
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
              Enter a search term to find users, posts or groups
            </p>
          </div>
        )}
      </main>
    </div>
  );
}