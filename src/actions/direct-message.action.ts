"use server";

import { getDbUserId } from "./user.action";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getUserChats() {
  try {
    const userId = await getDbUserId();
    if (!userId) return [];
    
    // Get all chats where the user is either sender or receiver
    const chats = await prisma.directChat.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1, // Only get the most recent message for preview
        }
      },
      orderBy: {
        updatedAt: 'desc' // Sort by most recently active
      }
    });
    
    // Format the chats to show the other user, not yourself
    return chats.map(chat => {
      const isUserSender = chat.senderId === userId;
      const otherUser = isUserSender ? chat.receiver : chat.sender;
      
      // Count unread messages
      const unreadCount = chat.messages.filter(
        msg => !msg.read && msg.senderId !== userId
      ).length;
      
      return {
        id: chat.id,
        otherUser,
        lastMessage: chat.messages[0] || null,
        unreadCount,
        updatedAt: chat.updatedAt
      };
    });
  } catch (error) {
    console.error("Error fetching user chats:", error);
    return [];
  }
}

export async function createChat(userId: string) {
  try {
    const currentUserId = await getDbUserId();
    if (!currentUserId) throw new Error("You must be logged in to create a chat");
    
    if (currentUserId === userId) {
      throw new Error("Cannot create a chat with yourself");
    }
    
    // Check if the chat already exists
    const existingChat = await prisma.directChat.findFirst({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: userId },
          { senderId: userId, receiverId: currentUserId }
        ]
      }
    });
    
    if (existingChat) {
      return existingChat.id;
    }
    
    // Create new chat
    const chat = await prisma.directChat.create({
      data: {
        senderId: currentUserId,
        receiverId: userId
      }
    });
    
    return chat.id;
  } catch (error) {
    console.error("Error creating chat:", error);
    throw error;
  }
}

export async function getChatById(chatId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) throw new Error("You must be logged in to view chats");
    
    const chat = await prisma.directChat.findUnique({
      where: { id: chatId },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true
          }
        }
      }
    });
    
    if (!chat) {
      throw new Error("Chat not found");
    }
    
    // Verify the user is part of this chat
    if (chat.senderId !== userId && chat.receiverId !== userId) {
      throw new Error("You don't have permission to view this chat");
    }
    
    // Get the other user in the conversation
    const otherUser = chat.senderId === userId ? chat.receiver : chat.sender;
    
    return {
      id: chat.id,
      otherUser,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt
    };
  } catch (error) {
    console.error("Error fetching chat:", error);
    throw error;
  }
}

export async function sendDirectMessage(formData: FormData) {
  try {
    const userId = await getDbUserId();
    if (!userId) throw new Error("You must be logged in to send a message");

    const chatId = formData.get("chatId") as string;
    const content = formData.get("content") as string;
    const image = formData.get("image") as string;

    if ((!content || content.trim().length === 0) && !image) {
      throw new Error("Message cannot be empty");
    }

    // Verify user is part of this chat
    const chat = await prisma.directChat.findFirst({
      where: {
        id: chatId,
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      }
    });

    if (!chat) {
      throw new Error("You are not authorized to send messages in this chat");
    }

    // Create message
    await prisma.directMessage.create({
      data: {
        content: content?.trim(),
        image,
        senderId: userId,
        chatId,
      }
    });

    // Update chat's updatedAt timestamp
    await prisma.directChat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() }
    });

    revalidatePath(`/messages/${chatId}`);
    return { success: true };
  } catch (error) {
    console.error("Error sending direct message:", error);
    return { success: false, error: "Failed to send message" };
  }
}

export async function getChatMessages(chatId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) throw new Error("You must be logged in to view messages");
    
    // Verify user is part of this chat
    const chat = await prisma.directChat.findFirst({
      where: {
        id: chatId,
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      }
    });
    
    if (!chat) {
      throw new Error("You don't have permission to view these messages");
    }
    
    // Get messages
    const messages = await prisma.directMessage.findMany({
      where: { chatId },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    // Mark unread messages as read
    await prisma.directMessage.updateMany({
      where: {
        chatId,
        senderId: { not: userId },
        read: false
      },
      data: {
        read: true
      }
    });
    
    return messages;
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return [];
  }
}