"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createGroup(formData: FormData) {
  try {
    const userId = await getDbUserId();
    if (!userId) throw new Error("You must be logged in to create a group");

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const image = formData.get("image") as string;

    if (!name || name.trim().length === 0) {
      throw new Error("Group name is required");
    }

    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        image,
        creatorId: userId,
        members: {
          create: {
            userId,
            role: "ADMIN",
          },
        },
      },
    });

    revalidatePath("/groups");
    return { success: true, groupId: group.id };
  } catch (error) {
    console.error("Error creating group:", error);
    return { success: false, error: "Failed to create group" };
  }
}

export async function getGroups(query?: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) throw new Error("Authentication required");
    
    const groups = await prisma.group.findMany({
      where: query ? {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      } : undefined,
      include: {
        _count: {
          select: {
            members: true,
          },
        },
        members: {
          where: {
            userId,
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return groups.map(group => ({
      ...group,
      memberCount: group._count.members,
      isJoined: group.members.length > 0,
    }));
  } catch (error) {
    console.error("Error fetching groups:", error);
    return [];
  }
}

export async function getGroupDetails(groupId: string) {
  try {
    const userId = await getDbUserId();
    
    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
          orderBy: {
            joinedAt: "asc",
          },
        },
      },
    });

    if (!group) {
      throw new Error("Group not found");
    }

    // Check if the current user is a member
    const userMembership = userId 
      ? group.members.find(member => member.userId === userId)
      : null;

    return {
      ...group,
      isJoined: !!userMembership,
      isAdmin: userMembership?.role === "ADMIN",
    };
  } catch (error) {
    console.error("Error fetching group details:", error);
    return null;
  }
}

export async function joinGroup(groupId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) throw new Error("You must be logged in to join a group");

    await prisma.groupMember.create({
      data: {
        userId,
        groupId,
        role: "MEMBER",
      },
    });

    revalidatePath(`/groups/${groupId}`);
    return { success: true };
  } catch (error) {
    console.error("Error joining group:", error);
    return { success: false, error: "Failed to join group" };
  }
}

export async function leaveGroup(groupId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) throw new Error("You must be logged in to leave a group");

    // Check if user is the creator of the group
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { creatorId: true },
    });

    if (group?.creatorId === userId) {
      throw new Error("Group creator cannot leave the group. Delete the group instead.");
    }

    await prisma.groupMember.delete({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    revalidatePath(`/groups/${groupId}`);
    return { success: true };
  } catch (error) {
    console.error("Error leaving group:", error);
    return { success: false, error: "Failed to leave group" };
  }
}

export async function deleteGroup(groupId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) throw new Error("You must be logged in to delete a group");

    // Check if user is the creator or an admin
    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
      select: { role: true },
    });

    if (!membership || membership.role !== "ADMIN") {
      throw new Error("Only group admins can delete the group");
    }

    // Delete the group (cascade will handle related records)
    await prisma.group.delete({
      where: { id: groupId },
    });

    revalidatePath("/groups");
    redirect("/groups");
  } catch (error) {
    console.error("Error deleting group:", error);
    return { success: false, error: "Failed to delete group" };
  }
}