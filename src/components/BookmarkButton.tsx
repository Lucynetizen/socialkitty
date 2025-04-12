"use client";

import { toggleBookmark } from "@/actions/bookmark.action";
import { Button } from "@/components/ui/button";
import { BookmarkIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface BookmarkButtonProps {
  postId: string;
  isBookmarked: boolean;
  bookmarkCount: number;
}

export default function BookmarkButton({
  postId,
  isBookmarked,
  bookmarkCount,
}: BookmarkButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasBookmarked, setHasBookmarked] = useState(isBookmarked);
  const [optimisticCount, setOptimisticCount] = useState(bookmarkCount);

  const handleBookmark = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setHasBookmarked((prev) => !prev);
      setOptimisticCount((prev) => prev + (hasBookmarked ? -1 : 1));
      
      await toggleBookmark(postId);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      setHasBookmarked(isBookmarked);
      setOptimisticCount(bookmarkCount);
      toast.error("Failed to bookmark post");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`text-muted-foreground gap-2 ${
        hasBookmarked ? "text-yellow-500 hover:text-yellow-600" : "hover:text-yellow-500"
      }`}
      onClick={handleBookmark}
      disabled={isLoading}
    >
      {hasBookmarked ? (
        <BookmarkIcon className="size-5 fill-current" />
      ) : (
        <BookmarkIcon className="size-5" />
      )}
      <span>{optimisticCount}</span>
    </Button>
  );
}