"use client";

import { useEffect, useState } from "react";
import PostCard from "@/components/PostCard";
import { useUser } from "@clerk/nextjs";
import { Post } from "@prisma/client";
import { getUserBookmarks } from "@/actions/post.action";
import { LoaderCircle } from "lucide-react";

export default function BookmarksPage() {
  const { user, isLoaded } = useUser();
  const [bookmarkedPosts, setBookmarkedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookmarks() {
      if (isLoaded && user) {
        try {
          const posts = await getUserBookmarks();
          setBookmarkedPosts(posts || []);
        } catch (error) {
          console.error("Failed to fetch bookmarks:", error);
        } finally {
          setLoading(false);
        }
      }
    }

    fetchBookmarks();
  }, [user, isLoaded]);

  if (!isLoaded || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoaderCircle className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-green-600 via-blue-500 to-pink-500 bg-clip-text text-transparent animate-gradient">Your Bookmarks</h1>
      
      {bookmarkedPosts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xl text-gray-500 dark:text-gray-400">
            You haven't bookmarked any posts yet.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookmarkedPosts.map((post) => (
            <PostCard key={post.id} post={post} dbUserId={user?.id ?? null} />
          ))}
        </div>
      )}
    </div>
  );
}