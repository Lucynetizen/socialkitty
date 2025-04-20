import ChatPage from '@/components/ChatPage';

export default function Page({ params }: { params: { chatId: string } }) {
  return <ChatPage params={params} />;
}