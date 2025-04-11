import { getGroupDetails } from "@/actions/group.action";
import { getGroupMessages } from "@/actions/group-message.action";
import GroupHeader from "@/components/groups/GroupHeader";
import GroupMembersList from "@/components/groups/GroupMembersList";
import GroupChat from "@/components/groups/GroupChat";
import { notFound } from "next/navigation";

export default async function GroupPage({ params }: { params: { groupId: string } }) {
  const { groupId } = params;
  const group = await getGroupDetails(groupId);

    if (!group) {
    notFound();
    }
  
    const enhancedGroup = {
        ...group,
        memberCount: group.members.length,
      };

  const messages = await getGroupMessages(groupId);
  
  return (
    <div className="h-screen flex flex-col">
      <GroupHeader group={enhancedGroup} />
      
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <GroupChat 
            messages={messages} 
            groupId={groupId} 
            isJoined={group.isJoined}
          />
        </div>
        
        <div className="w-72 border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 hidden lg:block overflow-auto">
          <GroupMembersList members={group.members} isAdmin={group.isAdmin} groupId={groupId} />
        </div>
      </div>
    </div>
  );
}