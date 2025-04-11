"use server";

import { getDbUserId } from "./user.action";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function sendGroupMessage(formData: FormData) {
  try {
    const userId = await getDbUserId();
    if (!userId) throw new Error("You must be logged in to send a message");

    const groupId = formData.get("groupId") as string;
    const content = formData.get("content") as string;
    const image = formData.get("image") as string;

    if ((!content || content.trim().length === 0) && !image) {
      throw new Error("Message cannot be empty");
    }

    // Check if user is a member of the group
    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    if (!membership) {
      throw new Error("You must be a member of the group to send messages");
    }

    await prisma.groupMessage.create({
      data: {
        content: content?.trim(),
        image,
        senderId: userId,
        groupId,
      },
    });

    revalidatePath(`/groups/${groupId}`);
    return { success: true };
  } catch (error) {
    console.error("Error sending group message:", error);
    return { success: false, error: "Failed to send message" };
  }
}

export async function getGroupMessages(groupId: string) {
  try {
    const userId = await getDbUserId();
    
    // Check if user is a member of the group
    if (userId) {
      const membership = await prisma.groupMember.findUnique({
        where: {
          userId_groupId: {
            userId,
            groupId,
          },
        },
      });

      if (!membership) {
        throw new Error("You must be a member of the group to view messages");
      }
    }

    const messages = await prisma.groupMessage.findMany({
      where: {
        groupId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return messages;
  } catch (error) {
    console.error("Error fetching group messages:", error);
    return [];
  }
}