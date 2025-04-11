"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, MoreVertical, Users, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { joinGroup, leaveGroup, deleteGroup } from "@/actions/group.action";
import { useRouter } from "next/navigation";

interface GroupHeaderProps {
  group: {
    id: string;
    name: string;
    image?: string | null;
    memberCount: number;
    isJoined: boolean;
    isAdmin: boolean;
  };
}

export default function GroupHeader({ group }: GroupHeaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [joined, setJoined] = useState(group.isJoined);
  const router = useRouter();
  
  const handleJoinLeave = async () => {
    setIsLoading(true);
    
    if (joined) {
      const result = await leaveGroup(group.id);
      if (result.success) {
        setJoined(false);
      }
    } else {
      const result = await joinGroup(group.id);
      if (result.success) {
        setJoined(true);
      }
    }
    
    setIsLoading(false);
  };
  
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
      setIsLoading(true);
      await deleteGroup(group.id);
      // Note: The action will redirect upon success
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-3 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/groups" className="mr-3">
            <Button variant="ghost" size="icon">
              <ChevronLeft size={20} />
            </Button>
          </Link>
          
          <div className="flex items-center">
            {group.image ? (
              <img 
                src={group.image} 
                alt={group.name}
                className="w-10 h-10 rounded-full object-cover mr-3"
              />
            ) : (
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                <Users size={20} className="text-blue-500 dark:text-blue-400" />
              </div>
            )}
            
            <div>
              <h1 className="font-medium text-lg">{group.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {group.memberCount} {group.memberCount === 1 ? "member" : "members"}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          <Button
            variant={joined ? "outline" : "default"}
            onClick={handleJoinLeave}
            disabled={isLoading}
            className="mr-2"
          >
            {isLoading ? "Loading..." : joined ? "Leave Group" : "Join Group"}
          </Button>
          
          {group.isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  className="text-red-600 dark:text-red-400"
                  onClick={handleDelete}
                >
                  <Trash size={16} className="mr-2" />
                  Delete Group
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}