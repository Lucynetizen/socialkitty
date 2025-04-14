import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import GroupCard from "@/components/groups/GroupCard";

// Mark this route as dynamic to avoid static generation errors
export const dynamic = 'force-dynamic';

// Import the action - but we'll use it in a separate component
import { getGroups } from "@/actions/group.action";

// This component does the actual data fetching
async function GroupsContent() {
  const groups = await getGroups();
  
  return (
    <>
      {groups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No groups found</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Create a new group or join existing ones
          </p>
          <Link href="/groups/create" className="mt-4 inline-block">
            <Button>Create your first group</Button>
          </Link>
        </div>
      )}
    </>
  );
}

// The main page component with suspense boundary
export default function GroupsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 via-blue-500 to-pink-500 bg-clip-text text-transparent animate-gradient">Your Groups</h1>
        <Link href="/groups/create">
          <Button className="flex items-center gap-2">
            <Plus size={16} />
            <span>Create Group</span>
          </Button>
        </Link>
      </div>

      <Suspense fallback={
        <div className="text-center py-12">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2.5"></div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          </div>
        </div>
      }>
        <GroupsContent />
      </Suspense>
    </div>
  );
}