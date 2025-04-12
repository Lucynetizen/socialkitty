"use server";

import prisma from "@/lib/prisma";
import { syncUser } from "./user.action";
import { revalidatePath } from "next/cache";

export async function toggleBookmark(postId: string) {
  try {
    const currentUser = await syncUser();
    if (!currentUser) {
      throw new Error("Unauthorized");
    }

    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: currentUser.id,
          postId,
        },
      },
    });

    if (existingBookmark) {
      // Remove bookmark
      await prisma.bookmark.delete({
        where: {
          id: existingBookmark.id,
        },
      });
    } else {
      // Add bookmark
      await prisma.bookmark.create({
        data: {
          userId: currentUser.id,
          postId,
        },
      });
    }

    // Revalidate paths to update UI
    revalidatePath("/");
    revalidatePath("/bookmark");
    revalidatePath(`/post/${postId}`);
    revalidatePath(`/profile/${currentUser.username}`);

    return { success: true };
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    return { success: false, error: "Failed to toggle bookmark" };
  }
}

export async function getBookmarkedPosts() {
  try {
    const currentUser = await syncUser();
    if (!currentUser) {
      throw new Error("Unauthorized");
    }

    const bookmarkedPosts = await prisma.post.findMany({
      where: {
        bookmarks: {
          some: {
            userId: currentUser.id,
          },
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        likes: {
          where: {
            userId: currentUser.id,
          },
          select: {
            userId: true,
          },
        },
        bookmarks: {
          where: {
            userId: currentUser.id,
          },
          select: {
            userId: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            bookmarks: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return bookmarkedPosts;
  } catch (error) {
    console.error("Error fetching bookmarked posts:", error);
    throw error;
  }
}