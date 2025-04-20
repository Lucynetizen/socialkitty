import { redirect } from 'next/navigation';
import { getUserChats } from '@/actions/direct-message.action';

export default async function MessagesPage() {
  // Redirect to the first chat or show a default message
  const chats = await getUserChats();
  
  if (chats.length > 0) {
    redirect(`/messages/${chats[0].id}`);
  }
  
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">No messages yet</h1>
        <p className="text-gray-500">
          You don't have any conversations. Start by following someone!
        </p>
      </div>
    </div>
  );
}