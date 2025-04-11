"use client"

import Link from "next/link";
import { Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { joinGroup } from "@/actions/group.action";
import { useState } from "react";

interface GroupCardProps {
  group: {
    id: string;
    name: string;
    description?: string | null;
    image?: string | null;
    createdAt: Date;
    memberCount: number;
    isJoined: boolean;
  };
}

export default function GroupCard({ group }: GroupCardProps) {
  const [isJoining, setIsJoining] = useState(false);
  const [isJoined, setIsJoined] = useState(group.isJoined);
  
  const handleJoin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsJoining(true);
    const result = await joinGroup(group.id);
    setIsJoining(false);
    
    if (result.success) {
      setIsJoined(true);
    }
  };
  
  return (
    <Link href={`/groups/${group.id}`}>
      <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
        <div className="h-32 bg-blue-100 dark:bg-blue-900 relative">
          {group.image ? (
            <img 
              src={group.image} 
              alt={group.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Users size={48} className="text-blue-500 dark:text-blue-400" />
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-lg truncate">{group.name}</h3>
            
            {!isJoined ? (
              <Button
                size="sm"
                onClick={handleJoin}
                disabled={isJoining}
              >
                {isJoining ? "Joining..." : "Join"}
              </Button>
            ) : (
              <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
                Joined
              </span>
            )}
          </div>
          
          {group.description && (
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 line-clamp-2">
              {group.description}
            </p>
          )}
          
          <div className="flex items-center mt-4 text-xs text-gray-500 dark:text-gray-400">
            <Users size={14} className="mr-1" />
            <span>{group.memberCount} {group.memberCount === 1 ? "member" : "members"}</span>
            <span className="mx-2">•</span>
            <span>Created {formatDistanceToNow(new Date(group.createdAt), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}