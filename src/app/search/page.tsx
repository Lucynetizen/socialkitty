// app/search/page.tsx - This is your server component
import { Suspense } from 'react';
import SearchClient from '@/components/SearchClient';

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchClient />
    </Suspense>
  );
}

function SearchFallback() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Search
        </h1>
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </main>
    </div>
  );
}