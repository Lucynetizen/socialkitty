"use server";

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function searchContent(query: string) {
  try {
    auth();
    
    if (!query) {
      throw new Error('Search query is required');
    }
    
    // Search for posts
    const posts = await prisma.post.findMany({
      where: {
        content: {
          contains: query,
          mode: 'insensitive',
        },
      },
      include: {
        author: {
          select: {
            username: true,
            image: true,
          },
        },
      },
      take: 10,
    });
    
    // Search for users
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { username: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        username: true,
        image: true,
      },
      take: 5,
    });
    
    // Search for groups
    const groups = await prisma.group.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        image: true,
      },
      take: 5,
    });
    
    // Format results
    const formattedUsers = users.map(user => ({
      id: user.id,
      type: 'user' as const,
      username: user.username,
      image: user.image || undefined,
    }));
    
    const formattedPosts = posts.map(post => ({
      id: post.id,
      type: 'post' as const,
      content: post.content || undefined,  
      authorUsername: post.author.username,
      authorImage: post.author.image || undefined,  
    }));
    
    const formattedGroups = groups.map(group => ({
      id: group.id,
      type: 'group' as const,
      name: group.name,
      image: group.image || undefined,
    }));
    
    return [...formattedUsers, ...formattedPosts, ...formattedGroups];
  } catch (error) {
    console.error('Search error:', error);
    throw new Error('Failed to search content');
  }
}