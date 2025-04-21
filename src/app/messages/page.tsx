import { getUserChats } from '@/actions/direct-message.action';
import DirectMessagesList from '@/components/DirectMessageList';

export default async function MessagesPage() {
  // Obtener los chats de usuario
  const chats = await getUserChats();
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-green-600 via-blue-500 to-pink-500 bg-clip-text text-transparent animate-gradient">Your Messages</h1>
      
      {chats.length > 0 ? (
        <DirectMessagesList initialChats={chats} />
      ) : (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center px-4">
            <h2 className="text-xl font-medium mb-2">No messages yet</h2>
            <p className="text-gray-500">
              You don't have any conversations. Start by following someone!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}