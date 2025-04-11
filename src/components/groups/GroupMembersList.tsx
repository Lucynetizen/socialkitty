"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Crown } from "lucide-react";

interface GroupMember {
  id: string;
  role: string;
  joinedAt: Date;
  user: {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
  };
}

interface GroupMembersListProps {
  members: GroupMember[];
  isAdmin: boolean;
  groupId: string;
}

export default function GroupMembersList({ members, isAdmin, groupId }: GroupMembersListProps) {
  return (
    <div className="p-4">
      <h3 className="font-medium mb-4">Members ({members.length})</h3>
      
      <div className="space-y-3">
        {members.map((member) => (
          <div key={member.id} className="flex items-center">
            <div className="relative mr-3">
              {member.user.image ? (
                <img 
                  src={member.user.image} 
                  alt={member.user.name || member.user.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  {(member.user.name || member.user.username).charAt(0).toUpperCase()}
                </div>
              )}
              
              {member.role === "ADMIN" && (
                <div className="absolute -bottom-1 -right-1 bg-yellow-100 dark:bg-yellow-900 rounded-full p-[2px]">
                  <Crown size={12} className="text-yellow-600 dark:text-yellow-400" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{member.user.name || member.user.username}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                @{member.user.username}
              </div>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}