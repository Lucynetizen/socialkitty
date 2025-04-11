import Link from "next/link";
import { getGroups } from "@/actions/group.action";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import GroupCard from "@/components/groups/GroupCard";

export default async function GroupsPage() {
  const groups = await getGroups();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Groups</h1>
        <Link href="/groups/create">
          <Button className="flex items-center gap-2">
            <Plus size={16} />
            <span>Create Group</span>
          </Button>
        </Link>
      </div>

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
    </div>
  );
}